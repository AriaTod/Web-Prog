document.addEventListener('DOMContentLoaded', function () {

  // Создается сетку 4x4
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

  // Новая игра (пока заглушка)
  btnNew.addEventListener('click', function () {
    UI.renderScore(0);
  });

  // Undo — пока не реализовано
  btnUndo.addEventListener('click', function () {});

  // Открыть таблицу рекордов
  btnLeader.addEventListener('click', function () {
    UI.populateLeaderboard('#leaderboard-table', []);
    UI.openModal('leaderboard-modal');
  });

  // Закрытие модалки
  function closeLeaderboard() {
    UI.closeModal('leaderboard-modal');
  }
  leaderClose.addEventListener('click', closeLeaderboard);
  leaderClose2.addEventListener('click', closeLeaderboard);

  // Очистить
  leaderClear.addEventListener('click', function () {
    UI.populateLeaderboard('#leaderboard-table', []);
  });
});
