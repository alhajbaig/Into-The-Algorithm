/**
 * ML Prerequisites — Interactive Visual Laboratories & Motion Engine
 * Into The Algorithm Platform
 */

document.addEventListener('DOMContentLoaded', () => {
    initHeroBackground();
    initMatrixTransformLab();
    initGradientDescentLab();
    initGaussianLab();
    initOptimizationLab();
    initMasteryTracker();
    initSearchFilter();
    initScrollReveal();
});

/* ═══════════════════════════════════════════════════════════
   1. HERO CANVAS BACKGROUND ANIMATION
   ═══════════════════════════════════════════════════════════ */
function initHeroBackground() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = canvas.parentElement.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight || 320);

    window.addEventListener('resize', () => {
        width = canvas.width = canvas.parentElement.offsetWidth || window.innerWidth;
        height = canvas.height = canvas.parentElement.offsetHeight || 320;
    });

    // Mathematical Floating Nodes
    const nodes = Array.from({ length: 35 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2.5 + 1.5,
        color: ['rgba(124, 140, 255, ', 'rgba(86, 216, 199, ', 'rgba(242, 184, 75, ', 'rgba(240, 102, 140, '][Math.floor(Math.random() * 4)],
        symbol: ['v', 'W', '∇f', 'μ', 'σ', 'θ', 'P(x)'][Math.floor(Math.random() * 7)]
    }));

    let mouseX = width / 2;
    let mouseY = height / 2;

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Connect nodes close to each other
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.hypot(dx, dy);
                if (dist < 110) {
                    const alpha = (1 - dist / 110) * 0.25;
                    ctx.strokeStyle = `rgba(124, 140, 255, ${alpha})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }

        // Draw and update nodes
        nodes.forEach(node => {
            node.x += node.vx;
            node.y += node.vy;

            if (node.x < 0 || node.x > width) node.vx *= -1;
            if (node.y < 0 || node.y > height) node.vy *= -1;

            // Mouse interaction repulsion
            const mdx = node.x - mouseX;
            const mdy = node.y - mouseY;
            const mdist = Math.hypot(mdx, mdy);
            if (mdist < 80) {
                node.x += (mdx / mdist) * 1.2;
                node.y += (mdy / mdist) * 1.2;
            }

            ctx.fillStyle = `${node.color} 0.8)`;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fill();

            // Render math symbols near nodes
            ctx.fillStyle = `${node.color} 0.45)`;
            ctx.font = '10px "JetBrains Mono", monospace';
            ctx.fillText(node.symbol, node.x + 6, node.y - 6);
        });

        requestAnimationFrame(animate);
    }
    animate();
}

/* ═══════════════════════════════════════════════════════════
   2. LINEAR ALGEBRA — MATRIX TRANSFORMATION LAB
   ═══════════════════════════════════════════════════════════ */
function initMatrixTransformLab() {
    const canvas = document.getElementById('matrixCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const sliderA = document.getElementById('matA');
    const sliderB = document.getElementById('matB');
    const sliderC = document.getElementById('matC');
    const sliderD = document.getElementById('matD');
    const valA = document.getElementById('valA');
    const valB = document.getElementById('valB');
    const valC = document.getElementById('valC');
    const valD = document.getElementById('valD');
    const resetBtn = document.getElementById('resetMatrixBtn');

    let a = parseFloat(sliderA?.value || 1.2);
    let b = parseFloat(sliderB?.value || 0.4);
    let c = parseFloat(sliderC?.value || 0.2);
    let d = parseFloat(sliderD?.value || 1.1);

    function updateValues() {
        if (sliderA) a = parseFloat(sliderA.value);
        if (sliderB) b = parseFloat(sliderB.value);
        if (sliderC) c = parseFloat(sliderC.value);
        if (sliderD) d = parseFloat(sliderD.value);

        if (valA) valA.textContent = a.toFixed(1);
        if (valB) valB.textContent = b.toFixed(1);
        if (valC) valC.textContent = c.toFixed(1);
        if (valD) valD.textContent = d.toFixed(1);

        render();
    }

    [sliderA, sliderB, sliderC, sliderD].forEach(s => {
        if (s) s.addEventListener('input', updateValues);
    });

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (sliderA) sliderA.value = 1.0;
            if (sliderB) sliderB.value = 0.0;
            if (sliderC) sliderC.value = 0.0;
            if (sliderD) sliderD.value = 1.0;
            updateValues();
        });
    }

    function render() {
        const w = canvas.width = canvas.parentElement.offsetWidth || 340;
        const h = canvas.height = 240;
        const cx = w / 2;
        const cy = h / 2;
        const scale = 35;

        ctx.clearRect(0, 0, w, h);

        // Draw original grid (faint blue)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1;
        for (let x = -10; x <= 10; x++) {
            ctx.beginPath();
            ctx.moveTo(cx + x * scale, 0);
            ctx.lineTo(cx + x * scale, h);
            ctx.stroke();
        }
        for (let y = -10; y <= 10; y++) {
            ctx.beginPath();
            ctx.moveTo(0, cy + y * scale);
            ctx.lineTo(w, cy + y * scale);
            ctx.stroke();
        }

        // Draw transformed grid lines (Linear Algebra Space Deformation)
        ctx.strokeStyle = 'rgba(124, 140, 255, 0.25)';
        ctx.lineWidth = 1;
        for (let gx = -6; gx <= 6; gx++) {
            ctx.beginPath();
            const p1x = a * gx + b * (-6);
            const p1y = c * gx + d * (-6);
            const p2x = a * gx + b * (6);
            const p2y = c * gx + d * (6);
            ctx.moveTo(cx + p1x * scale, cy - p1y * scale);
            ctx.lineTo(cx + p2x * scale, cy - p2y * scale);
            ctx.stroke();
        }
        for (let gy = -6; gy <= 6; gy++) {
            ctx.beginPath();
            const p1x = a * (-6) + b * gy;
            const p1y = c * (-6) + d * gy;
            const p2x = a * (6) + b * gy;
            const p2y = c * (6) + d * gy;
            ctx.moveTo(cx + p1x * scale, cy - p1y * scale);
            ctx.lineTo(cx + p2x * scale, cy - p2y * scale);
            ctx.stroke();
        }

        // Basis vectors î and ĵ transformed
        // Basis i_hat = [a, c]^T (Cyan)
        ctx.strokeStyle = '#56D8C7';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + a * scale, cy - c * scale);
        ctx.stroke();

        // Basis j_hat = [b, d]^T (Pink)
        ctx.strokeStyle = '#F0668C';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + b * scale, cy - d * scale);
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#56D8C7';
        ctx.font = 'bold 12px "JetBrains Mono"';
        ctx.fillText('î [ ' + a.toFixed(1) + ', ' + c.toFixed(1) + ' ]', cx + a * scale + 8, cy - c * scale - 6);

        ctx.fillStyle = '#F0668C';
        ctx.fillText('ĵ [ ' + b.toFixed(1) + ', ' + d.toFixed(1) + ' ]', cx + b * scale + 8, cy - d * scale - 6);

        // Compute Determinant (Area scaling factor)
        const det = a * d - b * c;
        ctx.fillStyle = '#E6EDF3';
        ctx.font = '12px "JetBrains Mono"';
        ctx.fillText('det(A) = ' + det.toFixed(2) + ' (Area Scaling)', 12, 22);
    }

    render();
    window.addEventListener('resize', render);
}

/* ═══════════════════════════════════════════════════════════
   3. CALCULUS — GRADIENT DESCENT SIMULATION LAB
   ═══════════════════════════════════════════════════════════ */
function initGradientDescentLab() {
    const canvas = document.getElementById('gdCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const sliderLR = document.getElementById('gdLR');
    const valLR = document.getElementById('valLR');
    const stepBtn = document.getElementById('gdStepBtn');
    const autoBtn = document.getElementById('gdAutoBtn');
    const resetBtn = document.getElementById('gdResetBtn');

    let lr = parseFloat(sliderLR?.value || 0.15);
    let xCurr = 2.8; // Starting parameter position
    let trajectory = [xCurr];
    let isRunning = false;
    let animId = null;

    // Loss function: f(x) = x^2, df/dx = 2x
    function f(x) { return x * x; }
    function df(x) { return 2 * x; }

    if (sliderLR) {
        sliderLR.addEventListener('input', () => {
            lr = parseFloat(sliderLR.value);
            if (valLR) valLR.textContent = lr.toFixed(2);
        });
    }

    function resetGD() {
        isRunning = false;
        if (animId) cancelAnimationFrame(animId);
        if (autoBtn) autoBtn.textContent = '▶ Auto Play';
        xCurr = (Math.random() > 0.5 ? 1 : -1) * (2.2 + Math.random() * 0.8);
        trajectory = [xCurr];
        renderGD();
    }

    function stepGD() {
        const grad = df(xCurr);
        xCurr = xCurr - lr * grad;
        trajectory.push(xCurr);
        if (trajectory.length > 50) trajectory.shift();
        renderGD();
    }

    if (stepBtn) stepBtn.addEventListener('click', stepGD);
    if (resetBtn) resetBtn.addEventListener('click', resetGD);
    if (autoBtn) {
        autoBtn.addEventListener('click', () => {
            isRunning = !isRunning;
            autoBtn.textContent = isRunning ? '⏸ Pause' : '▶ Auto Play';
            if (isRunning) loopGD();
        });
    }

    function loopGD() {
        if (!isRunning) return;
        stepGD();
        if (Math.abs(df(xCurr)) < 0.01) {
            isRunning = false;
            if (autoBtn) autoBtn.textContent = '▶ Auto Play';
            return;
        }
        setTimeout(() => {
            animId = requestAnimationFrame(loopGD);
        }, 180);
    }

    function renderGD() {
        const w = canvas.width = canvas.parentElement.offsetWidth || 340;
        const h = canvas.height = 240;
        ctx.clearRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h - 35;
        const scaleX = 45;
        const scaleY = 18;

        // Draw parabola Loss Curve f(x) = x^2
        ctx.strokeStyle = '#56D8C7';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let px = -3.5; px <= 3.5; px += 0.05) {
            const py = f(px);
            const screenX = cx + px * scaleX;
            const screenY = cy - py * scaleY;
            if (px === -3.5) ctx.moveTo(screenX, screenY);
            else ctx.lineTo(screenX, screenY);
        }
        ctx.stroke();

        // Draw axes
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(30, cy); ctx.lineTo(w - 30, cy);
        ctx.moveTo(cx, 20); ctx.lineTo(cx, cy + 15);
        ctx.stroke();

        // Draw Trajectory Steps
        ctx.strokeStyle = 'rgba(242, 184, 75, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        trajectory.forEach((ptX, idx) => {
            const ptY = f(ptX);
            const sx = cx + ptX * scaleX;
            const sy = cy - ptY * scaleY;
            if (idx === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
        });
        ctx.stroke();

        // Draw Trajectory Nodes
        trajectory.forEach((ptX, idx) => {
            const ptY = f(ptX);
            const sx = cx + ptX * scaleX;
            const sy = cy - ptY * scaleY;
            ctx.fillStyle = idx === trajectory.length - 1 ? '#F0668C' : '#F2B84B';
            ctx.beginPath();
            ctx.arc(sx, sy, idx === trajectory.length - 1 ? 6 : 3.5, 0, Math.PI * 2);
            ctx.fill();
        });

        // Current Tangent Line (Gradient Vector)
        const currGrad = df(xCurr);
        const currY = f(xCurr);
        const currSX = cx + xCurr * scaleX;
        const currSY = cy - currY * scaleY;

        ctx.strokeStyle = '#F0668C';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(currSX - 30, currSY + 30 * currGrad * (scaleY / scaleX));
        ctx.lineTo(currSX + 30, currSY - 30 * currGrad * (scaleY / scaleX));
        ctx.stroke();

        // Stats Display
        ctx.fillStyle = '#E6EDF3';
        ctx.font = '12px "JetBrains Mono"';
        ctx.fillText(`θ = ${xCurr.toFixed(3)} | Loss J(θ) = ${currY.toFixed(3)}`, 12, 22);
        ctx.fillStyle = '#F0668C';
        ctx.fillText(`Gradient ∇J = ${currGrad.toFixed(3)}`, 12, 40);
    }

    renderGD();
    window.addEventListener('resize', renderGD);
}

/* ═══════════════════════════════════════════════════════════
   4. PROBABILITY & STATS — GAUSSIAN SAMPLING LAB
   ═══════════════════════════════════════════════════════════ */
function initGaussianLab() {
    const canvas = document.getElementById('gaussianCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const sliderMu = document.getElementById('gaussMu');
    const sliderSigma = document.getElementById('gaussSigma');
    const valMu = document.getElementById('valMu');
    const valSigma = document.getElementById('valSigma');
    const sampleBtn = document.getElementById('gaussSampleBtn');
    const clearBtn = document.getElementById('gaussClearBtn');

    let mu = parseFloat(sliderMu?.value || 0);
    let sigma = parseFloat(sliderSigma?.value || 1.2);
    let samples = [];

    function updateGauss() {
        if (sliderMu) mu = parseFloat(sliderMu.value);
        if (sliderSigma) sigma = parseFloat(sliderSigma.value);
        if (valMu) valMu.textContent = mu.toFixed(1);
        if (valSigma) valSigma.textContent = sigma.toFixed(1);
        renderGauss();
    }

    [sliderMu, sliderSigma].forEach(s => {
        if (s) s.addEventListener('input', updateGauss);
    });

    // Box-Muller transform for normal distribution sampling
    function sampleNormal(mean, std) {
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        return z0 * std + mean;
    }

    if (sampleBtn) {
        sampleBtn.addEventListener('click', () => {
            for (let i = 0; i < 50; i++) {
                samples.push(sampleNormal(mu, sigma));
            }
            if (samples.length > 500) samples = samples.slice(-500);
            renderGauss();
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            samples = [];
            renderGauss();
        });
    }

    function renderGauss() {
        const w = canvas.width = canvas.parentElement.offsetWidth || 340;
        const h = canvas.height = 240;
        ctx.clearRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h - 40;
        const scaleX = 35;
        const scaleY = 320;

        // Draw Histogram of Samples
        if (samples.length > 0) {
            const bins = {};
            const binSize = 0.4;
            samples.forEach(s => {
                const binKey = Math.floor(s / binSize) * binSize;
                bins[binKey] = (bins[binKey] || 0) + 1;
            });

            ctx.fillStyle = 'rgba(242, 184, 75, 0.35)';
            ctx.strokeStyle = 'rgba(242, 184, 75, 0.7)';
            ctx.lineWidth = 1;

            Object.keys(bins).forEach(k => {
                const bx = parseFloat(k);
                const count = bins[k];
                const barWidth = binSize * scaleX - 1;
                const barHeight = (count / samples.length) * 220;
                const screenX = cx + bx * scaleX;
                const screenY = cy - barHeight;
                ctx.fillRect(screenX, screenY, barWidth, barHeight);
                ctx.strokeRect(screenX, screenY, barWidth, barHeight);
            });
        }

        // Draw Normal PDF Bell Curve: f(x) = 1/(σ√(2π)) * e^(-(x-μ)^2 / 2σ^2)
        ctx.strokeStyle = '#F2B84B';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = -4.5; x <= 4.5; x += 0.05) {
            const pdf = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-Math.pow(x - mu, 2) / (2 * Math.pow(sigma, 2)));
            const sx = cx + x * scaleX;
            const sy = cy - pdf * scaleY;
            if (x === -4.5) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
        }
        ctx.stroke();

        // Draw Axis
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(20, cy); ctx.lineTo(w - 20, cy);
        ctx.moveTo(cx + mu * scaleX, 20); ctx.lineTo(cx + mu * scaleX, cy + 10);
        ctx.stroke();

        ctx.fillStyle = '#E6EDF3';
        ctx.font = '12px "JetBrains Mono"';
        ctx.fillText(`μ = ${mu.toFixed(1)}, σ = ${sigma.toFixed(1)} | Samples: ${samples.length}`, 12, 22);
    }

    renderGauss();
    window.addEventListener('resize', renderGauss);
}

/* ═══════════════════════════════════════════════════════════
   5. OPTIMIZATION — CONVEX VS NON-CONVEX LAB
   ═══════════════════════════════════════════════════════════ */
function initOptimizationLab() {
    const canvas = document.getElementById('optCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const toggleBtn = document.getElementById('optToggleBtn');
    let isNonConvex = false;

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            isNonConvex = !isNonConvex;
            toggleBtn.textContent = isNonConvex ? 'Mode: Non-Convex (Deep Learning)' : 'Mode: Convex (Linear/Logistic)';
            renderOpt();
        });
    }

    function renderOpt() {
        const w = canvas.width = canvas.parentElement.offsetWidth || 340;
        const h = canvas.height = 220;
        ctx.clearRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h - 30;
        const scaleX = 40;
        const scaleY = 22;

        ctx.strokeStyle = isNonConvex ? '#F0668C' : '#9AE07A';
        ctx.lineWidth = 3;
        ctx.beginPath();

        for (let x = -3.5; x <= 3.5; x += 0.04) {
            let y = 0;
            if (!isNonConvex) {
                // Convex parabola: f(x) = 0.5 * x^2
                y = 0.5 * x * x;
            } else {
                // Non-convex surface with local minima & saddle points: f(x) = 0.12*x^4 - 0.7*x^2 + 0.35*sin(3.5*x) + 1.5
                y = 0.12 * Math.pow(x, 4) - 0.7 * Math.pow(x, 2) + 0.35 * Math.sin(3.5 * x) + 1.5;
            }

            const sx = cx + x * scaleX;
            const sy = cy - y * scaleY;
            if (x === -3.5) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
        }
        ctx.stroke();

        // Axis
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(20, cy); ctx.lineTo(w - 20, cy);
        ctx.stroke();

        ctx.fillStyle = '#E6EDF3';
        ctx.font = '12px "JetBrains Mono"';
        ctx.fillText(isNonConvex ? '⚠️ Non-Convex: Multiple Local Minima & Saddle Points' : '✅ Convex: Single Global Minimum (Guaranteed Solution)', 12, 22);
    }

    renderOpt();
    window.addEventListener('resize', renderOpt);
}

/* ═══════════════════════════════════════════════════════════
   6. MASTERY PROGRESS TRACKER & CHECKLIST
   ═══════════════════════════════════════════════════════════ */
function initMasteryTracker() {
    const checkboxes = document.querySelectorAll('ul.checklist li');
    const progressBar = document.getElementById('masteryProgressBar');
    const progressPercent = document.getElementById('masteryPercent');
    const progressBadge = document.getElementById('masteryBadge');

    if (!checkboxes.length) return;

    let checkedCount = 0;
    const totalCount = checkboxes.length;

    checkboxes.forEach((li, idx) => {
        // Load saved state
        const saved = localStorage.getItem(`ml_prereq_check_${idx}`) === 'true';
        if (saved) {
            li.classList.add('completed');
            checkedCount++;
        }

        li.style.cursor = 'pointer';
        li.addEventListener('click', () => {
            const isCompleted = li.classList.toggle('completed');
            localStorage.setItem(`ml_prereq_check_${idx}`, isCompleted);
            checkedCount += isCompleted ? 1 : -1;
            updateProgress();
        });
    });

    function updateProgress() {
        const pct = Math.round((checkedCount / totalCount) * 100);
        if (progressBar) progressBar.style.width = `${pct}%`;
        if (progressPercent) progressPercent.textContent = `${pct}%`;

        if (progressBadge) {
            if (pct === 100) progressBadge.textContent = '🏆 Math Wizard';
            else if (pct >= 60) progressBadge.textContent = '⚡ Advanced Practitioner';
            else if (pct >= 30) progressBadge.textContent = '🌱 Prerequisite Explorer';
            else progressBadge.textContent = '🚀 Beginner';
        }
    }

    updateProgress();
}

/* ═══════════════════════════════════════════════════════════
   7. SEARCH & QUICK FILTER BAR
   ═══════════════════════════════════════════════════════════ */
function initSearchFilter() {
    const searchInput = document.getElementById('prereqSearchInput');
    if (!searchInput) return;

    const cards = document.querySelectorAll('.card');

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            if (!query || text.includes(query)) {
                card.style.display = 'block';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            } else {
                card.style.display = 'none';
                card.style.opacity = '0';
            }
        });
    });
}

/* ═══════════════════════════════════════════════════════════
   8. SCROLL REVEAL ANIMATIONS
   ═══════════════════════════════════════════════════════════ */
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card, section h2, .highlight-callout').forEach(el => {
        el.classList.add('reveal-hidden');
        observer.observe(el);
    });
}
