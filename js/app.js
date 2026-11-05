const view = document.querySelector("#view");
const toast = document.querySelector("#toast");
const logoutButton = document.querySelector("#header-logout");
const orderReminder = document.querySelector("#order-reminder");

const banners = [
  { image: "assets/banner1.jpg" },
  { image: "assets/banner2.jpg" },
  { image: "assets/banner3.jpg" },
];

const zones = {
  "A區": ["A1桌", "A2桌", "A3桌", "A5桌", "A6桌", "A7桌", "A8桌", "A9桌"],
  "B區": ["B1桌", "B2桌", "B3桌", "B5桌", "B6桌", "B7桌"],
  "C區": ["C1桌", "C2桌", "C3桌", "C5桌", "C6桌", "C7桌"],
  "D區": ["D1桌", "D2桌", "D3桌", "D5桌"],
};

let carouselTimer;
let currentSlide = 0;
let loginCode = "";

function setServiceBell(visible) {
  document.querySelector("#service-bell").classList.toggle("visible", visible);
}

function setHeaderMode(management = false) {
  document.querySelector(".brand-bar").classList.toggle("management-mode", management);
}

function carouselMarkup() {
  return `
    <section class="carousel" id="carousel" aria-label="待機輪播圖">
      ${banners.map((banner, index) => `
        <article class="slide ${index === currentSlide ? "active" : ""}" style="background-image:url('${banner.image}')"></article>`).join("")}
      <div class="dots" aria-label="輪播頁數">
        ${banners.map((_, index) => `<button class="dot ${index === currentSlide ? "active" : ""}" data-slide="${index}" aria-label="第 ${index + 1} 張"></button>`).join("")}
      </div>
    </section>`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function renderServiceMenu() {
  window.clearInterval(carouselTimer);
  const overlay = document.createElement("div");
  overlay.className = "service-menu-overlay";
  overlay.innerHTML = `
    <section class="service-menu-card" role="dialog" aria-modal="true" aria-labelledby="service-menu-title">
      <button class="service-menu-close" id="close-service-menu" type="button" aria-label="關閉服務鈴選單">×</button>
      <h2 id="service-menu-title">服務鈴</h2>
      <div class="service-options">
        ${["清理桌面", "詢問菜單", "出餐延遲"].map((option) => `<button class="service-option" data-option="${option}" type="button">${option}</button>`).join("")}
      </div>
      <button class="service-confirm" id="confirm-service" type="button" disabled>確定</button>
    </section>`;
  document.querySelector("#app").appendChild(overlay);

  let selectedOption = "";
  const closeMenu = () => { overlay.remove(); startCarousel(); };
  overlay.querySelector("#close-service-menu").addEventListener("click", closeMenu);
  overlay.addEventListener("click", (event) => { if (event.target === overlay) closeMenu(); });
  overlay.querySelectorAll(".service-option").forEach((button) => button.addEventListener("click", () => {
    selectedOption = button.dataset.option;
    overlay.querySelectorAll(".service-option").forEach((item) => item.classList.toggle("selected", item === button));
    overlay.querySelector("#confirm-service").disabled = false;
  }));
  overlay.querySelector("#confirm-service").addEventListener("click", () => {
    showToast(`已送出：${selectedOption}`);
    closeMenu();
  });
}

function codeField(label = "請輸入通行碼") {
  return `<input class="code-input" id="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" aria-label="${label}" placeholder="••••••" />`;
}

function renderLogin() {
  loginCode = "";
  logoutButton.hidden = true;
  window.clearInterval(carouselTimer);
  currentSlide = 0;
  setHeaderMode(false);
  setServiceBell(false);
  view.className = "view login-view";
  view.innerHTML = `
    <form class="login-card" id="login-form">
      <h1>桌邊自助點餐系統</h1>
      <p>請輸入通行碼，開始今日服務</p>
      ${codeField()}
      <p class="hint" id="login-hint">6 碼半形數字通行碼</p>
      <p class="login-error">驗證錯誤或門市尚未啟用服務</p>
      <button class="primary-button" type="submit">確定登入</button>
    </form>`;

  const input = document.querySelector("#code");
  input.setAttribute("aria-describedby", "login-hint");
  input.focus();
  document.querySelector("#login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(input.value)) {
      input.focus();
      return;
    }
    loginCode = input.value;
    logoutButton.hidden = false;
    renderStandby();
  });
}

function renderStandby() {
  setHeaderMode(false);
  setServiceBell(false);
  view.className = "view standby-view";
  view.innerHTML = `
    ${carouselMarkup()}
    <footer class="standby-footer">
      <div class="table-status"><strong>尚未配桌</strong>請先完成配桌，才能使用點餐。</div>
      <button class="service-button" id="assign-table">配桌 <img class="button-icon" src="assets/icons/arrow-right.svg" alt="" aria-hidden="true" /></button>
    </footer>`;

  document.querySelector("#assign-table").addEventListener("click", () => renderVerification());
  setupCarouselControls();
  startCarousel();
}

function goToSlide(index) {
  currentSlide = (index + banners.length) % banners.length;
  document.querySelectorAll(".slide").forEach((slide, i) => slide.classList.toggle("active", i === currentSlide));
  document.querySelectorAll(".dot").forEach((dot, i) => dot.classList.toggle("active", i === currentSlide));
}

function startCarousel() {
  window.clearInterval(carouselTimer);
  carouselTimer = window.setInterval(() => goToSlide(currentSlide + 1), 5000);
}

function setupCarouselControls() {
  const carousel = document.querySelector("#carousel");
  const selectSlide = (index) => {
    goToSlide(index);
    startCarousel();
  };
  carousel.querySelectorAll(".dot").forEach((dot) => {
    dot.addEventListener("click", () => selectSlide(Number(dot.dataset.slide)));
  });

  let startX = 0;
  carousel.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0 || event.target.closest(".dots")) return;
    startX = event.clientX;
    carousel.setPointerCapture(event.pointerId);
  });
  carousel.addEventListener("pointerup", (event) => {
    if (!carousel.hasPointerCapture(event.pointerId)) return;
    const distance = event.clientX - startX;
    if (Math.abs(distance) > 45) selectSlide(currentSlide + (distance < 0 ? 1 : -1));
  });
}

function renderVerification(onVerified = renderZones, purpose = "配桌") {
  const verificationHints = {
    配桌: "驗證通過後即可選擇用餐區域與桌位",
    開桌: "驗證通過後即可進行開桌",
    登出: "驗證通過後即可登出",
  };
  window.clearInterval(carouselTimer);
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.innerHTML = `
    <form class="verify-card" id="verify-form">
      <h2>通行碼驗證</h2>
      <p>請輸入通行碼</p>
      ${codeField(`${purpose}通行碼`)}
      <p class="hint" id="verify-hint" aria-live="polite">${verificationHints[purpose]}</p>
      <div class="verify-actions"><button class="secondary-button" type="button" id="cancel-verify">取消</button><button class="primary-button" type="submit">驗證</button></div>
    </form>`;
  document.querySelector("#app").appendChild(overlay);
  const input = overlay.querySelector("#code");
  input.focus();
  overlay.querySelector("#cancel-verify").addEventListener("click", () => {
    overlay.remove();
    if (view.querySelector("#carousel")) startCarousel();
    if (purpose === "登出") logoutButton.focus();
  });
  overlay.querySelector("#verify-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(input.value)) {
      overlay.querySelector("#verify-hint").textContent = "通行碼格式錯誤，請輸入 6 碼半形數字";
      input.focus();
      return;
    }
    if (purpose === "登出" && input.value !== loginCode) {
      overlay.querySelector("#verify-hint").textContent = "通行碼錯誤，請重新輸入";
      input.focus();
      return;
    }
    overlay.remove();
    onVerified();
  });
}

function renderZones() {
  setHeaderMode(false);
  setServiceBell(false);
  const zoneNames = Object.keys(zones);
  let selectedZone = zoneNames[0];
  let selectedTable = "";
  view.className = "view zones-view";
  view.innerHTML = `
    <header class="page-heading"><div><h1>選擇用餐區域與桌位</h1></div></header>
    <nav class="zone-tabs" aria-label="用餐區域">${zoneNames.map((zone, index) => `<button class="zone-tab ${index === 0 ? "active" : ""}" data-zone="${zone}">${zone}</button>`).join("")}</nav>
    <section class="table-card"><div class="zone-title"><h2 id="zone-title">${selectedZone}桌位</h2><span>請選擇一個桌位</span></div><div class="tables" id="tables"></div><div class="zone-footer"><button class="cancel-table" id="cancel-table">返回待機</button><button class="confirm-table" id="confirm-table">確認配桌</button></div></section>`;

  const updateSelection = () => {
    document.querySelectorAll(".table-button").forEach((button) => {
      button.classList.toggle("selected", button.dataset.table === selectedTable);
    });
  };
  const drawTables = () => {
    document.querySelector("#zone-title").textContent = `${selectedZone}桌位`;
    document.querySelector("#tables").innerHTML = zones[selectedZone].map((table) => `<button class="table-button" data-table="${table}">${table}</button>`).join("");
    document.querySelectorAll(".table-button").forEach((button) => button.addEventListener("click", () => {
      selectedTable = button.dataset.table;
      updateSelection();
    }));
  };
  drawTables();
  document.querySelectorAll(".zone-tab").forEach((button) => button.addEventListener("click", () => {
    selectedZone = button.dataset.zone;
    selectedTable = "";
    document.querySelectorAll(".zone-tab").forEach((tab) => tab.classList.toggle("active", tab === button));
    drawTables();
  }));
  document.querySelector("#cancel-table").addEventListener("click", renderStandby);
  document.querySelector("#confirm-table").addEventListener("click", () => {
    if (!selectedTable) { showToast("請先選擇桌位"); return; }
    renderAssigned(selectedTable);
  });
}

function renderAssigned(table, opened = false) {
  setHeaderMode(false);
  setServiceBell(true);
  view.className = "view standby-view";
  view.innerHTML = `
    ${carouselMarkup()}
    <footer class="assigned-footer">
      <button class="table-action" id="table-actions" type="button" aria-haspopup="dialog"><strong>${table.replace("桌", "")}</strong></button>
      <button class="start-order" id="start-order" type="button" ${opened ? "" : "disabled"}>${opened ? '開始點餐 <img class="button-icon" src="assets/icons/arrow-right.svg" alt="" aria-hidden="true" />' : "尚未開桌"}</button>
    </footer>`;
  document.querySelector("#table-actions").addEventListener("click", () => renderManagement(table, opened));
  document.querySelector("#start-order").addEventListener("click", () => {
    window.location.href = "menu.html";
  });
  document.querySelector("#service-bell").onclick = renderServiceMenu;
  setupCarouselControls();
  startCarousel();
}

function renderManagement(table, opened) {
  window.clearInterval(carouselTimer);
  const dialog = document.createElement("dialog");
  dialog.className = "verify-card table-actions-dialog";
  dialog.setAttribute("aria-labelledby", "table-actions-title");
  dialog.innerHTML = `
    <form method="dialog">
      <button class="service-menu-close" type="submit" aria-label="關閉桌位選單">×</button>
      <h2 id="table-actions-title">${table}</h2>
      <div class="verify-actions">
        <button class="primary-button" type="submit" value="reassign">重新配桌</button>
        <button class="primary-button" type="submit" value="open" ${opened ? "disabled" : ""}>開桌</button>
      </div>
    </form>`;
  dialog.addEventListener("close", () => {
    const action = dialog.returnValue;
    dialog.remove();
    if (action === "reassign") renderVerification();
    else if (action === "open") renderVerification(() => renderOpenTableStep(table, 1), "開桌");
    else startCarousel();
  });
  view.appendChild(dialog);
  dialog.showModal();
}

function renderOpenTableStep(table, step, data = {}) {
  setServiceBell(false);
  setHeaderMode(false);
  view.className = "view open-table-view";
  const plan = data.plan || "599方案";
  const people = data.people || { adult: 1, senior: 0, child: 1, height: 0 };
  const price = { adult: 599, senior: 539, child: 479, height: 0 };
  const totalPeople = Object.values(people).reduce((sum, value) => sum + value, 0);
  const stepContent = step === 1 ? `
    <h1>開桌</h1><p class="context">A區 ${table}</p>
    <label class="field-label">用餐時間 <input id="meal-time" type="number" min="0" value="${data.mealTime || 120}" /> 分鐘</label>
    <div class="form-actions"><button class="back-button" id="cancel-open" type="button">取消</button><button class="next-button" id="next-open" type="button">下一步</button></div>` : step === 2 ? `
    <h1>選擇方案</h1><p class="context">A區 ${table}</p>
    <div class="plan-grid">${[499, 599, 699, 799, 899, 999].map((value) => `<button class="plan-button ${plan === `${value}方案` ? "selected" : ""}" data-plan="${value}方案" type="button">${value}方案</button>`).join("")}</div>
    <div class="form-actions"><button class="back-button" id="back-open" type="button">上一步</button><button class="next-button" id="next-open" type="button">下一步</button></div>` : `
    <h1>價位與人數</h1>
    <div class="price-plan">${plan}</div>
    <div class="price-list">${[["adult", "成人", price.adult], ["senior", "銀髮", price.senior], ["child", "兒童", price.child], ["height", "120以下", price.height]].map(([key, label, amount]) => `<div class="price-row"><span>${label} $${amount}</span><button class="quantity-button" data-quantity="${key}" data-delta="-1" type="button">−</button><span class="quantity-value" data-value="${key}">${people[key]}</span><button class="quantity-button" data-quantity="${key}" data-delta="1" type="button">＋</button></div>`).join("")}</div>
    <div class="form-actions"><button class="back-button" id="back-open" type="button">上一步</button><button class="confirm-open" id="confirm-open" type="button" ${totalPeople ? "" : "disabled"}>確定開桌</button></div>`;
  view.innerHTML = `<section class="open-table-card">${stepContent}</section>`;
  document.querySelector("#cancel-open")?.addEventListener("click", () => renderAssigned(table));
  document.querySelector("#back-open")?.addEventListener("click", () => renderOpenTableStep(table, step - 1, data));
  document.querySelector("#next-open")?.addEventListener("click", () => {
    if (step === 1) renderOpenTableStep(table, 2, { ...data, mealTime: document.querySelector("#meal-time").value });
    if (step === 2) renderOpenTableStep(table, 3, { ...data, plan: document.querySelector(".plan-button.selected")?.dataset.plan || plan });
  });
  document.querySelectorAll(".plan-button").forEach((button) => button.addEventListener("click", () => {
    document.querySelectorAll(".plan-button").forEach((item) => item.classList.toggle("selected", item === button));
  }));
  document.querySelectorAll(".quantity-button").forEach((button) => button.addEventListener("click", () => {
    const key = button.dataset.quantity;
    people[key] = Math.max(0, people[key] + Number(button.dataset.delta));
    document.querySelector(`[data-value="${key}"]`).textContent = people[key];
  }));
  document.querySelector("#confirm-open")?.addEventListener("click", () => {
    if (!Object.values(people).some(count => count > 0)) return;
    const openedAt = new Date();
    const duration = Number(data.mealTime ?? 120);
    const context = { table, plan, people: { ...people }, openedAt: openedAt.toISOString(), endsAt: new Date(openedAt.getTime() + (Number.isFinite(duration) && duration >= 0 ? duration : 120) * 60000).toISOString(), lastOrderAt: null, nextSubmissionAt: null };
    try {
      sessionStorage.setItem("tablet-order-session", JSON.stringify(context));
      sessionStorage.removeItem("tablet-order-cart-v1");
    } catch { showToast("瀏覽器無法儲存開桌資訊"); }
    renderAssigned(table, true);
    window.clearInterval(carouselTimer);
    orderReminder.showModal();
  });
}

logoutButton.addEventListener("click", () => {
  if (document.querySelector("#app > .overlay, #app > .service-menu-overlay")) return;
  renderVerification(() => {
    toast.classList.remove("show");
    renderLogin();
  }, "登出");
});
orderReminder.addEventListener("cancel", (event) => event.preventDefault());
orderReminder.addEventListener("close", startCarousel);
renderLogin();
