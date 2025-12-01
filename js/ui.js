(function (window, document) {
  'use strict';

  /** Создаёт сетку size×size внутри контейнера */
  function createGrid(containerSelector, size) {
    var container = document.querySelector(containerSelector);
    if (!container) return;
    container.innerHTML = '';
    for (var r = 0; r < size; r++) {
      for (var c = 0; c < size; c++) {
        var cell = document.createElement('div');
        cell.className = 'cell';
        cell.setAttribute('data-pos', r + '-' + c);
        container.appendChild(cell);
      }
    }
  }

  /** Отрисовывает текущее состояние board (матрица) в DOM (внутри .cell) */
  function renderBoard(board) {
    if (!board || !board.length) return;
    var cells = document.querySelectorAll('.grid .cell');
    //сетка уже создана и количество ячеек совпадает
    var idx = 0;
    for (var r = 0; r < board.length; r++) {
      for (var c = 0; c < board[r].length; c++) {
        var value = board[r][c];
        var el = cells[idx];
        if (!el) { idx++; continue; }
        el.className = 'cell';
        if (value && value > 0) {
          el.textContent = String(value);
          el.classList.add('cell-filled');
          el.classList.add('cell-' + value);
        } else {
          el.textContent = '';
        }
        idx++;
      }
    }
  }

  /** Обновляет текст текущего счёта */
  function renderScore(value) {
    var el = document.getElementById('current-score');
    if (el) el.textContent = String(value);
    var finalEl = document.getElementById('final-score');
    if (finalEl) finalEl.textContent = String(value);
  }

  /** Открыть модал */
  function openModal(id) {
    var modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  /** Закрыть модал */
  function closeModal(id) {
    var modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  /**
   * Заполняет таблицу рекордов.
   * records: [{ name: "...", score: number, date: "dd.mm.yyyy" }]
   */
  function populateLeaderboard(selector, records) {
    var tbody = document.querySelector(selector + ' tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!records || records.length === 0) {
      var tr = document.createElement('tr');
      var td = document.createElement('td');
      td.setAttribute('colspan', '4');
      td.textContent = 'Пока нет сохранённых рекордов.';
      td.style.opacity = '0.8';
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }
    for (var i = 0; i < Math.min(10, records.length); i++) {
      var row = document.createElement('tr');
      var tdIndex = document.createElement('td');
      tdIndex.textContent = String(i + 1);
      row.appendChild(tdIndex);
      var tdName = document.createElement('td');
      tdName.textContent = records[i].name;
      row.appendChild(tdName);
      var tdScore = document.createElement('td');
      tdScore.textContent = String(records[i].score);
      row.appendChild(tdScore);
      var tdDate = document.createElement('td');
      tdDate.textContent = records[i].date || '—';
      row.appendChild(tdDate);
      tbody.appendChild(row);
    }
  }

  /** Показать модалку Game Over с финальным счётом */
  function showGameOver(score) {
    var modal = document.getElementById('gameover-modal');
    if (!modal) return;
    var scoreEl = document.getElementById('final-score');
    if (scoreEl) scoreEl.textContent = String(score);
    var saveMsg = document.getElementById('save-msg');
    if (saveMsg) saveMsg.style.opacity = 0;
    var nameInput = document.getElementById('player-name');
    if (nameInput) nameInput.value = '';
    openModal('gameover-modal');
  }

  /** Сохраняет имя игрока, дату и счёт в localStorage */
  function savePlayerName() {
    var nameInput = document.getElementById('player-name');
    var saveMsg = document.getElementById('save-msg');
    if (!nameInput || !saveMsg) return;
    if (nameInput.value.trim() === '') return;
    var today = new Date();
    var dateStr = today.getDate() + '.' + (today.getMonth() + 1) + '.' + today.getFullYear();
    var records = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    records.push({
      name: nameInput.value.trim(),
      score: parseInt(document.getElementById('final-score').textContent, 10),
      date: dateStr
    });
    records.sort((a, b) => b.score - a.score); // sort(топ-10)
    records = records.slice(0, 10);
    localStorage.setItem('leaderboard', JSON.stringify(records));
    saveMsg.style.opacity = 1;
    populateLeaderboard('#leaderboard-table', records);
  }

  window.UI = {
    createGrid: createGrid,
    renderBoard: renderBoard,
    renderScore: renderScore,
    openModal: openModal,
    closeModal: closeModal,
    populateLeaderboard: populateLeaderboard,
    showGameOver: showGameOver,
    savePlayerName: savePlayerName
  };
})(window, document);
