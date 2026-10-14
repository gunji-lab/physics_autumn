(() => {
  "use strict";
  const auth = window.AutumnAuth;
  auth.progress(response => {
    if (!auth.showAccess(response)) return;
    document.querySelectorAll("[data-stage]").forEach(link => {
      const progress = auth.stageMark(link.dataset.stage, response);
      let mark = link.querySelector(".progress-mark");
      if (!mark) { mark = document.createElement("span"); mark.className = "progress-mark"; link.prepend(mark); }
      mark.textContent = progress.text;
      mark.classList.toggle("cleared", progress.cleared);
    });
    const summary = document.getElementById("learningSummary");
    if (!summary || !response.summary) return;
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
    const dashboard = document.createElement("a");
    dashboard.href = auth.AUTH_URL + "?view=my";
    dashboard.target = "_top";
    dashboard.textContent = "詳しい学習状況を見る →";
    const links = document.createElement("div");
    links.className = "dashboard-links";
    links.append(dashboard);
    if (response.teacherDashboardUrl) {
      const teacher = document.createElement("a");
      teacher.href = response.teacherDashboardUrl;
      teacher.target = "_top";
      teacher.textContent = "教員ダッシュボードを見る →";
      links.append(teacher);
    }
    summary.innerHTML = `<strong>自分の学習状況</strong><div class="summary-values"><span>学習時間 <strong>${timeText}</strong></span><span>挑戦 <strong>${Number(data.attempts || 0)}回</strong></span><span>通常Stage <strong>${Number(data.clearedStages || 0)}/${Number(data.stages || 0)}</strong></span></div>${top10.length ? `<div class="top-ranks">🏆 TOP10：${top10.join("・")}</div>` : ""}`;
    summary.append(links);
  });
})();
