// Shared tablet header interactions, matching the existing front-end prototype.
(() => {
const $ = selector => document.querySelector(selector);
function notify(message) { const toast = $('#menu-toast'); (document.querySelector('dialog[open]') || document.body).append(toast); toast.textContent = message; toast.classList.add('show'); clearTimeout(notify.timer); notify.timer = setTimeout(() => toast.classList.remove('show'), 2600); }
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
const mobileOrderDialog = $('#mobile-order-dialog');
$('#mobile-order-button').onclick = () => mobileOrderDialog.showModal();
$('#close-mobile-order').onclick = () => mobileOrderDialog.close();
const surveyDialog = $('#survey-dialog');
$('#survey-button').onclick = () => surveyDialog.showModal();
$('#close-survey').onclick = () => surveyDialog.close();
const memberDialog = $('#member-dialog');
// Front-end preview only, matching the mobile prototype's membership flag.
let memberLoggedIn = false;
function renderMember() {
  $('#member-guest').hidden = memberLoggedIn;
  $('#member-account').hidden = !memberLoggedIn;
  $('#member-name').textContent = window.TabletMemberProfile?.name || 'Anna';
  document.dispatchEvent(new CustomEvent('tablet-member-change', { detail: memberLoggedIn }));
}
$('#member-button').onclick = () => {
  try { memberLoggedIn = localStorage.getItem('funMember') === '1'; } catch {}
  renderMember();
  memberDialog.showModal();
};
$('#close-member').onclick = () => memberDialog.close();
$('#member-login').onclick = () => {
  try { localStorage.setItem('funMember', '1'); } catch {}
  memberLoggedIn = true;
  renderMember();
  $('#member-logout').focus();
};
$('#member-logout').onclick = () => {
  try { localStorage.removeItem('funMember'); } catch {}
  memberLoggedIn = false;
  renderMember();
  $('#member-login').focus();
};
document.addEventListener('tablet-member-sync', event => { memberLoggedIn = event.detail; renderMember(); });
const languageDialog = $('#language-dialog');
let selectedLanguage = { code: 'zh-Hant', label: '中文' };
let pendingLanguage = null;
$('#language-button').onclick = () => {
  pendingLanguage = { ...selectedLanguage };
  $('#confirm-language').disabled = false;
  languageDialog.querySelectorAll('[data-language]').forEach(button => { const active = button.dataset.language === selectedLanguage.code; button.classList.toggle('selected', active); button.setAttribute('aria-pressed', String(active)); });
  languageDialog.showModal();
};
languageDialog.querySelector('.service-options').onclick = event => {
  const button = event.target.closest('[data-language]');
  if (!button) return;
  pendingLanguage = { code: button.dataset.language, label: button.textContent };
  languageDialog.querySelectorAll('[data-language]').forEach(option => { option.classList.toggle('selected', option === button); option.setAttribute('aria-pressed', String(option === button)); });
  $('#confirm-language').disabled = false;
};
$('#close-language').onclick = () => languageDialog.close();
$('#confirm-language').onclick = () => {
  if (!pendingLanguage) return;
  selectedLanguage = { ...pendingLanguage };
  $('#language-label').textContent = pendingLanguage.label;
  try { sessionStorage.setItem('tablet-order-language', JSON.stringify(pendingLanguage)); } catch {}
  languageDialog.close();
  notify('已選擇：' + pendingLanguage.label);
};
try {
  const language = JSON.parse(sessionStorage.getItem('tablet-order-language') || 'null');
  const labels = { 'zh-Hant': '中文', en: 'English', ja: '日本語' };
  if (language && labels[language.code]) { selectedLanguage = {code:language.code,label:labels[language.code]}; $('#language-label').textContent = selectedLanguage.label; }
} catch {}

[serviceDialog, languageDialog, mobileOrderDialog, surveyDialog, memberDialog].forEach(dialog => dialog.addEventListener('click', event => { const rect = dialog.getBoundingClientRect(); if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close(); }));
})();
