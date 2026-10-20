/* MatchEar — live football by ear.
   Vanilla JS. Speech via Web Speech API, haptics via navigator.vibrate,
   real fixtures from TheSportsDB with a Vercel proxy fallback. */
(function () {
  "use strict";

  /* ---------------- saved settings ---------------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem("me_" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("me_" + k, JSON.stringify(v)); } catch (e) { /* fine without storage */ } },
  };

  const S = {
    lang: store.get("lang", "en"),
    rate: store.get("rate", 1.0),
    verbosity: store.get("verbosity", "all"),
    haptics: store.get("haptics", true),
    contrast: store.get("contrast", false),
    textSize: store.get("textSize", 0),
    dataSaver: store.get("dataSaver", true),
    muted: false,
    lastLine: "",
    started: false,
    mode: "trial", // which match Ask refers to: "trial" | "real"
  };

  /* ---------------- strings ---------------- */
  const STR = {
    en: {
      tagline: "The match, in your ear and your pocket.",
      start: "Start listening", startHint: "Starting turns on the voice. Use headphones in loud places.",
      live: "Live", todays: "Today and tomorrow",
      homeNote: "Fixtures and scores come from TheSportsDB. Want to feel the goal alerts and voice first? The Demo tab runs a simulated derby.",
      liveEmptyTitle: "No match open",
      liveEmptyBody: "Pick a match from Home and it opens here with the score read out loud. The Demo tab has a simulated match with every feature on.",
      goHome: "Go to Home",
      repeat: "Repeat last event", mute: "Mute voice", unmute: "Unmute voice",
      events: "Events, newest first", replay: "Play highlights by ear",
      trialTag: "Trial match",
      demoNote: "A simulated Cairo derby, so you can try the goal alert, the vibration, Ask and the replay without waiting for a real game.",
      askTitle: "Ask about the match", holdAsk: "Hold to ask",
      askReady: "Voice is ready", askListening: "Listening…", askNoMic: "Voice input needs Chrome. Use the quick questions below.",
      quick: "Quick questions",
      qWho: "Who scored?", qScore: "What's the score?", qTime: "How long is left?", qCards: "Any cards?",
      settings: "Settings", language: "Language", voiceSpeed: "Voice speed",
      speedSlow: "Slow", speedNormal: "Normal", speedFast: "Fast",
      verbosity: "Announcements", verbAll: "All events", verbGoals: "Goals only",
      vibration: "Vibration alerts", contrast: "High contrast", textSize: "Text size",
      sizeLarge: "Large", sizeXL: "Extra large", sizeXXL: "Huge",
      dataSaver: "Data saver", on: "On", off: "Off",
      settingsNote: "Your choices are saved on this device. Switching language flips the whole app to right-to-left Arabic, voice included.",
      tHome: "Home", tLive: "Live", tDemo: "Demo", tAsk: "Ask", tSettings: "Settings",
      tapContinue: "Tap anywhere to continue",
      goalWord: "GOAL!", goalAgainstWord: "Goal against",
      welcome: "MatchEar is on. Today's fixtures are loading. The Demo tab has a simulated derby to try the alerts.",
      openedDemo: "Demo match. Al Ahly 1, Zamalek 0. Sixtieth minute. You'll hear every event.",
      langSet: "Language set to English.",
      noAnswer: "I didn't catch that. Try: who scored, the score, time left, or cards.",
      replayIntro: "Highlights by ear.", replayDone: "That's all of them.",
      loadingFixtures: "Finding today's football…",
      fixturesFail: "Couldn't load fixtures. Check your connection and try again.",
      retry: "Try again",
      games1: "game", games: "games",
      noGamesSoon: "No games today or tomorrow.",
      leagueFail: "Couldn't load this league right now.",
      nextOn: "Next:",
      remindOff: "Remind me 15 minutes before kickoff",
      remindOn: "Reminder on · 15 minutes before kickoff",
      remindSet: "Reminder set. You'll get a buzz and a voice alert 15 minutes before kickoff, while the app is open.",
      remindCleared: "Reminder off.",
      reminderWord: "Kickoff soon",
      reminderIn: "in 15 minutes",
      previewHint: "In the chat preview, outside websites are blocked, so fixtures only load on the deployed site.",
      ft: "Full time", kicksOff: "Kicks off", liveNow: "Live now",
      scoreYet: "No score yet. It kicks off",
      noDetail: "No match events have come through yet for this game.",
      qStats: "Match stats?",
      statsFail: "Stats aren't available for this match yet.",
      tlGoal: "GOAL for", tlOwnGoal: "Own goal", tlPen: "Penalty goal", tlMissedPen: "Penalty missed",
      tlYellow: "Yellow card", tlRed: "Red card", tlSub: "Substitution",
      feedReal: "Match events, newest first",
      stripLegend: "Goals, cards and subs along the match. Home above the line, away below.",
      pulsePressH: "pushing hard lately", pulsePressA: "pushing hard lately", pulseEven: "It's an even spell",
      updated: "Score update.",
    },
    ar: {
      tagline: "الماتش في ودنك وفي جيبك.",
      start: "ابدأ الاستماع", startHint: "البدء يشغّل الصوت. استخدم سماعة في الأماكن العالية.",
      live: "مباشر", todays: "النهارده وبكرة",
      homeNote: "المباريات والنتائج من TheSportsDB. عايز تجرّب تنبيهات الجون والصوت الأول؟ تبويب تجريبي فيه ديربي محاكاة.",
      liveEmptyTitle: "مفيش ماتش مفتوح",
      liveEmptyBody: "اختار ماتش من الرئيسية وهيفتح هنا والنتيجة بتتقري بصوت عالي. تبويب تجريبي فيه ماتش محاكاة بكل المزايا.",
      goHome: "روح للرئيسية",
      repeat: "إعادة آخر حدث", mute: "كتم الصوت", unmute: "تشغيل الصوت",
      events: "الأحداث، الأحدث أولًا", replay: "شغّل الملخص بالصوت",
      trialTag: "ماتش تجريبي",
      demoNote: "ديربي قاهري محاكاة، عشان تجرّب تنبيه الجون والاهتزاز واسأل والملخص من غير ما تستنى ماتش حقيقي.",
      askTitle: "اسأل عن الماتش", holdAsk: "اضغط مطولًا للسؤال",
      askReady: "الصوت جاهز", askListening: "بسمعك…", askNoMic: "الإدخال الصوتي يحتاج كروم. استخدم الأسئلة السريعة بالأسفل.",
      quick: "أسئلة سريعة",
      qWho: "مين اللي جاب؟", qScore: "النتيجة كام؟", qTime: "فاضل قد إيه؟", qCards: "في كروت؟",
      settings: "الإعدادات", language: "اللغة", voiceSpeed: "سرعة الصوت",
      speedSlow: "بطيء", speedNormal: "عادي", speedFast: "سريع",
      verbosity: "الإعلانات", verbAll: "كل الأحداث", verbGoals: "الأهداف فقط",
      vibration: "تنبيهات الاهتزاز", contrast: "تباين عالٍ", textSize: "حجم الخط",
      sizeLarge: "كبير", sizeXL: "أكبر", sizeXXL: "ضخم",
      dataSaver: "توفير البيانات", on: "يعمل", off: "متوقف",
      settingsNote: "اختياراتك محفوظة على هذا الجهاز. تغيير اللغة يقلب التطبيق كله للعربية من اليمين لليسار، بالصوت كمان.",
      tHome: "الرئيسية", tLive: "مباشر", tDemo: "تجريبي", tAsk: "اسأل", tSettings: "الإعدادات",
      tapContinue: "اضغط في أي مكان للمتابعة",
      goalWord: "جووول!", goalAgainstWord: "جول علينا",
      welcome: "ماتش إير اشتغل. مباريات اليوم بتتحمّل. تبويب تجريبي فيه ديربي محاكاة تجرّب بيه التنبيهات.",
      openedDemo: "ماتش تجريبي. الأهلي واحد، الزمالك صفر. الدقيقة ستين. هتسمع كل حدث.",
      langSet: "تم تغيير اللغة إلى العربية.",
      noAnswer: "مسمعتش كويس. جرّب: مين جاب، النتيجة، الوقت، أو الكروت.",
      replayIntro: "الملخص بالصوت.", replayDone: "دي كل الأحداث.",
      loadingFixtures: "بندوّر على ماتشات اليوم…",
      fixturesFail: "معرفناش نحمّل المباريات. اتأكد من النت وجرّب تاني.",
      retry: "جرّب تاني",
      games1: "ماتش", games: "ماتشات",
      noGamesSoon: "مفيش ماتشات النهارده ولا بكرة.",
      leagueFail: "معرفناش نحمّل الدوري ده دلوقتي.",
      nextOn: "الجاي:",
      remindOff: "فكّرني قبل الماتش بربع ساعة",
      remindOn: "التذكير شغّال · قبل الماتش بربع ساعة",
      remindSet: "اتسجّل التذكير. هييجيلك اهتزاز وصوت قبل الماتش بربع ساعة، طالما التطبيق مفتوح.",
      remindCleared: "التذكير اتقفل.",
      reminderWord: "الماتش قرب",
      reminderIn: "بعد ربع ساعة",
      previewHint: "في معاينة الشات، المواقع الخارجية متقفلة، فالمباريات بتشتغل على الموقع المنشور بس.",
      ft: "انتهى", kicksOff: "يبدأ", liveNow: "مباشر الآن",
      scoreYet: "لسه مفيش نتيجة. الماتش يبدأ",
      noDetail: "لسه موصلش أحداث للماتش ده.",
      qStats: "إحصائيات الماتش؟",
      statsFail: "الإحصائيات مش متاحة للماتش ده لسه.",
      tlGoal: "جووول لـ", tlOwnGoal: "جول في مرماه", tlPen: "جول من ضربة جزاء", tlMissedPen: "ضربة جزاء ضايعة",
      tlYellow: "كارت أصفر", tlRed: "كارت أحمر", tlSub: "تبديل",
      feedReal: "أحداث الماتش، الأحدث أولًا",
      stripLegend: "الأهداف والكروت والتبديلات على مدار الماتش. صاحب الأرض فوق الخط والضيف تحته.",
      pulsePressH: "ضاغط بقوة في الفترة الأخيرة", pulsePressA: "ضاغط بقوة في الفترة الأخيرة", pulseEven: "الفترة دي متوازنة",
      updated: "تحديث في النتيجة.",
    },
  };
  const t = (k) => (STR[S.lang] && STR[S.lang][k]) || STR.en[k] || k;

  /* ---------------- competitions (TheSportsDB league ids) ---------------- */
  const API = "https://www.thesportsdb.com/api/v1/json/123/";
  const LEAGUES = [
    { id: 4429, en: "World Cup", ar: "كأس العالم" },
    { id: 4502, en: "Euro", ar: "يورو" },
    { id: 4499, en: "Copa America", ar: "كوبا أمريكا" },
    { id: 4496, en: "Africa Cup of Nations", ar: "كأس أمم أفريقيا" },
    { id: 4720, en: "CAF Champions League", ar: "دوري أبطال أفريقيا" },
    { id: 4480, en: "Champions League", ar: "دوري أبطال أوروبا" },
    { id: 4481, en: "Europa League", ar: "الدوري الأوروبي" },
    { id: 4328, en: "Premier League", ar: "الدوري الإنجليزي الممتاز" },
    { id: 4335, en: "La Liga", ar: "الدوري الإسباني" },
    { id: 4332, en: "Serie A", ar: "الدوري الإيطالي" },
  ];

  /* ---------------- trial match state ---------------- */
  const M = {
    sec: 60 * 60, running: true, over: false,
    score: [1, 0],
    scorers: [{ name: "Trezeguet", min: 43 }],
    cards: [{ team: "zamalek", player: "El Shahat", min: 58 }],
    log: [],
    feed: [
      { min: 58, en: "Yellow card — Zamalek (El Shahat)", ar: "كارت أصفر — الزمالك (الشحات)", cls: "" },
      { min: 51, en: "Substitution — Al Ahly (Ashour on)", ar: "تبديل — الأهلي (دخول عاشور)", cls: "" },
      { min: 43, en: "GOAL — Trezeguet (Al Ahly)", ar: "جووول — تريزيجيه (الأهلي)", cls: "goal" },
    ],
    fired: {},
  };

  /* real match being followed */
  const R = { ev: null, timer: null, league: null };

  /* timeline of the open real match */
  const TL = { items: [], seen: {} };
  /* rolling stats for the spoken match pulse */
  const PULSE = { prev: null, lastMin: 0 };

  /* kickoff reminders: {id: {ts, home, away, fired}} */
  const REM = store.get("reminders", {});
  function saveRem() { store.set("reminders", REM); }

  const PATTERN = {
    goalFor: [450, 180, 450, 180, 450],
    goalAgainst: [160, 120, 160, 120, 500],
    card: [160, 120, 160],
    sub: [500],
    ft: [900],
  };

  /* ---------------- dom ---------------- */
  const $ = (id) => document.getElementById(id);
  const els = {};
  ["splash","app","startBtn","liveDot","fixtures",
   "liveEmpty","liveWrap","goHomeBtn","realHeader","homeBadge","awayBadge","homeName","awayName",
   "rScore","rClock","matchMeta","rRepeat","remindBtn","rFeed","rFeedWrap","rStrip","dStrip",
   "dScoreTeams","dScore","dClock","dRepeat","feed","replayBtn",
   "askVoiceBtn","askState","answer","takeover","tWord","tDetail","tScore","waveform",
   "announcer","langBtn","speedBtn","verbosityBtn","hapticsBtn","contrastBtn","textBtn","dataBtn"]
    .forEach((id) => (els[id] = $(id)));
  const muteBtns = () => document.querySelectorAll(".mute-btn");

  function applyLang() {
    document.documentElement.lang = S.lang;
    document.documentElement.dir = S.lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    els.langBtn.textContent = S.lang === "en" ? "العربية" : "English";
    syncMute();
    syncSettingLabels();
    renderTrial();
    if (R.ev) renderReal();
    renderFixtures();
    document.querySelectorAll(".lang").forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.lang === S.lang)));
  }

  function syncMute() {
    muteBtns().forEach((b) => (b.textContent = S.muted ? t("unmute") : t("mute")));
  }
  function syncSettingLabels() {
    els.speedBtn.textContent = S.rate < 1 ? t("speedSlow") : S.rate > 1 ? t("speedFast") : t("speedNormal");
    els.verbosityBtn.textContent = S.verbosity === "all" ? t("verbAll") : t("verbGoals");
    els.hapticsBtn.textContent = S.haptics ? t("on") : t("off");
    els.contrastBtn.textContent = S.contrast ? t("on") : t("off");
    els.textBtn.textContent = [t("sizeLarge"), t("sizeXL"), t("sizeXXL")][S.textSize];
    els.dataBtn.textContent = S.dataSaver ? t("on") : t("off");
    document.body.classList.toggle("hc", S.contrast);
    document.body.classList.toggle("data-saver", S.dataSaver);
    document.documentElement.classList.toggle("size-xl", S.textSize === 1);
    document.documentElement.classList.toggle("size-xxl", S.textSize === 2);
  }

  /* ---------------- speech & haptics ---------------- */
  function speak(msg) {
    if (S.muted || !("speechSynthesis" in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(msg);
      u.lang = S.lang === "ar" ? "ar-EG" : "en-US";
      u.rate = S.rate;
      const v = speechSynthesis.getVoices().find((x) => x.lang && x.lang.toLowerCase().startsWith(S.lang === "ar" ? "ar" : "en"));
      if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (e) { /* the announcer line still shows the text */ }
  }
  function say(msg, { log = false } = {}) {
    S.lastLine = msg;
    if (log) M.log.push(msg);
    els.announcer.textContent = msg;
    speak(msg);
  }
  function buzz(pattern) {
    if (!S.haptics) return;
    if (navigator.vibrate) { try { navigator.vibrate(pattern); } catch (e) {} }
  }

  /* ---------------- trial rendering (Demo tab) ---------------- */
  function fmtClock(sec) {
    const m = Math.floor(sec / 60), s = sec % 60;
    return m + ":" + String(s).padStart(2, "0");
  }
  function demoStripEvents() {
    return M.feed.map((e) => ({
      min: e.min,
      side: /Ahly|الأهلي/.test(e.en + e.ar) ? "h" : "a",
      kind: e.cls.indexOf("goal") === 0 ? "goal" : /card|كارت/.test(e.en + e.ar) ? "card" : "sub",
      label: S.lang === "ar" ? e.ar : e.en,
    }));
  }
  function renderTrial() {
    const [a, z] = M.score;
    els.dScore.textContent = a + "–" + z;
    els.dClock.textContent = M.over ? "FT" : fmtClock(M.sec);
    els.dScoreTeams.firstElementChild.textContent = S.lang === "ar" ? "الأهلي" : "AL AHLY";
    els.dScoreTeams.lastElementChild.textContent = S.lang === "ar" ? "الزمالك" : "ZAMALEK";
    els.feed.innerHTML = "";
    M.feed.forEach((e) => {
      const li = document.createElement("li");
      if (e.cls) li.className = e.cls;
      const min = document.createElement("span");
      min.className = "min";
      min.textContent = e.min + "'";
      const txt = document.createElement("span");
      txt.textContent = S.lang === "ar" ? e.ar : e.en;
      li.append(min, txt);
      els.feed.appendChild(li);
    });
    els.replayBtn.hidden = !M.over;
    renderStrip(els.dStrip, demoStripEvents(), Math.floor(M.sec / 60), M.over);
  }

  /* ---------------- takeover ---------------- */
  let takeoverTimer = null;
  function showTakeover({ word, detail, score, against, pattern }) {
    els.tWord.textContent = word;
    els.tDetail.textContent = detail;
    els.tScore.textContent = score;
    els.takeover.classList.toggle("against", !!against);
    els.takeover.hidden = false;
    els.waveform.classList.add("buzzing");
    buzz(pattern);
    clearTimeout(takeoverTimer);
    takeoverTimer = setTimeout(hideTakeover, 6500);
  }
  function hideTakeover() {
    clearTimeout(takeoverTimer);
    els.takeover.hidden = true;
    els.waveform.classList.remove("buzzing");
  }
  els.takeover.addEventListener("click", hideTakeover);

  /* ---------------- trial scripted events ---------------- */
  let screen = "home"; // the tab the person is actually on
  const inDemo = () => screen === "demo";
  function goalFor(min) {
    M.score[0]++;
    M.scorers.push({ name: "Zizo", min });
    M.feed.unshift({ min, en: "GOAL — Zizo (Al Ahly)", ar: "جووول — زيزو (الأهلي)", cls: "goal" });
    renderTrial();
    const line = S.lang === "ar"
      ? "جووول للأهلي! زيزو، الدقيقة تلاتة وستين. الأهلي اتنين، الزمالك صفر."
      : "GOAL for Al Ahly! Zizo, 63rd minute. Al Ahly 2, Zamalek 0.";
    M.log.push(line);
    if (inDemo()) {
      showTakeover({
        word: t("goalWord"),
        detail: S.lang === "ar" ? "زيزو · 63'" : "Zizo · 63'",
        score: S.lang === "ar" ? "الأهلي 2–0 الزمالك" : "Al Ahly 2–0 Zamalek",
        against: false, pattern: PATTERN.goalFor,
      });
      say(line);
    }
  }
  function subZamalek(min) {
    M.feed.unshift({ min, en: "Substitution — Zamalek", ar: "تبديل — الزمالك", cls: "" });
    renderTrial();
    const line = S.lang === "ar" ? "تبديل للزمالك." : "Substitution for Zamalek.";
    M.log.push(line);
    if (inDemo() && S.verbosity === "all") { buzz(PATTERN.sub); say(line); }
  }
  function yellowAhly(min) {
    M.cards.push({ team: "ahly", player: "Ashour", min });
    M.feed.unshift({ min, en: "Yellow card — Al Ahly (Ashour)", ar: "كارت أصفر — الأهلي (عاشور)", cls: "" });
    renderTrial();
    const line = S.lang === "ar" ? "كارت أصفر للأهلي، عاشور." : "Yellow card for Al Ahly, Ashour.";
    M.log.push(line);
    if (inDemo() && S.verbosity === "all") { buzz(PATTERN.card); say(line); }
  }
  function goalAgainst(min) {
    M.score[1]++;
    M.feed.unshift({ min, en: "Goal — Shikabala (Zamalek)", ar: "جول — شيكابالا (الزمالك)", cls: "goal against" });
    renderTrial();
    const line = S.lang === "ar"
      ? "جول للزمالك. شيكابالا، الدقيقة تمنية وسبعين. الأهلي اتنين، الزمالك واحد."
      : "Goal for Zamalek. Shikabala, 78th minute. Al Ahly 2, Zamalek 1.";
    M.log.push(line);
    if (inDemo()) {
      showTakeover({
        word: t("goalAgainstWord"),
        detail: S.lang === "ar" ? "شيكابالا · 78'" : "Shikabala · 78'",
        score: S.lang === "ar" ? "الأهلي 2–1 الزمالك" : "Al Ahly 2–1 Zamalek",
        against: true, pattern: PATTERN.goalAgainst,
      });
      say(line);
    }
  }
  function fullTime() {
    M.over = true; M.running = false;
    M.feed.unshift({ min: 90, en: "Full time — Al Ahly 2–1 Zamalek", ar: "نهاية الماتش — الأهلي 2–1 الزمالك", cls: "goal" });
    renderTrial();
    const line = S.lang === "ar"
      ? "صافرة النهاية. الأهلي اتنين، الزمالك واحد. جول زيزو فرق النتيجة."
      : "Full time. Al Ahly 2, Zamalek 1. Zizo's goal made the difference.";
    M.log.push(line);
    if (inDemo()) { buzz(PATTERN.ft); say(line); }
  }

  const SCHEDULE = [
    { at: 63 * 60, key: "g63", run: goalFor.bind(null, 63) },
    { at: 66 * 60 + 10, key: "s66", run: subZamalek.bind(null, 66) },
    { at: 71 * 60 + 30, key: "y71", run: yellowAhly.bind(null, 71) },
    { at: 78 * 60 + 20, key: "g78", run: goalAgainst.bind(null, 78) },
    { at: 90 * 60, key: "ft", run: fullTime },
  ];
  setInterval(() => {
    if (!S.started || !M.running) return;
    M.sec++;
    els.dClock.textContent = fmtClock(M.sec);
    if (M.sec % 25 === 0) renderStrip(els.dStrip, demoStripEvents(), Math.floor(M.sec / 60), false);
    SCHEDULE.forEach((ev) => {
      if (M.sec >= ev.at && !M.fired[ev.key]) { M.fired[ev.key] = true; ev.run(); }
    });
  }, 200);

  /* ---------------- real fixtures ---------------- */
  const fixturesState = { status: "idle", groups: [] };

  function fetchWithTimeout(url) {
    const ctl = new AbortController();
    const kill = setTimeout(() => ctl.abort(), 12000);
    return fetch(url, { signal: ctl.signal })
      .then((r) => { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
      .finally(() => clearTimeout(kill));
  }
  /* The free API rate-limits bursts, and loading every league fires ~25
     requests. Space them out (3 at a time, a breath between each), retry
     once, then fall back to the Vercel proxy, and cache answers for ten
     minutes so retries and reloads don't burn the quota again. */
  const Q = { active: 0, max: 3, list: [] };
  function qFetch(url) {
    return new Promise((res, rej) => { Q.list.push({ url, res, rej }); pump(); });
  }
  function pump() {
    while (Q.active < Q.max && Q.list.length) {
      const job = Q.list.shift();
      Q.active++;
      fetchWithTimeout(job.url)
        .then(job.res, job.rej)
        .finally(() => { Q.active--; setTimeout(pump, 250); });
    }
  }
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  function cacheGet(path) {
    try {
      const raw = localStorage.getItem("me_api_" + path);
      if (!raw) return null;
      const { t: at, d } = JSON.parse(raw);
      return Date.now() - at < 10 * 60000 ? d : null;
    } catch (e) { return null; }
  }
  function cachePut(path, d) {
    try { localStorage.setItem("me_api_" + path, JSON.stringify({ t: Date.now(), d })); } catch (e) {}
  }
  function apiGet(path, custom) {
    const liveEndpoint = /^(lookupevent|lookuptimeline|lookupeventstats)\.php/.test(path);
    if (!liveEndpoint) {
      const hit = cacheGet(path);
      if (hit) return Promise.resolve(hit);
    }
    const attempt = custom
      ? custom()
      : qFetch(API + path)
          .catch(() => wait(1300).then(() => qFetch(API + path)))
          .catch(() => qFetch("/api/tsdb?p=" + encodeURIComponent(path)));
    return attempt.then((d) => { if (!liveEndpoint) cachePut(path, d); return d; });
  }

  function normEvent(e) {
    return {
      id: e.idEvent,
      home: e.strHomeTeam, away: e.strAwayTeam,
      hs: e.intHomeScore === null || e.intHomeScore === "" || e.intHomeScore === undefined ? null : Number(e.intHomeScore),
      as: e.intAwayScore === null || e.intAwayScore === "" || e.intAwayScore === undefined ? null : Number(e.intAwayScore),
      hb: e.strHomeTeamBadge || "", ab: e.strAwayTeamBadge || "",
      ts: e.strTimestamp || (e.dateEvent ? e.dateEvent + "T" + (e.strTime || "00:00:00") : ""),
      status: (e.strStatus || "").trim(),
      venue: e.strVenue || "",
      round: e.intRound || "",
      season: e.strSeason || "",
      lb: e.strLeagueBadge || "",
    };
  }
  const isFinished = (st) => /finished|^ft$|aet|pen/i.test(st);
  const isNotStarted = (st) => st === "" || /not started|^ns$/i.test(st);

  function groupsFromMap(map) {
    return LEAGUES.map((lg) => {
      const raw = map[lg.id];
      if (raw === null || raw === undefined) return { league: lg, events: [], failed: raw === null };
      return { league: lg, events: raw.map(normEvent).sort((a, b) => (a.ts || "").localeCompare(b.ts || "")) };
    });
  }
  function finish(groups) {
    fixturesState.at = Date.now();
    fixturesState.groups = groups;
    fixturesState.status = groups.every((g) => g.failed) ? "error" : "done";
    renderFixtures();
  }
  function loadFixtures() {
    fixturesState.status = "loading";
    renderFixtures();
    /* One request does everything when the site runs on Vercel. */
    apiGet("__all__", () => fetchWithTimeout("/api/fixtures"))
      .then((d) => {
        if (!d || !d.leagues) throw new Error("bad payload");
        finish(groupsFromMap(d.leagues));
      })
      .catch(loadFixturesDirect);
  }
  /* Fallback for local files and GitHub Pages: paced per-league calls. */
  function fullRound(lg, seed, extras) {
    const r = parseInt(seed.round, 10), s = seed.season;
    if (!r || !s) return Promise.resolve({ league: lg, events: extras });
    return apiGet("eventsround.php?id=" + lg.id + "&r=" + r + "&s=" + encodeURIComponent(s))
      .then((d) => {
        const seen = {}, all = [];
        const add = (e) => { if (e.id && !seen[e.id]) { seen[e.id] = 1; all.push(e); } };
        (d && d.events ? d.events : []).map(normEvent).forEach(add);
        extras.forEach(add);
        all.sort((a, b) => (a.ts || "").localeCompare(b.ts || ""));
        return { league: lg, events: all };
      })
      .catch(() => ({ league: lg, events: extras }));
  }
  function loadFixturesDirect() {
    const jobs = LEAGUES.map((lg) =>
      apiGet("eventsnextleague.php?id=" + lg.id)
        .then((d) => {
          const next = (d && d.events ? d.events : []).map(normEvent);
          if (next.length) return fullRound(lg, next[0], next);
          return { league: lg, events: [] };
        })
        .catch(() => ({ league: lg, events: [], failed: true }))
    );
    Promise.all(jobs).then(finish);
  }
  /* TheSportsDB timestamps are UTC but carry no zone suffix; parse as UTC. */
  function parseTs(ts) {
    if (!ts) return null;
    let s = String(ts).replace(" ", "T");
    if (!/[zZ]$|[+\-]\d{2}:?\d{2}$/.test(s)) s += "Z";
    const d = new Date(s);
    return isNaN(d) ? null : d;
  }
  function fmtWhen(ts) {
    const d = parseTs(ts);
    if (!d) return "";
    try {
      return new Intl.DateTimeFormat(S.lang === "ar" ? "ar-EG" : undefined,
        { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(d);
    } catch (e) { return d.toLocaleString(); }
  }

  function badgeImg(url, team) {
    const img = document.createElement("img");
    img.className = "crest-img";
    img.alt = "";
    img.loading = "lazy";
    if (url) img.src = url + "/tiny";
    img.onerror = () => { img.style.display = "none"; };
    img.title = team;
    return img;
  }

  function soonWindow() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start.getTime() + 2 * 86400000);
    return [start, end];
  }
  function renderFixtures() {
    const box = els.fixtures;
    if (!box) return;
    box.innerHTML = "";
    if (fixturesState.status === "loading" || fixturesState.status === "idle") {
      const p = document.createElement("p");
      p.className = "note";
      p.textContent = t("loadingFixtures");
      box.appendChild(p);
      return;
    }
    if (fixturesState.status === "error") {
      const p = document.createElement("p");
      p.className = "note";
      p.textContent = t("fixturesFail");
      const hint = document.createElement("p");
      hint.className = "note";
      hint.textContent = t("previewHint");
      const b = document.createElement("button");
      b.className = "btn";
      b.textContent = t("retry");
      b.addEventListener("click", loadFixtures);
      box.append(p, hint, b);
      return;
    }
    const [start, end] = soonWindow();
    fixturesState.groups.forEach((g) => {
      const soon = g.events.filter((ev) => {
        const d = parseTs(ev.ts);
        return d && d >= start && d < end;
      });
      const det = document.createElement("details");
      det.className = "league";
      const sum = document.createElement("summary");
      const lb = g.events.find((e) => e.lb);
      if (lb) {
        const img = document.createElement("img");
        img.className = "league-crest";
        img.alt = "";
        img.loading = "lazy";
        img.src = lb.lb + "/tiny";
        img.onerror = () => { img.style.display = "none"; };
        sum.appendChild(img);
      }
      const nm = document.createElement("span");
      nm.className = "league-name";
      nm.textContent = S.lang === "ar" ? g.league.ar : g.league.en;
      const ct = document.createElement("span");
      ct.className = "league-count";
      ct.textContent = soon.length + " " + (soon.length === 1 ? t("games1") : t("games"));
      sum.append(nm, ct);
      det.appendChild(sum);

      if (g.failed) {
        const p = document.createElement("p");
        p.className = "note inset";
        p.textContent = t("leagueFail");
        const rb = document.createElement("button");
        rb.className = "btn inset-btn";
        rb.textContent = t("retry");
        rb.addEventListener("click", () => { try { localStorage.removeItem("me_api___all__"); } catch (e) {} loadFixtures(); });
        det.append(p, rb);
      } else if (!soon.length) {
        const p = document.createElement("p");
        p.className = "note inset";
        const next = g.events.find((ev) => {
          const d = parseTs(ev.ts);
          return d && d >= end;
        });
        p.textContent = t("noGamesSoon") + (next ? " " + t("nextOn") + " " + fmtWhen(next.ts) : "");
        det.appendChild(p);
      } else {
        soon.forEach((ev) => det.appendChild(fixtureRow(ev, g.league)));
      }
      box.appendChild(det);
    });
  }
  function fixtureRow(ev, league) {
    const row = document.createElement("button");
    row.className = "fixture-row";
    row.setAttribute("aria-label",
      `${ev.home} ${ev.hs !== null ? ev.hs + " " + ev.as : ""} ${ev.away}`);
    const crests = document.createElement("span");
    crests.className = "crests";
    crests.append(badgeImg(ev.hb, ev.home), badgeImg(ev.ab, ev.away));
    const mid = document.createElement("span");
    mid.className = "fx-mid";
    const names = document.createElement("span");
    names.className = "fx-names";
    names.textContent = ev.home + " – " + ev.away;
    const when = document.createElement("span");
    when.className = "sub";
    when.textContent = fmtWhen(ev.ts);
    mid.append(names, when);
    const right = document.createElement("span");
    right.className = "fx-score";
    if (isLiveStatus(ev.status) || (ev.hs !== null && !isFinished(ev.status))) {
      const pill = document.createElement("span");
      pill.className = "live-pill-sm";
      const lc = liveClockLabel(ev, fixturesState.at);
      pill.textContent = "● " + (lc ? lc.split(":")[0] + "'" : t("live"));
      right.appendChild(pill);
      if (ev.hs !== null) right.append(" " + ev.hs + "–" + ev.as);
    } else if (ev.hs !== null) {
      right.textContent = ev.hs + "–" + ev.as;
      if (isFinished(ev.status)) right.classList.add("ft");
    } else {
      const d = parseTs(ev.ts);
      right.textContent = d ? new Intl.DateTimeFormat(S.lang === "ar" ? "ar-EG" : undefined,
        { hour: "numeric", minute: "2-digit" }).format(d) : "–";
      right.classList.add("ko");
    }
    row.append(crests, mid, right);
    row.addEventListener("click", () => openReal(ev, league));
    return row;
  }

  /* ---------------- real match view (Live tab) ---------------- */
  function realLine(ev) {
    const score = ev.hs !== null ? `${ev.home} ${ev.hs}, ${ev.away} ${ev.as}` : null;
    const scoreAr = ev.hs !== null ? `${ev.home} ${ev.hs}، ${ev.away} ${ev.as}` : null;
    if (isFinished(ev.status)) return (S.lang === "ar" ? `${t("ft")}. ${scoreAr}.` : `${t("ft")}. ${score}.`);
    if (ev.hs !== null) return (S.lang === "ar" ? `${t("liveNow")}. ${scoreAr}.` : `${t("liveNow")}. ${score}.`);
    const when = fmtWhen(ev.ts);
    return S.lang === "ar"
      ? `${ev.home} ضد ${ev.away}. ${t("scoreYet")} ${when}.`
      : `${ev.home} against ${ev.away}. ${t("scoreYet")} ${when}.`;
  }

  function renderReal() {
    const ev = R.ev;
    if (!ev) return;
    els.liveEmpty.hidden = true;
    els.liveWrap.hidden = false;
    els.homeName.textContent = ev.home;
    els.awayName.textContent = ev.away;
    els.homeBadge.src = ev.hb ? ev.hb + "/small" : "";
    els.awayBadge.src = ev.ab ? ev.ab + "/small" : "";
    els.homeBadge.style.display = ev.hb ? "" : "none";
    els.awayBadge.style.display = ev.ab ? "" : "none";
    els.rScore.textContent = ev.hs !== null ? ev.hs + "–" + ev.as : "–";
    const lc = isLiveStatus(ev.status) || (ev.hs !== null && !isFinished(ev.status))
      ? liveClockLabel(ev, R.syncAt) : null;
    els.rClock.textContent = isFinished(ev.status) ? "FT"
      : lc ? lc
      : ev.hs !== null && !isNotStarted(ev.status) ? (ev.status || t("liveNow"))
      : fmtWhen(ev.ts);
    const league = S.lang === "ar" ? R.league.ar : R.league.en;
    els.matchMeta.textContent = league + (ev.venue ? " · " + ev.venue : "") + (ev.round ? " · R" + ev.round : "");
  }

  function kickoffMs(ev) {
    const d = parseTs(ev.ts);
    return d ? d.getTime() : null;
  }
  const isLiveStatus = (st) => !!st && !isFinished(st) && !isNotStarted(st) && !/postponed|cancel|abandon/i.test(st);
  /* The free feed has no running clock, so build one: a numeric status is
     the minute at sync time; "1H"/"2H" count from kickoff (minus the
     half-time break in the second half); "HT" holds. */
  function liveClockLabel(ev, syncAt) {
    const st = (ev.status || "").toUpperCase();
    if (/^HT$|HALF ?TIME/.test(st)) return "HT";
    const now = Date.now();
    let baseSec = null;
    if (/^\d{1,3}$/.test(st)) {
      baseSec = parseInt(st, 10) * 60 + Math.max(0, Math.floor((now - (syncAt || now)) / 1000));
    } else {
      const ko = kickoffMs(ev);
      if (!ko || now < ko) return null;
      let el = Math.floor((now - ko) / 1000);
      if (/^2H|SECOND/.test(st)) el -= 15 * 60;
      baseSec = Math.max(60, el);
    }
    if (baseSec > 125 * 60) return null; // stale status; don't fake a clock
    const m = Math.floor(baseSec / 60), s = baseSec % 60;
    return m + ":" + String(s).padStart(2, "0");
  }
  function syncRemindBtn() {
    const ev = R.ev;
    const ko = ev ? kickoffMs(ev) : null;
    const show = ev && ev.hs === null && isNotStarted(ev.status) && ko && ko > Date.now();
    els.remindBtn.hidden = !show;
    if (!show) return;
    const on = !!REM[ev.id];
    els.remindBtn.textContent = (on ? "🔔 " : "🔕 ") + t(on ? "remindOn" : "remindOff");
    els.remindBtn.setAttribute("aria-pressed", String(on));
    els.remindBtn.classList.toggle("armed", on);
  }
  function tlKey(it) { return it.type + "|" + it.player + "|" + it.min; }
  function normTl(x) {
    return {
      type: (x.strTimeline || "").toLowerCase(),
      detail: x.strTimelineDetail || "",
      player: x.strPlayer || "",
      assist: x.strAssist || "",
      team: x.strTeam || "",
      min: Number(x.intTime || 0),
    };
  }
  function tlText(it) {
    const d = it.detail.toLowerCase();
    if (it.type === "goal") {
      const kind = /own/.test(d) ? t("tlOwnGoal") : /penalt/.test(d) && /miss/.test(d) ? t("tlMissedPen") : /penalt/.test(d) ? t("tlPen") : null;
      const head = kind || (S.lang === "ar" ? t("tlGoal") + " " + it.team : t("tlGoal") + " " + it.team);
      return head + (S.lang === "ar" ? "! " : "! ") + it.player;
    }
    if (it.type === "card") return (/red/.test(d) ? t("tlRed") : t("tlYellow")) + " — " + it.team + " (" + it.player + ")";
    if (/sub/.test(it.type)) return t("tlSub") + " — " + it.team + (it.player ? " (" + it.player + ")" : "");
    return (it.detail || it.type) + (it.player ? " — " + it.player : "");
  }
  /* The match strip: a 0-90'+ bar, filled to the live minute, with event
     markers where they happened. Home events sit above the line, away below. */
  function renderStrip(el, events, liveMin, over) {
    if (!el) return;
    el.innerHTML = "";
    const span = Math.max(90, liveMin || 0, ...events.map((e) => e.min || 0));
    const fill = document.createElement("i");
    fill.className = "strip-fill";
    fill.style.insetInlineStart = "0";
    fill.style.width = (over ? 100 : Math.min(100, ((liveMin || 0) / span) * 100)) + "%";
    el.appendChild(fill);
    [45, 90].forEach((m) => {
      if (m < span) {
        const tick = document.createElement("i");
        tick.className = "strip-tick";
        tick.style.insetInlineStart = (m / span) * 100 + "%";
        el.appendChild(tick);
      }
    });
    events.forEach((e) => {
      const dot = document.createElement("b");
      dot.className = "strip-dot " + (e.kind || "sub") + (e.side === "a" ? " away" : " home");
      dot.style.insetInlineStart = Math.min(99, ((e.min || 0) / span) * 100) + "%";
      dot.title = (e.min || 0) + "' " + (e.label || "");
      el.appendChild(dot);
    });
  }
  function stripEventsFromTL(ev) {
    return TL.items.map((it) => ({
      min: it.min,
      side: it.team === ev.home ? "h" : "a",
      kind: it.type === "goal" ? "goal" : it.type === "card" ? (/red/i.test(it.detail) ? "red" : "card") : "sub",
      label: tlText(it),
    }));
  }
  function renderRealFeed() {
    els.rFeed.innerHTML = "";
    const items = TL.items.slice().sort((a, b) => b.min - a.min);
    items.forEach((it) => {
      const li = document.createElement("li");
      if (it.type === "goal") li.className = "goal";
      const min = document.createElement("span");
      min.className = "min";
      min.textContent = it.min + "'";
      const txt = document.createElement("span");
      txt.textContent = tlText(it);
      li.append(min, txt);
      els.rFeed.appendChild(li);
    });
    els.rFeedWrap.hidden = items.length === 0;
  }
  function fetchTimeline(announceNew) {
    return apiGet("lookuptimeline.php?id=" + R.ev.id)
      .then((d) => {
        const items = (d && d.timeline ? d.timeline : []).map(normTl);
        const fresh = [];
        items.forEach((it) => {
          const k = tlKey(it);
          if (!TL.seen[k]) { TL.seen[k] = 1; fresh.push(it); }
        });
        TL.items = items;
        renderRealFeed();
        renderStrip(els.rStrip, stripEventsFromTL(R.ev),
          parseInt((liveClockLabel(R.ev, R.syncAt) || "0").split(":")[0], 10) || (isFinished(R.ev.status) ? 90 : 0),
          isFinished(R.ev.status));
        if (!announceNew || screen !== "live") return false;
        let announcedGoal = false;
        fresh.forEach((it) => {
          const line = it.min + ". " + tlText(it) + ".";
          if (it.type === "goal") {
            announcedGoal = true;
            showTakeover({
              word: t("goalWord"),
              detail: it.player + " · " + it.min + "'",
              score: R.ev.hs !== null ? R.ev.home + " " + R.ev.hs + "–" + R.ev.as + " " + R.ev.away : "",
              against: false, pattern: PATTERN.goalFor,
            });
            say(tlText(it) + ", " + it.min + (S.lang === "ar" ? "." : "th minute."));
          } else if (S.verbosity === "all") {
            buzz(/red/.test(it.detail.toLowerCase()) ? PATTERN.goalAgainst : /card/.test(it.type) ? PATTERN.card : PATTERN.sub);
            say(line);
          }
        });
        return announcedGoal;
      })
      .catch(() => false);
  }
  function statsTotals(rows) {
    const g = { shotsH: 0, shotsA: 0, xgH: null, xgA: null };
    rows.forEach((r) => {
      const n = (r.strStat || "").toLowerCase();
      if (/shots (inside|outside)box/.test(n)) { g.shotsH += Number(r.intHome) || 0; g.shotsA += Number(r.intAway) || 0; }
      if (/expected_goals/.test(n)) { g.xgH = r.intHome; g.xgA = r.intAway; }
    });
    return g;
  }
  function matchPulse(liveMin) {
    if (!liveMin || liveMin - PULSE.lastMin < 10) return;
    apiGet("lookupeventstats.php?id=" + R.ev.id)
      .then((d) => {
        const rows = (d && (d.eventstats || d.stats)) || [];
        if (!rows.length) return;
        const now = statsTotals(rows);
        const prev = PULSE.prev || { shotsH: 0, shotsA: 0 };
        PULSE.prev = now;
        PULSE.lastMin = liveMin;
        if (screen !== "live" || S.verbosity !== "all") return;
        const dH = now.shotsH - prev.shotsH, dA = now.shotsA - prev.shotsA;
        const press = dH - dA >= 2 ? R.ev.home + " " + t("pulsePressH")
          : dA - dH >= 2 ? R.ev.away + " " + t("pulsePressA")
          : t("pulseEven");
        const line = S.lang === "ar"
          ? "الدقيقة " + liveMin + ". " + R.ev.home + " " + R.ev.hs + "، " + R.ev.away + " " + R.ev.as +
            ". التسديدات " + now.shotsH + " لـ " + now.shotsA + ". " + press + "."
          : liveMin + " minutes gone. " + R.ev.home + " " + R.ev.hs + ", " + R.ev.away + " " + R.ev.as +
            ". Shots " + now.shotsH + " to " + now.shotsA + ". " + press + ".";
        say(line);
      })
      .catch(() => {});
  }
  function openReal(ev, league) {
    R.ev = ev; R.league = league;
    R.syncAt = Date.now();
    S.mode = "real";
    TL.items = []; TL.seen = {};
    PULSE.prev = null;
    PULSE.lastMin = parseInt((liveClockLabel(ev, Date.now()) || "0").split(":")[0], 10) || 0;
    renderReal();
    renderRealFeed();
    syncRemindBtn();
    go("live");
    say(realLine(ev));
    fetchTimeline(false); // show what already happened, quietly
    clearInterval(R.timer);
    if (!isFinished(ev.status)) R.timer = setInterval(pollReal, 60000);
  }

  function pollReal() {
    if (!R.ev) { clearInterval(R.timer); return; }
    apiGet("lookupevent.php?id=" + R.ev.id)
      .then((d) => {
        const fresh = d && d.events && d.events[0] ? normEvent(d.events[0]) : null;
        if (!fresh) return;
        const scored = fresh.hs !== null && R.ev.hs !== null && (fresh.hs + fresh.as > R.ev.hs + R.ev.as);
        const started = fresh.hs !== null && R.ev.hs === null;
        R.ev = fresh;
        R.syncAt = Date.now();
        renderReal();
        syncRemindBtn();
        const live = isLiveStatus(fresh.status) || (fresh.hs !== null && !isFinished(fresh.status));
        const tlP = (live || scored || isFinished(fresh.status)) ? fetchTimeline(true) : Promise.resolve(false);
        Promise.resolve(tlP).then((toldGoal) => {
          if (screen !== "live") return; // only speak while the Live screen is open
          if (scored && !toldGoal) {
            showTakeover({
              word: t("goalWord"),
              detail: fresh.home + " " + fresh.hs + "–" + fresh.as + " " + fresh.away,
              score: "",
              against: false, pattern: PATTERN.goalFor,
            });
            say(t("updated") + " " + realLine(fresh));
          } else if (started || isFinished(fresh.status)) {
            say(realLine(fresh));
          }
        });
        if (live) {
          const lm = parseInt((liveClockLabel(fresh, R.syncAt) || "0").split(":")[0], 10) || 0;
          matchPulse(lm);
        }
        if (isFinished(fresh.status)) clearInterval(R.timer);
      })
      .catch(() => {});
  }

  /* ---------------- answers ---------------- */
  function answer(line) {
    els.answer.hidden = false;
    els.answer.textContent = line;
    say(line);
  }
  const A = {
    who() {
      if (S.mode === "real") {
        if (!R.ev) { answer(t("liveEmptyBody")); return; }
        const goals = TL.items.filter((i) => i.type === "goal");
        if (!goals.length) { answer(t("noDetail")); return; }
        answer(goals.map((g) => g.player + " (" + g.team + ", " + g.min + "')").join(S.lang === "ar" ? "، " : ", ") + ".");
        return;
      }
      if (S.lang === "ar") {
        const parts = M.scorers.map((s) => ({ Trezeguet: "تريزيجيه", Zizo: "زيزو" }[s.name] || s.name) + " الدقيقة " + s.min);
        answer("أهداف الأهلي: " + parts.join("، ") + (M.score[1] ? ". وجول للزمالك، شيكابالا الدقيقة 78." : "."));
      } else {
        const parts = M.scorers.map((s) => s.name + " " + s.min + "'");
        answer("Al Ahly goals: " + parts.join(", ") + (M.score[1] ? ". Zamalek's goal: Shikabala 78'." : "."));
      }
    },
    score() {
      if (S.mode === "real") { answer(R.ev ? realLine(R.ev) : t("liveEmptyBody")); return; }
      answer(S.lang === "ar" ? `الأهلي ${M.score[0]}، الزمالك ${M.score[1]}.` : `Al Ahly ${M.score[0]}, Zamalek ${M.score[1]}.`);
    },
    time() {
      if (S.mode === "real") { answer(R.ev ? realLine(R.ev) : t("liveEmptyBody")); return; }
      if (M.over) { answer(S.lang === "ar" ? "الماتش خلص." : "The match is over."); return; }
      const rem = Math.max(0, 90 - Math.floor(M.sec / 60));
      answer(S.lang === "ar" ? `فاضل حوالي ${rem} دقيقة مع الوقت بدل الضائع.` : `About ${rem} minutes left, plus stoppage time.`);
    },
    cards() {
      if (S.mode === "real") {
        if (!R.ev) { answer(t("liveEmptyBody")); return; }
        const cards = TL.items.filter((i) => i.type === "card");
        if (!cards.length) { answer(t("noDetail")); return; }
        answer(cards.map((c) => tlText(c) + " " + c.min + "'").join(S.lang === "ar" ? "، " : ", ") + ".");
        return;
      }
      if (S.lang === "ar") {
        const parts = M.cards.map((c) => (c.team === "ahly" ? "الأهلي" : "الزمالك") + " — " + ({ "El Shahat": "الشحات", Ashour: "عاشور" }[c.player] || c.player) + " الدقيقة " + c.min);
        answer("كروت صفرا: " + parts.join("، ") + ".");
      } else {
        const parts = M.cards.map((c) => (c.team === "ahly" ? "Al Ahly" : "Zamalek") + " — " + c.player + " " + c.min + "'");
        answer("Yellow cards: " + parts.join(", ") + ".");
      }
    },
    stats() {
      if (S.mode !== "real" || !R.ev) {
        answer(S.lang === "ar" ? "في الماتش التجريبي: تسديدات 7–2، استحواذ 61% للأهلي." : "In the demo match: shots 7–2, possession 61% to Al Ahly.");
        return;
      }
      apiGet("lookupeventstats.php?id=" + R.ev.id)
        .then((d) => {
          const rows = (d && (d.eventstats || d.stats)) || [];
          if (!rows.length) { answer(t("statsFail")); return; }
          const pick = {};
          rows.forEach((r) => { pick[(r.strStat || "").toLowerCase()] = r.intHome + "–" + r.intAway; });
          const parts = [];
          Object.keys(pick).forEach((k) => {
            if (parts.length < 4) parts.push(k.replace(/_/g, " ") + " " + pick[k]);
          });
          answer((S.lang === "ar" ? "إحصائيات: " : "Stats: ") + parts.join(S.lang === "ar" ? "، " : ", ") + ".");
        })
        .catch(() => answer(t("statsFail")));
    },
  };
  document.querySelectorAll(".q").forEach((b) => b.addEventListener("click", () => A[b.dataset.q]()));

  /* ---------------- voice input ---------------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null;
  function matchQuestion(text) {
    const q = text.toLowerCase();
    if (/who|scor|جاب|سجل|مين/.test(q)) return A.who();
    if (/score|result|نتيج|كام/.test(q)) return A.score();
    if (/time|left|long|وقت|فاضل|باقي/.test(q)) return A.time();
    if (/card|yellow|red|كرت|كروت|كارت/.test(q)) return A.cards();
    if (/stat|possession|shot|احصائ|إحصائ|استحواذ|تسديد/.test(q)) return A.stats();
    answer(t("noAnswer"));
  }
  if (SR) {
    rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => { matchQuestion(e.results[0][0].transcript || ""); };
    rec.onend = () => {
      els.askVoiceBtn.classList.remove("listening");
      els.askState.textContent = t("askReady");
    };
    rec.onerror = rec.onend;
  }
  function startListen() {
    if (!rec) { els.askState.textContent = t("askNoMic"); return; }
    try { speechSynthesis.cancel(); } catch (e) {}
    rec.lang = S.lang === "ar" ? "ar-EG" : "en-US";
    try { rec.start(); } catch (e) { return; }
    els.askVoiceBtn.classList.add("listening");
    els.askState.textContent = t("askListening");
  }
  function stopListen() { if (rec) { try { rec.stop(); } catch (e) {} } }
  els.askVoiceBtn.addEventListener("pointerdown", startListen);
  els.askVoiceBtn.addEventListener("pointerup", stopListen);
  els.askVoiceBtn.addEventListener("pointerleave", stopListen);
  els.askVoiceBtn.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); startListen(); } });
  els.askVoiceBtn.addEventListener("keyup", (e) => { if (e.key === "Enter" || e.key === " ") stopListen(); });

  /* ---------------- replay ---------------- */
  els.replayBtn.addEventListener("click", () => {
    const lines = [t("replayIntro"), ...M.log, t("replayDone")];
    els.announcer.textContent = lines.join(" ");
    if (S.muted || !("speechSynthesis" in window)) return;
    try {
      speechSynthesis.cancel();
      lines.forEach((line) => {
        const u = new SpeechSynthesisUtterance(line);
        u.lang = S.lang === "ar" ? "ar-EG" : "en-US";
        u.rate = S.rate;
        const v = speechSynthesis.getVoices().find((x) => x.lang && x.lang.toLowerCase().startsWith(S.lang === "ar" ? "ar" : "en"));
        if (v) u.voice = v;
        speechSynthesis.speak(u);
      });
    } catch (e) {}
  });

  /* ---------------- navigation ---------------- */
  function go(name) {
    screen = name;
    document.querySelectorAll(".screen").forEach((s) => (s.hidden = true));
    $("screen-" + name).hidden = false;
    document.querySelectorAll(".tab").forEach((tb) =>
      tb.setAttribute("aria-selected", String(tb.dataset.screen === name)));
    if (name === "demo") {
      S.mode = "trial";
    } else if (name === "live" && R.ev) {
      S.mode = "real";
    }
    if (name === "home" || name === "settings") els.announcer.textContent = "";
  }
  document.querySelectorAll(".tab").forEach((tb) =>
    tb.addEventListener("click", () => {
      try { speechSynthesis.cancel(); } catch (e) {}
      go(tb.dataset.screen);
      if (tb.dataset.screen === "demo" && !M.over) say(t("openedDemo"));
    }));
  els.goHomeBtn.addEventListener("click", () => go("home"));

  /* ---------------- kickoff reminder ---------------- */
  els.remindBtn.addEventListener("click", () => {
    const ev = R.ev;
    if (!ev) return;
    if (REM[ev.id]) {
      delete REM[ev.id];
      saveRem(); syncRemindBtn();
      say(t("remindCleared"));
    } else {
      REM[ev.id] = { ts: kickoffMs(ev), home: ev.home, away: ev.away, fired: false };
      saveRem(); syncRemindBtn();
      say(t("remindSet"));
    }
  });
  /* tick the real match clock once a second while it is on screen */
  setInterval(() => {
    if (!R.ev || screen !== "live") return;
    if (!(isLiveStatus(R.ev.status) || (R.ev.hs !== null && !isFinished(R.ev.status)))) return;
    const lc = liveClockLabel(R.ev, R.syncAt);
    if (lc) els.rClock.textContent = lc;
  }, 1000);

  setInterval(() => {
    if (!S.started) return;
    const now = Date.now();
    Object.keys(REM).forEach((id) => {
      const r = REM[id];
      if (!r || !r.ts) { delete REM[id]; return; }
      if (now > r.ts + 3600000) { delete REM[id]; saveRem(); return; } // stale, clean up
      if (!r.fired && now >= r.ts - 15 * 60000 && now <= r.ts + 60000) {
        r.fired = true; saveRem();
        showTakeover({
          word: t("reminderWord"),
          detail: r.home + " – " + r.away,
          score: t("reminderIn"),
          against: true, pattern: [300, 150, 300],
        });
        say((S.lang === "ar"
          ? "فاكرك: " + r.home + " ضد " + r.away + " هيبدأ بعد ربع ساعة."
          : "Reminder: " + r.home + " against " + r.away + " kicks off in 15 minutes."));
      }
    });
  }, 10000);

  /* ---------------- shared controls ---------------- */
  [els.rRepeat, els.dRepeat].forEach((b) =>
    b.addEventListener("click", () => { if (S.lastLine) say(S.lastLine); }));
  muteBtns().forEach((b) =>
    b.addEventListener("click", () => {
      S.muted = !S.muted;
      syncMute();
      if (S.muted) { try { speechSynthesis.cancel(); } catch (e) {} }
    }));

  /* ---------------- settings ---------------- */
  els.langBtn.addEventListener("click", () => {
    S.lang = S.lang === "en" ? "ar" : "en";
    store.set("lang", S.lang);
    applyLang();
    say(t("langSet"));
  });
  els.speedBtn.addEventListener("click", () => {
    S.rate = S.rate < 1 ? 1.0 : S.rate === 1.0 ? 1.3 : 0.75;
    store.set("rate", S.rate);
    syncSettingLabels();
    say(els.speedBtn.textContent);
  });
  els.verbosityBtn.addEventListener("click", () => {
    S.verbosity = S.verbosity === "all" ? "goals" : "all";
    store.set("verbosity", S.verbosity);
    syncSettingLabels();
  });
  els.hapticsBtn.addEventListener("click", () => {
    S.haptics = !S.haptics;
    store.set("haptics", S.haptics);
    syncSettingLabels();
    if (S.haptics) buzz(PATTERN.sub);
  });
  els.contrastBtn.addEventListener("click", () => {
    S.contrast = !S.contrast;
    store.set("contrast", S.contrast);
    syncSettingLabels();
  });
  els.textBtn.addEventListener("click", () => {
    S.textSize = (S.textSize + 1) % 3;
    store.set("textSize", S.textSize);
    syncSettingLabels();
  });
  els.dataBtn.addEventListener("click", () => {
    S.dataSaver = !S.dataSaver;
    store.set("dataSaver", S.dataSaver);
    syncSettingLabels();
  });

  /* ---------------- splash ---------------- */
  document.querySelectorAll(".lang").forEach((b) =>
    b.addEventListener("click", () => {
      S.lang = b.dataset.lang;
      store.set("lang", S.lang);
      applyLang();
    }));
  els.startBtn.addEventListener("click", () => {
    S.started = true;
    els.splash.hidden = true;
    els.app.hidden = false;
    els.liveDot.hidden = false;
    try { speechSynthesis.getVoices(); } catch (e) {}
    setTimeout(() => say(t("welcome")), 300);
    loadFixtures();
  });

  /* ---------------- boot ---------------- */
  if ("speechSynthesis" in window) {
    try { speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices(); } catch (e) {}
  }
  applyLang();
})();
