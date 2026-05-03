(function () {
  "use strict";

  class InputManager {
    constructor(game) {
      this.game = game;
      this.pointer = {
        x: game.bounds.width / 2,
        y: game.bounds.height / 2,
        clientX: game.bounds.width / 2,
        clientY: game.bounds.height / 2
      };
      this.draggingCard = null;
      this.hoveredCard = null;

      window.addEventListener("pointermove", (event) => this.onPointerMove(event));
      window.addEventListener("pointerdown", (event) => this.onPointerDown(event));
      window.addEventListener("pointerup", (event) => this.onPointerUp(event));
      window.addEventListener("pointercancel", (event) => this.onPointerCancel(event));
      window.addEventListener("blur", () => this.cancelDrag());
    }

    updatePointer(event) {
      const rect = this.game.root.getBoundingClientRect();
      this.pointer.clientX = event.clientX;
      this.pointer.clientY = event.clientY;
      this.pointer.x = event.clientX - rect.left;
      this.pointer.y = event.clientY - rect.top;
    }

    onPointerMove(event) {
      this.updatePointer(event);
      if (this.draggingCard) {
        this.game.onCardDrag(this.draggingCard, this.pointer);
        return;
      }
      this.updateHover();
    }

    onPointerDown(event) {
      if (event.button !== 0 || !this.game.canAcceptCardInput()) {
        return;
      }

      this.updatePointer(event);
      this.updateHover();
      if (!this.hoveredCard) {
        return;
      }

      event.preventDefault();
      this.draggingCard = this.hoveredCard;
      this.hoveredCard = null;
      this.draggingCard.startDrag(this.pointer);
      this.game.onCardDragStart(this.draggingCard, this.pointer);
    }

    onPointerUp(event) {
      this.updatePointer(event);
      if (!this.draggingCard) {
        return;
      }

      const card = this.draggingCard;
      this.draggingCard = null;
      this.game.onCardRelease(card, this.pointer);
      this.updateHover();
    }

    onPointerCancel(event) {
      this.updatePointer(event);
      this.cancelDrag();
    }

    cancelDrag() {
      if (this.draggingCard) {
        this.draggingCard.returnToHand();
        this.draggingCard = null;
        this.game.clearDragTargets();
      }
    }

    updateHover() {
      const next = this.game.getTopCardAt(this.pointer.clientX, this.pointer.clientY);
      if (next === this.hoveredCard) {
        return;
      }

      if (this.hoveredCard) {
        this.hoveredCard.unhover();
      }
      this.hoveredCard = next;
      if (this.hoveredCard) {
        this.hoveredCard.hover();
        this.game.onCardHover(this.hoveredCard);
      }
    }
  }

  window.InputManager = InputManager;
})();
