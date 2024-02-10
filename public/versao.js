// Fetch and include the menu content
fetch('https://api.renildomarcio.com.br/launcher/menu.php')
    .then(response => response.text())
    .then(menuHTML => {
        document.getElementById('menu-container').innerHTML = menuHTML;

        // Adiciona a classe "active" ao link do menu correspondente à página atual
        const currentPage = window.location.pathname;
        const menuLinks = document.querySelectorAll('.sidebar a');

        menuLinks.forEach(link => {
            // Converte ambas as URLs para caminhos relativos para uma comparação mais precisa
            const menuLinkPath = link.getAttribute('href').split('/').pop();
            const currentPagePath = currentPage.split('/').pop();

            if (menuLinkPath === currentPagePath) {
                link.classList.add('active');
            }
        });
    });
