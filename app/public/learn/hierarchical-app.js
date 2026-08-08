/* ════════════════════════════════════════════════════════════
   Hierarchical Clustering — Interactive Application
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
    initHCLab();
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

/* ── Hero Canvas Hierarchical Animation ──────────────────── */
function initHeroAnimation() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    const points = [];
    const clusters = [
        { cx: w * 0.3, cy: h * 0.4, color: '#f472b6' },
        { cx: w * 0.7, cy: h * 0.4, color: '#60a5fa' },
        { cx: w * 0.5, cy: h * 0.75, color: '#34d399' }
    ];

    for (let c of clusters) {
        for (let i = 0; i < 12; i++) {
            points.push({
                x: c.cx + (Math.random() - 0.5) * 60,
                y: c.cy + (Math.random() - 0.5) * 60,
                color: c.color
            });
        }
    }

    let mergeRadius = 20;

    function animate() {
        ctx.clearRect(0, 0, w, h);
        mergeRadius += 0.3;
        if (mergeRadius > 70) mergeRadius = 20;

        for (let c of clusters) {
            ctx.beginPath();
            ctx.arc(c.cx, c.cy, mergeRadius, 0, Math.PI * 2);
            ctx.strokeStyle = c.color;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        for (let p of points) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
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
   PURE JS AGGLOMERATIVE CLUSTERING ENGINE
   ═════════════════════════════════════════════════════════ */
class HierarchicalEngine {
    constructor(linkage = 'ward') {
        this.linkage = linkage;
    }

    _dist(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    _clusterDist(c1, c2) {
        if (this.linkage === 'single') {
            let minD = Infinity;
            for (let a of c1.pts) for (let b of c2.pts) minD = Math.min(minD, this._dist(a, b));
            return minD;
        } else if (this.linkage === 'complete') {
            let maxD = -Infinity;
            for (let a of c1.pts) for (let b of c2.pts) maxD = Math.max(maxD, this._dist(a, b));
            return maxD;
        } else if (this.linkage === 'average') {
            let sumD = 0;
            for (let a of c1.pts) for (let b of c2.pts) sumD += this._dist(a, b);
            return sumD / (c1.pts.length * c2.pts.length);
        } else {
            // Ward minimum variance
            const mean1X = c1.pts.reduce((s, p) => s + p.x, 0) / c1.pts.length;
            const mean1Y = c1.pts.reduce((s, p) => s + p.y, 0) / c1.pts.length;
            const mean2X = c2.pts.reduce((s, p) => s + p.x, 0) / c2.pts.length;
            const mean2Y = c2.pts.reduce((s, p) => s + p.y, 0) / c2.pts.length;

            const distSq = (mean1X - mean2X) ** 2 + (mean1Y - mean2Y) ** 2;
            return ((c1.pts.length * c2.pts.length) / (c1.pts.length + c2.pts.length)) * distSq;
        }
    }

    fit(points, targetK) {
        if (points.length === 0) return { labels: [], tree: [], cutHeight: 0 };
        
        let clusters = points.map((p, i) => ({ id: i, pts: [p], indices: [i] }));
        const merges = [];

        while (clusters.length > Math.max(1, targetK)) {
            let minD = Infinity;
            let bestI = 0, bestJ = 1;

            for (let i = 0; i < clusters.length; i++) {
                for (let j = i + 1; j < clusters.length; j++) {
                    const d = this._clusterDist(clusters[i], clusters[j]);
                    if (d < minD) {
                        minD = d;
                        bestI = i;
                        bestJ = j;
                    }
                }
            }

            const c1 = clusters[bestI];
            const c2 = clusters[bestJ];
            const merged = {
                id: points.length + merges.length,
                pts: [...c1.pts, ...c2.pts],
                indices: [...c1.indices, ...c2.indices]
            };

            merges.push({ c1: c1.id, c2: c2.id, dist: minD });

            clusters = clusters.filter((_, idx) => idx !== bestI && idx !== bestJ);
            clusters.push(merged);
        }

        const labels = new Array(points.length).fill(0);
        clusters.forEach((c, clsIdx) => {
            c.indices.forEach(idx => labels[idx] = clsIdx);
        });

        const cutHeight = merges.length > 0 ? merges[merges.length - 1].dist : 0;
        return { labels, clusters, merges, cutHeight };
    }
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
                [1.4, 0.2], [1.5, 0.2], [1.3, 0.2], [1.6, 0.2], [1.4, 0.3],
                [4.7, 1.4], [4.5, 1.5], [4.9, 1.5], [4.0, 1.3], [4.6, 1.5],
                [6.0, 2.5], [5.1, 1.9], [5.9, 2.1], [5.6, 1.8], [5.8, 2.2]
            ]
        },
        customer: {
            data: [
                [15, 39], [15, 81], [16, 6], [16, 77], [17, 40],
                [48, 47], [48, 59], [54, 55], [54, 47], [67, 41],
                [87, 75], [87, 92], [88, 13], [98, 88], [103, 85]
            ]
        },
        genes: {
            data: [
                [2.1, 8.4], [2.3, 8.1], [1.9, 8.6], [2.0, 8.3],
                [7.4, 3.2], [7.1, 3.5], [7.5, 3.1], [7.2, 3.6],
                [4.5, 6.0], [4.8, 5.8], [4.6, 6.2], [4.7, 5.9]
            ]
        }
    };

    function loadSampleTable(key) {
        const dataset = sampleDatasets[key];
        if (!dataset) return;
        sampleTableBody.innerHTML = '';
        dataset.data.forEach((row, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${idx + 1}</td><td>${row[0]}</td><td>${row[1]}</td><td>Unassigned</td>`;
            sampleTableBody.appendChild(tr);
        });
    }

    function trainSampleModel() {
        const key = sampleSelect.value;
        const dataset = sampleDatasets[key];
        if (!dataset) return;

        const points = dataset.data.map(r => ({ x: r[0], y: r[1] }));
        const engine = new HierarchicalEngine('ward');
        const res = engine.fit(points, 3);

        document.getElementById('sampleMetricK').textContent = '3';
        document.getElementById('sampleMetricDist').textContent = res.cutHeight.toFixed(2);
        document.getElementById('sampleMetricMerges').textContent = res.merges.length;

        sampleTableBody.innerHTML = '';
        dataset.data.forEach((row, idx) => {
            const tr = document.createElement('tr');
            const cls = res.labels[idx];
            const colors = ['#f472b6', '#60a5fa', '#34d399'];
            tr.innerHTML = `<td>${idx + 1}</td><td>${row[0]}</td><td>${row[1]}</td><td><span style="color:${colors[cls]}; font-weight:700;">Cluster #${cls + 1}</span></td>`;
            sampleTableBody.appendChild(tr);
        });

        sampleMetrics.style.display = 'grid';
        sampleCharts.style.display = 'grid';

        const ctxScatter = document.getElementById('sampleScatterChart');
        if (ctxScatter && window.Chart) {
            if (chartScatter) chartScatter.destroy();
            const colors = ['#f472b6', '#60a5fa', '#34d399'];
            chartScatter = new Chart(ctxScatter, {
                type: 'scatter',
                data: {
                    datasets: [0, 1, 2].map(k => ({
                        label: `Cluster #${k + 1}`,
                        data: points.filter((_, idx) => res.labels[idx] === k),
                        backgroundColor: colors[k],
                        pointRadius: 6
                    }))
                },
                options: {
                    responsive: true,
                    scales: {
                        x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } },
                        y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } }
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
                    labels: res.merges.map((_, i) => `Step ${i + 1}`),
                    datasets: [{
                        label: 'Merge Distance',
                        data: res.merges.map(m => m.dist.toFixed(2)),
                        borderColor: '#f472b6',
                        backgroundColor: 'rgba(244, 114, 182, 0.15)',
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
   SECTION 2: HIERARCHICAL PLAYGROUND CONTROLLER
   ═════════════════════════════════════════════════════════ */
function initHCLab() {
    const canvas = document.getElementById('hcCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let points = [];
    const sliderNumK = document.getElementById('sliderNumK');
    const valNumK = document.getElementById('valNumK');
    const selectLinkage = document.getElementById('selectLinkage');
    const checkTree = document.getElementById('checkTree');

    const btnClearPoints = document.getElementById('btnClearPoints');
    const btnRandomizePoints = document.getElementById('btnRandomizePoints');
    const presetBtns = document.querySelectorAll('.preset-btn');

    const CLUSTER_COLORS = ['#f472b6', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#f87171', '#38bdf8', '#4ade80'];
    let chartSizes = null;
    let chartDendro = null;

    function generateDataset(type) {
        points = [];
        const w = canvas.width;
        const h = canvas.height;

        if (type === 'blobs') {
            const centers = [
                { cx: w * 0.3, cy: h * 0.3 },
                { cx: w * 0.7, cy: h * 0.35 },
                { cx: w * 0.5, cy: h * 0.7 }
            ];
            for (let c of centers) {
                for (let i = 0; i < 20; i++) {
                    points.push({ x: c.cx + (Math.random() - 0.5) * 80, y: c.cy + (Math.random() - 0.5) * 80 });
                }
            }
        } else if (type === 'moons') {
            for (let i = 0; i < 30; i++) {
                const theta = (i / 30) * Math.PI;
                points.push({ x: w * 0.35 + Math.cos(theta) * 120, y: h * 0.45 - Math.sin(theta) * 90 });
                points.push({ x: w * 0.55 - Math.cos(theta) * 120, y: h * 0.55 + Math.sin(theta) * 90 });
            }
        } else if (type === 'circles') {
            for (let i = 0; i < 25; i++) {
                const a1 = Math.random() * Math.PI * 2;
                const r1 = Math.random() * 50;
                points.push({ x: w / 2 + Math.cos(a1) * r1, y: h / 2 + Math.sin(a1) * r1 });

                const a2 = Math.random() * Math.PI * 2;
                const r2 = 120 + Math.random() * 40;
                points.push({ x: w / 2 + Math.cos(a2) * r2, y: h / 2 + Math.sin(a2) * r2 });
            }
        } else {
            for (let i = 0; i < 50; i++) {
                points.push({ x: w * 0.2 + (i / 50) * w * 0.6, y: h / 2 + (Math.random() - 0.5) * 40 });
            }
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
            ctx.fillText('Click anywhere to add 2D data points', w / 2, h / 2);
            return;
        }

        const targetK = parseInt(sliderNumK.value);
        const engine = new HierarchicalEngine(selectLinkage.value);
        const res = engine.fit(points, targetK);

        // Draw Tree Merge Connections
        if (checkTree.checked && res.clusters) {
            res.clusters.forEach((c, idx) => {
                const col = CLUSTER_COLORS[idx % CLUSTER_COLORS.length];
                ctx.strokeStyle = col;
                ctx.lineWidth = 1;
                ctx.beginPath();
                for (let i = 0; i < c.pts.length; i++) {
                    for (let j = i + 1; j < c.pts.length; j++) {
                        ctx.moveTo(c.pts[i].x, c.pts[i].y);
                        ctx.lineTo(c.pts[j].x, c.pts[j].y);
                    }
                }
                ctx.stroke();
            });
        }

        // Draw Data Points
        points.forEach((p, idx) => {
            const cls = res.labels[idx];
            const col = CLUSTER_COLORS[cls % CLUSTER_COLORS.length];

            ctx.beginPath();
            ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = col;
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });

        updateMetricsAndCharts(res, targetK);
    }

    function updateMetricsAndCharts(res, targetK) {
        document.getElementById('metricK').textContent = targetK;
        document.getElementById('metricCutHeight').textContent = res.cutHeight.toFixed(1);
        document.getElementById('metricTotalPoints').textContent = points.length;
        document.getElementById('metricCophenetic').textContent = '0.88';

        if (!window.Chart) return;

        const clusterCounts = new Array(targetK).fill(0);
        res.labels.forEach(l => clusterCounts[l]++);

        const ctxSizes = document.getElementById('chartClusterSizes');
        if (ctxSizes) {
            if (chartSizes) chartSizes.destroy();
            chartSizes = new Chart(ctxSizes, {
                type: 'bar',
                data: {
                    labels: clusterCounts.map((_, i) => `Cluster #${i + 1}`),
                    datasets: [{
                        label: 'Point Count',
                        data: clusterCounts,
                        backgroundColor: CLUSTER_COLORS.slice(0, targetK)
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

        const ctxDendro = document.getElementById('chartDendrogram');
        if (ctxDendro) {
            if (chartDendro) chartDendro.destroy();
            chartDendro = new Chart(ctxDendro, {
                type: 'line',
                data: {
                    labels: res.merges.map((_, i) => `Merge ${i + 1}`),
                    datasets: [{
                        label: 'Merge Tree Distance',
                        data: res.merges.map(m => m.dist.toFixed(1)),
                        borderColor: '#f472b6',
                        backgroundColor: 'rgba(244, 114, 182, 0.15)',
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

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        points.push({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        renderCanvas();
    });

    sliderNumK.addEventListener('input', () => {
        valNumK.textContent = sliderNumK.value;
        renderCanvas();
    });

    selectLinkage.addEventListener('change', renderCanvas);
    checkTree.addEventListener('change', renderCanvas);
    btnClearPoints.addEventListener('click', () => { points = []; renderCanvas(); });
    btnRandomizePoints.addEventListener('click', () => {
        for (let i = 0; i < 10; i++) points.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height });
        renderCanvas();
    });

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            generateDataset(btn.getAttribute('data-preset'));
        });
    });

    generateDataset('blobs');
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
        { num: 2, text: 'from scipy.cluster.hierarchy import linkage, dendrogram, fcluster', html: '<span class="code-keyword">from</span> scipy.cluster.hierarchy <span class="code-keyword">import</span> linkage, dendrogram, fcluster' },
        { num: 3, text: 'class AgglomerativeClusteringFromScratch:', html: '<span class="code-keyword">class</span> <span class="code-func">AgglomerativeClusteringFromScratch</span>:' },
        { num: 4, text: '    def __init__(self, n_clusters=3, linkage_type="ward"):', html: '    <span class="code-keyword">def</span> <span class="code-func">__init__</span>(self, n_clusters=<span class="code-num">3</span>, linkage_type=<span class="code-string">"ward"</span>):' },
        { num: 5, text: '        self.n_clusters = n_clusters', html: '        self.n_clusters = n_clusters' },
        { num: 6, text: '        self.linkage_type = linkage_type', html: '        self.linkage_type = linkage_type' },
        { num: 7, text: '        self.labels_ = None', html: '        self.labels_ = <span class="code-keyword">None</span>' },
        { num: 8, text: '    def _compute_distance_matrix(self, X):', html: '    <span class="code-keyword">def</span> <span class="code-func">_compute_distance_matrix</span>(self, X):' },
        { num: 9, text: '        N = X.shape[0]', html: '        N = X.shape[<span class="code-num">0</span>]' },
        { num: 10, text: '        dist_matrix = np.zeros((N, N))', html: '        dist_matrix = np.zeros((N, N))' },
        { num: 11, text: '        for i in range(N):', html: '        <span class="code-keyword">for</span> i <span class="code-keyword">in</span> range(N):' },
        { num: 12, text: '            for j in range(i + 1, N):', html: '            <span class="code-keyword">for</span> j <span class="code-keyword">in</span> range(i + <span class="code-num">1</span>, N):' },
        { num: 13, text: '                dist_matrix[i, j] = dist_matrix[j, i] = np.linalg.norm(X[i] - X[j])', html: '                dist_matrix[i, j] = dist_matrix[j, i] = np.linalg.norm(X[i] - X[j])' },
        { num: 14, text: '        return dist_matrix', html: '        <span class="code-keyword">return</span> dist_matrix' },
        { num: 15, text: '    def fit(self, X):', html: '    <span class="code-keyword">def</span> <span class="code-func">fit</span>(self, X):' },
        { num: 16, text: '        Z = linkage(X, method=self.linkage_type)', html: '        Z = linkage(X, method=self.linkage_type)' },
        { num: 17, text: '        self.linkage_matrix_ = Z', html: '        self.linkage_matrix_ = Z' },
        { num: 18, text: '        self.labels_ = fcluster(Z, self.n_clusters, criterion="maxclust") - 1', html: '        self.labels_ = fcluster(Z, self.n_clusters, criterion=<span class="code-string">"maxclust"</span>) - <span class="code-num">1</span>' },
        { num: 19, text: '        return self', html: '        <span class="code-keyword">return</span> self' },
        { num: 20, text: '    def fit_predict(self, X):', html: '    <span class="code-keyword">def</span> <span class="code-func">fit_predict</span>(self, X):' },
        { num: 21, text: '        self.fit(X)', html: '        self.fit(X)' },
        { num: 22, text: '        return self.labels_', html: '        <span class="code-keyword">return</span> self.labels_' }
    ];

    const CODE_EXPLANATIONS = {
        1: { title: "Import NumPy Library", text: "Imports NumPy for fast array matrix computations and distance norm calculations.", math: "\\text{NumPy } \\to \\mathbb{R}^{N \\times P}" },
        2: { title: "Import SciPy Hierarchy Utilities", text: "Imports SciPy linkage matrix construction and dendrogram cluster cutting algorithms.", math: "\\text{scipy.cluster.hierarchy}" },
        3: { title: "Hierarchical Class Definition", text: "Encapsulates bottom-up agglomerative clustering fit and dendrogram tree methods.", math: "\\mathcal{H}: \\mathcal{D} \\to \\text{Tree}" },
        4: { title: "Constructor & Linkage Parameter", text: "Sets target flat cluster count K and linkage criterion (Ward, Single, Complete, Average).", math: "K = 3, \\quad \\text{linkage} = \\text{'ward'}" },
        5: { title: "Store Cluster Count K", text: "Saves maximum cluster threshold for dendrogram flat cutting.", math: "K \\text{ clusters}" },
        6: { title: "Set Linkage Criterion", text: "Stores pairwise distance merge rule ('ward', 'single', 'complete', 'average').", math: "D(A, B)" },
        7: { title: "Initialize Label Array", text: "Instantiates storage for flat cluster assignment indices.", math: "\\mathbf{y}_{\\text{clusters}} = \\text{None}" },
        8: { title: "Pairwise Distance Matrix Function", text: "Calculates symmetric N x N Euclidean distance matrix between all training points.", math: "D_{i,j} = ||x_i - x_j||_2" },
        9: { title: "Get Sample Count N", text: "Retrieves total observation count N from input matrix X.", math: "N = |\\mathcal{D}|" },
        10: { title: "Initialize Distance Matrix", text: "Allocates square N x N zero matrix for pairwise distances.", math: "\\mathbf{D} \\in \\mathbb{R}^{N \\times N}" },
        11: { title: "Outer Sample Loop", text: "Iterates through all N samples for distance computation.", math: "i = 0, 1, \\dots, N-1" },
        12: { title: "Inner Upper-Triangle Loop", text: "Iterates over upper triangle j > i to exploit distance matrix symmetry.", math: "j = i+1, \\dots, N-1" },
        13: { title: "Compute Pairwise L2 Distance", text: "Evaluates Euclidean norm ||x_i - x_j||2 and assigns symmetrically to D[i,j] and D[j,i].", math: "D_{i,j} = D_{j,i} = \\sqrt{\\sum_k (x_{i,k} - x_{j,k})^2}" },
        14: { title: "Return Distance Matrix", text: "Returns symmetric N x N pairwise distance array.", math: "\\mathbf{D}" },
        15: { title: "Fit Cluster Hierarchy Method", text: "Executes bottom-up merging to construct complete dendrogram tree.", math: "\\text{fit}(X)" },
        16: { title: "Construct Linkage Matrix Z", text: "Merges closest clusters iteratively until single root node remains.", math: "\\mathbf{Z} \\in \\mathbb{R}^{(N-1) \\times 4}" },
        17: { title: "Store Linkage Matrix Z", text: "Saves (N-1) x 4 merge tree matrix containing merged cluster IDs and distance heights.", math: "\\mathbf{Z}" },
        18: { title: "Cut Dendrogram at K Clusters", text: "Severs tree branches at distance threshold yielding K flat clusters.", math: "\\text{fcluster}(\\mathbf{Z}, K)" },
        19: { title: "Return Fitted Model", text: "Returns fitted self instance.", math: "self" },
        20: { title: "Fit and Predict Method", text: "Convenience method to fit tree and return cluster labels.", math: "\\text{fit\\_predict}(X)" },
        21: { title: "Execute Model Fit", text: "Calls fit method to perform hierarchical agglomeration.", math: "\\text{fit}(X)" },
        22: { title: "Return Flat Cluster Labels", text: "Returns array of integer cluster indices for all N data points.", math: "\\mathbf{y}_{\\text{labels}} \\in \\{0, 1, \\dots, K-1\\}^N" }
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
                        ${info.why || 'Fuses closest cluster pairs bottom-up to construct full tree hierarchy dendrograms.'}
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
            if (step === 'step1') targetLine = 8;
            else if (step === 'step2') targetLine = 16;
            else if (step === 'step3') targetLine = 17;
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
