document.addEventListener("DOMContentLoaded", () => {
  const display = document.querySelector(".display");
  const history = document.querySelector(".history");
  const buttons = document.querySelectorAll(".button");
  const themeToggle = document.querySelector(".theme-toggle");
  const themeIcon = document.querySelector(".theme-icon");

  let expression = "";
  let justCalculated = false;

  const symbols = {
    "*": "*",
    "÷": "/",
    "-": "-",
    "%": "/100",
  };

  function calculate(input) {
    if (!/^[-+*/().%0-9\s]+$/.test(input)) {
      throw new Error("Invalid characters");
    }

    let normalized = input
      .replace(/\*/g, "*")
      .replace(/÷/g, "/")
      .replace(/-/g, "-")
      .replace(/%/g, "/100");

    normalized = normalized.replace(/(\d+(?:\.\d+)?)\/100\/100/g, "$1/10000");

    if (/\/0(?!\d)/.test(normalized)) {
      throw new Error("Cannot divide by zero");
    }

    const value = Function(`"use strict"; return (${normalized})`)();
    if (!Number.isFinite(value)) {
      throw new Error("Invalid result");
    }

    return Math.round((value + Number.EPSILON) * 1e12) / 1e12;
  }

  function showDisplay(value) {
    display.textContent = value || "0";
  }

  function formatExpression(value) {
    return value
      .replace(/\*/g, "*")
      .replace(/\//g, "÷")
      .replace(/-/g, "-")
      .replace(/\/100/g, "%");
  }

  function pressValue(value) {
    if (value === "AC") {
      expression = "";
      justCalculated = false;
      history.textContent = "";
      showDisplay("0");
      return;
    }

    if (value === "DEL") {
      expression = expression.slice(0, -1);
      justCalculated = false;
      showDisplay(formatExpression(expression));
      return;
    }

    if (value === "=") {
      if (!expression) return;

      try {
        const result = calculate(expression);
        history.textContent = `${formatExpression(expression)} =`;
        expression = String(result);
        showDisplay(formatExpression(expression));
        justCalculated = true;
      } catch {
        history.textContent = "";
        showDisplay("Error");
        expression = "";
        justCalculated = false;
      }
      return;
    }

    const operator = ["+", "-", "*", "/", "%"].includes(value);

    if (justCalculated && !operator) {
      expression = "";
      history.textContent = "";
    }

    if (justCalculated && operator) {
      justCalculated = false;
    }

    if (operator && (!expression || /[+\-*\/]$/.test(expression))) {
      if (value !== "-" || expression) return;
    }

    expression += symbols[value] || value;
    showDisplay(formatExpression(expression));
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      button.classList.add("clicked");
      window.setTimeout(() => button.classList.remove("clicked"), 100);
      pressValue(button.textContent.trim());
    });
  });

  const savedTheme = localStorage.getItem("calculator-theme");
  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
    themeIcon.textContent = "☾";
  }

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    const isLight = document.body.classList.contains("light-mode");
    themeIcon.textContent = isLight ? "☾" : "☀";
    localStorage.setItem("calculator-theme", isLight ? "light" : "dark");
  });

  document.addEventListener("keydown", (event) => {
    const keyMap = {
      "*": "*",
      "/": "÷",
      "-": "-",
      Enter: "=",
      Escape: "AC",
      Backspace: "DEL",
    };

    const value = keyMap[event.key] || event.key;
    if (
      /^[0-9.+%]+$/.test(value) ||
      ["=", "AC", "DEL", "*", "÷", "-", "%"].includes(value)
    ) {
      event.preventEvent?.();
      event.preventDefault();
      pressValue(value);
    }
  });
});
