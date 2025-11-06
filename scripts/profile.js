// Sistema simple de perfiles de usuario
// Guarda y obtiene información del usuario logueado

// Funciones básicas para el perfil del usuario
const UserProfile = {
    // Guardar datos del usuario cuando hace login
    saveUser: function(username) {
        if (username && username.trim() !== '') {
            localStorage.setItem('loggedUser', username.trim());
            console.log('Usuario guardado exitosamente:', username.trim());
        } else {
            console.error('Nombre de usuario inválido:', username);
        }
    },

    // Obtener el nombre del usuario logueado
    getUser: function() {
        try {
            const user = localStorage.getItem('loggedUser');
            console.log('📤 getUser() - Usuario obtenido:', user);
            return user;
        } catch (e) {
            console.error('❌ Error al obtener usuario del localStorage:', e);
            return null;
        }
    },

    // Verificar si hay un usuario logueado
    isLoggedIn: function() {
        const user = this.getUser();
        return user !== null && user !== '';
    },

    // Cerrar sesión (eliminar datos)
    logout: function() {
        localStorage.removeItem('loggedUser');
        console.log('Sesión cerrada');
    },

    // Mostrar el nombre del usuario en un elemento HTML
    displayUserName: function(elementId) {
        const username = this.getUser();
        const element = document.getElementById(elementId);
        
        console.log('displayUserName - Buscando elemento:', elementId);
        console.log('displayUserName - Usuario en localStorage:', username);
        console.log('displayUserName - Elemento encontrado:', element);
        
        if (element) {
            if (username && username.trim() !== '') {
                element.textContent = username.trim();
                console.log('✅ Usuario mostrado exitosamente:', username.trim());
            } else {
                element.textContent = 'Invitado';
                console.log('⚠️ No hay usuario logueado, mostrando Invitado');
            }
        } else {
            console.error('❌ Elemento no encontrado con ID:', elementId);
        }
    },

    // Verificar si el usuario es ADMIN
    isAdmin: function() {
        const username = this.getUser();
        return username && username.toUpperCase() === 'ADMIN';
    }
};

// Hacer disponible globalmente
window.UserProfile = UserProfile;

// Log para confirmar que el script se cargó
console.log('🔵 profile.js cargado exitosamente');
console.log('🔵 UserProfile disponible:', typeof UserProfile);