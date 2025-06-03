// Referencias
const entrada = document.getElementById('markdown-input');
const previsualizacion = document.getElementById('preview');
const btnPrevisualizacion = document.getElementById('btn-preview');
const btnContraste = document.getElementById('btn-contrast');

let ContrasteBool = false;

// HU2: Generar Preview con RegEx
function GeneradorPrevisualizacion() {
  let texto = entrada.value;

  // Encabezados: ###, ##, #
  texto = texto.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  texto = texto.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  texto = texto.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Listas simples (líneas que empiezan con "- ")
  // 1) Convertir cada línea "- ítem" en <li>ítem</li>
  texto = texto.replace(/^- (.+)$/gm, '<li>$1</li>');
  // 2) Agrupar todas las <li>con un <ul>…</ul>
  if (texto.includes('<li>')) {
    texto = '<ul>' + texto + '</ul>';
  }

  // Párrafos restantes
  texto = texto.replace(/^(?!<(h[1-3]|ul|li)).+$/gm,
    match => `<p>${match.trim()}</p>`
  );

  previsualizacion.innerHTML = texto;
}

// HU3: Contrastar Encabezados
function contraste() {
  const headings = previsualizacion.querySelectorAll('h1, h2, h3');
  headings.forEach(h => {
    if (!ContrasteBool) {
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
  ContrasteBool = !ContrasteBool;
}

// Eventos
btnPrevisualizacion.addEventListener('click', GeneradorPrevisualizacion);
btnContraste.addEventListener('click', contraste);

// Scroll automático (HU1: que no exceda espacio)
entrada.addEventListener('input', () => {
  if (entrada.scrollHeight > entrada.clientHeight) {
    entrada.scrollTop = entrada.scrollHeight;
  }
  if (previsualizacion.scrollHeight > previsualizacion.clientHeight) {
    previsualizacion.scrollTop = previsualizacion.scrollHeight;
  }
});