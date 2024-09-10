// Função para carregar e parsear o CSV
function loadCSV() {
    Papa.parse('../produtos.csv', {
        download: true,
        header: true,
        complete: function(results) {
            generateCards(results.data);
        },
        error: function(err) {
            console.error('Erro ao carregar o CSV:', err);
        }
    });
}

// Função para gerar os cards a partir dos dados do CSV
function generateCards(products) {
    const container = document.getElementById('card-container');

    products.forEach((product, index) => {
        // Cria o wrapper para o card e o botão de download
        const cardWrapper = document.createElement('div');
        cardWrapper.classList.add('card-wrapper');

        const card = document.createElement('div');
        card.classList.add('card');
        card.id = `card-${index}`;  // Adiciona um ID único para cada card

        // Adiciona a moldura como uma imagem diretamente no HTML
        const moldura = document.createElement('img');
        moldura.src = '../images/i3_card_2.png'; // Certifique-se de usar a versão de alta qualidade da moldura
        moldura.classList.add('moldura');
        card.appendChild(moldura);

        const img = document.createElement('img');
        img.src = `../images/products/${product.image}`;
        img.alt = product.name;
        img.classList.add('product-image');

        // Se o produto estiver vendido, aplicamos a escala de cinza
        if (product.sold === 'true') {
            img.style.filter = 'grayscale(100%)';  // Aplica o filtro de escala de cinza
        }

        card.appendChild(img);

        const priceTag = document.createElement('div');
        priceTag.classList.add('price-tag');
        if (product.sold === 'true') {
            priceTag.textContent = 'VENDIDO';  // Substitui o preço por "VENDIDO"
        } else {
            priceTag.textContent = product.price;
        }
        card.appendChild(priceTag);

        cardWrapper.appendChild(card);

        // Cria o botão de download
        const downloadBtn = document.createElement('button');
        downloadBtn.classList.add('download-btn');
        downloadBtn.textContent = 'Download';
        downloadBtn.addEventListener('click', () => downloadCardAsImage(card, product.name));
        cardWrapper.appendChild(downloadBtn);

        container.appendChild(cardWrapper);
    });
}

// Função para converter o card em imagem e baixar com alta qualidade
function downloadCardAsImage(cardElement, productName) {
    html2canvas(cardElement, {
        scale: 3,  // Aumenta a escala para renderizar em alta qualidade
        useCORS: true,  // Habilita cross-origin para imagens hospedadas externamente
        logging: true
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `${productName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

// Carregar o CSV ao carregar a página
window.onload = loadCSV;
