import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code, Terminal, CheckCircle, Copy, Sparkles, Layers } from 'lucide-react'

const SNIPPETS = {
  forward: {
    title: 'Forward Pass & Activation',
    lang: 'Python / PyTorch',
    desc: 'Transforms input tensor X through weights W and bias b, applying non-linear activation.',
    code: [
      { line: 1, text: '# Input Tensor: (batch_size=32, num_features=7)', comment: 'Input matrix shape' },
      { line: 2, text: 'X = torch.tensor(inputs, dtype=torch.float32)', comment: 'Convert raw array to float tensor' },
      { line: 3, text: '# Hidden Layer 1 Matrix Multiplication', comment: 'W1 shape: (7, 8), B1 shape: (8)' },
      { line: 4, text: 'z1 = torch.matmul(X, self.W1) + self.B1', comment: 'Linear affine transformation' },
      { line: 5, text: 'h1 = torch.relu(z1)', comment: 'ReLU Activation: max(0, z)' },
      { line: 6, text: '# Output Layer (Binary Classification)', comment: 'W2 shape: (8, 1), B2 shape: (1)' },
      { line: 7, text: 'z2 = torch.matmul(h1, self.W2) + self.B2', comment: 'Raw logits output' },
      { line: 8, text: 'y_pred = torch.sigmoid(z2)', comment: 'Map output to probability [0, 1]' }
    ]
  },
  loss: {
    title: 'Binary Cross-Entropy Loss',
    lang: 'Python / NumPy',
    desc: 'Measures dissimilarity between predicted probabilities y_pred and ground truth labels y.',
    code: [
      { line: 1, text: 'def binary_cross_entropy(y_true, y_pred, eps=1e-7):', comment: 'Define BCE Loss Function' },
      { line: 2, text: '    # Clip predictions to prevent log(0) numerical instability', comment: 'Numerical safety threshold' },
      { line: 3, text: '    y_pred = np.clip(y_pred, eps, 1 - eps)', comment: 'Clip values into range [1e-7, 1 - 1e-7]' },
      { line: 4, text: '    # Compute BCE formula per sample', comment: 'Log loss for positive & negative targets' },
      { line: 5, text: '    bce = -(y_true * np.log(y_pred) + (1 - y_true) * np.log(1 - y_pred))', comment: 'Formula: -[y log p + (1-y) log(1-p)]' },
      { line: 6, text: '    # Average loss across mini-batch', comment: 'Mean loss scalar' },
      { line: 7, text: '    return np.mean(bce)', comment: 'Return final scalar loss' }
    ]
  },
  backprop: {
    title: 'Gradient Backpropagation',
    lang: 'Python / NumPy',
    desc: 'Applies Chain Rule to compute partial derivatives dL/dW1, dL/dB1, dL/dW2, dL/dB2.',
    code: [
      { line: 1, text: '# 1. Gradient of BCE Loss w.r.t logits z2', comment: 'dL/dz2 = (y_pred - y_true)' },
      { line: 2, text: 'dz2 = y_pred - y_true', comment: 'Output error signal' },
      { line: 3, text: '# 2. Gradient w.r.t Output Weights W2 & Bias B2', comment: 'dL/dW2 = h1^T @ dz2 / N' },
      { line: 4, text: 'dW2 = np.dot(h1.T, dz2) / N', comment: 'Matrix product for weight gradient' },
      { line: 5, text: 'dB2 = np.sum(dz2, axis=0) / N', comment: 'Sum gradient across batch axis' },
      { line: 6, text: '# 3. Backpropagate error through ReLU activation', comment: 'dL/dh1 = dz2 @ W2^T' },
      { line: 7, text: 'dh1 = np.dot(dz2, W2.T) * (z1 > 0)', comment: 'Chain rule with ReLU derivative' },
      { line: 8, text: 'dW1 = np.dot(X.T, dh1) / N', comment: 'Layer 1 weight gradient tensor' }
    ]
  },
  optimizer: {
    title: 'SGD + Momentum Update',
    lang: 'Python / PyTorch Native',
    desc: 'Updates parameters along accumulated velocity direction to accelerate convergence.',
    code: [
      { line: 1, text: 'def step_momentum(W, B, dW, dB, vW, vB, lr=0.01, beta=0.9):', comment: 'SGD with Momentum Step' },
      { line: 2, text: '    # Velocity update with exponential decay', comment: 'v_t = beta * v_{t-1} + (1 - beta) * dW' },
      { line: 3, text: '    vW = beta * vW + (1 - beta) * dW', comment: 'Accumulate gradient direction' },
      { line: 4, text: '    vB = beta * vB + (1 - beta) * dB', comment: 'Bias velocity update' },
      { line: 5, text: '    # Parameter update', comment: 'W_new = W - lr * vW' },
      { line: 6, text: '    W -= lr * vW', comment: 'Subtract velocity vector from weights' },
      { line: 7, text: '    B -= lr * vB', comment: 'Subtract velocity vector from biases' },
      { line: 8, text: '    return W, B, vW, vB', comment: 'Return updated model tensors' }
    ]
  }
}

export default function InteractiveCodeViewer() {
  const [activeTab, setActiveTab] = useState('forward')
  const [hoveredLine, setHoveredLine] = useState(null)
  const [copied, setCopied] = useState(false)

  const currentSnippet = SNIPPETS[activeTab]

  const handleCopy = () => {
    const fullText = currentSnippet.code.map((item) => item.text).join('\n')
    navigator.clipboard.writeText(fullText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="code-section">
      <div className="playground-header">
        <div className="playground-title-group">
          <div className="section-badge">
            <Terminal size={14} /> DECODE THE ALGORITHM
          </div>
          <h2>From Math to <em>Production Code</em></h2>
          <p className="playground-desc">
            Explore pure PyTorch & NumPy implementations for neural forward pass, loss calculation, backprop, and optimization. Hover over any line to inspect tensor dimensions & math rationale!
          </p>
        </div>
      </div>

      <div className="code-viewer-container glass">
        {/* Code Tabs Header */}
        <div className="code-tabs-head">
          <div className="code-tabs">
            {Object.keys(SNIPPETS).map((key) => (
              <button
                key={key}
                className={`code-tab ${activeTab === key ? 'active' : ''}`}
                onClick={() => setActiveTab(key)}
              >
                <Code size={15} />
                <span>{SNIPPETS[key].title}</span>
              </button>
            ))}
          </div>

          <div className="code-head-actions">
            <span className="lang-tag">{currentSnippet.lang}</span>
            <button className="copy-btn" onClick={handleCopy} title="Copy code snippet">
              {copied ? <CheckCircle size={14} color="#34d399" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Snippet Description bar */}
        <div className="snippet-desc-bar">
          <Sparkles size={15} color="#93c5fd" />
          <span>{currentSnippet.desc}</span>
        </div>

        {/* Code Lines Stage */}
        <div className="code-editor-stage">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="code-editor-body"
            >
              {currentSnippet.code.map((item) => (
                <div
                  key={item.line}
                  className={`code-row ${hoveredLine === item.line ? 'highlighted' : ''}`}
                  onMouseEnter={() => setHoveredLine(item.line)}
                  onMouseLeave={() => setHoveredLine(null)}
                >
                  <span className="line-num">{item.line}</span>
                  <span className="line-text">{item.text}</span>
                  <span className="line-comment"># {item.comment}</span>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Tensor Inspector Drawer */}
        <div className="tensor-inspector">
          <Layers size={16} color="#a78bfa" />
          <span>
            {hoveredLine
              ? `Line ${hoveredLine}: ${currentSnippet.code.find((c) => c.line === hoveredLine)?.comment}`
              : 'Hover over any line to inspect tensor dimensions & computational details'}
          </span>
        </div>
      </div>
    </section>
  )
}
