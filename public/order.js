// Código para Pedidos
Orders.forEach(order => {
    const tr = document.createElement('tr');
    const trContent = `
        <td>${order.productName}</td>
        <td>${order.productVersion}</td>
        <td>${order.productNumber}</td>
        <td>${order.paymentStatus}</td>
        <td class="${order.status === 'Offline' ? 'danger' : order.status === 'Manutenção' ? 'warning' : order.status === 'Online' ? 'success' : 'primary'}">${order.status}</td>
        <td><button class="download-button"><div class="icon"><span class="material-icons-sharp">download</span></div></button></td>
    `;
    tr.innerHTML = trContent;
    document.querySelector('table tbody').appendChild(tr);

    // Adiciona um ouvinte de evento de clique para o botão de download
    const downloadButton = tr.querySelector('.download-button');
    downloadButton.addEventListener('click', () => {
        startDownload(order.productLink);
    });
});

function startDownload(productLink) {
    window.api.send('startDownload', productLink);
}

window.api.receive('downloadProgress', progress => {
    const progressDiv = document.getElementById('progress');
    progressDiv.innerHTML = `
        <p>Arquivo: ${progress.fileName}</p>
        <p>Tamanho total: ${formatBytes(progress.totalSize)}</p>
        <p>Tamanho baixado: ${formatBytes(progress.downloadedSize)}</p>
        <p>Velocidade: ${formatBytes(progress.speed)}/s</p>
        <p>Porcentagem: ${progress.percentage.toFixed(2)}%</p>
    `;
});

window.api.receive('downloadCompleted', data => {
    const progressDiv = document.getElementById('progress');
    progressDiv.innerHTML = '';

    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success d-flex align-items-center';
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `<div><strong>Download concluído para ${data.fileName}.</strong></div>`;

    document.getElementById('progress').insertAdjacentElement('afterbegin', alertDiv);

    setTimeout(() => {
        alertDiv.classList.add('fade');
        setTimeout(() => {
            alertDiv.remove();
        }, 1000);
    }, 10000);
});

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
