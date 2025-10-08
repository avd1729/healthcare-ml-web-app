document.getElementById('predict-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    gender: parseInt(form.gender.value, 10),
    hypertension: parseInt(form.hypertension.value, 10),
    heart_disease: parseInt(form.heart_disease.value, 10),
    smoking_history: parseInt(form.smoking_history.value, 10),
    bmi: parseFloat(form.bmi.value),
    HbA1c_level: parseFloat(form.HbA1c_level.value),
    blood_glucose_level: parseFloat(form.blood_glucose_level.value),
    age_category: parseInt(form.age_category.value, 10),
  };

  const resultDiv = document.getElementById('result');
  resultDiv.textContent = 'Predicting...';

  try {
    const res = await fetch('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      resultDiv.textContent = 'Error: ' + (err.detail || 'Request failed');
      return;
    }
    const json = await res.json();
    const pred = json.prediction === 1 ? 'Positive (has diabetes)' : 'Negative (no diabetes)';
    let probText = '';
    if (json.probability) {
      probText = ` — probabilities: [${json.probability.map(p => p.toFixed(3)).join(', ')}]`;
    }
    resultDiv.textContent = `Prediction: ${pred}${probText}`;
  } catch (err) {
    resultDiv.textContent = 'Request failed: ' + err;
  }
});
