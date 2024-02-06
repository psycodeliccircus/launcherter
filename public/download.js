const downloadsPerPage = 7;
let currentPage = 1;

function calculateRange(page, perPage) {
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    return { startIndex, endIndex };
}

function renderTable() {
    const { startIndex, endIndex } = calculateRange(currentPage, downloadsPerPage);
    const filteredDownloads = Downloads.slice(startIndex, endIndex);

    // Limpa a tabela antes de adicionar os downloads da página atual
    const tbody = document.querySelector('table tbody');
    tbody.innerHTML = '';

    // Adiciona os downloads filtrados à tabela
    filteredDownloads.forEach(downloads => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${downloads.downloadsImg}" alt="${downloads.downloadsName}" width="100px" height="100px"></td>
            <td>${downloads.downloadsName}</td>
            <td>${createCategoryButtons(downloads.downloadsCategoria)}</td>
            <td>${downloads.downloadsData}</td>
            <td class="${getVersionClass(downloads.downloadsStatus)}">V${downloads.downloadsStatus}</td>
            <td class="${getStatusClass(downloads.status)}">${downloads.status}</td>
            <td>${createDownloadButton(downloads.downloadsLinks)}</td>
        `;
        tbody.appendChild(tr);
    });

    // Adiciona a paginação no final da tabela
    const totalPages = Math.ceil(Downloads.length / downloadsPerPage);
    const paginationContainer = document.querySelector('.pagination');

    if (totalPages > 1) {
        paginationContainer.innerHTML = `
            <button onclick="previousPage()" class="copy-button" ${currentPage > 1 ? '' : 'disabled'}>Anterior</button>
            <p>Página ${currentPage} de ${totalPages}</p>
            <button onclick="nextPage()" class="copy-button" ${currentPage < totalPages ? '' : 'disabled'}>Próxima</button>
        `;
    } else {
        paginationContainer.innerHTML = ''; // Oculta os botões se não houver mais de uma página
    }
}

function createCategoryButtons(categories) {
    const categoryButtons = categories.split(',').map(category => {
        return `<button class="category-button" disabled>${category.trim()}</button>`;
    });

    return categoryButtons.join(' ');
}

function createDownloadButton(link) {
    return `<a href="${link}"><button class="copy-button"><div class="icon"><span class="material-icons-sharp">cloud_download</span></div></button></a>`;
}

function getVersionClass(version) {
    const numericVersion = parseFloat(version.replace(/[^\d.]/g, ''));
    return numericVersion >= 1.49 && numericVersion < 1.49 ? 'warning' : numericVersion >= 1.49 ? 'success' : 'danger';
}

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

function nextPage() {
    const totalPages = Math.ceil(Downloads.length / downloadsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
    }
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

// Renderiza a tabela inicial
renderTable();
