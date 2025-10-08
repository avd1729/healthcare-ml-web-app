from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import pickle
import numpy as np
import os
from contextlib import asynccontextmanager

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "model", "model.pkl")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # load model once at startup
    try:
        app.state.model = load_model()
        app.state.model_error = None
    except Exception as e:
        app.state.model = None
        app.state.model_error = str(e)
    try:
        yield
    finally:
        # optional cleanup
        if hasattr(app.state, 'model'):
            try:
                del app.state.model
            except Exception:
                pass


app = FastAPI(lifespan=lifespan)

templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")


class PredictionRequest(BaseModel):
    gender: int
    hypertension: int
    heart_disease: int
    smoking_history: int
    bmi: float
    HbA1c_level: float
    blood_glucose_level: float
    age_category: int


def load_model(path=MODEL_PATH):
    if not os.path.exists(path):
        raise FileNotFoundError(f"Model file not found at {path}")
    with open(path, "rb") as f:
        model = pickle.load(f)
    return model


# model is loaded via the lifespan handler defined above


@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/predict")
def predict(req: PredictionRequest):
    if getattr(app.state, "model", None) is None:
        raise HTTPException(status_code=500, detail=f"Model not loaded: {getattr(app.state, 'model_error', 'unknown')}")

    # Arrange features in the same order used during training in the notebook
    features = [
        req.gender,
        req.hypertension,
        req.heart_disease,
        req.smoking_history,
        req.bmi,
        req.HbA1c_level,
        req.blood_glucose_level,
        req.age_category,
    ]

    X = np.array(features).reshape(1, -1)
    try:
        pred = app.state.model.predict(X)
        prob = None
        if hasattr(app.state.model, "predict_proba"):
            prob = app.state.model.predict_proba(X).tolist()[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")

    return {"prediction": int(pred[0]), "probability": prob}
