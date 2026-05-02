(function () {
  "use strict";

  let nextCardId = 1;

  class Card {
    constructor(definition, game) {
      this.id = nextCardId;
      nextCardId += 1;
      this.definition = definition;
      this.game = game;
      this.state = "idle";
      this.x = game.bounds.width / 2;
      this.y = game.bounds.height + 180;
      this.rotation = 0;
      this.scale = 0.78;
      this.targetX = this.x;
      this.targetY = this.y;
      this.targetRotation = 0;
      this.targetScale = 1;
      this.homeX = this.x;
      this.homeY = this.y;
      this.homeRotation = 0;
      this.homeScale = 1;
      this.dragOffsetX = 0;
      this.dragOffsetY = 0;
      this.baseZ = 100;
      this.playedCallback = null;

      this.element = this.createElement();
      this.game.cardLayer.appendChild(this.element);
    }

    createElement() {
      const card = document.createElement("article");
      card.className = "game-card";
      card.dataset.cardId = String(this.id);
      card.setAttribute("aria-label", this.definition.name);

      const image = document.createElement("img");
      image.className = "card-art";
      image.src = this.definition.asset;
      image.alt = "";
      image.draggable = false;

      const overlay = document.createElement("div");
      overlay.className = "card-overlay";
      overlay.innerHTML = `
        <div class="card-cost">${this.definition.cost}</div>
        <div class="card-title">${this.definition.name}</div>
        <div class="card-type">${this.definition.typeLabel}</div>
        <div class="card-text">${this.definition.text}</div>
      `;

      card.appendChild(image);
      card.appendChild(overlay);
      return card;
    }

    setHomeTarget(x, y, rotation, scale, z) {
      this.homeX = x;
      this.homeY = y;
      this.homeRotation = rotation;
      this.homeScale = scale;
      this.baseZ = z;
    }

    canHover() {
      return this.state === "idle" || this.state === "hover" || this.state === "returning";
    }

    hover() {
      if (!this.canHover()) {
        return;
      }
      this.state = "hover";
      this.element.classList.add("hovered");
    }

    unhover() {
      if (this.state === "hover") {
        this.state = "idle";
      }
      this.element.classList.remove("hovered");
    }

    startDrag(pointer) {
      this.state = "drag";
      this.dragOffsetX = this.x - pointer.x;
      this.dragOffsetY = this.y - pointer.y;
      this.element.classList.add("dragging");
      this.element.classList.remove("hovered");
    }

    returnToHand() {
      this.state = "returning";
      this.element.classList.remove("dragging");
      this.element.classList.remove("hovered");
    }

    playToDiscard(target, callback) {
      this.state = "played";
      this.playedCallback = callback;
      this.targetX = target.x;
      this.targetY = target.y;
      this.targetRotation = target.rotation;
      this.targetScale = target.scale;
      this.element.classList.add("played");
      this.element.classList.remove("dragging");
      this.element.classList.remove("hovered");
    }

    remove() {
      this.element.remove();
    }

    containsClientPoint(x, y) {
      if (!this.canHover()) {
        return false;
      }
      const rect = this.element.getBoundingClientRect();
      return GameUtils.rectContains(rect, x, y);
    }

    update(dt, pointer) {
      this.updateTarget(pointer);

      const speed = this.state === "drag" ? 0.34 : this.state === "played" ? 0.16 : 0.18;
      this.x = GameUtils.lerp(this.x, this.targetX, speed);
      this.y = GameUtils.lerp(this.y, this.targetY, speed);
      this.rotation = GameUtils.lerpAngle(this.rotation, this.targetRotation, speed);
      this.scale = GameUtils.lerp(this.scale, this.targetScale, speed);

      if (this.state === "returning") {
        const dx = Math.abs(this.x - this.homeX);
        const dy = Math.abs(this.y - this.homeY);
        if (dx + dy < 1.3 && Math.abs(this.rotation - this.homeRotation) < 0.6) {
          this.state = "idle";
        }
      }

      if (this.state === "played") {
        const distance = Math.abs(this.x - this.targetX) + Math.abs(this.y - this.targetY);
        if (distance < 4 && this.playedCallback) {
          const callback = this.playedCallback;
          this.playedCallback = null;
          callback(this);
        }
      }

      this.render();
    }

    updateTarget(pointer) {
      if (this.state === "hover") {
        this.targetX = this.homeX;
        this.targetY = this.homeY - this.game.cardLift;
        this.targetRotation = 0;
        this.targetScale = 1.16;
        return;
      }

      if (this.state === "drag") {
        this.targetX = pointer.x + this.dragOffsetX;
        this.targetY = pointer.y + this.dragOffsetY;
        this.targetRotation = 0;
        this.targetScale = 1.16;
        return;
      }

      if (this.state === "played") {
        return;
      }

      this.targetX = this.homeX;
      this.targetY = this.homeY;
      this.targetRotation = this.homeRotation;
      this.targetScale = this.homeScale;
    }

    render() {
      const z = this.state === "drag" ? 5000 : this.state === "hover" ? 4000 : this.state === "played" ? 3000 : this.baseZ;
      this.element.style.zIndex = String(z);
      this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0) translate(-50%, -50%) rotate(${this.rotation}deg) scale(${this.scale})`;
    }
  }

  window.Card = Card;
})();
