if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/js/worker.js")
      .then((res) => console.log("Service worker registered"))
      .catch((err) => console.log("Couldn't to register service worker", err));
  });
}

// Supported card decks
const suits = ["club", "diamond", "spade", "heart"];
const cards = ["A", "K", "Q", "J", "10", "9", "8", "7", "6"];

// App state
const undoStack = [];
const redoStack = [];
let currentState = {};

// Render cards from deck
function renderDeck(suits, cards) {
  const cardGrid = document.getElementById("card-grid");
  suits.forEach((suit) => {
    const column = document.createElement("div");
    column.classList.add("column");

    cards.forEach((value) => {
      const card = document.createElement("button");
      card.classList.add("card");

      const valueText = document.createElement("span");
      valueText.classList.add(`num-${value.toLowerCase()}`);
      valueText.textContent = value;
      card.appendChild(valueText);

      const svgPath = `assets/${suit}_suit.svg`;
      const suitImg = document.createElement("img");
      suitImg.setAttribute("draggable", "false");
      suitImg.src = svgPath;
      suitImg.alt = `Card suit, ${suit}`;

      card.appendChild(suitImg);

      // Toggle "selected" state if not discarded
      card.addEventListener("click", () => {
        if (!card.classList.contains("card-discarded"))
          card.classList.toggle("card-selected");
      });

      column.appendChild(card);
    });

    cardGrid.appendChild(column);
  });
}

renderDeck(suits, cards);

// Action buttons
function handleActionButton(buttonId, className) {
  const button = document.getElementById(buttonId + "-action-button");
  button.addEventListener("click", () => handleSelection(className));
}

function handleSelection(className) {
  const allCards = document.querySelectorAll(".card");
  const selectedCards = document.querySelectorAll(".card.card-selected");

  // Save the current state before making changes
  undoStack.push(
    Array.from(allCards).map((card) => {
      return {
        element: card,
        classes: Array.from(card.classList).filter(
          (className) =>
            className.startsWith("card-") && className !== "card-selected"
        ),
      };
    })
  );

  selectedCards.forEach((card) => {
    card.classList.remove("card-selected");
    if (className != "card-discarded")
      card.classList.remove("card-owned", "card-enemy", "card-discarded");
    else if (
      !card.classList.contains("card-owned") &&
      !card.classList.contains("card-enemy")
    )
      card.classList.add("card-enemy");
    card.classList.add(className);
  });

  currentState = Array.from(allCards).map((card) => {
    return {
      element: card,
      classes: Array.from(card.classList).filter(
        (className) =>
          className.startsWith("card-") && className !== "card-selected"
      ),
    };
  });

  // Clear redo stack
  redoStack.length = 0;

  updateButtonStates();
}

handleActionButton("mine", "card-owned");
handleActionButton("enemy", "card-enemy");
handleActionButton("discard", "card-discarded");

// State buttons
const undoButton = document.getElementById("undo-controls-button");
undoButton.disabled = true;

const redoButton = document.getElementById("redo-controls-button");
redoButton.disabled = true;

const resetButton = document.getElementById("reset-controls-button");

function undo() {
  if (undoStack.length > 0) {
    const lastAction = undoStack.pop();
    lastAction.forEach(({ element, classes }) => {
      element.classList.remove(
        "card-selected",
        "card-owned",
        "card-enemy",
        "card-discarded"
      );
      element.classList.add(...classes);
    });

    redoStack.push(currentState);
    currentState = lastAction;

    updateButtonStates();
  }
}

function redo() {
  if (redoStack.length > 0) {
    const lastAction = redoStack.pop();
    lastAction.forEach(({ element, classes }) => {
      element.classList.remove(
        "card-selected",
        "card-owned",
        "card-enemy",
        "card-discarded"
      );
      element.classList.add(...classes);
    });

    undoStack.push(currentState);
    currentState = lastAction;

    updateButtonStates();
  }
}

function reset() {
  const allCards = document.querySelectorAll(".card");
  allCards.forEach((card) => {
    card.classList.remove(
      "card-selected",
      "card-owned",
      "card-enemy",
      "card-discarded"
    );
  });

  // Clear history
  undoStack.length = 0;
  redoStack.length = 0;
  currentState = {};

  updateButtonStates();
}

function updateButtonStates() {
  undoButton.disabled = undoStack.length === 0;
  redoButton.disabled = redoStack.length === 0;
}

undoButton.addEventListener("click", undo);
redoButton.addEventListener("click", redo);
resetButton.addEventListener("click", reset);
