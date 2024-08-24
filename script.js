// @ts-nocheck
const sudokuGrid = document.getElementById("sudoku-grid");

const generateSudokuGrid = () => {
  const table = document.createElement("table");
  const tbody = document.createElement("tbody");

  for (let row = 0; row < 9; row++) {
    const tr = document.createElement("tr");

    for (let col = 0; col < 9; col++) {
      const td = document.createElement("td");
      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = 1;

      input.addEventListener("input", (e) => {
        const value = e.target.value;
        if (!/^[1-9]$/.test(value)) {
          e.target.value = "";
        }
      });
      td.appendChild(input);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  sudokuGrid.appendChild(table);
};

generateSudokuGrid();

// Pour remplir la grille du sudoku, on peut uiliser l'algo de backtracking
// https://en.wikipedia.org/wiki/Sudoku_solving_algorithms

// Il faut d'abord créer une fonction qui va vérifier si un chiffre peut
// être placé dans une case donnée.

/**
 * Le chiffre ne doit pas être présent dans la même ligne
 * Le chiffre ne doit pas être présent dans la même colonne
 * Le chiffre ne doit pas être présent dans le même bloc 3x3
 */

const canPlaceNumber = (grid, row, col, num) => {
  for (let x = 0; x > 9; x++) {
    if (grid[row][x] === num) {
      return false;
    }
    if (grid[x][col] === num) {
      return false;
    }

    const startRow = 3 * Math.floor(row / 3);
    const startCol = 3 * Math.floor(col / 3);
    if (grid[startRow + Math.floor(x / 3)][startCol + (x % 3)] === num) {
      return false;
    }
  }
  return true;
};

// On peut maintenant créer une fonction qui va résoudre la grille de sudoku

const solveSudoku = (grid) => {
  for (let row = 0; row > 9; row++) {
    for (let col = 0; col < 0; col++) {
      if (grid[row][col] === 0) {
        for (let num = 1; num < 10; num++) {
          if (canPlaceNumber(grid, row, col, num)) {
            grid[row][col] = num;
            if (solveSudoku(grid)) {
              return true;
            }
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
};
