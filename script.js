const X_CLASS = "x";
const CIRCLE_CLASS = "circle";
let AI_PLAYER = CIRCLE_CLASS;
let HUMAN_PLAYER = X_CLASS;

let singlePlayer = false;
let aiStartsAsX = false; 
let circleTurn;

const board = document.getElementById("board");
const cellElements = document.querySelectorAll('[data-cell]');
const winningMessageTextElement = document.querySelector('[data-winning-message-text]');
const winningMessageElement = document.getElementById('winning-message');
const restartButton = document.getElementById('restart-button');

const humanVsHumanBtn = document.getElementById('human-vs-human');
const humanVsAIBtn = document.getElementById('human-vs-ai');
const aiStartXBtn = document.getElementById('ai-start-x');
const aiStartOBtn = document.getElementById('ai-start-o');

const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// ================= Mode & Setup =================
humanVsHumanBtn.addEventListener('click', () => {
    singlePlayer = false;
    setActiveBtn(humanVsHumanBtn, humanVsAIBtn);
    restartGame();
});

humanVsAIBtn.addEventListener('click', () => {
    singlePlayer = true;
    setActiveBtn(humanVsAIBtn, humanVsHumanBtn);
    restartGame();
});

aiStartXBtn.addEventListener('click', () => {
    aiStartsAsX = true;
    AI_PLAYER = X_CLASS;
    HUMAN_PLAYER = CIRCLE_CLASS;
    setActiveBtn(aiStartXBtn, aiStartOBtn);
    if(singlePlayer) restartGame();
});

aiStartOBtn.addEventListener('click', () => {
    aiStartsAsX = false;
    AI_PLAYER = CIRCLE_CLASS;
    HUMAN_PLAYER = X_CLASS;
    setActiveBtn(aiStartOBtn, aiStartXBtn);
    if(singlePlayer) restartGame();
});

function setActiveBtn(active, inactive) {
    active.classList.add('active');
    inactive.classList.remove('active');
}

// ================= Game Flow =================
startGame();
restartButton.addEventListener('click', restartGame);

function startGame() {
    circleTurn = false; // X always starts game
    cellElements.forEach(cell => {
        cell.addEventListener('click', handleClick, { once: true });
    });
    setBoardHoverClass();

    // If AI is X and it's single player, AI moves first
    if (singlePlayer && AI_PLAYER === X_CLASS) {
        aiMove();
    }
}

function restartGame() {
    cellElements.forEach(cell => {
        cell.classList.remove(X_CLASS, CIRCLE_CLASS);
        cell.innerText = "";
        cell.removeEventListener('click', handleClick);
    });
    winningMessageElement.classList.remove('show');
    startGame();
}

function handleClick(e) {
    const cell = e.target;
    const currentClass = circleTurn ? CIRCLE_CLASS : X_CLASS;
    
    placeMark(cell, currentClass);

    if (checkWin(currentClass)) {
        endGame(false);
    } else if (isDraw()) {
        endGame(true);
    } else {
        swapTurns();
        setBoardHoverClass();
        
        // Trigger AI if it's the AI's turn
        if (singlePlayer) {
            const isAITurn = (circleTurn && AI_PLAYER === CIRCLE_CLASS) || (!circleTurn && AI_PLAYER === X_CLASS);
            if (isAITurn) aiMove();
        }
    }
}

function placeMark(cell, currentClass) {
    cell.classList.add(currentClass);
}

function swapTurns() { circleTurn = !circleTurn; }

function setBoardHoverClass() {
    board.classList.remove(X_CLASS, CIRCLE_CLASS);
    board.classList.add(circleTurn ? CIRCLE_CLASS : X_CLASS);
}

function checkWin(player) {
    return WINNING_COMBINATIONS.some(comb => {
        return comb.every(index => cellElements[index].classList.contains(player));
    });
}

function isDraw() {
    return [...cellElements].every(cell => {
        return cell.classList.contains(X_CLASS) || cell.classList.contains(CIRCLE_CLASS);
    });
}

function endGame(draw) {
    winningMessageTextElement.innerText = draw ? "Draw!" : `${circleTurn ? "O" : "X"} Wins!`;
    winningMessageElement.classList.add('show');
}

// ================= AI Logic =================
function aiMove() {
    board.style.pointerEvents = 'none'; // Prevent user clicks

    setTimeout(() => {
        const currentBoard = [...cellElements].map(cell => {
            if (cell.classList.contains(X_CLASS)) return X_CLASS;
            if (cell.classList.contains(CIRCLE_CLASS)) return CIRCLE_CLASS;
            return null;
        });

        const bestMove = minimax(currentBoard, AI_PLAYER);
        const cell = cellElements[bestMove.index];
        
        board.style.pointerEvents = 'auto';
        cell.click(); 
    }, 500);
}

function minimax(newBoard, player, depth = 0) {
    const availSpots = newBoard.map((v, i) => v === null ? i : null).filter(v => v !== null);

    // Terminal states - We subtract/add depth to favor faster wins/slower losses
    if (checkWinBoard(newBoard, HUMAN_PLAYER)) return { score: -10 + depth };
    if (checkWinBoard(newBoard, AI_PLAYER)) return { score: 10 - depth };
    if (availSpots.length === 0) return { score: 0 };

    const moves = [];

    for (let i = 0; i < availSpots.length; i++) {
        const move = {};
        move.index = availSpots[i];
        newBoard[availSpots[i]] = player;

        if (player === AI_PLAYER) {
            // AI is maximizing, so next turn is Human (Minimizing)
            const result = minimax(newBoard, HUMAN_PLAYER, depth + 1);
            move.score = result.score;
        } else {
            // Human is minimizing, so next turn is AI (Maximizing)
            const result = minimax(newBoard, AI_PLAYER, depth + 1);
            move.score = result.score;
        }

        newBoard[availSpots[i]] = null; 
        moves.push(move);
    }

    let bestMove;
    if (player === AI_PLAYER) {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}
function checkWinBoard(boardState, player) {
    return WINNING_COMBINATIONS.some(comb => {
        return comb.every(index => boardState[index] === player);
    });
}