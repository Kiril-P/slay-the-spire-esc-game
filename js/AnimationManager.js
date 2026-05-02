(function () {
  "use strict";

  class AnimationManager {
    constructor(canvas, root) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.root = root;
      this.particles = [];
      this.projectiles = [];
      this.targetLine = null;
      this.lastTrailAt = 0;

      this.resize();
      window.addEventListener("resize", () => this.resize());
    }

    resize() {
      const rect = this.root.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      this.width = rect.width;
      this.height = rect.height;
      this.canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      this.canvas.height = Math.max(1, Math.floor(rect.height * ratio));
      this.canvas.style.width = `${rect.width}px`;
      this.canvas.style.height = `${rect.height}px`;
      this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    setTargetLine(start, end, active) {
      if (!active) {
        this.targetLine = null;
        return;
      }

      this.targetLine = { start, end };
    }

    spawnTrail(x, y, time) {
      if (time - this.lastTrailAt < 22) {
        return;
      }

      this.lastTrailAt = time;
      const colors = ["#fff0a4", "#9a66ff", "#6ff4df", "#ff8bd2"];
      for (let i = 0; i < 3; i += 1) {
        const angle = GameUtils.randomBetween(0, Math.PI * 2);
        const speed = GameUtils.randomBetween(10, 58);
        this.particles.push({
          x: x + GameUtils.randomBetween(-18, 18),
          y: y + GameUtils.randomBetween(-18, 18),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - GameUtils.randomBetween(6, 24),
          life: GameUtils.randomBetween(0.34, 0.72),
          maxLife: 0.72,
          size: GameUtils.randomBetween(2, 5.5),
          color: colors[Math.floor(Math.random() * colors.length)],
          wobble: GameUtils.randomBetween(0, Math.PI * 2)
        });
      }
    }

    burst(x, y, options = {}) {
      const count = options.count || 18;
      const colors = options.colors || ["#fff0a4", "#9a66ff", "#6ff4df"];
      for (let i = 0; i < count; i += 1) {
        const angle = GameUtils.randomBetween(0, Math.PI * 2);
        const speed = GameUtils.randomBetween(options.minSpeed || 36, options.maxSpeed || 170);
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: GameUtils.randomBetween(0.38, options.life || 0.95),
          maxLife: options.life || 0.95,
          size: GameUtils.randomBetween(2.5, options.size || 7),
          color: colors[Math.floor(Math.random() * colors.length)],
          wobble: GameUtils.randomBetween(0, Math.PI * 2)
        });
      }
    }

    castProjectile(from, to, options = {}, onImpact) {
      this.projectiles.push({
        from,
        to,
        x: from.x,
        y: from.y,
        age: 0,
        duration: options.duration || 0.55,
        color: options.color || "#ffbb48",
        secondary: options.secondary || "#9a66ff",
        size: options.size || 15,
        wobble: options.wobble || 34,
        misdirect: options.misdirect || 0,
        impact: onImpact,
        hit: false
      });
    }

    floatingText(text, x, y, type) {
      const node = document.createElement("div");
      node.className = `float-text ${type || ""}`;
      node.textContent = text;
      node.style.left = `${x}px`;
      node.style.top = `${y}px`;
      this.root.appendChild(node);
      window.setTimeout(() => node.remove(), 1250);
    }

    sparkleAround(rect, count) {
      for (let i = 0; i < count; i += 1) {
        const sparkle = document.createElement("i");
        sparkle.className = "sparkle";
        sparkle.style.left = `${GameUtils.randomBetween(rect.left, rect.right)}px`;
        sparkle.style.top = `${GameUtils.randomBetween(rect.top, rect.bottom)}px`;
        sparkle.style.setProperty("--dx", `${GameUtils.randomBetween(-42, 42)}px`);
        sparkle.style.setProperty("--dy", `${GameUtils.randomBetween(-62, 24)}px`);
        this.root.appendChild(sparkle);
        window.setTimeout(() => sparkle.remove(), 760);
      }
    }

    update(dt, time) {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.width, this.height);

      if (this.targetLine) {
        this.drawTargetLine(ctx, time);
      }

      this.updateParticles(ctx, dt, time);
      this.updateProjectiles(ctx, dt, time);
    }

    drawTargetLine(ctx, time) {
      const { start, end } = this.targetLine;
      const wobble = Math.sin(time * 0.009) * 18;
      const midX = (start.x + end.x) / 2 + wobble;
      const midY = Math.min(start.y, end.y) - 90 + Math.cos(time * 0.006) * 12;

      ctx.save();
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(28, 16, 45, 0.72)";
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.quadraticCurveTo(midX, midY, end.x, end.y);
      ctx.stroke();

      ctx.lineWidth = 2.4;
      ctx.setLineDash([12, 9]);
      ctx.lineDashOffset = -time * 0.05;
      ctx.strokeStyle = "rgba(255, 232, 142, 0.95)";
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.quadraticCurveTo(midX, midY, end.x, end.y);
      ctx.stroke();
      ctx.setLineDash([]);

      const angle = Math.atan2(end.y - midY, end.x - midX);
      ctx.fillStyle = "rgba(255, 232, 142, 0.95)";
      ctx.beginPath();
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(end.x - Math.cos(angle - 0.55) * 18, end.y - Math.sin(angle - 0.55) * 18);
      ctx.lineTo(end.x - Math.cos(angle + 0.55) * 18, end.y - Math.sin(angle + 0.55) * 18);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    updateParticles(ctx, dt, time) {
      for (let i = this.particles.length - 1; i >= 0; i -= 1) {
        const p = this.particles[i];
        p.life -= dt;
        if (p.life <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        p.vy += 55 * dt;
        p.x += p.vx * dt + Math.sin(time * 0.008 + p.wobble) * 0.9;
        p.y += p.vy * dt;

        const alpha = GameUtils.clamp(p.life / p.maxLife, 0, 1);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    updateProjectiles(ctx, dt, time) {
      for (let i = this.projectiles.length - 1; i >= 0; i -= 1) {
        const p = this.projectiles[i];
        p.age += dt;
        const t = GameUtils.clamp(p.age / p.duration, 0, 1);
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const arc = Math.sin(t * Math.PI);
        const wrong = Math.sin(t * Math.PI * 1.7) * p.misdirect;

        p.x = GameUtils.lerp(p.from.x, p.to.x, ease) + Math.sin(time * 0.014 + p.age * 8) * p.wobble * arc + wrong;
        p.y = GameUtils.lerp(p.from.y, p.to.y, ease) - arc * 90 + Math.cos(time * 0.012 + p.age * 10) * p.wobble * 0.25 * arc;

        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const gradient = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, p.size * 2.4);
        gradient.addColorStop(0, "rgba(255,255,255,0.95)");
        gradient.addColorStop(0.34, p.color);
        gradient.addColorStop(1, "rgba(154,102,255,0)");
        ctx.fillStyle = gradient;
        ctx.shadowColor = p.secondary;
        ctx.shadowBlur = 24;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + Math.sin(time * 0.02) * 0.1), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        this.spawnTrail(p.x, p.y, time);

        if (t >= 1 && !p.hit) {
          p.hit = true;
          if (typeof p.impact === "function") {
            p.impact();
          }
          this.burst(p.to.x, p.to.y, { count: 26, colors: [p.color, p.secondary, "#fff0a4"], maxSpeed: 210 });
          this.projectiles.splice(i, 1);
        }
      }
    }
  }

  window.AnimationManager = AnimationManager;
})();
