from flask import Flask, request, jsonify
import numpy as np
from sklearn.linear_model import LinearRegression, HuberRegressor
from sklearn.preprocessing import PolynomialFeatures
from sklearn.metrics import mean_squared_error
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def get_circular_month(month_num):
    """Encodes month as coordinates on a circle to capture Jan/Dec proximity."""
    angle = 2 * np.pi * (month_num - 1) / 12
    return [np.sin(angle), np.cos(angle)]

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        if not data or 'historical' not in data:
            return jsonify({"error": "No historical data provided"}), 400
            
        historical = data.get('historical', [])
        
        # Clean and type-cast the data
        for h in historical:
            h['total'] = float(h.get('total', 0))
            h['month'] = int(h.get('month', 1))
            h['year'] = int(h.get('year', 2024))
        
        if len(historical) < 4:
            avg = sum(h['total'] for h in historical) / len(historical) if historical else 0
            return jsonify({
                "prediction": round(float(avg), 2), 
                "confidence": 0.1, 
                "insight": "Collecting enough data for AI analysis...",
                "forecast": [round(avg * 1.01, 2)] * 3,
                "range": {"min": round(avg * 0.9, 2), "max": round(avg * 1.1, 2)},
                "model_used": "Baseline"
            })

        # 1. Feature Engineering
        X_raw = []
        y_raw = []
        
        for i, h in enumerate(historical):
            circ = get_circular_month(h['month'])
            # Momentum: Average of last 3 months
            momentum_range = historical[max(0, i-2):i+1]
            momentum = np.mean([item['total'] for item in momentum_range])
            X_raw.append([i, circ[0], circ[1], momentum])
            y_raw.append(h['total'])

        X = np.array(X_raw)
        y = np.array(y_raw)
        
        # 2. Sequential Validation
        split = max(1, len(X) - 2)
        X_train, X_test = X[:split], X[split:]
        y_train, y_test = y[:split], y[split:]

        models = {
            "huber": HuberRegressor(epsilon=1.35, max_iter=1000),
            "linear": LinearRegression(),
            "poly": LinearRegression()
        }
        
        poly_transformer = PolynomialFeatures(degree=2)
        X_train_poly = poly_transformer.fit_transform(X_train)
        X_test_poly = poly_transformer.transform(X_test)

        best_model_name = "linear" # Safer default
        best_error = float('inf')
        
        for name, m in models.items():
            try:
                if name == "poly":
                    m.fit(X_train_poly, y_train)
                    preds = m.predict(X_test_poly)
                else:
                    m.fit(X_train, y_train)
                    preds = m.predict(X_test)
                
                err = mean_squared_error(y_test, preds)
                if err < best_error:
                    best_error = err
                    best_model_name = name
            except Exception as inner_e:
                print(f"Model {name} training failed: {inner_e}")
                continue

        # 3. Final Fit
        winner = models[best_model_name]
        X_final = X
        if best_model_name == "poly":
            X_final = poly_transformer.fit_transform(X)
        
        winner.fit(X_final, y)

        # 4. Predict Next Month
        last_item = historical[-1]
        next_month_num = (last_item['month'] % 12) + 1
        next_circ = get_circular_month(next_month_num)
        next_momentum = np.mean([h['total'] for h in historical[-3:]])
        next_features = np.array([[len(historical), next_circ[0], next_circ[1], next_momentum]])
        
        if best_model_name == "poly":
            pred = winner.predict(poly_transformer.transform(next_features))[0]
        else:
            pred = winner.predict(next_features)[0]

        pred = max(0, float(pred))

        # 5. Insights & Confidence
        # R^2 score for confidence
        try:
            score = winner.score(X_final, y)
        except:
            score = 0.5
            
        last_val = last_item['total']
        change_pct = ((pred - last_val) / last_val * 100) if last_val > 0 else 0
        
        if change_pct > 25:
            insight = f"Heads up! Your spending is projected to jump by {abs(int(change_pct))}%."
        elif change_pct < -15:
            insight = f"Projecting a {abs(int(change_pct))}% drop! Keep up the good work."
        else:
            insight = "Your spending patterns are consistent and healthy."

        return jsonify({
            "prediction": round(pred, 2),
            "confidence": round(float(max(0, min(1, score))), 2),
            "model_used": best_model_name,
            "insight": insight,
            "range": {
                "min": round(pred * 0.92, 2),
                "max": round(pred * 1.08, 2)
            },
            "forecast": [round(pred * (1 + (i*0.02)), 2) for i in range(1, 4)]
        })

    except Exception as e:
        import traceback
        print(f"ULTRA ML Error: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
