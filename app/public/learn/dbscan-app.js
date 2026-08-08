/* ════════════════════════════════════════════════════════════
   DBSCAN Clustering — Interactive Educational Application
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
    initDBSCANLab();
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

/* ── Hero Canvas DBSCAN Animation ────────────────────────── */
function initHeroAnimation() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    const points = [];
    for (let i = 0; i < 35; i++) {
        const theta = (i / 35) * Math.PI;
        points.push({ x: w * 0.35 + Math.cos(theta) * 110, y: h * 0.45 - Math.sin(theta) * 80, isCore: true });
        points.push({ x: w * 0.55 - Math.cos(theta) * 110, y: h * 0.55 + Math.sin(theta) * 80, isCore: true });
    }
    // Noise points
    points.push({ x: w * 0.15, y: h * 0.2, isNoise: true });
    points.push({ x: w * 0.85, y: h * 0.8, isNoise: true });
    points.push({ x: w * 0.8, y: h * 0.25, isNoise: true });

    let pulseEps = 25;

    function animate() {
        ctx.clearRect(0, 0, w, h);
        pulseEps += 0.25;
        if (pulseEps > 45) pulseEps = 25;

        // Draw epsilon circles around core points
        for (let p of points) {
            if (p.isCore) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, pulseEps, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(251, 191, 36, 0.12)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }

        // Draw points
        for (let p of points) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            if (p.isNoise) ctx.fillStyle = '#f87171';
            else ctx.fillStyle = '#fbbf24';
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
   PURE JS DBSCAN ENGINE
   ═════════════════════════════════════════════════════════ */
class DBSCANEngine {
    constructor(eps = 45, minPts = 4) {
        this.eps = eps;
        this.minPts = minPts;
    }

    _dist(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    _regionQuery(points, pointIdx) {
        const neighbors = [];
        const target = points[pointIdx];
        for (let i = 0; i < points.length; i++) {
            if (this._dist(target, points[i]) <= this.eps) {
                neighbors.push(i);
            }
        }
        return neighbors;
    }

    fit(points) {
        const N = points.length;
        const labels = new Array(N).fill(0); // 0 = unvisited, -1 = noise, >0 = cluster ID
        const types = new Array(N).fill('noise'); // 'core', 'border', 'noise'
        let clusterId = 0;

        for (let i = 0; i < N; i++) {
            if (labels[i] !== 0) continue; // Already processed

            const neighbors = this._regionQuery(points, i);
            if (neighbors.length < this.minPts) {
                labels[i] = -1; // Mark initially as noise
            } else {
                clusterId++;
                labels[i] = clusterId;
                types[i] = 'core';

                const queue = [...neighbors];
                for (let q = 0; q < queue.length; q++) {
                    const nIdx = queue[q];
                    if (labels[nIdx] === -1) {
                        labels[nIdx] = clusterId; // Change noise to border
                        types[nIdx] = 'border';
                    }
                    if (labels[nIdx] !== 0) continue;

                    labels[nIdx] = clusterId;
                    const nNeighbors = this._regionQuery(points, nIdx);
                    if (nNeighbors.length >= this.minPts) {
                        types[nIdx] = 'core';
                        queue.push(...nNeighbors);
                    } else {
                        types[nIdx] = 'border';
                    }
                }
            }
        }

        return { labels, types, numClusters: clusterId };
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
    let chartComp = null;

    const sampleDatasets = {
        gps: {
            data: [
                [10.2, 45.1], [10.4, 45.3], [10.3, 45.2], [10.1, 45.4],
                [35.6, 80.2], [35.8, 80.5], [35.7, 80.3], [35.9, 80.1],
                [90.0, 10.0], [5.0, 95.0], [50.0, 50.0] // Outliers
            ]
        },
        moons: {
            data: [
                [1.0, 2.0], [1.5, 2.5], [2.0, 2.8], [2.5, 2.5], [3.0, 2.0],
                [2.0, 1.2], [2.5, 0.8], [3.0, 0.5], [3.5, 0.8], [4.0, 1.2],
                [0.1, 4.0], [5.5, 4.2] // Outliers
            ]
        },
        rings: {
            data: [
                [0, 0], [0.5, 0.2], [-0.5, -0.3],
                [3, 0], [-3, 0], [0, 3], [0, -3], [2.1, 2.1], [-2.1, -2.1],
                [6, 6], [-6, -6] // Outliers
            ]
        }
    };

    function loadSampleTable(key) {
        const dataset = sampleDatasets[key];
        if (!dataset) return;
        sampleTableBody.innerHTML = '';
        dataset.data.forEach((row, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${idx + 1}</td><td>${row[0]}</td><td>${row[1]}</td><td>Unprocessed</td>`;
            sampleTableBody.appendChild(tr);
        });
    }

    function trainSampleModel() {
        const key = sampleSelect.value;
        const dataset = sampleDatasets[key];
        if (!dataset) return;

        const points = dataset.data.map(r => ({ x: r[0] * 20 + 100, y: r[1] * 20 + 100 }));
        const engine = new DBSCANEngine(40, 3);
        const res = engine.fit(points);

        const cores = res.types.filter(t => t === 'core').length;
        const borders = res.types.filter(t => t === 'border').length;
        const noise = res.types.filter(t => t === 'noise').length;

        document.getElementById('sampleMetricK').textContent = res.numClusters;
        document.getElementById('sampleMetricCore').textContent = cores;
        document.getElementById('sampleMetricBorder').textContent = borders;
        document.getElementById('sampleMetricNoise').textContent = noise;

        sampleTableBody.innerHTML = '';
        dataset.data.forEach((row, idx) => {
            const tr = document.createElement('tr');
            const status = res.labels[idx] === -1
                ? '<span style="color:#f87171; font-weight:700;">Noise (-1)</span>'
                : `<span style="color:#fbbf24; font-weight:700;">Cluster #${res.labels[idx]} (${res.types[idx]})</span>`;
            tr.innerHTML = `<td>${idx + 1}</td><td>${row[0]}</td><td>${row[1]}</td><td>${status}</td>`;
            sampleTableBody.appendChild(tr);
        });

        sampleMetrics.style.display = 'grid';
        sampleCharts.style.display = 'grid';

        const ctxScatter = document.getElementById('sampleScatterChart');
        if (ctxScatter && window.Chart) {
            if (chartScatter) chartScatter.destroy();
            chartScatter = new Chart(ctxScatter, {
                type: 'scatter',
                data: {
                    datasets: [
                        {
                            label: 'Core / Cluster Points',
                            data: points.filter((_, idx) => res.labels[idx] > 0),
                            backgroundColor: '#fbbf24',
                            pointRadius: 6
                        },
                        {
                            label: 'Noise Outliers (-1)',
                            data: points.filter((_, idx) => res.labels[idx] === -1),
                            backgroundColor: '#f87171',
                            pointRadius: 6
                        }
                    ]
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

        const ctxComp = document.getElementById('sampleCompositionChart');
        if (ctxComp && window.Chart) {
            if (chartComp) chartComp.destroy();
            chartComp = new Chart(ctxComp, {
                type: 'pie',
                data: {
                    labels: ['Core Points', 'Border Points', 'Noise Outliers'],
                    datasets: [{
                        data: [cores, borders, noise],
                        backgroundColor: ['#34d399', '#60a5fa', '#f87171']
                    }]
                },
                options: { responsive: true }
            });
        }
    }

    sampleSelect.addEventListener('change', () => loadSampleTable(sampleSelect.value));
    trainSampleBtn.addEventListener('click', trainSampleModel);
    loadSampleTable('gps');
}

/* ═════════════════════════════════════════════════════════
   SECTION 2: DBSCAN PLAYGROUND CONTROLLER
   ═════════════════════════════════════════════════════════ */
function initDBSCANLab() {
    const canvas = document.getElementById('dbCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let points = [];
    const sliderEps = document.getElementById('sliderEps');
    const valEps = document.getElementById('valEps');
    const sliderMinPts = document.getElementById('sliderMinPts');
    const valMinPts = document.getElementById('valMinPts');
    const checkCircles = document.getElementById('checkCircles');

    const btnClearPoints = document.getElementById('btnClearPoints');
    const btnRandomizePoints = document.getElementById('btnRandomizePoints');
    const presetBtns = document.querySelectorAll('.preset-btn');

    const CLUSTER_COLORS = ['#fbbf24', '#a78bfa', '#34d399', '#60a5fa', '#ec4899', '#38bdf8'];
    let chartPie = null;
    let chartKDist = null;

    function generateDataset(type) {
        points = [];
        const w = canvas.width;
        const h = canvas.height;

        if (type === 'moons') {
            for (let i = 0; i < 35; i++) {
                const t = (i / 35) * Math.PI;
                points.push({ x: w * 0.35 + Math.cos(t) * 120, y: h * 0.45 - Math.sin(t) * 90 });
                points.push({ x: w * 0.55 - Math.cos(t) * 120, y: h * 0.55 + Math.sin(t) * 90 });
            }
        } else if (type === 'rings') {
            for (let i = 0; i < 30; i++) {
                const a1 = Math.random() * Math.PI * 2;
                points.push({ x: w / 2 + Math.cos(a1) * 35, y: h / 2 + Math.sin(a1) * 35 });

                const a2 = Math.random() * Math.PI * 2;
                points.push({ x: w / 2 + Math.cos(a2) * 130, y: h / 2 + Math.sin(a2) * 130 });
            }
        } else if (type === 'spirals') {
            for (let i = 0; i < 40; i++) {
                const r = (i / 40) * 160 + 20;
                const t = (i / 40) * Math.PI * 3;
                points.push({ x: w / 2 + Math.cos(t) * r, y: h / 2 + Math.sin(t) * r });
            }
        } else {
            // High noise
            for (let i = 0; i < 30; i++) {
                points.push({ x: w * 0.3 + (Math.random() - 0.5) * 60, y: h * 0.5 + (Math.random() - 0.5) * 60 });
            }
            for (let i = 0; i < 25; i++) {
                points.push({ x: Math.random() * w, y: Math.random() * h });
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

        const eps = parseFloat(sliderEps.value);
        const minPts = parseInt(sliderMinPts.value);
        const engine = new DBSCANEngine(eps, minPts);
        const res = engine.fit(points);

        // Draw Epsilon Circles around Core Points
        if (checkCircles.checked) {
            points.forEach((p, idx) => {
                if (res.types[idx] === 'core') {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, eps, 0, Math.PI * 2);
                    ctx.strokeStyle = 'rgba(251, 191, 36, 0.15)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });
        }

        // Draw Points
        points.forEach((p, idx) => {
            const label = res.labels[idx];
            const type = res.types[idx];
            let color = '#f87171'; // Noise red

            if (label > 0) {
                color = CLUSTER_COLORS[(label - 1) % CLUSTER_COLORS.length];
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, type === 'core' ? 7 : 5, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = type === 'core' ? '#ffffff' : 'rgba(255,255,255,0.6)';
            ctx.lineWidth = type === 'core' ? 2 : 1;
            ctx.stroke();
        });

        updateMetricsAndCharts(res, eps);
    }

    function updateMetricsAndCharts(res, eps) {
        const cores = res.types.filter(t => t === 'core').length;
        const borders = res.types.filter(t => t === 'border').length;
        const noise = res.types.filter(t => t === 'noise').length;

        document.getElementById('metricClusters').textContent = res.numClusters;
        document.getElementById('metricCoreCount').textContent = cores;
        document.getElementById('metricBorderCount').textContent = borders;
        document.getElementById('metricNoiseCount').textContent = noise;

        if (!window.Chart) return;

        const ctxPie = document.getElementById('chartTypeComposition');
        if (ctxPie) {
            if (chartPie) chartPie.destroy();
            chartPie = new Chart(ctxPie, {
                type: 'pie',
                data: {
                    labels: ['Core Points', 'Border Points', 'Noise Outliers'],
                    datasets: [{
                        data: [cores, borders, noise],
                        backgroundColor: ['#34d399', '#60a5fa', '#f87171']
                    }]
                },
                options: { responsive: true }
            });
        }

        const ctxK = document.getElementById('chartKDistance');
        if (ctxK) {
            if (chartKDist) chartKDist.destroy();
            // Compute sorted 4th nearest neighbor distances
            const kDists = points.map((p1, i) => {
                const dists = points.map(p2 => Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)).sort((a, b) => a - b);
                return dists[Math.min(3, dists.length - 1)];
            }).sort((a, b) => a - b);

            chartKDist = new Chart(ctxK, {
                type: 'line',
                data: {
                    labels: kDists.map((_, i) => `${i + 1}`),
                    datasets: [{
                        label: '4th-NN Distance',
                        data: kDists.map(d => d.toFixed(1)),
                        borderColor: '#fbbf24',
                        backgroundColor: 'rgba(251, 191, 36, 0.15)',
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

    sliderEps.addEventListener('input', () => {
        valEps.textContent = `${sliderEps.value}px`;
        renderCanvas();
    });

    sliderMinPts.addEventListener('input', () => {
        valMinPts.textContent = sliderMinPts.value;
        renderCanvas();
    });

    checkCircles.addEventListener('change', renderCanvas);
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

    generateDataset('moons');
}

/* ═════════════════════════════════════════════════════════
   SECTION 6: INTERACTIVE LINE-BY-LINE CODE EXPLAINER
   ═════════════════════════════════════════════════════════ */
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
        { num: 2, text: 'from sklearn.cluster import DBSCAN', html: '<span class="code-keyword">from</span> sklearn.cluster <span class="code-keyword">import</span> DBSCAN' },
        { num: 3, text: 'class NumPyDBSCAN:', html: '<span class="code-keyword">class</span> <span class="code-func">NumPyDBSCAN</span>:' },
        { num: 4, text: '    def __init__(self, eps=0.5, min_samples=5):', html: '    <span class="code-keyword">def</span> <span class="code-func">__init__</span>(self, eps=<span class="code-num">0.5</span>, min_samples=<span class="code-num">5</span>):' },
        { num: 5, text: '        self.eps = eps', html: '        self.eps = eps' },
        { num: 6, text: '        self.min_samples = min_samples', html: '        self.min_samples = min_samples' },
        { num: 7, text: '        self.labels_ = None', html: '        self.labels_ = <span class="code-keyword">None</span>' },
        { num: 8, text: '    def _region_query(self, X, point_idx):', html: '    <span class="code-keyword">def</span> <span class="code-func">_region_query</span>(self, X, point_idx):' },
        { num: 9, text: '        distances = np.linalg.norm(X - X[point_idx], axis=1)', html: '        distances = np.linalg.norm(X - X[point_idx], axis=<span class="code-num">1</span>)' },
        { num: 10, text: '        return np.where(distances <= self.eps)[0]', html: '        <span class="code-keyword">return</span> np.where(distances <= self.eps)[<span class="code-num">0</span>]' },
        { num: 11, text: '    def fit(self, X):', html: '    <span class="code-keyword">def</span> <span class="code-func">fit</span>(self, X):' },
        { num: 12, text: '        N = X.shape[0]', html: '        N = X.shape[<span class="code-num">0</span>]' },
        { num: 13, text: '        self.labels_ = np.full(N, -1)', html: '        self.labels_ = np.full(N, -<span class="code-num">1</span>)' },
        { num: 14, text: '        cluster_id = 0', html: '        cluster_id = <span class="code-num">0</span>' },
        { num: 15, text: '        visited = np.zeros(N, dtype=bool)', html: '        visited = np.zeros(N, dtype=bool)' },
        { num: 16, text: '        for i in range(N):', html: '        <span class="code-keyword">for</span> i <span class="code-keyword">in</span> range(N):' },
        { num: 17, text: '            if visited[i]: continue', html: '            <span class="code-keyword">if</span> visited[i]: <span class="code-keyword">continue</span>' },
        { num: 18, text: '            visited[i] = True', html: '            visited[i] = <span class="code-keyword">True</span>' },
        { num: 19, text: '            neighbors = self._region_query(X, i)', html: '            neighbors = self._region_query(X, i)' },
        { num: 20, text: '            if len(neighbors) >= self.min_samples:', html: '            <span class="code-keyword">if</span> len(neighbors) >= self.min_samples:' },
        { num: 21, text: '                cluster_id += 1', html: '                cluster_id += <span class="code-num">1</span>' },
        { num: 22, text: '                self._expand_cluster(X, i, neighbors, cluster_id, visited)', html: '                self._expand_cluster(X, i, neighbors, cluster_id, visited)' }
    ];

    const CODE_EXPLANATIONS = {
        1: { title: "Import NumPy Library", text: "Imports NumPy for vectorized distance norm calculations and array indexing.", math: "\\text{NumPy } \\to \\mathbb{R}^{N \\times P}" },
        2: { title: "Import Production DBSCAN Model", text: "Imports Scikit-Learn's production DBSCAN estimator for benchmark comparisons.", math: "\\text{sklearn.cluster.DBSCAN}" },
        3: { title: "DBSCAN Class Definition", text: "Encapsulates density region queries and BFS cluster expansion logic.", math: "\\mathcal{M}_{\\text{DBSCAN}}(\\varepsilon, \\text{MinPts})" },
        4: { title: "DBSCAN Constructor Parameters", text: "Defines Epsilon neighborhood radius (eps) and minimum point threshold (min_samples).", math: "\\varepsilon = 0.5, \\quad \\text{MinPts} = 5" },
        5: { title: "Store Epsilon Radius", text: "Sets neighborhood search radius parameter.", math: "\\varepsilon" },
        6: { title: "Store MinPts Threshold", text: "Sets minimum density threshold required to classify a Core Point.", math: "\\text{MinPts}" },
        7: { title: "Initialize Label Array", text: "Allocates cluster label storage array.", math: "\\mathbf{y}_{\\text{labels}} = \\text{None}" },
        8: { title: "Region Query Method", text: "Finds all point indices within Epsilon radius distance of target point p.", math: "N_\\varepsilon(p) = \\{q \\mid d(p, q) \\le \\varepsilon\\}" },
        9: { title: "Compute Vectorized Distances", text: "Evaluates Euclidean norm ||X - X[p]||2 across all N dataset samples simultaneously.", math: "d(p, q) = \\sqrt{\\sum_k (X_{p,k} - X_{q,k})^2}" },
        10: { title: "Return Neighbor Indices Array", text: "Returns array of point indices satisfying the Epsilon distance constraint.", math: "N_\\varepsilon(p)" },
        11: { title: "Fit Density Model Method", text: "Main loop iterating through unvisited data points to discover density clusters.", math: "\\text{fit}(X)" },
        12: { title: "Get Sample Count N", text: "Retrieves total number of points N in feature matrix X.", math: "N = |\\mathcal{D}|" },
        13: { title: "Initialize Cluster Labels to Noise (-1)", text: "Pre-fills label array with -1 (Noise / Outlier label default).", math: "\\mathbf{y} = [-1, -1, \\dots, -1]" },
        14: { title: "Initialize Cluster Counter", text: "Sets starting cluster identifier integer to 0.", math: "\\text{cluster\\_id} = 0" },
        15: { title: "Initialize Visited Tracker", text: "Allocates boolean array tracking processed data points.", math: "\\text{visited} \\in \\{\\text{False}\\}^N" },
        16: { title: "Iterate Over All N Points", text: "Loops through every point in dataset D.", math: "i = 0, 1, \\dots, N-1" },
        17: { title: "Skip Processed Points", text: "Skips loop execution if point i was already visited.", math: "\\text{if visited}[i]: \\text{continue}" },
        18: { title: "Mark Point as Visited", text: "Flags point i as processed.", math: "\\text{visited}[i] = \\text{True}" },
        19: { title: "Execute Region Query", text: "Retrieves all neighbor indices within Epsilon radius of point i.", math: "N_\\varepsilon(i)" },
        20: { title: "Check Core Point Condition", text: "Evaluates whether neighbor count meets or exceeds MinPts threshold.", math: "|N_\\varepsilon(i)| \\ge \\text{MinPts}" },
        21: { title: "Increment Cluster ID", text: "Spawns a new cluster identifier integer.", math: "\\text{cluster\\_id} \\leftarrow \\text{cluster\\_id} + 1" },
        22: { title: "Expand Density Cluster BFS", text: "Recursively expands cluster boundary to all density-reachable points.", math: "\\text{expand\\_cluster}(i, N_\\varepsilon(i), \\text{cluster\\_id})" }
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
                    <span style="font-family:var(--font-mono); font-size:0.78rem; font-weight:700; color:#fbbf24; letter-spacing:0.05em; text-transform:uppercase;">💡 INTERACTIVE LINE-BY-LINE CODE INSPECTOR</span>
                    <span style="font-size:0.78rem; font-weight:600; color:${isLocked ? '#f472b6' : 'var(--text-secondary)'}; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); padding:0.25rem 0.75rem; border-radius:50px;">
                        ${isLocked ? '📌 Line Locked – Click another line or click again to unlock' : '💡 Hovering Line – Click line to lock inspection'}
                    </span>
                </div>

                <div style="margin-bottom:0.75rem;">
                    <span style="background:${isLocked ? 'rgba(244,114,182,0.15)' : 'rgba(251,191,36,0.15)'}; color:${isLocked ? '#f472b6' : '#fbbf24'}; border:1px solid ${isLocked ? 'rgba(244,114,182,0.3)' : 'rgba(251,191,36,0.3)'}; padding:0.25rem 0.75rem; border-radius:50px; font-size:0.8rem; font-weight:700; font-family:var(--font-mono); display:inline-block;">
                        📌 Line ${selectedLine} ${isLocked ? '(Locked)' : '(Hover preview)'}
                    </span>
                </div>

                <h3 style="font-size:1.25rem; font-weight:700; color:#ffffff; margin:0.5rem 0 1rem 0;">${info.title}</h3>

                <div style="margin-bottom:0.85rem;">
                    <div style="font-weight:700; color:#fbbf24; font-size:0.88rem; margin-bottom:0.35rem; display:flex; align-items:center; gap:0.4rem;">
                        <span>🔍</span> <span>What This Line Does:</span>
                    </div>
                    <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.65; margin:0;">
                        ${info.text}
                    </p>
                </div>

                <div style="margin-bottom:1rem;">
                    <div style="font-weight:700; color:#34d399; font-size:0.88rem; margin-bottom:0.35rem; display:flex; align-items:center; gap:0.4rem;">
                        <span>⚡</span> <span>Why It Is Used:</span>
                    </div>
                    <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.65; margin:0;">
                        ${info.why || 'Discovers spatial density clusters of any arbitrary geometry while filtering noise (-1).'}
                    </p>
                </div>

                ${info.math ? `
                <div style="background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:1rem 1.25rem; margin-top:1rem;">
                    <div style="font-weight:700; color:#a78bfa; font-size:0.85rem; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.4rem;">
                        <span>📐</span> <span>Math Formulation:</span>
                    </div>
                    <div style="margin:0; padding:0; background:transparent; border:none; text-align:center; font-size:1rem; color:#fbbf24;">
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
            else if (step === 'step3') targetLine = 22;
            else if (step === 'step4') targetLine = 13;

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
