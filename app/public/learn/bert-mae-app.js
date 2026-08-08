/* ════════════════════════════════════════════════════════════
   BERT & Masked Autoencoders (MAE) Application
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

    const gridSize = 8;
    const patchWidth = canvas.width / gridSize;
    const patchHeight = canvas.height / gridSize;

    const patches = [];
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            patches.push({
                r, c,
                masked: Math.random() < 0.75,
                reconstructedAlpha: 0
            });
        }
    }

    let t = 0;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        t += 0.02;

        patches.forEach(p => {
            const x = p.c * patchWidth;
            const y = p.r * patchHeight;

            if (p.masked) {
                // Reconstructing animation pulse
                p.reconstructedAlpha = 0.3 + 0.3 * Math.sin(t + p.r + p.c);
                ctx.fillStyle = `rgba(16, 185, 129, ${p.reconstructedAlpha})`;
                ctx.fillRect(x + 2, y + 2, patchWidth - 4, patchHeight - 4);
                ctx.strokeStyle = '#10b981';
                ctx.strokeRect(x + 2, y + 2, patchWidth - 4, patchHeight - 4);
            } else {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillRect(x + 2, y + 2, patchWidth - 4, patchHeight - 4);
            }
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
        { num: 3, text: 'class MaskedAutoencoderViT(nn.Module):', html: '<span class="code-keyword">class</span> <span class="code-func">MaskedAutoencoderViT</span>(nn.Module):' },
        { num: 4, text: '    def __init__(self, mask_ratio=0.75):', html: '    <span class="code-keyword">def</span> <span class="code-func">__init__</span>(self, mask_ratio=<span class="code-num">0.75</span>):' },
        { num: 5, text: '        super().__init__()', html: '        super().__init__()' },
        { num: 6, text: '        self.mask_ratio = mask_ratio', html: '        self.mask_ratio = mask_ratio' },
        { num: 7, text: '    def random_masking(self, x, mask_ratio):', html: '    <span class="code-keyword">def</span> <span class="code-func">random_masking</span>(self, x, mask_ratio):' },
        { num: 8, text: '        N, L, D = x.shape', html: '        N, L, D = x.shape' },
        { num: 9, text: '        len_keep = int(L * (1 - mask_ratio))', html: '        len_keep = int(L * (<span class="code-num">1</span> - mask_ratio))' },
        { num: 10, text: '        noise = torch.rand(N, L, device=x.device)', html: '        noise = torch.rand(N, L, device=x.device)' },
        { num: 11, text: '        ids_shuffle = torch.argsort(noise, dim=1)', html: '        ids_shuffle = torch.argsort(noise, dim=<span class="code-num">1</span>)' },
        { num: 12, text: '        ids_keep = ids_shuffle[:, :len_keep]', html: '        ids_keep = ids_shuffle[:, :len_keep]' },
        { num: 13, text: '        x_masked = torch.gather(x, dim=1, index=ids_keep.unsqueeze(-1).repeat(1, 1, D))', html: '        x_masked = torch.gather(x, dim=<span class="code-num">1</span>, index=ids_keep.unsqueeze(-<span class="code-num">1</span>).repeat(<span class="code-num">1</span>, <span class="code-num">1</span>, D))' },
        { num: 14, text: '        return x_masked, ids_shuffle, ids_restore', html: '        <span class="code-keyword">return</span> x_masked, ids_shuffle, ids_restore' },
        { num: 15, text: '    def forward_encoder(self, x, mask_ratio):', html: '    <span class="code-keyword">def</span> <span class="code-func">forward_encoder</span>(self, x, mask_ratio):' },
        { num: 16, text: '        x = self.patch_embed(x)', html: '        x = self.patch_embed(x)' },
        { num: 17, text: '        x_vis, ids_shuffle, ids_restore = self.random_masking(x, mask_ratio)', html: '        x_vis, ids_shuffle, ids_restore = self.random_masking(x, mask_ratio)' },
        { num: 18, text: '        latent = self.encoder_blocks(x_vis)', html: '        latent = self.encoder_blocks(x_vis)' },
        { num: 19, text: '        return latent, ids_restore', html: '        <span class="code-keyword">return</span> latent, ids_restore' },
        { num: 20, text: '    def forward_loss(self, imgs, pred, mask):', html: '    <span class="code-keyword">def</span> <span class="code-func">forward_loss</span>(self, imgs, pred, mask):' },
        { num: 21, text: '        target = self.patchify(imgs)', html: '        target = self.patchify(imgs)' },
        { num: 22, text: '        loss = (pred - target) ** 2; return (loss.mean(dim=-1) * mask).sum() / mask.sum()', html: '        loss = (pred - target) ** <span class="code-num">2</span>; <span class="code-keyword">return</span> (loss.mean(dim=-<span class="code-num">1</span>) * mask).sum() / mask.sum()' }
    ];

    const CODE_EXPLANATIONS = {
        1: { title: "Import PyTorch Framework", text: "Imports core PyTorch tensor library.", math: "\\text{import torch}" },
        2: { title: "Import Neural Networks Module", text: "Imports nn primitives for Transformer ViT layers.", math: "\\text{import torch.nn as nn}" },
        3: { title: "MaskedAutoencoderViT Class", text: "Encapsulates Vision Transformer MAE encoder-decoder.", math: "\\mathcal{M}_{\\text{MAE}}" },
        4: { title: "MAE Constructor Method", text: "Sets default patch masking ratio (rho = 0.75 for 75% masking).", math: "\\rho = 0.75" },
        5: { title: "Call Parent Constructor", text: "Initializes PyTorch base module state.", math: "\\text{super().\_\_init\_\_()}" },
        6: { title: "Store Mask Ratio Attribute", text: "Saves target masking percentage hyperparameter.", math: "\\rho = 75\\%" },
        7: { title: "Random Patch Masking Function", text: "Randomly samples unmasked visible patches without replacement.", math: "\\text{random\_masking}(x, \\rho)" },
        8: { title: "Extract Tensor Dimensions", text: "Gets batch size N, sequence length L, and embedding dim D.", math: "N, L, D = x.shape" },
        9: { title: "Calculate Visible Token Count", text: "Determines number of visible tokens to retain (e.g. 25% of L).", math: "L_{keep} = \\lfloor L (1 - \\rho) \\rfloor" },
        10: { title: "Generate Uniform Random Noise", text: "Creates random noise tensor per sample for per-image shuffling.", math: "\\text{noise} \\sim U(0, 1)" },
        11: { title: "Sort Indices via Argsort", text: "Sorts noise values to obtain random permutation of patch indices.", math: "\\text{ids\_shuffle} = \\arg\\sort(\\text{noise})" },
        12: { title: "Slice Kept Visible Indices", text: "Slices first L_keep indices representing visible unmasked patches.", math: "\\text{ids\_keep} = \\text{ids\_shuffle}[:L_{keep}]" },
        13: { title: "Gather Visible Patch Embeddings", text: "Gathers 25% unmasked patch embeddings avoiding encoder compute on masked patches.", math: "x_{vis} = \\text{gather}(x, \\text{ids\_keep})" },
        14: { title: "Return Masking Tensors", text: "Returns visible patches and index restoration tensors.", math: "(x_{vis}, \\text{shuffle}, \\text{restore})" },
        15: { title: "Encoder Forward Method", text: "Processes visible unmasked patches through heavy ViT encoder trunk.", math: "\\text{Encoder}(x_{vis})" },
        16: { title: "Patch Projection Embedding", text: "Projects 16x16 raw image patches to D-dimensional linear embeddings.", math: "x_{patch} = \\mathbf{W} x + b" },
        17: { title: "Execute Random Masking", text: "Filters input sequence keeping only visible patches.", math: "x_{vis} = \\text{mask}(x_{patch})" },
        18: { title: "Process Through ViT Transformer Blocks", text: "Passes unmasked tokens through multi-head self-attention encoder blocks.", math: "z_{vis} = \\text{ViT}(x_{vis})" },
        19: { title: "Return Latent Representations", text: "Returns encoded unmasked latents and restoration indices.", math: "(z_{vis}, \\text{ids})" },
        20: { title: "Compute Reconstruction Loss", text: "Evaluates Mean Squared Error (MSE) loss over masked patches.", math: "\\mathcal{L}_{MAE}" },
        21: { title: "Convert Images into Patches", text: "Flattens raw image into ground truth target patch vectors.", math: "x_{target} = \\text{patchify}(imgs)" },
        22: { title: "Evaluate Pixel MSE on Masked Tokens", text: "Calculates MSE loss normalized exclusively over masked patch indices.", math: "\\mathcal{L} = \\frac{\\sum_{i \\in M} (\\hat{x}_i - x_i)^2}{|M|}" }
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
                        ${info.why || 'Enables scalable Vision Transformer pretraining by processing only unmasked patches.'}
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
            if (step === 'step1') targetLine = 13;
            else if (step === 'step2') targetLine = 18;
            else if (step === 'step3') targetLine = 17;
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
    let epoch = 0;

    const samples = [
        { id: 1, masked: '48 / 64 (75%)', vis: '16 / 64 (25%)', norm: 'Mean=0, Std=1', mse: 0.024 },
        { id: 2, masked: '48 / 64 (75%)', vis: '16 / 64 (25%)', norm: 'Mean=0, Std=1', mse: 0.018 },
        { id: 3, masked: '48 / 64 (75%)', vis: '16 / 64 (25%)', norm: 'Mean=0, Std=1', mse: 0.015 }
    ];

    function renderTable() {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        samples.forEach(s => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>Image #${s.id}</td>
                <td><span style="color:#10b981; font-weight:700;">${s.masked}</span></td>
                <td><span style="color:#06b6d4; font-weight:600;">${s.vis}</span></td>
                <td><code>${s.norm}</code></td>
                <td>${s.mse.toFixed(3)}</td>
            `;
            tableBody.appendChild(tr);
        });

        document.getElementById('metricEpoch').textContent = epoch;
        document.getElementById('metricMSE').textContent = (0.045 / (epoch + 1)).toFixed(4);
        document.getElementById('metricAcc').textContent = `${(78.5 + epoch * 1.2).toFixed(1)}%`;
    }

    const ctxRatio = document.getElementById('chartRatio')?.getContext('2d');
    const ctxFine = document.getElementById('chartFine')?.getContext('2d');

    if (ctxRatio) {
        new Chart(ctxRatio, {
            type: 'line',
            data: {
                labels: ['15%', '30%', '50%', '75%', '90%'],
                datasets: [{ label: 'MSE Loss', data: [0.005, 0.009, 0.014, 0.022, 0.058], borderColor: '#10b981', fill: false }]
            },
            options: { responsive: true, plugins: { legend: { display: false } } }
        });
    }

    if (ctxFine) {
        new Chart(ctxFine, {
            type: 'bar',
            data: {
                labels: ['ViT-Supervised', 'BEiT', 'MAE-ViT-Base', 'MAE-ViT-Huge'],
                datasets: [{ label: 'Top-1 Accuracy (%)', data: [81.8, 83.2, 85.9, 87.8], backgroundColor: '#06b6d4', borderRadius: 4 }]
            },
            options: { responsive: true, plugins: { legend: { display: false } } }
        });
    }

    if (trainBtn) {
        trainBtn.addEventListener('click', () => {
            epoch += 5;
            renderTable();
        });
    }

    renderTable();
}

/* ── Interactive Playground ───────────────────────────── */
function initPlayground() {
    const canvas = document.getElementById('maeCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const sliderRatio = document.getElementById('sliderRatio');
    const valRatio = document.getElementById('valRatio');
    const presetBtns = document.querySelectorAll('.preset-btn');
    const btnReconstruct = document.getElementById('btnReconstruct');
    const btnReset = document.getElementById('btnResetPlayground');
    const lblVisible = document.getElementById('lblVisible');
    const lblMSE = document.getElementById('lblMSE');

    let maskRatio = 0.75;
    const gridSize = 8;
    const patchSize = canvas.width / gridSize;
    let patches = [];

    function generatePatches() {
        patches = [];
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                patches.push({
                    r, c,
                    masked: Math.random() < maskRatio,
                    reconstructed: false
                });
            }
        }
        render();
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let visCount = 0;
        patches.forEach(p => {
            const x = p.c * patchSize;
            const y = p.r * patchSize;

            if (p.masked) {
                if (p.reconstructed) {
                    ctx.fillStyle = '#06b6d4';
                    ctx.fillRect(x + 2, y + 2, patchSize - 4, patchSize - 4);
                } else {
                    ctx.fillStyle = '#0b0f19';
                    ctx.fillRect(x + 2, y + 2, patchSize - 4, patchSize - 4);
                    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                    ctx.strokeRect(x + 2, y + 2, patchSize - 4, patchSize - 4);
                }
            } else {
                visCount++;
                ctx.fillStyle = '#10b981';
                ctx.fillRect(x + 2, y + 2, patchSize - 4, patchSize - 4);
            }
        });

        if (lblVisible) lblVisible.textContent = `${visCount} / 64`;
        if (lblMSE) lblMSE.textContent = (0.015 + (1 - visCount / 64) * 0.02).toFixed(3);
    }

    function reconstruct() {
        patches.forEach(p => {
            if (p.masked) p.reconstructed = true;
        });
        render();
    }

    if (sliderRatio) {
        sliderRatio.addEventListener('input', (e) => {
            maskRatio = parseInt(e.target.value) / 100;
            if (valRatio) valRatio.textContent = `${Math.round(maskRatio * 100)}%`;
            generatePatches();
        });
    }

    presetBtns.forEach(btn => {
        btn.addEventListener('click', generatePatches);
    });

    if (btnReconstruct) btnReconstruct.addEventListener('click', reconstruct);
    if (btnReset) btnReset.addEventListener('click', generatePatches);

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const c = Math.floor((e.clientX - rect.left) / patchSize);
        const r = Math.floor((e.clientY - rect.top) / patchSize);
        const patch = patches.find(p => p.r === r && p.c === c);
        if (patch) {
            patch.masked = !patch.masked;
            patch.reconstructed = false;
            render();
        }
    });

    generatePatches();
}
