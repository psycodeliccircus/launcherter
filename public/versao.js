// Fetch and include the menu content
fetch('menu.html')
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

// Função para atualizar a versão
function updateVersion(newVersion) {
    var versionList = document.getElementById('versionList');
    versionList.textContent = newVersion;
  }

  // Exemplo de como chamar a função para atualizar a versão
  setTimeout(function() {
    updateVersion('V1.1.3'); // Substitua pelo número da versão desejada
  }, 1000); // Isso muda a versão após 2 segundos, você pode ajustar conforme necessário