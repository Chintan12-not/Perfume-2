let cart = JSON.parse(localStorage.getItem('empire_cart')) || [];

window.onload = () => {
    updateCartUI();
    if (window.location.pathname.includes('checkout.html')) {
        renderCheckout();
    }
};

// === SCROLL REVEAL ===
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('reveal-active');
    });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal-hidden').forEach(el => observer.observe(el));

// === CART SYSTEM ===
function addToCart(name, price) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ name, price, qty: 1 });
    }
    saveCart();
    updateCartUI();
    toggleCart(true); 
    toast(`${name} added to cart`);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
    if (window.location.pathname.includes('checkout.html')) renderCheckout();
}

function saveCart() {
    localStorage.setItem('empire_cart', JSON.stringify(cart));
}

function updateCartUI() {
    const container = document.getElementById('cartItemsContainer');
    const totalLabel = document.getElementById('cartTotalValue');
    const countLabel = document.getElementById('cartCount');
    if (!container) return;

    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    countLabel.innerText = totalQty;

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#666;">Your selection is empty.</p>';
        if(totalLabel) totalLabel.innerText = '₹0';
        return;
    }

    container.innerHTML = cart.map((item, index) => `
        <div style="display:flex; justify-content:space-between; margin-bottom:15px; align-items:center;">
            <div><strong>${item.name}</strong><br><small>₹${item.price.toLocaleString()} x ${item.qty}</small></div>
            <button onclick="removeFromCart(${index})" style="color:red; background:none; border:none; cursor:pointer;">✕</button>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    if(totalLabel) totalLabel.innerText = `₹${total.toLocaleString()}`;
}

function renderCheckout() {
    const container = document.getElementById('checkoutItems');
    const totalLabel = document.getElementById('finalTotal');
    const orderBtn = document.querySelector('.checkout-form-container button');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = "<p>Your cart is empty.</p>";
        if(orderBtn) orderBtn.disabled = true;
        return;
    }

    if(orderBtn) orderBtn.disabled = false;
    container.innerHTML = cart.map(item => `
        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
            <span>${item.name} (x${item.qty})</span>
            <span>₹${(item.price * item.qty).toLocaleString()}</span>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    if(totalLabel) totalLabel.innerText = `₹${total.toLocaleString()}`;
}

function submitContact(e) {
    e.preventDefault();
    toast("Inquiry sent to Concierge.");
    e.target.reset();
}

function toggleMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
}

function toggleCart(forceOpen = false) {
    const sidebar = document.getElementById('cartSidebar');
    if (forceOpen) sidebar.classList.add('active');
    else sidebar.classList.toggle('active');
}

function toast(msg) {
    const t = document.createElement('div');
    t.innerText = msg;
    Object.assign(t.style, {
        position: 'fixed', bottom: '40px', right: '20px', background: 'var(--gold-main)',
        color: 'black', padding: '12px 20px', borderRadius: '5px', zIndex: '2000', fontWeight: 'bold'
    });
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
}