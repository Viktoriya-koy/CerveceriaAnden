/* ============================================================
   ANDÉN · pedido.js
   Lógica del formulario de pedido.

   Qué hace:
   1. Cuenta las botellas que el visitante va cargando.
   2. Muestra el total en vivo.
   3. Cambia el botón según la cantidad:
      - 0 botellas → deshabilitado
      - 1 a 5 → "Pedir por WhatsApp" (abre WhatsApp con el pedido)
      - 6 o más → "Enviar pedido" (por ahora, simulado)
   4. Valida los campos antes de enviar.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  // ============================================================
  // ⚠️  REEMPLAZAR por el número real de WhatsApp cuando exista.
  //     Formato: código país + área + número, sin +, sin espacios.
  //     Ejemplo Argentina CABA: 5491123456789
  // ============================================================
  var NUMERO_WHATSAPP = '5490000000000';

  // ---------- 1. Referencias al DOM ----------
  var formulario = document.getElementById('formulario-pedido');
  var boton       = document.getElementById('boton-pedido');
  var totalNumero = document.getElementById('pedido-total-numero');
  var ayuda       = document.getElementById('pedido-ayuda');
  var mensaje     = document.getElementById('pedido-mensaje');

  var campos = {
    nombre:    document.getElementById('nombre'),
    whatsapp:  document.getElementById('whatsapp'),
    email:     document.getElementById('email'),
    localidad: document.getElementById('localidad'),
    notas:     document.getElementById('notas')
  };

  var cantidades = {
    calden:   document.getElementById('cantidad-calden'),
    quinto:   document.getElementById('cantidad-quinto'),
    estacion: document.getElementById('cantidad-estacion')
  };

  var NOMBRES = {
    calden:   'Caldén',
    quinto:   'Quinto',
    estacion: 'Estación'
  };

  // ---------- 2. Cálculo del total ----------
  function calcularTotal() {
    var total = 0;
    for (var clave in cantidades) {
      var valor = parseInt(cantidades[clave].value, 10);
      if (valor > 0) { total += valor; }
    }
    return total;
  }

  function actualizarEstado() {
    var total = calcularTotal();
    totalNumero.textContent = total;

    if (total === 0) {
      boton.disabled = true;
      boton.textContent = 'Agregá al menos una cerveza';
      boton.classList.remove('boton-whatsapp');
      ayuda.textContent = 'Sumá al menos una botella para continuar.';
    } else if (total < 6) {
      boton.disabled = false;
      boton.textContent = 'Pedir por WhatsApp';
      boton.classList.add('boton-whatsapp');
      ayuda.textContent = 'Con menos de 6 botellas, el pedido se completa por WhatsApp.';
    } else {
      boton.disabled = false;
      boton.textContent = 'Enviar pedido';
      boton.classList.remove('boton-whatsapp');
      ayuda.textContent = 'Con 6 botellas o más, completá el formulario y te contactamos.';
    }
  }

  // ---------- 3. Mensajes de estado ----------
  function mostrarError(texto) {
    mensaje.textContent = texto;
    mensaje.className = 'pedido-mensaje pedido-mensaje--error';
  }

  function mostrarExito(texto) {
    mensaje.textContent = texto;
    mensaje.className = 'pedido-mensaje pedido-mensaje--exito';
  }

  function limpiarMensaje() {
    mensaje.textContent = '';
    mensaje.className = 'pedido-mensaje';
  }

  // ---------- 4. Validación ----------
  function validar() {
    var errores = [];

    if (calcularTotal() === 0) {
      errores.push('elegí al menos una cerveza');
    }
    if (!campos.nombre.value.trim()) {
      errores.push('completá tu nombre');
    }
    if (!campos.whatsapp.value.trim()) {
      errores.push('completá tu WhatsApp');
    }
    if (!campos.localidad.value.trim()) {
      errores.push('completá tu localidad');
    }

    return errores;
  }

  // ---------- 5. Armado de datos ----------
  function obtenerEntrega() {
    var seleccionado = formulario.querySelector('input[name="entrega"]:checked');
    return seleccionado ? seleccionado.value : 'retiro';
  }

  function obtenerCantidades() {
    var resultado = {};
    for (var clave in cantidades) {
      var valor = parseInt(cantidades[clave].value, 10);
      resultado[clave] = valor > 0 ? valor : 0;
    }
    return resultado;
  }

  function armarMensajeWhatsApp() {
    var cant = obtenerCantidades();
    var lineas = ['Hola Andén, quiero hacer un pedido:', ''];

    for (var clave in cant) {
      if (cant[clave] > 0) {
        lineas.push('• ' + cant[clave] + ' ' + NOMBRES[clave]);
      }
    }

    lineas.push('');
    lineas.push('Nombre: ' + campos.nombre.value.trim());
    lineas.push('Localidad: ' + campos.localidad.value.trim());
    lineas.push('Entrega: ' + (obtenerEntrega() === 'retiro' ? 'Retiro en fábrica' : 'Envío a domicilio'));

    if (campos.notas.value.trim()) {
      lineas.push('Notas: ' + campos.notas.value.trim());
    }

    return lineas.join('\n');
  }

  // ---------- 6. Envío del formulario ----------
  formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();
    limpiarMensaje();

    var errores = validar();
    if (errores.length > 0) {
      mostrarError('Faltó: ' + errores.join(', ') + '.');
      return;
    }

    var total = calcularTotal();

    if (total < 6) {
      // Menos de 6: abrir WhatsApp con el mensaje ya armado
      var texto = armarMensajeWhatsApp();
      var url = 'https://wa.me/' + NUMERO_WHATSAPP + '?text=' + encodeURIComponent(texto);
      window.open(url, '_blank', 'noopener');
      mostrarExito('Abrimos WhatsApp con tu pedido. Si no se abrió, revisá el bloqueador de ventanas emergentes.');
    } else {
      // 6 o más: envío simulado (el Worker se conecta en el paso 4)
      mostrarExito('¡Pedido recibido! Te contactamos por WhatsApp a la brevedad. (Envío simulado: falta conectar el Worker en el paso 4.)');
      formulario.reset();
      actualizarEstado();
    }
  });

  // ---------- 7. Escuchar cambios en las cantidades ----------
  for (var clave in cantidades) {
    cantidades[clave].addEventListener('input', actualizarEstado);
    cantidades[clave].addEventListener('change', actualizarEstado);
  }

  // ---------- 8. Estado inicial ----------
  actualizarEstado();

});
