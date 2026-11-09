// サイト共通の小さな機能
// ・記事ページ：目次が空なら見出しから自動で作る／今読んでいる見出しを目次で強調する／URL をコピーする
// ・トップページ：検索（?q=）とタブ（?tab=）で記事一覧を絞り込む
(function () {
  "use strict";
  var params = new URLSearchParams(location.search);

  // ---------- 検索欄に今の検索語を入れておく ----------
  var q = (params.get("q") || "").trim();
  var searchInput = document.querySelector(".header-search input");
  if (searchInput && q) searchInput.value = q;

  // ---------- 記事ページ：目次の自動作成 ----------
  var main = document.querySelector("main");
  var autoToc = document.querySelector(".toc[data-auto]");
  if (main && autoToc) {
    var heads = main.querySelectorAll("h2, h3");
    var html = '<p class="toc-title">目次</p><ol>';
    var open = false;
    heads.forEach(function (h, i) {
      if (!h.id) h.id = "sec-" + (i + 1);
      var item = '<a href="#' + h.id + '">' + h.textContent + "</a>";
      if (h.tagName === "H2") {
        if (open) { html += "</ol></li>"; open = false; }
        html += "<li>" + item;
        var next = heads[i + 1];
        if (next && next.tagName === "H3") { html += "<ol>"; open = true; } else { html += "</li>"; }
      } else {
        html += "<li>" + item + "</li>";
      }
    });
    if (open) html += "</ol></li>";
    html += "</ol>";
    autoToc.innerHTML = html;
  }

  // ---------- 記事ページ：今読んでいる見出しを目次で強調 ----------
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll(".toc a[href^='#']"));
  if (tocLinks.length) {
    var targets = tocLinks
      .map(function (a) { return { a: a, el: document.getElementById(decodeURIComponent(a.getAttribute("href").slice(1))) }; })
      .filter(function (t) { return t.el; });
    var update = function () {
      var y = window.scrollY + 120;
      var cur = null;
      targets.forEach(function (t) { if (t.el.getBoundingClientRect().top + window.scrollY <= y) cur = t; });
      tocLinks.forEach(function (a) { a.classList.remove("current"); });
      if (cur) cur.a.classList.add("current");
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  // ---------- 記事ページ：URL をコピー ----------
  document.querySelectorAll("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var done = function () {
        var t = document.createElement("div");
        t.className = "copied";
        t.textContent = "ページの URL をコピーしました";
        document.body.appendChild(t);
        setTimeout(function () { t.remove(); }, 1800);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(done, done);
    });
  });

  // ---------- トップページ：タブと検索で絞り込む ----------
  var feed = document.querySelector(".feed");
  if (feed) {
    var tab = params.get("tab") || "all";
    document.querySelectorAll(".header-tabs a[data-tab]").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-tab") === tab);
    });
    var cards = feed.querySelectorAll(".feed-card");
    var shown = 0;
    var words = q.toLowerCase().split(/\s+/).filter(Boolean);
    cards.forEach(function (c) {
      var okTab = tab === "all" || (c.getAttribute("data-cat") || "") === tab;
      var hay = c.textContent.toLowerCase();
      var okQ = words.every(function (w) { return hay.indexOf(w) !== -1; });
      c.hidden = !(okTab && okQ);
      if (!c.hidden) shown++;
    });
    var info = document.querySelector(".feed-info");
    if (info) info.textContent = q ? "「" + q + "」の検索結果 " + shown + " 件" : shown + " 件の記事";
    var empty = document.querySelector(".feed-empty");
    if (empty) empty.hidden = shown !== 0;
  }
})();
