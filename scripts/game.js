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
    
    // ==============================
    // DRAG & DROP PERSONALIZADO LIMPIO
    // ==============================
    (function initDragDrop(){
        const fichas = Array.from(document.querySelectorAll('.selector-fichas .ficha-dinosaurio'));
        if (!fichas.length) return;
        const slotSelector = [
            '.igualesFicha1','.igualesFicha2','.igualesFicha3','.igualesFicha4','.igualesFicha5','.igualesFicha6',
            '.fichaRey',
            '.trioFicha1','.trioFicha2','.trioFicha3',
            '.diferentesFicha1','.diferentesFicha2','.diferentesFicha3','.diferentesFicha4','.diferentesFicha5','.diferentesFicha6',
            '.parejaFicha1','.parejaFicha2','.parejaFicha3','.parejaFicha4','.parejaFicha5','.parejaFicha6',
            '.rioFicha1','.rioFicha2','.rioFicha3','.rioFicha4','.rioFicha5','.rioFicha6',
            '.solitarioFicha'
        ].join(',');
        const slots = Array.from(document.querySelectorAll(slotSelector));
        if (!slots.length) return;

        // Asegurar posicionamiento relativo
        slots.forEach(s => { if (getComputedStyle(s).position === 'static') s.style.position = 'relative'; });

        let original = null; // ficha en selector
        let ghost = null;    // clon que sigue el cursor
        let offsetX = 0, offsetY = 0;
        let slotActivo = null;
        let moviendo = false;

        const mapaImagenes = {
            'ficha-dinosaurio1': "url('assets/fichas/arribaVerde.PNG')",
            'ficha-dinosaurio2': "url('assets/fichas/arribaRojo.PNG')",
            'ficha-dinosaurio3': "url('assets/fichas/arribaAmarillo.PNG')",
            'ficha-dinosaurio4': "url('assets/fichas/arribaCeleste.PNG')",
            'ficha-dinosaurio5': "url('assets/fichas/arribaRosa.PNG')",
            'ficha-dinosaurio6': "url('assets/fichas/arribaNaranja.PNG')"
        };

        function pointerDown(e){
            if (!(e.target instanceof HTMLElement)) return;
            const f = e.target.closest('.ficha-dinosaurio');
            if (!f || f.dataset.colocada === 'true') return;
            original = f;
            const r = f.getBoundingClientRect();
            offsetX = e.clientX - r.left;
            offsetY = e.clientY - r.top;
            // ocultar original
            original.style.visibility = 'hidden';
            // crear ghost
            ghost = f.cloneNode(true);
            ghost.style.visibility = 'visible';
            Object.assign(ghost.style, {
                position: 'fixed',
                left: (e.clientX - offsetX) + 'px',
                top: (e.clientY - offsetY) + 'px',
                width: r.width + 'px',
                height: r.height + 'px',
                pointerEvents: 'none',
                zIndex: 10000,
                transform: 'scale(1.05)'
            });
            document.body.appendChild(ghost);
            moviendo = true;
            document.addEventListener('pointermove', pointerMove);
            document.addEventListener('pointerup', pointerUp, { once: true });
            e.preventDefault();
        }

        function pointerMove(e){
            if (!moviendo || !ghost) return;
            ghost.style.left = (e.clientX - offsetX) + 'px';
            ghost.style.top = (e.clientY - offsetY) + 'px';
            slotActivo = null;
            for (const s of slots){
                if (s.dataset.occupied === 'true') { s.classList.remove('drop-highlight'); continue; }
                const r = s.getBoundingClientRect();
                if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom){
                    slotActivo = s;
                    s.classList.add('drop-highlight');
                } else {
                    s.classList.remove('drop-highlight');
                }
            }
        }

        function pointerUp(){
            document.removeEventListener('pointermove', pointerMove);
            moviendo = false;
            slots.forEach(s => s.classList.remove('drop-highlight'));
            if (slotActivo && original){
                const nueva = original.cloneNode(true);
                nueva.style.visibility = 'visible';
                nueva.dataset.colocada = 'true';
                // ocupar todo el slot
                Object.assign(nueva.style, {
                    position: 'absolute',
                    inset: '0',
                    width: '100%',
                    height: '100%',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: 'contain'
                });
                // aplicar imagen tablero según clase específica 1..6
                const claseEspecifica = Array.from(original.classList).find(c => /^ficha-dinosaurio[1-6]$/.test(c));
                if (claseEspecifica && mapaImagenes[claseEspecifica]) {
                    nueva.style.backgroundImage = mapaImagenes[claseEspecifica];
                }
                // limpiar contenido previo del slot
                while (slotActivo.firstChild) slotActivo.removeChild(slotActivo.firstChild);
                slotActivo.appendChild(nueva);
                slotActivo.dataset.occupied = 'true';
                original.remove();
            } else if (original) {
                // restaurar
                original.style.visibility = 'visible';
            }
            if (ghost) ghost.remove();
            ghost = null;
            original = null;
            slotActivo = null;
        }

        // Listeners solo en el selector para iniciar arrastre
        const selector = document.querySelector('.selector-fichas');
        if (selector) selector.addEventListener('pointerdown', pointerDown);
    })();
});