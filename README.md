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
