// === 1. INITIALIZATION & DATA ===
let cart = JSON.parse(localStorage.getItem('empire_cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('empire_user')) || null;

const productDatabase = {
    'blush': {
        id: 'blush',
        name: "Blush ELIXIR",
        price: 850,
        originalPrice: 2800,
        img: 'images/Blush ELIXIR.jpg',
        tagline: "Soft • Floral • Elegant • Feminine • Luxurious",
        description: "Blush Elixir is soft, sensual, and irresistibly elegant. It opens with a delicate burst of fresh fruits and gentle florals, creating a graceful and luminous first impression. The heart blooms with romantic petals and creamy sweetness, giving a refined feminine charm that feels modern and luxurious.",
        details: "Blush Elixir is romantic yet confident, sweet but never overpowering — made for moments when elegance, charm, and quiet luxury define your presence.",
        top: "Pink Berries, Lychee, Mandarin Blossom",
        heart: "Rose Petals, Peony, Jasmine",
        base: "White Musk, Vanilla, Sandalwood",
        tags: ['floral', 'sweet', 'feminine', 'elegant']
    },
    'whisky': {
        id: 'whisky',
        name: "Smoked Whisky",
        price: 850,
        originalPrice: 2800,
        img: 'images/Smoked Whisky.jpg',
        tagline: "Warm • Smoky • Boozy • Luxurious • Powerful",
        description: "Smoked Whiskey is deep, bold, and intoxicating. It opens with a warm smoky accord, like oak barrels kissed by fire, instantly giving a dark and mysterious character. The heart is rich and smooth, blending aged whiskey notes with subtle sweetness, creating a luxurious and addictive warmth.",
        details: "This fragrance feels royal, confident, and intense — made for evenings, power moves, and statement moments.",
        top: "Smoked Oak, Whiskey Accord, Light Spicy Pepper",
        heart: "Charred Wood, Caramelized Amber, Toasted Vanilla",
        base: "Dark Amber, Leather, Dry Woods, Soft Musk",
        tags: ['bold', 'smoky', 'masculine', 'intense'],
        bestseller: true
    },
    'ocean': {
        id: 'ocean',
        name: "Ocean Aura",
        price: 850,
        originalPrice: 2800,
        img: 'images/Ocean Aura.jpg',
        tagline: "Fresh • Aquatic • Clean • Elegant • Premium",
        description: "Ocean Aura is fresh, clean, and effortlessly luxurious. It opens like a cool ocean breeze at dawn — crisp, airy, and energizing. The fragrance carries the purity of deep blue waters blended with modern elegance, giving a calm yet confident presence.",
        details: "Ocean Aura is fresh but not basic, cool yet commanding — perfect for daily wear, summer days, and moments where quiet confidence speaks louder than noise.",
        top: "Marine Accord, Bergamot, Lemon Zest",
        heart: "Sea Salt, Water Lily, Lavender",
        base: "White Musk, Driftwood, Ambergris",
        tags: ['fresh', 'aquatic', 'clean', 'modern']
    }
};

window.onload = () => {
    updateCartUI();
    checkUser();
    updateNavAuth(); 
    
    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (path.includes('checkout.html')) renderCheckout();
    if (path.includes('product-detail.html') && productId) {
        renderProductDetail(productId);
    }
    
    initScrollReveal();
    
    if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
        initSearch();
    }
};

// === 2. AUTHENTICATION ===
function updateNavAuth() {
    // Placeholder for future logic (e.g., showing 'Logout' if user exists)
}

function checkUser() {
    currentUser = JSON.parse(localStorage.getItem('empire_user'));
    return currentUser;
}

// === 3. CART SYSTEM ===
function saveCart() { 
    localStorage.setItem('empire_cart', JSON.stringify(cart)); 
}

function addToCart(name, price, qty = 1) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({ name, price, qty });
    }
    
    saveCart();
    updateCartUI();
    toggleCart(true);
    toast(`${qty}x ${name} added to selection`);
}

function updateCartUI() {
    const countLabel = document.getElementById('cartCount');
    if (countLabel) {
        const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
        countLabel.innerText = totalQty;
        countLabel.style.display = totalQty > 0 ? 'inline' : 'none';
    }
    
    const container = document.getElementById('cartItemsContainer');
    const totalLabel = document.getElementById('cartTotalValue');
    const checkoutBtn = document.querySelector('.cart-sidebar-footer .btn.primary');
    
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-msg">Your selection is empty.</p>';
        if (totalLabel) totalLabel.innerText = '₹0';
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }
    
    if (checkoutBtn) checkoutBtn.disabled = false;
    
    container.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₹${item.price.toLocaleString()}</div>
            </div>
            <div class="cart-item-controls">
                <button onclick="updateCartItem(${index}, ${item.qty - 1})" ${item.qty <= 1 ? 'disabled' : ''}>−</button>
                <span>${item.qty}</span>
                <button onclick="updateCartItem(${index}, ${item.qty + 1})">+</button>
                <button class="cart-remove-btn" onclick="removeFromCart(${index})">✕</button>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    if (totalLabel) totalLabel.innerText = `₹${total.toLocaleString()}`;
}

function updateCartItem(index, newQty) {
    if (newQty < 1) {
        removeFromCart(index);
        return;
    }
    cart[index].qty = newQty;
    saveCart();
    updateCartUI();
}

function removeFromCart(index) {
    const itemName = cart[index].name;
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
    toast(`${itemName} removed from selection`);
}

// === 4. PRODUCT RENDERING ===
function viewProduct(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

function renderProductDetail(productId) {
    const container = document.getElementById('productDetailContainer');
    if (!container) return;
    
    const product = productDatabase[productId];
    if (!product) {
        container.innerHTML = '<p>Product not found</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="product-detail-images">
            <img src="${product.img}" alt="${product.name}" class="product-main-image">
        </div>
        <div class="product-detail-info">
            <h1 class="product-detail-title">${product.name}</h1>
            <div class="product-tagline">${product.tagline}</div>
            <div class="product-detail-price">
                <span class="old-price">₹${product.originalPrice.toLocaleString()}</span>
                <span class="new-price">₹${product.price.toLocaleString()}</span>
            </div>
            <div class="product-description">
                <p>${product.description}</p>
                <p>${product.details}</p>
            </div>
            <div class="scent-notes-detail">
                <h3>Fragrance Notes</h3>
                <div class="notes-grid">
                    <div class="note-card"><h4>Top</h4><p>${product.top}</p></div>
                    <div class="note-card"><h4>Heart</h4><p>${product.heart}</p></div>
                    <div class="note-card"><h4>Base</h4><p>${product.base}</p></div>
                </div>
            </div>
            <div class="product-actions">
                <div class="quantity-selector">
                    <button onclick="updateDetailQty(-1)">−</button>
                    <span id="detailQty">1</span>
                    <button onclick="updateDetailQty(1)">+</button>
                </div>
                <button class="btn primary" onclick="addToCart('${product.name}', ${product.price}, parseInt(document.getElementById('detailQty').innerText))">
                    Add to Selection
                </button>
            </div>
        </div>`;
}

function updateDetailQty(change) {
    const qtyElement = document.getElementById('detailQty');
    if (!qtyElement) return;
    let qty = parseInt(qtyElement.innerText);
    qty = Math.max(1, qty + change);
    qtyElement.innerText = qty;
}

// === 5. SEARCH & NAVIGATION ===
function initSearch() {
    const navRight = document.querySelector('.nav-right');
    if (navRight && !document.querySelector('.search-container')) {
        const searchHTML = `
            <div class="search-container">
                <input type="text" id="searchInput" placeholder="Search fragrances...">
                <button class="search-btn" onclick="performSearch()">
                    <i class="fa fa-search"></i>
                </button>
            </div>`;
        navRight.insertAdjacentHTML('afterbegin', searchHTML);
        document.getElementById('searchInput').addEventListener('input', (e) => {
            performSearch(e.target.value);
        });
    }
}

function performSearch(query = '') {
    const term = query.toLowerCase();
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const id = card.dataset.id;
        const product = productDatabase[id];
        
        const searchableText = [
            product?.name || card.querySelector('h3')?.textContent,
            product?.tagline || "",
            ...(product?.tags || [])
        ].join(' ').toLowerCase();

        card.style.display = searchableText.includes(term) ? 'block' : 'none';
    });
}

// === 6. WHATSAPP & CONTACT ===
function submitOrder(event) {
    event.preventDefault();
    if (cart.length === 0) return toast("Selection is empty");

    let message = `🛍️ *NEW ORDER - E'MPIRE*\n\n`;
    cart.forEach(item => {
        message += `• ${item.name} x${item.qty} = ₹${(item.price * item.qty).toLocaleString()}\n`;
    });

    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    message += `\n💰 *Total: ₹${total.toLocaleString()}*\n`;
    message += `\n📍 Please confirm availability & delivery details.`;

    window.open(`https://wa.me/919911261347?text=${encodeURIComponent(message)}`, '_blank');

    cart = [];
    saveCart();
    updateCartUI();
    toast("Order sent via WhatsApp!");
}

function submitContact(event) {
    event.preventDefault();
    const name = event.target.querySelector('input[type="text"]').value;
    const email = event.target.querySelector('input[type="email"]').value;
    const message = event.target.querySelector('textarea').value;
    const whatsappMessage = `📩 *New Enquiry*\n\n👤 Name: ${name}\n📧 Email: ${email}\n💬 Message: ${message}`;
    window.open(`https://wa.me/919911261347?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
    event.target.reset();
}

// === 7. UTILS ===
function toggleCart(open) {
    const sidebar = document.getElementById('cartSidebar');
    if (!sidebar) return;
    if (open === true) sidebar.classList.add('active');
    else if (open === false) sidebar.classList.remove('active');
    else sidebar.classList.toggle('active');
}

function toggleMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) menu.classList.toggle('active');
}

function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('reveal-active');
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal-hidden').forEach(el => observer.observe(el));
}

function toast(msg) {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerText = msg;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => {
        t.classList.remove('show');
        setTimeout(() => t.remove(), 300);
    }, 3000);
}
