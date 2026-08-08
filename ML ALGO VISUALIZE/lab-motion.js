/**
 * Lab Motion & Micro-Interactions Engine — Into the Algorithm
 * Adds 3D card tilt with specular highlights, magnetic buttons, click ripple effects,
 * scroll progress indicators, viewport reveals, and interactive simulator pulse effects
 * across all ML algorithm lab pages.
 */
document.addEventListener('DOMContentLoaded', () => {
    initLabBackgroundVideo();
    initScrollProgressBar();
    initViewportReveals();
    init3DCardsWithGloss();
    initMagneticButtonsWithRipple();
    initAnimatedMetricCounters();
    initSimulatorEnhancements();
    initCopyCodeButtons();
});

/* ═════════════════════════════════════════════════════════════
   1. TOP SCROLL PROGRESS BAR & FLOATING BACK TO TOP
   ═════════════════════════════════════════════════════════════ */
function initScrollProgressBar() {
    let progressBar = document.getElementById('lab-scroll-progress');
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.id = 'lab-scroll-progress';
        document.body.appendChild(progressBar);
    }

    let backBtn = document.getElementById('lab-back-to-top');
    if (!backBtn) {
        backBtn = document.createElement('button');
        backBtn.id = 'lab-back-to-top';
        backBtn.type = 'button';
        backBtn.title = 'Back to top';
        backBtn.innerHTML = '↑';
        backBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        document.body.appendChild(backBtn);
    }

    const updateProgress = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;

        if (scrollTop > 280) {
            backBtn.classList.add('visible');
        } else {
            backBtn.classList.remove('visible');
        }
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
}

/* ═════════════════════════════════════════════════════════════
   2. VIEWPORT REVEAL & STAGGER ANIMATIONS
   ═════════════════════════════════════════════════════════════ */
function initViewportReveals() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const targets = document.querySelectorAll(
        '.theory-card, .glass-card, .faq-card, .chart-card, .metric-card, .code-block, .section-header, .comp-table, .prediction-tool, .algo-card'
    );

    targets.forEach(el => {
        if (!el.classList.contains('motion-init')) {
            el.classList.add('motion-init');
        }
    });

    const observerOptions = {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('motion-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    targets.forEach((el, idx) => {
        el.style.transitionDelay = `${(idx % 4) * 0.08}s`;
        observer.observe(el);
    });
}

/* ═════════════════════════════════════════════════════════════
   3. 3D CARD TILT WITH SPECULAR GLOSS OVERLAY
   ═════════════════════════════════════════════════════════════ */
function init3DCardsWithGloss() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cards = document.querySelectorAll(
        '.theory-card, .glass-card, .faq-card, .chart-card, .metric-card, .algo-card, .viz-card, .control-panel, .prediction-tool'
    );

    cards.forEach(card => {
        let gloss = card.querySelector('.card-gloss-overlay');
        if (!gloss) {
            gloss = document.createElement('div');
            gloss.className = 'card-gloss-overlay';
            card.appendChild(gloss);
        }

        const handleMove = (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
            card.style.transition = 'transform 0.12s ease-out';
            gloss.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.14) 0%, transparent 65%)`;
            gloss.style.opacity = '1';
        };

        const handleLeave = () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
            card.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
            gloss.style.opacity = '0';
        };

        card.addEventListener('mousemove', handleMove);
        card.addEventListener('mouseleave', handleLeave);
    });
}

/* ═════════════════════════════════════════════════════════════
   4. MAGNETIC BUTTONS & CLICK RIPPLE EFFECT
   ═════════════════════════════════════════════════════════════ */
function initMagneticButtonsWithRipple() {
    const btns = document.querySelectorAll('.btn, .btn-primary, .btn-outline, .btn-sm, .btn-lg, .nav-links a, button');

    btns.forEach(btn => {
        // Magnetic effect (desktop only)
        if (!window.matchMedia('(pointer: coarse)').matches) {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const deltaX = (e.clientX - centerX) * 0.25;
                const deltaY = (e.clientY - centerY) * 0.25;

                btn.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
                btn.style.transition = 'transform 0.1s ease-out';
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0px, 0px)';
                btn.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            });
        }

        // Ripple Effect on Click
        btn.addEventListener('click', (e) => {
            const rect = btn.getBoundingClientRect();
            const circle = document.createElement('span');
            const diameter = Math.max(rect.width, rect.height);
            const radius = diameter / 2;

            circle.style.width = circle.style.height = `${diameter}px`;
            circle.style.left = `${e.clientX - rect.left - radius}px`;
            circle.style.top = `${e.clientY - rect.top - radius}px`;
            circle.classList.add('btn-click-ripple');

            const existingRipple = btn.querySelector('.btn-click-ripple');
            if (existingRipple) {
                existingRipple.remove();
            }

            btn.appendChild(circle);

            setTimeout(() => {
                circle.remove();
            }, 600);
        });
    });
}

/* ═════════════════════════════════════════════════════════════
   5. ANIMATED METRIC & STAT COUNTERS
   ═════════════════════════════════════════════════════════════ */
function initAnimatedMetricCounters() {
    const metricValues = document.querySelectorAll('.metric-value, .stat-value');

    const observerOptions = { threshold: 0.5 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const text = el.innerText.trim();
                const num = parseFloat(text);

                if (!isNaN(num) && num > 0 && !el.dataset.counted) {
                    el.dataset.counted = 'true';
                    let start = 0;
                    const duration = 1200;
                    const startTime = performance.now();

                    const step = (now) => {
                        const elapsed = now - startTime;
                        const progress = Math.min(1, elapsed / duration);
                        const easeProgress = 1 - Math.pow(1 - progress, 3);
                        const current = start + (num - start) * easeProgress;

                        if (text.includes('.')) {
                            const decimals = text.split('.')[1].length;
                            el.innerText = current.toFixed(decimals);
                        } else {
                            el.innerText = Math.floor(current);
                        }

                        if (progress < 1) {
                            requestAnimationFrame(step);
                        } else {
                            el.innerText = text;
                        }
                    };

                    requestAnimationFrame(step);
                }
                observer.unobserve(el);
            }
        });
    }, observerOptions);

    metricValues.forEach(el => observer.observe(el));
}

/* ═════════════════════════════════════════════════════════════
   6. INTERACTIVE SIMULATOR PULSE & ANIMATION FEEDBACK
   ═════════════════════════════════════════════════════════════ */
function initSimulatorEnhancements() {
    const trainBtns = document.querySelectorAll('#trainBtn, #trainCustomBtn, #fitBtn, #clusterBtn, #runBtn, #stepBtn');

    trainBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.add('sim-btn-pulse');
            setTimeout(() => btn.classList.remove('sim-btn-pulse'), 1000);

            // Add subtle glow pulse to canvas container
            const canvasContainer = btn.closest('section, .container, .playground-section')?.querySelector('canvas, .charts-grid, .viz-container');
            if (canvasContainer) {
                canvasContainer.classList.add('sim-canvas-glow');
                setTimeout(() => canvasContainer.classList.remove('sim-canvas-glow'), 1200);
            }
        });
    });
}

/* ═════════════════════════════════════════════════════════════
   7. INTERACTIVE LINE-BY-LINE CODE INSPECTOR & COPY BUTTONS
   ═════════════════════════════════════════════════════════════ */
function getExplanationForCodeLine(cleanCode) {
    const norm = cleanCode.replace(/\s+/g, ' ').trim();
    if (!norm) return null;

    // 1. IMPORTS & DEPENDENCIES
    if (norm.includes('import numpy as np')) {
        return {
            title: 'Importing NumPy Numerical Engine',
            does: 'Imports the NumPy numerical computing library aliased as np.',
            why: 'Provides high-performance C-optimized contiguous array structures, matrix multiplication, and vector broadcasting.',
            math: 'X \\in \\mathbb{R}^{n \\times p}, \\quad W \\in \\mathbb{R}^p'
        };
    }
    if (norm.includes('from collections import Counter')) {
        return {
            title: 'Importing Counter for Majority Voting',
            does: 'Imports Python Counter data structure to count category occurrences efficiently.',
            why: 'Used in KNN majority voting to tally class labels among K nearest neighbors.',
            math: '\\hat{y} = \\arg\\max_c \\sum_{i \\in N_K(x)} \\mathbb{I}(y_i = c)'
        };
    }

    // 2. MODEL CLASS DEFINITIONS
    if (norm.startsWith('class LinearRegressionScratch')) {
        return {
            title: 'Linear Regression Model Class',
            does: 'Defines the object-oriented scratch implementation of Ordinary Least Squares / Gradient Descent Linear Regression.',
            why: 'Encapsulates model weight vector W, bias scalar b, learning rate alpha, and fit/predict API.',
            math: '\\hat{y} = X W + b'
        };
    }
    if (norm.startsWith('class LogisticRegressionScratch')) {
        return {
            title: 'Logistic Regression Model Class',
            does: 'Defines binary logistic classification model using Sigmoid activation.',
            why: 'Maps real-valued linear hyperplane combinations into bounded class probability estimates in (0, 1).',
            math: 'P(y=1|x) = \\sigma(W^T x + b)'
        };
    }
    if (norm.startsWith('class KMeansScratch')) {
        return {
            title: 'K-Means Clustering Model Class',
            does: 'Defines unsupervised K-Means clustering algorithm using iterative Lloyd optimization.',
            why: 'Partitions unlabeled data points into K cohesive geometric clusters by minimizing WCSS loss.',
            math: 'J_{WCSS} = \\sum_{k=1}^K \\sum_{x \\in C_k} \\|x - \\mu_k\\|^2'
        };
    }
    if (norm.startsWith('class KNNScratch')) {
        return {
            title: 'K-Nearest Neighbors Classifier Class',
            does: 'Defines non-parametric instance-based KNN classifier.',
            why: 'Stores training observations and classifies queries on-demand without explicit parametric training phase.',
            math: '\\hat{y} = \\text{Mode}(y_{i_1}, y_{i_2}, \\dots, y_{i_K})'
        };
    }
    if (norm.startsWith('class LinearSVMScratch')) {
        return {
            title: 'Linear Support Vector Machine (Hinge Loss)',
            does: 'Defines Maximum-Margin Linear SVM trained via Stochastic Gradient Descent on Hinge Loss penalty.',
            why: 'Finds optimal decision boundary hyperplane that maximizes geometric margin separation between classes.',
            math: '\\min_{W, b} \\frac{1}{2}\\|W\\|^2 + C \\sum_{i=1}^n \\max(0, 1 - y_i(W^T x_i + b))'
        };
    }
    if (norm.startsWith('class DecisionTreeScratch') || norm.startsWith('class Node')) {
        return {
            title: 'Decision Tree Node & CART Structure',
            does: 'Defines binary decision tree recursive node structure and greedy CART split algorithm.',
            why: 'Recursively partitions feature space using axis-aligned hyperplanes to maximize Gini Information Gain.',
            math: '\\text{Gain} = \\text{Gini}_{parent} - \\sum \\frac{n_{child}}{n} \\text{Gini}_{child}'
        };
    }

    // 3. DECISION TREE SPECIFICS
    if (norm.includes('np.bincount(y).argmax()')) {
        return {
            title: 'Leaf Node Majority Class Assignment',
            does: 'Counts label frequencies in current subset and selects the majority class label.',
            why: 'Terminates recursive split branch and assigns final class prediction to leaf node.',
            math: '\\hat{y}_{leaf} = \\arg\\max_c \\sum_{i \\in Node} \\mathbb{I}(y_i = c)'
        };
    }
    if (norm.includes('p0**2 + p1**2') || norm.includes('_gini(')) {
        return {
            title: 'Gini Impurity Calculation',
            does: 'Calculates Gini impurity metric 1 - (p0^2 + p1^2) for binary target labels y.',
            why: 'Measures node disorder; 0.0 represents pure single-class node; 0.5 represents maximum uncertainty.',
            math: 'Gini(p) = 1 - \\sum_{k=1}^K p_k^2'
        };
    }
    if (norm.includes('gain = parent_gini -')) {
        return {
            title: 'Information Gain Calculation',
            does: 'Computes net reduction in Gini impurity achieved by candidate feature split.',
            why: 'Greedily selects split threshold yielding highest impurity drop.',
            math: 'IG(X, j, s) = Gini(Y) - \\frac{n_L}{n} Gini(Y_L) - \\frac{n_R}{n} Gini(Y_R)'
        };
    }

    // 4. SVM SPECIFICS
    if (norm.includes('y_cls = np.where')) {
        return {
            title: 'SVM Target Label Alignment (-1, +1)',
            does: 'Converts 0/1 target labels into -1 / +1 format required for SVM hinge loss formulation.',
            why: 'Allows margin constraint checking via single unified inequality y_i * (W^T x_i + b) >= 1.',
            math: 'y_i \\in \\{-1, +1\\}'
        };
    }
    if (norm.includes('condition = y_cls[idx] *')) {
        return {
            title: 'SVM Functional Margin Constraint Check',
            does: 'Evaluates whether sample x_i satisfies strict margin condition y_i * (W^T x_i - b) >= 1.',
            why: 'Determines whether point is correctly classified outside margin (zero loss) or violates margin (hinge penalty applied).',
            math: 'y_i (W^T x_i - b) \\ge 1'
        };
    }
    if (norm.includes('self.w -= self.lr * (2 * (1 / self.C) * self.w -')) {
        return {
            title: 'SVM Subgradient Update (Margin Violation)',
            does: 'Updates weights W considering both L2 margin regularization and hinge misclassification penalty.',
            why: 'Penalizes margin-violating support vector points while maintaining maximum margin orientation.',
            math: 'W \\leftarrow W - \\alpha \\left( \\frac{2}{C} W - y_i x_i \\right)'
        };
    }
    if (norm.includes('self.w -= self.lr * (2 * (1 / self.C) * self.w)')) {
        return {
            title: 'SVM Regularization Update (Correctly Separated)',
            does: 'Applies L2 weight decay contraction to weights when sample correctly satisfies margin.',
            why: 'Maximizes margin width 2/||W|| by shrinking weight magnitude.',
            math: 'W \\leftarrow W - \\alpha \\left( \\frac{2}{C} W \\right)'
        };
    }

    // 5. K-MEANS SPECIFICS
    if (norm.includes('np.random.choice(') && norm.includes('self.K')) {
        return {
            title: 'Random Centroid Seeding',
            does: 'Randomly selects K unique data point indices from X without replacement to serve as initial centroids.',
            why: 'Provides initial cluster center locations for Lloyd iteration.',
            math: '\\mu_k^{(0)} \\sim \\{x_1, x_2, \\dots, x_n\\}'
        };
    }
    if (norm.includes('distances = np.sqrt') && norm.includes('centroids')) {
        return {
            title: 'Vectorized Distance Matrix Computation',
            does: 'Calculates pairwise Euclidean distance between all n samples and K centroid points using array broadcasting.',
            why: 'Computes full (n x K) distance matrix in one parallel NumPy C-call without nested loops.',
            math: 'D_{i, k} = \\|x_i - \\mu_k\\|_2 = \\sqrt{\\sum_{j=1}^p (x_{i,j} - \\mu_{k,j})^2}'
        };
    }
    if (norm.includes('cluster_labels = np.argmin')) {
        return {
            title: 'Cluster Assignment (Expectation Step)',
            does: 'Finds index of closest centroid for each data point using argmin across distance matrix rows.',
            why: 'Assigns each observation to cluster center minimizing its Euclidean distance.',
            math: 'c^{(i)} = \\arg\\min_k \\|x^{(i)} - \\mu_k\\|^2'
        };
    }
    if (norm.includes('new_centroids = np.array') || norm.includes('X[cluster_labels == k].mean')) {
        return {
            title: 'Centroid Position Update (Maximization Step)',
            does: 'Recalculates each centroid position as arithmetic mean of all data points currently assigned to cluster k.',
            why: 'Shifts cluster centers to center of gravity, strictly decreasing WCSS variance.',
            math: '\\mu_k^{(t+1)} = \\frac{1}{|C_k|} \\sum_{i \\in C_k} x^{(i)}'
        };
    }
    if (norm.includes('np.all(self.centroids == new_centroids)')) {
        return {
            title: 'Convergence Criterion Check',
            does: 'Checks if centroid positions remained unchanged between consecutive iterations.',
            why: 'Stops training early when algorithm has converged to local minimum.',
            math: '\\mu_k^{(t+1)} = \\mu_k^{(t)} \\implies \\text{Stop}'
        };
    }

    // 6. KNN SPECIFICS
    if (norm.includes('np.argsort(distances)[:self.k]')) {
        return {
            title: 'K Nearest Neighbor Sorting',
            does: 'Finds indices of K smallest distance values in ascending order.',
            why: 'Identifies top K closest training observations to query point x.',
            math: 'N_K(x) = \\arg\\min_{S \\subset D, |S|=K} \\sum_{i \\in S} \\|x - x_i\\|'
        };
    }
    if (norm.includes('most_common = Counter(')) {
        return {
            title: 'Majority Voting Aggregation',
            does: 'Tallies frequency of class labels among K nearest neighbors and extracts most frequent label.',
            why: 'Implements pluralistic voting rule for non-parametric classification.',
            math: '\\hat{y} = \\arg\\max_c \\sum_{i \\in N_K(x)} \\mathbb{I}(y_i = c)'
        };
    }

    // 7. SIGMOID / LOGISTIC SPECIFICS
    if (norm.includes('def _sigmoid') || norm.includes('return 1 / (1 + np.exp(-z))')) {
        return {
            title: 'Logistic Sigmoid Activation Function',
            does: 'Calculates non-linear mapping 1 / (1 + e^-z) mapping real-valued inputs into probability range (0, 1).',
            why: 'Converts raw linear log-odds predictions into valid posterior probability distribution.',
            math: '\\sigma(z) = \\frac{1}{1 + e^{-z}} \\in (0, 1)'
        };
    }
    if (norm.includes('predict_proba')) {
        return {
            title: 'Posterior Probability Inference',
            does: 'Computes continuous class 1 probability estimates for test samples.',
            why: 'Allows custom classification thresholds and ROC/AUC curve analysis.',
            math: 'P(y=1|X) = \\sigma(X W + b)'
        };
    }

    // 8. LINEAR / GENERAL REGRESSION SPECIFICS
    if (norm.includes('n_samples, n_features = X.shape')) {
        return {
            title: 'Extract Matrix Shape Dimensions',
            does: 'Extracts sample count n (rows) and feature count p (columns) from input matrix X.',
            why: 'Required to dimension parameter vectors and scale gradient updates by 1/n.',
            math: 'X \\in \\mathbb{R}^{n \\times p}'
        };
    }
    if (norm.includes('dw = (1 / n_samples) * np.dot(X.T')) {
        return {
            title: 'Vectorized Weight Gradient Computation',
            does: 'Calculates weight partial derivative vector dw of loss function via matrix product X.T @ error.',
            why: 'Matrix product computes gradient vector for all p features across all n samples in a single BLAS call.',
            math: '\\nabla_W J(W) = \\frac{1}{n} X^T (\\hat{y} - y)'
        };
    }
    if (norm.includes('db = (1 / n_samples) * np.sum')) {
        return {
            title: 'Bias Gradient Computation',
            does: 'Calculates bias partial derivative scalar db by averaging prediction errors across all samples.',
            why: 'Measures net directional prediction bias across training dataset.',
            math: '\\frac{\\partial J}{\\partial b} = \\frac{1}{n} \\sum_{i=1}^n (\\hat{y}_i - y_i)'
        };
    }
    if (norm.includes('self.weights -= self.lr * dw') || norm.includes('self.w -= self.lr * dw')) {
        return {
            title: 'Weight Parameter Update Step',
            does: 'Subtracts learning-rate scaled gradient vector from feature weights.',
            why: 'Moves weights in direction of steepest loss reduction (gradient descent rule).',
            math: 'W \\leftarrow W - \\alpha \\nabla_W J(W)'
        };
    }
    if (norm.includes('self.bias -= self.lr * db') || norm.includes('self.b -= self.lr * db')) {
        return {
            title: 'Bias Intercept Update Step',
            does: 'Subtracts learning-rate scaled bias derivative from bias scalar.',
            why: 'Adjusts vertical offset position of decision boundary.',
            math: 'b \\leftarrow b - \\alpha \\frac{\\partial J}{\\partial b}'
        };
    }

    // 9. GENERAL ENTRYPOINTS
    if (norm.startsWith('def fit(')) {
        return {
            title: 'Model Training Entrypoint (fit)',
            does: 'Executes optimization loop to learn model parameters from training matrix X and target vector y.',
            why: 'Standard Scikit-Learn API pattern for supervised model fitting.',
            math: '\\theta^* = \\arg\\min_\\theta L(X, y; \\theta)'
        };
    }
    if (norm.startsWith('def predict(')) {
        return {
            title: 'Inference Prediction Entrypoint (predict)',
            does: 'Evaluates trained model hypothesis on input data matrix X to generate predictions.',
            why: 'Generates output predictions for model evaluation and production deployment.',
            math: '\\hat{y} = f_{W^*, b^*}(X)'
        };
    }
    if (norm.startsWith('def __init__')) {
        return {
            title: 'Constructor & Hyperparameter Configuration',
            does: 'Configures model hyperparameters and prepares internal parameter attributes.',
            why: 'Defines structural behavior prior to data training.',
            math: '\\text{Hyperparameters: } \\alpha, N_{iters}, K, C'
        };
    }

    return null;
}

function initCopyCodeButtons() {
    const codeContainers = document.querySelectorAll('.code-container');
    codeContainers.forEach(container => {
        const headerBar = container.querySelector('.code-header-bar');
        const codeBlock = container.querySelector('.code-block');
        if (!headerBar || !codeBlock) return;

        // Copy button
        if (!headerBar.querySelector('.copy-code-btn')) {
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-code-btn';
            copyBtn.type = 'button';
            copyBtn.innerHTML = '📋 Copy';

            copyBtn.addEventListener('click', () => {
                const rawText = codeBlock.innerText || codeBlock.textContent;
                navigator.clipboard.writeText(rawText).then(() => {
                    copyBtn.innerHTML = '✓ Copied!';
                    copyBtn.classList.add('copied');
                    setTimeout(() => {
                        copyBtn.innerHTML = '📋 Copy';
                        copyBtn.classList.remove('copied');
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy code:', err);
                });
            });

            headerBar.appendChild(copyBtn);
        }

        // Setup Interactive Line-by-Line Code Inspector
        initInteractiveLineInspector(container, codeBlock);
    });
}

function initInteractiveLineInspector(container, codeBlock) {
    if (container.querySelector('.code-explanation-panel')) return;

    // Split HTML lines or text lines
    const rawHTML = codeBlock.innerHTML;
    const lines = rawHTML.split('\n');

    let processedHTML = '';
    lines.forEach((line, index) => {
        const cleanText = line.replace(/<[^>]*>/g, '').trim();
        processedHTML += `<div class="code-line-row" data-line-idx="${index + 1}" data-clean-code="${encodeURIComponent(cleanText)}">` +
            `<span class="line-num">${index + 1}</span>` +
            `<span class="line-content">${line || '&nbsp;'}</span>` +
            `</div>`;
    });

    codeBlock.innerHTML = processedHTML;

    // Create explanation panel
    const explanationPanel = document.createElement('div');
    explanationPanel.className = 'code-explanation-panel';
    explanationPanel.innerHTML = `
        <div class="panel-header">
            <span class="panel-icon">💡</span>
            <span class="panel-title">Interactive Line-by-Line Code Inspector</span>
            <span class="panel-badge" id="panelLockBadge">Click any line to lock selection</span>
        </div>
        <div class="panel-body">
            <div class="panel-line-badge" id="panelLineNum">Line 1</div>
            <h4 class="panel-line-title" id="panelLineTitle">Select any code line above</h4>
            <div class="panel-section">
                <strong>🔍 What This Line Does:</strong>
                <p id="panelDoes">Click or hover any Python statement above to reveal detailed mathematical objective and first-principles execution rationale.</p>
            </div>
            <div class="panel-section">
                <strong>⚡ Why It Is Used:</strong>
                <p id="panelWhy">Learn why vectorized NumPy operations replace Python loops for microsecond speed.</p>
            </div>
            <div class="panel-math-box" id="panelMath">
                <strong>📐 Math Formulation:</strong>
                <div id="panelMathContent">Select a line to view KaTeX formula equivalence.</div>
            </div>
        </div>
    `;

    container.appendChild(explanationPanel);

    // Event listeners on code lines with Click-to-Lock Pinning
    const lineRows = codeBlock.querySelectorAll('.code-line-row');
    let pinnedRow = null;

    lineRows.forEach(row => {
        const updatePanel = () => {
            lineRows.forEach(r => r.classList.remove('active', 'pinned-line'));
            
            if (pinnedRow) {
                pinnedRow.classList.add('active', 'pinned-line');
            } else {
                row.classList.add('active');
            }

            const targetRow = pinnedRow || row;
            const lineNum = targetRow.getAttribute('data-line-idx');
            const cleanCode = decodeURIComponent(targetRow.getAttribute('data-clean-code'));

            const panelLineNum = explanationPanel.querySelector('#panelLineNum');
            const panelLineTitle = explanationPanel.querySelector('#panelLineTitle');
            const panelDoes = explanationPanel.querySelector('#panelDoes');
            const panelWhy = explanationPanel.querySelector('#panelWhy');
            const panelMathContent = explanationPanel.querySelector('#panelMathContent');
            const panelLockBadge = explanationPanel.querySelector('#panelLockBadge');

            if (pinnedRow) {
                panelLineNum.innerText = `📌 Line ${lineNum} (Locked)`;
                if (panelLockBadge) panelLockBadge.innerText = '📌 Line Locked — Click another line or click again to unlock';
            } else {
                panelLineNum.innerText = `Line ${lineNum}`;
                if (panelLockBadge) panelLockBadge.innerText = 'Click any line to lock selection';
            }

            // Find matching explanation using precise AST-style rule parser
            const foundMatch = getExplanationForCodeLine(cleanCode);

            let rawMathFormula = '';
            if (foundMatch) {
                panelLineTitle.innerText = foundMatch.title;
                panelDoes.innerText = foundMatch.does;
                panelWhy.innerText = foundMatch.why;
                rawMathFormula = foundMatch.math;
            } else if (cleanCode.startsWith('#')) {
                panelLineTitle.innerText = 'Code Comment';
                panelDoes.innerText = 'Provides inline documentation for algorithmic steps and logic.';
                panelWhy.innerText = 'Enhances code readability, maintainability, and architectural comprehension.';
                rawMathFormula = '\\text{# Inline documentation}';
            } else if (cleanCode) {
                panelLineTitle.innerText = `Instruction: ${cleanCode.substring(0, 38)}`;
                panelDoes.innerText = `Executes Python statement: ${cleanCode}`;
                panelWhy.innerText = 'Performs necessary data manipulation or computational state update.';
                rawMathFormula = `\\text{${cleanCode.replace(/[^a-zA-Z0-9_ =.+*-]/g, '')}}`;
            }

            // Render KaTeX or Clean Notation into panelMathContent
            renderKaTeXFormula(panelMathContent, rawMathFormula);
        };

        // Click handler: Lock line selection on click (or toggle off if clicking the pinned line)
        row.addEventListener('click', (e) => {
            e.stopPropagation();
            if (pinnedRow === row) {
                pinnedRow = null; // Unlock on toggle
            } else {
                pinnedRow = row; // Lock selection to clicked line
            }
            updatePanel();
        });

        // Mouseenter handler: Only changes preview if NO line is locked/pinned
        row.addEventListener('mouseenter', () => {
            if (!pinnedRow) {
                updatePanel();
            }
        });
    });
}

/* ═════════════════════════════════════════════════════════════
   8. KATEX MATHEMATICAL FORMULA RENDERING ENGINE & FALLBACK
   ═════════════════════════════════════════════════════════════ */
function renderKaTeXFormula(containerEl, latexStr) {
    if (!containerEl || !latexStr) return;
    try {
        if (window.katex && typeof window.katex.renderToString === 'function') {
            containerEl.innerHTML = window.katex.renderToString(latexStr, { displayMode: true, throwOnError: false });
            return;
        }
    } catch (err) {
        console.warn('KaTeX inline render warning:', err);
    }

    // High-quality Unicode mathematical notation fallback (never shows raw unrendered \hat or \alpha)
    const cleanNotation = latexStr
        .replace(/\\hat\{y\}_{test}/g, 'ŷ_test')
        .replace(/\\hat\{y\}_i/g, 'ŷ_i')
        .replace(/\\hat\{y\}/g, 'ŷ')
        .replace(/\\alpha/g, 'α')
        .replace(/\\nabla_W J\(W\)/g, '∇_W J(W)')
        .replace(/\\nabla_W/g, '∇_W')
        .replace(/\\nabla_b/g, '∇_b')
        .replace(/\\partial/g, '∂')
        .replace(/\\sigma/g, 'σ')
        .replace(/\\sum/g, '∑')
        .replace(/\\cdot/g, '·')
        .replace(/\\in/g, '∈')
        .replace(/\\leftarrow/g, '←')
        .replace(/\\mathbb\{R\}/g, 'ℝ')
        .replace(/\\mathbb\{I\}/g, '𝕀')
        .replace(/\\quad/g, '  ')
        .replace(/\\,/g, ' ')
        .replace(/\\{/g, '{')
        .replace(/\\}/g, '}')
        .replace(/\\text\{([^}]*)\}/g, '$1');

    containerEl.innerHTML = `<code style="color:#60a5fa; font-size:0.95rem; font-weight:600;">${cleanNotation}</code>`;
}

/* ═════════════════════════════════════════════════════════════
   AUTOMATIC ALGORITHM PLAYGROUND BACKGROUND VIDEO ENGINE
   ═════════════════════════════════════════════════════════════ */
function initLabBackgroundVideo() {
    if (document.getElementById('algo-page-video-bg')) return;

    const pathname = window.location.pathname.toLowerCase();
    let themeClass = 'theme-cyan'; // default electric cyan
    
    if (pathname.includes('logistic') || pathname.includes('dqn') || pathname.includes('bert')) {
        themeClass = 'theme-purple'; // Purple / Violet for Sigmoid, Neural Nets & Transformers
    } else if (pathname.includes('kmeans') || pathname.includes('knn') || pathname.includes('pca') || pathname.includes('hierarchical')) {
        themeClass = 'theme-teal'; // Emerald / Teal for Clustering & Metric algorithms
    } else if (pathname.includes('decision-tree') || pathname.includes('random-forest')) {
        themeClass = 'theme-emerald'; // Forest Green for Decision Trees & Ensembles
    } else if (pathname.includes('dbscan') || pathname.includes('ppo') || pathname.includes('q-learning') || pathname.includes('clip-dino')) {
        themeClass = 'theme-amber'; // Amber / Gold for Reinforcement Learning & Spatial Density
    } else if (pathname.includes('svm') || pathname.includes('sgan') || pathname.includes('semi-supervised')) {
        themeClass = 'theme-indigo'; // Indigo / Cyber Blue for Support Vectors & GANs
    }

    const bgContainer = document.createElement('div');
    bgContainer.id = 'algo-page-video-bg';
    bgContainer.className = `algo-page-video-bg ${themeClass}`;
    bgContainer.innerHTML = `
        <video autoplay loop muted playsinline preload="auto" class="algo-video-media">
            <source src="ml-lab-bg-video.mp4" type="video/mp4">
            <source src="/learn/ml-lab-bg-video.mp4" type="video/mp4">
            <source src="/ml-lab-bg-video.mp4" type="video/mp4">
            <source src="playground-bg-video.mp4" type="video/mp4">
        </video>
        <div class="algo-video-glow"></div>
        <div class="algo-video-grid"></div>
        <div class="algo-video-shield"></div>
    `;

    const ambientBg = document.querySelector('.ambient-bg');
    if (ambientBg) {
        ambientBg.appendChild(bgContainer);
    } else {
        document.body.insertBefore(bgContainer, document.body.firstChild);
    }

    // Modern browser muted autoplay guarantee
    const videoElem = bgContainer.querySelector('video');
    if (videoElem) {
        videoElem.muted = true;
        videoElem.defaultMuted = true;
        const playPromise = videoElem.play();
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                console.warn('Background video autoplay initial lock:', err);
                const unlockAutoplay = () => {
                    videoElem.muted = true;
                    videoElem.play().catch(() => {});
                    document.removeEventListener('pointerdown', unlockAutoplay);
                    document.removeEventListener('scroll', unlockAutoplay);
                };
                document.addEventListener('pointerdown', unlockAutoplay, { once: true });
                document.addEventListener('scroll', unlockAutoplay, { once: true });
            });
        }
    }
}
