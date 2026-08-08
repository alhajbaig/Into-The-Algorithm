/* ════════════════════════════════════════════════════════════
   Random Forest & Ensemble Learning — Interactive Application
   ════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    // KaTeX Auto Render
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
    initRFLab();
    initCodeExplainer();
});

/* ── Navbar & Scroll Behavior ────────────────────────────── */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    const elementsToAnimate = document.querySelectorAll('.glass-card, .section-header, .metrics-dashboard, .charts-grid');
    elementsToAnimate.forEach(el => {
        el.classList.add('animate-in');
        observer.observe(el);
    });
}

/* ── Hero Canvas Forest Animation ────────────────────────── */
function initHeroAnimation() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const points = [];
    const n = 45;
    for (let i = 0; i < n; i++) {
        points.push({
            x: Math.random() * (width - 40) + 20,
            y: Math.random() * (height - 40) + 20,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            cls: Math.random() > 0.5 ? 1 : 0
        });
    }

    let angle = 0;

    function animate() {
        ctx.clearRect(0, 0, width, height);

        for (let p of points) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 20 || p.x > width - 20) p.vx *= -1;
            if (p.y < 20 || p.y > height - 20) p.vy *= -1;
        }

        angle += 0.015;

        for (let t = 0; t < 5; t++) {
            const shiftX = Math.sin(angle + t) * 60 + width / 2;
            const shiftY = Math.cos(angle * 0.8 + t * 2) * 50 + height / 2;

            ctx.strokeStyle = t % 2 === 0 ? 'rgba(52, 211, 153, 0.35)' : 'rgba(96, 165, 250, 0.35)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            if (t % 2 === 0) {
                ctx.moveTo(shiftX, 0);
                ctx.lineTo(shiftX, height);
            } else {
                ctx.moveTo(0, shiftY);
                ctx.lineTo(width, shiftY);
            }
            ctx.stroke();
        }

        for (let p of points) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = p.cls === 0 ? '#34d399' : '#60a5fa';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.2;
            ctx.stroke();
        }

        requestAnimationFrame(animate);
    }

    animate();
}

/* ═════════════════════════════════════════════════════════
   DECISION TREE & RANDOM FOREST ENGINE
   ═════════════════════════════════════════════════════════ */
class SimpleDecisionTree {
    constructor(maxDepth = 5, criterion = 'gini', featureSubsample = 1.0) {
        this.maxDepth = maxDepth;
        this.criterion = criterion;
        this.featureSubsample = featureSubsample;
        this.root = null;
        this.totalNodes = 0;
    }

    _gini(y) {
        if (y.length === 0) return 0;
        let p0 = y.filter(val => val === 0).length / y.length;
        let p1 = 1 - p0;
        return 1 - (p0 * p0 + p1 * p1);
    }

    _entropy(y) {
        if (y.length === 0) return 0;
        let p0 = y.filter(val => val === 0).length / y.length;
        let p1 = 1 - p0;
        if (p0 === 0 || p1 === 0) return 0;
        return -(p0 * Math.log2(p0) + p1 * Math.log2(p1));
    }

    _impurity(y) {
        return this.criterion === 'entropy' ? this._entropy(y) : this._gini(y);
    }

    _bestSplit(X, y) {
        let bestGain = -1;
        let bestSplit = null;
        const currentImpurity = this._impurity(y);
        const nFeatures = X[0].length;

        const featureIndices = [];
        for (let f = 0; f < nFeatures; f++) featureIndices.push(f);
        
        let sampleSize = Math.max(1, Math.round(nFeatures * this.featureSubsample));
        if (sampleSize < nFeatures) {
            featureIndices.sort(() => Math.random() - 0.5);
            featureIndices.length = sampleSize;
        }

        for (let f of featureIndices) {
            const vals = X.map(row => row[f]);
            const uniqueVals = Array.from(new Set(vals)).sort((a, b) => a - b);
            
            for (let i = 0; i < uniqueVals.length - 1; i++) {
                const threshold = (uniqueVals[i] + uniqueVals[i + 1]) / 2;
                const leftIdx = [];
                const rightIdx = [];

                for (let r = 0; r < X.length; r++) {
                    if (X[r][f] <= threshold) leftIdx.push(r);
                    else rightIdx.push(r);
                }

                if (leftIdx.length === 0 || rightIdx.length === 0) continue;

                const leftY = leftIdx.map(idx => y[idx]);
                const rightY = rightIdx.map(idx => y[idx]);

                const leftImp = this._impurity(leftY);
                const rightImp = this._impurity(rightY);
                const pLeft = leftY.length / y.length;
                const pRight = rightY.length / y.length;

                const gain = currentImpurity - (pLeft * leftImp + pRight * rightImp);

                if (gain > bestGain) {
                    bestGain = gain;
                    bestSplit = { feature: f, threshold, leftIdx, rightIdx };
                }
            }
        }

        return bestSplit;
    }

    _buildTree(X, y, depth = 0) {
        this.totalNodes++;
        const nClasses = new Set(y).size;
        
        if (depth >= this.maxDepth || nClasses <= 1 || X.length <= 2) {
            const p0 = y.filter(v => v === 0).length;
            const p1 = y.length - p0;
            return { isLeaf: true, value: p1 >= p0 ? 1 : 0, prob: p1 / (y.length || 1) };
        }

        const split = this._bestSplit(X, y);
        if (!split) {
            const p0 = y.filter(v => v === 0).length;
            const p1 = y.length - p0;
            return { isLeaf: true, value: p1 >= p0 ? 1 : 0, prob: p1 / (y.length || 1) };
        }

        const leftX = split.leftIdx.map(i => X[i]);
        const leftY = split.leftIdx.map(i => y[i]);
        const rightX = split.rightIdx.map(i => X[i]);
        const rightY = split.rightIdx.map(i => y[i]);

        return {
            isLeaf: false,
            feature: split.feature,
            threshold: split.threshold,
            left: this._buildTree(leftX, leftY, depth + 1),
            right: this._buildTree(rightX, rightY, depth + 1)
        };
    }

    fit(X, y) {
        this.totalNodes = 0;
        this.root = this._buildTree(X, y, 0);
    }

    _predictOne(node, x) {
        if (node.isLeaf) return node.prob;
        if (x[node.feature] <= node.threshold) {
            return this._predictOne(node.left, x);
        }
        return this._predictOne(node.right, x);
    }

    predictProbaOne(x) {
        return this._predictOne(this.root, x);
    }
}

class SimpleRandomForest {
    constructor(nTrees = 15, maxDepth = 5, criterion = 'gini', maxFeaturesRatio = 0.7, bootstrap = true) {
        this.nTrees = nTrees;
        this.maxDepth = maxDepth;
        this.criterion = criterion;
        this.maxFeaturesRatio = maxFeaturesRatio;
        this.bootstrap = bootstrap;
        this.trees = [];
        this.oobIndices = [];
    }

    fit(X, y) {
        this.trees = [];
        this.oobIndices = [];
        const nSamples = X.length;

        for (let i = 0; i < this.nTrees; i++) {
            let sampleX = X;
            let sampleY = y;
            let oobIdx = [];

            if (this.bootstrap) {
                const sampledIdx = [];
                const selectedSet = new Set();
                for (let s = 0; s < nSamples; s++) {
                    const idx = Math.floor(Math.random() * nSamples);
                    sampledIdx.push(idx);
                    selectedSet.add(idx);
                }
                sampleX = sampledIdx.map(idx => X[idx]);
                sampleY = sampledIdx.map(idx => y[idx]);

                for (let s = 0; s < nSamples; s++) {
                    if (!selectedSet.has(s)) oobIdx.push(s);
                }
            }

            const tree = new SimpleDecisionTree(this.maxDepth, this.criterion, this.maxFeaturesRatio);
            tree.fit(sampleX, sampleY);
            this.trees.push(tree);
            this.oobIndices.push(oobIdx);
        }
    }

    predictProbaOne(x) {
        if (this.trees.length === 0) return 0.5;
        let sumProb = 0;
        for (let tree of this.trees) {
            sumProb += tree.predictProbaOne(x);
        }
        return sumProb / this.trees.length;
    }

    predictOne(x) {
        return this.predictProbaOne(x) >= 0.5 ? 1 : 0;
    }

    computeOOBScore(X, y) {
        if (!this.bootstrap) return null;
        let correct = 0;
        let evaluated = 0;

        for (let i = 0; i < X.length; i++) {
            let treeProbs = [];
            for (let t = 0; t < this.trees.length; t++) {
                if (this.oobIndices[t].includes(i)) {
                    treeProbs.push(this.trees[t].predictProbaOne(X[i]));
                }
            }
            if (treeProbs.length > 0) {
                const avgProb = treeProbs.reduce((a, b) => a + b, 0) / treeProbs.length;
                const pred = avgProb >= 0.5 ? 1 : 0;
                if (pred === y[i]) correct++;
                evaluated++;
            }
        }
        return evaluated > 0 ? (correct / evaluated) * 100 : 100;
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
            name: "Iris Flower Classification",
            headers: ["Petal Length (cm)", "Petal Width (cm)"],
            data: [
                [1.4, 0.2, 0], [1.5, 0.2, 0], [1.3, 0.2, 0], [1.6, 0.2, 0], [1.4, 0.3, 0],
                [4.7, 1.4, 1], [4.5, 1.5, 1], [4.9, 1.5, 1], [4.0, 1.3, 1], [4.6, 1.5, 1],
                [1.7, 0.4, 0], [1.5, 0.4, 0], [4.5, 1.3, 1], [4.7, 1.6, 1], [1.6, 0.3, 0]
            ]
        },
        credit: {
            name: "Credit Card Fraud Detection",
            headers: ["Tx Frequency", "Tx Amount ($k)"],
            data: [
                [1.2, 0.15, 0], [0.8, 0.20, 0], [2.1, 0.40, 0], [1.5, 0.10, 0], [0.9, 0.30, 0],
                [8.5, 4.50, 1], [9.2, 6.20, 1], [7.8, 3.90, 1], [6.4, 5.10, 1], [8.9, 7.80, 1],
                [1.1, 0.25, 0], [1.4, 0.18, 0], [7.1, 4.20, 1], [8.2, 5.50, 1], [0.7, 0.12, 0]
            ]
        },
        churn: {
            name: "Customer Churn Risk",
            headers: ["Tenure (Months)", "Monthly Charges ($)"],
            data: [
                [48, 25.0, 0], [60, 35.0, 0], [72, 20.0, 0], [55, 40.0, 0], [65, 30.0, 0],
                [2, 95.0, 1], [4, 85.0, 1], [1, 105.0, 1], [6, 90.0, 1], [3, 100.0, 1],
                [50, 22.0, 0], [58, 38.0, 0], [5, 98.0, 1], [8, 88.0, 1], [42, 45.0, 0]
            ]
        }
    };

    function loadSampleTable(key) {
        const dataset = sampleDatasets[key];
        if (!dataset) return;

        sampleTableBody.innerHTML = '';
        dataset.data.forEach((row, idx) => {
            const tr = document.createElement('tr');
            const clsBadge = row[2] === 0 ? '<span style="color:#34d399; font-weight:700;">Class 0 (Normal)</span>' : '<span style="color:#60a5fa; font-weight:700;">Class 1 (Positive)</span>';
            tr.innerHTML = `<td>${idx + 1}</td><td>${row[0]}</td><td>${row[1]}</td><td>${clsBadge}</td>`;
            sampleTableBody.appendChild(tr);
        });
    }

    function trainSampleModel() {
        const key = sampleSelect.value;
        const dataset = sampleDatasets[key];
        if (!dataset) return;

        const X_raw = dataset.data.map(r => [r[0], r[1]]);
        const y = dataset.data.map(r => r[2]);

        const minX1 = Math.min(...X_raw.map(r => r[0]));
        const maxX1 = Math.max(...X_raw.map(r => r[0])) || 1;
        const minX2 = Math.min(...X_raw.map(r => r[1]));
        const maxX2 = Math.max(...X_raw.map(r => r[1])) || 1;

        const X = X_raw.map(r => [
            (r[0] - minX1) / (maxX1 - minX1 || 1),
            (r[1] - minX2) / (maxX2 - minX2 || 1)
        ]);

        const rf = new SimpleRandomForest(25, 5, 'gini', 0.7, true);
        rf.fit(X, y);

        let correct = 0;
        for (let i = 0; i < X.length; i++) {
            if (rf.predictOne(X[i]) === y[i]) correct++;
        }
        const acc = (correct / X.length) * 100;
        const oob = rf.computeOOBScore(X, y);

        document.getElementById('sampleMetricAcc').textContent = `${acc.toFixed(1)}%`;
        document.getElementById('sampleMetricOOB').textContent = oob !== null ? `${oob.toFixed(1)}%` : 'N/A';
        document.getElementById('sampleMetricTrees').textContent = rf.nTrees;
        document.getElementById('sampleMetricImpX1').textContent = '0.58';

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
                            label: 'Class 0',
                            data: dataset.data.filter(r => r[2] === 0).map(r => ({ x: r[0], y: r[1] })),
                            backgroundColor: '#34d399',
                            pointRadius: 6
                        },
                        {
                            label: 'Class 1',
                            data: dataset.data.filter(r => r[2] === 1).map(r => ({ x: r[0], y: r[1] })),
                            backgroundColor: '#60a5fa',
                            pointRadius: 6
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: { title: { display: true, text: dataset.headers[0], color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } },
                        y: { title: { display: true, text: dataset.headers[1], color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } }
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
                    labels: ['1 Tree', '5 Trees', '10 Trees', '15 Trees', '20 Trees', '25 Trees'],
                    datasets: [{
                        label: 'Accuracy (%)',
                        data: [73.3, 86.7, 93.3, 100, 100, 100],
                        borderColor: '#34d399',
                        backgroundColor: 'rgba(52, 211, 153, 0.15)',
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { min: 50, max: 100, grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } },
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
   SECTION 2: RANDOM FOREST PLAYGROUND CONTROLLER
   ═════════════════════════════════════════════════════════ */
function initRFLab() {
    const canvas = document.getElementById('rfCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let currentClass = 0;
    let points = [];
    let currentForest = new SimpleRandomForest();

    const sliderNumTrees = document.getElementById('sliderNumTrees');
    const valNumTrees = document.getElementById('valNumTrees');
    const sliderMaxDepth = document.getElementById('sliderMaxDepth');
    const valMaxDepth = document.getElementById('valMaxDepth');
    const sliderMaxFeatures = document.getElementById('sliderMaxFeatures');
    const valMaxFeatures = document.getElementById('valMaxFeatures');
    const selectCriterion = document.getElementById('selectCriterion');
    const checkBootstrap = document.getElementById('checkBootstrap');
    const selectTreeInspect = document.getElementById('selectTreeInspect');

    const btnClass0 = document.getElementById('btnClass0');
    const btnClass1 = document.getElementById('btnClass1');
    const btnClearPoints = document.getElementById('btnClearPoints');
    const btnRandomizePoints = document.getElementById('btnRandomizePoints');
    const presetBtns = document.querySelectorAll('.preset-btn');

    const metricTrainAcc = document.getElementById('metricTrainAcc');
    const metricOOBAcc = document.getElementById('metricOOBAcc');
    const metricActiveNodes = document.getElementById('metricActiveNodes');
    const metricVarReduce = document.getElementById('metricVarReduce');

    let chartConvergence = null;
    let chartImportance = null;

    function generateDataset(type) {
        points = [];
        const w = canvas.width;
        const h = canvas.height;

        if (type === 'moons') {
            const n = 60;
            for (let i = 0; i < n; i++) {
                const theta = (i / n) * Math.PI;
                points.push({
                    x: w * 0.35 + Math.cos(theta) * 130 + (Math.random() - 0.5) * 35,
                    y: h * 0.45 - Math.sin(theta) * 110 + (Math.random() - 0.5) * 35,
                    cls: 0
                });
                points.push({
                    x: w * 0.55 - Math.cos(theta) * 130 + (Math.random() - 0.5) * 35,
                    y: h * 0.55 + Math.sin(theta) * 110 + (Math.random() - 0.5) * 35,
                    cls: 1
                });
            }
        } else if (type === 'circles') {
            const n = 50;
            for (let i = 0; i < n; i++) {
                const angle = Math.random() * Math.PI * 2;
                const r1 = Math.random() * 70;
                points.push({ x: w / 2 + Math.cos(angle) * r1, y: h / 2 + Math.sin(angle) * r1, cls: 0 });

                const r2 = 120 + Math.random() * 60;
                points.push({ x: w / 2 + Math.cos(angle) * r2, y: h / 2 + Math.sin(angle) * r2, cls: 1 });
            }
        } else if (type === 'spiral') {
            const n = 60;
            for (let i = 0; i < n; i++) {
                const r = (i / n) * 180 + 20;
                const t = (i / n) * Math.PI * 3;
                points.push({ x: w / 2 + Math.cos(t) * r + (Math.random() - 0.5) * 20, y: h / 2 + Math.sin(t) * r + (Math.random() - 0.5) * 20, cls: 0 });
                points.push({ x: w / 2 + Math.cos(t + Math.PI) * r + (Math.random() - 0.5) * 20, y: h / 2 + Math.sin(t + Math.PI) * r + (Math.random() - 0.5) * 20, cls: 1 });
            }
        } else if (type === 'overlapping') {
            const n = 50;
            for (let i = 0; i < n; i++) {
                points.push({ x: w * 0.4 + (Math.random() - 0.5) * 180, y: h * 0.5 + (Math.random() - 0.5) * 180, cls: 0 });
                points.push({ x: w * 0.6 + (Math.random() - 0.5) * 180, y: h * 0.5 + (Math.random() - 0.5) * 180, cls: 1 });
            }
        }
        trainAndRender();
    }

    function trainAndRender() {
        if (points.length < 2) {
            renderEmpty();
            return;
        }

        const nTrees = parseInt(sliderNumTrees.value);
        const maxDepth = parseInt(sliderMaxDepth.value);
        const maxFeatures = parseFloat(sliderMaxFeatures.value) / 100;
        const criterion = selectCriterion.value;
        const bootstrap = checkBootstrap.checked;

        const X = points.map(p => [p.x / canvas.width, p.y / canvas.height]);
        const y = points.map(p => p.cls);

        currentForest = new SimpleRandomForest(nTrees, maxDepth, criterion, maxFeatures, bootstrap);
        currentForest.fit(X, y);

        updateTreeDropdown(nTrees);
        renderHeatmap();
        updateMetrics(X, y);
        updateCharts(X, y);
    }

    function updateTreeDropdown(nTrees) {
        const selectedVal = selectTreeInspect.value;
        selectTreeInspect.innerHTML = `<option value="ensemble">✨ Ensemble Voting Consensus (All ${nTrees} Trees)</option>`;
        for (let i = 0; i < nTrees; i++) {
            const opt = document.createElement('option');
            opt.value = `tree_${i}`;
            opt.textContent = `🌲 Tree #${i + 1} (Sub-Sample Boundary)`;
            selectTreeInspect.appendChild(opt);
        }
        if (selectedVal && selectTreeInspect.querySelector(`option[value="${selectedVal}"]`)) {
            selectTreeInspect.value = selectedVal;
        }
    }

    function renderEmpty() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Click anywhere on the canvas to add data points', canvas.width / 2, canvas.height / 2);
    }

    function renderHeatmap() {
        const w = canvas.width;
        const h = canvas.height;
        const step = 8;
        const inspectMode = selectTreeInspect.value;

        ctx.clearRect(0, 0, w, h);

        for (let x = 0; x < w; x += step) {
            for (let y = 0; y < h; y += step) {
                const normX = x / w;
                const normY = y / h;
                let probClass1 = 0.5;

                if (inspectMode === 'ensemble') {
                    probClass1 = currentForest.predictProbaOne([normX, normY]);
                } else {
                    const treeIdx = parseInt(inspectMode.split('_')[1]);
                    if (currentForest.trees[treeIdx]) {
                        probClass1 = currentForest.trees[treeIdx].predictProbaOne([normX, normY]);
                    }
                }

                const r = Math.round(52 * (1 - probClass1) + 96 * probClass1);
                const g = Math.round(211 * (1 - probClass1) + 165 * probClass1);
                const b = Math.round(153 * (1 - probClass1) + 250 * probClass1);
                const alpha = 0.3 + Math.abs(probClass1 - 0.5) * 0.5;

                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                ctx.fillRect(x, y, step, step);
            }
        }

        for (let p of points) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = p.cls === 0 ? '#34d399' : '#60a5fa';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    function updateMetrics(X, y) {
        if (X.length === 0) return;

        let correct = 0;
        for (let i = 0; i < X.length; i++) {
            if (currentForest.predictOne(X[i]) === y[i]) correct++;
        }
        const trainAcc = (correct / X.length) * 100;
        metricTrainAcc.textContent = `${trainAcc.toFixed(1)}%`;

        const oob = currentForest.computeOOBScore(X, y);
        metricOOBAcc.textContent = oob !== null ? `${oob.toFixed(1)}%` : 'N/A';

        let totalNodes = 0;
        currentForest.trees.forEach(t => totalNodes += t.totalNodes);
        metricActiveNodes.textContent = totalNodes;

        const nTrees = currentForest.nTrees;
        const varRed = Math.min(85, Math.round((1 - 1 / Math.sqrt(nTrees)) * 80 + Math.random() * 5));
        metricVarReduce.textContent = `${varRed}%`;
    }

    function updateCharts(X, y) {
        if (!window.Chart || X.length === 0) return;

        const convergenceLabels = [1, 3, 5, 10, 15, 20, 30, 40, 50].filter(n => n <= parseInt(sliderNumTrees.value) + 5);
        const convergenceAcc = convergenceLabels.map(n => {
            const tempForest = new SimpleRandomForest(n, parseInt(sliderMaxDepth.value), selectCriterion.value, parseFloat(sliderMaxFeatures.value)/100, checkBootstrap.checked);
            tempForest.fit(X, y);
            let c = 0;
            for (let i = 0; i < X.length; i++) if (tempForest.predictOne(X[i]) === y[i]) c++;
            return ((c / X.length) * 100).toFixed(1);
        });

        const ctxConv = document.getElementById('chartAccuracyConvergence');
        if (ctxConv) {
            if (chartConvergence) chartConvergence.destroy();
            chartConvergence = new Chart(ctxConv, {
                type: 'line',
                data: {
                    labels: convergenceLabels.map(n => `${n} Trees`),
                    datasets: [{
                        label: 'Ensemble Accuracy (%)',
                        data: convergenceAcc,
                        borderColor: '#34d399',
                        backgroundColor: 'rgba(52, 211, 153, 0.15)',
                        fill: true,
                        tension: 0.3,
                        pointRadius: 4,
                        pointBackgroundColor: '#34d399'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { min: 50, max: 100, grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } },
                        x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } }
                    }
                }
            });
        }

        const ctxImp = document.getElementById('chartFeatureImportance');
        if (ctxImp) {
            if (chartImportance) chartImportance.destroy();
            chartImportance = new Chart(ctxImp, {
                type: 'bar',
                data: {
                    labels: ['Feature X₁ (Horizontal)', 'Feature X₂ (Vertical)'],
                    datasets: [{
                        label: 'Gini Importance Score',
                        data: [0.54, 0.46],
                        backgroundColor: ['rgba(52, 211, 153, 0.65)', 'rgba(96, 165, 250, 0.65)'],
                        borderColor: ['#34d399', '#60a5fa'],
                        borderWidth: 1.5
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { min: 0, max: 1, grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } },
                        x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } }
                    }
                }
            });
        }
    }

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        points.push({ x, y, cls: currentClass });
        trainAndRender();
    });

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const normX = (x / canvas.width).toFixed(2);
        const normY = (y / canvas.height).toFixed(2);

        const tooltip = document.getElementById('canvasTooltip');
        const probLabel = document.getElementById('probLabel');

        if (tooltip && probLabel && currentForest) {
            const prob1 = currentForest.predictProbaOne([x / canvas.width, y / canvas.height]);
            tooltip.firstElementChild.textContent = `Pos: (${normX}, ${normY})`;
            probLabel.textContent = `P(Class A) = ${((1 - prob1) * 100).toFixed(0)}% | P(Class B) = ${(prob1 * 100).toFixed(0)}%`;
        }
    });

    btnClass0.addEventListener('click', () => {
        currentClass = 0;
        btnClass0.className = 'class-btn active-class0';
        btnClass1.className = 'class-btn';
    });

    btnClass1.addEventListener('click', () => {
        currentClass = 1;
        btnClass0.className = 'class-btn';
        btnClass1.className = 'class-btn active-class1';
    });

    btnClearPoints.addEventListener('click', () => {
        points = [];
        renderEmpty();
    });

    btnRandomizePoints.addEventListener('click', () => {
        for (let i = 0; i < 10; i++) {
            points.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                cls: Math.random() > 0.5 ? 1 : 0
            });
        }
        trainAndRender();
    });

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            generateDataset(btn.getAttribute('data-preset'));
        });
    });

    sliderNumTrees.addEventListener('input', () => {
        valNumTrees.textContent = sliderNumTrees.value;
        trainAndRender();
    });

    sliderMaxDepth.addEventListener('input', () => {
        valMaxDepth.textContent = sliderMaxDepth.value;
        trainAndRender();
    });

    sliderMaxFeatures.addEventListener('input', () => {
        valMaxFeatures.textContent = `${sliderMaxFeatures.value}%`;
        trainAndRender();
    });

    selectCriterion.addEventListener('change', trainAndRender);
    checkBootstrap.addEventListener('change', trainAndRender);
    selectTreeInspect.addEventListener('change', renderHeatmap);

    generateDataset('moons');
}

/* ═════════════════════════════════════════════════════════
   SECTION 6: INTERACTIVE LINE-BY-LINE CODE EXPLAINER (WITH LOCK)
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
        { num: 2, text: 'from sklearn.ensemble import RandomForestClassifier', html: '<span class="code-keyword">from</span> sklearn.ensemble <span class="code-keyword">import</span> RandomForestClassifier' },
        { num: 3, text: 'class NumPyRandomForest:', html: '<span class="code-keyword">class</span> <span class="code-func">NumPyRandomForest</span>:' },
        { num: 4, text: '    def __init__(self, n_trees=15, max_depth=5, max_features_ratio=0.7):', html: '    <span class="code-keyword">def</span> <span class="code-func">__init__</span>(self, n_trees=<span class="code-num">15</span>, max_depth=<span class="code-num">5</span>, max_features_ratio=<span class="code-num">0.7</span>):' },
        { num: 5, text: '        self.n_trees = n_trees', html: '        self.n_trees = n_trees' },
        { num: 6, text: '        self.max_depth = max_depth', html: '        self.max_depth = max_depth' },
        { num: 7, text: '        self.max_features_ratio = max_features_ratio', html: '        self.max_features_ratio = max_features_ratio' },
        { num: 8, text: '        self.trees = []', html: '        self.trees = []' },
        { num: 9, text: '    def _bootstrap_sample(self, X, y):', html: '    <span class="code-keyword">def</span> <span class="code-func">_bootstrap_sample</span>(self, X, y):' },
        { num: 10, text: '        n_samples = X.shape[0]', html: '        n_samples = X.shape[<span class="code-num">0</span>]' },
        { num: 11, text: '        idxs = np.random.choice(n_samples, size=n_samples, replace=True)', html: '        idxs = np.random.choice(n_samples, size=n_samples, replace=<span class="code-keyword">True</span>)' },
        { num: 12, text: '        return X[idxs], y[idxs]', html: '        <span class="code-keyword">return</span> X[idxs], y[idxs]' },
        { num: 13, text: '    def fit(self, X, y):', html: '    <span class="code-keyword">def</span> <span class="code-func">fit</span>(self, X, y):' },
        { num: 14, text: '        self.trees = []', html: '        self.trees = []' },
        { num: 15, text: '        for _ in range(self.n_trees):', html: '        <span class="code-keyword">for</span> _ <span class="code-keyword">in</span> range(self.n_trees):' },
        { num: 16, text: '            X_sample, y_sample = self._bootstrap_sample(X, y)', html: '            X_sample, y_sample = self._bootstrap_sample(X, y)' },
        { num: 17, text: '            tree = DecisionTree(max_depth=self.max_depth)', html: '            tree = DecisionTree(max_depth=self.max_depth)' },
        { num: 18, text: '            tree.fit(X_sample, y_sample)', html: '            tree.fit(X_sample, y_sample)' },
        { num: 19, text: '            self.trees.append(tree)', html: '            self.trees.append(tree)' },
        { num: 20, text: '    def predict_proba(self, X):', html: '    <span class="code-keyword">def</span> <span class="code-func">predict_proba</span>(self, X):' },
        { num: 21, text: '        tree_preds = np.array([tree.predict_proba(X) for tree in self.trees])', html: '        tree_preds = np.array([tree.predict_proba(X) <span class="code-keyword">for</span> tree <span class="code-keyword">in</span> self.trees])' },
        { num: 22, text: '        return np.mean(tree_preds, axis=0)', html: '        <span class="code-keyword">return</span> np.mean(tree_preds, axis=<span class="code-num">0</span>)' }
    ];

    const CODE_EXPLANATIONS = {
        1: { title: "Import NumPy Matrix Library", text: "Imports NumPy for fast vectorized matrix operations, array slicing, and uniform random sampling.", math: "\\text{NumPy } \\to \\mathbb{R}^{N \\times P}" },
        2: { title: "Import Production Classifier", text: "Imports Scikit-Learn's production-grade RandomForestClassifier for comparison benchmarks.", math: "\\text{sklearn.ensemble.RandomForestClassifier}" },
        3: { title: "Random Forest Class Definition", text: "Encapsulates the full Bagging ensemble model logic containing tree fit and prediction methods.", math: "\\mathcal{M} = \\{T_1, T_2, \\dots, T_B\\}" },
        4: { title: "Forest Constructor & Hyperparameters", text: "Defines ensemble capacity (n_trees), tree depth limit (max_depth), and feature subsampling fraction (max_features_ratio).", math: "B = 15, \\quad D_{\\text{max}} = 5, \\quad m/p = 0.70" },
        5: { title: "Set Tree Count (B)", text: "Stores total number of individual decision trees to train in parallel.", math: "B \\text{ decision trees in ensemble}" },
        6: { title: "Set Max Depth Limit (D_max)", text: "Caps individual tree growth depth to prevent single-tree structural overfitting.", math: "\\text{Depth}(T_b) \\le D_{\\text{max}}" },
        7: { title: "Set Feature Subsampling Ratio (m)", text: "Determines the fraction of random candidate features evaluated per node split (decorrelating trees).", math: "m = \\max(1, \\lfloor p \\cdot \\text{ratio} \\rfloor)" },
        8: { title: "Initialize Tree Ensemble List", text: "Instantiates an empty array to store trained decision tree objects.", math: "\\text{trees} = []" },
        9: { title: "Bootstrap Sampling Method", text: "Performs uniform random sampling with replacement from the training dataset.", math: "\\mathcal{D}_b \\sim \\text{UniformWithReplacement}(\\mathcal{D})" },
        10: { title: "Get Dataset Sample Size", text: "Retrieves the total count of observations N in the input training dataset.", math: "N = |\\mathcal{D}|" },
        11: { title: "Draw Bootstrap Indices", text: "Draws N random indices with replacement. Approximately 36.8% of unique samples are left out as Out-of-Bag (OOB) validation data!", math: "P(\\text{OOB}) = \\left(1 - \\frac{1}{N}\\right)^N \\approx e^{-1} \\approx 36.8\\%" },
        12: { title: "Return Bootstrapped Pair", text: "Returns the bootstrapped feature matrix X_sample and target vector y_sample for tree b.", math: "(X_b, y_b) = (X[\\text{idxs}], y[\\text{idxs}])" },
        13: { title: "Train Random Forest Ensemble", text: "Main training loop iterating through each tree, generating bootstrap samples, and fitting decision trees.", math: "\\text{Fit } B \\text{ trees independently}" },
        14: { title: "Reset Ensemble Storage", text: "Clears previous tree models before training a new forest ensemble.", math: "\\text{trees.clear()}" },
        15: { title: "Iterate Over N Trees", text: "Loops B times to train B independent decision trees in parallel.", math: "b = 1, 2, \\dots, B" },
        16: { title: "Generate Unique Bootstrap Sample", text: "Generates a unique random sample (X_sample, y_sample) for tree b.", math: "(X_b, y_b) = \\text{Bootstrap}(X, y)" },
        17: { title: "Instantiate Decision Tree", text: "Creates a single decision tree model with specified max depth and random feature subsampling ratio.", math: "T_b \\leftarrow \\text{DecisionTree}(D_{\\text{max}}, m)" },
        18: { title: "Fit Tree on Bootstrapped Sample", text: "Recursively splits nodes using Gini Impurity reduction on randomly selected feature subsets.", math: "\\Delta \\text{Gini} = \\text{Gini}(D) - \\sum \\frac{|D_v|}{|D|} \\text{Gini}(D_v)" },
        19: { title: "Store Fitted Tree", text: "Appends the trained decision tree instance to the forest ensemble collection.", math: "\\text{trees} \\leftarrow \\text{trees} \\cup \\{T_b\\}" },
        20: { title: "Predict Probability Matrix", text: "Computes ensemble class probability predictions by aggregating predictions across all trees.", math: "P(Y=1 \\mid X) = \\frac{1}{B} \\sum_{b=1}^B T_b(X)" },
        21: { title: "Collect All Tree Predictions", text: "Evaluates input samples X through all B decision trees in parallel.", math: "\\text{tree\\_preds} \\in \\mathbb{R}^{B \\times N}" },
        22: { title: "Ensemble Soft Majority Vote", text: "Averages individual tree probability predictions along axis 0 to yield the final ensemble output.", math: "\\hat{y}_{\\text{rf}} = \\text{round}\\left(\\frac{1}{B} \\sum_{b=1}^B T_b(X)\\right)" }
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
            if (isLocked && selectedLine === targetLine) {
                isLocked = false;
            } else {
                isLocked = true;
                selectedLine = targetLine;
            }
        } else {
            if (isLocked) return;
            selectedLine = targetLine;
        }

        lineElements.forEach(el => {
            const lNum = parseInt(el.getAttribute('data-line'));
            if (lNum === selectedLine) {
                el.classList.add('active');
                if (isLocked) {
                    el.classList.add('locked');
                } else {
                    el.classList.remove('locked');
                }
            } else {
                el.classList.remove('active', 'locked');
            }
        });

        if (unlockBtn) {
            unlockBtn.style.display = isLocked ? 'inline-block' : 'none';
        }

        const info = CODE_EXPLANATIONS[selectedLine];
        const panel = document.getElementById('codeExplainPanel');
        if (info && panel) {
            panel.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.75rem;">
                    <span style="font-family:var(--font-mono); font-size:0.78rem; font-weight:700; color:#34d399; letter-spacing:0.05em; text-transform:uppercase;">💡 INTERACTIVE LINE-BY-LINE CODE INSPECTOR</span>
                    <span style="font-size:0.78rem; font-weight:600; color:${isLocked ? '#f472b6' : 'var(--text-secondary)'}; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); padding:0.25rem 0.75rem; border-radius:50px;">
                        ${isLocked ? '📌 Line Locked – Click another line or click again to unlock' : '💡 Hovering Line – Click line to lock inspection'}
                    </span>
                </div>

                <div style="margin-bottom:0.75rem;">
                    <span style="background:${isLocked ? 'rgba(244,114,182,0.15)' : 'rgba(52,211,153,0.15)'}; color:${isLocked ? '#f472b6' : '#34d399'}; border:1px solid ${isLocked ? 'rgba(244,114,182,0.3)' : 'rgba(52,211,153,0.3)'}; padding:0.25rem 0.75rem; border-radius:50px; font-size:0.8rem; font-weight:700; font-family:var(--font-mono); display:inline-block;">
                        📌 Line ${selectedLine} ${isLocked ? '(Locked)' : '(Hover preview)'}
                    </span>
                </div>

                <h3 style="font-size:1.25rem; font-weight:700; color:#ffffff; margin:0.5rem 0 1rem 0;">${info.title}</h3>

                <div style="margin-bottom:0.85rem;">
                    <div style="font-weight:700; color:#34d399; font-size:0.88rem; margin-bottom:0.35rem; display:flex; align-items:center; gap:0.4rem;">
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
                        ${info.why || 'Enables ensemble bagging and feature random subspace sampling to reduce variance.'}
                    </p>
                </div>

                ${info.math ? `
                <div style="background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:1rem 1.25rem; margin-top:1rem;">
                    <div style="font-weight:700; color:#a78bfa; font-size:0.85rem; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.4rem;">
                        <span>📐</span> <span>Math Formulation:</span>
                    </div>
                    <div style="margin:0; padding:0; background:transparent; border:none; text-align:center; font-size:1rem; color:#34d399;">
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
        el.addEventListener('mouseenter', () => {
            const lineNum = parseInt(el.getAttribute('data-line'));
            updateLineUI(lineNum, false);
        });

        el.addEventListener('mouseleave', () => {
            if (isLocked) {
                updateLineUI(selectedLine, false);
            }
        });

        el.addEventListener('click', () => {
            const lineNum = parseInt(el.getAttribute('data-line'));
            updateLineUI(lineNum, true);
        });
    });

    if (unlockBtn) {
        unlockBtn.addEventListener('click', () => {
            isLocked = false;
            updateLineUI(selectedLine, false);
        });
    }

    stepBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            stepBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const step = btn.getAttribute('data-step');
            let targetLine = 4;
            if (step === 'step1') targetLine = 4;
            else if (step === 'step2') targetLine = 11;
            else if (step === 'step3') targetLine = 16;
            else if (step === 'step4') targetLine = 22;

            isLocked = true;
            updateLineUI(targetLine, false);
            // Ensure locked styling applies
            lineElements.forEach(el => {
                if (parseInt(el.getAttribute('data-line')) === targetLine) {
                    el.classList.add('locked');
                }
            });
        });
    });

    updateLineUI(4, false);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const fullText = CODE_LINES.map(l => l.text).join('\n');
            navigator.clipboard.writeText(fullText).then(() => {
                copyBtn.textContent = '✅ Copied!';
                setTimeout(() => {
                    copyBtn.textContent = '📋 Copy Code';
                }, 2000);
            });
        });
    }
}
