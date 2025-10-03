// Admin login UI scripts
// Verificar que los scripts se cargaron correctamente
window.addEventListener('DOMContentLoaded', () => {
  console.log('=== VERIFICACIÓN DE SCRIPTS ===');
  console.log('apiConfig:', typeof window.apiConfig !== 'undefined' ? '✓' : '✗');
  console.log('ApiService:', typeof window.ApiService !== 'undefined' ? '✓' : '✗');
  console.log('apiService:', typeof window.apiService !== 'undefined' ? '✓' : '✗');
  console.log('authManager:', typeof authManager !== 'undefined' ? '✓' : '✗');
  console.log('================================');
});

// Background - solo establecer una vez
document.body.style.backgroundImage = "url('https://assets.codepen.io/252820/unsplash-mountain3.webp')";

function togglePassword() {
  const passwordInput = document.getElementById('password');
  const toggleIcon = document.getElementById('toggleIcon');

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    toggleIcon.classList.remove('fa-eye');
    toggleIcon.classList.add('fa-eye-slash');
  } else {
    passwordInput.type = 'password';
    toggleIcon.classList.remove('fa-eye-slash');
    toggleIcon.classList.add('fa-eye');
  }
}
