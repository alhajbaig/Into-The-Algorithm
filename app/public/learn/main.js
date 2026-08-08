document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initScrollAnimations();
    initParallax();
    initTrackRoadmaps();
    init3DCards();
    initMagneticButtons();
    initParadigmFilters();
    initAlgoModals();
});

function init3DCards() {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    const cards = document.querySelectorAll('.algo-card, .card, .viz-card, .control-panel, .prereq-card, .concept-card');
    cards.forEach(card => {
        let gloss = card.querySelector('.card-gloss-overlay');
        if (!gloss) {
            gloss = document.createElement('div');
            gloss.className = 'card-gloss-overlay';
            card.appendChild(gloss);
        }

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -7;
            const rotateY = ((x - centerX) / centerX) * 7;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            card.style.transition = 'transform 0.1s ease-out';
            gloss.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.12) 0%, transparent 70%)`;
            gloss.style.opacity = '1';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
            card.style.transition = 'transform 0.5s ease-out';
            gloss.style.opacity = '0';
        });
    });
}

function initMagneticButtons() {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    const btns = document.querySelectorAll('[data-magnetic], .btn, .btn-primary, .nav-links a, .action-btn');
    btns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const deltaX = (e.clientX - centerX) * 0.3;
            const deltaY = (e.clientY - centerY) * 0.3;

            btn.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            btn.style.transition = 'transform 0.1s ease-out';
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0px, 0px)';
            btn.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        });
    });
}

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
            if (scrollY >= (sectionTop - 150)) {
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
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const elementsToAnimate = document.querySelectorAll('.glass-card, .section-header, .algo-grid');
    
    const algoCards = document.querySelectorAll('.algo-card');
    algoCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });

    elementsToAnimate.forEach(el => {
        el.classList.add('animate-in');
        observer.observe(el);
    });
}

function initParallax() {
    const heroContent = document.querySelector('.hero-content');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY < window.innerHeight) {
            const scroll = window.scrollY;
            if (heroContent) {
                heroContent.style.transform = `translateY(${scroll * 0.3}px)`;
                heroContent.style.opacity = 1 - (scroll * 0.0025);
            }
        }
    });
}

/* ═════════════════════════════════════════════════════════
   SPECIALIZED TRACK ROADMAPS DATA & CONTROLLER
   ═════════════════════════════════════════════════════════ */
const TRACK_DATA = {
    research: {
        title: "🔬 Machine Learning Research Scientist",
        subtitle: "First-principles mathematical derivations, novel architecture design, and original AI paper publishing.",
        duration: "12 - 18 Months",
        prereqs: "Linear Algebra • Calculus • Probability • Python",
        steps: [
            {
                phase: "Phase 01 — Rigorous Mathematical Theory",
                icon: "📐",
                title: "Linear Algebra & Vector Calculus",
                desc: "Master matrix operations, Eigendecomposition, Singular Value Decomposition (SVD), Jacobian matrices, and Hessian optimization bounds.",
                skills: ["Spectral Theorem", "SVD & PCA", "Convex Optimization", "Gradient Vector Fields"]
            },
            {
                phase: "Phase 02 — First-Principles Algorithm Derivations",
                icon: "⚡",
                title: "Loss Functions & Optimization Math",
                desc: "Derive OLS Normal Equations, LogLoss Maximum Likelihood Estimation, Mercer's Kernel trick for SVMs, and Information Gain ratio proofs.",
                skills: ["Normal Equations", "MLE & MAP", "Lagrange Duality", "Gini & Entropy Math"]
            },
            {
                phase: "Phase 03 — Deep Learning & Autograd Engines",
                icon: "🧠",
                title: "Neural Networks & Backpropagation",
                desc: "Build scalar and tensor autograd engines (like Micrograd) from scratch. Master Transformer self-attention math and positional embeddings.",
                skills: ["Autograd Computational Graphs", "Self-Attention Math", "Softmax Loss", "LayerNorm & Residuals"]
            },
            {
                phase: "Phase 04 — Frontier AI & Novel Architectures",
                icon: "🚀",
                title: "Diffusion Models & State-Space Systems",
                desc: "Formulate Denoising Diffusion Probabilistic Models (DDPM), Score-based generative models, and Selective State Space Models (Mamba).",
                skills: ["Stochastic Calculus", "DDPM SDEs", "Mamba SSMs", "RLHF & DPO Math"]
            }
        ]
    },
    mlops: {
        title: "⚙️ MLOps & Production Systems Engineer",
        subtitle: "Architecting high-throughput model serving, automated CI/CD training pipelines, and microsecond latency inference engines.",
        duration: "9 - 12 Months",
        prereqs: "Python OOP • C++ • Linux Systems • Docker",
        steps: [
            {
                phase: "Phase 01 — Core Engineering & Containerization",
                icon: "💻",
                title: "Software Craftsmanship & Docker",
                desc: "Write modular Python packages, multi-stage Dockerfiles, Linux shell tooling, and asynchronous API endpoints (FastAPI / gRPC).",
                skills: ["Docker & Containerization", "FastAPI / gRPC", "Asynchronous I/O", "Git & CI/CD Actions"]
            },
            {
                phase: "Phase 02 — Production Machine Learning Pipelines",
                icon: "📊",
                title: "Feature Stores & Model Repositories",
                desc: "Set up feature stores (Feast), experiment tracking (MLflow / Weights & Biases), and automated data drift validation pipelines (Evidently AI).",
                skills: ["MLflow", "Feast Feature Store", "Great Expectations", "Data Drift Monitoring"]
            },
            {
                phase: "Phase 03 — Model Acceleration & Quantization",
                icon: "⚡",
                title: "High-Performance Inference Engines",
                desc: "Export PyTorch models to ONNX and TensorRT. Quantize weights (INT8 / FP8) and deploy Triton Inference Server for maximum GPU throughput.",
                skills: ["Triton Inference Server", "TensorRT Engine", "ONNX Runtime", "INT8 / FP8 Quantization"]
            },
            {
                phase: "Phase 04 — Kubernetes & Distributed Orchestration",
                icon: "🌐",
                title: "Kubeflow & Multi-Node Cluster Serving",
                desc: "Orchestrate automated retraining workflows on Kubernetes clusters using Kubeflow Pipelines and Ray Train/Serve.",
                skills: ["Kubernetes & Helm", "Kubeflow Pipelines", "Ray Distributed Serving", "Prometheus & Grafana"]
            }
        ]
    },
    vision: {
        title: "👁️ Computer Vision & Spatial AI Specialist",
        subtitle: "From 2D convolutional feature extraction to 3D Gaussian Splatting and multimodal vision-language models.",
        duration: "10 - 14 Months",
        prereqs: "Python • OpenCV • Matrix Math • PyTorch",
        steps: [
            {
                phase: "Phase 01 — Image Processing & Kernel Operations",
                icon: "🖼️",
                title: "Classical Computer Vision",
                desc: "Understand spatial convolutions, Sobel edge detectors, color space transformations, Gaussian filtering, and SIFT/SURF keypoint matching.",
                skills: ["Spatial Convolutions", "OpenCV Matrix Operations", "Fourier Analysis", "Harris Corner Detection"]
            },
            {
                phase: "Phase 02 — Deep Convolutional Architectures",
                icon: "🔍",
                title: "CNNs & Transfer Learning",
                desc: "Master LeNet, AlexNet, VGG, ResNet skip connections, EfficientNet, and Fine-Tuning pretrained backbones for custom vision tasks.",
                skills: ["ResNet Residual Blocks", "Data Augmentations", "Transfer Learning", "Feature Pyramid Networks"]
            },
            {
                phase: "Phase 03 — Detection, Segmentation & 3D Vision",
                icon: "🎯",
                title: "Object Detection & Spatial Rendering",
                desc: "Build YOLO real-time detectors, Mask R-CNN instance segmentors, Neural Radiance Fields (NeRFs), and 3D Gaussian Splatting.",
                skills: ["YOLO Real-Time Detection", "Mask R-CNN", "NeRF & 3D Splatting", "Stereo Depth Estimation"]
            },
            {
                phase: "Phase 04 — Multimodal Vision-Language Models",
                icon: "✨",
                title: "CLIP, LLaVA & Embodied AI",
                desc: "Train contrastive vision-language models (CLIP) and visual instruction tuned LLMs (LLaVA) for autonomous robotics and spatial perception.",
                skills: ["Contrastive CLIP Loss", "LLaVA Architecture", "Visual Question Answering", "Spatial Robotics AI"]
            }
        ]
    },
    llm: {
        title: "💬 NLP & LLM Systems Engineer",
        subtitle: "Architecting large language models from Transformer self-attention math to distributed pre-training and FlashAttention inference.",
        duration: "10 - 14 Months",
        prereqs: "Python • PyTorch • Deep Learning • NLP Fundamentals",
        steps: [
            {
                phase: "Phase 01 — Text Representations & Tokenization",
                icon: "🔤",
                title: "Tokens, Embeddings & Language Modeling",
                desc: "Master Byte-Pair Encoding (BPE) tokenization, Word2Vec vector spaces, and Recurrent Neural Networks (LSTMs & GRUs).",
                skills: ["BPE & SentencePiece", "Vector Cosine Distance", "LSTM Recurrence", "Perplexity Evaluation"]
            },
            {
                phase: "Phase 02 — The Transformer Architecture",
                icon: "⚡",
                title: "Attention mechanisms & Decoder-Only LLMs",
                desc: "Implement Multi-Head Self-Attention, Rotary Position Embeddings (RoPE), SwiGLU activations, and RMSNorm in pure PyTorch.",
                skills: ["Multi-Head Self-Attention", "RoPE & ALiBi Embeddings", "SwiGLU & RMSNorm", "Casual Masking"]
            },
            {
                phase: "Phase 03 — Fine-Tuning & Parameter-Efficient ML",
                icon: "🎯",
                title: "LoRA, QLoRA & Distributed Training",
                desc: "Fine-tune models using Low-Rank Adaptation (LoRA), 4-bit Quantization (QLoRA), DeepSpeed ZeRO-3, and FSDP distributed parallelism.",
                skills: ["LoRA Rank Matrices", "4-bit NormalFloat QLoRA", "DeepSpeed ZeRO-3", "PyTorch FSDP"]
            },
            {
                phase: "Phase 04 — Alignment & Ultra-Fast Inference",
                icon: "🚀",
                title: "RLHF, DPO & vLLM Serving",
                desc: "Align models via Direct Preference Optimization (DPO). Serve models with vLLM PagedAttention, KV-Cache optimization, and FlashAttention-2.",
                skills: ["DPO & RLHF Policy Loss", "vLLM PagedAttention", "FlashAttention-2 Kernels", "Speculative Decoding"]
            }
        ]
    },
    analytics: {
        title: "📈 Predictive Analytics & Data Science Expert",
        subtitle: "Translating complex enterprise data into predictive econometric models, time-series forecasts, and high-stakes business decisions.",
        duration: "8 - 12 Months",
        prereqs: "Python • SQL • Probability & Statistics • Pandas",
        steps: [
            {
                phase: "Phase 01 — Statistical Inference & EDA",
                icon: "📊",
                title: "Exploratory Analysis & Hypothesis Testing",
                desc: "Master statistical distribution fitting, t-tests, ANOVA, Chi-Square independence, and exploratory data analysis using Pandas & Seaborn.",
                skills: ["Hypothesis Testing", "ANOVA & t-tests", "Pandas & Polars", "Seaborn Visualizations"]
            },
            {
                phase: "Phase 02 — Predictive Classical ML & Boosting",
                icon: "🌳",
                title: "Gradient Boosting & Feature Engineering",
                desc: "Build state-of-the-art predictive pipelines using XGBoost, LightGBM, and CatBoost. Engineer domain-specific interaction features.",
                skills: ["XGBoost & LightGBM", "SHAP Feature Importance", "Cross-Validation Schemes", "Target Encoding"]
            },
            {
                phase: "Phase 03 — Time Series & Econometric Forecasting",
                icon: "⏳",
                title: "Temporal Modeling & Deep Forecasting",
                desc: "Forecast non-stationary signals using ARIMA, Prophet, NeuralProphet, and Temporal Fusion Transformers (TFT).",
                skills: ["Stationarity & ADF Test", "ARIMA & SARIMAX", "Prophet Forecasting", "Temporal Fusion Transformers"]
            },
            {
                phase: "Phase 04 — Causal Inference & A/B Testing",
                icon: "🎯",
                title: "Experimentation & Business Impact",
                desc: "Design robust A/B testing systems, calculate Sample Size power analysis, and perform Uplift Modeling with CausalTrees & DoWhy.",
                skills: ["A/B Testing Power Analysis", "Causal Inference (DoWhy)", "Uplift Modeling", "Synthetic Controls"]
            }
        ]
    }
};

function initTrackRoadmaps() {
    const container = document.getElementById('roadmapDisplayContainer');
    const tabBtns = document.querySelectorAll('.track-tab-btn');
    if (!container || tabBtns.length === 0) return;

    // Function to render track details
    const renderTrack = (trackKey) => {
        const data = TRACK_DATA[trackKey];
        if (!data) return;

        let stepsHTML = '';
        data.steps.forEach((step, idx) => {
            let skillsHTML = step.skills.map(s => `<span class="skill-badge">${s}</span>`).join('');
            stepsHTML += `
                <div class="timeline-step-node">
                    <div class="timeline-dot">${step.icon}</div>
                    <div class="timeline-content-card">
                        <div class="timeline-card-head">
                            <h4>${step.title}</h4>
                            <span class="timeline-phase-tag">${step.phase}</span>
                        </div>
                        <p class="timeline-card-desc">${step.desc}</p>
                        <div class="timeline-skills-row">${skillsHTML}</div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = `
            <div class="track-header-info">
                <div class="track-title-box">
                    <h3>${data.title}</h3>
                    <p>${data.subtitle}</p>
                </div>
                <div class="track-meta-pills">
                    <span class="track-meta-pill" style="color:var(--accent);">⏱️ ${data.duration}</span>
                    <span class="track-meta-pill" style="color:var(--accent-2);">📚 ${data.prereqs}</span>
                </div>
            </div>
            <div class="roadmap-timeline">
                ${stepsHTML}
            </div>
        `;
    };

    // Render default track
    renderTrack('research');

    // Attach click listeners to tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const trackKey = btn.getAttribute('data-track');
            renderTrack(trackKey);
        });
    });
}

/* ═════════════════════════════════════════════════════════
   LEARNING PARADIGMS FILTER & ALGORITHM MODALS
   ═════════════════════════════════════════════════════════ */
function initParadigmFilters() {
    const filterBtns = document.querySelectorAll('.paradigm-filter-btn');
    const categoryBlocks = document.querySelectorAll('.paradigm-category-block');

    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const paradigm = btn.getAttribute('data-paradigm');

            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            categoryBlocks.forEach(block => {
                const blockParadigm = block.getAttribute('data-paradigm');
                if (paradigm === 'all' || blockParadigm === paradigm) {
                    block.classList.remove('hidden');
                    block.style.opacity = '1';
                    block.style.transform = 'translateY(0)';
                } else {
                    block.classList.add('hidden');
                }
            });
        });
    });
}

const ALGO_MODAL_DATA = {
    random_forest: {
        title: "Random Forest & XGBoost",
        icon: "🌲",
        paradigm: "Supervised Learning",
        type: "Ensemble Methods",
        formula: "y = \\sum_{m=1}^M f_m(X)",
        desc: "Random Forests construct an ensemble of randomized decision trees (Bagging). Gradient Boosting (XGBoost) iteratively trains sequential trees to minimize pseudo-residuals of loss functions using gradient descent.",
        code: `# Python (Scikit-Learn & XGBoost)\nfrom sklearn.ensemble import RandomForestClassifier\nimport xgboost as xgb\n\n# Random Forest Ensemble\nrf = RandomForestClassifier(n_estimators=100, max_depth=10)\nrf.fit(X_train, y_train)\n\n# XGBoost Gradient Boosting\nxgb_model = xgb.XGBClassifier(learning_rate=0.05, n_estimators=200)\nxgb_model.fit(X_train, y_train)`,
        tags: ["Supervised", "Ensemble", "Bagging & Boosting", "High Accuracy"]
    },
    pca: {
        title: "Principal Component Analysis (PCA)",
        icon: "📐",
        paradigm: "Unsupervised Learning",
        type: "Dimensionality Reduction",
        formula: "X^T X v = \\lambda v",
        desc: "PCA identifies orthogonal principal axes capturing maximal variance across high-dimensional features. Projecting data onto these top eigenvectors reduces noise while preserving critical variance.",
        code: `# PCA Matrix Eigendecomposition with NumPy\nimport numpy as np\n\nX_centered = X - np.mean(X, axis=0)\ncov_matrix = np.cov(X_centered, rowvar=False)\neig_vals, eig_vecs = np.linalg.eigh(cov_matrix)\n\n# Select top k components\nidx = np.argsort(eig_vals)[::-1]\ncomponents = eig_vecs[:, idx[:k]]\nX_pca = np.dot(X_centered, components)`,
        tags: ["Unsupervised", "Linear Algebra", "Variance Maximization", "SVD"]
    },
    q_learning: {
        title: "Q-Learning (Model-Free RL)",
        icon: "🎮",
        paradigm: "Reinforcement Learning",
        type: "Temporal Difference Value Method",
        formula: "Q(s,a) \\leftarrow Q(s,a) + \\alpha \\left[ r + \\gamma \\max_{a'} Q(s',a') - Q(s,a) \\right]",
        desc: "An off-policy reinforcement learning algorithm that learns an optimal action-value function Q(s,a) directly from environmental rewards without prior knowledge of environment transition dynamics.",
        code: `# Q-Learning Bellman Step\nfor episode in range(episodes):\n    state = env.reset()\n    done = False\n    while not done:\n        action = choose_action_epsilon_greedy(state, q_table)\n        next_state, reward, done, _ = env.step(action)\n        \n        # Bellman update\n        best_next_action = np.argmax(q_table[next_state])\n        td_target = reward + gamma * q_table[next_state, best_next_action]\n        q_table[state, action] += alpha * (td_target - q_table[state, action])\n        state = next_state`,
        tags: ["Reinforcement", "Model-Free", "Off-Policy", "Bellman Equation"]
    },
    dqn: {
        title: "Deep Q-Networks (DQN)",
        icon: "🕹️",
        paradigm: "Reinforcement Learning",
        type: "Deep Value Approximation",
        formula: "L(\\theta) = \\mathbb{E} \\left[ \\left( r + \\gamma \\max_{a'} Q(s',a'; \\theta^-) - Q(s,a; \\theta) \\right)^2 \\right]",
        desc: "Replaces tabular Q-tables with deep neural networks for continuous or high-dimensional perception spaces (e.g. Atari pixels). Uses Experience Replay and Target Networks to break sample correlations.",
        code: `# PyTorch DQN Loss Step\nq_values = q_network(state_batch).gather(1, action_batch)\nwith torch.no_grad():\n    max_next_q = target_network(next_state_batch).max(1)[0]\n    target_q = reward_batch + (1 - done_batch) * gamma * max_next_q\n\nloss = F.mse_loss(q_values.squeeze(), target_q)\noptimizer.zero_grad()\nloss.backward()\noptimizer.step()`,
        tags: ["Reinforcement", "Deep Learning", "Experience Replay", "PyTorch"]
    },
    ppo: {
        title: "Proximal Policy Optimization (PPO)",
        icon: "🎯",
        paradigm: "Reinforcement Learning",
        type: "Policy Gradient",
        formula: "L^{CLIP}(\\theta) = \\hat{\\mathbb{E}}_t \\left[ \\min(r_t(\\theta)\\hat{A}_t, \\text{clip}(r_t(\\theta), 1-\\epsilon, 1+\\epsilon)\\hat{A}_t) \\right]",
        desc: "Industry-standard policy gradient method used in RLHF for fine-tuning LLMs (like ChatGPT). Clips policy probability ratios to ensure smooth, stable updates without destructive policy collapses.",
        code: `# PPO Clipped Surrogate Loss\nratios = torch.exp(new_log_probs - old_log_probs)\nsurrg1 = ratios * advantage_estimates\nsurrg2 = torch.clamp(ratios, 1 - epsilon, 1 + epsilon) * advantage_estimates\npolicy_loss = -torch.min(surrg1, surrg2).mean()`,
        tags: ["Reinforcement", "On-Policy", "Clipped Objective", "RLHF & LLMs"]
    },
    pseudo_labeling: {
        title: "Self-Training & Pseudo-Labeling",
        icon: "🏷️",
        paradigm: "Semi-Supervised Learning",
        type: "Iterative Pseudo-Labeling",
        formula: "\\hat{y}_{unlabeled} = \\text{argmax } P(y|x), \\quad \\text{if } \\max P(y|x) \\ge \\tau",
        desc: "Trains an initial classifier on limited gold-standard labeled data, assigns pseudo-labels to unlabeled samples meeting high confidence threshold tau, and expands training data iteratively.",
        code: `# Pseudo-Labeling Loop\nmodel.fit(X_labeled, y_labeled)\nprobs = model.predict_proba(X_unlabeled)\nmax_probs = np.max(probs, axis=1)\n\n# Filter high confidence samples\nconfident_mask = max_probs >= 0.95\nX_pseudo = X_unlabeled[confident_mask]\ny_pseudo = np.argmax(probs[confident_mask], axis=1)\n\n# Retrain with combined pool\nX_combined = np.vstack([X_labeled, X_pseudo])\ny_combined = np.concatenate([y_labeled, y_pseudo])\nmodel.fit(X_combined, y_combined)`,
        tags: ["Semi-Supervised", "Pseudo-Labeling", "Self-Training", "Data Efficient"]
    },
    contrastive_learning: {
        title: "Contrastive Learning (SimCLR / MoCo)",
        icon: "🧩",
        paradigm: "Self-Supervised Learning",
        type: "Representation Learning",
        formula: "\\ell_{i,j} = -\\log \\frac{\\exp(\\text{sim}(z_i, z_j)/\\tau)}{\\sum_k \\exp(\\text{sim}(z_i, z_k)/\\tau)}",
        desc: "Learns rich image feature representations without manual human labels by pulling augmented views of the same image together in embedding space while pushing distinct images apart.",
        code: `# SimCLR InfoNCE Loss Step\nz_i = F.normalize(encoder(aug_view_1), dim=1)\nz_j = F.normalize(encoder(aug_view_2), dim=1)\nsim_matrix = torch.matmul(z_i, z_j.T) / temperature\n\nloss = info_nce_loss(sim_matrix)`,
        tags: ["Self-Supervised", "Contrastive Loss", "Representation", "Vision"]
    },
    bert_masked_lm: {
        title: "Masked Language Modeling (BERT)",
        icon: "🔤",
        paradigm: "Self-Supervised Learning",
        type: "Masked Pretext Generation",
        formula: "L = - \\sum_{i \\in \\text{Masked}} \\log P(w_i | w_{\\setminus i})",
        desc: "Randomly masks 15% of tokens in text corpora and trains bidirectional Transformer encoders to predict original tokens from bidirectional surrounding context.",
        code: `# HuggingFace Masked LM Pipeline\nfrom transformers import pipeline\nunmasker = pipeline('fill-mask', model='bert-base-uncased')\nresults = unmasker("Machine learning is [MASK] for modern AI.")\nprint(results[0]['token_str'], results[0]['score'])`,
        tags: ["Self-Supervised", "Transformers", "BERT", "NLP"]
    },
    sgd_streaming: {
        title: "Stochastic Gradient Descent (Streaming)",
        icon: "⚡",
        paradigm: "Online Learning",
        type: "Sample-by-Sample Gradient Update",
        formula: "\\theta_{t+1} = \\theta_t - \\eta \\nabla L_i(\\theta_t)",
        desc: "Computes instantaneous gradient updates for individual data points in real time as data arrives over network streams, allowing infinite throughput with minimal memory footprint.",
        code: `# Real-Time Streaming SGD\nfor sample_x, label_y in data_stream.listen():\n    pred = np.dot(sample_x, weights)\n    err = pred - label_y\n    grad = err * sample_x\n    weights -= learning_rate * grad`,
        tags: ["Online", "Streaming Data", "Low Latency", "Incremental"]
    },
    ftrl: {
        title: "FTRL-Proximal Algorithm",
        icon: "🎯",
        paradigm: "Online Learning",
        type: "Sparse Online Optimization",
        formula: "w_{t+1} = \\text{argmin}_w \\left( g_{1:t} \\cdot w + \\frac{1}{2} \\sum_{s=1}^t \\sigma_s ||w - w_s||_2^2 + \\lambda_1 ||w||_1 + \\frac{\\lambda_2}{2} ||w||_2^2 \\right)",
        desc: "Developed by Google for ad click prediction (CTR). Maintains high model accuracy on streaming data while enforcing strict L1 sparsity to zero out uninformative features.",
        code: `# FTRL-Proximal Weight Update Rule\nif abs(z[i]) <= lambda1:\n    w[i] = 0.0\nelse:\n    w[i] = - (z[i] - np.sign(z[i]) * lambda1) / ((beta + np.sqrt(n[i])) / alpha + lambda2)`,
        tags: ["Online", "Google FTRL", "L1 Sparsity", "CTR Advertising"]
    },
    ols_normal_eq: {
        title: "Ordinary Least Squares (OLS)",
        icon: "📦",
        paradigm: "Batch Learning",
        type: "Analytical Normal Equation",
        formula: "\\hat{\\beta} = (X^T X)^{-1} X^T y",
        desc: "Computes exact closed-form global optimal weight coefficients in a single matrix inversion pass across 100% of historical batch rows offline prior to deployment.",
        code: `# Closed-form Batch Solvers\nimport numpy as np\n\nX_b = np.c_[np.ones((len(X), 1)), X]\nbeta_hat = np.linalg.inv(X_b.T.dot(X_b)).dot(X_b.T).dot(y)`,
        tags: ["Batch", "Closed-Form", "Exact Solvers", "Offline Training"]
    }
};

function initAlgoModals() {
    const modalBackdrop = document.getElementById('algoModalBackdrop');
    const modalClose = document.getElementById('algoModalClose');
    const modalIcon = document.getElementById('algoModalIcon');
    const modalTitle = document.getElementById('algoModalTitle');
    const modalSubtitle = document.getElementById('algoModalSubtitle');
    const modalBody = document.getElementById('algoModalBody');

    if (!modalBackdrop) return;

    const modalTriggers = document.querySelectorAll('[data-algo-modal]');
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const algoKey = trigger.getAttribute('data-algo-modal');
            const data = ALGO_MODAL_DATA[algoKey];

            if (!data) return;

            modalIcon.textContent = data.icon;
            modalTitle.textContent = data.title;
            modalSubtitle.textContent = `${data.paradigm} • ${data.type}`;

            modalBody.innerHTML = `
                <p><strong>Overview:</strong> ${data.desc}</p>
                
                <h4>📐 Key Mathematical Formulation</h4>
                <div style="background:rgba(96,165,250,0.1); padding:0.85rem 1.1rem; border-radius:10px; border:1px solid rgba(96,165,250,0.25); color:#60a5fa; font-family:var(--font-mono); font-size:0.95rem;">
                    \\(${data.formula}\\)
                </div>

                <h4>💻 Code Implementation Snippet</h4>
                <pre class="algo-modal-code-box"><code>${data.code}</code></pre>

                <div class="algo-modal-tags">
                    ${data.tags.map(t => `<span class="algo-tag" style="background:rgba(255,255,255,0.06); border:1px solid var(--border);">${t}</span>`).join('')}
                </div>
            `;

            modalBackdrop.classList.add('active');

            // Render MathJax / KaTeX if available
            if (window.MathJax && window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise([modalBody]);
            }
        });
    });

    const closeModal = () => modalBackdrop.classList.remove('active');

    if (modalClose) modalClose.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

