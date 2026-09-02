export class Input {
  constructor(game) {
    this.game = game;

    this.keys = new Set();
    this.justPressed = new Set();

    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
    this.boundBlur = this.handleBlur.bind(this);
    this.boundVisibilityChange = this.handleVisibilityChange.bind(this);

    window.addEventListener("keydown", this.boundKeyDown, { passive: false });
    window.addEventListener("keyup", this.boundKeyUp, { passive: false });
    window.addEventListener("blur", this.boundBlur);
    document.addEventListener(
      "visibilitychange",
      this.boundVisibilityChange
    );
  }

  normalizeKey(key) {
    if (typeof key !== "string") {
      return "";
    }

    if (key.length === 1) {
      return key.toLowerCase();
    }

    return key;
  }

  handleKeyDown(event) {
    const key = this.normalizeKey(event.key);

    if (!key) {
      return;
    }

    /*
     * Impede que as setas e espaço movimentem a página
     * enquanto o jogador estiver dentro do jogo.
     */
    if (
      [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        " ",
      ].includes(key)
    ) {
      event.preventDefault();
    }

    /*
     * Só adicionamos à lista de "justPressed" quando a tecla
     * realmente acabou de ser pressionada.
     *
     * Isso evita que o navegador repita a ação enquanto
     * a tecla permanece pressionada.
     */
    if (!this.keys.has(key)) {
      this.justPressed.add(key);
    }

    this.keys.add(key);

    /*
     * O Enter é encaminhado ao Game para iniciar/reiniciar
     * o jogo a partir das telas de menu/conclusão.
     *
     * Escape, P e E NÃO são encaminhados aqui porque o Game
     * já consulta essas teclas através de wantsPause()
     * e wantsInteract().
     */
    if (
      key === "Enter" &&
      this.game &&
      typeof this.game.handleKeyDown === "function"
    ) {
      this.game.handleKeyDown(event);
    }
  }

  handleKeyUp(event) {
    const key = this.normalizeKey(event.key);

    if (!key) {
      return;
    }

    this.keys.delete(key);
  }

  handleBlur() {
    this.reset();
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.reset();
    }
  }

  isDown(key) {
    const normalizedKey = this.normalizeKey(key);
    return this.keys.has(normalizedKey);
  }

  wasPressed(key) {
    const normalizedKey = this.normalizeKey(key);
    return this.justPressed.has(normalizedKey);
  }

  getMovementVector() {
    let x = 0;
    let y = 0;

    /*
     * Movimento horizontal
     */
    if (this.isDown("a") || this.isDown("ArrowLeft")) {
      x -= 1;
    }

    if (this.isDown("d") || this.isDown("ArrowRight")) {
      x += 1;
    }

    /*
     * Movimento vertical
     */
    if (this.isDown("w") || this.isDown("ArrowUp")) {
      y -= 1;
    }

    if (this.isDown("s") || this.isDown("ArrowDown")) {
      y += 1;
    }

    /*
     * Normaliza diagonais.
     *
     * Sem isso, andar na diagonal seria aproximadamente
     * 41% mais rápido do que andar em linha reta.
     */
    const length = Math.hypot(x, y);

    if (length > 0) {
      x /= length;
      y /= length;
    }

    return {
      x,
      y,
    };
  }

  wantsPause() {
    return this.wasPressed("Escape") || this.wasPressed("p");
  }

  wantsInteract() {
    return this.wasPressed("e");
  }

  wantsConfirm() {
    return (
      this.wasPressed("Enter") ||
      this.wasPressed(" ")
    );
  }

  wantsRestart() {
    return this.wasPressed("r");
  }

  endFrame() {
    this.justPressed.clear();
  }

  reset() {
    this.keys.clear();
    this.justPressed.clear();
  }

  destroy() {
    window.removeEventListener("keydown", this.boundKeyDown);
    window.removeEventListener("keyup", this.boundKeyUp);
    window.removeEventListener("blur", this.boundBlur);

    document.removeEventListener(
      "visibilitychange",
      this.boundVisibilityChange
    );

    this.reset();
  }
}