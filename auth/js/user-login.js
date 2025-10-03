// User login page scripts
// Background rotation
const backgroundImages = [
  'https://assets.codepen.io/252820/unsplash-mountain3.webp',
];

let currentImageIndex = 0;
const body = document.body;

function changeBackground() {
  const nextImage = new Image();
  const nextImageIndex = (currentImageIndex + 1) % backgroundImages.length;
  nextImage.src = backgroundImages[nextImageIndex];

  body.style.backgroundImage = `url('${backgroundImages[currentImageIndex]}')`;
  currentImageIndex = nextImageIndex;
}

changeBackground();

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
