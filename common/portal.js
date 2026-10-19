(() => {
  "use strict";
  const auth = window.AutumnAuth;
  const embedded = window.parent !== window;
  let verifiedTeacher = false;
  let latestProgress = null;
  let received = false;

  function dashboardLinks(response) {
    const links = document.createElement("div");
    links.className = "dashboard-links";
    const student = document.createElement("a");
    student.href = response?.dashboardUrl || auth.AUTH_URL + (auth.token().split(".")[0] === "GUNJI_TEST" ? "?view=studentTestMy" : "?view=my");
    student.target = "_top";
    student.textContent = "詳しい学習状況を見る →";
    links.append(student);
    if (verifiedTeacher || response?.studentId === "ADMIN_GUNJI" || response?.teacherDashboardUrl || auth.token().split(".")[0] === "ADMIN_GUNJI") {
      const teacher = document.createElement("a");
      teacher.href = response?.teacherDashboardUrl || auth.AUTH_URL + "?view=teacher";
      teacher.target = "_top";
      teacher.textContent = "教員ダッシュボードを見る →";
      links.append(teacher);
    }
    return links;
  }

  function renderSummary(response) {
    const summary = document.getElementById("learningSummary");
    if (!summary) return;
    if (!response?.summary) {
      summary.innerHTML = '<strong>自分の学習状況</strong><div class="muted">学習状況を読み込み中…</div>';
    } else {
      const data = response.summary;
      const seconds = Number(data.totalElapsed || 0);
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const timeText = hours ? `${hours}時間${minutes}分` : `${minutes}分`;
      const top10 = [];
      const timeRank = response.rankings?.totalElapsed;
      const attemptRank = response.rankings?.attempts;
      if (timeRank?.rank && timeRank.rank <= 10) top10.push(`学習時間 ${timeRank.rank}位`);
      if (attemptRank?.rank && attemptRank.rank <= 10) top10.push(`挑戦数 ${attemptRank.rank}位`);
      summary.innerHTML = `<strong>自分の学習状況</strong><div class="summary-values"><span>学習時間 <strong>${timeText}</strong></span><span>挑戦 <strong>${Number(data.attempts || 0)}回</strong></span><span>通常Stage <strong>${Number(data.clearedStages || 0)}/${Number(data.stages || 0)}</strong></span></div>${top10.length ? `<div class="top-ranks">🏆 TOP10：${top10.join("・")}</div>` : ""}`;
    }
    summary.append(dashboardLinks(response));
  }

  function render(response) {
    if (!response?.ok) {
      if (!embedded) auth.showAccess(response);
      else {
        const summary = document.getElementById("learningSummary");
        if (summary) {
          renderSummary(latestProgress);
          const note = summary.querySelector(".muted");
          if (note) note.textContent = "学習状況を読み込めませんでした。ページを再読み込みしてください。";
        }
      }
      return;
    }
    latestProgress = response;
    auth.showAccess(response);
    document.querySelectorAll("[data-stage]").forEach(link => {
      const progress = auth.stageMark(link.dataset.stage, response);
      let mark = link.querySelector(".progress-mark");
      if (!mark) { mark = document.createElement("span"); mark.className = "progress-mark"; link.prepend(mark); }
      mark.textContent = progress.text;
      mark.classList.toggle("cleared", progress.cleared);
    });
    renderSummary(response);
  }

  if (embedded) {
    auth.showAccess({ok:true});
    renderSummary(null);
    const fallback = setTimeout(() => {
      if (!received) auth.progress(response => { if (!received) render(response); });
    }, 5000);
    window.addEventListener("message", event => {
      if (event.source !== window.parent || !event.data) return;
      if (event.data.type === "physics:identity") {
        verifiedTeacher = event.data.studentId === "ADMIN_GUNJI";
        renderSummary(latestProgress);
      }
      if (event.data.type === "physics:progressResult") {
        if (event.data.response?.ok) {
          received = true;
          clearTimeout(fallback);
          render(event.data.response);
        } else if (!received) {
          clearTimeout(fallback);
          auth.progress(response => { if (!received) render(response); });
        }
      }
    });
    window.parent.postMessage({type:"physics:ready"}, "*");
    window.parent.postMessage({type:"physics:progress"}, "*");
  } else {
    auth.progress(render);
  }
})();
