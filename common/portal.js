(() => {
  "use strict";
  const auth = window.AutumnAuth;
  auth.progress(response => {
    if (!auth.showAccess(response)) return;
    document.querySelectorAll("[data-stage]").forEach(link => {
      const progress = auth.stageMark(link.dataset.stage, response);
      let mark = link.querySelector(".progress-mark");
      if (!mark) {mark=document.createElement("span");mark.className="progress-mark";link.prepend(mark);}
      mark.textContent=progress.text;mark.classList.toggle("cleared",progress.cleared);
    });
    const summary=document.getElementById("learningSummary");
    if (summary && response.summary) {
      const attempts=Number(response.summary.attempts || 0);
      const seconds=Number(response.summary.totalElapsed || 0);
      summary.textContent=`自分の学習状況：挑戦 ${attempts}回・学習時間 ${Math.floor(seconds/60)}分`;
    }
  });
})();
