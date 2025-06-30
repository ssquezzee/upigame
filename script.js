const { createApp, ref, reactive, computed, onMounted } = Vue

createApp({
    setup() {

        function goHome() {
            currentPage.value = 'home';
            mobileMenuOpen.value = false;
            selectedGame.value = null; // Сбрасываем выбранную игру
        }

        // Навигация
        const currentPage = ref('home')
        const selectedGame = ref(null)
        const theme = ref('light')
        const themeIcon = computed(() => theme.value === 'light' ? '🌙' : '☀️')
        const mobileMenuOpen = ref(false)

        // Функция для установки темы
        function setTheme(newTheme) {
            theme.value = newTheme;
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        }

        // Переключение темы
        function toggleTheme() {
            const newTheme = theme.value === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        }

        // Инициализация темы
        onMounted(() => {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                setTheme(savedTheme);
            } else {
                setTheme('light');
            }
        })

        // Состояние игры "Найди пару"
        const gameState = reactive({
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
            ],
            feedbackMessage: computed(() => {
                if (!gameState.gameStarted) return gameState.feedbackMessages[0]
                if (gameState.gameCompleted) return gameState.feedbackMessages[3]
                if (gameState.matchedPairs > gameState.totalPairs / 2)
                    return gameState.feedbackMessages[2]
                return gameState.feedbackMessages[1]
            })
        })

        // Инициализация карточек для игры
        function initializeCards() {
            let gameCards = []
            // Выбираем случайные эмодзи
            const selectedEmojis = [...gameState.emojis]
                .sort(() => 0.5 - Math.random())
                .slice(0, gameState.totalPairs)

            selectedEmojis.forEach(emoji => {
                gameCards.push({ value: emoji, isFlipped: false, isMatched: false })
                gameCards.push({ value: emoji, isFlipped: false, isMatched: false })
            })
            return gameCards.sort(() => Math.random() - 0.5)
        }

        // Начать игру
        function startGame() {
            gameState.cards = initializeCards()
            gameState.gameStarted = true
            gameState.gameCompleted = false
            gameState.moves = 0
            gameState.matchedPairs = 0
            gameState.flippedCards = []
        }

        // Сбросить игру
        function resetGame() {
            startGame()
        }

        // Перевернуть карточку
        function flipCard(index) {
            if (
                gameState.cards[index].isFlipped ||
                gameState.flippedCards.length === 2 ||
                gameState.gameCompleted ||
                gameState.cards[index].isMatched
            ) return

            gameState.cards[index].isFlipped = true
            gameState.flippedCards.push(index)

            if (gameState.flippedCards.length === 2) {
                gameState.moves++
                const [firstIndex, secondIndex] = gameState.flippedCards

                if (gameState.cards[firstIndex].value === gameState.cards[secondIndex].value) {
                    // Совпали
                    setTimeout(() => {
                        gameState.cards[firstIndex].isMatched = true
                        gameState.cards[secondIndex].isMatched = true
                        gameState.matchedPairs++

                        // Проверяем завершение игры
                        if (gameState.matchedPairs === gameState.totalPairs) {
                            gameState.gameCompleted = true
                        }

                        gameState.flippedCards = []
                    }, 500)
                } else {
                    // Не совпали - переворачиваем обратно через секунду
                    setTimeout(() => {
                        gameState.cards[firstIndex].isFlipped = false
                        gameState.cards[secondIndex].isFlipped = false
                        gameState.flippedCards = []
                    }, 1000)
                }
            }
        }

        // Состояние игры "Угадай пропущенную букву"
        const missingLetterGame = reactive({
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
        })

        // Начать игру "Угадай букву"
        function startMissingLetterGame() {
            missingLetterGame.currentIndex = Math.floor(Math.random() * missingLetterGame.words.length)
            const wordObj = missingLetterGame.words[missingLetterGame.currentIndex]

            // Сохраняем текущее слово
            missingLetterGame.currentWord = wordObj.word

            // Создаем слово с пропущенной буквой
            let display = wordObj.word.split('')
            display[wordObj.missingIndex] = '_'
            missingLetterGame.displayWord = display.join(' ')

            // Создаем варианты ответов
            const correctLetter = wordObj.word[wordObj.missingIndex]
            let options = [correctLetter]

            // Добавляем 3 случайные буквы
            while (options.length < 4) {
                const randomChar = String.fromCharCode(1072 + Math.floor(Math.random() * 32))
                if (!options.includes(randomChar) && randomChar !== correctLetter) {
                    options.push(randomChar)
                }
            }

            // Перемешиваем варианты
            missingLetterGame.options = options.sort(() => Math.random() - 0.5)
            missingLetterGame.selectedOption = null
            missingLetterGame.answered = false
            missingLetterGame.isCorrect = false
        }

        // Проверить ответ в игре "Угадай букву"
        function checkMissingLetter(letter) {
            const wordObj = missingLetterGame.words[missingLetterGame.currentIndex]
            missingLetterGame.selectedOption = letter
            missingLetterGame.isCorrect = letter === wordObj.word[wordObj.missingIndex]
            missingLetterGame.answered = true
        }

        // Следующее слово в игре "Угадай букву"
        function nextMissingLetter() {
            startMissingLetterGame()
        }

        // Состояние игры "Составь слово из слогов"
        const syllablesGame = reactive({
            words: [
                { word: "машина", syllables: ["ма", "ши", "на"] },
                { word: "кровать", syllables: ["кро", "вать"] },
                { word: "яблоко", syllables: ["я", "бло", "ко"] },
                { word: "телефон", syllables: ["те", "ле", "фон"] },
                { word: "холодильник", syllables: ["хо", "ло", "диль", "ник"] },
                { word: "лампа", syllables: ["лам", "па"] },
                { word: "окно", syllables: ["о", "кнo"] },
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
        })

        // Начать игру "Составь слово из слогов"
        function startSyllablesGame() {
            syllablesGame.currentIndex = Math.floor(Math.random() * syllablesGame.words.length)
            const wordObj = syllablesGame.words[syllablesGame.currentIndex]

            syllablesGame.currentWord = wordObj.word
            syllablesGame.syllables = [...wordObj.syllables]
            syllablesGame.shuffledSyllables = [...wordObj.syllables].sort(() => Math.random() - 0.5)
            syllablesGame.selectedSyllables = []
            syllablesGame.checked = false
            syllablesGame.isCorrect = false
        }

        // Выбрать слог в игре "Составь слово"
        function selectSyllable(syllable) {
            if (syllablesGame.selectedSyllables.length < syllablesGame.syllables.length) {
                syllablesGame.selectedSyllables.push(syllable)
            }
        }

        // Удалить слог в игре "Составь слово"
        function removeSyllable(index) {
            if (syllablesGame.selectedSyllables[index]) {
                syllablesGame.selectedSyllables.splice(index, 1)
            }
        }

        // Проверить слово в игре "Составь слово"
        function checkSyllablesWord() {
            const assembledWord = syllablesGame.selectedSyllables.join('')
            syllablesGame.isCorrect = assembledWord === syllablesGame.currentWord
            syllablesGame.checked = true
        }

        // Следующее слово в игре "Составь слово"
        function nextSyllables() {
            startSyllablesGame()
        }

        // Игра "Что куда?"
        const sortingGame = reactive({
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
            placedItems: computed(() => sortingGame.items.filter(item => item.placed).length),
            checked: false,
            allCorrect: false
        })

        // Начать игру "Что куда?"
        function startSortingGame() {
            sortingGame.items.forEach(item => {
                item.room = null;
                item.placed = false;
            });
            sortingGame.selectedItem = null;
            sortingGame.selectedRoom = null;
            sortingGame.checked = false;
            sortingGame.allCorrect = false;
        }

        // Выбрать предмет
        function selectItem(itemId) {
            sortingGame.selectedItem = itemId;
            sortingGame.selectedRoom = null;
        }

        // Разместить предмет в комнате
        function placeItem(roomId) {
            if (!sortingGame.selectedItem) return;

            const item = sortingGame.items.find(i => i.id === sortingGame.selectedItem);
            if (item) {
                item.room = roomId;
                item.placed = true;
                sortingGame.selectedItem = null;
                sortingGame.selectedRoom = null;
            }
        }

        // Проверить результат
        function checkSorting() {
            sortingGame.checked = true;
            sortingGame.allCorrect = sortingGame.items.every(
                item => item.placed && item.room === item.correctRoom
            );
        }

        // Сбросить игру
        function resetSorting() {
            startSortingGame();
        }

        // Инициализация игр
        startMissingLetterGame()
        startSyllablesGame()
        startSortingGame()

        return {
            currentPage,
            selectedGame,
            theme,
            themeIcon,
            mobileMenuOpen,
            toggleTheme,
            gameState,
            missingLetterGame,
            syllablesGame,
            sortingGame,
            startGame,
            resetGame,
            flipCard,
            startMissingLetterGame,
            checkMissingLetter,
            nextMissingLetter,
            startSyllablesGame,
            selectSyllable,
            removeSyllable,
            checkSyllablesWord,
            nextSyllables,
            startSortingGame,
            selectItem,
            placeItem,
            checkSorting,
            goHome,
            resetSorting
        }
    }
}).mount('#app')