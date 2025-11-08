// ###### SELECCIÓN DE TABLERO DE RIVALES ######
document.addEventListener('DOMContentLoaded', function() {
    const botonesRivales = document.querySelectorAll('.boton-rival');
    const tableroRivales = document.querySelector('.div-tablero-rivales');
    const tablerosBackground = {
        'rival1-boton': 'url(assets/tablero1.jpg)',
        'rival2-boton': 'url(assets/tablero2.jpg)', 
        'rival3-boton': 'url(assets/tablero3.jpg)',
        'rival4-boton': 'url(assets/tablero4.jpg)'
    };
    
    // Seleccionar el primer rival por defecto al cargar la página
    const primerRival = document.getElementById('rival1-boton');
    if (primerRival) {
        primerRival.classList.add('seleccionado');
        // Establecer el tablero del primer rival por defecto
        if (tableroRivales) {
            tableroRivales.style.backgroundImage = tablerosBackground['rival1-boton'];
        }
    }
    
    botonesRivales.forEach(boton => {
        boton.addEventListener('click', function() {
            // Remover la clase 'seleccionado' de todos los botones
            botonesRivales.forEach(otroBoton => {
                otroBoton.classList.remove('seleccionado');
            });
            
            // Agregar la clase 'seleccionado' al botón clickeado
            this.classList.add('seleccionado');
            
            // Cambiar el background del tablero rival según el jugador seleccionado
            const backgroundImage = tablerosBackground[this.id];
            if (backgroundImage && tableroRivales) {
                tableroRivales.style.backgroundImage = backgroundImage;
            }
        });
    });

    // ###### SELECTOR DE FICHAS DE DINOSAURIOS ######
    const fichasDinosaurio = document.querySelectorAll('.ficha-dinosaurio');
    let fichaSeleccionada = null;
    
    fichasDinosaurio.forEach(ficha => {
        ficha.addEventListener('click', function() {
            // Si ya hay una ficha seleccionada, remover la clase
            if (fichaSeleccionada) {
                fichaSeleccionada.classList.remove('seleccionada');
            }
            
            // Si la ficha clickeada es la misma que estaba seleccionada, deseleccionar
            if (fichaSeleccionada === this) {
                fichaSeleccionada = null;
                return;
            }
            
            // Seleccionar la nueva ficha
            fichaSeleccionada = this;
            this.classList.add('seleccionada');
            
            // Agregar un pequeño delay para que la animación se vea mejor
            setTimeout(() => {
                if (this.classList.contains('seleccionada')) {
                    // Aquí se puede agregar lógica adicional para cuando una ficha es seleccionada
                    console.log('Ficha seleccionada:', this.className);
                }
            }, 100);
        });
        
        // Efecto de hover mejorado
        ficha.addEventListener('mouseenter', function() {
            if (!this.classList.contains('seleccionada')) {
                this.style.transform = 'translateY(-2px) scale(1.05)';
            }
        });
        
        ficha.addEventListener('mouseleave', function() {
            if (!this.classList.contains('seleccionada')) {
                this.style.transform = '';
            }
        });
    });



    // ###### BOTON MODAL DE AYUDA ######
    const botonAyuda = document.querySelector('.boton-ayuda');
    const modalAyuda = document.getElementById('modal-ayuda');
    const botonCerrar = document.getElementById('cerrar-modal');
    
    // Abrir modal
    botonAyuda.addEventListener('click', function() {
        modalAyuda.classList.add('visible');
    });
    
    // Cerrar modal con el botón X
    botonCerrar.addEventListener('click', function() {
        modalAyuda.classList.remove('visible');
    });
    
    // Cerrar modal haciendo clic fuera de él
    modalAyuda.addEventListener('click', function(e) {
        if (e.target === modalAyuda) {
            modalAyuda.classList.remove('visible');
        }
    });
    
    // Cerrar modal con la tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalAyuda.classList.contains('visible')) {
            modalAyuda.classList.remove('visible');
        }
    });
    
    // ============================================
    // DRAG & DROP (Estilo Balanza - NATIVO + TÁCTIL)
    // ============================================
    
    // --- 1. Selectores (de la lógica original de game.js) ---
    const fichas = document.querySelectorAll('.selector-fichas .ficha-dinosaurio');
    const slotSelector = [
        '.igualesFicha1','.igualesFicha2','.igualesFicha3','.igualesFicha4','.igualesFicha5','.igualesFicha6',
        '.fichaRey',
        '.trioFicha1','.trioFicha2','.trioFicha3',
        '.diferentesFicha1','.diferentesFicha2','.diferentesFicha3','.diferentesFicha4','.diferentesFicha5','.diferentesFicha6',
        '.parejaFicha1','.parejaFicha2','.parejaFicha3','.parejaFicha4','.parejaFicha5','.parejaFicha6',
        '.rioFicha1','.rioFicha2','.rioFicha3','.rioFicha4','.rioFicha5','.rioFicha6',
        '.solitarioFicha'
    ].join(',');
    const slots = document.querySelectorAll(slotSelector);

    // --- 2. Mapa de Imágenes (de la lógica original de game.js) ---
    const mapaImagenes = {
        'ficha-dinosaurio1': "url('assets/fichas/arribaVerde.PNG')",
        'ficha-dinosaurio2': "url('assets/fichas/arribaRojo.PNG')",
        'ficha-dinosaurio3': "url('assets/fichas/arribaAmarillo.PNG')",
        'ficha-dinosaurio4': "url('assets/fichas/arribaCeleste.PNG')",
        'ficha-dinosaurio5': "url('assets/fichas/arribaRosa.PNG')",
        'ficha-dinosaurio6': "url('assets/fichas/arribaNaranja.PNG')"
    };

    // --- 3. Lógica para FICHAS (Draggables) ---
    fichas.forEach(ficha => {
        // Habilitar D&D nativo
        ficha.draggable = true;

        // --- Lógica D&D Escritorio (de balance.js) ---
        ficha.addEventListener('dragstart', (e) => {
            // Encontrar la clase específica (ficha-dinosaurio1...6)
            const claseEspecifica = Array.from(ficha.classList).find(c => /^ficha-dinosaurio[1-6]$/.test(c));
            // Asegurar un ID para encontrar el original después
            if (!ficha.id) ficha.id = 'ficha-temp-' + Math.random().toString(36).substr(2, 9);
            
            e.dataTransfer.setData('claseFicha', claseEspecifica || '');
            e.dataTransfer.setData('originalId', ficha.id);
            e.dataTransfer.effectAllowed = 'move';
            
            // Ocultar el original (usar timeout para que el "ghost" se genere bien)
            setTimeout(() => {
                 ficha.style.visibility = 'hidden';
            }, 0);
            ficha.classList.add('dragging');
        });

        ficha.addEventListener('dragend', (e) => {
            // Si el drop no fue exitoso (se soltó fuera), el original sigue existiendo
            const original = document.getElementById(e.target.id);
            if (original) {
                 original.style.visibility = 'visible';
            }
            ficha.classList.remove('dragging');
        });
        
        // --- Lógica Táctil (de balance.js) ---
        ficha.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Evitar scroll
            const touch = e.changedTouches[0];
            const rect = ficha.getBoundingClientRect();

            // Crear clon visual que sigue el dedo
            const clone = ficha.cloneNode(true);
            clone.classList.add('touch-clone'); // Asigna una clase para estilado (ej. z-index)
            clone.style.position = 'fixed';
            clone.style.left = (touch.clientX - (rect.width / 2)) + 'px'; // Centrar clon en el dedo
            clone.style.top = (touch.clientY - (rect.height / 2)) + 'px';
            clone.style.width = rect.width + 'px';
            clone.style.height = rect.height + 'px';
            clone.style.pointerEvents = 'none'; // El clon no debe interceptar eventos
            clone.style.zIndex = 10000;
            clone.style.transform = 'scale(1.05)'; // Efecto visual
            document.body.appendChild(clone);
            
            ficha._touchClone = clone; // Guardar referencia al clon
            ficha.style.visibility = 'hidden'; // Ocultar original
        });

        ficha.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            const clone = ficha._touchClone;
            if (clone) {
                // Mover el clon
                const rect = clone.getBoundingClientRect();
                clone.style.left = (touch.clientX - (rect.width / 2)) + 'px';
                clone.style.top = (touch.clientY - (rect.height / 2)) + 'px';
                
                // Feedback visual: encontrar el elemento bajo el dedo
                const elementAtPoint = document.elementFromPoint(touch.clientX, touch.clientY);
                slots.forEach(s => {
                    const isOverSlot = (s === elementAtPoint || s.contains(elementAtPoint));
                    if (isOverSlot && !s.dataset.occupied) {
                        s.classList.add('drop-highlight');
                    } else {
                        s.classList.remove('drop-highlight');
                    }
                });
            }
        });

        ficha.addEventListener('touchend', (e) => {
            e.preventDefault();
            const clone = ficha._touchClone;
            if (!clone) return;

            const touch = e.changedTouches[0];
            const elementAtPoint = document.elementFromPoint(touch.clientX, touch.clientY);
            let slot = null;

            if (elementAtPoint) {
                // Encontrar el slot válido más cercano
                slot = Array.from(slots).find(s => s === elementAtPoint || s.contains(elementAtPoint));
            }
            
            // Limpiar todos los highlights
            slots.forEach(s => s.classList.remove('drop-highlight'));

            if (slot && !slot.dataset.occupied) {
                // --- Lógica de Drop (Adaptada de game.js) ---
                const claseEspecifica = Array.from(ficha.classList).find(c => /^ficha-dinosaurio[1-6]$/.test(c));

                const nueva = ficha.cloneNode(true); // Clonar el original (que está oculto)
                nueva.style.visibility = 'visible'; // Hacerlo visible
                nueva.dataset.colocada = 'true';
                Object.assign(nueva.style, {
                    position: 'absolute', inset: '0', width: '100%', height: '100%',
                    backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundSize: 'contain',
                    transform: 'none' // Quitar cualquier transformación
                });

                if (claseEspecifica && mapaImagenes[claseEspecifica]) {
                    nueva.style.backgroundImage = mapaImagenes[claseEspecifica];
                }

                while (slot.firstChild) slot.removeChild(slot.firstChild); // Limpiar slot
                slot.appendChild(nueva);
                slot.dataset.occupied = 'true';

                // Eliminar el original del selector
                ficha.remove(); 
                // --- Fin Lógica de Drop ---
            } else {
                // No se soltó en un slot válido, restaurar el original
                 ficha.style.visibility = 'visible';
            }

            // Limpiar el clon visual
            clone.remove();
            delete ficha._touchClone;
        });
    });

    // --- 4. Lógica para SLOTS (Drop Zones) ---
    slots.forEach(slot => {
        // Asegurar posicionamiento (de la lógica original de game.js)
        if (getComputedStyle(slot).position === 'static') slot.style.position = 'relative';

        // --- Lógica D&D Escritorio (de balance.js) ---
        slot.addEventListener('dragover', (e) => {
            e.preventDefault(); // Necesario para permitir el drop
            e.dataTransfer.dropEffect = 'move';
            if (!slot.dataset.occupied) {
                slot.classList.add('drop-highlight'); // Feedback visual
            }
        });
        
        slot.addEventListener('dragleave', (e) => {
             slot.classList.remove('drop-highlight'); // Limpiar feedback
        });

        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            slot.classList.remove('drop-highlight');
            
            if (slot.dataset.occupied) {
                return; // El slot ya está ocupado
            }

            // Obtener datos del drag
            const claseEspecifica = e.dataTransfer.getData('claseFicha');
            const originalId = e.dataTransfer.getData('originalId');
            const original = document.getElementById(originalId);

            if (!original) return; // No se encontró el original

            // --- Lógica de Drop (Adaptada de game.js) ---
            const nueva = original.cloneNode(true);
            nueva.style.visibility = 'visible'; // El original estaba oculto
            nueva.classList.remove('dragging');
            nueva.dataset.colocada = 'true';
            Object.assign(nueva.style, {
                position: 'absolute', inset: '0', width: '100%', height: '100%',
                backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundSize: 'contain',
                transform: 'none'
            });
            
            if (claseEspecifica && mapaImagenes[claseEspecifica]) {
                nueva.style.backgroundImage = mapaImagenes[claseEspecifica];
            }
            
            while (slot.firstChild) slot.removeChild(slot.firstChild); // Limpiar slot
            slot.appendChild(nueva);
            slot.dataset.occupied = 'true';

            // Eliminar el original del selector
            original.remove(); 
            // --- Fin Lógica de Drop ---
        });
    });

});