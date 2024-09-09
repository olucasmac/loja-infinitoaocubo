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

const ITEMS_PER_PAGE = 9;
let currentPage = 1;
let allProducts = []; // Armazenar todos os produtos carregados
let selectedCategory = "all";
let selectedCondition = "all";

// Função para carregar o CSV e converter para JSON
async function fetchCSVAndConvertToJSON() {
    const response = await fetch('produtos.csv');
    const csvData = await response.text();

    // Converter CSV para JSON usando PapaParse
    const parsedData = Papa.parse(csvData, {
        header: true, // Usar a primeira linha como cabeçalho
        skipEmptyLines: true
    });

    // Retornar os dados convertidos
    return parsedData.data;
}

// Função para renderizar a página de produtos
function renderPage(products, page) {
    const productsContainer = document.getElementById('products-container');
    productsContainer.innerHTML = ''; // Limpar os produtos anteriores

    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = page * ITEMS_PER_PAGE;
    const pageProducts = products.slice(startIndex, endIndex);

    createProductCards(pageProducts);
    renderPagination(products);
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
            filterProducts();
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Rolar para o topo da página
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
            filterProducts();
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Rolar para o topo da página
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
            filterProducts();
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Rolar para o topo da página
        }
    };
    paginationContainer.appendChild(nextButton);
}


// Função para gerar o código do produto automaticamente
function generateProductCode(productName, index) {
    const code = productName.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
    return `${code}-${index.toString().padStart(3, '0')}`;
}

// Mapeamento de cores para cada categoria
const categoryColors = {
    "PS4": "#1e90ff",  // Azul para PS4
    "PS3": "#ff6347",  // Vermelho para PS3
    "PS5": "#333",  // Cinza para PS5
    "Outros": "#ffcc00" // Amarelo para outras categorias
};

// Função para criar os cards de produtos
function createProductCards(products) {
    const imageDirectory = 'images/products/'; // Diretório padrão das imagens

    const urlParams = new URLSearchParams(window.location.search);
    const isShareMode = urlParams.get('share') === 'true'; // Verificar se o parâmetro share=true está na URL

    const categories = {}; // Organizar produtos por categoria

    products.forEach((product, index) => {
        const category = product.category || 'Outros';
        if (!categories[category]) {
            categories[category] = [];
        }
        const productCode = generateProductCode(product.name, index);
        categories[category].push({ ...product, code: productCode });
    });

    Object.keys(categories).forEach(category => {
        const section = document.createElement('section');
        section.classList.add('category-section');

        const title = document.createElement('h2');
        title.textContent = category;
        title.style.color = categoryColors[category] || '#000'; // Aplicar cor baseada na categoria
        section.appendChild(title);

        const itemCount = document.createElement('p');
        itemCount.textContent = `${categories[category].length} item(s)`;
        itemCount.classList.add('item-count');
        section.appendChild(itemCount);

        const container = document.createElement('div');
        container.classList.add('container');

        categories[category].forEach(product => {
            const card = document.createElement('div');
            card.classList.add('card');

            const img = document.createElement('img');
            img.src = `${imageDirectory}${product.image}`;
            card.appendChild(img);

            // Verificar se o produto foi vendido
            if (product.sold === 'true') {
                card.classList.add('sold'); // Adicionar classe 'sold' para imagem em tons de cinza
                const soldTag = document.createElement('div');
                soldTag.classList.add('sold-tag');
                soldTag.textContent = 'INDISPONÍVEL';
                card.appendChild(soldTag);
            }

            const title = document.createElement('h3');
            title.textContent = product.name;
            card.appendChild(title);

            const codeElement = document.createElement('p');
            codeElement.classList.add('product-code');
            codeElement.textContent = `(ID: ${product.code})`;
            card.appendChild(codeElement);

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

            // Tag da categoria
            const categoryTag = document.createElement('span');
            categoryTag.classList.add('tag');
            categoryTag.textContent = product.category;
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
            if (product.sold === 'true') {
                conditionTag.style.backgroundColor = '#ccc'; // Cinza quando vendido
                conditionTag.style.color = '#333';
            }
            tagsContainer.appendChild(conditionTag);

            card.appendChild(tagsContainer);

            const button = document.createElement('button');
            const whatsappIcon = document.createElement('img');
            whatsappIcon.src = 'icons/whatsapp.svg';
            whatsappIcon.alt = 'WhatsApp';
            whatsappIcon.classList.add('whatsapp-icon');
            button.appendChild(whatsappIcon);

            const buttonText = document.createTextNode(" Compre pelo WhatsApp");
            button.appendChild(buttonText);

            if (product.sold === 'true') {
                button.classList.add('disabled'); // Desativar botão de WhatsApp para produtos vendidos
            } else {
                button.onclick = () => {
                    window.open(generateWhatsAppLink(product.name, product.code), '_blank');
                };
            }

            card.appendChild(button);

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

// Função para adicionar os event listeners aos botões de filtro
function initializeFilters() {
    const categoryButtons = document.querySelectorAll('#category-filters button');
    const conditionButtons = document.querySelectorAll('#condition-filters button');

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectedCategory = button.getAttribute('data-category');
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterProducts(); // Atualizar os produtos com base no filtro
        });
    });

    conditionButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectedCondition = button.getAttribute('data-condition');
            conditionButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterProducts(); // Atualizar os produtos com base no filtro
        });
    });
}

// Função para filtrar os produtos com base na categoria e condição selecionadas
function filterProducts() {
    const filteredProducts = allProducts.filter(product => {
        const matchCategory = selectedCategory === "all" || product.category === selectedCategory;
        const matchCondition = selectedCondition === "all" || product.condition === selectedCondition;
        return matchCategory && matchCondition;
    });

    renderPage(filteredProducts, currentPage); // Atualizar a página com os produtos filtrados
}

// Função principal para carregar o CSV e inicializar a página
async function loadProducts() {
    allProducts = await fetchCSVAndConvertToJSON(); // Carregar todos os produtos
    renderPage(allProducts, currentPage); // Renderizar a primeira página
    initializeFilters(); // Inicializar os filtros
}

// Chamar a função para carregar os produtos
loadProducts();
