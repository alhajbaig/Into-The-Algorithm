import { CODING } from '../src/data/content.js'

const NAMES = ['mse', 'mae', 'relu', 'sigmoid', 'bigrams', 'can_shift', 'precision_recall', 'softmax']

function normalize(v) {
  if (Array.isArray(v)) return v.map(normalize)
  if (typeof v === 'number') return Math.round(v * 1e6) / 1e6
  return v
}

function deepEqual(a, b) {
  return JSON.stringify(normalize(a)) === JSON.stringify(normalize(b))
}

let fail = 0
for (const [lvl, probs] of Object.entries(CODING)) {
  for (const p of probs) {
    const stubs = NAMES.map((n) => `function ${n}(){ throw new Error('x'); }`).join('\n')
    const scope = new Function(`${stubs}\n${p.solution}\nreturn { ${NAMES.join(',')} };`)()
    for (const t of p.tests) {
      try {
        const got = new Function(...NAMES, `return (${t.call});`)(...NAMES.map((n) => scope[n]))
        if (!deepEqual(got, t.expected)) {
          console.log('FAIL', p.id, t.call, got, 'expected', t.expected)
          fail++
        } else {
          console.log('OK', lvl, p.id, t.call)
        }
      } catch (e) {
        console.log('ERR', p.id, e.message)
        fail++
      }
    }
  }
}
console.log(fail ? `FAILED ${fail}` : 'ALL CODING TESTS PASSED')
process.exit(fail ? 1 : 0)
