/* ════════════════════════════════════════════════════════════
   Deep Q-Networks (DQN) — Interactive Application
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
    initDQNLab();
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

/* ── Hero Canvas CartPole Animation ──────────────────────── */
function initHeroAnimation() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    let cartX = w / 2;
    let angle = 0.05;
    let angleVel = 0.002;

    function animate() {
        ctx.clearRect(0, 0, w, h);

        angle += angleVel;
        if (angle > 0.15 || angle < -0.15) angleVel *= -1;

        // Draw track
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(40, h * 0.7);
        ctx.lineTo(w - 40, h * 0.7);
        ctx.stroke();

        // Draw cart
        ctx.fillStyle = '#818cf8';
        ctx.fillRect(cartX - 35, h * 0.7 - 20, 70, 20);

        // Draw pole
        const poleLen = 110;
        const tipX = cartX + Math.sin(angle) * poleLen;
        const tipY = (h * 0.7 - 20) - Math.cos(angle) * poleLen;

        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(cartX, h * 0.7 - 20);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();

        requestAnimationFrame(animate);
    }
    animate();
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

    const sampleBuffer = [
        { state: '[0.02, 0.05, -0.01, 0.04]', action: 'Right (1)', reward: 1.0, nextState: '[0.03, 0.24, -0.01, -0.25]' },
        { state: '[0.03, 0.24, -0.01, -0.25]', action: 'Left (0)', reward: 1.0, nextState: '[0.04, 0.05, -0.02, 0.04]' },
        { state: '[0.04, 0.05, -0.02, 0.04]', action: 'Right (1)', reward: 1.0, nextState: '[0.05, 0.25, -0.02, -0.26]' }
    ];

    function loadSampleTable() {
        sampleTableBody.innerHTML = '';
        sampleBuffer.forEach((row, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${idx + 1}</td><td>${row.state}</td><td><span style="color:#818cf8; font-weight:700;">${row.action}</span></td><td>+${row.reward}</td><td>${row.nextState}</td>`;
            sampleTableBody.appendChild(tr);
        });
    }

    function trainSampleModel() {
        document.getElementById('sampleMetricEpisodes').textContent = '200';
        document.getElementById('sampleMetricReturn').textContent = '198.5';
        document.getElementById('sampleMetricLoss').textContent = '0.012';
        document.getElementById('sampleMetricBuffer').textContent = '10,000';

        sampleMetrics.style.display = 'grid';
        sampleCharts.style.display = 'grid';

        const ctxScatter = document.getElementById('sampleScatterChart');
        if (ctxScatter && window.Chart) {
            if (chartScatter) chartScatter.destroy();
            chartScatter = new Chart(ctxScatter, {
                type: 'line',
                data: {
                    labels: [20, 50, 100, 150, 200],
                    datasets: [{
                        label: 'CartPole Balance Return',
                        data: [18, 45, 120, 185, 200],
                        borderColor: '#818cf8',
                        backgroundColor: 'rgba(129, 140, 248, 0.15)',
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

        const ctxConv = document.getElementById('sampleConvergenceChart');
        if (ctxConv && window.Chart) {
            if (chartConvergence) chartConvergence.destroy();
            chartConvergence = new Chart(ctxConv, {
                type: 'line',
                data: {
                    labels: [20, 50, 100, 150, 200],
                    datasets: [{
                        label: 'Neural MSE Loss',
                        data: [0.85, 0.42, 0.15, 0.04, 0.012],
                        borderColor: '#34d399',
                        backgroundColor: 'rgba(52, 211, 153, 0.15)',
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

    sampleSelect.addEventListener('change', loadSampleTable);
    trainSampleBtn.addEventListener('click', trainSampleModel);
    loadSampleTable();
}

/* ═════════════════════════════════════════════════════════
   SECTION 2: CARTPOLE DQN PLAYGROUND
   ═════════════════════════════════════════════════════════ */
function initDQNLab() {
    const canvas = document.getElementById('dqnCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let cartX = canvas.width / 2;
    let cartVel = 0;
    let poleAngle = 0.02;
    let poleVel = 0;

    let totalEpisodes = 0;
    let scoreHistory = [];
    let lossHistory = [];

    const sliderLR = document.getElementById('sliderLR');
    const valLR = document.getElementById('valLR');
    const sliderBatch = document.getElementById('sliderBatch');
    const valBatch = document.getElementById('valBatch');
    const sliderSync = document.getElementById('sliderSync');
    const valSync = document.getElementById('valSync');

    const btnStepEpisode = document.getElementById('btnStepEpisode');
    const btnTrainFast = document.getElementById('btnTrainFast');
    const btnResetDQN = document.getElementById('btnResetDQN');

    let chartScore = null;
    let chartLoss = null;

    function renderCanvas() {
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        // Draw track
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(30, h * 0.75);
        ctx.lineTo(w - 30, h * 0.75);
        ctx.stroke();

        // Draw cart
        ctx.fillStyle = '#818cf8';
        ctx.fillRect(cartX - 40, h * 0.75 - 25, 80, 25);

        // Draw wheels
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(cartX - 25, h * 0.75, 7, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cartX + 25, h * 0.75, 7, 0, Math.PI * 2); ctx.fill();

        // Draw pole
        const poleLen = 130;
        const tipX = cartX + Math.sin(poleAngle) * poleLen;
        const tipY = (h * 0.75 - 25) - Math.cos(poleAngle) * poleLen;

        ctx.strokeStyle = Math.abs(poleAngle) > 0.25 ? '#f87171' : '#fbbf24';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(cartX, h * 0.75 - 25);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();

        updateMetricsAndCharts();
    }

    function stepDQN() {
        totalEpisodes++;
        const score = Math.min(200, Math.round(20 + totalEpisodes * 4.5 + (Math.random() - 0.5) * 15));
        const loss = Math.max(0.008, (1.2 * Math.exp(-totalEpisodes / 15)).toFixed(3));

        scoreHistory.push(score);
        lossHistory.push(loss);

        // Simulate agent balancing physics
        cartX = canvas.width / 2 + (Math.random() - 0.5) * 40;
        poleAngle = (Math.random() - 0.5) * 0.08;

        renderCanvas();
    }

    function updateMetricsAndCharts() {
        document.getElementById('metricEpisodes').textContent = totalEpisodes;
        document.getElementById('metricScore').textContent = scoreHistory.length > 0 ? scoreHistory[scoreHistory.length - 1] : '0';
        document.getElementById('metricMemory').textContent = `${Math.min(10000, totalEpisodes * 120)}`;
        document.getElementById('metricLoss').textContent = lossHistory.length > 0 ? lossHistory[lossHistory.length - 1] : '0.00';

        if (!window.Chart) return;

        const ctxS = document.getElementById('chartScore');
        if (ctxS) {
            if (chartScore) chartScore.destroy();
            chartScore = new Chart(ctxS, {
                type: 'line',
                data: {
                    labels: scoreHistory.map((_, i) => `Ep ${i + 1}`),
                    datasets: [{
                        label: 'CartPole Score',
                        data: scoreHistory,
                        borderColor: '#818cf8',
                        backgroundColor: 'rgba(129, 140, 248, 0.15)',
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

        const ctxL = document.getElementById('chartLoss');
        if (ctxL) {
            if (chartLoss) chartLoss.destroy();
            chartLoss = new Chart(ctxL, {
                type: 'line',
                data: {
                    labels: lossHistory.map((_, i) => `Ep ${i + 1}`),
                    datasets: [{
                        label: 'Neural Loss',
                        data: lossHistory,
                        borderColor: '#34d399',
                        backgroundColor: 'rgba(52, 211, 153, 0.15)',
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

    sliderLR.addEventListener('input', () => { valLR.textContent = sliderLR.value; });
    sliderBatch.addEventListener('input', () => { valBatch.textContent = sliderBatch.value; });
    sliderSync.addEventListener('input', () => { valSync.textContent = sliderSync.value; });

    btnStepEpisode.addEventListener('click', stepDQN);
    btnTrainFast.addEventListener('click', () => { for (let i = 0; i < 30; i++) stepDQN(); });
    btnResetDQN.addEventListener('click', () => {
        totalEpisodes = 0; scoreHistory = []; lossHistory = [];
        cartX = canvas.width / 2; poleAngle = 0.02;
        renderCanvas();
    });

    renderCanvas();
}

/* ═════════════════════════════════════════════════════════
   SECTION 6: INTERACTIVE LINE-BY-LINE CODE EXPLAINER
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
        { num: 1, text: 'import torch', html: '<span class="code-keyword">import</span> torch' },
        { num: 2, text: 'import torch.nn as nn', html: '<span class="code-keyword">import</span> torch.nn <span class="code-keyword">as</span> nn' },
        { num: 3, text: 'class DQN(nn.Module):', html: '<span class="code-keyword">class</span> <span class="code-func">DQN</span>(nn.Module):' },
        { num: 4, text: '    def __init__(self, state_dim=4, action_dim=2):', html: '    <span class="code-keyword">def</span> <span class="code-func">__init__</span>(self, state_dim=<span class="code-num">4</span>, action_dim=<span class="code-num">2</span>):' },
        { num: 5, text: '        super().__init__()', html: '        super().__init__()' },
        { num: 6, text: '        self.net = nn.Sequential(nn.Linear(state_dim, 64), nn.ReLU(), nn.Linear(64, action_dim))', html: '        self.net = nn.Sequential(nn.Linear(state_dim, <span class="code-num">64</span>), nn.ReLU(), nn.Linear(<span class="code-num">64</span>, action_dim))' },
        { num: 7, text: '    def forward(self, x): return self.net(x)', html: '    <span class="code-keyword">def</span> <span class="code-func">forward</span>(self, x): <span class="code-keyword">return</span> self.net(x)' },
        { num: 8, text: 'class DQNAgent:', html: '<span class="code-keyword">class</span> <span class="code-func">DQNAgent</span>:' },
        { num: 9, text: '    def select_action(self, state, epsilon):', html: '    <span class="code-keyword">def</span> <span class="code-func">select_action</span>(self, state, epsilon):' },
        { num: 10, text: '        if random.random() < epsilon: return random.randint(0, 1)', html: '        <span class="code-keyword">if</span> random.random() < epsilon: <span class="code-keyword">return</span> random.randint(<span class="code-num">0</span>, <span class="code-num">1</span>)' },
        { num: 11, text: '        with torch.no_grad():', html: '        <span class="code-keyword">with</span> torch.no_grad():' },
        { num: 12, text: '            return self.policy_net(state).argmax().item()', html: '            <span class="code-keyword">return</span> self.policy_net(state).argmax().item()' },
        { num: 13, text: '    def update(self, memory, batch_size=32, gamma=0.99):', html: '    <span class="code-keyword">def</span> <span class="code-func">update</span>(self, memory, batch_size=<span class="code-num">32</span>, gamma=<span class="code-num">0.99</span>):' },
        { num: 14, text: '        states, actions, rewards, next_states, dones = memory.sample(batch_size)', html: '        states, actions, rewards, next_states, dones = memory.sample(batch_size)' },
        { num: 15, text: '        q_values = self.policy_net(states).gather(1, actions)', html: '        q_values = self.policy_net(states).gather(<span class="code-num">1</span>, actions)' },
        { num: 16, text: '        next_q_values = self.target_net(next_states).max(1)[0].detach()', html: '        next_q_values = self.target_net(next_states).max(<span class="code-num">1</span>)[<span class="code-num">0</span>].detach()' },
        { num: 17, text: '        target_q_values = rewards + gamma * next_q_values * (1 - dones)', html: '        target_q_values = rewards + gamma * next_q_values * (<span class="code-num">1</span> - dones)' },
        { num: 18, text: '        loss = nn.MSELoss()(q_values, target_q_values.unsqueeze(1))', html: '        loss = nn.MSELoss()(q_values, target_q_values.unsqueeze(<span class="code-num">1</span>))' },
        { num: 19, text: '        self.optimizer.zero_grad(); loss.backward(); self.optimizer.step()', html: '        self.optimizer.zero_grad(); loss.backward(); self.optimizer.step()' },
        { num: 20, text: '    def sync_target_network(self):', html: '    <span class="code-keyword">def</span> <span class="code-func">sync_target_network</span>(self):' },
        { num: 21, text: '        self.target_net.load_state_dict(self.policy_net.state_dict())', html: '        self.target_net.load_state_dict(self.policy_net.state_dict())' },
        { num: 22, text: '        # Target network updated successfully', html: '        <span class="code-comment"># Target network updated successfully</span>' }
    ];

    const CODE_EXPLANATIONS = {
        1: { title: "Import PyTorch Deep Learning Library", text: "Imports PyTorch for neural network automatic differentiation and GPU tensors.", math: "\\text{import torch}" },
        2: { title: "Import PyTorch NN Module", text: "Imports PyTorch neural network layer abstractions (Linear, ReLU, MSELoss).", math: "\\text{import torch.nn as nn}" },
        3: { title: "DQN Neural Network Class", text: "Multi-layer perceptron neural network predicting Q-values for continuous inputs.", math: "Q(s, a; \\theta)" },
        4: { title: "DQN Constructor", text: "Defines input state dimension (4 for CartPole) and output action count (2 for Left/Right).", math: "\\text{state\\_dim} = 4, \\quad \\text{action\\_dim} = 2" },
        5: { title: "Call Parent Constructor", text: "Initializes PyTorch module base class.", math: "\\text{super().\\_\_init\_\_()}" },
        6: { title: "Define Sequential Layers", text: "Builds 2-layer hidden neural network with 64 ReLU hidden units.", math: "\\mathbb{R}^4 \\to \\text{Linear}(64) \\to \\text{ReLU} \\to \\mathbb{R}^2" },
        7: { title: "Forward Pass Method", text: "Passes state tensor x through neural network layers to output action Q-values.", math: "Q(s; \\theta) = \\text{Net}(s)" },
        8: { title: "DQN Agent Class", text: "Encapsulates policy network, target network, and experience replay buffer.", math: "\\mathcal{M}_{\\text{DQN}}" },
        9: { title: "Epsilon-Greedy Selection", text: "Selects action using epsilon-greedy exploration probability.", math: "\\pi(a \\mid s)" },
        10: { title: "Exploration Random Action", text: "With probability epsilon, selects a uniform random discrete action.", math: "a \\sim \\text{Uniform}(\\{0, 1\\})" },
        11: { title: "Disable Gradient Computation", text: "Wraps inference in no_grad context to save memory during action selection.", math: "\\text{with torch.no\\_grad():}" },
        12: { title: "Exploitation Argmax Action", text: "Feeds state into policy net and picks action index with highest predicted Q-value.", math: "a = \\arg\\max_{a'} Q(s, a'; \\theta)" },
        13: { title: "Mini-Batch Update Method", text: "Samples replay memory and updates policy network via MSE gradient descent.", math: "L(\\theta)" },
        14: { title: "Sample Replay Buffer Mini-Batch", text: "Draws random mini-batch of batch_size=32 transitions (s, a, r, s', done).", math: "(s, a, r, s') \\sim \\text{Uniform}(\\mathcal{D})" },
        15: { title: "Extract Current Action Q-Values", text: "Gathers Q(s, a; theta) values corresponding to executed actions.", math: "Q(s, a; \\theta)" },
        16: { title: "Compute Target Network Max Q", text: "Evaluates target network Q(s', a'; theta^-) and detaches gradients for stability.", math: "\\max_{a'} Q(s', a'; \\theta^-)" },
        17: { title: "Compute Bellman Target Vector", text: "Calculates target value r + gamma * max Q(s', a') * (1 - done).", math: "Y = r + \\gamma \\max_{a'} Q(s', a'; \\theta^-) (1 - \\text{done})" },
        18: { title: "Compute Mean Squared Error Loss", text: "Calculates MSE loss between policy Q-values and frozen target Q-values.", math: "L(\\theta) = \\frac{1}{M} \\sum (Q(s,a;\\theta) - Y)^2" },
        19: { title: "Backpropagate & SGD Optimizer Step", text: "Clears gradients, backpropagates loss, and updates policy network weights.", math: "\\theta \\leftarrow \\theta - \\eta \\nabla_\\theta L(\\theta)" },
        20: { title: "Synchronize Target Network", text: "Copies policy network weights theta to target network theta^-.", math: "\\theta^- \\leftarrow \\theta" },
        21: { title: "Copy State Dict Weights", text: "Executes PyTorch state dictionary load to clone policy weights.", math: "\\text{load\\_state\\_dict}()" },
        22: { title: "Target Network Synced", text: "Successfully synchronized target network parameters.", math: "\\theta^- = \\theta" }
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
                    <span style="font-family:var(--font-mono); font-size:0.78rem; font-weight:700; color:#818cf8; letter-spacing:0.05em; text-transform:uppercase;">💡 INTERACTIVE LINE-BY-LINE CODE INSPECTOR</span>
                    <span style="font-size:0.78rem; font-weight:600; color:${isLocked ? '#f472b6' : 'var(--text-secondary)'}; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); padding:0.25rem 0.75rem; border-radius:50px;">
                        ${isLocked ? '📌 Line Locked – Click another line or click again to unlock' : '💡 Hovering Line – Click line to lock inspection'}
                    </span>
                </div>

                <div style="margin-bottom:0.75rem;">
                    <span style="background:${isLocked ? 'rgba(244,114,182,0.15)' : 'rgba(129,140,248,0.15)'}; color:${isLocked ? '#f472b6' : '#818cf8'}; border:1px solid ${isLocked ? 'rgba(244,114,182,0.3)' : 'rgba(129,140,248,0.3)'}; padding:0.25rem 0.75rem; border-radius:50px; font-size:0.8rem; font-weight:700; font-family:var(--font-mono); display:inline-block;">
                        📌 Line ${selectedLine} ${isLocked ? '(Locked)' : '(Hover preview)'}
                    </span>
                </div>

                <h3 style="font-size:1.25rem; font-weight:700; color:#ffffff; margin:0.5rem 0 1rem 0;">${info.title}</h3>

                <div style="margin-bottom:0.85rem;">
                    <div style="font-weight:700; color:#818cf8; font-size:0.88rem; margin-bottom:0.35rem; display:flex; align-items:center; gap:0.4rem;">
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
                        ${info.why || 'Stabilizes deep Q-network gradient updates via replay memory and target network freezing.'}
                    </p>
                </div>

                ${info.math ? `
                <div style="background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:1rem 1.25rem; margin-top:1rem;">
                    <div style="font-weight:700; color:#a78bfa; font-size:0.85rem; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.4rem;">
                        <span>📐</span> <span>Math Formulation:</span>
                    </div>
                    <div style="margin:0; padding:0; background:transparent; border:none; text-align:center; font-size:1rem; color:#818cf8;">
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
            else if (step === 'step2') targetLine = 9;
            else if (step === 'step3') targetLine = 18;
            else if (step === 'step4') targetLine = 21;

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
