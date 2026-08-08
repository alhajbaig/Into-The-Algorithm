/* ════════════════════════════════════════════════════════════
   Label Propagation Application
   ════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    if (window.renderMathInElement) {
        renderMathInElement(document.body, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '\\(', right: '\\)', display: false}
            ]
        });
    }

    initHeroCanvas();
    initCodeExplainer();
    initSampleSection();
    initPlayground();
});

/* ── Hero Canvas Animation ────────────────────────────── */
function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const nodes = [];
    for (let i = 0; i < 35; i++) {
        nodes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            cls: i === 0 ? 0 : (i === 1 ? 1 : -1),
            p0: i === 0 ? 1.0 : (i === 1 ? 0.0 : 0.5),
            p1: i === 0 ? 0.0 : (i === 1 ? 1.0 : 0.5)
        });
    }

    let t = 0;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        t += 0.03;

        // Propagate probabilities
        nodes.forEach((n, i) => {
            if (n.cls === -1) {
                let sum0 = 0, sum1 = 0, totalW = 0;
                nodes.forEach((m, j) => {
                    if (i !== j) {
                        const dx = n.x - m.x, dy = n.y - m.y;
                        const w = Math.exp(-(dx * dx + dy * dy) / 10000);
                        sum0 += w * m.p0;
                        sum1 += w * m.p1;
                        totalW += w;
                    }
                });
                if (totalW > 0) {
                    n.p0 = 0.8 * (sum0 / totalW) + 0.2 * n.p0;
                    n.p1 = 0.8 * (sum1 / totalW) + 0.2 * n.p1;
                }
            }
        });

        // Draw connections
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    ctx.strokeStyle = `rgba(244, 114, 182, ${1 - dist / 100 * 0.2})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }

        // Draw nodes
        nodes.forEach(n => {
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.cls !== -1 ? 8 : 6, 0, Math.PI * 2);
            const r = Math.floor(n.p1 * 244 + n.p0 * 56);
            const g = Math.floor(n.p1 * 114 + n.p0 * 189);
            const b = Math.floor(n.p1 * 182 + n.p0 * 248);
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });

        requestAnimationFrame(animate);
    }
    animate();
}

/* ── Code Explainer ───────────────────────────────────── */
function initCodeExplainer() {
    const codeBlock = document.getElementById('codeBlockInteractive');
    const copyBtn = document.getElementById('btnCopyCode');
    const unlockBtn = document.getElementById('btnUnlockLine');
    const stepBtns = document.querySelectorAll('.code-tab-btn');
    if (!codeBlock) return;

    let selectedLine = 4;
    let isLocked = false;

    const CODE_LINES = [
        { num: 1, text: 'import numpy as np', html: '<span class="code-keyword">import</span> numpy <span class="code-keyword">as</span> np' },
        { num: 2, text: 'from scipy.spatial.distance import cdist', html: '<span class="code-keyword">from</span> scipy.spatial.distance <span class="code-keyword">import</span> cdist' },
        { num: 3, text: 'class LabelSpreadingScratch:', html: '<span class="code-keyword">class</span> <span class="code-func">LabelSpreadingScratch</span>:' },
        { num: 4, text: '    def __init__(self, gamma=20.0, alpha=0.8, max_iter=30):', html: '    <span class="code-keyword">def</span> <span class="code-func">__init__</span>(self, gamma=<span class="code-num">20.0</span>, alpha=<span class="code-num">0.8</span>, max_iter=<span class="code-num">30</span>):' },
        { num: 5, text: '        self.gamma, self.alpha = gamma, alpha', html: '        self.gamma, self.alpha = gamma, alpha' },
        { num: 6, text: '        self.max_iter = max_iter', html: '        self.max_iter = max_iter' },
        { num: 7, text: '    def fit(self, X, y):', html: '    <span class="code-keyword">def</span> <span class="code-func">fit</span>(self, X, y):' },
        { num: 8, text: '        n_samples = X.shape[0]', html: '        n_samples = X.shape[<span class="code-num">0</span>]' },
        { num: 9, text: '        classes = np.unique(y[y != -1])', html: '        classes = np.unique(y[y != -<span class="code-num">1</span>])' },
        { num: 10, text: '        n_classes = len(classes)', html: '        n_classes = len(classes)' },
        { num: 11, text: '        dists = cdist(X, X, metric="sqeuclidean")', html: '        dists = cdist(X, X, metric=<span class="code-string">"sqeuclidean"</span>)' },
        { num: 12, text: '        W = np.exp(-self.gamma * dists)', html: '        W = np.exp(-self.gamma * dists)' },
        { num: 13, text: '        np.fill_diagonal(W, 0.0)', html: '        np.fill_diagonal(W, <span class="code-num">0.0</span>)' },
        { num: 14, text: '        D = np.diag(np.sum(W, axis=1)**(-0.5))', html: '        D = np.diag(np.sum(W, axis=<span class="code-num">1</span>)**(-<span class="code-num">0.5</span>))' },
        { num: 15, text: '        S = D @ W @ D', html: '        S = D @ W @ D' },
        { num: 16, text: '        Y_0 = np.zeros((n_samples, n_classes))', html: '        Y_0 = np.zeros((n_samples, n_classes))' },
        { num: 17, text: '        for i in range(n_samples):', html: '        <span class="code-keyword">for</span> i <span class="code-keyword">in</span> range(n_samples):' },
        { num: 18, text: '            if y[i] != -1: Y_0[i, y[i]] = 1.0', html: '            <span class="code-keyword">if</span> y[i] != -<span class="code-num">1</span>: Y_0[i, y[i]] = <span class="code-num">1.0</span>' },
        { num: 19, text: '        Y = np.copy(Y_0)', html: '        Y = np.copy(Y_0)' },
        { num: 20, text: '        for _ in range(self.max_iter):', html: '        <span class="code-keyword">for</span> _ <span class="code-keyword">in</span> range(self.max_iter):' },
        { num: 21, text: '            Y = self.alpha * (S @ Y) + (1.0 - self.alpha) * Y_0', html: '            Y = self.alpha * (S @ Y) + (<span class="code-num">1.0</span> - self.alpha) * Y_0' },
        { num: 22, text: '        return np.argmax(Y, axis=1)', html: '        <span class="code-keyword">return</span> np.argmax(Y, axis=<span class="code-num">1</span>)' }
    ];

    const CODE_EXPLANATIONS = {
        1: { title: "Import NumPy Library", text: "Imports NumPy for matrix algebra and affinity operations.", math: "\\text{import numpy as np}" },
        2: { title: "Import Squared Distance Matrix", text: "Imports SciPy cdist for fast pairwise squared Euclidean distances.", math: "\\text{cdist}(X, X)" },
        3: { title: "LabelSpreadingScratch Class", text: "Encapsulates graph normalized Laplacian label spreading algorithm.", math: "\\mathcal{M}_{\\text{LabelSpreading}}" },
        4: { title: "Class Constructor", text: "Sets RBF scale gamma, clamping parameter alpha, and max iteration count.", math: "\\gamma = 20.0, \\quad \\alpha = 0.8" },
        5: { title: "Store Parameters", text: "Stores gamma and alpha hyperparameter attributes.", math: "\\alpha \\in (0, 1)" },
        6: { title: "Set Iteration Cap", text: "Limits transition matrix updates count.", math: "T = 30" },
        7: { title: "Fit Transductive Method", text: "Calculates similarity graph and propagates label matrix Y.", math: "\\mathbf{Y}^* = f(\\mathbf{X}, \\mathbf{y})" },
        8: { title: "Get Total Point Count", text: "Extracts node count N from data matrix X.", math: "N = \\text{X.shape}[0]" },
        9: { title: "Extract Unique Classes", text: "Identifies target class labels excluding unlabeled flag (-1).", math: "K = |\\mathcal{C}|" },
        10: { title: "Count Unique Classes", text: "Stores total distinct class count.", math: "K" },
        11: { title: "Compute Pairwise Squared Distances", text: "Calculates N x N squared Euclidean distance matrix.", math: "d_{ij}^2 = \|x_i - x_j\|^2" },
        12: { title: "Compute RBF Affinity Matrix W", text: "Evaluates Gaussian kernel similarity matrix across all node pairs.", math: "W_{ij} = \\exp(-\\gamma d_{ij}^2)" },
        13: { title: "Zero Out Self-Loops", text: "Sets diagonal entries W_ii to zero eliminating self-influence.", math: "W_{ii} = 0" },
        14: { title: "Compute Inverse Square Root Degree Matrix", text: "Calculates degree D_ii = sum_j W_ij and computes D^{-1/2}.", math: "\\mathbf{D}^{-1/2} = \\text{diag}(D_{ii}^{-1/2})" },
        15: { title: "Compute Symmetric Normalized Laplacian Matrix", text: "Calculates S = D^{-1/2} W D^{-1/2} ensuring spectrum bounds [0, 1].", math: "\\mathbf{S} = \\mathbf{D}^{-1/2} \\mathbf{W} \\mathbf{D}^{-1/2}" },
        16: { title: "Initialize One-Hot Indicator Matrix", text: "Creates N x K initial label probability matrix Y_0.", math: "\\mathbf{Y}^{(0)} \\in \\mathbb{R}^{N \\times K}" },
        17: { title: "Populate Initial Seeds Loop", text: "Iterates through samples populating one-hot seed vectors.", math: "i = 1 \\dots N" },
        18: { title: "Set One-Hot Vector for Seed Nodes", text: "Assigns probability 1.0 to initial known class seed rows.", math: "Y_{0, i, c} = 1" },
        19: { title: "Copy Initial Matrix Buffer", text: "Initializes active probability buffer Y.", math: "\\mathbf{Y} \\leftarrow \\mathbf{Y}^{(0)}" },
        20: { title: "Label Propagation Transition Loop", text: "Iteratively updates node probabilities until convergence.", math: "t = 1 \\dots T" },
        21: { title: "Apply Soft Clamping Spreading Update", text: "Evaluates Y = alpha * S @ Y + (1 - alpha) * Y_0 blending neighbors and seeds.", math: "\\mathbf{Y}^{(t+1)} = \\alpha \\mathbf{S} \\mathbf{Y}^{(t)} + (1 - \\alpha) \\mathbf{Y}^{(0)}" },
        22: { title: "Return Argmax Class Predictions", text: "Returns argmax class index per node across final probability columns.", math: "\\hat{y}_i = \\arg\\max_k Y_{i, k}" }
    };

    codeBlock.innerHTML = '';
    CODE_LINES.forEach(lineObj => {
        const div = document.createElement('div');
        div.className = 'code-line';
        div.setAttribute('data-line', lineObj.num);
        div.innerHTML = `<span class="line-num">${lineObj.num}</span><span class="line-content">${lineObj.html}</span>`;
        codeBlock.appendChild(div);
    });

    const lineElements = codeBlock.querySelectorAll('.code-line');

    function updateLineUI(targetLine, toggleLock = false) {
        if (toggleLock) {
            if (isLocked && selectedLine === targetLine) isLocked = false;
            else { isLocked = true; selectedLine = targetLine; }
        } else {
            if (isLocked) return;
            selectedLine = targetLine;
        }

        lineElements.forEach(el => {
            const lNum = parseInt(el.getAttribute('data-line'));
            if (lNum === selectedLine) {
                el.classList.add('active');
                if (isLocked) el.classList.add('locked');
                else el.classList.remove('locked');
            } else {
                el.classList.remove('active', 'locked');
            }
        });

        if (unlockBtn) unlockBtn.style.display = isLocked ? 'inline-block' : 'none';

        const info = CODE_EXPLANATIONS[selectedLine];
        const panel = document.getElementById('codeExplainPanel');
        if (info && panel) {
            panel.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.75rem;">
                    <span style="font-family:var(--font-mono); font-size:0.78rem; font-weight:700; color:#f472b6; letter-spacing:0.05em; text-transform:uppercase;">💡 INTERACTIVE LINE-BY-LINE CODE INSPECTOR</span>
                    <span style="font-size:0.78rem; font-weight:600; color:${isLocked ? '#f472b6' : 'var(--text-secondary)'}; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); padding:0.25rem 0.75rem; border-radius:50px;">
                        ${isLocked ? '📌 Line Locked – Click another line or click again to unlock' : '💡 Hovering Line – Click line to lock inspection'}
                    </span>
                </div>

                <div style="margin-bottom:0.75rem;">
                    <span style="background:${isLocked ? 'rgba(244,114,182,0.15)' : 'rgba(244,114,182,0.15)'}; color:${isLocked ? '#f472b6' : '#f472b6'}; border:1px solid ${isLocked ? 'rgba(244,114,182,0.3)' : 'rgba(244,114,182,0.3)'}; padding:0.25rem 0.75rem; border-radius:50px; font-size:0.8rem; font-weight:700; font-family:var(--font-mono); display:inline-block;">
                        📌 Line ${selectedLine} ${isLocked ? '(Locked)' : '(Hover preview)'}
                    </span>
                </div>

                <h3 style="font-size:1.25rem; font-weight:700; color:#ffffff; margin:0.5rem 0 1rem 0;">${info.title}</h3>

                <div style="margin-bottom:0.85rem;">
                    <div style="font-weight:700; color:#f472b6; font-size:0.88rem; margin-bottom:0.35rem; display:flex; align-items:center; gap:0.4rem;">
                        <span>🔍</span> <span>What This Line Does:</span>
                    </div>
                    <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.65; margin:0;">
                        ${info.text}
                    </p>
                </div>

                <div style="margin-bottom:1rem;">
                    <div style="font-weight:700; color:#fbbf24; font-size:0.88rem; margin-bottom:0.35rem; display:flex; align-items:center; gap:0.4rem;">
                        <span>⚡</span> <span>Why It Is Used:</span>
                    </div>
                    <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.65; margin:0;">
                        ${info.why || 'Smoothly diffuses class distributions across similarity graph manifold.'}
                    </p>
                </div>

                ${info.math ? `
                <div style="background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:1rem 1.25rem; margin-top:1rem;">
                    <div style="font-weight:700; color:#a78bfa; font-size:0.85rem; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.4rem;">
                        <span>📐</span> <span>Math Formulation:</span>
                    </div>
                    <div style="margin:0; padding:0; background:transparent; border:none; text-align:center; font-size:1rem; color:#f472b6;">
                        $$${info.math}$$
                    </div>
                </div>` : ''}
            `;
            if (window.renderMathInElement) {
                renderMathInElement(panel, { delimiters: [{left: '$$', right: '$$', display: true}] });
            }
        }
    }

    lineElements.forEach(el => {
        el.addEventListener('mouseenter', () => updateLineUI(parseInt(el.getAttribute('data-line')), false));
        el.addEventListener('mouseleave', () => { if (isLocked) updateLineUI(selectedLine, false); });
        el.addEventListener('click', () => updateLineUI(parseInt(el.getAttribute('data-line')), true));
    });

    if (unlockBtn) unlockBtn.addEventListener('click', () => { isLocked = false; updateLineUI(selectedLine, false); });

    stepBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            stepBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const step = btn.getAttribute('data-step');
            let targetLine = 4;
            if (step === 'step1') targetLine = 12;
            else if (step === 'step2') targetLine = 15;
            else if (step === 'step3') targetLine = 21;
            else if (step === 'step4') targetLine = 22;

            isLocked = true;
            updateLineUI(targetLine, false);
            lineElements.forEach(el => {
                if (parseInt(el.getAttribute('data-line')) === targetLine) el.classList.add('locked');
            });
        });
    });

    updateLineUI(4, false);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const fullText = CODE_LINES.map(l => l.text).join('\n');
            navigator.clipboard.writeText(fullText).then(() => {
                copyBtn.textContent = '✅ Copied!';
                setTimeout(() => { copyBtn.textContent = '📋 Copy Code'; }, 2000);
            });
        });
    }
}

/* ── Sample Section ───────────────────────────────────── */
function initSampleSection() {
    const tableBody = document.querySelector('#sampleTable tbody');
    const trainBtn = document.getElementById('trainSampleBtn');
    let step = 0;

    const nodes = [
        { id: 1, deg: 14.2, p0: 1.00, p1: 0.00, cls: 0 },
        { id: 2, deg: 12.8, p0: 0.92, p1: 0.08, cls: 0 },
        { id: 3, deg: 15.1, p0: 0.85, p1: 0.15, cls: 0 },
        { id: 4, deg: 11.4, p0: 0.12, p1: 0.88, cls: 1 },
        { id: 5, deg: 13.9, p0: 0.00, p1: 1.00, cls: 1 }
    ];

    function renderTable() {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        nodes.forEach(n => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>Node #${n.id}</td>
                <td>${n.deg.toFixed(1)}</td>
                <td>${n.p0.toFixed(3)}</td>
                <td>${n.p1.toFixed(3)}</td>
                <td><span style="color:${n.cls === 0 ? '#f472b6' : '#fbbf24'}; font-weight:700;">Class ${n.cls}</span></td>
            `;
            tableBody.appendChild(tr);
        });

        document.getElementById('metricNodes').textContent = 50;
        document.getElementById('metricEdges').textContent = 340;
        document.getElementById('metricStep').textContent = step;
        document.getElementById('metricEnergy').textContent = (1.42 / (step + 1)).toFixed(4);
    }

    const ctxEnergy = document.getElementById('chartEnergy')?.getContext('2d');
    const ctxCertainty = document.getElementById('chartCertainty')?.getContext('2d');

    if (ctxEnergy) {
        new Chart(ctxEnergy, {
            type: 'line',
            data: {
                labels: ['t=0', 't=5', 't=10', 't=15', 't=20'],
                datasets: [{ label: 'Dirichlet Energy', data: [4.2, 2.1, 1.1, 0.5, 0.1], borderColor: '#f472b6', fill: false }]
            },
            options: { responsive: true, plugins: { legend: { display: false } } }
        });
    }

    if (ctxCertainty) {
        new Chart(ctxCertainty, {
            type: 'bar',
            data: {
                labels: ['[0.5-0.6]', '[0.6-0.7]', '[0.7-0.8]', '[0.8-0.9]', '[0.9-1.0]'],
                datasets: [{ label: 'Certainty', data: [2, 4, 8, 16, 20], backgroundColor: '#fbbf24', borderRadius: 4 }]
            },
            options: { responsive: true, plugins: { legend: { display: false } } }
        });
    }

    if (trainBtn) {
        trainBtn.addEventListener('click', () => {
            step++;
            nodes.forEach(n => {
                if (n.id === 2 || n.id === 3) n.p0 = Math.min(1.0, n.p0 + 0.03);
            });
            renderTable();
        });
    }

    renderTable();
}

/* ── Interactive Playground ───────────────────────────── */
function initPlayground() {
    const canvas = document.getElementById('lpCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const sliderGamma = document.getElementById('sliderGamma');
    const sliderAlpha = document.getElementById('sliderAlpha');
    const valGamma = document.getElementById('valGamma');
    const valAlpha = document.getElementById('valAlpha');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const presetBtns = document.querySelectorAll('.preset-btn');
    const btnStep = document.getElementById('btnPropStep');
    const btnReset = document.getElementById('btnResetPlayground');
    const toolLabel = document.getElementById('activeToolLabel');
    const lblStep = document.getElementById('lblStep');

    let gamma = 20.0;
    let alpha = 0.80;
    let addMode = 'class0';
    let currentStep = 0;
    let nodes = [];

    function generatePreset(type) {
        nodes = [];
        currentStep = 0;
        const w = canvas.width, h = canvas.height;

        if (type === 'rings') {
            for (let i = 0; i < 30; i++) {
                const a = (i / 30) * Math.PI * 2;
                nodes.push({ x: w / 2 + Math.cos(a) * 60, y: h / 2 + Math.sin(a) * 60, cls: i === 0 ? 0 : -1, p0: i === 0 ? 1 : 0.5, p1: i === 0 ? 0 : 0.5 });
                nodes.push({ x: w / 2 + Math.cos(a) * 140, y: h / 2 + Math.sin(a) * 140, cls: i === 0 ? 1 : -1, p0: i === 0 ? 0 : 0.5, p1: i === 0 ? 1 : 0.5 });
            }
        } else {
            for (let i = 0; i < 25; i++) {
                const t = (i / 25) * Math.PI;
                nodes.push({ x: w * 0.35 + Math.cos(t) * 110, y: h * 0.45 - Math.sin(t) * 90, cls: i === 0 ? 0 : -1, p0: i === 0 ? 1 : 0.5, p1: i === 0 ? 0 : 0.5 });
                nodes.push({ x: w * 0.55 - Math.cos(t) * 110, y: h * 0.55 + Math.sin(t) * 90, cls: i === 0 ? 1 : -1, p0: i === 0 ? 0 : 0.5, p1: i === 0 ? 1 : 0.5 });
            }
        }
        render();
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw connections
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = (nodes[i].x - nodes[j].x) / canvas.width;
                const dy = (nodes[i].y - nodes[j].y) / canvas.height;
                const w = Math.exp(-gamma * (dx * dx + dy * dy));
                if (w > 0.05) {
                    ctx.strokeStyle = `rgba(244, 114, 182, ${w * 0.4})`;
                    ctx.lineWidth = w * 3;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }

        // Draw nodes
        nodes.forEach(n => {
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.cls !== -1 ? 8 : 6, 0, Math.PI * 2);
            const r = Math.floor(n.p1 * 251 + n.p0 * 244);
            const g = Math.floor(n.p1 * 191 + n.p0 * 114);
            const b = Math.floor(n.p1 * 36 + n.p0 * 182);
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });

        if (lblStep) lblStep.textContent = `Step ${currentStep}`;
    }

    function stepPropagation() {
        currentStep++;
        const newP0 = new Array(nodes.length).fill(0);
        const newP1 = new Array(nodes.length).fill(0);

        nodes.forEach((n, i) => {
            let sumW0 = 0, sumW1 = 0, sumW = 0;
            nodes.forEach((m, j) => {
                if (i !== j) {
                    const dx = (n.x - m.x) / canvas.width;
                    const dy = (n.y - m.y) / canvas.height;
                    const w = Math.exp(-gamma * (dx * dx + dy * dy));
                    sumW0 += w * m.p0;
                    sumW1 += w * m.p1;
                    sumW += w;
                }
            });
            if (sumW > 0) {
                const propagated0 = sumW0 / sumW;
                const propagated1 = sumW1 / sumW;
                const init0 = n.cls === 0 ? 1 : (n.cls === 1 ? 0 : 0.5);
                const init1 = n.cls === 1 ? 1 : (n.cls === 0 ? 0 : 0.5);

                newP0[i] = alpha * propagated0 + (1 - alpha) * init0;
                newP1[i] = alpha * propagated1 + (1 - alpha) * init1;
            }
        });

        nodes.forEach((n, i) => {
            n.p0 = newP0[i];
            n.p1 = newP1[i];
        });

        render();
    }

    if (sliderGamma) {
        sliderGamma.addEventListener('input', (e) => {
            gamma = parseFloat(e.target.value);
            if (valGamma) valGamma.textContent = gamma.toFixed(1);
            render();
        });
    }

    if (sliderAlpha) {
        sliderAlpha.addEventListener('input', (e) => {
            alpha = parseFloat(e.target.value);
            if (valAlpha) valAlpha.textContent = alpha.toFixed(2);
        });
    }

    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            addMode = btn.getAttribute('data-mode');
            if (toolLabel) toolLabel.textContent = btn.textContent;
        });
    });

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            generatePreset(btn.getAttribute('data-preset'));
        });
    });

    if (btnStep) btnStep.addEventListener('click', stepPropagation);
    if (btnReset) btnReset.addEventListener('click', () => generatePreset('rings'));

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        let c = -1, p0 = 0.5, p1 = 0.5;
        if (addMode === 'class0') { c = 0; p0 = 1; p1 = 0; }
        else if (addMode === 'class1') { c = 1; p0 = 0; p1 = 1; }
        nodes.push({ x, y, cls: c, p0, p1 });
        render();
    });

    generatePreset('rings');
}
