// Referencias al DOM (elementos de la interfaz)
const editor = document.getElementById('markdown-input');
const vistaPrevia = document.getElementById('preview');
const botonVistaPrevia = document.getElementById('btn-preview');
const botonContraste = document.getElementById('btn-contrast');
const botonFormato = document.getElementById('btn-format');

let contrasteActivo = false;

let estadoFormato = 0;


/**
 * HOF que aplica una transformación al texto seleccionado en el editor.
 * Recibe un callback que toma el texto actual y devuelve el nuevo texto.
 * @param {function(string): string} callback 
 */
function aplicarASeleccion(callback) {
  const inicio = editor.selectionStart;
  const fin = editor.selectionEnd;
  const textoCompleto = editor.value;
  const seleccionado = textoCompleto.slice(inicio, fin);

  const transformado = callback(seleccionado);


  editor.value = textoCompleto.slice(0, inicio) + transformado + textoCompleto.slice(fin);

  editor.selectionStart = inicio;
  editor.selectionEnd = inicio + transformado.length;
}

/**
 * HOF que aplica un reemplazo de líneas según una regex.
 * @param {string} cadena 
 * @param {RegExp} regex 
 * @param {function(...any): string} cb 
 */
function transformarLineas(cadena, regex, cb) {
  return cadena.replace(regex, cb);
}

/**

 * @param {string} cadena 
 * @returns {string}
 */
function escaparHtml(cadena) {
  return cadena
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}


function alternarFormato() {
  aplicarASeleccion(texto => {
    if (estadoFormato === 0) {
    
      estadoFormato = 1;
      return `**${texto}**`;
    } else if (estadoFormato === 1) {

      estadoFormato = 2;

      const sinNegrita = texto.replace(/^\*\*(.*)\*\*$/, '$1');
      return `*${sinNegrita}*`;
    } else {

      estadoFormato = 0;
 
      const sinFormato = texto.replace(/^\*{1,2}(.*)\*{1,2}$/, '$1');
      return sinFormato;
    }
  });
}



function resaltarBloquesCodigo(cadena) {

  return cadena.replace(/```([\s\S]*?)```/g, (coincidencia, codigo) => {
  
    const escapado = escaparHtml(codigo);

    return `<pre><code class="highlight">${escapado}</code></pre>`;
  });
}



function transformarListasNumeradas(cadena) {

  cadena = transformarLineas(
    cadena,
    /^(\d+)\.\s+(.+)$/gm,
    (m, numero, elemento) => `<li data-order="${numero}">${elemento}</li>`
  );


  if (/data-order=/.test(cadena)) {
    cadena = `<ol>${cadena}</ol>`;
  }

  return cadena;
}



function generarVistaPrevia() {
  let texto = editor.value;


  texto = resaltarBloquesCodigo(texto);


  texto = transformarListasNumeradas(texto);


  texto = texto.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  texto = texto.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  texto = texto.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');


  texto = transformarLineas(texto, /^-\s+(.+)$/gm, (m, elemento) => `<li>${elemento}</li>`);
  if (/^<li>/.test(texto)) {
    texto = `<ul>${texto}</ul>`;
  }


  texto = texto.replace(
    /^(?!<(h[1-3]|ul|ol|li|pre)).+$/gm,
    linea => `<p>${linea.trim()}</p>`
  );


  vistaPrevia.innerHTML = texto;
}



function alternarContraste() {
  const encabezados = vistaPrevia.querySelectorAll('h1, h2, h3');
  encabezados.forEach(h => {
    if (!contrasteActivo) {
      h.style.background = '#ff0'; 
      h.style.color = '#a00';      
      h.style.padding = '4px';     
    } else {
    
      h.style.background = '';
      h.style.color = '';
      h.style.padding = '';
    }
  });
  contrasteActivo = !contrasteActivo;
}


window.addEventListener('DOMContentLoaded', () => {

  generarVistaPrevia();
});




botonVistaPrevia.addEventListener('click', () => {
  try {
    generarVistaPrevia();
  } catch (err) {
    console.error('Error al procesar Markdown:', err);
    alert('Ocurrió un error al procesar el Markdown.');
  }
});

botonContraste.addEventListener('click', alternarContraste);

botonFormato.addEventListener('click', alternarFormato);

editor.addEventListener('input', () => {
  if (editor.scrollHeight > editor.clientHeight) {
    editor.scrollTop = editor.scrollHeight;
  }
  if (vistaPrevia.scrollHeight > vistaPrevia.clientHeight) {
    vistaPrevia.scrollTop = vistaPrevia.scrollHeight;
  }
});
