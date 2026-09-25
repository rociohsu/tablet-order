// Checkout product details use the same markup, CSS and option definitions as menu.html.
(() => {
  const dialog=document.querySelector('#detail');
  const $=selector=>dialog.querySelector(selector);
  const money=value=>`NT$ ${value.toLocaleString('zh-TW')}`;
  let item, groups=[], selections={}, quantity=1, onAdd;
  const selected=(group,option)=>!!selections[group.id]?.[option.id];
  const activeGroups=(list=groups)=>list.flatMap(group=>[group,...group.items.filter(option=>selected(group,option)).flatMap(option=>activeGroups(option.subGroups || []))]);
  function summary() {
    const active=activeGroups();
    return {unit:item.price+active.reduce((total,group)=>total+group.items.reduce((sum,option)=>sum+(selected(group,option)?(option.add || 0)*selections[group.id][option.id]:0),0),0),missing:active.filter(group=>group.required&&!group.items.some(option=>selected(group,option)))};
  }
  function updateTotal() {
    const {unit,missing}=summary();
    $('#quantity').textContent=quantity;
    $('#minus').disabled=quantity<=1;
    $('#plus').disabled=quantity>=item.maxQty;
    $('#add-cart').disabled=missing.length>0;
    $('#add-cart').textContent=`加入購物車・${money(unit*quantity)}`;
    $('#validation').textContent=missing.length?`尚須選擇：${missing.map(group=>group.title).join('、')}`:'已完成選擇';
  }
  function renderOptions() {
    const focused=document.activeElement;
    const focusKey=focused?.matches('input[data-group]') ? `input[data-group="${focused.dataset.group}"][value="${focused.value}"]` : focused?.matches('[data-qty-group]') ? `[data-qty-group="${focused.dataset.qtyGroup}"][data-option="${focused.dataset.option}"][data-delta="${focused.dataset.delta}"]` : null;
    $('#option-groups').innerHTML=groups.map(groupMarkup).join('');
    if(focusKey) $('#option-groups').querySelector(focusKey)?.focus({preventScroll:true});
    updateTotal();
  }
  $('#option-groups').addEventListener('change',event=>{
    const input=event.target;
    if(!input.matches('input[data-group]')) return;
    const group=activeGroups().find(group=>group.id===input.dataset.group), option=group?.items.find(option=>option.id===input.value);
    if(!group || !option || option.soldOut) return;
    if(group.mode==='single') {
      const clearChildren=options=>options.forEach(option=>(option.subGroups || []).forEach(child=>{delete selections[child.id];clearChildren(child.items);}));
      clearChildren(group.items);selections[group.id]={[option.id]:1};
    } else {
      selections[group.id] ||= {};
      if(input.checked && Object.keys(selections[group.id]).length<group.max) selections[group.id][option.id]=1;
      else delete selections[group.id][option.id];
    }
    renderOptions();
  });
  $('#option-groups').addEventListener('click',event=>{
    const button=event.target.closest('[data-qty-group]');if(!button) return;
    const values=selections[button.dataset.qtyGroup];
    values[button.dataset.option]=Math.max(1,Math.min(99,values[button.dataset.option]+Number(button.dataset.delta)));renderOptions();
  });
  $('#minus').onclick=()=>{quantity=Math.max(1,quantity-1);updateTotal();};
  $('#plus').onclick=()=>{quantity=Math.min(item.maxQty,quantity+1);updateTotal();};
  $('#close-detail').onclick=()=>dialog.close();
  dialog.querySelectorAll('[data-flavor]').forEach(button=>button.onclick=()=>button.setAttribute('aria-pressed',String(button.getAttribute('aria-pressed')!=='true')));
  $('#custom-flavor').onclick=()=>{
    const selected=$('#custom-flavor').getAttribute('aria-pressed')!=='true';
    $('#custom-flavor').setAttribute('aria-pressed',String(selected));$('#custom-flavor').setAttribute('aria-expanded',String(selected));$('#meal-note').hidden=!selected;
    if(selected) $('#meal-note').focus();
  };
  $('#add-cart').onclick=()=>{
    const {unit,missing}=summary();if(missing.length) return;
    const options=activeGroups().flatMap(group=>group.items.filter(option=>selected(group,option)).map(option=>({group:group.title,id:option.id,name:option.name,quantity:selections[group.id][option.id],surcharge:option.add || 0})));
    const result={unit,qty:quantity,options,flavors:[...dialog.querySelectorAll('[data-flavor][aria-pressed="true"]')].map(button=>button.dataset.flavor),note:$('#meal-note').hidden?'':$('#meal-note').value.trim()};
    dialog.close();onAdd(result);
  };
  dialog.addEventListener('click',event=>{
    const rect=dialog.getBoundingClientRect();if(event.target===dialog&&(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)) dialog.close();
  });
  window.TabletPaymentProductDetail={open(product,optionGroups,callback){
    item=product;groups=optionGroups;onAdd=callback;selections={};quantity=1;
    $('#detail-category').textContent=item.category;
    $('#detail-title').textContent=$('#detail-option-title').textContent=item.name;
    $('#detail-description').textContent=item.desc;
    $('#detail-price').textContent=money(item.price);
    $('#detail-limit').textContent=item.maxQty===1?'限定1份/本桌':'不限份數';
    $('.dish-photo').src=item.image || 'assets/menu.jpg';$('.dish-photo').alt=item.name;
    $('.dish-photo').onerror=()=>{$('.dish-photo').onerror=null;$('.dish-photo').src='assets/image.jpg';};
    if(!$('#meal-flavor-heading')){const heading=document.createElement('h3');heading.id='meal-flavor-heading';heading.textContent='口味與備註';$('.flavor-section').prepend(heading);}
    if(!$('#quantity-label')){const label=document.createElement('span');label.id='quantity-label';label.textContent='數量';$('.detail-footer').prepend(label);}
    $('#meal-note').value='';$('#meal-note').hidden=true;
    dialog.querySelectorAll('.flavor-option').forEach(button=>button.setAttribute('aria-pressed','false'));$('#custom-flavor').setAttribute('aria-expanded','false');
    renderOptions();dialog.showModal();dialog.querySelectorAll('.options-scroll,.detail-summary,.detail-layout').forEach(el=>el.scrollTop=0);$('#close-detail').focus();
  }};
  function groupMarkup(group) {
  const count = Object.keys(selections[group.id] || {}).length;
  return `<fieldset><legend>${group.title}<small>${group.required ? '必選' : '選填'}・${group.mode === 'single' ? '請選 1 項' : `最多選 ${group.max} 項`}</small></legend>${group.items.map(option => {
    const checked = selected(group, option);
    const disabled = option.soldOut || (!checked && group.mode === 'multi' && count >= group.max);
    return `<label class="option-row"><input type="${group.mode === 'single' ? 'radio' : 'checkbox'}" name="${group.id}" data-group="${group.id}" value="${option.id}" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}><span class="option-name">${option.name}</span><span class="option-price">${option.soldOut ? '已售完' : option.add ? `+${money(option.add)}` : '不加價'}</span></label>${checked && group.qty ? `<div class="extra-qty"><button data-qty-group="${group.id}" data-option="${option.id}" data-delta="-1" aria-label="減少${option.name}" ${selections[group.id][option.id] <= 1 ? 'disabled' : ''}>−</button><span>${selections[group.id][option.id]}</span><button data-qty-group="${group.id}" data-option="${option.id}" data-delta="1" aria-label="增加${option.name}" ${selections[group.id][option.id] >= 99 ? 'disabled' : ''}>＋</button></div>` : ''}${checked && option.subGroups ? `<div class="nested">${option.subGroups.map(groupMarkup).join('')}</div>` : ''}`;
  }).join('')}</fieldset>`;
}

})();

