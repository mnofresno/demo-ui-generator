(() => {
  const state = {
    uiType: "email",
    style: "minimal",
    features: {},
    emails: [],
    otp: ""
  };

  const nodes = {
    list: document.getElementById("email-list"),
    empty: document.getElementById("empty-state"),
    otp: document.getElementById("otp-value"),
    title: document.getElementById("toolbar-title"),
    reload: document.getElementById("reload-button")
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function renderEmails() {
    const emails = Array.isArray(state.emails) ? state.emails : [];
    nodes.title.textContent = `${emails.length} message${emails.length === 1 ? "" : "s"}`;
    nodes.otp.textContent = state.otp || "------";
    nodes.empty.hidden = emails.length > 0;
    nodes.list.innerHTML = emails.map((email, index) => {
      const from = escapeHtml(email.from || `Sender ${index + 1}`);
      const subject = escapeHtml(email.subject || "Untitled message");
      const preview = escapeHtml(email.preview || email.body || "");
      const date = escapeHtml(email.date || "Now");
      return `
        <li class="email-item">
          <div class="email-row">
            <span class="email-from">${from}</span>
            <span class="email-date">${date}</span>
          </div>
          <p class="email-subject">${subject}</p>
          <p class="email-preview">${preview}</p>
        </li>
      `;
    }).join("");
  }

  async function reloadData() {
    const response = await fetch(`./data.json?t=${Date.now()}`, { cache: "no-store" });
    const payload = await response.json();
    state.uiType = payload.ui_type || "email";
    state.style = payload.style || "minimal";
    state.features = payload.features || {};
    state.emails = Array.isArray(payload.emails) ? payload.emails : [];
    state.otp = payload.otp || "";
    renderEmails();
    return payload;
  }

  function addEmail(email) {
    state.emails.push(email || {});
    renderEmails();
  }

  function clearEmails() {
    state.emails = [];
    renderEmails();
  }

  function setOTP(code) {
    state.otp = String(code || "");
    renderEmails();
  }

  window.demoAPI = {
    addEmail,
    clearEmails,
    setOTP,
    reloadData
  };

  nodes.reload.addEventListener("click", () => {
    void reloadData();
  });

  void reloadData();
})();
