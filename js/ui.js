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

  /** Обновляет текст текущего счёта */
  function renderScore(value) {
    var el = document.getElementById('current-score');
    if (el) el.textContent = String(value);
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
   * records: [{ name: "...", score: number }]
   */
  function populateLeaderboard(selector, records) {
    var tbody = document.querySelector(selector + ' tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!records || records.length === 0) {
      var tr = document.createElement('tr');
      var td = document.createElement('td');
      td.setAttribute('colspan', '3');
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

      tbody.appendChild(row);
    }
  }

  window.UI = {
    createGrid: createGrid,
    renderScore: renderScore,
    openModal: openModal,
    closeModal: closeModal,
    populateLeaderboard: populateLeaderboard
  };
})(window, document);
