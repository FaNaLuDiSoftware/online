document.addEventListener('DOMContentLoaded', () => {
    const dinosaurs = document.querySelectorAll('.dinosaur');
    const leftPan = document.getElementById('left-pan');
    const rightPan = document.getElementById('right-pan');
    const resetButton = document.getElementById('reset-button');
    const resultMessage = document.getElementById('result-message');
    const balanceBar = document.querySelector('.balance-bar'); 
    
    // Elementos del Modal
    const calculateButton = document.getElementById('calculate-button'); // Nuevo botón
    const modal = document.getElementById('calculation-modal');
    const closeModalButton = document.querySelector('.close-button');
    const leftWeightDisplay = document.getElementById('left-weight-display');
    const rightWeightDisplay = document.getElementById('right-weight-display');

    let leftWeight = 0;
    let rightWeight = 0;

    dinosaurs.forEach(dinosaur => {
        // ... [Lógica dragstart y dragend existente] ...
        dinosaur.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('dinosaurWeight', dinosaur.dataset.weight);
            e.dataTransfer.setData('dinosaurName', dinosaur.dataset.name);
            e.dataTransfer.setData('dinosaurImageSrc', dinosaur.querySelector('img').src); 
            e.target.closest('.dinosaur').classList.add('dragging');
        });

        dinosaur.addEventListener('dragend', (e) => {
            e.target.closest('.dinosaur').classList.remove('dragging');
        });
        
        // ... [Lógica touchstart, touchmove y touchend existente] ...
        dinosaur.addEventListener('touchstart', (e) => {
            // evitar que el navegador haga scroll al iniciar el arrastre
            e.preventDefault();
            const touch = e.changedTouches[0];
            // crear un clon visual que siga el dedo
            const clone = dinosaur.cloneNode(true);
            clone.classList.add('touch-clone');
            clone.style.position = 'fixed';
            clone.style.left = (touch.clientX - 40) + 'px';
            clone.style.top = (touch.clientY - 40) + 'px';
            clone.style.pointerEvents = 'none';
            clone.dataset.touchDragging = 'true';
            document.body.appendChild(clone);
            dinosaur._touchClone = clone;
        });

        dinosaur.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            const clone = dinosaur._touchClone;
            if (clone) {
                clone.style.left = (touch.clientX - 40) + 'px';
                clone.style.top = (touch.clientY - 40) + 'px';
            }
        });

        dinosaur.addEventListener('touchend', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            const clone = dinosaur._touchClone;
            if (clone) {
                const elementAtPoint = document.elementFromPoint(touch.clientX, touch.clientY);
                // buscar el pan más cercano (left-pan o right-pan)
                const pan = elementAtPoint ? elementAtPoint.closest('.balance-pan') : null;
                if (pan && !pan.dataset.dinosaur) {
                    const weight = parseInt(dinosaur.dataset.weight);
                    const name = dinosaur.dataset.name;
                    const imageSrc = dinosaur.querySelector('img').src;

                    const droppedDinosaur = document.createElement('div');
                    droppedDinosaur.classList.add('dropped-dinosaur');
                    droppedDinosaur.innerHTML = `\n                        <img src="${imageSrc}" alt="${name}">\n                        <p>${name}</p>\n                    `;
                    pan.innerHTML = '';
                    pan.appendChild(droppedDinosaur);
                    pan.dataset.dinosaur = name;

                    if (pan.id === 'left-pan') {
                        leftWeight += weight;
                    } else {
                        rightWeight += weight;
                    }

                    updateBalance();
                }

                // limpiar clon
                clone.remove();
                delete dinosaur._touchClone;
            }
        });
    });
    
    const balancePans = [leftPan, rightPan];
    balancePans.forEach(pan => {
        pan.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        pan.addEventListener('drop', (e) => {
            e.preventDefault();
            
            if (pan.dataset.dinosaur) {
                return;
            }

            const weight = parseInt(e.dataTransfer.getData('dinosaurWeight'));
            const name = e.dataTransfer.getData('dinosaurName');
            const imageSrc = e.dataTransfer.getData('dinosaurImageSrc');

            const droppedDinosaur = document.createElement('div');
            droppedDinosaur.classList.add('dropped-dinosaur');
            droppedDinosaur.innerHTML = `
                <img src="${imageSrc}" alt="${name}">
                <p>${name}</p>
            `;
            
            pan.innerHTML = '';
            pan.appendChild(droppedDinosaur);
            pan.dataset.dinosaur = name;

            if (pan.id === 'left-pan') {
                leftWeight += weight;
            } else {
                rightWeight += weight;
            }

            updateBalance();
        });
    });

    function updateBalance() {
        leftPan.classList.remove('heavy', 'light', 'balanced');
        rightPan.classList.remove('heavy', 'light', 'balanced');
        
        // Eliminar clases de inclinación de la barra
        balanceBar.classList.remove('tilt-left', 'tilt-right', 'no-tilt');
        
        resultMessage.innerHTML = '';

        if (leftWeight > rightWeight) {
            leftPan.classList.add('heavy');
            rightPan.classList.add('light');
            balanceBar.classList.add('tilt-left'); 
        } else if (rightWeight > leftWeight) {
            rightPan.classList.add('heavy');
            leftPan.classList.add('light');
            balanceBar.classList.add('tilt-right'); 
        } else {
            leftPan.classList.add('balanced');
            rightPan.classList.add('balanced');
            balanceBar.classList.add('no-tilt'); 
        }

        if (leftPan.dataset.dinosaur && rightPan.dataset.dinosaur) {
            if (leftWeight > rightWeight) {
                resultMessage.innerHTML = 'El lado izquierdo es más pesado.';
            } else if (rightWeight > leftWeight) {
                resultMessage.innerHTML = 'El lado derecho es más pesado.';
            } else {
                resultMessage.innerHTML = '¡Ambos lados están equilibrados!';
            }
        }
    }

    resetButton.addEventListener('click', () => {
        leftWeight = 0;
        rightWeight = 0;
        
        leftPan.innerHTML = '<p>Arrastra aquí</p>';
        rightPan.innerHTML = '<p>Arrastra aquí</p>';
        delete leftPan.dataset.dinosaur;
        delete rightPan.dataset.dinosaur;
        resultMessage.innerHTML = '';

        // Restablecer la barra a su posición original
        balanceBar.classList.remove('tilt-left', 'tilt-right');
        balanceBar.classList.add('no-tilt'); 

        updateBalance(); 
    });
    
    // Lógica para el Modal de Cálculo
    calculateButton.addEventListener('click', () => {
        // Actualiza el contenido del modal con los pesos actuales
        leftWeightDisplay.textContent = leftWeight.toLocaleString('es-ES');
        rightWeightDisplay.textContent = rightWeight.toLocaleString('es-ES');
        
        modal.style.display = 'block';
    });

    closeModalButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Cierra el modal si el usuario hace clic fuera de él
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

});