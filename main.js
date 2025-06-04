// Función auxiliar para construir la URL de las imágenes de los dinos.
// Si las tenés en otra carpeta, ajustá 'imagenes/dinos/' acá.
function obtenerUrlArchivo(nombreArchivo) {
    const directorioBase = 'images/dinos/';
    return `${directorioBase}${nombreArchivo}`;
}

// Definición de la clase 'Jugador'. ¡Cada jugador es una instancia de esto!
class Jugador {
    constructor(id, esIA = false) {
        this.id = id; // El número de jugador
        this.mano = []; // Los dinos que tiene en la mano en este momento
        this.parque = { // Los recintos del parque, donde van los dinos
            bosqueSemejanza: [],
            trioFrondoso: [],
            praderaAmor: [],
            reySelva: [],
            pradoDiferencia: [],
            islaSolitaria: []
        };
        this.rio = []; // Los dinos que van al río
        this.puntuacion = 0; // La puntuación actual del jugador
        this.esIA = esIA; // ¿Es una Inteligencia Artificial o un jugador humano?
        this.yaColocoDinoEnTurno = false; // ¿Ya puso un dino en esta fase de colocación?
        this.resultadoDadoActual = null; // El número que le salió en el dado en este turno
    }
}

// Estado global del juego. ¡Acá guardamos todo lo que está pasando en la partida!
const ESTADO_JUEGO = {
    dinosaurios: ['T-Rex', 'Stego', 'Bronto', 'Tricera', 'Ptera', 'Ankylo'],
    // Asegurate de que los nombres de los archivos de imagen coincidan EXACTAMENTE con tus imágenes.
    imagenesDinos: {
        'T-Rex': obtenerUrlArchivo('t-rex.PNG'),
        'Stego': obtenerUrlArchivo('stego.PNG'),
        'Bronto': obtenerUrlArchivo('bronto.PNG'),
        'Tricera': obtenerUrlArchivo('tricera.PNG'),
        'Ptera': obtenerUrlArchivo('ptera.PNG'),
        'Ankylo': obtenerUrlArchivo('ankylo.PNG')
    },
    bolsa: [], // Todos los dinos que quedan por robar
    jugadores: [], // Array de objetos Jugador
    indiceJugadorActual: 0, // El índice del jugador que le toca tirar el dado
    direccionDraft: 1, // 1 para izquierda a derecha (Ronda 1), -1 para derecha a izquierda (Ronda 2)
    turnosPorRonda: 6, // Cuántos turnos hay para jugar los 6 dinos de la mano
    turnoActualEnRonda: 0, // Cuenta cuántas fases de colocación se hicieron en la ronda actual (de 0 a 5)
    rondaActual: 0, // De 0 a 2 (ronda 1 y ronda 2)
    especieDinoSeleccionada: null, // La especie del dino que seleccionó el jugador humano
    dadoTiradoEnTurno: false, // ¿El dado ya fue tirado por el jugador activo en esta fase de colocación?
    dinoSeleccionado: false, // ¿El jugador humano ya seleccionó un dino?
    dinosauriosColocadosEnTurno: 0, // Cuántos dinos se colocaron en esta fase de colocación (por todos los jugadores)
    cantidadJugadores: 0, // Se va a definir en el modal de configuración
    indiceVistaOtroJugadorActual: -1 // -1 significa que no estamos viendo el parque de otro jugador (o el primero por defecto)
};

// Referencias a los elementos del DOM. ¡Así no andamos buscando por toda la página!
const elementos = {
    manoDinosaurios: document.getElementById('mano-dinosaurios'),
    resultadoDado: document.getElementById('resultado-dado'),
    botonTirarDado: document.getElementById('boton-tirar-dado'),
    puntuacionActual: document.getElementById('puntuacion-actual'),
    pantallaMensaje: document.getElementById('pantalla-mensaje'),
    contadorBolsa: document.getElementById('contador-bolsa'),
    infoJugador: document.getElementById('info-jugador'),
    infoTurno: document.getElementById('info-turno'),
    botonReiniciarJuego: document.getElementById('boton-reiniciar-juego'),
    modalConfiguracion: document.getElementById('modal-configuracion'),
    selectorNumeroJugadores: document.getElementById('selector-numero-jugadores'),
    botonIniciarJuego: document.getElementById('boton-iniciar-juego'),
    disposicionParque: document.getElementById('disposicion-parque-jugador-actual'),
    contenedorParquesOtrosJugadores: document.getElementById('contenedor-parques-otros-jugadores'),
    navegacionOtrosJugadores: document.getElementById('navegacion-otros-jugadores'),
    areaMuestraParquesOtrosJugadores: document.getElementById('area-muestra-parques-otros-jugadores')
};

// Capacidades máximas de cada recinto. ¡No entran infinitos dinos en todos, che!
const CAPACIDADES_RECINTOS = {
    bosqueSemejanza: 6,
    pradoDiferencia: 6,
    praderaAmor: 6,
    trioFrondoso: 3,
    reySelva: 1,
    islaSolitaria: 1,
    rio: Infinity // El río no tiene límite, ¡es como un baldío!
};

// Mapeo de las caras del dado a los tipos de recintos permitidos.
// Modificado para que no incluya "¡Cuidado con el T-Rex!", como pediste antes.
const TIPOS_RECINTOS_POR_CARA_DADO = {
    'Bosque': ['bosqueSemejanza', 'trioFrondoso', 'reySelva'],
    'Llanura': ['pradoDiferencia', 'praderaAmor', 'islaSolitaria'],
    'Baños': ['reySelva', 'pradoDiferencia', 'islaSolitaria'],
    'Cafetería': ['bosqueSemejanza', 'trioFrondoso', 'praderaAmor'],
    'Recinto Vacío': ['bosqueSemejanza', 'trioFrondoso', 'reySelva', 'pradoDiferencia', 'praderaAmor', 'islaSolitaria'] // Vacío ahora permite todos los recintos del parque
};

// --- Gestión del Modal de Inicio ---

// Muestra el modal de configuración al principio del juego.
function mostrarModalConfiguracion() {
    elementos.modalConfiguracion.style.display = 'flex'; // Lo hacemos visible con flexbox para centrarlo
}

// Oculta el modal de configuración.
function ocultarModalConfiguracion() {
    elementos.modalConfiguracion.style.display = 'none';
}

// Listener para el botón de "Comenzar Juego" en el modal.
elementos.botonIniciarJuego.addEventListener('click', () => {
    // Tomamos la cantidad de jugadores seleccionada.
    ESTADO_JUEGO.cantidadJugadores = parseInt(elementos.selectorNumeroJugadores.value, 10);
    // Validamos que sea un número entre 2 y 5.
    if (isNaN(ESTADO_JUEGO.cantidadJugadores) || ESTADO_JUEGO.cantidadJugadores < 2 || ESTADO_JUEGO.cantidadJugadores > 5) {
        mostrarMensaje('¡Che, por favor, elegí un número de jugadores válido (entre 2 y 5)!', 'error');
        return; // Salimos si no es válido
    }
    ocultarModalConfiguracion(); // Escondemos el modal
    iniciarJuego(); // Arrancamos la partida, ¡de una!
});

// Listener para el botón de "Reiniciar Juego".
elementos.botonReiniciarJuego.addEventListener('click', () => {
    reiniciarJuego(); // Reiniciamos todo el estado del juego
    mostrarModalConfiguracion(); // Y volvemos a mostrar el modal para empezar de nuevo
});


// --- Lógica Principal del Juego ---

// Inicia un juego nuevo. Se llama una vez al principio.
function iniciarJuego() {
    console.log('iniciarJuego: ¡Arrancando el juego, che!');
    // 1. Inicializamos la bolsa de dinosaurios.
    let dinosIniciales = [];
    ESTADO_JUEGO.dinosaurios.forEach(especie => {
        for (let i = 0; i < 8; i++) { // 8 dinosaurios de cada especie * 6 especies = 48 dinos
            dinosIniciales.push(especie);
        }
    });
    ESTADO_JUEGO.bolsa = mezclarArray(dinosIniciales); // Mezclamos la bolsa, ¡que no haya trampas!

    // 2. Creamos los jugadores: el Jugador 1 es Humano, los demás son IA.
    ESTADO_JUEGO.jugadores = [];
    for (let i = 0; i < ESTADO_JUEGO.cantidadJugadores; i++) {
        // El jugador con índice 0 (Jugador 1) NO es IA.
        ESTADO_JUEGO.jugadores.push(new Jugador(i + 1, i !== 0));
    }
    ESTADO_JUEGO.indiceJugadorActual = 0; // El Jugador 1 (humano) siempre empieza tirando el dado

    // 3. Configuramos los botones para ver los parques de otros jugadores.
    configurarNavegacionOtrosJugadores();
    elementos.contenedorParquesOtrosJugadores.style.display = 'block'; // Mostramos el contenedor de otros parques

    // 4. Añadimos el "listener" (escuchador de eventos) al contenedor del parque actual para los clics.
    elementos.disposicionParque.addEventListener('click', manejarClicRecinto);
    // 5. Añadimos los "listeners" para arrastrar y soltar (Drag and Drop) a todos los recintos y al río.
    // Se agregan acá para que siempre estén disponibles. Su estado de "seleccionable" se actualiza después.
    document.querySelectorAll('.recinto, .area-rio').forEach(el => {
        el.addEventListener('dragover', manejarArrastrarEncima);
        el.addEventListener('dragleave', manejarArrastrarFuera);
        el.addEventListener('drop', manejarSoltar);
    });

    // 6. Ocultamos el botón de reiniciar al inicio de una nueva partida.
    elementos.botonReiniciarJuego.style.display = 'none';

    // 7. ¡Arrancamos la primera ronda!
    iniciarRonda();
}

// Reinicia todo el estado del juego a como estaba al principio.
function reiniciarJuego() {
    console.log('reiniciarJuego: ¡Borrón y cuenta nueva, che!');
    ESTADO_JUEGO.bolsa = [];
    ESTADO_JUEGO.jugadores = [];
    ESTADO_JUEGO.indiceJugadorActual = 0;
    ESTADO_JUEGO.direccionDraft = 1;
    ESTADO_JUEGO.turnoActualEnRonda = 0;
    ESTADO_JUEGO.rondaActual = 0;
    ESTADO_JUEGO.especieDinoSeleccionada = null;
    ESTADO_JUEGO.dadoTiradoEnTurno = false;
    ESTADO_JUEGO.dinoSeleccionado = false;
    ESTADO_JUEGO.dinosauriosColocadosEnTurno = 0;
    ESTADO_JUEGO.cantidadJugadores = 0;
    ESTADO_JUEGO.indiceVistaOtroJugadorActual = -1;

    // Reseteamos los textos y clases de los elementos de la interfaz.
    elementos.resultadoDado.textContent = 'Resultado del Dado:';
    elementos.resultadoDado.classList.remove('tirado');
    elementos.puntuacionActual.textContent = 'Puntuación: 0';
    elementos.contadorBolsa.textContent = 'Bolsa: 0';
    elementos.infoJugador.textContent = 'Jugador: -';
    elementos.infoTurno.textContent = 'Ronda: 0 | Turno: 0/6';
    elementos.manoDinosaurios.innerHTML = ''; // Limpiamos la mano
    elementos.pantallaMensaje.classList.remove('mostrar');
    elementos.pantallaMensaje.className = 'mensaje info';
    elementos.pantallaMensaje.textContent = '¡Bienvenido a tu parque! Configurá la partida.';

    // Limpiamos visualmente el parque del jugador actual.
    const disposicionParqueHumano = document.getElementById('disposicion-parque-jugador-actual');
    disposicionParqueHumano.querySelectorAll('.recinto, .area-rio').forEach(recintoEl => {
        recintoEl.classList.remove('recinto-seleccionable', 'arrastrando-encima', 'sacudir'); // Limpiamos clases de estado
        const contenedor = recintoEl.querySelector('.contenedor-grilla-recinto') || recintoEl.querySelector('.contenedor-flex-recinto') || recintoEl; // El río es el propio elemento
        if(contenedor) {
            contenedor.innerHTML = ''; // Limpiamos los dinos
            if(recintoEl.dataset.tipoRecinto === 'rio') {
                contenedor.innerHTML = '<div class="explicacion-puntuacion-recinto"></div>'; // Mantenemos la explicación del río
            } else {
                // Rellenamos con celdas vacías si es un recinto de parque
                const tipoRecinto = recintoEl.dataset.tipoRecinto;
                const capacidad = CAPACIDADES_RECINTOS[tipoRecinto];
                if (capacidad && capacidad !== Infinity) {
                    for (let i = 0; i < capacidad; i++) {
                        const celda = document.createElement('div');
                        celda.classList.add('celda-recinto');
                        contenedor.appendChild(celda);
                    }
                }
            }
        }
    });

    // Ocultamos y limpiamos los parques de otros jugadores.
    elementos.contenedorParquesOtrosJugadores.style.display = 'none';
    elementos.navegacionOtrosJugadores.innerHTML = '';
    elementos.areaMuestraParquesOtrosJugadores.innerHTML = '';

    elementos.botonTirarDado.disabled = true; // Deshabilitamos el botón de dado
    elementos.botonReiniciarJuego.style.display = 'none'; // Escondemos el botón de reiniciar
}

// Inicia una nueva ronda del juego.
async function iniciarRonda() {
    console.log(`iniciarRonda: ¡Arrancando la Ronda ${ESTADO_JUEGO.rondaActual + 1}, che!`);
    ESTADO_JUEGO.rondaActual++;
    if (ESTADO_JUEGO.rondaActual > 2) { // El juego tiene 2 rondas
        finalizarJuego(); // Si ya pasaron las dos rondas, se termina el juego
        return;
    }

    // Definimos la dirección del "draft" (paso de manos) para la ronda.
    // Ronda 1: de izquierda a derecha. Ronda 2: de derecha a izquierda.
    ESTADO_JUEGO.direccionDraft = (ESTADO_JUEGO.rondaActual === 1) ? 1 : -1;

    // Al inicio de cada ronda, cada jugador roba 6 dinosaurios de la bolsa.
    ESTADO_JUEGO.jugadores.forEach(jugador => {
        jugador.mano = sacarDinosaurios(6);
    });

    ESTADO_JUEGO.turnoActualEnRonda = 0; // Reiniciamos el contador de fases de colocación en la ronda
    
    // Reseteamos el estado para la primera fase de colocación de la ronda.
    ESTADO_JUEGO.dinosauriosColocadosEnTurno = 0; // Nadie colocó dinos todavía en esta fase
    ESTADO_JUEGO.dadoTiradoEnTurno = false; // Nadie tiró el dado todavía
    ESTADO_JUEGO.dinoSeleccionado = false; // El humano no seleccionó dino
    ESTADO_JUEGO.especieDinoSeleccionada = null; // El humano no seleccionó especie
    elementos.resultadoDado.textContent = 'Resultado del Dado:'; // Limpiamos el resultado del dado visible
    elementos.resultadoDado.classList.remove('tirado'); // Removemos la animación

    deshabilitarSeleccionRecintos(false); // Deshabilitamos la selección de recintos al inicio de la ronda

    mostrarMensaje(`¡Ronda ${ESTADO_JUEGO.rondaActual} comienza!`);
    actualizarInterfaz(); // Actualizamos la interfaz para mostrar el estado inicial
    
    // Iniciamos la primera fase de colocación.
    await iniciarTurno();
}

// Inicia una nueva fase de colocación de dinosaurios (un "turno" dentro de la ronda).
async function iniciarTurno() {
    console.log(`iniciarTurno: Iniciando fase de colocación ${ESTADO_JUEGO.turnoActualEnRonda + 1}/${ESTADO_JUEGO.turnosPorRonda} para el jugador ${ESTADO_JUEGO.indiceJugadorActual + 1}.`);
    // El jugador en `ESTADO_JUEGO.indiceJugadorActual` es el que tira el dado en esta fase.
    const jugadorActualParaTirarDado = ESTADO_JUEGO.jugadores[ESTADO_JUEGO.indiceJugadorActual];
    const jugadorHumano = ESTADO_JUEGO.jugadores[0];
    
    // Reiniciamos el estado de colocación para *todos* los jugadores al inicio de una nueva fase.
    ESTADO_JUEGO.jugadores.forEach(jugador => {
        jugador.yaColocoDinoEnTurno = false; // Todos deben colocar un dino en esta fase
        jugador.resultadoDadoActual = null; // Limpiamos el dado del turno anterior para cada jugador
    });
    ESTADO_JUEGO.dinosauriosColocadosEnTurno = 0; // Reseteamos el contador de dinos colocados en esta fase

    // Preparamos el juego para que el jugador activo tire el dado.
    ESTADO_JUEGO.dadoTiradoEnTurno = false; // Todavía no se tiró el dado en esta fase
    ESTADO_JUEGO.dinoSeleccionado = false; // El humano no seleccionó aún
    ESTADO_JUEGO.especieDinoSeleccionada = null; // El humano no seleccionó aún
    elementos.resultadoDado.textContent = 'Resultado del Dado:'; // Limpiamos el resultado del dado visible
    elementos.resultadoDado.classList.remove('tirado');

    // Si el jugador actual para tirar el dado es una IA...
    if (jugadorActualParaTirarDado.esIA) {
        mostrarMensaje(`Turno de la IA (Jugador ${jugadorActualParaTirarDado.id}) para tirar el dado.`);
        elementos.botonTirarDado.disabled = true; // El botón de dado se deshabilita para la IA
        await new Promise(resolver => setTimeout(resolver, 1500)); // Una pequeña pausa para que se note la acción de la IA
        // La IA tira el dado, y después todos los jugadores (incluyendo otras IAs y el humano) colocan.
        await iaTiraDadoYColocaTodos(jugadorActualParaTirarDado);
    } else { // Si es el turno del jugador humano para tirar el dado...
        mostrarMensaje(`Jugador ${jugadorActualParaTirarDado.id} (Vos): ¡Tirá el dado!`);
        elementos.botonTirarDado.disabled = false; // Habilitamos el botón de dado para el humano
    }
    actualizarInterfaz(); // Actualizamos la interfaz
}

// Se ejecuta cuando el jugador humano clickea "Tirar Dado".
async function tirarDado() {
    console.log('tirarDado: El jugador humano está tirando el dado...');
    const jugadorHumano = ESTADO_JUEGO.jugadores[0]; // El jugador humano siempre es el de índice 0
    const jugadorActualParaTirarDado = ESTADO_JUEGO.jugadores[ESTADO_JUEGO.indiceJugadorActual];

    // Chequeos para evitar bugs:
    if (jugadorActualParaTirarDado.esIA) {
        console.log('tirarDado: Error - Un jugador IA intentó tirar el dado. El botón debería estar deshabilitado.');
        return;
    }
    if (ESTADO_JUEGO.dadoTiradoEnTurno) {
        mostrarMensaje(`Jugador ${jugadorActualParaTirarDado.id}: ¡Ya tiraste el dado en esta fase de colocación, che!`, 'advertencia');
        console.log('tirarDado: Dado ya tirado en este turno.');
        return;
    }
    if (jugadorHumano.mano.length === 0 && ESTADO_JUEGO.turnoActualEnRonda < ESTADO_JUEGO.turnosPorRonda) {
        mostrarMensaje(`Jugador ${jugadorHumano.id}: Tu mano está vacía antes de tiempo. Algo raro pasó.`, 'error');
        elementos.botonTirarDado.disabled = true;
        console.log('tirarDado: Mano del humano vacía antes de tiempo.');
        return;
    }

    // Definimos las caras del dado.
    const carasDado = ['Bosque', 'Llanura', 'Baños', 'Cafetería', 'Recinto Vacío'];
    // Obtenemos un resultado aleatorio para el dado y lo guardamos en el jugador que lo tiró.
    jugadorActualParaTirarDado.resultadoDadoActual = carasDado[Math.floor(Math.random() * carasDado.length)];

    // Mostramos una animación de "Rodando..." antes del resultado final.
    elementos.resultadoDado.textContent = 'Rodando...';
    elementos.resultadoDado.classList.remove('tirado'); // Sacamos la clase para que la animación se repita
    setTimeout(() => {
        elementos.resultadoDado.textContent = `Resultado del Dado: ${jugadorActualParaTirarDado.resultadoDadoActual}`;
        elementos.resultadoDado.classList.add('tirado'); // Añadimos la clase para la animación
    }, 300); // Pequeña pausa

    ESTADO_JUEGO.dadoTiradoEnTurno = true; // Marcamos que el dado ya fue tirado en esta fase
    elementos.botonTirarDado.disabled = true; // Deshabilitamos el botón después de tirar

    mostrarMensaje(`Jugador ${jugadorActualParaTirarDado.id}: Tiraste: **${jugadorActualParaTirarDado.resultadoDadoActual}**. Ahora elegí un dino de tu mano (clic o arrastrá) y ponelo en un recinto permitido.`);
    
    // IMPORTANTE: Después de que el humano tira el dado, las IAs también deben tirar y colocar sus dinos.
    // Las IAs respetan el dado que tiró el humano.
    for (let i = 0; i < ESTADO_JUEGO.cantidadJugadores; i++) {
        const jugador = ESTADO_JUEGO.jugadores[i];
        if (jugador.esIA) { // Solo si es una IA
            await new Promise(resolver => setTimeout(resolver, 700)); // Pequeña pausa para la IA
            // Las IAs *NO* son el jugador que tiró el dado en este momento, por lo tanto, respetan el resultado.
            await iaEligeYColoca(jugador, jugadorActualParaTirarDado.resultadoDadoActual, false); // false = NO es el jugador que tiró el dado
        }
    }
    // Después de que todas las IAs terminaron, el jugador humano finaliza su colocación manualmente.
    actualizarInterfaz(); // La interfaz del humano se habilitará si no colocó todavía.
}

// Selecciona un dinosaurio de la mano del jugador humano.
function seleccionarDinosaurio(elementoDino, especie) {
    console.log('seleccionarDinosaurio: Dino seleccionado:', especie);
    const jugadorHumano = ESTADO_JUEGO.jugadores[0];

    // Solo el jugador humano puede seleccionar dinos manualmente.
    if (!jugadorHumano || jugadorHumano.esIA) {
        console.log('seleccionarDinosaurio: No es un jugador humano o es IA, no puede seleccionar dino.');
        return;
    }

    // Chequeos de estado:
    if (!ESTADO_JUEGO.dadoTiradoEnTurno) {
        mostrarMensaje(`Jugador ${jugadorHumano.id}: ¡Primero el jugador activo tiene que tirar el dado!`, 'advertencia');
        console.log('seleccionarDinosaurio: Dado no tirado todavía.');
        return;
    }
    if (jugadorHumano.yaColocoDinoEnTurno) {
        mostrarMensaje(`Jugador ${jugadorHumano.id}: Ya colocaste tu dinosaurio en este turno, che.`, 'advertencia');
        console.log('seleccionarDinosaurio: El humano ya colocó en este turno.');
        return;
    }
    if (jugadorHumano.mano.length === 0) {
        mostrarMensaje(`Jugador ${jugadorHumano.id}: Tu mano está vacía.`, 'advertencia');
        console.log('seleccionarDinosaurio: Mano del humano vacía.');
        return;
    }

    // Removemos la selección anterior si existe.
    const previamenteSeleccionado = elementos.manoDinosaurios.querySelector('.dino-seleccionado');
    if (previamenteSeleccionado) {
        previamenteSeleccionado.classList.remove('dino-seleccionado');
        console.log('seleccionarDinosaurio: Removida selección anterior.');
    }
    
    // Marcamos el nuevo dinosaurio como seleccionado.
    elementoDino.classList.add('dino-seleccionado');
    ESTADO_JUEGO.especieDinoSeleccionada = especie;
    ESTADO_JUEGO.dinoSeleccionado = true;

    mostrarMensaje(`Jugador ${jugadorHumano.id}: Seleccionaste un **${especie}**. Ahora hacé clic o arrastrálo a un recinto o al Río para colocarlo.`);
    actualizarInterfaz(); // Actualizamos la interfaz para que se resalten los recintos válidos.
}

// Coloca un dinosaurio en un recinto o en el río.
async function colocarDinosaurio(idRecinto, elementoDinoSeleccionado = null) {
    console.log('colocarDinosaurio: Intentando colocar dinosaurio en:', idRecinto);
    const jugadorHumano = ESTADO_JUEGO.jugadores[0]; // Referencia al jugador humano
    const jugadorActualParaTirarDado = ESTADO_JUEGO.jugadores[ESTADO_JUEGO.indiceJugadorActual]; // El jugador que tiró el dado

    // Chequeos iniciales de validación.
    if (!jugadorHumano || jugadorHumano.esIA) {
        console.log('colocarDinosaurio: No es jugador humano o es IA, saliendo.');
        return;
    }
    if (jugadorHumano.yaColocoDinoEnTurno) {
        mostrarMensaje(`Jugador ${jugadorHumano.id}: Ya colocaste tu dinosaurio en este turno, che.`, 'advertencia');
        console.log('colocarDinosaurio: El humano ya colocó en este turno.');
        return;
    }
    if (!ESTADO_JUEGO.dinoSeleccionado || !ESTADO_JUEGO.especieDinoSeleccionada) {
        mostrarMensaje(`Jugador ${jugadorHumano.id}: ¡Por favor, seleccioná un dinosaurio primero!`, 'error');
        console.log('colocarDinosaurio: No hay dinosaurio seleccionado.');
        return;
    }
    if (!ESTADO_JUEGO.dadoTiradoEnTurno) {
        mostrarMensaje(`Jugador ${jugadorHumano.id}: ¡Primero el jugador activo tiene que tirar el dado!`, 'error');
        console.log('colocarDinosaurio: Dado no tirado todavía.');
        return;
    }
    if (jugadorHumano.mano.length === 0) {
        mostrarMensaje(`Jugador ${jugadorHumano.id}: Tu mano está vacía. No podés colocar dinos.`, 'advertencia');
        console.log('colocarDinosaurio: Mano del humano vacía.');
        return;
    }

    const especie = ESTADO_JUEGO.especieDinoSeleccionada;
    let nombreRecintoReal;
    let esRio = false;
    
    const elementoObjetivo = document.getElementById(idRecinto);
    if (!elementoObjetivo) {
        console.error('colocarDinosaurio: No se encontró el elemento del recinto objetivo:', idRecinto);
        return;
    }

    // Usamos el atributo `data-tipo-recinto` para identificar el recinto.
    nombreRecintoReal = elementoObjetivo.dataset.tipoRecinto;
    esRio = (nombreRecintoReal === 'rio');

    console.log(`colocarDinosaurio: Colocando ${especie} en ${nombreRecintoReal}. ¿Es Río?: ${esRio}`);

    // Validamos las reglas del dado (del jugador activo) y del propio recinto.
    // Si el humano es el jugador que tiró el dado, tiene más libertad (NO se le aplican las restricciones del dado para parques,
    // pero SÍ la regla de "Recinto Vacío" si aplica).
    const esHumanoQuienTiroDado = (jugadorHumano.id === jugadorActualParaTirarDado.id);
    let esPermitidoPorDado = esColocacionPermitidaPorDado(nombreRecintoReal, jugadorHumano, jugadorActualParaTirarDado.resultadoDadoActual, esHumanoQuienTiroDado);
    
    if (!esPermitidoPorDado) {
        console.log('colocarDinosaurio: Colocación no permitida por reglas del dado.');
        // `esColocacionPermitidaPorDado` ya muestra el mensaje de error si es necesario.
        animarSacudirRecinto(elementoObjetivo); // Feedback visual de que no se puede
        return;
    }

    let esReglaRecintoValida = validarReglasRecinto(nombreRecintoReal, especie, jugadorHumano);

    if (esReglaRecintoValida) {
        if (esRio) {
            jugadorHumano.rio.push(especie); // Agregamos el dino al río
        } else {
            jugadorHumano.parque[nombreRecintoReal].push(especie); // Agregamos el dino al recinto
        }
        
        // Animación de desaparición del dino de la mano.
        if (elementoDinoSeleccionado) {
            elementoDinoSeleccionado.classList.add('colocando'); // Agregamos clase para la animación
            await new Promise(resolver => setTimeout(resolver, 300)); // Esperamos a que la animación termine
        }
        removerDinoDeMano(especie, jugadorHumano); // Sacamos el dino de la mano del jugador
        jugadorHumano.yaColocoDinoEnTurno = true; // Marcamos que el humano ya puso su dino

        // Obtenemos el nombre amigable del recinto para el mensaje.
        let nombreRecintoParaMostrar = '';
        if (esRio) {
            nombreRecintoParaMostrar = 'Río';
        } else {
            const elementoRecinto = document.getElementById(idRecinto);
            if (elementoRecinto) {
                const h3 = elementoRecinto.querySelector('h3');
                if (h3) {
                    nombreRecintoParaMostrar = h3.textContent; // Si tiene un h3, lo usamos
                } else {
                    // Si no tiene h3, convertimos el nombre camelCase a uno legible.
                    nombreRecintoParaMostrar = camelCaseAKebabCase(nombreRecintoReal).replace(/-/g, ' ').split(' ').map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1)).join(' ');
                }
            } else {
                nombreRecintoParaMostrar = camelCaseAKebabCase(nombreRecintoReal).replace(/-/g, ' ').split(' ').map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1)).join(' ');
            }
        }

        mostrarMensaje(`Jugador ${jugadorHumano.id}: Colocaste un **${especie}** en el recinto ${nombreRecintoParaMostrar}.`);
        console.log(`colocarDinosaurio: ${especie} colocado con éxito en ${nombreRecintoReal}.`);

        // Deshabilitamos la interfaz de colocación para el humano en este turno.
        ESTADO_JUEGO.dinoSeleccionado = false;
        ESTADO_JUEGO.especieDinoSeleccionada = null;
        
        await finalizarTurno(); // Llamamos a la función para terminar el turno.
    } else {
        console.log('colocarDinosaurio: Colocación no permitida por reglas del recinto.');
        animarSacudirRecinto(elementoObjetivo); // Feedback visual si falla por reglas del recinto
    }
}

// Verifica si la colocación de un dinosaurio es permitida según el resultado del dado.
// Recibe el nombre del recinto objetivo, el jugador que va a colocar, el resultado del dado
// y si este jugador es el que tiró el dado.
function esColocacionPermitidaPorDado(nombreRecintoObjetivo, jugadorParaColocar, resultadoDado, esJugadorQuienTiroDado = false) {
    console.log(`esColocacionPermitidaPorDado: objetivo=${nombreRecintoObjetivo}, jugador=${jugadorParaColocar.id}, dado=${resultadoDado}, quienTiro=${esJugadorQuienTiroDado}`);

    // El río siempre está disponible para todos los jugadores, sin importar el dado,
    // A MENOS que el dado sea "Recinto Vacío" y haya recintos vacíos en el parque.
    if (nombreRecintoObjetivo === 'rio') {
        if (resultadoDado === 'Recinto Vacío') {
            // Si el dado es "Recinto Vacío" y hay recintos vacíos en el parque, el río NO es una opción.
            let algunRecintoParqueVacio = false;
            for (const clave in jugadorParaColocar.parque) {
                // Nos aseguramos de que el recinto exista y no sea el río (que es Infinito)
                if (CAPACIDADES_RECINTOS[clave] !== undefined && CAPACIDADES_RECINTOS[clave] !== Infinity && jugadorParaColocar.parque[clave].length < CAPACIDADES_RECINTOS[clave]) {
                    algunRecintoParqueVacio = true;
                    break; // Encontramos uno vacío, listo
                }
            }
            if (algunRecintoParqueVacio) {
                if (!jugadorParaColocar.esIA) mostrarMensaje(`Jugador ${jugadorParaColocar.id}: Con el dado "Recinto Vacío", tenés que colocar en un recinto vacío del parque, no en el Río, ¡porque todavía hay espacio!`, 'error');
                console.log(`esColocacionPermitidaPorDado: Río bloqueado por regla 'Recinto Vacío' (hay recintos de parque vacíos).`);
                return false;
            }
        }
        // Si el dado no es "Recinto Vacío", o si es "Recinto Vacío" pero NO hay recintos de parque vacíos, el río está permitido.
        console.log(`esColocacionPermitidaPorDado: Río permitido.`);
        return true;
    }

    // Si es el jugador que tiró el dado (y no es el río):
    if (esJugadorQuienTiroDado) {
        // El jugador que tiró el dado SIEMPRE puede colocar en CUALQUIER recinto de parque (no río)
        // excepto si el dado es "Recinto Vacío" y DEBE ir a un recinto vacío.
        const esRecintoDeParque = CAPACIDADES_RECINTOS[nombreRecintoObjetivo] !== undefined && nombreRecintoObjetivo !== 'rio';
        if (!esRecintoDeParque) {
            if (!jugadorParaColocar.esIA) mostrarMensaje(`Jugador ${jugadorParaColocar.id}: Recinto desconocido o inválido: ${nombreRecintoObjetivo}.`, 'error');
            console.log(`esColocacionPermitidaPorDado: Tipo de recinto de parque inválido: ${nombreRecintoObjetivo}.`);
            return false;
        }

        if (resultadoDado === 'Recinto Vacío') {
            let algunRecintoParqueVacio = false;
            for (const clave in jugadorParaColocar.parque) {
                 if (CAPACIDADES_RECINTOS[clave] !== undefined && CAPACIDADES_RECINTOS[clave] !== Infinity && jugadorParaColocar.parque[clave].length < CAPACIDADES_RECINTOS[clave]) {
                    algunRecintoParqueVacio = true;
                    break;
                }
            }
            if (algunRecintoParqueVacio) {
                // Si hay recintos vacíos en el parque, DEBE colocar en uno de ellos.
                const recintoObjetivoEstaLleno = jugadorParaColocar.parque[nombreRecintoObjetivo].length >= CAPACIDADES_RECINTOS[nombreRecintoObjetivo];
                if (recintoObjetivoEstaLleno) {
                     if (!jugadorParaColocar.esIA) mostrarMensaje(`Jugador ${jugadorParaColocar.id}: Con el dado "${resultadoDado}", tenés que colocar el dinosaurio en un recinto *vacío* del parque. Este recinto ya está lleno.`, 'error');
                    console.log(`esColocacionPermitidaPorDado: Regla 'Recinto Vacío': El recinto objetivo está lleno.`);
                    return false;
                }
            }
            // Si todos los recintos del parque están llenos, DEBE colocar en el río (esa parte ya se manejó al principio).
            // Si llegamos acá, significa que el dado es 'Recinto Vacío', hay espacios en el parque, y el recinto objetivo no está lleno.
        }
        console.log(`esColocacionPermitidaPorDado: El jugador que tiró el dado puede colocar en el recinto de parque.`);
        return true; // El jugador que tiró el dado siempre puede colocar en recintos de parque (salvo las reglas de "Recinto Vacío" aplicadas arriba)
    }

    // Para los jugadores que NO son el que tiró el dado, se aplican las reglas del dado (excepto para el río, ya manejado arriba).
    let permitidoPorDado = false;
    let mensajeFeedback = '';

    if (resultadoDado === 'Recinto Vacío') {
        // Si el dado es "Recinto Vacío"
        let algunRecintoParqueVacio = false;
        for (const clave in jugadorParaColocar.parque) {
            if (CAPACIDADES_RECINTOS[clave] !== undefined && CAPACIDADES_RECINTOS[clave] !== Infinity && jugadorParaColocar.parque[clave].length < CAPACIDADES_RECINTOS[clave]) {
                algunRecintoParqueVacio = true;
                break;
            }
        }
        
        if (algunRecintoParqueVacio) {
            // Si hay recintos vacíos en el parque, DEBE colocar en uno de ellos.
            permitidoPorDado = (nombreRecintoObjetivo !== 'rio' && 
                                jugadorParaColocar.parque[nombreRecintoObjetivo] && 
                                jugadorParaColocar.parque[nombreRecintoObjetivo].length < CAPACIDADES_RECINTOS[nombreRecintoObjetivo]);
            if (!permitidoPorDado) {
                mensajeFeedback = `Con el dado "${resultadoDado}", tenés que colocar el dinosaurio en un recinto vacío del parque, no en el Río, o el recinto que elegiste ya está lleno.`;
                console.log(`esColocacionPermitidaPorDado: Otro jugador: regla 'Recinto Vacío', recinto de parque lleno o río seleccionado.`);
            }
        } else {
            // Si TODOS los recintos del parque están llenos, ENTONCES DEBE colocar en el río.
            // Pero la regla del río ya se manejó al principio. Si llega acá, es porque `nombreRecintoObjetivo` no es 'rio'
            // y todos los recintos del parque están llenos, por lo tanto, no es válido para este `nombreRecintoObjetivo`.
            permitidoPorDado = false; // No hay recintos vacíos de parque, y no es el río.
            mensajeFeedback = `Con el dado "${resultadoDado}", ¡todos tus recintos del parque están llenos! ¡Tenés que colocar el dinosaurio en el Río!`;
            console.log(`esColocacionPermitidaPorDado: Otro jugador: regla 'Recinto Vacío', no hay recintos de parque vacíos, y no es el río.`);
        }
    } else { // Para 'Bosque', 'Llanura', 'Baños', 'Cafetería'
        const recintosPermitidos = TIPOS_RECINTOS_POR_CARA_DADO[resultadoDado];
        permitidoPorDado = recintosPermitidos.includes(nombreRecintoObjetivo);
        if (!permitidoPorDado) {
            const nombresLegibles = recintosPermitidos.map(rec => {
                const el = document.getElementById(`${camelCaseAKebabCase(rec)}-recinto`);
                // Intentamos obtener el nombre del h3 del elemento del DOM si existe, sino usamos el nombre camelCase
                return el ? (el.querySelector('h3')?.textContent || rec) : rec;
            });
            mensajeFeedback = `Con el dado "${resultadoDado}", solo podés colocar en: ${nombresLegibles.join(', ')}.`;
            console.log(`esColocacionPermitidaPorDado: Otro jugador: Tipo de dado '${resultadoDado}' no permitido para ${nombreRecintoObjetivo}.`);
        }
    }

    if (!permitidoPorDado && !jugadorParaColocar.esIA) { // Solo mostramos mensaje al jugador humano si no es permitido
        mostrarMensaje(`Jugador ${jugadorParaColocar.id}: No podés colocarlo acá. ${mensajeFeedback}`, 'error');
    }
    return permitidoPorDado;
}

// Valida las reglas internas de cada recinto (por ejemplo, si acepta solo una especie).
function validarReglasRecinto(nombreRecinto, especieAColocar, jugador) {
    console.log(`validarReglasRecinto: para ${nombreRecinto} con ${especieAColocar}`);
    if (nombreRecinto === 'rio') {
        console.log(`validarReglasRecinto: El Río siempre es válido.`);
        return true; // El río siempre acepta cualquier dinosaurio si el dado lo permite.
    }
    
    const recinto = jugador.parque[nombreRecinto];
    const capacidadMaxima = CAPACIDADES_RECINTOS[nombreRecinto];

    // Primero, verificamos si el recinto ya está lleno.
    if (recinto.length >= capacidadMaxima) {
        let nombreRecintoParaMostrar = camelCaseAKebabCase(nombreRecinto);
        if (!jugador.esIA) { // Si es el jugador humano, buscamos el nombre del h3 para el mensaje
            const elementoRecinto = document.getElementById(`${nombreRecintoParaMostrar}-recinto`);
            if (elementoRecinto) {
                const h3 = elementoRecinto.querySelector('h3');
                if (h3) nombreRecintoParaMostrar = h3.textContent;
            }
        }
        if (!jugador.esIA) mostrarMensaje(`Jugador ${jugador.id}: ¡Che, el recinto (${nombreRecintoParaMostrar}) ya está lleno!`, 'error');
        console.log(`validarReglasRecinto: Recinto ${nombreRecinto} está lleno.`);
        return false;
    }

    // Luego, aplicamos las reglas específicas de cada recinto.
    switch (nombreRecinto) {
        case 'bosqueSemejanza': // "Bosque de la Semejanza"
            // Si ya hay dinos y la nueva especie es diferente, no se puede.
            if (recinto.length > 0 && recinto[0] !== especieAColocar) {
                if (!jugador.esIA) mostrarMensaje(`Jugador ${jugador.id}: El **Bosque de la Semejanza** solo puede tener dinos de la misma especie (ya hay ${recinto[0]}).`, 'error');
                console.log('validarReglasRecinto: Bosque de la Semejanza: especie diferente.');
                return false;
            }
            console.log('validarReglasRecinto: Bosque de la Semejanza: válido.');
            return true;
        case 'pradoDiferencia': // "Prado de la Diferencia"
            // Si la especie ya está en este recinto, no se puede.
            if (recinto.includes(especieAColocar)) {
                if (!jugador.esIA) mostrarMensaje(`Jugador ${jugador.id}: El **Prado de la Diferencia** ya tiene un dino de especie ${especieAColocar}.`, 'error');
                console.log('validarReglasRecinto: Prado de la Diferencia: la especie ya existe.');
                return false;
            }
            console.log('validarReglasRecinto: Prado de la Diferencia: válido.');
            return true;
        case 'reySelva': // "El Rey de la Selva"
        case 'islaSolitaria': // "La Isla Solitaria"
        case 'trioFrondoso': // "El Trío Frondoso"
        case 'praderaAmor': // "Pradera del Amor"
            // Para estos, solo se chequea la capacidad máxima (ya lo hicimos arriba).
            console.log(`validarReglasRecinto: ${nombreRecinto}: válido.`);
            return true;
        default:
            console.warn(`validarReglasRecinto: Tipo de recinto desconocido para validación: ${nombreRecinto}`);
            return true;
    }
}

// Se llama cuando un jugador ha colocado un dinosaurio.
async function finalizarTurno() {
    ESTADO_JUEGO.dinosauriosColocadosEnTurno++;
    console.log(`finalizarTurno: Dino colocado por un jugador. Total colocados en este turno: ${ESTADO_JUEGO.dinosauriosColocadosEnTurno}/${ESTADO_JUEGO.cantidadJugadores}`);
    actualizarInterfaz(); // Actualizamos la interfaz después de cada colocación

    // Si todos los jugadores ya colocaron su dinosaurio en esta fase...
    if (ESTADO_JUEGO.dinosauriosColocadosEnTurno === ESTADO_JUEGO.cantidadJugadores) {
        mostrarMensaje(`¡Todos los jugadores colocaron un dinosaurio! Ahora pasamos las manos.`, 'info');
        console.log('finalizarTurno: Todos los jugadores colocaron su dino. Pasando manos.');
        ESTADO_JUEGO.turnoActualEnRonda++; // Una "fase de colocación" ha terminado

        // Reseteamos el estado del dado global y del humano para la próxima fase.
        ESTADO_JUEGO.dadoTiradoEnTurno = false;
        elementos.resultadoDado.textContent = 'Resultado del Dado:';
        elementos.resultadoDado.classList.remove('tirado');
        
        await pasarManos(); // Pasamos las manos de dinosaurios entre jugadores
        
        // Si ya se jugaron todos los turnos de la ronda...
        if (ESTADO_JUEGO.turnoActualEnRonda >= ESTADO_JUEGO.turnosPorRonda) {
            mostrarMensaje(`¡Ronda ${ESTADO_JUEGO.rondaActual} terminada!`, 'exito');
            console.log(`finalizarTurno: Ronda ${ESTADO_JUEGO.rondaActual} finalizada.`);
            await new Promise(resolver => setTimeout(resolver, 2000)); // Pequeña pausa
            iniciarRonda(); // Iniciamos la siguiente ronda o finalizamos el juego
        } else {
            mostrarMensaje(`¡Arranca la fase de colocación ${ESTADO_JUEGO.turnoActualEnRonda + 1} de ${ESTADO_JUEGO.turnosPorRonda}!`);
            console.log(`finalizarTurno: Iniciando la próxima fase de colocación: ${ESTADO_JUEGO.turnoActualEnRonda + 1}.`);
            // El próximo jugador en el orden será el que tire el dado.
            ESTADO_JUEGO.indiceJugadorActual = (ESTADO_JUEGO.indiceJugadorActual + 1) % ESTADO_JUEGO.cantidadJugadores;
            await iniciarTurno(); // Iniciamos la próxima fase
        }
    } else {
        // Todavía hay jugadores que deben colocar su dinosaurio.
        console.log('finalizarTurno: Esperando que los otros jugadores coloquen su dino.');
    }
}

// Pasa las manos de dinosaurios entre los jugadores según la dirección del "draft".
async function pasarManos() {
    console.log('pasarManos: ¡A pasar las manos de dinos, che!');
    // Creamos un array temporal para las nuevas manos.
    const nuevasManos = new Array(ESTADO_JUEGO.cantidadJugadores).fill(null).map(() => []);
    
    // Asignamos las manos a los nuevos jugadores.
    ESTADO_JUEGO.jugadores.forEach((jugador, indice) => {
        // Calculamos el índice del jugador que recibe la mano.
        const indiceDestino = (indice + ESTADO_JUEGO.direccionDraft + ESTADO_JUEGO.cantidadJugadores) % ESTADO_JUEGO.cantidadJugadores;
        nuevasManos[indiceDestino] = jugador.mano;
    });

    // Actualizamos las manos de cada jugador.
    ESTADO_JUEGO.jugadores.forEach((jugador, indice) => {
        jugador.mano = nuevasManos[indice];
    });

    await new Promise(resolver => setTimeout(resolver, 1000)); // Pequeña pausa para que se vea el paso
    actualizarInterfaz(); // Actualizamos la interfaz después de pasar las manos
}

// --- Lógica de IA ---

// Se llama cuando una IA es el jugador activo y le toca tirar el dado.
async function iaTiraDadoYColocaTodos(jugadorQueTiraDado) {
    console.log(`iaTiraDadoYColocaTodos: La IA (Jugador ${jugadorQueTiraDado.id}) está tirando el dado.`);
    // 1. La IA (jugador activo) tira el dado.
    const carasDado = ['Bosque', 'Llanura', 'Baños', 'Cafetería', 'Recinto Vacío'];
    const resultadoDadoIA = carasDado[Math.floor(Math.random() * carasDado.length)];
    jugadorQueTiraDado.resultadoDadoActual = resultadoDadoIA; // La IA activa guarda su resultado del dado
    
    elementos.resultadoDado.textContent = `Resultado del Dado (IA Jugador ${jugadorQueTiraDado.id}): ${resultadoDadoIA}`;
    elementos.resultadoDado.classList.add('tirado');
    mostrarMensaje(`IA (Jugador ${jugadorQueTiraDado.id}) tira: **${resultadoDadoIA}**. Como es el que tiró, puede poner donde quiera (salvo reglas de Recinto Vacío).`);
    await new Promise(resolver => setTimeout(resolver, 700)); // Pequeña pausa

    // Se marca el dado como tirado para esta fase de colocación.
    ESTADO_JUEGO.dadoTiradoEnTurno = true;
    actualizarInterfaz(); // Actualizamos la interfaz para que el humano pueda colocar su dino

    // 2. Todos los jugadores (incluyendo la IA activa) eligen y colocan un dinosaurio.
    // Usamos un bucle `for...of` o `for` tradicional para poder usar `await` dentro.
    for (let i = 0; i < ESTADO_JUEGO.cantidadJugadores; i++) {
        const jugador = ESTADO_JUEGO.jugadores[i];
        // Si es la IA que tiró el dado, `esJugadorQuienTiroDado` es true.
        // Si es otra IA o el humano, `esJugadorQuienTiroDado` es false (respetan el dado del que tiró).
        const esJugadorActualQuienTiroDado = (jugador.id === jugadorQueTiraDado.id);
        
        if (jugador.esIA) { // Solo si es una IA
            await new Promise(resolver => setTimeout(resolver, 700)); // Pausa entre acciones de IA
            await iaEligeYColoca(jugador, jugadorQueTiraDado.resultadoDadoActual, esJugadorActualQuienTiroDado);
        }
    }
    // Después de que todas las IAs hayan actuado, el jugador humano (si existe) debe colocar su dino.
    actualizarInterfaz(); // Última actualización para asegurar el estado de la UI del humano.
}

// Función que simula la elección y colocación de un dinosaurio por parte de una IA.
// Recibe el objeto del jugador IA, el resultado del dado (del jugador activo) y si esta IA fue la que tiró el dado.
async function iaEligeYColoca(jugador, resultadoDado, esJugadorQuienTiroDado = false) {
    console.log(`iaEligeYColoca: La IA (Jugador ${jugador.id}) está eligiendo un dino. Dado: ${resultadoDado}, ¿Es el que tiró?: ${esJugadorQuienTiroDado}`);
    if (jugador.yaColocoDinoEnTurno) {
        console.log(`iaEligeYColoca: La IA (Jugador ${jugador.id}) ya colocó un dino en este turno.`);
        return;
    }

    // Si la IA no tiene dinos en mano, algo anda mal (o ya los colocó todos).
    if (jugador.mano.length === 0) {
        mostrarMensaje(`IA (Jugador ${jugador.id}): ¡Che, no hay dinos en la mano para jugar!`, 'advertencia');
        jugador.yaColocoDinoEnTurno = true; // Marcamos como colocado para no bloquear el juego
        await finalizarTurno(); // Informamos que esta IA "terminó" su colocación
        console.log(`iaEligeYColoca: La mano de la IA (Jugador ${jugador.id}) está vacía.`);
        return;
    }

    let mejorColocacion = {
        recinto: null,
        dino: null,
        mejoraPuntuacion: -Infinity // Inicializamos con un valor muy bajo para encontrar la mejor opción
    };
    
    // Iteramos sobre todos los dinos en la mano de la IA.
    for (const especieDino of jugador.mano) {
        // Creamos una lista de todos los recintos posibles, incluyendo el río.
        const todosLosRecintosPosibles = Object.keys(jugador.parque).concat(['rio']);

        // Iteramos sobre todos los recintos posibles.
        for (const tipoRecinto of todosLosRecintosPosibles) {
            // Clonamos al jugador para simular la colocación sin afectar el estado real.
            const jugadorTemporal = JSON.parse(JSON.stringify(jugador));
            let arrayObjetivo;
            if (tipoRecinto === 'rio') {
                arrayObjetivo = jugadorTemporal.rio;
            } else {
                arrayObjetivo = jugadorTemporal.parque[tipoRecinto];
            }

            // Verificamos si la colocación es válida según el dado y las reglas del recinto.
            // `jugadorTemporal` se usa para `validarReglasRecinto` para verificar el estado simulado del recinto.
            if (esColocacionPermitidaPorDado(tipoRecinto, jugadorTemporal, resultadoDado, esJugadorQuienTiroDado) &&
                validarReglasRecinto(tipoRecinto, especieDino, jugadorTemporal)) {
                
                arrayObjetivo.push(especieDino); // Simulamos la colocación

                // Calculamos cuánto mejoraría la puntuación si se hiciera esta colocación.
                const puntuacionActualAntes = calcularPuntuacion(jugador); // Puntuación real actual del jugador
                const puntuacionSimulada = calcularPuntuacion(jugadorTemporal); // Puntuación con la colocación simulada
                const mejoraPuntuacion = puntuacionSimulada - puntuacionActualAntes;

                // Priorizamos la colocación que da más puntos.
                if (mejoraPuntuacion > mejorColocacion.mejoraPuntuacion) {
                    mejorColocacion.mejoraPuntuacion = mejoraPuntuacion;
                    mejorColocacion.recinto = tipoRecinto;
                    mejorColocacion.dino = especieDino;
                }
            }
        }
    }

    // Si por alguna razón (ej. bug, todos los recintos están llenos y dado no permite río, etc.)
    // no se encontró un lugar óptimo, intentamos un fallback.
    // En teoría, con el río siempre disponible en algún caso, esto no debería pasar.
    if (!mejorColocacion.recinto) {
        // Si la IA no encontró un lugar "mejor" pero tiene dinos, intenta el primer dino en el río.
        mejorColocacion.dino = jugador.mano[0];
        mejorColocacion.recinto = 'rio';
        console.warn(`iaEligeYColoca: La IA (Jugador ${jugador.id}): No se encontró la mejor colocación. Recurriendo a colocar en el Río.`);
    }
    
    // Realizamos la colocación real en el parque del jugador IA.
    const recintoElegido = mejorColocacion.recinto;
    const dinoElegido = mejorColocacion.dino;

    if (recintoElegido === 'rio') {
        jugador.rio.push(dinoElegido);
    } else {
        jugador.parque[recintoElegido].push(dinoElegido);
    }
    removerDinoDeMano(dinoElegido, jugador); // Sacamos el dino de la mano de la IA
    jugador.yaColocoDinoEnTurno = true; // Marcamos que esta IA ya colocó su dino

    // Obtenemos el nombre del recinto para el mensaje de la IA.
    let nombreRecintoParaMostrarIA = '';
    if (recintoElegido === 'rio') {
        nombreRecintoParaMostrarIA = 'Río';
    } else {
        // Para las IA, no necesitamos buscar en el DOM del parque del jugador humano.
        // Convertimos el nombre camelCase a uno legible.
        nombreRecintoParaMostrarIA = camelCaseAKebabCase(recintoElegido).replace(/-/g, ' ').split(' ').map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1)).join(' ');
    }
    mostrarMensaje(`IA (Jugador ${jugador.id}) coloca el **${dinoElegido}** en el recinto ${nombreRecintoParaMostrarIA}.`);
    console.log(`iaEligeYColoca: La IA (Jugador ${jugador.id}) colocó ${dinoElegido} en ${recintoElegido}.`);
    await new Promise(resolver => setTimeout(resolver, 500)); // Pausa para que se vea la acción

    await finalizarTurno(); // Informamos que la IA ha colocado su dino.
}

// --- Funciones de Utilidad ---

// Mezcla un array de forma aleatoria (algoritmo de Fisher-Yates). ¡Para que la bolsa sea justa!
function mezclarArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Intercambiamos elementos
    }
    return array;
}

// Saca una cantidad específica de dinosaurios de la bolsa.
function sacarDinosaurios(cantidad) {
    const sacados = [];
    for (let i = 0; i < cantidad; i++) {
        if (ESTADO_JUEGO.bolsa.length > 0) {
            sacados.push(ESTADO_JUEGO.bolsa.pop()); // Sacamos el último elemento
        } else {
            mostrarMensaje('¡Che, la bolsa de dinosaurios está vacía! No se pueden sacar más.', 'advertencia');
            break; // Si no hay más, salimos
        }
    }
    return sacados;
}

// Remueve una especie de dinosaurio específica de la mano de un jugador.
function removerDinoDeMano(especie, jugador) {
    console.log(`removerDinoDeMano: Removiendo ${especie} de la mano del jugador ${jugador.id}.`);
    const indice = jugador.mano.indexOf(especie); // Buscamos el índice de la especie
    if (indice > -1) {
        jugador.mano.splice(indice, 1); // Lo sacamos del array
    }
}

// Muestra mensajes en pantalla con una animación.
let timeoutMensaje;
function mostrarMensaje(mensaje, tipo = 'info') {
    clearTimeout(timeoutMensaje); // Limpiamos cualquier mensaje anterior
    elementos.pantallaMensaje.classList.remove('mostrar'); // Escondemos el mensaje actual
    
    // Pequeño retraso para que la animación de "mostrar" se vea bien.
    setTimeout(() => {
        elementos.pantallaMensaje.innerHTML = mensaje;
        elementos.pantallaMensaje.className = `mensaje ${tipo}`; // Cambiamos la clase para el estilo (info, error, etc.)
        elementos.pantallaMensaje.classList.add('mostrar'); // Mostramos el nuevo mensaje
    }, 50);
}

// Calcula la puntuación total de un jugador según las reglas del juego.
function calcularPuntuacion(jugador) {
    let puntuacionTotal = 0;
    const parque = jugador.parque;
    // Creamos una lista con todos los dinos del parque y del río para algunos cálculos.
    const todosLosDinosEnParqueYRio = [];
    for (const clave in parque) {
        todosLosDinosEnParqueYRio.push(...parque[clave]);
    }
    todosLosDinosEnParqueYRio.push(...jugador.rio);


    // Puntuación de El Río: 1 punto por dinosaurio.
    puntuacionTotal += jugador.rio.length;

    // Puntuación de Bosque de la Semejanza (Forest of Sameness)
    // Puntuación triangular: 1, 3, 6, 10, 15, 21 (1+2+3...).
    const longitudBosque = parque.bosqueSemejanza.length;
    // Suma solo si todos los dinos son de la misma especie.
    if (longitudBosque > 0 && parque.bosqueSemejanza.every(d => d === parque.bosqueSemejanza[0])) {
        puntuacionTotal += (longitudBosque * (longitudBosque + 1)) / 2;
    }

    // Puntuación de Prado de la Diferencia (Meadow of Difference)
    // 2 puntos por especie diferente. Máximo 6.
    const especiesPrado = new Set(parque.pradoDiferencia); // Usamos un Set para contar especies únicas
    puntuacionTotal += especiesPrado.size * 2;

    // Puntuación de Pradera del Amor (Pasture of Love)
    // 5 puntos por cada par de dinosaurios. No importa la especie.
    puntuacionTotal += Math.floor(parque.praderaAmor.length / 2) * 5;

    // Puntuación de El Trío Frondoso (Leafy Trio)
    // 7 puntos si tiene 3 dinosaurios.
    if (parque.trioFrondoso.length === 3) {
        puntuacionTotal += 7;
    }

    // Puntuación de El Rey de la Selva (King of the Jungle)
    // 7 puntos si tiene 1 dinosaurio.
    if (parque.reySelva.length === 1) {
        puntuacionTotal += 7;
    }

    // Puntuación de La Isla Solitaria (Lonely Island)
    // 7 puntos si tiene 1 dinosaurio y es la única especie de ese tipo en todo el parque (incluye río).
    if (parque.islaSolitaria.length === 1) {
        const especieDinoSolitario = parque.islaSolitaria[0];
        // Contamos cuántas veces aparece esa especie en *todo* el parque (incluyendo río y el dino en Isla Solitaria).
        const totalInstanciasDinoSolitario = todosLosDinosEnParqueYRio.filter(d => d === especieDinoSolitario).length;
        
        if (totalInstanciasDinoSolitario === 1) { // Si solo hay una instancia (la de la Isla Solitaria)
            puntuacionTotal += 7;
        }
    }

    jugador.puntuacion = puntuacionTotal; // Actualizamos la puntuación del jugador
    return puntuacionTotal;
}

// Actualiza toda la interfaz de usuario para reflejar el estado actual del juego.
function actualizarInterfaz() {
    console.log('actualizarInterfaz: ¡Refrescando la pantalla, che!');
    const jugadorHumano = ESTADO_JUEGO.jugadores[0]; // Siempre mostramos la mano y parque del jugador humano
    if (!jugadorHumano) {
        console.log('actualizarInterfaz: Jugador humano no encontrado, saliendo.');
        return;
    }

    const jugadorActualParaTirarDado = ESTADO_JUEGO.jugadores[ESTADO_JUEGO.indiceJugadorActual];
    elementos.infoJugador.textContent = `Jugador Actual: ${jugadorActualParaTirarDado.id} (${jugadorActualParaTirarDado.esIA ? 'IA' : 'Vos'} - Tira el dado)`;
    elementos.contadorBolsa.textContent = `Bolsa: ${ESTADO_JUEGO.bolsa.length}`;
    elementos.puntuacionActual.textContent = `Puntuación (Vos): ${calcularPuntuacion(jugadorHumano)}`;
    elementos.infoTurno.textContent = `Ronda: ${ESTADO_JUEGO.rondaActual} | Turno: ${ESTADO_JUEGO.turnoActualEnRonda}/${ESTADO_JUEGO.turnosPorRonda}`;

    renderizarManoDinosaurios(jugadorHumano); // Mostramos la mano del humano
    renderizarParque(jugadorHumano, elementos.disposicionParque, true); // Renderizamos el parque del humano
    actualizarParquesOtrosJugadoresUI(); // Actualizamos la vista de los parques de otros jugadores

    // Control del botón de dado: se habilita si es el turno del humano Y NO se tiró el dado aún.
    elementos.botonTirarDado.disabled = !(jugadorActualParaTirarDado.id === jugadorHumano.id && !ESTADO_JUEGO.dadoTiradoEnTurno);

    // Habilitamos/Deshabilitamos la interfaz para colocar dinos del humano.
    // Solo se habilitan los recintos si el humano NO colocó su dino Y el dado YA fue tirado.
    const habilitarColocacionUI = !jugadorHumano.yaColocoDinoEnTurno && ESTADO_JUEGO.dadoTiradoEnTurno;
    habilitarSeleccionRecintos(habilitarColocacionUI);
}

// Dibuja los dinosaurios en la mano del jugador.
function renderizarManoDinosaurios(jugador) {
    elementos.manoDinosaurios.innerHTML = ''; // Limpiamos la mano anterior
    console.log(`renderizarManoDinosaurios: Renderizando mano para jugador ${jugador.id}. ¿Ya colocó?: ${jugador.yaColocoDinoEnTurno}`);

    // Si el jugador humano ya colocó su dino, mostramos un mensaje en su mano.
    if (jugador.yaColocoDinoEnTurno) {
        elementos.manoDinosaurios.textContent = 'Colocaste tu dinosaurio en esta fase. ¡Esperando a que todos terminen, che!';
        return;
    }

    jugador.mano.forEach((especie, indice) => {
        const divDino = document.createElement('div');
        divDino.classList.add('ficha-dinosaurio'); // Clase para la ficha del dino
        if (ESTADO_JUEGO.especieDinoSeleccionada === especie) {
            divDino.classList.add('dino-seleccionado'); // Si está seleccionado, le ponemos la clase
        }
        divDino.dataset.especie = especie; // Guardamos la especie en un atributo de datos
        divDino.innerHTML = `<img src="${ESTADO_JUEGO.imagenesDinos[especie]}" alt="${especie}">`;
        
        // Habilitamos el Drag and Drop para el jugador humano SOLO si no colocó dino y el dado ya fue tirado.
        if (!jugador.esIA && !jugador.yaColocoDinoEnTurno && ESTADO_JUEGO.dadoTiradoEnTurno) {
            divDino.setAttribute('draggable', 'true'); // Habilitamos que se pueda arrastrar
            divDino.id = `dino-mano-${indice}-${especie}`; // ID único para el drag
            divDino.addEventListener('click', () => seleccionarDinosaurio(divDino, especie)); // Clic para seleccionar
            divDino.addEventListener('dragstart', manejarInicioArrastre); // Evento al empezar a arrastrar
            console.log(`renderizarManoDinosaurios: Dino ${especie} es arrastrable.`);
        } else {
             divDino.removeAttribute('draggable'); // Si no se puede, quitamos el atributo
             divDino.classList.remove('dino-seleccionado'); // Y nos aseguramos de que no esté seleccionado
             console.log(`renderizarManoDinosaurios: Dino ${especie} NO es arrastrable.`);
        }

        elementos.manoDinosaurios.appendChild(divDino);
    });
    // Si la mano está vacía (al final de la ronda o por error)
    if (jugador.mano.length === 0 && ESTADO_JUEGO.turnoActualEnRonda < ESTADO_JUEGO.turnosPorRonda) {
        if (!jugador.yaColocoDinoEnTurno) {
            elementos.manoDinosaurios.textContent = 'Tu mano está vacía. Esto no debería pasar.';
        }
    } else if (jugador.mano.length === 0 && ESTADO_JUEGO.turnoActualEnRonda === ESTADO_JUEGO.turnosPorRonda) {
        elementos.manoDinosaurios.textContent = 'Mano Vacía (Ronda Terminada)';
    }
}

// Dibuja el parque de un jugador en el elemento contenedor dado.
// `esJugadorActualHumano` es para decidir si renderiza las explicaciones de puntuación.
function renderizarParque(jugador, elementoContenedor, esJugadorActualHumano = false) {
    console.log(`renderizarParque: Renderizando parque para jugador ${jugador.id}. ¿Es el humano?: ${esJugadorActualHumano}`);
    const parque = jugador.parque;
    
    // Obtenemos las referencias correctas a los contenedores internos de cada recinto.
    const recintoBosque = elementoContenedor.querySelector('[data-tipo-recinto="bosqueSemejanza"] .contenedor-grilla-recinto');
    const recintoPradoDiferencia = elementoContenedor.querySelector('[data-tipo-recinto="pradoDiferencia"] .contenedor-grilla-recinto');
    const recintoPraderaAmor = elementoContenedor.querySelector('[data-tipo-recinto="praderaAmor"] .contenedor-grilla-recinto');
    const recintoTrioFrondoso = elementoContenedor.querySelector('[data-tipo-recinto="trioFrondoso"] .contenedor-flex-recinto');
    const recintoReySelva = elementoContenedor.querySelector('[data-tipo-recinto="reySelva"] .contenedor-flex-recinto');
    const recintoIslaSolitaria = elementoContenedor.querySelector('[data-tipo-recinto="islaSolitaria"] .contenedor-flex-recinto');
    const areaRio = elementoContenedor.querySelector('[data-tipo-recinto="rio"]');

    // Renderizamos el contenido para cada recinto, asegurándonos de que el contenedor exista.
    if (recintoBosque) renderizarContenidoRecinto(recintoBosque, parque.bosqueSemejanza, CAPACIDADES_RECINTOS.bosqueSemejanza, esJugadorActualHumano, jugador);
    if (recintoPradoDiferencia) renderizarContenidoRecinto(recintoPradoDiferencia, parque.pradoDiferencia, CAPACIDADES_RECINTOS.pradoDiferencia, esJugadorActualHumano, jugador);
    if (recintoPraderaAmor) renderizarContenidoRecinto(recintoPraderaAmor, parque.praderaAmor, CAPACIDADES_RECINTOS.praderaAmor, esJugadorActualHumano, jugador);
    if (recintoTrioFrondoso) renderizarContenidoRecinto(recintoTrioFrondoso, parque.trioFrondoso, CAPACIDADES_RECINTOS.trioFrondoso, esJugadorActualHumano, jugador);
    if (recintoReySelva) renderizarContenidoRecinto(recintoReySelva, parque.reySelva, CAPACIDADES_RECINTOS.reySelva, esJugadorActualHumano, jugador);
    if (recintoIslaSolitaria) renderizarContenidoRecinto(recintoIslaSolitaria, parque.islaSolitaria, CAPACIDADES_RECINTOS.islaSolitaria, esJugadorActualHumano, jugador);
    if (areaRio) renderizarContenidoRecinto(areaRio, jugador.rio, CAPACIDADES_RECINTOS.rio, esJugadorActualHumano, jugador);

    // Actualizamos las explicaciones de puntuación (solo si es el parque del jugador humano).
    if (esJugadorActualHumano) {
        actualizarExplicacionesPuntuacionRecintos(jugador);
    }
}

// Función auxiliar para renderizar el contenido (dinosaurios y celdas vacías) de un recinto.
function renderizarContenidoRecinto(contenedor, dinos, capacidad, esJugadorActualHumano, jugador) {
    if (!contenedor) {
        console.error('renderizarContenidoRecinto: El elemento contenedor es nulo o indefinido.');
        return;
    }
    // IMPORTANTE: Si es el río y no es el jugador actual, no limpiar todo el HTML, solo los dinos.
    // Esto es porque el río de otros jugadores no tiene celdas, solo dinos.
    const esRio = contenedor.closest('.area-rio');
    
    if (esRio) {
        // Eliminamos solo los elementos con la clase `ficha-dinosaurio` dentro del río.
        contenedor.querySelectorAll('.ficha-dinosaurio').forEach(fichaDino => fichaDino.remove());
    } else {
        contenedor.innerHTML = ''; // Para recintos de parque, limpiamos y recreamos las celdas.
    }
    
    // Dibujamos los dinosaurios que ya están colocados.
    dinos.forEach(especie => {
        const divDino = document.createElement('div');
        // Fichas chicas para los recintos del parque, más grandes para el río.
        divDino.classList.add(esRio ? 'ficha-dinosaurio' : 'ficha-dinosaurio-chica');
        divDino.innerHTML = `<img src="${ESTADO_JUEGO.imagenesDinos[especie]}" alt="${especie}">`;
        if (esRio) { // Los dinos del río no van en celdas, van directamente en el área.
            contenedor.appendChild(divDino);
        } else { // Los dinos de los recintos de parque van dentro de celdas.
            const celda = document.createElement('div');
            celda.classList.add('celda-recinto');
            celda.appendChild(divDino);
            contenedor.appendChild(celda);
        }
    });

    // Dibujamos celdas vacías para los recintos con capacidad limitada (los que no son el río).
    if (!esRio && capacidad !== Infinity) {
        for (let i = dinos.length; i < capacidad; i++) {
            const celda = document.createElement('div');
            celda.classList.add('celda-recinto');
            contenedor.appendChild(celda);
        }
    }

    // Limpiamos las clases de estado (sacudir, arrastrando-encima) en cada renderizado.
    const recintoPadre = contenedor.closest('.recinto, .area-rio');
    if (recintoPadre) {
        recintoPadre.classList.remove('recinto-seleccionable', 'arrastrando-encima', 'sacudir');
    }
}

// Función para animar el "sacudir" de un recinto cuando la colocación no es válida.
function animarSacudirRecinto(elementoRecinto) {
    console.log('animarSacudirRecinto: Sacudiendo recinto:', elementoRecinto.id);
    if (elementoRecinto) {
        elementoRecinto.classList.add('sacudir'); // Añadimos la clase para la animación
        elementoRecinto.addEventListener('animationend', () => {
            elementoRecinto.classList.remove('sacudir'); // Removemos la clase al terminar la animación
        }, { once: true }); // El listener se elimina después de ejecutarse una vez
    }
}

// Habilita o deshabilita visualmente los recintos que pueden recibir un dinosaurio.
function habilitarSeleccionRecintos(habilitar) {
    console.log(`habilitarSeleccionRecintos: ¿Habilitar UI de colocación?: ${habilitar}`);
    // Solo afectamos a los recintos del parque del jugador humano.
    const recintos = elementos.disposicionParque.querySelectorAll('.recinto, .area-rio');
    const jugadorHumano = ESTADO_JUEGO.jugadores[0];
    const jugadorActualParaTirarDado = ESTADO_JUEGO.jugadores[ESTADO_JUEGO.indiceJugadorActual];

    recintos.forEach(recinto => {
        recinto.classList.remove('recinto-seleccionable'); // Quitamos la clase por defecto
        recinto.classList.remove('arrastrando-encima');
        recinto.classList.remove('sacudir');

        // Habilitamos solo si:
        // 1. `habilitar` es true.
        // 2. Hay una especie de dino seleccionada.
        // 3. El humano NO ha colocado su dino aún en esta fase.
        if (habilitar && ESTADO_JUEGO.especieDinoSeleccionada && !jugadorHumano.yaColocoDinoEnTurno) {
            const tipoRecinto = recinto.dataset.tipoRecinto;
            const esHumanoQuienTiroDado = (jugadorHumano.id === jugadorActualParaTirarDado.id);

            // Verificamos si el dado ya fue tirado y si la colocación es válida.
            if (jugadorActualParaTirarDado.resultadoDadoActual) {
                if (esColocacionPermitidaPorDado(tipoRecinto, jugadorHumano, jugadorActualParaTirarDado.resultadoDadoActual, esHumanoQuienTiroDado) &&
                    validarReglasRecinto(tipoRecipo, ESTADO_JUEGO.especieDinoSeleccionada, jugadorHumano)) {
                    recinto.classList.add('recinto-seleccionable'); // Le agregamos la clase si es seleccionable
                }
            }
        }
    });
}

// Maneja los clics en los recintos del parque del jugador humano.
function manejarClicRecinto(evento) {
    console.log('manejarClicRecinto: Se hizo clic en un recinto.');
    const recintoObjetivo = evento.target.closest('.recinto, .area-rio');
    const jugadorHumano = ESTADO_JUEGO.jugadores[0];
    const jugadorActualParaTirarDado = ESTADO_JUEGO.jugadores[ESTADO_JUEGO.indiceJugadorActual];

    if (!recintoObjetivo) {
        console.log('manejarClicRecinto: El clic no fue en un recinto, saliendo.');
        return;
    }
    console.log('manejarClicRecinto: ID del recinto objetivo:', recintoObjetivo.id);

    // Solo permitimos interacción si es el humano y no ha colocado su dino aún.
    if (jugadorHumano.yaColocoDinoEnTurno) {
        mostrarMensaje(`Jugador ${jugadorHumano.id}: Ya colocaste tu dinosaurio en este turno, che.`, 'advertencia');
        console.log('manejarClicRecinto: El humano ya colocó en este turno. Ignorando clic.');
        return;
    }
    if (!ESTADO_JUEGO.dadoTiradoEnTurno) {
        mostrarMensaje(`Jugador ${jugadorHumano.id}: ¡Primero el jugador activo tiene que tirar el dado!`, 'error');
        console.log('manejarClicRecinto: Dado no tirado todavía. Ignorando clic.');
        return;
    }
    if (!ESTADO_JUEGO.dinoSeleccionado || !ESTADO_JUEGO.especieDinoSeleccionada) {
        mostrarMensaje(`Jugador ${jugadorHumano.id}: ¡Por favor, seleccioná un dinosaurio de tu mano primero!`, 'advertencia');
        console.log('manejarClicRecinto: No hay dinosaurio seleccionado. Ignorando clic.');
        return;
    }

    // Si el recinto clickeado es seleccionable...
    if (recintoObjetivo.classList.contains('recinto-seleccionable')) {
        console.log('manejarClicRecinto: El recinto objetivo es seleccionable. Intentando colocar dino.');
        const elementoDinoSeleccionado = elementos.manoDinosaurios.querySelector('.dino-seleccionado');
        colocarDinosaurio(recintoObjetivo.id, elementoDinoSeleccionado);
    } else {
        console.log('manejarClicRecinto: El recinto objetivo NO es seleccionable por clic.');
        // Si no es seleccionable, damos feedback visual si intentó una acción inválida.
        const tipoRecinto = recintoObjetivo.dataset.tipoRecinto;
        const esHumanoQuienTiroDado = (jugadorHumano.id === jugadorActualParaTirarDado.id);

        if (jugadorActualParaTirarDado.resultadoDadoActual) { // Si el dado ya fue tirado
            const esPermitidoPorDado = esColocacionPermitidaPorDado(tipoRecinto, jugadorHumano, jugadorActualParaTirarDado.resultadoDadoActual, esHumanoQuienTiroDado);
            const esValidaReglaRecinto = validarReglasRecinto(tipoRecinto, ESTADO_JUEGO.especieDinoSeleccionada, jugadorHumano);

            if (!esPermitidoPorDado || !esValidaReglaRecinto) {
                animarSacudirRecinto(recintoObjetivo); // Animamos para indicar que no se puede
            }
        }
    }
}

// --- Funciones para Arrastrar y Soltar (Drag and Drop) ---

// Se activa cuando un elemento empieza a ser arrastrado.
function manejarInicioArrastre(evento) {
    console.log('manejarInicioArrastre: Arrancó el arrastre para:', evento.target.dataset.especie);
    const jugadorHumano = ESTADO_JUEGO.jugadores[0];

    // Solo permitimos arrastrar si el jugador es humano, tiró el dado y no colocó aún.
    if (jugadorHumano.esIA || !ESTADO_JUEGO.dadoTiradoEnTurno || jugadorHumano.yaColocoDinoEnTurno) {
        evento.preventDefault(); // No permite arrastrar
        console.log('manejarInicioArrastre: Arrastre impedido por el estado del juego.');
        return;
    }

    const especie = evento.target.dataset.especie;
    // Guardamos la especie y el ID del dino arrastrado en el objeto DataTransfer del evento.
    evento.dataTransfer.setData('text/plain', especie); // Para compatibilidad (no siempre necesario si usas el ID)
    evento.dataTransfer.setData('dinoId', evento.target.id); // Guardamos el ID del elemento arrastrado
    evento.dataTransfer.effectAllowed = 'move'; // Indicamos que es un movimiento

    // Resaltamos el dinosaurio como seleccionado para arrastrar.
    const divDino = evento.target;
    seleccionarDinosaurio(divDino, especie); // Esto ya agrega 'dino-seleccionado' y actualiza el estado.
}

// Se activa cuando un elemento arrastrado está sobre una zona de "drop" (soltar).
function manejarArrastrarEncima(evento) {
    evento.preventDefault(); // ¡IMPORTANTE! Esto es necesario para permitir el "drop" (soltar).
    const recintoObjetivo = evento.target.closest('.recinto, .area-rio');
    // Si el recinto es seleccionable, permitimos el "drop" y le damos un estilo visual.
    if (recintoObjetivo && recintoObjetivo.classList.contains('recinto-seleccionable')) {
        evento.dataTransfer.dropEffect = 'move';
        recintoObjetivo.classList.add('arrastrando-encima');
    } else {
        evento.dataTransfer.dropEffect = 'none'; // Si no es seleccionable, no se puede soltar aquí.
    }
}

// Se activa cuando un elemento arrastrado sale de una zona de "drop".
function manejarArrastrarFuera(evento) {
    const recintoObjetivo = evento.target.closest('.recinto, .area-rio');
    if (recintoObjetivo) {
        recintoObjetivo.classList.remove('arrastrando-encima'); // Quitamos el estilo de "arrastrando encima".
    }
}

// Se activa cuando un elemento arrastrado se suelta sobre una zona de "drop".
function manejarSoltar(evento) {
    evento.preventDefault();
    console.log('manejarSoltar: Evento de soltar activado.');
    const recintoObjetivo = evento.target.closest('.recinto, .area-rio');
    const jugadorHumano = ESTADO_JUEGO.jugadores[0];
    const jugadorActualParaTirarDado = ESTADO_JUEGO.jugadores[ESTADO_JUEGO.indiceJugadorActual];

    if (!recintoObjetivo) {
        console.log('manejarSoltar: Se soltó fuera de un recinto, saliendo.');
        return;
    }

    recintoObjetivo.classList.remove('arrastrando-encima'); // Quitamos el estilo de arrastrando-encima.

    // Chequeos de estado antes de permitir el drop.
    if (jugadorHumano.yaColocoDinoEnTurno) {
        mostrarMensaje(`Jugador ${jugadorHumano.id}: Ya colocaste tu dinosaurio en este turno, che.`, 'advertencia');
        console.log('manejarSoltar: El humano ya colocó en este turno. Ignorando drop.');
        return;
    }
    if (!ESTADO_JUEGO.dadoTiradoEnTurno) {
        mostrarMensaje(`Jugador ${jugadorHumano.id}: ¡Primero el jugador activo tiene que tirar el dado!`, 'error');
        console.log('manejarSoltar: Dado no tirado todavía. Ignorando drop.');
        return;
    }
    
    // Obtenemos la especie y el ID del dino de los datos transferidos.
    const especieDesdeArrastre = evento.dataTransfer.getData('text/plain');
    const idDinoDesdeArrastre = evento.dataTransfer.getData('dinoId');
    if (!especieDesdeArrastre || !idDinoDesdeArrastre) {
        mostrarMensaje('No se pudo identificar el dinosaurio que intentas arrastrar.', 'error');
        console.error('manejarSoltar: No se encontró especie o ID de dino en dataTransfer.');
        return;
    }

    // Si el dino seleccionado globalmente no coincide con el arrastrado, o si no hay ninguno seleccionado, usamos el del arrastre.
    if (!ESTADO_JUEGO.dinoSeleccionado || ESTADO_JUEGO.especieDinoSeleccionada !== especieDesdeArrastre) {
        const elementoDinoArrastrado = document.getElementById(idDinoDesdeArrastre);
        if (elementoDinoArrastrado) {
             seleccionarDinosaurio(elementoDinoArrastrado, especieDesdeArrastre);
             console.log('manejarSoltar: Forzando la selección del dinosaurio arrastrado.');
        } else {
            mostrarMensaje('Error interno: No se pudo encontrar el dinosaurio arrastrado.', 'error');
            console.error('manejarSoltar: Elemento de dino arrastrado no encontrado en el DOM.');
            return;
        }
    }

    // Si el recinto donde se soltó es seleccionable...
    if (recintoObjetivo.classList.contains('recinto-seleccionable')) {
        console.log('manejarSoltar: El recinto objetivo es seleccionable. Intentando colocar dino vía drop.');
        const elementoDinoSeleccionado = document.getElementById(idDinoDesdeArrastre);
        if (elementoDinoSeleccionado) {
            colocarDinosaurio(recintoObjetivo.id, elementoDinoSeleccionado);
        } else {
            mostrarMensaje('Error: No se pudo identificar el dinosaurio que intentas arrastrar.', 'error');
            console.error('manejarSoltar: Elemento de dino seleccionado no encontrado en el DOM después del arrastre.');
        }
    } else {
        console.log('manejarSoltar: El recinto objetivo NO es seleccionable por drop.');
        // Si el recinto no es seleccionable (por reglas del dado o recinto), mostramos mensaje y animamos.
        if (!jugadorHumano.esIA && !jugadorHumano.yaColocoDinoEnTurno) {
            const tipoRecinto = recintoObjetivo.dataset.tipoRecinto;
            const esHumanoQuienTiroDado = (jugadorHumano.id === jugadorActualParaTirarDado.id);
            
            if (jugadorActualParaTirarDado.resultadoDadoActual && ESTADO_JUEGO.especieDinoSeleccionada) {
                const esPermitidoPorDado = esColocacionPermitidaPorDado(tipoRecinto, jugadorHumano, jugadorActualParaTirarDado.resultadoDadoActual, esHumanoQuienTiroDado);
                const esValidaReglaRecinto = validarReglasRecinto(tipoRecipo, ESTADO_JUEGO.especieDinoSeleccionada, jugadorHumano);
                
                if (!esPermitidoPorDado || !esValidaReglaRecinto) {
                    animarSacudirRecinto(recintoObjetivo);
                }
            } else {
                console.log('manejarSoltar: Faltan el resultado del dado o el dino seleccionado para el feedback detallado de error.');
            }
        }
    }
}

// Actualiza los textos de las explicaciones de puntuación de cada recinto.
function actualizarExplicacionesPuntuacionRecintos(jugador) {
    const parque = jugador.parque;
    const todosLosDinosEnParqueYRio = [];
    for (const clave in parque) {
        todosLosDinosEnParqueYRio.push(...parque[clave]);
    }
    todosLosDinosEnParqueYRio.push(...jugador.rio);


    // Función auxiliar para actualizar el texto de la explicación.
    function actualizarExplicacion(idRecinto, texto) {
        const elemento = document.getElementById(idRecinto);
        if (elemento) {
            const divExplicacion = elemento.querySelector('.explicacion-puntuacion-recinto');
            if (divExplicacion) {
                divExplicacion.textContent = texto;
            }
        }
    }

    // Río
    actualizarExplicacion('area-rio', `Puntos: ${jugador.rio.length} (1 punto por dino)`);

    // Bosque de la Semejanza (Forest of Sameness)
    const longitudBosque = parque.bosqueSemejanza.length;
    const especieBosque = (longitudBosque > 0) ? parque.bosqueSemejanza[0] : 'ninguna';
    const puntuacionBosque = (longitudBosque > 0 && parque.bosqueSemejanza.every(d => d === especieBosque)) ? (longitudBosque * (longitudBosque + 1)) / 2 : 0;
    const validacionBosque = (longitudBosque > 0 && !parque.bosqueSemejanza.every(d => d === especieBosque)) ? `(Advertencia: No todas las especies son ${especieBosque})` : '';
    actualizarExplicacion('recinto-bosque-semejanza', `Especie: ${especieBosque}. Dinos: ${longitudBosque}/6. Puntos: ${puntuacionBosque} ${validacionBosque}`);

    // Prado de la Diferencia (Meadow of Difference)
    const cantidadEspeciesPrado = new Set(parque.pradoDiferencia);
    const puntuacionPrado = cantidadEspeciesPrado.size * 2;
    const validacionPrado = (parque.pradoDiferencia.length > cantidadEspeciesPrado.size) ? `(Advertencia: especies repetidas)` : '';
    actualizarExplicacion('recinto-prado-diferencia', `Especies diferentes: ${cantidadEspeciesPrado.size}. Dinos: ${parque.pradoDiferencia.length}/6. Puntos: ${puntuacionPrado} ${validacionPrado}`);

    // Pradera del Amor (Pasture of Love)
    const paresPradera = Math.floor(parque.praderaAmor.length / 2);
    const puntuacionPradera = paresPradera * 5;
    actualizarExplicacion('recinto-pradera-amor', `Dinos: ${parque.praderaAmor.length}/6. Pares: ${paresPradera}. Puntos: ${puntuacionPradera}`);

    // El Trío Frondoso (Leafy Trio)
    const puntuacionTrio = (parque.trioFrondoso.length === 3) ? 7 : 0;
    actualizarExplicacion('recinto-trio-frondoso', `Dinos: ${parque.trioFrondoso.length}/3. Puntos: ${puntuacionTrio} ${parque.trioFrondoso.length > 3 ? '(¡Exceso de capacidad!)' : ''}`);

    // El Rey de la Selva (King of the Jungle)
    const puntuacionRey = (parque.reySelva.length === 1) ? 7 : 0;
    actualizarExplicacion('recinto-rey-selva', `Dinos: ${parque.reySelva.length}/1. Puntos: ${puntuacionRey} ${parque.reySelva.length > 1 ? '(¡Exceso de capacidad!)' : ''}`);

    // La Isla Solitaria (Lonely Island)
    let puntuacionIslaSolitaria = 0;
    let estadoIslaSolitaria = `Dinos: ${parque.islaSolitaria.length}/1. `;
    if (parque.islaSolitaria.length === 1) {
        const especieDinoSolitario = parque.islaSolitaria[0];
        const totalInstanciasDinoSolitario = todosLosDinosEnParqueYRio.filter(d => d === especieDinoSolitario).length;
        
        if (totalInstanciasDinoSolitario === 1) {
            puntuacionIslaSolitaria = 7;
            estadoIslaSolitaria += `Especie **${especieDinoSolitario}** es única en el parque.`;
        } else {
            estadoIslaSolitaria += `Especie **${especieDinoSolitario}** no es única (${totalInstanciasDinoSolitario - 1} más).`;
        }
    } else if (parque.islaSolitaria.length > 1) {
        estadoIslaSolitaria += '(¡Exceso de capacidad!)';
    }
    actualizarExplicacion('recinto-isla-solitaria', `${estadoIslaSolitaria} Puntos: ${puntuacionIslaSolitaria}`);
}

// Finaliza el juego y muestra los resultados.
function finalizarJuego() {
    mostrarMensaje('¡Se terminó el partido! Calculando puntuaciones finales...', 'info');
    let puntuacionesFinales = [];
    ESTADO_JUEGO.jugadores.forEach(jugador => {
        const puntuacion = calcularPuntuacion(jugador);
        puntuacionesFinales.push({ id: jugador.id, puntuacion: puntuacion });
    });

    puntuacionesFinales.sort((a, b) => b.puntuacion - a.puntuacion); // Ordenamos de mayor a menor puntuación

    let mensajeGanador = "Resultados Finales:<br>";
    puntuacionesFinales.forEach((p, indice) => {
        mensajeGanador += `Jugador ${p.id}: ${p.puntuacion} puntos${indice === 0 ? ' (¡Ganador!)' : ''}<br>`;
    });

    elementos.pantallaMensaje.innerHTML = mensajeGanador;
    elementos.pantallaMensaje.classList.add('exito');
    elementos.botonTirarDado.disabled = true; // Deshabilitamos los controles del juego
    elementos.botonReiniciarJuego.style.display = 'inline-block'; // Mostramos el botón de reiniciar

    // Ocultamos la mano del jugador humano si la partida terminó.
    elements.manoDinosaurios.innerHTML = '';
    elements.manoDinosaurios.textContent = 'Juego Terminado';
    habilitarSeleccionRecintos(false); // Nos aseguramos de que no se puedan seleccionar recintos
}

// --- Manejo de la vista de otros jugadores ---

// Configura los botones de navegación para ver los parques de otros jugadores.
function configurarNavegacionOtrosJugadores() {
    elements.navegacionOtrosJugadores.innerHTML = '';
    elements.areaMuestraParquesOtrosJugadores.innerHTML = '';

    // Solo si hay más de 1 jugador, mostramos esta sección.
    if (ESTADO_JUEGO.cantidadJugadores > 1) {
        elements.contenedorParquesOtrosJugadores.style.display = 'block';

        ESTADO_JUEGO.jugadores.forEach((jugador, indice) => {
            // No creamos botón para el jugador humano actual.
            if (jugador.id !== ESTADO_JUEGO.jugadores[0].id) {
                const boton = document.createElement('button');
                boton.textContent = `Ver Jugador ${jugador.id} (IA)`;
                boton.dataset.idJugador = jugador.id;
                boton.addEventListener('click', () => mostrarParqueOtroJugador(indice));
                elements.navegacionOtrosJugadores.appendChild(boton);

                // Creamos el contenedor HTML para el parque de cada jugador IA.
                const divParque = document.createElement('div');
                divParque.id = `parque-otro-jugador-${jugador.id}`;
                divParque.classList.add('muestra-parque-otro-jugador');
                
                // Nota: La estructura HTML de los recintos para otros jugadores es más simple,
                // ya que no necesitan las explicaciones de puntuación detalladas ni los h3 internos
                // que sí tiene el parque del jugador humano.
                divParque.innerHTML = `
                    <h3>Parque de Jugador ${jugador.id}</h3>
                    <p>Puntuación: <span id="puntuacion-otro-jugador-${jugador.id}">0</span></p>
                    <div class="disposicion-parque">
                        <div class="lado-parque lado-izquierdo">
                            <div class="titulo-zona">Zona de Cafetería</div>
                            <div id="parque-otro-jugador-${jugador.id}-recinto-bosque-semejanza" class="recinto" data-tipo-recinto="bosqueSemejanza">
                                <div class="contenedor-grilla-recinto"></div>
                                <div class="explicacion-puntuacion-recinto"></div>
                            </div>
                            <div id="parque-otro-jugador-${jugador.id}-recinto-trio-frondoso" class="recinto" data-tipo-recinto="trioFrondoso">
                                <div class="contenedor-flex-recinto"></div>
                                <div class="explicacion-puntuacion-recinto"></div>
                            </div>
                            <div id="parque-otro-jugador-${jugador.id}-recinto-pradera-amor" class="recinto" data-tipo-recinto="praderaAmor">
                                <div class="contenedor-grilla-recinto"></div>
                                <div class="explicacion-puntuacion-recinto"></div>
                            </div>
                        </div>

                        <div class="lado-parque contenedor-rio">
                            <div id="parque-otro-jugador-${jugador.id}-area-rio" class="area-rio" data-tipo-recinto="rio"></div>
                            <div class="explicacion-puntuacion-recinto"></div>
                        </div>

                        <div class="lado-parque lado-derecho">
                            <div class="titulo-zona">Zona de Baños</div>
                            <div id="parque-otro-jugador-${jugador.id}-recinto-rey-selva" class="recinto" data-tipo-recinto="reySelva">
                                <div class="contenedor-flex-recinto"></div>
                                <div class="explicacion-puntuacion-recinto"></div>
                            </div>
                            <div id="parque-otro-jugador-${jugador.id}-recinto-prado-diferencia" class="recinto" data-tipo-recinto="pradoDiferencia">
                                <div class="contenedor-grilla-recinto"></div>
                                <div class="explicacion-puntuacion-recinto"></div>
                            </div>
                            <div id="parque-otro-jugador-${jugador.id}-recinto-isla-solitaria" class="recinto" data-tipo-recinto="islaSolitaria">
                                <div class="contenedor-flex-recinto"></div>
                                <div class="explicacion-puntuacion-recinto"></div>
                            </div>
                        </div>
                    </div>
                `;
                elements.areaMuestraParquesOtrosJugadores.appendChild(divParque);
            }
        });

        // Mostramos el primer parque de IA por defecto si existe.
        let primerIAIndice = -1;
        for (let i = 0; i < ESTADO_JUEGO.jugadores.length; i++) {
            if (ESTADO_JUEGO.jugadores[i].esIA) {
                primerIAIndice = i;
                break;
            }
        }
        if (primerIAIndice !== -1) {
             mostrarParqueOtroJugador(primerIAIndice);
        } else {
            // Si no hay IAs (solo 1 jugador), ocultamos el contenedor.
            elements.contenedorParquesOtrosJugadores.style.display = 'none';
        }
    } else {
        elements.contenedorParquesOtrosJugadores.style.display = 'none'; // Ocultar si solo hay un jugador
    }
}

// Muestra el parque de un jugador IA específico.
function mostrarParqueOtroJugador(indiceJugador) {
    ESTADO_JUEGO.indiceVistaOtroJugadorActual = indiceJugador;

    // Ocultamos todos los parques de otros jugadores.
    document.querySelectorAll('.muestra-parque-otro-jugador').forEach(divParque => {
        divParque.classList.remove('activo');
    });
    // Removemos la clase 'activo' de todos los botones de navegación.
    document.querySelectorAll('.navegacion-jugadores button').forEach(btn => {
        btn.classList.remove('activo');
    });

    // Mostramos el parque seleccionado y activamos su botón.
    const jugadorSeleccionado = ESTADO_JUEGO.jugadores[indiceJugador];
    const parqueAMostrar = document.getElementById(`parque-otro-jugador-${jugadorSeleccionado.id}`);
    if (parqueAMostrar) {
        parqueAMostrar.classList.add('activo');
    }
    const botonActivo = elements.navegacionOtrosJugadores.querySelector(`button[data-id-jugador="${jugadorSeleccionado.id}"]`);
    if (botonActivo) {
        botonActivo.classList.add('activo');
    }
    actualizarParquesOtrosJugadoresUI(); // Aseguramos que el parque se renderice con los datos actuales.
}

// Actualiza la interfaz de los parques de otros jugadores.
function actualizarParquesOtrosJugadoresUI() {
    if (ESTADO_JUEGO.cantidadJugadores <= 1) return;

    ESTADO_JUEGO.jugadores.forEach((jugador, indice) => {
        if (jugador.id !== ESTADO_JUEGO.jugadores[0].id) { // Solo para IAs
            const idContenedorParque = `parque-otro-jugador-${jugador.id}`;
            const contenedorParque = document.getElementById(idContenedorParque);
            if (contenedorParque) {
                // Renderizamos el parque sin las explicaciones de puntuación detalladas.
                renderizarParque(jugador, contenedorParque, false);
                const pantallaPuntuacion = contenedorParque.querySelector(`#puntuacion-otro-jugador-${jugador.id}`);
                if (pantallaPuntuacion) {
                    pantallaPuntuacion.textContent = calcularPuntuacion(jugador);
                }
            }
        }
    });
}


// --- Ayudantes de String ---

// Convierte un string de kebab-case (ej. "mi-variable") a camelCase (ej. "miVariable").
function kebabCaseACamelCase(kebabCaseString) {
    return kebabCaseString.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

// Convierte un string de camelCase (ej. "miVariable") a kebab-case (ej. "mi-variable").
function camelCaseAKebabCase(camelCaseString) {
    return camelCaseString.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

// --- Event Listeners Globales ---

// El botón para tirar el dado.
elementos.botonTirarDado.addEventListener('click', tirarDado);

// --- Inicio del Juego ---

// Cuando todo el contenido HTML se cargó, mostramos el modal de configuración.
document.addEventListener('DOMContentLoaded', mostrarModalConfiguracion);