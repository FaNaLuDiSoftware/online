// Función para mostrar mensajes en el DOM
        function showMessage(elementId, message, type) {
            const messageElement = document.getElementById(elementId);
            messageElement.textContent = message;
            messageElement.className = 'message ' + type;
        }

        // Función para limpiar mensajes
        function clearMessages() {
            document.getElementById('loginMessage').textContent = '';
            document.getElementById('loginMessage').className = 'message';
            document.getElementById('registerMessage').textContent = '';
            document.getElementById('registerMessage').className = 'message';
        }

        document.getElementById('loginForm').addEventListener('submit', async (event) => {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const loginButton = document.getElementById('loginButton');

            clearMessages();
            loginButton.disabled = true; // Deshabilita el botón

            try {
                const res = await fetch('http://localhost:3000/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await res.json();

                if (res.ok) { // Si la respuesta HTTP es 2xx (éxito)
                    showMessage('loginMessage', data.message, 'success');
                } else {
                    showMessage('loginMessage', data.error || 'Error desconocido al iniciar sesión', 'error');
                }
            } catch (error) {
                console.error('Error de red o del servidor:', error);
                showMessage('loginMessage', 'No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.', 'error');
            } finally {
                loginButton.disabled = false; // Vuelve a habilitar el botón
            }
        });

        document.getElementById('registerForm').addEventListener('submit', async (event) => {
            event.preventDefault(); // Evita el envío por defecto del formulario

            const username = document.getElementById('newUsername').value;
            const password = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmNewPassword').value;
            const registerButton = document.getElementById('registerButton');

            clearMessages(); // Limpia mensajes anteriores

            if (password !== confirmPassword) {
                showMessage('registerMessage', 'Las contraseñas no coinciden.', 'error');
                return; // Detiene la función si las contraseñas no coinciden
            }

            registerButton.disabled = true; // Deshabilita el botón

            try {
                const res = await fetch('http://localhost:3000/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await res.json();

                if (res.ok) { // Si la respuesta HTTP es 2xx (éxito)
                    showMessage('registerMessage', data.message, 'success');
                    setTimeout(() => {
                        toggleRegister(); // Vuelve al formulario de login después de un registro exitoso
                        document.getElementById('newUsername').value = '';
                        document.getElementById('newPassword').value = '';
                        document.getElementById('confirmNewPassword').value = '';
                    }, 1500); // Retardo de 1.5 segundos
                } else {
                    showMessage('registerMessage', data.error || 'Error desconocido al registrarse', 'error');
                }
            } catch (error) {
                console.error('Error de red o del servidor:', error);
                showMessage('registerMessage', 'No se pudo conectar con el servidor. Intentalo de nuevo más tarde.', 'error');
            } finally {
                registerButton.disabled = false; // Vuelve a habilitar el botón
            }
        });

        // Función para alternar entre formularios
        function toggleRegister() {
            const loginBox = document.getElementById('login-container');
            const registerBox = document.getElementById('register-container');
            
            loginBox.style.display = loginBox.style.display === 'none' ? 'block' : 'none';
            registerBox.style.display = registerBox.style.display === 'none' ? 'block' : 'none';
            
            clearMessages(); // Limpia los mensajes al cambiar de formulario
        }

        // Script para actualizar el año en el footer
        document.getElementById('currentYear').textContent = new Date().getFullYear();