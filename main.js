/* =========================================================
   A SALA — ESCAPE ROOM
   MAIN.JS
   ========================================================= */

import { Game } from "./game.js";


/* =========================================================
   APPLICATION
   ========================================================= */

class Application {

  constructor() {

    this.canvas = null;

    this.game = null;

    this.lastTime = 0;

    this.animationFrame = null;

    this.running = false;

    this.initialized = false;


    this.boundLoop =
      this.loop.bind(this);

    this.boundResize =
      this.handleResize.bind(this);

    this.boundVisibility =
      this.handleVisibility.bind(this);

  }


  /* =======================================================
     INITIALIZAÇÃO
  ======================================================= */

  init() {

    if (this.initialized) {
      return;
    }

    this.canvas =
      document.getElementById("gameCanvas");


    if (!this.canvas) {

      console.error(
        "Canvas #gameCanvas não encontrado."
      );

      this.showFatalError(
        "O canvas principal do jogo não foi encontrado."
      );

      return;
    }


    this.configureCanvas();

    this.setupInterface();

    this.setupEvents();


    try {

      this.game =
        new Game(this.canvas);

    } catch (error) {

      console.error(
        "Erro ao criar o jogo:",
        error
      );

      this.showFatalError(
        "Não foi possível iniciar o sistema do jogo."
      );

      return;
    }


    this.initialized = true;

    this.showLoading();


    /*
     * Pequeno atraso proposital.
     *
     * Isso evita que a tela de carregamento
     * desapareça instantaneamente em máquinas rápidas.
     */

    setTimeout(() => {

      this.finishLoading();

    }, 700);


    this.lastTime =
      performance.now();

    this.running = true;

    this.animationFrame =
      requestAnimationFrame(
        this.boundLoop
      );

  }


  /* =======================================================
     CANVAS
  ======================================================= */

  configureCanvas() {

    this.canvas.width = 960;

    this.canvas.height = 540;

    this.canvas.setAttribute(
      "role",
      "application"
    );

    this.canvas.setAttribute(
      "aria-label",
      "Escape Room A Sala"
    );

    this.canvas.setAttribute(
      "tabindex",
      "0"
    );


    /*
     * Evita menu contextual do botão direito.
     */

    this.canvas.addEventListener(
      "contextmenu",
      (event) => {

        event.preventDefault();

      }
    );


    /*
     * Clicar no jogo devolve o foco
     * para o teclado.
     */

    this.canvas.addEventListener(
      "click",
      () => {

        this.canvas.focus();

      }
    );

  }


  /* =======================================================
     INTERFACE
  ======================================================= */

  setupInterface() {

    const startButton =
      document.getElementById(
        "startButton"
      );


    const restartButton =
      document.getElementById(
        "restartButton"
      );


    const pauseButton =
      document.getElementById(
        "pauseButton"
      );


    const completeRestartButton =
      document.getElementById(
        "completeRestartButton"
      );


    const errorReloadButton =
      document.getElementById(
        "errorReloadButton"
      );


    const messageContinueButton =
      document.getElementById(
        "messageContinueButton"
      );


    const messageVoiceButton =
      document.getElementById(
        "messageVoiceButton"
      );


    const puzzleSubmit =
      document.getElementById(
        "puzzleSubmit"
      );


    const puzzleCancel =
      document.getElementById(
        "puzzleCancel"
      );


    const puzzleVoiceButton =
      document.getElementById(
        "puzzleVoiceButton"
      );


    const terminalSubmit =
      document.getElementById(
        "terminalSubmit"
      );


    const terminalCancel =
      document.getElementById(
        "terminalCancel"
      );


    const terminalVoiceButton =
      document.getElementById(
        "terminalVoiceButton"
      );


    const voiceButton =
      document.getElementById(
        "voiceButton"
      );


    /* -------------------------------------------------------
       INICIAR
    ------------------------------------------------------- */

    if (startButton) {

      startButton.addEventListener(
        "click",
        () => {

          if (!this.game) {
            return;
          }

          this.game.start();

          this.canvas.focus();

        }
      );

    }


    /* -------------------------------------------------------
       PAUSA
    ------------------------------------------------------- */

    if (pauseButton) {

      pauseButton.addEventListener(
        "click",
        () => {

          if (!this.game) {
            return;
          }

          this.game.togglePause();

          this.canvas.focus();

        }
      );

    }


    /* -------------------------------------------------------
       REINICIAR
    ------------------------------------------------------- */

    if (restartButton) {

      restartButton.addEventListener(
        "click",
        () => {

          if (!this.game) {
            return;
          }

          this.game.restart();

          this.canvas.focus();

        }
      );

    }


    /* -------------------------------------------------------
       REINICIAR APÓS VITÓRIA
    ------------------------------------------------------- */

    if (completeRestartButton) {

      completeRestartButton.addEventListener(
        "click",
        () => {

          if (!this.game) {
            return;
          }

          this.game.restart();

          this.canvas.focus();

        }
      );

    }


    /* -------------------------------------------------------
       RECARREGAR
    ------------------------------------------------------- */

    if (errorReloadButton) {

      errorReloadButton.addEventListener(
        "click",
        () => {

          window.location.reload();

        }
      );

    }


    /* -------------------------------------------------------
       CONTINUAR MENSAGEM
    ------------------------------------------------------- */

    if (messageContinueButton) {

      messageContinueButton.addEventListener(
        "click",
        () => {

          if (!this.game) {
            return;
          }

          this.game.closeMessage();

          this.canvas.focus();

        }
      );

    }


    /* -------------------------------------------------------
       VOZ DA MENSAGEM
    ------------------------------------------------------- */

    if (messageVoiceButton) {

      messageVoiceButton.addEventListener(
        "click",
        () => {

          if (!this.game) {
            return;
          }

          this.game.speakCurrentText();

        }
      );

    }


    /* -------------------------------------------------------
       VOZ DA PISTA
    ------------------------------------------------------- */

    if (puzzleVoiceButton) {

      puzzleVoiceButton.addEventListener(
        "click",
        () => {

          if (!this.game) {
            return;
          }

          this.game.speakCurrentPuzzle();

        }
      );

    }


    /* -------------------------------------------------------
       CANCELAR PUZZLE
    ------------------------------------------------------- */

    if (puzzleCancel) {

      puzzleCancel.addEventListener(
        "click",
        () => {

          if (!this.game) {
            return;
          }

          this.game.closePuzzle();

          this.canvas.focus();

        }
      );

    }


    /* -------------------------------------------------------
       ENVIAR PUZZLE
    ------------------------------------------------------- */

    if (puzzleSubmit) {

      puzzleSubmit.addEventListener(
        "click",
        () => {

          if (!this.game) {
            return;
          }

          this.game.submitPuzzle();

        }
      );

    }


    /* -------------------------------------------------------
       TERMINAL
    ------------------------------------------------------- */

    if (terminalSubmit) {

      terminalSubmit.addEventListener(
        "click",
        () => {

          if (!this.game) {
            return;
          }

          this.game.submitTerminal();

        }
      );

    }


    if (terminalCancel) {

      terminalCancel.addEventListener(
        "click",
        () => {

          if (!this.game) {
            return;
          }

          this.game.closeTerminal();

          this.canvas.focus();

        }
      );

    }


    /* -------------------------------------------------------
       VOZ DO TERMINAL
    ------------------------------------------------------- */

    if (terminalVoiceButton) {

      terminalVoiceButton.addEventListener(
        "click",
        () => {

          if (!this.game) {
            return;
          }

          this.game.speakTerminal();

        }
      );

    }


    /* -------------------------------------------------------
       BOTÃO DE VOZ PRINCIPAL
    ------------------------------------------------------- */

    if (voiceButton) {

      voiceButton.addEventListener(
        "click",
        () => {

          if (!this.game) {
            return;
          }

          this.game.speakCurrentText();

        }
      );

    }


    /* -------------------------------------------------------
       ENTER NOS INPUTS
    ------------------------------------------------------- */

    const puzzleInput =
      document.getElementById(
        "puzzleInput"
      );


    if (puzzleInput) {

      puzzleInput.addEventListener(
        "keydown",
        (event) => {

          if (event.key === "Enter") {

            event.preventDefault();

            if (this.game) {

              this.game.submitPuzzle();

            }

          }

        }
      );

    }


    const terminalInput =
      document.getElementById(
        "terminalInput"
      );


    if (terminalInput) {

      terminalInput.addEventListener(
        "keydown",
        (event) => {

          if (event.key === "Enter") {

            event.preventDefault();

            if (this.game) {

              this.game.submitTerminal();

            }

          }

        }
      );

    }

  }


  /* =======================================================
     EVENTOS DA JANELA
  ======================================================= */

  setupEvents() {

    window.addEventListener(
      "resize",
      this.boundResize
    );


    document.addEventListener(
      "visibilitychange",
      this.boundVisibility
    );


    window.addEventListener(
      "error",
      (event) => {

        console.error(
          "Erro global:",
          event.error || event.message
        );

      }
    );


    window.addEventListener(
      "unhandledrejection",
      (event) => {

        console.error(
          "Promise rejeitada:",
          event.reason
        );

      }
    );


    this.handleResize();

  }


  /* =======================================================
     RESPONSIVIDADE
  ======================================================= */

  handleResize() {

    if (!this.canvas) {
      return;
    }


    /*
     * O Canvas mantém resolução interna fixa.
     *
     * O CSS é responsável por ampliar/reduzir
     * sem deformar a proporção 16:9.
     */

    this.canvas.style.aspectRatio =
      "16 / 9";

  }


  /* =======================================================
     VISIBILIDADE
  ======================================================= */

  handleVisibility() {

    if (
      document.hidden &&
      this.game &&
      this.game.state === "playing"
    ) {

      this.game.pause();

    }

  }


  /* =======================================================
     LOADING
  ======================================================= */

  showLoading() {

    const loading =
      document.getElementById(
        "loadingScreen"
      );


    const start =
      document.getElementById(
        "startScreen"
      );


    const hud =
      document.getElementById(
        "hud"
      );


    const voice =
      document.getElementById(
        "voiceButton"
      );


    if (loading) {

      loading.classList.remove(
        "hidden"
      );

    }


    if (start) {

      start.classList.add(
        "hidden"
      );

    }


    if (hud) {

      hud.classList.add(
        "hidden"
      );

    }


    if (voice) {

      voice.classList.add(
        "hidden"
      );

    }

  }


  finishLoading() {

    const loading =
      document.getElementById(
        "loadingScreen"
      );


    const start =
      document.getElementById(
        "startScreen"
      );


    if (loading) {

      loading.classList.add(
        "hidden"
      );

    }


    if (start) {

      start.classList.remove(
        "hidden"
      );

    }


    const loadingText =
      document.getElementById(
        "loadingText"
      );


    if (loadingText) {

      loadingText.textContent =
        "Sistema pronto.";

    }

  }


  /* =======================================================
     LOOP PRINCIPAL
  ======================================================= */

  loop(currentTime) {

    if (!this.running) {

      return;

    }


    let deltaTime =
      (
        currentTime -
        this.lastTime
      ) / 1000;


    if (
      !Number.isFinite(deltaTime)
    ) {

      deltaTime = 0;

    }


    /*
     * Limita o salto de tempo.
     *
     * Isso evita que o personagem
     * atravesse paredes quando a aba
     * fica congelada por alguns instantes.
     */

    deltaTime =
      Math.min(
        deltaTime,
        0.05
      );


    this.lastTime =
      currentTime;


    if (this.game) {

      try {

        this.game.update(
          deltaTime
        );

        this.game.render();

      } catch (error) {

        console.error(
          "Erro durante o jogo:",
          error
        );

        this.running = false;

        this.showFatalError(
          "O jogo encontrou um erro durante a execução."
        );

        return;

      }

    }


    this.animationFrame =
      requestAnimationFrame(
        this.boundLoop
      );

  }


  /* =======================================================
     ERRO FATAL
  ======================================================= */

  showFatalError(message) {

    const errorScreen =
      document.getElementById(
        "gameError"
      );


    const errorText =
      document.getElementById(
        "gameErrorText"
      );


    const loading =
      document.getElementById(
        "loadingScreen"
      );


    const start =
      document.getElementById(
        "startScreen"
      );


    const hud =
      document.getElementById(
        "hud"
      );


    if (loading) {

      loading.classList.add(
        "hidden"
      );

    }


    if (start) {

      start.classList.add(
        "hidden"
      );

    }


    if (hud) {

      hud.classList.add(
        "hidden"
      );

    }


    if (errorText) {

      errorText.textContent =
        message;

    }


    if (errorScreen) {

      errorScreen.classList.remove(
        "hidden"
      );

    } else {

      /*
       * Fallback caso o HTML tenha sido
       * alterado ou esteja incompleto.
       */

      const fallback =
        document.createElement(
          "div"
        );


      fallback.style.position =
        "fixed";

      fallback.style.inset = "0";

      fallback.style.zIndex =
        "999999";

      fallback.style.display =
        "flex";

      fallback.style.alignItems =
        "center";

      fallback.style.justifyContent =
        "center";

      fallback.style.background =
        "#050608";

      fallback.style.color =
        "#ffffff";

      fallback.style.fontFamily =
        "Arial, sans-serif";

      fallback.style.textAlign =
        "center";

      fallback.style.padding =
        "30px";

      fallback.textContent =
        message;

      document.body.appendChild(
        fallback
      );

    }

  }


  /* =======================================================
     DESTROY
  ======================================================= */

  destroy() {

    this.running = false;


    if (
      this.animationFrame !== null
    ) {

      cancelAnimationFrame(
        this.animationFrame
      );

      this.animationFrame = null;

    }


    window.removeEventListener(
      "resize",
      this.boundResize
    );


    document.removeEventListener(
      "visibilitychange",
      this.boundVisibility
    );


    if (
      this.game &&
      typeof this.game.destroy === "function"
    ) {

      this.game.destroy();

    }


    this.game = null;

    this.canvas = null;

    this.initialized = false;

  }

}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

const application =
  new Application();


if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    () => {

      application.init();

    },
    {
      once: true
    }
  );

} else {

  application.init();

}


/* =========================================================
   DEBUG
   ========================================================= */

window.escapeRoom =
  application;