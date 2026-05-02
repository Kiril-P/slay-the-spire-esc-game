(function () {
  "use strict";

  class Deck {
    constructor(cardDefinitions) {
      this.cardDefinitions = cardDefinitions;
      this.drawPile = [];
      this.discardPile = [];
      this.reset();
    }

    reset() {
      this.drawPile = this.shuffle(this.cardDefinitions.slice());
      this.discardPile = [];
    }

    shuffle(cards) {
      const copy = cards.slice();
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = copy[i];
        copy[i] = copy[j];
        copy[j] = temp;
      }
      return copy;
    }

    draw(count) {
      const drawn = [];
      while (drawn.length < count) {
        if (this.drawPile.length === 0) {
          if (this.discardPile.length === 0) {
            break;
          }
          this.drawPile = this.shuffle(this.discardPile);
          this.discardPile = [];
        }
        drawn.push(this.drawPile.shift());
      }
      return drawn;
    }

    discard(cardDefinition) {
      this.discardPile.push(cardDefinition);
    }

    counts() {
      return {
        deck: this.drawPile.length,
        discard: this.discardPile.length
      };
    }
  }

  window.Deck = Deck;
})();
