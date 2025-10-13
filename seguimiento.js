// ###### CALCULADORA DE PUNTUACIÓN ######
document.addEventListener('DOMContentLoaded', function() {

  // Referencias UI
  const selCantidad   = document.getElementById('cantidad-jugadores');
  const listaNombres  = document.getElementById('lista-nombres');
  const btnIniciar    = document.getElementById('btn-iniciar');
  const zonaJuego     = document.getElementById('zona-juego');
  const contPerfiles  = document.getElementById('perfiles-rivales');
  const calcContainer = document.querySelector('.div-calculadora');

  // Nuevos elementos
  const btnCalcular   = document.getElementById('btn-calcular');
  const btnReset      = document.getElementById('btn-reset');
  const resultadosSec = document.getElementById('resultados');
  const rankingOl     = document.getElementById('lista-ranking');
  const modal         = document.getElementById('modal-ganador');
  const modalNombre   = document.getElementById('ganador-nombre');
  const modalPuntos   = document.getElementById('ganador-puntos');
  const cerrarModal   = document.getElementById('cerrar-modal');

  // Estado
  let jugadorActivo = null;        // 'rival1', 'rival2', ...
  let datosJugadores = {};         // { rival1: { ...estado... }, ... }

  // Límites (fallback si no hay data-max en HTML)
  const LIMITES = { iguales: 6, parejas: 3, rio: Infinity, diferentes: 6, trex: 10 };

  // Mapas de puntaje
  const MAP_IGUALES     = [0, 2, 4, 8, 12, 18, 24];     // 0..6
  const MAP_DIFERENTES  = [0, 1, 3, 6, 10, 15, 21];     // 0..6

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function feedbackLimite(el) {
    el.style.outline = '2px solid #ff5252';
    el.style.backgroundColor = 'rgba(255,82,82,0.15)';
    setTimeout(() => { el.style.outline = ''; el.style.backgroundColor = ''; }, 220);
  }

  // Render inputs de nombres según cantidad
  function renderInputs(count) {
    listaNombres.innerHTML = '';
    for (let i = 1; i <= count; i++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.id = `nombre-jugador-${i}`;
      input.placeholder = `Nombre del jugador ${i}`;
      input.value = `Jugador ${i}`;
      listaNombres.appendChild(input);
    }
  }

  // Estado por defecto de un jugador
  function estadoDefault(nombre, orden){
    return {
      orden, nombre,
      iguales: 0, trio: false, parejas: 0, unico: false,
      rio: 0, diferentes: 0, rey: false, trex: 0, total: 0
    };
  }

  // Crear perfil visual
  function crearPerfil(index, nombre) {
    const i = index;
    const wrap = document.createElement('span');
    wrap.className = 'perfil-rival';
    wrap.id = `rival${i}-perfil`;
    wrap.innerHTML = `
      <button class="boton-rival" id="rival${i}-boton">
        <span class="fondo-rival" id="rival${i}-fondo">
          <span class="cabeza-rival" id="rival${i}-cabeza"></span>
          <span class="cuerpo-rival" id="rival${i}-cuerpo"></span>
        </span>
      </button>
      <span class="nombre-rival" id="rival${i}-nombre">${nombre}</span>
      <span class="puntaje-rival" id="rival${i}-puntaje">
        <span class="puntaje-rival-texto">Puntaje: </span>
        <span class="puntaje-rival-valor" id="rival${i}-puntaje-valor">0</span>
      </span>
    `;
    return wrap;
  }

  // Guarda el estado actual de la calculadora en el jugador activo
  function guardarDatosJugador() {
    if (!jugadorActivo || !datosJugadores[jugadorActivo] || !calcContainer) return;
    const d = datosJugadores[jugadorActivo];

    const items = calcContainer.querySelectorAll('.parcela-item');
    items.forEach(item => {
      const field = item.dataset.field;
      if (!field) return;

      const valNode = item.querySelector('.valor-parcela');
      const chkNode = item.querySelector('.checkbox-parcela');

      if (valNode) {
        let v = parseInt(valNode.textContent) || 0;
        const max = Number(item.dataset.max ?? '') || LIMITES[field] || Infinity;
        v = clamp(v, 0, max);
        d[field] = v;
      } else if (chkNode) {
        d[field] = !!chkNode.checked;
      }
    });
  }

  // Carga en la calculadora los datos del jugador indicado
  function actualizarCalculadora(jugadorId) {
    if (!calcContainer) return;
    const d = datosJugadores[jugadorId];
    if (!d) return;

    const titulo = document.querySelector('#zona-juego h2');
    if (titulo) titulo.textContent = `Puntuación de ${d.nombre}`;

    const items = calcContainer.querySelectorAll('.parcela-item');
    items.forEach(item => {
      const field = item.dataset.field;
      if (!field) return;

      const valNode = item.querySelector('.valor-parcela');
      const chkNode = item.querySelector('.checkbox-parcela');

      if (valNode) {
        valNode.textContent = String(Number(d[field] || 0));
      } else if (chkNode) {
        chkNode.checked = !!d[field];
      }
    });
  }

  // Selección de jugadores con delegación
  function prepararSeleccionRivales() {
    if (!contPerfiles) return;

    contPerfiles.addEventListener('click', function (e) {
      const btn = e.target.closest('.boton-rival');
      if (!btn || !contPerfiles.contains(btn)) return;

      guardarDatosJugador(); // Persistir el actual

      contPerfiles.querySelectorAll('.boton-rival').forEach(b => b.classList.remove('seleccionado'));
      btn.classList.add('seleccionado');

      jugadorActivo = btn.id.replace('-boton', ''); // 'rivalN'
      actualizarCalculadora(jugadorActivo);

      calcContainer.style.opacity = '0.85';
      setTimeout(() => calcContainer.style.opacity = '1', 120);
    });

    const primero = contPerfiles.querySelector('.boton-rival');
    if (primero) {
      primero.classList.add('seleccionado');
      jugadorActivo = primero.id.replace('-boton', '');
      actualizarCalculadora(jugadorActivo);
    }
  }

  // Delegación para + / - en la calculadora
  if (calcContainer) {
    calcContainer.addEventListener('click', function (e) {
      const inc = e.target.closest('.btn-incrementar');
      const dec = e.target.closest('.btn-decrementar');
      if (!inc && !dec) return;

      const item = e.target.closest('.parcela-item');
      const valSpan = item?.querySelector('.valor-parcela');
      if (!item || !valSpan) return;

      const field = item.dataset.field || '';
      const max = Number(item.dataset.max ?? '') || LIMITES[field] || Infinity;

      let val = parseInt(valSpan.textContent) || 0;
      if (inc) {
        if (val >= max) { feedbackLimite(valSpan); return; }
        valSpan.textContent = String(++val);
      } else if (dec) {
        if (val > 0) valSpan.textContent = String(--val);
      }
      guardarDatosJugador();
    });

    // Checkboxes
    calcContainer.addEventListener('change', function () {
      guardarDatosJugador();
    });
  }

  // Cálculo de total
  function calcularTotal(d) {
    const iguales     = MAP_IGUALES[clamp(Number(d.iguales || 0),     0, 6)];
    const trio        = d.trio ? 7 : 0;
    const parejas     = clamp(Number(d.parejas || 0), 0, 3) * 5;
    const unico       = d.unico ? 7 : 0;
    const rio         = Number(d.rio || 0); // 1:1
    const diferentes  = MAP_DIFERENTES[clamp(Number(d.diferentes || 0), 0, 6)];
    const rey         = d.rey ? 7 : 0;
    const trex        = Number(d.trex || 0); // 1:1
    return iguales + trio + parejas + unico + rio + diferentes + rey + trex;
  }

  function renderRanking(ranking) {
    if (!resultadosSec || !rankingOl) return;
    rankingOl.innerHTML = '';

    ranking.forEach((r, i) => {
      const li = document.createElement('li');
      const medalClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : 'normal';
      const label = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : String(i + 1);
      li.innerHTML = `
        <div class="rank-left">
          <span class="medal ${medalClass}">${label}</span>
          <span class="rank-name">${r.nombre}</span>
        </div>
        <span class="rank-score">${r.total} pts</span>
      `;
      li.classList.add('pop');
      setTimeout(()=>li.classList.remove('pop'), 220);
      rankingOl.appendChild(li);
    });

    resultadosSec.style.display = '';
  }

  function abrirModalGanador(nombre, puntos){
    if (!modal) return;
    modalNombre.textContent = nombre;
    modalPuntos.textContent = `${puntos}`;
    modal.classList.add('show');
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
  }
  function cerrarModalGanador(){
    if (!modal) return;
    modal.classList.remove('show');
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
  }
  modal?.addEventListener('click', (e)=>{
    if (e.target.classList.contains('modal-backdrop')) cerrarModalGanador();
  });
  cerrarModal?.addEventListener('click', cerrarModalGanador);

  // Botón Calcular
  btnCalcular?.addEventListener('click', function () {
    guardarDatosJugador();

    const salida = [];
    Object.keys(datosJugadores).forEach(idKey => {
      const d = datosJugadores[idKey];
      d.total = calcularTotal(d);

      const spanVal = document.getElementById(`${idKey}-puntaje-valor`);
      if (spanVal) spanVal.textContent = String(d.total);

      salida.push({ id: idKey, nombre: d.nombre, total: d.total, orden: d.orden || 0 });
    });

    // Orden: total desc, luego orden inicial
    salida.sort((a, b) => b.total - a.total || a.orden - b.orden);

    renderRanking(salida);

    // Modal ganador
    if (salida[0]) abrirModalGanador(salida[0].nombre, salida[0].total);

    // Micro animación del botón
    this.style.transform = 'translateY(1px) scale(0.99)';
    setTimeout(()=> this.style.transform = '', 100);
  });

  // Botón Reiniciar (todo a default, mismos nombres y cantidad)
  btnReset?.addEventListener('click', function(){
    // Reset estado
    Object.keys(datosJugadores).forEach((idKey, idx) => {
      const nombre = datosJugadores[idKey].nombre;
      datosJugadores[idKey] = estadoDefault(nombre, idx+1);
      // Puntaje visual
      const spanVal = document.getElementById(`${idKey}-puntaje-valor`);
      if (spanVal) spanVal.textContent = '0';
    });

    // Reset calculadora para el jugador activo
    if (jugadorActivo) actualizarCalculadora(jugadorActivo);

    // Ocultar ranking
    if (resultadosSec && rankingOl){ resultadosSec.style.display = 'none'; rankingOl.innerHTML=''; }

    // Cerrar modal si estaba abierto
    cerrarModalGanador();

    // Feedback botón
    this.style.transform = 'translateY(1px) scale(0.99)';
    setTimeout(()=> this.style.transform = '', 100);
  });

  // Iniciar partida
  btnIniciar?.addEventListener('click', function () {
    const count = parseInt(selCantidad?.value || '0', 10);
    if (!count || !listaNombres || !contPerfiles || !zonaJuego) {
      alert('No se pudo iniciar: faltan elementos en la página.');
      return;
    }

    // Reset estado/UI
    datosJugadores = {};
    contPerfiles.innerHTML = '';
    if (resultadosSec && rankingOl) { resultadosSec.style.display = 'none'; rankingOl.innerHTML = ''; }
    cerrarModalGanador();

    for (let i = 1; i <= count; i++) {
      const nombreInput = document.getElementById(`nombre-jugador-${i}`);
      const nombre = (nombreInput?.value || `Jugador ${i}`).trim() || `Jugador ${i}`;

      datosJugadores[`rival${i}`] = estadoDefault(nombre, i);
      contPerfiles.appendChild(crearPerfil(i, nombre));
    }

    // Mostrar zona de juego y preparar selección
    const setup = document.getElementById('setup-jugadores');
    if (setup) setup.style.display = 'none';
    zonaJuego.style.display = 'block';
    prepararSeleccionRivales(); // selecciona el primero y carga calculadora
  });

  // Setup inicial por defecto
  if (selCantidad && listaNombres) {
    renderInputs(2);
    selCantidad.value = '2';
    selCantidad.addEventListener('change', () => renderInputs(parseInt(selCantidad.value, 10)));
  }
});