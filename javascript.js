const products = [
  { id: 1, name: "Amatista", category: "Protección", price: 29 },
  { id: 2, name: "Cuarzo Rosa", category: "Amor", price: 24 },
  { id: 3, name: "Citrino", category: "Abundancia", price: 32 },
  { id: 4, name: "Lapislázuli", category: "Intuición", price: 39 },
  { id: 5, name: "Selenita", category: "Limpieza", price: 18 },
  { id: 6, name: "Obsidiana", category: "Protección", price: 22 }
];

const state = {
  search: "",
  category: "all",
  sort: "default",
  cart: JSON.parse(localStorage.getItem("lunara-cart") || "[]")
};

const elements = {
  productsGrid: document.getElementById("productsGrid"),
  searchInput: document.getElementById("searchInput"),
  categoryFilter: document.getElementById("categoryFilter"),
  sortSelect: document.getElementById("sortSelect"),
  cartList: document.getElementById("cartList"),
  cartTotal: document.getElementById("cartTotal"),
  openCartBtn: document.getElementById("openCartBtn"),
  closeCartBtn: document.getElementById("closeCartBtn"),
  cartPanel: document.getElementById("cartPanel"),
  clearCartBtn: document.getElementById("clearCartBtn"),
  toast: document.getElementById("toast")
};

function getVisibleProducts() {
  const filtered = products.filter((product) => {
    const searchMatch = product.name.toLowerCase().includes(state.search.toLowerCase());
    const categoryMatch = state.category === "all" || product.category === state.category;
    return searchMatch && categoryMatch;
  });

  const sorted = [...filtered];
  if (state.sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
  if (state.sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
  if (state.sort === "name-asc") sorted.sort((a, b) => a.name.localeCompare(b.name));

  return sorted;
}

function renderProducts() {
  const visibleProducts = getVisibleProducts();

  if (visibleProducts.length === 0) {
    elements.productsGrid.innerHTML = "<p>No hay productos para este filtro.</p>";
    return;
  }

  elements.productsGrid.innerHTML = visibleProducts
    .map(
      (product) => `
      <article class="product-card">
        <h3>${product.name}</h3>
        <span class="tag">${product.category}</span>
        <p class="price">$${product.price}</p>
        <button type="button" data-add-id="${product.id}">Agregar al carrito</button>
      </article>
    `
    )
    .join("");
}

function renderCategoryOptions() {
  const categories = ["all", ...new Set(products.map((product) => product.category))];
  elements.categoryFilter.innerHTML = categories
    .map(
      (category) =>
        `<option value="${category}">${category === "all" ? "Todas las categorías" : category}</option>`
    )
    .join("");
}

function findCartItem(productId) {
  return state.cart.find((item) => item.id === productId);
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  const existingItem = findCartItem(productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    state.cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
  }

  persistCart();
  renderCart();
  showToast(`${product.name} agregado al carrito`);
}

function updateCartQuantity(productId, delta) {
  const item = findCartItem(productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    state.cart = state.cart.filter((entry) => entry.id !== productId);
  }

  persistCart();
  renderCart();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter((entry) => entry.id !== productId);
  persistCart();
  renderCart();
}

function persistCart() {
  localStorage.setItem("lunara-cart", JSON.stringify(state.cart));
}

function calculateTotal() {
  return state.cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
}

function calculateTotalItems() {
  return state.cart.reduce((acc, item) => acc + item.quantity, 0);
}

function renderCart() {
  if (state.cart.length === 0) {
    elements.cartList.innerHTML = '<p class="cart-empty">Tu carrito está vacío.</p>';
  } else {
    elements.cartList.innerHTML = state.cart
      .map(
        (item) => `
      <article class="cart-item">
        <div class="cart-item-head">
          <strong>${item.name}</strong>
          <span>$${item.price * item.quantity}</span>
        </div>
        <div class="quantity-control">
          <button type="button" data-qty-id="${item.id}" data-delta="-1">-</button>
          <span>${item.quantity}</span>
          <button type="button" data-qty-id="${item.id}" data-delta="1">+</button>
        </div>
        <button type="button" class="remove-btn" data-remove-id="${item.id}">Eliminar</button>
      </article>
      `
      )
      .join("");
  }

  const total = calculateTotal();
  const totalItems = calculateTotalItems();
  elements.cartTotal.textContent = String(total);
  elements.openCartBtn.textContent = `🛒 ${totalItems} items · $${total}`;
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 1500);
}

function bindEvents() {
  elements.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value;
    renderProducts();
  });

  elements.categoryFilter.addEventListener("change", (event) => {
    state.category = event.target.value;
    renderProducts();
  });

  elements.sortSelect.addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderProducts();
  });

  elements.productsGrid.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-id]");
    if (!addButton) return;
    addToCart(Number(addButton.dataset.addId));
  });

  elements.cartList.addEventListener("click", (event) => {
    const quantityButton = event.target.closest("[data-qty-id]");
    if (quantityButton) {
      updateCartQuantity(Number(quantityButton.dataset.qtyId), Number(quantityButton.dataset.delta));
      return;
    }

    const removeButton = event.target.closest("[data-remove-id]");
    if (removeButton) {
      removeFromCart(Number(removeButton.dataset.removeId));
    }
  });

  elements.openCartBtn.addEventListener("click", () => {
    elements.cartPanel.classList.add("active");
  });

  elements.closeCartBtn.addEventListener("click", () => {
    elements.cartPanel.classList.remove("active");
  });

  elements.clearCartBtn.addEventListener("click", () => {
    state.cart = [];
    persistCart();
    renderCart();
    showToast("Carrito vaciado");
  });
}

function init() {
  renderCategoryOptions();
  bindEvents();
  renderProducts();
  renderCart();
}

init();
