// Standalone tablet checkout behavior. No dependency on the mobile prototype.
window.createTabletPaymentLogic = function(DCLogic) {
class MobilePaymentLogic extends DCLogic {
  state = {
    itemsOpen: true, orderOpen: true, menuOpen: false, pay: 'onsite', invoice: 'mobile',
    showPaymentInfoModal: true, onlinePaymentAvailable: true, memberNickname: '阿薰(Carol)', memberPhone: '0900000000',
    fields: { mobile: '', citizen: '', companyId: '', companyTitle: '', donate: '' },
    loggedIn: (() => { try { return localStorage.getItem('funMember') === '1'; } catch (e) { return false; } })(), lineLoggedIn: (() => { try { return localStorage.getItem('lineMember') === '1'; } catch (e) { return false; } })(), usePoints: false, codeApplied: false, voucherApplied: false,
    showPointsModal: false, pointsInput: '', pointsApplied: 0,
    showCodeModal: false, codeInput: 'tofu', codeQty: { pork: 0, bacon: 0, cheesepot: 1 }, codeInitialized: true,
    codeInteracted: false, showCodeLeaveModal: false, campaignProductsOpen: true, campaignRewardOpen: true, campaignNotesOpen: true,
    discountCartItems: [
      { id: 'discount-cart-1', key: 'cheesepot', name: '起司牛奶鍋', price: 250, selected: true, options: [
        { label: '肉好好 (+NT$ 20)', detail: '' },
        { label: '豬肉', detail: '伊比利豬 / 200g (+NT$ 20)' },
        { label: '古早味紅茶', detail: '無糖 / 微冰 / 茶凍 (+NT$ 10)' },
      ]},
      { id: 'discount-cart-2', key: 'cheesepot', name: '起司牛奶鍋', price: 250, selected: false, options: [
        { label: '肉好好 (+NT$ 20)', detail: '' },
        { label: '豬肉', detail: '伊比利豬 / 200g (+NT$ 20)' },
        { label: '古早味紅茶', detail: '無糖 / 微冰 / 茶凍 (+NT$ 10)' },
      ]},
    ], nextDiscountCartId: 3,
    discountTab: 'code', selectedVoucher: null,
    showGiftModal: false, selectedGifts: {},
    cartAdded: {},
    showSpecModal: false, specKey: null, specSel: {}, specQty: 1, specMealNote: '', codeItemOptions: {},
    showRemoveDiscountModal: false, removeDiscountId: null,
  };

  vouchers = [
    { id: 'v1', brand: '青花驕', short: '肉品', value: 100, denomTop: 'NT$', denomBig: '100', denomBottom: '', couponTitle: '瘋會員生日優惠券折100', couponPeriod: '2006/07/01 - 2026/07/31', couponTimes: '1次', couponTags: ['限會員', '限門市'], expired: false, name: '商品名稱壹貳參肆伍陸漆捌玖拾壹貳參肆伍陸漆捌玖拾壹貳參…', period: '2024/02/01 - 2024/02/29', times: '1次', tags: ['限門市', '限時段'] },
    { id: 'v2', brand: '青花驕', short: '海鮮', value: 100, denomTop: 'NT$', denomBig: '100', denomBottom: '', couponTitle: '瘋會員生日優惠券折100', couponPeriod: '2006/07/01 - 2026/07/31', couponTimes: '1次', couponTags: ['限會員', '限門市'], expired: false, name: '商品名稱壹貳參肆伍陸漆捌玖拾壹貳參肆伍陸漆捌玖拾壹貳參…', period: '2024/02/01 - 2024/02/29', times: '1次', tags: ['限門市', '限時段'] },
    { id: 'v3', brand: '青花驕', short: '鍋物', value: 100, denomTop: '', denomBig: '9', denomBottom: '折', couponTitle: '週年慶9折優惠券', couponPeriod: '2024/03/01 - 2024/03/31', couponTimes: '1次', couponTags: ['限會員', '限門市'], expired: true, name: '商品名稱壹貳參肆伍陸漆捌玖拾壹貳參肆伍陸漆捌玖拾壹貳參…', period: '2024/02/01 - 2024/02/29', times: '1次', tags: ['限門市', '限時段'] },
  ];

  codeDiscount = 50;
  voucherValue = 100;
  codeItems = [
    { key: 'pork', name: '澳洲板腱牛', price: 180, desc: '精選澳洲板腱牛，肉質鮮嫩。' },
    { key: 'bacon', name: '大腸臭臭鍋', price: 200, desc: '經典大腸臭臭鍋套餐，可依喜好選擇主餐、肉品、副餐、加購品與飲料。' },
    { key: 'cheesepot', name: '起司牛奶鍋', price: 250, desc: '由香濃起司搭配牛奶組成濃郁美味，不管是搭海鮮還是肉品，每口都能感受到滿滿的幸福好滋味。' },
    { key: 'tofu-reward', name: '鴨血豆腐', price: 39, desc: '優惠商品限購 1 份，請確認商品規格後加入購物車。' },
  ];

  // 套餐規格 (與 index 首頁商品詳情點餐 popup 一致)
  get specOptionGroups() {
    return [
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
  }

  getItemOptionGroups(key) {
    return (key === 'cheesepot' || key === 'bacon') ? this.specOptionGroups : [];
  }

  openSpecModal(key) {
    this.setState({ showSpecModal: true, specKey: key, specSel: {}, specQty: 1, specMealNote: '' });
  }

  pickSpec(gid, oid) { this.setState(s => ({ specSel: { ...s.specSel, [gid]: oid } })); }
  toggleSpecMulti(gid, oid, max, qtyMode) {
    this.setState(s => {
      const cur = { ...(s.specSel[gid] || {}) };
      if (cur[oid]) delete cur[oid];
      else { if (Object.keys(cur).length >= max) return {}; cur[oid] = qtyMode ? 1 : true; }
      return { specSel: { ...s.specSel, [gid]: cur } };
    });
  }
  bumpSpecQty(gid, oid, d) {
    this.setState(s => {
      const cur = { ...(s.specSel[gid] || {}) };
      const n = (cur[oid] || 1) + d;
      if (n <= 0) delete cur[oid]; else cur[oid] = n;
      return { specSel: { ...s.specSel, [gid]: cur } };
    });
  }
  specRadioRing(sel) { return { width: '22px', height: '22px', borderRadius: '50%', border: '1.5px solid #DE052E', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }; }
  specRadioDot(sel) { return { width: '12px', height: '12px', borderRadius: '50%', background: sel ? '#DE052E' : 'transparent' }; }
  specBoxStyle(sel) { return { width: '22px', height: '22px', borderRadius: '6px', border: '1.5px solid ' + (sel ? '#DE052E' : '#C8C9C9'), background: sel ? '#DE052E' : '#FFFFFF', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }; }
  specPriceLabel(add) { if (add === undefined || add === null) return ''; return '+NT$' + add; }

  // 清除因使用優惠碼而加入購物車的品項
  clearCodeCartItems() {
    try { localStorage.removeItem('codeSpecItem'); } catch (e) {}
    this.setState(s => ({
      codeQty: { pork: 0, bacon: 0, cheesepot: 1 },
      discountCartItems: s.discountCartItems.filter(item => item.id === 'discount-cart-1' || item.id === 'discount-cart-2'),
      cartAdded: {},
      codeItemOptions: {},
      codeApplied: false,
      nextDiscountCartId: 3,
    }));
  }

  leaveIncompleteCodeCampaign() {
    try { localStorage.removeItem('codeSpecItem'); } catch (e) {}
    this.setState(s => ({
      showCodeModal: false,
      showCodeLeaveModal: false,
      codeInteracted: false,
      codeApplied: false,
      codeQty: { pork: 0, bacon: 0, cheesepot: 1 },
      discountCartItems: s.discountCartItems.filter(item => item.id === 'discount-cart-1' || item.id === 'discount-cart-2'),
      cartAdded: {},
      codeItemOptions: {},
      nextDiscountCartId: 3,
      showSpecModal: false,
      specKey: null,
      specSel: {},
      specQty: 1,
    }));
  }

  // 將所選規格轉為餐點內容顯示用的 options
  specSelToOptions(sel, groups) {
    const opts = [];
    (groups || []).forEach(g => {
      if (g.mode === 'single') {
        const o = g.items.find(x => x.id === sel[g.id]);
        if (!o) return;
        const label = o.name + (o.add ? ' (+NT$ ' + o.add + ')' : '');
        let detail = '';
        if (o.subGroups) {
          const parts = [];
          o.subGroups.forEach(sg => {
            if (sg.mode === 'single') {
              const so = sg.items.find(x => x.id === sel[sg.id]);
              if (so) parts.push(so.name + (so.add ? ' (+NT$ ' + so.add + ')' : ''));
            } else {
              const m = sel[sg.id] || {};
              Object.keys(m).forEach(k => { const so = sg.items.find(x => x.id === k); if (so) parts.push(so.name + (so.add ? ' (+NT$ ' + so.add + ')' : '')); });
            }
          });
          detail = parts.join(' / ');
        }
        opts.push({ label, detail });
      } else {
        const m = sel[g.id] || {};
        Object.keys(m).forEach(k => {
          const o = g.items.find(x => x.id === k);
          if (o) opts.push({ label: o.name + (g.qty ? ' x' + m[k] : '') + (o.add ? ' (+NT$ ' + o.add + ')' : ''), detail: '' });
        });
      }
    });
    return opts;
  }

  pointsBalance = 9999;
  pointsMax = 245;

  setField(key, value) {
    this.setState(s => ({ fields: { ...s.fields, [key]: value } }));
  }

  renderVals() {
    const itemOpts = [
      { label: '肉好好 (+NT$ 20)', detail: '' },
      { label: '豬肉', detail: '伊比利豬 (+NT$ 0) / 200g (+NT$ 20)' },
      { label: '古早味紅茶', detail: '無糖 (+NT$ 0) / 微冰 (+NT$ 0) / 茶凍 (+NT$ 10)' },
    ];
    const items = this.state.discountCartItems.map((it, i) => ({
      idx: i + 1,
      name: it.name,
      price: '$' + it.price,
      options: it.options && it.options.length ? it.options : [{ label: '單品', detail: '' }],
    }));
    const radio = (selected) => ({
      ring: selected ? '#DE052E' : '#C8C9C9',
      dot: selected ? '#DE052E' : 'transparent',
    });

    // 會員 / 優惠
    const switchTrack = (on) => ({
      width: '46px', height: '26px', borderRadius: '999px',
      background: on ? '#DE052E' : '#C8C9C9', position: 'relative',
      transition: 'background .2s', flexShrink: 0, display: 'inline-block',
    });
    const switchKnob = (on) => ({
      width: '20px', height: '20px', borderRadius: '50%', background: '#FFFFFF',
      position: 'absolute', top: '3px', left: on ? '23px' : '3px',
      transition: 'left .2s', boxShadow: '0 1px 2px rgba(0,0,0,.2)',
    });
    // 折抵金額計算
    const CART_SUBTOTAL = this.state.discountCartItems.reduce((sum, it) => sum + it.price, 0);
    const codeValid0 = this.state.codeInput.trim().toLowerCase() === 'tofu';
    const codeSub = this.state.discountCartItems.filter(it => it.selected).reduce((sum, it) => sum + it.price, 0);
    const onlineEnabled = this.state.pay === 'online' || this.state.pay === 'funpay';
    const onsiteEnabled = this.state.pay === 'onsite';
    const pointsUsable = onlineEnabled;
    const pointsApplied = this.state.usePoints ? this.state.pointsApplied : 0; // 保留顯示用
    const pointsAmt = (onlineEnabled && this.state.usePoints) ? this.state.pointsApplied : 0; // 實際折抵
    const codeApplied = this.state.codeApplied && codeValid0;
    const codeAmt = codeApplied ? 39 : 0;
    // 優惠商品已由使用者自行加入購物車，因此只計入購物車一次。
    const MEMBER_SUBTOTAL = CART_SUBTOTAL;
    const voucherApplied = this.state.voucherApplied && !!this.state.selectedVoucher;
    const voucherAmt = (onlineEnabled && voucherApplied) ? this.voucherValue : 0;
    const giftSel = this.state.selectedGifts || {};
    const giftVouchers = this.vouchers.filter(v => giftSel[v.id]).map(v => ({ label: '(' + v.brand + '開幕慶' + v.short + '折100)', amt: 100 }));
    const giftSelSum = this.state.loggedIn ? giftVouchers.reduce((s, g) => s + g.amt, 0) : 0; // 保留顯示用
    const giftAmt = onlineEnabled ? giftSelSum : 0; // 實際折抵
    const maxPts = Math.min(this.pointsBalance, Math.max(0, MEMBER_SUBTOTAL - voucherAmt - codeAmt - giftAmt));
    const memberPayableNum = Math.max(0, MEMBER_SUBTOTAL - pointsAmt - voucherAmt - codeAmt - giftAmt);
    const zeroPayable = this.state.loggedIn && memberPayableNum === 0;

    const pinkRow = {
      width: '100%', background: 'none', border: 'none', borderRadius: '0',
      padding: '6px 2px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: '12px', cursor: 'pointer',
      fontFamily: 'inherit', textAlign: 'left',
    };
    const amtStyle = (amt) => ({
      fontSize: '18px', fontWeight: '700',
      color: amt > 0 ? '#DE052E' : '#3E3E3E', flexShrink: 0,
    });
    const discountLabel = '使用優惠';
    const discountRowAmt = onsiteEnabled ? codeAmt : (codeAmt + voucherAmt);
    const discountSubLines = [];
    if (codeApplied) discountSubLines.push({ label: '(優惠碼:' + this.state.codeInput.trim().toUpperCase() + ')', amtText: '', amtStyle: { fontSize: '13px', color: '#9A9A9A' }, cancel: true, onCancel: () => { this.clearCodeCartItems(); this.setState({ codeApplied: false }); } });
    if (!onsiteEnabled && voucherApplied) { const v = this.vouchers.find(x => x.id === this.state.selectedVoucher); if (v) discountSubLines.push({ label: '(' + v.couponTitle + ')', amtText: '', amtStyle: { fontSize: '13px', color: '#9A9A9A' } }); }
    const disabledRow = { ...pinkRow, opacity: 0.4, cursor: 'not-allowed' };
    const memberOffers = [
      { key: 'discount', label: discountLabel, showP: false, note: '', subLines: discountSubLines,
        amtText: discountRowAmt > 0 ? '-' + discountRowAmt : '0', amtStyle: amtStyle(discountRowAmt),
        rowStyle: pinkRow,
        onToggle: () => this.setState({ showCodeModal: true, discountTab: 'code' }) },
      ...(onlineEnabled ? [{ key: 'gift', label: '使用電子禮券', showP: false, note: '',
        amtText: giftSelSum > 0 ? '-' + giftSelSum : '0', amtStyle: amtStyle(giftSelSum),
        subLines: giftVouchers.map(g => ({ label: g.label, amtText: '', amtStyle: { fontSize: '13px', color: '#9A9A9A' } })),
        rowStyle: pinkRow,
        onToggle: () => this.setState({ showGiftModal: true }) },
      { key: 'points', label: '使用瘋點數折抵', showP: true, note: '(使用優惠券/電子禮券/點數折抵僅限線上支付)', subLines: [],
        amtText: pointsApplied > 0 ? '-' + pointsApplied : '0', amtStyle: amtStyle(pointsApplied),
        rowStyle: pinkRow,
        onToggle: () => this.setState({ showPointsModal: true, pointsInput: this.state.pointsApplied ? String(this.state.pointsApplied) : '' }) }] : []),
    ];

    // 優惠碼 popup
    const codeValid = this.state.codeInput.trim().toLowerCase() === 'tofu';
    const codeTitle = '使用優惠';
    const selectedCodeCartItems = this.state.discountCartItems.filter(it => it.selected);
    const totalQty = selectedCodeCartItems.length;
    const pad2 = (n) => String(n).padStart(2, '0');
    const codeSubtotal = selectedCodeCartItems.reduce((sum, it) => sum + it.price, 0);
    const maxSpecQty = 99;
    const codeDiscountAmt = Math.min(codeSubtotal, 500);
    const syncCodeQty = (rows) => rows.reduce((q, row) => {
      if (row.selected) q[row.key] = (q[row.key] || 0) + 1;
      return q;
    }, { pork: 0, bacon: 0, cheesepot: 0 });
    const codeCartRows = this.state.discountCartItems.map(it => ({
      ...it,
      options: it.options || [],
      checkStyle: {
        width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
        border: '1.5px solid ' + (it.selected ? '#DE052E' : '#DE052E'),
        background: it.selected ? '#DE052E' : '#FFFFFF', padding: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
      },
      onToggle: () => this.setState(s => {
        const rows = s.discountCartItems.map(row => row.id === it.id ? { ...row, selected: !row.selected } : row);
        return { discountCartItems: rows, codeQty: syncCodeQty(rows) };
      }),
      onRemove: () => this.setState({ showRemoveDiscountModal: true, removeDiscountId: it.id }),
    }));
    const campaignItems = this.state.discountCartItems.filter(row => row.addedByCampaign);
    const campaignSpend = 125 + campaignItems.reduce((sum, row) => sum + row.price, 0);
    const campaignProductCount = campaignItems.length;
    const campaignComplete = campaignSpend >= 500 && campaignProductCount >= 1;
    const campaignRemaining = Math.max(0, 500 - campaignSpend);
    const campaignRewardAdded = this.state.discountCartItems.some(row => row.addedByCampaignReward);
    const availableCodeItemRows = this.codeItems
      .filter(it => it.key === 'pork' || it.key === 'bacon')
      .map(it => {
        return {
          ...it,
          showAdd: !campaignComplete,
          plusStyle: {
            minWidth: '104px', height: '34px', padding: '0 10px', border: 'none', borderRadius: '8px',
            background: '#DE052E', color: '#FFFFFF',
            fontFamily: 'inherit', fontSize: '14px', fontWeight: '500', lineHeight: '1', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer',
          },
          onPlus: () => { this.setState({ codeInteracted: true }); this.openSpecModal(it.key); },
        };
      });
    const codeConfirmValid = codeValid && campaignComplete && campaignRewardAdded;
    const activeTab = (this.state.loggedIn && onlineEnabled) ? this.state.discountTab : 'code';
    const showCodeTab = activeTab === 'code';
    const showVoucherTab = this.state.loggedIn && onlineEnabled && activeTab === 'voucher';
    const showDiscountTabs = this.state.loggedIn && onlineEnabled;
    const tabDiscount = showVoucherTab
      ? (this.state.selectedVoucher ? this.voucherValue : 0)
      : (codeConfirmValid ? 39 : 0);
    const codeDiscountText = '-$ ' + tabDiscount;
    const discountConfirmValid = showVoucherTab ? true : codeConfirmValid;
    const tabBtn = (active) => ({
      flex: 1, padding: '10px 0', border: 'none', background: 'none',
      fontFamily: 'inherit', fontSize: '16px', fontWeight: active ? '700' : '400',
      color: active ? '#DE052E' : '#9A9A9A', cursor: 'pointer',
      borderBottom: '2px solid ' + (active ? '#DE052E' : 'transparent'),
    });

    // 瘋點數折抵 popup
    const rawPts = this.state.pointsInput.replace(/[^0-9]/g, '');
    const ptsNum = rawPts === '' ? 0 : parseInt(rawPts, 10);
    const ptsError = ptsNum > maxPts ? '超過最高可折抵點數'
      : (ptsNum > this.pointsBalance ? '超過帳戶點數餘額' : '');
    const ptsValid = ptsNum > 0 && !ptsError;
    const ptsInputStyle = {
      width: '110px', textAlign: 'right', fontFamily: 'inherit', fontSize: '20px',
      fontWeight: '700', color: '#3E3E3E', padding: '10px 14px',
      border: '1px solid ' + (ptsError ? '#DE3B05' : '#C8C9C9'),
      borderRadius: '10px', outline: 'none', background: '#FFFFFF',
    };

    const payCardStyle = (selected) => ({
      border: '1.5px solid ' + (selected ? '#DE052E' : '#E5E5E5'),
      borderRadius: '12px', padding: '14px 16px', display: 'flex',
      alignItems: 'flex-start', gap: '12px', background: '#FFFFFF',
      cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: 'inherit',
    });
    const mkPay = (m) => ({ ...m, note: m.note || '', hasIcons: !!m.hasIcons,
      ...radio(this.state.pay === m.key),
      cardStyle: payCardStyle(this.state.pay === m.key),
      onSelect: () => this.setState(s => ({ pay: m.key,
        invoice: (m.key !== 'onsite' && s.invoice === 'paper') ? '' : s.invoice })) });
    const payMethods = [
      ...(this.state.loggedIn ? [{ key: 'funpay', label: '瘋pay' }] : []),
      ...(this.state.onlinePaymentAvailable ? [{ key: 'online', label: '線上支付', hasIcons: true }] : []),
      { key: 'onsite', label: '現場付款', note: '公司用請現場付款，選擇紙本發票並輸入統一編號' },
    ].map(mkPay);

    const fv = this.state.fields;
    const inputStyle = (err) => ({
      width: '100%', boxSizing: 'border-box', fontFamily: 'inherit',
      fontSize: '16px', color: '#3E3E3E', padding: '12px 16px',
      border: '1px solid ' + (err ? '#DE3B05' : '#C8C9C9'),
      borderRadius: '12px', outline: 'none', background: '#FFFFFF',
    });
    const mkField = (key, placeholder, error) => ({
      value: fv[key], placeholder, error: error || '',
      inputStyle: inputStyle(error),
      onChange: (e) => this.setField(key, e.target.value),
    });

    // 手機條碼載具驗證: "/" 開頭 + 7 碼大寫英數字/符號
    const mobileVal = fv.mobile;
    const mobileErr = mobileVal && !/^\/[0-9A-Z.+\-]{7}$/.test(mobileVal)
      ? '手機條碼格式錯誤,請輸入「/」加 7 碼' : '';

    const fieldsByKey = {
      mobile: [mkField('mobile', '手機條碼格式為 / 開頭，共8碼', mobileErr)],
      citizen: [mkField('citizen', '共16碼大寫英數字')],
      company: [
        mkField('companyId', '請輸入統一編號'),
        mkField('companyTitle', '請輸入發票抬頭'),
      ],
      donate: [mkField('donate', '請輸入捐贈碼,3–7 碼數字')],
      paper: [mkField('companyId', '公司用請輸入統一編號')],
    };

    const invoiceMethods = [
      ...(this.state.pay === 'onsite' ? [{ key: 'paper', label: '紙本發票', note: '僅限現場付款使用' }] : []),
      { key: 'mobile', label: '手機條碼載具', note: '' },
      { key: 'citizen', label: '自然人憑證載具', note: '' },
      { key: 'donate', label: '捐贈發票', note: '' },
    ].map(m => ({ ...m, ...radio(this.state.invoice === m.key),
      showFields: this.state.invoice === m.key && !!fieldsByKey[m.key],
      fields: fieldsByKey[m.key] || [],
      onSelect: () => this.setState({ invoice: m.key }) }));

    const chevron = (open) => ({ transition: 'transform .2s', transform: open ? 'rotate(0deg)' : 'rotate(180deg)' });

    return {
      items, subtotal: 'NT$500',
      payable: 'NT$' + memberPayableNum,
      memberSubtotalText: 'NT$' + MEMBER_SUBTOTAL,
      memberPayableText: 'NT$' + memberPayableNum,
      codeOffer: memberOffers.find(o => o.key === 'discount'),
      itemsOpen: this.state.itemsOpen, orderOpen: this.state.orderOpen,
      itemsChevronStyle: chevron(this.state.itemsOpen),
      orderChevronStyle: chevron(this.state.orderOpen),
      toggleItems: () => this.setState(s => ({ itemsOpen: !s.itemsOpen })),
      toggleOrder: () => this.setState(s => ({ orderOpen: !s.orderOpen })),
      memberPhone: this.state.memberPhone,
      memberNickname: this.state.memberNickname,
      onMemberNicknameChange: (e) => this.setState({ memberNickname: e.target.value }),
      onMemberPhoneChange: (e) => this.setState({ memberPhone: e.target.value.replace(/[^0-9+#*()-]/g, '') }),
      showPaymentInfoModal: this.state.showPaymentInfoModal,
      onlinePaymentAvailable: this.state.onlinePaymentAvailable,
      selectInfoOnsite: () => this.setState({ pay: 'onsite', showPaymentInfoModal: false }),
      selectInfoOnline: () => {
        if (!this.state.onlinePaymentAvailable) return;
        this.setState({ pay: 'online', showPaymentInfoModal: false });
      },
      payMethods, invoiceMethods,
      showPayment: !zeroPayable, zeroPayable,
      ctaText: zeroPayable ? '確認結帳' : '前往付款',
      invoiceZeroNote: '消費者購買的商品全額使用會員點數、現金紅利折抵，導致實際支付金額為0元，屬於無金額交易，依法不需開立統一發票。',
      loggedIn: this.state.loggedIn, notLoggedIn: !this.state.loggedIn,
      menuOpen: this.state.menuOpen,
      legacyMenuOpen: false,
      toggleMenu: () => this.setState(s => ({ menuOpen: !s.menuOpen })),
      closeMenu: () => this.setState({ menuOpen: false }),
      lineIn: this.state.lineLoggedIn, lineOut: !this.state.lineLoggedIn,
      funIn: this.state.loggedIn, funOut: !this.state.loggedIn,
      onLineLogin: () => { try { localStorage.setItem('lineMember','1'); } catch(e){} this.setState({ lineLoggedIn: true }); },
      onLineLogout: () => { try { localStorage.removeItem('lineMember'); } catch(e){} this.setState({ lineLoggedIn: false }); },
      onFunLogin: () => { try { localStorage.setItem('funMember','1'); } catch(e){} this.setState({ loggedIn: true }); },
      onFunLogout: () => { try { localStorage.removeItem('funMember'); } catch(e){} this.setState({ loggedIn: false, usePoints: false, codeApplied: false, voucherApplied: false, pointsApplied: 0 }); },
      showLogout: this.state.lineLoggedIn || this.state.loggedIn,
      logoutAll: () => { try { localStorage.removeItem('lineMember'); localStorage.removeItem('funMember'); } catch(e){} this.setState({ lineLoggedIn: false, loggedIn: false, menuOpen: false, usePoints: false, codeApplied: false, voucherApplied: false, pointsApplied: 0 }); },
      memberOffers, memberName: 'Amy',
      onLogin: () => { try { localStorage.setItem('funMember', '1'); } catch (e) {} this.setState({ loggedIn: true }); },
      onLogout: () => { try { localStorage.removeItem('funMember'); } catch (e) {} this.setState({ loggedIn: false, usePoints: false, codeApplied: false, voucherApplied: false, pointsApplied: 0 }); },
      showPointsModal: this.state.showPointsModal,
      pointsBalanceText: this.pointsBalance.toLocaleString(),
      pointsInput: this.state.pointsInput,
      ptsError, ptsValid, ptsInputStyle,
      confirmStyle: {
        width: '100%', marginTop: '20px', border: 'none', fontFamily: 'inherit',
        fontSize: '20px', fontWeight: '500', padding: '14px', borderRadius: '12px',
        cursor: ptsValid ? 'pointer' : 'not-allowed',
        background: ptsValid ? '#DE052E' : '#F6F6F6',
        color: ptsValid ? '#FFFFFF' : '#C8C9C9',
      },
      onPointsInput: (e) => this.setState({ pointsInput: e.target.value.replace(/[^0-9]/g, '') }),
      stopModal: (e) => e.stopPropagation(),
      closePointsModal: () => this.setState({ showPointsModal: false }),
      confirmPoints: () => {
        if (!ptsValid) return;
        this.setState({ usePoints: true, pointsApplied: ptsNum, showPointsModal: false });
      },
      showSpecModal: this.state.showSpecModal,
      closeSpecModal: () => this.setState({ showSpecModal: false, specKey: null, specSel: {} }),
      ...(() => {
        const specItem = this.state.specKey ? this.codeItems.find(it => it.key === this.state.specKey) : null;
        const itemGroups = specItem ? this.getItemOptionGroups(specItem.key) : [];
        const basePrice = specItem ? specItem.price : 0;
        const buildRow = (g, o, nested) => {
          const isMulti = g.mode === 'multi';
          const selected = isMulti ? !!(this.state.specSel[g.id] && this.state.specSel[g.id][o.id]) : this.state.specSel[g.id] === o.id;
          const row = {
            name: o.name, priceText: this.specPriceLabel(o.add),
            isCheckbox: isMulti, isRadio: !isMulti, selected,
            soldOut: !!o.soldOut, showImage: !o.soldOut && !!o.img,
            nameColor: o.soldOut ? '#C8C9C9' : '#3E3E3E',
            boxStyle: this.specBoxStyle(selected),
            ringStyle: this.specRadioRing(selected),
            dotStyle: this.specRadioDot(selected),
            rowStyle: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', cursor: o.soldOut ? 'default' : 'pointer' },
          };
          if (o.soldOut) row.onToggle = () => {};
          else if (isMulti) row.onToggle = () => this.toggleSpecMulti(g.id, o.id, g.max, !!g.qty);
          else row.onToggle = () => this.pickSpec(g.id, o.id);
          if (g.qty && selected) {
            row.showStepper = true;
            row.qty = (this.state.specSel[g.id] && this.state.specSel[g.id][o.id]) || 1;
            row.onMinus = (e) => { e.stopPropagation(); this.bumpSpecQty(g.id, o.id, -1); };
            row.onPlus = (e) => { e.stopPropagation(); this.bumpSpecQty(g.id, o.id, 1); };
          }
          if (!nested && o.subGroups && selected) {
            row.expanded = true;
            row.subGroups = o.subGroups.map(sg => ({
              title: sg.title, required: sg.required, hint: sg.hint,
              items: sg.items.map(so => buildRow(sg, so, true)),
            }));
          }
          return row;
        };
        const specGroups = itemGroups.map(g => {
          const selCount = g.mode === 'multi' ? Object.keys(this.state.specSel[g.id] || {}).length : (this.state.specSel[g.id] ? 1 : 0);
          const limitHit = g.mode === 'multi' && selCount >= g.max;
          return { title: g.title, required: !!g.required, hint: g.hint,
            hintColor: limitHit ? '#DE052E' : '#9A9A9A',
            items: g.items.map(o => buildRow(g, o, false)) };
        });
        let unit = basePrice;
        const okGroups = [];
        itemGroups.forEach(g => {
          if (g.mode === 'single') {
            const opt = g.items.find(x => x.id === this.state.specSel[g.id]);
            if (opt && opt.add) unit += opt.add;
            okGroups.push(!g.required || !!opt);
            if (opt && opt.subGroups) opt.subGroups.forEach(sg => {
              if (sg.mode === 'single') {
                const sopt = sg.items.find(x => x.id === this.state.specSel[sg.id]);
                if (sopt && sopt.add) unit += sopt.add;
                okGroups.push(!sg.required || !!sopt);
              } else {
                const sm = this.state.specSel[sg.id] || {};
                Object.keys(sm).forEach(k => { const so = sg.items.find(x => x.id === k); if (so && so.add) unit += so.add; });
              }
            });
          } else {
            const m = this.state.specSel[g.id] || {};
            Object.keys(m).forEach(k => { const o = g.items.find(x => x.id === k); if (o && o.add) unit += o.add * (g.qty ? m[k] : 1); });
            okGroups.push(!g.required || Object.keys(m).length > 0);
          }
        });
        const canAdd = okGroups.every(Boolean);
        const total = unit * this.state.specQty;
        return {
          specName: specItem ? specItem.name : '',
          specDesc: specItem ? (specItem.desc || '') : '',
          specPriceText: specItem ? '$' + specItem.price : '',
          specQty: this.state.specQty,
          specMealNote: this.state.specMealNote,
          onSpecMealNoteInput: (e) => this.setState({ specMealNote: e.target.value }),
          specQtyMinus: () => this.setState(s => ({ specQty: Math.max(1, s.specQty - 1) })),
          specQtyPlus: () => this.setState(s => ({ specQty: Math.min(specItem && specItem.key === 'tofu-reward' ? 1 : maxSpecQty, s.specQty + 1) })),
          specQtyPlusStyle: {
            width: '34px', height: '34px', borderRadius: '50%', border: 'none',
            background: specItem && specItem.key === 'tofu-reward' ? '#C8C9C9' : '#DE052E', color: '#FFFFFF',
            fontSize: '22px', lineHeight: '1', cursor: specItem && specItem.key === 'tofu-reward' ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          },
          specGroups,
          specTotalText: 'NT$' + total,
          specAddBtnStyle: {
            border: 'none', fontFamily: 'inherit', fontSize: '17px', fontWeight: '500',
            padding: '12px 24px', borderRadius: '12px', flexShrink: 0, cursor: canAdd ? 'pointer' : 'not-allowed',
            background: canAdd ? '#DE052E' : '#F0F0F0', color: canAdd ? '#FFFFFF' : '#C8C9C9',
          },
          confirmSpec: () => {
            if (!canAdd || !specItem) return;
            const k = this.state.specKey;
            if (!k) return;
            const options = this.specSelToOptions(this.state.specSel, itemGroups);
            if (itemGroups.length) {
              try { localStorage.setItem('codeSpecItem', JSON.stringify({ name: specItem.name, qty: this.state.specQty, price: specItem.price, note: this.state.specMealNote.trim(), options })); } catch (e) {}
            }
            this.setState(s => ({
              cartAdded: { ...s.cartAdded, [k]: true },
              codeQty: { ...s.codeQty, [k]: (s.codeQty[k] || 0) + s.specQty },
              codeItemOptions: { ...s.codeItemOptions, [k]: options },
              discountCartItems: [
                ...s.discountCartItems,
                ...Array.from({ length: s.specQty }, (_, index) => ({
                  id: 'discount-cart-' + (s.nextDiscountCartId + index),
                  key: k,
                  name: specItem.name,
                  price: specItem.price,
                  selected: true,
                  addedByCampaign: k !== 'tofu-reward',
                  addedByCampaignReward: k === 'tofu-reward',
                  note: s.specMealNote.trim(),
                  options,
                })),
              ],
              nextDiscountCartId: s.nextDiscountCartId + s.specQty,
              codeInitialized: true,
              campaignProductsOpen: k !== 'tofu-reward' && (125 + [
                ...s.discountCartItems.filter(row => row.addedByCampaign),
                ...Array.from({ length: s.specQty }, () => ({ price: specItem.price })),
              ].reduce((sum, row) => sum + row.price, 0)) >= 500 ? false : s.campaignProductsOpen,
              showSpecModal: false, specKey: null, specSel: {}, specMealNote: '',
            }));
          },
        };
      })(),
      showRemoveDiscountModal: this.state.showRemoveDiscountModal,
      removeDiscountName: (() => {
        const item = this.state.discountCartItems.find(it => it.id === this.state.removeDiscountId);
        return item ? item.name : '此品項';
      })(),
      cancelRemoveDiscount: () => this.setState({ showRemoveDiscountModal: false, removeDiscountId: null }),
      confirmRemoveDiscount: () => {
        const id = this.state.removeDiscountId;
        if (!id) return;
        this.setState(s => {
          const rows = s.discountCartItems.filter(item => item.id !== id);
          const q = rows.reduce((qty, row) => {
            if (row.selected) qty[row.key] = (qty[row.key] || 0) + 1;
            return qty;
          }, { pork: 0, bacon: 0, cheesepot: 0 });
          return {
            codeQty: q,
            discountCartItems: rows,
            showRemoveDiscountModal: false,
            removeDiscountId: null,
          };
        });
      },
      showCodeModal: this.state.showCodeModal,
      codeInput: this.state.codeInput, codeValid, codeTitle,
      codeCartRows, availableCodeItemRows, hasAvailableCodeItems: availableCodeItemRows.length > 0, codeDiscountText,
      campaignSpend, campaignRemaining, campaignProductCount,
      campaignProductsOpen: this.state.campaignProductsOpen,
      campaignRewardOpen: this.state.campaignRewardOpen,
      campaignNotesOpen: this.state.campaignNotesOpen,
      campaignProductsArrowIcon: this.state.campaignProductsOpen ? 'assets/icons/Icon_dropdown-up.svg' : 'assets/icons/Icon_dropdown-down.svg',
      campaignRewardArrowIcon: this.state.campaignRewardOpen ? 'assets/icons/Icon_dropdown-up.svg' : 'assets/icons/Icon_dropdown-down.svg',
      campaignNotesArrowIcon: this.state.campaignNotesOpen ? 'assets/icons/Icon_dropdown-up.svg' : 'assets/icons/Icon_dropdown-down.svg',
      campaignRewardOpacity: campaignComplete ? 1 : 0.4,
      campaignProgressStyle: { height: '100%', width: Math.min(100, campaignSpend / 500 * 100) + '%', borderRadius: '99px', background: '#DE052E' },
      toggleCampaignProducts: () => this.setState(s => ({ campaignProductsOpen: !s.campaignProductsOpen })),
      toggleCampaignReward: () => this.setState(s => ({ campaignRewardOpen: !s.campaignRewardOpen })),
      toggleCampaignNotes: () => this.setState(s => ({ campaignNotesOpen: !s.campaignNotesOpen })),
      showCampaignRewardAdd: !campaignRewardAdded,
      campaignRewardAddStyle: {
        minWidth: '104px', height: '34px', padding: '0 10px', border: 'none', borderRadius: '8px',
        background: campaignComplete ? '#DE052E' : '#F0F0F0', color: campaignComplete ? '#FFFFFF' : '#C8C9C9',
        fontFamily: 'inherit', fontSize: '14px', fontWeight: '500', lineHeight: '1', display: 'flex', alignItems: 'center',
        justifyContent: 'center', cursor: campaignComplete ? 'pointer' : 'not-allowed',
      },
      openCampaignReward: () => {
        if (!campaignComplete || campaignRewardAdded) return;
        this.setState({ codeInteracted: true });
        this.openSpecModal('tofu-reward');
      },
      showCodeTab, showVoucherTab, showDiscountTabs,
      voucherTabStyle: tabBtn(showVoucherTab),
      codeTabStyle: tabBtn(showCodeTab),
      selectVoucherTab: () => this.setState({ discountTab: 'voucher' }),
      selectCodeTab: () => this.setState({ discountTab: 'code' }),
      onCodeInput: (e) => this.setState({ codeInput: e.target.value }),
      closeCodeModal: () => {
        if (showCodeTab && codeValid && !this.state.codeApplied) {
          this.setState({ showCodeLeaveModal: true });
          return;
        }
        this.setState({ showCodeModal: false, showCodeLeaveModal: false });
      },
      showCodeLeaveModal: this.state.showCodeLeaveModal,
      confirmLeaveCode: () => this.leaveIncompleteCodeCampaign(),
      continueCodeOrder: () => this.setState({ showCodeLeaveModal: false }),
      codeInputStyle: {
        width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: '16px',
        color: '#3E3E3E', padding: '14px 16px', border: '1px solid #C8C9C9',
        borderRadius: '12px', outline: 'none', background: '#FFFFFF',
      },
      codeConfirmStyle: {
        border: 'none', fontFamily: 'inherit', fontSize: '20px', fontWeight: '500',
        padding: '12px 36px', borderRadius: '12px',
        cursor: discountConfirmValid ? 'pointer' : 'not-allowed',
        background: discountConfirmValid ? '#DE052E' : '#F6F6F6',
        color: discountConfirmValid ? '#FFFFFF' : '#C8C9C9',
      },
      confirmCode: () => {
        if (!discountConfirmValid) return;
        if (showVoucherTab) { this.clearCodeCartItems(); this.setState({ voucherApplied: !!this.state.selectedVoucher, codeApplied: false, showCodeModal: false }); }
        else this.setState({ codeApplied: true, voucherApplied: false, showCodeModal: false, codeInteracted: false });
      },
      voucherRows: this.vouchers.map(v => {
        const expired = !!v.expired;
        const sel = this.state.selectedVoucher === v.id && !expired;
        const valueBg = expired ? '#DADADA' : '#FFEED8';
        const valueColor = expired ? '#FFFFFF' : '#DE052E';
        const titleColor = expired ? '#C2C2C2' : '#3E3E3E';
        const metaColor = expired ? '#CFCFCF' : '#8A8A8A';
        const tagColor = expired ? '#CFCFCF' : '#F0A73E';
        return {
          id: v.id, denomTop: v.denomTop, denomBig: v.denomBig, denomBottom: v.denomBottom, couponTitle: v.couponTitle,
          couponPeriod: v.couponPeriod, couponTimes: v.couponTimes, couponTags: v.couponTags,
          showCheck: sel,
          cardStyle: {
            position: 'relative', display: 'flex', gap: '14px', padding: '0',
            borderRadius: '14px', overflow: 'hidden', boxSizing: 'border-box',
            border: '2px solid ' + (sel ? '#DE052E' : (expired ? '#DADADA' : '#FFEED8')),
            background: '#FFFFFF', width: '100%', textAlign: 'left', fontFamily: 'inherit',
            cursor: expired ? 'not-allowed' : 'pointer', minHeight: '96px',
          },
          valueBlockStyle: {
            alignSelf: 'stretch', width: '96px', flexShrink: 0, background: valueBg,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1px',
          },
          denomTopStyle: { fontSize: '15px', fontWeight: '700', color: valueColor, lineHeight: '1.1' },
          denomBigStyle: { fontSize: '34px', fontWeight: '800', color: valueColor, lineHeight: '1' },
          denomBottomStyle: { fontSize: '15px', fontWeight: '700', color: valueColor, lineHeight: '1.1' },
          titleStyle: { display: 'block', fontSize: '15px', color: titleColor, lineHeight: '1.4' },
          metaStyle: { display: 'block', fontSize: '13px', color: metaColor, marginTop: '4px' },
          tagStyle: { fontSize: '13px', fontWeight: '500', color: tagColor },
          onSelect: expired ? (() => {}) : (() => this.setState(s => ({ selectedVoucher: s.selectedVoucher === v.id ? null : v.id }))),
        };
      }),
      showGiftModal: this.state.showGiftModal,
      giftRows: this.vouchers.map(v => {
        const sel = !!(this.state.selectedGifts && this.state.selectedGifts[v.id]);
        return {
          ...v, selected: sel,
          cardStyle: {
            position: 'relative', overflow: 'hidden', flexShrink: 0,
            display: 'flex', gap: '12px', padding: '12px', borderRadius: '12px',
            border: '2px solid ' + (sel ? '#DE052E' : '#F6F6F6'),
            background: '#FFFFFF', cursor: 'pointer', textAlign: 'left', width: '100%',
            fontFamily: 'inherit',
          },
          onSelect: () => this.setState(s => {
            const g = { ...(s.selectedGifts || {}) };
            if (g[v.id]) delete g[v.id]; else g[v.id] = true;
            return { selectedGifts: g };
          }),
        };
      }),
      giftConfirmStyle: (() => {
        return {
          border: 'none', fontFamily: 'inherit', fontSize: '20px', fontWeight: '500',
          padding: '14px', borderRadius: '12px', width: '100%',
          cursor: 'pointer',
          background: '#DE052E',
          color: '#FFFFFF',
        };
      })(),
      closeGiftModal: () => this.setState({ showGiftModal: false }),
      confirmGift: () => {
        this.setState({ showGiftModal: false });
      },
      goBack: () => {},
      goPay: () => { window.location.href = 'order-detail.html?paid=1'; },
    };
  }
}
return class TabletPaymentLogic extends MobilePaymentLogic {
  constructor(props) {
    super(props);
    this.baseRows = (window.tabletCheckoutLines || []).flatMap((line, i) => Array.from({length:line.qty}, (_, j) => ({
      id: `tablet-base-${i}-${j}`, key: `tablet-${i}`, name: line.name, price: line.unit, selected: i === 0,
      options: [...(line.options || []).map(option => ({label:`${option.group}：${option.name}${option.quantity > 1 ? ` × ${option.quantity}` : ''}`,detail:[...(option.flavors || []),option.note].filter(Boolean).join('／')})), ...(line.flavors || []).map(label => ({label,detail:''})), ...(line.note ? [{label:line.note,detail:''}] : [])]
    })));
    window.TabletMemberProfile ||= {name:this.state.memberNickname,phone:this.state.memberPhone};
    this.state = {...this.state, discountCartItems:this.baseRows.map(row=>({...row})),
      memberNickname:this.state.loggedIn ? window.TabletMemberProfile.name : '',
      memberPhone:this.state.loggedIn ? window.TabletMemberProfile.phone : ''};
    this.lastMember = this.state.loggedIn;
    this.onMemberChange = event => {
      if(event.detail === this.state.loggedIn) return;
      this.setState({loggedIn:event.detail,
        memberNickname:event.detail ? window.TabletMemberProfile.name : '',
        memberPhone:event.detail ? window.TabletMemberProfile.phone : '',
        ...(!event.detail ? {usePoints:false,pointsApplied:0,selectedGifts:{},voucherApplied:false,selectedVoucher:null,codeApplied:false,pay:this.state.pay === 'funpay' ? 'onsite' : this.state.pay} : {})});
    };
  }
  openSpecModal(key) {
    const item=this.codeItems.find(row=>row.key===key);
    if(!item) return;
    window.TabletPaymentProductDetail.open({...item, category:key==='tofu-reward' ? '優惠贈品' : '優惠商品', maxQty:key==='tofu-reward' ? 1 : 99}, (key==='bacon' || key==='cheesepot') ? window.TabletProductOptions : [], selection=>{
      const options=selection.options.map(option=>({label:`${option.group}：${option.name}${option.quantity > 1 ? ` × ${option.quantity}` : ''}${option.surcharge ? ` (+NT$ ${option.surcharge})` : ''}`,detail:''}));
      options.push(...selection.flavors.map(label=>({label,detail:''})));
      this.setState(s=>{
        const added=Array.from({length:selection.qty},(_,index)=>({id:'discount-cart-'+(s.nextDiscountCartId+index),key,name:item.name,price:selection.unit,selected:true,addedByCampaign:key!=='tofu-reward',addedByCampaignReward:key==='tofu-reward',note:selection.note,options}));
        const rows=[...s.discountCartItems,...added];
        return {discountCartItems:rows,cartAdded:{...s.cartAdded,[key]:true},codeQty:{...s.codeQty,[key]:(s.codeQty[key] || 0)+selection.qty},codeItemOptions:{...s.codeItemOptions,[key]:options},nextDiscountCartId:s.nextDiscountCartId+selection.qty,codeInitialized:true,campaignProductsOpen:key!=='tofu-reward' && 125+rows.filter(row=>row.addedByCampaign).reduce((sum,row)=>sum+row.price,0)>=500 ? false : s.campaignProductsOpen};
      });
    });
  }
  componentDidMount() {
    document.addEventListener('tablet-member-change',this.onMemberChange);
    this.syncTablet();
  }
  componentDidUpdate() { this.syncTablet(); }
  componentWillUnmount() { document.removeEventListener('tablet-member-change',this.onMemberChange); }
  syncTablet() {
    if(this.state.loggedIn) window.TabletMemberProfile = {name:this.state.memberNickname,phone:this.state.memberPhone};
    if(this.lastMember !== this.state.loggedIn) {
      this.lastMember = this.state.loggedIn;
      document.dispatchEvent(new CustomEvent('tablet-member-sync',{detail:this.state.loggedIn}));
    }
    const cartSignature=JSON.stringify(this.state.discountCartItems);
    if(cartSignature !== this.lastCartSignature) {
      this.lastCartSignature=cartSignature;
      window.updateTabletCheckoutItems?.(this.state.discountCartItems);
    }
    // Give each reference overlay modal focus, keeping tab navigation inside it.
    const overlays = [...document.querySelectorAll('.checkout-modal-backdrop')];
    const top = overlays.sort((a,b)=>Number(a.style.zIndex)-Number(b.style.zIndex)).at(-1);
    if(this.activeOverlay !== top) {
      this.activeOverlay = top;
      if(top) {
        const dialog=top.querySelector('[role="dialog"]');
        const title=dialog?.querySelector('span,div');
        if(dialog && !dialog.hasAttribute('aria-label')) dialog.setAttribute('aria-label',title?.textContent.trim() || '結帳選項');
        (dialog?.querySelector('button,input') || dialog)?.focus({preventScroll:true});
        top.onkeydown=event=>{
          if(event.key !== 'Tab') return;
          const focusable=[...top.querySelectorAll('button,input,[tabindex="0"]')].filter(el=>!el.disabled && el.getClientRects().length);
          const first=focusable[0],last=focusable.at(-1);
          if(event.shiftKey && document.activeElement===first){event.preventDefault();last?.focus();}
          else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first?.focus();}
        };
      }
    }
  }
  clearCodeCartItems() {
    try { localStorage.removeItem('codeSpecItem'); } catch {}
    this.setState({campaignProductsOpen:true,campaignRewardOpen:true,discountCartItems:this.baseRows.map(row=>({...row})),codeQty:{pork:0,bacon:0,cheesepot:1},cartAdded:{},codeItemOptions:{},codeApplied:false,nextDiscountCartId:3});
  }
  leaveIncompleteCodeCampaign() {
    this.clearCodeCartItems();
    this.setState({showCodeModal:false,showCodeLeaveModal:false,codeInteracted:false,showSpecModal:false,specKey:null,specSel:{},specQty:1});
  }
  renderVals() {
    const vals=super.renderVals();
    for(const name of ['Products','Reward','Notes']) vals[`campaign${name}ArrowStyle`]={transform:this.state[`campaign${name}Open`] ? 'rotate(180deg)' : 'none'};
    const login=vals.onLogin;
    vals.onLogin=()=>{login();this.setState({memberNickname:window.TabletMemberProfile.name,memberPhone:window.TabletMemberProfile.phone});};
    // Payment submission remains an inert prototype action as requested.
    vals.goPay=()=>{};
    // Dynamic style objects use the same readable tablet type scale as the template.
    const scale=value=>{
      if(Array.isArray(value)) return value.map(scale);
      if(!value || typeof value!=='object') return value;
      return Object.fromEntries(Object.entries(value).map(([key,item])=>{
        if(key==='fontSize' && /^\d+px$/.test(item)) {const n=parseInt(item);return [key,`${n<=14?18:n<=16?20:n<=18?24:n<=20?26:n}px`];}
        return [key,scale(item)];
      }));
    };
    return scale(vals);
  }
}

};
