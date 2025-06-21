
const editor      = document.getElementById('markdown-input');
const vista       = document.getElementById('preview');
const btnPreview  = document.getElementById('btn-preview');
const btnClear    = document.getElementById('btn-clear');
const btnFormat   = document.getElementById('btn-format');
const btnContrast = document.getElementById('btn-contrast');
const cntWords    = document.getElementById('word-count');
const cntChars    = document.getElementById('char-count');

let contraste = false;
let fmtState  = 0;


function escaparHtml(txt) {
  return txt
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}


function parseCodeBlocks(text) {
  return text.replace(/```([\s\S]*?)```/g, (_, code) =>
    `<pre class="highlight">${escaparHtml(code)}</pre>`
  );
}


function parseHeaders(text) {
  return text.replace(
    /^(#{1,6})\s*(.+)$/gm,
    (_, hashes, content) => {
      const level = hashes.length;
      return `<h${level}>${content.trim()}</h${level}>`;
    }
  );
}


function parseLists(text) {

  let t = text.replace(
    /^(\s*)([-*]|\d+\.)\s+(.+)$/gm,
    (_, indent, marker, content) => {
      const tag = /\d+\./.test(marker) ? 'ol' : 'ul';
      return `${indent}<li data-list="${tag}">${content}</li>`;
    }
  );

  t = t.replace(
    /(?:<li data-list="ul">[\s\S]*?<\/li>)+/g,
    block => '<ul>' +
      block
        .replace(/<li data-list="ul">/g, '<li>')
        .replace(/<\/li>/g, '</li>') +
      '</ul>'
  );

  t = t.replace(
    /(?:<li data-list="ol">[\s\S]*?<\/li>)+/g,
    block => '<ol>' +
      block
        .replace(/<li data-list="ol">/g, '<li>')
        .replace(/<\/li>/g, '</li>') +
      '</ol>'
  );
  return t;
}


function parseStyles(text) {
  return text

    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

function parseParagraphs(text) {
  return text.replace(
    /^(?!<(?:h[1-6]|ul|ol|li|pre|blockquote|p)[\s>])(.+)$/gm,
    '<p>$1</p>'
  );
}


function renderMarkdown() {
  let md = editor.value;
  md = escaparHtml(md);
  md = parseCodeBlocks(md);
  md = parseHeaders(md);
  md = parseLists(md);
  md = parseStyles(md);
  md = parseParagraphs(md);
  vista.innerHTML = md;
}


function applySelection(fn) {
  const start = editor.selectionStart;
  const end   = editor.selectionEnd;
  const txt   = editor.value;
  const sel   = txt.slice(start, end);
  const mod   = fn(sel);
  editor.value =
    txt.slice(0, start) + mod + txt.slice(end);
  editor.setSelectionRange(start, start + mod.length);
  processInput();
}
function toggleFormat() {
  const marks = ['**','__','*','_'];
  const m = marks[fmtState % marks.length];
  applySelection(s => m + s + m);
  fmtState++;
}


function updateCounters() {
  const t = editor.value.trim();
  cntChars.textContent = `${editor.value.length} caracteres`;
  cntWords.textContent = `${t ? t.split(/\s+/).length : 0} palabras`;
}


function clearEditor() {
  editor.value = '';
  vista.innerHTML = '';
  fmtState = 0;
  contraste = false;
  updateCounters();
}
function toggleContrast() {
  contraste = !contraste;
  vista.classList.toggle('text-dark', contraste);
  vista.classList.toggle('text-light', !contraste);
}


function processInput() {
  renderMarkdown();
  updateCounters();
}

editor.addEventListener('input', () => {

  if (editor.scrollHeight > editor.clientHeight)
    editor.scrollTop = editor.scrollHeight;
  if (vista.scrollHeight > vista.clientHeight)
    vista.scrollTop = vista.scrollHeight;
  processInput();
});
btnPreview.addEventListener('click', processInput);
btnClear.addEventListener('click', clearEditor);
btnFormat.addEventListener('click', toggleFormat);
btnContrast.addEventListener('click', toggleContrast);


window.addEventListener('DOMContentLoaded', () => {
  processInput();
});


