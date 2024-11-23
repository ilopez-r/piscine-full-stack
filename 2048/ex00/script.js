// Variable global para la puntuación
let score = 0;

// El tablero con una matriz 4x4
const grid = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
];

function printGrid() {
    const gridContainer = document.getElementById('grid-container');
    const scoreContainer = document.getElementById('score');
    gridContainer.innerHTML = '';
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            const tile = document.createElement('div');
            tile.classList.add("tile");
            const value = grid[i][j];
            if (value === 0)
                tile.classList.add("empty");
            else
                tile.classList.add(`tile-${value}`);
            tile.textContent = grid[i][j] === 0 ? '' : grid[i][j];
            tile.classList.add("tile-animation");
            gridContainer.appendChild(tile);
        }
    }
    scoreContainer.textContent = `Score: ${score}`;
}

function generateRandomNumber() {
    const emptyTiles = [];
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] === 0)
                emptyTiles.push({ row: i, col: j });
        }
    }
    if (emptyTiles.length === 0) return;
    const randomIndex = Math.floor(Math.random() * emptyTiles.length);
    const { row, col } = emptyTiles[randomIndex];
    grid[row][col] = Math.random() < 0.9 ? 2 : 4;
    printGrid();
}

function boardChanged(oldGrid, newGrid) {
    for (let i = 0; i < oldGrid.length; i++) {
        for (let j = 0; j < oldGrid[i].length; j++) {
            if (oldGrid[i][j] !== newGrid[i][j])
                return true;
        }
    }
    return false;
}

function movement(direction) {
    let hasMove = false;
    const oldGrid = grid.map(row => [...row]);

    for (let i = 0; i < grid.length; i++) {
        let row = grid[i];
        if (direction === 'right' || direction === 'down')
            row = row.reverse();
        row = row.filter(val => val !== 0);
        for (let j = 0; j < row.length - 1; j++) {
            if (row[j] === row[j + 1]) {
                row[j] *= 2;
                score += row[j];
                row[j + 1] = 0;
            }
        }
        row = row.filter(val => val !== 0);
        while (row.length < 4)
            row.push(0);
        if (direction === 'right' || direction === 'down')
            row = row.reverse();
        grid[i] = row;
    }
    if (boardChanged(oldGrid, grid))
        hasMove = true;
    return hasMove;
}

function updateBestScore(score) {
    const bestScore = localStorage.getItem('bestScore') || 0;
    if (score > bestScore)
        localStorage.setItem('bestScore', score);
    document.getElementById('score').textContent = `Score: ${score}`;
}

function displayBestScore() {
    const bestScore = localStorage.getItem('bestScore') || 0;
    document.getElementById('best-score').textContent = `Best Score: ${bestScore}`;
}

function isGameOver() {
    // Verifica si hay celdas vacías
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] === 0) return false;
        }
    }
    
    // Verifica movimientos horizontales posibles
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length - 1; j++) {
            if (grid[i][j] === grid[i][j + 1]) return false;
        }
    }
    
    // Verifica movimientos verticales posibles
    for (let i = 0; i < grid.length - 1; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] === grid[i + 1][j]) return false;
        }
    }
    
    document.getElementById('grid-result').style.display = 'flex';
    document.getElementById('gameOver').style.display = 'flex';
    document.getElementById('youWon').style.display = 'none';
    updateBestScore(score);
    return true;
}

function isGameWon() {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] === 2048) {
                document.getElementById('grid-result').style.display = 'flex';
                document.getElementById('youWon').style.display = 'flex';
                document.getElementById('gameOver').style.display = 'none';
                updateBestScore(score);
                return true;
            }
        }
    }
    return false;
}

function transposeGrid() {
    for (let i = 0; i < grid.length; i++) {
        for (let j = i; j < grid[i].length; j++) {
            const temp = grid[i][j];
            grid[i][j] = grid[j][i];
            grid[j][i] = temp;
        }
    }
}

function handleMove(direction) {
    let hasMove = false;

    if (direction === 'left')
        hasMove = movement('left');
    else if (direction === 'right')
        hasMove = movement('right');
    else if (direction === 'up') {
        transposeGrid();
        hasMove = movement('up');
        transposeGrid();
    } 
    else if (direction === 'down') {
        transposeGrid();
        hasMove = movement('down');
        transposeGrid();
    }

    if (hasMove) {
        generateRandomNumber();
        if (!isGameWon()) {
            isGameOver();
        }
    }
    printGrid();
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft')
        handleMove('left');
    else if (e.key === 'ArrowRight')
        handleMove('right');
    else if (e.key === 'ArrowUp')
        handleMove('up');
    else if (e.key === 'ArrowDown')
        handleMove('down');
});

let startX, startY, endX, endY;

document.addEventListener('touchstart', function(e) {
    const touch = e.touches[0];
    startX = touch.pageX;
    startY = touch.pageY;
}, false);

document.addEventListener('touchend', function(e) {
    const touch = e.changedTouches[0];
    endX = touch.pageX;
    endY = touch.pageY;
    const diffX = endX - startX;
    const diffY = endY - startY;

    if (Math.abs(diffX) > 30 || Math.abs(diffY) > 30) {
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0)
                handleMove('right');
            else
                handleMove('left');
        } else {
            if (diffY > 0)
                handleMove('down');
            else
                handleMove('up');
        }
    }
}, false);

function restartGame() {
    for (let i = 0; i < grid.length; i++)
        for (let j = 0; j < grid[i].length; j++)
            grid[i][j] = 0;
    
    score = 0;
    updateBestScore(score);
    document.getElementById('grid-result').style.display = 'none';
    generateRandomNumber();
    generateRandomNumber();
    printGrid();
    displayBestScore();
}

document.getElementById('restart-btn').addEventListener('click', restartGame);

generateRandomNumber();
generateRandomNumber();
printGrid();
displayBestScore();