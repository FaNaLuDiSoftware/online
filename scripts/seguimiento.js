// ###### CALCULADORA DE PUNTUACIÓN ######
document.addEventListener('DOMContentLoaded', function() {
    
    // ###### SELECCIÓN DE JUGADORES ######
    const botonesJugadores = document.querySelectorAll('.boton-rival');
    const calculadoraContainer = document.querySelector('.div-calculadora');
    let jugadorActivo = 'rival1'; // Jugador por defecto
    
    // Datos de cada jugador (almacenar valores independientes)
    const datosJugadores = {
        rival1: {
            nombre: 'Vothka',
            iguales: 0,
            trio: false,
            parejas: 0,
            unico: false,
            rio: 0,
            diferentes: 0,
            rey: false,
            trex: 0
        },
        rival2: {
            nombre: 'Diego Zamora',
            iguales: 0,
            trio: false,
            parejas: 0,
            unico: false,
            rio: 0,
            diferentes: 0,
            rey: false,
            trex: 0
        },
        rival3: {
            nombre: 'Fabrizio Arriola',
            iguales: 0,
            trio: false,
            parejas: 0,
            unico: false,
            rio: 0,
            diferentes: 0,
            rey: false,
            trex: 0
        },
        rival4: {
            nombre: 'Lukateli',
            iguales: 0,
            trio: false,
            parejas: 0,
            unico: false,
            rio: 0,
            diferentes: 0,
            rey: false,
            trex: 0
        }
    };
    
    // Función para actualizar la calculadora con los datos del jugador
    function actualizarCalculadora(jugadorId) {
        const datos = datosJugadores[jugadorId];
        const titulo = document.querySelector('h2');
        
        // Actualizar título
        titulo.textContent = `Puntuación de ${datos.nombre}`;
        
        // Actualizar valores en la calculadora
        const valores = calculadoraContainer.querySelectorAll('.valor-parcela');
        const checkboxes = calculadoraContainer.querySelectorAll('.checkbox-parcela');
        
        // Actualizar valores numéricos
        if (valores[0]) valores[0].textContent = datos.iguales; // Iguales
        if (valores[1]) valores[1].textContent = datos.parejas; // Parejas  
        if (valores[2]) valores[2].textContent = datos.rio; // Rio
        if (valores[3]) valores[3].textContent = datos.diferentes; // Diferentes
        if (valores[4]) valores[4].textContent = datos.trex; // T-Rex
        
        // Actualizar checkboxes
        if (checkboxes[0]) checkboxes[0].checked = datos.trio; // Trío
        if (checkboxes[1]) checkboxes[1].checked = datos.unico; // Unico
        if (checkboxes[2]) checkboxes[2].checked = datos.rey; // Rey
    }
    
    // Función para guardar los datos actuales del jugador activo
    function guardarDatosJugador() {
        const datos = datosJugadores[jugadorActivo];
        const valores = calculadoraContainer.querySelectorAll('.valor-parcela');
        const checkboxes = calculadoraContainer.querySelectorAll('.checkbox-parcela');
        
        // Guardar valores numéricos
        if (valores[0]) datos.iguales = parseInt(valores[0].textContent) || 0;
        if (valores[1]) datos.parejas = parseInt(valores[1].textContent) || 0;
        if (valores[2]) datos.rio = parseInt(valores[2].textContent) || 0;
        if (valores[3]) datos.diferentes = parseInt(valores[3].textContent) || 0;
        if (valores[4]) datos.trex = parseInt(valores[4].textContent) || 0;
        
        // Guardar checkboxes
        if (checkboxes[0]) datos.trio = checkboxes[0].checked;
        if (checkboxes[1]) datos.unico = checkboxes[1].checked;
        if (checkboxes[2]) datos.rey = checkboxes[2].checked;
    }
    
    // Event listeners para botones de jugadores
    botonesJugadores.forEach(boton => {
        boton.addEventListener('click', function() {
            // Guardar datos del jugador actual antes de cambiar
            guardarDatosJugador();
            
            // Remover selección anterior
            botonesJugadores.forEach(otroBoton => {
                otroBoton.classList.remove('seleccionado');
            });
            
            // Seleccionar nuevo jugador
            this.classList.add('seleccionado');
            jugadorActivo = this.id.replace('-boton', '');
            
            // Actualizar calculadora con datos del nuevo jugador
            actualizarCalculadora(jugadorActivo);
            
            // Efecto visual en la calculadora
            calculadoraContainer.style.opacity = '0.7';
            setTimeout(() => {
                calculadoraContainer.style.opacity = '1';
            }, 200);
        });
    });
    
    // Seleccionar primer jugador por defecto
    const primerJugador = document.getElementById('rival1-boton');
    if (primerJugador) {
        primerJugador.classList.add('seleccionado');
        actualizarCalculadora('rival1');
    }
    
    // ###### FUNCIONALIDAD DE BOTONES +/- ######
    
    // Obtener todos los botones de incrementar y decrementar
    const botonesIncrementar = document.querySelectorAll('.btn-incrementar');
    const botonesDecrementar = document.querySelectorAll('.btn-decrementar');
    
    // Función para incrementar valor
    botonesIncrementar.forEach(boton => {
        boton.addEventListener('click', function() {
            // Buscar el span del valor en la misma fila
            const parcelaItem = this.closest('.parcela-item');
            const valorSpan = parcelaItem.querySelector('.valor-parcela');
            
            if (valorSpan) {
                let valorActual = parseInt(valorSpan.textContent) || 0;
                valorActual++;
                valorSpan.textContent = valorActual;
                
                // Guardar en los datos del jugador actual
                guardarDatosJugador();
                
                // Agregar efecto visual
                this.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 100);
            }
        });
    });
    
    // Función para decrementar valor
    botonesDecrementar.forEach(boton => {
        boton.addEventListener('click', function() {
            // Buscar el span del valor en la misma fila
            const parcelaItem = this.closest('.parcela-item');
            const valorSpan = parcelaItem.querySelector('.valor-parcela');
            
            if (valorSpan) {
                let valorActual = parseInt(valorSpan.textContent) || 0;
                // No permitir valores negativos
                if (valorActual > 0) {
                    valorActual--;
                    valorSpan.textContent = valorActual;
                    
                    // Agregar efecto visual
                    this.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 100);
                }
            }
        });
    });
    
    // Opcional: Agregar efecto visual cuando se actualiza el valor
    const valoresParcelas = document.querySelectorAll('.valor-parcela');
    
    // Función para resaltar cuando cambia el valor
    function resaltarValor(elemento) {
        elemento.style.backgroundColor = 'rgba(255, 255, 255, 1)';
        elemento.style.transform = 'scale(1.1)';
        setTimeout(() => {
            elemento.style.backgroundColor = '';
            elemento.style.transform = '';
        }, 200);
    }
    
    // Observer para detectar cambios en los valores
    valoresParcelas.forEach(valor => {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    resaltarValor(valor);
                }
            });
        });
        
        observer.observe(valor, {
            childList: true,
            subtree: true,
            characterData: true
        });
    });
    
    console.log('Calculadora de puntuación inicializada correctamente');
});