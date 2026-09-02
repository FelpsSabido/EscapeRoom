import { Game } from "./game.js?v=20260902-5";

class Application {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");

    this.loadingScreen = document.getElementById("loadingScreen");
    this.loadingText = document.getElementById("loadingText");
    this.loadingProgress = document.getElementById("loadingProgress");

    this.startScreen = document.getElementById("startScreen");
    this.startButton = document.getElementById("startButton");

    this.hud = document.getElementById("hud");
    this.objectiveText = document.getElementById("objectiveText");
    this.interactionHint = document.getElementById("interactionHint");
    this.interactionKey = document.getElementById("interactionKey");
    this.interactionText = document.getElementById("interactionText");

    this.voiceIndicator = document.getElementById("voiceIndicator");
    this.voiceButton = document.getElementById("voiceButton");

    this.messageOverlay = document.getElementById("messageOverlay");
    this.messageTitle = document.getElementById("messageTitle");
    this.messageText = document.getElementById("messageText");
    this.messageVoiceButton = document.getElementById(
      "messageVoiceButton"
    );
    this.messageContinueButton = document.getElementById(
      "messageContinueButton"
    );

    this.puzzleOverlay = document.getElementById("puzzleOverlay");
    this.puzzleTitle = document.getElementById("puzzleTitle");
    this.puzzleQuestion = document.getElementById("puzzleQuestion");
    this.puzzleVoiceButton = document.getElementById(
      "puzzleVoiceButton"
    );
    this.puzzleInput = document.getElementById("puzzleInput");
    this.puzzleFeedback = document.getElementById("puzzleFeedback");
    this.puzzleSubmit = document.getElementById("puzzleSubmit");
    this.puzzleCancel = document.getElementById("puzzleCancel");

    this.terminalOverlay = document.getElementById("terminalOverlay");
    this.terminalText = document.getElementById("terminalText");
    this.terminalCodeDisplay = document.getElementById(
      "terminalCodeDisplay"
    );
    this.terminalVoiceButton = document.getElementById(
      "terminalVoiceButton"
    );
    this.terminalInput = document.getElementById("terminalInput");
    this.terminalFeedback = document.getElementById(
      "terminalFeedback"
    );
    this.terminalSubmit = document.getElementById("terminalSubmit");
    this.terminalCancel = document.getElementById("terminalCancel");

    this.pauseScreen = document.getElementById("pauseScreen");
    this.pauseButton = document.getElementById("pauseButton");
    this.restartButton = document.getElementById("restartButton");

    this.completeScreen = document.getElementById("completeScreen");
    this.completeRestartButton = document.getElementById(
      "completeRestartButton"
    );

    this.gameError = document.getElementById("gameError");
    this.gameErrorText = document.getElementById("gameErrorText");
    this.errorReloadButton = document.getElementById(
      "errorReloadButton"
    );

    this.game = null;

    this.running = false;
    this.lastTime = 0;
    this.animationFrame = null;

    this.bindEvents();

    window.escapeRoom = {
      application: this
    };

    this.initialize();
  }

  /* =======================================================
     INICIALIZAÇÃO
  ======================================================== */

  async initialize() {
    try {
      this.setLoading(
        10,
        "Preparando sistema..."
      );

      await this.wait(150);

      this.setLoading(
        30,
        "Carregando ambiente..."
      );

      this.game = new Game(this.canvas);

      await this.wait(150);

      this.setLoading(
        55,
        "Preparando personagem..."
      );

      await this.wait(150);

      this.setLoading(
        75,
        "Preparando áudio..."
      );

      await this.wait(150);

      this.setLoading(
        92,
        "Finalizando..."
      );

      await this.wait(200);

      this.setLoading(
        100,
        "Sistema pronto."
      );

      await this.wait(300);

      this.showStartScreen();

      window.escapeRoom.game = this.game;

      this.startLoop();

    } catch (error) {
      console.error(
        "Erro ao inicializar o jogo:",
        error
      );

      this.showError(
        error?.message ||
        "Erro desconhecido ao iniciar o jogo."
      );
    }
  }

  wait(milliseconds) {
    return new Promise((resolve) => {
      window.setTimeout(
        resolve,
        milliseconds
      );
    });
  }

  setLoading(progress, text) {
    if (this.loadingProgress) {
      this.loadingProgress.style.width =
        `${Math.max(0, Math.min(100, progress))}%`;
    }

    if (this.loadingText) {
      this.loadingText.textContent = text;
    }
  }

  /* =======================================================
     EVENTOS
  ======================================================== */

  bindEvents() {

    if (this.startButton) {
      this.startButton.addEventListener(
        "click",
        () => this.startGame()
      );
    }

    if (this.voiceButton) {
      this.voiceButton.addEventListener(
        "click",
        () => this.game?.speakCurrentText()
      );
    }

    if (this.messageVoiceButton) {
      this.messageVoiceButton.addEventListener(
        "click",
        () => this.game?.speakCurrentText()
      );
    }

    if (this.messageContinueButton) {
      this.messageContinueButton.addEventListener(
        "click",
        () => this.game?.closeMessage()
      );
    }

    if (this.puzzleVoiceButton) {
      this.puzzleVoiceButton.addEventListener(
        "click",
        () => this.game?.speakCurrentPuzzle()
      );
    }

    if (this.puzzleSubmit) {
      this.puzzleSubmit.addEventListener(
        "click",
        () => this.game?.submitPuzzle()
      );
    }

    if (this.puzzleCancel) {
      this.puzzleCancel.addEventListener(
        "click",
        () => this.game?.closePuzzle()
      );
    }

    if (this.puzzleInput) {
      this.puzzleInput.addEventListener(
        "keydown",
        (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            this.game?.submitPuzzle();
          }

          if (event.key === "Escape") {
            event.preventDefault();
            this.game?.closePuzzle();
          }
        }
      );
    }

    if (this.terminalVoiceButton) {
      this.terminalVoiceButton.addEventListener(
        "click",
        () => this.game?.speakTerminal()
      );
    }

    if (this.terminalSubmit) {
      this.terminalSubmit.addEventListener(
        "click",
        () => this.game?.submitTerminal()
      );
    }

    if (this.terminalCancel) {
      this.terminalCancel.addEventListener(
        "click",
        () => this.game?.closeTerminal()
      );
    }

    if (this.terminalInput) {
      this.terminalInput.addEventListener(
        "keydown",
        (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            this.game?.submitTerminal();
          }

          if (event.key === "Escape") {
            event.preventDefault();
            this.game?.closeTerminal();
          }
        }
      );
    }

    if (this.pauseButton) {
      this.pauseButton.addEventListener(
        "click",
        () => this.game?.togglePause()
      );
    }

    if (this.restartButton) {
      this.restartButton.addEventListener(
        "click",
        () => this.game?.restart()
      );
    }

    if (this.completeRestartButton) {
      this.completeRestartButton.addEventListener(
        "click",
        () => this.game?.restart()
      );
    }

    if (this.errorReloadButton) {
      this.errorReloadButton.addEventListener(
        "click",
        () => window.location.reload()
      );
    }

    document.addEventListener(
      "visibilitychange",
      () => {
        if (
          document.hidden &&
          this.game &&
          this.game.state === "playing"
        ) {
          this.game.pause();
        }
      }
    );

    window.addEventListener(
      "resize",
      () => {
        this.game?.resize();
      }
    );
  }

  /* =======================================================
     INICIAR JOGO
  ======================================================== */

  startGame() {
    if (!this.game) {
      return;
    }

    this.hideElement(
      this.loadingScreen
    );

    this.hideElement(
      this.startScreen
    );

    this.hideElement(
      this.pauseScreen
    );

    this.hideElement(
      this.completeScreen
    );

    this.hideElement(
      this.gameError
    );

    this.showElement(
      this.hud
    );

    this.game.start();

    this.updateHUD();

    this.startLoop();
  }

  /* =======================================================
     LOOP
  ======================================================== */

  startLoop() {
    if (this.running) {
      return;
    }

    this.running = true;
    this.lastTime = performance.now();

    const loop = (time) => {

      if (!this.running) {
        return;
      }

      const deltaTime =
        Math.min(
          (time - this.lastTime) / 1000,
          0.05
        );

      this.lastTime = time;

      try {
        if (this.game) {
          this.game.update(deltaTime);
          this.game.render();

          this.updateHUD();
        }
      } catch (error) {
        console.error(
          "Erro no game loop:",
          error
        );

        this.running = false;

        this.showError(
          error?.message ||
          "O jogo encontrou um erro durante a execução."
        );

        return;
      }

      this.animationFrame =
        requestAnimationFrame(loop);
    };

    this.animationFrame =
      requestAnimationFrame(loop);
  }

  stopLoop() {
    this.running = false;

    if (this.animationFrame !== null) {
      cancelAnimationFrame(
        this.animationFrame
      );

      this.animationFrame = null;
    }
  }

  /* =======================================================
     HUD
  ======================================================== */

  updateHUD() {
    if (!this.game) {
      return;
    }

    const state = this.game.state;

    if (
      state === "playing" ||
      state === "message" ||
      state === "puzzle" ||
      state === "terminal"
    ) {
      this.showElement(this.hud);
    }

    if (
      state === "menu" ||
      state === "paused" ||
      state === "complete" ||
      state === "error"
    ) {
      if (state !== "paused") {
        this.hideElement(this.hud);
      }
    }

    if (
      this.objectiveText &&
      this.game.objectiveText
    ) {
      this.objectiveText.textContent =
        this.game.objectiveText;
    }

    this.updateInteractionHint();

    if (
      this.voiceIndicator &&
      this.game.isSpeaking
    ) {
      this.showElement(
        this.voiceIndicator
      );
    } else {
      this.hideElement(
        this.voiceIndicator
      );
    }

    if (
      this.voiceButton &&
      (
        state === "playing" ||
        state === "message" ||
        state === "puzzle" ||
        state === "terminal"
      )
    ) {
      this.showElement(
        this.voiceButton
      );
    } else {
      this.hideElement(
        this.voiceButton
      );
    }

    this.syncOverlays();
  }

  updateInteractionHint() {
    if (
      !this.interactionHint ||
      !this.game
    ) {
      return;
    }

    if (
      this.game.state !== "playing" ||
      this.game.messageOpen ||
      this.game.puzzleOpen ||
      this.game.terminalOpen
    ) {
      this.hideElement(
        this.interactionHint
      );

      return;
    }

    const target =
      this.game.currentInteractionTarget;

    if (!target) {
      this.hideElement(
        this.interactionHint
      );

      return;
    }

    this.interactionKey.textContent = "E";

    this.interactionText.textContent =
      target.prompt ||
      target.label ||
      "Interagir";

    this.showElement(
      this.interactionHint
    );
  }

  /* =======================================================
     SINCRONIZAÇÃO DOS OVERLAYS
  ======================================================== */

  syncOverlays() {
    if (!this.game) {
      return;
    }

    if (
      this.game.messageOpen
    ) {
      this.showElement(
        this.messageOverlay
      );

      if (this.messageTitle) {
        this.messageTitle.textContent =
          this.game.currentMessageTitle ||
          "SISTEMA";
      }

      if (this.messageText) {
        this.messageText.textContent =
          this.game.currentMessageText ||
          "";
      }
    } else {
      this.hideElement(
        this.messageOverlay
      );
    }

    if (
      this.game.puzzleOpen
    ) {
      this.showElement(
        this.puzzleOverlay
      );

      if (this.puzzleTitle) {
        this.puzzleTitle.textContent =
          this.game.currentPuzzleTitle ||
          "DESAFIO";
      }

      if (this.puzzleQuestion) {
        this.puzzleQuestion.textContent =
          this.game.currentPuzzleQuestion ||
          "";
      }

      if (
        document.activeElement !==
        this.puzzleInput
      ) {
        this.puzzleInput?.focus();
      }
    } else {
      this.hideElement(
        this.puzzleOverlay
      );
    }

    if (
      this.game.terminalOpen
    ) {
      this.showElement(
        this.terminalOverlay
      );

      if (this.terminalText) {
        this.terminalText.textContent =
          this.game.currentTerminalText ||
          "Insira o código de acesso.";
      }

      if (this.terminalCodeDisplay) {
        this.terminalCodeDisplay.textContent =
          this.game.terminalCodeDisplay ||
          "_ _ _ _";
      }

      if (
        document.activeElement !==
        this.terminalInput
      ) {
        this.terminalInput?.focus();
      }
    } else {
      this.hideElement(
        this.terminalOverlay
      );
    }

    if (
      this.game.state === "paused"
    ) {
      this.showElement(
        this.pauseScreen
      );
    } else {
      this.hideElement(
        this.pauseScreen
      );
    }

    if (
      this.game.state === "complete"
    ) {
      this.showElement(
        this.completeScreen
      );
    } else {
      this.hideElement(
        this.completeScreen
      );
    }
  }

  /* =======================================================
     TELAS
  ======================================================== */

  showStartScreen() {
    this.hideElement(
      this.loadingScreen
    );

    this.hideElement(
      this.gameError
    );

    this.showElement(
      this.startScreen
    );
  }

  showError(message) {
    this.stopLoop();

    this.hideElement(
      this.loadingScreen
    );

    this.hideElement(
      this.startScreen
    );

    this.hideElement(
      this.hud
    );

    this.hideElement(
      this.pauseScreen
    );

    this.hideElement(
      this.completeScreen
    );

    if (this.gameErrorText) {
      this.gameErrorText.textContent =
        message;
    }

    this.showElement(
      this.gameError
    );
  }

  /* =======================================================
     HELPERS
  ======================================================== */

  showElement(element) {
    if (!element) {
      return;
    }

    element.classList.remove(
      "hidden"
    );

    element.classList.add(
      "active",
      "is-visible"
    );
  }

  hideElement(element) {
    if (!element) {
      return;
    }

    element.classList.remove(
      "active",
      "is-visible"
    );

    element.classList.add(
      "hidden"
    );
  }

  /* =======================================================
     DESTRUIÇÃO
  ======================================================== */

  destroy() {
    this.stopLoop();

    if (this.game) {
      this.game.destroy();
      this.game = null;
    }

    window.escapeRoom = null;
  }
}

/* =========================================================
   INICIALIZAÇÃO
========================================================= */

let application = null;

try {
  application = new Application();
} catch (error) {
  console.error(
    "Falha crítica ao iniciar aplicação:",
    error
  );

  const errorElement =
    document.getElementById("gameError");

  const errorText =
    document.getElementById("gameErrorText");

  if (errorText) {
    errorText.textContent =
      error?.message ||
      "Falha crítica ao iniciar o jogo.";
  }

  if (errorElement) {
    errorElement.classList.remove(
      "hidden"
    );

    errorElement.classList.add(
      "active",
      "is-visible"
    );
  }
}

export {
  Application
};