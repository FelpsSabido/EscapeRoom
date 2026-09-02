// input.js
// Escape Room — Sistema de entrada
// WASD / Setas / E / ESC / ENTER / ESPAÇO / R

export class Input {
  constructor(game = null) {
    this.game = game;

    this.keys = new Set();
    this.justPressed = new Set();

    this.boundKeyDown =
      this.handleKeyDown.bind(this);

    this.boundKeyUp =
      this.handleKeyUp.bind(this);

    this.boundBlur =
      this.handleBlur.bind(this);

    this.boundVisibilityChange =
      this.handleVisibilityChange.bind(this);

    window.addEventListener(
      "keydown",
      this.boundKeyDown,
      {
        passive: false
      }
    );

    window.addEventListener(
      "keyup",
      this.boundKeyUp,
      {
        passive: false
      }
    );

    window.addEventListener(
      "blur",
      this.boundBlur
    );

    document.addEventListener(
      "visibilitychange",
      this.boundVisibilityChange
    );
  }

  // =========================================================
  // NORMALIZAÇÃO
  // =========================================================

  normalizeKey(key) {
    if (typeof key !== "string") {
      return "";
    }

    if (key.length === 1) {
      return key.toLowerCase();
    }

    return key;
  }

  // =========================================================
  // KEY DOWN
  // =========================================================

  handleKeyDown(event) {
    if (!event) {
      return;
    }

    const key =
      this.normalizeKey(event.key);

    if (!key) {
      return;
    }

    // Evita que as setas e espaço movimentem
    // a página enquanto o jogo está aberto.
    const blockedKeys = [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      " "
    ];

    if (
      blockedKeys.includes(key)
    ) {
      event.preventDefault();
    }

    // Só registra como "just pressed"
    // na primeira vez que a tecla é pressionada.
    if (!this.keys.has(key)) {
      this.justPressed.add(key);
    }

    this.keys.add(key);

    // Permite que o Game trate teclas especiais.
    if (
      this.game &&
      typeof this.game.handleKeyDown ===
        "function"
    ) {
      this.game.handleKeyDown(event);
    }
  }

  // =========================================================
  // KEY UP
  // =========================================================

  handleKeyUp(event) {
    if (!event) {
      return;
    }

    const key =
      this.normalizeKey(event.key);

    if (!key) {
      return;
    }

    this.keys.delete(key);
  }

  // =========================================================
  // BLUR
  // =========================================================

  handleBlur() {
    this.reset();
  }

  // =========================================================
  // VISIBILIDADE
  // =========================================================

  handleVisibilityChange() {
    if (document.hidden) {
      this.reset();
    }
  }

  // =========================================================
  // ESTADO DAS TECLAS
  // =========================================================

  isDown(key) {
    return this.keys.has(
      this.normalizeKey(key)
    );
  }

  wasPressed(key) {
    return this.justPressed.has(
      this.normalizeKey(key)
    );
  }

  // =========================================================
  // MOVIMENTO
  // =========================================================

  getMovementVector() {
    let x = 0;
    let y = 0;

    // Esquerda
    if (
      this.isDown("a") ||
      this.isDown("ArrowLeft")
    ) {
      x -= 1;
    }

    // Direita
    if (
      this.isDown("d") ||
      this.isDown("ArrowRight")
    ) {
      x += 1;
    }

    // Cima
    if (
      this.isDown("w") ||
      this.isDown("ArrowUp")
    ) {
      y -= 1;
    }

    // Baixo
    if (
      this.isDown("s") ||
      this.isDown("ArrowDown")
    ) {
      y += 1;
    }

    // Normaliza a diagonal.
    // Assim o personagem não fica mais rápido
    // quando anda na diagonal.
    const length =
      Math.hypot(x, y);

    if (length > 0) {
      x /= length;
      y /= length;
    }

    return {
      x,
      y
    };
  }

  // =========================================================
  // PAUSA
  // =========================================================

  wantsPause() {
    return (
      this.wasPressed("Escape") ||
      this.wasPressed("p")
    );
  }

  // =========================================================
  // INTERAÇÃO
  // =========================================================

  wantsInteract() {
    return this.wasPressed("e");
  }

  // =========================================================
  // CONFIRMAR
  // =========================================================

  wantsConfirm() {
    return (
      this.wasPressed("Enter") ||
      this.wasPressed(" ")
    );
  }

  // =========================================================
  // REINICIAR
  // =========================================================

  wantsRestart() {
    return this.wasPressed("r");
  }

  // =========================================================
  // FINAL DO FRAME
  // =========================================================

  endFrame() {
    this.justPressed.clear();
  }

  // =========================================================
  // RESET
  // =========================================================

  reset() {
    this.keys.clear();
    this.justPressed.clear();
  }

  // =========================================================
  // DESTRUIR
  // =========================================================

  destroy() {
    window.removeEventListener(
      "keydown",
      this.boundKeyDown
    );

    window.removeEventListener(
      "keyup",
      this.boundKeyUp
    );

    window.removeEventListener(
      "blur",
      this.boundBlur
    );

    document.removeEventListener(
      "visibilitychange",
      this.boundVisibilityChange
    );

    this.reset();

    this.game = null;
  }
}