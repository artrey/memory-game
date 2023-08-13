const maxBoradSize = 10;

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

  const player1ScoreElement = document.getElementById("player1Score");
  const player2ScoreElement = document.getElementById("player2Score");
  const player1NameElement = document.getElementById("player1Name");
  const player2NameElement = document.getElementById("player2Name");
  const currentPlayerElement = document.getElementById("currentPlayer");

  // Функция инициализации игры
  function initializeGame(width, height, opponentType_) {
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

  function flipCard() {
    if (
      this.classList.contains("flipped") ||
      this.classList.contains("matched")
    ) {
      return; // Если карточка уже открыта или найдена, игнорируем клик
    }

    if (firstCard === null) {
      firstCard = this;
      this.classList.add("flipped");
      tryAddCardToBotMemory(firstCard);
    } else if (secondCard === null) {
      secondCard = this;
      this.classList.add("flipped");

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
      setTimeout(computerPlay, 1000);
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

  function resetGame() {
    player1Score = 0;
    player2Score = 0;
    currentPlayer = 1;
    player1ScoreElement.innerText = "0";
    player2ScoreElement.innerText = "0";
    currentPlayerElement.innerText = player1NameElement.innerText;
    cardsArray = [];
    grid.innerHTML = "";
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
      selectedCard.click();
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
});
