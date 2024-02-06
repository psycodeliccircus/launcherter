// Código para Servidores
Servers.forEach(server => {
    const tr = document.createElement('tr');
    const trContent = `
        <td>${server.serverName}</td>
        <td><button class="category-button" disabled>${server.serverNumber}</button></td>
        <td class="${server.serverStatus === 'Offline' ? 'danger' : server.serverStatus === 'Online' ? 'success' : 'primary'}">${server.serverStatus}</td>
        <td class="${server.status === 'Offline' ? 'danger' : server.status === 'Manutenção' ? 'warning' : 'primary'}">${server.status}</td>
        <td><button class="copy-button"><div class="icon"><span class="material-icons-sharp">content_copy</span></div></button></td>
    `;
    tr.innerHTML = trContent;
    document.querySelector('table tbody').appendChild(tr);

    // Adiciona um ouvinte de evento de clique para o botão de cópia
    const copyButton = tr.querySelector('.copy-button');
    copyButton.addEventListener('click', () => {
        // Copia o valor de ${server.serverNumber} para a área de transferência
        navigator.clipboard.writeText(server.serverNumber).then(() => {
            alert('O ID do servidor copiado com sucesso!');
        }).catch((error) => {
            console.error('Erro ao copiar o número do servidor:', error);
        });
    });
});
