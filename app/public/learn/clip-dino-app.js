/* ════════════════════════════════════════════════════════════
   CLIP & DINO v2 Application
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

    const images = [];
    const texts = [];

    for (let i = 0; i < 5; i++) {
        images.push({
            x: 120, y: 70 + i * 65,
            tx: 380, ty: 70 + i * 65,
            color: `hsl(${i * 70}, 85%, 65%)`
        });
    }

    let t = 0;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        t += 0.03;

        images.forEach((item, i) => {
            // Draw image node (square)
            ctx.fillStyle = item.color;
            ctx.fillRect(item.x - 10, item.y - 10, 20, 20);
            ctx.strokeStyle = '#ffffff';
            ctx.strokeRect(item.x - 10, item.y - 10, 20, 20);

            // Draw text node (circle)
            ctx.beginPath();
            ctx.arc(item.tx, item.ty, 10, 0, Math.PI * 2);
            ctx.fillStyle = item.color;
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();

            // Draw aligned connecting beam
            ctx.strokeStyle = item.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(item.x + 10, item.y);
            ctx.lineTo(item.tx - 10, item.ty);
            ctx.stroke();
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
        { num: 3, text: 'class CLIPModel(nn.Module):', html: '<span class="code-keyword">class</span> <span class="code-func">CLIPModel</span>(nn.Module):' },
        { num: 4, text: '    def __init__(self, visual_encoder, text_encoder, embed_dim=512):', html: '    <span class="code-keyword">def</span> <span class="code-func">__init__</span>(self, visual_encoder, text_encoder, embed_dim=<span class="code-num">512</span>):' },
        { num: 5, text: '        super().__init__()', html: '        super().__init__()' },
        { num: 6, text: '        self.visual, self.text = visual_encoder, text_encoder', html: '        self.visual, self.text = visual_encoder, text_encoder' },
        { num: 7, text: '        self.logit_scale = nn.Parameter(torch.ones([]) * np.log(1 / 0.07))', html: '        self.logit_scale = nn.Parameter(torch.ones([]) * np.log(<span class="code-num">1</span> / <span class="code-num">0.07</span>))' },
        { num: 8, text: '    def forward(self, image, text):', html: '    <span class="code-keyword">def</span> <span class="code-func">forward</span>(self, image, text):' },
        { num: 9, text: '        image_embeds = self.visual(image)', html: '        image_embeds = self.visual(image)' },
        { num: 10, text: '        text_embeds = self.text(text)', html: '        text_embeds = self.text(text)' },
        { num: 11, text: '        image_embeds = image_embeds / image_embeds.norm(dim=-1, keepdim=True)', html: '        image_embeds = image_embeds / image_embeds.norm(dim=-<span class="code-num">1</span>, keepdim=<span class="code-keyword">True</span>)' },
        { num: 12, text: '        text_embeds = text_embeds / text_embeds.norm(dim=-1, keepdim=True)', html: '        text_embeds = text_embeds / text_embeds.norm(dim=-<span class="code-num">1</span>, keepdim=<span class="code-keyword">True</span>)' },
        { num: 13, text: '        logit_scale = self.logit_scale.exp()', html: '        logit_scale = self.logit_scale.exp()' },
        { num: 14, text: '        logits_per_image = logit_scale * image_embeds @ text_embeds.t()', html: '        logits_per_image = logit_scale * image_embeds @ text_embeds.t()' },
        { num: 15, text: '        logits_per_text = logits_per_image.t()', html: '        logits_per_text = logits_per_image.t()' },
        { num: 16, text: '        labels = torch.arange(len(image), device=image.device)', html: '        labels = torch.arange(len(image), device=image.device)' },
        { num: 17, text: '        loss_i = nn.CrossEntropyLoss()(logits_per_image, labels)', html: '        loss_i = nn.CrossEntropyLoss()(logits_per_image, labels)' },
        { num: 18, text: '        loss_t = nn.CrossEntropyLoss()(logits_per_text, labels)', html: '        loss_t = nn.CrossEntropyLoss()(logits_per_text, labels)' },
        { num: 19, text: '        return (loss_i + loss_t) / 2.0', html: '        <span class="code-keyword">return</span> (loss_i + loss_t) / <span class="code-num">2.0</span>' },
        { num: 20, text: '    def zero_shot_classify(self, image, text_prompts):', html: '    <span class="code-keyword">def</span> <span class="code-func">zero_shot_classify</span>(self, image, text_prompts):' },
        { num: 21, text: '        logits, _ = self.forward(image, text_prompts)', html: '        logits, _ = self.forward(image, text_prompts)' },
        { num: 22, text: '        return logits.softmax(dim=-1)', html: '        <span class="code-keyword">return</span> logits.softmax(dim=-<span class="code-num">1</span>)' }
    ];

    const CODE_EXPLANATIONS = {
        1: { title: "Import PyTorch Engine", text: "Imports core PyTorch autograd library.", math: "\\text{import torch}" },
        2: { title: "Import Neural Networks Module", text: "Imports nn layers and loss primitives.", math: "\\text{import torch.nn as nn}" },
        3: { title: "CLIPModel Architecture Class", text: "Encapsulates dual Vision and Text transformer encoders.", math: "\\mathcal{M}_{\\text{CLIP}}" },
        4: { title: "CLIP Constructor Method", text: "Receives vision backbone (ViT) and text backbone (Transformer).", math: "d_{embed} = 512" },
        5: { title: "Call Parent Constructor", text: "Initializes PyTorch base module.", math: "\\text{super().\_\_init\_\_()}" },
        6: { title: "Store Encoder References", text: "Saves visual encoder f_I and text encoder f_T.", math: "(f_I, f_T)" },
        7: { title: "Learnable Temperature Parameter", text: "Instantiates learnable logit scale parameter initialized to log(1/0.07).", math: "\\tau = 0.07 \\implies \\text{scale} = 14.28" },
        8: { title: "Forward Dual Pass Method", text: "Computes symmetric cross-entropy loss over image-text batch.", math: "\\text{forward}(image, text)" },
        9: { title: "Extract Visual Image Feature Embeddings", text: "Passes image batch through ViT visual encoder.", math: "v_I = f_I(x_{img})" },
        10: { title: "Extract Text Prompt Feature Embeddings", text: "Passes text tokens through Transformer text encoder.", math: "v_T = f_T(x_{txt})" },
        11: { title: "L2 Normalize Image Vector Embeddings", text: "Applies unit sphere L2 normalization to image embeddings.", math: "z_I = \\frac{v_I}{\\|v_I\\|_2}" },
        12: { title: "L2 Normalize Text Vector Embeddings", text: "Applies unit sphere L2 normalization to text embeddings.", math: "z_T = \\frac{v_T}{\\|v_T\\|_2}" },
        13: { title: "Compute Exponential Logit Scale", text: "Calculates exp(logit_scale) temperature factor.", math: "e^\\tau" },
        14: { title: "Compute Image-to-Text Cosine Matrix", text: "Calculates N x N dot product matrix scaled by temperature.", math: "\\mathbf{L}_{img \\to txt} = e^\\tau \\cdot \\mathbf{Z}_I \\mathbf{Z}_T^T" },
        15: { title: "Compute Text-to-Image Transposed Matrix", text: "Transposes matrix for text-to-image loss evaluation.", math: "\\mathbf{L}_{txt \\to img} = \\mathbf{L}_{img \\to txt}^T" },
        16: { title: "Construct Identity Matrix Diagonal Targets", text: "Ground truth target labels correspond to diagonal matching pairs.", math: "\\text{labels} = [0, 1, \\dots, N-1]" },
        17: { title: "Compute Image-to-Text Cross Entropy Loss", text: "Evaluates cross-entropy classifying correct text prompt for each image.", math: "\\mathcal{L}_{I \\to T}" },
        18: { title: "Compute Text-to-Image Cross Entropy Loss", text: "Evaluates cross-entropy classifying correct image for each text prompt.", math: "\\mathcal{L}_{T \\to I}" },
        19: { title: "Return Symmetric Combined CLIP Loss", text: "Averages image-to-text and text-to-image loss components.", math: "\\mathcal{L}_{CLIP} = \\frac{1}{2} (\\mathcal{L}_{I \\to T} + \\mathcal{L}_{T \\to I})" },
        20: { title: "Zero-Shot Inference Method", text: "Classifies image against zero-shot text prompts.", math: "\\text{zero\_shot}(image, prompts)" },
        21: { title: "Evaluate Cosine Logits across Prompts", text: "Computes similarity logits between image and candidate text prompts.", math: "\\mathbf{z}_I \\cdot \\mathbf{z}_{T, k}^T" },
        22: { title: "Return Softmax Class Probabilities", text: "Applies Softmax over text prompt scores returning zero-shot probabilities.", math: "P(y = k \\mid x) = \\text{Softmax}(\\text{logits}_k)" }
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
                    <span style="font-family:var(--font-mono); font-size:0.78rem; font-weight:700; color:#f43f5e; letter-spacing:0.05em; text-transform:uppercase;">💡 INTERACTIVE LINE-BY-LINE CODE INSPECTOR</span>
                    <span style="font-size:0.78rem; font-weight:600; color:${isLocked ? '#f472b6' : 'var(--text-secondary)'}; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); padding:0.25rem 0.75rem; border-radius:50px;">
                        ${isLocked ? '📌 Line Locked – Click another line or click again to unlock' : '💡 Hovering Line – Click line to lock inspection'}
                    </span>
                </div>

                <div style="margin-bottom:0.75rem;">
                    <span style="background:${isLocked ? 'rgba(244,114,182,0.15)' : 'rgba(244,63,94,0.15)'}; color:${isLocked ? '#f472b6' : '#f43f5e'}; border:1px solid ${isLocked ? 'rgba(244,114,182,0.3)' : 'rgba(244,63,94,0.3)'}; padding:0.25rem 0.75rem; border-radius:50px; font-size:0.8rem; font-weight:700; font-family:var(--font-mono); display:inline-block;">
                        📌 Line ${selectedLine} ${isLocked ? '(Locked)' : '(Hover preview)'}
                    </span>
                </div>

                <h3 style="font-size:1.25rem; font-weight:700; color:#ffffff; margin:0.5rem 0 1rem 0;">${info.title}</h3>

                <div style="margin-bottom:0.85rem;">
                    <div style="font-weight:700; color:#f43f5e; font-size:0.88rem; margin-bottom:0.35rem; display:flex; align-items:center; gap:0.4rem;">
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
                        ${info.why || 'Aligns visual and text modalities into a joint embedding space for open-vocabulary zero-shot classification.'}
                    </p>
                </div>

                ${info.math ? `
                <div style="background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:1rem 1.25rem; margin-top:1rem;">
                    <div style="font-weight:700; color:#a78bfa; font-size:0.85rem; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.4rem;">
                        <span>📐</span> <span>Math Formulation:</span>
                    </div>
                    <div style="margin:0; padding:0; background:transparent; border:none; text-align:center; font-size:1rem; color:#f43f5e;">
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
            if (step === 'step1') targetLine = 6;
            else if (step === 'step2') targetLine = 14;
            else if (step === 'step3') targetLine = 19;
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

    const prompts = [
        { text: 'A photo of a golden retriever dog', vec: '[0.42, 0.81]', sim: 0.92, prob: 0.88 },
        { text: 'A photo of a sports car', vec: '[-0.55, 0.12]', sim: 0.12, prob: 0.04 },
        { text: 'A photo of a commercial airplane', vec: '[-0.31, -0.65]', sim: 0.21, prob: 0.08 }
    ];

    function renderTable() {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        prompts.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><code>"${p.text}"</code></td>
                <td><code style="font-family:var(--font-mono); font-size:0.8rem; color:#f43f5e;">${p.vec}</code></td>
                <td>${p.sim.toFixed(2)}</td>
                <td><span style="color:#f43f5e; font-weight:700;">${(p.prob * 100).toFixed(1)}%</span></td>
            `;
            tableBody.appendChild(tr);
        });

        document.getElementById('metricTop').textContent = 'Golden Retriever';
        document.getElementById('metricConf').textContent = '88.0%';
    }

    const ctxPrompts = document.getElementById('chartPrompts')?.getContext('2d');
    const ctxDino = document.getElementById('chartDino')?.getContext('2d');

    if (ctxPrompts) {
        new Chart(ctxPrompts, {
            type: 'bar',
            data: {
                labels: ['Dog', 'Car', 'Airplane', 'Cat', 'Boat'],
                datasets: [{ label: 'Zero-Shot Prob (%)', data: [88.0, 4.0, 8.0, 0.1, 0.1], backgroundColor: '#f43f5e', borderRadius: 4 }]
            },
            options: { responsive: true, plugins: { legend: { display: false } } }
        });
    }

    if (ctxDino) {
        new Chart(ctxDino, {
            type: 'line',
            data: {
                labels: ['PC1', 'PC2', 'PC3', 'PC4', 'PC5'],
                datasets: [{ label: 'DINO v2 Variance Ratio', data: [0.45, 0.25, 0.12, 0.08, 0.04], borderColor: '#8b5cf6', fill: true, backgroundColor: 'rgba(139,92,246,0.1)' }]
            },
            options: { responsive: true, plugins: { legend: { display: false } } }
        });
    }

    if (trainBtn) {
        trainBtn.addEventListener('click', renderTable);
    }

    renderTable();
}

/* ── Interactive Playground ───────────────────────────── */
function initPlayground() {
    const canvas = document.getElementById('clipCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const sliderTau = document.getElementById('sliderTau');
    const valTau = document.getElementById('valTau');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const presetBtns = document.querySelectorAll('.preset-btn');
    const btnAlign = document.getElementById('btnAlignStep');
    const btnReset = document.getElementById('btnResetPlayground');
    const toolLabel = document.getElementById('activeToolLabel');
    const lblCos = document.getElementById('lblCos');
    const lblLoss = document.getElementById('lblLoss');

    let tau = 0.07;
    let addMode = 'image';
    let vectors = [];

    function generatePreset(type) {
        vectors = [];
        const w = canvas.width, h = canvas.height;
        if (type === 'animals') {
            vectors.push({ x: w * 0.3, y: h * 0.3, type: 'image', label: 'Dog Img 1' });
            vectors.push({ x: w * 0.32, y: h * 0.35, type: 'text', label: 'Text: "a photo of a dog"' });
            vectors.push({ x: w * 0.7, y: h * 0.7, type: 'image', label: 'Cat Img 1' });
            vectors.push({ x: w * 0.68, y: h * 0.72, type: 'text', label: 'Text: "a photo of a cat"' });
        } else {
            vectors.push({ x: w * 0.25, y: h * 0.7, type: 'image', label: 'Car Img 1' });
            vectors.push({ x: w * 0.28, y: h * 0.65, type: 'text', label: 'Text: "a photo of a car"' });
            vectors.push({ x: w * 0.75, y: h * 0.25, type: 'image', label: 'Plane Img 1' });
            vectors.push({ x: w * 0.72, y: h * 0.28, type: 'text', label: 'Text: "a photo of a plane"' });
        }
        render();
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw connecting lines between matching image & text pairs
        const images = vectors.filter(v => v.type === 'image');
        const texts = vectors.filter(v => v.type === 'text');

        images.forEach((img, i) => {
            if (texts[i]) {
                ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(img.x, img.y);
                ctx.lineTo(texts[i].x, texts[i].y);
                ctx.stroke();
            }
        });

        // Draw vectors
        vectors.forEach(v => {
            ctx.beginPath();
            if (v.type === 'image') {
                ctx.rect(v.x - 8, v.y - 8, 16, 16);
                ctx.fillStyle = '#f43f5e';
            } else {
                ctx.arc(v.x, v.y, 8, 0, Math.PI * 2);
                ctx.fillStyle = '#8b5cf6';
            }
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });

        if (lblCos) lblCos.textContent = '0.892';
        if (lblLoss) lblLoss.textContent = (0.124 * (tau / 0.07)).toFixed(3);
    }

    function alignStep() {
        const images = vectors.filter(v => v.type === 'image');
        const texts = vectors.filter(v => v.type === 'text');

        images.forEach((img, i) => {
            if (texts[i]) {
                img.x += (texts[i].x - img.x) * 0.1;
                img.y += (texts[i].y - img.y) * 0.1;
            }
        });
        render();
    }

    if (sliderTau) {
        sliderTau.addEventListener('input', (e) => {
            tau = parseFloat(e.target.value);
            if (valTau) valTau.textContent = tau.toFixed(2);
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

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => generatePreset(btn.getAttribute('data-preset')));
    });

    if (btnAlign) btnAlign.addEventListener('click', alignStep);
    if (btnReset) btnReset.addEventListener('click', () => generatePreset('animals'));

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        vectors.push({ x, y, type: addMode, label: `${addMode === 'image' ? 'Image' : 'Text'} Vector` });
        render();
    });

    generatePreset('animals');
}
