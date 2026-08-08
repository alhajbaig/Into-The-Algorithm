/* ════════════════════════════════════════════════════════════
   LINEAR REGRESSION — Interactive Educational App
   All computations run client-side in pure JavaScript
   ════════════════════════════════════════════════════════════ */

// ─── Utility : Linear Regression Engine ────────────────────
class LinearRegression {
    constructor() {
        this.slope = 0;
        this.intercept = 0;
        this.r2 = 0;
        this.mse = 0;
        this.mae = 0;
        this.predictions = [];
        this.residuals = [];
    }

    fit(xArr, yArr) {
        const n = xArr.length;
        if (n < 2) throw new Error('Need at least 2 data points');

        const meanX = xArr.reduce((a, b) => a + b, 0) / n;
        const meanY = yArr.reduce((a, b) => a + b, 0) / n;

        let num = 0, den = 0;
        for (let i = 0; i < n; i++) {
            num += (xArr[i] - meanX) * (yArr[i] - meanY);
            den += (xArr[i] - meanX) ** 2;
        }

        this.slope = den !== 0 ? num / den : 0;
        this.intercept = meanY - this.slope * meanX;

        // Predictions & Residuals
        this.predictions = xArr.map(x => this.slope * x + this.intercept);
        this.residuals = yArr.map((y, i) => y - this.predictions[i]);

        // MSE
        this.mse = this.residuals.reduce((a, r) => a + r * r, 0) / n;

        // MAE
        this.mae = this.residuals.reduce((a, r) => a + Math.abs(r), 0) / n;

        // R²
        const ssRes = this.residuals.reduce((a, r) => a + r * r, 0);
        const ssTot = yArr.reduce((a, y) => a + (y - meanY) ** 2, 0);
        this.r2 = ssTot !== 0 ? 1 - ssRes / ssTot : 0;

        return this;
    }

    predict(x) {
        return this.slope * x + this.intercept;
    }
}

// ─── Sample Datasets ──────────────────────────────────────
const DATASETS = {
    housing: {
        name: 'House Size vs Price',
        xLabel: 'Size (sq ft)',
        yLabel: 'Price ($1000s)',
        x: [650, 785, 1100, 1250, 1400, 1550, 1700, 1850, 2000, 2150, 2300, 2500, 2700, 2900, 3100, 3300, 3500, 3800, 4000, 4200],
        y: [115, 142, 169, 195, 215, 248, 270, 295, 320, 345, 370, 410, 435, 470, 500, 530, 565, 610, 640, 685]
    },
    experience: {
        name: 'Experience vs Salary',
        xLabel: 'Years of Experience',
        yLabel: 'Salary ($1000s)',
        x: [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20],
        y: [35, 38, 42, 40, 48, 50, 55, 53, 60, 65, 72, 78, 82, 90, 95, 100, 112, 120, 132, 140]
    },
    study: {
        name: 'Study Hours vs Score',
        xLabel: 'Hours Studied',
        yLabel: 'Exam Score',
        x: [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5],
        y: [30, 33, 38, 42, 45, 50, 52, 58, 60, 64, 68, 70, 74, 76, 80, 83, 85, 88, 92, 95]
    }
};

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

// Default chart options
Chart.defaults.color = COLORS.gridTick;
Chart.defaults.borderColor = COLORS.grid;
Chart.defaults.font.family = "'Inter', sans-serif";

function chartBase(type) {
    return {
        responsive: true,
        maintainAspectRatio: true,
        animation: { duration: 800, easing: 'easeOutQuart' },
        plugins: {
            legend: {
                labels: { padding: 16, usePointStyle: true, pointStyleWidth: 10, font: { size: 12 } }
            }
        },
        scales: type === 'bar-horizontal' ? undefined : (type === 'pie' ? undefined : {
            x: { grid: { color: COLORS.grid }, ticks: { font: { size: 11 } } },
            y: { grid: { color: COLORS.grid }, ticks: { font: { size: 11 } } }
        })
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
        ctx.scale(dpr, dpr);
    }
    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.getBoundingClientRect().width;
    const H = () => canvas.getBoundingClientRect().height;

    // Generate noisy linear data
    const N = 30;
    const points = [];
    for (let i = 0; i < N; i++) {
        const t = i / (N - 1);
        points.push({
            x: 0.1 + t * 0.8,
            y: 0.15 + t * 0.65 + (Math.random() - 0.5) * 0.18,
            phase: Math.random() * Math.PI * 2,
            appear: i * 0.07,
            radius: 3.5 + Math.random() * 2
        });
    }

    let startTime = null;
    const POINT_DURATION = 0.6;
    const LINE_START = N * 0.07 + 0.3;
    const LINE_DURATION = 1.2;

    // Best fit line for the generated points
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const lr = new LinearRegression().fit(xs, ys);

    function draw(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = (timestamp - startTime) / 1000;

        const w = W(), h = H();
        ctx.clearRect(0, 0, w, h);

        // Draw grid
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        for (let i = 1; i < 8; i++) {
            const gx = (i / 8) * w;
            ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
            const gy = (i / 8) * h;
            ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
        }

        // Draw axes labels
        ctx.font = '11px Inter, sans-serif';
        ctx.fillStyle = 'rgba(148,163,184,0.5)';
        ctx.fillText('Feature (X)', w / 2 - 30, h - 8);
        ctx.save();
        ctx.translate(14, h / 2 + 20);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Target (Y)', 0, 0);
        ctx.restore();

        // Draw points with staggered appearance
        points.forEach((p, i) => {
            const t = Math.max(0, Math.min(1, (elapsed - p.appear) / POINT_DURATION));
            if (t <= 0) return;

            const ease = 1 - Math.pow(1 - t, 3);
            const px = p.x * w;
            const py = (1 - p.y) * h;

            // Gentle floating
            const floatY = Math.sin(elapsed * 1.2 + p.phase) * 2;

            // Glow
            const grd = ctx.createRadialGradient(px, py + floatY, 0, px, py + floatY, 18 * ease);
            grd.addColorStop(0, 'rgba(96, 165, 250, 0.3)');
            grd.addColorStop(1, 'rgba(96, 165, 250, 0)');
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(px, py + floatY, 18 * ease, 0, Math.PI * 2);
            ctx.fill();

            // Point
            ctx.fillStyle = `rgba(96, 165, 250, ${0.9 * ease})`;
            ctx.beginPath();
            ctx.arc(px, py + floatY, p.radius * ease, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = `rgba(255,255,255, ${0.3 * ease})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        // Draw regression line
        const lineProg = Math.max(0, Math.min(1, (elapsed - LINE_START) / LINE_DURATION));
        if (lineProg > 0) {
            const ease = 1 - Math.pow(1 - lineProg, 3);
            const x1 = 0.05 * w;
            const x2Raw = 0.95 * w;
            const x2 = x1 + (x2Raw - x1) * ease;

            const y1 = (1 - lr.predict(0.05)) * h;
            const y2 = (1 - lr.predict(0.05 + 0.9 * ease)) * h;

            // Line glow
            ctx.strokeStyle = 'rgba(248, 113, 113, 0.15)';
            ctx.lineWidth = 8;
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();

            // Line
            const lineGrad = ctx.createLinearGradient(x1, y1, x2, y2);
            lineGrad.addColorStop(0, 'rgba(248, 113, 113, 0.9)');
            lineGrad.addColorStop(1, 'rgba(251, 191, 36, 0.9)');
            ctx.strokeStyle = lineGrad;
            ctx.lineWidth = 3;
            ctx.setLineDash([]);
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();

            // Label
            if (ease > 0.8) {
                const labelAlpha = (ease - 0.8) / 0.2;
                ctx.font = 'bold 13px JetBrains Mono, monospace';
                ctx.fillStyle = `rgba(248, 113, 113, ${labelAlpha})`;
                ctx.fillText('ŷ = β₀ + β₁x', x2 - 110, y2 - 12);
            }
        }

        // Loop with restart
        if (elapsed > LINE_START + LINE_DURATION + 3) {
            startTime = timestamp;
        }

        requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
}

// ─── Render Sample Table ──────────────────────────────────
function renderSampleTable(datasetKey) {
    const ds = DATASETS[datasetKey];
    const tbody = document.querySelector('#sampleTable tbody');
    const thead = document.querySelector('#sampleTable thead tr');
    thead.innerHTML = `<th>#</th><th>${ds.xLabel}</th><th>${ds.yLabel}</th>`;
    tbody.innerHTML = '';
    ds.x.forEach((xv, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${i + 1}</td><td>${xv}</td><td>${ds.y[i]}</td>`;
        tbody.appendChild(tr);
    });
}

// ─── Train & Visualise Sample ─────────────────────────────
function trainSampleModel(datasetKey) {
    const ds = DATASETS[datasetKey];
    const lr = new LinearRegression().fit(ds.x, ds.y);

    // Show metrics
    const mEl = document.getElementById('sampleMetrics');
    mEl.style.display = 'grid';
    document.getElementById('metricR2').textContent = lr.r2.toFixed(4);
    document.getElementById('metricMSE').textContent = lr.mse.toFixed(2);
    document.getElementById('metricMAE').textContent = lr.mae.toFixed(2);
    document.getElementById('metricSlope').textContent = lr.slope.toFixed(4);
    document.getElementById('metricIntercept').textContent = lr.intercept.toFixed(4);
    document.getElementById('metricEq').textContent =
        `ŷ = ${lr.intercept.toFixed(2)} + ${lr.slope.toFixed(4)}·x`;

    // Show charts container
    document.getElementById('sampleCharts').style.display = 'grid';

    // 1. Scatter + Best-fit line
    renderScatter('scatterChart', ds.x, ds.y, lr, ds.xLabel, ds.yLabel);

    // 2. Actual vs Predicted
    renderActualVsPred('actualVsPredChart', ds.y, lr.predictions);

    // 3. Residuals
    renderResiduals('residualsChart', ds.x, lr.residuals, ds.xLabel);

    // 4. Residual Histogram
    renderResidualHist('residualHistChart', lr.residuals);

    // 5. Metrics Bar
    renderMetricsBar('metricsBarChart', lr);

    // 6. Error Breakdown
    renderErrorBar('errorBarChart', ds.y, lr.predictions);
}

// ─── Chart Renderers ──────────────────────────────────────
function renderScatter(canvasId, xData, yData, lr, xLabel, yLabel) {
    destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext('2d');

    // Regression line points
    const xMin = Math.min(...xData);
    const xMax = Math.max(...xData);
    const lineData = [
        { x: xMin, y: lr.predict(xMin) },
        { x: xMax, y: lr.predict(xMax) }
    ];

    charts[canvasId] = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Data Points',
                    data: xData.map((x, i) => ({ x, y: yData[i] })),
                    backgroundColor: COLORS.accentFade,
                    borderColor: COLORS.accent,
                    borderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 9,
                },
                {
                    label: 'Best-Fit Line',
                    data: lineData,
                    type: 'line',
                    borderColor: COLORS.red,
                    borderWidth: 3,
                    pointRadius: 0,
                    fill: false,
                    tension: 0
                }
            ]
        },
        options: {
            ...chartBase('scatter'),
            scales: {
                x: { title: { display: true, text: xLabel, color: COLORS.gridTick }, grid: { color: COLORS.grid } },
                y: { title: { display: true, text: yLabel, color: COLORS.gridTick }, grid: { color: COLORS.grid } }
            }
        }
    });
}

function renderActualVsPred(canvasId, actual, predicted) {
    destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext('2d');

    const mn = Math.min(...actual, ...predicted);
    const mx = Math.max(...actual, ...predicted);

    charts[canvasId] = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Points',
                    data: actual.map((a, i) => ({ x: a, y: predicted[i] })),
                    backgroundColor: COLORS.purpleFade,
                    borderColor: COLORS.purple,
                    borderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 9,
                },
                {
                    label: 'Perfect Prediction',
                    data: [{ x: mn, y: mn }, { x: mx, y: mx }],
                    type: 'line',
                    borderColor: COLORS.green,
                    borderWidth: 2,
                    borderDash: [6, 4],
                    pointRadius: 0,
                    fill: false,
                    tension: 0
                }
            ]
        },
        options: {
            ...chartBase('scatter'),
            scales: {
                x: { title: { display: true, text: 'Actual', color: COLORS.gridTick }, grid: { color: COLORS.grid } },
                y: { title: { display: true, text: 'Predicted', color: COLORS.gridTick }, grid: { color: COLORS.grid } }
            }
        }
    });
}

function renderResiduals(canvasId, xData, residuals, xLabel) {
    destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext('2d');

    charts[canvasId] = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Residuals',
                    data: xData.map((x, i) => ({ x, y: residuals[i] })),
                    backgroundColor: residuals.map(r => r >= 0 ? COLORS.greenFade : COLORS.redFade),
                    borderColor: residuals.map(r => r >= 0 ? COLORS.green : COLORS.red),
                    borderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 9,
                },
                {
                    label: 'Zero Line',
                    data: [
                        { x: Math.min(...xData), y: 0 },
                        { x: Math.max(...xData), y: 0 }
                    ],
                    type: 'line',
                    borderColor: 'rgba(255,255,255,0.3)',
                    borderWidth: 1.5,
                    borderDash: [6, 4],
                    pointRadius: 0,
                    fill: false,
                    tension: 0
                }
            ]
        },
        options: {
            ...chartBase('scatter'),
            scales: {
                x: { title: { display: true, text: xLabel || 'X', color: COLORS.gridTick }, grid: { color: COLORS.grid } },
                y: { title: { display: true, text: 'Residual (y - ŷ)', color: COLORS.gridTick }, grid: { color: COLORS.grid } }
            }
        }
    });
}

function renderResidualHist(canvasId, residuals) {
    destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext('2d');

    // Build histogram bins
    const mn = Math.min(...residuals);
    const mx = Math.max(...residuals);
    const binCount = Math.max(5, Math.min(15, Math.ceil(Math.sqrt(residuals.length))));
    const binWidth = (mx - mn) / binCount || 1;
    const bins = Array(binCount).fill(0);
    const labels = [];

    for (let i = 0; i < binCount; i++) {
        const lo = mn + i * binWidth;
        const hi = lo + binWidth;
        labels.push(`${lo.toFixed(1)}`);
        residuals.forEach(r => {
            if (i === binCount - 1 ? r >= lo && r <= hi : r >= lo && r < hi) bins[i]++;
        });
    }

    charts[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Frequency',
                data: bins,
                backgroundColor: COLORS.purpleFade,
                borderColor: COLORS.purple,
                borderWidth: 1.5,
                borderRadius: 4,
            }]
        },
        options: {
            ...chartBase('bar'),
            scales: {
                x: { title: { display: true, text: 'Residual Value', color: COLORS.gridTick }, grid: { color: COLORS.grid } },
                y: { title: { display: true, text: 'Count', color: COLORS.gridTick }, grid: { color: COLORS.grid }, beginAtZero: true }
            }
        }
    });
}

function renderMetricsBar(canvasId, lr) {
    destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext('2d');

    // Normalise MAE and RMSE to 0-1 scale for visual comparison
    const rmse = Math.sqrt(lr.mse);
    const maxErr = Math.max(lr.mae, rmse, 1);

    charts[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['R² Score', 'MAE (norm)', 'RMSE (norm)'],
            datasets: [{
                label: 'Metric Value',
                data: [lr.r2, lr.mae / maxErr, rmse / maxErr],
                backgroundColor: [COLORS.greenFade, COLORS.yellowFade, COLORS.redFade],
                borderColor: [COLORS.green, COLORS.yellow, COLORS.red],
                borderWidth: 2,
                borderRadius: 6,
                barPercentage: 0.6,
            }]
        },
        options: {
            ...chartBase('bar'),
            indexAxis: 'y',
            scales: {
                x: { min: 0, max: 1.05, grid: { color: COLORS.grid }, ticks: { font: { size: 11 } } },
                y: { grid: { color: COLORS.grid }, ticks: { font: { size: 12, weight: '600' } } }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function renderErrorBar(canvasId, actual, predicted) {
    destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext('2d');

    const labels = actual.map((_, i) => `#${i + 1}`);
    const errors = actual.map((a, i) => Math.abs(a - predicted[i]));

    charts[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Absolute Error',
                data: errors,
                backgroundColor: errors.map(e => {
                    const maxE = Math.max(...errors);
                    const t = maxE > 0 ? e / maxE : 0;
                    return `rgba(${Math.round(248 * t + 52 * (1 - t))}, ${Math.round(113 * t + 211 * (1 - t))}, ${Math.round(113 * t + 153 * (1 - t))}, 0.6)`;
                }),
                borderColor: errors.map(e => {
                    const maxE = Math.max(...errors);
                    const t = maxE > 0 ? e / maxE : 0;
                    return `rgba(${Math.round(248 * t + 52 * (1 - t))}, ${Math.round(113 * t + 211 * (1 - t))}, ${Math.round(113 * t + 153 * (1 - t))}, 1)`;
                }),
                borderWidth: 1.5,
                borderRadius: 4,
            }]
        },
        options: {
            ...chartBase('bar'),
            scales: {
                x: { title: { display: true, text: 'Data Point', color: COLORS.gridTick }, grid: { color: COLORS.grid } },
                y: { title: { display: true, text: '|Error|', color: COLORS.gridTick }, grid: { color: COLORS.grid }, beginAtZero: true }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// ─── Playground : CSV Parsing ─────────────────────────────
function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) throw new Error('CSV must have a header row + data.');

    // Detect delimiter
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
    const xSel = document.getElementById('xColSelect');
    const ySel = document.getElementById('yColSelect');
    const tableDiv = document.getElementById('csvTablePreview');

    // Populate selects
    xSel.innerHTML = '';
    ySel.innerHTML = '';
    parsed.headers.forEach((h, i) => {
        xSel.innerHTML += `<option value="${i}">${h}</option>`;
        ySel.innerHTML += `<option value="${i}" ${i === 1 ? 'selected' : ''}>${h}</option>`;
    });
    if (parsed.headers.length > 1) ySel.value = '1';

    // Table
    let html = '<table><thead><tr>';
    parsed.headers.forEach(h => html += `<th>${h}</th>`);
    html += '</tr></thead><tbody>';
    const maxRows = Math.min(parsed.rows.length, 50);
    for (let i = 0; i < maxRows; i++) {
        html += '<tr>';
        parsed.rows[i].forEach(c => html += `<td>${c}</td>`);
        html += '</tr>';
    }
    if (parsed.rows.length > 50) html += `<tr><td colspan="${parsed.headers.length}" style="text-align:center;color:var(--text-muted);">... ${parsed.rows.length - 50} more rows</td></tr>`;
    html += '</tbody></table>';
    tableDiv.innerHTML = html;

    preview.style.display = 'block';
}

// ─── Playground : Manual Entry ────────────────────────────
function addManualRow(xVal = '', yVal = '') {
    const container = document.getElementById('manualRows');
    const row = document.createElement('div');
    row.className = 'manual-row';
    row.innerHTML = `
        <input type="number" step="any" placeholder="X" value="${xVal}">
        <input type="number" step="any" placeholder="Y" value="${yVal}">
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
    const xs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const ys = [2.1, 4.3, 5.8, 8.2, 10.1, 11.9, 14.0, 16.2, 17.8, 20.1];
    xs.forEach((x, i) => addManualRow(x, ys[i]));
}

// ─── Playground : Train Custom ────────────────────────────
function trainCustomModel() {
    let xData = [], yData = [], xLabel = 'X', yLabel = 'Y';

    const activeTab = document.querySelector('.tab-content.active').id;

    if (activeTab === 'tab-csv') {
        // CSV mode
        const xIdx = parseInt(document.getElementById('xColSelect').value);
        const yIdx = parseInt(document.getElementById('yColSelect').value);
        if (isNaN(xIdx) || isNaN(yIdx)) { alert('Please select X and Y columns.'); return; }

        const tableDiv = document.getElementById('csvTablePreview');
        const trs = tableDiv.querySelectorAll('tbody tr');
        trs.forEach(tr => {
            const tds = tr.querySelectorAll('td');
            if (tds.length > Math.max(xIdx, yIdx)) {
                const xv = parseFloat(tds[xIdx].textContent);
                const yv = parseFloat(tds[yIdx].textContent);
                if (!isNaN(xv) && !isNaN(yv)) { xData.push(xv); yData.push(yv); }
            }
        });

        const xSel = document.getElementById('xColSelect');
        const ySel = document.getElementById('yColSelect');
        xLabel = xSel.options[xSel.selectedIndex].text;
        yLabel = ySel.options[ySel.selectedIndex].text;
    } else {
        // Manual mode
        xLabel = document.getElementById('xLabel').value || 'X';
        yLabel = document.getElementById('yLabel').value || 'Y';
        document.querySelectorAll('.manual-row').forEach(row => {
            const inputs = row.querySelectorAll('input');
            const xv = parseFloat(inputs[0].value);
            const yv = parseFloat(inputs[1].value);
            if (!isNaN(xv) && !isNaN(yv)) { xData.push(xv); yData.push(yv); }
        });
    }

    if (xData.length < 2) {
        alert('Please provide at least 2 valid data points.');
        return;
    }

    const lr = new LinearRegression().fit(xData, yData);

    // Show results
    const results = document.getElementById('customResults');
    results.style.display = 'block';
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Metrics
    document.getElementById('cMetricR2').textContent = lr.r2.toFixed(4);
    document.getElementById('cMetricMSE').textContent = lr.mse.toFixed(4);
    document.getElementById('cMetricMAE').textContent = lr.mae.toFixed(4);
    document.getElementById('cMetricSlope').textContent = lr.slope.toFixed(4);
    document.getElementById('cMetricIntercept').textContent = lr.intercept.toFixed(4);
    document.getElementById('cMetricEq').textContent =
        `ŷ = ${lr.intercept.toFixed(2)} + ${lr.slope.toFixed(4)}·x`;

    // Charts
    renderScatter('cScatterChart', xData, yData, lr, xLabel, yLabel);
    renderActualVsPred('cActualVsPredChart', yData, lr.predictions);
    renderResiduals('cResidualsChart', xData, lr.residuals, xLabel);
    renderResidualHist('cResidualHistChart', lr.residuals);

    // Store model for prediction
    window._customLR = lr;
    document.getElementById('predictResult').style.display = 'none';
}

// ─── Intersection Observer for Animations ─────────────────
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
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
        // Shrink on scroll
        if (window.scrollY > 50) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');

        // Active link
        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop - 120;
            if (window.scrollY >= top) current = section.id;
        });
        links.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
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
        // Retry after scripts load
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

    // Hero animation
    initHeroAnimation();

    // Navbar
    initNavbar();

    // Scroll animations
    initScrollAnimations();

    // Load default sample dataset
    renderSampleTable('housing');

    // ── Event Listeners ─────────────────────
    // Sample dataset selector
    document.getElementById('sampleDatasetSelect').addEventListener('change', (e) => {
        renderSampleTable(e.target.value);
        document.getElementById('sampleMetrics').style.display = 'none';
        document.getElementById('sampleCharts').style.display = 'none';
    });

    // Train sample
    document.getElementById('trainSampleBtn').addEventListener('click', () => {
        const key = document.getElementById('sampleDatasetSelect').value;
        trainSampleModel(key);
    });

    // Tab switching
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

    // Drag & drop
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

    // Manual entry
    initManualRows(5);
    document.getElementById('addRowBtn').addEventListener('click', () => addManualRow());
    document.getElementById('clearRowsBtn').addEventListener('click', () => initManualRows(5));
    document.getElementById('loadExampleBtn').addEventListener('click', loadExampleData);

    // Train custom
    document.getElementById('trainCustomBtn').addEventListener('click', trainCustomModel);

    // Predict
    document.getElementById('predictBtn').addEventListener('click', () => {
        const lr = window._customLR;
        if (!lr) { alert('Train a model first!'); return; }
        const xv = parseFloat(document.getElementById('predictInput').value);
        if (isNaN(xv)) { alert('Enter a valid number.'); return; }
        const yPred = lr.predict(xv);
        const result = document.getElementById('predictResult');
        result.textContent = `Predicted ŷ = ${yPred.toFixed(4)}`;
        result.style.display = 'block';
    });
});
