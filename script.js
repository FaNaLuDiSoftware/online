
    // Función de inicio de sesión
    function login() {
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      if (username === '' || password === '') {
        alert('Por favor, completa todos los campos.');
        return;
      }

      // Recuperación de credenciales almacenadas en localStorage
      const storedUser = localStorage.getItem('user');
      const storedPass = localStorage.getItem('pass');

      if (username === storedUser && password === storedPass) {
        alert(`¡Bienvenido ${username}! Redirigiendo al juego...`);
        // Aquí se podría redirigir a la pantalla principal del juego
        // window.location.href = '/juego.html';
      } else {
        alert('Credenciales incorrectas. Inténtalo de nuevo.');
      }
    }

    // Función de registro
    function register() {
      const newUsername = document.getElementById('newUsername').value;
      const newPassword = document.getElementById('newPassword').value;

      if (newUsername === '' || newPassword === '') {
        alert('Por favor, completa todos los campos para registrarte.');
        return;
      }

      // Guardado en localStorage (esto almacena los datos solo en el navegador del usuario)
      localStorage.setItem('user', newUsername);
      localStorage.setItem('pass', newPassword);
      alert('Registro exitoso. Ahora puedes iniciar sesión.');

      toggleRegister(); // Volver al login después del registro
    }

    // Cambiar entre login y registro
    function toggleRegister() {
      const loginBox = document.getElementById('login-container');
      const registerBox = document.getElementById('register-container');
      const isLoginVisible = loginBox.style.display !== 'none';

      loginBox.style.display = isLoginVisible ? 'none' : 'block';
      registerBox.style.display = isLoginVisible ? 'block' : 'none';
    }
