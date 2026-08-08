import os
import math
import time
import warnings
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder, LabelEncoder
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression, LinearRegression, Ridge, Lasso
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.svm import SVC, SVR
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from xgboost import XGBClassifier, XGBRegressor
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

def clean_dict_for_json(obj):
    """Recursively convert ALL numpy/pandas types to native Python types for JSON."""
    if isinstance(obj, dict):
        return {str(k): clean_dict_for_json(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [clean_dict_for_json(i) for i in obj]
    elif isinstance(obj, np.ndarray):
        return clean_dict_for_json(obj.tolist())
    elif isinstance(obj, pd.Series):
        return clean_dict_for_json(obj.tolist())
    elif isinstance(obj, pd.Timestamp):
        return obj.isoformat()
    elif isinstance(obj, (np.integer,)):
        return int(obj)
    elif isinstance(obj, (np.floating,)):
        val = float(obj)
        if math.isnan(val) or math.isinf(val):
            return None
        return val
    elif isinstance(obj, np.bool_):
        return bool(obj)
    elif isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return obj
    elif isinstance(obj, (np.str_,)):
        return str(obj)
    elif isinstance(obj, bytes):
        return obj.decode('utf-8', errors='replace')
    return obj


def smart_detect_target(df):
    """Intelligently detect the most likely target column from a dataset."""
    cols = df.columns.tolist()
    col_lower = [c.lower().strip() for c in cols]
    
    # Priority 1: Exact common target names
    exact_targets = ['target', 'label', 'class', 'y', 'outcome', 'diagnosis', 
                     'survived', 'species', 'quality', 'price', 'salary',
                     'status', 'result', 'default', 'churn', 'fraud',
                     'approved', 'rating', 'grade', 'category', 'type',
                     'is_fraud', 'is_spam', 'prediction', 'output']
    for i, cl in enumerate(col_lower):
        if cl in exact_targets:
            return cols[i]
    
    # Priority 2: Columns containing target-like keywords
    keywords = ['target', 'label', 'class', 'predict', 'outcome', 'result', 'output', 'dependent']
    for i, cl in enumerate(col_lower):
        for kw in keywords:
            if kw in cl:
                return cols[i]
    
    # Priority 3: Binary columns (likely classification targets)
    for col in reversed(cols):
        if df[col].nunique() == 2:
            return col
    
    # Priority 4: Low-cardinality categorical at the end
    for col in reversed(cols):
        if df[col].dtype == 'object' and df[col].nunique() <= 20:
            return col
    
    # Fallback: last column
    return cols[-1]


def generate_dataset_interpretation(df, target_column, problem_type):
    """Generate a rich, intelligent interpretation of what this dataset is about."""
    rows, columns = df.shape
    numerical_features = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_features = df.select_dtypes(exclude=[np.number]).columns.tolist()
    total_missing = int(df.isnull().sum().sum())
    
    # Build intelligent summary
    col_names_str = ", ".join(df.columns[:8].tolist())
    if len(df.columns) > 8:
        col_names_str += f", ... (+{len(df.columns) - 8} more)"
    
    # Detect dataset domain from column names
    all_cols_lower = " ".join([c.lower() for c in df.columns])
    domain = "general"
    domain_desc = "a general-purpose dataset"
    
    health_kw = ['age', 'blood', 'heart', 'disease', 'diagnosis', 'patient', 'bmi', 'cholesterol', 'glucose', 'medical', 'health', 'cancer', 'tumor']
    finance_kw = ['price', 'salary', 'income', 'revenue', 'profit', 'cost', 'loan', 'credit', 'balance', 'interest', 'stock', 'market', 'fraud', 'transaction']
    housing_kw = ['bedrooms', 'bathrooms', 'sqft', 'area', 'rooms', 'house', 'property', 'rent', 'housing', 'lot']
    hr_kw = ['employee', 'department', 'attrition', 'satisfaction', 'performance', 'leave', 'promotion', 'overtime']
    education_kw = ['grade', 'score', 'student', 'exam', 'marks', 'gpa', 'study', 'school', 'course']
    ecommerce_kw = ['product', 'customer', 'order', 'purchase', 'review', 'rating', 'cart', 'shop']
    iris_kw = ['sepal', 'petal', 'species']
    titanic_kw = ['survived', 'pclass', 'embarked', 'fare', 'cabin', 'sibsp', 'parch']
    
    if any(kw in all_cols_lower for kw in iris_kw):
        domain = "botany"
        domain_desc = "the famous Iris flower species classification dataset"
    elif any(kw in all_cols_lower for kw in titanic_kw):
        domain = "survival"
        domain_desc = "the Titanic passenger survival prediction dataset"
    elif sum(1 for kw in health_kw if kw in all_cols_lower) >= 2:
        domain = "healthcare"
        domain_desc = "a healthcare/medical dataset for clinical analysis"
    elif sum(1 for kw in finance_kw if kw in all_cols_lower) >= 2:
        domain = "finance"
        domain_desc = "a financial dataset for economic prediction"
    elif sum(1 for kw in housing_kw if kw in all_cols_lower) >= 2:
        domain = "real_estate"
        domain_desc = "a real estate/housing market dataset"
    elif sum(1 for kw in hr_kw if kw in all_cols_lower) >= 2:
        domain = "hr"
        domain_desc = "a human resources / employee analytics dataset"
    elif sum(1 for kw in education_kw if kw in all_cols_lower) >= 2:
        domain = "education"
        domain_desc = "an education/student performance dataset"
    elif sum(1 for kw in ecommerce_kw if kw in all_cols_lower) >= 2:
        domain = "ecommerce"
        domain_desc = "an e-commerce/customer analytics dataset"
    
    # Target info
    target_dtype = df[target_column].dtype
    target_nunique = df[target_column].nunique()
    
    interpretation = f"🔍 **Dataset Interpretation**: This appears to be {domain_desc}. "
    interpretation += f"It contains **{rows:,} records** across **{columns} features** "
    interpretation += f"(Columns: {col_names_str}). \n\n"
    
    if problem_type == "classification":
        classes = df[target_column].value_counts()
        class_names = ", ".join([f"`{k}` ({v} samples)" for k, v in classes.head(5).items()])
        interpretation += f"🎯 **Prediction Goal**: Classify `{target_column}` into {target_nunique} classes: {class_names}. "
        
        # Check class balance
        balance_ratio = classes.min() / classes.max()
        if balance_ratio < 0.3:
            interpretation += f"⚠️ **Warning**: Classes are imbalanced (ratio {balance_ratio:.2f}). Models may be biased toward the majority class. "
        else:
            interpretation += f"✅ Classes are reasonably balanced. "
    else:
        target_stats = df[target_column].describe()
        interpretation += f"🎯 **Prediction Goal**: Predict the continuous value `{target_column}` "
        interpretation += f"(Range: {target_stats['min']:.2f} – {target_stats['max']:.2f}, Mean: {target_stats['mean']:.2f}). "
    
    interpretation += f"\n\n📊 **Data Quality**: "
    if total_missing > 0:
        missing_pct = (total_missing / (rows * columns)) * 100
        interpretation += f"{total_missing:,} missing values ({missing_pct:.1f}% of all cells). Auto-imputation will be applied. "
    else:
        interpretation += "No missing values — dataset is clean! "
    
    interpretation += f"Features: {len(numerical_features)} numerical, {len(categorical_features)} categorical."
    
    return interpretation, domain


@app.route('/api/analyze', methods=['POST'])
def analyze_dataset():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    target_column = request.form.get('target_column')
    
    try:
        df = pd.read_csv(file)
    except Exception as e:
        return jsonify({'error': f'Error reading CSV: {str(e)}'}), 400

    if not target_column or target_column in ('null', 'undefined', ''):
        target_column = smart_detect_target(df)

    if target_column and target_column not in df.columns:
        return jsonify({'error': f'Target column "{target_column}" not found in dataset.'}), 400

    try:
        rows, columns = df.shape
        column_names = df.columns.tolist()
        
        numerical_features = df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_features = df.select_dtypes(exclude=[np.number]).columns.tolist()
        
        missing_values = df.isnull().sum().to_dict()
        total_missing = int(df.isnull().sum().sum())
        duplicate_rows = int(df.duplicated().sum())
        
        problem_type = "classification"
        if target_column:
            if df[target_column].dtype == 'object' or df[target_column].dtype == 'bool' or df[target_column].nunique() <= 20:
                problem_type = "classification"
            else:
                problem_type = "regression"
                
        correlations = []
        correlation_labels = []
        if len(numerical_features) > 0:
            corr_df = df[numerical_features].corr()
            correlations = corr_df.fillna(0).values.tolist()
            correlation_labels = corr_df.columns.tolist()
            
        outlier_counts = {}
        for col in numerical_features:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            outliers = df[(df[col] < lower_bound) | (df[col] > upper_bound)]
            outlier_counts[col] = int(len(outliers))
            
        feature_stats = {}
        for col in numerical_features:
            feature_stats[col] = {
                "mean": df[col].mean(),
                "std": df[col].std(),
                "min": df[col].min(),
                "max": df[col].max(),
                "median": df[col].median()
            }
            
        if rows < 1000:
            dataset_size = "small"
        elif rows <= 10000:
            dataset_size = "medium"
        else:
            dataset_size = "large"
            
        class_distribution = None
        if target_column and problem_type == "classification":
            class_distribution = df[target_column].value_counts().to_dict()
        
        # Generate intelligent interpretation
        ai_summary, domain = generate_dataset_interpretation(df, target_column, problem_type)
        
        # Preview first 5 rows
        preview_data = df.head(5).fillna('N/A').to_dict(orient='records')
        
        result = {
            "rows": rows,
            "columns": columns,
            "column_names": column_names,
            "numerical_features": numerical_features,
            "categorical_features": categorical_features,
            "missing_values": missing_values,
            "total_missing": total_missing,
            "duplicate_rows": duplicate_rows,
            "target_column": target_column,
            "problem_type": problem_type,
            "class_distribution": class_distribution,
            "correlations": correlations,
            "correlation_labels": correlation_labels,
            "outlier_counts": outlier_counts,
            "feature_stats": feature_stats,
            "dataset_size": dataset_size,
            "ai_summary": ai_summary,
            "domain": domain,
            "preview": preview_data
        }
        
        return jsonify(clean_dict_for_json(result))
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/train', methods=['POST'])
def train_models():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
        
    file = request.files['file']
    target_column = request.form.get('target_column')
    
    try:
        df = pd.read_csv(file)
    except Exception as e:
        return jsonify({'error': f'Error reading CSV: {str(e)}'}), 400
        
    if not target_column or target_column in ('null', 'undefined', ''):
        target_column = smart_detect_target(df)
        
    if target_column not in df.columns:
        return jsonify({'error': f'Target column "{target_column}" not found in dataset.'}), 400
        
    try:
        df.dropna(subset=[target_column], inplace=True)
        y_original = df[target_column].copy()
        y = df[target_column]
        X = df.drop(columns=[target_column])
        
        problem_type = "classification"
        if y.dtype == 'object' or y.dtype == 'bool' or y.nunique() <= 20:
            problem_type = "classification"
        else:
            problem_type = "regression"
            
        numerical_features = X.select_dtypes(include=[np.number]).columns.tolist()
        categorical_features = X.select_dtypes(exclude=[np.number]).columns.tolist()
        
        numeric_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler())
        ])
        
        categorical_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='most_frequent')),
            ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
        ])
        
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', numeric_transformer, numerical_features),
                ('cat', categorical_transformer, categorical_features)
            ])
            
        X_preprocessed = preprocessor.fit_transform(X)
        
        le = None
        if problem_type == "classification" and y.dtype == 'object':
            le = LabelEncoder()
            y = le.fit_transform(y)
            
        X_train, X_test, y_train, y_test = train_test_split(X_preprocessed, y, test_size=0.2, random_state=42)
        
        if problem_type == "classification":
            models = {
                "Logistic Regression": LogisticRegression(max_iter=1000),
                "Decision Tree": DecisionTreeClassifier(random_state=42),
                "Random Forest": RandomForestClassifier(random_state=42),
                "SVM (SVC)": SVC(probability=True, random_state=42),
                "K-Nearest Neighbors": KNeighborsClassifier(),
                "Naive Bayes": GaussianNB(),
                "XGBoost": XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42, verbosity=0)
            }
        else:
            models = {
                "Linear Regression": LinearRegression(),
                "Ridge Regression": Ridge(),
                "Lasso Regression": Lasso(),
                "Decision Tree": DecisionTreeRegressor(random_state=42),
                "Random Forest": RandomForestRegressor(random_state=42),
                "SVR": SVR(),
                "XGBoost": XGBRegressor(random_state=42, verbosity=0)
            }
            
        results = []
        best_model_name = ""
        best_primary_metric = -float('inf')
        
        for name, model in models.items():
            try:
                start_time = time.time()
                model.fit(X_train, y_train)
                train_time = time.time() - start_time
                
                start_pred = time.time()
                y_pred = model.predict(X_test)
                predict_time = time.time() - start_pred
                
                metrics = {}
                primary_metric_val = 0
                if problem_type == "classification":
                    metrics['accuracy'] = float(accuracy_score(y_test, y_pred))
                    metrics['precision'] = float(precision_score(y_test, y_pred, average='weighted', zero_division=0))
                    metrics['recall'] = float(recall_score(y_test, y_pred, average='weighted', zero_division=0))
                    metrics['f1'] = float(f1_score(y_test, y_pred, average='weighted', zero_division=0))
                    primary_metric_val = metrics['accuracy']
                    
                    try:
                        if len(np.unique(y)) > 2:
                            y_prob = model.predict_proba(X_test)
                            metrics['roc_auc'] = float(roc_auc_score(y_test, y_prob, multi_class='ovr', average='weighted'))
                        else:
                            try:
                                y_prob = model.predict_proba(X_test)[:, 1]
                            except Exception:
                                y_prob = model.predict(X_test)
                            metrics['roc_auc'] = float(roc_auc_score(y_test, y_prob))
                    except Exception:
                        metrics['roc_auc'] = None
                else:
                    metrics['mae'] = float(mean_absolute_error(y_test, y_pred))
                    metrics['rmse'] = float(math.sqrt(mean_squared_error(y_test, y_pred)))
                    metrics['r2'] = float(r2_score(y_test, y_pred))
                    primary_metric_val = metrics['r2']
                    
                results.append({
                    "model_name": name,
                    "metrics": metrics,
                    "train_time": float(train_time),
                    "predict_time": float(predict_time),
                    "is_best": False
                })
                
                if primary_metric_val > best_primary_metric:
                    best_primary_metric = primary_metric_val
                    best_model_name = name
                        
            except Exception as e:
                print(f"Model {name} failed: {e}")
                
        # Feature importance from best model
        feature_importance = []
        best_model_instance = models.get(best_model_name)
        if best_model_instance and hasattr(best_model_instance, 'feature_importances_'):
            try:
                feat_names = preprocessor.get_feature_names_out()
                importances = best_model_instance.feature_importances_
                feature_importance = [{"name": str(fn).replace('num__', '').replace('cat__', ''), "value": float(imp)} for fn, imp in zip(feat_names, importances)]
                feature_importance.sort(key=lambda x: x["value"], reverse=True)
                feature_importance = feature_importance[:10]
            except Exception:
                pass
        elif best_model_instance and hasattr(best_model_instance, 'coef_'):
            try:
                feat_names = preprocessor.get_feature_names_out()
                coefs = np.abs(best_model_instance.coef_).flatten()
                if len(coefs) == len(feat_names):
                    feature_importance = [{"name": str(fn).replace('num__', '').replace('cat__', ''), "value": float(c)} for fn, c in zip(feat_names, coefs)]
                    feature_importance.sort(key=lambda x: x["value"], reverse=True)
                    feature_importance = feature_importance[:10]
            except Exception:
                pass
                
        # Sample predictions from best model
        sample_predictions = []
        if best_model_instance is not None:
            try:
                n_samples = min(10, len(X_test))
                sample_indices = np.random.RandomState(42).choice(len(X_test), n_samples, replace=False)
                sample_X = X_test[sample_indices]
                sample_y_true = np.array(y_test)[sample_indices] if isinstance(y_test, pd.Series) else y_test[sample_indices]
                sample_y_pred = best_model_instance.predict(sample_X)
                
                if le is not None:
                    display_true = le.inverse_transform(sample_y_true.astype(int))
                    display_pred = le.inverse_transform(sample_y_pred.astype(int))
                else:
                    display_true = sample_y_true
                    display_pred = sample_y_pred
                
                for i in range(n_samples):
                    actual = display_true[i]
                    predicted = display_pred[i]
                    if problem_type == "regression":
                        sample_predictions.append({
                            "actual": round(float(actual), 2),
                            "predicted": round(float(predicted), 2),
                            "error": round(abs(float(actual) - float(predicted)), 2)
                        })
                    else:
                        sample_predictions.append({
                            "actual": str(actual),
                            "predicted": str(predicted),
                            "correct": str(actual) == str(predicted)
                        })
            except Exception as e:
                print(f"Prediction sampling error: {e}")
                
        for r in results:
            if r["model_name"] == best_model_name:
                r["is_best"] = True
                
        # Sort by primary metric
        if problem_type == "classification":
            results.sort(key=lambda x: x["metrics"].get("accuracy", 0), reverse=True)
        else:
            results.sort(key=lambda x: x["metrics"].get("r2", -float('inf')), reverse=True)
        
        # Rich recommendation
        if problem_type == "classification":
            best_acc = best_primary_metric * 100
            recommendation = f"🏆 **{best_model_name}** achieved the highest accuracy of **{best_acc:.2f}%** on the test set. "
            if best_acc >= 95:
                recommendation += "This is an excellent result indicating strong predictive power."
            elif best_acc >= 85:
                recommendation += "This is a good result. Consider feature engineering to improve further."
            elif best_acc >= 70:
                recommendation += "This is a moderate result. The dataset may have noise or need more features."
            else:
                recommendation += "This result suggests the data may be noisy or the problem is inherently complex."
        else:
            recommendation = f"🏆 **{best_model_name}** achieved the best R² score of **{best_primary_metric:.4f}**. "
            if best_primary_metric >= 0.9:
                recommendation += "The model explains over 90% of variance — excellent fit!"
            elif best_primary_metric >= 0.7:
                recommendation += "Good model fit. Feature engineering may improve results."
            else:
                recommendation += "Moderate fit. Consider polynomial features or more data."
        
        return jsonify(clean_dict_for_json({
            "target_column_used": target_column,
            "problem_type": problem_type,
            "results": results,
            "best_model": best_model_name,
            "recommendation": recommendation,
            "feature_importance": feature_importance,
            "sample_predictions": sample_predictions
        }))
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
