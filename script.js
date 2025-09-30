document.addEventListener("DOMContentLoaded", () => {
  const cartItemsContainer = document.querySelector(".cart-items");
  const totalElement = document.querySelector(".cart-summary span");
  const addToCartButtons = document.querySelectorAll(".product button");

  let cart = [];
  let total = 0;

  addToCartButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      const product = button.closest(".product");
      const title = product.querySelector(".product-title").textContent;
      const price = parseInt(product.querySelector(".product-price").textContent.replace(/\D/g, ""));

      // Добавление товара в корзину
      cart.push({ title, price });
      total += price;

      // Обновление отображения корзины
      renderCart();
    });
  });

  function renderCart() {
    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = "<p>Корзина пуста</p>";
    } else {
      cart.forEach(item => {
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.textContent = `${item.title} - ${item.price} руб.`;
        cartItemsContainer.appendChild(div);
      });
    }

    totalElement.textContent = `${total} рублей`;
  }
});
