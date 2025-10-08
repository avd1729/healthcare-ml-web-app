(() => {
  const form = document.getElementById('predict-form');
  const submitBtn = document.getElementById('submit-btn');
  const resetBtn = document.getElementById('reset-btn');
  const resultDiv = document.getElementById('result');

  function setLoading(isLoading){
    submitBtn.disabled = isLoading;
    resetBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? 'Predicting…' : 'Predict';
    if(isLoading){ submitBtn.classList.add('loading') } else { submitBtn.classList.remove('loading') }
  }

  function renderResult(json){
    resultDiv.innerHTML = '';
    if(!json) return;
    const pred = json.prediction === 1 ? 'Positive (has diabetes)' : 'Negative (no diabetes)';
    const p = document.createElement('div');
    p.className = json.prediction === 1 ? 'bad' : 'ok';
    p.textContent = `Prediction: ${pred}`;
    resultDiv.appendChild(p);

    if(json.probability){
      const barWrap = document.createElement('div');
      barWrap.style.display = 'flex';
      barWrap.style.gap = '8px';
      barWrap.style.marginTop = '8px';
      json.probability.forEach((v,i)=>{
        const item = document.createElement('div');
        item.style.flex = '1';
        item.style.background = '#eef6ff';
        item.style.borderRadius = '6px';
        item.style.padding = '6px';
        item.innerHTML = `<strong>${(v*100).toFixed(1)}%</strong><div style='height:6px;background:#fff;margin-top:6px;border-radius:3px;overflow:hidden'><div style='height:6px;background:linear-gradient(90deg,#60a5fa,#2563eb);width:${(v*100).toFixed(1)}%'></div></div><div style='font-size:0.85rem;color:#475569;margin-top:6px'>class ${i}</div>`;
        barWrap.appendChild(item);
      })
      resultDiv.appendChild(barWrap);
    }

    // show raw json copy button
    const pre = document.createElement('pre');
    pre.style.marginTop = '10px';
    pre.style.background = '#f8fafc';
    pre.style.padding = '8px';
    pre.style.borderRadius = '6px';
    pre.textContent = JSON.stringify(json, null, 2);
    resultDiv.appendChild(pre);

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn secondary';
    copyBtn.textContent = 'Copy JSON';
    copyBtn.style.marginTop = '8px';
    copyBtn.addEventListener('click', ()=>{ navigator.clipboard.writeText(pre.textContent); copyBtn.textContent='Copied'; setTimeout(()=>copyBtn.textContent='Copy JSON',1500)});
    resultDiv.appendChild(copyBtn);
  }

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    if(!form.checkValidity()){
      form.reportValidity();
      return;
    }

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

    setLoading(true);
    renderResult({});
    try{
      const res = await fetch('/predict', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
      if(!res.ok){
        const err = await res.json().catch(()=>({detail:'Unknown error'}));
        renderResult({ error: err.detail || 'Request failed' });
      } else {
        const json = await res.json();
        renderResult(json);
      }
    }catch(err){
      renderResult({ error: String(err) });
    }finally{
      setLoading(false);
    }
  });

  form.addEventListener('reset', ()=>{ setTimeout(()=>{ renderResult(null); }, 10); });
})();
