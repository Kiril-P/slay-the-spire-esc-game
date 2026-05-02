(function () {
  "use strict";

  class Enemy extends Character {
    constructor(config) {
      super(config);
      this.intentText = document.getElementById(config.intentId);
      this.turnIndex = 1;
      this.intentDamage = 8;
      this.updateIntent();
    }

    updateIntent() {
      if (!this.intentText) {
        return;
      }

      if (!this.isAlive()) {
        this.intentText.textContent = "Defeated";
        return;
      }

      this.intentText.textContent = `Attack ${this.intentDamage}`;
    }

    chooseNextIntent() {
      this.turnIndex += 1;
      const pattern = [8, 10, 7, 12];
      this.intentDamage = pattern[(this.turnIndex - 1) % pattern.length];
      this.updateIntent();
    }

    async attack(player, animationManager) {
      if (!this.isAlive()) {
        return;
      }

      this.flash("attack-lunge", 560);
      await GameUtils.wait(290);
      const impact = player.takeDamage(this.intentDamage);
      const center = player.getCenter();
      if (impact.damage > 0) {
        animationManager.floatingText(`-${impact.damage} Health`, center.x, center.y - 70, "damage");
      } else {
        animationManager.floatingText("Blocked", center.x, center.y - 70, "block");
      }
      animationManager.burst(center.x, center.y - 45, {
        count: 16,
        colors: ["#ff9a58", "#fff0a4", "#9a66ff"],
        maxSpeed: 150
      });
      this.chooseNextIntent();
    }

    boneGag(animationManager) {
      if (!this.isAlive()) {
        return;
      }

      this.flash("bone-slip", 760);
      const center = this.getCenter();
      animationManager.floatingText("Bones reattached", center.x, center.y - 110, "block");
      animationManager.burst(center.x, center.y - 70, {
        count: 10,
        colors: ["#fff7dc", "#d9c5ff", "#f2c66d"],
        maxSpeed: 90,
        life: 0.62
      });
    }
  }

  window.Enemy = Enemy;
})();
