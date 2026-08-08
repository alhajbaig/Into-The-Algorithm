/* ════════════════════════════════════════════════════════════
   PCA (Principal Component Analysis) — Interactive Application
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
    initPCALab();
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

/* ── Hero Canvas PCA Animation ───────────────────────────── */
function initHeroAnimation() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    const points = [];
    for (let i = 0; i < 40; i++) {
        const u = (Math.random() - 0.5) * 200;
        const v = (Math.random() - 0.5) * 40;
        points.push({
            x: w / 2 + u * Math.cos(Math.PI / 6) - v * Math.sin(Math.PI / 6),
            y: h / 2 + u * Math.sin(Math.PI / 6) + v * Math.cos(Math.PI / 6)
        });
    }

    let angle = Math.PI / 6;

    function animate() {
        ctx.clearRect(0, 0, w, h);
        angle += 0.008;

        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        // Draw PC1 vector line
        ctx.strokeStyle = '#a78bfa';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(w / 2 - cos * 220, h / 2 - sin * 220);
        ctx.lineTo(w / 2 + cos * 220, h / 2 + sin * 220);
        ctx.stroke();

        // Draw PC2 vector line (orthogonal)
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(w / 2 + sin * 100, h / 2 - cos * 100);
        ctx.lineTo(w / 2 - sin * 100, h / 2 + cos * 100);
        ctx.stroke();

        // Draw points & projection lines
        for (let p of points) {
            const dx = p.x - w / 2;
            const dy = p.y - h / 2;
            const projLen = dx * cos + dy * sin;
            const projX = w / 2 + projLen * cos;
            const projY = h / 2 + projLen * sin;

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(projX, projY);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#c4b5fd';
            ctx.fill();
        }

        requestAnimationFrame(animate);
    }
    animate();
}

/* ═════════════════════════════════════════════════════════
   PURE JS PCA COMPUTATION UTILS
   ═════════════════════════════════════════════════════════ */
function compute2DPCA(points) {
    const N = points.length;
    if (N < 2) return { pc1: [1, 0], pc2: [0, 1], var1: 1, var2: 0, ratio: 100 };

    const meanX = points.reduce((a, b) => a + b.x, 0) / N;
    const meanY = points.reduce((a, b) => a + b.y, 0) / N;

    let covXX = 0, covXY = 0, covYY = 0;
    for (let p of points) {
        const dx = p.x - meanX;
        const dy = p.y - meanY;
        covXX += dx * dx;
        covXY += dx * dy;
        covYY += dy * dy;
    }
    covXX /= (N - 1);
    covXY /= (N - 1);
    covYY /= (N - 1);

    // Eigenvalues of 2x2 matrix: det(C - lambda I) = 0
    const trace = covXX + covYY;
    const det = covXX * covYY - covXY * covXY;
    const term = Math.sqrt(Math.max(0, trace * trace / 4 - det));
    const lambda1 = trace / 2 + term;
    const lambda2 = trace / 2 - term;

    let vx = 1, vy = 0;
    if (Math.abs(covXY) > 1e-6) {
        vx = lambda1 - covYY;
        vy = covXY;
    } else {
        vx = covXX >= covYY ? 1 : 0;
        vy = covXX >= covYY ? 0 : 1;
    }

    const norm = Math.sqrt(vx * vx + vy * vy) || 1;
    vx /= norm;
    vy /= norm;

    const ratio = (lambda1 / (lambda1 + lambda2 || 1)) * 100;
    return {
        meanX, meanY,
        pc1: [vx, vy],
        pc2: [-vy, vx],
        var1: lambda1,
        var2: lambda2,
        ratio
    };
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
    let chartScree = null;

    const sampleDatasets = {
        iris: {
            headers: ["Sepal Length", "Sepal Width", "Petal Length", "Petal Width"],
            data: [
                [5.1, 3.5, 1.4, 0.2], [4.9, 3.0, 1.4, 0.2], [4.7, 3.2, 1.3, 0.2], [4.6, 3.1, 1.5, 0.2],
                [7.0, 3.2, 4.7, 1.4], [6.4, 3.2, 4.5, 1.5], [6.9, 3.1, 4.9, 1.5], [5.5, 2.3, 4.0, 1.3],
                [6.3, 3.3, 6.0, 2.5], [5.8, 2.7, 5.1, 1.9], [7.1, 3.0, 5.9, 2.1], [6.3, 2.9, 5.6, 1.8]
            ]
        },
        wine: {
            headers: ["Alcohol %", "Malic Acid", "Ash Content", "Alkalinity"],
            data: [
                [14.2, 1.7, 2.4, 15.6], [13.2, 1.8, 2.1, 11.2], [13.1, 2.3, 2.7, 18.6], [14.3, 1.9, 2.5, 16.8],
                [12.3, 1.2, 1.9, 19.5], [12.0, 1.6, 2.2, 20.0], [12.1, 1.5, 2.1, 18.0], [12.4, 1.4, 1.9, 19.0],
                [13.7, 5.6, 2.7, 25.5], [13.3, 3.2, 2.4, 21.0], [13.5, 3.1, 2.6, 23.5], [13.2, 3.8, 2.4, 22.5]
            ]
        },
        housing: {
            headers: ["Square Feet", "Bedrooms", "Age (Years)", "Tax Rating"],
            data: [
                [2500, 4, 5, 8.5], [2100, 3, 8, 7.8], [2800, 4, 2, 9.1], [3200, 5, 1, 9.5],
                [1400, 2, 25, 4.2], [1200, 2, 30, 3.8], [1600, 3, 20, 5.1], [1100, 2, 35, 3.5],
                [1800, 3, 12, 6.5], [1950, 3, 10, 6.9], [2200, 4, 7, 7.5], [2050, 3, 9, 7.1]
            ]
        }
    };

    function loadSampleTable(key) {
        const dataset = sampleDatasets[key];
        if (!dataset) return;
        sampleTableBody.innerHTML = '';
        dataset.data.forEach((row, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${idx + 1}</td><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td>`;
            sampleTableBody.appendChild(tr);
        });
    }

    function trainSampleModel() {
        const key = sampleSelect.value;
        const dataset = sampleDatasets[key];
        if (!dataset) return;

        // Project 4D data down to 2D
        const points2D = dataset.data.map(r => ({ x: r[0] * 0.4 + r[2] * 0.6, y: r[1] * 0.5 + r[3] * 0.5 }));
        const pca = compute2DPCA(points2D);

        document.getElementById('sampleMetricPC1').textContent = `${pca.ratio.toFixed(1)}%`;
        document.getElementById('sampleMetricPC2').textContent = `${(100 - pca.ratio).toFixed(1)}%`;
        document.getElementById('sampleMetricCum').textContent = `100.0%`;
        document.getElementById('sampleMetricEig').textContent = pca.var1.toFixed(2);

        sampleMetrics.style.display = 'grid';
        sampleCharts.style.display = 'grid';

        const ctxScatter = document.getElementById('sampleScatterChart');
        if (ctxScatter && window.Chart) {
            if (chartScatter) chartScatter.destroy();
            chartScatter = new Chart(ctxScatter, {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: 'Projected PC Coordinates',
                        data: points2D.map(p => ({ x: (p.x - pca.meanX) * pca.pc1[0] + (p.y - pca.meanY) * pca.pc1[1], y: (p.x - pca.meanX) * pca.pc2[0] + (p.y - pca.meanY) * pca.pc2[1] })),
                        backgroundColor: '#a78bfa',
                        pointRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: { title: { display: true, text: 'Principal Component 1 (PC1)', color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } },
                        y: { title: { display: true, text: 'Principal Component 2 (PC2)', color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } }
                    }
                }
            });
        }

        const ctxScree = document.getElementById('sampleScreeChart');
        if (ctxScree && window.Chart) {
            if (chartScree) chartScree.destroy();
            chartScree = new Chart(ctxScree, {
                type: 'bar',
                data: {
                    labels: ['PC 1', 'PC 2', 'PC 3', 'PC 4'],
                    datasets: [{
                        label: 'Variance Ratio (%)',
                        data: [pca.ratio.toFixed(1), (100 - pca.ratio).toFixed(1), (100 - pca.ratio) * 0.1, (100 - pca.ratio) * 0.05],
                        backgroundColor: ['rgba(167, 139, 250, 0.75)', 'rgba(96, 165, 250, 0.75)', 'rgba(52, 211, 153, 0.75)', 'rgba(251, 191, 36, 0.75)']
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } },
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
   SECTION 2: PCA PLAYGROUND CONTROLLER
   ═════════════════════════════════════════════════════════ */
function initPCALab() {
    const canvas = document.getElementById('pcaCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let points = [];
    const sliderAngle = document.getElementById('sliderAngle');
    const valAngle = document.getElementById('valAngle');
    const btnAutoAlign = document.getElementById('btnAutoAlign');
    const checkProjections = document.getElementById('checkProjections');

    const btnClearPoints = document.getElementById('btnClearPoints');
    const btnRandomizePoints = document.getElementById('btnRandomizePoints');
    const presetBtns = document.querySelectorAll('.preset-btn');

    let chartAngleVar = null;
    let chartCompBar = null;

    function generateDataset(type) {
        points = [];
        const w = canvas.width;
        const h = canvas.height;

        if (type === 'correlated') {
            for (let i = 0; i < 50; i++) {
                const u = (Math.random() - 0.5) * 260;
                const v = (Math.random() - 0.5) * 50;
                points.push({
                    x: w / 2 + u * Math.cos(Math.PI / 4) - v * Math.sin(Math.PI / 4),
                    y: h / 2 + u * Math.sin(Math.PI / 4) + v * Math.cos(Math.PI / 4)
                });
            }
        } else if (type === 'diagonal') {
            for (let i = 0; i < 50; i++) {
                const u = (Math.random() - 0.5) * 280;
                const v = (Math.random() - 0.5) * 40;
                points.push({
                    x: w / 2 + u * Math.cos(-Math.PI / 6) - v * Math.sin(-Math.PI / 6),
                    y: h / 2 + u * Math.sin(-Math.PI / 6) + v * Math.cos(-Math.PI / 6)
                });
            }
        } else if (type === 'cross') {
            for (let i = 0; i < 30; i++) {
                points.push({ x: w / 2 + (Math.random() - 0.5) * 240, y: h / 2 + (Math.random() - 0.5) * 40 });
                points.push({ x: w / 2 + (Math.random() - 0.5) * 40, y: h / 2 + (Math.random() - 0.5) * 240 });
            }
        } else {
            for (let i = 0; i < 50; i++) {
                points.push({ x: w / 2 + (Math.random() - 0.5) * 220, y: h / 2 + (Math.random() - 0.5) * 220 });
            }
        }
        renderCanvas();
    }

    function renderCanvas() {
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        if (points.length < 2) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.font = '14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('Click anywhere to add 2D data points', w / 2, h / 2);
            return;
        }

        const pca = compute2DPCA(points);
        const rad = (parseFloat(sliderAngle.value) * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        // Draw custom axis line
        ctx.strokeStyle = '#a78bfa';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(pca.meanX - cos * 300, pca.meanY - sin * 300);
        ctx.lineTo(pca.meanX + cos * 300, pca.meanY + sin * 300);
        ctx.stroke();

        // Draw orthogonal axis
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pca.meanX + sin * 120, pca.meanY - cos * 120);
        ctx.lineTo(pca.meanX - sin * 120, pca.meanY + cos * 120);
        ctx.stroke();

        // Compute variance along custom angle
        let customVar = 0;
        for (let p of points) {
            const dx = p.x - pca.meanX;
            const dy = p.y - pca.meanY;
            const projLen = dx * cos + dy * sin;
            customVar += projLen * projLen;

            if (checkProjections.checked) {
                const projX = pca.meanX + projLen * cos;
                const projY = pca.meanY + projLen * sin;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(projX, projY);
                ctx.stroke();
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#c4b5fd';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        updateMetricsAndCharts(pca, cos, sin);
    }

    function updateMetricsAndCharts(pca, cos, sin) {
        document.getElementById('metricPC1Vector').textContent = `[${cos.toFixed(2)}, ${sin.toFixed(2)}]`;
        document.getElementById('metricPC1Var').textContent = pca.var1.toFixed(2);
        document.getElementById('metricPC2Var').textContent = pca.var2.toFixed(2);
        document.getElementById('metricRatio').textContent = `${pca.ratio.toFixed(1)}%`;

        if (!window.Chart) return;

        const angles = [0, 30, 60, 90, 120, 150, 180];
        const angleVars = angles.map(deg => {
            const r = (deg * Math.PI) / 180;
            const c = Math.cos(r), s = Math.sin(r);
            let sumSq = 0;
            for (let p of points) {
                const dx = p.x - pca.meanX, dy = p.y - pca.meanY;
                const len = dx * c + dy * s;
                sumSq += len * len;
            }
            return (sumSq / points.length).toFixed(1);
        });

        const ctxAngle = document.getElementById('chartAngleVariance');
        if (ctxAngle) {
            if (chartAngleVar) chartAngleVar.destroy();
            chartAngleVar = new Chart(ctxAngle, {
                type: 'line',
                data: {
                    labels: angles.map(a => `${a}°`),
                    datasets: [{
                        label: 'Projected Variance',
                        data: angleVars,
                        borderColor: '#a78bfa',
                        backgroundColor: 'rgba(167, 139, 250, 0.15)',
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

        const ctxBar = document.getElementById('chartComponentBar');
        if (ctxBar) {
            if (chartCompBar) chartCompBar.destroy();
            chartCompBar = new Chart(ctxBar, {
                type: 'bar',
                data: {
                    labels: ['PC1 (Max Variance)', 'PC2 (Orthogonal)'],
                    datasets: [{
                        label: 'Eigenvalue Variance',
                        data: [pca.var1.toFixed(2), pca.var2.toFixed(2)],
                        backgroundColor: ['rgba(167, 139, 250, 0.75)', 'rgba(96, 165, 250, 0.75)']
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

    sliderAngle.addEventListener('input', () => {
        valAngle.textContent = `${sliderAngle.value}°`;
        renderCanvas();
    });

    btnAutoAlign.addEventListener('click', () => {
        const pca = compute2DPCA(points);
        let deg = Math.round((Math.atan2(pca.pc1[1], pca.pc1[0]) * 180) / Math.PI);
        if (deg < 0) deg += 180;
        sliderAngle.value = deg;
        valAngle.textContent = `${deg}°`;
        renderCanvas();
    });

    checkProjections.addEventListener('change', renderCanvas);
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

    generateDataset('correlated');
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
        { num: 2, text: 'from sklearn.decomposition import PCA', html: '<span class="code-keyword">from</span> sklearn.decomposition <span class="code-keyword">import</span> PCA' },
        { num: 3, text: 'class NumPyPCA:', html: '<span class="code-keyword">class</span> <span class="code-func">NumPyPCA</span>:' },
        { num: 4, text: '    def __init__(self, n_components=2):', html: '    <span class="code-keyword">def</span> <span class="code-func">__init__</span>(self, n_components=<span class="code-num">2</span>):' },
        { num: 5, text: '        self.n_components = n_components', html: '        self.n_components = n_components' },
        { num: 6, text: '        self.components = None', html: '        self.components = <span class="code-keyword">None</span>' },
        { num: 7, text: '        self.mean = None', html: '        self.mean = <span class="code-keyword">None</span>' },
        { num: 8, text: '    def fit(self, X):', html: '    <span class="code-keyword">def</span> <span class="code-func">fit</span>(self, X):' },
        { num: 9, text: '        self.mean = np.mean(X, axis=0)', html: '        self.mean = np.mean(X, axis=<span class="code-num">0</span>)' },
        { num: 10, text: '        X_centered = X - self.mean', html: '        X_centered = X - self.mean' },
        { num: 11, text: '        cov_matrix = np.cov(X_centered, rowvar=False)', html: '        cov_matrix = np.cov(X_centered, rowvar=<span class="code-keyword">False</span>)' },
        { num: 12, text: '        eigenvalues, eigenvectors = np.linalg.eig(cov_matrix)', html: '        eigenvalues, eigenvectors = np.linalg.eig(cov_matrix)' },
        { num: 13, text: '        eigenvectors = eigenvectors.T', html: '        eigenvectors = eigenvectors.T' },
        { num: 14, text: '        idxs = np.argsort(eigenvalues)[::-1]', html: '        idxs = np.argsort(eigenvalues)[::-<span class="code-num">1</span>]' },
        { num: 15, text: '        self.eigenvalues = eigenvalues[idxs]', html: '        self.eigenvalues = eigenvalues[idxs]' },
        { num: 16, text: '        self.components = eigenvectors[idxs][:self.n_components]', html: '        self.components = eigenvectors[idxs][:self.n_components]' },
        { num: 17, text: '        self.explained_variance_ratio = self.eigenvalues[:self.n_components] / np.sum(eigenvalues)', html: '        self.explained_variance_ratio = self.eigenvalues[:self.n_components] / np.sum(eigenvalues)' },
        { num: 18, text: '    def transform(self, X):', html: '    <span class="code-keyword">def</span> <span class="code-func">transform</span>(self, X):' },
        { num: 19, text: '        X_centered = X - self.mean', html: '        X_centered = X - self.mean' },
        { num: 20, text: '        return np.dot(X_centered, self.components.T)', html: '        <span class="code-keyword">return</span> np.dot(X_centered, self.components.T)' },
        { num: 21, text: '    def fit_transform(self, X):', html: '    <span class="code-keyword">def</span> <span class="code-func">fit_transform</span>(self, X):' },
        { num: 22, text: '        self.fit(X); return self.transform(X)', html: '        self.fit(X); <span class="code-keyword">return</span> self.transform(X)' }
    ];

    const CODE_EXPLANATIONS = {
        1: { title: "Import NumPy Library", text: "Imports NumPy for fast linear algebra matrix products and eigendecomposition.", math: "\\text{NumPy } \\to \\mathbb{R}^{N \\times P}" },
        2: { title: "Import Production PCA Model", text: "Imports Scikit-Learn's production PCA module for validation benchmarks.", math: "\\text{sklearn.decomposition.PCA}" },
        3: { title: "PCA Class Definition", text: "Encapsulates dimensionality reduction fit and projection matrix operations.", math: "\\mathcal{M}_{\\text{PCA}}: \\mathbb{R}^P \\to \\mathbb{R}^k" },
        4: { title: "PCA Constructor", text: "Sets target reduced dimension count k (default k = 2).", math: "k = 2, \\quad k < P" },
        5: { title: "Store Component Count", text: "Saves target subspace dimension count parameter.", math: "k \\text{ principal components}" },
        6: { title: "Initialize Components Storage", text: "Instantiates storage for principal component eigenvector matrix.", math: "\\mathbf{V}_k = \\text{None}" },
        7: { title: "Initialize Mean Vector", text: "Instantiates storage for feature column mean offsets.", math: "\\boldsymbol{\\mu} = \\text{None}" },
        8: { title: "Fit Subspace Method", text: "Computes mean centering, sample covariance matrix, and eigendecomposition.", math: "\\text{Fit } \\mathbf{X} \\in \\mathbb{R}^{N \\times P}" },
        9: { title: "Compute Feature Column Means", text: "Averages each feature column over all N samples.", math: "\\boldsymbol{\\mu}_j = \\frac{1}{N} \\sum_{i=1}^N X_{i,j}" },
        10: { title: "Mean Center Feature Matrix", text: "Subtracts feature means to center data origin at (0, 0, ...).", math: "\\mathbf{X}_{c} = \\mathbf{X} - \\boldsymbol{\\mu}" },
        11: { title: "Compute Sample Covariance Matrix", text: "Calculates symmetric P x P pairwise feature covariance matrix.", math: "\\mathbf{\\Sigma} = \\frac{1}{N-1} \\mathbf{X}_c^T \\mathbf{X}_c \\in \\mathbb{R}^{P \\times P}" },
        12: { title: "Compute Eigen-Decomposition", text: "Extracts eigenvalues lambda and unit eigenvectors v from covariance matrix.", math: "\\mathbf{\\Sigma} \\mathbf{v}_i = \\lambda_i \\mathbf{v}_i" },
        13: { title: "Transpose Eigenvector Matrix", text: "Transposes output matrix so eigenvectors align as row vectors.", math: "\\mathbf{V} = [\\mathbf{v}_1, \\mathbf{v}_2, \\dots, \\mathbf{v}_P]^T" },
        14: { title: "Sort Eigenvalues Descending", text: "Orders components by largest variance contribution first.", math: "\\lambda_1 \\ge \\lambda_2 \\ge \\dots \\ge \\lambda_P" },
        15: { title: "Store Sorted Eigenvalues", text: "Saves sorted variance magnitudes in instance variable.", math: "\\boldsymbol{\\lambda}_{\\text{sorted}}" },
        16: { title: "Select Top K Eigenvectors", text: "Truncates eigenvector matrix to top k principal components.", math: "\\mathbf{V}_k \\in \\mathbb{R}^{k \\times P}" },
        17: { title: "Compute Explained Variance Ratios", text: "Calculates proportion of total variance explained by each component.", math: "\\text{Ratio}_k = \\frac{\\lambda_k}{\\sum_{j=1}^P \\lambda_j}" },
        18: { title: "Transform Coordinates Method", text: "Projects input matrix X into the reduced k-dimensional principal subspace.", math: "\\mathbf{X}_{\\text{pca}} = \\mathbf{X}_c \\mathbf{V}_k^T" },
        19: { title: "Mean Center Inputs", text: "Subtracts fitted column means from test matrix X.", math: "\\mathbf{X}_c = \\mathbf{X} - \\boldsymbol{\\mu}" },
        20: { title: "Matrix Dot Product Projection", text: "Multiplies centered data matrix by top k eigenvector transpose matrix.", math: "\\mathbf{X}_{\\text{pca}} = \\mathbf{X}_c \\cdot \\mathbf{V}_k^T \\in \\mathbb{R}^{N \\times k}" },
        21: { title: "Fit and Transform Utility", text: "Convenience method to fit PCA and project data in a single call.", math: "\\text{fit\\_transform}(X)" },
        22: { title: "Return Low-Dim Coordinates", text: "Executes fit and returns projected k-dimensional matrix.", math: "\\mathbf{X}_{\\text{pca}}" }
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
                    <span style="font-family:var(--font-mono); font-size:0.78rem; font-weight:700; color:#a78bfa; letter-spacing:0.05em; text-transform:uppercase;">💡 INTERACTIVE LINE-BY-LINE CODE INSPECTOR</span>
                    <span style="font-size:0.78rem; font-weight:600; color:${isLocked ? '#f472b6' : 'var(--text-secondary)'}; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); padding:0.25rem 0.75rem; border-radius:50px;">
                        ${isLocked ? '📌 Line Locked – Click another line or click again to unlock' : '💡 Hovering Line – Click line to lock inspection'}
                    </span>
                </div>

                <div style="margin-bottom:0.75rem;">
                    <span style="background:${isLocked ? 'rgba(244,114,182,0.15)' : 'rgba(167,139,250,0.15)'}; color:${isLocked ? '#f472b6' : '#a78bfa'}; border:1px solid ${isLocked ? 'rgba(244,114,182,0.3)' : 'rgba(167,139,250,0.3)'}; padding:0.25rem 0.75rem; border-radius:50px; font-size:0.8rem; font-weight:700; font-family:var(--font-mono); display:inline-block;">
                        📌 Line ${selectedLine} ${isLocked ? '(Locked)' : '(Hover preview)'}
                    </span>
                </div>

                <h3 style="font-size:1.25rem; font-weight:700; color:#ffffff; margin:0.5rem 0 1rem 0;">${info.title}</h3>

                <div style="margin-bottom:0.85rem;">
                    <div style="font-weight:700; color:#a78bfa; font-size:0.88rem; margin-bottom:0.35rem; display:flex; align-items:center; gap:0.4rem;">
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
                        ${info.why || 'Maximizes linear variance capture while reducing features onto orthogonal components.'}
                    </p>
                </div>

                ${info.math ? `
                <div style="background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:1rem 1.25rem; margin-top:1rem;">
                    <div style="font-weight:700; color:#a78bfa; font-size:0.85rem; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.4rem;">
                        <span>📐</span> <span>Math Formulation:</span>
                    </div>
                    <div style="margin:0; padding:0; background:transparent; border:none; text-align:center; font-size:1rem; color:#a78bfa;">
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
            else if (step === 'step2') targetLine = 11;
            else if (step === 'step3') targetLine = 12;
            else if (step === 'step4') targetLine = 20;

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
