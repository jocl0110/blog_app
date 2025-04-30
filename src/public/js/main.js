// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("Blog app initialized");

  // Add any interactive functionality here
  const buttons = document.querySelectorAll(".btn");

  buttons.forEach((button) => {
    button.addEventListener("click", (e) => {
      console.log("Button clicked:", e.target.textContent);
    });
  });
});
