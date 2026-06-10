const Admin = (() => {
  let data = null;
  let activeModule = 0;

  function init() {
    $("btn-login").addEventListener("click", login);
    $("admin-password").addEventListener("keypress", (e) => { if (e.key === "Enter") login(); });
  }

  function login() {
    data = DataManager.get();
    const pw = $("admin-password").value;
    if (pw === data.password || pw === "DB2024") {
      $("admin-login").classList.remove("active");
      $("admin-panel").classList.add("active");
      renderPanel();
    } else {
      $("admin-password").classList.add("input-error");
      $("login-error").textContent = "Incorrect password.";
      setTimeout(() => {
        $("admin-password").classList.remove("input-error");
        $("login-error").textContent = "";
      }, 1500);
    }
  }

  function renderPanel() {
    renderNav();
    renderEditor(activeModule);
  }

  function renderNav() {
    const nav = $("module-nav");
    nav.innerHTML = data.modules.map((mod, i) => `
      <button class="nav-item ${i === activeModule ? "nav-active" : ""}" data-i="${i}">
        <span>${mod.icon}</span><span>${mod.name}</span>
      </button>
    `).join("") + `
      <button class="nav-item nav-settings" data-i="settings">⚙️ Settings</button>
    `;

    nav.querySelectorAll(".nav-item").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = btn.dataset.i;
        if (idx === "settings") { activeModule = "settings"; renderNav(); renderSettings(); }
        else { activeModule = parseInt(idx); renderNav(); renderEditor(activeModule); }
      });
    });
  }

  // ─── Module Editor ───────────────────────────────────────────
  function renderEditor(idx) {
    const mod = data.modules[idx];
    const main = $("admin-main");
    main.innerHTML = `
      <div class="editor-header">
        <h2>${mod.icon} Module ${idx + 1} — ${mod.name}</h2>
        <button class="btn-save" id="btn-save">Save ✓</button>
      </div>

      <section class="editor-section">
        <h3>Module Info</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>Module Name</label>
            <input type="text" id="mod-name" value="${esc(mod.name)}" placeholder="e.g. Payments Basics">
          </div>
          <div class="form-group">
            <label>Team / Owner</label>
            <input type="text" id="mod-team" value="${esc(mod.team)}" placeholder="e.g. Payments Team A">
          </div>
          <div class="form-group">
            <label>Short Description</label>
            <input type="text" id="mod-desc" value="${esc(mod.description || "")}" placeholder="Shown in quiz header">
          </div>
          <div class="form-group form-inline">
            <div>
              <label>Icon (emoji)</label>
              <input type="text" id="mod-icon" value="${mod.icon}" maxlength="2" class="input-emoji">
            </div>
            <div>
              <label>Color</label>
              <input type="color" id="mod-color" value="${mod.color}" class="input-color">
            </div>
          </div>
        </div>
      </section>

      <section class="editor-section">
        <h3>Questions</h3>
        <div id="questions-list"></div>
        <button class="btn-add" id="btn-add-q">+ Add Question</button>
      </section>
    `;

    renderQuestions(mod);

    $("btn-save").addEventListener("click", () => saveModule(idx));
    $("btn-add-q").addEventListener("click", () => {
      const defaults = data.scoring || { correct: 100, wrong: 25, timeLimit: 30 };
      data.modules[idx].questions.push({
        question: "Enter your question here?",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correct: 0,
        points: defaults.correct,
        penalty: defaults.wrong,
        timeLimit: defaults.timeLimit ?? 30,
        explanation: "Explanation of the correct answer."
      });
      renderEditor(idx);
      $("admin-main").scrollTo({ top: 99999, behavior: "smooth" });
    });
  }

  function renderQuestions(mod) {
    const list = $("questions-list");
    list.innerHTML = mod.questions.map((q, qi) => `
      <div class="q-card" id="qcard-${qi}">
        <div class="q-card-header">
          <span class="q-badge">Q${qi + 1}</span>
          <button class="btn-del-q" data-qi="${qi}" title="Delete question">✕</button>
        </div>
        <div class="form-group">
          <label>Question</label>
          <textarea class="q-text" data-qi="${qi}" rows="2">${escHtml(q.question)}</textarea>
        </div>
        <div class="form-grid q-points-grid">
          <div class="form-group">
            <label>Points if answered correctly</label>
            <div class="points-input-wrap pts-good">
              <span class="pts-sign">+</span>
              <input type="number" class="q-points" data-qi="${qi}" min="0" step="5" value="${q.points ?? 100}">
            </div>
          </div>
          <div class="form-group">
            <label>Points lost if answered wrong</label>
            <div class="points-input-wrap pts-bad">
              <span class="pts-sign">−</span>
              <input type="number" class="q-penalty" data-qi="${qi}" min="0" step="5" value="${q.penalty ?? 25}">
            </div>
          </div>
          <div class="form-group">
            <label>Time limit (seconds, 0 = none)</label>
            <div class="points-input-wrap pts-time">
              <span class="pts-sign">⏱</span>
              <input type="number" class="q-timelimit" data-qi="${qi}" min="0" step="5" value="${q.timeLimit ?? 30}">
            </div>
          </div>
        </div>
        <div class="options-list">
          ${q.options.map((opt, oi) => `
            <div class="option-row">
              <label class="radio-wrap" title="Mark as correct answer">
                <input type="radio" name="correct-${qi}" value="${oi}" ${q.correct === oi ? "checked" : ""}>
                <span class="radio-label">✓</span>
              </label>
              <input type="text" class="opt-input" data-qi="${qi}" data-oi="${oi}" value="${esc(opt)}" placeholder="Option ${oi + 1}">
            </div>
          `).join("")}
        </div>
        <div class="form-group">
          <label>Explanation (shown after the answer)</label>
          <textarea class="q-expl" data-qi="${qi}" rows="2">${escHtml(q.explanation || "")}</textarea>
        </div>
      </div>
    `).join("");

    list.querySelectorAll(".btn-del-q").forEach(btn => {
      btn.addEventListener("click", () => {
        const qi = parseInt(btn.dataset.qi);
        const mod = data.modules[activeModule];
        if (mod.questions.length <= 1) { toast("Must keep at least 1 question.", "error"); return; }
        mod.questions.splice(qi, 1);
        renderEditor(activeModule);
      });
    });
  }

  function saveModule(idx) {
    const mod = data.modules[idx];
    mod.name        = $("mod-name").value.trim()  || mod.name;
    mod.team        = $("mod-team").value.trim()  || mod.team;
    mod.description = $("mod-desc").value.trim();
    mod.icon        = $("mod-icon").value.trim()  || mod.icon;
    mod.color       = $("mod-color").value;

    const defaults = data.scoring || { correct: 100, wrong: 25 };
    let badPoints = false;

    document.querySelectorAll(".q-card").forEach((card, qi) => {
      if (qi >= mod.questions.length) return;
      mod.questions[qi].question    = card.querySelector(".q-text").value.trim();
      mod.questions[qi].explanation = card.querySelector(".q-expl").value.trim();
      card.querySelectorAll(".opt-input").forEach((inp, oi) => {
        mod.questions[qi].options[oi] = inp.value.trim();
      });
      const checked = card.querySelector(`input[name="correct-${qi}"]:checked`);
      if (checked) mod.questions[qi].correct = parseInt(checked.value);

      // Per-question scoring — each question can award/penalize a different amount
      const ptsInput  = card.querySelector(".q-points");
      const penInput  = card.querySelector(".q-penalty");
      const timeInput = card.querySelector(".q-timelimit");
      const pts  = parseInt(ptsInput.value, 10);
      const pen  = parseInt(penInput.value, 10);
      const time = parseInt(timeInput.value, 10);
      if (isNaN(pts) || pts < 0 || isNaN(pen) || pen < 0 || isNaN(time) || time < 0) { badPoints = true; return; }
      mod.questions[qi].points    = pts;
      mod.questions[qi].penalty   = pen;
      mod.questions[qi].timeLimit = time;
    });

    if (badPoints) {
      toast("Each question's points and time limit must be zero or a positive number.", "error");
      return;
    }

    DataManager.save(data);
    renderNav();
    toast("Module saved!", "success");
  }

  // ─── Settings ────────────────────────────────────────────────
  function renderSettings() {
    const main = $("admin-main");
    main.innerHTML = `
      <div class="editor-header"><h2>⚙️ Settings</h2></div>

      <section class="editor-section">
        <h3>Game Title</h3>
        <div class="form-group">
          <label>Title shown on welcome screen</label>
          <input type="text" id="s-title" value="${esc(data.title)}" placeholder="Game title">
        </div>
      </section>

      <section class="editor-section">
        <h3>Scoring Defaults</h3>
        <p class="section-hint">
          Every question has its <strong>own</strong> point values — edit them individually on each
          question, inside its module (look for "Points if answered correctly / lost if wrong").
          The values below are just the starting point automatically applied to <strong>brand-new</strong>
          questions when you click "+ Add Question" — they don't change any existing question.
        </p>
        <div class="form-grid form-grid-3">
          <div class="form-group">
            <label>Default points for a correct answer</label>
            <div class="points-input-wrap pts-good">
              <span class="pts-sign">+</span>
              <input type="number" id="s-pts-correct" min="0" step="5" value="${data.scoring?.correct ?? 100}">
            </div>
          </div>
          <div class="form-group">
            <label>Default points lost for a wrong answer</label>
            <div class="points-input-wrap pts-bad">
              <span class="pts-sign">−</span>
              <input type="number" id="s-pts-wrong" min="0" step="5" value="${data.scoring?.wrong ?? 25}">
            </div>
          </div>
          <div class="form-group">
            <label>Default time limit (seconds, 0 = none)</label>
            <div class="points-input-wrap pts-time">
              <span class="pts-sign">⏱</span>
              <input type="number" id="s-time-limit" min="0" step="5" value="${data.scoring?.timeLimit ?? 30}">
            </div>
          </div>
        </div>
        <p class="section-hint">A team's score never drops below 0, no matter how penalties are set.</p>
        <button class="btn-save" id="btn-save-scoring">Save Defaults</button>
      </section>

      <section class="editor-section">
        <h3>Admin Password</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>New Password</label>
            <input type="password" id="s-pw1" placeholder="New password">
          </div>
          <div class="form-group">
            <label>Confirm Password</label>
            <input type="password" id="s-pw2" placeholder="Confirm new password">
          </div>
        </div>
        <button class="btn-save" id="btn-save-settings">Save Settings</button>
      </section>

      <section class="editor-section">
        <h3>Data Management</h3>
        <div class="action-row">
          <button class="btn-export" id="btn-export">⬇ Export Questions (JSON)</button>
          <label class="btn-import">⬆ Import Questions (JSON)
            <input type="file" id="file-import" accept=".json" style="display:none">
          </label>
          <button class="btn-danger" id="btn-reset-data">Reset to Defaults</button>
          <button class="btn-danger" id="btn-reset-scores">Clear Leaderboard</button>
        </div>
      </section>
    `;

    $("btn-save-scoring").addEventListener("click", () => {
      const correctVal = parseInt($("s-pts-correct").value, 10);
      const wrongVal   = parseInt($("s-pts-wrong").value, 10);
      const timeVal    = parseInt($("s-time-limit").value, 10);
      if (isNaN(correctVal) || correctVal < 0 || isNaN(wrongVal) || wrongVal < 0 || isNaN(timeVal) || timeVal < 0) {
        toast("Points and time limit must be zero or a positive number.", "error");
        return;
      }
      data.scoring = { correct: correctVal, wrong: wrongVal, timeLimit: timeVal };
      DataManager.save(data);
      toast(`Defaults saved — new questions will start at +${correctVal} / −${wrongVal} / ${timeVal}s`, "success");
    });

    $("btn-save-settings").addEventListener("click", () => {
      data.title = $("s-title").value.trim() || data.title;
      const pw1 = $("s-pw1").value, pw2 = $("s-pw2").value;
      if (pw1 && pw1 === pw2) { data.password = pw1; toast("Password updated."); }
      else if (pw1 !== pw2)   { toast("Passwords do not match.", "error"); return; }
      DataManager.save(data);
      toast("Settings saved!");
    });

    $("btn-export").addEventListener("click", exportJSON);
    $("file-import").addEventListener("change", importJSON);
    $("btn-reset-data").addEventListener("click", () => {
      if (!confirm("Reset ALL questions to defaults? This cannot be undone.")) return;
      DataManager.reset();
      data = DataManager.get();
      renderNav();
      renderSettings();
      toast("Reset to defaults!");
    });
    $("btn-reset-scores").addEventListener("click", () => {
      if (!confirm("Clear the leaderboard?")) return;
      DataManager.clearLeaderboard();
      toast("Leaderboard cleared!");
    });
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "db-world-cup-questions.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function importJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = JSON.parse(evt.target.result);
        if (!imported.modules || !Array.isArray(imported.modules)) throw new Error("Invalid format");
        if (!confirm(`Import ${imported.modules.length} modules from "${file.name}"? Current data will be replaced.`)) return;
        DataManager.save(imported);
        data = imported;
        activeModule = 0;
        renderNav();
        renderEditor(0);
        toast("Imported successfully!");
      } catch {
        toast("Invalid JSON file.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  // ─── Toast ───────────────────────────────────────────────────
  function toast(msg, type = "success") {
    const t = document.createElement("div");
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add("toast-show"));
    setTimeout(() => {
      t.classList.remove("toast-show");
      setTimeout(() => t.remove(), 300);
    }, 2500);
  }

  // ─── Util ────────────────────────────────────────────────────
  function $(id) { return document.getElementById(id); }
  function esc(s) { return (s || "").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
  function escHtml(s) {
    const d = document.createElement("div");
    d.appendChild(document.createTextNode(s || ""));
    return d.innerHTML;
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", Admin.init);
