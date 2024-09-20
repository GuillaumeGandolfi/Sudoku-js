// @ts-nocheck

document.getElementById("close-welcome").addEventListener("click", function () {
  const welcomeMessage = document.getElementById("welcome-message");
  welcomeMessage.classList.add("fade-out");
  welcomeMessage.addEventListener(
    "animationend",
    function () {
      welcomeMessage.style.display = "none";
    },
    { once: true }
  );
});

document.getElementById("toggle-theme").addEventListener("click", function () {
  const body = document.body;
  const themeButton = document.getElementById("toggle-theme");

  body.classList.toggle("dark-mode");
  if (body.classList.contains("dark-mode")) {
    themeButton.textContent = "☀️";
  } else {
    themeButton.textContent = "🌙";
  }
  const currentTheme = body.classList.contains("dark-mode")
    ? "dark-mode"
    : "light-mode";
  localStorage.setItem("theme", currentTheme);
});

const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  document.body.classList.add(savedTheme);
  const themeButton = document.getElementById("toggle-theme");
  themeButton.textContent = savedTheme === "dark-mode" ? "☀️" : "🌙";
}

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
      /** Update : je vais faire en sorte que pour les users téléphone, le clavier
      numérique s'affiche pour les inputs */
      input.inputMode = "numeric";
      input.pattern = "[0-9]*";

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
  for (let x = 0; x < 9; x++) {
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

// Pour ne pas que la grille générée soit toujours la même, j'ai lu qu'il fallait
// utiliser l'algorithme de Fisher-Yates pour mélanger les chiffres de 1 à 9.
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// On peut maintenant créer une fonction qui va résoudre la grille de sudoku

const solveSudoku = (grid) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        // Ici, maintenant on mélange les chiffres !
        let numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (let num of numbers) {
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

// Maintenant il faut utiliser la fonction solveSudoku pour générer
// une grille de sudoku valide

const generateFullGrid = () => {
  const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
  solveSudoku(grid);
  return grid;
};

// Il reste à intégrer la grille dans le HTML
const cells = document.querySelectorAll("#sudoku-grid input");

const displayGrid = (grid) => {
  cells.forEach((cell, index) => {
    const row = Math.floor(index / 9);
    const col = index % 9;
    // Ici, j'ai ajouté le fait que les cases non vides au début du jeu
    // ne peuvent pas être modifiées !
    if (grid[row][col] !== 0) {
      cell.value = grid[row][col];
      cell.setAttribute("readonly", "readonly");
    } else {
      cell.value = "";
      cell.removeAttribute("readonly");
    }
  });
};

/** Maintenant que j'ai ma grille générée aléatoirement, il faut
 * "cacher des chiffres pour jouer */

/** Ici, je n'avais pas pensé à une chose : L'unicité de la solution
En testant un sudoku généré, à la fin, j'avais plusieurs solutions possibles...
Donc => Vérification qu'il n'y a qu'une unique solution ! 
Pour cela, on créé d'abord une fonction qui compte le nombre de solution **/

let solutionCount = 0;
const countSolutions = (grid) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (canPlaceNumber(grid, row, col, num)) {
            grid[row][col] = num;
            countSolutions(grid);
            grid[row][col] = 0;
          }
        }
        return;
      }
    }
  }
  solutionCount++;
};

const hideNumbersWithUniqueSolution = (grid, emptyCells) => {
  let maskedGrid = grid.map((row) => [...row]);
  let cellstoEmpty = emptyCells;

  while (cellstoEmpty > 0) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);

    if (maskedGrid[row][col] !== 0) {
      const temp = maskedGrid[row][col];
      maskedGrid[row][col] = 0;

      solutionCount = 0;
      countSolutions(maskedGrid);

      if (solutionCount !== 1) {
        maskedGrid[row][col] = temp;
      } else {
        cellstoEmpty--;
      }
    }
  }
  return maskedGrid;
};

// Pour éviter les conflits entre les parties sauvegardées et les nouvelles parties !
// Il faut réinitialiser la grille avant d'en recréer une autre
const resetGrid = () => {
  cells.forEach((cell) => {
    cell.value = "";
    cell.removeAttribute("readonly");
    cell.style.color = "";
  });
};

const startGameWithDifficulty = (difficulty) => {
  resetGrid();

  let emptyCells = 0;
  if (difficulty === "easy") {
    emptyCells = 30;
  } else if (difficulty === "medium") {
    emptyCells = 40;
  } else if (difficulty === "hard") {
    emptyCells = 50;
  }

  document.getElementById("check-button").style.display = "none";
  document.getElementById("result").innerText = "";
  const fullGrid = generateFullGrid();
  const gameGrid = hideNumbersWithUniqueSolution(fullGrid, emptyCells);
  displayGrid(gameGrid);
};

document.querySelectorAll("#difficulty-selector button").forEach((button) => {
  button.addEventListener("click", () => {
    const difficulty = button.getAttribute("data-difficulty");
    startGameWithDifficulty(difficulty);
  });
});

// Vérification de la grille (bouton caché jusqu'à ce que l'user entre le dernier chiffre)
const checkIfGridIsFilled = () => {
  const allCellsFilled = Array.from(cells).every((cell) => cell.value !== "");
  if (allCellsFilled) {
    document.getElementById("check-button").style.display = "block";
  }
};

cells.forEach((cell) => {
  cell.addEventListener("input", () => {
    checkIfGridIsFilled();
  });
});

const checkArray = (arr) => {
  const set = new Set();
  for (let num of arr) {
    if (num === 0 || set.has(num)) {
      return false;
    }
    set.add(num);
  }
  return set.size === 9;
};

// Et la on vérifie si les règles du sudoku sont respectées
const checkSudokuRules = (grid) => {
  for (let i = 0; i < 9; i++) {
    if (!checkArray(grid[i])) {
      return false;
    }

    const col = grid.map((row) => row[i]);
    if (!checkArray(col)) {
      return false;
    }

    const startRow = 3 * Math.floor(i / 3);
    const startCol = 3 * (i % 3);
    const block = [];
    for (let row = startRow; row < startRow + 3; row++) {
      for (let col = startCol; col < startCol + 3; col++) {
        block.push(grid[row][col]);
      }
    }
    if (!checkArray(block)) {
      return false;
    }
  }
  return true;
};
// Et on ajoute l'événémenet au bouton
document.getElementById("check-button").addEventListener("click", () => {
  const userGrid = Array.from(cells).map((cell) => Number(cell.value) || 0);
  const grid = [];
  for (let i = 0; i < 9; i++) {
    grid.push(userGrid.slice(i * 9, (i + 1) * 9));
  }

  const result = checkSudokuRules(grid);
  document.getElementById("result").innerText = result
    ? "Bravo, vous avez réussi !"
    : "Il y a une erreur quelque part.";
});

/** Je vais faire en sorte que l'user puisse sauvegarder / charger sa partie !
Pour ça je vais utiliser le localStorage */

const saveGame = () => {
  const currentGrid = [];
  cells.forEach((cell) => {
    currentGrid.push({
      value: cell.value ? cell.value : "",
      // Je n'avais pas pensé à une chose : cases modifiables ou non !
      readonly: cell.hasAttribute("readonly"),
    });
  });

  localStorage.setItem("sudokuSave", JSON.stringify(currentGrid));
  alert("Votre partie a été sauvegardée !");
};

const loadGame = () => {
  const savedGrid = localStorage.getItem("sudokuSave");

  if (!savedGrid) {
    alert("Aucune partie trouvée !");
    return;
  }
  const currentGrid = JSON.parse(savedGrid);

  cells.forEach((cell, index) => {
    cell.value = currentGrid[index].value ? currentGrid[index].value : "";

    // Restaurer l'état readonly
    if (currentGrid[index].readonly) {
      cell.setAttribute("readonly", "readonly");
      cell.style.color = "#333";
    } else {
      cell.removeAttribute("readonly");
      cell.style.color = "#486aca";
    }
  });

  alert("Votre partie a été chargée !");
};

document.getElementById("save-button").addEventListener("click", saveGame);
document.getElementById("load-button").addEventListener("click", loadGame);
