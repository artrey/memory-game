document.addEventListener("DOMContentLoaded", function () {
  let cardsArray = [];
  let grid = document.querySelector(".grid");
  let firstCard = null;
  let secondCard = null;
  let player1Score = 0;
  let player2Score = 0;
  let currentPlayer = 1;
  const player1ScoreElement = document.getElementById("player1Score");
  const player2ScoreElement = document.getElementById("player2Score");
  const currentPlayerElement = document.getElementById("currentPlayer");

  // Функция инициализации игры
  function initializeGame(width, height) {
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
    initializeGame(selectedWidth, selectedHeight);
  });

  document.getElementById("playAgain").addEventListener("click", function () {
    resetGame();
  });

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

        checkEndGame(); // Проверка на завершение игры

        resetCards();
      } else {
        setTimeout(() => {
          firstCard.classList.remove("flipped");
          secondCard.classList.remove("flipped");
          switchPlayer(); // Если не найдена пара, переключаем игрока
          resetCards();
        }, 1000);
      }
    }
  }

  function resetCards() {
    firstCard = null;
    secondCard = null;
  }

  function switchPlayer() {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    currentPlayerElement.innerText = `Игрок ${currentPlayer}`;
  }

  function checkEndGame() {
    if (player1Score + player2Score === cardsArray.length / 2) {
      let winner;
      if (player1Score > player2Score) {
        winner = "Победил игрок 1!";
      } else if (player1Score < player2Score) {
        winner = "Победил игрок 2!";
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
    currentPlayerElement.innerText = "Игрок 1";
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
});
