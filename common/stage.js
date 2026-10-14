(() => {
  "use strict";
  const cfg = window.STAGE_CONFIG;
  const auth = window.AutumnAuth;
  if (!cfg || !auth) return;
  const $ = id => document.getElementById(id);
  let quiz=[],wrong=[],index=0,score=0,selected=-1,answered=false,results=[],priorAttempts=0;
  let sessionStart=0,questionStart=0,hiddenStart=0,hiddenMs=0,questionHiddenMs=0,questionHiddenStart=0;
  const shuffle = values => {const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const questionWithChoices = question => {
    if (question.kind === "number") return {...question};
    const answerText=question.choices[question.answer];
    const choices=shuffle(question.choices);
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
    quiz=shuffle(source || cfg.questions).map(questionWithChoices);wrong=[];index=0;score=0;results=[];
    sessionStart=Date.now();hiddenMs=0;hiddenStart=document.hidden?sessionStart:0;
    setScreen("quizScreen");showQuestion();
  }
  function showQuestion(){
    const q=quiz[index];selected=-1;answered=false;questionStart=Date.now();questionHiddenMs=0;questionHiddenStart=document.hidden?questionStart:0;
    $("count").textContent=`${index+1} / ${quiz.length}`;$("currentScore").textContent=`正解 ${score}`;$("barFill").style.width=`${index/quiz.length*100}%`;
    $("question").innerHTML=`<span class="badge">${escapeHtml(cfg.badge || cfg.title)}</span><br>${escapeHtml(q.prompt)}`;
    $("choices").replaceChildren();$("writtenArea").replaceChildren();$("feedback").className="feedback";$("feedback").innerHTML="";
    $("answerBtn").disabled=true;$("nextBtn").disabled=true;
    if(q.kind==="number"){
      const row=document.createElement("div");row.className="answer-row";
      const input=document.createElement("input");input.id="answerInput";input.inputMode="decimal";input.autocomplete="off";input.placeholder="数値を入力（例：6e4）";input.setAttribute("aria-label","数値の答え");
      const unit=document.createElement("span");unit.className="unit";unit.textContent=q.unit || "";
      input.addEventListener("input",()=>{$("answerBtn").disabled=!input.value.trim();});
      input.addEventListener("keydown",event=>{if(event.key==="Enter"&&!$("answerBtn").disabled)check();});
      row.append(input,unit);$("writtenArea").appendChild(row);input.focus();
    }else{
      q.choices.forEach((choice,n)=>{
        const button=document.createElement("button");button.className="choice";button.textContent=`${["①","②","③","④","⑤"][n] || n+1}　${choice}`;
        button.addEventListener("click",()=>{if(answered)return;selected=n;$("choices").querySelectorAll(".choice").forEach(x=>x.classList.remove("selected"));button.classList.add("selected");$("answerBtn").disabled=false;});
        $("choices").appendChild(button);
      });
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
      correct=Math.abs(value-q.answer)<=Math.max(Math.abs(q.answer)*0.01,1e-12);
      answer=`${q.answer} ${q.unit}`;$("answerInput").disabled=true;
    }else{
      if(selected<0)return;
      response=q.choices[selected];answer=q.choices[q.answer];correct=selected===q.answer;
      $("choices").querySelectorAll(".choice").forEach((button,n)=>{button.disabled=true;if(n===q.answer)button.classList.add("correct");else if(n===selected)button.classList.add("wrong");});
    }
    answered=true;if(correct)score++;else wrong.push(q);
    const elapsedSeconds=visibleSeconds(questionStart,questionHiddenMs,questionHiddenStart);
    results.push({id:q.id,type:q.kind==="number"?"数値入力":"選択式",correct,selected:response,answer,prompt:q.prompt,elapsedSeconds});
    $("feedback").className="feedback "+(correct?"ok":"ng");
    $("feedback").innerHTML=`<strong>${correct?"正解！":"不正解"}</strong><br>正解：<strong>${escapeHtml(answer)}</strong><div class="formula">${escapeHtml(q.explanation || "")}</div>`;
    $("currentScore").textContent=`正解 ${score}`;$("answerBtn").disabled=true;$("nextBtn").disabled=false;
  }
  function confirmSave(attempt=0){
    auth.progress(response=>{
      const item=response?.ok && (response.stages || []).find(row=>row.stage===cfg.stage);
      if(Number(item?.attempts || 0)>priorAttempts){priorAttempts=Number(item.attempts);$("sendStatus").textContent="学習履歴を保存しました。";return;}
      if(attempt<5)setTimeout(()=>confirmSave(attempt+1),1500);
      else $("sendStatus").textContent="保存を確認できませんでした。教員にご連絡ください。";
    });
  }
  function finish(){
    setScreen("finishScreen");$("barFill").style.width="100%";
    const rate=Math.round(score/quiz.length*100),elapsed=visibleSeconds(sessionStart,hiddenMs,hiddenStart);
    $("finalScore").textContent=`${score} / ${quiz.length} 問正解（${rate}%）`;
    $("finalMessage").innerHTML=`<div class="${rate>=70?"pass":"fail"}">${rate>=70?"クリア！":"解説を確認して、もう一度挑戦しましょう。"}</div><div class="session-note">所要時間：${Math.floor(elapsed/60)}分${elapsed%60}秒</div>`;
    $("reviewBtn").hidden=!wrong.length;$("sendStatus").textContent="結果を送信中…";
    const payload={authToken:auth.token(),stage:cfg.stage,score,total:quiz.length,elapsed,questionTimes:results.map(x=>x.elapsedSeconds),questionResults:results,userAgent:navigator.userAgent,screen:`${innerWidth}x${innerHeight}`};
    fetch(auth.API_URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)})
      .then(()=>{$("sendStatus").textContent="保存を確認中…";confirmSave();})
      .catch(()=>{$("sendStatus").textContent="送信できませんでした。通信を確認してください。";});
  }
  $("startBtn").addEventListener("click",()=>start());
  $("answerBtn").addEventListener("click",check);
  $("nextBtn").addEventListener("click",()=>{index++;index>=quiz.length?finish():showQuestion();});
  $("restartBtn").addEventListener("click",()=>{if(confirm("ここまでの回答を中断して最初に戻りますか？"))setScreen("startScreen");});
  $("againBtn").addEventListener("click",()=>start());
  $("reviewBtn").addEventListener("click",()=>start(wrong));
  auth.progress(response=>{
    if(!auth.showAccess(response))return;
    priorAttempts=auth.stageMark(cfg.stage,response).attempts;
    $("startBtn").disabled=false;
  });
})();
