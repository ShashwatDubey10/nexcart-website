import featuredProducts from './data/featured-products.js';
import newArrivals from './data/new-arrivals.js';
import saleProducts from './data/sale-products.js';
import categories from './data/categories.js';
import categoryProducts from './data/category-products.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize cart from localStorage
    let cartCount = parseInt(localStorage.getItem('cartCount')) || 0;
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }

    // Add cart icon click handler
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            window.location.href = '../html/checkout.html';
        });
    }

    // Event handlers
    function handleAddToCart(e) {
        if (e.target.classList.contains('add-to-cart')) {
            const productId = e.target.closest('form').querySelector('[name="product_id"]').value;
            cartCount++;
            localStorage.setItem('cartCount', cartCount);
            if (cartCountElement) {
                cartCountElement.textContent = cartCount;
            }
            
            // Get existing cart items or initialize empty array
            let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
            
            // Find the product data based on current page
            let product;
            if (window.location.href.includes('new-arrivals.html')) {
                product = newArrivals.find(p => p.id.toString() === productId);
            } else if (window.location.href.includes('sale.html')) {
                product = saleProducts.find(p => p.id.toString() === productId);
            } else if (window.location.href.includes('products.html')) {
                // Add this condition for category products
                const categoryId = new URLSearchParams(window.location.search).get('category');
                product = categoryProducts[categoryId]?.find(p => p.id.toString() === productId);
            } else {
                product = featuredProducts.find(p => p.id.toString() === productId);
            }
            
            if (product) {
                // Check if item already exists in cart
                const existingItem = cartItems.find(item => item.id.toString() === productId);
                if (existingItem) {
                    existingItem.quantity++;
                } else {
                    cartItems.push({
                        id: product.id,
                        name: product.name,
                        price: product.salePrice || product.price,
                        image: product.image,
                        quantity: 1
                    });
                }
                
                localStorage.setItem('cartItems', JSON.stringify(cartItems));
            }
            
            // Animation feedback
            const button = e.target;
            button.textContent = 'Added!';
            button.disabled = true;
            setTimeout(() => {
                button.textContent = 'Add to Cart';
                button.disabled = false;
            }, 1000);
        }
    }

    // Initialize page-specific content
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('index.html') || currentPage.endsWith('/')) {
        renderFeaturedProducts();
    } else if (currentPage.includes('new-arrivals.html')) {
        renderNewArrivals();
        initializeNewArrivalsFilters(); // Add this line to initialize filters
    } else if (currentPage.includes('sale.html')) {
        renderSaleProducts();
    } else if (currentPage.includes('categories.html')) {
        renderCategories();
    } else if (currentPage.includes('checkout.html')) {
        renderCheckout();
    } else if (currentPage.includes('products.html')) {
        renderCategoryProducts();
    }

    // Add event listeners
    document.addEventListener('click', handleAddToCart);
});

function renderFeaturedProducts() {
    const container = document.querySelector('.products-container');
    if (!container) return;
    
    container.innerHTML = featuredProducts.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>$${product.price.toFixed(2)}</p>
                <form action="../html/checkout.html" method="get">
                    <input type="hidden" name="product_id" value="${product.id}">
                    <input type="hidden" name="product_name" value="${product.name}">
                    <input type="hidden" name="product_price" value="${product.price}">
                    <button type="submit" class="add-to-cart">Add to Cart</button>
                </form>
            </div>
        </div>
    `).join('');
}

function renderNewArrivals(filteredProducts = null) {
    const container = document.querySelector('.products-grid');
    if (!container) return;
    
    const productsToRender = filteredProducts || newArrivals;
    
    container.innerHTML = productsToRender.map(product => `
        <div class="product-card">
            <div class="sale-tag">${product.tag}</div>
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>$${product.price.toFixed(2)}</p>
                <small>${product.arrivalDate}</small>
                <form action="../html/checkout.html" method="get">
                    <input type="hidden" name="product_id" value="${product.id}">
                    <input type="hidden" name="product_name" value="${product.name}">
                    <input type="hidden" name="product_price" value="${product.price}">
                    <button type="submit" class="add-to-cart">Add to Cart</button>
                </form>
            </div>
        </div>
    `).join('');
}

// Add this new function to handle filters
function initializeNewArrivalsFilters() {
    const categorySelect = document.querySelector('.filter-select[data-filter="category"]');
    const sortSelect = document.querySelector('.filter-select[data-filter="sort"]');
    
    if (categorySelect && sortSelect) {
        const handleFilters = () => {
            let filtered = [...newArrivals];
            
            // Apply category filter
            const selectedCategory = categorySelect.value;
            if (selectedCategory !== 'all') {
                filtered = filtered.filter(product => product.category === selectedCategory);
            }
            
            // Apply sort filter
            const sortOption = sortSelect.value;
            switch (sortOption) {
                case 'price-low':
                    filtered.sort((a, b) => a.price - b.price);
                    break;
                case 'price-high':
                    filtered.sort((a, b) => b.price - a.price);
                    break;
                case 'newest':
                    filtered.sort((a, b) => {
                        const timeMap = {
                            'Just Arrived': 0,
                            '1 day ago': 1,
                            '2 days ago': 2,
                            '3 days ago': 3,
                            '4 days ago': 4,
                            '5 days ago': 5,
                            '1 week ago': 7
                        };
                        const timeA = timeMap[a.arrivalDate] || 999;
                        const timeB = timeMap[b.arrivalDate] || 999;
                        return timeA - timeB;
                    });
                    break;
            }
            
            renderNewArrivals(filtered);
        };
        
        categorySelect.addEventListener('change', handleFilters);
        sortSelect.addEventListener('change', handleFilters);
    }
}

function renderSaleProducts() {
    const container = document.querySelector('.products-grid');
    if (!container) return;
    
    container.innerHTML = saleProducts.map(product => `
        <div class="product-card sale-item">
            <div class="sale-tag">${product.tag}</div>
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="original-price">$${product.price.toFixed(2)}</p>
                <p class="sale-price">$${product.salePrice.toFixed(2)}</p>
                <form action="../html/checkout.html" method="get">
                    <input type="hidden" name="product_id" value="${product.id}">
                    <input type="hidden" name="product_name" value="${product.name}">
                    <input type="hidden" name="product_price" value="${product.salePrice}">
                    <button type="submit" class="add-to-cart">Add to Cart</button>
                </form>
            </div>
        </div>
    `).join('');
}

function renderCategories() {
    const container = document.querySelector('.categories-grid');
    if (!container) return;
    
    container.innerHTML = categories.map(category => `
        <div class="category-card">
            <img src="${category.image}" alt="${category.name}">
            <div class="category-info">

            <h3>${category.name}</h3>
                <a href="../html/products.html?category=${encodeURIComponent(category.name)}" class="category-btn">Shop Now</a>
            </div>
        </div>
    `).join('');
}

function renderCheckout() {
    const container = document.querySelector('.cart-items-container');
    const subtotalElement = document.querySelector('.subtotal');
    const taxElement = document.querySelector('.tax');
    const totalElement = document.querySelector('.total-amount');
    
    if (!container) return;

    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

    if (cartItems.length === 0) {
        container.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
        return;
    }

    container.innerHTML = cartItems.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <h3 class="item-name">${item.name}</h3>
                <p class="item-price">$${item.price.toFixed(2)}</p>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn decrease">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn increase">+</button>
                <button class="remove-item-btn">×</button>
            </div>
        </div>
    `).join('');

    function updateTotals() {
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        const tax = subtotal * 0.1; // 10% tax
        const shipping = cartItems.length > 0 ? 9.99 : 0;
        const total = subtotal + tax + shipping;

        if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        if (taxElement) taxElement.textContent = `$${tax.toFixed(2)}`;
        if (document.querySelector('.shipping')) {
            document.querySelector('.shipping').textContent = `$${shipping.toFixed(2)}`;
        }
        if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
    }

    updateTotals();

    // Add quantity control and remove item handlers
    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('quantity-btn') || e.target.classList.contains('remove-item-btn')) {
            const cartItem = e.target.closest('.cart-item');
            const productId = cartItem.dataset.id;
            const quantityElement = cartItem.querySelector('.quantity');
            let quantity = parseInt(quantityElement.textContent);
            let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
            const itemIndex = cartItems.findIndex(item => item.id.toString() === productId);

            if (itemIndex !== -1) {
                if (e.target.classList.contains('increase')) {
                    cartItems[itemIndex].quantity++;
                    quantity++;
                } else if (e.target.classList.contains('decrease')) {
                    cartItems[itemIndex].quantity--;
                    quantity--;
                    if (quantity <= 0) {
                        cartItems.splice(itemIndex, 1);
                        cartItem.remove();
                    }
                } else if (e.target.classList.contains('remove-item-btn')) {
                    cartItems.splice(itemIndex, 1);
                    cartItem.remove();
                }

                if (cartItems.length === 0) {
                    container.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
                }

                localStorage.setItem('cartItems', JSON.stringify(cartItems));
                if (quantity > 0) {
                    quantityElement.textContent = quantity;
                }
                updateTotals();
                
                // Update cart count in header
                const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
                localStorage.setItem('cartCount', cartCount);
                const cartCountElement = document.querySelector('.cart-count');
                if (cartCountElement) {
                    cartCountElement.textContent = cartCount;
                }
            }
        }
    });

    // Add clear cart functionality
    const clearCartBtn = document.querySelector('.clear-cart-btn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            localStorage.setItem('cartItems', '[]');
            localStorage.setItem('cartCount', '0');
            const cartCountElement = document.querySelector('.cart-count');
            if (cartCountElement) {
                cartCountElement.textContent = '0';
            }
            container.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
            updateTotals();
        });
    }
    
    // Add event listener for the checkout button
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            // Create a thank you message container
            const messageContainer = document.createElement('div');
            messageContainer.className = 'thank-you-message';
            messageContainer.innerHTML = `
                <div class="message-content">
                    <h2>Thank You for Shopping with Us!</h2>
                    <p>Your order has been received and is being processed.</p>
                    <p>You will receive a confirmation email shortly.</p>
                </div>
            `;
            
            // Add the message to the page
            document.body.appendChild(messageContainer);
            
            // Clear the cart after successful checkout
            localStorage.setItem('cartItems', '[]');
            localStorage.setItem('cartCount', '0');
            
            // Remove the message after 3 seconds and redirect to home page
            setTimeout(() => {
                messageContainer.remove();
                window.location.href = 'index.html';
            }, 3000);
        });
    }
}


function renderCategoryProducts() {
    const container = document.querySelector('.products-grid');
    const categoryTitle = document.querySelector('#categoryTitle');
    if (!container) return;
    
    // Get category from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    if (category && categoryProducts[category]) {
        categoryTitle.textContent = category;
        container.innerHTML = categoryProducts[category].map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>$${product.price.toFixed(2)}</p>
                    <form action="../html/checkout.html" method="get">
                        <input type="hidden" name="product_id" value="${product.id}">
                        <input type="hidden" name="product_name" value="${product.name}">
                        <input type="hidden" name="product_price" value="${product.price}">
                        <button type="submit" class="add-to-cart">Add to Cart</button>
                    </form>
                </div>
            </div>
        `).join('');
    } else {
        container.innerHTML = '<p class="no-products">No products found for this category.</p>';
    }
}


function initializeSearch() {
    const searchBox = document.querySelector('.search-box input');
    const searchBtn = document.querySelector('.search-btn');

    function performSearch() {
        const searchTerm = searchBox.value.toLowerCase().trim();
        if (!searchTerm) return;

        // Collect all products from different sources
        const allProducts = [
            ...featuredProducts,
            ...newArrivals,
            ...saleProducts,
            ...Object.values(categoryProducts).flat()
        ];

        // Remove duplicates based on product ID
        const uniqueProducts = Array.from(new Map(allProducts.map(item => [item.id, item])).values());

        // Filter products based on search term
        const searchResults = uniqueProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.price.toString().includes(searchTerm)
        );

        // Clear existing content
        const container = document.querySelector('.products-grid') || document.querySelector('.products-container');
        if (!container) return;

        if (searchResults.length === 0) {
            container.innerHTML = '<div class="no-results">No products found matching your search.</div>';
            return;
        }

        // Render search results
        container.innerHTML = searchResults.map(product => `
            <div class="product-card">
                ${product.tag ? `<div class="sale-tag">${product.tag}</div>` : ''}
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    ${product.salePrice ? 
                        `<p class="original-price">$${product.price.toFixed(2)}</p>
                         <p class="sale-price">$${product.salePrice.toFixed(2)}</p>` :
                        `<p>$${product.price.toFixed(2)}</p>`
                    }
                    ${product.arrivalDate ? `<small>${product.arrivalDate}</small>` : ''}
                    <form action="../html/checkout.html" method="get">
                        <input type="hidden" name="product_id" value="${product.id}">
                        <input type="hidden" name="product_name" value="${product.name}">
                        <input type="hidden" name="product_price" value="${product.salePrice || product.price}">
                        <button type="submit" class="add-to-cart">Add to Cart</button>
                    </form>
                </div>
            </div>
        `).join('');
    }

    // Add event listeners
    searchBtn.addEventListener('click', performSearch);
    searchBox.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });
}

// Initialize search functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeSearch();
    // ... existing code ...
});
