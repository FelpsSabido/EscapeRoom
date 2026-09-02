export class Input {
  constructor() {
    this.down = new Set();
    this.pressed = new Set();

    this.onKeyDown =
      this.handleKeyDown.bind(this);

    this.onKeyUp =
      this.handleKeyUp.bind(this);

    this.onBlur =
      this.reset.bind(this);

    window.addEventListener(
      "keydown",
      this.onKeyDown,
      {
        passive: false
      }
    );

    window.addEventListener(
      "keyup",
      this.onKeyUp
    );

    window.addEventListener(
      "blur",
      this.onBlur
    );
  }

  /* =========================================================
     NORMALIZAÇÃO
  ========================================================== */

  normalize(key) {
    if (
      typeof key !== "string"
    ) {
      return "";
    }

    if (
      key.length === 1
    ) {
      return key.toLowerCase();
    }

    return key;
  }

  /* =========================================================
     KEY DOWN
  ========================================================== */

  handleKeyDown(event) {
    const key =
      this.normalize(
        event.key
      );

    if (!key) {
      return;
    }

    /*
      Impede que as teclas de movimentação
      façam a página rolar.
    */

    const blockedKeys = [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      " ",
      "w",
      "a",
      "s",
      "d"
    ];

    if (
      blockedKeys.includes(key)
    ) {
      event.preventDefault();
    }

    /*
      pressed = tecla acabou de ser pressionada.
      down = tecla continua sendo segurada.
    */

    if (
      !this.down.has(key)
    ) {
      this.pressed.add(key);
    }

    this.down.add(key);
  }

  /* =========================================================
     KEY UP
  ========================================================== */

  handleKeyUp(event) {
    const key =
      this.normalize(
        event.key
      );

    if (!key) {
      return;
    }

    this.down.delete(key);
  }

  /* =========================================================
     VERIFICAR TECLA SEGURADA
  ========================================================== */

  isDown(key) {
    return this.down.has(
      this.normalize(key)
    );
  }

  /* =========================================================
     VERIFICAR TECLA PRESSIONADA
  ========================================================== */

  wasPressed(key) {
    return this.pressed.has(
      this.normalize(key)
    );
  }

  /* =========================================================
     CONSUMIR TECLA
     
     Usado para ações que devem acontecer
     somente uma vez por pressionamento.
  ========================================================== */

  consume(key) {
    const normalized =
      this.normalize(key);

    if (
      !this.pressed.has(
        normalized
      )
    ) {
      return false;
    }

    this.pressed.delete(
      normalized
    );

    return true;
  }

  /* =========================================================
     MOVIMENTO
  ========================================================== */

  getMovementVector() {
    let x = 0;
    let y = 0;

    /*
      WASD
    */

    if (
      this.isDown("a")
    ) {
      x -= 1;
    }

    if (
      this.isDown("d")
    ) {
      x += 1;
    }

    if (
      this.isDown("w")
    ) {
      y -= 1;
    }

    if (
      this.isDown("s")
    ) {
      y += 1;
    }

    /*
      Setas também funcionam.
    */

    if (
      this.isDown("ArrowLeft")
    ) {
      x -= 1;
    }

    if (
      this.isDown("ArrowRight")
    ) {
      x += 1;
    }

    if (
      this.isDown("ArrowUp")
    ) {
      y -= 1;
    }

    if (
      this.isDown("ArrowDown")
    ) {
      y += 1;
    }

    /*
      Normaliza a diagonal.

      Sem isso, andar na diagonal seria
      mais rápido do que andar em linha reta.
    */

    const length =
      Math.hypot(x, y);

    if (
      length > 0
    ) {
      x /= length;
      y /= length;
    }

    return {
      x,
      y
    };
  }

  /* =========================================================
     INTERAÇÃO
  ========================================================== */

  wantsInteract() {
    return this.consume("e");
  }

  /* =========================================================
     CONFIRMAR
  ========================================================== */

  wantsConfirm() {
    if (
      this.consume("Enter")
    ) {
      return true;
    }

    if (
      this.consume(" ")
    ) {
      return true;
    }

    return false;
  }

  /* =========================================================
     PAUSA
  ========================================================== */

  wantsPause() {
    if (
      this.consume("Escape")
    ) {
      return true;
    }

    if (
      this.consume("p")
    ) {
      return true;
    }

    return false;
  }

  /* =========================================================
     NÚMERO PRESSIONADO
  ========================================================== */

  getPressedDigit() {
    const digits = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9"
    ];

    for (
      const digit of digits
    ) {
      if (
        this.pressed.has(
          digit
        )
      ) {
        this.pressed.delete(
          digit
        );

        return digit;
      }
    }

    return null;
  }

  /* =========================================================
     LIMPAR ESTADO DO FRAME
  ========================================================== */

  endFrame() {
    this.pressed.clear();
  }

  /* =========================================================
     RESET
  ========================================================== */

  reset() {
    this.down.clear();
    this.pressed.clear();
  }

  /* =========================================================
     DESTRUIR
  ========================================================== */

  destroy() {
    window.removeEventListener(
      "keydown",
      this.onKeyDown
    );

    window.removeEventListener(
      "keyup",
      this.onKeyUp
    );

    window.removeEventListener(
      "blur",
      this.onBlur
    );

    this.reset();
  }
}