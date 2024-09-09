document.addEventListener("DOMContentLoaded", function() {
    const cookieAlert = document.getElementById('cookieAlert');
    const acceptCookiesButton = document.getElementById('acceptCookies');

    // Verificar se o usuário já aceitou os cookies
    if (!localStorage.getItem('cookiesAccepted')) {
        cookieAlert.style.display = 'flex'; // Mostrar o alerta
    }

    // Quando o botão de aceitar for clicado
    acceptCookiesButton.addEventListener('click', function() {
        localStorage.setItem('cookiesAccepted', 'true'); // Gravar no localStorage
        cookieAlert.style.display = 'none'; // Ocultar o alerta
    });

    // Esconder o alerta se já aceitou
    if (localStorage.getItem('cookiesAccepted')) {
        cookieAlert.style.display = 'none'; // Esconder se o usuário já aceitou
    }
});

// Número de itens por página
const ITEMS_PER_PAGE = 9;
let currentPage = 1;

// Função para carregar o CSV e converter para JSON
async function fetchCSVAndConvertToJSON() {
    const response = await fetch('produtos.csv');
    const csvData = await response.text();

    // Converter CSV para JSON usando PapaParse
    const parsedData = Papa.parse(csvData, {
        header: true, // Usar a primeira linha como cabeçalho
        skipEmptyLines: true
    });

    // Os dados convertidos em JSON estarão no parsedData.data
    const products = parsedData.data;

    // Inicializar a paginação
    renderPagination(products);
    renderPage(products, currentPage);

    // Verificar o parâmetro na URL
    const urlParams = new URLSearchParams(window.location.search);
    const isShareMode = urlParams.get('share') === 'true';

    if (isShareMode) {
        document.body.classList.add('share-mode'); // Adicionar uma classe para controlar o modo de compartilhamento
    }
}

// Função para renderizar os botões de paginação com numeração
function renderPagination(products) {
    const paginationContainer = document.getElementById('pagination-container');
    const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

    paginationContainer.innerHTML = ''; // Limpar o conteúdo existente

    // Criar o botão anterior
    const prevButton = document.createElement('button');
    prevButton.textContent = '❮';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderPage(products, currentPage);
        }
    };
    paginationContainer.appendChild(prevButton);

    // Criar a numeração das páginas
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        if (i === currentPage) {
            pageButton.classList.add('active'); // Destacar a página atual
        }
        pageButton.onclick = () => {
            currentPage = i;
            renderPage(products, currentPage);
        };
        paginationContainer.appendChild(pageButton);
    }

    // Criar o botão próximo
    const nextButton = document.createElement('button');
    nextButton.textContent = '❯';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderPage(products, currentPage);
        }
    };
    paginationContainer.appendChild(nextButton);
}

// Função para renderizar a página de produtos
function renderPage(products, page) {
    const productsContainer = document.getElementById('products-container');
    productsContainer.innerHTML = ''; // Limpar os produtos anteriores

    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = page * ITEMS_PER_PAGE;
    const pageProducts = products.slice(startIndex, endIndex);

    createProductCards(pageProducts);

    // Atualizar a paginação
    renderPagination(products);
}

// Função para gerar o código do produto automaticamente
function generateProductCode(productName, index) {
    const code = productName.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
    return `${code}-${index.toString().padStart(3, '0')}`;
}

// Mapeamento de cores para cada categoria
const categoryColors = {
    "Playstation 4": "#1e90ff",  // Azul para PS4
    "Playstation 3": "#ff6347",  // Vermelho para PS3
    "Playstation 5": "#333",  // Verde para PS2
    "Outros": "#ffcc00" // Amarelo para outras categorias
};

// Função para criar os cards de produtos
function createProductCards(products) {
    const imageDirectory = 'images/products/'; // Diretório padrão das imagens

    const urlParams = new URLSearchParams(window.location.search);
    const isShareMode = urlParams.get('share') === 'true'; // Verificar se o parâmetro share=true está na URL

    const categories = {}; // Organizar produtos por categoria

    // Organizar produtos por categoria
    products.forEach((product, index) => {
        const category = product.categoryOFF || 'Outros'; // Gambiarra para remover o agrupamento de categorias!

        if (!categories[category]) {
            categories[category] = [];
        }
        const productCode = generateProductCode(product.name, index);

        categories[category].push({ ...product, code: productCode });
    });

    // Renderizar os produtos organizados por categoria
    Object.keys(categories).forEach(category => {
        const section = document.createElement('section');
        section.classList.add('category-section');

        // Adicionar o título da categoria com a cor correspondente
        const title = document.createElement('h2');
        title.textContent = category;
        title.style.color = categoryColors[category] || '#000'; // Aplicar cor baseada na categoria
        section.appendChild(title);

        // Adicionar a quantidade de itens
        const itemCount = document.createElement('p');
        itemCount.textContent = `${categories[category].length} item(s)`;
        itemCount.classList.add('item-count');
        section.appendChild(itemCount);

        const container = document.createElement('div');
        container.classList.add('container');

        categories[category].forEach(product => {
            const card = document.createElement('div');
            card.classList.add('card');

            // Adicionar a imagem do produto
            const img = document.createElement('img');
            img.src = `${imageDirectory}${product.image}`;
            card.appendChild(img);

            // Se o produto foi vendido, adicionar a classe 'sold' e a tag 'INDISPONÍVEL'
            if (product.sold === 'true') {
                card.classList.add('sold'); // Adiciona a classe para aplicar o filtro de escala de cinza

                const soldTag = document.createElement('div');
                soldTag.classList.add('sold-tag');
                soldTag.textContent = 'INDISPONÍVEL';
                card.appendChild(soldTag);
            }

            // Adicionar o título do produto
            const title = document.createElement('h3');
            title.textContent = product.name;
            card.appendChild(title);

            // Adicionar o código do produto
            const codeElement = document.createElement('p');
            codeElement.classList.add('product-code');
            codeElement.textContent = `(ID: ${product.code})`;
            card.appendChild(codeElement);

            // Adicionar o preço do produto
            const price = document.createElement('p');
            price.classList.add('price');
            price.textContent = product.price;
            card.appendChild(price);

            // Verificar se o produto tem frete grátis e adicionar a tag
            if (product.freeShipping === 'true') {
                const freightTag = document.createElement('div');
                freightTag.classList.add('freight-tag');
                freightTag.textContent = 'FRETE GRÁTIS';
                card.appendChild(freightTag);
            }

            // Adicionar as tags de categoria e condição (novo/usado)
            const tagsContainer = document.createElement('div');

            // Tag da categoria com cor baseada no mapeamento
            const categoryTag = document.createElement('span');
            categoryTag.classList.add('tag');
            categoryTag.textContent = product.category;
            // Se o produto foi vendido, deixar a tag em cinza
            if (product.sold === 'true') {
                categoryTag.style.backgroundColor = '#ccc'; // Cinza quando vendido
                categoryTag.style.color = '#333';
            } else {
                categoryTag.style.backgroundColor = categoryColors[product.category] || '#ccc'; // Cor da categoria normal
            }

            tagsContainer.appendChild(categoryTag);

            // Tag de condição (novo/usado)
            const conditionTag = document.createElement('span');
            conditionTag.classList.add('tag', product.condition === 'novo' ? 'new' : 'used');
            conditionTag.textContent = product.condition === 'novo' ? 'Novo' : 'Usado';
            // Se o produto foi vendido, deixar a tag de condição em cinza
            if (product.sold === 'true') {
                conditionTag.style.backgroundColor = '#ccc'; // Cinza quando vendido
                conditionTag.style.color = '#333';
            }

            tagsContainer.appendChild(conditionTag);

            // Adicionar o container das tags ao card
            card.appendChild(tagsContainer);

            // Adicionar o botão de WhatsApp
            const button = document.createElement('button');
            const whatsappIcon = document.createElement('img');
            whatsappIcon.src = 'icons/whatsapp.svg';
            whatsappIcon.alt = 'WhatsApp';
            whatsappIcon.classList.add('whatsapp-icon');
            button.appendChild(whatsappIcon);

            const buttonText = document.createTextNode(" Compre pelo WhatsApp");
            button.appendChild(buttonText);

            if (product.sold === 'true') {
                button.classList.add('disabled');
            } else {
                button.onclick = () => {
                    window.open(generateWhatsAppLink(product.name, product.code), '_blank');
                };
            }

            card.appendChild(button);

            // Adicionar o botão de download se o modo de compartilhamento estiver ativo
            if (isShareMode) {
                const downloadButton = document.createElement('button');
                downloadButton.textContent = 'Baixar Imagem';
                downloadButton.classList.add('download-btn');
                card.appendChild(downloadButton);

                downloadButton.onclick = function () {
                    downloadButton.style.display = 'none';
                    html2canvas(card).then(canvas => {
                        const link = document.createElement('a');
                        link.href = canvas.toDataURL('image/png');
                        link.download = `card-${product.name}.png`;
                        link.click();
                        downloadButton.style.display = 'block';
                    });
                };
            }

            container.appendChild(card);
        });

        section.appendChild(container);
        document.getElementById('products-container').appendChild(section);
    });
}


// Função para gerar o link do WhatsApp
function generateWhatsAppLink(productName, productCode) {
    const phoneNumber = '5531995724281';
    const message = `Olá, tenho interesse no ${encodeURIComponent(productName)} (ID: ${productCode}).`;
    return `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;
}

// Chamar a função para carregar o CSV e renderizar os produtos
fetchCSVAndConvertToJSON();
