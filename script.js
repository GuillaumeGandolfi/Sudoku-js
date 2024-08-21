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
