// Product options shared by ordering and checkout product details.
window.TabletProductOptions = [
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
