const pages = [...document.querySelectorAll(".page")];
const navLinks = [...document.querySelectorAll(".nav-link")];
const nav = document.querySelector(".main-nav");
const menuToggle = document.querySelector(".menu-toggle");

function showPage() {
  const id = (location.hash || "#home").slice(1);
  const target = document.getElementById(id);
  pages.forEach(page => page.classList.toggle("active", page === target));
  navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${id}`));
  nav.classList.remove("open");
  window.scrollTo({top: 0, behavior: "smooth"});
}

window.addEventListener("hashchange", showPage);
window.addEventListener("DOMContentLoaded", showPage);
menuToggle.addEventListener("click", () => nav.classList.toggle("open"));

let cartCount = 0;
const cartStatus = document.getElementById("cart-status");
const toast = document.getElementById("toast");
function notify(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
}
document.querySelectorAll(".add-btn").forEach(button => {
  button.addEventListener("click", () => {
    cartCount++;
    cartStatus.textContent = `${cartCount} item${cartCount === 1 ? "" : "s"} added to your basket. Checkout and payment will be added in a later development stage.`;
    notify(`${button.dataset.product} added to your basket`);
  });
});

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    const selected = button.dataset.filter;
    document.querySelectorAll(".product-card").forEach(card => {
      card.hidden = selected !== "All" && card.dataset.type !== selected;
    });
  });
});
document.getElementById("product-search").addEventListener("input", event => {
  const term = event.target.value.toLowerCase().trim();
  document.querySelectorAll(".product-card").forEach(card => {
    card.hidden = !card.dataset.name.includes(term);
  });
});
document.getElementById("login-btn").addEventListener("click", () => notify("Login will be connected in the next development stage."));
document.getElementById("signup-btn").addEventListener("click", () => notify("Registration will be connected in the next development stage."));


