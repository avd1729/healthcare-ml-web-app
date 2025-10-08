# Diabetes prediction FastAPI app

This project provides a small FastAPI application plus a single-page frontend to serve a saved diabetes risk model (pickle file). It's designed as a local demo for serving a scikit-learn model with a simple, accessible UI.

## Contents
- `app.py` — FastAPI application (routes: `/` and `/predict`).
- `templates/index.html` — accessible frontend UI.
- `static/` — CSS and JS for the UI.
- `model/model.pkl` — (not included) your trained model. Place your model here.
- `requirements.txt` — Python dependencies.

## Quickstart (Windows PowerShell)
1. Create & activate a virtual environment (recommended):

```powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1
```

2. Install dependencies:

```powershell
pip install -r requirements.txt
```

3. Start the server (development):

```powershell
uvicorn app:app --reload
```

4. Open the browser at `http://127.0.0.1:8000/`.

## API
- `GET /` — returns the frontend UI.
- `POST /predict` — accepts JSON with the following shape and returns prediction and optional probabilities:

Request JSON shape (application/json):

```json
{
	"gender": int,
	"hypertension": int,
	"heart_disease": int,
	"smoking_history": int,
	"bmi": float,
	"HbA1c_level": float,
	"blood_glucose_level": float,
	"age_category": int
}
```

Response example:

```json
{
	"prediction": 0,
	"probability": [0.92, 0.08]
}
```

## Feature mapping / UI encodings
- `gender`: 0=Female, 1=Male, 2=Other/Prefer not to say (if your training used LabelEncoder, ensure encodings match)
- `hypertension`: 0 or 1
- `heart_disease`: 0 or 1
- `smoking_history`: 0=Never, 1=No Info, 2=Current, 3=Former, 4=Ever
- `bmi`: numeric (float)
- `HbA1c_level`: numeric (float)
- `blood_glucose_level`: numeric (float)
- `age_category`: 0=0–30, 1=30–50, 2=50+

> Important: The model should either be a scikit-learn `Pipeline` that contains preprocessing (encoders/scalers) or you must ensure the numeric encodings and scaling you send match exactly those used during training. If you saved only the raw estimator (no preprocessing), predictions may be invalid.

## Troubleshooting
- **Model not found**: place your model pickle at `model/model.pkl`. The server will start but `/predict` will return an error if the model is missing.
- **Incompatible model**: if `run_predict.py` or a request returns a shape/format error, the model likely expects a different input order, different column encodings, or a preprocessing pipeline. Create a scikit-learn `Pipeline` that performs the preprocessing and save that pipeline instead.
- **Import errors**: make sure you installed `requirements.txt` inside the venv the shell is using.

## Development notes
- The app uses a FastAPI lifespan handler to load the model at startup.
- The frontend focuses on accessibility and responsive layout. `static/script.js` provides client-side validation, a loading state and a result card with probability bars.

## Next steps (suggestions)
- Save a scikit-learn `Pipeline` including encoders/scalers to `model/model.pkl` so the backend needs no manual mapping.
- Add an authenticated admin route to upload a new model file through the UI.
- Add automated tests for `/predict` using pytest and a small sample model.

If you want help converting the notebook preprocessing to a `Pipeline` and saving a single `model.pkl` that's guaranteed compatible with the API, say the word and I will implement it.

Diabetes prediction FastAPI app

Run locally (Windows PowerShell):

1. Create & activate a virtual environment (optional but recommended):

```powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1
```

2. Install dependencies:

```powershell
pip install -r requirements.txt
```

3. Run the server:

```powershell
uvicorn app:app --reload
```

4. Open http://127.0.0.1:8000/ in a browser and use the form. Ensure `model/model.pkl` exists — the app will fail to predict if it's missing.
