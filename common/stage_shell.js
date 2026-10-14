(() => {
  "use strict";
  const cfg=window.STAGE_CONFIG;
  if(!cfg)return;
  const e=value=>String(value ?? "").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  document.body.innerHTML=`<div class="wrap stage-wrap"><div class="card">
    <h1>${e(cfg.title)}</h1><div class="lead">${e(cfg.lead)}</div>
    <div id="identity" class="notice">大学アカウントを確認中…</div>
    <p id="loginArea" hidden><a class="button" href="https://script.google.com/a/macros/toyo.jp/s/AKfycbyqYGXl59oOVeV5FavjX1wDYGePIa8YKcwM3RJAhr2nsvC0dukvapC5MbjlbLhVqPi8/exec?view=auth">大学Googleアカウントでログイン</a></p>
    <div id="content" hidden>
      <div id="startScreen"><div class="session-note">${e(cfg.note)}<br>70%以上でクリアです。</div><div class="buttons"><button id="startBtn" disabled>スタート</button></div></div>
      <div id="quizScreen" hidden><div class="top"><div id="count"></div><div id="currentScore"></div></div><div class="bar"><div id="barFill"></div></div><div id="question" class="question"></div><div id="choices" class="choices"></div><div id="writtenArea"></div><div id="feedback" class="feedback"></div><div class="buttons"><button id="answerBtn" disabled>答える</button><button id="nextBtn" disabled>次の問題</button></div><div class="buttons" style="justify-content:flex-end;margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb"><button class="secondary" id="restartBtn">学習を中断して最初に戻る</button></div></div>
      <div id="finishScreen" class="result" hidden><div>結果</div><div id="finalScore" class="scorebig"></div><div id="finalMessage"></div><div id="sendStatus" class="status"></div><div class="buttons center"><button id="againBtn">もう一度やる</button><button class="secondary" id="reviewBtn" hidden>間違えた問題だけ復習</button><a class="button secondary" data-auth-link href="${e(cfg.categoryHref)}">カテゴリトップへ</a><a class="button secondary" data-auth-link href="${e(cfg.homeHref)}">トップページへ</a></div></div>
      <div class="back"><a data-auth-link href="${e(cfg.categoryHref)}">カテゴリトップに戻る</a></div>
    </div></div></div>`;
  document.title=cfg.title+"｜物理2";
})();
