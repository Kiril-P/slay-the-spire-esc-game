(function () {
  "use strict";

  window.addEventListener("DOMContentLoaded", () => {
    const app = new AppController();
    window.broloApp = app;
    window.broloGame = app.game;
    app.start();
  });
})();
