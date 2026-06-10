const Game = (() => {
  // Ball positions as % of field width
  // Lands just ahead of each station so ball stays visible next to the player
  const BALL_POSITIONS    = [10, 32, 49, 65, 81, 93];
  const STATION_POSITIONS = [27, 44, 61, 78];

  let state = {
    teamName: "",
    currentModule: 0,
    currentQuestion: 0,
    score: 0,
    startTime: null,
    moduleScores: [],
    questionResults: [],
    data: null
  };

  const $ = (id) => document.getElementById(id);
  const screens = {
    welcome: $("screen-welcome"),
    field:   $("screen-field"),
    victory: $("screen-victory")
  };
  const modals = {
    quiz:        $("quiz-modal"),
    complete:    $("complete-modal"),
    arcade:      $("arcade-modal"),
    leaderboard: $("leaderboard-modal"),
    pause:       $("pause-modal")
  };

  // ─── Per-question countdown timer ────────────────────────────
  const TIMER_CIRCUMFERENCE = 2 * Math.PI * 16; // matches the SVG ring's r=16
  const questionTimer = {
    interval: null, limit: 0, remaining: 0,
    moduleIndex: 0, qIndex: 0, active: false
  };

  // ─── Arcade Mini-Game state & config ─────────────────────────
  // After each module quiz the player enters a 25-second side-scrolling
  // soccer shooter. A player on the left fires soccer balls at incoming
  // targets. The arcade score determines a multiplier (1.0x–3.0x) that
  // is applied to the module's quiz points.
  const arcade = {
    canvas: null, ctx: null, width: 0, height: 0,
    phase: 'idle',  // idle | ready | playing | ended
    raf: null, lastTime: 0,
    player: { x: 0, y: 0, targetY: 0, hp: 5, maxHp: 5, fireCooldown: 0, recoil: 0 },
    score: 0, timeLeft: 25, totalShots: 0, totalHits: 0,
    spawnTimer: 0, difficulty: 1,
    balls: [], targets: [], particles: [],
    wantFire: false, touchActive: false,
    keysDown: { up: false, down: false },
    shake: { x: 0, y: 0, timer: 0, intensity: 0 },
    damageFlash: 0,
    quizScore: 0, moduleColor: '#0066B3',
    bgCanvas: null
  };

  const TARGET_DEFS = {
    keeper:  { emoji: '🧤', w: 40, h: 40, hp: 1, pts: 10,  speed: [140, 200], weight: 20 },
    goal:    { emoji: '🥅', w: 50, h: 46, hp: 2, pts: 20,  speed: [90, 140],  weight: 12 },
    cone:    { emoji: '🔶', w: 26, h: 26, hp: 1, pts: 15,  speed: [220, 310], weight: 15 },
    boot:    { emoji: '⭐', w: 34, h: 34, hp: 1, pts: 50,  speed: [160, 210], weight: 4  },
    redcard: { emoji: '🟥', w: 30, h: 38, hp: 1, pts: -20, speed: [120, 180], weight: 10 },
    pac004:  { label: 'PAC.004', w: 54, h: 26, hp: 1, pts: 15, speed: [160, 240], weight: 10, color: '#4ad57f' },
    pac008:  { label: 'PAC.008', w: 54, h: 26, hp: 1, pts: 15, speed: [160, 240], weight: 10, color: '#5bc0de' },
    swift:   { label: 'SWIFT',   w: 48, h: 26, hp: 2, pts: 25, speed: [110, 170], weight: 7,  color: '#FFB900' },
    sepa:    { label: 'SEPA',    w: 42, h: 26, hp: 1, pts: 20, speed: [140, 210], weight: 7,  color: '#a78bfa' },
    iso:     { label: 'ISO20022',w: 62, h: 26, hp: 3, pts: 40, speed: [80, 130],  weight: 3,  color: '#f472b6' },
    chaps:   { label: 'CHAPS',   w: 48, h: 26, hp: 1, pts: 20, speed: [170, 250], weight: 7,  color: '#34d399' },
    fraud:   { label: 'FRAUD',   w: 48, h: 26, hp: 1, pts: -25,speed: [130, 190], weight: 5,  color: '#ef4444' }
  };

  const FIRE_COOLDOWN = 0.28;
  const BALL_SPEED    = 580;
  const BALL_RADIUS   = 10;
  const GAME_DURATION = 45;
  const MAX_MULT      = 3.0;

  // ─── Boot ────────────────────────────────────────────────────
  function init() {
    $("btn-start").addEventListener("click", startGame);
    $("btn-leaderboard").addEventListener("click", showLeaderboard);
    $("btn-close-leaderboard").addEventListener("click", () => modals.leaderboard.classList.add("hidden"));
    $("btn-continue").addEventListener("click", onModuleContinue);
    $("btn-arcade-start").addEventListener("click", startArcade);
    $("btn-arcade-continue").addEventListener("click", onArcadeContinue);
    $("btn-play-again").addEventListener("click", resetGame);
    $("btn-see-leaderboard").addEventListener("click", showLeaderboard);
    $("team-name").addEventListener("keypress", (e) => { if (e.key === "Enter") startGame(); });

    // Pause menu
    $("btn-pause").addEventListener("click", openPauseMenu);
    $("btn-resume").addEventListener("click", closePauseMenu);
    $("btn-pause-quit").addEventListener("click", showQuitConfirm);
    $("btn-cancel-quit").addEventListener("click", hideQuitConfirm);
    $("btn-confirm-quit").addEventListener("click", quitToMenu);

    // Arcade keyboard controls — only active while the shooter is live
    document.addEventListener("keydown", (e) => {
      if (arcade.phase !== 'playing') return;
      if (e.code === "ArrowUp"   || e.code === "KeyW") { arcade.keysDown.up = true;  e.preventDefault(); }
      if (e.code === "ArrowDown" || e.code === "KeyS") { arcade.keysDown.down = true; e.preventDefault(); }
      if (e.code === "Space")                          { arcade.wantFire = true; e.preventDefault(); }
    });
    document.addEventListener("keyup", (e) => {
      if (e.code === "ArrowUp"   || e.code === "KeyW") arcade.keysDown.up = false;
      if (e.code === "ArrowDown" || e.code === "KeyS") arcade.keysDown.down = false;
      if (e.code === "Space")                          arcade.wantFire = false;
    });

    // Esc toggles the pause menu while a game is in progress
    document.addEventListener("keydown", (e) => {
      if (e.code !== "Escape") return;
      if (!screens.field.classList.contains("active")) return;
      e.preventDefault();
      if (modals.pause.classList.contains("hidden")) openPauseMenu();
      else closePauseMenu();
    });
  }

  // ─── Start game ──────────────────────────────────────────────
  function startGame() {
    const input = $("team-name");
    const name = input.value.trim();
    if (!name) {
      input.classList.add("input-error");
      input.focus();
      setTimeout(() => input.classList.remove("input-error"), 800);
      return;
    }

    state = {
      teamName: name,
      currentModule: 0,
      currentQuestion: 0,
      score: 0,
      startTime: Date.now(),
      moduleScores: [],
      questionResults: [],
      data: DataManager.get()
    };

    $("display-team-name").textContent = name;
    $("display-score").textContent = "0";

    showScreen("field");
    renderField();

    // Place ball instantly at kickoff position
    const launcher = $("ball-launcher");
    launcher.style.transition = "none";
    launcher.style.left = `${BALL_POSITIONS[0]}%`;
    requestAnimationFrame(() => { launcher.style.transition = ""; });
  }

  // ─── Screen management ───────────────────────────────────────
  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove("active"));
    screens[name].classList.add("active");
  }

  // ─── Field rendering ─────────────────────────────────────────
  function renderField() {
    const container = $("stations-container");
    container.innerHTML = "";

    state.data.modules.forEach((mod, i) => {
      const status = stationStatus(i);
      const el = document.createElement("div");
      el.className = `station ${status}`;
      el.id = `station-${i}`;
      el.style.left = `${STATION_POSITIONS[i]}%`;

      const score = state.moduleScores[i];
      const checkmark = (status === "completed")
        ? `<div class="pf-complete-check">✓</div>` : "";
      const scoreBadge = (status === "completed" && score)
        ? `<div class="pf-score-badge">${score.correct}/${score.total}</div>` : "";

      el.innerHTML = `
        <div class="player-figure">
          ${status === "active" ? `<div class="pf-callout">⚽ PASS!</div>` : ""}
          ${scoreBadge}
          <div class="pf-head"></div>
          <div class="pf-jersey" style="background:linear-gradient(160deg,${mod.color}ee,${mod.color});">
            ${checkmark}
            <span class="pf-icon">${mod.icon}</span>
            <span class="pf-num">#${i + 1}</span>
          </div>
        </div>
        <div class="pf-shadow"></div>
        <div class="station-label">${mod.name}</div>
      `;

      if (status === "active") {
        el.querySelector(".pf-jersey").addEventListener("click", () => openQuiz(i));
        el.querySelector(".pf-jersey").setAttribute("role", "button");
        el.querySelector(".pf-jersey").setAttribute("title", `Click to start ${mod.name}`);
      }

      container.appendChild(el);
    });

    renderStatusBar();
  }

  function stationStatus(i) {
    if (i < state.currentModule) return "completed";
    if (i === state.currentModule) return "active";
    return "locked";
  }

  function renderStatusBar() {
    const bar = $("module-status");
    bar.innerHTML = "";
    state.data.modules.forEach((mod, i) => {
      const chip = document.createElement("div");
      chip.className = `module-chip ${stationStatus(i)}`;
      const score = state.moduleScores[i];
      chip.innerHTML = `<span>${mod.icon}</span><span>${mod.name}${score ? ` ${score.correct}/${score.total}` : ""}</span>`;
      bar.appendChild(chip);
    });
  }

  // ─── Ball arc pass animation ─────────────────────────────────
  // Strike-quality presets — the shot mini-game's result reshapes the whole
  // pass: a Perfect Strike rockets higher & faster with a blazing gold trail
  // and a shower of particles; a scuffed "off" shot stays low, slower, and
  // duller. This is the visible payoff of how well the player timed their shot.
  const STRIKE_FX = {
    perfect: { arcMul: 1.38, durMul: 0.84, particles: 20, trail: "rgba(255,210,40,0.95)",  spin: 1120 },
    good:    { arcMul: 1.0,  durMul: 1.0,  particles: 12, trail: "rgba(255,220,50,0.75)",  spin: 800  },
    ok:      { arcMul: 0.8,  durMul: 1.08, particles: 8,  trail: "rgba(225,225,225,0.6)",  spin: 620  },
    off:     { arcMul: 0.6,  durMul: 1.18, particles: 5,  trail: "rgba(255,110,110,0.55)", spin: 460  }
  };

  function passBall(fromPct, toPct, tier, onDone) {
    const launcher = $("ball-launcher");
    const ball     = $("soccer-ball");
    const distance = Math.abs(toPct - fromPct);
    const fx       = STRIKE_FX[tier] || STRIKE_FX.good;
    const arcH     = Math.max(55, distance * 2.0) * fx.arcMul;
    const duration = (1100 + distance * 8) * fx.durMul; // slightly longer for bigger passes
    const spin     = fx.spin;

    // Kick particles at departure point — more & brighter for a better strike
    spawnKickParticles(fromPct, fx.particles);

    // Draw SVG trail, coloured by strike quality
    drawPassTrail(fromPct, toPct, fx.trail);

    // Horizontal movement of launcher
    launcher.animate(
      [{ left: `${fromPct}%` }, { left: `${toPct}%` }],
      { duration, easing: "cubic-bezier(0.3, 0.0, 0.7, 1.0)", fill: "forwards" }
    ).onfinish = () => {
      launcher.style.left = `${toPct}%`;
    };

    // Arc + spin + scale (ball appears to lift off the ground).
    // Rotation total scales with strike quality — a Perfect Strike whips
    // the ball through 1100°+ of spin; a scuffed shot barely turns over.
    const ballAnim = ball.animate([
      { transform: "translateY(0)      rotate(0deg)   scale(1)",    filter: "drop-shadow(0 5px 12px rgba(0,0,0,.6))" },
      { transform: `translateY(-${arcH * 0.6}px) rotate(${spin * 0.34}deg)  scale(1.2)`,  filter: "drop-shadow(0 20px 24px rgba(0,0,0,.35))", offset: 0.3 },
      { transform: `translateY(-${arcH}px)        rotate(${spin * 0.675}deg)  scale(1.35)`, filter: "drop-shadow(0 30px 32px rgba(0,0,0,.2))",  offset: 0.5 },
      { transform: `translateY(-${arcH * 0.5}px) rotate(${spin * 0.85}deg)  scale(1.2)`,  filter: "drop-shadow(0 15px 20px rgba(0,0,0,.35))", offset: 0.72 },
      { transform: "translateY(0)      rotate(" + spin + "deg) scale(1)",    filter: "drop-shadow(0 5px 12px rgba(0,0,0,.6))" }
    ], { duration, easing: "ease-in-out", fill: "forwards" });

    ballAnim.onfinish = () => {
      // Reset transform so it doesn't persist weirdly
      ball.style.transform = "";
      // Landing effects — a Perfect Strike gets an extra celebratory burst
      spawnLandingRipple(toPct);
      ballLandBounce(ball);
      if (tier === "perfect") spawnKickParticles(toPct, 16);
      if (onDone) onDone();
    };
  }

  function ballLandBounce(ball) {
    ball.animate([
      { transform: "scale(1.15) translateY(0)" },
      { transform: "scale(0.9)  translateY(4px)" },
      { transform: "scale(1.05) translateY(0)" },
      { transform: "scale(1)    translateY(0)" }
    ], { duration: 400, easing: "ease-out" });
  }

  // ─── SVG pass trail ──────────────────────────────────────────
  function drawPassTrail(fromPct, toPct, color) {
    color = color || "rgba(255,220,50,0.75)";
    const svg   = $("field-svg-overlay");
    const field = $("soccer-field");
    const w = field.offsetWidth;
    const h = field.offsetHeight;

    const x1 = (fromPct / 100) * w;
    const y1 = h / 2;
    const x2 = (toPct / 100) * w;
    const y2 = h / 2;
    const cx = (x1 + x2) / 2;
    const cy = y1 - Math.abs(x2 - x1) * 0.28;

    // Dashed arc path
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`);
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", "2.5");
    path.setAttribute("stroke-dasharray", "7 5");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-linecap", "round");

    // Animate it in along the path length
    const length = path.getTotalLength ? (() => { svg.appendChild(path); return path.getTotalLength(); })() : 300;
    if (!path.parentNode) svg.appendChild(path);

    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
    path.animate(
      [{ strokeDashoffset: `${length}` }, { strokeDashoffset: "0" }],
      { duration: 400, fill: "forwards" }
    );

    // Fade out after ~1s
    setTimeout(() => {
      path.animate(
        [{ opacity: 1 }, { opacity: 0 }],
        { duration: 600, fill: "forwards" }
      ).onfinish = () => path.remove();
    }, 700);
  }

  // ─── Kick particles ──────────────────────────────────────────
  function spawnKickParticles(pct, count) {
    count = count || 12;
    const field = $("soccer-field");
    const colors = ["#FFB900", "#ffffff", "#0066B3", "#28a745", "#ff6b6b", "#FFB900"];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const dist  = 22 + Math.random() * 22;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;

      const p = document.createElement("div");
      p.className = "kick-particle";
      const size = 4 + Math.random() * 6;
      p.style.cssText = `
        left: ${pct}%;
        top: 50%;
        width: ${size}px;
        height: ${size}px;
        background: ${colors[i % colors.length]};
        --tx: ${tx}px;
        --ty: ${ty}px;
        animation-duration: ${0.5 + Math.random() * 0.25}s;
        animation-delay: ${Math.random() * 0.08}s;
      `;
      field.appendChild(p);
      setTimeout(() => p.remove(), 900);
    }
  }

  // ─── Landing ripple ──────────────────────────────────────────
  function spawnLandingRipple(pct) {
    const field = $("soccer-field");

    for (let i = 0; i < 2; i++) {
      const r = document.createElement("div");
      r.className = "landing-ripple";
      r.style.left = `${pct}%`;
      r.style.animationDelay = `${i * 120}ms`;
      field.appendChild(r);
      setTimeout(() => r.remove(), 1000);
    }
  }

  // ─── Quiz ────────────────────────────────────────────────────
  function openQuiz(moduleIndex) {
    state.currentModule = moduleIndex;
    state.currentQuestion = 0;
    state.questionResults = [];
    state.scoreBeforeModule = state.score; // track for arcade multiplier

    const mod = state.data.modules[moduleIndex];
    $("modal-icon").textContent       = mod.icon;
    $("modal-module-name").textContent = mod.name;
    $("modal-team-name").textContent   = mod.team;
    $("modal-module-desc").textContent = mod.description || "";

    renderDots(mod.questions.length);
    showQuestion(moduleIndex, 0);
    modals.quiz.classList.remove("hidden");
  }

  function renderDots(count) {
    const container = $("progress-dots");
    container.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const d = document.createElement("div");
      d.className = "dot" + (i === 0 ? " dot-active" : "");
      d.id = `dot-${i}`;
      container.appendChild(d);
    }
  }

  function showQuestion(moduleIndex, qIndex) {
    const mod = state.data.modules[moduleIndex];
    const q   = mod.questions[qIndex];

    $("question-counter").textContent = `${qIndex + 1} / ${mod.questions.length}`;
    $("question-text").textContent    = q.question;

    const feedback = $("feedback-area");
    feedback.className = "feedback-area";
    feedback.innerHTML = "";

    const opts = $("options-container");
    opts.innerHTML = "";
    q.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.textContent = opt;
      btn.addEventListener("click", () => handleAnswer(i, moduleIndex, qIndex));
      opts.appendChild(btn);
    });

    // Sync progress dots
    document.querySelectorAll(".dot").forEach((dot, i) => {
      dot.className = "dot";
      if (i < qIndex)      dot.classList.add(state.questionResults[i] ? "dot-correct" : "dot-wrong");
      else if (i === qIndex) dot.classList.add("dot-active");
    });

    startQuestionTimer(moduleIndex, qIndex);
  }

  // ─── Per-question countdown timer ────────────────────────────
  function startQuestionTimer(moduleIndex, qIndex) {
    clearQuestionTimer();
    const q     = state.data.modules[moduleIndex].questions[qIndex];
    const limit = (typeof q.timeLimit === "number") ? q.timeLimit : (state.data.scoring?.timeLimit ?? 0);
    const wrap  = $("quiz-timer");

    questionTimer.moduleIndex = moduleIndex;
    questionTimer.qIndex      = qIndex;
    questionTimer.limit       = limit;
    questionTimer.remaining   = limit;

    if (!limit || limit <= 0) {
      questionTimer.active = false;
      wrap.classList.add("qt-hidden");
      return;
    }

    questionTimer.active = true;
    wrap.classList.remove("qt-hidden", "qt-warn", "qt-danger");
    updateTimerDisplay();
    runTimerRing(limit);
    questionTimer.interval = setInterval(tickQuestionTimer, 1000);
  }

  function tickQuestionTimer() {
    questionTimer.remaining--;
    updateTimerDisplay();
    if (questionTimer.remaining <= 0) {
      clearQuestionTimer();
      handleAnswer(-1, questionTimer.moduleIndex, questionTimer.qIndex);
    }
  }

  function updateTimerDisplay() {
    const wrap  = $("quiz-timer");
    const value = $("qt-value");
    const r = Math.max(0, questionTimer.remaining);
    value.textContent = r;
    wrap.classList.toggle("qt-warn",   r <= Math.ceil(questionTimer.limit * 0.4) && r > 5);
    wrap.classList.toggle("qt-danger", r <= 5);
  }

  // Animates the ring from full to empty over `seconds` via a CSS transition
  function runTimerRing(seconds) {
    const ring = $("qt-ring-fg");
    ring.style.transition = "none";
    ring.style.strokeDasharray  = `${TIMER_CIRCUMFERENCE}`;
    ring.style.strokeDashoffset = "0";
    void ring.offsetWidth; // force reflow so the transition below applies
    ring.style.transition = `stroke-dashoffset ${seconds}s linear`;
    requestAnimationFrame(() => { ring.style.strokeDashoffset = `${TIMER_CIRCUMFERENCE}`; });
  }

  // Stops the ring exactly where it is (used on pause / manual answer)
  function freezeTimerRing() {
    const ring = $("qt-ring-fg");
    const current = getComputedStyle(ring).strokeDashoffset;
    ring.style.transition = "none";
    ring.style.strokeDashoffset = current;
  }

  function clearQuestionTimer() {
    if (questionTimer.interval) { clearInterval(questionTimer.interval); questionTimer.interval = null; }
  }

  function pauseQuestionTimer() {
    if (!questionTimer.active || !questionTimer.interval) return;
    clearInterval(questionTimer.interval);
    questionTimer.interval = null;
    freezeTimerRing();
  }

  function resumeQuestionTimer() {
    if (!questionTimer.active || questionTimer.remaining <= 0) return;
    runTimerRing(questionTimer.remaining);
    questionTimer.interval = setInterval(tickQuestionTimer, 1000);
  }

  function handleAnswer(selected, moduleIndex, qIndex) {
    const mod      = state.data.modules[moduleIndex];
    const q        = mod.questions[qIndex];
    const correct  = selected === q.correct;
    const timedOut = selected === -1;

    clearQuestionTimer();
    freezeTimerRing();

    document.querySelectorAll(".option-btn").forEach((btn, i) => {
      btn.disabled = true;
      if (i === q.correct) btn.classList.add("opt-correct");
      else if (i === selected && !correct) btn.classList.add("opt-wrong");
    });

    const dot = $(`dot-${qIndex}`);
    if (dot) dot.className = `dot ${correct ? "dot-correct" : "dot-wrong"}`;

    // Each question carries its own point value — set per-question in the admin panel,
    // so harder/more important questions can be worth more than others.
    const fallback = state.data.scoring || { correct: 100, wrong: 25 };
    const qPoints  = (typeof q.points  === "number") ? q.points  : fallback.correct;
    const qPenalty = (typeof q.penalty === "number") ? q.penalty : fallback.wrong;
    let delta = 0;
    if (correct) { delta = qPoints;   state.score += delta; }
    else         { delta = -qPenalty; state.score = Math.max(0, state.score + delta); }
    $("display-score").textContent = state.score;

    // Float a little "+100 / -25" indicator near the score so players see this question's points live
    showScorePop(delta);

    state.questionResults.push(correct);

    const isLast = qIndex + 1 >= mod.questions.length;
    const feedback = $("feedback-area");
    feedback.className = `feedback-area ${correct ? "feedback-correct" : "feedback-wrong"}`;
    const verdict = correct
      ? "✓ Correct!"
      : timedOut
        ? `⏰ Time's up! — correct: "${q.options[q.correct]}"`
        : `✗ Not quite — correct: "${q.options[q.correct]}"`;
    feedback.innerHTML = `
      <div class="feedback-verdict">${verdict}</div>
      <div class="feedback-explanation">${q.explanation}</div>
      <button class="btn-next" id="btn-next-q">${isLast ? "Finish Module ✓" : "Next →"}</button>
    `;
    $("btn-next-q").addEventListener("click", () => {
      if (isLast) finishModule(moduleIndex);
      else { state.currentQuestion = qIndex + 1; showQuestion(moduleIndex, qIndex + 1); }
    });
  }

  // Floats a "+100" / "-25" indicator beside the score, using the admin-configured point values
  function showScorePop(delta) {
    const holder = $("display-score").closest(".hdr-score");
    const valueEl = $("display-score");
    if (!holder || delta === 0) return;

    valueEl.classList.remove("pop-bump");
    void valueEl.offsetWidth; // restart animation
    valueEl.classList.add("pop-bump");

    const pop = document.createElement("span");
    pop.className = `score-pop ${delta > 0 ? "pop-good" : "pop-bad"}`;
    pop.textContent = `${delta > 0 ? "+" : ""}${delta}`;
    holder.appendChild(pop);
    setTimeout(() => pop.remove(), 1150);
  }

  // ─── Module finish ───────────────────────────────────────────
  function finishModule(moduleIndex) {
    const mod     = state.data.modules[moduleIndex];
    const correct = state.questionResults.filter(Boolean).length;
    const total   = mod.questions.length;
    state.moduleScores[moduleIndex] = { correct, total };

    modals.quiz.classList.add("hidden");

    const isGoal = moduleIndex === state.data.modules.length - 1;
    $("complete-animation").textContent = isGoal ? "🥅" : "⚽";
    $("complete-title").textContent = correct === total
      ? (isGoal ? "GOOOAL! 🏆" : "Perfect! ⭐")
      : (isGoal ? "Goal Scored!" : "Module Complete!");
    $("complete-subtitle").textContent = isGoal
      ? "You scored! The World Cup is yours!"
      : "The ball moves up the pitch!";
    $("complete-stats").innerHTML = `
      <div class="stat-item"><div class="stat-value">${correct}/${total}</div><div class="stat-label">Correct</div></div>
      <div class="stat-item"><div class="stat-value">${state.score}</div><div class="stat-label">Score</div></div>
    `;

    modals.complete.classList.remove("hidden");
  }

  function onModuleContinue() {
    modals.complete.classList.add("hidden");
    openArcadeGame();
  }

  // ═══════════════════════════════════════════════════════════════
  //  ARCADE MINI-GAME: "Defend & Score!"
  //  25-second side-scrolling soccer shooter. Fire soccer balls at
  //  incoming targets to build a score multiplier (1.0x–3.0x) that
  //  is applied to the module's quiz points.
  // ═══════════════════════════════════════════════════════════════

  function openArcadeGame() {
    arcade.quizScore = state.score - (state.scoreBeforeModule || 0);
    arcade.moduleColor = (state.data.modules[state.currentModule] || {}).color || '#0066B3';
    $("arcade-ready").style.display = "";
    $("arcade-play").style.display = "none";
    $("arcade-result").style.display = "none";
    $("arcade-quiz-preview").textContent =
      "Quiz score: " + arcade.quizScore + " pts — now multiply it!";
    modals.arcade.classList.remove("hidden");
  }

  function startArcade() {
    $("arcade-ready").style.display = "none";
    $("arcade-play").style.display = "";
    const canvas    = $("arcade-canvas");
    const container = $("arcade-play");
    arcade.canvas   = canvas;
    arcade.ctx      = canvas.getContext("2d");
    const rect      = container.getBoundingClientRect();
    arcade.width    = canvas.width  = Math.round(rect.width);
    arcade.height   = canvas.height = Math.round(rect.height);

    arcade.phase = 'playing'; arcade.score = 0; arcade.timeLeft = GAME_DURATION;
    arcade.totalShots = 0; arcade.totalHits = 0; arcade.spawnTimer = 1.2;
    arcade.difficulty = 1; arcade.balls = []; arcade.targets = []; arcade.particles = [];
    arcade.shake = { x:0, y:0, timer:0, intensity:0 }; arcade.damageFlash = 0;
    arcade.lastTime = 0; arcade.wantFire = false; arcade.keysDown = { up:false, down:false };

    const p = arcade.player;
    p.x = Math.round(arcade.width * 0.1); p.y = arcade.height / 2;
    p.targetY = p.y; p.hp = 5; p.maxHp = 5; p.fireCooldown = 0; p.recoil = 0;

    arcade.bgCanvas        = document.createElement('canvas');
    arcade.bgCanvas.width  = arcade.width;
    arcade.bgCanvas.height = arcade.height;
    drawArcadeBgCached(arcade.bgCanvas.getContext('2d'));

    canvas.addEventListener("mousemove",  arcadeMouseMove);
    canvas.addEventListener("mousedown",  arcadeMouseDown);
    canvas.addEventListener("mouseup",    arcadeMouseUp);
    canvas.addEventListener("mouseleave", arcadeMouseUp);
    canvas.addEventListener("touchstart", arcadeTouchStart, { passive:false });
    canvas.addEventListener("touchmove",  arcadeTouchMove,  { passive:false });
    canvas.addEventListener("touchend",   arcadeTouchEnd);
    arcade.raf = requestAnimationFrame(arcadeLoop);
  }

  // ── Input handlers ──
  function arcadeMouseMove(e) {
    const r = arcade.canvas.getBoundingClientRect();
    arcade.player.targetY = ((e.clientY - r.top) / r.height) * arcade.height;
  }
  function arcadeMouseDown(e) { arcade.wantFire = true; arcadeMouseMove(e); }
  function arcadeMouseUp()    { arcade.wantFire = false; }
  function arcadeTouchStart(e) {
    e.preventDefault(); arcade.touchActive = true; arcade.wantFire = true;
    const t = e.touches[0], r = arcade.canvas.getBoundingClientRect();
    arcade.player.targetY = ((t.clientY - r.top) / r.height) * arcade.height;
  }
  function arcadeTouchMove(e) {
    e.preventDefault();
    const t = e.touches[0], r = arcade.canvas.getBoundingClientRect();
    arcade.player.targetY = ((t.clientY - r.top) / r.height) * arcade.height;
  }
  function arcadeTouchEnd() { arcade.touchActive = false; arcade.wantFire = false; }

  // ── Main loop ──
  function arcadeLoop(ts) {
    if (arcade.phase !== 'playing') return;
    if (!arcade.lastTime) arcade.lastTime = ts;
    const dt = Math.min((ts - arcade.lastTime) / 1000, 0.05);
    arcade.lastTime = ts;
    updateArcade(dt);
    drawArcade();
    arcade.raf = requestAnimationFrame(arcadeLoop);
  }

  function pollGamepad() {
    const gps = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const gp of gps) {
      if (!gp) continue;
      const deadzone = 0.25;
      const axisY = gp.axes[1] || 0;
      if (axisY < -deadzone) { arcade.keysDown.up = true; arcade.keysDown.down = false; }
      else if (axisY > deadzone) { arcade.keysDown.down = true; arcade.keysDown.up = false; }
      else { arcade.keysDown.up = false; arcade.keysDown.down = false; }
      const fire = gp.buttons[0]?.pressed || gp.buttons[5]?.pressed || gp.buttons[7]?.pressed;
      arcade.wantFire = !!fire;
      break;
    }
  }

  function updateArcade(dt) {
    arcade.timeLeft -= dt;
    if (arcade.timeLeft <= 0) { arcade.timeLeft = 0; endArcade(); return; }
    const elapsed = GAME_DURATION - arcade.timeLeft;
    const progress = elapsed / GAME_DURATION;
    arcade.difficulty = 1 + progress * 1.8 + Math.pow(progress, 2.5) * 1.2;

    pollGamepad();

    const p = arcade.player;
    const clamped = Math.max(30, Math.min(arcade.height - 30, p.targetY));
    p.y += (clamped - p.y) * 14 * dt;
    if (arcade.keysDown.up)   p.targetY = Math.max(30, p.targetY - 400 * dt);
    if (arcade.keysDown.down) p.targetY = Math.min(arcade.height - 30, p.targetY + 400 * dt);
    p.recoil *= Math.pow(0.001, dt);

    p.fireCooldown -= dt;
    if (arcade.wantFire && p.fireCooldown <= 0) {
      fireArcadeBall(); p.fireCooldown = FIRE_COOLDOWN;
    }

    for (let i = arcade.balls.length - 1; i >= 0; i--) {
      const b = arcade.balls[i]; b.x += b.vx * dt; b.rot += b.spin * dt;
      if (b.x > arcade.width + 20) arcade.balls.splice(i, 1);
    }

    arcade.spawnTimer -= dt;
    if (arcade.spawnTimer <= 0) {
      spawnArcadeTarget();
      arcade.spawnTimer = Math.max(0.25, 1.3 / arcade.difficulty);
    }

    for (let i = arcade.targets.length - 1; i >= 0; i--) {
      const t = arcade.targets[i];
      t.x += t.vx * dt; t.flashTimer = Math.max(0, t.flashTimer - dt);
      if (t.x < p.x - 15 && t.type !== 'redcard' && t.type !== 'fraud') {
        arcadeTakeDamage(); arcade.targets.splice(i, 1); continue;
      }
      if (t.x < -60) arcade.targets.splice(i, 1);
    }

    checkArcadeCollisions();

    for (let i = arcade.particles.length - 1; i >= 0; i--) {
      const pt = arcade.particles[i];
      pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vy += 220 * dt; pt.life -= dt;
      if (pt.life <= 0) arcade.particles.splice(i, 1);
    }

    if (arcade.shake.timer > 0) {
      arcade.shake.timer -= dt;
      const s = arcade.shake.timer / 0.3;
      arcade.shake.x = (Math.random() - 0.5) * arcade.shake.intensity * s;
      arcade.shake.y = (Math.random() - 0.5) * arcade.shake.intensity * s;
    } else { arcade.shake.x = arcade.shake.y = 0; }
    arcade.damageFlash = Math.max(0, arcade.damageFlash - dt * 4);
  }

  function fireArcadeBall() {
    const p = arcade.player;
    arcade.balls.push({ x: p.x + 24, y: p.y, vx: BALL_SPEED, rot: 0, spin: 12 + Math.random() * 8 });
    arcade.totalShots++; p.recoil = 6;
    for (let i = 0; i < 4; i++) {
      arcade.particles.push({
        x: p.x + 24, y: p.y, vx: 60 + Math.random() * 100,
        vy: (Math.random() - 0.5) * 120, life: 0.2 + Math.random() * 0.15,
        maxLife: 0.35, color: '#FFB900', size: 3 + Math.random() * 3
      });
    }
  }

  function spawnArcadeTarget() {
    const entries = Object.entries(TARGET_DEFS);
    const totalW  = entries.reduce((s, [, d]) => s + d.weight, 0);
    let roll = Math.random() * totalW, chosen = entries[0];
    for (const entry of entries) { roll -= entry[1].weight; if (roll <= 0) { chosen = entry; break; } }
    const [typeName, def] = chosen;
    const speed = def.speed[0] + Math.random() * (def.speed[1] - def.speed[0]);
    arcade.targets.push({
      x: arcade.width + def.w, y: 55 + Math.random() * (arcade.height - 110),
      vx: -(speed * arcade.difficulty), w: def.w, h: def.h, type: typeName,
      hp: def.hp, pts: def.pts, emoji: def.emoji || null, label: def.label || null,
      flashTimer: 0, bobPhase: Math.random() * Math.PI * 2
    });
  }

  function checkArcadeCollisions() {
    for (let bi = arcade.balls.length - 1; bi >= 0; bi--) {
      const b = arcade.balls[bi];
      for (let ti = arcade.targets.length - 1; ti >= 0; ti--) {
        const t = arcade.targets[ti];
        const dx = b.x - t.x, dy = b.y - t.y, hit = t.w / 2 + BALL_RADIUS;
        if (dx * dx + dy * dy < hit * hit) {
          t.hp--; arcade.balls.splice(bi, 1); arcade.totalHits++;
          if (t.hp <= 0) {
            arcade.score = Math.max(0, arcade.score + t.pts);
            const def = TARGET_DEFS[t.type] || {};
            const isNeg = t.type === 'redcard' || t.type === 'fraud';
            const col = isNeg ? '#ff4444' : def.color || (t.type === 'boot' ? '#FFB900' : '#ffffff');
            spawnArcadeHitFx(t.x, t.y, col, isNeg ? 8 : 14);
            if (isNeg) { arcade.damageFlash = 0.5; triggerArcadeShake(4); }
            arcade.targets.splice(ti, 1);
          } else { t.flashTimer = 0.12; spawnArcadeHitFx(t.x, t.y, '#FFB900', 6); }
          break;
        }
      }
    }
  }

  function arcadeTakeDamage() {
    arcade.player.hp--; arcade.damageFlash = 0.8; triggerArcadeShake(8);
    if (arcade.player.hp <= 0) endArcade();
  }
  function triggerArcadeShake(intensity) { arcade.shake.intensity = intensity; arcade.shake.timer = 0.3; }

  function spawnArcadeHitFx(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const speed = 80 + Math.random() * 180;
      arcade.particles.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 60,
        life: 0.3 + Math.random() * 0.4, maxLife: 0.7, color, size: 3 + Math.random() * 5
      });
    }
  }

  function calcArcadeMultiplier() {
    return Math.min(MAX_MULT, Math.round((1.0 + arcade.score * 0.01) * 10) / 10);
  }

  function removeArcadeListeners() {
    const c = arcade.canvas;
    if (!c) return;
    c.removeEventListener("mousemove",  arcadeMouseMove);
    c.removeEventListener("mousedown",  arcadeMouseDown);
    c.removeEventListener("mouseup",    arcadeMouseUp);
    c.removeEventListener("mouseleave", arcadeMouseUp);
    c.removeEventListener("touchstart", arcadeTouchStart);
    c.removeEventListener("touchmove",  arcadeTouchMove);
    c.removeEventListener("touchend",   arcadeTouchEnd);
  }

  // ── End round & show results ──
  function endArcade() {
    arcade.phase = 'ended';
    if (arcade.raf) { cancelAnimationFrame(arcade.raf); arcade.raf = null; }
    removeArcadeListeners();
    const mult        = calcArcadeMultiplier();
    const quizPts     = arcade.quizScore;
    const moduleTotal = Math.max(0, Math.round(quizPts * mult));
    state.score = Math.max(0, (state.scoreBeforeModule || 0) + moduleTotal);
    $("display-score").textContent = state.score;
    setTimeout(() => {
      $("arcade-play").style.display = "none";
      $("arcade-result").style.display = "";
      $("arcade-result-title").textContent = arcade.player.hp <= 0
        ? "Game Over!" : "🏆 Round Complete!";
      $("ar-hits").textContent     = arcade.totalHits;
      $("ar-accuracy").textContent = arcade.totalShots > 0
        ? Math.round((arcade.totalHits / arcade.totalShots) * 100) + '%' : '—';
      $("ar-score").textContent      = arcade.score;
      $("ar-mult").textContent       = mult.toFixed(1) + 'x';
      $("ar-quiz-pts").textContent   = quizPts;
      $("ar-final-mult").textContent = mult.toFixed(1) + 'x';
      $("ar-total").textContent      = moduleTotal;
    }, 600);
  }

  function onArcadeContinue() {
    modals.arcade.classList.add("hidden");
    const mult = calcArcadeMultiplier();
    let tier;
    if (mult >= 2.5)      tier = 'perfect';
    else if (mult >= 2.0) tier = 'good';
    else if (mult >= 1.5) tier = 'ok';
    else                  tier = 'off';
    advanceBall(tier);
  }

  // ── Drawing ──
  function drawArcade() {
    const ctx = arcade.ctx, w = arcade.width, h = arcade.height;
    ctx.save();
    ctx.translate(arcade.shake.x, arcade.shake.y);
    if (arcade.bgCanvas) ctx.drawImage(arcade.bgCanvas, 0, 0);

    ctx.font = '20px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const b of arcade.balls) {
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.rot);
      ctx.fillText('⚽', 0, 0); ctx.restore();
    }

    for (const t of arcade.targets) {
      ctx.save();
      const bob = Math.sin(performance.now() / 400 + t.bobPhase) * 4;
      ctx.translate(t.x, t.y + bob);
      if (t.flashTimer > 0) { ctx.shadowColor = '#fff'; ctx.shadowBlur = 20; }
      else if (t.type === 'boot')    { ctx.shadowColor = '#FFB900'; ctx.shadowBlur = 16; }
      else if (t.type === 'redcard' || t.type === 'fraud') { ctx.shadowColor = '#ff4444'; ctx.shadowBlur = 10; }
      if (t.emoji) {
        ctx.font = t.w + 'px serif'; ctx.fillText(t.emoji, 0, 0);
      } else {
        const def = TARGET_DEFS[t.type];
        const col = def.color || '#fff';
        const pw = t.w, ph = t.h, r = 6;
        ctx.beginPath();
        ctx.moveTo(-pw/2 + r, -ph/2); ctx.lineTo(pw/2 - r, -ph/2);
        ctx.quadraticCurveTo(pw/2, -ph/2, pw/2, -ph/2 + r);
        ctx.lineTo(pw/2, ph/2 - r); ctx.quadraticCurveTo(pw/2, ph/2, pw/2 - r, ph/2);
        ctx.lineTo(-pw/2 + r, ph/2); ctx.quadraticCurveTo(-pw/2, ph/2, -pw/2, ph/2 - r);
        ctx.lineTo(-pw/2, -ph/2 + r); ctx.quadraticCurveTo(-pw/2, -ph/2, -pw/2 + r, -ph/2);
        ctx.closePath();
        ctx.fillStyle = col; ctx.globalAlpha = 0.18; ctx.fill();
        ctx.globalAlpha = 1; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(t.label, 0, 0);
      }
      ctx.shadowBlur = 0;
      if (t.hp > 1) { ctx.font = 'bold 11px sans-serif'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('x' + t.hp, 0, t.h / 2 + 12); }
      ctx.restore();
    }

    for (const pt of arcade.particles) {
      const alpha = Math.max(0, pt.life / pt.maxLife);
      ctx.globalAlpha = alpha; ctx.fillStyle = pt.color;
      ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.size * alpha, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    drawArcadePlayer();
    drawArcadeHUD();
    if (arcade.damageFlash > 0) {
      ctx.fillStyle = 'rgba(255,0,0,' + (arcade.damageFlash * 0.3) + ')';
      ctx.fillRect(-10, -10, w + 20, h + 20);
    }
    ctx.restore();
  }

  function drawArcadeBgCached(ctx) {
    const w = arcade.width, h = arcade.height;
    ctx.fillStyle = '#1a6b35'; ctx.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 55) {
      ctx.fillStyle = Math.floor(x / 55) % 2 === 0 ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.03)';
      ctx.fillRect(x, 0, 55, h);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(w * 0.55, 0); ctx.lineTo(w * 0.55, h); ctx.stroke();
    ctx.beginPath(); ctx.arc(w * 0.55, h / 2, Math.min(70, h * 0.18), 0, Math.PI * 2); ctx.stroke();
    ctx.strokeRect(0, h * 0.25, w * 0.15, h * 0.5);
    ctx.strokeRect(w * 0.85, h * 0.25, w * 0.15, h * 0.5);
    ctx.strokeRect(w * 0.92, h * 0.35, w * 0.08, h * 0.3);
    const g1 = ctx.createLinearGradient(0, 0, 0, 50);
    g1.addColorStop(0, 'rgba(0,12,50,0.85)'); g1.addColorStop(1, 'transparent');
    ctx.fillStyle = g1; ctx.fillRect(0, 0, w, 50);
    const g2 = ctx.createLinearGradient(0, h - 50, 0, h);
    g2.addColorStop(0, 'transparent'); g2.addColorStop(1, 'rgba(0,12,50,0.85)');
    ctx.fillStyle = g2; ctx.fillRect(0, h - 50, w, 50);
    const g3 = ctx.createLinearGradient(w - 100, 0, w, 0);
    g3.addColorStop(0, 'transparent'); g3.addColorStop(1, 'rgba(0,12,50,0.35)');
    ctx.fillStyle = g3; ctx.fillRect(w - 100, 0, 100, h);
  }

  function drawArcadePlayer() {
    const ctx = arcade.ctx, p = arcade.player;
    const px = p.x - p.recoil, py = p.y;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(px, py + 28, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px - 7, py + 10, 5, 14); ctx.fillRect(px + 2, py + 10, 5, 14);
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(px - 9, py + 22, 8, 5); ctx.fillRect(px + 1, py + 22, 8, 5);
    ctx.fillRect(px - 10, py + 4, 20, 10);
    ctx.fillStyle = arcade.moduleColor;
    ctx.fillRect(px - 13, py - 14, 26, 22);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('10', px, py - 4);
    ctx.fillStyle = '#e8b87a';
    ctx.beginPath(); ctx.arc(px, py - 20, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a2517';
    ctx.beginPath(); ctx.arc(px, py - 22, 8, Math.PI, 2 * Math.PI); ctx.fill();
    ctx.strokeStyle = arcade.moduleColor; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(px + 12, py - 8); ctx.lineTo(px + 22, py - 2); ctx.stroke();
  }

  function drawArcadeHUD() {
    const ctx = arcade.ctx, w = arcade.width, h = arcade.height;
    ctx.fillStyle = 'rgba(0,10,40,0.78)'; ctx.fillRect(0, 0, w, 46);
    ctx.fillStyle = 'rgba(255,185,0,0.6)'; ctx.fillRect(0, 46, w, 2);
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('SCORE', 16, 8);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 20px sans-serif';
    ctx.fillText(arcade.score.toString(), 16, 21);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('TIME', w / 2, 8);
    ctx.fillStyle = arcade.timeLeft <= 5 ? '#ff5555' : '#fff'; ctx.font = 'bold 22px sans-serif';
    ctx.fillText(Math.ceil(arcade.timeLeft).toString(), w / 2, 19);
    const mult = calcArcadeMultiplier();
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'right';
    ctx.fillText('MULTIPLIER', w - 16, 8);
    ctx.fillStyle = mult >= 2.5 ? '#FFB900' : mult >= 2 ? '#4ad57f' : '#fff';
    ctx.font = 'bold 20px sans-serif'; ctx.fillText(mult.toFixed(1) + 'x', w - 16, 21);
    ctx.textBaseline = 'bottom'; ctx.textAlign = 'left'; ctx.font = '16px serif';
    let hp = '';
    for (let i = 0; i < arcade.player.maxHp; i++) hp += i < arcade.player.hp ? '❤️' : '🖤';
    ctx.fillText(hp, 12, h - 10);
    ctx.textAlign = 'right'; ctx.font = '10px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillText('🧤+10  🔶+15  🥅+20  ⭐+50  SWIFT+25  ISO+40  🟥-20  FRAUD-25', w - 12, h - 12);
  }

  // Arcs the ball forward — arcade multiplier maps to a STRIKE_FX tier
  function advanceBall(tier) {
    const justCompleted = state.currentModule;
    const fromPct = BALL_POSITIONS[justCompleted];
    const toPct   = BALL_POSITIONS[justCompleted + 1];
    state.currentModule = justCompleted + 1;
    renderField(); renderStatusBar();
    passBall(fromPct, toPct, tier, () => {
      if (state.currentModule >= state.data.modules.length) setTimeout(showVictory, 600);
    });
  }


  // ─── Victory ─────────────────────────────────────────────────
  function showVictory() {
    const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    const m = Math.floor(elapsed / 60);
    const s = (elapsed % 60).toString().padStart(2, "0");

    $("victory-team-name").textContent = state.teamName;
    $("final-score").textContent       = state.score;
    $("victory-time").textContent      = `Time: ${m}:${s}`;

    $("victory-modules").innerHTML = state.data.modules.map((mod, i) => {
      const ms = state.moduleScores[i] || { correct: 0, total: mod.questions.length };
      return `<div class="victory-chip">${mod.icon} ${ms.correct}/${ms.total}</div>`;
    }).join("");

    DataManager.saveScore(state.teamName, state.score, elapsed);
    showScreen("victory");
    launchConfetti();
  }

  // ─── Confetti ────────────────────────────────────────────────
  function launchConfetti() {
    const container = $("confetti");
    container.innerHTML = "";
    const colors = ["#FFB900", "#0066B3", "#FFFFFF", "#28a745", "#FF6B6B", "#E83E8C"];
    for (let i = 0; i < 130; i++) {
      setTimeout(() => {
        const p = document.createElement("div");
        p.className = "confetti-piece";
        p.style.cssText = `
          left:${Math.random() * 100}%;
          background:${colors[Math.floor(Math.random() * colors.length)]};
          width:${6 + Math.random() * 10}px;
          height:${6 + Math.random() * 10}px;
          border-radius:${Math.random() > 0.5 ? "50%" : "2px"};
          animation-duration:${2.5 + Math.random() * 3}s;
          animation-delay:${Math.random() * 0.8}s;
        `;
        container.appendChild(p);
        setTimeout(() => p.remove(), 5500);
      }, i * 22);
    }
  }

  // ─── Leaderboard ─────────────────────────────────────────────
  function showLeaderboard() {
    const board  = DataManager.getLeaderboard();
    const list   = $("leaderboard-list");
    const medals = ["🥇", "🥈", "🥉"];

    list.innerHTML = !board.length
      ? `<div class="lb-empty">No scores yet — be the first!</div>`
      : board.map((entry, i) => {
          const m = Math.floor(entry.time / 60);
          const s = (entry.time % 60).toString().padStart(2, "0");
          return `
            <div class="lb-row">
              <span class="lb-rank">${medals[i] || `#${i + 1}`}</span>
              <span class="lb-team">${sanitize(entry.team)}</span>
              <span class="lb-score">${entry.score}</span>
              <span class="lb-time">${m}:${s}</span>
            </div>
          `;
        }).join("");

    modals.leaderboard.classList.remove("hidden");
  }

  // ─── Pause Menu ──────────────────────────────────────────────
  function openPauseMenu() {
    // Freeze the arcade loop if a round is mid-play
    if (arcade.phase === 'playing') {
      arcade.phase = 'paused';
      if (arcade.raf) { cancelAnimationFrame(arcade.raf); arcade.raf = null; }
      arcade.wantFire = false;
      arcade.keysDown = { up: false, down: false };
    }
    // Freeze the question countdown if a quiz is open
    if (!modals.quiz.classList.contains("hidden")) pauseQuestionTimer();

    $("pause-team-name").textContent = state.teamName;
    $("pause-main").classList.remove("hidden");
    $("pause-confirm").classList.add("hidden");
    modals.pause.classList.remove("hidden");
  }

  function closePauseMenu() {
    modals.pause.classList.add("hidden");
    if (arcade.phase === 'paused') {
      arcade.phase = 'playing';
      arcade.lastTime = 0;
      arcade.raf = requestAnimationFrame(arcadeLoop);
    }
    if (!modals.quiz.classList.contains("hidden")) resumeQuestionTimer();
  }

  function showQuitConfirm() {
    $("pause-main").classList.add("hidden");
    $("pause-confirm").classList.remove("hidden");
  }

  function hideQuitConfirm() {
    $("pause-confirm").classList.add("hidden");
    $("pause-main").classList.remove("hidden");
  }

  function quitToMenu() {
    modals.pause.classList.add("hidden");
    resetGame();
  }

  // ─── Reset ───────────────────────────────────────────────────
  function resetGame() {
    modals.quiz.classList.add("hidden");
    modals.complete.classList.add("hidden");
    modals.arcade.classList.add("hidden");
    modals.leaderboard.classList.add("hidden");
    modals.pause.classList.add("hidden");

    // Don't let a mid-flight arcade game keep ticking into the next game
    if (arcade.raf) { cancelAnimationFrame(arcade.raf); arcade.raf = null; }
    removeArcadeListeners();
    arcade.phase = 'idle';

    // Don't let a mid-question countdown keep ticking into the next game
    clearQuestionTimer();
    questionTimer.active = false;
    $("quiz-timer").classList.add("qt-hidden");

    $("team-name").value = "";
    showScreen("welcome");
  }

  function sanitize(str) {
    const d = document.createElement("div");
    d.appendChild(document.createTextNode(str));
    return d.innerHTML;
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", Game.init);
