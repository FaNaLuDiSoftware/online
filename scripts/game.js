    // ###### SELECCIÓN DE TABLERO DE RIVALES ######
document.addEventListener('DOMContentLoaded', function() {
    const botonesRivales = document.querySelectorAll('.boton-rival');
    const tableroRivales = document.querySelector('.div-tablero-rivales');
    const tablerosBackground = {
        'rival1-boton': 'url(assets/tablero1.JPG)',
        'rival2-boton': 'url(assets/tablero2.JPG)', 
        'rival3-boton': 'url(assets/tablero3.JPG)',
        'rival4-boton': 'url(assets/tablero4.JPG)'
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
});