// Shared display data for the tablet ordering prototype. Demo rows are not persisted.
window.TabletOrderView = (() => {
const posOrderLines = [
  { name: '古早味紅茶', unit: 40, qty: 1, flavors: ['去冰'] },
  { name: '古早味紅茶', unit: 40, qty: -1, flavors: ['去冰'] },
  { name: '香蒜奶油麵包', unit: 90, qty: 1, note: '服務員加點' }
];
const dining = [['桌號','A1桌'],['方案','999方案'],['人數','4大1小'],['開桌時間','10:00']];
function batches(orders) {
  const previewBatches = [
    { demo: true, time: '15:20', lines: [{ name: '提拉米蘇', unit: 150, qty: 1 }] },
    { demo: true, time: '15:35', lines: [
      { name: '巴斯克乳酪蛋糕', unit: 160, qty: 1 },
      { name: '古早味紅茶', unit: 40, qty: 2, flavors: ['去冰', '微糖'] }
    ] }
  ];
  return [...orders, ...previewBatches.slice(orders.length)];
}
return { dining, posOrderLines, batches };
})();
