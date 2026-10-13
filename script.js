/* ===========================================================
   ANDÉN · script.js
   Lógica de la compuerta de edad (+18).

   Qué hace:
   1. Al entrar, pregunta "¿Tenés 18 años o más?".
   2. Si responde "Sí": guarda la decisión en localStorage
      y muestra el sitio (no vuelve a preguntar).
   3. Si responde "No": muestra un mensaje y bloquea el acceso.
   4. Mantiene el foco atrapado dentro del modal (accesibilidad).
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  // ---------- 1. Referencias a los elementos del DOM ----------
  var CLAVE_EDAD = 'anden_mayor_de_edad'; // clave usada en localStorage

  var compuerta  = document.getElementById('compuerta-edad');
  var pregunta   = document.getElementById('compuerta-pregunta');
  var rechazo    = document.getElementById('compuerta-rechazo');
  var botonSi    = document.getElementById('boton-si');
  var botonNo    = document.getElementById('boton-no');
  var tituloRechazo = rechazo.querySelector('h2');

  // Guardamos qué elemento tenía el foco antes de abrir el modal,
  // para devolvérselo al cerrar (buena práctica de accesibilidad).
  var elementoPrevio = document.activeElement;

  // ---------- 2. Si ya confirmó antes, entrar directo ----------
  // localStorage guarda texto; comparamos con 'si'.
  if (localStorage.getItem(CLAVE_EDAD) === 'si') {
    liberarAcceso(false); // false = no hace falta devolver el foco
    return;               // no seguimos: la compuerta no se activa
  }

  // El sitio sigue bloqueado: llevamos el foco al primer botón del modal
  botonSi.focus();

  // ---------- 3. Respuestas del visitante ----------
  // Botón "Sí": guardar decisión y mostrar el sitio
  botonSi.addEventListener('click', function () {
    localStorage.setItem(CLAVE_EDAD, 'si');
    liberarAcceso(true);
  });

  // Botón "No": mostrar el mensaje de acceso denegado
  botonNo.addEventListener('click', mostrarRechazo);

  // ---------- 4. Funciones ----------

  // Saca la clase que oculta el contenido y cierra el modal
  function liberarAcceso(devolverFoco) {
    document.body.classList.remove('bloqueado'); // muestra header, main y footer
    compuerta.hidden = true;                     // oculta el modal por completo
    compuerta.removeEventListener('keydown', atraparFoco); // deja de atrapar el Tab
    if (devolverFoco && elementoPrevio) {
      elementoPrevio.focus();
    }
  }

  // Reemplaza la pregunta por el mensaje de "solo mayores de 18"
  function mostrarRechazo() {
    pregunta.hidden = true;   // esconde la pregunta
    rechazo.hidden = false;   // muestra el mensaje
    // Hacemos el título focalizable solo por JavaScript (tabindex="-1")
    // para que los lectores de pantalla lo anuncien al entrar.
    tituloRechazo.setAttribute('tabindex', '-1');
    tituloRechazo.focus();
  }

  // Trampa de foco: evita que la tecla Tab salga del modal.
  // Si el foco está en el último elemento y se aprieta Tab,
  // vuelve al primero (y al revés con Shift+Tab).
  function atraparFoco(evento) {
    if (evento.key !== 'Tab') { return; }

    // Botones visibles dentro del modal (según el paso: pregunta o rechazo)
    var focalizables = Array.prototype.slice.call(
      compuerta.querySelectorAll('button')
    ).filter(function (el) {
      return !el.closest('[hidden]'); // excluye botones en bloques ocultos
    });

    // En el paso de rechazo no hay botones: el foco queda en el mensaje
    if (focalizables.length === 0) {
      evento.preventDefault();
      tituloRechazo.focus();
      return;
    }

    var primero = focalizables[0];
    var ultimo  = focalizables[focalizables.length - 1];

    if (evento.shiftKey && document.activeElement === primero) {
      evento.preventDefault();
      ultimo.focus();   // Shift+Tab en el primero → salta al último
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primero.focus();  // Tab en el último → vuelve al primero
    }
  }
  compuerta.addEventListener('keydown', atraparFoco);

  // Escape NO cierra la compuerta: mostramos el mensaje de solo mayores.
  // Así nadie entra "de casualidad" apretando Escape.
  compuerta.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape') {
      evento.preventDefault();
      mostrarRechazo();
    }
  });

});
