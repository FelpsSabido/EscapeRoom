import { Game } from "./game.js?v=20260902-4";

class Application {
  constructor() {
    this.canvas = null;
    this.game = null;
    this.lastTime = 0;
    this.animationFrame = null;
    this.started = false;

    this.loop = this.loop.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  init() {
    this.canvas = document.getElementById("gameCanvas");

    if (!this.canvas) {
      console.error("Canvas #gameCanvas não encontrado.");
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
    this.canvas.width = 960;
    this.canvas.height = 540;
    this.canvas.setAttribute("aria-label", "Escape Room — A Sala");
    this.canvas.tabIndex = 0;
    this.handleResize();
  }

  setupGame() {
    try {
      this.game = new Game(this.canvas);
      this.canvas.focus();
    } catch (error) {
      console.error(error);
      this.showFatalError("Não foi possível inicializar o jogo.");
    }
  }

  setupWindowEvents() {
    window.addEventListener("resize", this.handleResize);
    this.canvas.addEventListener("click", () => this.canvas.focus());
    this.canvas.addEventListener("contextmenu", event => event.preventDefault());
  }

  handleResize() {
    if (!this.canvas) return;
    this.canvas.style.aspectRatio = "16 / 9";
  }

  loop(now) {
    if (!this.started) return;

    let deltaTime = (now - this.lastTime) / 1000;
    if (!Number.isFinite(deltaTime)) deltaTime = 0;
    deltaTime = Math.min(Math.max(deltaTime, 0), 0.05);
    this.lastTime = now;

    try {
      if (this.game) {
        this.game.update(deltaTime);
        this.game.render();
      }
    } catch (error) {
      console.error("Erro no game loop:", error);
      this.stop();
      this.showFatalError("O jogo encontrou um erro. Abra o console para ver os detalhes.");
      return;
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
    const element = document.getElementById("gameError");
    if (!element) return;
    element.hidden = false;
    element.textContent = message;
  }

  destroy() {
    this.stop();
    window.removeEventListener("resize", this.handleResize);
    if (this.game) this.game.destroy();
    this.game = null;
  }
}

const application = new Application();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => application.init(), { once: true });
} else {
  application.init();
}

window.escapeRoom = application;