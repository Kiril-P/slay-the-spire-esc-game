(function () {
  "use strict";

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(current, target, amount) {
    return current + (target - current) * amount;
  }

  function lerpAngle(current, target, amount) {
    let delta = ((target - current + 540) % 360) - 180;
    return current + delta * amount;
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function rectContains(rect, x, y) {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  function centerOfRect(rect) {
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  window.GameUtils = {
    clamp,
    lerp,
    lerpAngle,
    randomBetween,
    rectContains,
    centerOfRect,
    wait
  };
})();
