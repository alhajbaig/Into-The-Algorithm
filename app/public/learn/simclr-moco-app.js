/* ════════════════════════════════════════════════════════════
   SimCLR & MoCo Application
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

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 130;

    const pairs = [];
    for (let i = 0; i < 6; i++) {
        const baseAngle = (i / 6) * Math.PI * 2;
        pairs.push({
            a1: baseAngle - 0.1,
            a2: baseAngle + 0.1,
            targetAngle: baseAngle,
            color: `hsl(${i * 60}, 80%, 65%)`
        });
    }

    let t = 0;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        t += 0.02;

        // Draw Unit Circle
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        pairs.forEach(p => {
            p.a1 += Math.sin(t) * 0.005;
            p.a2 -= Math.sin(t) * 0.005;

            const x1 = centerX + Math.cos(p.a1) * radius;
            const y1 = centerY + Math.sin(p.a1) * radius;
            const x2 = centerX + Math.cos(p.a2) * radius;
            const y2 = centerY + Math.sin(p.a2) * radius;

            // Draw positive arc connector
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, p.a1, p.a2);
            ctx.stroke();

            // Draw positive projection dots
            ctx.beginPath();
            ctx.arc(x1, y1, 6, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x2, y2, 6, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
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
        { num: 1, text: 'import torch', html: '<span class="code-keyword">import</span> torch' },
        { num: 2, text: 'import torch.nn as nn', html: '<span class="code-keyword">import</span> torch.nn <span class="code-keyword">as</span> nn' },
        { num: 3, text: 'import torch.nn.functional as F', html: '<span class="code-keyword">import</span> torch.nn.functional <span class="code-keyword">as</span> F' },
        { num: 4, text: 'class SimCLR(nn.Module):', html: '<span class="code-keyword">class</span> <span class="code-func">SimCLR</span>(nn.Module):' },
        { num: 5, text: '    def __init__(self, encoder, out_dim=128):', html: '    <span class="code-keyword">def</span> <span class="code-func">__init__</span>(self, encoder, out_dim=<span class="code-num">128</span>):' },
        { num: 6, text: '        super().__init__()', html: '        super().__init__()' },
        { num: 7, text: '        self.encoder = encoder', html: '        self.encoder = encoder' },
        { num: 8, text: '        self.projector = nn.Sequential(nn.Linear(2048, 512), nn.ReLU(), nn.Linear(512, out_dim))', html: '        self.projector = nn.Sequential(nn.Linear(<span class="code-num">2048</span>, <span class="code-num">512</span>), nn.ReLU(), nn.Linear(<span class="code-num">512</span>, out_dim))' },
        { num: 9, text: '    def forward(self, x1, x2):', html: '    <span class="code-keyword">def</span> <span class="code-func">forward</span>(self, x1, x2):' },
        { num: 10, text: '        z1 = F.normalize(self.projector(self.encoder(x1)), dim=1)', html: '        z1 = F.normalize(self.projector(self.encoder(x1)), dim=<span class="code-num">1</span>)' },
        { num: 11, text: '        z2 = F.normalize(self.projector(self.encoder(x2)), dim=1)', html: '        z2 = F.normalize(self.projector(self.encoder(x2)), dim=<span class="code-num">1</span>)' },
        { num: 12, text: '        return z1, z2', html: '        <span class="code-keyword">return</span> z1, z2' },
        { num: 13, text: 'def nt_xent_loss(z1, z2, temperature=0.15):', html: '<span class="code-keyword">def</span> <span class="code-func">nt_xent_loss</span>(z1, z2, temperature=<span class="code-num">0.15</span>):' },
        { num: 14, text: '    N = z1.shape[0]', html: '    N = z1.shape[<span class="code-num">0</span>]' },
        { num: 15, text: '    z = torch.cat([z1, z2], dim=0)', html: '    z = torch.cat([z1, z2], dim=<span class="code-num">0</span>)' },
        { num: 16, text: '    sim = torch.mm(z, z.T) / temperature', html: '    sim = torch.mm(z, z.T) / temperature' },
        { num: 17, text: '    sim.fill_diagonal_(-float("inf"))', html: '    sim.fill_diagonal_(-float(<span class="code-string">"inf"</span>))' },
        { num: 18, text: '    labels = torch.cat([torch.arange(N, 2*N), torch.arange(0, N)])', html: '    labels = torch.cat([torch.arange(N, <span class="code-num">2</span>*N), torch.arange(<span class="code-num">0</span>, N)])' },
        { num: 19, text: '    loss = F.cross_entropy(sim, labels)', html: '    loss = F.cross_entropy(sim, labels)' },
        { num: 20, text: '    return loss', html: '    <span class="code-keyword">return</span> loss' }
    ];

    const CODE_EXPLANATIONS = {
        1: { title: "Import PyTorch Engine", text: "Imports PyTorch autograd engine.", math: "\\text{import torch}" },
        2: { title: "Import Neural Network Layers", text: "Imports nn layer components.", math: "\\text{import torch.nn as nn}" },
        3: { title: "Import Functional Operations", text: "Imports L2 normalization and loss primitives.", math: "F.normalize" },
        4: { title: "SimCLR Architecture Class", text: "Encapsulates backbone encoder f(.) and projection head g(.).", math: "\\mathcal{M}_{\\text{SimCLR}}" },
        5: { title: "SimCLR Constructor", text: "Sets base backbone encoder (e.g. ResNet-50) and output projection dim.", math: "d_{out} = 128" },
        6: { title: "Call Parent Constructor", text: "Initializes PyTorch base module.", math: "\\text{super().\_\_init\_\_()}" },
        7: { title: "Save Encoder Trunk", text: "Stores reference to feature backbone f(x).", math: "h = f(x) \\in \\mathbb{R}^{2048}" },
        8: { title: "2-Layer MLP Projection Head", text: "Non-linear projection head g(h) mapping features to hypersphere space.", math: "z = g(h) = \\mathbf{W}_2 \\sigma(\\mathbf{W}_1 h)" },
        9: { title: "Forward Dual View Pass", text: "Receives pair of augmented views x1 and x2 from same input image.", math: "(x_1, x_2) = (t(x), t'(x))" },
        10: { title: "Encode & Normalize First View", text: "Passes x1 through backbone, projector, and applies L2 unit sphere normalization.", math: "z_1 = \\frac{g(f(x_1))}{\\|g(f(x_1))\\|_2}" },
        11: { title: "Encode & Normalize Second View", text: "Passes x2 through backbone, projector, and applies L2 unit sphere normalization.", math: "z_2 = \\frac{g(f(x_2))}{\\|g(f(x_2))\\|_2}" },
        12: { title: "Return Normalized Embeddings", text: "Returns dual L2 normalized projection vectors z1 and z2.", math: "(z_1, z_2) \\in \\mathbb{S}^{d-1}" },
        13: { title: "NT-Xent Loss Function", text: "Evaluates Normalized Temperature-scaled Cross Entropy loss over batch.", math: "\\mathcal{L}_{NT-Xent}" },
        14: { title: "Get Batch Sample Count", text: "Extracts original batch size N.", math: "N = |\\mathcal{B}|" },
        15: { title: "Concatenate Dual View Embeddings", text: "Stacks z1 and z2 into 2N x d combined embedding matrix.", math: "\\mathbf{Z} \\in \\mathbb{R}^{2N \\times d}" },
        16: { title: "Compute Cosine Similarity Matrix", text: "Calculates full 2N x 2N pairwise cosine dot products scaled by temperature tau.", math: "\\mathbf{S}_{ij} = \\frac{z_i^T z_j}{\\tau}" },
        17: { title: "Mask Self-Similarities", text: "Sets diagonal self-similarities S_ii to negative infinity.", math: "S_{ii} = -\\infty" },
        18: { title: "Construct Positive Pair Index Targets", text: "Pairs index i with (i + N) as ground truth positive targets.", math: "\\text{labels}_i = (i + N) \\pmod{2N}" },
        19: { title: "Compute Cross Entropy Loss", text: "Evaluates categorical cross-entropy pulling positive pairs together.", math: "\\ell_{i, j} = -\\log \\frac{\\exp(\\mathbf{S}_{i, j})}{\\sum_k \\exp(\\mathbf{S}_{i, k})}" },
        20: { title: "Return InfoNCE Loss Scalar", text: "Returns batch mean scalar InfoNCE loss value.", math: "\\mathcal{L}_{InfoNCE}" }
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
                    <span style="font-family:var(--font-mono); font-size:0.78rem; font-weight:700; color:#06b6d4; letter-spacing:0.05em; text-transform:uppercase;">💡 INTERACTIVE LINE-BY-LINE CODE INSPECTOR</span>
                    <span style="font-size:0.78rem; font-weight:600; color:${isLocked ? '#f472b6' : 'var(--text-secondary)'}; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); padding:0.25rem 0.75rem; border-radius:50px;">
                        ${isLocked ? '📌 Line Locked – Click another line or click again to unlock' : '💡 Hovering Line – Click line to lock inspection'}
                    </span>
                </div>

                <div style="margin-bottom:0.75rem;">
                    <span style="background:${isLocked ? 'rgba(244,114,182,0.15)' : 'rgba(6,182,212,0.15)'}; color:${isLocked ? '#f472b6' : '#06b6d4'}; border:1px solid ${isLocked ? 'rgba(244,114,182,0.3)' : 'rgba(6,182,212,0.3)'}; padding:0.25rem 0.75rem; border-radius:50px; font-size:0.8rem; font-weight:700; font-family:var(--font-mono); display:inline-block;">
                        📌 Line ${selectedLine} ${isLocked ? '(Locked)' : '(Hover preview)'}
                    </span>
                </div>

                <h3 style="font-size:1.25rem; font-weight:700; color:#ffffff; margin:0.5rem 0 1rem 0;">${info.title}</h3>

                <div style="margin-bottom:0.85rem;">
                    <div style="font-weight:700; color:#06b6d4; font-size:0.88rem; margin-bottom:0.35rem; display:flex; align-items:center; gap:0.4rem;">
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
                        ${info.why || 'Enforces alignment between positive views while uniformly dispersing negatives across unit sphere.'}
                    </p>
                </div>

                ${info.math ? `
                <div style="background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:1rem 1.25rem; margin-top:1rem;">
                    <div style="font-weight:700; color:#a78bfa; font-size:0.85rem; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.4rem;">
                        <span>📐</span> <span>Math Formulation:</span>
                    </div>
                    <div style="margin:0; padding:0; background:transparent; border:none; text-align:center; font-size:1rem; color:#06b6d4;">
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
            else if (step === 'step4') targetLine = 19;

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
    let epoch = 0;

    const pairs = [
        { id: 1, aug1: 'Color Jitter + Crop', aug2: 'GaussianBlur + Flip', sim: 0.88, loss: 0.14 },
        { id: 2, aug1: 'Random Solarize', aug2: 'Grayscale + Crop', sim: 0.82, loss: 0.22 },
        { id: 3, aug1: 'Horizontal Flip', aug2: 'Random Resized Crop', sim: 0.94, loss: 0.08 }
    ];

    function renderTable() {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        pairs.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>Pair #${p.id}</td>
                <td><span style="color:#06b6d4; font-weight:600;">${p.aug1}</span></td>
                <td><span style="color:#3b82f6; font-weight:600;">${p.aug2}</span></td>
                <td>${p.sim.toFixed(2)}</td>
                <td>${p.loss.toFixed(3)}</td>
            `;
            tableBody.appendChild(tr);
        });

        document.getElementById('metricEpoch').textContent = epoch;
        document.getElementById('metricInfoNCE').textContent = (1.85 / (epoch + 1)).toFixed(3);
        document.getElementById('metricPosSim').textContent = (0.75 + epoch * 0.02).toFixed(2);
        document.getElementById('metricProbeAcc').textContent = `${(68.5 + epoch * 2.1).toFixed(1)}%`;
    }

    const ctxLoss = document.getElementById('chartLoss')?.getContext('2d');
    const ctxProbe = document.getElementById('chartProbe')?.getContext('2d');

    if (ctxLoss) {
        new Chart(ctxLoss, {
            type: 'line',
            data: {
                labels: ['E0', 'E20', 'E40', 'E60', 'E80', 'E100'],
                datasets: [{ label: 'InfoNCE Loss', data: [3.8, 2.4, 1.8, 1.3, 0.9, 0.6], borderColor: '#06b6d4', fill: false }]
            },
            options: { responsive: true, plugins: { legend: { display: false } } }
        });
    }

    if (ctxProbe) {
        new Chart(ctxProbe, {
            type: 'line',
            data: {
                labels: ['E0', 'E20', 'E40', 'E60', 'E80', 'E100'],
                datasets: [{ label: 'Linear Probe Acc (%)', data: [45, 62, 73, 81, 86, 89], borderColor: '#3b82f6', fill: true, backgroundColor: 'rgba(59,130,246,0.1)' }]
            },
            options: { responsive: true, plugins: { legend: { display: false } } }
        });
    }

    if (trainBtn) {
        trainBtn.addEventListener('click', () => {
            epoch += 10;
            renderTable();
        });
    }

    renderTable();
}

/* ── Interactive Playground ───────────────────────────── */
function initPlayground() {
    const canvas = document.getElementById('simclrCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const sliderTau = document.getElementById('sliderTau');
    const sliderNoise = document.getElementById('sliderNoise');
    const valTau = document.getElementById('valTau');
    const valNoise = document.getElementById('valNoise');
    const presetBtns = document.querySelectorAll('.preset-btn');
    const btnStep = document.getElementById('btnStepOpt');
    const btnReset = document.getElementById('btnResetPlayground');
    const lblAlign = document.getElementById('lblAlign');
    const lblUniform = document.getElementById('lblUniform');

    let tau = 0.15;
    let noise = 0.20;
    let points = [];

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 180;

    function generatePreset(type) {
        points = [];
        if (type === 'clustered') {
            for (let c = 0; c < 3; c++) {
                const baseAngle = (c / 3) * Math.PI * 2;
                for (let i = 0; i < 6; i++) {
                    const a = baseAngle + (Math.random() - 0.5) * noise;
                    points.push({ angle: a, cls: c });
                }
            }
        } else {
            for (let i = 0; i < 18; i++) {
                points.push({ angle: Math.random() * Math.PI * 2, cls: i % 3 });
            }
        }
        render();
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Unit Hypersphere S1
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw Points
        points.forEach(p => {
            const x = centerX + Math.cos(p.angle) * radius;
            const y = centerY + Math.sin(p.angle) * radius;
            ctx.beginPath();
            ctx.arc(x, y, 7, 0, Math.PI * 2);
            ctx.fillStyle = p.cls === 0 ? '#06b6d4' : (p.cls === 1 ? '#3b82f6' : '#6366f1');
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });

        if (lblAlign) lblAlign.textContent = (noise * 0.2).toFixed(3);
        if (lblUniform) lblUniform.textContent = (-2.14 + (tau - 0.15)).toFixed(2);
    }

    function stepOpt() {
        // Pull same class together, repel different classes
        points.forEach((p, i) => {
            let force = 0;
            points.forEach((q, j) => {
                if (i !== j) {
                    let diff = q.angle - p.angle;
                    while (diff > Math.PI) diff -= Math.PI * 2;
                    while (diff < -Math.PI) diff += Math.PI * 2;

                    if (p.cls === q.cls) {
                        force += diff * 0.1; // Attraction
                    } else {
                        force -= Math.sign(diff) * Math.exp(-Math.abs(diff) / tau) * 0.2; // Repulsion
                    }
                }
            });
            p.angle += force * 0.05;
        });
        render();
    }

    if (sliderTau) {
        sliderTau.addEventListener('input', (e) => {
            tau = parseFloat(e.target.value);
            if (valTau) valTau.textContent = tau.toFixed(2);
        });
    }

    if (sliderNoise) {
        sliderNoise.addEventListener('input', (e) => {
            noise = parseFloat(e.target.value);
            if (valNoise) valNoise.textContent = noise.toFixed(2);
        });
    }

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => generatePreset(btn.getAttribute('data-preset')));
    });

    if (btnStep) btnStep.addEventListener('click', stepOpt);
    if (btnReset) btnReset.addEventListener('click', () => generatePreset('clustered'));

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const dx = (e.clientX - rect.left) - centerX;
        const dy = (e.clientY - rect.top) - centerY;
        const angle = Math.atan2(dy, dx);
        points.push({ angle, cls: Math.floor(Math.random() * 3) });
        render();
    });

    generatePreset('clustered');
}
