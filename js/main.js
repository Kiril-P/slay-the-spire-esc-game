(function () {
  "use strict";

  window.addEventListener("DOMContentLoaded", () => {
    const game = new GameManager();
    window.broloGame = game;
    game.start();
  });
})();
