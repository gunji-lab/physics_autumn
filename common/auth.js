window.AutumnAuth = (() => {
  "use strict";
  const API_URL = "https://script.google.com/a/macros/toyo.jp/s/AKfycbyZIWvMD6p_n8TvdQye_W3E65Fxx6enAqot8abrRy7Mm5p6uDvgo_9ZxqjqPhye-Z3N/exec";
  const AUTH_URL = "https://script.google.com/a/macros/toyo.jp/s/AKfycbyqYGXl59oOVeV5FavjX1wDYGePIa8YKcwM3RJAhr2nsvC0dukvapC5MbjlbLhVqPi8/exec";
  const TOKEN_KEY = "physicsTrainerAutumnAuth";
  let sessionToken = "";
  const hashToken = new URLSearchParams(location.hash.slice(1)).get("auth");
  if (hashToken) {
    sessionToken = hashToken;
    try { localStorage.setItem(TOKEN_KEY, hashToken); } catch (_) {}
    try { history.replaceState(null, "", location.pathname + location.search); } catch (_) {}
  }
  function token() {
    if (sessionToken) return sessionToken;
    try { return localStorage.getItem(TOKEN_KEY) || ""; } catch (_) { return ""; }
  }
  function clear() {
    sessionToken = "";
    try { localStorage.removeItem(TOKEN_KEY); } catch (_) {}
  }
  function link(path) {
    const url = new URL(path, location.href);
    if (token()) url.hash = "auth=" + encodeURIComponent(token());
    return url.href;
  }
  function decorateLinks() {
    document.querySelectorAll("a[data-auth-link]").forEach(a => { a.href = link(a.getAttribute("href")); });
  }
  function showTeacherBar(studentId) {
    if (studentId !== "ADMIN_GUNJI" && token().split(".")[0] !== "ADMIN_GUNJI") return;
    if (document.getElementById("teacherBar")) return;
    const bar = document.createElement("div");
    bar.id = "teacherBar";
    bar.className = "teacher-bar";
    bar.innerHTML = `教員モード <a href="${AUTH_URL}?view=teacher" target="_top">教員ダッシュボードを見る →</a>`;
    document.body.prepend(bar);
  }
  function progress(callback) {
    if (!token()) { callback({ok:false,error:"missing_token"}); return; }
    const name = "__autumnProgress" + Date.now() + Math.random().toString(36).slice(2);
    const script = document.createElement("script");
    const timer = setTimeout(() => {delete window[name];script.remove();callback(null);},12000);
    window[name] = response => {clearTimeout(timer);delete window[name];script.remove();callback(response);};
    script.onerror = () => {clearTimeout(timer);delete window[name];script.remove();callback(null);};
    script.src = API_URL + "?api=progress&token=" + encodeURIComponent(token()) + "&callback=" + name;
    document.head.appendChild(script);
  }
  function showAccess(response, {contentId="content",identityId="identity",loginId="loginArea"}={}) {
    const identity = document.getElementById(identityId);
    const content = document.getElementById(contentId);
    const login = document.getElementById(loginId);
    if (!response?.ok) {
      if (response?.error === "unauthorized") clear();
      if (identity) {
        identity.hidden = false;
        identity.textContent = token() ? "進捗を読み込めませんでした。しばらくしてから再読み込みしてください。" : "大学Googleアカウントでログインしてください。";
      }
      if (login) login.hidden = false;
      if (content) content.hidden = true;
      return false;
    }
    if (identity) identity.hidden = true;
    if (login) login.hidden = true;
    if (content) content.hidden = false;
    showTeacherBar(response.studentId);
    decorateLinks();
    return true;
  }
  function stageMark(stage, response) {
    const item = (response?.stages || []).find(row => row.stage === stage);
    if (!item) return {text:"○ 未クリア｜0回挑戦",cleared:false,attempts:0};
    const status = String(item.status || "");
    const cleared = status.includes("クリア") && !status.includes("未");
    const attempts = Number(item.attempts || 0);
    return {text:`${cleared?"✓ クリア":"○ 未クリア"}｜${attempts}回挑戦`,cleared,attempts};
  }
  showTeacherBar();
  return {API_URL,AUTH_URL,token,clear,link,decorateLinks,showTeacherBar,progress,showAccess,stageMark};
})();
