// Navbar authentication state manager
document.addEventListener('DOMContentLoaded', function() {
    const authButton = document.getElementById('authButton');

    // Verificar múltiples posibles nombres de keys
    const token = localStorage.getItem('token') ||
                  localStorage.getItem('authToken') ||
                  localStorage.getItem('jwt') ||
                  localStorage.getItem('accessToken') ||
                  sessionStorage.getItem('token') ||
                  sessionStorage.getItem('authToken');

    console.log('Token encontrado:', token); // Para debug
    console.log('LocalStorage keys:', Object.keys(localStorage)); // Para debug

    if (token && token !== 'null' && token !== '') {
        // Usuario logueado - cambiar a "Volver al Panel"
        authButton.href = '../admin/dashboard.html';
        authButton.setAttribute('aria-label', 'Volver al Panel');
        authButton.querySelector('.btn-login__label').textContent = 'Volver al Panel';
        authButton.querySelector('i').className = 'fa-solid fa-gauge';
        console.log('Botón actualizado a "Ir al Panel"');
    } else {
        console.log('No hay token válido encontrado');
    }
});
