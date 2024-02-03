// Função para animar os números
function animateNumber(element, targetValue) {
    anime({
        targets: element,
        innerHTML: [0, targetValue],
        round: 1,
        easing: 'easeInOutQuad',
        duration: 2000 // Tempo da animação em milissegundos
    });
}

// Função para atualizar os valores e porcentagens
function updateStats(statusId, countId, percentageId, newValue, previousValue) {
    const statusElement = document.getElementById(statusId);
    const countElement = statusElement.querySelector(`#${countId}`);
    const percentageElement = statusElement.querySelector(`#${percentageId}`);

    // Atualiza o valor
    animateNumber(countElement, newValue.replace(',', ''));

    // Calcula e atualiza a porcentagem
    const percentage = (((newValue.replace(',', '') - previousValue.replace(',', '')) / previousValue.replace(',', '')) * 100).toFixed(2);
    percentageElement.innerHTML = `+${percentage}%`;
}

// Atualiza os valores uma vez
updateStats('downloadsStatus', 'downloadsCount', 'downloadsPercentage', '66,324', '66,024');
updateStats('newUsersStatus', 'newUsersCount', 'newUsersPercentage', '26,481', '25,981');
updateStats('searchesStatus', 'searchesCount', 'searchesPercentage', '16,518', '16,148');
