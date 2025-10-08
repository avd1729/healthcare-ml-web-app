# AI Agent Rules & Context — diabetes project

Purpose
-------
This document tells an automated coding agent (or a developer using one) how to safely and productively work on this repository. It provides the minimal context the agent needs, prioritized operating rules, data and model expectations, quality gates, and examples of acceptable outputs.

High-level principles (apply in order)
------------------------------------
1. Safety first: never exfiltrate secrets, credentials, or private data. If a change requires secrets or network access, stop and request human input.
2. Be deterministic and explicit: state assumptions you make about encodings, shapes, or missing files before implementing changes.
3. Small, testable changes: prefer small patches that include code + a unit test or a smoke check that validates the change.
4. Preserve repository style and minimal churn: avoid global reformatting or unrelated refactors unless requested.
5. Validate locally: run quick runtime checks (imports, model loading, small test) after changes. Report results and failures clearly.

Repository context (what the agent must know)
-------------------------------------------
- Project root contains: `app.py`, `requirements.txt`, `pyproject.toml`, `templates/`, `static/`, `model/`.
- The serving app is `app.py` (FastAPI). The frontend is `templates/index.html` + `static/*`.
- The ML artifact is expected at `model/model.pkl`. The code calls `pickle.load()` and then `.predict()` and optionally `.predict_proba()`.

API contract (must not change unless asked)
-----------------------------------------
- GET / -> returns HTML UI (template `templates/index.html`).
- POST /predict -> expects JSON with these fields and types:
  - gender: int
  - hypertension: int
  - heart_disease: int
  - smoking_history: int
  - bmi: float
  - HbA1c_level: float
  - blood_glucose_level: float
  - age_category: int
- Response: {"prediction": int, "probability": [float,...] | null}

Feature mapping and encodings (explicit assumptions)
---------------------------------------------------
If encoders are not present in the repository or model pipeline, assume the following mapping and always state this assumption in your change log and PR description:
- gender: 0=Female, 1=Male, 2=Other/Prefer not to say
- hypertension: 0 or 1
- heart_disease: 0 or 1
- smoking_history: 0=Never, 1=No Info, 2=Current, 3=Former, 4=Ever
- bmi: float (unit: kg/m^2)
- HbA1c_level: float (percent)
- blood_glucose_level: float (mg/dL)
- age_category: 0=0–30, 1=30–50, 2=50+

Model handling rules
--------------------
- Preferred: the project should save a scikit-learn `Pipeline` that includes all preprocessing (LabelEncoder/OneHotEncoder, scalers) and the estimator. The API should load and call that pipeline directly.
- If a raw estimator is present (no preprocessing), do NOT guess the encoders silently. Instead, either:
  - Add a small, explicit preprocessing wrapper with documented assumptions and a test, or
  - Ask the human to provide the preprocessing pipeline or mapping.
- Never modify or create a model file without explicit request from a human reviewer. You may add scripts to *convert* notebook preprocessing into a pipeline, but do not overwrite `model/model.pkl` by default.

Quality gates (mandatory before creating a PR)
-------------------------------------------
1. Build / imports: run a quick import check (python -c 'import app') and run any small smoke scripts included (e.g., `run_predict.py`).
2. Linters/typechecks: maintain existing style; add linter fixes only when requested.
3. Tests: add at least one unit or integration test for new or modified behavior. Use the project's conventions (add pytest tests if none exist).
4. Documentation: update `README.md` and `AI_AGENT_RULES.md` when public behavior changes.

Security & privacy rules
------------------------
- Do not read or commit any secrets, environment files, or personal data. If you detect secrets in the repo, flag them and stop.
- Avoid making external network calls in automated runs unless explicitly allowed by the user.
- Do not log or echo sensitive model internals (training data samples, PII) in public outputs.

When to ask a clarifying question (required)
-------------------------------------------
Ask when any of the following is true:
- The model file is missing or un-loadable. Provide the exact error and request either the model file or a compatible pipeline.
- Encodings (LabelEncoder mappings) are unknown and required to process categorical fields.
- The requested change will alter the public API (routes, request/response shapes).
- The change involves credentials, deployment, or network access.

Deliverable expectations for common tasks
----------------------------------------
- Add endpoint: code change + doc update (README or API) + one integration test hitting the endpoint.
- Fix UI: update template & static files + manual smoke validation (load page and simulate a request) + update README if UX changes.
- Change model handling: add conversion script that builds a scikit-learn Pipeline from notebook artifacts, add `run_predict.py` example, and include a short instruction in README.

Local run commands (dev)
------------------------
Activate venv then:
```powershell
pip install -r requirements.txt
uvicorn app:app --reload
# open http://127.0.0.1:8000/
```

Commit & PR guidance for agents
--------------------------------
- Use small commits with one logical change per commit.
- Commit message style: <scope>: short description — e.g. `api: add input validation for HbA1c_level`.
- In the PR description, include:
  - What changed and why.
  - Assumptions made (encodings, missing model, etc.).
  - How to test locally (commands and expected results).

Examples of acceptable assistant behavior (short)
------------------------------------------------
- "I updated `app.py` to load the model via a lifespan handler (replacing deprecated startup event). I tested import by running `python -c 'import app'` (no error). I did not modify the model file."
- "I added a `Pipeline` builder script `scripts/build_pipeline.py` that reads the notebook preprocessing code and writes `model/pipeline.pkl`. I included `run_predict.py` and tests. I did not upload any dataset files." 

Files of interest
-----------------
- `app.py` — server entry point
- `templates/index.html` — frontend
- `static/style.css`, `static/script.js` — frontend assets
- `model/model.pkl` — model artifact (must exist for predictions)
- `run_predict.py`, `check_env.py` — helper scripts added to repo

If you are an automated agent: follow these rules strictly. If any rule prevents making a required change, stop and request human guidance with a precise explanation of why the rule blocked the action.
