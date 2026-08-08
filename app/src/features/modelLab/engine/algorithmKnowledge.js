/**
 * Algorithm Knowledge Base for Educational Deep Dives (Step 12)
 * Theory, Math, Python Code, Complexity, Interview Q&As, and Architecture Diagrams
 */

export const ALGORITHM_KNOWLEDGE = {
  'Random Forest': {
    name: 'Random Forest Classifier',
    category: 'Ensemble Learning (Bagging)',
    icon: '🌲',
    theory: 'Random Forest is an ensemble learning method that constructs a multitude of decision trees during training and outputs the mode of classes (classification) or mean prediction (regression) of individual trees. It uses Bootstrap Aggregating (Bagging) and random feature selection to reduce variance and prevent overfitting.',
    math: '$$f(x) = \\frac{1}{B} \\sum_{b=1}^{B} T_b(x)$$ where $B$ is the number of trees and $T_b$ is an individual decision tree.',
    pros: [
      'Handles non-linear relationships and high-dimensional data automatically',
      'Robust against overfitting due to ensemble averaging',
      'Provides out-of-bag (OOB) error estimation and feature importance scores',
      'Handles missing data gracefully'
    ],
    cons: [
      'Can be slow to predict on massive datasets with hundreds of trees',
      'Requires more memory than single decision trees',
      'Less interpretable than a single decision tree'
    ],
    timeComplexity: 'Training: O(B · n · log(n) · m) | Prediction: O(B · d)',
    spaceComplexity: 'O(B · depth · nodes)',
    useCases: [
      'Credit scoring and financial fraud detection',
      'Medical disease diagnosis from clinical tabular data',
      'Customer churn prediction in SaaS telecom'
    ],
    whenNotToUse: 'When real-time microsecond inference latency is required, or when linear extrapolation beyond training range is needed.',
    pythonCode: `from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# Initialize Random Forest
rf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)

# Train and Predict
rf.fit(X_train, y_train)
y_pred = rf.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")`,
    interviewQuestions: [
      {
        q: 'Why does Random Forest reduce variance compared to a single Decision Tree?',
        a: 'By averaging predictions across uncorrelated decision trees (trained on bootstrap sub-samples with random feature selection), the variance is reduced by a factor of ~1/B without increasing bias.'
      },
      {
        q: 'What is Out-Of-Bag (OOB) error?',
        a: 'Since each tree is trained on roughly 63.2% of the dataset via bootstrap sampling, the remaining ~36.8% left out (OOB samples) can be used as a built-in validation set.'
      }
    ]
  },
  'XGBoost': {
    name: 'XGBoost (Extreme Gradient Boosting)',
    category: 'Ensemble Learning (Boosting)',
    icon: '⚡',
    theory: 'XGBoost is an optimized distributed gradient boosting library designed for efficiency, flexibility, and performance. It builds decision trees sequentially, where each new tree corrects residual errors made by previous trees using gradient descent on a specified loss function.',
    math: '$$\\mathcal{L}^{(t)} = \\sum_{i=1}^n l(y_i, \\hat{y}_i^{(t-1)} + f_t(x_i)) + \\Omega(f_t)$$',
    pros: [
      'State-of-the-art performance on tabular datasets',
      'Built-in L1 (Lasso) and L2 (Ridge) regularization to prevent overfitting',
      'Native handling of missing values and GPU acceleration',
      'Tree pruning using depth-first approach with negative gain check'
    ],
    cons: [
      'High number of hyperparameters requiring careful tuning',
      'Sensitive to outliers if loss function is squared error',
      'Requires feature numerical encoding'
    ],
    timeComplexity: 'Training: O(K · d · n · log(n)) | Prediction: O(K · d)',
    spaceComplexity: 'O(K · nodes)',
    useCases: [
      'Kaggle competition winning solutions',
      'Algorithmic trading and risk assessment',
      'Search ranking and click-through rate (CTR) prediction'
    ],
    whenNotToUse: 'Unstructured image/audio data (where Deep Learning dominates) or small datasets under 100 rows.',
    pythonCode: `from xgboost import XGBClassifier

xgb = XGBClassifier(n_estimators=100, learning_rate=0.1, max_depth=6, random_state=42)
xgb.fit(X_train, y_train)
y_pred = xgb.predict(X_test)`,
    interviewQuestions: [
      {
        q: 'How does Gradient Boosting differ from Bagging?',
        a: 'Bagging trains trees independently in parallel and averages them. Boosting trains trees sequentially, with each new tree attempting to minimize the residual loss of preceding trees.'
      }
    ]
  },
  'LightGBM': {
    name: 'LightGBM (Light Gradient Boosting Machine)',
    category: 'Ensemble Learning (Boosting)',
    icon: '💡',
    theory: 'LightGBM uses histogram-based algorithms to bucket continuous features into discrete bins and grows trees leaf-wise (best-first) rather than level-wise, significantly speeding up training while reducing memory usage.',
    math: '$$\\text{Gain} = \\frac{1}{2} \\left[ \\frac{(\\sum g_L)^2}{\\sum h_L + \\lambda} + \\frac{(\\sum g_R)^2}{\\sum h_R + \\lambda} - \\frac{(\\sum g)^2}{\\sum h + \\lambda} \\right] - \\gamma$$',
    pros: [
      'Extremely fast training speed and high efficiency',
      'Low memory consumption using histogram binning',
      'Native support for categorical features without manual one-hot encoding'
    ],
    cons: [
      'Prone to overfitting on small datasets (<10,000 samples)',
      'Leaf-wise growth can lead to deeper, asymmetric trees'
    ],
    timeComplexity: 'Training: O(K · num_bins · n) | Prediction: O(K · depth)',
    spaceComplexity: 'O(num_bins · features)',
    useCases: [
      'Large-scale industrial ML pipelines with millions of rows',
      'Real-time recommendation systems'
    ],
    whenNotToUse: 'Small datasets with fewer than 1,000 samples.',
    pythonCode: `import lightgbm as lgb

model = lgb.LGBMClassifier(n_estimators=100, learning_rate=0.05, num_leaves=31)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)`,
    interviewQuestions: [
      {
        q: 'What is Leaf-wise tree growth vs Level-wise growth?',
        a: 'Level-wise grows the entire tree level by level. Leaf-wise chooses the single leaf with max delta loss to split, achieving higher accuracy faster.'
      }
    ]
  },
  'Logistic Regression': {
    name: 'Logistic Regression',
    category: 'Linear Classification Model',
    icon: '📈',
    theory: 'Logistic Regression models the probability of a binary or multi-class outcome using a sigmoid activation function applied to a linear combination of input features.',
    math: '$$\\sigma(z) = \\frac{1}{1 + e^{-z}}, \\quad \\text{where } z = w^T x + b$$',
    pros: [
      'Highly interpretable coefficients (log-odds ratio)',
      'Extremely fast inference and light memory footprint',
      'Outputs well-calibrated probability scores'
    ],
    cons: [
      'Assumes linear decision boundary between classes',
      'Struggles with non-linear relationships without manual feature engineering'
    ],
    timeComplexity: 'Training: O(n · m) | Prediction: O(m)',
    spaceComplexity: 'O(m) weights',
    useCases: [
      'Medical probability estimation (e.g. disease risk)',
      'Baseline benchmarks for binary classification'
    ],
    whenNotToUse: 'Complex multi-modal non-linear datasets.',
    pythonCode: `from sklearn.linear_model import LogisticRegression

clf = LogisticRegression(C=1.0, max_iter=1000)
clf.fit(X_train, y_train)
y_pred = clf.predict(X_test)`,
    interviewQuestions: [
      {
        q: 'Why is it called regression if it is used for classification?',
        a: 'Because it regresses the log-odds ratio $\\ln(\\frac{p}{1-p})$ as a continuous linear function of inputs, then thresholds the probability at 0.5 for classification.'
      }
    ]
  },
  'Support Vector Machine (SVM)': {
    name: 'Support Vector Machine',
    category: 'Kernel-based Margin Classifier',
    icon: '🎯',
    theory: 'SVM finds the optimal hyperplane that maximizes the margin of separation between classes. It uses kernel functions (RBF, Polynomial) to project data into higher-dimensional space for non-linear separation.',
    math: '$$\\min_{w,b} \\frac{1}{2} ||w||^2 + C \\sum_{i=1}^n \\xi_i$$',
    pros: [
      'Effective in high-dimensional spaces',
      'Robust against overfitting in sparse spaces'
    ],
    cons: [
      'Scales poorly to datasets exceeding 50,000 samples O(n^2 to n^3)',
      'Sensitive to feature scaling'
    ],
    timeComplexity: 'Training: O(n^2 · m to n^3 · m) | Prediction: O(support_vectors · m)',
    spaceComplexity: 'O(support_vectors · m)',
    useCases: [
      'Text classification and spam filtering',
      'Bioinformatics gene expression analysis'
    ],
    whenNotToUse: 'Large datasets with hundreds of thousands of samples.',
    pythonCode: `from sklearn.svm import SVC

svm = SVC(kernel='rbf', C=1.0, probability=True)
svm.fit(X_train, y_train)
y_pred = svm.predict(X_test)`,
    interviewQuestions: [
      {
        q: 'What is the Kernel Trick in SVM?',
        a: 'It allows SVM to compute inner products in a high-dimensional feature space without explicitly transforming data points into that space.'
      }
    ]
  }
}
