/* ════════════════════════════════════════════════════════════
   K-MEANS CLUSTERING — Interactive Educational App
   All computations run client-side in pure JavaScript
   ════════════════════════════════════════════════════════════ */

// ─── Utility : K-Means Engine ──────────────────────────────
class KMeans {
    constructor(k = 3, maxIter = 100) {
        this.k = Math.max(1, Math.floor(k));
        this.maxIter = maxIter;
        this.centroids = [];
        this.assignments = [];
        this.inertia = 0;
        this.history = [];
        this.iterations = 0;
    }

    dist2(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return dx * dx + dy * dy;
    }

    dist(a, b) {
        return Math.sqrt(this.dist2(a, b));
    }

    /** k-means++ initialization */
    initPlusPlus(points) {
        const n = points.length;
        const centroids = [];
        centroids.push({ ...points[Math.floor(Math.random() * n)] });

        while (centroids.length < this.k) {
            const dists = points.map(p => {
                let minD = Infinity;
                for (const c of centroids) minD = Math.min(minD, this.dist2(p, c));
                return minD;
            });
            const sum = dists.reduce((a, b) => a + b, 0) || 1;
            let r = Math.random() * sum;
            let idx = n - 1;
            for (let i = 0; i < n; i++) {
                r -= dists[i];
                if (r <= 0) { idx = i; break; }
            }
            centroids.push({ ...points[idx] });
        }
        return centroids;
    }

    assign(points, centroids) {
        return points.map(p => {
            let best = 0;
            let bestD = Infinity;
            for (let k = 0; k < centroids.length; k++) {
                const d = this.dist2(p, centroids[k]);
                if (d < bestD) { bestD = d; best = k; }
            }
            return best;
        });
    }

    updateCentroids(points, assignments) {
        const k = this.k;
        const sums = Array.from({ length: k }, () => ({ x: 0, y: 0, n: 0 }));
        points.forEach((p, i) => {
            const c = assignments[i];
            sums[c].x += p.x;
            sums[c].y += p.y;
            sums[c].n++;
        });

        const centroids = [];
        for (let i = 0; i < k; i++) {
            if (sums[i].n === 0) {
                // Empty cluster → reinit to a random data point
                const rp = points[Math.floor(Math.random() * points.length)];
                centroids.push({ x: rp.x, y: rp.y });
            } else {
                centroids.push({
                    x: sums[i].x / sums[i].n,
                    y: sums[i].y / sums[i].n
                });
            }
        }
        return centroids;
    }

    computeInertia(points, assignments, centroids) {
        let total = 0;
        points.forEach((p, i) => {
            total += this.dist2(p, centroids[assignments[i]]);
        });
        return total;
    }

    fit(points) {
        if (!points || points.length < 1) throw new Error('Need at least 1 data point');
        this.k = Math.min(this.k, points.length);

        let centroids = this.initPlusPlus(points);
        let assignments = this.assign(points, centroids);
        this.history = [this.computeInertia(points, assignments, centroids)];

        let iter = 0;
        for (; iter < this.maxIter; iter++) {
            const newCentroids = this.updateCentroids(points, assignments);
            const newAssignments = this.assign(points, newCentroids);
            const inertia = this.computeInertia(points, newAssignments, newCentroids);
            this.history.push(inertia);

            let moved = false;
            for (let i = 0; i < this.k; i++) {
                if (this.dist2(centroids[i], newCentroids[i]) > 1e-12) { moved = true; break; }
            }
            const labelsChanged = newAssignments.some((a, i) => a !== assignments[i]);

            centroids = newCentroids;
            assignments = newAssignments;
            if (!moved && !labelsChanged) { iter++; break; }
        }

        this.centroids = centroids;
        this.assignments = assignments;
        this.inertia = this.history[this.history.length - 1];
        this.iterations = iter;
        return this;
    }

    predict(point) {
        if (!this.centroids.length) throw new Error('Model not fitted');
        let best = 0;
        let bestD = Infinity;
        for (let k = 0; k < this.centroids.length; k++) {
            const d = this.dist2(point, this.centroids[k]);
            if (d < bestD) { bestD = d; best = k; }
        }
        return best;
    }
}

// ─── Silhouette Score (simple mean) ───────────────────────
function silhouetteScore(points, assignments, k) {
    const n = points.length;
    if (n < 2 || k < 2) return 0;

    const clusters = Array.from({ length: k }, () => []);
    points.forEach((p, i) => clusters[assignments[i]].push(i));

    // Skip if any cluster empty
    if (clusters.some(c => c.length === 0)) return 0;

    function avgDist(i, indices) {
        if (indices.length <= 1) return 0;
        let sum = 0;
        const pi = points[i];
        for (const j of indices) {
            if (j === i) continue;
            const dx = pi.x - points[j].x;
            const dy = pi.y - points[j].y;
            sum += Math.sqrt(dx * dx + dy * dy);
        }
        return sum / (indices.length - (indices.includes(i) ? 1 : 0) || 1);
    }

    let total = 0;
    for (let i = 0; i < n; i++) {
        const ci = assignments[i];
        const a = avgDist(i, clusters[ci]);
        let b = Infinity;
        for (let c = 0; c < k; c++) {
            if (c === ci) continue;
            b = Math.min(b, avgDist(i, clusters[c]));
        }
        const s = (b - a) / Math.max(a, b, 1e-12);
        total += s;
    }
    return total / n;
}

// ─── Sample Datasets (2D, unsupervised) ───────────────────
function makeBlobs() {
    const centers = [
        { x: 2.0, y: 2.0 },
        { x: 8.0, y: 3.0 },
        { x: 5.0, y: 8.0 }
    ];
    const points = [];
    const trueLabels = [];
    centers.forEach((c, ci) => {
        for (let i = 0; i < 20; i++) {
            points.push({
                x: +(c.x + (Math.random() - 0.5) * 2.4).toFixed(2),
                y: +(c.y + (Math.random() - 0.5) * 2.4).toFixed(2)
            });
            trueLabels.push(ci);
        }
    });
    return { points, trueLabels };
}

function makeCustomers() {
    // Income (X1) vs Spending Score (X2) style clusters
    const groups = [
        { cx: 25, cy: 25, n: 18 },  // low income, low spend
        { cx: 75, cy: 80, n: 18 },  // high income, high spend
        { cx: 50, cy: 50, n: 16 },  // mid / average
        { cx: 25, cy: 75, n: 12 }   // low income, high spend
    ];
    const points = [];
    const trueLabels = [];
    groups.forEach((g, gi) => {
        for (let i = 0; i < g.n; i++) {
            points.push({
                x: +(g.cx + (Math.random() - 0.5) * 18).toFixed(1),
                y: +(g.cy + (Math.random() - 0.5) * 18).toFixed(1)
            });
            trueLabels.push(gi);
        }
    });
    return { points, trueLabels };
}

function makeIrisLike() {
    // Two features reminiscent of petal length / width with 3 species
    const groups = [
        { cx: 1.5, cy: 0.3, n: 20, sx: 0.5, sy: 0.25 },
        { cx: 4.3, cy: 1.3, n: 20, sx: 0.7, sy: 0.35 },
        { cx: 5.6, cy: 2.1, n: 20, sx: 0.8, sy: 0.4 }
    ];
    const points = [];
    const trueLabels = [];
    groups.forEach((g, gi) => {
        for (let i = 0; i < g.n; i++) {
            points.push({
                x: +(g.cx + (Math.random() - 0.5) * g.sx * 2).toFixed(2),
                y: +(g.cy + (Math.random() - 0.5) * g.sy * 2).toFixed(2)
            });
            trueLabels.push(gi);
        }
    });
    return { points, trueLabels };
}

const DATASETS = {
    blobs: {
        name: 'Three Blob Clusters',
        xLabel: 'X1',
        yLabel: 'X2',
        defaultK: 3
    },
    customers: {
        name: 'Income vs Spending',
        xLabel: 'Annual Income',
        yLabel: 'Spending Score',
        defaultK: 4
    },
    iris: {
        name: 'Iris-like Features',
        xLabel: 'Petal Length',
        yLabel: 'Petal Width',
        defaultK: 3
    }
};

// Generate once per page load (stable during session)
const GENERATED = {
    blobs: makeBlobs(),
    customers: makeCustomers(),
    iris: makeIrisLike()
};

function getDataset(key) {
    const meta = DATASETS[key];
    const data = GENERATED[key];
    return {
        name: meta.name,
        xLabel: meta.xLabel,
        yLabel: meta.yLabel,
        defaultK: meta.defaultK,
        points: data.points,
        trueLabels: data.trueLabels
    };
}

// ─── Chart Instances Registry ─────────────────────────────
const charts = {};

function destroyChart(id) {
    if (charts[id]) {
        charts[id].destroy();
        delete charts[id];
    }
}

// ─── Chart Color Palette ──────────────────────────────────
const COLORS = {
    accent:     'rgba(96, 165, 250, 1)',
    accentFade: 'rgba(96, 165, 250, 0.25)',
    purple:     'rgba(167, 139, 250, 1)',
    purpleFade: 'rgba(167, 139, 250, 0.25)',
    green:      'rgba(52, 211, 153, 1)',
    greenFade:  'rgba(52, 211, 153, 0.25)',
    red:        'rgba(248, 113, 113, 1)',
    redFade:    'rgba(248, 113, 113, 0.25)',
    yellow:     'rgba(251, 191, 36, 1)',
    yellowFade: 'rgba(251, 191, 36, 0.25)',
    grid:       'rgba(255,255,255,0.06)',
    gridTick:   'rgba(148,163,184,0.7)',
};

const CLUSTER_PALETTE = [
    { solid: 'rgba(52, 211, 153, 1)',  fade: 'rgba(52, 211, 153, 0.35)' },
    { solid: 'rgba(96, 165, 250, 1)',  fade: 'rgba(96, 165, 250, 0.35)' },
    { solid: 'rgba(251, 191, 36, 1)',  fade: 'rgba(251, 191, 36, 0.35)' },
    { solid: 'rgba(248, 113, 113, 1)', fade: 'rgba(248, 113, 113, 0.35)' },
    { solid: 'rgba(167, 139, 250, 1)', fade: 'rgba(167, 139, 250, 0.35)' },
    { solid: 'rgba(45, 212, 191, 1)',  fade: 'rgba(45, 212, 191, 0.35)' },
    { solid: 'rgba(244, 114, 182, 1)', fade: 'rgba(244, 114, 182, 0.35)' },
    { solid: 'rgba(148, 163, 184, 1)', fade: 'rgba(148, 163, 184, 0.35)' },
];

Chart.defaults.color = COLORS.gridTick;
Chart.defaults.borderColor = COLORS.grid;
Chart.defaults.font.family = "'Inter', sans-serif";

function chartBase() {
    return {
        responsive: true,
        maintainAspectRatio: true,
        animation: { duration: 800, easing: 'easeOutQuart' },
        plugins: {
            legend: {
                labels: { padding: 16, usePointStyle: true, pointStyleWidth: 10, font: { size: 12 } }
            }
        },
        scales: {
            x: { grid: { color: COLORS.grid }, ticks: { font: { size: 11 } } },
            y: { grid: { color: COLORS.grid }, ticks: { font: { size: 11 } } }
        }
    };
}

// ─── Hero Canvas Animation ─────────────────────────────────
function initHeroAnimation() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    function resize() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.getBoundingClientRect().width;
    const H = () => canvas.getBoundingClientRect().height;

    // Three blob centers in normalized coords
    const blobCenters = [
        { x: 0.22, y: 0.35 },
        { x: 0.72, y: 0.30 },
        { x: 0.48, y: 0.72 }
    ];
    const palette = [
        'rgba(52, 211, 153, 1)',
        'rgba(96, 165, 250, 1)',
        'rgba(251, 191, 36, 1)'
    ];

    const points = [];
    blobCenters.forEach((c, ci) => {
        for (let i = 0; i < 14; i++) {
            points.push({
                x: c.x + (Math.random() - 0.5) * 0.22,
                y: c.y + (Math.random() - 0.5) * 0.22,
                cluster: ci,
                phase: Math.random() * Math.PI * 2,
                appear: points.length * 0.04,
                radius: 3.5 + Math.random() * 2
            });
        }
    });

    // Centroid animation: start scattered, move toward true centers
    const centroids = blobCenters.map((c, i) => ({
        startX: 0.3 + Math.random() * 0.4,
        startY: 0.3 + Math.random() * 0.4,
        endX: c.x,
        endY: c.y,
        color: palette[i]
    }));

    let startTime = null;
    const POINT_DURATION = 0.45;
    const CENTROID_START = points.length * 0.04 + 0.4;
    const CENTROID_DURATION = 2.2;
    const HOLD = 2.5;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function drawDiamond(ctx, x, y, size, color, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x, y + size);
        ctx.lineTo(x - size, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    function draw(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = (timestamp - startTime) / 1000;

        const w = W(), h = H();
        ctx.clearRect(0, 0, w, h);

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        for (let i = 1; i < 8; i++) {
            const gx = (i / 8) * w;
            ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
            const gy = (i / 8) * h;
            ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
        }

        // Points appear in blobs
        points.forEach(p => {
            const t = Math.max(0, Math.min(1, (elapsed - p.appear) / POINT_DURATION));
            if (t <= 0) return;
            const ease = 1 - Math.pow(1 - t, 3);
            const px = p.x * w;
            const py = p.y * h;
            const floatY = Math.sin(elapsed * 1.2 + p.phase) * 2;
            const base = palette[p.cluster];
            const color = base.replace('1)', `${0.9 * ease})`);

            const grd = ctx.createRadialGradient(px, py + floatY, 0, px, py + floatY, 14 * ease);
            grd.addColorStop(0, base.replace('1)', '0.25)'));
            grd.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(px, py + floatY, 14 * ease, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(px, py + floatY, p.radius * ease, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = `rgba(255,255,255, ${0.3 * ease})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        // Centroids migrate toward cluster centers
        const cProg = Math.max(0, Math.min(1, (elapsed - CENTROID_START) / CENTROID_DURATION));
        if (cProg > 0) {
            const ease = 1 - Math.pow(1 - cProg, 3);
            centroids.forEach(c => {
                const cx = lerp(c.startX, c.endX, ease) * w;
                const cy = lerp(c.startY, c.endY, ease) * h;
                // glow
                const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22);
                grd.addColorStop(0, c.color.replace('1)', '0.35)'));
                grd.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.arc(cx, cy, 22, 0, Math.PI * 2);
                ctx.fill();
                drawDiamond(ctx, cx, cy, 8, c.color, Math.min(1, ease + 0.2));
            });

            if (ease > 0.85) {
                const labelAlpha = (ease - 0.85) / 0.15;
                ctx.font = 'bold 12px JetBrains Mono, monospace';
                ctx.fillStyle = `rgba(52, 211, 153, ${labelAlpha})`;
                ctx.fillText('K = 3  ·  centroids → clusters', 16, h - 16);
            }
        }

        // Loop
        if (elapsed > CENTROID_START + CENTROID_DURATION + HOLD) startTime = timestamp;
        requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
}

// ─── Render Sample Table ──────────────────────────────────
function renderSampleTable(datasetKey) {
    const ds = getDataset(datasetKey);
    const tbody = document.querySelector('#sampleTable tbody');
    const thead = document.querySelector('#sampleTable thead tr');
    thead.innerHTML = `<th>#</th><th>${ds.xLabel}</th><th>${ds.yLabel}</th>`;
    tbody.innerHTML = '';
    ds.points.forEach((p, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${i + 1}</td><td>${p.x}</td><td>${p.y}</td>`;
        tbody.appendChild(tr);
    });
}

// ─── Metrics helpers ──────────────────────────────────────
function setSampleMetrics(model, points) {
    const used = new Set(model.assignments).size;
    const sil = silhouetteScore(points, model.assignments, model.k);
    document.getElementById('sampleMetrics').style.display = 'grid';
    document.getElementById('metricK').textContent = model.k;
    document.getElementById('metricInertia').textContent = model.inertia.toFixed(2);
    document.getElementById('metricIters').textContent = model.iterations;
    document.getElementById('metricPoints').textContent = points.length;
    document.getElementById('metricClusters').textContent = used;
    document.getElementById('metricSilhouette').textContent = sil.toFixed(3);
}

function setCustomMetrics(model, points) {
    const used = new Set(model.assignments).size;
    const sil = silhouetteScore(points, model.assignments, model.k);
    document.getElementById('cMetricK').textContent = model.k;
    document.getElementById('cMetricInertia').textContent = model.inertia.toFixed(2);
    document.getElementById('cMetricIters').textContent = model.iterations;
    document.getElementById('cMetricPoints').textContent = points.length;
    document.getElementById('cMetricClusters').textContent = used;
    document.getElementById('cMetricSilhouette').textContent = sil.toFixed(3);
}

// ─── Train & Visualise Sample ─────────────────────────────
function trainSampleModel(datasetKey, k) {
    const ds = getDataset(datasetKey);
    const model = new KMeans(k, 100).fit(ds.points);

    setSampleMetrics(model, ds.points);
    document.getElementById('sampleCharts').style.display = 'grid';

    renderClusterScatter('scatterChart', ds.points, model, ds.xLabel, ds.yLabel);
    renderInertiaHistory('inertiaChart', model);
    renderClusterSizes('sizeChart', model);
    renderElbowChart('elbowChart', ds.points);
}

// ─── Chart Renderers ──────────────────────────────────────

function renderClusterScatter(canvasId, points, model, xLabel, yLabel) {
    destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext('2d');

    const datasets = [];
    for (let c = 0; c < model.k; c++) {
        const data = points
            .map((p, i) => model.assignments[i] === c ? { x: p.x, y: p.y } : null)
            .filter(Boolean);
        if (!data.length) continue;
        const pal = CLUSTER_PALETTE[c % CLUSTER_PALETTE.length];
        datasets.push({
            label: `Cluster ${c}`,
            data,
            backgroundColor: pal.fade,
            borderColor: pal.solid,
            borderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 9,
        });
    }

    // Centroid markers as diamond-style (via pointStyle)
    datasets.push({
        label: 'Centroids',
        data: model.centroids.map(c => ({ x: c.x, y: c.y })),
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderColor: COLORS.green,
        borderWidth: 3,
        pointRadius: 11,
        pointHoverRadius: 13,
        pointStyle: 'rectRot',
        rotation: 45,
    });

    charts[canvasId] = new Chart(ctx, {
        type: 'scatter',
        data: { datasets },
        options: {
            ...chartBase(),
            scales: {
                x: {
                    title: { display: true, text: xLabel, color: COLORS.gridTick },
                    grid: { color: COLORS.grid }
                },
                y: {
                    title: { display: true, text: yLabel, color: COLORS.gridTick },
                    grid: { color: COLORS.grid }
                }
            }
        }
    });
}

function renderInertiaHistory(canvasId, model) {
    destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext('2d');
    const labels = model.history.map((_, i) => String(i));

    charts[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Inertia (WCSS)',
                data: model.history,
                borderColor: COLORS.green,
                backgroundColor: COLORS.greenFade,
                borderWidth: 3,
                pointRadius: 3,
                pointBackgroundColor: COLORS.green,
                fill: true,
                tension: 0.35,
            }]
        },
        options: {
            ...chartBase(),
            scales: {
                x: {
                    title: { display: true, text: 'Iteration', color: COLORS.gridTick },
                    grid: { color: COLORS.grid }
                },
                y: {
                    title: { display: true, text: 'Inertia', color: COLORS.gridTick },
                    grid: { color: COLORS.grid },
                    beginAtZero: true
                }
            }
        }
    });
}

function renderClusterSizes(canvasId, model) {
    destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext('2d');
    const sizes = Array(model.k).fill(0);
    model.assignments.forEach(a => sizes[a]++);

    charts[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sizes.map((_, i) => `Cluster ${i}`),
            datasets: [{
                label: 'Points',
                data: sizes,
                backgroundColor: sizes.map((_, i) => CLUSTER_PALETTE[i % CLUSTER_PALETTE.length].fade),
                borderColor: sizes.map((_, i) => CLUSTER_PALETTE[i % CLUSTER_PALETTE.length].solid),
                borderWidth: 2,
                borderRadius: 6,
                barPercentage: 0.65,
            }]
        },
        options: {
            ...chartBase(),
            scales: {
                x: { grid: { color: COLORS.grid } },
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 },
                    title: { display: true, text: 'Count', color: COLORS.gridTick },
                    grid: { color: COLORS.grid }
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function renderElbowChart(canvasId, points) {
    destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext('2d');
    const maxK = Math.min(8, points.length);
    const inertias = [];
    for (let k = 1; k <= maxK; k++) {
        // Best of a few inits for smoother elbow
        let best = Infinity;
        for (let trial = 0; trial < 3; trial++) {
            const m = new KMeans(k, 80).fit(points);
            best = Math.min(best, m.inertia);
        }
        inertias.push(best);
    }

    charts[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: inertias.map((_, i) => String(i + 1)),
            datasets: [{
                label: 'Inertia vs K',
                data: inertias,
                borderColor: COLORS.purple,
                backgroundColor: COLORS.purpleFade,
                borderWidth: 3,
                pointRadius: 5,
                pointBackgroundColor: COLORS.purple,
                fill: true,
                tension: 0.3,
            }]
        },
        options: {
            ...chartBase(),
            scales: {
                x: {
                    title: { display: true, text: 'K', color: COLORS.gridTick },
                    grid: { color: COLORS.grid }
                },
                y: {
                    title: { display: true, text: 'Inertia (WCSS)', color: COLORS.gridTick },
                    grid: { color: COLORS.grid },
                    beginAtZero: true
                }
            }
        }
    });
}

// ─── Playground : CSV Parsing ─────────────────────────────
function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) throw new Error('CSV must have a header row + data.');
    const delim = lines[0].includes('\t') ? '\t' : ',';
    const headers = lines[0].split(delim).map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].split(delim).map(c => c.trim().replace(/^"|"$/g, ''));
        if (cells.length === headers.length) rows.push(cells);
    }
    return { headers, rows };
}

function renderCSVPreview(parsed) {
    const preview = document.getElementById('csvPreview');
    const x1Sel = document.getElementById('x1ColSelect');
    const x2Sel = document.getElementById('x2ColSelect');
    const tableDiv = document.getElementById('csvTablePreview');

    x1Sel.innerHTML = '';
    x2Sel.innerHTML = '';
    parsed.headers.forEach((h, i) => {
        x1Sel.innerHTML += `<option value="${i}" ${i === 0 ? 'selected' : ''}>${h}</option>`;
        x2Sel.innerHTML += `<option value="${i}" ${i === 1 ? 'selected' : ''}>${h}</option>`;
    });
    if (parsed.headers.length > 1) x2Sel.value = '1';

    let html = '<table><thead><tr>';
    parsed.headers.forEach(h => html += `<th>${h}</th>`);
    html += '</tr></thead><tbody>';
    const maxRows = Math.min(parsed.rows.length, 50);
    for (let i = 0; i < maxRows; i++) {
        html += '<tr>';
        parsed.rows[i].forEach(c => html += `<td>${c}</td>`);
        html += '</tr>';
    }
    if (parsed.rows.length > 50) {
        html += `<tr><td colspan="${parsed.headers.length}" style="text-align:center;color:var(--text-muted);">... ${parsed.rows.length - 50} more rows</td></tr>`;
    }
    html += '</tbody></table>';
    tableDiv.innerHTML = html;
    preview.style.display = 'block';
}

// ─── Playground : Manual Entry ────────────────────────────
function addManualRow(x1Val = '', x2Val = '') {
    const container = document.getElementById('manualRows');
    const row = document.createElement('div');
    row.className = 'manual-row';
    row.innerHTML = `
        <input type="number" step="any" placeholder="X1" value="${x1Val}">
        <input type="number" step="any" placeholder="X2" value="${x2Val}">
        <button class="remove-row" title="Remove">&times;</button>
    `;
    row.querySelector('.remove-row').addEventListener('click', () => row.remove());
    container.appendChild(row);
}

function initManualRows(count = 5) {
    const container = document.getElementById('manualRows');
    container.innerHTML = '';
    for (let i = 0; i < count; i++) addManualRow();
}

function loadExampleData() {
    const container = document.getElementById('manualRows');
    container.innerHTML = '';
    // Small 3-cluster example
    const pts = [
        [1.2, 1.1], [1.5, 1.8], [0.9, 1.4], [1.8, 0.8],
        [7.1, 7.5], [6.8, 7.0], [7.5, 6.8], [6.5, 7.8],
        [4.0, 1.0], [4.5, 1.5], [3.8, 0.7], [4.2, 1.2],
        [1.0, 7.0], [1.4, 6.5], [0.8, 7.2]
    ];
    pts.forEach(([x, y]) => addManualRow(x, y));
}

// ─── Playground : Train Custom ────────────────────────────
function trainCustomModel() {
    let points = [];
    let xLabel = 'X1', yLabel = 'X2';

    const activeTab = document.querySelector('.tab-content.active').id;

    if (activeTab === 'tab-csv') {
        const x1Idx = parseInt(document.getElementById('x1ColSelect').value, 10);
        const x2Idx = parseInt(document.getElementById('x2ColSelect').value, 10);
        if (isNaN(x1Idx) || isNaN(x2Idx)) {
            alert('Please select X1 and X2 columns.');
            return;
        }
        if (x1Idx === x2Idx) {
            alert('X1 and X2 must be different columns.');
            return;
        }

        // Prefer stored parsed CSV so we get all rows, not just preview
        if (window._csvParsed) {
            window._csvParsed.rows.forEach(cells => {
                const xv = parseFloat(cells[x1Idx]);
                const yv = parseFloat(cells[x2Idx]);
                if (!isNaN(xv) && !isNaN(yv)) points.push({ x: xv, y: yv });
            });
        } else {
            const tableDiv = document.getElementById('csvTablePreview');
            tableDiv.querySelectorAll('tbody tr').forEach(tr => {
                const tds = tr.querySelectorAll('td');
                if (tds.length > Math.max(x1Idx, x2Idx)) {
                    const xv = parseFloat(tds[x1Idx].textContent);
                    const yv = parseFloat(tds[x2Idx].textContent);
                    if (!isNaN(xv) && !isNaN(yv)) points.push({ x: xv, y: yv });
                }
            });
        }

        const x1Sel = document.getElementById('x1ColSelect');
        const x2Sel = document.getElementById('x2ColSelect');
        xLabel = x1Sel.options[x1Sel.selectedIndex].text;
        yLabel = x2Sel.options[x2Sel.selectedIndex].text;
    } else {
        xLabel = document.getElementById('x1Label').value || 'X1';
        yLabel = document.getElementById('x2Label').value || 'X2';
        document.querySelectorAll('.manual-row').forEach(row => {
            const inputs = row.querySelectorAll('input');
            const xv = parseFloat(inputs[0].value);
            const yv = parseFloat(inputs[1].value);
            if (!isNaN(xv) && !isNaN(yv)) points.push({ x: xv, y: yv });
        });
    }

    if (points.length < 2) {
        alert('Please provide at least 2 valid (X1, X2) data points.');
        return;
    }

    let k = parseInt(document.getElementById('playgroundK').value, 10);
    if (isNaN(k) || k < 1) k = 3;
    k = Math.min(k, points.length);

    const model = new KMeans(k, 100).fit(points);

    const results = document.getElementById('customResults');
    results.style.display = 'block';
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });

    setCustomMetrics(model, points);
    renderClusterScatter('cScatterChart', points, model, xLabel, yLabel);
    renderInertiaHistory('cInertiaChart', model);
    renderClusterSizes('cSizeChart', model);

    window._customKMeans = model;
    document.getElementById('predictResult').style.display = 'none';
}

// ─── Intersection Observer for Animations ─────────────────
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

// ─── Navbar Scroll ─────────────────────────────────────────
function initNavbar() {
    const nav = document.getElementById('navbar');
    const sections = document.querySelectorAll('section');
    const links = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');

        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop - 120;
            if (window.scrollY >= top) current = section.id;
        });
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                link.classList.toggle('active', href === `#${current}`);
            }
        });
    });
}

// ─── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // KaTeX auto-render
    if (typeof renderMathInElement === 'function') {
        renderMathInElement(document.body, {
            delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '\\[', right: '\\]', display: true },
                { left: '\\(', right: '\\)', display: false },
                { left: '$', right: '$', display: false }
            ]
        });
    } else {
        setTimeout(() => {
            if (typeof renderMathInElement === 'function') {
                renderMathInElement(document.body, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '\\[', right: '\\]', display: true },
                        { left: '\\(', right: '\\)', display: false },
                        { left: '$', right: '$', display: false }
                    ]
                });
            }
        }, 1000);
    }

    initHeroAnimation();
    initNavbar();
    initScrollAnimations();

    // Default sample
    renderSampleTable('blobs');
    const sampleKInput = document.getElementById('sampleK');
    sampleKInput.value = getDataset('blobs').defaultK;

    document.getElementById('sampleDatasetSelect').addEventListener('change', (e) => {
        const key = e.target.value;
        renderSampleTable(key);
        sampleKInput.value = getDataset(key).defaultK;
        document.getElementById('sampleMetrics').style.display = 'none';
        document.getElementById('sampleCharts').style.display = 'none';
    });

    document.getElementById('trainSampleBtn').addEventListener('click', () => {
        const key = document.getElementById('sampleDatasetSelect').value;
        let k = parseInt(sampleKInput.value, 10);
        if (isNaN(k) || k < 1) k = 3;
        trainSampleModel(key, k);
    });

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
        });
    });

    // CSV upload
    const csvInput = document.getElementById('csvFileInput');
    const uploadZone = document.getElementById('uploadZone');

    csvInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const parsed = parseCSV(ev.target.result);
                window._csvParsed = parsed;
                renderCSVPreview(parsed);
                uploadZone.style.display = 'none';
            } catch (err) {
                alert('Error parsing CSV: ' + err.message);
            }
        };
        reader.readAsText(file);
    });

    uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.csv')) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const parsed = parseCSV(ev.target.result);
                    window._csvParsed = parsed;
                    renderCSVPreview(parsed);
                    uploadZone.style.display = 'none';
                } catch (err) {
                    alert('Error parsing CSV: ' + err.message);
                }
            };
            reader.readAsText(file);
        } else {
            alert('Please drop a .csv file.');
        }
    });

    initManualRows(5);
    document.getElementById('addRowBtn').addEventListener('click', () => addManualRow());
    document.getElementById('clearRowsBtn').addEventListener('click', () => initManualRows(5));
    document.getElementById('loadExampleBtn').addEventListener('click', loadExampleData);

    document.getElementById('trainCustomBtn').addEventListener('click', trainCustomModel);

    document.getElementById('predictBtn').addEventListener('click', () => {
        const model = window._customKMeans;
        if (!model) { alert('Fit clusters first!'); return; }
        const x1 = parseFloat(document.getElementById('predictX1').value);
        const x2 = parseFloat(document.getElementById('predictX2').value);
        if (isNaN(x1) || isNaN(x2)) { alert('Enter valid X1 and X2 numbers.'); return; }
        const cluster = model.predict({ x: x1, y: x2 });
        const c = model.centroids[cluster];
        const dist = Math.sqrt((x1 - c.x) ** 2 + (x2 - c.y) ** 2);
        const result = document.getElementById('predictResult');
        result.innerHTML = `<strong>Assigned to Cluster ${cluster}</strong> &nbsp;|&nbsp; Distance to centroid = ${dist.toFixed(3)}`;
        result.style.display = 'block';
    });

    initCodeExplainer();
});

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
        { num: 2, text: 'class KMeansScratch:', html: '<span class="code-keyword">class</span> <span class="code-func">KMeansScratch</span>:' },
        { num: 3, text: '    def __init__(self, K=3, max_iters=100):', html: '    <span class="code-keyword">def</span> <span class="code-func">__init__</span>(self, K=<span class="code-num">3</span>, max_iters=<span class="code-num">100</span>):' },
        { num: 4, text: '        self.K, self.max_iters = K, max_iters', html: '        self.K, self.max_iters = K, max_iters' },
        { num: 5, text: '        self.centroids = None', html: '        self.centroids = <span class="code-keyword">None</span>' },
        { num: 6, text: '    def fit(self, X):', html: '    <span class="code-keyword">def</span> <span class="code-func">fit</span>(self, X):' },
        { num: 7, text: '        idx = np.random.choice(X.shape[0], self.K, replace=False)', html: '        idx = np.random.choice(X.shape[<span class="code-num">0</span>], self.K, replace=<span class="code-keyword">False</span>)' },
        { num: 8, text: '        self.centroids = X[idx]', html: '        self.centroids = X[idx]' },
        { num: 9, text: '        for _ in range(self.max_iters):', html: '        <span class="code-keyword">for</span> _ <span class="code-keyword">in</span> range(self.max_iters):' },
        { num: 10, text: '            distances = np.sqrt(((X[:, np.newaxis, :] - self.centroids)**2).sum(axis=2))', html: '            distances = np.sqrt(((X[:, np.newaxis, :] - self.centroids)**<span class="code-num">2</span>).sum(axis=<span class="code-num">2</span>))' },
        { num: 11, text: '            cluster_labels = np.argmin(distances, axis=1)', html: '            cluster_labels = np.argmin(distances, axis=<span class="code-num">1</span>)' },
        { num: 12, text: '            new_centroids = np.array([X[cluster_labels == k].mean(axis=0) for k in range(self.K)])', html: '            new_centroids = np.array([X[cluster_labels == k].mean(axis=<span class="code-num">0</span>) <span class="code-keyword">for</span> k <span class="code-keyword">in</span> range(self.K)])' },
        { num: 13, text: '            if np.all(self.centroids == new_centroids): break', html: '            <span class="code-keyword">if</span> np.all(self.centroids == new_centroids): <span class="code-keyword">break</span>' },
        { num: 14, text: '            self.centroids = new_centroids', html: '            self.centroids = new_centroids' },
        { num: 15, text: '        return cluster_labels', html: '        <span class="code-keyword">return</span> cluster_labels' },
        { num: 16, text: '    def predict(self, X):', html: '    <span class="code-keyword">def</span> <span class="code-func">predict</span>(self, X):' },
        { num: 17, text: '        distances = np.sqrt(((X[:, np.newaxis, :] - self.centroids)**2).sum(axis=2))', html: '        distances = np.sqrt(((X[:, np.newaxis, :] - self.centroids)**<span class="code-num">2</span>).sum(axis=<span class="code-num">2</span>))' },
        { num: 18, text: '        return np.argmin(distances, axis=1)', html: '        <span class="code-keyword">return</span> np.argmin(distances, axis=<span class="code-num">1</span>)' },
        { num: 19, text: '    def compute_inertia(self, X, labels):', html: '    <span class="code-keyword">def</span> <span class="code-func">compute_inertia</span>(self, X, labels):' },
        { num: 20, text: '        return sum(np.sum((X[labels == k] - self.centroids[k])**2) for k in range(self.K))', html: '        <span class="code-keyword">return</span> sum(np.sum((X[labels == k] - self.centroids[k])**<span class="code-num">2</span>) <span class="code-keyword">for</span> k <span class="code-keyword">in</span> range(self.K))' }
    ];

    const CODE_EXPLANATIONS = {
        1: { title: "Import NumPy Library", text: "Imports NumPy for fast matrix broadcast broadcasting and distance computations.", math: "\\text{import numpy as np}" },
        2: { title: "K-Means Scratch Class", text: "Encapsulates Lloyd's algorithm for iterative centroid updates and cluster assignment.", math: "\\mathcal{M}_{\\text{KMeans}}" },
        3: { title: "K-Means Constructor", text: "Initializes cluster count K (default 3) and maximum iteration limit.", math: "K = 3, \\quad t_{\\max} = 100" },
        4: { title: "Store Cluster Parameters", text: "Saves target cluster count K and iteration cap instance attributes.", math: "K, \\, t_{\\max}" },
        5: { title: "Initialize Centroids Storage", text: "Prepares variable to store K x P cluster centroid coordinate matrix.", math: "\\mathbf{\\mu} = \\text{None}" },
        6: { title: "Fit Model Method", text: "Executes expectation-maximization iterations until convergence or max_iters limit.", math: "\\text{fit}(\\mathbf{X})" },
        7: { title: "Random Centroid Sample Selection", text: "Draws K distinct sample indices uniformly without replacement from input dataset.", math: "i_1, i_2, \\dots, i_K \\sim U(1, N)" },
        8: { title: "Initialize Centroid Locations", text: "Assigns initial centroid coordinates directly from sampled data points.", math: "\\mathbf{\\mu}_k^{(0)} = \\mathbf{x}_{i_k}" },
        9: { title: "Expectation-Maximization Loop", text: "Iteratively alternates between assignment step and update step.", math: "t = 1, 2, \\dots, t_{\\max}" },
        10: { title: "Compute Pairwise Euclidean Distances", text: "Broadcasts N x 1 x P data against 1 x K x P centroids to compute distances.", math: "d_{i,k} = \\| \\mathbf{x}_i - \\mathbf{\\mu}_k \\|_2" },
        11: { title: "Assign Cluster Membership (argmin)", text: "Assigns each point i to its nearest centroid index k with minimum distance.", math: "c_i = \\arg\\min_{k} \\| \\mathbf{x}_i - \\mathbf{\\mu}_k \\|^2" },
        12: { title: "Recompute Centroid Means", text: "Updates each centroid coordinate to the mean of all points assigned to that cluster.", math: "\\mathbf{\\mu}_k^{(t+1)} = \\frac{1}{|S_k|} \\sum_{i \\in S_k} \\mathbf{x}_i" },
        13: { title: "Check Convergence Criteria", text: "Terminates iteration loop if centroid positions remain unchanged across updates.", math: "\\mathbf{\\mu}^{(t+1)} = \\mathbf{\\mu}^{(t)}" },
        14: { title: "Update Centroids Matrix", text: "Stores updated centroid position coordinates for the next iteration.", math: "\\mathbf{\\mu} \\leftarrow \\mathbf{\\mu}^{(t+1)}" },
        15: { title: "Return Cluster Assignments", text: "Returns array of integer cluster indices c_i for all N input samples.", math: "\\mathbf{c} \\in \\{1, \\dots, K\\}^N" },
        16: { title: "Predict Cluster Labels for New Data", text: "Evaluates nearest centroid index for query samples X.", math: "\\hat{c} = \\arg\\min_k \\| \\mathbf{x}_{\\text{new}} - \\mathbf{\\mu}_k \\|" },
        17: { title: "Query Euclidean Distance Calculation", text: "Calculates distance array from query inputs to all learned centroids.", math: "d(\\mathbf{x}_{\\text{new}}, \\mathbf{\\mu}_k)" },
        18: { title: "Return Nearest Cluster Label", text: "Returns array of assigned cluster labels for test samples.", math: "\\hat{c}_i" },
        19: { title: "Compute Within-Cluster Sum of Squares (Inertia)", text: "Calculates total WCSS distortion metric evaluating clustering compactness.", math: "\\text{WCSS} = \\sum_{k=1}^K \\sum_{i \\in S_k} \\| \\mathbf{x}_i - \\mathbf{\\mu}_k \\|^2" },
        20: { title: "Return Total Inertia Value", text: "Returns scalar inertia score used for Elbow method selection.", math: "\\text{Inertia}" }
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
                    <span style="font-family:var(--font-mono); font-size:0.78rem; font-weight:700; color:#10b981; letter-spacing:0.05em; text-transform:uppercase;">💡 INTERACTIVE LINE-BY-LINE CODE INSPECTOR</span>
                    <span style="font-size:0.78rem; font-weight:600; color:${isLocked ? '#f472b6' : 'var(--text-secondary)'}; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); padding:0.25rem 0.75rem; border-radius:50px;">
                        ${isLocked ? '📌 Line Locked – Click another line or click again to unlock' : '💡 Hovering Line – Click line to lock inspection'}
                    </span>
                </div>

                <div style="margin-bottom:0.75rem;">
                    <span style="background:${isLocked ? 'rgba(244,114,182,0.15)' : 'rgba(16,185,129,0.15)'}; color:${isLocked ? '#f472b6' : '#10b981'}; border:1px solid ${isLocked ? 'rgba(244,114,182,0.3)' : 'rgba(16,185,129,0.3)'}; padding:0.25rem 0.75rem; border-radius:50px; font-size:0.8rem; font-weight:700; font-family:var(--font-mono); display:inline-block;">
                        📌 Line ${selectedLine} ${isLocked ? '(Locked)' : '(Hover preview)'}
                    </span>
                </div>

                <h3 style="font-size:1.25rem; font-weight:700; color:#ffffff; margin:0.5rem 0 1rem 0;">${info.title}</h3>

                <div style="margin-bottom:0.85rem;">
                    <div style="font-weight:700; color:#10b981; font-size:0.88rem; margin-bottom:0.35rem; display:flex; align-items:center; gap:0.4rem;">
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
                        ${info.why || 'Iteratively minimizes total within-cluster sum of squares (WCSS) distortion.'}
                    </p>
                </div>

                ${info.math ? `
                <div style="background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:1rem 1.25rem; margin-top:1rem;">
                    <div style="font-weight:700; color:#a78bfa; font-size:0.85rem; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.4rem;">
                        <span>📐</span> <span>Math Formulation:</span>
                    </div>
                    <div style="margin:0; padding:0; background:transparent; border:none; text-align:center; font-size:1rem; color:#10b981;">
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
            else if (step === 'step2') targetLine = 10;
            else if (step === 'step3') targetLine = 12;
            else if (step === 'step4') targetLine = 15;

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
