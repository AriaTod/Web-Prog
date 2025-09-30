document.addEventListener("DOMContentLoaded", () => {
  const cartItemsContainer = document.querySelector(".cart-items");
  const totalElement = document.querySelector(".cart-summary span");
  const addToCartButtons = document.querySelectorAll(".product button");

  let cart = [];
  let total = 0;

  // Добавление товара
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const product = button.closest(".product");
      const title = product.querySelector(".product-title").textContent;
      const price = parseInt(product.querySelector(".product-price").textContent.replace(/\D/g, ""));

      // Проверка, есть ли товар в корзине
      const existingItem = cart.find(item => item.title === title);
      if (existingItem) {
        existingItem.quantity++;
      } else {
        cart.push({ title, price, quantity: 1 });
      }

      updateCart();
    });
  });

  // Функция для обновления корзины
  function updateCart() {
    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = "<p>Корзина пуста</p>";
      totalElement.textContent = "0 рублей";
      return;
    }

    cart.forEach((item, index) => {
      const div = document.createElement("div");
      div.classList.add("cart-item");

      div.innerHTML = `
        <span>${item.title} - ${item.price} руб. x ${item.quantity}</span>
        <div class="cart-controls">
          <button class="increase">+</button>
          <button class="decrease">-</button>
          <button class="remove">Удалить</button>
        </div>
      `;

      // Обработчики кнопок
      div.querySelector(".increase").addEventListener("click", () => {
        item.quantity++;
        updateCart();
      });

      div.querySelector(".decrease").addEventListener("click", () => {
        if (item.quantity > 1) {
          item.quantity--;
        } else {
          cart.splice(index, 1); // избавляемся, если стало 0
        }
        updateCart();
      });

      div.querySelector(".remove").addEventListener("click", () => {
        cart.splice(index, 1);
        updateCart();
      });

      cartItemsContainer.appendChild(div);
    });

    // Пересчёт суммы
    total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    totalElement.textContent = `${total} рублей`;
  }
});
