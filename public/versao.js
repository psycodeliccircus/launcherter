// Função para atualizar a versão
function updateVersion(newVersion) {
    var versionList = document.getElementById('versionList');
    versionList.textContent = newVersion;
  }

  // Exemplo de como chamar a função para atualizar a versão
  setTimeout(function() {
    updateVersion('V1.1.0'); // Substitua pelo número da versão desejada
  }, 2000); // Isso muda a versão após 2 segundos, você pode ajustar conforme necessário