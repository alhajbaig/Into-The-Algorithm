/* ════════════════════════════════════════════════════════════
   Semi-Supervised GANs (SGAN) Application
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

    const realNodes = [];
    const fakeNodes = [];

    for (let i = 0; i < 20; i++) {
        realNodes.push({
            x: 100 + Math.random() * 120,
            y: 100 + Math.random() * 200,
            cls: i < 10 ? 0 : 1
        });
        fakeNodes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5
        });
    }

    let t = 0;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        t += 0.03;

        // Generator pushing fake nodes toward boundary
        fakeNodes.forEach((f, i) => {
            const targetX = 250 + Math.sin(t + i) * 80;
            const targetY = 200 + Math.cos(t + i) * 80;
            f.x += (targetX - f.x) * 0.05;
            f.y += (targetY - f.y) * 0.05;

            ctx.beginPath();
            ctx.arc(f.x, f.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(236, 72, 153, 0.6)';
            ctx.fill();
        });

        // Draw Real Nodes
        realNodes.forEach(r => {
            ctx.beginPath();
            ctx.arc(r.x, r.y, 7, 0, Math.PI * 2);
            ctx.fillStyle = r.cls === 0 ? '#a855f7' : '#3b82f6';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });

        // Draw Discriminator decision boundary
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(250, 50);
        ctx.lineTo(250, 350);
        ctx.stroke();
        ctx.setLineDash([]);

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
        { num: 3, text: 'class SGANDiscriminator(nn.Module):', html: '<span class="code-keyword">class</span> <span class="code-func">SGANDiscriminator</span>(nn.Module):' },
        { num: 4, text: '    def __init__(self, num_classes=10):', html: '    <span class="code-keyword">def</span> <span class="code-func">__init__</span>(self, num_classes=<span class="code-num">10</span>):' },
        { num: 5, text: '        super().__init__()', html: '        super().__init__()' },
        { num: 6, text: '        self.features = nn.Sequential(nn.Linear(784, 256), nn.LeakyReLU(0.2))', html: '        self.features = nn.Sequential(nn.Linear(<span class="code-num">784</span>, <span class="code-num">256</span>), nn.LeakyReLU(<span class="code-num">0.2</span>))' },
        { num: 7, text: '        self.classifier = nn.Linear(256, num_classes + 1)', html: '        self.classifier = nn.Linear(<span class="code-num">256</span>, num_classes + <span class="code-num">1</span>)' },
        { num: 8, text: '    def forward(self, x):', html: '    <span class="code-keyword">def</span> <span class="code-func">forward</span>(self, x):' },
        { num: 9, text: '        feat = self.features(x)', html: '        feat = self.features(x)' },
        { num: 10, text: '        logits = self.classifier(feat)', html: '        logits = self.classifier(feat)' },
        { num: 11, text: '        return logits, feat', html: '        <span class="code-keyword">return</span> logits, feat' },
        { num: 12, text: 'def train_sgan_step(D, G, opt_D, opt_G, x_lab, y_lab, x_unlab, z):', html: '<span class="code-keyword">def</span> <span class="code-func">train_sgan_step</span>(D, G, opt_D, opt_G, x_lab, y_lab, x_unlab, z):' },
        { num: 13, text: '    lab_logits, _ = D(x_lab)', html: '    lab_logits, _ = D(x_lab)' },
        { num: 14, text: '    loss_sup = nn.CrossEntropyLoss()(lab_logits[:, :10], y_lab)', html: '    loss_sup = nn.CrossEntropyLoss()(lab_logits[:, :<span class="code-num">10</span>], y_lab)' },
        { num: 15, text: '    unlab_logits, feat_real = D(x_unlab)', html: '    unlab_logits, feat_real = D(x_unlab)' },
        { num: 16, text: '    fake_img = G(z); fake_logits, feat_fake = D(fake_img)', html: '    fake_img = G(z); fake_logits, feat_fake = D(fake_img)' },
        { num: 17, text: '    loss_unsup = -torch.mean(torch.logsumexp(unlab_logits[:, :10], dim=1) - torch.logsumexp(unlab_logits, dim=1))', html: '    loss_unsup = -torch.mean(torch.logsumexp(unlab_logits[:, :<span class="code-num">10</span>], dim=<span class="code-num">1</span>) - torch.logsumexp(unlab_logits, dim=<span class="code-num">1</span>))' },
        { num: 18, text: '    loss_D = loss_sup + loss_unsup', html: '    loss_D = loss_sup + loss_unsup' },
        { num: 19, text: '    loss_D.backward(); opt_D.step()', html: '    loss_D.backward(); opt_D.step()' },
        { num: 20, text: '    loss_G = torch.mean((torch.mean(feat_real, 0) - torch.mean(feat_fake, 0))**2)', html: '    loss_G = torch.mean((torch.mean(feat_real, <span class="code-num">0</span>) - torch.mean(feat_fake, <span class="code-num">0</span>))**<span class="code-num">2</span>)' },
        { num: 21, text: '    loss_G.backward(); opt_G.step()', html: '    loss_G.backward(); opt_G.step()' },
        { num: 22, text: '    return loss_D.item(), loss_G.item()', html: '    <span class="code-keyword">return</span> loss_D.item(), loss_G.item()' }
    ];

    const CODE_EXPLANATIONS = {
        1: { title: "Import PyTorch Framework", text: "Imports core PyTorch autograd engine.", math: "\\text{import torch}" },
        2: { title: "Import Neural Network Layers", text: "Imports nn layer primitives (Linear, LeakyReLU, Losses).", math: "\\text{import torch.nn as nn}" },
        3: { title: "SGANDiscriminator Module Class", text: "Defines Discriminator architecture producing K+1 output logits.", math: "D_\\theta: \\mathbb{R}^P \\to \\mathbb{R}^{K+1}" },
        4: { title: "Discriminator Constructor", text: "Sets target real category count (e.g. K=10 for MNIST digits).", math: "K = 10" },
        5: { title: "Call Parent Constructor", text: "Initializes PyTorch module base state.", math: "\\text{super().\_\_init\_\_()}" },
        6: { title: "Define Feature Extraction Backbone", text: "Linear dense backbone extracting intermediate latent representations.", math: "\\mathbf{f}(x) = \\sigma(\\mathbf{W} x + b)" },
        7: { title: "Define (K+1) Class Output Layer", text: "Output layer with K real logits plus 1 extra fake logit at index K.", math: "\\mathbf{z} \\in \\mathbb{R}^{K+1}" },
        8: { title: "Forward Pass Method", text: "Evaluates input image x to produce K+1 logits and intermediate features.", math: "(logits, feat) = D(x)" },
        9: { title: "Extract Intermediate Feature Vector", text: "Passes input through feature extraction trunk for feature matching.", math: "\\mathbf{f}(x)" },
        10: { title: "Compute Output Class Logits", text: "Passes feature vector into final K+1 classifier layer.", math: "logits \\in \\mathbb{R}^{K+1}" },
        11: { title: "Return Logits and Features", text: "Returns dual output required for both cross-entropy and feature matching.", math: "(logits, \\mathbf{f})" },
        12: { title: "SGAN Training Step Function", text: "Executes single adversarial update step for Discriminator and Generator.", math: "\\text{train\_sgan\_step}" },
        13: { title: "Evaluate Supervised Labeled Batch", text: "Computes Discriminator logits on small labeled seed batch.", math: "D(x_{labeled})" },
        14: { title: "Compute Supervised Cross-Entropy Loss", text: "Evaluates standard cross-entropy over the K real class logits.", math: "\\mathcal{L}_{sup} = -\\log P(y \\mid x_{labeled})" },
        15: { title: "Evaluate Unsupervised Real Batch", text: "Computes Discriminator logits and features on unlabeled data batch.", math: "D(x_{unlabeled})" },
        16: { title: "Generate Synthetic Fake Samples", text: "Generates fake images from random Gaussian noise z and evaluates D.", math: "fake = G(z)" },
        17: { title: "Compute Unsupervised Real/Fake Loss", text: "Evaluates binary real-vs-fake cross-entropy via LogSumExp trick.", math: "\\mathcal{L}_{unsup} = -\\mathbb{E}[\\log(1 - P(y=K+1 \\mid x))]" },
        18: { title: "Total Discriminator Loss Combination", text: "Sums supervised and unsupervised loss components.", math: "\\mathcal{L}_D = \\mathcal{L}_{sup} + \\mathcal{L}_{unsup}" },
        19: { title: "Discriminator Backprop & Optimizer Step", text: "Computes gradients and updates Discriminator weights.", math: "\\theta_D \\leftarrow \\theta_D - \\eta \\nabla_{\\theta_D} \\mathcal{L}_D" },
        20: { title: "Feature Matching Generator Loss", text: "Computes L2 distance between mean real and mean fake intermediate features.", math: "\\mathcal{L}_G = \\| \\mathbb{E}[\\mathbf{f}_{real}] - \\mathbb{E}[\\mathbf{f}_{fake}] \\|_2^2" },
        21: { title: "Generator Backprop & Optimizer Step", text: "Updates Generator parameters via feature matching gradients.", math: "\\theta_G \\leftarrow \\theta_G - \\eta \\nabla_{\\theta_G} \\mathcal{L}_G" },
        22: { title: "Return Training Scalar Metrics", text: "Returns scalar Discriminator and Generator loss values for monitoring.", math: "(L_D, L_G)" }
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
                    <span style="font-family:var(--font-mono); font-size:0.78rem; font-weight:700; color:#ec4899; letter-spacing:0.05em; text-transform:uppercase;">💡 INTERACTIVE LINE-BY-LINE CODE INSPECTOR</span>
                    <span style="font-size:0.78rem; font-weight:600; color:${isLocked ? '#f472b6' : 'var(--text-secondary)'}; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); padding:0.25rem 0.75rem; border-radius:50px;">
                        ${isLocked ? '📌 Line Locked – Click another line or click again to unlock' : '💡 Hovering Line – Click line to lock inspection'}
                    </span>
                </div>

                <div style="margin-bottom:0.75rem;">
                    <span style="background:${isLocked ? 'rgba(244,114,182,0.15)' : 'rgba(236,72,153,0.15)'}; color:${isLocked ? '#f472b6' : '#ec4899'}; border:1px solid ${isLocked ? 'rgba(244,114,182,0.3)' : 'rgba(236,72,153,0.3)'}; padding:0.25rem 0.75rem; border-radius:50px; font-size:0.8rem; font-weight:700; font-family:var(--font-mono); display:inline-block;">
                        📌 Line ${selectedLine} ${isLocked ? '(Locked)' : '(Hover preview)'}
                    </span>
                </div>

                <h3 style="font-size:1.25rem; font-weight:700; color:#ffffff; margin:0.5rem 0 1rem 0;">${info.title}</h3>

                <div style="margin-bottom:0.85rem;">
                    <div style="font-weight:700; color:#ec4899; font-size:0.88rem; margin-bottom:0.35rem; display:flex; align-items:center; gap:0.4rem;">
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
                        ${info.why || 'Leverages synthetic adversarial data to regularize multi-class decision boundaries.'}
                    </p>
                </div>

                ${info.math ? `
                <div style="background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:1rem 1.25rem; margin-top:1rem;">
                    <div style="font-weight:700; color:#a78bfa; font-size:0.85rem; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.4rem;">
                        <span>📐</span> <span>Math Formulation:</span>
                    </div>
                    <div style="margin:0; padding:0; background:transparent; border:none; text-align:center; font-size:1rem; color:#ec4899;">
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
            if (step === 'step1') targetLine = 7;
            else if (step === 'step2') targetLine = 14;
            else if (step === 'step3') targetLine = 17;
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

/* ── Sample Section ───────────────────────────────────── */
function initSampleSection() {
    const tableBody = document.querySelector('#sampleTable tbody');
    const trainBtn = document.getElementById('trainSampleBtn');
    let epoch = 0;

    const samples = [
        { id: 1, z: '[-0.24, 0.81]', dScore: 0.12, pred: 'Class 0', status: 'Fake (G)' },
        { id: 2, z: '[0.55, -0.19]', dScore: 0.08, pred: 'Class 1', status: 'Fake (G)' },
        { id: 3, z: '[-0.72, -0.44]', dScore: 0.95, pred: 'Class 0', status: 'Real Seed' },
        { id: 4, z: '[0.88, 0.12]', dScore: 0.98, pred: 'Class 1', status: 'Real Seed' }
    ];

    function renderTable() {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        samples.forEach(s => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>Sample #${s.id}</td>
                <td><code style="font-family:var(--font-mono); font-size:0.8rem; color:#a855f7;">${s.z}</code></td>
                <td>${s.dScore.toFixed(2)}</td>
                <td><span style="color:${s.pred === 'Class 0' ? '#a855f7' : '#ec4899'}; font-weight:700;">${s.pred}</span></td>
                <td><span style="padding:0.2rem 0.5rem; border-radius:12px; font-size:0.75rem; background:${s.status.startsWith('Real') ? 'rgba(168,85,247,0.15)' : 'rgba(236,72,153,0.15)'}; color:${s.status.startsWith('Real') ? '#a855f7' : '#ec4899'};">${s.status}</span></td>
            `;
            tableBody.appendChild(tr);
        });

        document.getElementById('metricEpoch').textContent = epoch;
        document.getElementById('metricSupLoss').textContent = (0.85 / (epoch + 1)).toFixed(3);
        document.getElementById('metricUnsupLoss').textContent = (0.42 / (epoch + 1)).toFixed(3);
        document.getElementById('metricValAcc').textContent = `${(88 + epoch * 1.5).toFixed(1)}%`;
    }

    const ctxLoss = document.getElementById('chartLoss')?.getContext('2d');
    const ctxAcc = document.getElementById('chartAcc')?.getContext('2d');

    if (ctxLoss) {
        new Chart(ctxLoss, {
            type: 'line',
            data: {
                labels: ['E0', 'E5', 'E10', 'E15', 'E20'],
                datasets: [
                    { label: 'Discriminator Loss', data: [1.4, 0.8, 0.5, 0.3, 0.2], borderColor: '#a855f7', fill: false },
                    { label: 'Generator Loss', data: [2.1, 1.6, 1.2, 0.9, 0.7], borderColor: '#ec4899', fill: false }
                ]
            },
            options: { responsive: true }
        });
    }

    if (ctxAcc) {
        new Chart(ctxAcc, {
            type: 'line',
            data: {
                labels: ['E0', 'E5', 'E10', 'E15', 'E20'],
                datasets: [{ label: 'Val Accuracy (%)', data: [75, 82, 88, 92, 95], borderColor: '#3b82f6', fill: true, backgroundColor: 'rgba(59,130,246,0.1)' }]
            },
            options: { responsive: true, plugins: { legend: { display: false } } }
        });
    }

    if (trainBtn) {
        trainBtn.addEventListener('click', () => {
            epoch++;
            renderTable();
        });
    }

    renderTable();
}

/* ── Interactive Playground ───────────────────────────── */
function initPlayground() {
    const canvas = document.getElementById('sganCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const sliderWeight = document.getElementById('sliderWeight');
    const sliderFake = document.getElementById('sliderFake');
    const valWeight = document.getElementById('valWeight');
    const valFake = document.getElementById('valFake');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const btnTrain = document.getElementById('btnTrainStep');
    const btnReset = document.getElementById('btnResetPlayground');
    const toolLabel = document.getElementById('activeToolLabel');
    const lblEpoch = document.getElementById('lblEpoch');

    let gWeight = 1.0;
    let fakeRatio = 20;
    let addMode = 'class0';
    let epoch = 0;

    let seeds = [
        { x: 200, y: 150, cls: 0 }, { x: 220, y: 180, cls: 0 },
        { x: 450, y: 350, cls: 1 }, { x: 430, y: 320, cls: 1 }
    ];
    let fakes = [];

    function generateFakes() {
        fakes = [];
        for (let i = 0; i < fakeRatio; i++) {
            fakes.push({
                x: 300 + (Math.random() - 0.5) * 250,
                y: 250 + (Math.random() - 0.5) * 250
            });
        }
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw fake samples (stars)
        fakes.forEach(f => {
            ctx.fillStyle = 'rgba(236, 72, 153, 0.4)';
            ctx.beginPath();
            ctx.arc(f.x, f.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw Real Seeds
        seeds.forEach(s => {
            ctx.beginPath();
            ctx.arc(s.x, s.y, 7, 0, Math.PI * 2);
            ctx.fillStyle = s.cls === 0 ? '#a855f7' : '#ec4899';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });

        if (lblEpoch) lblEpoch.textContent = `Epoch ${epoch}`;
    }

    function trainEpochs() {
        epoch += 5;
        // Shift fake samples away from seeds
        fakes.forEach(f => {
            let dx = 0, dy = 0;
            seeds.forEach(s => {
                const dist = Math.sqrt((f.x - s.x) ** 2 + (f.y - s.y) ** 2);
                if (dist < 120) {
                    dx += (f.x - s.x) / (dist + 1) * gWeight * 5;
                    dy += (f.y - s.y) / (dist + 1) * gWeight * 5;
                }
            });
            f.x += dx;
            f.y += dy;
        });
        render();
    }

    if (sliderWeight) {
        sliderWeight.addEventListener('input', (e) => {
            gWeight = parseFloat(e.target.value);
            if (valWeight) valWeight.textContent = gWeight.toFixed(1);
        });
    }

    if (sliderFake) {
        sliderFake.addEventListener('input', (e) => {
            fakeRatio = parseInt(e.target.value);
            if (valFake) valFake.textContent = fakeRatio;
            generateFakes();
            render();
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

    if (btnTrain) btnTrain.addEventListener('click', trainEpochs);
    if (btnReset) btnReset.addEventListener('click', () => {
        epoch = 0;
        seeds = [
            { x: 200, y: 150, cls: 0 }, { x: 220, y: 180, cls: 0 },
            { x: 450, y: 350, cls: 1 }, { x: 430, y: 320, cls: 1 }
        ];
        generateFakes();
        render();
    });

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        seeds.push({ x, y, cls: addMode === 'class0' ? 0 : 1 });
        render();
    });

    generateFakes();
    render();
}
