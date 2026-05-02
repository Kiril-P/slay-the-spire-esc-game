(function () {
  "use strict";

  class Character {
    constructor(config) {
      this.name = config.name;
      this.maxHp = config.maxHp;
      this.hp = config.hp;
      this.block = config.block || 0;
      this.slot = document.getElementById(config.slotId);
      this.sprite = document.getElementById(config.spriteId);
      this.healthFill = document.getElementById(config.healthFillId);
      this.healthText = document.getElementById(config.healthTextId);
      this.statusText = config.statusId ? document.getElementById(config.statusId) : null;
      this.updateUI();
    }

    isAlive() {
      return this.hp > 0;
    }

    gainBlock(amount) {
      this.block += amount;
      this.updateUI();
    }

    clearBlock() {
      this.block = 0;
      this.updateUI();
    }

    heal(amount) {
      const before = this.hp;
      this.hp = GameUtils.clamp(this.hp + amount, 0, this.maxHp);
      this.updateUI();
      return this.hp - before;
    }

    takeDamage(amount) {
      const blocked = Math.min(this.block, amount);
      this.block -= blocked;
      const damage = amount - blocked;
      this.hp = GameUtils.clamp(this.hp - damage, 0, this.maxHp);
      this.flash("hit", 420);
      this.updateUI();
      return { damage, blocked };
    }

    flash(className, duration) {
      this.slot.classList.remove(className);
      void this.slot.offsetWidth;
      this.slot.classList.add(className);
      window.setTimeout(() => this.slot.classList.remove(className), duration);
    }

    updateUI() {
      const percent = this.maxHp > 0 ? this.hp / this.maxHp : 0;
      if (this.healthFill) {
        this.healthFill.style.transform = `scaleX(${GameUtils.clamp(percent, 0, 1)})`;
      }
      if (this.healthText) {
        this.healthText.textContent = `${this.hp}/${this.maxHp}`;
      }
      if (this.statusText) {
        this.statusText.textContent = `Block ${this.block}`;
      }
    }

    getCenter() {
      const rect = this.sprite.getBoundingClientRect();
      return {
        x: rect.left + rect.width * 0.5,
        y: rect.top + rect.height * 0.48
      };
    }

    getCastPoint() {
      const rect = this.sprite.getBoundingClientRect();
      return {
        x: rect.left + rect.width * 0.42,
        y: rect.top + rect.height * 0.33
      };
    }

    getHitbox() {
      const rect = this.sprite.getBoundingClientRect();
      const insetX = rect.width * 0.16;
      const insetTop = rect.height * 0.08;
      const insetBottom = rect.height * 0.08;
      return {
        left: rect.left + insetX,
        right: rect.right - insetX,
        top: rect.top + insetTop,
        bottom: rect.bottom - insetBottom,
        width: rect.width - insetX * 2,
        height: rect.height - insetTop - insetBottom
      };
    }
  }

  window.Character = Character;
})();
