document.addEventListener('DOMContentLoaded', function () {

  // Создаётся сетка 4x4
  UI.createGrid('#grid', 4);

  // Устанавливается начальный счёт
  UI.renderScore(0);

  // Элементы управления
  var btnNew = document.getElementById('btn-new');
  var btnUndo = document.getElementById('btn-undo');
  var btnLeader = document.getElementById('btn-leader');
  var leaderClose = document.getElementById('leader-close');
  var leaderClose2 = document.getElementById('leader-close-2');
  var leaderClear = document.getElementById('leader-clear');

  // Новая игра
  btnNew.addEventListener('click', function () {
    UI.renderScore(0);
    UI.createGrid('#grid', 4);
  });

  // Undo — пока не реализовано
  btnUndo.addEventListener('click', function () {});

  // Открыть таблицу рекордов
  btnLeader.addEventListener('click', function () {
    var records = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    UI.populateLeaderboard('#leaderboard-table', records);
    UI.openModal('leaderboard-modal');
  });

  // Закрытие модалки
  function closeLeaderboard() {
    UI.closeModal('leaderboard-modal');
  }
  leaderClose.addEventListener('click', closeLeaderboard);
  leaderClose2.addEventListener('click', closeLeaderboard);

  // Очистить таблицу
  leaderClear.addEventListener('click', function () {
    localStorage.removeItem('leaderboard');
    UI.populateLeaderboard('#leaderboard-table', []);
  });

  // Game Over — кнопки в модалке
  document.getElementById('save-score').addEventListener('click', UI.savePlayerName);
  document.getElementById('restart-game').addEventListener('click', function() {
    UI.closeModal('gameover-modal');
    UI.renderScore(0);
    UI.createGrid('#grid', 4);
  });
});
