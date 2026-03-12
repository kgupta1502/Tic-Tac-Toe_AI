class TicTacToe {
    constructor() {
        this.cells = document.querySelectorAll('.cell');
        this.statusElement = document.getElementById('status');
        this.resetButton = document.getElementById('resetBtn');
        this.aiResetButton = document.getElementById('aiResetBtn');
        this.xScoreElement = document.getElementById('x-score');
        this.oScoreElement = document.getElementById('o-score');
        this.drawScoreElement = document.getElementById('draw-score');
        this.xLabelElement = document.getElementById('x-label');
        this.oLabelElement = document.getElementById('o-label');
        
        // AI Elements
        this.pvpModeBtn = document.getElementById('pvpMode');
        this.aiModeBtn = document.getElementById('aiMode');
        this.aiDifficultyDiv = document.getElementById('aiDifficulty');
        this.aiStatsDiv = document.getElementById('aiStats');
        this.aiGamesPlayedElement = document.getElementById('aiGamesPlayed');
        this.aiWinRateElement = document.getElementById('aiWinRate');
        this.aiLearningLevelElement = document.getElementById('aiLearningLevel');
        
        // Navigation
        this.navToggle = document.querySelector('.nav-toggle');
        this.navMenu = document.querySelector('.nav-menu');
        
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.gameMode = 'pvp'; // 'pvp' or 'ai'
        this.aiDifficulty = 'medium'; // 'easy', 'medium', 'hard', 'adaptive'
        this.isAIThinking = false;
        
        this.scores = { X: 0, O: 0, draw: 0 };
        
        this.winningConditions = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];
        
        // AI Learning System
        this.ai = new AILearningSystem();
        
        this.initializeGame();
        this.loadScores();
        this.loadAIData();
        this.initializeNavigation();
    }
    
    initializeNavigation() {
        // Mobile menu toggle
        this.navToggle.addEventListener('click', () => {
            this.navMenu.classList.toggle('active');
            this.navToggle.classList.toggle('active');
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.navMenu.classList.contains('active') && 
                !this.navMenu.contains(e.target) && 
                !this.navToggle.contains(e.target)) {
                this.navMenu.classList.remove('active');
                this.navToggle.classList.remove('active');
            }
        });
        
        // Smooth scrolling for navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                    // Close mobile menu if open
                    this.navMenu.classList.remove('active');
                    this.navToggle.classList.remove('active');
                }
            });
        });
        
        // Smooth scrolling for buttons
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = btn.getAttribute('href');
                if (targetId) {
                    const targetSection = document.querySelector(targetId);
                    if (targetSection) {
                        targetSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });
        
        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(10, 10, 10, 0.98)';
                navbar.style.backdropFilter = 'blur(15px)';
            } else {
                navbar.style.background = 'rgba(10, 10, 10, 0.95)';
                navbar.style.backdropFilter = 'blur(10px)';
            }
        });
        
        // Add touch support for mobile
        this.addTouchSupport();
    }
    
    addTouchSupport() {
        // Fix mobile touch events for game cells
        this.cells.forEach((cell, index) => {
            // Remove existing event listeners first
            cell.removeEventListener('click', () => this.handleCellClick(index));
            
            // Add both click and touch events for maximum compatibility
            cell.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleCellClick(index);
            });
            
            cell.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleCellClick(index);
            }, { passive: false });
            
            cell.addEventListener('touchend', (e) => {
                e.preventDefault();
            }, { passive: false });
        });
        
        // Add ripple effect for mobile buttons
        const buttons = document.querySelectorAll('.btn, .mode-btn, .diff-btn, .reset-btn');
        buttons.forEach(button => {
            button.addEventListener('touchstart', (e) => {
                const ripple = document.createElement('span');
                ripple.classList.add('ripple');
                button.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }
    
    initializeGame() {
        // Clear existing event listeners first
        this.cells.forEach((cell, index) => {
            // Clone cell to remove all event listeners
            const newCell = cell.cloneNode(true);
            cell.parentNode.replaceChild(newCell, cell);
        });
        
        // Re-get cells after cloning
        this.cells = document.querySelectorAll('.cell');
        
        // Add fresh event listeners
        this.cells.forEach((cell, index) => {
            cell.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleCellClick(index);
            });
            
            cell.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleCellClick(index);
            }, { passive: false });
        });
        
        this.resetButton.addEventListener('click', () => this.resetGame());
        this.aiResetButton.addEventListener('click', () => this.resetAILearning());
        
        // Game mode buttons
        this.pvpModeBtn.addEventListener('click', () => this.setGameMode('pvp'));
        this.aiModeBtn.addEventListener('click', () => this.setGameMode('ai'));
        
        // Difficulty buttons
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setAIDifficulty(e.target.dataset.level));
        });
        
        this.updateStatus();
        this.updateUI();
    }
    
    setGameMode(mode) {
        this.gameMode = mode;
        this.resetGame();
        
        // Update UI
        if (mode === 'pvp') {
            this.pvpModeBtn.classList.add('active');
            this.aiModeBtn.classList.remove('active');
            this.aiDifficultyDiv.style.display = 'none';
            this.aiStatsDiv.style.display = 'none';
            this.aiResetButton.style.display = 'none';
            this.xLabelElement.textContent = 'Player X';
            this.oLabelElement.textContent = 'Player O';
        } else {
            this.pvpModeBtn.classList.remove('active');
            this.aiModeBtn.classList.add('active');
            this.aiDifficultyDiv.style.display = 'block';
            this.aiStatsDiv.style.display = 'block';
            this.aiResetButton.style.display = 'inline-block';
            this.xLabelElement.textContent = 'Player';
            this.oLabelElement.textContent = 'AI';
        }
    }
    
    setAIDifficulty(level) {
        this.aiDifficulty = level;
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-level="${level}"]`).classList.add('active');
    }
    
    handleCellClick(index) {
        if (this.board[index] !== '' || !this.gameActive || this.isAIThinking) {
            return;
        }
        
        this.makeMove(index);
        
        // AI move if in AI mode and game is still active
        if (this.gameMode === 'ai' && this.gameActive && this.currentPlayer === 'O') {
            this.makeAIMove();
        }
    }
    
    makeMove(index) {
        this.board[index] = this.currentPlayer;
        this.updateCell(index);
        this.checkResult();
    }
    
    async makeAIMove() {
        this.isAIThinking = true;
        document.getElementById('gameBoard').classList.add('ai-thinking');
        
        // Add thinking delay for better UX
        await this.delay(800);
        
        const move = this.ai.getBestMove(this.board, this.aiDifficulty);
        if (move !== -1) {
            this.makeMove(move);
        }
        
        this.isAIThinking = false;
        document.getElementById('gameBoard').classList.remove('ai-thinking');
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    updateCell(index) {
        const cell = this.cells[index];
        cell.textContent = this.currentPlayer;
        cell.classList.add('taken', this.currentPlayer.toLowerCase());
    }
    
    checkResult() {
        let roundWon = false;
        let winningCombination = [];
        
        for (let i = 0; i < this.winningConditions.length; i++) {
            const [a, b, c] = this.winningConditions[i];
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                roundWon = true;
                winningCombination = [a, b, c];
                break;
            }
        }
        
        if (roundWon) {
            this.handleWin(winningCombination);
            return;
        }
        
        if (!this.board.includes('')) {
            this.handleDraw();
            return;
        }
        
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateStatus();
    }
    
    handleWin(winningCombination) {
        this.gameActive = false;
        winningCombination.forEach(index => {
            this.cells[index].classList.add('winner');
        });
        
        this.scores[this.currentPlayer]++;
        this.updateScoreDisplay();
        this.saveScores();
        
        // AI learning
        if (this.gameMode === 'ai') {
            this.ai.learnFromGame(this.board, this.currentPlayer === 'O' ? 'win' : 'loss');
            this.saveAIData();
            this.updateAIStats();
        }
        
        this.statusElement.textContent = this.gameMode === 'ai' && this.currentPlayer === 'O' ? 
            'AI wins!' : `Player ${this.currentPlayer} wins!`;
        this.statusElement.style.color = this.currentPlayer === 'X' ? '#e50914' : '#ffffff';
    }
    
    handleDraw() {
        this.gameActive = false;
        this.scores.draw++;
        this.updateScoreDisplay();
        this.saveScores();
        
        // AI learning
        if (this.gameMode === 'ai') {
            this.ai.learnFromGame(this.board, 'draw');
            this.saveAIData();
            this.updateAIStats();
        }
        
        this.statusElement.textContent = "It's a draw!";
        this.statusElement.style.color = '#ffffff';
    }
    
    updateStatus() {
        if (this.gameActive) {
            if (this.gameMode === 'ai') {
                this.statusElement.textContent = this.currentPlayer === 'X' ? 'Your turn' : 'AI is thinking...';
            } else {
                this.statusElement.textContent = `Player ${this.currentPlayer}'s turn`;
            }
            this.statusElement.style.color = this.currentPlayer === 'X' ? '#e50914' : '#ffffff';
        }
    }
    
    updateScoreDisplay() {
        this.xScoreElement.textContent = this.scores.X;
        this.oScoreElement.textContent = this.scores.O;
        this.drawScoreElement.textContent = this.scores.draw;
    }
    
    updateAIStats() {
        const stats = this.ai.getStats();
        this.aiGamesPlayedElement.textContent = stats.gamesPlayed;
        this.aiWinRateElement.textContent = stats.winRate + '%';
        this.aiLearningLevelElement.textContent = stats.learningLevel;
    }
    
    updateUI() {
        if (this.gameMode === 'ai') {
            this.updateAIStats();
        }
    }
    
    resetGame() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.isAIThinking = false;
        
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('taken', 'x', 'o', 'winner');
        });
        
        document.getElementById('gameBoard').classList.remove('ai-thinking');
        this.updateStatus();
    }
    
    resetAILearning() {
        this.ai.reset();
        this.saveAIData();
        this.updateAIStats();
        this.resetGame();
    }
    
    saveScores() {
        localStorage.setItem('ticTacToeScores', JSON.stringify(this.scores));
    }
    
    loadScores() {
        const savedScores = localStorage.getItem('ticTacToeScores');
        if (savedScores) {
            this.scores = JSON.parse(savedScores);
            this.updateScoreDisplay();
        }
    }
    
    saveAIData() {
        localStorage.setItem('ticTacToeAI', JSON.stringify(this.ai.getData()));
    }
    
    loadAIData() {
        const savedAI = localStorage.getItem('ticTacToeAI');
        if (savedAI) {
            this.ai.loadData(JSON.parse(savedAI));
        }
    }
}

// AI Learning System
class AILearningSystem {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.memory = {}; // Board state -> best move mapping
        this.stats = {
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            draws: 0
        };
        this.learningRate = 0.1;
        this.explorationRate = 0.1;
    }
    
    getBestMove(board, difficulty) {
        const availableMoves = this.getAvailableMoves(board);
        
        if (availableMoves.length === 0) return -1;
        
        // Easy mode: Random moves
        if (difficulty === 'easy') {
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
        
        // Hard mode: Perfect minimax
        if (difficulty === 'hard') {
            return this.minimax(board, 'O').move;
        }
        
        // Medium mode: Mix of strategy and randomness
        if (difficulty === 'medium') {
            if (Math.random() < 0.7) {
                return this.minimax(board, 'O').move;
            } else {
                return availableMoves[Math.floor(Math.random() * availableMoves.length)];
            }
        }
        
        // Adaptive mode: Use learned patterns
        if (difficulty === 'adaptive') {
            const boardKey = this.boardToKey(board);
            
            // If we have learned this position, use it
            if (this.memory[boardKey]) {
                if (Math.random() < 0.8) { // 80% exploitation
                    return this.memory[boardKey];
                }
            }
            
            // Otherwise use minimax with exploration
            if (Math.random() < 0.9) {
                return this.minimax(board, 'O').move;
            } else {
                return availableMoves[Math.floor(Math.random() * availableMoves.length)];
            }
        }
        
        return availableMoves[0];
    }
    
    minimax(board, player) {
        const availableMoves = this.getAvailableMoves(board);
        
        // Check for terminal states
        const result = this.checkBoardState(board);
        if (result !== null) {
            if (result === 'O') return { score: 10 };
            if (result === 'X') return { score: -10 };
            if (result === 'draw') return { score: 0 };
        }
        
        let bestMove = -1;
        let bestScore = player === 'O' ? -Infinity : Infinity;
        
        for (let move of availableMoves) {
            const newBoard = [...board];
            newBoard[move] = player;
            
            const result = this.minimax(newBoard, player === 'O' ? 'X' : 'O');
            
            if (player === 'O') {
                if (result.score > bestScore) {
                    bestScore = result.score;
                    bestMove = move;
                }
            } else {
                if (result.score < bestScore) {
                    bestScore = result.score;
                    bestMove = move;
                }
            }
        }
        
        return { score: bestScore, move: bestMove };
    }
    
    learnFromGame(finalBoard, result) {
        this.stats.gamesPlayed++;
        
        if (result === 'win') this.stats.wins++;
        else if (result === 'loss') this.stats.losses++;
        else this.stats.draws++;
        
        // Learn from the game (simplified reinforcement learning)
        // In a more complex implementation, we would track the entire game history
        // and update values for each board state encountered
        
        // Adjust exploration rate based on performance
        const winRate = this.stats.wins / this.stats.gamesPlayed;
        if (winRate > 0.7) {
            this.explorationRate = Math.max(0.05, this.explorationRate - 0.01);
        } else if (winRate < 0.3) {
            this.explorationRate = Math.min(0.3, this.explorationRate + 0.01);
        }
    }
    
    getAvailableMoves(board) {
        const moves = [];
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') moves.push(i);
        }
        return moves;
    }
    
    checkBoardState(board) {
        const winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        
        for (let [a, b, c] of winningConditions) {
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        
        if (!board.includes('')) return 'draw';
        return null;
    }
    
    boardToKey(board) {
        return board.join('');
    }
    
    getStats() {
        const winRate = this.stats.gamesPlayed > 0 ? 
            Math.round((this.stats.wins / this.stats.gamesPlayed) * 100) : 0;
        
        const learningLevel = Math.min(10, Math.floor(this.stats.gamesPlayed / 10) + 1);
        
        return {
            gamesPlayed: this.stats.gamesPlayed,
            winRate: winRate,
            learningLevel: learningLevel
        };
    }
    
    getData() {
        return {
            memory: this.memory,
            stats: this.stats,
            learningRate: this.learningRate,
            explorationRate: this.explorationRate
        };
    }
    
    loadData(data) {
        this.memory = data.memory || {};
        this.stats = data.stats || { gamesPlayed: 0, wins: 0, losses: 0, draws: 0 };
        this.learningRate = data.learningRate || 0.1;
        this.explorationRate = data.explorationRate || 0.1;
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});
