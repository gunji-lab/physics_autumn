(() => {
  "use strict";
  const API_URL = "https://script.google.com/a/macros/toyo.jp/s/AKfycbyZIWvMD6p_n8TvdQye_W3E65Fxx6enAqot8abrRy7Mm5p6uDvgo_9ZxqjqPhye-Z3N/exec";
  const TOKEN_KEY = "physicsTrainerAutumnAuth";
  const page = document.body.dataset.fieldPage;
  const level = window.FIELD_LEVELS[page] || null;
  const $ = id => document.getElementById(id);
  let sessionToken = "";
  let priorAttempts = 0;
  let index = 0, score = 0, started = 0, questionStarted = 0, results = [];

  function token() {
    if (sessionToken) return sessionToken;
    try { return localStorage.getItem(TOKEN_KEY) || ""; } catch (_) { return ""; }
  }
  function captureToken() {
    const value = new URLSearchParams(location.hash.slice(1)).get("auth");
    if (!value) return;
    sessionToken = value;
    try { localStorage.setItem(TOKEN_KEY, value); } catch (_) {}
    try { history.replaceState(null, "", location.pathname + location.search); } catch (_) {}
  }
  function progress(callback) {
    const name = "__fieldProgress" + Date.now() + Math.random().toString(36).slice(2);
    const script = document.createElement("script");
    const timer = setTimeout(() => {delete window[name];script.remove();callback(null);},12000);
    window[name] = response => {clearTimeout(timer);delete window[name];script.remove();callback(response);};
    script.onerror = () => {clearTimeout(timer);delete window[name];script.remove();callback(null);};
    script.src = API_URL + "?api=progress&token=" + encodeURIComponent(token()) + "&callback=" + name;
    document.head.appendChild(script);
  }
  function authLink(id) {
    const link = $(id);
    if (!link) return;
    const destination = new URL(link.getAttribute("href"), location.href);
    destination.hash = "auth=" + encodeURIComponent(token());
    link.href = destination.href;
  }
  function initialize() {
    captureToken();
    if (!token()) {$("identity").textContent="大学アカウントでログインしてください。";$("loginArea").hidden=false;return;}
    $("identity").textContent="大学アカウントを確認中…";
    progress(response => {
      if (!response?.ok) {
        sessionToken="";try {localStorage.removeItem(TOKEN_KEY);} catch (_) {}
        $("identity").textContent="認証を確認できませんでした。大学アカウントでログインし直してください。";$("loginArea").hidden=false;return;
      }
      $("identity").textContent=`ログイン中：${response.studentId}`;
      $("fieldContent").hidden=false;
      ["lectureLink","level1Link","level2Link","backLink"].forEach(authLink);
      if (page === "hub") showHubProgress(response);
      else if (level) priorAttempts = Number((response.stages || []).find(item => item.stage === level.stage)?.attempts || 0);
    });
  }
  function showHubProgress(response) {
    ["level1","level2"].forEach((key, n) => {
      const item = (response.stages || []).find(row => row.stage === window.FIELD_LEVELS[key].stage);
      $("progress" + (n + 1)).textContent = item ? `挑戦 ${item.attempts}回 · ${item.status}` : "まだ挑戦していません。";
    });
  }
  function show(id) { ["intro","quiz","result"].forEach(key => $(key).hidden = key !== id); }
  function start() { index=0;score=0;started=Date.now();results=[];show("quiz");renderQuestion(); }
  function renderQuestion() {
    const q = level.questions[index];questionStarted=Date.now();
    $("count").textContent=`${index + 1} / ${level.questions.length} 問`;$("prompt").textContent=q.prompt;
    $("feedback").textContent="";$("next").hidden=true;$("choices").replaceChildren();
    if (q.kind === "number") {
      const label=document.createElement("label");label.textContent=`数値で答える（単位：${q.unit}）`;
      const input=document.createElement("input");input.type="text";input.inputMode="decimal";input.placeholder="例：60000 または 6e4";input.setAttribute("aria-label",`${q.unit}での答え`);
      input.style.cssText="font:inherit;width:100%;padding:12px;border:1px solid #b8cbd6;border-radius:10px";
      const button=document.createElement("button");button.textContent="回答する";
      button.addEventListener("click",()=>answerNumber(input,button));
      input.addEventListener("keydown",event=>{if(event.key==="Enter")answerNumber(input,button);});
      label.appendChild(input);$("choices").append(label,button);input.focus();return;
    }
    q.choices.forEach((choice,selected) => {
      const button=document.createElement("button");button.textContent=choice;
      button.addEventListener("click",()=>answer(selected));$("choices").appendChild(button);
    });
  }
  function answer(selected) {
    const q=level.questions[index],correct=selected===q.answer;score+=Number(correct);
    results.push({id:q.id,type:"選択式",correct,selected:q.choices[selected],answer:q.choices[q.answer],prompt:q.prompt,elapsedSeconds:Math.round((Date.now()-questionStarted)/1000)});
    [...$("choices").children].forEach((button,n)=>{button.disabled=true;if(n===q.answer)button.classList.add("correct");else if(n===selected)button.classList.add("wrong");});
    $("feedback").textContent=`${correct?"正解です。":"もう一度確認しましょう。"} ${q.explanation}`;
    $("next").textContent=index+1===level.questions.length?"結果を見る":"次へ";$("next").hidden=false;
  }
  function answerNumber(input,button) {
    if (button.disabled) return;
    const raw=input.value.trim();
    const normalized=raw.normalize("NFKC").replace(/[,，\s]/g,"").replace(/[×xX*]10\^?([+-]?\d+)/,"e$1");
    const value=Number(normalized);
    if (!raw || !Number.isFinite(value)) {$("feedback").textContent="数値を入力してください。指数表記は 6e4 のように入力できます。";input.focus();return;}
    const q=level.questions[index];
    const correct=Math.abs(value-q.answer)<=Math.max(Math.abs(q.answer)*0.01,1e-12);
    score+=Number(correct);
    results.push({id:q.id,type:"数値入力",correct,selected:raw,answer:`${q.answer} ${q.unit}`,prompt:q.prompt,elapsedSeconds:Math.round((Date.now()-questionStarted)/1000)});
    input.disabled=true;button.disabled=true;
    $("feedback").textContent=`${correct?"正解です。":"もう一度確認しましょう。"} ${q.explanation}`;
    $("next").textContent=index+1===level.questions.length?"結果を見る":"次へ";$("next").hidden=false;
  }
  function confirmSave(attempt=0) {
    progress(response => {
      const item=response?.ok && (response.stages || []).find(row => row.stage === level.stage);
      if (Number(item?.attempts || 0)>priorAttempts) {priorAttempts=Number(item.attempts);$("sendStatus").textContent="学習履歴を保存しました。";return;}
      if (attempt<5) setTimeout(()=>confirmSave(attempt+1),1500);
      else $("sendStatus").textContent="保存を確認できませんでした。教員にご連絡ください。";
    });
  }
  function finish() {
    show("result");$("score").textContent=`${level.questions.length}問中 ${score}問正解。${score/level.questions.length>=.7?"クリア！":"また挑戦しましょう。"}`;
    $("sendStatus").textContent="結果を送信中…";
    const payload={authToken:token(),stage:level.stage,score,total:level.questions.length,elapsed:Math.round((Date.now()-started)/1000),questionTimes:results.map(x=>x.elapsedSeconds),questionResults:results,userAgent:navigator.userAgent,screen:`${innerWidth}x${innerHeight}`};
    fetch(API_URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)})
      .then(()=>{$("sendStatus").textContent="保存を確認中…";confirmSave();})
      .catch(()=>{$("sendStatus").textContent="送信できませんでした。通信を確認してください。";});
  }
  if (level) {
    $("start").addEventListener("click",start);$("retry").addEventListener("click",start);
    $("next").addEventListener("click",()=>{index++;index<level.questions.length?renderQuestion():finish();});
  }
  initialize();
})();
