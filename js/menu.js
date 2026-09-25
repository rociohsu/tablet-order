const menu = [
      { name: '優惠套餐', items: [
        { name: '起司牛奶鍋', desc: '由香濃起司搭配牛奶組成濃郁美味，不管是搭海鮮還是肉品，每口都能感受到滿滿的幸福好滋味。', price: 250 },
        { name: '雙人分享和牛鍋物套餐', desc: '精選和牛雙人份，附季節蔬菜盤與白飯', price: 680 },
      ]},
      { name: '精選主餐', items: [
        { name: '養生蔬食鍋', desc: '天然蔬果熬煮湯底，清爽無負擔', price: 220 },
        { name: '麻辣臭臭鍋', desc: '道地川味麻辣湯底，附鴨血豆腐', price: 260 },
        { name: '海鮮總匯鍋', desc: '蝦、蛤蜊、魚片一次滿足', price: 320 },
      ]},
      { name: '義式開胃菜', items: [
        { name: '經典瑪格麗特披薩', desc: '莫札瑞拉起司、新鮮羅勒與番茄醬', price: 220 },
        { name: '香蒜奶油麵包', desc: '現烤法式麵包，塗抹香蒜奶油', price: 90 },
      ]},
      { name: '精緻甜點', items: [
        { name: '提拉米蘇', desc: '手指餅乾浸咖啡酒，層疊馬斯卡彭起司', price: 150 },
        { name: '巴斯克乳酪蛋糕', desc: '表層微焦，內裡綿密濃郁', price: 160 },
      ]},
      { name: '單點', items: [
        { name: '季節時蔬盤', desc: '每日新鮮蔬菜拼盤', price: 120 },
        { name: '古早味紅茶', desc: '無限暢飲，冰熱皆可', price: 40 },
      ]},
    ];
// Prototype data: show the four reference states together. Limits use a one-person demo context.
menu.forEach(category => category.items.forEach(item => { item.image = 'assets/menu.jpg'; item.limit = 3; item.limitLabel = '/1人'; }));
menu[0].items[0].image = null;
menu[0].items.push(
  { name: '麻辣臭臭鍋', desc: '道地川味麻辣湯底，附鴨血豆腐', price: 260, image: 'assets/menu.jpg', limit: 3, limitLabel: '/1人', limitReached: true },
  { name: '海鮮總匯鍋', desc: '蝦、蛤蜊、魚片一次滿足', price: 320, image: 'assets/menu.jpg', limit: 3, limitLabel: '/1人', soldOut: true }
);
const optionGroups = window.TabletProductOptions;
// Product behavior is explicit and independent of its menu category.
menu.forEach((category, ci) => category.items.forEach(item => {
  item.mode = ci < 2 || item.name === '古早味紅茶' ? 'options' : 'simple';
  item.groups = ci < 2 ? optionGroups : item.name === '古早味紅茶' ? optionGroups.find(g => g.id === 'drink').items.find(o => o.id === 'k2').subGroups : [];
}));
Object.assign(menu[0].items[1], {
  mode: 'combo',
  groups: [
    { id: 'included', title: '套餐固定組合', fixed: true, items: [
      { id: 'wagyu', name: '雙人和牛拼盤', desc: '精選和牛雙人份', flavors: ['加辣', '不要蔥'], customNote: true },
      { id: 'vegetables', name: '季節蔬菜盤', desc: '當季新鮮蔬菜', flavors: ['不要香菜'], customNote: true },
    ] },
    { id: 'soup', title: '選擇湯底', mode: 'single', min: 1, max: 1, items: [
      { id: 'clear', name: '昆布清湯', flavors: ['清淡'], customNote: true },
      { id: 'spicy', name: '麻辣湯底', add: 50, flavors: ['不要花椒', '不要蒜'], customNote: true },
      { id: 'milk', name: '起司牛奶湯', add: 80, soldOut: true },
    ] },
    { id: 'staples', title: '選擇副餐', mode: 'multi', min: 2, max: 3, repeat: true, items: [
      { id: 'rice', name: '白飯', customNote: true },
      { id: 'noodle', name: '王子麵', add: 15, flavors: ['煮軟一點'], customNote: true },
      { id: 'glass', name: '冬粉', customNote: false },
    ] },
  ],
});
const $ = (selector) => document.querySelector(selector);
const money = (value) => `NT$ ${value.toLocaleString('zh-TW')}`;
const detail = $('#detail');
let current, selections = {}, comboPreferences = {}, quantity = 1, cart = [];
let orderBatches = [], savedOrderNote = '';
// POS preview rows; replace with the table's POS records when the API is connected.
const posOrderLines = TabletOrderView.posOrderLines;
// The tablet draft is separate from the mobile ordering prototype.
const cartKey = 'tablet-order-cart-v1';
const validOrderLine = line => line && typeof line.name === 'string' && Number.isInteger(line.qty) && line.qty > 0 && Number.isFinite(line.unit) && line.unit >= 0;
try {
  const saved = JSON.parse(sessionStorage.getItem(cartKey) || '[]');
  const draft = Array.isArray(saved) ? saved : saved?.cart;
  if (Array.isArray(draft) && draft.every(validOrderLine)) cart = draft;
  if (Array.isArray(saved?.orders) && saved.orders.every(batch => batch && Array.isArray(batch.lines) && batch.lines.every(validOrderLine) && Number.isFinite(Date.parse(batch.createdAt)))) orderBatches = saved.orders;
  savedOrderNote = String(saved?.note ?? sessionStorage.getItem(`${cartKey}-note`) ?? '').slice(0, 50);
} catch {}
function persistOrderState(nextCart = cart, nextOrders = orderBatches, note = savedOrderNote) {
  // Commit history, draft and note together so refresh cannot duplicate a submitted batch.
  sessionStorage.setItem(cartKey, JSON.stringify({ cart: nextCart, orders: nextOrders, note }));
}
function notify(message) { const toast = $('#menu-toast'); (document.querySelector('dialog[open]') || document.body).append(toast); toast.textContent = message; toast.classList.add('show'); clearTimeout(notify.timer); notify.timer = setTimeout(() => toast.classList.remove('show'), 2600); }
let activeCategory = 0;
const fallbackImage = 'assets/image.jpg';
function useFallbackImage(image) {
  image.onerror = null;
  image.src = fallbackImage;
}
// Optional product fields: image (null for placeholder), soldOut, limit, limitReached.
// Replace the prototype states above with service data when the ordering API is connected.
function productCount(ci, ii) { return [...cart, ...orderBatches.flatMap(batch => batch.lines)].filter(line => line.productId === ci + '-' + ii).reduce((sum, line) => sum + line.qty, 0); }
function remaining(ci, ii) { const item = menu[ci].items[ii]; return item.limit ? Math.max(0, item.limit - productCount(ci, ii)) : 99; }
function productState(ci, ii) { const item = menu[ci].items[ii]; return item.soldOut ? 'sold-out' : item.limitReached || remaining(ci, ii) === 0 ? 'limit-reached' : ''; }
function renderCategory(index) {
  activeCategory = index;
  const oldScroll = $('#categories').scrollLeft;
  $('#categories').innerHTML = menu.map((category, i) => '<button aria-current="' + (i === index) + '" data-category="' + i + '">' + category.name + '</button>').join('');
  $('#categories').scrollLeft = oldScroll;
  const category = menu[index];
  $('#menu-list').innerHTML = '<div class="section-heading"><h2>' + category.name + '</h2></div><div class="dish-grid">' + category.items.map((item, i) => {
    const state = productState(index, i);
    const status = state === 'sold-out' ? '已售完' : state === 'limit-reached' ? '已達點餐上限' : '';
    const src = item.image || fallbackImage;
    return '<button class="dish-card ' + state + '" data-item="' + i + '" ' + (state ? 'disabled' : '') + ' aria-label="' + item.name + (status ? '，' + status : '，查看詳情') + '"><div class="card-media">' + (src ? '<img src="' + src + '" alt="' + item.name + '">' : '') + (status ? '<span class="availability-overlay">' + status + '</span>' : '') + '</div><div class="card-copy"><h3>' + item.name + '</h3><strong class="card-price">' + money(item.price) + '</strong>' + (item.limit ? '<span class="card-limit">限定' + item.limit + '份' + (item.limitLabel || '/本桌') + '</span>' : '<span class="card-limit">不限份數</span>') + '</div></button>';
  }).join('') + '</div>';
  $('#menu-list').scrollTop = 0;
  $('#menu-list').querySelectorAll('.card-media img').forEach(image => image.onerror = () => useFallbackImage(image));
  $('#categories').querySelectorAll('button').forEach(button => button.onclick = () => { renderCategory(Number(button.dataset.category)); const selected = $('#categories').querySelector('[aria-current=true]'); selected.focus({preventScroll:true}); selected.scrollIntoView({block:'nearest',inline:'nearest',behavior:'smooth'}); });
  $('#menu-list').querySelectorAll('button').forEach(button => button.onclick = () => { if (!productState(index, Number(button.dataset.item))) openDetail(index, Number(button.dataset.item)); });
  requestAnimationFrame(updateCategoryArrows);
}
function updateCategoryArrows() {
  const tabs = $('#categories');
  $('#category-prev').disabled = tabs.scrollLeft <= 1;
  $('#category-next').disabled = tabs.scrollLeft + tabs.clientWidth >= tabs.scrollWidth - 1;
}
$('#category-prev').onclick = () => $('#categories').scrollBy({left:-300,behavior:'smooth'});
$('#category-next').onclick = () => $('#categories').scrollBy({left:300,behavior:'smooth'});
$('#categories').addEventListener('scroll',updateCategoryArrows);
window.addEventListener('resize',updateCategoryArrows);
document.querySelectorAll('[data-header-action]').forEach(button => button.onclick = () => notify(button.dataset.headerAction === '中文' ? '目前使用繁體中文' : button.dataset.headerAction + '功能尚未開放'));
function groupsForItem() {
  return current.item.groups || [];
}
function selected(group, option) { return !!selections[group.id]?.[option.id]; }
function activeGroups(groups = groupsForItem()) { return groups.flatMap(group => [group, ...group.items.filter(option => selected(group, option)).flatMap(option => activeGroups(option.subGroups || []))]); }
function summary() {
  const groups = activeGroups();
  return { unit: current.item.price + groups.reduce((total, group) => total + group.items.reduce((sum, option) => sum + (selected(group, option) ? (option.add || 0) * selections[group.id][option.id] : 0), 0), 0), missing: groups.filter(group => current.item.mode === 'combo' ? (group.fixed ? group.items.some(o => o.soldOut) : comboCount(group) < group.min || comboCount(group) > group.max) : group.required && !group.items.some(option => selected(group, option))) };
}
function comboCount(group) { return Object.values(selections[group.id] || {}).reduce((sum, n) => sum + n, 0); }
function comboMarkup(group) {
  const count = comboCount(group);
  return `<fieldset class="combo-group"><legend>${group.title}<small>${group.fixed ? '已包含於套餐・無需選擇' : `必選・已選 ${count}／${group.max} 份・${group.min === group.max ? `請選 ${group.min} 份` : `最少 ${group.min} 份，最多 ${group.max} 份`}${group.repeat ? '，可重複選擇' : ''}`}</small></legend>${group.items.map(option => {
    const qty = selections[group.id]?.[option.id] || 0;
    const key = `${group.id}:${option.id}`;
    const pref = comboPreferences[key] || { flavors: [], note: '', noteOpen: false };
    return `<article class="combo-card ${qty ? 'is-selected' : ''} ${option.soldOut ? 'is-unavailable' : ''}" data-combo-group="${group.id}" data-combo-item="${option.id}"><div class="combo-card-top">${!group.fixed && !group.repeat ? `<input aria-label="選擇${option.name}" type="radio" name="combo-${group.id}" data-combo-select value="${option.id}" ${qty ? 'checked' : ''} ${option.soldOut ? 'disabled' : ''}>` : ''}<div class="combo-copy"><h3>${option.name}</h3>${option.desc ? `<p>${option.desc}</p>` : ''}<span>${option.soldOut ? '已售完' : group.fixed ? '已包含' : option.add ? '+' + money(option.add) : '不加價'}</span></div><img src="${option.image || fallbackImage}" alt="${option.name}"></div>${qty && !option.soldOut ? `<div class="combo-preferences">${(option.flavors || []).map(flavor => `<button type="button" data-combo-flavor="${flavor}" aria-pressed="${pref.flavors.includes(flavor)}">${flavor}</button>`).join('')}${option.customNote ? `<button type="button" data-combo-note-toggle aria-expanded="${pref.noteOpen}" aria-controls="note-${group.id}-${option.id}">+自訂備註</button><textarea id="note-${group.id}-${option.id}" data-combo-note maxlength="200" aria-label="${option.name}備註" placeholder="請輸入此商品的備註" ${pref.noteOpen ? '' : 'hidden'}></textarea>` : ''}${qty > 1 ? '<p class="combo-shared-note">同一商品的口味與備註適用於全部份數</p>' : ''}</div>` : ''}${group.repeat ? `<div class="extra-qty"><button type="button" data-combo-delta="-1" aria-label="減少${option.name}" ${!qty || option.soldOut ? 'disabled' : ''}>−</button><output aria-label="${option.name}份數">${qty}</output><button type="button" data-combo-delta="1" aria-label="增加${option.name}" ${count >= group.max || option.soldOut ? 'disabled' : ''}>＋</button></div>` : ''}</article>`;
  }).join('')}</fieldset>`;
}
function groupMarkup(group) {
  const count = Object.keys(selections[group.id] || {}).length;
  return `<fieldset><legend>${group.title}<small>${group.required ? '必選' : '選填'}・${group.mode === 'single' ? '請選 1 項' : `最多選 ${group.max} 項`}</small></legend>${group.items.map(option => {
    const checked = selected(group, option);
    const disabled = option.soldOut || (!checked && group.mode === 'multi' && count >= group.max);
    return `<label class="option-row"><input type="${group.mode === 'single' ? 'radio' : 'checkbox'}" name="${group.id}" data-group="${group.id}" value="${option.id}" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}><span class="option-name">${option.name}</span><span class="option-price">${option.soldOut ? '已售完' : option.add ? `+${money(option.add)}` : '不加價'}</span></label>${checked && group.qty ? `<div class="extra-qty"><button data-qty-group="${group.id}" data-option="${option.id}" data-delta="-1" aria-label="減少${option.name}" ${selections[group.id][option.id] <= 1 ? 'disabled' : ''}>−</button><span>${selections[group.id][option.id]}</span><button data-qty-group="${group.id}" data-option="${option.id}" data-delta="1" aria-label="增加${option.name}" ${selections[group.id][option.id] >= 99 ? 'disabled' : ''}>＋</button></div>` : ''}${checked && option.subGroups ? `<div class="nested">${option.subGroups.map(groupMarkup).join('')}</div>` : ''}`;
  }).join('')}</fieldset>`;
}
function renderOptions() {
  const focused = document.activeElement;
  const focusKey = focused?.matches('input[data-group]') ? `input[data-group="${focused.dataset.group}"][value="${focused.value}"]` : focused?.matches('[data-qty-group]') ? `[data-qty-group="${focused.dataset.qtyGroup}"][data-option="${focused.dataset.option}"][data-delta="${focused.dataset.delta}"]` : null;
  $('#option-groups').innerHTML = groupsForItem().map(current.item.mode === 'combo' ? comboMarkup : groupMarkup).join('');
  $('#option-groups').querySelectorAll('[data-combo-note]').forEach(input => { const card = input.closest('[data-combo-group]'); input.value = comboPreferences[`${card.dataset.comboGroup}:${card.dataset.comboItem}`]?.note || ''; });
  $('#option-groups').querySelectorAll('img').forEach(image => image.onerror = () => useFallbackImage(image));
  if (focusKey) $('#option-groups').querySelector(focusKey)?.focus({ preventScroll: true });
  updateTotal();
}
function updateTotal() {
  const { unit, missing } = summary();
  $('#quantity').textContent = quantity;
  $('#minus').disabled = quantity <= 1;
  $('#plus').disabled = quantity >= remaining(current.ci, current.ii);
  $('#add-cart').disabled = missing.length > 0 || !!productState(current.ci, current.ii) || quantity > remaining(current.ci, current.ii);
  $('#add-cart').textContent = `加入購物車・${money(unit * quantity)}`;
  $('#validation').textContent = missing.length ? `尚須選擇：${missing.map(g => g.title).join('、')}` : '已完成選擇';
}
function openDetail(ci, ii) {
  current = { ci, ii, item: menu[ci].items[ii] }; selections = {}; comboPreferences = {}; quantity = 1;
  const isCombo = current.item.mode === 'combo';
  detail.classList.toggle('combo-mode', isCombo);
  detail.dataset.productMode = current.item.mode;
  groupsForItem().filter(g => g.fixed).forEach(g => { selections[g.id] = Object.fromEntries(g.items.filter(o => !o.soldOut).map(o => [o.id, 1])); });
  const flavorSection = $('.flavor-section');
  if (!$('#meal-flavor-heading')) { const heading = document.createElement('h3'); heading.id = 'meal-flavor-heading'; flavorSection.prepend(heading); }
  $('#meal-flavor-heading').textContent = isCombo ? '整份套餐備註' : '口味與備註';
  (isCombo ? $('.dish-copy') : $('.options-scroll')).insertBefore(flavorSection, isCombo ? null : $('#option-groups'));
  let comboPrice = $('#combo-base-price');
  if (!comboPrice) { comboPrice = document.createElement('strong'); comboPrice.id = 'combo-base-price'; $('#detail-description').after(comboPrice); }
  comboPrice.textContent = money(current.item.price);
  comboPrice.hidden = !isCombo || current.item.price === 0;
  let quantityLabel = $('#quantity-label');
  if (!quantityLabel) { quantityLabel = document.createElement('span'); quantityLabel.id = 'quantity-label'; $('.detail-footer .stepper').before(quantityLabel); }
  quantityLabel.textContent = isCombo ? '套餐數量' : '數量';
  $('#detail-category').textContent = menu[ci].name;
  $('#detail-title').textContent = current.item.name;
  $('#detail-option-title').textContent = current.item.name;
  $('#detail-description').textContent = current.item.desc;
  $('#detail-price').textContent = money(current.item.price);
  $('#detail-limit').textContent = current.item.limit ? `限定${current.item.limit}份${current.item.limitLabel || '/本桌'}` : '不限份數';
  $('.dish-photo').alt = current.item.name;
  $('.dish-photo').hidden = false;
  $('.dish-photo').onerror = () => useFallbackImage($('.dish-photo'));
  $('.dish-photo').src = current.item.image || fallbackImage;
  $('#meal-note').value = '';
  $('#meal-note').hidden = true;
  document.querySelectorAll('.flavor-option').forEach(button => button.setAttribute('aria-pressed', 'false'));
  $('#custom-flavor').setAttribute('aria-expanded', 'false');
  renderOptions(); detail.showModal();
  detail.querySelectorAll('.options-scroll,.detail-summary,.detail-layout').forEach(el => el.scrollTop = 0);
  $('#close-detail').focus();
}
$('#option-groups').addEventListener('change', event => {
  const input = event.target;
  if (!input.matches('input[data-group]')) return;
  const group = activeGroups().find(g => g.id === input.dataset.group);
  const option = group?.items.find(o => o.id === input.value);
  if (!group || !option || option.soldOut) return;
  if (group.mode === 'single') {
    // Clear child choices when their parent changes, so hidden selections never leak into the draft.
    function clearChildren(options) { options.forEach(o => (o.subGroups || []).forEach(g => { delete selections[g.id]; clearChildren(g.items); })); }
    clearChildren(group.items);
    selections[group.id] = { [option.id]: 1 };
  } else {
    selections[group.id] ||= {};
    if (input.checked && Object.keys(selections[group.id]).length < group.max) selections[group.id][option.id] = 1;
    else delete selections[group.id][option.id];
  }
  renderOptions();
});
$('#option-groups').addEventListener('click', event => {
  const button = event.target.closest('[data-qty-group]'); if (!button) return;
  const values = selections[button.dataset.qtyGroup];
  values[button.dataset.option] = Math.max(1, Math.min(99, values[button.dataset.option] + Number(button.dataset.delta))); renderOptions();
});
$('#minus').onclick = () => { quantity = Math.max(1, quantity - 1); updateTotal(); };
$('#plus').onclick = () => { quantity = Math.min(remaining(current.ci, current.ii), quantity + 1); updateTotal(); };
$('#close-detail').onclick = () => detail.close();
$('#add-cart').onclick = () => {
  const { unit, missing } = summary(); if (missing.length || productState(current.ci, current.ii) || quantity > remaining(current.ci, current.ii)) return;
  const options = activeGroups().flatMap(group => group.items.filter(option => selected(group, option)).map(option => { const pref = comboPreferences[`${group.id}:${option.id}`]; return { group: group.title, id: option.id, name: option.name, quantity: selections[group.id][option.id], surcharge: option.add || 0, fixed: !!group.fixed, flavors: pref?.flavors || [], note: pref?.noteOpen ? pref.note.trim() : '' }; }));
  cart.push({ productId: `${current.ci}-${current.ii}`, mode: current.item.mode, name: current.item.name, unit, qty: quantity, options, flavors: [...document.querySelectorAll('[data-flavor][aria-pressed="true"]')].map(button => button.dataset.flavor), note: $('#meal-note').hidden ? '' : $('#meal-note').value.trim() });
  let persisted = true; try { persistOrderState(); } catch { persisted = false; }
  detail.close(); renderCategory(activeCategory); renderOrderStatus(); notify(persisted ? `已加入 ${quantity} 份${current.item.name}` : '已加入餐點；瀏覽器無法儲存，重新整理將遺失');
};
function handleComboEvent(event) {
  const card = event.target.closest('[data-combo-group]');
  if (!card || current.item.mode !== 'combo') return;
  const group = groupsForItem().find(g => g.id === card.dataset.comboGroup);
  const option = group.items.find(o => o.id === card.dataset.comboItem);
  if (option.soldOut) return;
  const key = `${group.id}:${option.id}`;
  const pref = comboPreferences[key] ||= { flavors: [], note: '', noteOpen: false };
  const target = event.target;
  if (event.type === 'input') { if (target.matches('[data-combo-note]')) pref.note = target.value; return; }
  if (event.type === 'change') {
    if (!target.matches('[data-combo-select]') || group.fixed) return;
    group.items.forEach(o => { if (o.id !== option.id) delete comboPreferences[`${group.id}:${o.id}`]; });
    selections[group.id] = { [option.id]: 1 };
  } else if (target.matches('[data-combo-delta]')) {
    const delta = Number(target.dataset.comboDelta);
    if (group.fixed || !group.repeat || delta > 0 && comboCount(group) >= group.max) return;
    selections[group.id] ||= {};
    const next = Math.max(0, (selections[group.id][option.id] || 0) + delta);
    if (next) selections[group.id][option.id] = next;
    else { delete selections[group.id][option.id]; delete comboPreferences[key]; }
  } else if (target.matches('[data-combo-flavor]')) {
    const flavor = target.dataset.comboFlavor;
    pref.flavors = pref.flavors.includes(flavor) ? pref.flavors.filter(f => f !== flavor) : [...pref.flavors, flavor];
  } else if (target.matches('[data-combo-note-toggle]')) pref.noteOpen = !pref.noteOpen;
  else return;
  const scroll = $('.options-scroll').scrollTop;
  const selector = target.matches('[data-combo-select]') ? '[data-combo-select]' : target.matches('[data-combo-delta]') ? `[data-combo-delta="${target.dataset.comboDelta}"]` : target.matches('[data-combo-flavor]') ? `[data-combo-flavor="${target.dataset.comboFlavor}"]` : pref.noteOpen ? '[data-combo-note]' : '[data-combo-note-toggle]';
  renderOptions();
  const updated = $('#option-groups').querySelector(`[data-combo-group="${group.id}"][data-combo-item="${option.id}"]`);
  updated?.querySelector(selector)?.focus({ preventScroll: true });
  $('.options-scroll').scrollTop = scroll;
}
['click', 'change', 'input'].forEach(type => $('#option-groups').addEventListener(type, handleComboEvent));
[detail].forEach(dialog => dialog.addEventListener('click', event => { const rect = dialog.getBoundingClientRect(); if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close(); }));
renderCategory(0);

function renderOrderStatus() {
  // Reference mockup copy for this preview; keep saved table-session data intact.
  $('#status-table').textContent = TabletOrderView.dining[0][1];
  $('#status-plan').textContent = TabletOrderView.dining[1][1];
  $('#status-people').textContent = TabletOrderView.dining[2][1];
  $('#status-opened').textContent = TabletOrderView.dining[3][1];
  $('#status-last').textContent = '10:30';
  $('#status-end').textContent = '11:00';
  $('#status-next').textContent = '05:00';
  const count = cart.reduce((sum,line)=>sum+line.qty,0);
  $('#cart-count').textContent = count;
  $('#view-cart').disabled = count === 0;
}
const cartDialog = $('#cart-dialog');
$('#order-note').value = savedOrderNote;
const escapeCartText = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
function canIncreaseCartLine(line) {
  const [ci, ii] = String(line.productId).split('-').map(Number);
  return !!menu[ci]?.items[ii] && !productState(ci, ii) && line.qty < 99;
}
function orderPreferences(line) {
  return [
      ...(line.options || []).map(option => `${option.group}：${option.name}${option.quantity > 1 ? ` × ${option.quantity}` : ''}${option.flavors?.length ? `（${option.flavors.join('、')}）` : ''}${option.note ? `／${option.note}` : ''}`),
      ...(line.flavors || []), line.note
    ].filter(Boolean);
}
function renderCart() {
  $('#cart-items').innerHTML = cart.length ? cart.map((line, index) => {
    const preferences = orderPreferences(line);
    return `<article class="cart-item" data-cart-index="${index}"><div class="cart-item-copy"><h3>${escapeCartText(line.name)}</h3>${preferences.length ? `<p>${preferences.map(escapeCartText).join('<br>')}</p>` : ''}</div><div class="cart-item-controls"><div class="cart-quantity"><button data-cart-action="minus" aria-label="減少${escapeCartText(line.name)}數量" ${line.qty <= 1 ? 'disabled' : ''}>−</button><output aria-label="${escapeCartText(line.name)}數量">${line.qty}</output><button data-cart-action="plus" aria-label="增加${escapeCartText(line.name)}數量" ${canIncreaseCartLine(line) ? '' : 'disabled'}>＋</button></div><strong class="cart-item-price">${money(line.unit * line.qty)}</strong><button class="cart-delete" data-cart-action="delete" aria-label="刪除${escapeCartText(line.name)}"><img src="assets/icons/Icon_delete.svg" alt=""></button></div></article>`;
  }).join('') : '<div class="cart-empty"><img src="assets/icons/Icon_order.svg" alt=""><h3>購物車尚無餐點</h3></div>';
  $('#cart-total').textContent = `共${cart.reduce((sum, line) => sum + line.qty, 0)}份・${money(cart.reduce((sum, line) => sum + line.unit * line.qty, 0))}`;
  $('#clear-cart').disabled = $('#cart-checkout').disabled = cart.length === 0;
}
function saveCartChanges() {
  try { persistOrderState(); } catch { notify('瀏覽器無法儲存，重新整理將遺失變更'); }
  renderCart(); renderCategory(activeCategory); renderOrderStatus();
}
$('#view-cart').onclick = () => { renderCart(); cartDialog.showModal(); $('#close-cart').focus(); };
$('#close-cart').onclick = () => cartDialog.close();
cartDialog.addEventListener('click', event => { if (event.target === cartDialog) cartDialog.close(); });
$('#cart-items').addEventListener('click', event => {
  const button = event.target.closest('[data-cart-action]');
  if (!button || button.disabled) return;
  const index = Number(button.closest('[data-cart-index]').dataset.cartIndex);
  const line = cart[index];
  if (!line) return;
  const action = button.dataset.cartAction;
  const scrollTop = $('.cart-scroll').scrollTop;
  if (action === 'delete') cart.splice(index, 1);
  else if (action === 'plus' && canIncreaseCartLine(line)) line.qty++;
  else if (action === 'minus' && line.qty > 1) line.qty--;
  saveCartChanges();
  const row = $('#cart-items').querySelector(`[data-cart-index="${Math.min(index, cart.length - 1)}"]`);
  const next = row?.querySelector(`[data-cart-action="${action}"]:not(:disabled)`) || row?.querySelector('button:not(:disabled)') || $('#close-cart');
  next.focus({ preventScroll: true }); $('.cart-scroll').scrollTop = scrollTop;
});
$('#clear-cart').onclick = () => { cart = []; $('#order-note').value = ''; saveOrderNote(); saveCartChanges(); $('#close-cart').focus(); };
function saveOrderNote() {
  savedOrderNote = $('#order-note').value.slice(0, 50);
  try { persistOrderState(); } catch { notify('瀏覽器無法儲存整單備註'); }
}
$('#order-note').addEventListener('input', saveOrderNote);
const submitOrderDialog = $('#submit-order-dialog');
$('#cart-checkout').onclick = () => {
  if (!cart.length) return;
  saveOrderNote();
  submitOrderDialog.showModal();
};
$('#continue-ordering').onclick = () => {
  submitOrderDialog.close();
  cartDialog.close();
};
$('#confirm-order').onclick = () => {
  if (!cart.length) return;
  const batch = { createdAt: new Date().toISOString(), note: $('#order-note').value.trim().slice(0, 50), lines: JSON.parse(JSON.stringify(cart)) };
  const nextOrders = [...orderBatches, batch];
  try { persistOrderState([], nextOrders, ''); } catch {
    submitOrderDialog.close();
    notify('無法儲存點餐記錄，請重試；購物車已保留');
    return;
  }
  orderBatches = nextOrders; cart = []; savedOrderNote = ''; $('#order-note').value = '';
  submitOrderDialog.close();
  cartDialog.close();
  renderCart(); renderCategory(activeCategory); renderOrderStatus();
  openOrderHistory();
};
const orderHistoryDialog = $('#order-history-dialog');
function historyLineMarkup(line) {
  const preferences = orderPreferences(line);
  return `<article class="history-line"><div><h4>${escapeCartText(line.name)}${line.qty < 0 ? '<span class="history-removed">刪除</span>' : ''}</h4>${preferences.length ? `<p>${preferences.map(escapeCartText).join('<br>')}</p>` : ''}</div><div class="history-line-total"><strong aria-label="${line.qty}份">${line.qty}</strong><span>${money(line.unit * line.qty)}</span></div></article>`;
}
function renderOrderHistory() {
  // Fill missing preview groups without persisting demo orders or affecting limits.
  const displayBatches = TabletOrderView.batches(orderBatches);
  const totalFor = lines => lines.reduce((sum, line) => sum + line.unit * line.qty, 0);
  $('#order-history-list').innerHTML = displayBatches.map((batch, index) => `<section class="history-batch" aria-labelledby="history-batch-${index}"><header class="history-batch-header"><h3 id="history-batch-${index}">第${index + 1}次點餐</h3>${batch.demo ? `<time datetime="${batch.time}">${batch.time}</time>` : `<time datetime="${escapeCartText(batch.createdAt)}">${new Date(batch.createdAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })}</time>`}</header><div class="history-lines">${batch.lines.map(historyLineMarkup).join('')}</div>${batch.note ? `<p class="history-note">整單備註：${escapeCartText(batch.note)}</p>` : ''}<p class="history-subtotal">小計 ${money(totalFor(batch.lines))}</p></section>`).join('')
    + `<section class="history-batch history-pos" aria-labelledby="history-pos-title"><header class="history-batch-header"><h3 id="history-pos-title">POS點餐</h3><time datetime="15:40">15:40</time></header><div class="history-lines">${posOrderLines.map(historyLineMarkup).join('')}</div><p class="history-subtotal">小計 ${money(totalFor(posOrderLines))}</p></section>`;
  const allLines = [...displayBatches.flatMap(batch => batch.lines), ...posOrderLines];
  $('#order-history-total').textContent = `共${allLines.reduce((sum, line) => sum + line.qty, 0)}份・總計${money(totalFor(allLines))}`;
  $('#history-checkout').disabled = allLines.length === 0;
}
function openOrderHistory() {
  renderOrderHistory();
  orderHistoryDialog.showModal();
  $('#order-history-list').scrollTop = 0;
  $('#history-continue').focus();
}
$('#view-order-history').onclick = openOrderHistory;
$('#close-order-history').onclick = $('#history-continue').onclick = () => orderHistoryDialog.close();
orderHistoryDialog.addEventListener('click', event => { if (event.target === $('.history-overlay')) orderHistoryDialog.close(); });
$('#history-checkout').onclick = () => {
  try { persistOrderState(); } catch { notify('無法儲存訂單，請重試'); return; }
  window.location.href = 'payment.html';
};
if (new URLSearchParams(location.search).get('view') === 'history') openOrderHistory();
renderOrderStatus();

// Flavor preferences and the custom note can be selected independently.
document.querySelectorAll('[data-flavor]').forEach(button => button.onclick = () => {
  const selected = button.getAttribute('aria-pressed') !== 'true';
  button.setAttribute('aria-pressed', String(selected));
});
$('#custom-flavor').onclick = () => {
  const selected = $('#custom-flavor').getAttribute('aria-pressed') !== 'true';
  $('#custom-flavor').setAttribute('aria-pressed', String(selected));
  $('#custom-flavor').setAttribute('aria-expanded', String(selected));
  $('#meal-note').hidden = !selected;
  if (selected) $('#meal-note').focus();
};
