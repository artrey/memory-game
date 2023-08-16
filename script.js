const maxBoradSize = 12;

const availableBotsMemory = {
  "computer-random": 0,
  "computer-weak": 3,
  "computer-normal": 7,
  "computer-strong": 15,
  "computer-unfair": maxBoradSize * maxBoradSize,
};

const player2Names = {
  human: "Игрок 2",
  "computer-random": "Шальной бот",
  "computer-weak": "Слабый бот",
  "computer-normal": "Нормальный бот",
  "computer-strong": "Сильный бот",
  "computer-unfair": "Нечестный бот",
};

document.addEventListener("DOMContentLoaded", function () {
  let cardsArray = [];
  let grid = document.querySelector(".grid");
  let firstCard = null;
  let secondCard = null;
  let player1Score = 0;
  let player2Score = 0;
  let currentPlayer = 1;
  let opponentType = "human";
  let botMemoryLength = 0;
  let botMemory = [];
  let botIsPlaying = false;

  const player1ScoreElement = document.getElementById("player1Score");
  const player2ScoreElement = document.getElementById("player2Score");
  const player1NameElement = document.getElementById("player1Name");
  const player2NameElement = document.getElementById("player2Name");
  const currentPlayerElement = document.getElementById("currentPlayer");

  // Функция инициализации игры
  function initializeGame(width, height, opponentType_) {
    resetState();

    // Закрыть модальное окно настроек
    document.getElementById("settingsModal").style.display = "none";

    // Задаем количество карточек в зависимости от выбранного размера
    let numberOfCards = width * height;

    // Заполняем массив cardsArray карточками
    shuffle(icons);
    cardsArray = [];
    for (let i = 0; i < numberOfCards / 2; i++) {
      cardsArray.push(i % icons.length);
      cardsArray.push(i % icons.length);
    }

    // Перемешиваем карточки
    cardsArray = shuffle(cardsArray);

    opponentType = opponentType_;
    botMemoryLength = availableBotsMemory[opponentType] || 0;
    botMemory = [];

    player2NameElement.innerText = player2Names[opponentType] || "Игрок 2";

    // Очищаем игровое поле
    grid.innerHTML = "";
    grid.style.gridTemplateColumns = `repeat(${width}, auto)`;
    grid.style.gridTemplateRows = `repeat(${height}, auto)`;

    // Создаем карточки на игровом поле
    for (let i = 0; i < cardsArray.length; i++) {
      let card = document.createElement("div");
      card.classList.add("card");
      card.dataset.value = cardsArray[i];

      let front = document.createElement("div");
      front.classList.add("front");

      let back = document.createElement("div");
      back.classList.add("back");
      back.innerHTML = icons[cardsArray[i]];

      card.appendChild(front);
      card.appendChild(back);

      card.addEventListener("click", flipCard);
      grid.appendChild(card);
    }
  }

  // Обработчик кнопки "Начать игру"
  document.getElementById("startGame").addEventListener("click", function () {
    const selectedWidth = parseInt(document.getElementById("fieldWidth").value);
    const selectedHeight = parseInt(
      document.getElementById("fieldHeight").value
    );
    const selectedOpponentType = document.getElementById("opponentType").value;
    initializeGame(selectedWidth, selectedHeight, selectedOpponentType);
  });

  document.getElementById("playAgain").addEventListener("click", resetGame);

  document
    .getElementById("resetGameButton")
    .addEventListener("click", function () {
      document.getElementById("resetConfirmModal").style.display = "flex";
    });

  document
    .getElementById("confirmReset")
    .addEventListener("click", function () {
      resetGame();
      document.getElementById("resetConfirmModal").style.display = "none";
    });

  document.getElementById("cancelReset").addEventListener("click", function () {
    document.getElementById("resetConfirmModal").style.display = "none";
  });

  function flipCard() {
    if (
      this.classList.contains("flipped") ||
      this.classList.contains("matched")
    ) {
      return; // Если карточка уже открыта или найдена, игнорируем клик
    }

    if (botIsPlaying) return;

    flipCardImplementation(this);
  }

  function flipCardImplementation(card) {
    if (firstCard === null) {
      firstCard = card;
      card.classList.add("flipped");
      tryAddCardToBotMemory(firstCard);
    } else if (secondCard === null) {
      secondCard = card;
      card.classList.add("flipped");

      if (firstCard.dataset.value === secondCard.dataset.value) {
        firstCard.classList.add("matched");
        secondCard.classList.add("matched");

        if (currentPlayer === 1) {
          player1Score++;
          player1ScoreElement.innerText = player1Score;
        } else {
          player2Score++;
          player2ScoreElement.innerText = player2Score;
        }
        botMemory = botMemory.filter(
          (x) => x.dataset.value !== firstCard.dataset.value
        );

        checkEndGame(); // Проверка на завершение игры

        resetCards();
      } else {
        tryAddCardToBotMemory(secondCard);
        setTimeout(() => {
          firstCard.classList.remove("flipped");
          secondCard.classList.remove("flipped");
          resetCards();
        }, 1000);
        switchPlayer(); // Если не найдена пара, переключаем игрока
      }
    }
  }

  function resetCards() {
    firstCard = null;
    secondCard = null;
  }

  function switchPlayer() {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    currentPlayerElement.innerText =
      currentPlayer === 1
        ? player1NameElement.innerText
        : player2NameElement.innerText;

    if (opponentType !== "human" && currentPlayer === 2) {
      botIsPlaying = true;
      setTimeout(computerPlay, 1000);
    } else {
      botIsPlaying = false;
    }
  }

  function checkEndGame() {
    if (player1Score + player2Score === cardsArray.length / 2) {
      let winner;
      if (player1Score > player2Score) {
        winner = `Победил ${player1NameElement.innerText}!`;
      } else if (player1Score < player2Score) {
        winner = `Победил ${player2NameElement.innerText}!`;
      } else {
        winner = "Ничья!";
      }

      document.getElementById("winnerAnnouncement").innerText = winner;
      setTimeout(function () {
        document.getElementById("winModal").style.display = "flex";
      }, 500);
    }
  }

  function adjustBoardSizeSelector(selectElement, maxSize) {
    maxSize = Math.floor(maxSize / 2) * 2;
    const options = Array.from(selectElement.children).map((x) =>
      parseInt(x.value)
    );
    const maxOption = Math.max(...options);
    if (maxOption !== maxSize) {
      while (selectElement.firstChild) {
        selectElement.removeChild(selectElement.firstChild);
      }
      for (let i = 2; i <= maxSize; i += 2) {
        const option = document.createElement("option");
        option.value = i;
        option.text = i;
        selectElement.appendChild(option);
      }
    }
  }

  function resetState() {
    player1Score = 0;
    player2Score = 0;
    currentPlayer = 1;
    player1ScoreElement.innerText = "0";
    player2ScoreElement.innerText = "0";
    currentPlayerElement.innerText = player1NameElement.innerText;
    cardsArray = [];
    grid.innerHTML = "";
    opponentType = "human";
    botMemoryLength = 0;
    botMemory = [];
    firstCard = null;
    secondCard = null;
    botIsPlaying = false;
  }

  function resetGame() {
    resetState();

    const scoreElementSize = document
      .querySelector(".score")
      .getBoundingClientRect();
    const resetElementSize = document
      .querySelector(".reset-game")
      .getBoundingClientRect();
    const screenWidth =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth;
    const screenHeight =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight;
    const availableWidth = screenWidth;
    const availableHeight =
      screenHeight - scoreElementSize.height - resetElementSize.height;

    const tmpCard = document.createElement("div");
    tmpCard.style.visibility = "hidden";
    tmpCard.classList.add("card");
    grid.appendChild(tmpCard);
    const cardWidth = tmpCard.clientWidth;
    const cardHeight = tmpCard.clientHeight;
    grid.innerHTML = "";
    const gridGap = parseFloat(
      window.getComputedStyle(grid).getPropertyValue("gap").slice(0, -2)
    );

    const maxCardsHorizontally = Math.min(
      maxBoradSize,
      Math.floor((availableWidth - 2 * gridGap) / (cardWidth + gridGap))
    );
    const maxCardsVertically = Math.min(
      maxBoradSize,
      Math.floor((availableHeight - 2 * gridGap) / (cardHeight + gridGap))
    );

    adjustBoardSizeSelector(
      document.getElementById("fieldWidth"),
      maxCardsHorizontally
    );
    adjustBoardSizeSelector(
      document.getElementById("fieldHeight"),
      maxCardsVertically
    );

    document.getElementById("winModal").style.display = "none";
    document.getElementById("settingsModal").style.display = "flex";
  }

  function shuffle(array) {
    let currentIndex = array.length,
      randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
    return array;
  }

  function computerPlay() {
    if (currentPlayer !== 2) return;

    let unflippedCards = Array.from(
      document.querySelectorAll(".card:not(.flipped)")
    );
    if (unflippedCards.length === 0) return;

    let selectedCard = selectBestCard();
    if (!selectedCard) {
      if (botMemory.length > 0) {
        unflippedCards = unflippedCards.filter((x) => !botMemory.includes(x));
      }
      selectedCard =
        unflippedCards[Math.floor(Math.random() * unflippedCards.length)];
    }

    setTimeout(() => {
      flipCardImplementation(selectedCard);
      if (currentPlayer !== 2) return;
      computerPlay();
    }, 700);
  }

  function tryAddCardToBotMemory(card) {
    if (botMemoryLength === 0) return;

    if (botMemory.includes(card)) return;

    if (botMemory.length >= botMemoryLength) {
      botMemory.shift();
    }

    botMemory.push(card);
  }

  function selectBestCard() {
    if (firstCard) {
      return botMemory
        .filter((x) => x !== firstCard)
        .find((x) => x.dataset.value === firstCard.dataset.value);
    }

    const values = botMemory.map((x) => x.dataset.value);
    const duplicated = values.find((x, index) => index !== values.indexOf(x));
    if (!duplicated) return null;

    const index = values.indexOf(duplicated);
    return botMemory[index];
  }

  resetGame();
});
