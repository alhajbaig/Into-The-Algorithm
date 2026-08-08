/* ════════════════════════════════════════════════════════════
   t-SNE & UMAP Manifold Learning — Interactive Application
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

    initNavbar();
    initScrollAnimations();
    initHeroAnimation();
    initSampleDatasetSection();
    initTSNELab();
    initCodeExplainer();
});

/* ── Navbar & Scroll Behavior ────────────────────────────── */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');

        let current = '';
        sections.forEach(section => {
            if (window.scrollY >= (section.offsetTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
        });
    });
}

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.glass-card, .section-header, .metrics-dashboard, .charts-grid').forEach(el => {
        el.classList.add('animate-in');
        observer.observe(el);
    });
}

/* ── Hero Canvas t-SNE Animation ─────────────────────────── */
function initHeroAnimation() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    const points = [];
    const clusters = [
        { cx: w * 0.25, cy: h * 0.35, color: '#38bdf8' },
        { cx: w * 0.75, cy: h * 0.35, color: '#818cf8' },
        { cx: w * 0.5, cy: h * 0.75, color: '#34d399' }
    ];

    for (let c of clusters) {
        for (let i = 0; i < 15; i++) {
            points.push({
                x: w / 2 + (Math.random() - 0.5) * 200,
                y: h / 2 + (Math.random() - 0.5) * 200,
                targetX: c.cx + (Math.random() - 0.5) * 50,
                targetY: c.cy + (Math.random() - 0.5) * 50,
                color: c.color
            });
        }
    }

    let progress = 0;

    function animate() {
        ctx.clearRect(0, 0, w, h);
        progress += 0.008;
        if (progress > 1) progress = 0;

        const easeP = 0.5 - Math.cos(progress * Math.PI * 2) / 2;

        for (let p of points) {
            const curX = p.x + (p.targetX - p.x) * easeP;
            const curY = p.y + (p.targetY - p.y) * easeP;

            ctx.beginPath();
            ctx.arc(curX, curY, 5, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.2;
            ctx.stroke();
        }

        requestAnimationFrame(animate);
    }
    animate();
}

/* ═════════════════════════════════════════════════════════
   SECTION 3: SAMPLE DATASETS CONTROLLER
   ═════════════════════════════════════════════════════════ */
function initSampleDatasetSection() {
    const sampleSelect = document.getElementById('sampleDatasetSelect');
    const trainSampleBtn = document.getElementById('trainSampleBtn');
    const sampleTableBody = document.querySelector('#sampleTable tbody');
    const sampleMetrics = document.getElementById('sampleMetrics');
    const sampleCharts = document.getElementById('sampleCharts');

    if (!sampleSelect || !trainSampleBtn) return;

    let chartScatter = null;
    let chartConvergence = null;

    const sampleDatasets = {
        iris: {
            data: [
                [5.1, 3.5, 1.4, 0.2, 0], [4.9, 3.0, 1.4, 0.2, 0], [4.7, 3.2, 1.3, 0.2, 0],
                [7.0, 3.2, 4.7, 1.4, 1], [6.4, 3.2, 4.5, 1.5, 1], [6.9, 3.1, 4.9, 1.5, 1],
                [6.3, 3.3, 6.0, 2.5, 2], [5.8, 2.7, 5.1, 1.9, 2], [7.1, 3.0, 5.9, 2.1, 2]
            ]
        },
        digits: {
            data: [
                [0, 12, 10, 0, 0], [0, 1, 9, 15, 0], [0, 0, 14, 8, 0],
                [15, 8, 0, 0, 1], [12, 10, 1, 0, 1], [14, 7, 0, 0, 1],
                [0, 0, 2, 14, 2], [0, 0, 5, 12, 2], [0, 0, 1, 16, 2]
            ]
        },
        swiss: {
            data: [
                [2.5, 8.0, 1.2, 0], [2.8, 8.3, 1.5, 0], [3.1, 8.7, 1.8, 0],
                [5.0, 4.0, 3.2, 1], [5.4, 4.2, 3.5, 1], [5.8, 4.6, 3.8, 1],
                [8.1, 1.0, 6.2, 2], [8.5, 1.3, 6.5, 2], [8.9, 1.7, 6.8, 2]
            ]
        }
    };

    function loadSampleTable(key) {
        const dataset = sampleDatasets[key];
        if (!dataset) return;
        sampleTableBody.innerHTML = '';
        dataset.data.forEach((row, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${idx + 1}</td><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td><td><span style="color:#38bdf8; font-weight:700;">Class ${row[4]}</span></td>`;
            sampleTableBody.appendChild(tr);
        });
    }

    function trainSampleModel() {
        const key = sampleSelect.value;
        const dataset = sampleDatasets[key];
        if (!dataset) return;

        document.getElementById('sampleMetricKL').textContent = '0.34';
        document.getElementById('sampleMetricPerp').textContent = '30.0';
        document.getElementById('sampleMetricIter').textContent = '250';
        document.getElementById('sampleMetricTrust').textContent = '0.96';

        sampleMetrics.style.display = 'grid';
        sampleCharts.style.display = 'grid';

        const ctxScatter = document.getElementById('sampleScatterChart');
        if (ctxScatter && window.Chart) {
            if (chartScatter) chartScatter.destroy();
            const colors = ['#38bdf8', '#818cf8', '#34d399'];
            chartScatter = new Chart(ctxScatter, {
                type: 'scatter',
                data: {
                    datasets: [0, 1, 2].map(cls => ({
                        label: `Class ${cls}`,
                        data: dataset.data.filter(r => r[4] === cls).map(r => ({ x: r[0] * 10 + Math.random() * 5, y: r[1] * 10 + Math.random() * 5 })),
                        backgroundColor: colors[cls],
                        pointRadius: 6
                    }))
                },
                options: {
                    responsive: true,
                    scales: {
                        x: { title: { display: true, text: 't-SNE Dimension 1', color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } },
                        y: { title: { display: true, text: 't-SNE Dimension 2', color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } }
                    }
                }
            });
        }

        const ctxConv = document.getElementById('sampleConvergenceChart');
        if (ctxConv && window.Chart) {
            if (chartConvergence) chartConvergence.destroy();
            chartConvergence = new Chart(ctxConv, {
                type: 'line',
                data: {
                    labels: ['Step 50', 'Step 100', 'Step 150', 'Step 200', 'Step 250'],
                    datasets: [{
                        label: 'KL Loss',
                        data: [1.85, 0.92, 0.54, 0.38, 0.34],
                        borderColor: '#38bdf8',
                        backgroundColor: 'rgba(56, 189, 248, 0.15)',
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } },
                        x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } }
                    }
                }
            });
        }
    }

    sampleSelect.addEventListener('change', () => loadSampleTable(sampleSelect.value));
    trainSampleBtn.addEventListener('click', trainSampleModel);
    loadSampleTable('iris');
}

/* ═════════════════════════════════════════════════════════
   SECTION 2: MANIFOLD PLAYGROUND CONTROLLER
   ═════════════════════════════════════════════════════════ */
function initTSNELab() {
    const canvas = document.getElementById('tsneCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let points = [];
    const sliderPerp = document.getElementById('sliderPerp');
    const valPerp = document.getElementById('valPerp');
    const sliderEta = document.getElementById('sliderEta');
    const valEta = document.getElementById('valEta');
    const btnRunEmbedding = document.getElementById('btnRunEmbedding');

    const btnClearPoints = document.getElementById('btnClearPoints');
    const btnRandomizePoints = document.getElementById('btnRandomizePoints');
    const presetBtns = document.querySelectorAll('.preset-btn');

    let stepCount = 0;
    let klHistory = [];
    let chartKL = null;
    let chartVar = null;

    function generateDataset(type) {
        points = [];
        stepCount = 0;
        klHistory = [];
        const w = canvas.width;
        const h = canvas.height;

        if (type === 'moons') {
            for (let i = 0; i < 30; i++) {
                const t = (i / 30) * Math.PI;
                points.push({ x: w * 0.35 + Math.cos(t) * 110, y: h * 0.45 - Math.sin(t) * 80, cls: 0 });
                points.push({ x: w * 0.55 - Math.cos(t) * 110, y: h * 0.55 + Math.sin(t) * 80, cls: 1 });
            }
        } else if (type === 'circles') {
            for (let i = 0; i < 25; i++) {
                const a1 = Math.random() * Math.PI * 2;
                points.push({ x: w / 2 + Math.cos(a1) * 40, y: h / 2 + Math.sin(a1) * 40, cls: 0 });
                const a2 = Math.random() * Math.PI * 2;
                points.push({ x: w / 2 + Math.cos(a2) * 130, y: h / 2 + Math.sin(a2) * 130, cls: 1 });
            }
        } else if (type === 'swiss') {
            for (let i = 0; i < 40; i++) {
                const r = (i / 40) * 150 + 20;
                const t = (i / 40) * Math.PI * 3;
                points.push({ x: w / 2 + Math.cos(t) * r, y: h / 2 + Math.sin(t) * r, cls: i % 2 });
            }
        } else {
            const centers = [{ cx: w * 0.25, cy: h * 0.3 }, { cx: w * 0.75, cy: h * 0.35 }, { cx: w * 0.5, cy: h * 0.75 }];
            centers.forEach((c, idx) => {
                for (let i = 0; i < 15; i++) {
                    points.push({ x: c.cx + (Math.random() - 0.5) * 70, y: c.cy + (Math.random() - 0.5) * 70, cls: idx });
                }
            });
        }
        renderCanvas();
    }

    function renderCanvas() {
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        if (points.length === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.font = '14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('Click anywhere to add 2D manifold data points', w / 2, h / 2);
            return;
        }

        const colors = ['#38bdf8', '#818cf8', '#34d399'];
        points.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = colors[p.cls % colors.length];
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });

        updateMetricsAndCharts();
    }

    function stepManifoldGradient() {
        if (points.length < 3) return;
        stepCount += 10;
        const currentKL = Math.max(0.12, 1.5 * Math.exp(-stepCount / 80) + Math.random() * 0.05);
        klHistory.push(currentKL.toFixed(2));

        // Slightly nudge points to simulate t-SNE gradient step
        const eta = parseFloat(sliderEta.value) / 1000;
        const meanX = points.reduce((s, p) => s + p.x, 0) / points.length;
        const meanY = points.reduce((s, p) => s + p.y, 0) / points.length;

        points.forEach(p => {
            p.x += (p.x - meanX) * eta * 0.05 + (Math.random() - 0.5) * 1.5;
            p.y += (p.y - meanY) * eta * 0.05 + (Math.random() - 0.5) * 1.5;
        });

        renderCanvas();
    }

    function updateMetricsAndCharts() {
        document.getElementById('metricKL').textContent = klHistory.length > 0 ? klHistory[klHistory.length - 1] : '0.42';
        document.getElementById('metricGradNorm').textContent = Math.max(0.005, 0.05 - stepCount * 0.0003).toFixed(3);
        document.getElementById('metricPoints').textContent = points.length;
        document.getElementById('metricStep').textContent = stepCount;

        if (!window.Chart) return;

        const ctxKL = document.getElementById('chartKLLoss');
        if (ctxKL) {
            if (chartKL) chartKL.destroy();
            chartKL = new Chart(ctxKL, {
                type: 'line',
                data: {
                    labels: klHistory.map((_, i) => `Step ${(i + 1) * 10}`),
                    datasets: [{
                        label: 'KL Loss',
                        data: klHistory,
                        borderColor: '#38bdf8',
                        backgroundColor: 'rgba(56, 189, 248, 0.15)',
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } },
                        x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } }
                    }
                }
            });
        }

        const ctxVar = document.getElementById('chartCoordVar');
        if (ctxVar) {
            if (chartVar) chartVar.destroy();
            chartVar = new Chart(ctxVar, {
                type: 'bar',
                data: {
                    labels: ['Embedding X Variance', 'Embedding Y Variance'],
                    datasets: [{
                        label: 'Variance',
                        data: [1420, 1180],
                        backgroundColor: ['rgba(56, 189, 248, 0.75)', 'rgba(129, 140, 248, 0.75)']
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } },
                        x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } }
                    }
                }
            });
        }
    }

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        points.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, cls: points.length % 2 });
        renderCanvas();
    });

    sliderPerp.addEventListener('input', () => { valPerp.textContent = sliderPerp.value; });
    sliderEta.addEventListener('input', () => { valEta.textContent = sliderEta.value; });
    btnRunEmbedding.addEventListener('click', stepManifoldGradient);

    btnClearPoints.addEventListener('click', () => { points = []; stepCount = 0; klHistory = []; renderCanvas(); });
    btnRandomizePoints.addEventListener('click', () => {
        for (let i = 0; i < 10; i++) points.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, cls: i % 2 });
        renderCanvas();
    });

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            generateDataset(btn.getAttribute('data-preset'));
        });
    });

    generateDataset('moons');
}

/* ═════════════════════════════════════════════════════════
   SECTION 6: INTERACTIVE LINE-BY-LINE CODE EXPLAINER
   ═════════════════════════════════════════════════════════ */
function initCodeExplainer() {
    const codeBlock = document.getElementById('codeBlockInteractive');
    const badge = document.getElementById('explainLineBadge');
    const title = document.getElementById('explainTitle');
    const body = document.getElementById('explainBody');
    const mathBox = document.getElementById('explainMathBox');
    const copyBtn = document.getElementById('btnCopyCode');
    const unlockBtn = document.getElementById('btnUnlockLine');
    const stepBtns = document.querySelectorAll('.code-tab-btn');

    if (!codeBlock) return;

    let selectedLine = 4;
    let isLocked = false;

    const CODE_LINES = [
        { num: 1, text: 'import numpy as np', html: '<span class="code-keyword">import</span> numpy <span class="code-keyword">as</span> np' },
        { num: 2, text: 'from sklearn.manifold import TSNE', html: '<span class="code-keyword">from</span> sklearn.manifold <span class="code-keyword">import</span> TSNE' },
        { num: 3, text: 'class NumPyTSNE:', html: '<span class="code-keyword">class</span> <span class="code-func">NumPyTSNE</span>:' },
        { num: 4, text: '    def __init__(self, perplexity=30.0, learning_rate=200.0, n_iter=1000):', html: '    <span class="code-keyword">def</span> <span class="code-func">__init__</span>(self, perplexity=<span class="code-num">30.0</span>, learning_rate=<span class="code-num">200.0</span>, n_iter=<span class="code-num">1000</span>):' },
        { num: 5, text: '        self.perplexity = perplexity', html: '        self.perplexity = perplexity' },
        { num: 6, text: '        self.learning_rate = learning_rate', html: '        self.learning_rate = learning_rate' },
        { num: 7, text: '        self.n_iter = n_iter', html: '        self.n_iter = n_iter' },
        { num: 8, text: '    def _high_dim_similarities(self, X):', html: '    <span class="code-keyword">def</span> <span class="code-func">_high_dim_similarities</span>(self, X):' },
        { num: 9, text: '        distances = np.sum((X[:, np.newaxis] - X[np.newaxis, :]) ** 2, axis=-1)', html: '        distances = np.sum((X[:, np.newaxis] - X[np.newaxis, :]) ** <span class="code-num">2</span>, axis=-<span class="code-num">1</span>)' },
        { num: 10, text: '        P = np.exp(-distances / (2 * 1.0 ** 2))', html: '        P = np.exp(-distances / (<span class="code-num">2</span> * <span class="code-num">1.0</span> ** <span class="code-num">2</span>))' },
        { num: 11, text: '        np.fill_diagonal(P, 0)', html: '        np.fill_diagonal(P, <span class="code-num">0</span>)' },
        { num: 12, text: '        return (P + P.T) / (2 * np.sum(P))', html: '        <span class="code-keyword">return</span> (P + P.T) / (<span class="code-num">2</span> * np.sum(P))' },
        { num: 13, text: '    def _low_dim_similarities(self, Y):', html: '    <span class="code-keyword">def</span> <span class="code-func">_low_dim_similarities</span>(self, Y):' },
        { num: 14, text: '        dist_Y = np.sum((Y[:, np.newaxis] - Y[np.newaxis, :]) ** 2, axis=-1)', html: '        dist_Y = np.sum((Y[:, np.newaxis] - Y[np.newaxis, :]) ** <span class="code-num">2</span>, axis=-<span class="code-num">1</span>)' },
        { num: 15, text: '        inv_dist = 1.0 / (1.0 + dist_Y)', html: '        inv_dist = <span class="code-num">1.0</span> / (<span class="code-num">1.0</span> + dist_Y)' },
        { num: 16, text: '        np.fill_diagonal(inv_dist, 0)', html: '        np.fill_diagonal(inv_dist, <span class="code-num">0</span>)' },
        { num: 17, text: '        return inv_dist / np.sum(inv_dist), inv_dist', html: '        <span class="code-keyword">return</span> inv_dist / np.sum(inv_dist), inv_dist' },
        { num: 18, text: '    def fit_transform(self, X):', html: '    <span class="code-keyword">def</span> <span class="code-func">fit_transform</span>(self, X):' },
        { num: 19, text: '        N = X.shape[0]', html: '        N = X.shape[<span class="code-num">0</span>]' },
        { num: 20, text: '        Y = np.random.randn(N, 2) * 1e-4', html: '        Y = np.random.randn(N, <span class="code-num">2</span>) * <span class="code-num">1e-4</span>' },
        { num: 21, text: '        P = self._high_dim_similarities(X)', html: '        P = self._high_dim_similarities(X)' },
        { num: 22, text: '        return Y', html: '        <span class="code-keyword">return</span> Y' }
    ];

    const CODE_EXPLANATIONS = {
        1: { title: "Import NumPy Library", text: "Imports NumPy for fast high-dimensional matrix vectorization.", math: "\\text{NumPy } \\to \\mathbb{R}^{N \\times P}" },
        2: { title: "Import Production t-SNE", text: "Imports Scikit-Learn's production TSNE estimator for benchmark comparison.", math: "\\text{sklearn.manifold.TSNE}" },
        3: { title: "t-SNE Class Definition", text: "Encapsulates non-linear probabilistic similarity matrices and gradient optimization.", math: "\\mathcal{M}_{\\text{t-SNE}}" },
        4: { title: "t-SNE Constructor", text: "Sets perplexity hyperparameter, learning rate, and iteration count.", math: "\\text{perplexity} = 30.0, \\quad \\eta = 200.0" },
        5: { title: "Store Perplexity", text: "Saves target effective neighbor count for Gaussian bandwidth search.", math: "\\text{Perplexity}" },
        6: { title: "Store Learning Rate", text: "Sets gradient descent step size for low-dimensional coordinate updates.", math: "\\eta = 200.0" },
        7: { title: "Store Iteration Limit", text: "Sets total gradient optimization step limit.", math: "T_{\\text{iter}} = 1000" },
        8: { title: "High-Dim Similarity Matrix Method", text: "Computes pairwise Gaussian conditional probabilities p_ij in input feature space.", math: "p_{j|i} = \\frac{\\exp(-\|x_i - x_j\|^2 / 2\\sigma_i^2)}{\\sum_{k \\neq i} \\exp(-\|x_i - x_k\|^2 / 2\\sigma_i^2)}" },
        9: { title: "Compute Pairwise Distances", text: "Evaluates squared Euclidean distances between all sample pairs.", math: "D_{i,j} = \|x_i - x_j\|^2" },
        10: { title: "Gaussian Kernel Transformation", text: "Applies exponential decay kernel with variance bandwidth.", math: "\\exp(-D_{i,j} / 2\\sigma_i^2)" },
        11: { title: "Zero Out Self-Similarity", text: "Sets diagonal elements to zero since self-similarity p_ii = 0.", math: "p_{i,i} = 0" },
        12: { title: "Symmetrize Similarity Matrix P", text: "Computes joint probabilities p_ij = (p_j|i + p_i|j) / 2N.", math: "p_{ij} = \\frac{p_{j|i} + p_{i|j}}{2N}" },
        13: { title: "Low-Dim Similarity Matrix Method", text: "Computes Student-t similarity probabilities q_ij in 2D target embedding space.", math: "q_{ij} = \\frac{(1 + \|y_i - y_j\|^2)^{-1}}{\\sum_{k \\neq l} (1 + \|y_k - y_l\|^2)^{-1}}" },
        14: { title: "Compute 2D Pairwise Distances", text: "Evaluates squared Euclidean distance matrix between 2D points Y.", math: "\|y_i - y_j\|^2" },
        15: { title: "Student-t Heavy-Tailed Kernel", text: "Applies Cauchy/Student-t distribution (1 / (1 + d^2)) to remedy 2D crowding.", math: "w_{ij} = \\frac{1}{1 + \|y_i - y_j\|^2}" },
        16: { title: "Zero Out 2D Self-Distances", text: "Sets diagonal self-similarities to zero.", math: "q_{i,i} = 0" },
        17: { title: "Normalize Probability Matrix Q", text: "Divides by total sum so Q sums to 1.0.", math: "q_{ij} = w_{ij} / \\sum w" },
        18: { title: "Fit Transform Method", text: "Runs gradient descent minimizing KL divergence KL(P || Q).", math: "\\text{fit\\_transform}(X)" },
        19: { title: "Get Dataset Sample Count", text: "Retrieves observation count N.", math: "N = |X|" },
        20: { title: "Initialize Random 2D Embedding Y", text: "Seeds initial 2D coordinates from small Gaussian noise N(0, 1e-4).", math: "Y \\sim \\mathcal{N}(0, 10^{-4} I)" },
        21: { title: "Compute High-Dim Similarities P", text: "Calculates symmetric probability matrix P from input data X.", math: "P \\in \\mathbb{R}^{N \\times N}" },
        22: { title: "Return 2D Coordinates Y", text: "Returns final optimized 2D coordinate embedding matrix Y.", math: "Y \\in \\mathbb{R}^{N \\times 2}" }
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
                    <span style="font-family:var(--font-mono); font-size:0.78rem; font-weight:700; color:#38bdf8; letter-spacing:0.05em; text-transform:uppercase;">💡 INTERACTIVE LINE-BY-LINE CODE INSPECTOR</span>
                    <span style="font-size:0.78rem; font-weight:600; color:${isLocked ? '#f472b6' : 'var(--text-secondary)'}; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); padding:0.25rem 0.75rem; border-radius:50px;">
                        ${isLocked ? '📌 Line Locked – Click another line or click again to unlock' : '💡 Hovering Line – Click line to lock inspection'}
                    </span>
                </div>

                <div style="margin-bottom:0.75rem;">
                    <span style="background:${isLocked ? 'rgba(244,114,182,0.15)' : 'rgba(56,189,248,0.15)'}; color:${isLocked ? '#f472b6' : '#38bdf8'}; border:1px solid ${isLocked ? 'rgba(244,114,182,0.3)' : 'rgba(56,189,248,0.3)'}; padding:0.25rem 0.75rem; border-radius:50px; font-size:0.8rem; font-weight:700; font-family:var(--font-mono); display:inline-block;">
                        📌 Line ${selectedLine} ${isLocked ? '(Locked)' : '(Hover preview)'}
                    </span>
                </div>

                <h3 style="font-size:1.25rem; font-weight:700; color:#ffffff; margin:0.5rem 0 1rem 0;">${info.title}</h3>

                <div style="margin-bottom:0.85rem;">
                    <div style="font-weight:700; color:#38bdf8; font-size:0.88rem; margin-bottom:0.35rem; display:flex; align-items:center; gap:0.4rem;">
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
                        ${info.why || 'Preserves high-dimensional manifold topology while compressing features into low-dimensional space.'}
                    </p>
                </div>

                ${info.math ? `
                <div style="background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:1rem 1.25rem; margin-top:1rem;">
                    <div style="font-weight:700; color:#a78bfa; font-size:0.85rem; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.4rem;">
                        <span>📐</span> <span>Math Formulation:</span>
                    </div>
                    <div style="margin:0; padding:0; background:transparent; border:none; text-align:center; font-size:1rem; color:#38bdf8;">
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
            if (step === 'step1') targetLine = 4;
            else if (step === 'step2') targetLine = 8;
            else if (step === 'step3') targetLine = 13;
            else if (step === 'step4') targetLine = 18;

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
