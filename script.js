const { createApp } = Vue;

const App = {
  data() {
    return {
      // Навигация
      currentPage: 'home',
      selectedGame: null,
      theme: 'light',
      mobileMenuOpen: false,
      
      // Игра "Найди пару"
      gameState: {
        cards: [],
        moves: 0,
        matchedPairs: 0,
        gameStarted: false,
        gameCompleted: false,
        flippedCards: [],
        totalPairs: 6,
        emojis: ['😺', '🐶', '🐼', '🦊', '🐻', '🐰', '🐯', '🐮', '🐹', '🐨'],
        feedbackMessages: [
          "Давай найдём парные карточки!",
          "Молодец! Продолжай в том же духе!",
          "Отлично! Ещё чуть-чуть!",
          "Ура! Ты справился! Ты настоящий чемпион!"
        ]
      },
      
      // Игра "Угадай пропущенную букву"
      missingLetterGame: {
        words: [
          { word: "кошка", missingIndex: 2 },
          { word: "собака", missingIndex: 3 },
          { word: "мышка", missingIndex: 2 },
          { word: "ложка", missingIndex: 2 },
          { word: "вилка", missingIndex: 2 },
          { word: "чашка", missingIndex: 2 },
          { word: "книга", missingIndex: 3 },
          { word: "лампа", missingIndex: 3 },
          { word: "дверь", missingIndex: 3 }
        ],
        currentIndex: 0,
        currentWord: "",
        displayWord: "",
        options: [],
        selectedOption: null,
        answered: false,
        isCorrect: false
      },
      
      // Игра "Составь слово из слогов"
      syllablesGame: {
        words: [
          { word: "машина", syllables: ["ма", "ши", "на"] },
          { word: "кровать", syllables: ["кро", "вать"] },
          { word: "яблоко", syllables: ["я", "бло", "ко"] },
          { word: "телефон", syllables: ["те", "ле", "фон"] },
          { word: "холодильник", syllables: ["хо", "ло", "диль", "ник"] },
          { word: "лампа", syllables: ["лам", "pa"] },
          { word: "окно", syllables: ["о", "кно"] },
          { word: "дверь", syllables: ["дверь"] },
          { word: "стол", syllables: ["стол"] },
          { word: "телевизор", syllables: ["те", "ле", "ви", "зор"] },
          { word: "микроволновка", syllables: ["мик", "ро", "вол", "нов", "ка"] },
          { word: "компьютер", syllables: ["ком", "пью", "тер"] },
          { word: "баскетбол", syllables: ["бас", "кет", "бол"] },
          { word: "футбол", syllables: ["фут", "бол"] },
          { word: "велосипед", syllables: ["ве", "ло", "си", "пед"] },
          { word: "самокат", syllables: ["са", "мо", "кат"] },
          { word: "апельсин", syllables: ["а", "пель", "син"] },
          { word: "помидор", syllables: ["по", "ми", "дор"] },
          { word: "огород", syllables: ["о", "го", "род"] },
          { word: "скатерть", syllables: ["ска", "терть"] },
          { word: "матрёшка", syllables: ["ма", "трёш", "ка"] },
          { word: "чемодан", syllables: ["че", "мо", "дан"] }
        ],
        currentIndex: 0,
        currentWord: "",
        syllables: [],
        shuffledSyllables: [],
        selectedSyllables: [],
        checked: false,
        isCorrect: false
      },
      
      // Игра "Что куда?"
      sortingGame: {
        rooms: [
          { id: 'kitchen', name: 'Кухня', icon: '🍳' },
          { id: 'bedroom', name: 'Спальня', icon: '🛏️' },
          { id: 'bathroom', name: 'Ванная', icon: '🚿' }
        ],
        items: [
          { id: 1, name: 'Тостер', icon: '🍞', correctRoom: 'kitchen', room: null, placed: false },
          { id: 2, name: 'Подушка', icon: '🛏️', correctRoom: 'bedroom', room: null, placed: false },
          { id: 3, name: 'Мыло', icon: '🧼', correctRoom: 'bathroom', room: null, placed: false },
          { id: 4, name: 'Кастрюля', icon: '🥘', correctRoom: 'kitchen', room: null, placed: false },
          { id: 5, name: 'Одеяло', icon: '🛌', correctRoom: 'bedroom', room: null, placed: false },
          { id: 6, name: 'Зубная щетка', icon: '🪥', correctRoom: 'bathroom', room: null, placed: false }
        ],
        selectedItem: null,
        selectedRoom: null,
        checked: false,
        allCorrect: false,
        showItemList: true  // Для управления видимостью списка предметов
      }
    };
  },
  computed: {
    themeIcon() {
      return this.theme === 'light' ? '🌙' : '☀️';
    },
    // ВЫЧИСЛЯЕМОЕ СВОЙСТВО ДЛЯ КОММЕНТАРИЯ КОТА
    gameFeedbackMessage() {
      if (!this.gameState.gameStarted) return this.gameState.feedbackMessages[0];
      if (this.gameState.gameCompleted) return this.gameState.feedbackMessages[3];
      if (this.gameState.matchedPairs > this.gameState.totalPairs / 2) {
        return this.gameState.feedbackMessages[2];
      }
      return this.gameState.feedbackMessages[1];
    },
    // Количество размещенных предметов
    sortingPlacedItems() {
      return this.sortingGame.items.filter(item => item.placed).length;
    },
    // Доступные для размещения предметы
    availableItems() {
      return this.sortingGame.items.filter(item => !item.placed);
    }
  },
  methods: {
    // Навигация
    goHome() {
      this.currentPage = 'home';
      this.mobileMenuOpen = false;
      this.selectedGame = null;
    },
    setTheme(newTheme) {
      this.theme = newTheme;
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    },
    toggleTheme() {
      this.setTheme(this.theme === 'light' ? 'dark' : 'light');
    },

    // Игра "Найди пару"
    initializeCards() {
      let gameCards = [];
      const selectedEmojis = [...this.gameState.emojis]
        .sort(() => 0.5 - Math.random())
        .slice(0, this.gameState.totalPairs);

      selectedEmojis.forEach(emoji => {
        gameCards.push({ value: emoji, isFlipped: false, isMatched: false });
        gameCards.push({ value: emoji, isFlipped: false, isMatched: false });
      });
      return gameCards.sort(() => Math.random() - 0.5);
    },
    startGame() {
      this.gameState.cards = this.initializeCards();
      this.gameState.gameStarted = true;
      this.gameState.gameCompleted = false;
      this.gameState.moves = 0;
      this.gameState.matchedPairs = 0;
      this.gameState.flippedCards = [];
    },
    resetGame() {
      this.startGame();
    },
    flipCard(index) {
      if (
        this.gameState.cards[index].isFlipped ||
        this.gameState.flippedCards.length === 2 ||
        this.gameState.gameCompleted ||
        this.gameState.cards[index].isMatched
      ) return;

      this.gameState.cards[index].isFlipped = true;
      this.gameState.flippedCards.push(index);

      if (this.gameState.flippedCards.length === 2) {
        this.gameState.moves++;
        const [firstIndex, secondIndex] = this.gameState.flippedCards;

        if (this.gameState.cards[firstIndex].value === this.gameState.cards[secondIndex].value) {
          // Совпали
          setTimeout(() => {
            this.gameState.cards[firstIndex].isMatched = true;
            this.gameState.cards[secondIndex].isMatched = true;
            this.gameState.matchedPairs++;

            // Проверяем завершение игры
            if (this.gameState.matchedPairs === this.gameState.totalPairs) {
              this.gameState.gameCompleted = true;
            }

            this.gameState.flippedCards = [];
          }, 500);
        } else {
          // Не совпали
          setTimeout(() => {
            this.gameState.cards[firstIndex].isFlipped = false;
            this.gameState.cards[secondIndex].isFlipped = false;
            this.gameState.flippedCards = [];
          }, 1000);
        }
      }
    },

    // Игра "Угадай пропущенную букву"
    startMissingLetterGame() {
      this.missingLetterGame.currentIndex = Math.floor(Math.random() * this.missingLetterGame.words.length);
      const wordObj = this.missingLetterGame.words[this.missingLetterGame.currentIndex];

      this.missingLetterGame.currentWord = wordObj.word;

      let display = wordObj.word.split('');
      display[wordObj.missingIndex] = '_';
      this.missingLetterGame.displayWord = display.join(' ');

      const correctLetter = wordObj.word[wordObj.missingIndex];
      let options = [correctLetter];

      while (options.length < 4) {
        const randomChar = String.fromCharCode(1072 + Math.floor(Math.random() * 32));
        if (!options.includes(randomChar) && randomChar !== correctLetter) {
          options.push(randomChar);
        }
      }

      this.missingLetterGame.options = options.sort(() => Math.random() - 0.5);
      this.missingLetterGame.selectedOption = null;
      this.missingLetterGame.answered = false;
      this.missingLetterGame.isCorrect = false;
    },
    checkMissingLetter(letter) {
      const wordObj = this.missingLetterGame.words[this.missingLetterGame.currentIndex];
      this.missingLetterGame.selectedOption = letter;
      this.missingLetterGame.isCorrect = letter === wordObj.word[wordObj.missingIndex];
      this.missingLetterGame.answered = true;
    },
    nextMissingLetter() {
      this.startMissingLetterGame();
    },

    // Игра "Составь слово"
    startSyllablesGame() {
      this.syllablesGame.currentIndex = Math.floor(Math.random() * this.syllablesGame.words.length);
      const wordObj = this.syllablesGame.words[this.syllablesGame.currentIndex];

      this.syllablesGame.currentWord = wordObj.word;
      this.syllablesGame.syllables = [...wordObj.syllables];
      this.syllablesGame.shuffledSyllables = [...wordObj.syllables].sort(() => Math.random() - 0.5);
      this.syllablesGame.selectedSyllables = [];
      this.syllablesGame.checked = false;
      this.syllablesGame.isCorrect = false;
    },
    selectSyllable(syllable) {
      if (this.syllablesGame.selectedSyllables.length < this.syllablesGame.syllables.length) {
        this.syllablesGame.selectedSyllables.push(syllable);
      }
    },
    removeSyllable(index) {
      if (this.syllablesGame.selectedSyllables[index]) {
        this.syllablesGame.selectedSyllables.splice(index, 1);
      }
    },
    checkSyllablesWord() {
      const assembledWord = this.syllablesGame.selectedSyllables.join('');
      this.syllablesGame.isCorrect = assembledWord === this.syllablesGame.currentWord;
      this.syllablesGame.checked = true;
    },
    nextSyllables() {
      this.startSyllablesGame();
    },

    // Игра "Что куда?"
    startSortingGame() {
      this.sortingGame.items.forEach(item => {
        item.room = null;
        item.placed = false;
      });
      this.sortingGame.selectedItem = null;
      this.sortingGame.selectedRoom = null;
      this.sortingGame.checked = false;
      this.sortingGame.allCorrect = false;
      this.sortingGame.showItemList = true; // Показываем список предметов
    },
    selectItem(itemId) {
      this.sortingGame.selectedItem = itemId;
      this.sortingGame.selectedRoom = null;
      
      // На маленьких экранах скрываем список при выборе
      if (window.innerWidth <= 320) {
        this.sortingGame.showItemList = false;
      }
    },
    placeItem(roomId) {
      if (!this.sortingGame.selectedItem) return;

      const item = this.sortingGame.items.find(i => i.id === this.sortingGame.selectedItem);
      if (item) {
        item.room = roomId;
        item.placed = true;
        this.sortingGame.selectedItem = null;
        this.sortingGame.selectedRoom = null;
        
        // На маленьких экранах показываем список после размещения
        if (window.innerWidth <= 320) {
          this.sortingGame.showItemList = true;
        }
      }
    },
    checkSorting() {
      this.sortingGame.checked = true;
      this.sortingGame.allCorrect = this.sortingGame.items.every(
        item => item.placed && item.room === item.correctRoom
      );
    },
    resetSorting() {
      this.startSortingGame();
    },
    // Переключение видимости списка предметов
    toggleItemList() {
      this.sortingGame.showItemList = !this.sortingGame.showItemList;
    }
  },
  mounted() {
    // Инициализация темы
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme('light');
    }
    
    // Инициализация игр
    this.startMissingLetterGame();
    this.startSyllablesGame();
    this.startSortingGame();
  }
};

createApp(App).mount('#app');