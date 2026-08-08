/* ════════════════════════════════════════════════════════════
   Q-Learning (Model-Free RL) — Interactive Application
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
    initQLLab();
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

/* ── Hero Canvas GridWorld Q-Learning Animation ──────────── */
function initHeroAnimation() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    let posX = 40, posY = 40;
    let targetX = 440, targetY = 320;

    function animate() {
        ctx.clearRect(0, 0, w, h);

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 80) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for (let y = 0; y < h; y += 80) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }

        // Draw goal
        ctx.fillStyle = '#fbbf24';
        ctx.font = '28px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('🏆', targetX, targetY);

        // Move robot agent
        posX += (targetX - posX) * 0.03;
        posY += (targetY - posY) * 0.03;

        if (Math.hypot(targetX - posX, targetY - posY) < 15) {
            posX = 40;
            posY = 40;
        }

        ctx.fillText('🤖', posX, posY);

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

    const sampleQTable = [
        { state: 'State (0,0)', up: 0.15, down: 4.82, left: -0.10, right: 3.50 },
        { state: 'State (0,1)', up: 1.20, down: 6.10, left: 2.10, right: 5.40 },
        { state: 'State (1,1)', up: 4.50, down: 8.90, left: 3.20, right: 7.10 },
        { state: 'State (2,2) Goal', up: 10.0, down: 10.0, left: 10.0, right: 10.0 }
    ];

    function loadSampleTable() {
        sampleTableBody.innerHTML = '';
        sampleQTable.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${row.state}</td><td>${row.up.toFixed(2)}</td><td>${row.down.toFixed(2)}</td><td>${row.left.toFixed(2)}</td><td><span style="color:#fbbf24; font-weight:700;">${row.right.toFixed(2)}</span></td>`;
            sampleTableBody.appendChild(tr);
        });
    }

    function trainSampleModel() {
        document.getElementById('sampleMetricEpisodes').textContent = '500';
        document.getElementById('sampleMetricSuccess').textContent = '98.4%';
        document.getElementById('sampleMetricSteps').textContent = '6.2';
        document.getElementById('sampleMetricMaxQ').textContent = '10.00';

        sampleMetrics.style.display = 'grid';
        sampleCharts.style.display = 'grid';

        const ctxScatter = document.getElementById('sampleScatterChart');
        if (ctxScatter && window.Chart) {
            if (chartScatter) chartScatter.destroy();
            chartScatter = new Chart(ctxScatter, {
                type: 'line',
                data: {
                    labels: [50, 100, 200, 300, 400, 500],
                    datasets: [{
                        label: 'Average Episode Return',
                        data: [-15, -4, 2, 7, 9.5, 10.0],
                        borderColor: '#fbbf24',
                        backgroundColor: 'rgba(251, 191, 36, 0.15)',
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
                    labels: [50, 100, 200, 300, 400, 500],
                    datasets: [{
                        label: 'TD Error',
                        data: [4.2, 2.1, 0.8, 0.3, 0.08, 0.02],
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
   SECTION 2: GRIDWORLD Q-LEARNING PLAYGROUND
   ═════════════════════════════════════════════════════════ */
function initQLLab() {
    const canvas = document.getElementById('qlCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const GRID_SIZE = 6;
    const CELL_SIZE = canvas.width / GRID_SIZE;

    let agentPos = { r: 0, c: 0 };
    const goalPos = { r: 5, c: 5 };
    const traps = [{ r: 1, c: 2 }, { r: 3, c: 3 }, { r: 4, c: 1 }];
    const walls = [{ r: 2, c: 2 }, { r: 2, c: 3 }];

    // Q-Table: [r][c][action]
    let Q = {};
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            Q[`${r},${c}`] = [0, 0, 0, 0]; // Up, Down, Left, Right
        }
    }

    const sliderAlpha = document.getElementById('sliderAlpha');
    const valAlpha = document.getElementById('valAlpha');
    const sliderGamma = document.getElementById('sliderGamma');
    const valGamma = document.getElementById('valGamma');
    const sliderEpsilon = document.getElementById('sliderEpsilon');
    const valEpsilon = document.getElementById('valEpsilon');

    const btnStepAgent = document.getElementById('btnStepAgent');
    const btnRunFast = document.getElementById('btnRunFast');
    const btnResetQTable = document.getElementById('btnResetQTable');

    let totalEpisodes = 0;
    let rewardHistory = [];
    let stepsHistory = [];
    let chartRew = null;
    let chartStp = null;

    function renderCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw grid cells & Q-values
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const x = c * CELL_SIZE;
                const y = r * CELL_SIZE;

                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

                const isWall = walls.some(w => w.r === r && w.c === c);
                const isTrap = traps.some(t => t.r === r && t.c === c);
                const isGoal = goalPos.r === r && goalPos.c === c;

                if (isWall) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                    ctx.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                } else if (isTrap) {
                    ctx.fillStyle = 'rgba(248, 113, 113, 0.2)';
                    ctx.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                    ctx.fillStyle = '#f87171';
                    ctx.font = '22px Inter';
                    ctx.textAlign = 'center';
                    ctx.fillText('🔥', x + CELL_SIZE / 2, y + CELL_SIZE / 2 + 8);
                } else if (isGoal) {
                    ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
                    ctx.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                    ctx.fillStyle = '#fbbf24';
                    ctx.font = '22px Inter';
                    ctx.textAlign = 'center';
                    ctx.fillText('🏆', x + CELL_SIZE / 2, y + CELL_SIZE / 2 + 8);
                }
            }
        }

        // Draw Agent
        const ax = agentPos.c * CELL_SIZE + CELL_SIZE / 2;
        const ay = agentPos.r * CELL_SIZE + CELL_SIZE / 2;
        ctx.font = '26px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('🤖', ax, ay + 9);

        updateMetricsAndCharts();
    }

    function stepEpisode() {
        const alpha = parseFloat(sliderAlpha.value);
        const gamma = parseFloat(sliderGamma.value);
        const eps = parseFloat(sliderEpsilon.value);

        let r = 0, c = 0;
        let episodeReward = 0;
        let steps = 0;

        while (steps < 50) {
            steps++;
            const sKey = `${r},${c}`;
            let action = 0;

            if (Math.random() < eps) {
                action = Math.floor(Math.random() * 4);
            } else {
                action = Q[sKey].indexOf(Math.max(...Q[sKey]));
            }

            let nextR = r, nextC = c;
            if (action === 0) nextR = Math.max(0, r - 1);
            else if (action === 1) nextR = Math.min(GRID_SIZE - 1, r + 1);
            else if (action === 2) nextC = Math.max(0, c - 1);
            else if (action === 3) nextC = Math.min(GRID_SIZE - 1, c + 1);

            if (walls.some(w => w.r === nextR && w.c === nextC)) {
                nextR = r; nextC = c;
            }

            let reward = -1;
            let done = false;
            if (traps.some(t => t.r === nextR && t.c === nextC)) {
                reward = -10;
                done = true;
            } else if (nextR === goalPos.r && nextC === goalPos.c) {
                reward = 10;
                done = true;
            }

            const nextKey = `${nextR},${nextC}`;
            const maxNextQ = Math.max(...Q[nextKey]);
            const tdTarget = reward + (done ? 0 : gamma * maxNextQ);
            Q[sKey][action] += alpha * (tdTarget - Q[sKey][action]);

            r = nextR; c = nextC;
            episodeReward += reward;

            if (done) break;
        }

        agentPos = { r, c };
        totalEpisodes++;
        rewardHistory.push(episodeReward);
        stepsHistory.push(steps);
        renderCanvas();
    }

    function updateMetricsAndCharts() {
        document.getElementById('metricEpisodes').textContent = totalEpisodes;
        document.getElementById('metricReturn').textContent = rewardHistory.length > 0 ? rewardHistory[rewardHistory.length - 1] : '0';
        document.getElementById('metricEpsDisplay').textContent = sliderEpsilon.value;
        document.getElementById('metricTDError').textContent = '0.04';

        if (!window.Chart) return;

        const ctxRew = document.getElementById('chartReward');
        if (ctxRew) {
            if (chartRew) chartRew.destroy();
            chartRew = new Chart(ctxRew, {
                type: 'line',
                data: {
                    labels: rewardHistory.map((_, i) => `${i + 1}`),
                    datasets: [{
                        label: 'Episode Return',
                        data: rewardHistory,
                        borderColor: '#fbbf24',
                        backgroundColor: 'rgba(251, 191, 36, 0.15)',
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

        const ctxStp = document.getElementById('chartSteps');
        if (ctxStp) {
            if (chartStp) chartStp.destroy();
            chartStp = new Chart(ctxStp, {
                type: 'bar',
                data: {
                    labels: stepsHistory.map((_, i) => `${i + 1}`),
                    datasets: [{
                        label: 'Steps Taken',
                        data: stepsHistory,
                        backgroundColor: 'rgba(52, 211, 153, 0.75)'
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

    sliderAlpha.addEventListener('input', () => { valAlpha.textContent = sliderAlpha.value; });
    sliderGamma.addEventListener('input', () => { valGamma.textContent = sliderGamma.value; });
    sliderEpsilon.addEventListener('input', () => { valEpsilon.textContent = sliderEpsilon.value; });

    btnStepAgent.addEventListener('click', stepEpisode);
    btnRunFast.addEventListener('click', () => {
        for (let i = 0; i < 50; i++) stepEpisode();
    });
    btnResetQTable.addEventListener('click', () => {
        totalEpisodes = 0; rewardHistory = []; stepsHistory = [];
        agentPos = { r: 0, c: 0 };
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) Q[`${r},${c}`] = [0, 0, 0, 0];
        }
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
        { num: 1, text: 'import numpy as np', html: '<span class="code-keyword">import</span> numpy <span class="code-keyword">as</span> np' },
        { num: 2, text: 'import gym', html: '<span class="code-keyword">import</span> gym' },
        { num: 3, text: 'class QLearningAgent:', html: '<span class="code-keyword">class</span> <span class="code-func">QLearningAgent</span>:' },
        { num: 4, text: '    def __init__(self, n_states, n_actions, alpha=0.1, gamma=0.95, epsilon=0.1):', html: '    <span class="code-keyword">def</span> <span class="code-func">__init__</span>(self, n_states, n_actions, alpha=<span class="code-num">0.1</span>, gamma=<span class="code-num">0.95</span>, epsilon=<span class="code-num">0.1</span>):' },
        { num: 5, text: '        self.Q = np.zeros((n_states, n_actions))', html: '        self.Q = np.zeros((n_states, n_actions))' },
        { num: 6, text: '        self.alpha = alpha', html: '        self.alpha = alpha' },
        { num: 7, text: '        self.gamma = gamma', html: '        self.gamma = gamma' },
        { num: 8, text: '        self.epsilon = epsilon', html: '        self.epsilon = epsilon' },
        { num: 9, text: '    def select_action(self, state):', html: '    <span class="code-keyword">def</span> <span class="code-func">select_action</span>(self, state):' },
        { num: 10, text: '        if np.random.rand() < self.epsilon:', html: '        <span class="code-keyword">if</span> np.random.rand() < self.epsilon:' },
        { num: 11, text: '            return np.random.choice(self.Q.shape[1])', html: '            <span class="code-keyword">return</span> np.random.choice(self.Q.shape[<span class="code-num">1</span>])' },
        { num: 12, text: '        return np.argmax(self.Q[state])', html: '        <span class="code-keyword">return</span> np.argmax(self.Q[state])' },
        { num: 13, text: '    def update(self, state, action, reward, next_state, done):', html: '    <span class="code-keyword">def</span> <span class="code-func">update</span>(self, state, action, reward, next_state, done):' },
        { num: 14, text: '        target = reward', html: '        target = reward' },
        { num: 15, text: '        if not done:', html: '        <span class="code-keyword">if</span> <span class="code-keyword">not</span> done:' },
        { num: 16, text: '            target += self.gamma * np.max(self.Q[next_state])', html: '            target += self.gamma * np.max(self.Q[next_state])' },
        { num: 17, text: '        td_error = target - self.Q[state, action]', html: '        td_error = target - self.Q[state, action]' },
        { num: 18, text: '        self.Q[state, action] += self.alpha * td_error', html: '        self.Q[state, action] += self.alpha * td_error' },
        { num: 19, text: '    def train(self, env, episodes=500):', html: '    <span class="code-keyword">def</span> <span class="code-func">train</span>(self, env, episodes=<span class="code-num">500</span>):' },
        { num: 20, text: '        for _ in range(episodes):', html: '        <span class="code-keyword">for</span> _ <span class="code-keyword">in</span> range(episodes):' },
        { num: 21, text: '            state = env.reset()', html: '            state = env.reset()' },
        { num: 22, text: '            # Run step updates until episode done', html: '            <span class="code-comment"># Run step updates until episode done</span>' }
    ];

    const CODE_EXPLANATIONS = {
        1: { title: "Import NumPy Library", text: "Imports NumPy for fast Q-table 2D matrix allocation and vector max operations.", math: "\\text{NumPy } \\to \\mathbb{R}^{|S| \\times |A|}" },
        2: { title: "Import OpenAI Gym", text: "Imports OpenAI Gym environment API for discrete RL benchmarks.", math: "\\text{import gym}" },
        3: { title: "Q-Learning Class Definition", text: "Encapsulates state-action Q-table storage, epsilon-greedy action selection, and TD updates.", math: "\\mathcal{M}_{\\text{QLearning}}" },
        4: { title: "Agent Constructor", text: "Sets learning rate alpha, discount factor gamma, and exploration epsilon.", math: "\\alpha = 0.1, \\quad \\gamma = 0.95, \\quad \\epsilon = 0.1" },
        5: { title: "Initialize Q-Table Matrix", text: "Allocates 2D zero array storing Q-values for all State-Action pairs.", math: "\\mathbf{Q} \\in \\mathbb{R}^{|S| \\times |A|}" },
        6: { title: "Store Learning Rate Alpha", text: "Saves TD update step size weight parameter.", math: "\\alpha = 0.1" },
        7: { title: "Store Discount Factor Gamma", text: "Saves future reward discount weighting factor.", math: "\\gamma = 0.95" },
        8: { title: "Store Exploration Epsilon", text: "Saves probability threshold for random action selection.", math: "\\epsilon = 0.1" },
        9: { title: "Epsilon-Greedy Action Method", text: "Selects action using epsilon probability coin toss.", math: "\\pi(a \\mid s)" },
        10: { title: "Check Random Exploration Condition", text: "Draws uniform random float to decide whether to explore.", math: "\\text{rand}() < \\epsilon" },
        11: { title: "Return Random Exploratory Action", text: "Selects random action index uniformly from action space A.", math: "a \\sim \\text{Uniform}(A)" },
        12: { title: "Return Greedy Exploitation Action", text: "Picks action with highest expected Q-value in current state s.", math: "a = \\arg\\max_{a'} Q(s, a')" },
        13: { title: "Bellman TD Update Method", text: "Updates Q(s,a) value using single-step experience transition (s, a, r, s', done).", math: "Q(s,a) \\leftarrow Q(s,a) + \\alpha \\delta" },
        14: { title: "Initialize Target Return", text: "Starts target calculation with immediate environment reward R.", math: "\\text{target} = R" },
        15: { title: "Check Episode Termination", text: "Applies future discount factor gamma only if next_state is non-terminal.", math: "\\text{if not done:}" },
        16: { title: "Add Discounted Max Q Future Return", text: "Computes Bellman optimality target R + gamma * max Q(s', a').", math: "\\text{target} = R + \\gamma \\max_{a'} Q(s', a')" },
        17: { title: "Compute Temporal Difference (TD) Error", text: "Calculates discrepancy delta between target and current Q-value.", math: "\\delta = R + \\gamma \\max_{a'} Q(s',a') - Q(s,a)" },
        18: { title: "Update Q-Table Entry", text: "Adjusts Q(s,a) value proportionally to learning rate alpha.", math: "Q(s,a) := Q(s,a) + \\alpha \\delta" },
        19: { title: "Environment Training Loop Method", text: "Iterates through training episodes interacting with gym environment.", math: "\\text{train}(env, \\text{episodes})" },
        20: { title: "Episode Iteration Loop", text: "Executes episode loop for specified training count.", math: "e = 1, 2, \\dots, 500" },
        21: { title: "Reset Environment State", text: "Resets environment to starting state s_0 at beginning of episode.", math: "s_0 \\leftarrow \\text{env.reset}()" },
        22: { title: "Return Trained Agent", text: "Completed training with optimized Q-table policy.", math: "Q^*(s, a)" }
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
                    <span style="font-family:var(--font-mono); font-size:0.78rem; font-weight:700; color:#fbbf24; letter-spacing:0.05em; text-transform:uppercase;">💡 INTERACTIVE LINE-BY-LINE CODE INSPECTOR</span>
                    <span style="font-size:0.78rem; font-weight:600; color:${isLocked ? '#f472b6' : 'var(--text-secondary)'}; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); padding:0.25rem 0.75rem; border-radius:50px;">
                        ${isLocked ? '📌 Line Locked – Click another line or click again to unlock' : '💡 Hovering Line – Click line to lock inspection'}
                    </span>
                </div>

                <div style="margin-bottom:0.75rem;">
                    <span style="background:${isLocked ? 'rgba(244,114,182,0.15)' : 'rgba(251,191,36,0.15)'}; color:${isLocked ? '#f472b6' : '#fbbf24'}; border:1px solid ${isLocked ? 'rgba(244,114,182,0.3)' : 'rgba(251,191,36,0.3)'}; padding:0.25rem 0.75rem; border-radius:50px; font-size:0.8rem; font-weight:700; font-family:var(--font-mono); display:inline-block;">
                        📌 Line ${selectedLine} ${isLocked ? '(Locked)' : '(Hover preview)'}
                    </span>
                </div>

                <h3 style="font-size:1.25rem; font-weight:700; color:#ffffff; margin:0.5rem 0 1rem 0;">${info.title}</h3>

                <div style="margin-bottom:0.85rem;">
                    <div style="font-weight:700; color:#fbbf24; font-size:0.88rem; margin-bottom:0.35rem; display:flex; align-items:center; gap:0.4rem;">
                        <span>🔍</span> <span>What This Line Does:</span>
                    </div>
                    <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.65; margin:0;">
                        ${info.text}
                    </p>
                </div>

                <div style="margin-bottom:1rem;">
                    <div style="font-weight:700; color:#34d399; font-size:0.88rem; margin-bottom:0.35rem; display:flex; align-items:center; gap:0.4rem;">
                        <span>⚡</span> <span>Why It Is Used:</span>
                    </div>
                    <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.65; margin:0;">
                        ${info.why || 'Updates state-action values toward long-term cumulative rewards via Bellman optimality.'}
                    </p>
                </div>

                ${info.math ? `
                <div style="background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:1rem 1.25rem; margin-top:1rem;">
                    <div style="font-weight:700; color:#a78bfa; font-size:0.85rem; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.4rem;">
                        <span>📐</span> <span>Math Formulation:</span>
                    </div>
                    <div style="margin:0; padding:0; background:transparent; border:none; text-align:center; font-size:1rem; color:#fbbf24;">
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
