(() => {
  "use strict";
  const unit = window.AUTUMN_UNITS[0];
  const stage = "電磁気/第2項/クーロンの法則";
  const $ = id => document.getElementById(id);
  const state = { studentId: "", index: 0, score: 0, started: 0, questionStarted: 0, results: [], saved: false };
  function show(id) { ["home", "quiz", "result"].forEach(key => $(key).hidden = key !== id); }
  function requestIdentity() { if (window.parent !== window) window.parent.postMessage({type:"physics:ready"}, "*"); }
  function askProgress() { if (window.parent !== window) window.parent.postMessage({type:"physics:progress"}, "*"); }
  function start() {
    if (!state.studentId) { $("identity").hidden = false; $("identity").textContent = "大学アカウントでログインしたGASページから開いてください。"; return; }
    Object.assign(state, {index:0, score:0, started:Date.now(), results:[], saved:false});
    show("quiz"); renderQuestion();
  }
  function renderQuestion() {
    const q = unit.questions[state.index];
    state.questionStarted = Date.now();
    $("count").textContent = `${state.index + 1} / ${unit.questions.length} 問`; $("prompt").textContent = q.prompt;
    $("feedback").textContent = ""; $("next").hidden = true;
    $("choices").replaceChildren();
    q.choices.forEach((choice, index) => {
      const button = document.createElement("button"); button.textContent = choice;
      button.addEventListener("click", () => answer(index)); $("choices").appendChild(button);
    });
  }
  function answer(selected) {
    const q = unit.questions[state.index]; const correct = selected === q.answer;
    state.score += Number(correct);
    state.results.push({id:q.id,type:"選択式",correct,selected:q.choices[selected],answer:q.choices[q.answer],prompt:q.prompt,elapsedSeconds:Math.round((Date.now()-state.questionStarted)/1000)});
    [...$("choices").children].forEach((button,index) => {button.disabled=true;if(index===q.answer)button.classList.add("correct");else if(index===selected)button.classList.add("wrong");});
    $("feedback").textContent = `${correct ? "正解です。" : "もう一度確認しましょう。"} ${q.explanation}`;
    $("next").textContent = state.index + 1 === unit.questions.length ? "結果を見る" : "次へ"; $("next").hidden = false;
  }
  function finish() {
    show("result");
    $("score").textContent = `${unit.questions.length}問中 ${state.score}問正解。${state.score / unit.questions.length >= .7 ? "クリア！" : "また挑戦しましょう。"}`;
    $("sendStatus").textContent = "結果を保存中…";
    const payload = {stage,score:state.score,total:unit.questions.length,elapsed:Math.round((Date.now()-state.started)/1000),questionTimes:state.results.map(x=>x.elapsedSeconds),questionResults:state.results,userAgent:navigator.userAgent,screen:`${innerWidth}x${innerHeight}`};
    const requestId = `autumn_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    state.requestId = requestId;
    window.parent.postMessage({type:"physics:save",requestId,payload},"*");
  }
  window.addEventListener("message", event => {
    if (event.source !== window.parent || !event.data) return;
    const data = event.data;
    if (data.type === "physics:identity") {state.studentId=String(data.studentId||"");$("identity").hidden=false;$("identity").textContent=state.studentId ? `ログイン中：${state.studentId}` : "大学アカウントを確認できません。";askProgress();}
    if (data.type === "physics:progressResult" && data.response?.ok) {const item=(data.response.stages||[]).find(x=>x.stage===stage);$("progress").textContent=item ? `挑戦 ${item.attempts}回 · ${item.status}` : "まだ挑戦していません。";}
    if (data.type === "physics:saveResult" && data.requestId === state.requestId) {state.saved=!!data.ok;$("sendStatus").textContent=data.ok ? "学習履歴を保存しました。" : `保存できませんでした：${data.message||"通信エラー"}`;if(data.ok)askProgress();}
  });
  $("start").addEventListener("click",start);$("retry").addEventListener("click",start);
  $("next").addEventListener("click",()=>{state.index++;state.index<unit.questions.length ? renderQuestion() : finish();});
  requestIdentity();
})();
