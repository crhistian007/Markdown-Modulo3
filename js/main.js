// Referencias
const input = document.getElementById('markdown-input');
const preview = document.getElementById('preview');
const btnPreview = document.getElementById('btn-preview');
const btnContrast = document.getElementById('btn-contrast');

let contrastOn = false;

// HU2: Generar Preview con RegEx
function generatePreview() {
  let text = input.value;

  // Encabezados: ###, ##, #
  text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  text = text.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Listas simples (líneas que empiezan con "- ")
  // 1) Convertir cada línea "- ítem" en <li>ítem</li>
  text = text.replace(/^- (.+)$/gm, '<li>$1</li>');
  // 2) Agrupar todas las <li>con un <ul>…</ul>
  if (text.includes('<li>')) {
    text = '<ul>' + text + '</ul>';
  }

  // Párrafos restantes
  text = text.replace(/^(?!<(h[1-3]|ul|li)).+$/gm,
    match => `<p>${match.trim()}</p>`
  );

  preview.innerHTML = text;
}

// HU3: Contrastar Encabezados
function toggleContrast() {
  const headings = preview.querySelectorAll('h1, h2, h3');
  headings.forEach(h => {
    if (!contrastOn) {
      // aplica estilos inline simples
      h.style.background = '#ff0';
      h.style.color = '#a00';
      h.style.padding = '4px';
    } else {
      // quita estilos
      h.style.background = '';
      h.style.color = '';
      h.style.padding = '';
    }
  });
  contrastOn = !contrastOn;
}

// Eventos
btnPreview.addEventListener('click', generatePreview);
btnContrast.addEventListener('click', toggleContrast);

// Scroll automático (HU1: que no exceda espacio)
input.addEventListener('input', () => {
  if (input.scrollHeight > input.clientHeight) {
    input.scrollTop = input.scrollHeight;
  }
  if (preview.scrollHeight > preview.clientHeight) {
    preview.scrollTop = preview.scrollHeight;
  }
});
