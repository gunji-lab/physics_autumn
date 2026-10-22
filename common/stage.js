(() => {
  "use strict";
  const cfg = window.STAGE_CONFIG;
  const auth = window.AutumnAuth;
  if (!cfg || !auth) return;
  const $ = id => document.getElementById(id);
  let quiz=[],wrong=[],index=0,score=0,selected=-1,answered=false,results=[],priorAttempts=0;
  let pendingPayload=null,saving=false;
  let sessionStart=0,questionStart=0,hiddenStart=0,hiddenMs=0,questionHiddenMs=0,questionHiddenStart=0;
  const shuffle = values => {const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const questionWithChoices = question => {
    if (question.kind === "number") return {...question};
    const answerText=question.choices[question.answer];
    const choices=cfg.shuffleChoices===false?[...question.choices]:shuffle(question.choices);
    return {...question,choices,answer:choices.indexOf(answerText)};
  };
  document.addEventListener("visibilitychange",()=>{
    const now=Date.now();
    if(document.hidden){if(sessionStart&&!hiddenStart)hiddenStart=now;if(questionStart&&!questionHiddenStart)questionHiddenStart=now;}
    else{if(hiddenStart){hiddenMs+=now-hiddenStart;hiddenStart=0;}if(questionHiddenStart){questionHiddenMs+=now-questionHiddenStart;questionHiddenStart=0;}}
  });
  function visibleSeconds(start,paused,ongoing){return Math.max(0,Math.round((Date.now()-start-paused-(ongoing?Date.now()-ongoing:0))/1000));}
  function setScreen(name){["startScreen","quizScreen","finishScreen"].forEach(id=>$(id).hidden=id!==name);}
  function start(source=null){
    const sourceQuestions=source || cfg.questions;
    quiz=(cfg.shuffleQuestions===false?[...sourceQuestions]:shuffle(sourceQuestions)).map(questionWithChoices);wrong=[];index=0;score=0;results=[];
    sessionStart=Date.now();hiddenMs=0;hiddenStart=document.hidden?sessionStart:0;
    setScreen("quizScreen");showQuestion();
  }
  function updateAnswerReady(){
    const q=quiz[index];
    if(q.kind==="number"){
      $("answerBtn").disabled=!$("answerInput")?.value.trim() || Boolean(q.directionChoices && !$("directionInput")?.value);
      return;
    }
    const reason=q.reasonPrompt?$("reasonInput")?.value.trim():"";
    $("answerBtn").disabled=selected<0 || (q.reasonPrompt && !reason);
  }
  function renderQuestionContext(q){
    const box=$("questionContext");
    if(!box)return;
    box.replaceChildren();
    if(!q.group&&!q.context&&!q.formula&&!q.visual){box.hidden=true;return;}
    box.hidden=false;box.className="question-context";
    if(q.group){const heading=document.createElement("h2");heading.textContent=q.group;box.appendChild(heading);}
    if(q.context){const text=document.createElement("p");text.textContent=q.context;box.appendChild(text);}
    if(q.visual==="potential-gradient"){
      const diagram=document.createElement("div");diagram.className="potential-gradient";diagram.setAttribute("role","img");diagram.setAttribute("aria-label","左から地点A 12ボルト、地点B 8ボルト、地点C 4ボルトと、電位が右向きに低くなる図");
      [["A","12 V"],["B","8 V"],["C","4 V"]].forEach(([place,value])=>{const point=document.createElement("div");point.className="potential-point";point.innerHTML=`<strong>${place}</strong><span>${value}</span>`;diagram.appendChild(point);});
      const caption=document.createElement("div");caption.className="potential-caption";caption.textContent="電位が低くなる方向 →";box.append(diagram,caption);
    }
    if(q.formula){const formula=document.createElement("div");formula.className="context-formula";formula.textContent=q.formula;box.appendChild(formula);}
  }
  function showQuestion(){
    const q=quiz[index];selected=-1;answered=false;questionStart=Date.now();questionHiddenMs=0;questionHiddenStart=document.hidden?questionStart:0;
    $("count").textContent=`${index+1} / ${quiz.length}`;$("currentScore").textContent=`正解 ${score}`;$("barFill").style.width=`${index/quiz.length*100}%`;
    renderQuestionContext(q);
    $("question").innerHTML=`<span class="badge">${escapeHtml(q.badge || cfg.badge || cfg.title)}</span><br>${escapeHtml(q.prompt)}`;
    $("choices").replaceChildren();$("writtenArea").replaceChildren();$("feedback").className="feedback";$("feedback").innerHTML="";
    $("answerBtn").disabled=true;$("nextBtn").disabled=true;
    if(q.kind==="number"){
      const row=document.createElement("div");row.className="answer-row";
      const input=document.createElement("input");input.id="answerInput";input.inputMode="decimal";input.autocomplete="off";input.placeholder="数値を入力（例：6e4）";input.setAttribute("aria-label","数値の答え");
      const unit=document.createElement("span");unit.className="unit";unit.textContent=q.unit || "";
      input.addEventListener("input",updateAnswerReady);
      input.addEventListener("keydown",event=>{if(event.key==="Enter"&&!$("answerBtn").disabled)check();});
      row.append(input,unit);$("writtenArea").appendChild(row);input.focus();
      if(q.directionChoices){
        const label=document.createElement("label");label.className="reason-label";label.htmlFor="directionInput";label.textContent="電場の向き";
        const select=document.createElement("select");select.id="directionInput";select.className="direction-input";
        const placeholder=document.createElement("option");placeholder.value="";placeholder.textContent="向きを選んでください";select.appendChild(placeholder);
        q.directionChoices.forEach(direction=>{const option=document.createElement("option");option.value=direction;option.textContent=direction;select.appendChild(option);});
        select.addEventListener("change",updateAnswerReady);
        $("writtenArea").append(label,select);
      }
    }else{
      q.choices.forEach((choice,n)=>{
        const button=document.createElement("button");button.className="choice";button.textContent=`${["①","②","③","④","⑤"][n] || n+1}　${choice}`;
        button.addEventListener("click",()=>{if(answered)return;selected=n;$("choices").querySelectorAll(".choice").forEach(x=>x.classList.remove("selected"));button.classList.add("selected");updateAnswerReady();});
        $("choices").appendChild(button);
      });
      if(q.reasonPrompt){
        const label=document.createElement("label");label.className="reason-label";label.htmlFor="reasonInput";label.textContent=q.reasonPrompt;
        const textarea=document.createElement("textarea");textarea.id="reasonInput";textarea.className="reason-input";textarea.rows=4;textarea.placeholder="理由を自分の言葉で書いてください";
        textarea.addEventListener("input",updateAnswerReady);
        $("writtenArea").append(label,textarea);
      }
    }
  }
  function numericValue(raw){
    const normalized=String(raw).trim().normalize("NFKC").replace(/[,，\s]/g,"").replace(/[×xX*]10\^?([+-]?\d+)/,"e$1");
    return normalized ? Number(normalized) : NaN;
  }
  function check(){
    if(answered)return;
    const q=quiz[index];let response,correct,answer;
    if(q.kind==="number"){
      response=$("answerInput").value.trim();const value=numericValue(response);
      if(!Number.isFinite(value)){$("feedback").className="feedback ng";$("feedback").textContent="数値を入力してください。指数表記は 6e4 のように入力できます。";return;}
      const direction=q.directionChoices?$("directionInput").value:"";
      if(q.directionChoices && !direction)return;
      correct=Math.abs(value-q.answer)<=Math.max(Math.abs(q.answer)*0.01,1e-12) && (!q.directionChoices || direction===q.directionAnswer);
      answer=`${q.answerLabel || q.answer} ${q.unit || ""}${q.directionChoices?`・${q.directionAnswer}`:""}`;
      if(direction)response+=` ${q.unit || ""}・${direction}`;
      $("answerInput").disabled=true;
      if(q.directionChoices)$("directionInput").disabled=true;
    }else{
      if(selected<0)return;
      response=q.choices[selected];answer=q.choices[q.answer];correct=selected===q.answer;
      $("choices").querySelectorAll(".choice").forEach((button,n)=>{button.disabled=true;if(n===q.answer)button.classList.add("correct");else if(n===selected)button.classList.add("wrong");});
    }
    answered=true;if(correct)score++;else wrong.push(q);
    const elapsedSeconds=visibleSeconds(questionStart,questionHiddenMs,questionHiddenStart);
    const reason=q.reasonPrompt?$("reasonInput").value.trim():"";
    if(reason)$("reasonInput").disabled=true;
    results.push({id:q.id,type:q.kind==="number"?"数値入力":"選択式",correct,selected:reason?`${response}／理由：${reason}`:response,answer,prompt:q.prompt,explanation:q.explanation||"",group:q.group||"",elapsedSeconds});
    $("feedback").className="feedback "+(correct?"ok":"ng");
    $("feedback").innerHTML=`<strong>${correct?"正解！":"不正解"}</strong><br>正解：<strong>${escapeHtml(answer)}</strong>${cfg.showExplanations===false?"":`<div class="formula">${escapeHtml(q.explanation || "")}</div>`}`;
    $("currentScore").textContent=`正解 ${score}`;$("answerBtn").disabled=true;$("nextBtn").disabled=false;
  }
  function confirmSave(attempt=0){
    auth.progress(response=>{
      const item=response?.ok && (response.stages || []).find(row=>row.stage===cfg.stage);
      if(Number(item?.attempts || 0)>priorAttempts){priorAttempts=Number(item.attempts);saving=false;pendingPayload=null;$("sendStatus").textContent="学習履歴を保存しました。";return;}
      if(attempt<5)setTimeout(()=>confirmSave(attempt+1),1500);
      else saveFailed("保存を確認できませんでした。スプレッドシートを確認してから再送してください。");
    });
  }
  function saveFailed(message){
    saving=false;
    $("sendStatus").textContent=message;
    $("retrySaveBtn").hidden=false;
  }
  function sendPending(){
    if(!pendingPayload||saving)return;
    saving=true;$("retrySaveBtn").hidden=true;$("sendStatus").textContent="結果を保存中…";
    if(window.parent!==window){
      const requestId="autumn_save_"+Date.now()+"_"+Math.random().toString(36).slice(2);
      const timer=setTimeout(()=>{window.removeEventListener("message",receive);saveFailed("保存結果の確認がタイムアウトしました。教員に伝えてください。再送は、保存済みか確認してから行ってください。");},60000);
      function receive(event){
        const data=event.data||{};
        if(event.source!==window.parent||data.type!=="physics:saveResult"||data.requestId!==requestId)return;
        clearTimeout(timer);window.removeEventListener("message",receive);
        if(!data.ok){saveFailed("保存できませんでした。理由："+(data.message||"不明なエラー"));return;}
        saving=false;pendingPayload=null;
        const result=data.result||{};
        const debug=auth.token().split(".")[0]==="ADMIN_GUNJI"&&result.spreadsheetId
          ?`（保存先ID: ${result.spreadsheetId} / Log ${result.logRow||"-"}行目）`:"";
        $("sendStatus").textContent="学習履歴を保存しました。"+debug;
      }
      window.addEventListener("message",receive);
      window.parent.postMessage({type:"physics:save",requestId,payload:pendingPayload},"*");
      return;
    }
    fetch(auth.API_URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"application/json"},body:JSON.stringify(pendingPayload)})
      .then(()=>{$("sendStatus").textContent="保存を確認中…";confirmSave();})
      .catch(()=>saveFailed("送信できませんでした。通信を確認して再送してください。"));
  }
  function finish(){
    setScreen("finishScreen");$("barFill").style.width="100%";
    const rate=Math.round(score/quiz.length*100),elapsed=visibleSeconds(sessionStart,hiddenMs,hiddenStart);
    $("finalScore").textContent=`${score} / ${quiz.length} 問正解（${rate}%）`;
    $("finalMessage").innerHTML=`<div class="${rate>=70?"pass":"fail"}">${rate>=70?"クリア！":"解説を確認して、もう一度挑戦しましょう。"}</div><div class="session-note">所要時間：${Math.floor(elapsed/60)}分${elapsed%60}秒</div>`;
    $("reviewBtn").hidden=!wrong.length;
    const review=$("finalReview");
    if(review&&cfg.showReviewOnFinish){
      review.hidden=false;
      review.innerHTML=`<h2>全問の正答と解説</h2>${results.map((item,n)=>`<section class="review-item ${item.correct?"review-ok":"review-ng"}"><h3>${n+1}. ${escapeHtml(item.prompt)}</h3><p><strong>${item.correct?"正解":"不正解"}</strong>　正答：${escapeHtml(item.answer)}</p><p>${escapeHtml(item.explanation)}</p></section>`).join("")}`;
    }else if(review){review.hidden=true;review.replaceChildren();}
    pendingPayload={authToken:auth.token(),stage:cfg.stage,score,total:quiz.length,elapsed,questionTimes:results.map(x=>x.elapsedSeconds),questionResults:results,userAgent:navigator.userAgent,screen:`${innerWidth}x${innerHeight}`};
    sendPending();
  }
  $("startBtn").addEventListener("click",()=>start());
  $("answerBtn").addEventListener("click",check);
  $("nextBtn").addEventListener("click",()=>{index++;index>=quiz.length?finish():showQuestion();});
  $("restartBtn").addEventListener("click",()=>{if(confirm("ここまでの回答を中断して最初に戻りますか？"))setScreen("startScreen");});
  $("againBtn").addEventListener("click",()=>start());
  $("reviewBtn").addEventListener("click",()=>start(wrong));
  $("retrySaveBtn").addEventListener("click",sendPending);
  if(window.parent!==window && auth.token()){
    // The parent GAS has already authenticated the student. Saving is verified there too.
    auth.showAccess({ok:true});
    $("startBtn").disabled=false;
  }else{
    auth.progress(response=>{
      if(!auth.showAccess(response))return;
      priorAttempts=auth.stageMark(cfg.stage,response).attempts;
      $("startBtn").disabled=false;
    });
  }
})();
