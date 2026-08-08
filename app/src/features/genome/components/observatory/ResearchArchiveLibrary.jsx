import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Code2, Sparkles, Clock, Award, ChevronRight, Download, ExternalLink, X } from 'lucide-react'

export function ResearchArchiveLibrary() {
  const [selectedPaper, setSelectedPaper] = useState(null)

  const archivePapers = [
    {
      id: 'paper-01',
      title: 'Attention Is All You Need',
      authors: 'Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin',
      year: 2017,
      journal: 'NeurIPS 2017 (Google Brain / Research)',
      difficulty: 'Frontier (Level 85+)',
      readTime: '25 min read',
      citationCount: '125,000+ citations',
      codeSnippet: `import torch
import torch.nn as nn

class ScaledDotProductAttention(nn.Module):
    def __init__(self, d_k):
        super().__init__()
        self.d_k = d_k

    def forward(self, Q, K, V, mask=None):
        scores = torch.matmul(Q, K.transpose(-2, -1)) / torch.sqrt(torch.tensor(self.d_k))
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
        attn = torch.softmax(scores, dim=-1)
        return torch.matmul(attn, V)`,
      summary: 'Introduced the Transformer architecture based entirely on self-attention mechanisms, replacing recurrent neural networks (RNNs) and enabling massive parallel pre-training of LLMs.',
      keyTakeaway: 'Self-attention allows tokens to compute pairwise relational weights across the entire sequence simultaneously.'
    },
    {
      id: 'paper-02',
      title: 'Deep Residual Learning for Image Recognition',
      authors: 'Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun',
      year: 2015,
      journal: 'CVPR 2016 (Best Paper Award - Microsoft Research)',
      difficulty: 'Advanced (Level 55+)',
      readTime: '18 min read',
      citationCount: '190,000+ citations',
      codeSnippet: `class ResidualBlock(nn.Module):
    def __init__(self, in_channels, out_channels, stride=1):
        super().__init__()
        self.conv1 = nn.Conv2d(in_channels, out_channels, kernel_size=3, stride=stride, padding=1)
        self.bn1 = nn.BatchNorm2d(out_channels)
        self.relu = nn.ReLU(inplace=True)
        self.conv2 = nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm2d(out_channels)

    def forward(self, x):
        identity = x
        out = self.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out += identity # Residual Skip Connection
        return self.relu(out)`,
      summary: 'Solved the vanishing gradient problem in ultra-deep neural networks by introducing identity residual skip-connections, enabling training of networks over 100+ layers.',
      keyTakeaway: 'Reformulated layers as learning residual functions F(x) = H(x) - x rather than unreferenced functions.'
    },
    {
      id: 'paper-03',
      title: 'DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning',
      authors: 'DeepSeek AI Research Team',
      year: 2025,
      journal: 'arXiv Pre-print (2025)',
      difficulty: 'Mastery (Level 95+)',
      readTime: '30 min read',
      citationCount: '15,000+ citations',
      codeSnippet: `# DeepSeek-R1 Chain-of-Thought Reward Signal Function
def calculate_reasoning_reward(completion, target_answer):
    has_think_tags = "<think>" in completion and "</think>" in completion
    extracted_answer = extract_final_box(completion)
    correctness_reward = 1.0 if extracted_answer == target_answer else 0.0
    format_reward = 0.2 if has_think_tags else -0.5
    return correctness_reward + format_reward`,
      summary: 'Demonstrated open-weights test-time reasoning capabilities competitive with OpenAI O1 using pure reinforcement learning without supervised fine-tuning warmups.',
      keyTakeaway: 'Pure RL reward signals incentivize spontaneous emergent chain-of-thought verification and self-correction during inference.'
    }
  ]

  return (
    <div className="research-archive-container">
      {/* Header */}
      <div className="chamber-header-block">
        <div className="chamber-badge-tag" style={{ '--accent-color': '#10b981' }}>
          <BookOpen size={14} />
          <span>RESEARCH CHAMBER 07 • FLOATING GLASS KNOWLEDGE ARCHIVE</span>
        </div>
        <h2 className="chamber-title-text">Research Capsule Library</h2>
        <p className="chamber-subtitle-text">
          Study foundational landmark papers in computer science and AI. Inspect original code snippets, mathematical formulas, and key architectural breakthroughs.
        </p>
      </div>

      {/* Floating Glass Paper Capsules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {archivePapers.map((paper) => (
          <motion.div
            key={paper.id}
            className="observatory-glass p-6 cursor-pointer flex flex-col justify-between"
            whileHover={{ y: -6, scale: 1.02 }}
            onClick={() => setSelectedPaper(paper)}
          >
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold rounded-full">
                  {paper.year} • {paper.difficulty}
                </span>
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <Clock size={12} />
                  {paper.readTime}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{paper.title}</h3>
              <p className="text-xs text-slate-400 mb-4 line-clamp-2">{paper.authors}</p>
              <p className="text-xs text-slate-300 line-clamp-3 mb-4 leading-relaxed">{paper.summary}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-emerald-400 font-bold">
              <span>Inspect Paper Code</span>
              <ChevronRight size={16} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Paper Capsule Inspector Modal */}
      <AnimatePresence>
        {selectedPaper && (
          <div className="gene-modal-backdrop" onClick={() => setSelectedPaper(null)}>
            <motion.div
              className="gene-modal-card observatory-glass"
              style={{ maxWidth: '720px' }}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-2"
                onClick={() => setSelectedPaper(null)}
              >
                <X size={18} />
              </button>

              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold rounded-full inline-block mb-3">
                {selectedPaper.journal}
              </span>

              <h3 className="text-2xl font-black text-white mb-2">{selectedPaper.title}</h3>
              <span className="text-xs text-slate-400 block mb-4">By {selectedPaper.authors}</span>

              <p className="text-sm text-slate-200 mb-4 leading-relaxed">{selectedPaper.summary}</p>

              {/* Code Snippet Box */}
              <div className="p-4 bg-slate-950 border border-white/10 rounded-2xl mb-4">
                <div className="flex items-center justify-between mb-2 text-xs font-mono text-cyan-400">
                  <div className="flex items-center gap-1.5">
                    <Code2 size={14} />
                    <span>IMPLEMENTATION SNIPPET (PyTorch / Python)</span>
                  </div>
                </div>
                <pre className="text-xs font-mono text-emerald-300 overflow-x-auto p-2 bg-slate-900/90 rounded-xl leading-relaxed">
                  {selectedPaper.codeSnippet}
                </pre>
              </div>

              <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                <span className="text-xs font-bold text-cyan-400 block mb-1">KEY TAKEAWAY:</span>
                <p className="text-xs text-slate-200">{selectedPaper.keyTakeaway}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
