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
        cookieAlert.classList.add('hidden'); // Aplicar a classe para esconder o alerta
    });

    // Esconder o alerta se já aceitou
    if (localStorage.getItem('cookiesAccepted')) {
        cookieAlert.classList.add('hidden'); // Esconder se o usuário já aceitou
    }
});

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
    createProductCards(parsedData.data);
}

// Função para gerar o código do produto automaticamente
function generateProductCode(productName, index) {
    const code = productName.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
    return `${code}-${index.toString().padStart(3, '0')}`;
}

// Função para gerar o link do WhatsApp
function generateWhatsAppLink(productName, productCode) {
    const phoneNumber = '5531995724281';
    const message = `Olá, tenho interesse no ${encodeURIComponent(productName)} (ID: ${productCode}).`;
    return `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;
}

// Função para criar os cards de produtos
function createProductCards(products) {
    const categories = {}; // Objeto para agrupar produtos por categoria
    const imageDirectory = 'images/products/'; // Diretório padrão das imagens

    // Organizar produtos por categoria
    products.forEach((product, index) => {
        // Se o produto foi vendido, não adicionar à lista
        if (product.sold === 'true') return;

        // Gerar um código único para o produto
        const productCode = generateProductCode(product.name, index);

        // Se a categoria ainda não existe no objeto, inicialize como um array vazio
        if (!categories[product.category]) {
            categories[product.category] = [];
        }

        // Adicionar o produto à sua categoria
        categories[product.category].push({
            ...product,
            code: productCode
        });
    });

    // Adicionar as categorias e produtos ao HTML
    const productsContainer = document.getElementById('products-container');
    
    Object.keys(categories).forEach(category => {
        const categoryProducts = categories[category];

        // Criar a seção da categoria se houver produtos
        if (categoryProducts.length > 0) {
            const section = document.createElement('section');
            section.classList.add('category-section');
            
            // Adicionar o título da categoria
            const title = document.createElement('h2');
            title.textContent = category;
            section.appendChild(title);

            // Criar o container para os produtos da categoria
            const container = document.createElement('div');
            container.classList.add('container');

            // Criar os cards dos produtos da categoria
            categoryProducts.forEach(product => {
                const card = document.createElement('div');
                card.classList.add('card');

                // Adicionar a imagem do produto (concatena o diretório com o nome do arquivo)
                const img = document.createElement('img');
                img.src = `${imageDirectory}${product.image}`; // Diretório + nome do arquivo
                card.appendChild(img);

                // Adicionar o título do produto
                const title = document.createElement('h3');
                title.textContent = product.name;
                card.appendChild(title);

                // Adicionar o código do produto logo abaixo do título
                const codeElement = document.createElement('p');
                codeElement.classList.add('product-code');
                codeElement.textContent = `(ID: ${product.code})`;
                card.appendChild(codeElement);

                // Adicionar a descrição do produto
                // const description = document.createElement('p');
                // description.textContent = product.description;
                // card.appendChild(description);

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

                // Adicionar o botão de WhatsApp com ícone e link padronizado
                const button = document.createElement('button');

                // Criar o ícone do WhatsApp
                const whatsappIcon = document.createElement('img');
                whatsappIcon.src = 'icons/whatsapp.svg'; // Caminho para o ícone do WhatsApp
                whatsappIcon.alt = 'WhatsApp';
                whatsappIcon.classList.add('whatsapp-icon'); // Classe para estilização
                button.appendChild(whatsappIcon);

                // Adicionar o texto ao lado do ícone
                const buttonText = document.createTextNode(" Compre pelo WhatsApp");
                button.appendChild(buttonText);

                // Ação do botão para abrir o WhatsApp com o código do produto
                button.onclick = () => {
                    window.open(generateWhatsAppLink(product.name, product.code), '_blank');
                };
                card.appendChild(button);

                // Adicionar o card ao container da categoria
                container.appendChild(card);
            });

            // Adicionar o container de produtos à seção
            section.appendChild(container);

            // Adicionar a seção ao container principal
            productsContainer.appendChild(section);
        }
    });
}

// Chamar a função para carregar o CSV, converter para JSON e criar os cards
fetchCSVAndConvertToJSON();
