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
const optionGroups = [
      { id: 'base', title: '選料底', required: true, mode: 'single', max: 1, hint: '必須選 1 項', items: [
        { id: 'b1', name: '肉好好', img: true },
        { id: 'b2', name: '菜好好', soldOut: true, img: true },
        { id: 'b3', name: '漿漿好', add: 50, img: true },
        { id: 'b4', name: '總匯好', add: 80, img: true },
      ]},
      { id: 'meat', title: '選肉品', required: true, mode: 'single', max: 1, hint: '必須選 1 項', items: [
        { id: 'm1', name: '雞肉', img: true },
        { id: 'm2', name: '豬肉', add: 20, img: true },
        { id: 'm3', name: '牛肉', add: 60, img: true },
      ]},
      { id: 'side', title: '選副餐', required: true, mode: 'multi', max: 2, hint: '最多可選 2 項', items: [
        { id: 's1', name: '白飯', img: true },
        { id: 's2', name: '冬粉', add: 10, img: true },
        { id: 's3', name: '王子麵', add: 15, img: true },
      ]},
      { id: 'extra', title: '加購火鍋料', mode: 'multi', max: 2, qty: true, hint: '最多可選 2 項', items: [
        { id: 'e1', name: '金針菇', add: 15, img: true },
        { id: 'e2', name: '黑木耳', add: 15, img: true },
        { id: 'e3', name: '芋香貢丸', add: 30, img: true },
      ]},
      { id: 'drink', title: '選飲料', required: true, mode: 'single', max: 1, hint: '最多可選 1 項', items: [
        { id: 'k1', name: '檸檬冬瓜冰沙', img: true },
        { id: 'k2', name: '紅茶', img: true, subGroups: [
          { id: 'ice', title: '冰量', required: true, mode: 'single', hint: '必須選 1 項', items: [
            { id: 'i1', name: '去冰' }, { id: 'i2', name: '微冰' }, { id: 'i3', name: '正常冰' },
          ]},
          { id: 'topping', title: '加料', mode: 'multi', max: 2, hint: '最多可選 2 項', items: [
            { id: 't1', name: '珍珠', add: 0 }, { id: 't2', name: '綠茶凍', add: 0 }, { id: 't3', name: '杏仁凍', add: 0 },
          ]},
        ]},
        { id: 'k3', name: '黑豆茶', img: true },
      ]},
    ];
const $ = (selector) => document.querySelector(selector);
const money = (value) => `NT$ ${value.toLocaleString('zh-TW')}`;
const detail = $('#detail');
let current, selections = {}, quantity = 1, cart = [];
// The tablet draft is separate from the mobile ordering prototype.
const cartKey = 'tablet-order-cart-v1';
try { const saved = JSON.parse(sessionStorage.getItem(cartKey) || '[]'); if (Array.isArray(saved) && saved.every(x => Number.isInteger(x.qty) && x.qty > 0 && Number.isFinite(x.unit))) cart = saved; } catch {}
function notify(message) { const toast = $('#menu-toast'); toast.textContent = message; toast.classList.add('show'); clearTimeout(notify.timer); notify.timer = setTimeout(() => toast.classList.remove('show'), 2600); }
function renderCategory(index) {
  $('#categories').innerHTML = menu.map((category, i) => `<button aria-current="${i === index}" data-category="${i}">${category.name}</button>`).join('');
  const category = menu[index];
  $('#menu-list').innerHTML = `<div class="section-heading"><h2>${category.name}</h2><span>${category.items.length} 道餐點</span></div><div class="dish-grid">${category.items.map((item, i) => `<button class="dish-card" data-item="${i}" aria-label="查看${item.name}詳情"><div class="card-copy"><h3>${item.name}</h3><p>${item.desc}</p><div class="card-price"><strong>${money(item.price)}</strong><span class="card-plus" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 3v18M3 12h18"/></svg></span></div></div><img src="assets/menu.jpg" alt="${item.name}"></button>`).join('')}</div>`;
  $('#menu-list').scrollTop = 0;
  $('#categories').querySelectorAll('button').forEach(button => button.onclick = () => { renderCategory(Number(button.dataset.category)); $('#categories').querySelector('[aria-current=true]').focus(); });
  $('#menu-list').querySelectorAll('button').forEach(button => button.onclick = () => openDetail(index, Number(button.dataset.item)));
}
function groupsForItem() {
  if (current.ci < 2) return optionGroups;
  if (current.item.name === '古早味紅茶') return optionGroups.find(g => g.id === 'drink').items.find(o => o.id === 'k2').subGroups;
  return [];
}
function selected(group, option) { return !!selections[group.id]?.[option.id]; }
function activeGroups(groups = groupsForItem()) { return groups.flatMap(group => [group, ...group.items.filter(option => selected(group, option)).flatMap(option => activeGroups(option.subGroups || []))]); }
function summary() {
  const groups = activeGroups();
  return { unit: current.item.price + groups.reduce((total, group) => total + group.items.reduce((sum, option) => sum + (selected(group, option) ? (option.add || 0) * selections[group.id][option.id] : 0), 0), 0), missing: groups.filter(group => group.required && !group.items.some(option => selected(group, option))) };
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
  $('#option-groups').innerHTML = groupsForItem().map(groupMarkup).join('') || '<p>此餐點無須選擇其他選項，可直接加入購物車。</p>';
  if (focusKey) $('#option-groups').querySelector(focusKey)?.focus({ preventScroll: true });
  updateTotal();
}
function updateTotal() {
  const { unit, missing } = summary();
  $('#quantity').textContent = quantity;
  $('#minus').disabled = quantity <= 1;
  $('#plus').disabled = quantity >= 99;
  $('#add-cart').disabled = missing.length > 0;
  $('#add-cart').textContent = `加入購物車・${money(unit * quantity)}`;
  $('#validation').textContent = missing.length ? `尚須選擇：${missing.map(g => g.title).join('、')}` : '已完成選擇';
}
function openDetail(ci, ii) {
  current = { ci, ii, item: menu[ci].items[ii] }; selections = {}; quantity = 1;
  $('#detail-category').textContent = menu[ci].name;
  $('#detail-title').textContent = current.item.name;
  $('#detail-description').textContent = current.item.desc;
  $('#detail-price').textContent = money(current.item.price);
  $('.dish-photo').alt = current.item.name;
  $('#meal-note').value = '';
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
$('#plus').onclick = () => { quantity = Math.min(99, quantity + 1); updateTotal(); };
$('#close-detail').onclick = () => detail.close();
$('#add-cart').onclick = () => {
  const { unit, missing } = summary(); if (missing.length) return;
  const options = activeGroups().flatMap(group => group.items.filter(option => selected(group, option)).map(option => ({ group: group.title, id: option.id, name: option.name, quantity: selections[group.id][option.id], surcharge: option.add || 0 })));
  cart.push({ productId: `${current.ci}-${current.ii}`, name: current.item.name, unit, qty: quantity, options, note: $('#meal-note').value.trim() });
  let persisted = true; try { sessionStorage.setItem(cartKey, JSON.stringify(cart)); } catch { persisted = false; }
  detail.close(); notify(persisted ? `已加入 ${quantity} 份${current.item.name}` : '已加入餐點；瀏覽器無法儲存，重新整理將遺失');
};
const serviceDialog = $('#service-dialog'); let serviceChoice = '';
$('#service-bell').onclick = () => {
  serviceChoice = ''; $('#confirm-service').disabled = true;
  serviceDialog.querySelector('.service-options').innerHTML = ['清理桌面', '詢問菜單', '出餐延遲'].map(name => `<button class="service-option" aria-pressed="false">${name}</button>`).join('');
  serviceDialog.showModal();
};
serviceDialog.querySelector('.service-options').onclick = event => {
  const button = event.target.closest('button'); if (!button) return; serviceChoice = button.textContent;
  serviceDialog.querySelectorAll('.service-option').forEach(el => { el.classList.toggle('selected', el === button); el.setAttribute('aria-pressed', String(el === button)); }); $('#confirm-service').disabled = false;
};
$('#close-service').onclick = () => serviceDialog.close();
$('#confirm-service').onclick = () => { serviceDialog.close(); notify(`已送出：${serviceChoice}`); };
[detail, serviceDialog].forEach(dialog => dialog.addEventListener('click', event => { const rect = dialog.getBoundingClientRect(); if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close(); }));
renderCategory(0);
