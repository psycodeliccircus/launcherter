const downloadsPerPage = 8; // Número de downloads por página
let currentPage = 1; // Página atual (pode ser dinâmico dependendo da sua lógica)

// Função para calcular o índice inicial e final dos downloads para a página atual
function calculateRange(page, perPage) {
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    return { startIndex, endIndex };
}

// Função para renderizar a tabela com downloads da página atual
function renderTable() {
    const { startIndex, endIndex } = calculateRange(currentPage, downloadsPerPage);
    const filteredDownloads = Downloads.slice(startIndex, endIndex);

    // Limpa a tabela antes de adicionar os downloads da página atual
    document.querySelector('table tbody').innerHTML = '';

    // Adiciona os downloads filtrados à tabela
    filteredDownloads.forEach(downloads => {
        const tr = document.createElement('tr');
        const trContent = `
    <td>${downloads.downloadsImg}</td>
    <td>${downloads.downloadsName}</td>
    <td class="${getVersionClass(downloads.downloadsStatus)}">${downloads.downloadsStatus}</td>
    <td class="${getStatusClass(downloads.status)}">V${downloads.status}</td>
    <td><a href="${downloads.downloadsLinks}"><button class="copy-button"><div class="icon"><span class="material-icons-sharp">cloud_download</span></div></button></a></td>
`;

// Função para obter a classe de versão
function getVersionClass(version) {
    const numericVersion = parseFloat(version.replace(/[^\d.]/g, '')); // Remove caracteres não numéricos
    return numericVersion >= 1.49 && numericVersion < 1.49 ? 'warning' : numericVersion >= 1.49 ? 'success' : 'danger';
}

// Função para obter a classe de status
function getStatusClass(status) {
    switch (status) {
        case 'Offline':
            return 'danger';
        case 'Manutenção':
            return 'warning';
        case 'Online':
            return 'success';
        default:
            return 'primary';
    }
}

        tr.innerHTML = trContent;
        document.querySelector('table tbody').appendChild(tr);
    });

    // Adiciona a paginação no final da tabela
    const totalPages = Math.ceil(Downloads.length / downloadsPerPage);
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = `
        <button onclick="previousPage()" class="copy-button">Anterior</button>
        <p>Página ${currentPage} de ${totalPages}</p>
        <button onclick="nextPage()" class="copy-button">Próxima</button>
    `;
}

// Função para ir para a próxima página
function nextPage() {
    const totalPages = Math.ceil(Downloads.length / downloadsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
    }
}

// Função para ir para a página anterior
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

// Renderiza a tabela inicial
renderTable();
