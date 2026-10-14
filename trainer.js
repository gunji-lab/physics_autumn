(() => {
  "use strict";
  const AUTH_URL = "https://script.google.com/a/macros/toyo.jp/s/AKfycbyqYGXl59oOVeV5FavjX1wDYGePIa8YKcwM3RJAhr2nsvC0dukvapC5MbjlbLhVqPi8/exec";
  const API_URL = "https://script.google.com/a/macros/toyo.jp/s/AKfycbyZIWvMD6p_n8TvdQye_W3E65Fxx6enAqot8abrRy7Mm5p6uDvgo_9ZxqjqPhye-Z3N/exec";
  const TOKEN_KEY = "physicsTrainerAutumnAuth";
  const unit = window.AUTUMN_UNITS[0];
  const stage = "電磁気/第2項/クーロンの法則";
  const $ = id => document.getElementById(id);
  const state = {index:0,score:0,started:0,questionStarted:0,results:[],priorAttempts:0};
  function show(id) { ["home","quiz","result"].forEach(key => $(key).hidden = key !== id); }
  function token() { return localStorage.getItem(TOKEN_KEY) || ""; }
  function login() {
    if (AUTH_URL.startsWith("__")) {$("identity").textContent="認証用GASのURLがまだ設定されていません。";return;}
    location.href = AUTH_URL + "?view=auth&return=" + encodeURIComponent(location.href.split("#")[0]);
  }
  function progress(callback) {
    const name = "__autumnProgress" + Date.now() + Math.random().toString(36).slice(2);
    const script = document.createElement("script");
    const timer = setTimeout(() => {delete window[name];script.remove();callback(null);},12000);
    window[name] = response => {clearTimeout(timer);delete window[name];script.remove();callback(response);};
    script.onerror = () => {clearTimeout(timer);delete window[name];script.remove();callback(null);};
    script.src = API_URL + "?api=progress&token=" + encodeURIComponent(token()) + "&callback=" + name;
    document.head.appendChild(script);
  }
  function showProgress(response) {
    if (!response?.ok) return;
    const item = (response.stages || []).find(x => x.stage === stage);
    state.priorAttempts = Number(item?.attempts || 0);
    $("progress").textContent = item ? `挑戦 ${item.attempts}回 · ${item.status}` : "まだ挑戦していません。";
  }
  function initialize() {
    const hashToken = new URLSearchParams(location.hash.slice(1)).get("auth");
    if (hashToken) {localStorage.setItem(TOKEN_KEY,hashToken);history.replaceState(null,"",location.pathname+location.search);}
    if (AUTH_URL.startsWith("__") || API_URL.startsWith("__")) {
      $("identity").textContent="公開前です。秋学期専用GASの認証用URLと記録用URLを設定してください。";$("progress").textContent="GAS未設定";$("login").removeAttribute("href");return;
    }
    if (!token()) {$("identity").textContent="大学アカウントでログインしてください。";$("progress").textContent="ログイン後に進捗を表示します。";return;}
    $("identity").textContent="大学アカウントの認証情報を確認中…";
    progress(response => {
      if (!response?.ok) {localStorage.removeItem(TOKEN_KEY);$("identity").textContent="認証を確認できませんでした。ログインボタンからやり直してください。";$("progress").textContent="進捗を読み込めませんでした。";return;}
      $("identity").textContent=`ログイン中：${response.studentId}`;
      showProgress(response);$("start").disabled=false;$("login").hidden=true;
    });
  }
  function start() { if (!token()) {$("identity").textContent="先に大学アカウントでログインしてください。";return;} Object.assign(state,{index:0,score:0,started:Date.now(),results:[]});show("quiz");renderQuestion(); }
  function renderQuestion() {
    const q=unit.questions[state.index];state.questionStarted=Date.now();
    $("count").textContent=`${state.index+1} / ${unit.questions.length} 問`;$("prompt").textContent=q.prompt;
    $("feedback").textContent="";$("next").hidden=true;$("choices").replaceChildren();
    q.choices.forEach((choice,index)=>{const button=document.createElement("button");button.textContent=choice;button.addEventListener("click",()=>answer(index));$("choices").appendChild(button);});
  }
  function answer(selected) {
    const q=unit.questions[state.index],correct=selected===q.answer;state.score+=Number(correct);
    state.results.push({id:q.id,type:"選択式",correct,selected:q.choices[selected],answer:q.choices[q.answer],prompt:q.prompt,elapsedSeconds:Math.round((Date.now()-state.questionStarted)/1000)});
    [...$("choices").children].forEach((button,index)=>{button.disabled=true;if(index===q.answer)button.classList.add("correct");else if(index===selected)button.classList.add("wrong");});
    $("feedback").textContent=`${correct?"正解です。":"もう一度確認しましょう。"} ${q.explanation}`;
    $("next").textContent=state.index+1===unit.questions.length?"結果を見る":"次へ";$("next").hidden=false;
  }
  function confirmSave(attempt=0) {
    progress(response => {
      if (response?.ok) {
        const item=(response.stages||[]).find(x=>x.stage===stage);
        if (Number(item?.attempts||0)>state.priorAttempts) {$("sendStatus").textContent="学習履歴を保存しました。";showProgress(response);return;}
      }
      if (attempt<5) setTimeout(()=>confirmSave(attempt+1),1500);
      else $("sendStatus").textContent="保存を確認できませんでした。教員にご連絡ください。";
    });
  }
  function finish() {
    show("result");$("score").textContent=`${unit.questions.length}問中 ${state.score}問正解。${state.score/unit.questions.length>=.7?"クリア！":"また挑戦しましょう。"}`;
    $("sendStatus").textContent="結果を送信中…";
    const payload={authToken:token(),stage,score:state.score,total:unit.questions.length,elapsed:Math.round((Date.now()-state.started)/1000),questionTimes:state.results.map(x=>x.elapsedSeconds),questionResults:state.results,userAgent:navigator.userAgent,screen:`${innerWidth}x${innerHeight}`};
    fetch(API_URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)})
      .then(()=>{$("sendStatus").textContent="保存を確認中…";confirmSave();})
      .catch(()=>{$("sendStatus").textContent="送信できませんでした。通信を確認してください。";});
  }
  $("start").disabled=true;$("start").addEventListener("click",start);$("retry").addEventListener("click",start);
  $("next").addEventListener("click",()=>{state.index++;state.index<unit.questions.length?renderQuestion():finish();});
  initialize();
})();
