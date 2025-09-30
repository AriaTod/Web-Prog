document.addEventListener("DOMContentLoaded", () => {
  const cartItemsContainer = document.querySelector(".cart-items");
  const totalElement = document.querySelector(".cart-summary span");
  const addToCartButtons = document.querySelectorAll(".product button");
  const checkoutSection = document.getElementById("checkout");
  const checkoutButton = document.querySelector("#cart .cart-summary button");
  const checkoutForm = document.getElementById("checkout-form");
  const orderMessage = document.getElementById("order-message");
  const emptyCartMessage = document.getElementById("empty-cart-message");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  updateCart();

  // ---------- ДОБАВЛЕНИЕ ТОВАРА ----------
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const product = button.closest(".product");
      const title = product.querySelector(".product-title").textContent;
      const price = parseInt(product.querySelector(".product-price").textContent.replace(/\D/g, ""));
      const existingItem = cart.find(item => item.title === title);

      if (existingItem) {
        existingItem.quantity++;
      } else {
        cart.push({ title, price, quantity: 1 });
      }

      saveCart();
      updateCart();

      //Сообщение о пустой корзине после добавления товара
      emptyCartMessage.style.display = "none";
    });
  });

  // ----------------------------------------------------- СОХРАНЕНИЕ КОРЗИНЫ ----------------------------------------------------------
  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // ----------------------------------------------------- ОБНОВЛЕНИЕ КОРЗИНЫ ----------------------------------------------------------
  function updateCart() {
    cartItemsContainer.innerHTML = "";

    // Если корзина пустая
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = "<p>Корзина пуста</p>";
      totalElement.textContent = "0 рублей";
      return;
    }

    // Перебор товаров в корзине
    cart.forEach((item, index) => {
      // Создание нового div для одного товара
      const div = document.createElement("div");
      div.classList.add("cart-item");

      // Заполнение div с товаром
      div.innerHTML = `
        <span>${item.title} - ${item.price} руб. x ${item.quantity}</span>
        <div class="cart-controls">
          <button class="increase">+</button>
          <button class="decrease">-</button>
          <button class="remove">Удалить</button>
        </div>
      `;

      // КНОПКА "+" (увеличение количества)
      div.querySelector(".increase").addEventListener("click", () => {
        item.quantity++;
        saveCart();
        updateCart();
      });

      // КНОПКА "-" (уменьшение количества)
      div.querySelector(".decrease").addEventListener("click", () => {
        if (item.quantity > 1) {
          item.quantity--;
        } else {
          // Если количество 1 и нажали "-", удаляем товар
          cart.splice(index, 1);
        }
        saveCart();
        updateCart();
      });

      // КНОПКА "Удалить" (удаление товара полностью)
      div.querySelector(".remove").addEventListener("click", () => {
        cart.splice(index, 1);
        saveCart();
        updateCart();
      });

      // Добавление товара в корзину на страницу
      cartItemsContainer.appendChild(div);
    });

    // Подсчет итоговой суммы заказа
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    totalElement.textContent = `${total} рублей`;
  }

  // ---------------------------------------------------- РАБОТА С ФОРМОЙ -------------------------------------------------------------
  // Обработчик кнопки "Оформить заказ"
  checkoutButton.addEventListener("click", () => {
    if (cart.length === 0) {
      // Корзина пуста ->  показываем сообщение
      emptyCartMessage.style.display = "block";
      checkoutSection.hidden = true; // форма точно не открывается
      return;
    }

    // Если товары есть -> скрываем сообщение и открываем форму
    emptyCartMessage.style.display = "none";
    checkoutSection.hidden = false;
    checkoutSection.scrollIntoView({ behavior: "smooth" });
  });

  // --------------------------------------------------- ОТПРАВКА ФОРМЫ ----------------------------------------------------------------
  checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault(); // отключаем перезагрузку страницы

    // Форма остаётся на экране, сообщение о заказе показывается
    checkoutForm.hidden = false;
    orderMessage.hidden = false;

    // Очистить корзину
    cartItem = [];
    updateCart();
  });
});
