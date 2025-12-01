document.addEventListener('DOMContentLoaded', function () {

  // создание игру
  var game = new Game2048(4);

  // если есть состояние в localStorage — загружаем, иначе инициализируем новую игру
  var loaded = game.loadStateFromStorage();
  if (!loaded) game.init();

  // создание DOM-сетки и рендеринг
  UI.createGrid('#grid', game.size);
  UI.renderBoard(game.grid);
  UI.renderScore(game.score);

  // элементы
  var btnNew = document.getElementById('btn-new');
  var btnUndo = document.getElementById('btn-undo');
  var btnLeader = document.getElementById('btn-leader');
  var leaderClose = document.getElementById('leader-close');
  var leaderClose2 = document.getElementById('leader-close-2');
  var leaderClear = document.getElementById('leader-clear');

  // новая игра
  btnNew.addEventListener('click', function () {
    game.reset();
    UI.renderBoard(game.grid);
    UI.renderScore(game.score);
    btnUndo.disabled = true;
  });

  // undo
  btnUndo.addEventListener('click', function () {
    var ok = game.undo();
    if (ok) {
      UI.renderBoard(game.grid);
      UI.renderScore(game.score);
      btnUndo.disabled = true; // после undo доступен один откат
    }
  });

  // leaderboard - загрузка из localStorage
  btnLeader.addEventListener('click', function () {
    var records = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    UI.populateLeaderboard('#leaderboard-table', records);
    UI.openModal('leaderboard-modal');
  });

  function closeLeaderboard() { UI.closeModal('leaderboard-modal'); }
  leaderClose.addEventListener('click', closeLeaderboard);
  leaderClose2.addEventListener('click', closeLeaderboard);

  leaderClear.addEventListener('click', function () {
    localStorage.removeItem('leaderboard');
    UI.populateLeaderboard('#leaderboard-table', []);
  });

  // Game Over buttons
  document.getElementById('save-score').addEventListener('click', function () {
    UI.savePlayerName();
    setTimeout(function () {
      UI.closeModal('gameover-modal');
    }, 700);
  });

  document.getElementById('restart-game').addEventListener('click', function () {
    UI.closeModal('gameover-modal');
    game.reset();
    UI.renderBoard(game.grid);
    UI.renderScore(game.score);
    btnUndo.disabled = true;
  });

  // Управление клавиатурой (стрелки)
  document.addEventListener('keydown', function (e) {
    var handled = false;
    if (e.key === 'ArrowLeft') handled = 'left';
    else if (e.key === 'ArrowRight') handled = 'right';
    else if (e.key === 'ArrowUp') handled = 'up';
    else if (e.key === 'ArrowDown') handled = 'down';

    if (!handled) return;

    e.preventDefault();

    var res = game.move(handled);
    if (res.moved) {
      UI.renderBoard(game.grid);
      UI.renderScore(game.score);
      btnUndo.disabled = false;
      // если игра закончилась — показать модалку Game Over
      if (game.isOver) {
        UI.showGameOver(game.score);
      }
    }
  });

  // Сохранение состояния перед выгрузкой
  window.addEventListener('beforeunload', function () {
    game.saveStateToStorage();
  });
});
