const view = document.querySelector("#view");
const toast = document.querySelector("#toast");

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

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function codeField(label = "請輸入通行碼") {
  return `<input class="code-input" id="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" aria-label="${label}" placeholder="••••••" />`;
}

function renderLogin() {
  view.className = "view login-view";
  view.innerHTML = `
    <form class="login-card" id="login-form">
      <h1>桌邊自助點餐系統</h1>
      <p>請輸入店內通行碼，開始今日服務</p>
      ${codeField()}
      <p class="hint" id="login-hint">6 碼半形數字店代碼</p>
      <button class="primary-button" type="submit">確定登入</button>
    </form>`;

  const input = document.querySelector("#code");
  input.focus();
  document.querySelector("#login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(input.value)) {
      document.querySelector("#login-hint").textContent = "請輸入 6 碼半形數字店代碼";
      input.focus();
      return;
    }
    renderStandby();
  });
}

function renderStandby() {
  view.className = "view standby-view";
  view.innerHTML = `
    <section class="carousel" id="carousel" aria-label="待機輪播圖">
      ${banners.map((banner, index) => `
        <article class="slide ${index === 0 ? "active" : ""}" style="background-image:url('${banner.image}')"></article>`).join("")}
      <div class="dots" aria-label="輪播頁數">
        ${banners.map((_, index) => `<button class="dot ${index === 0 ? "active" : ""}" data-slide="${index}" aria-label="第 ${index + 1} 張"></button>`).join("")}
      </div>
    </section>
    <footer class="standby-footer">
      <div class="table-status"><strong>尚未配桌</strong>請先完成配桌，開始使用點餐服務</div>
      <button class="service-button" id="assign-table">配桌 <img class="button-icon" src="assets/icons/arrow-right.svg" alt="" aria-hidden="true" /></button>
    </footer>`;

  document.querySelectorAll(".dot").forEach((dot) => dot.addEventListener("click", () => goToSlide(Number(dot.dataset.slide))));
  document.querySelector("#assign-table").addEventListener("click", renderVerification);
  setupSwipe();
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

function setupSwipe() {
  const carousel = document.querySelector("#carousel");
  let startX = 0;
  carousel.addEventListener("pointerdown", (event) => { startX = event.clientX; carousel.setPointerCapture(event.pointerId); });
  carousel.addEventListener("pointerup", (event) => {
    const distance = event.clientX - startX;
    if (Math.abs(distance) > 45) goToSlide(currentSlide + (distance < 0 ? 1 : -1));
  });
}

function renderVerification() {
  window.clearInterval(carouselTimer);
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.innerHTML = `
    <form class="verify-card" id="verify-form">
      <h2>通行碼驗證</h2>
      <p>配桌前請輸入 6 碼店代碼</p>
      ${codeField("配桌通行碼")}
      <p class="hint" id="verify-hint">驗證通過後即可選擇用餐區域與桌位</p>
      <div class="verify-actions"><button class="secondary-button" type="button" id="cancel-verify">取消</button><button class="primary-button" type="submit">驗證</button></div>
    </form>`;
  document.querySelector("#app").appendChild(overlay);
  const input = overlay.querySelector("#code");
  input.focus();
  overlay.querySelector("#cancel-verify").addEventListener("click", () => { overlay.remove(); startCarousel(); });
  overlay.querySelector("#verify-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(input.value)) {
      overlay.querySelector("#verify-hint").textContent = "通行碼格式錯誤，請輸入 6 碼半形數字";
      input.focus();
      return;
    }
    overlay.remove();
    renderZones();
  });
}

function renderZones() {
  const zoneNames = Object.keys(zones);
  let selectedZone = zoneNames[0];
  let selectedTable = "";
  view.className = "view zones-view";
  view.innerHTML = `
    <header class="page-heading"><div><h1>選擇用餐區域與桌位</h1></div></header>
    <nav class="zone-tabs" aria-label="用餐區域">${zoneNames.map((zone, index) => `<button class="zone-tab ${index === 0 ? "active" : ""}" data-zone="${zone}">${zone}</button>`).join("")}</nav>
    <section class="table-card"><div class="zone-title"><h2 id="zone-title">${selectedZone}桌位</h2><span>請選擇一個桌位</span></div><div class="tables" id="tables"></div><div class="zone-footer"><button class="cancel-table" id="cancel-table">返回待機</button><button class="confirm-table" id="confirm-table">確認配桌</button></div></section>`;

  const drawTables = () => {
    document.querySelector("#zone-title").textContent = `${selectedZone}桌位`;
    document.querySelector("#tables").innerHTML = zones[selectedZone].map((table) => `<button class="table-button ${table === selectedTable ? "selected" : ""}" data-table="${table}">${table}</button>`).join("");
    document.querySelectorAll(".table-button").forEach((button) => button.addEventListener("click", () => { selectedTable = button.dataset.table; drawTables(); }));
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
    showToast(`${selectedTable} 配桌成功`);
  });
}

renderLogin();
