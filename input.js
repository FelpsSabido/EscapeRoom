export class Input {
  constructor() {
    this.down = new Set();
    this.pressed = new Set();

    this.onKeyDown = this.handleKeyDown.bind(this);
    this.onKeyUp = this.handleKeyUp.bind(this);
    this.onBlur = this.reset.bind(this);

    window.addEventListener("keydown", this.onKeyDown, { passive: false });
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.onBlur);
  }

  normalize(key) {
    if (typeof key !== "string") return "";
    return key.length === 1 ? key.toLowerCase() : key;
  }

  handleKeyDown(event) {
    const key = this.normalize(event.key);
    if (!key) return;

    const blocked = [
      "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
      " ", "w", "a", "s", "d"
    ];

    if (blocked.includes(key)) event.preventDefault();

    if (!this.down.has(key)) {
      this.pressed.add(key);
    }

    this.down.add(key);
  }

  handleKeyUp(event) {
    const key = this.normalize(event.key);
    if (key) this.down.delete(key);
  }

  isDown(key) {
    return this.down.has(this.normalize(key));
  }

  wasPressed(key) {
    return this.pressed.has(this.normalize(key));
  }

  consume(key) {
    const normalized = this.normalize(key);
    if (!this.pressed.has(normalized)) return false;
    this.pressed.delete(normalized);
    return true;
  }

  getMovementVector() {
    let x = 0;
    let y = 0;

    if (this.isDown("a") || this.isDown("ArrowLeft")) x -= 1;
    if (this.isDown("d") || this.isDown("ArrowRight")) x += 1;
    if (this.isDown("w") || this.isDown("ArrowUp")) y -= 1;
    if (this.isDown("s") || this.isDown("ArrowDown")) y += 1;

    const length = Math.hypot(x, y);

    if (length > 0) {
      x /= length;
      y /= length;
    }

    return { x, y };
  }

  wantsInteract() {
    return this.consume("e");
  }

  wantsConfirm() {
    return this.consume("Enter") || this.consume(" ");
  }

  wantsPause() {
    return this.consume("Escape") || this.consume("p");
  }

  getPressedDigit() {
    for (let digit = 0; digit <= 9; digit += 1) {
      if (this.consume(String(digit))) return String(digit);
    }
    return null;
  }

  endFrame() {
    this.pressed.clear();
  }

  reset() {
    this.down.clear();
    this.pressed.clear();
  }

  destroy() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.onBlur);
    this.reset();
  }
}