(function () {
  "use strict";

  class AppController {
    constructor() {
      this.root = document.getElementById("game");
      this.titleScreen = document.getElementById("titleScreen");
      this.resultScreen = document.getElementById("resultScreen");
      this.resultTitle = document.getElementById("resultTitle");
      this.resultText = document.getElementById("resultText");
      this.playButton = document.getElementById("playButton");
      this.playAgainButton = document.getElementById("playAgainButton");
      this.backToTitleButton = document.getElementById("backToTitleButton");
      this.state = "title";

      this.game = new GameManager({
        onRoundEnd: (outcome) => this.showResult(outcome)
      });

      this.playButton.addEventListener("click", () => this.play());
      this.playAgainButton.addEventListener("click", () => this.play());
      this.backToTitleButton.addEventListener("click", () => this.showTitle());
    }

    start() {
      this.showTitle();
    }

    setState(state) {
      this.state = state;
      this.root.dataset.state = state;
      this.titleScreen.hidden = state !== "title";
      this.resultScreen.hidden = state !== "result";
    }

    play() {
      this.setState("playing");
      this.game.startRound();
    }

    showTitle() {
      this.game.resetRound();
      this.setState("title");
    }

    showResult(outcome) {
      const victory = outcome === "victory";
      this.resultTitle.textContent = victory ? "Skelly Steve Yields" : "Brolo Has Collapsed";
      this.resultText.textContent = victory
        ? "A complete tactical triumph, except for the parts that looked improvised."
        : "The posture was excellent. The survival was less convincing.";
      this.setState("result");
    }
  }

  window.AppController = AppController;
})();
