// Función para mostrar mensajes en el DOM
function showMessage(elementId, message, type) {
    // Obtiene el elemento del DOM por su id
    const messageElement = document.getElementById(elementId);
    // Asigna el texto del mensaje al elemento
    messageElement.textContent = message;
    // Cambia la clase del elemento para mostrar el tipo de mensaje (success/error)
    messageElement.className = 'message ' + type;
}

// Función para limpiar mensajes
function clearMessages() {
    // Limpia el mensaje de login
    document.getElementById('loginMessage').textContent = '';
    document.getElementById('loginMessage').className = 'message';
    // Limpia el mensaje de registro
    document.getElementById('registerMessage').textContent = '';
    document.getElementById('registerMessage').className = 'message';
}

// Evento para el formulario de login
document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita el envío por defecto del formulario

    // Obtiene el valor del usuario
    const username = document.getElementById('username').value;
    // Obtiene el valor de la contraseña
    const password = document.getElementById('password').value;
    // Obtiene el botón de login
    const loginButton = document.getElementById('loginButton');

    clearMessages(); // Limpia mensajes previos
    loginButton.disabled = true; // Deshabilita el botón

    try {
        // Realiza la petición POST al backend para login
    const res = await fetch('php/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        // Convierte la respuesta en JSON
        const data = await res.json();

        if (res.ok && data.message) { // Si la respuesta HTTP es 2xx (éxito) y hay mensaje
            showMessage('loginMessage', data.message, 'success'); // Muestra mensaje de éxito
            setTimeout(() => {
                if (username.toUpperCase() === 'ADMIN') { // Si es admin entonces..
                    window.location.href = 'menu-admin.html'; // Redirige a menú de admin
                } else {
                    window.location.href = 'menu.html'; // Redirige a menú normal
                }
            }, 1000); // Espera 1 segundo antes de redirigir
        } else if (data.error) {
            showMessage('loginMessage', data.error, 'error'); // Muestra mensaje de error en rojo
        } else {
            showMessage('loginMessage', 'Usuario y contraseña no coinciden.', 'error'); // Mensaje genérico de error
        }
    } catch (error) {
        // Si hay error de red o servidor
        console.error('Error de red o del servidor:', error);
        showMessage('loginMessage', 'No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.', 'error');
    } finally {
        loginButton.disabled = false; // Vuelve a habilitar el botón
    }
});



// Evento para el formulario de registro
document.getElementById('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita el envío por defecto del formulario

    // Obtiene el valor del usuario
    const username = document.getElementById('newUsername').value;
    // Obtiene el valor de la contraseña
    const password = document.getElementById('newPassword').value;
    // Obtiene el valor de la confirmación de contraseña
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    // Obtiene el botón de registro
    const registerButton = document.getElementById('registerButton');

    clearMessages(); // Limpia mensajes anteriores

    // Verifica si las contraseñas coinciden
    if (password !== confirmPassword) {
        showMessage('registerMessage', 'Las contraseñas no coinciden.', 'error'); // Muestra error si no coinciden
        return; // Detiene la función si las contraseñas no coinciden
    }

    registerButton.disabled = true; // Deshabilita el botón

    try { // Inicia un bloque try para manejar posibles errores durante el registro
        // Realiza la petición POST al backend para registro
        const res = await fetch('php/register.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        // Convierte la respuesta en JSON
        const data = await res.json(); // Espera y obtiene la respuesta del servidor en formato JSON

        if (res.ok) { // Si la respuesta HTTP indica éxito
            showMessage('registerMessage', data.message, 'success'); // Muestra un mensaje de éxito en el registro
            setTimeout(() => { // Espera 1.5 segundos antes de ejecutar el siguiente bloque
                toggleRegister(); // Cambia al formulario de login tras el registro exitoso
                document.getElementById('newUsername').value = ''; // Limpia el campo de usuario
                document.getElementById('newPassword').value = ''; // Limpia el campo de contraseña
                document.getElementById('confirmNewPassword').value = ''; // Limpia el campo de confirmación de contraseña
            }, 1500); // Retardo de 1.5 segundos
        } else { // Si la respuesta HTTP indica error
            showMessage('registerMessage', data.error || 'Error desconocido al registrarse', 'error'); // Muestra mensaje de error
        }
    } catch (error) { // Si ocurre un error de red o servidor
        // Si hay error de red o servidor
        console.error('Error de red o del servidor:', error); // Muestra el error en la consola
        showMessage('registerMessage', 'No se pudo conectar con el servidor. Intentalo de nuevo más tarde.', 'error'); // Muestra mensaje de error al usuario
    } finally { // Este bloque se ejecuta siempre, haya o no error
        registerButton.disabled = false; // Vuelve a habilitar el botón de registro
    }
});



// Función para alternar entre formularios de login y registro
function toggleRegister() {
    // Obtiene el contenedor de login
    const loginBox = document.getElementById('login-container');
    // Obtiene el contenedor de registro
    const registerBox = document.getElementById('register-container');
    
    // Cambia la visibilidad de los formularios
    loginBox.style.display = loginBox.style.display === 'none' ? 'block' : 'none';
    registerBox.style.display = registerBox.style.display === 'none' ? 'block' : 'none';
    
    clearMessages(); // Limpia los mensajes al cambiar de formulario

}

