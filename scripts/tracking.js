// Calculadora de puntuación - versión consolidada
// - Persistencia en localStorage
// - Reglas oficiales (según imagen)
// - Modal ganador y tabla de resultados
// - Actualización en vivo de puntajes en la UI

// Variable global para los datos
let datosJugadores = {};

// Tabla de puntajes oficiales
const IGUALES_POINTS = [0,2,4,8,12,18,24];
const DIFERENTES_POINTS = [0,1,3,6,10,15,21];

// Máximos por parcela (limitar en UI y en guardado)
const MAX_IGUALES = 6; // índice máximo válido para IGUALES_POINTS
const MAX_DIFERENTES = 6; // índice máximo válido para DIFERENTES_POINTS
const MAX_RIO = 12;
const MAX_PAREJAS = 3; // máximo número de parejas (cada pareja 5 pts)
const MAX_TREX = 10; // máximo número de T-Rex

function calcularPuntaje(datos) {
    let total = 0;
    const iguales = Math.max(0, Math.min(parseInt(datos.iguales) || 0, IGUALES_POINTS.length - 1));
    total += IGUALES_POINTS[iguales];

    const diferentes = Math.max(0, Math.min(parseInt(datos.diferentes) || 0, DIFERENTES_POINTS.length - 1));
    total += DIFERENTES_POINTS[diferentes];

    total += (parseInt(datos.rio) || 0) * 1; // Río: 1 por dino
    total += (parseInt(datos.trex) || 0) * 1; // T-Rex: 1 por T-Rex
    total += (datos.trio ? 7 : 0); // Trío: 7 pts
    total += (parseInt(datos.parejas) || 0) * 5; // Parejas: 5 por pareja
    total += (datos.unico ? 7 : 0); // Único: 7 pts
    total += (datos.rey ? 1 : 0); // Rey: 1
    return total;
}

function guardarEnLocal() {
    try {
        localStorage.setItem('datosJugadores', JSON.stringify(datosJugadores));
    } catch (e) {
        console.warn('No se pudo guardar en localStorage', e);
    }
}

function cargarDesdeLocal() {
    try {
        const raw = localStorage.getItem('datosJugadores');
        if (!raw) return;
        const parsed = JSON.parse(raw);
        for (const k in parsed) {
            if (datosJugadores[k]) {
                // merge y clamp de valores para evitar valores fuera de rango
                const fuente = Object.assign({}, datosJugadores[k], parsed[k]);
                fuente.iguales = Math.max(0, Math.min(MAX_IGUALES, parseInt(fuente.iguales) || 0));
                fuente.diferentes = Math.max(0, Math.min(MAX_DIFERENTES, parseInt(fuente.diferentes) || 0));
                fuente.parejas = Math.max(0, Math.min(MAX_PAREJAS, parseInt(fuente.parejas) || 0));
                fuente.rio = Math.max(0, parseInt(fuente.rio) || 0);
                fuente.trex = Math.max(0, Math.min(MAX_TREX, parseInt(fuente.trex) || 0));
                fuente.trio = !!fuente.trio;
                fuente.unico = !!fuente.unico;
                fuente.rey = !!fuente.rey;
                datosJugadores[k] = fuente;
            }
        }
    } catch (e) {
        console.warn('Error leyendo localStorage', e);
    }
}

function actualizarPuntajesRivales() {
    // Actualizar todos los spans que terminan en -puntaje-valor (soporta 2..5 jugadores)
    const spans = document.querySelectorAll('[id$="-puntaje-valor"]');
    spans.forEach(span => {
        const id = span.id; // e.g. rival3-puntaje-valor
        const clave = id.replace('-puntaje-valor','');
        const datos = datosJugadores[clave];
        span.textContent = datos ? calcularPuntaje(datos) : '0';
    });
}

function actualizarCalculadora(jugadorId) {
    const calculadoraContainer = document.querySelector('.div-calculadora');
    const valores = calculadoraContainer.querySelectorAll('.valor-parcela');
    const checkboxes = calculadoraContainer.querySelectorAll('.checkbox-parcela');
    const datos = datosJugadores[jugadorId];
    const titulo = document.querySelector('h2');
    const scoringText = window.LanguageSystem ? window.LanguageSystem.getText('scoring-of') : 'Puntuación de';
    titulo.textContent = `${scoringText} ${datos.nombre}`;

    if (valores[0]) valores[0].textContent = datos.iguales;
    if (valores[1]) valores[1].textContent = datos.parejas;
    if (valores[2]) valores[2].textContent = datos.rio;
    if (valores[3]) valores[3].textContent = datos.diferentes;
    if (valores[4]) valores[4].textContent = datos.trex;

    if (checkboxes[0]) checkboxes[0].checked = datos.trio;
    if (checkboxes[1]) checkboxes[1].checked = datos.unico;
    if (checkboxes[2]) checkboxes[2].checked = datos.rey;
}

function guardarDatosJugadorActivo(jugadorActivo) {
    const calculadoraContainer = document.querySelector('.div-calculadora');
    const valores = calculadoraContainer.querySelectorAll('.valor-parcela');
    const checkboxes = calculadoraContainer.querySelectorAll('.checkbox-parcela');
    const datos = datosJugadores[jugadorActivo];

    if (valores[0]) datos.iguales = Math.max(0, Math.min(MAX_IGUALES, parseInt(valores[0].textContent) || 0));
    if (valores[1]) datos.parejas = Math.max(0, Math.min(MAX_PAREJAS, parseInt(valores[1].textContent) || 0));
    if (valores[2]) datos.rio = Math.max(0, parseInt(valores[2].textContent) || 0);
    if (valores[3]) datos.diferentes = Math.max(0, Math.min(MAX_DIFERENTES, parseInt(valores[3].textContent) || 0));
    if (valores[4]) datos.trex = Math.max(0, Math.min(MAX_TREX, parseInt(valores[4].textContent) || 0));

    if (checkboxes[0]) datos.trio = checkboxes[0].checked;
    if (checkboxes[1]) datos.unico = checkboxes[1].checked;
    if (checkboxes[2]) datos.rey = checkboxes[2].checked;

    guardarEnLocal();
    actualizarPuntajesRivales();
}

function mostrarResultadosEnDOM(resultados, ganadores) {
    const cont = document.getElementById('resultado-ganador');
    if (!cont) return;
    cont.innerHTML = '';

    // Contenedor de la tabla con estilo similar a la calculadora
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'tabla-wrapper';

    // Ajustar el ancho de la tabla para que coincida con la calculadora
    try {
        const calculadora = document.querySelector('.div-calculadora');
        if (calculadora) {
            const w = window.getComputedStyle(calculadora).width;
            tableWrapper.style.width = w;
            tableWrapper.style.boxSizing = 'border-box';
            tableWrapper.style.margin = '8px auto 0';
        }
    } catch (e) {
        // no crítico
    }

    const tabla = document.createElement('table');
    tabla.className = 'tabla-resultados';

    const thead = document.createElement('thead');
    const playerHeaderText = window.LanguageSystem ? window.LanguageSystem.getText('player-header') : 'Jugador';
    const pointsHeaderText = window.LanguageSystem ? window.LanguageSystem.getText('points-header') : 'Puntos';
    thead.innerHTML = `<tr><th id="th-jugador" class="th-jugador">${playerHeaderText}</th><th id="th-puntos" class="th-puntos">${pointsHeaderText}</th></tr>`;
    tabla.appendChild(thead);

    const tbody = document.createElement('tbody');
    resultados.forEach(r => {
        const tr = document.createElement('tr');
        const isWinner = ganadores.some(g => g.jugador === r.jugador);
        if (isWinner) tr.className = 'fila-ganador'; else tr.className = 'fila-resultado';

        const tdName = document.createElement('td');
        tdName.className = 'td-nombre';
        tdName.textContent = r.nombre;

        const tdScore = document.createElement('td');
        tdScore.className = 'td-puntos';
        tdScore.textContent = r.puntaje;

        tr.appendChild(tdName);
        tr.appendChild(tdScore);
        tbody.appendChild(tr);
    });
    tabla.appendChild(tbody);

    const header = document.createElement('div');
    header.className = 'resultado-header';
    header.id = 'resultado-header-text'; // Agregamos ID para poder traducir
    const winnerText = window.LanguageSystem ? window.LanguageSystem.getText('winner-text') : 'Ganador';
    const tieText = window.LanguageSystem ? window.LanguageSystem.getText('tie-between') : 'Empate entre';
    const ptsText = window.LanguageSystem ? window.LanguageSystem.getText('pts') : 'pts';
    
    if (ganadores.length === 1) {
        header.textContent = `${winnerText}: ${ganadores[0].nombre} — ${ganadores[0].puntaje} ${ptsText}`;
    } else {
        header.textContent = `${tieText} ${ganadores.map(g => g.nombre).join(', ')} — ${ganadores[0] ? ganadores[0].puntaje : 0} ${ptsText}`;
    }

    tableWrapper.appendChild(tabla);
    cont.appendChild(header);
    cont.appendChild(tableWrapper);

    const btnCopiar = document.createElement('button');
    btnCopiar.id = 'button-copy-results'; // Agregamos ID para poder traducir
    const copyText = window.LanguageSystem ? window.LanguageSystem.getText('copy-results') : 'Copiar resultados';
    btnCopiar.textContent = copyText;
    // usar clases del menú para heredar estilo
    btnCopiar.className = 'button button-play';
    btnCopiar.style.display = 'block';
    btnCopiar.style.margin = '10px auto 0';
    btnCopiar.addEventListener('click', () => {
        const text = resultados.map(r => `${r.nombre}: ${r.puntaje}`).join('\n');
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(()=>{
                // feedback corto
                const copiedText = window.LanguageSystem ? window.LanguageSystem.getText('copied') : 'Copiado ✓';
                const originalText = window.LanguageSystem ? window.LanguageSystem.getText('copy-results') : 'Copiar resultados';
                btnCopiar.textContent = copiedText;
                setTimeout(()=> btnCopiar.textContent = originalText, 1200);
            }).catch(()=> alert(text));
        } else {
            alert(text);
        }
    });
    cont.appendChild(btnCopiar);
}

function calcularGanador() {
    // Guardar datos del jugador activo si hay alguno seleccionado
    const seleccionado = document.querySelector('.boton-rival.seleccionado');
    if (seleccionado) {
        const jugadorActivo = seleccionado.id.replace('-boton','');
        guardarDatosJugadorActivo(jugadorActivo);
    }

    const resultados = [];
    for (const clave in datosJugadores) {
        if (Object.prototype.hasOwnProperty.call(datosJugadores, clave)) {
            const datos = datosJugadores[clave];
            resultados.push({ jugador: clave, nombre: datos.nombre, puntaje: calcularPuntaje(datos) });
        }
    }
    resultados.sort((a,b)=> b.puntaje - a.puntaje);
    const max = resultados[0] ? resultados[0].puntaje : 0;
    const ganadores = resultados.filter(r => r.puntaje === max);
    return { resultados, ganadores };
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar datos por defecto
    datosJugadores = {
        rival1: { nombre: 'Jugador 1', iguales:0, trio:false, parejas:0, unico:false, rio:0, diferentes:0, rey:false, trex:0 },
        rival2: { nombre: 'Jugador 2', iguales:0, trio:false, parejas:0, unico:false, rio:0, diferentes:0, rey:false, trex:0 },
        rival3: { nombre: 'Jugador 3', iguales:0, trio:false, parejas:0, unico:false, rio:0, diferentes:0, rey:false, trex:0 },
        rival4: { nombre: 'Jugador 4', iguales:0, trio:false, parejas:0, unico:false, rio:0, diferentes:0, rey:false, trex:0 }
    };

    // Cargar persistencia
    cargarDesdeLocal();

    // --- LÓGICA DEL MODAL DE CONFIGURACIÓN ---
    const modalConfig = document.getElementById('modal-config');
    const selectNum = document.getElementById('select-num-jugadores');
    const nombresContainer = document.getElementById('nombres-jugadores');
    const btnGuardarConfig = document.getElementById('config-guardar');
    const btnCancelarConfig = document.getElementById('config-cancelar');

    function mostrarInputsSegunCantidad(n) {
        const inputs = nombresContainer.querySelectorAll('.input-nombre');
        inputs.forEach(div => {
            const idx = parseInt(div.getAttribute('data-idx'));
            div.style.display = idx <= n ? 'block' : 'none';
        });
    }

    // Mostrar modal si venimos desde menu.html o si no hay datos guardados
    const ref = document.referrer || '';
    const tieneDatos = localStorage.getItem('datosJugadores');
    if (ref.includes('menu.html') || ref.includes('menu-admin.html') || !tieneDatos) {
        if (modalConfig) modalConfig.style.display = 'flex';
    }

    // Inicializar selector
    if (selectNum) {
        selectNum.addEventListener('change', (e) => mostrarInputsSegunCantidad(parseInt(e.target.value)));
        mostrarInputsSegunCantidad(parseInt(selectNum.value || 4));
    }

    if (btnCancelarConfig && modalConfig) {
        btnCancelarConfig.addEventListener('click', () => { modalConfig.style.display = 'none'; });
    }

    if (btnGuardarConfig) {
        btnGuardarConfig.addEventListener('click', () => {
            const cantidad = parseInt(selectNum.value || 4);
            // construir datosJugadores según inputs
            const inputs = nombresContainer.querySelectorAll('.input-nombre-text');
            const nuevos = {};
            for (let i=0;i<cantidad;i++) {
                const idx = i+1;
                const input = Array.from(inputs).find(inp => parseInt(inp.getAttribute('data-idx'))===idx);
                let nombre = input ? (input.value.trim() || `Jugador ${idx}`) : `Jugador ${idx}`;
                if (nombre.length > 12) nombre = nombre.slice(0,12);
                nuevos[`rival${idx}`] = { nombre, iguales:0, trio:false, parejas:0, unico:false, rio:0, diferentes:0, rey:false, trex:0 };
            }
            // si hay menos de 5, eliminar los visibles extras
            // guardar en memoria y localStorage
            datosJugadores = Object.assign({}, nuevos);
            guardarEnLocal();
            aplicarClasePlayers(cantidad);
            // actualizar UI: nombres y visibilidad de rival5
            for (let i=1;i<=5;i++) {
                const perfil = document.getElementById(`rival${i}-perfil`);
                const nombreSpan = document.getElementById(`rival${i}-nombre`);
                if (datosJugadores[`rival${i}`]) {
                    if (perfil) perfil.style.display = 'inline-block';
                    if (nombreSpan) nombreSpan.textContent = datosJugadores[`rival${i}`].nombre;
                } else {
                    if (perfil) perfil.style.display = 'none';
                }
            }
            // cerrar modal y actualizar calculadora
            if (modalConfig) modalConfig.style.display = 'none';
            // seleccionar primer jugador
            const primerBoton = document.getElementById('rival1-boton');
            document.querySelectorAll('.boton-rival.seleccionado').forEach(el=>el.classList.remove('seleccionado'));
            if (primerBoton) primerBoton.classList.add('seleccionado');
            actualizarCalculadora('rival1');
            actualizarPuntajesRivales();
        });
    }
    // --- fin modal configuración ---

    // Selectores
    const botonesJugadores = document.querySelectorAll('.boton-rival');
    const calculadoraContainer = document.querySelector('.div-calculadora');

    // Renderizar primer jugador
    const primer = document.getElementById('rival1-boton');
    if (primer) primer.classList.add('seleccionado');
    actualizarCalculadora('rival1');
    actualizarPuntajesRivales();

    // Aplicar clase players-N según la configuración guardada (si existe)
    (function aplicarClaseInicial(){
        try {
            const raw = localStorage.getItem('datosJugadores');
            if (!raw) return;
            const parsed = JSON.parse(raw);
            const n = Object.keys(parsed).length;
            aplicarClasePlayers(n);
        } catch(e){}
    })();

    // Helper para aplicar clase players-N
    function aplicarClasePlayers(n) {
        const cont = document.querySelector('.div-perfiles-rivales');
        if (!cont) return;
        // eliminar clases players-* previas
        for (let i=2;i<=5;i++) cont.classList.remove(`players-${i}`);
        if (n >=2 && n <=5) cont.classList.add(`players-${n}`);
    }

    // Click en jugadores
    botonesJugadores.forEach(b => b.addEventListener('click', function(){
        // guardar el actual
        const actual = document.querySelector('.boton-rival.seleccionado');
        if (actual) {
            guardarDatosJugadorActivo(actual.id.replace('-boton',''));
            actual.classList.remove('seleccionado');
        }
        this.classList.add('seleccionado');
        const id = this.id.replace('-boton','');
        actualizarCalculadora(id);
    }));

    // Botones +/-
    calculadoraContainer.querySelectorAll('.btn-incrementar').forEach(btn => {
        btn.addEventListener('click', function(){
            const item = this.closest('.parcela-item');
            const v = item.querySelector('.valor-parcela');
            let n = parseInt(v.textContent)||0;
            // identificar tipo de parcela por ID del label (más confiable que el texto que cambia con traducciones)
            const label = item.querySelector('.nombre-parcela');
            const labelId = label ? label.id : '';
            
            if (labelId === 'equals-plot-label') {
                if (n < MAX_IGUALES) { n++; v.textContent = n; }
            } else if (labelId === 'different-plot-label') {
                if (n < MAX_DIFERENTES) { n++; v.textContent = n; }
            } else if (labelId === 'pairs-plot-label') {
                if (n < MAX_PAREJAS) { n++; v.textContent = n; }
            } else if (labelId === 'trex-count-label') {
                if (n < MAX_TREX) { n++; v.textContent = n; }
            } else if (labelId === 'river-plot-label') {
                if (n < MAX_RIO) { n++; v.textContent = n; }
            } else {
                // parcelas sin límite conocido o checkboxes
                n++; v.textContent = n;
            }
            // guardar el jugador activo actual
            const sel = document.querySelector('.boton-rival.seleccionado');
            if (sel) guardarDatosJugadorActivo(sel.id.replace('-boton',''));
        });
    });
    calculadoraContainer.querySelectorAll('.btn-decrementar').forEach(btn => {
        btn.addEventListener('click', function(){
            const item = this.closest('.parcela-item');
            const v = item.querySelector('.valor-parcela');
            let n = parseInt(v.textContent)||0; if (n>0) { n--; v.textContent = n; }
            // al decrementar no es necesario más validación (ya no baja de 0)
            const sel = document.querySelector('.boton-rival.seleccionado');
            if (sel) guardarDatosJugadorActivo(sel.id.replace('-boton',''));
        });
    });

    // Cambios en checkboxes - guardar inmediatamente
    calculadoraContainer.addEventListener('change', (e) => {
        const t = e.target;
        if (t.classList && t.classList.contains('checkbox-parcela')) {
            const sel = document.querySelector('.boton-rival.seleccionado');
            if (sel) guardarDatosJugadorActivo(sel.id.replace('-boton',''));
        }
    });

    // Inicializar botón calcular y modal
    const botonCalcular = document.getElementById('boton-calcular-ganador');
    const botonReiniciar = document.getElementById('boton-reiniciar-datos');
    const contResultado = document.getElementById('resultado-ganador');
    const modal = document.getElementById('modal-ganador');
    const modalNombre = document.getElementById('modal-ganador-nombre');
    const modalTitulo = document.getElementById('modal-ganador-titulo');
    const modalClose = document.getElementById('modal-ganador-close');

    if (botonCalcular) {
        botonCalcular.addEventListener('click', () => {
                const {resultados, ganadores} = calcularGanador();
                // Si no hay puntajes (todos 0), mostrar mensaje claro en el modal
                const totalPuntos = resultados.reduce((acc, r) => acc + (r.puntaje || 0), 0);
                if (totalPuntos === 0) {
                    const noDataText = window.LanguageSystem ? window.LanguageSystem.getText('no-data') : 'Sin datos';
                    const noDataIngresadosText = window.LanguageSystem ? window.LanguageSystem.getText('no-data-entered') : 'No hay datos ingresados';
                    modalTitulo.textContent = noDataText;
                    modalNombre.textContent = noDataIngresadosText;
                    if (modal) modal.style.display = 'flex';
                    contResultado.textContent = noDataIngresadosText + '.';
                    return;
                }
                const winnerText = window.LanguageSystem ? window.LanguageSystem.getText('winner-text') : 'Ganador';
                const tieText = window.LanguageSystem ? window.LanguageSystem.getText('tie-text') : 'Empate';
                const ptsText = window.LanguageSystem ? window.LanguageSystem.getText('pts') : 'pts';
                
                if (ganadores.length === 1) {
                    modalTitulo.textContent = winnerText;
                    modalNombre.textContent = `${ganadores[0].nombre} — ${ganadores[0].puntaje} ${ptsText}`;
                } else {
                    modalTitulo.textContent = tieText;
                    const andText = window.LanguageSystem ? window.LanguageSystem.getText('and-text') : 'y';
                    modalNombre.textContent = ganadores.map(g => `${g.nombre} (${g.puntaje})`).join(` ${andText} `);
                }
                if (modal) modal.style.display = 'flex';
                mostrarResultadosEnDOM(resultados, ganadores);
                actualizarPuntajesRivales();

                // --- Enviar resultados al servidor para ranking_tracking ---
                try {
                    const payload = {
                        players: resultados.map(r => ({ name: r.nombre, score: r.puntaje }))
                    };
                    fetch('php/tracking-save.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    }).then(res => res.json()).then(data => {
                        console.log('✅ tracking-save respuesta:', data);
                    }).catch(err => console.error('❌ Error enviando tracking-save:', err));
                } catch (e) {
                    console.error('❌ Excepción preparando envío tracking-save:', e);
                }
        });
    }
    // Reiniciar datos: limpiar localStorage y volver a valores por defecto
    function reiniciarDatos() {
        // restablecer objeto en memoria
        datosJugadores = {
            rival1: { nombre: 'Jugador 1', iguales:0, trio:false, parejas:0, unico:false, rio:0, diferentes:0, rey:false, trex:0 },
            rival2: { nombre: 'Jugador 2', iguales:0, trio:false, parejas:0, unico:false, rio:0, diferentes:0, rey:false, trex:0 },
            rival3: { nombre: 'Jugador 3', iguales:0, trio:false, parejas:0, unico:false, rio:0, diferentes:0, rey:false, trex:0 },
            rival4: { nombre: 'Jugador 4', iguales:0, trio:false, parejas:0, unico:false, rio:0, diferentes:0, rey:false, trex:0 }
        };
        try { localStorage.removeItem('datosJugadores'); } catch(e){}
        // actualizar UI
        actualizarCalculadora('rival1');
        actualizarPuntajesRivales();
        const selActual = document.querySelector('.boton-rival.seleccionado');
        if (selActual) selActual.classList.remove('seleccionado');
        const primer = document.getElementById('rival1-boton');
        if (primer) primer.classList.add('seleccionado');
        // limpiar resultados
        if (contResultado) contResultado.innerHTML = '';
    }
    if (botonReiniciar) {
        botonReiniciar.addEventListener('click', () => {
            const confirmMessage = window.LanguageSystem ? window.LanguageSystem.getText('confirm-reset-message') : '¿Seguro que deseas reiniciar los datos de la partida? Se perderán los puntajes guardados.';
            if (!confirm(confirmMessage)) return;
            reiniciarDatos();
        });
    }
    if (modalClose && modal) {
        modalClose.addEventListener('click', () => modal.style.display = 'none');
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
    }

    console.log('Inicialización completa', datosJugadores);
});

// Función global para recalcular resultados (usada por el sistema de idiomas)
window.recalcularResultados = function() {
    const botonCalcular = document.getElementById('boton-calcular-ganador');
    if (botonCalcular) {
        // Simular click del botón calcular para actualizar con el idioma correcto
        botonCalcular.click();
    }
};




// CARGAR DATOS DEL SEGUIMIENTO A LA BASE DE DATOS

