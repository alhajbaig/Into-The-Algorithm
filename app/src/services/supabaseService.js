import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

/**
 * Service to sync user profiles, progress, XP, coins, badges, and activity logs with Supabase Database.
 * Falls back seamlessly to LocalStorage if Supabase credentials are in demo mode.
 */
export const supabaseService = {
  // 1. Fetch User Profile
  async getUserProfile(userId) {
    if (!userId) return null
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
        if (error) throw error
        return data
      } catch (e) {
        console.warn('Supabase fetch profile error:', e.message)
      }
    }
    // Local fallback
    const local = localStorage.getItem(`ml_profile_${userId}`)
    return local ? JSON.parse(local) : null
  },

  // 2. Upsert User Profile
  async updateUserProfile(userId, profileData) {
    if (!userId) return null
    const payload = { id: userId, ...profileData, updated_at: new Date().toISOString() }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .upsert(payload)
          .select()
          .single()
        if (error) throw error
        return data
      } catch (e) {
        console.warn('Supabase update profile error:', e.message)
      }
    }

    localStorage.setItem(`ml_profile_${userId}`, JSON.stringify(payload))
    return payload
  },

  // Fetch Campaign Progress
  async fetchProgress(userId) {
    if (!userId) return null

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('progress')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (error && error.code !== 'PGRST116') {
          throw error
        }

        if (data) {
          const raw = data.raw_data || {}
          return {
            coins: data.coins ?? raw.coins ?? 0,
            totalStars: data.total_stars ?? raw.totalStars ?? 0,
            clearedLevels: data.cleared_levels || raw.clearedLevels || [],
            levelStars: raw.levelStars || {},
            completedModes: raw.completedModes || {},
            streak: data.streak ?? raw.streak ?? 0,
            bestStreak: data.best_streak ?? raw.bestStreak ?? 0,
            lastPlayDate: raw.lastPlayDate || null,
            perfectQuizzes: raw.perfectQuizzes || 0,
            flashDecksDone: raw.flashDecksDone || 0,
            codingSolved: raw.codingSolved || 0,
            interviewsDone: raw.interviewsDone || 0,
            badges: data.badges || raw.badges || [],
            solvedCodingIds: raw.solvedCodingIds || []
          }
        }
      } catch (e) {
        console.warn('Supabase fetch progress error:', e.message)
      }
    }

    // Local fallback
    try {
      const local = localStorage.getItem(`ml-quest-progress-${userId}`) || localStorage.getItem(`ml_progress_${userId}`)
      return local ? JSON.parse(local) : null
    } catch {
      return null
    }
  },

  // 3. Sync Campaign Progress
  async syncProgress(userId, progressData) {
    if (!userId) return null

    const basePayload = {
      user_id: userId,
      cleared_levels: progressData.clearedLevels || [],
      total_stars: progressData.totalStars || 0,
      coins: progressData.coins || 0,
      badges: progressData.badges || [],
      streak: progressData.streak || 0,
      best_streak: progressData.bestStreak || 0,
      updated_at: new Date().toISOString()
    }

    if (isSupabaseConfigured) {
      try {
        const payloadWithRaw = {
          ...basePayload,
          raw_data: progressData
        }
        const { data, error } = await supabase
          .from('progress')
          .upsert(payloadWithRaw, { onConflict: 'user_id' })
          .select()
          .single()

        if (error) {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('progress')
            .upsert(basePayload, { onConflict: 'user_id' })
            .select()
            .single()
          if (fallbackError) throw fallbackError
          return fallbackData
        }
        return data
      } catch (e) {
        console.warn('Supabase sync progress error:', e.message)
      }
    }

    localStorage.setItem(`ml_progress_${userId}`, JSON.stringify(progressData))
    localStorage.setItem(`ml-quest-progress-${userId}`, JSON.stringify(progressData))
    return basePayload
  },

  // 4. Log Learning Activity
  async logActivity(userId, activity) {
    if (!userId) return null
    const payload = {
      user_id: userId,
      topic: activity.topic || 'Machine Learning',
      mode: activity.mode || 'quiz',
      xp_earned: activity.xp || 50,
      created_at: new Date().toISOString()
    }

    if (isSupabaseConfigured) {
      try {
        await supabase.from('learning_history').insert(payload)
      } catch (e) {
        console.warn('Supabase log activity error:', e.message)
      }
    }

    try {
      const history = JSON.parse(localStorage.getItem(`ml_history_${userId}`) || '[]')
      history.unshift(payload)
      localStorage.setItem(`ml_history_${userId}`, JSON.stringify(history.slice(0, 50)))
    } catch (e) {
      console.warn('Local history storage error', e)
    }

    return payload
  }
}
