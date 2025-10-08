import os, pickle
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model', 'model.pkl')

if not os.path.exists(MODEL_PATH):
    print('Model file not found at', MODEL_PATH)
    raise SystemExit(1)

with open(MODEL_PATH, 'rb') as f:
    model = pickle.load(f)

print('Loaded model type:', type(model))

# Sample features (assumed encodings):
# gender: 0=Female,1=Male
# hypertension: 0/1
# heart_disease: 0/1
# smoking_history: 0=never,1=No Info,2=current,3=former,4=ever
# bmi: float
# HbA1c_level: float
# blood_glucose_level: float
# age_category: 0=0-30,1=30-50,2=50+

sample = [0, 0, 0, 0, 27.32, 6.6, 140.0, 2]
X = np.array(sample).reshape(1, -1)

try:
    pred = model.predict(X)
    print('Prediction:', pred)
    if hasattr(model, 'predict_proba'):
        print('Probabilities:', model.predict_proba(X).tolist())
except Exception as e:
    print('Prediction failed:', e)
