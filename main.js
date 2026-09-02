import { Game } from "./game.js";

class Application {
  constructor() {
    this.canvas = null;
    this.game = null;
    this.lastTime = 0;
    this.animationFrame = null;
    this.started = false;

    this.handleResize = this.handleResize.bind(this);
    this.loop = this.loop.bind(this);
  }

  init() {
    this.canvas = document.getElementById("gameCanvas");

    if (!this.canvas) {
      console.error(
        'Erro: o elemento <canvas id="gameCanvas"> não foi encontrado no index.html.'
      );
      return;
    }

    this.setupCanvas();
    this.setupGame();
    this.setupWindowEvents();

    this.lastTime = performance.now();
    this.started = true;

    this.animationFrame = requestAnimationFrame(this.loop);
  }

  setupCanvas() {
    /*
     * O tamanho interno do Canvas permanece fixo.
     * O CSS fica responsável por adaptá-lo à tela.
     *
     * Isso mantém o mundo do jogo consistente,
     * independentemente da resolução do monitor.
     */
    this.canvas.width = 960;
    this.canvas.height = 540;

    this.canvas.setAttribute(
      "aria-label",
      "Jogo Escape Room"
    );

    this.canvas.setAttribute(
      "role",
      "application"
    );

    this.handleResize();
  }

  setupGame() {
    try {
      this.game = new Game(this.canvas);

      /*
       * Alguns elementos da interface podem existir no HTML.
       * Caso existam, conectamos automaticamente os eventos.
       */
      this.setupInterface();
    } catch (error) {
      console.error("Erro ao inicializar o jogo:", error);

      this.showFatalError(
        "Não foi possível carregar o jogo. Verifique o console para mais detalhes."
      );
    }
  }

  setupInterface() {
    const startButton = document.getElementById("startButton");
    const restartButton = document.getElementById("restartButton");
    const pauseButton = document.getElementById("pauseButton");

    if (startButton) {
      startButton.addEventListener("click", () => {
        if (!this.game) {
          return;
        }

        if (typeof this.game.startFromMenu === "function") {
          this.game.startFromMenu();
        } else if (typeof this.game.start === "function") {
          this.game.start();
        }
      });
    }

    if (restartButton) {
      restartButton.addEventListener("click", () => {
        if (!this.game) {
          return;
        }

        if (typeof this.game.restart === "function") {
          this.game.restart();
        }
      });
    }

    if (pauseButton) {
      pauseButton.addEventListener("click", () => {
        if (!this.game) {
          return;
        }

        if (typeof this.game.togglePause === "function") {
          this.game.togglePause();
        }
      });
    }
  }

  setupWindowEvents() {
    window.addEventListener("resize", this.handleResize);

    /*
     * Impede o menu de contexto sobre o Canvas.
     * Isso evita aquele menu aparecendo com clique direito
     * durante a apresentação.
     */
    this.canvas.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });

    /*
     * Mantém o foco no jogo quando o usuário clicar no Canvas.
     */
    this.canvas.addEventListener("click", () => {
      this.canvas.focus();
    });

    this.canvas.setAttribute("tabindex", "0");
  }

  handleResize() {
    if (!this.canvas) {
      return;
    }

    /*
     * O Canvas é desenhado em 960x540 e escalado pelo CSS.
     * Aqui apenas garantimos que o navegador conheça a proporção
     * correta do elemento.
     */
    this.canvas.style.aspectRatio = "16 / 9";
  }

  loop(currentTime) {
    if (!this.started) {
      return;
    }

    /*
     * Calcula o tempo entre frames.
     *
     * Limitamos o delta para evitar que o personagem
     * atravesse paredes caso a aba fique congelada por alguns segundos.
     */
    let deltaTime = (currentTime - this.lastTime) / 1000;

    if (!Number.isFinite(deltaTime)) {
      deltaTime = 0;
    }

    deltaTime = Math.min(deltaTime, 0.05);

    this.lastTime = currentTime;

    if (this.game) {
      try {
        this.game.update(deltaTime);
        this.game.render();
      } catch (error) {
        console.error("Erro durante a execução do jogo:", error);

        this.stop();

        this.showFatalError(
          "O jogo encontrou um erro durante a execução."
        );

        return;
      }
    }

    this.animationFrame = requestAnimationFrame(this.loop);
  }

  stop() {
    this.started = false;

    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  showFatalError(message) {
    let errorElement = document.getElementById("gameError");

    if (!errorElement) {
      errorElement = document.createElement("div");
      errorElement.id = "gameError";

      errorElement.style.position = "fixed";
      errorElement.style.left = "50%";
      errorElement.style.top = "50%";
      errorElement.style.transform = "translate(-50%, -50%)";
      errorElement.style.zIndex = "99999";
      errorElement.style.width = "min(90vw, 600px)";
      errorElement.style.padding = "24px";
      errorElement.style.borderRadius = "16px";
      errorElement.style.background = "#111827";
      errorElement.style.color = "#ffffff";
      errorElement.style.fontFamily =
        "Arial, Helvetica, sans-serif";
      errorElement.style.textAlign = "center";
      errorElement.style.boxShadow =
        "0 20px 60px rgba(0, 0, 0, 0.5)";

      document.body.appendChild(errorElement);
    }

    errorElement.innerHTML = `
      <strong style="display:block;font-size:20px;margin-bottom:10px;">
        Erro no Escape Room
      </strong>

      <span style="display:block;font-size:14px;line-height:1.5;">
        ${message}
      </span>
    `;
  }

  destroy() {
    this.stop();

    window.removeEventListener("resize", this.handleResize);

    if (this.game && typeof this.game.destroy === "function") {
      this.game.destroy();
    }

    this.game = null;
    this.canvas = null;
  }
}

/*
 * Inicialização segura.
 *
 * Se o script estiver no <head>, esperamos o DOM.
 * Se estiver no final do <body>, inicializamos imediatamente.
 */
const application = new Application();

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    () => {
      application.init();
    },
    { once: true }
  );
} else {
  application.init();
}

/*
 * Disponibiliza a aplicação para debug pelo console.
 *
 * Exemplo:
 * window.escapeRoom.game
 */
window.escapeRoom = application;