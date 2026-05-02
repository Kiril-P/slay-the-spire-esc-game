(function () {
  "use strict";

  class GameManager {
    constructor() {
      this.root = document.getElementById("game");
      this.cardLayer = document.getElementById("cardLayer");
      this.playArea = document.getElementById("playArea");
      this.endTurnButton = document.getElementById("endTurnButton");
      this.toast = document.getElementById("battleToast");
      this.bounds = this.root.getBoundingClientRect();
      this.cardLift = 128;
      this.maxEnergy = 3;
      this.energy = this.maxEnergy;
      this.turn = 1;
      this.playerTurn = true;
      this.isBusy = false;
      this.cards = [];
      this.hand = [];
      this.lastTime = performance.now();

      this.animation = new AnimationManager(document.getElementById("effectsCanvas"), this.root);
      this.player = new Character({
        name: "Archmage Brolo",
        maxHp: 80,
        hp: 72,
        block: 0,
        slotId: "playerSlot",
        spriteId: "playerSprite",
        healthFillId: "playerHealthFill",
        healthTextId: "playerHealthText",
        statusId: "playerStatus"
      });
      this.enemy = new Enemy({
        name: "Skelly Steve",
        maxHp: 70,
        hp: 64,
        block: 0,
        slotId: "enemySlot",
        spriteId: "enemySprite",
        healthFillId: "enemyHealthFill",
        healthTextId: "enemyHealthText",
        intentId: "enemyIntent"
      });

      this.cardDefinitions = this.createCardDefinitions();
      this.deck = new Deck(this.cardDefinitions);
      this.input = new InputManager(this);

      this.endTurnButton.addEventListener("click", () => this.endTurn());
      window.addEventListener("resize", () => this.onResize());
    }

    start() {
      this.drawHand();
      this.updateUI();
      this.scheduleBoneGag();
      requestAnimationFrame((time) => this.loop(time));
    }

    createCardDefinitions() {
      return [
        {
          id: "fireball",
          name: "I Cast Fireball",
          typeLabel: "Attack",
          asset: "Assets/card_attack.png",
          cost: 1,
          damage: 10,
          requiresTarget: true,
          text: "Deal 10 damage. Starts wrong, ends right."
        },
        {
          id: "shield",
          name: "Probably Shield",
          typeLabel: "Skill",
          asset: "Assets/card_defend.png",
          cost: 1,
          block: 9,
          requiresTarget: false,
          text: "Gain 9 Block. Books volunteer."
        },
        {
          id: "potion",
          name: "Suspicious Potion",
          typeLabel: "Skill",
          asset: "Assets/card_heal.png",
          cost: 1,
          heal: 7,
          block: 3,
          requiresTarget: false,
          text: "Heal 7. Gain 3 Block. Do not ask."
        },
        {
          id: "static",
          name: "Static Shock",
          typeLabel: "Attack",
          asset: "Assets/card_magic.png",
          cost: 1,
          damage: 7,
          bonusDamage: 3,
          requiresTarget: true,
          text: "Deal 7, then 3 more after a twitch."
        },
        {
          id: "doom",
          name: "Summon Doom",
          typeLabel: "Attack",
          asset: "Assets/card_special.png",
          cost: 2,
          damage: 18,
          requiresTarget: true,
          text: "Deal 18. Doom arrives tiny but loud."
        }
      ];
    }

    loop(time) {
      const dt = Math.min(0.033, (time - this.lastTime) / 1000);
      this.lastTime = time;

      for (const card of this.cards) {
        card.update(dt, this.input.pointer);
      }

      this.updateTargetLine();
      this.animation.update(dt, time);

      requestAnimationFrame((nextTime) => this.loop(nextTime));
    }

    onResize() {
      this.bounds = this.root.getBoundingClientRect();
      this.animation.resize();
      this.layoutHand();
    }

    drawHand() {
      const drawn = this.deck.draw(5);
      for (const definition of drawn) {
        const card = new Card(definition, this);
        this.cards.push(card);
        this.hand.push(card);
      }
      this.layoutHand();
      this.updateUI();
    }

    layoutHand() {
      this.bounds = this.root.getBoundingClientRect();
      const count = this.hand.length;
      if (count === 0) {
        return;
      }

      const sample = this.hand[0].element.getBoundingClientRect();
      const cardWidth = sample.width || 150;
      const cardHeight = sample.height || 225;
      this.cardLift = GameUtils.clamp(cardHeight * 0.48, 86, 138);
      const centerX = this.bounds.width / 2;
      const baseY = this.bounds.height - GameUtils.clamp(cardHeight * 1.05, 180, 260);
      const maxSpread = this.bounds.width * 0.66;
      const spacing = count > 1 ? Math.min(cardWidth * 0.72, maxSpread / (count - 1)) : 0;
      const centerIndex = (count - 1) / 2;

      this.hand.forEach((card, index) => {
        const offset = index - centerIndex;
        const normalized = count > 1 ? offset / centerIndex || 0 : 0;
        const curveDrop = Math.abs(offset) * 13 + Math.abs(normalized) * 10;
        const rotation = offset * GameUtils.clamp(7.2 - count * 0.18, 5.2, 7.2);
        const x = centerX + offset * spacing;
        const y = baseY + curveDrop;
        card.setHomeTarget(x, y, rotation, 1, 120 + index);
      });
    }

    getTopCardAt(clientX, clientY) {
      if (!this.playerTurn || this.isBusy) {
        return null;
      }

      const candidates = this.hand.filter((card) => card.containsClientPoint(clientX, clientY));
      if (candidates.length === 0) {
        return null;
      }

      candidates.sort((a, b) => {
        const az = Number(a.element.style.zIndex || a.baseZ);
        const bz = Number(b.element.style.zIndex || b.baseZ);
        return bz - az;
      });
      return candidates[0];
    }

    onCardHover(card) {
      const rect = card.element.getBoundingClientRect();
      this.animation.sparkleAround(rect, 2);
    }

    onCardDragStart(card) {
      if (card.definition.requiresTarget) {
        this.enemy.slot.classList.add("target-ready");
      } else {
        this.playArea.classList.add("valid-drop");
      }
    }

    onCardDrag(card, pointer) {
      this.animation.spawnTrail(card.x, card.y, performance.now());
      if (card.definition.requiresTarget && this.isPointerOverEnemy(pointer)) {
        this.enemy.slot.classList.add("target-ready");
      }
    }

    onCardRelease(card, pointer) {
      this.clearDragTargets();
      if (!this.playerTurn || this.isBusy) {
        card.returnToHand();
        return;
      }

      const valid = this.isValidRelease(card, pointer);
      if (!valid.ok) {
        card.returnToHand();
        this.animation.floatingText(valid.reason, pointer.x, pointer.y - 36, "block");
        return;
      }

      this.playCard(card);
    }

    clearDragTargets() {
      this.enemy.slot.classList.remove("target-ready");
      this.playArea.classList.remove("valid-drop");
      this.animation.setTargetLine(null, null, false);
    }

    updateTargetLine() {
      const card = this.input.draggingCard;
      if (!card || !card.definition.requiresTarget) {
        this.animation.setTargetLine(null, null, false);
        return;
      }

      this.animation.setTargetLine(
        { x: card.x, y: card.y - card.element.getBoundingClientRect().height * 0.34 },
        { x: this.input.pointer.x, y: this.input.pointer.y },
        true
      );
    }

    isPointerOverEnemy(pointer) {
      return GameUtils.rectContains(this.enemy.getHitbox(), pointer.clientX, pointer.clientY);
    }

    isPointerInPlayArea(pointer) {
      const rect = this.playArea.getBoundingClientRect();
      return GameUtils.rectContains(rect, pointer.clientX, pointer.clientY);
    }

    isValidRelease(card, pointer) {
      if (card.definition.cost > this.energy) {
        return { ok: false, reason: "Not enough Energy" };
      }

      if (card.definition.requiresTarget) {
        if (!this.enemy.isAlive()) {
          return { ok: false, reason: "No target" };
        }
        return this.isPointerOverEnemy(pointer)
          ? { ok: true }
          : { ok: false, reason: "Needs target" };
      }

      return this.isPointerInPlayArea(pointer)
        ? { ok: true }
        : { ok: false, reason: "Play above hand" };
    }

    getDiscardTarget() {
      return {
        x: this.bounds.width - 100,
        y: this.bounds.height - 44,
        rotation: GameUtils.randomBetween(-8, 8),
        scale: 0.28
      };
    }

    playCard(card) {
      this.energy -= card.definition.cost;
      this.hand = this.hand.filter((item) => item !== card);
      this.layoutHand();
      this.updateUI();
      this.player.flash("casting", 480);
      this.setToast(this.getPlayLine(card.definition));

      card.playToDiscard(this.getDiscardTarget(), (playedCard) => {
        playedCard.remove();
        this.cards = this.cards.filter((item) => item !== playedCard);
        this.deck.discard(playedCard.definition);
        this.updateUI();
      });

      const delay = this.getEffectDelay(card.definition);
      window.setTimeout(() => this.resolveCard(card.definition), delay);
    }

    getPlayLine(definition) {
      const lines = {
        fireball: "Brolo aims with complete confidence.",
        shield: "The furniture forms a legal defense.",
        potion: "Brolo drinks first and reads the label second.",
        static: "Static chooses a route. Eventually.",
        doom: "Doom has been summoned. It is small."
      };
      return lines[definition.id] || "Spell cast.";
    }

    getEffectDelay(definition) {
      const delays = {
        fireball: 270,
        shield: 180,
        potion: 340,
        static: 220,
        doom: 480
      };
      return delays[definition.id] || 220;
    }

    resolveCard(definition) {
      if (!this.player.isAlive()) {
        return;
      }

      if (definition.id === "shield") {
        const center = this.player.getCenter();
        this.player.gainBlock(definition.block);
        this.animation.floatingText(`+${definition.block} Block`, center.x, center.y - 98, "block");
        this.animation.burst(center.x, center.y - 52, {
          count: 24,
          colors: ["#6ff4df", "#fff0a4", "#9a66ff"],
          maxSpeed: 180
        });
        return;
      }

      if (definition.id === "potion") {
        const center = this.player.getCenter();
        const healed = this.player.heal(definition.heal);
        this.player.gainBlock(definition.block);
        this.animation.floatingText(`+${healed} Health`, center.x, center.y - 108, "heal");
        window.setTimeout(() => {
          this.animation.floatingText(`+${definition.block} Block`, center.x + 42, center.y - 78, "block");
        }, 180);
        this.animation.burst(center.x, center.y - 52, {
          count: 28,
          colors: ["#5cdf85", "#ff8bd2", "#fff0a4"],
          maxSpeed: 155
        });
        return;
      }

      if (!this.enemy.isAlive()) {
        return;
      }

      const from = this.player.getCastPoint();
      const to = this.enemy.getCenter();
      const projectileOptions = this.projectileOptions(definition);
      this.animation.castProjectile(from, to, projectileOptions, () => {
        this.applyAttack(definition);
      });
    }

    projectileOptions(definition) {
      if (definition.id === "fireball") {
        return {
          color: "#ff9a30",
          secondary: "#ff3c5a",
          size: 18,
          wobble: 42,
          misdirect: 26,
          duration: 0.62
        };
      }
      if (definition.id === "static") {
        return {
          color: "#7bf0ff",
          secondary: "#9a66ff",
          size: 13,
          wobble: 58,
          misdirect: -18,
          duration: 0.48
        };
      }
      return {
        color: "#a06bff",
        secondary: "#191021",
        size: 21,
        wobble: 26,
        misdirect: 10,
        duration: 0.72
      };
    }

    applyAttack(definition) {
      if (!this.enemy.isAlive()) {
        return;
      }

      const center = this.enemy.getCenter();
      const result = this.enemy.takeDamage(definition.damage);
      this.animation.floatingText(`-${result.damage} Health`, center.x, center.y - 95, "damage");

      if (definition.bonusDamage) {
        window.setTimeout(() => {
          if (!this.enemy.isAlive()) {
            return;
          }
          const bonus = this.enemy.takeDamage(definition.bonusDamage);
          const nextCenter = this.enemy.getCenter();
          this.animation.floatingText(`-${bonus.damage} Health`, nextCenter.x + 34, nextCenter.y - 72, "damage");
          this.enemy.boneGag(this.animation);
          this.checkEnemyDefeated();
        }, 310);
      }

      if (definition.id === "doom") {
        window.setTimeout(() => {
          this.enemy.boneGag(this.animation);
        }, 190);
      }

      this.checkEnemyDefeated();
    }

    checkEnemyDefeated() {
      if (this.enemy.isAlive()) {
        this.enemy.updateIntent();
        return;
      }
      const center = this.enemy.getCenter();
      this.enemy.updateIntent();
      this.setToast("Skelly Steve yields, emotionally but politely.");
      this.animation.floatingText("Defeated", center.x, center.y - 132, "damage");
      this.endTurnButton.disabled = true;
      this.playerTurn = false;
    }

    async endTurn() {
      if (!this.playerTurn || this.isBusy) {
        return;
      }

      this.playerTurn = false;
      this.isBusy = true;
      this.energy = 0;
      this.clearDragTargets();
      this.input.cancelDrag();
      this.setToast("Skelly Steve prepares a very sincere attack.");
      this.updateUI();

      const cardsToDiscard = this.hand.slice();
      this.hand = [];
      this.layoutHand();
      cardsToDiscard.forEach((card, index) => {
        window.setTimeout(() => {
          card.playToDiscard(this.getDiscardTarget(), (playedCard) => {
            playedCard.remove();
            this.cards = this.cards.filter((item) => item !== playedCard);
            this.deck.discard(playedCard.definition);
            this.updateUI();
          });
        }, index * 65);
      });

      await GameUtils.wait(640 + cardsToDiscard.length * 65);
      await this.enemy.attack(this.player, this.animation);

      if (!this.player.isAlive()) {
        this.setToast("Brolo collapses with excellent posture.");
        this.endTurnButton.disabled = true;
        this.isBusy = false;
        return;
      }

      await GameUtils.wait(440);
      this.startPlayerTurn();
    }

    startPlayerTurn() {
      this.turn += 1;
      this.energy = this.maxEnergy;
      this.player.clearBlock();
      this.playerTurn = true;
      this.isBusy = false;
      this.drawHand();
      this.setToast("New turn. The plan remains mostly theoretical.");
    }

    scheduleBoneGag() {
      window.setInterval(() => {
        if (!this.playerTurn || this.isBusy || !this.enemy.isAlive()) {
          return;
        }
        if (Math.random() < 0.52) {
          this.enemy.boneGag(this.animation);
        }
      }, 6200);
    }

    setToast(text) {
      this.toast.textContent = text;
    }

    updateUI() {
      document.getElementById("energyText").textContent = `${this.energy}/${this.maxEnergy}`;
      document.getElementById("turnText").textContent = String(this.turn);
      const counts = this.deck.counts();
      document.getElementById("deckCount").textContent = String(counts.deck);
      document.getElementById("discardCount").textContent = String(counts.discard);
      document.getElementById("bottomDeckCount").textContent = String(counts.deck);
      document.getElementById("bottomDiscardCount").textContent = String(counts.discard);
      this.endTurnButton.disabled = !this.playerTurn || this.isBusy || !this.player.isAlive() || !this.enemy.isAlive();
      this.player.updateUI();
      this.enemy.updateUI();
      this.enemy.updateIntent();
    }
  }

  window.GameManager = GameManager;
})();
