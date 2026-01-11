// ==================================================
// 1. INITIALIZATION & GLOBAL DATA
// ==================================================

const SUPABASE_URL = "https://wolxccbehsbafyirgvgp.supabase.co";
const SUPABASE_KEY = "sb_publishable_1NCRxQCEEOEnr0jJ6H-ASg_JQxgdr3L";

// Supabase (AUTH ONLY – SAFE)
const supabaseClient = window.supabase
    ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

let cart = JSON.parse(localStorage.getItem("empire_cart")) || [];
let currentUser = null;

// ==================================================
// 2. LOCAL PRODUCT DATABASE (NO SUPABASE)
// ==================================================

const productDatabase = {
    whisky: {
        id: "whisky",
        name: "Smoked Whisky",
        price: 850,
        originalPrice: 2800,
        img: "images/Smoked Whisky.jpg",
        tagline: "Warm • Smoky • Boozy • Luxurious • Powerful",
        description: `
Smoked Whisky is deep, bold, and intoxicating.
It opens with a warm smoky accord, like oak barrels kissed by fire, instantly giving a dark and mysterious character.

The heart is rich and smooth, blending aged whiskey notes with subtle sweetness, creating a luxurious and addictive warmth.
As it settles, hints of amber, soft woods, and gentle spice linger on the skin, leaving a powerful, masculine, and premium trail.

<b>Overall Feel:</b><br>
Warm • Smoky • Boozy • Luxurious • Powerful
        `,
        top: "Smoked Oak • Whiskey Accord • Light Spicy Pepper",
        heart: "Charred Wood • Caramelized Amber • Toasted Vanilla",
        base: "Dark Amber • Leather • Dry Woods • Soft Musk"
    },

    ocean: {
        id: "ocean",
        name: "Ocean Aura",
        price: 850,
        originalPrice: 2800,
        img: "images/Ocean Aura.jpg",
        tagline: "Fresh • Aquatic • Clean • Elegant • Premium",
        description: `
Ocean Aura is fresh, clean, and effortlessly luxurious.
It opens like a cool ocean breeze at dawn — crisp, airy, and energizing.

The fragrance carries the purity of deep blue waters blended with modern elegance.
Soft aquatic florals and mineral notes add sophistication without sweetness.
The dry-down is smooth, musky, and slightly woody, leaving a long-lasting, clean trail.

<b>Overall Feel:</b><br>
Fresh • Aquatic • Clean • Elegant • Premium
        `,
        top: "Marine Accord • Bergamot • Lemon Zest",
        heart: "Sea Salt • Water Lily • Lavender",
        base: "White Musk • Driftwood • Ambergris"
    },

    blush: {
        id: "blush",
        name: "Blush ELIXIR",
        price: 850,
        originalPrice: 2800,
        img: "images/Blush ELIXIR.jpg",
        tagline: "Soft • Floral • Elegant • Feminine • Luxurious",
        description: `
Blush Elixir is soft, sensual, and irresistibly elegant.
It opens with a delicate burst of fresh fruits and gentle florals, creating a graceful and luminous first impression.

The heart blooms with romantic petals and creamy sweetness, giving a refined feminine charm.
As it settles, warm musks and smooth woods wrap the fragrance in a subtle, addictive softness.

<b>Overall Feel:</b><br>
Soft • Floral • Elegant • Feminine • Luxurious
        `,
        top: "Pink Berries • Lychee • Mandarin Blossom",
        heart: "Rose Petals • Peony • Jasmine",
        base: "White Musk • Vanilla • Sandalwood"
    }
};

// ==================================================
// 3. PAGE LOAD HANDLER (PRODUCT SAFE)
// ==================================================

window.addEventListener("DOMContentLoaded", () => {

    const productContainer = document.getElementById("productDetailContainer");
    if (productContainer) {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get("id");

        if (productId) {
            renderProductDetail(productId);
        } else {
            productContainer.innerHTML = `
                <p style="color:#d4af37; text-align:center; letter-spacing:2px;">
                    PRODUCT NOT FOUND
                </p>
            `;
        }
    }

    if (supabaseClient) {
        checkAuth();
    }

    updateCartUI();
    initScrollReveal();
    setupWhatsApp();
});

// ==================================================
// 4. NAVIGATION & SEARCH
// ==================================================

function viewProduct(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

function toggleMenu() {
    const menu = document.getElementById("mobileMenu");
    if (menu) menu.classList.toggle("active");
}

document.addEventListener("input", (e) => {
    if (e.target.id !== "searchInput") return;
    const term = e.target.value.toLowerCase();

    document.querySelectorAll(".product-card").forEach(card => {
        const name = card.querySelector(".product-name")?.innerText.toLowerCase() || "";
        card.style.display = name.includes(term) ? "block" : "none";
    });
});

// ==================================================
// 5. AUTHENTICATION (SUPABASE ONLY)
// ==================================================

if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange((_event, session) => {
        currentUser = session?.user || null;
        updateAuthUI();
    });
}

async function checkAuth() {
    if (!supabaseClient) return;
    const { data } = await supabaseClient.auth.getUser();
    currentUser = data.user;
    updateAuthUI();
}

function updateAuthUI() {
    const btn = document.getElementById("authBtn");
    if (!btn) return;

    if (currentUser) {
        const name =
            currentUser.user_metadata?.full_name ||
            currentUser.email.split("@")[0];

        btn.innerText = `Hi, ${name}`;
        btn.onclick = logout;
    } else {
        btn.innerText = "Login";
        btn.onclick = openAuth;
    }
}

function openAuth() {
    document.getElementById("authModal")?.classList.add("active");
}

function closeAuth() {
    document.getElementById("authModal")?.classList.remove("active");
}

async function signUp() {
    if (!supabaseClient) return alert("Auth unavailable");

    const email = document.getElementById("authEmail").value;
    const password = document.getElementById("authPassword").value;

    const { error } = await supabaseClient.auth.signUp({ email, password });
    if (error) return alert(error.message);

    alert("Signup successful! Please verify your email.");
}

async function signIn() {
    if (!supabaseClient) return alert("Auth unavailable");

    const email = document.getElementById("authEmail").value;
    const password = document.getElementById("authPassword").value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) return alert(error.message);

    currentUser = data.user;
    closeAuth();
    updateAuthUI();
}

async function googleLogin() {
    if (!supabaseClient) return;

    await supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: window.location.origin
        }
    });
}

async function logout() {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
    currentUser = null;
    updateAuthUI();
}

// ==================================================
// 6. CART SYSTEM (UNCHANGED)
// ==================================================

function saveCart() {
    localStorage.setItem("empire_cart", JSON.stringify(cart));
}

function addToCart(name, price, qty = 1) {
    const item = cart.find(i => i.name === name);
    if (item) item.qty += qty;
    else cart.push({ name, price, qty });

    saveCart();
    updateCartUI();
    toggleCart(true);
}

function updateCartUI() {
    const count = document.getElementById("cartCount");
    if (count) count.innerText = cart.reduce((s, i) => s + i.qty, 0);

    const container = document.getElementById("cartItemsContainer");
    const totalEl = document.getElementById("cartTotalValue");
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `<p class="empty-msg">Your selection is empty.</p>`;
        if (totalEl) totalEl.innerText = "₹0";
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <span>${item.name} × ${item.qty}</span>
            <strong>₹${(item.price * item.qty).toLocaleString()}</strong>
        </div>
    `).join("");

    if (totalEl) {
        totalEl.innerText =
            "₹" + cart.reduce((s, i) => s + i.price * i.qty, 0).toLocaleString();
    }
}

function toggleCart(force) {
    const el = document.getElementById("cartSidebar");
    if (!el) return;

    if (force === true) el.classList.add("active");
    else if (force === false) el.classList.remove("active");
    else el.classList.toggle("active");
}

// ==================================================
// 7. PRODUCT DETAIL (UNCHANGED STRUCTURE)
// ==================================================

function renderProductDetail(productId) {
    const product = productDatabase[productId];
    const container = document.getElementById("productDetailContainer");
    if (!product || !container) return;

    container.innerHTML = `
        <div class="luxury-detail-grid">
            <div class="luxury-image">
                <img src="${product.img}" alt="${product.name}">
            </div>

            <div class="luxury-info">
                <h1 class="luxury-title">${product.name}</h1>
                <p class="luxury-tagline">${product.tagline}</p>
                <div class="luxury-price">₹${product.price}</div>

                <p class="luxury-desc">${product.description}</p>

                <div class="luxury-notes">
                    <h3>FRAGRANCE NOTES</h3>
                    <div class="notes-row">
                        <div><strong>Top</strong>${product.top}</div>
                        <div><strong>Heart</strong>${product.heart}</div>
                        <div><strong>Base</strong>${product.base}</div>
                    </div>
                </div>

                <div class="luxury-actions">
                    <button class="btn ghost" onclick="updateDetailQty(-1)">−</button>
                    <span id="detailQty">1</span>
                    <button class="btn ghost" onclick="updateDetailQty(1)">+</button>
                    <button class="btn primary"
                        onclick="addToCart('${product.name}', ${product.price}, parseInt(detailQty.innerText))">
                        ADD TO CART
                    </button>
                </div>
            </div>
        </div>
    `;
}

function updateDetailQty(change) {
    const el = document.getElementById("detailQty");
    if (!el) return;
    el.innerText = Math.max(1, parseInt(el.innerText) + change);
}

// ==================================================
// 8. UTILITIES
// ==================================================

function initScrollReveal() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => e.isIntersecting && e.target.classList.add("reveal-active"));
    });
    document.querySelectorAll(".reveal-hidden").forEach(el => observer.observe(el));
}

function setupWhatsApp() {
    const wa = document.querySelector(".whatsapp-float");
    if (wa) wa.href = "https://wa.me/919911261347";
}
