(function (window) {
  'use strict';

  function cloneMatrix(mat) {
    return mat.map(function (row) { return row.slice(); });
  }

  // конструктор
  function Game2048(size) {
    this.size = size || 4;
    this.score = 0;
    this.grid = []; // матрица size x size
    this.prevState = null; // для undo (хранит {grid, score})
    this.isOver = false;
    this.storageKey = 'game2048_state';
  }

  // Инициализация новой игры
  Game2048.prototype.init = function () {
    this.score = 0;
    this.isOver = false;
    this.grid = [];
    for (var r = 0; r < this.size; r++) {
      var row = [];
      for (var c = 0; c < this.size; c++) row.push(0);
      this.grid.push(row);
    }
    // В начале 1-3 случайных тайла
    var initialCount = Math.floor(Math.random() * 3) + 1; // 1..3
    for (var i = 0; i < initialCount; i++) this.addRandomTile();
    this.saveStateToStorage();
  };

  // Сохранение текущего состояния в prevState (для undo)
  Game2048.prototype._savePrev = function () {
    this.prevState = {
      grid: cloneMatrix(this.grid),
      score: this.score
    };
  };

  // Восстановить предыдущий ход (undo). Возвращает true если получилось.
  Game2048.prototype.undo = function () {
    if (!this.prevState || this.isOver) return false;
    this.grid = cloneMatrix(this.prevState.grid);
    this.score = this.prevState.score;
    this.prevState = null;
    this.isOver = false;
    this.saveStateToStorage();
    return true;
  };

  // Добавляет новую плитку 2 или 4 в случайную пустую ячейку.
  // Есть шанс 25% для 4, 75% - 2 
  Game2048.prototype.addRandomTile = function () {
    var empty = [];
    for (var r = 0; r < this.size; r++) {
      for (var c = 0; c < this.size; c++) {
        if (this.grid[r][c] === 0) empty.push([r, c]);
      }
    }
    if (empty.length === 0) return false;
    var spawnCount = 1;
    var idx = Math.floor(Math.random() * empty.length);
    var val = Math.random() < 0.25 ? 4 : 2;
    var cell = empty.splice(idx, 1)[0];
    this.grid[cell[0]][cell[1]] = val;

    // шанс добавить вторую плитку (20%)
    if (empty.length > 0 && Math.random() < 0.2) {
      var idx2 = Math.floor(Math.random() * empty.length);
      var val2 = Math.random() < 0.25 ? 4 : 2;
      var cell2 = empty[idx2];
      this.grid[cell2[0]][cell2[1]] = val2;
      spawnCount = 2;
    }
    return spawnCount;
  };

  // Вспомогательная функция: сдвигает и объединяет массив row (влево),
  // возвращает {newRow, gainedScore, moved}
  Game2048.prototype._compressAndMergeRow = function (row) {
    var size = row.length;
    var newRow = row.filter(function (v) { return v !== 0; });
    var gained = 0;
    var moved = false;
    // объединения
    for (var i = 0; i < newRow.length - 1; i++) {
      if (newRow[i] === newRow[i + 1]) {
        newRow[i] = newRow[i] * 2;
        gained += newRow[i];
        newRow.splice(i + 1, 1);
        newRow.push(0); // чтобы сохранять длину ниже обработкой
      }
    }
    while (newRow.length < size) newRow.push(0);

    // выяснить, изменился ли ряд по сравнению с входным
    for (var j = 0; j < size; j++) if (newRow[j] !== row[j]) { moved = true; break; }

    return { newRow: newRow, gainedScore: gained, moved: moved };
  };

  // Общая логика хода: direction = 'left','right','up','down'
  Game2048.prototype.move = function (direction) {
    if (this.isOver) return { moved: false, score: 0 };
    var movedOverall = false;
    var gainedTotal = 0;

    // Сохраняем предыдущую для undo
    this._savePrev();

    // helper для поворота/трансформации матрицы
    var self = this;
    function rotateGrid90Clockwise(mat) {
      var n = mat.length;
      var res = [];
      for (var r = 0; r < n; r++) {
        res[r] = [];
        for (var c = 0; c < n; c++) {
          res[r][c] = mat[n - c - 1][r];
        }
      }
      return res;
    }
    function rotateGrid(mat, times) {
      var res = cloneMatrix(mat);
      for (var t = 0; t < (times % 4); t++) res = rotateGrid90Clockwise(res);
      return res;
    }

    // чтобы унифицировать, преобразуем задачу к сдвигу влево:
    // mapping: left -> rotate 0, up -> rotate 1 (90 cw), right -> rotate 2, down -> rotate 3
    var rotateTimes = 0;
    if (direction === 'left') rotateTimes = 0;
    else if (direction === 'up') rotateTimes = 1;
    else if (direction === 'right') rotateTimes = 2;
    else if (direction === 'down') rotateTimes = 3;
    else return { moved: false, score: 0 };

    var working = rotateGrid(this.grid, rotateTimes);

    for (var r = 0; r < this.size; r++) {
      var row = working[r].slice();
      var res = this._compressAndMergeRow(row);
      if (res.moved) movedOverall = true;
      if (res.gainedScore) gainedTotal += res.gainedScore;
      working[r] = res.newRow;
    }

    //исходная ориентация
    var finalGrid = rotateGrid(working, (4 - rotateTimes) % 4);

    if (movedOverall) {
      this.grid = finalGrid;
      this.score += gainedTotal;
      this.addRandomTile();
      if (this.checkGameOver()) {
        this.isOver = true;
      }
      this.saveStateToStorage();
    } else {
      // если не было ходов — отмена prevState
      this.prevState = null;
    }

    return { moved: movedOverall, score: gainedTotal };
  };

  // Проверка наличия доступных ходов
  Game2048.prototype.checkGameOver = function () {
    // если есть пустая клетка — ещё можно ходить
    for (var r = 0; r < this.size; r++) {
      for (var c = 0; c < this.size; c++) {
        if (this.grid[r][c] === 0) return false;
      }
    }
    // если есть соседние равные по горизонтали или вертикали — можно ходить
    for (var i = 0; i < this.size; i++) {
      for (var j = 0; j < this.size - 1; j++) {
        if (this.grid[i][j] === this.grid[i][j + 1]) return false;
        if (this.grid[j][i] === this.grid[j + 1][i]) return false;
      }
    }
    return true; // ходы невозможны
  };

  // Сохранение состояния игры в localStorage
  Game2048.prototype.saveStateToStorage = function () {
    try {
      var payload = {
        size: this.size,
        score: this.score,
        grid: this.grid,
        isOver: this.isOver,
        timestamp: Date.now()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(payload));
    } catch (e) {
    }
  };

  // Загрузка состояния из localStorage. Возвращает true если загрузили.
  Game2048.prototype.loadStateFromStorage = function () {
    try {
      var raw = localStorage.getItem(this.storageKey);
      if (!raw) return false;
      var payload = JSON.parse(raw);
      if (!payload || !payload.grid) return false;
      this.size = payload.size || this.size;
      this.grid = payload.grid;
      this.score = payload.score || 0;
      this.isOver = !!payload.isOver;
      return true;
    } catch (e) {
      return false;
    }
  };

  // Сброс состояния (новая игра)
  Game2048.prototype.reset = function () {
    this.prevState = null;
    this.init();
  };

  // Экспорт
  window.Game2048 = Game2048;

})(window);
