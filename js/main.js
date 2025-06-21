// 1. Referencias al DOM
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

// 2. Helpers de regex

// Escapa HTML básico
function escaparHtml(txt) {
  return txt
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Detecta y resalta bloques de código ```…```
function parseCodeBlocks(text) {
  return text.replace(/```([\s\S]*?)```/g, (_, code) =>
    `<pre class="highlight">${escaparHtml(code)}</pre>`
  );
}

// Encabezados # a ######
function parseHeaders(text) {
  return text.replace(
    /^(#{1,6})\s*(.+)$/gm,
    (_, hashes, content) => {
      const level = hashes.length;
      return `<h${level}>${content.trim()}</h${level}>`;
    }
  );
}

// Listas ordenadas y desordenadas
function parseLists(text) {
  // items de lista
  let t = text.replace(
    /^(\s*)([-*]|\d+\.)\s+(.+)$/gm,
    (_, indent, marker, content) => {
      const tag = /\d+\./.test(marker) ? 'ol' : 'ul';
      return `${indent}<li data-list="${tag}">${content}</li>`;
    }
  );
  // agrupa <li data-list="ul">…</li> contiguos en <ul>...</ul>
  t = t.replace(
    /(?:<li data-list="ul">[\s\S]*?<\/li>)+/g,
    block => '<ul>' +
      block
        .replace(/<li data-list="ul">/g, '<li>')
        .replace(/<\/li>/g, '</li>') +
      '</ul>'
  );
  // hace igual para ol
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

// Negrita y cursiva
function parseStyles(text) {
  return text
    // negrita **
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // cursiva *
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

// Párrafos: envuelve líneas que no son tags HTML
function parseParagraphs(text) {
  return text.replace(
    /^(?!<(?:h[1-6]|ul|ol|li|pre|blockquote|p)[\s>])(.+)$/gm,
    '<p>$1</p>'
  );
}

// 3. Generar vista previa aplicando todas las reglas
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

// 4. Formateo de selección (bold/italic ciclado)
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

// 5. Contadores
function updateCounters() {
  const t = editor.value.trim();
  cntChars.textContent = `${editor.value.length} caracteres`;
  cntWords.textContent = `${t ? t.split(/\s+/).length : 0} palabras`;
}

// 6. Limpieza y contraste
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

// 7. Orquestación HU1: preview en input, HU2: limpiar, HU3: contadores
function processInput() {
  renderMarkdown();
  updateCounters();
}

editor.addEventListener('input', () => {
  // auto-scroll
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

// 8. Init
window.addEventListener('DOMContentLoaded', () => {
  processInput();
});


