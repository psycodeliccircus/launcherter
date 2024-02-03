const sideMenu = document.querySelector('aside');
const menuBtn = document.getElementById('menu-btn');
const closeBtn = document.getElementById('close-btn');

const darkModeToggle = document.querySelector('.dark-mode');
const body = document.body;

// Verifica se há um valor armazenado no localStorage
const isDarkMode = localStorage.getItem('darkMode') === 'true';

// Define o modo escuro com base no valor armazenado
if (isDarkMode) {
    body.classList.add('dark-mode-variables');
    updateDarkModeIcons(true);
} else {
    updateDarkModeIcons(false);
}

function updateDarkModeIcons(isDarkModeActive) {
    darkModeToggle.querySelector('span:nth-child(1)').classList.toggle('active', !isDarkModeActive);
    darkModeToggle.querySelector('span:nth-child(2)').classList.toggle('active', isDarkModeActive);
}

menuBtn.addEventListener('click', () => {
    sideMenu.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
    sideMenu.style.display = 'none';
});

darkModeToggle.addEventListener('click', () => {
    // Alterna entre modo escuro e modo claro
    body.classList.toggle('dark-mode-variables');

    // Atualiza o status do modo escuro no localStorage
    const newDarkModeStatus = body.classList.contains('dark-mode-variables');
    localStorage.setItem('darkMode', newDarkModeStatus);

    // Alterna a classe "active" nos ícones de modo escuro
    updateDarkModeIcons(newDarkModeStatus);
});
