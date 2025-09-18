document.addEventListener('DOMContentLoaded', () => {
    const dinosaurs = document.querySelectorAll('.dinosaur');
    const leftPan = document.getElementById('left-pan');
    const rightPan = document.getElementById('right-pan');
    const resetButton = document.getElementById('reset-button');
    const resultMessage = document.getElementById('result-message');
    const balanceBar = document.querySelector('.balance-bar'); // Selecciona la barra de la balanza

    let leftWeight = 0;
    let rightWeight = 0;

    // Mapping for local image paths (assuming your HTML uses these paths directly now)
    // Removed dinosaurImageMap as it's not strictly necessary if img src is directly in HTML
    // However, if you prefer to manage paths in JS, keep it and modify the droppedDinosaur creation

    // Add drag event listeners to each dinosaur
    dinosaurs.forEach(dinosaur => {
        dinosaur.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('dinosaurWeight', dinosaur.dataset.weight);
            e.dataTransfer.setData('dinosaurName', dinosaur.dataset.name);
            // Pass the image source directly
            e.dataTransfer.setData('dinosaurImageSrc', dinosaur.querySelector('img').src); 
            e.target.closest('.dinosaur').classList.add('dragging');
        });

        dinosaur.addEventListener('dragend', (e) => {
            e.target.closest('.dinosaur').classList.remove('dragging');
        });
    });

    // Add drag-and-drop event listeners to the balance pans
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
            const imageSrc = e.dataTransfer.getData('dinosaurImageSrc'); // Get image src

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

    // Function to update the visual state of the balance and show the result message
    function updateBalance() {
        leftPan.classList.remove('heavy', 'light', 'balanced');
        rightPan.classList.remove('heavy', 'light', 'balanced');
        
        // Eliminar clases de inclinación de la barra
        balanceBar.classList.remove('tilt-left', 'tilt-right', 'no-tilt');
        
        resultMessage.innerHTML = '';

        if (leftWeight > rightWeight) {
            leftPan.classList.add('heavy');
            rightPan.classList.add('light');
            balanceBar.classList.add('tilt-left'); // Inclinar la barra a la izquierda
        } else if (rightWeight > leftWeight) {
            rightPan.classList.add('heavy');
            leftPan.classList.add('light');
            balanceBar.classList.add('tilt-right'); // Inclinar la barra a la derecha
        } else {
            leftPan.classList.add('balanced');
            rightPan.classList.add('balanced');
            balanceBar.classList.add('no-tilt'); // No inclinar la barra (o volver al centro)
        }

        // Show the message only if both sides have a dinosaur
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

    // Reset button functionality
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

        updateBalance(); // Llamar para limpiar clases de los platos
    });
});