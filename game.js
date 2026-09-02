// game.js
// Escape Room — Controlador principal do jogo
// Integra mundo, jogador, câmera, HUD, interações,
// iluminação, pausa, menu e conclusão.

import { Input } from "./input.js";
import { Player } from "./player.js";
import { World } from "./world.js";

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    if (!this.ctx) {
      throw new Error("Não foi possível obter o contexto 2D do Canvas.");
    }

    this.ctx.imageSmoothingEnabled = false;

    this.width = canvas.width || 960;
    this.height = canvas.height || 540;

    this.worldWidth = 1600;
    this.worldHeight = 900;

    this.state = "menu";

    this.elapsedTime = 0;
    this.gameTime = 0;

    this.completed = false;

    this.camera = {
      x: 0,
      y: 0,

      targetX: 0,
      targetY: 0,

      smoothing: 7
    };

    this.world = new World({
      width: this.worldWidth,
      height: this.worldHeight
    });

    this.player = new Player({
      world: this.world
    });

    this.input = new Input(this);

    this.currentInteraction = null;

    this.interactionCooldown = 0;

    this.messageOpen = false;

    this.currentPuzzle = null;

    this.currentTerminal = null;

    this.doorUnlocked = false;

    this.audioStarted = false;

    this.particles = [];

    this.shakeTime = 0;
    this.shakeStrength = 0;

    this.lastFrameTime = performance.now();

    this.setupCanvas();

    this.setupDOM();

    this.reset();

    this.showScreen("menuScreen");
  }

  // =========================================================
  // CANVAS
  // =========================================================

  setupCanvas() {
    this.canvas.width = 960;
    this.canvas.height = 540;

    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.canvas.style.imageRendering = "pixelated";

    this.ctx.imageSmoothingEnabled = false;
  }

  // =========================================================
  // DOM
  // =========================================================

  setupDOM() {
    this.elements = {
      menuScreen: document.getElementById("menuScreen"),
      pauseScreen: document.getElementById("pauseScreen"),
      completionScreen: document.getElementById("completionScreen"),

      startButton: document.getElementById("startButton"),
      resumeButton: document.getElementById("resumeButton"),
      pauseRestartButton:
        document.getElementById("pauseRestartButton"),
      restartButton:
        document.getElementById("restartButton"),

      objectivePanel:
        document.getElementById("objectivePanel"),

      objectiveText:
        document.getElementById("objectiveText"),

      interactionHint:
        document.getElementById("interactionHint"),

      interactionKey:
        document.getElementById("interactionKey"),

      interactionText:
        document.getElementById("interactionText"),

      statusPanel:
        document.getElementById("statusPanel"),

      statusText:
        document.getElementById("statusText"),

      pauseButton:
        document.getElementById("pauseButton"),

      sceneTransition:
        document.getElementById("sceneTransition"),

      screenVignette:
        document.getElementById("screenVignette"),

      messageContainer:
        document.getElementById("messageContainer"),

      messageTitle:
        document.getElementById("messageTitle"),

      messageText:
        document.getElementById("messageText"),

      messageContinue:
        document.getElementById("messageContinue"),

      terminalOverlay:
        document.getElementById("terminalOverlay"),

      terminalDisplay:
        document.getElementById("terminalDisplay"),

      terminalFeedback:
        document.getElementById("terminalFeedback"),

      puzzleOverlay:
        document.getElementById("puzzleOverlay"),

      puzzleTitle:
        document.getElementById("puzzleTitle"),

      puzzleQuestion:
        document.getElementById("puzzleQuestion"),

      puzzleOptions:
        document.getElementById("puzzleOptions"),

      puzzleFeedback:
        document.getElementById("puzzleFeedback"),

      completionTime:
        document.getElementById("completionTime"),

      gameError:
        document.getElementById("gameError")
    };

    this.bindDOMEvents();
  }

  bindDOMEvents() {
    const {
      startButton,
      resumeButton,
      pauseRestartButton,
      restartButton,
      pauseButton,
      messageContinue
    } = this.elements;

    if (startButton) {
      startButton.addEventListener("click", () => {
        this.startFromMenu();
      });
    }

    if (resumeButton) {
      resumeButton.addEventListener("click", () => {
        this.resume();
      });
    }

    if (pauseRestartButton) {
      pauseRestartButton.addEventListener("click", () => {
        this.restart();
      });
    }

    if (restartButton) {
      restartButton.addEventListener("click", () => {
        this.restart();
      });
    }

    if (pauseButton) {
      pauseButton.addEventListener("click", () => {
        this.togglePause();
      });
    }

    if (messageContinue) {
      messageContinue.addEventListener("click", () => {
        this.closeMessage();
      });
    }
  }

  // =========================================================
  // INICIALIZAÇÃO
  // =========================================================

  reset() {
    this.elapsedTime = 0;
    this.gameTime = 0;

    this.completed = false;

    this.doorUnlocked = false;

    this.currentInteraction = null;

    this.interactionCooldown = 0;

    this.messageOpen = false;

    this.currentPuzzle = null;

    this.currentTerminal = null;

    this.particles = [];

    this.shakeTime = 0;
    this.shakeStrength = 0;

    this.world.reset();

    this.player.reset();

    this.updateCamera(true);

    this.hideOverlayElements();

    this.setObjective(
      "Encontre uma maneira de escapar da sala."
    );

    this.setStatus(
      "Explore a sala."
    );
  }

  // =========================================================
  // COMEÇAR
  // =========================================================

  startFromMenu() {
    this.reset();

    this.state = "playing";

    this.elapsedTime = 0;
    this.gameTime = 0;

    this.hideScreen("menuScreen");

    this.hideScreen("pauseScreen");

    this.hideScreen("completionScreen");

    this.showGameplayUI();

    this.startAudio();

    this.showIntroMessage();

    this.createInitialParticles();
  }

  start() {
    this.startFromMenu();
  }

  // =========================================================
  // INTRODUÇÃO
  // =========================================================

  showIntroMessage() {
    this.openMessage(
      "A SALA ESTÁ TRANCADA",
      "Você está sozinho. A porta não abre e a sala está quase completamente escura. Explore o ambiente, observe os detalhes e descubra os códigos escondidos."
    );
  }

  // =========================================================
  // UPDATE
  // =========================================================

  update(deltaTime) {
    if (!Number.isFinite(deltaTime)) {
      deltaTime = 0;
    }

    deltaTime = Math.min(deltaTime, 0.05);

    if (this.state === "menu") {
      this.updateMenu(deltaTime);
      return;
    }

    if (this.state === "paused") {
      return;
    }

    if (this.state === "completed") {
      return;
    }

    if (this.state !== "playing") {
      return;
    }

    if (this.messageOpen) {
      if (this.input.wantsConfirm()) {
        this.closeMessage();
      }

      this.input.endFrame();

      return;
    }

    if (this.currentPuzzle) {
      this.input.endFrame();
      return;
    }

    if (this.currentTerminal) {
      this.input.endFrame();
      return;
    }

    this.gameTime += deltaTime;
    this.elapsedTime += deltaTime;

    if (this.interactionCooldown > 0) {
      this.interactionCooldown -= deltaTime;
    }

    if (this.shakeTime > 0) {
      this.shakeTime -= deltaTime;

      if (this.shakeTime <= 0) {
        this.shakeTime = 0;
        this.shakeStrength = 0;
      }
    }

    this.handlePauseInput();

    this.player.update(
      deltaTime,
      this.input
    );

    this.world.update(deltaTime);

    this.updateCamera();

    this.updateInteraction();

    this.updateParticles(deltaTime);

    this.handleInteraction();

    this.handleDoorExit();

    this.input.endFrame();
  }

  updateMenu(deltaTime) {
    this.world.update(deltaTime);

    this.updateParticles(deltaTime);

    this.input.endFrame();
  }

  // =========================================================
  // PAUSA
  // =========================================================

  handlePauseInput() {
    if (this.input.wantsPause()) {
      this.togglePause();
    }
  }

  togglePause() {
    if (this.state === "playing") {
      this.pause();
    } else if (this.state === "paused") {
      this.resume();
    }
  }

  pause() {
    if (
      this.state !== "playing" ||
      this.messageOpen ||
      this.currentPuzzle ||
      this.currentTerminal
    ) {
      return;
    }

    this.state = "paused";

    this.showScreen("pauseScreen");

    this.hideGameplayUI();
  }

  resume() {
    if (this.state !== "paused") {
      return;
    }

    this.state = "playing";

    this.hideScreen("pauseScreen");

    this.showGameplayUI();
  }

  // =========================================================
  // REINICIAR
  // =========================================================

  restart() {
    this.closeAllOverlays();

    this.reset();

    this.state = "playing";

    this.hideScreen("menuScreen");
    this.hideScreen("pauseScreen");
    this.hideScreen("completionScreen");

    this.showGameplayUI();

    this.startAudio();

    this.createInitialParticles();
  }

  // =========================================================
  // CÂMERA
  // =========================================================

  updateCamera(force = false) {
    const targetX =
      this.player.x -
      this.width / 2;

    const targetY =
      this.player.y -
      this.height / 2;

    const maxX =
      Math.max(
        0,
        this.worldWidth - this.width
      );

    const maxY =
      Math.max(
        0,
        this.worldHeight - this.height
      );

    this.camera.targetX =
      this.clamp(
        targetX,
        0,
        maxX
      );

    this.camera.targetY =
      this.clamp(
        targetY,
        0,
        maxY
      );

    if (force) {
      this.camera.x =
        this.camera.targetX;

      this.camera.y =
        this.camera.targetY;

      return;
    }

    const amount =
      1 -
      Math.exp(
        -this.camera.smoothing *
        (1 / 60)
      );

    this.camera.x +=
      (this.camera.targetX -
        this.camera.x) *
      amount;

    this.camera.y +=
      (this.camera.targetY -
        this.camera.y) *
      amount;
  }

  // =========================================================
  // INTERAÇÕES
  // =========================================================

  updateInteraction() {
    if (
      !this.world ||
      !this.player
    ) {
      return;
    }

    const interaction =
      this.world.getNearestInteraction(
        this.player
      );

    this.currentInteraction =
      interaction;

    if (
      interaction &&
      !this.messageOpen &&
      !this.currentPuzzle &&
      !this.currentTerminal
    ) {
      this.showInteractionHint(
        interaction
      );
    } else {
      this.hideInteractionHint();
    }
  }

  handleInteraction() {
    if (
      this.interactionCooldown > 0 ||
      this.messageOpen ||
      this.currentPuzzle ||
      this.currentTerminal
    ) {
      return;
    }

    if (!this.input.wantsInteract()) {
      return;
    }

    if (!this.currentInteraction) {
      return;
    }

    this.interactionCooldown = 0.25;

    this.interactWith(
      this.currentInteraction
    );
  }

  interactWith(target) {
    switch (target.id) {
      case "board":
        this.interactBoard();
        break;

      case "clock":
        this.interactClock();
        break;

      case "bookshelf":
        this.interactBookshelf();
        break;

      case "cabinet":
        this.interactCabinet();
        break;

      case "computer":
        this.interactComputer();
        break;

      case "teacherDesk":
        this.interactTeacherDesk();
        break;

      case "door":
        this.interactDoor();
        break;

      case "flag":
        this.interactFlag();
        break;

      default:
        this.openMessage(
          target.label || "Objeto",
          target.prompt ||
            "Não há nada para fazer aqui."
        );
        break;
    }
  }

  // =========================================================
  // QUADRO
  // =========================================================

  interactBoard() {
    this.openMessage(
      "O QUADRO",
      "Há várias marcas de giz. Entre elas, algumas parecem formar uma sequência. Talvez a ordem dos objetos da sala tenha alguma relação com isso."
    );

    this.setStatus(
      "Uma pista foi encontrada."
    );

    this.spawnSparkles(
      this.player.x,
      this.player.y - 35,
      12
    );
  }

  // =========================================================
  // RELÓGIO
  // =========================================================

  interactClock() {
    this.openMessage(
      "O RELÓGIO",
      "Os ponteiros parecem estar parados em uma posição específica. Você sente que essa hora pode ser importante."
    );

    this.setStatus(
      "Observe os ponteiros do relógio."
    );

    this.spawnSparkles(
      1190,
      105,
      10
    );
  }

  // =========================================================
  // ESTANTE
  // =========================================================

  interactBookshelf() {
    this.openMessage(
      "A ESTANTE",
      "Entre tantos livros, um deles parece ligeiramente diferente dos outros. Há algo escondido atrás dele."
    );

    this.setObjective(
      "Procure pistas nos objetos da sala."
    );

    this.spawnSparkles(
      1370,
      650,
      14
    );
  }

  // =========================================================
  // ARMÁRIO
  // =========================================================

  interactCabinet() {
    if (!this.doorUnlocked) {
      this.openPuzzle({
        id: "cabinet",
        title: "O ARMÁRIO",
        question:
          "Qual número completa a sequência: 2, 4, 8, 16, ?",
        options: [
          "24",
          "28",
          "32",
          "36"
        ],
        answer: "32",
        success:
          "O armário se abre. Dentro dele há uma pequena chave e um bilhete.",
        failure:
          "A fechadura não se move."
      });

      return;
    }

    this.openMessage(
      "ARMÁRIO ABERTO",
      "O armário já foi aberto. A pista que estava escondida aqui pode ser usada para descobrir o próximo passo."
    );
  }

  // =========================================================
  // COMPUTADOR
  // =========================================================

  interactComputer() {
    this.openTerminal();
  }

  // =========================================================
  // MESA DO PROFESSOR
  // =========================================================

  interactTeacherDesk() {
    this.openMessage(
      "MESA DO PROFESSOR",
      "Há papéis, um livro e algumas anotações. Uma frase está circulada várias vezes: 'Nem tudo precisa ser visto para ser encontrado.'"
    );

    this.setObjective(
      "Use as pistas para descobrir o código."
    );
  }

  // =========================================================
  // BANDEIRA
  // =========================================================

  interactFlag() {
    this.openMessage(
      "BANDEIRA",
      "A bandeira do Brasil está presa na parede. Atrás dela existe apenas uma pequena marca no reboco."
    );

    this.spawnSparkles(
      1210,
      240,
      8
    );
  }

  // =========================================================
  // PORTA
  // =========================================================

  interactDoor() {
    if (this.doorUnlocked) {
      this.openDoor();

      return;
    }

    this.openMessage(
      "A PORTA",
      "Está trancada. Uma pequena fechadura numérica aparece ao lado da maçaneta."
    );

    this.setObjective(
      "Encontre o código para abrir a porta."
    );
  }

  // =========================================================
  // TERMINAL
  // =========================================================

  openTerminal() {
    this.currentTerminal = {
      code: "4816",
      entered: ""
    };

    const overlay =
      this.elements.terminalOverlay;

    if (!overlay) {
      return;
    }

    overlay.classList.add("is-visible");

    overlay.setAttribute(
      "aria-hidden",
      "false"
    );

    this.updateTerminalDisplay();

    this.setStatus(
      "Digite o código encontrado."
    );

    this.setupTerminalButtons();
  }

  setupTerminalButtons() {
    const overlay =
      this.elements.terminalOverlay;

    if (!overlay) {
      return;
    }

    const buttons =
      overlay.querySelectorAll(
        "[data-key]"
      );

    buttons.forEach(button => {
      button.onclick = () => {
        const key =
          button.dataset.key;

        this.handleTerminalKey(key);
      };
    });

    const clearButton =
      overlay.querySelector(
        "[data-action='clear']"
      );

    if (clearButton) {
      clearButton.onclick = () => {
        if (!this.currentTerminal) {
          return;
        }

        this.currentTerminal.entered = "";

        this.updateTerminalDisplay();

        this.setTerminalFeedback("");
      };
    }

    const enterButton =
      overlay.querySelector(
        "[data-action='enter']"
      );

    if (enterButton) {
      enterButton.onclick = () => {
        this.submitTerminal();
      };
    }

    const closeButton =
      overlay.querySelector(
        "[data-action='close']"
      );

    if (closeButton) {
      closeButton.onclick = () => {
        this.closeTerminal();
      };
    }
  }

  handleTerminalKey(key) {
    if (!this.currentTerminal) {
      return;
    }

    if (!/^\d$/.test(key)) {
      return;
    }

    if (
      this.currentTerminal.entered.length >= 4
    ) {
      return;
    }

    this.currentTerminal.entered += key;

    this.updateTerminalDisplay();

    if (
      this.currentTerminal.entered.length === 4
    ) {
      this.submitTerminal();
    }
  }

  updateTerminalDisplay() {
    const display =
      this.elements.terminalDisplay;

    if (!display) {
      return;
    }

    if (!this.currentTerminal) {
      display.textContent = "----";
      return;
    }

    const value =
      this.currentTerminal.entered;

    display.textContent =
      value.padEnd(4, "•");
  }

  setTerminalFeedback(text) {
    const feedback =
      this.elements.terminalFeedback;

    if (!feedback) {
      return;
    }

    feedback.textContent = text;
  }

  submitTerminal() {
    if (!this.currentTerminal) {
      return;
    }

    const entered =
      this.currentTerminal.entered;

    if (entered.length !== 4) {
      this.setTerminalFeedback(
        "Digite 4 números."
      );

      return;
    }

    if (
      entered ===
      this.currentTerminal.code
    ) {
      this.doorUnlocked = true;

      this.world.setDoorOpen(true);

      this.closeTerminal();

      this.setObjective(
        "A porta está aberta. Saia da sala."
      );

      this.setStatus(
        "Código correto!"
      );

      this.openMessage(
        "CÓDIGO CORRETO",
        "A fechadura emite um clique. A porta se abre lentamente. A saída está logo ali."
      );

      this.shakeTime = 0.2;
      this.shakeStrength = 2;

      this.spawnSparkles(
        this.player.x,
        this.player.y,
        24
      );

      this.playSuccessSound();
    } else {
      this.setTerminalFeedback(
        "Código incorreto."
      );

      this.currentTerminal.entered = "";

      this.updateTerminalDisplay();

      this.shakeTime = 0.15;
      this.shakeStrength = 3;

      this.playErrorSound();
    }
  }

  closeTerminal() {
    this.currentTerminal = null;

    const overlay =
      this.elements.terminalOverlay;

    if (!overlay) {
      return;
    }

    overlay.classList.remove(
      "is-visible"
    );

    overlay.setAttribute(
      "aria-hidden",
      "true"
    );
  }

  // =========================================================
  // PUZZLE
  // =========================================================

  openPuzzle(data) {
    if (!data) {
      return;
    }

    this.currentPuzzle = {
      ...data
    };

    const overlay =
      this.elements.puzzleOverlay;

    if (!overlay) {
      return;
    }

    const title =
      this.elements.puzzleTitle;

    const question =
      this.elements.puzzleQuestion;

    const options =
      this.elements.puzzleOptions;

    const feedback =
      this.elements.puzzleFeedback;

    if (title) {
      title.textContent =
        data.title || "Desafio";
    }

    if (question) {
      question.textContent =
        data.question || "";
    }

    if (feedback) {
      feedback.textContent = "";
    }

    if (options) {
      options.innerHTML = "";

      data.options.forEach(option => {
        const button =
          document.createElement("button");

        button.type = "button";

        button.className =
          "puzzle-option";

        button.textContent =
          option;

        button.addEventListener(
          "click",
          () => {
            this.answerPuzzle(option);
          }
        );

        options.appendChild(button);
      });
    }

    overlay.classList.add(
      "is-visible"
    );

    overlay.setAttribute(
      "aria-hidden",
      "false"
    );
  }

  answerPuzzle(answer) {
    if (!this.currentPuzzle) {
      return;
    }

    const puzzle =
      this.currentPuzzle;

    if (answer === puzzle.answer) {
      this.closePuzzle();

      this.doorUnlocked = true;

      this.world.setDoorOpen(true);

      this.setObjective(
        "A porta está aberta. Encontre a saída."
      );

      this.setStatus(
        "Desafio resolvido!"
      );

      this.openMessage(
        "PISTA DESCOBERTA",
        puzzle.success ||
          "Você resolveu o desafio."
      );

      this.spawnSparkles(
        this.player.x,
        this.player.y,
        20
      );

      this.playSuccessSound();
    } else {
      const feedback =
        this.elements.puzzleFeedback;

      if (feedback) {
        feedback.textContent =
          puzzle.failure ||
          "Resposta incorreta.";
      }

      this.shakeTime = 0.12;
      this.shakeStrength = 2;

      this.playErrorSound();
    }
  }

  closePuzzle() {
    this.currentPuzzle = null;

    const overlay =
      this.elements.puzzleOverlay;

    if (!overlay) {
      return;
    }

    overlay.classList.remove(
      "is-visible"
    );

    overlay.setAttribute(
      "aria-hidden",
      "true"
    );
  }

  // =========================================================
  // MENSAGENS
  // =========================================================

  openMessage(title, text) {
    this.messageOpen = true;

    const container =
      this.elements.messageContainer;

    if (!container) {
      return;
    }

    const titleElement =
      this.elements.messageTitle;

    const textElement =
      this.elements.messageText;

    if (titleElement) {
      titleElement.textContent =
        title || "Mensagem";
    }

    if (textElement) {
      textElement.textContent =
        text || "";
    }

    container.classList.add(
      "is-visible"
    );

    container.setAttribute(
      "aria-hidden",
      "false"
    );
  }

  closeMessage() {
    this.messageOpen = false;

    const container =
      this.elements.messageContainer;

    if (!container) {
      return;
    }

    container.classList.remove(
      "is-visible"
    );

    container.setAttribute(
      "aria-hidden",
      "true"
    );
  }

  // =========================================================
  // SAÍDA
  // =========================================================

  handleDoorExit() {
    if (
      !this.doorUnlocked ||
      this.completed
    ) {
      return;
    }

    // Área da porta aberta
    const doorX = 150;
    const doorY = 410;

    const distance =
      Math.hypot(
        this.player.x - doorX,
        this.player.y - doorY
      );

    if (distance < 115) {
      this.completeGame();
    }
  }

  openDoor() {
    if (!this.doorUnlocked) {
      return;
    }

    this.world.setDoorOpen(true);

    this.setObjective(
      "Atravesse a porta."
    );

    this.setStatus(
      "A saída está aberta."
    );
  }

  // =========================================================
  // CONCLUSÃO
  // =========================================================

  completeGame() {
    if (this.completed) {
      return;
    }

    this.completed = true;

    this.state = "completed";

    this.world.setDoorOpen(true);

    this.hideGameplayUI();

    this.closeAllOverlays();

    const completionTime =
      this.elements.completionTime;

    if (completionTime) {
      completionTime.textContent =
        this.formatTime(
          this.elapsedTime
        );
    }

    this.showScreen(
      "completionScreen"
    );

    this.spawnSparkles(
      this.player.x,
      this.player.y,
      40
    );

    this.playSuccessSound();
  }

  // =========================================================
  // RENDER
  // =========================================================

  render() {
    const ctx = this.ctx;

    if (!ctx) {
      return;
    }

    ctx.save();

    ctx.clearRect(
      0,
      0,
      this.width,
      this.height
    );

    // Fundo externo
    this.drawCanvasBackground(ctx);

    let shakeX = 0;
    let shakeY = 0;

    if (this.shakeTime > 0) {
      shakeX =
        (Math.random() - 0.5) *
        this.shakeStrength;

      shakeY =
        (Math.random() - 0.5) *
        this.shakeStrength;
    }

    const renderCamera = {
      x: this.camera.x - shakeX,
      y: this.camera.y - shakeY
    };

    this.world.render(
      ctx,
      renderCamera
    );

    this.renderParticles(
      ctx,
      renderCamera
    );

    this.player.render(
      ctx,
      renderCamera
    );

    this.world.renderLighting(
      ctx,
      this.player,
      renderCamera,
      this.gameTime
    );

    this.renderAtmosphere(ctx);

    ctx.restore();
  }

  // =========================================================
  // FUNDO DO CANVAS
  // =========================================================

  drawCanvasBackground(ctx) {
    const gradient =
      ctx.createLinearGradient(
        0,
        0,
        0,
        this.height
      );

    gradient.addColorStop(
      0,
      "#070b0f"
    );

    gradient.addColorStop(
      1,
      "#10161b"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
      0,
      0,
      this.width,
      this.height
    );
  }

  // =========================================================
  // ATMOSFERA
  // =========================================================

  renderAtmosphere(ctx) {
    // Pequena camada de granulação.
    // Não usamos imagem externa, tudo é desenhado no Canvas.

    ctx.save();

    for (let i = 0; i < 70; i++) {
      const x =
        (i * 137.31 +
          this.gameTime * 3) %
        this.width;

      const y =
        (i * 71.19 +
          Math.sin(
            this.gameTime +
            i
          ) *
            4) %
        this.height;

      ctx.fillStyle =
        i % 3 === 0
          ? "rgba(255,255,255,0.025)"
          : "rgba(255,255,255,0.012)";

      ctx.fillRect(
        Math.floor(x),
        Math.floor(y),
        1,
        1
      );
    }

    ctx.restore();
  }

  // =========================================================
  // PARTÍCULAS
  // =========================================================

  createInitialParticles() {
    this.particles = [];

    for (let i = 0; i < 24; i++) {
      this.particles.push({
        x:
          Math.random() *
          this.worldWidth,

        y:
          520 +
          Math.random() *
            350,

        vx:
          (Math.random() - 0.5) *
          8,

        vy:
          -Math.random() * 5,

        life:
          2 +
          Math.random() * 3,

        maxLife:
          2 +
          Math.random() * 3,

        size:
          Math.random() > 0.75
            ? 2
            : 1,

        type: "dust"
      });
    }
  }

  spawnSparkles(x, y, amount = 12) {
    for (let i = 0; i < amount; i++) {
      this.particles.push({
        x:
          x +
          (Math.random() - 0.5) *
            40,

        y:
          y +
          (Math.random() - 0.5) *
            40,

        vx:
          (Math.random() - 0.5) *
          50,

        vy:
          (Math.random() - 0.5) *
          50,

        life:
          0.5 +
          Math.random() *
            0.8,

        maxLife:
          0.5 +
          Math.random() *
            0.8,

        size:
          Math.random() > 0.5
            ? 2
            : 1,

        type: "spark"
      });
    }
  }

  updateParticles(deltaTime) {
    for (
      let i =
        this.particles.length - 1;
      i >= 0;
      i--
    ) {
      const particle =
        this.particles[i];

      particle.life -= deltaTime;

      if (particle.life <= 0) {
        this.particles.splice(
          i,
          1
        );

        continue;
      }

      particle.x +=
        particle.vx *
        deltaTime;

      particle.y +=
        particle.vy *
        deltaTime;

      if (
        particle.type ===
        "dust"
      ) {
        particle.vy -=
          0.5 *
          deltaTime;

        particle.vx *=
          0.995;
      } else {
        particle.vy +=
          20 *
          deltaTime;

        particle.vx *=
          0.98;
      }
    }
  }

  renderParticles(ctx, camera) {
    ctx.save();

    for (const particle of this.particles) {
      const x =
        particle.x -
        camera.x;

      const y =
        particle.y -
        camera.y;

      if (
        x < -10 ||
        y < -10 ||
        x > this.width + 10 ||
        y > this.height + 10
      ) {
        continue;
      }

      const alpha =
        particle.life /
        particle.maxLife;

      if (
        particle.type ===
        "spark"
      ) {
        ctx.fillStyle =
          `rgba(245, 220, 160, ${alpha * 0.8})`;
      } else {
        ctx.fillStyle =
          `rgba(220, 208, 178, ${alpha * 0.16})`;
      }

      ctx.fillRect(
        Math.round(x),
        Math.round(y),
        particle.size,
        particle.size
      );
    }

    ctx.restore();
  }

  // =========================================================
  // HUD
  // =========================================================

  setObjective(text) {
    const element =
      this.elements.objectiveText;

    if (element) {
      element.textContent =
        text || "";
    }
  }

  setStatus(text) {
    const element =
      this.elements.statusText;

    if (element) {
      element.textContent =
        text || "";
    }
  }

  showInteractionHint(target) {
    const hint =
      this.elements.interactionHint;

    const key =
      this.elements.interactionKey;

    const text =
      this.elements.interactionText;

    if (!hint) {
      return;
    }

    hint.classList.add(
      "is-visible"
    );

    if (key) {
      key.textContent = "E";
    }

    if (text) {
      text.textContent =
        `Interagir: ${target.label || "objeto"}`;
    }
  }

  hideInteractionHint() {
    const hint =
      this.elements.interactionHint;

    if (!hint) {
      return;
    }

    hint.classList.remove(
      "is-visible"
    );
  }

  showGameplayUI() {
    const objective =
      this.elements.objectivePanel;

    const status =
      this.elements.statusPanel;

    const pause =
      this.elements.pauseButton;

    if (objective) {
      objective.classList.add(
        "is-visible"
      );
    }

    if (status) {
      status.classList.add(
        "is-visible"
      );
    }

    if (pause) {
      pause.classList.add(
        "is-visible"
      );
    }
  }

  hideGameplayUI() {
    const objective =
      this.elements.objectivePanel;

    const status =
      this.elements.statusPanel;

    const hint =
      this.elements.interactionHint;

    const pause =
      this.elements.pauseButton;

    if (objective) {
      objective.classList.remove(
        "is-visible"
      );
    }

    if (status) {
      status.classList.remove(
        "is-visible"
      );
    }

    if (hint) {
      hint.classList.remove(
        "is-visible"
      );
    }

    if (pause) {
      pause.classList.remove(
        "is-visible"
      );
    }
  }

  // =========================================================
  // TELAS
  // =========================================================

  showScreen(id) {
    const screens = [
      "menuScreen",
      "pauseScreen",
      "completionScreen"
    ];

    screens.forEach(screenId => {
      const element =
        this.elements[screenId];

      if (!element) {
        return;
      }

      if (screenId === id) {
        element.classList.add(
          "is-visible"
        );

        element.setAttribute(
          "aria-hidden",
          "false"
        );
      } else {
        element.classList.remove(
          "is-visible"
        );

        element.setAttribute(
          "aria-hidden",
          "true"
        );
      }
    });
  }

  hideScreen(id) {
    const element =
      this.elements[id];

    if (!element) {
      return;
    }

    element.classList.remove(
      "is-visible"
    );

    element.setAttribute(
      "aria-hidden",
      "true"
    );
  }

  // =========================================================
  // OVERLAYS
  // =========================================================

  hideOverlayElements() {
    this.hideInteractionHint();

    const message =
      this.elements.messageContainer;

    if (message) {
      message.classList.remove(
        "is-visible"
      );

      message.setAttribute(
        "aria-hidden",
        "true"
      );
    }

    const terminal =
      this.elements.terminalOverlay;

    if (terminal) {
      terminal.classList.remove(
        "is-visible"
      );

      terminal.setAttribute(
        "aria-hidden",
        "true"
      );
    }

    const puzzle =
      this.elements.puzzleOverlay;

    if (puzzle) {
      puzzle.classList.remove(
        "is-visible"
      );

      puzzle.setAttribute(
        "aria-hidden",
        "true"
      );
    }
  }

  closeAllOverlays() {
    this.messageOpen = false;

    this.currentPuzzle = null;

    this.currentTerminal = null;

    this.hideOverlayElements();
  }

  // =========================================================
  // ÁUDIO
  // =========================================================

  startAudio() {
    if (this.audioStarted) {
      return;
    }

    this.audioStarted = true;

    // O jogo funciona sem áudio externo.
    // Aqui deixamos preparado para WebAudio.
    this.audioContext = null;

    try {
      const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

      if (AudioContext) {
        this.audioContext =
          new AudioContext();
      }
    } catch (error) {
      this.audioContext = null;
    }
  }

  playTone(
    frequency,
    duration = 0.08,
    type = "sine",
    volume = 0.025
  ) {
    if (!this.audioContext) {
      return;
    }

    try {
      if (
        this.audioContext.state ===
        "suspended"
      ) {
        this.audioContext.resume();
      }

      const oscillator =
        this.audioContext.createOscillator();

      const gain =
        this.audioContext.createGain();

      oscillator.type = type;

      oscillator.frequency.value =
        frequency;

      gain.gain.setValueAtTime(
        0,
        this.audioContext.currentTime
      );

      gain.gain.linearRampToValueAtTime(
        volume,
        this.audioContext.currentTime +
          0.01
      );

      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioContext.currentTime +
          duration
      );

      oscillator.connect(gain);

      gain.connect(
        this.audioContext.destination
      );

      oscillator.start();

      oscillator.stop(
        this.audioContext.currentTime +
          duration
      );
    } catch (error) {
      // O jogo continua normalmente se o áudio não estiver disponível.
    }
  }

  playSuccessSound() {
    this.playTone(
      523.25,
      0.12,
      "sine",
      0.035
    );

    window.setTimeout(() => {
      this.playTone(
        659.25,
        0.14,
        "sine",
        0.035
      );
    }, 90);

    window.setTimeout(() => {
      this.playTone(
        783.99,
        0.18,
        "sine",
        0.035
      );
    }, 190);
  }

  playErrorSound() {
    this.playTone(
      150,
      0.16,
      "square",
      0.025
    );
  }

  // =========================================================
  // TECLADO
  // =========================================================

  handleKeyDown(event) {
    if (!event) {
      return;
    }

    if (
      event.key === "Enter" &&
      this.messageOpen
    ) {
      this.closeMessage();

      return;
    }

    if (
      event.key === "Escape" &&
      this.currentTerminal
    ) {
      this.closeTerminal();

      return;
    }

    if (
      event.key === "Escape" &&
      this.currentPuzzle
    ) {
      this.closePuzzle();

      return;
    }
  }

  // =========================================================
  // UTILIDADES
  // =========================================================

  clamp(value, min, max) {
    return Math.max(
      min,
      Math.min(max, value)
    );
  }

  formatTime(seconds) {
    const totalSeconds =
      Math.max(
        0,
        Math.floor(seconds)
      );

    const minutes =
      Math.floor(
        totalSeconds / 60
      );

    const remaining =
      totalSeconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(remaining).padStart(
      2,
      "0"
    )}`;
  }

  // =========================================================
  // DESTRUIR
  // =========================================================

  destroy() {
    if (this.input) {
      this.input.destroy();
    }

    if (this.world) {
      this.world.destroy();
    }

    if (this.player) {
      this.player.destroy();
    }

    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (error) {
        // Ignora erros de encerramento do áudio.
      }
    }

    this.input = null;
    this.world = null;
    this.player = null;
    this.canvas = null;
    this.ctx = null;
  }
}