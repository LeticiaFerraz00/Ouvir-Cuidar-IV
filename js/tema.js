// Seleciona os botões de alternância
const themeToggle = document.getElementById("toggle-theme");
const contrastToggle = document.getElementById("toggle-contrast");

// Carrega preferências salvas (se existirem)
const savedTheme = localStorage.getItem("theme");
const savedContrast = localStorage.getItem("highContrast");

// Aplica o tema salvo
if (savedTheme) document.body.setAttribute("data-theme", savedTheme);
if (savedContrast === "true") document.body.classList.add("high-contrast");

// Alternar entre claro e escuro
themeToggle.addEventListener("click", () => {
  const currentTheme = document.body.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  
  document.body.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);

  // Animação de leve feedback visual
  themeToggle.classList.add("pulse");
  setTimeout(() => themeToggle.classList.remove("pulse"), 300);
});

// Alternar alto contraste
contrastToggle.addEventListener("click", () => {
  document.body.classList.toggle("high-contrast");
  const isHighContrast = document.body.classList.contains("high-contrast");
  localStorage.setItem("highContrast", isHighContrast);
});
