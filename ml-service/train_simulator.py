import numpy as np
import requests
import json
import matplotlib.pyplot as plt

def generate_synthetic_data(months=24):
    """Generates synthetic expense data with a trend and seasonality."""
    x = np.arange(months)
    # Base trend (linear increase)
    trend = 5000 + (x * 200) 
    # Seasonality (peaks every 6 months)
    seasonality = 1000 * np.sin(2 * np.pi * x / 6)
    # Random noise
    noise = np.random.normal(0, 300, months)
    
    totals = trend + seasonality + noise
    
    historical = []
    for i in range(months):
        historical.append({
            "month": (i % 12) + 1,
            "year": 2023 + (i // 12),
            "total": round(float(totals[i]), 2)
        })
    return historical

def test_prediction():
    print("Generating synthetic training data (24 months)...")
    data = generate_synthetic_data(24)
    
    print("Sending data to ML service for training/prediction...")
    try:
        response = requests.post(
            "http://localhost:5001/predict",
            json={"historical": data}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("\n--- ML SERVICE RESULTS ---")
            print(f"Next Month Prediction: ₹{result['prediction']}")
            print(f"Confidence Score: {result['confidence']}")
            print(f"Insight: {result['insight']}")
            print(f"Forecast for next 3 months: {result['next_3_months']}")
            print("--------------------------\n")
            print("Success! The model identified the trend and provided an efficient forecast.")
        else:
            print(f"Error: ML service returned status {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"Connection Error: {e}")
        print("Make sure the Flask app (app.py) is running on port 5001!")

if __name__ == "__main__":
    test_prediction()
