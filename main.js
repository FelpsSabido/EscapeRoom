// main.js
// Escape Room — Inicialização principal
// Responsável pelo Canvas, Game Loop, interface e tela de carregamento.

import { Game } from "./game.js";

class Application {
  constructor() {
    this.canvas = null;
    this.game = null;

    this.lastTime = 0;
    this.animationFrame = null;

    this.started = false;

    this.handleResize =
      this.handleResize.bind(this);

    this.loop =
      this.loop.bind(this);
  }

  // =========================================================
  // INICIALIZAÇÃO
  // =========================================================

  init() {
    this.showLoadingScreen();

    this.canvas =
      document.getElementById(
        "gameCanvas"
      );

    if (!this.canvas) {
      console.error(
        "Erro: o elemento #gameCanvas não foi encontrado."
      );

      this.showFatalError(
        "O Canvas do jogo não foi encontrado."
      );

      return;
    }

    this.setupCanvas();

    this.setupGame();

    if (!this.game) {
      return;
    }

    this.setupInterface();

    this.setupWindowEvents();

    this.lastTime =
      performance.now();

    this.started = true;

    /*
     * Pequeno atraso proposital para garantir
     * que o navegador tenha tempo de renderizar
     * a interface antes de remover a tela
     * de carregamento.
     */

    window.setTimeout(
      () => {
        this.hideLoadingScreen();

        if (this.canvas) {
          this.canvas.focus();
        }
      },
      350
    );

    this.animationFrame =
      requestAnimationFrame(
        this.loop
      );
  }

  // =========================================================
  // LOADING SCREEN
  // =========================================================

  showLoadingScreen() {
    const loading =
      document.getElementById(
        "loadingScreen"
      );

    if (!loading) {
      return;
    }

    loading.classList.add(
      "is-visible"
    );

    loading.setAttribute(
      "aria-hidden",
      "false"
    );
  }

  hideLoadingScreen() {
    const loading =
      document.getElementById(
        "loadingScreen"
      );

    if (!loading) {
      return;
    }

    loading.classList.remove(
      "is-visible"
    );

    loading.setAttribute(
      "aria-hidden",
      "true"
    );

    /*
     * Algumas versões do CSS podem usar
     * display/visibility diretamente.
     *
     * Este trecho garante que a tela
     * realmente deixe de bloquear o jogo.
     */

    window.setTimeout(
      () => {
        loading.style.pointerEvents =
          "none";

        loading.style.visibility =
          "hidden";

        loading.style.opacity =
          "0";
      },
      450
    );
  }

  // =========================================================
  // CANVAS
  // =========================================================

  setupCanvas() {
    this.canvas.width = 960;
    this.canvas.height = 540;

    this.canvas.style.aspectRatio =
      "16 / 9";

    this.canvas.style.imageRendering =
      "pixelated";

    this.canvas.setAttribute(
      "aria-label",
      "Escape Room — Sala de Aula"
    );

    this.canvas.setAttribute(
      "role",
      "application"
    );

    this.canvas.setAttribute(
      "tabindex",
      "0"
    );

    const context =
      this.canvas.getContext("2d");

    if (context) {
      context.imageSmoothingEnabled =
        false;
    }
  }

  // =========================================================
  // GAME
  // =========================================================

  setupGame() {
    try {
      this.game =
        new Game(
          this.canvas
        );

      if (!this.game) {
        throw new Error(
          "A instância do Game não foi criada."
        );
      }

      console.log(
        "Escape Room: jogo inicializado."
      );

    } catch (error) {
      console.error(
        "Erro ao inicializar o jogo:",
        error
      );

      this.game = null;

      this.showFatalError(
        "Não foi possível inicializar o jogo. Verifique o console para mais detalhes."
      );
    }
  }

  // =========================================================
  // INTERFACE
  // =========================================================

  setupInterface() {
    if (!this.game) {
      return;
    }

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

    const resumeButton =
      document.getElementById(
        "resumeButton"
      );

    const pauseRestartButton =
      document.getElementById(
        "pauseRestartButton"
      );

    /*
     * JOGAR
     */

    if (startButton) {
      startButton.addEventListener(
        "click",
        () => {
          if (!this.game) {
            return;
          }

          if (
            typeof this.game.startFromMenu ===
            "function"
          ) {
            this.game.startFromMenu();
          } else if (
            typeof this.game.start ===
            "function"
          ) {
            this.game.start();
          }

          this.canvas.focus();
        }
      );
    }

    /*
     * REINICIAR — tela final
     */

    if (restartButton) {
      restartButton.addEventListener(
        "click",
        () => {
          if (!this.game) {
            return;
          }

          if (
            typeof this.game.restart ===
            "function"
          ) {
            this.game.restart();
          }

          this.canvas.focus();
        }
      );
    }

    /*
     * PAUSAR
     */

    if (pauseButton) {
      pauseButton.addEventListener(
        "click",
        () => {
          if (!this.game) {
            return;
          }

          if (
            typeof this.game.togglePause ===
            "function"
          ) {
            this.game.togglePause();
          }

          this.canvas.focus();
        }
      );
    }

    /*
     * CONTINUAR
     */

    if (resumeButton) {
      resumeButton.addEventListener(
        "click",
        () => {
          if (!this.game) {
            return;
          }

          if (
            typeof this.game.resume ===
            "function"
          ) {
            this.game.resume();
          }

          this.canvas.focus();
        }
      );
    }

    /*
     * REINICIAR — tela de pausa
     */

    if (pauseRestartButton) {
      pauseRestartButton.addEventListener(
        "click",
        () => {
          if (!this.game) {
            return;
          }

          if (
            typeof this.game.restart ===
            "function"
          ) {
            this.game.restart();
          }

          this.canvas.focus();
        }
      );
    }
  }

  // =========================================================
  // EVENTOS DA JANELA
  // =========================================================

  setupWindowEvents() {
    window.addEventListener(
      "resize",
      this.handleResize
    );

    this.canvas.addEventListener(
      "contextmenu",
      event => {
        event.preventDefault();
      }
    );

    this.canvas.addEventListener(
      "click",
      () => {
        this.canvas.focus();
      }
    );

    /*
     * Impede que o navegador tente
     * rolar a página com as setas/espaço
     * enquanto o Canvas estiver focado.
     */

    this.canvas.addEventListener(
      "keydown",
      event => {
        const blockedKeys = [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          " "
        ];

        if (
          blockedKeys.includes(
            event.key
          )
        ) {
          event.preventDefault();
        }
      }
    );
  }

  // =========================================================
  // RESPONSIVIDADE
  // =========================================================

  handleResize() {
    if (!this.canvas) {
      return;
    }

    this.canvas.style.aspectRatio =
      "16 / 9";
  }

  // =========================================================
  // GAME LOOP
  // =========================================================

  loop(currentTime) {
    if (!this.started) {
      return;
    }

    let deltaTime =
      (
        currentTime -
        this.lastTime
      ) / 1000;

    if (
      !Number.isFinite(
        deltaTime
      )
    ) {
      deltaTime = 0;
    }

    /*
     * Evita que o jogo "salte"
     * depois de minimizar a janela
     * ou perder alguns frames.
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
          "Erro durante a execução do jogo:",
          error
        );

        this.stop();

        this.showFatalError(
          "O jogo encontrou um erro durante a execução."
        );

        return;
      }
    }

    this.animationFrame =
      requestAnimationFrame(
        this.loop
      );
  }

  // =========================================================
  // PARAR
  // =========================================================

  stop() {
    this.started = false;

    if (
      this.animationFrame !==
      null
    ) {
      cancelAnimationFrame(
        this.animationFrame
      );

      this.animationFrame =
        null;
    }
  }

  // =========================================================
  // ERRO
  // =========================================================

  showFatalError(message) {
    let errorElement =
      document.getElementById(
        "gameError"
      );

    if (!errorElement) {
      errorElement =
        document.createElement(
          "div"
        );

      errorElement.id =
        "gameError";

      errorElement.style.position =
        "fixed";

      errorElement.style.left =
        "50%";

      errorElement.style.top =
        "50%";

      errorElement.style.transform =
        "translate(-50%, -50%)";

      errorElement.style.zIndex =
        "99999";

      errorElement.style.width =
        "min(90vw, 600px)";

      errorElement.style.padding =
        "24px";

      errorElement.style.borderRadius =
        "16px";

      errorElement.style.background =
        "#11151c";

      errorElement.style.color =
        "#ffffff";

      errorElement.style.fontFamily =
        "Arial, Helvetica, sans-serif";

      errorElement.style.textAlign =
        "center";

      errorElement.style.boxShadow =
        "0 20px 60px rgba(0, 0, 0, 0.55)";

      document.body.appendChild(
        errorElement
      );
    }

    errorElement.innerHTML = `
      <strong
        style="
          display:block;
          font-size:20px;
          margin-bottom:10px;
        "
      >
        Erro no Escape Room
      </strong>

      <span
        style="
          display:block;
          font-size:14px;
          line-height:1.5;
          opacity:0.85;
        "
      >
        ${message}
      </span>
    `;
  }

  // =========================================================
  // DESTRUIR
  // =========================================================

  destroy() {
    this.stop();

    window.removeEventListener(
      "resize",
      this.handleResize
    );

    if (
      this.game &&
      typeof this.game.destroy ===
        "function"
    ) {
      this.game.destroy();
    }

    this.game =
      null;

    this.canvas =
      null;
  }
}

// ===========================================================
// START APPLICATION
// ===========================================================

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

/*
 * Disponibiliza a aplicação
 * para testes pelo Console.
 *
 * Exemplo:
 *
 * window.escapeRoom.game.state
 */

window.escapeRoom =
  application;