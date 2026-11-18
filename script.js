const expressionEl = document.querySelector("#expression");
const resultEl = document.querySelector("#result");
const statusEl = document.querySelector("#status");
const copyButton = document.querySelector("#copy");

let current = "0";
let previous = null;
let operator = null;
let replaceCurrent = false;
let justCalculated = false;

const format = (value) => {
  if (!Number.isFinite(value)) return "Erro";
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 10 }).format(value);
};

function render() {
  expressionEl.textContent = previous !== null && operator
    ? `${format(previous)} ${operator}`
    : (justCalculated ? expressionEl.textContent : "");
  resultEl.textContent = current;
}

function enterDigit(digit) {
  if (replaceCurrent || justCalculated) {
    current = digit;
    replaceCurrent = false;
    justCalculated = false;
  } else {
    current = current === "0" ? digit : current + digit;
  }
  statusEl.textContent = "Digitando...";
  render();
}

function decimal() {
  if (replaceCurrent || justCalculated) {
    current = "0,";
    replaceCurrent = false;
    justCalculated = false;
  } else if (!current.includes(",")) {
    current += ",";
  }
  render();
}

function numericValue() {
  return Number(current.replaceAll(".", "").replace(",", "."));
}

function chooseOperator(nextOperator) {
  const value = numericValue();
  if (operator && !replaceCurrent) calculate();
  previous = numericValue();
  operator = nextOperator;
  replaceCurrent = true;
  justCalculated = false;
  expressionEl.textContent = `${format(previous)} ${operator}`;
  statusEl.textContent = "Escolha o próximo número";
}

function calculate() {
  if (operator === null || previous === null) return;
  const a = previous;
  const b = numericValue();
  let answer;
  if (operator === "+") answer = a + b;
  if (operator === "−") answer = a - b;
  if (operator === "×") answer = a * b;
  if (operator === "÷") answer = b === 0 ? NaN : a / b;

  expressionEl.textContent = `${format(a)} ${operator} ${format(b)} =`;
  current = Number.isFinite(answer) ? format(answer) : "Erro";
  previous = null;
  operator = null;
  replaceCurrent = true;
  justCalculated = true;
  statusEl.textContent = Number.isFinite(answer) ? "Resultado" : "Não é possível dividir por zero";
  resultEl.textContent = current;
}

function clearAll() {
  current = "0";
  previous = null;
  operator = null;
  replaceCurrent = false;
  justCalculated = false;
  expressionEl.textContent = "";
  statusEl.textContent = "Pronto para calcular";
  render();
}

function handleAction(action) {
  if (action === "clear") clearAll();
  if (action === "decimal") decimal();
  if (action === "equals") calculate();
  if (action === "sign" && current !== "0" && current !== "Erro") {
    current = format(-numericValue());
    render();
  }
  if (action === "percent" && current !== "Erro") {
    current = format(numericValue() / 100);
    render();
  }
}

document.querySelector(".keys").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.number !== undefined) enterDigit(button.dataset.number);
  if (button.dataset.operator) chooseOperator(button.dataset.operator);
  if (button.dataset.action) handleAction(button.dataset.action);
});

document.addEventListener("keydown", (event) => {
  if (/^[0-9]$/.test(event.key)) enterDigit(event.key);
  else if (event.key === "." || event.key === ",") decimal();
  else if (event.key === "+") chooseOperator("+");
  else if (event.key === "-") chooseOperator("−");
  else if (event.key === "*") chooseOperator("×");
  else if (event.key === "/") { event.preventDefault(); chooseOperator("÷"); }
  else if (event.key === "Enter" || event.key === "=") calculate();
  else if (event.key === "Escape" || event.key === "Delete") clearAll();
  else if (event.key === "%") handleAction("percent");
  else if (event.key === "Backspace") {
    if (!replaceCurrent && current !== "Erro") current = current.length > 1 ? current.slice(0, -1) : "0";
    render();
  }
});

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(resultEl.textContent);
    statusEl.textContent = "Resultado copiado!";
  } catch {
    statusEl.textContent = "Não foi possível copiar neste navegador";
  }
});

render();
