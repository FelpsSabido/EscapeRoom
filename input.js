/* =========================================================
   A SALA — ESCAPE ROOM
   INPUT.JS

   Responsável por:
   - WASD
   - Setas direcionais
   - E para investigar
   - ESC para pausar/fechar interfaces
   - ENTER para confirmar/continuar
   - R para reiniciar
   ========================================================= */

export class Input {

  constructor(game = null) {

    this.game = game;

    /* -------------------------------------------------------
       ESTADO DAS TECLAS
    ------------------------------------------------------- */

    this.keys = new Set();

    this.justPressed = new Set();


    /* -------------------------------------------------------
       EVENTOS
    ------------------------------------------------------- */

    this.boundKeyDown =
      this.handleKeyDown.bind(this);

    this.boundKeyUp =
      this.handleKeyUp.bind(this);

    this.boundBlur =
      this.handleBlur.bind(this);

    this.boundVisibilityChange =
      this.handleVisibilityChange.bind(this);


    /* -------------------------------------------------------
       LISTENERS
    ------------------------------------------------------- */

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


  /* =========================================================
     NORMALIZAR TECLA
     ========================================================= */

  normalizeKey(key) {

    if (
      typeof key !== "string"
    ) {

      return "";

    }


    /*
     * Letras ficam sempre minúsculas.
     */

    if (
      key.length === 1
    ) {

      return key.toLowerCase();

    }


    return key;

  }


  /* =========================================================
     KEY DOWN
     ========================================================= */

  handleKeyDown(event) {

    if (!event) {
      return;
    }


    const key =
      this.normalizeKey(
        event.key
      );


    if (!key) {
      return;
    }


    /* -------------------------------------------------------
       Impede o navegador de rolar a página com as setas
       ou espaço.
    ------------------------------------------------------- */

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


    /* -------------------------------------------------------
       justPressed só recebe a tecla na primeira vez.

       Isso é importante para E, ESC e ENTER não serem
       executados dezenas de vezes enquanto o jogador segura
       a tecla.
    ------------------------------------------------------- */

    if (
      !this.keys.has(key)
    ) {

      this.justPressed.add(
        key
      );

    }


    this.keys.add(
      key
    );


    /* -------------------------------------------------------
       Informa o Game sobre teclas especiais.
    ------------------------------------------------------- */

    if (
      this.game &&
      typeof this.game.handleKeyDown ===
      "function"
    ) {

      this.game.handleKeyDown(
        event
      );

    }

  }


  /* =========================================================
     KEY UP
     ========================================================= */

  handleKeyUp(event) {

    if (!event) {
      return;
    }


    const key =
      this.normalizeKey(
        event.key
      );


    if (!key) {
      return;
    }


    this.keys.delete(
      key
    );

  }


  /* =========================================================
     PERDEU FOCO
     ========================================================= */

  handleBlur() {

    this.reset();

  }


  /* =========================================================
     ABA FICOU ESCONDIDA
     ========================================================= */

  handleVisibilityChange() {

    if (
      document.hidden
    ) {

      this.reset();

    }

  }


  /* =========================================================
     TECLA PRESSIONADA
     ========================================================= */

  isDown(key) {

    return this.keys.has(
      this.normalizeKey(key)
    );

  }


  /* =========================================================
     TECLA PRESSIONADA NESTE FRAME
     ========================================================= */

  wasPressed(key) {

    return this.justPressed.has(
      this.normalizeKey(key)
    );

  }


  /* =========================================================
     MOVIMENTO

     Retorna um vetor normalizado.

     W / ↑ = cima
     S / ↓ = baixo
     A / ← = esquerda
     D / → = direita
    ========================================================= */

  getMovementVector() {

    let x = 0;

    let y = 0;


    /* -------------------------------------------------------
       ESQUERDA
    ------------------------------------------------------- */

    if (
      this.isDown("a") ||
      this.isDown("ArrowLeft")
    ) {

      x -= 1;

    }


    /* -------------------------------------------------------
       DIREITA
    ------------------------------------------------------- */

    if (
      this.isDown("d") ||
      this.isDown("ArrowRight")
    ) {

      x += 1;

    }


    /* -------------------------------------------------------
       CIMA
    ------------------------------------------------------- */

    if (
      this.isDown("w") ||
      this.isDown("ArrowUp")
    ) {

      y -= 1;

    }


    /* -------------------------------------------------------
       BAIXO
    ------------------------------------------------------- */

    if (
      this.isDown("s") ||
      this.isDown("ArrowDown")
    ) {

      y += 1;

    }


    /* -------------------------------------------------------
       NORMALIZAÇÃO

       Sem isso, andar na diagonal seria mais rápido.
    ------------------------------------------------------- */

    const length =
      Math.hypot(
        x,
        y
      );


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
     PAUSA
     ========================================================= */

  wantsPause() {

    return (
      this.wasPressed("Escape") ||
      this.wasPressed("p")
    );

  }


  /* =========================================================
     INTERAÇÃO
     ========================================================= */

  wantsInteract() {

    return this.wasPressed(
      "e"
    );

  }


  /* =========================================================
     CONFIRMAR
     ========================================================= */

  wantsConfirm() {

    return (
      this.wasPressed("Enter") ||
      this.wasPressed(" ")
    );

  }


  /* =========================================================
     REINICIAR
     ========================================================= */

  wantsRestart() {

    return this.wasPressed(
      "r"
    );

  }


  /* =========================================================
     LIMPAR JUST PRESSED
     ========================================================= */

  endFrame() {

    this.justPressed.clear();

  }


  /* =========================================================
     RESET

     Usado quando:
     - janela perde foco
     - aba fica escondida
     - jogo é reiniciado
    ========================================================= */

  reset() {

    this.keys.clear();

    this.justPressed.clear();

  }


  /* =========================================================
     DESTROY

     Remove todos os listeners quando o jogo é destruído.
    ========================================================= */

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