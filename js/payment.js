(() => {
  const $ = selector => document.querySelector(selector);
  const money = value => `NT$ ${value.toLocaleString('zh-TW')}`;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const read = (key, fallback) => { try { return JSON.parse(sessionStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const context = read('tablet-order-session', {});
  const saved = read('tablet-order-cart-v1', {});
  const orders = Array.isArray(saved.orders) ? saved.orders.filter(batch => batch && Array.isArray(batch.lines) && batch.lines.every(line => line && typeof line.name === 'string' && Number.isInteger(line.qty) && line.qty > 0 && Number.isFinite(line.unit) && line.unit >= 0)) : [];
  const grouped = new Map();
  const displayBatches = TabletOrderView.batches(orders);
  const preferences = line => [
    ...(line.options || []).map(option => `${option.group}：${option.name}${option.quantity > 1 ? ` × ${option.quantity}` : ''}${option.flavors?.length ? `（${option.flavors.join('、')}）` : ''}${option.note ? `／${option.note}` : ''}`),
    ...(line.flavors || []), line.note
  ].filter(Boolean);
  for (const line of [...displayBatches.flatMap(batch => batch.lines), ...TabletOrderView.posOrderLines]) {
    // Keep distinct prices and customizations separate; subtract POS cancellations.
    const key = JSON.stringify([line.name, line.unit, preferences(line)]);
    if (grouped.has(key)) grouped.get(key).qty += line.qty;
    else grouped.set(key, { ...line });
  }
  const lines = [...grouped.values()].filter(line => line.qty > 0);
  const subtotal = lines.reduce((sum, line) => sum + line.unit * line.qty, 0);
  $('#dining-info').innerHTML = TabletOrderView.dining.map(([label,value]) => `<div><dt>${label}</dt><dd>${escape(value)}</dd></div>`).join('');
  $('#item-count').textContent = `共 ${lines.reduce((sum,line) => sum + line.qty, 0)} 份`;
  $('#payment-items').innerHTML = lines.map(line => {
    const description = preferences(line);
    return `<article class="payment-line"><div><h4>${escape(line.name)}</h4>${description.length ? `<p>${description.map(escape).join('<br>')}</p>` : ''}</div><div class="line-amount">${money(line.unit * line.qty)}<span>× ${line.qty}</span></div></article>`;
  }).join('') || '<p class="payment-hint">尚無餐點紀錄。</p>';
  const notes = [...new Set(displayBatches.map(batch => batch.note).filter(Boolean))];
  if (notes.length) $('#payment-items').innerHTML += `<p class="batch-note">整單備註：${notes.map(escape).join('；')}</p>`;
  $('#view-order-history').onclick = () => { location.href = 'menu.html?view=history'; };
  window.tabletCheckoutLines = lines;
  window.updateTabletCheckoutItems = rows => {
    const aggregated=new Map();
    rows.forEach(row=>{
      const description=(row.options || []).flatMap(option=>[option.label,option.detail]).filter(Boolean);
      if(row.note && !description.includes(row.note)) description.push(row.note);
      const key=JSON.stringify([row.name,row.price,description]);
      if(aggregated.has(key)) aggregated.get(key).qty++;
      else aggregated.set(key,{name:row.name,price:row.price,description,qty:1});
    });
    $('#item-count').textContent=`共 ${rows.length} 份`;
    $('#payment-items').innerHTML=[...aggregated.values()].map(row=>`<article class="payment-line"><div><h4>${escape(row.name)}</h4>${row.description.length ? `<p>${row.description.map(escape).join('<br>')}</p>` : ''}</div><div class="line-amount">${money(row.price*row.qty)}<span>× ${row.qty}</span></div></article>`).join('') || '<p class="payment-hint">尚無餐點紀錄。</p>';
    if(notes.length) $('#payment-items').innerHTML+=`<p class="batch-note">整單備註：${notes.map(escape).join('；')}</p>`;
  };
  $('#payment-form').onsubmit = event => event.preventDefault();
})();
