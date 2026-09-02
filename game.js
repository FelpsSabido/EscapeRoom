// game.js
// Escape Room — Controlador principal
// Compatível com:
// index.html
// main.js
// input.js
// player.js
// world.js

import { Input } from "./input.js";
import { Player } from "./player.js";
import { World } from "./world.js";

export class Game {
  constructor(canvas) {
    this.canvas = canvas;

    this.ctx = canvas.getContext("2d");

    if (!this.ctx) {
      throw new Error(
        "Não foi possível obter o contexto 2D do Canvas."
      );
    }

    this.ctx.imageSmoothingEnabled = false;

    this.width = 960;
    this.height = 540;

    this.worldWidth = 1600;
    this.worldHeight = 900;

    this.state = "menu";

    this.elapsedTime = 0;
    this.gameTime = 0;

    this.completed = false;

    this.doorUnlocked = false;

    this.currentInteraction = null;

    this.currentPuzzle = null;
    this.currentTerminal = null;

    this.messageOpen = false;

    this.interactionCooldown = 0;

    this.camera = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      smoothing: 8
    };

    this.particles = [];

    this.shakeTime = 0;
    this.shakeStrength = 0;

    this.audioStarted = false;
    this.audioContext = null;

    // =====================================================
    // IMPORTANTE:
    // O World recebe width e height diretamente.
    // Não passar { width, height }.
    // =====================================================

    this.world = new World(
      this.worldWidth,
      this.worldHeight
    );

    this.player = new Player({
      world: this.world
    });

    this.input = new Input(this);

    this.setupCanvas();
    this.setupDOM();

    this.reset();

    this.showScreen("menuScreen");

    this.hideGameplayUI();
  }

  // =====================================================
  // CANVAS
  // =====================================================

  setupCanvas() {
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.canvas.style.imageRendering = "pixelated";

    this.ctx.imageSmoothingEnabled = false;

    this.canvas.setAttribute(
      "aria-label",
      "Escape Room"
    );

    this.canvas.setAttribute(
      "role",
      "application"
    );
  }

  // =====================================================
  // DOM
  // =====================================================

  setupDOM() {
    this.elements = {
      menuScreen:
        document.getElementById("menuScreen"),

      pauseScreen:
        document.getElementById("pauseScreen"),

      completionScreen:
        document.getElementById("completionScreen"),

      startButton:
        document.getElementById("startButton"),

      resumeButton:
        document.getElementById("resumeButton"),

      pauseRestartButton:
        document.getElementById(
          "pauseRestartButton"
        ),

      restartButton:
        document.getElementById(
          "restartButton"
        ),

      objectivePanel:
        document.getElementById(
          "objectivePanel"
        ),

      objectiveText:
        document.getElementById(
          "objectiveText"
        ),

      interactionHint:
        document.getElementById(
          "interactionHint"
        ),

      interactionKey:
        document.getElementById(
          "interactionKey"
        ),

      interactionText:
        document.getElementById(
          "interactionText"
        ),

      statusPanel:
        document.getElementById(
          "statusPanel"
        ),

      statusText:
        document.getElementById(
          "statusText"
        ),

      pauseButton:
        document.getElementById(
          "pauseButton"
        ),

      screenVignette:
        document.getElementById(
          "screenVignette"
        ),

      sceneTransition:
        document.getElementById(
          "sceneTransition"
        ),

      messageContainer:
        document.getElementById(
          "messageContainer"
        ),

      messageTitle:
        document.getElementById(
          "messageTitle"
        ),

      messageText:
        document.getElementById(
          "messageText"
        ),

      messageContinue:
        document.getElementById(
          "messageContinue"
        ),

      terminalOverlay:
        document.getElementById(
          "terminalOverlay"
        ),

      terminalDisplay:
        document.getElementById(
          "terminalDisplay"
        ),

      terminalFeedback:
        document.getElementById(
          "terminalFeedback"
        ),

      puzzleOverlay:
        document.getElementById(
          "puzzleOverlay"
        ),

      puzzleTitle:
        document.getElementById(
          "puzzleTitle"
        ),

      puzzleQuestion:
        document.getElementById(
          "puzzleQuestion"
        ),

      puzzleOptions:
        document.getElementById(
          "puzzleOptions"
        ),

      puzzleFeedback:
        document.getElementById(
          "puzzleFeedback"
        ),

      completionTime:
        document.getElementById(
          "completionTime"
        )
    };

    this.bindDOMEvents();
  }

  bindDOMEvents() {
    /*
      NÃO registramos aqui:
      startButton
      restartButton
      pauseButton

      O main.js já registra esses botões.

      Isso evita que um clique execute
      startFromMenu() duas vezes.
    */

    if (this.elements.resumeButton) {
      this.elements.resumeButton.addEventListener(
        "click",
        () => {
          this.resume();
        }
      );
    }

    if (this.elements.pauseRestartButton) {
      this.elements.pauseRestartButton.addEventListener(
        "click",
        () => {
          this.restart();
        }
      );
    }

    if (this.elements.messageContinue) {
      this.elements.messageContinue.addEventListener(
        "click",
        () => {
          this.closeMessage();
        }
      );
    }

    this.setupTerminalButtons();
  }

  // =====================================================
  // RESET
  // =====================================================

  reset() {
    this.elapsedTime = 0;
    this.gameTime = 0;

    this.completed = false;

    this.doorUnlocked = false;

    this.currentInteraction = null;

    this.currentPuzzle = null;
    this.currentTerminal = null;

    this.messageOpen = false;

    this.interactionCooldown = 0;

    this.shakeTime = 0;
    this.shakeStrength = 0;

    this.particles = [];

    if (this.world) {
      this.world.reset();
    }

    if (this.player) {
      this.player.reset();
    }

    this.updateCamera(true);

    this.hideOverlayElements();

    this.setObjective(
      "Encontre uma maneira de escapar da sala."
    );

    this.setStatus(
      "Explore a sala."
    );
  }

  // =====================================================
  // INÍCIO
  // =====================================================

  startFromMenu() {
    /*
      Proteção contra o botão sendo acionado
      duas vezes ou por cache antigo.
    */

    if (this.state === "playing") {
      return;
    }

    this.closeAllOverlays();

    this.reset();

    this.state = "playing";

    this.elapsedTime = 0;
    this.gameTime = 0;

    this.hideScreen("menuScreen");
    this.hideScreen("pauseScreen");
    this.hideScreen("completionScreen");

    this.showGameplayUI();

    this.startAudio();

    this.createInitialParticles();

    this.showIntroMessage();
  }

  start() {
    this.startFromMenu();
  }

  // =====================================================
  // INTRO
  // =====================================================

  showIntroMessage() {
    this.openMessage(
      "A SALA ESTÁ TRANCADA",
      "Você está sozinho em uma sala de aula escura. A porta está trancada. Explore o ambiente, encontre as pistas e descubra como escapar."
    );
  }

  // =====================================================
  // UPDATE
  // =====================================================

  update(deltaTime) {
    if (!Number.isFinite(deltaTime)) {
      deltaTime = 0;
    }

    deltaTime = Math.min(
      deltaTime,
      0.05
    );

    if (this.state === "menu") {
      this.updateMenu(deltaTime);
      return;
    }

    if (this.state === "paused") {
      return;
    }

    if (this.state === "completed") {
      this.updateParticles(deltaTime);
      return;
    }

    if (this.state !== "playing") {
      return;
    }

    // ===================================================
    // MENSAGEM
    // ===================================================

    if (this.messageOpen) {
      if (this.input.wantsConfirm()) {
        this.closeMessage();
      }

      this.input.endFrame();

      return;
    }

    // ===================================================
    // PUZZLE
    // ===================================================

    if (this.currentPuzzle) {
      this.input.endFrame();

      return;
    }

    // ===================================================
    // TERMINAL
    // ===================================================

    if (this.currentTerminal) {
      this.input.endFrame();

      return;
    }

    // ===================================================
    // TEMPO
    // ===================================================

    this.elapsedTime += deltaTime;
    this.gameTime += deltaTime;

    // ===================================================
    // COOLDOWN
    // ===================================================

    if (this.interactionCooldown > 0) {
      this.interactionCooldown -=
        deltaTime;
    }

    // ===================================================
    // CAMERA SHAKE
    // ===================================================

    if (this.shakeTime > 0) {
      this.shakeTime -= deltaTime;

      if (this.shakeTime <= 0) {
        this.shakeTime = 0;
        this.shakeStrength = 0;
      }
    }

    // ===================================================
    // PAUSE
    // ===================================================

    this.handlePauseInput();

    if (this.state !== "playing") {
      this.input.endFrame();
      return;
    }

    // ===================================================
    // PLAYER
    // ===================================================

    if (this.player) {
      this.player.update(
        deltaTime,
        this.input
      );
    }

    // ===================================================
    // WORLD
    // =====================================================

    if (this.world) {
      this.world.update(deltaTime);
    }

    // ===================================================
    // CAMERA
    // =====================================================

    this.updateCamera();

    // ===================================================
    // INTERAÇÃO
    // =====================================================

    this.updateInteraction();

    this.handleInteraction();

    // ===================================================
    // SAÍDA
    // ===================================================

    this.handleDoorExit();

    // ===================================================
    // PARTÍCULAS
    // ===================================================

    this.updateParticles(deltaTime);

    this.input.endFrame();
  }

  updateMenu(deltaTime) {
    if (this.world) {
      this.world.update(deltaTime);
    }

    this.updateParticles(deltaTime);

    this.input.endFrame();
  }

  // =====================================================
  // PAUSE
  // =====================================================

  handlePauseInput() {
    if (this.input.wantsPause()) {
      this.togglePause();
    }
  }

  togglePause() {
    if (this.state === "playing") {
      this.pause();
      return;
    }

    if (this.state === "paused") {
      this.resume();
    }
  }

  pause() {
    if (this.state !== "playing") {
      return;
    }

    if (
      this.messageOpen ||
      this.currentPuzzle ||
      this.currentTerminal
    ) {
      return;
    }

    this.state = "paused";

    this.showScreen(
      "pauseScreen"
    );

    this.hideGameplayUI();
  }

  resume() {
    if (this.state !== "paused") {
      return;
    }

    this.state = "playing";

    this.hideScreen(
      "pauseScreen"
    );

    this.showGameplayUI();
  }

  // =====================================================
  // RESTART
  // =====================================================

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

    this.showIntroMessage();
  }

  // =====================================================
  // CAMERA
  // =====================================================

  updateCamera(force = false) {
    if (!this.player) {
      return;
    }

    const targetX =
      this.player.x -
      this.width / 2;

    const targetY =
      this.player.y -
      this.height / 2;

    const maxX = Math.max(
      0,
      this.worldWidth -
        this.width
    );

    const maxY = Math.max(
      0,
      this.worldHeight -
        this.height
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
      (
        this.camera.targetX -
        this.camera.x
      ) * amount;

    this.camera.y +=
      (
        this.camera.targetY -
        this.camera.y
      ) * amount;
  }

  // =====================================================
  // INTERAÇÃO
  // =====================================================

  updateInteraction() {
    if (
      !this.world ||
      !this.player
    ) {
      return;
    }

    const target =
      this.world.getNearestInteraction(
        this.player
      );

    this.currentInteraction =
      target;

    if (
      target &&
      !this.messageOpen &&
      !this.currentPuzzle &&
      !this.currentTerminal
    ) {
      this.showInteractionHint(
        target
      );
    } else {
      this.hideInteractionHint();
    }
  }

  handleInteraction() {
    if (
      this.interactionCooldown > 0
    ) {
      return;
    }

    if (
      this.messageOpen ||
      this.currentPuzzle ||
      this.currentTerminal
    ) {
      return;
    }

    if (
      !this.input.wantsInteract()
    ) {
      return;
    }

    if (!this.currentInteraction) {
      return;
    }

    this.interactionCooldown =
      0.25;

    this.interactWith(
      this.currentInteraction
    );
  }

  interactWith(target) {
    if (!target) {
      return;
    }

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

      case "exit":
      case "door":
        this.interactDoor();
        break;

      default:
        this.openMessage(
          target.label ||
            "Objeto",
          target.message ||
            target.prompt ||
            "Você não encontra nada de útil aqui."
        );
        break;
    }
  }

  // =====================================================
  // QUADRO
  // =====================================================

  interactBoard() {
    this.openMessage(
      "O QUADRO",
      "As anotações foram parcialmente apagadas. Ainda é possível perceber alguns números e marcas. Talvez as pistas estejam espalhadas pela sala."
    );

    this.setStatus(
      "Você encontrou uma pista."
    );

    this.spawnSparkles(
      this.player.x,
      this.player.y - 30,
      12
    );
  }

  // =====================================================
  // RELÓGIO
  // =====================================================

  interactClock() {
    this.openMessage(
      "O RELÓGIO",
      "O relógio está parado. Os ponteiros apontam para uma hora específica. Você tem a sensação de que isso não aconteceu por acaso."
    );

    this.setStatus(
      "Observe os ponteiros."
    );

    this.spawnSparkles(
      1335,
      180,
      10
    );
  }

  // =====================================================
  // ESTANTE
  // =====================================================

  interactBookshelf() {
    this.openMessage(
      "A ESTANTE",
      "Alguns livros estão fora de ordem. Um deles parece ter sido colocado às pressas. Talvez exista algo escondido atrás dele."
    );

    this.setObjective(
      "Continue procurando pistas."
    );

    this.spawnSparkles(
      1300,
      680,
      14
    );
  }

  // =====================================================
  // ARMÁRIO
  // =====================================================

  interactCabinet() {
    if (this.doorUnlocked) {
      this.openMessage(
        "ARMÁRIO",
        "Você já encontrou a pista escondida aqui."
      );

      return;
    }

    this.openPuzzle({
      id: "cabinet",
      title: "O ARMÁRIO",
      question:
        "Qual número completa a sequência?\n\n2 — 4 — 8 — 16 — ?",
      options: [
        "24",
        "28",
        "32",
        "36"
      ],
      answer: "32",
      success:
        "A fechadura se abre. Dentro do armário há uma chave e um bilhete. A porta principal parece ter sido destrancada.",
      failure:
        "A fechadura não se move. Pense no padrão da sequência."
    });
  }

  // =====================================================
  // COMPUTADOR
  // =====================================================

  interactComputer() {
    this.openTerminal();
  }

  // =====================================================
  // PORTA
  // =====================================================

  interactDoor() {
    if (this.doorUnlocked) {
      this.openDoor();

      return;
    }

    this.openMessage(
      "A PORTA",
      "A porta está trancada. Ao lado da maçaneta existe uma fechadura numérica."
    );

    this.setObjective(
      "Descubra como abrir a porta."
    );
  }

  // =====================================================
  // TERMINAL
  // =====================================================

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

    overlay.classList.add(
      "is-visible"
    );

    overlay.setAttribute(
      "aria-hidden",
      "false"
    );

    this.updateTerminalDisplay();

    this.setTerminalFeedback("");

    this.setStatus(
      "Digite o código."
    );
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
      button.addEventListener(
        "click",
        () => {
          this.handleTerminalKey(
            button.dataset.key
          );
        }
      );
    });

    const clearButton =
      overlay.querySelector(
        "[data-action='clear']"
      );

    if (clearButton) {
      clearButton.addEventListener(
        "click",
        () => {
          if (!this.currentTerminal) {
            return;
          }

          this.currentTerminal.entered =
            "";

          this.updateTerminalDisplay();

          this.setTerminalFeedback("");
        }
      );
    }

    const enterButton =
      overlay.querySelector(
        "[data-action='enter']"
      );

    if (enterButton) {
      enterButton.addEventListener(
        "click",
        () => {
          this.submitTerminal();
        }
      );
    }

    const closeButton =
      overlay.querySelector(
        "[data-action='close']"
      );

    if (closeButton) {
      closeButton.addEventListener(
        "click",
        () => {
          this.closeTerminal();
        }
      );
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
      this.currentTerminal.entered.length >=
      4
    ) {
      return;
    }

    this.currentTerminal.entered +=
      key;

    this.updateTerminalDisplay();

    if (
      this.currentTerminal.entered.length ===
      4
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

    const entered =
      this.currentTerminal.entered;

    display.textContent =
      entered.padEnd(
        4,
        "•"
      );
  }

  setTerminalFeedback(text) {
    const feedback =
      this.elements.terminalFeedback;

    if (feedback) {
      feedback.textContent =
        text || "";
    }
  }

  submitTerminal() {
    if (!this.currentTerminal) {
      return;
    }

    const entered =
      this.currentTerminal.entered;

    if (entered.length !== 4) {
      this.setTerminalFeedback(
        "Digite os 4 números."
      );

      return;
    }

    if (
      entered ===
      this.currentTerminal.code
    ) {
      this.doorUnlocked = true;

      if (this.world) {
        this.world.setDoorOpen(true);
      }

      this.closeTerminal();

      this.setObjective(
        "A porta está aberta. Encontre a saída."
      );

      this.setStatus(
        "Código correto!"
      );

      this.openMessage(
        "CÓDIGO CORRETO",
        "A fechadura faz um clique. A porta se abre lentamente. Agora você só precisa atravessá-la."
      );

      this.spawnSparkles(
        this.player.x,
        this.player.y,
        25
      );

      this.shakeTime = 0.2;
      this.shakeStrength = 2;

      this.playSuccessSound();
    } else {
      this.setTerminalFeedback(
        "Código incorreto."
      );

      this.currentTerminal.entered =
        "";

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

  // =====================================================
  // PUZZLE
  // =====================================================

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
        data.title ||
        "Desafio";
    }

    if (question) {
      question.textContent =
        data.question ||
        "";
    }

    if (feedback) {
      feedback.textContent =
        "";
    }

    if (options) {
      options.innerHTML =
        "";

      const puzzleOptions =
        Array.isArray(
          data.options
        )
          ? data.options
          : [];

      puzzleOptions.forEach(
        option => {
          const button =
            document.createElement(
              "button"
            );

          button.type =
            "button";

          button.className =
            "puzzle-option";

          button.textContent =
            option;

          button.addEventListener(
            "click",
            () => {
              this.answerPuzzle(
                option
              );
            }
          );

          options.appendChild(
            button
          );
        }
      );
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

    if (
      String(answer) ===
      String(puzzle.answer)
    ) {
      this.closePuzzle();

      this.doorUnlocked =
        true;

      if (this.world) {
        this.world.setDoorOpen(
          true
        );
      }

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
        22
      );

      this.playSuccessSound();

      return;
    }

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

  closePuzzle() {
    this.currentPuzzle =
      null;

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

  // =====================================================
  // MENSAGENS
  // =====================================================

  openMessage(title, text) {
    this.messageOpen =
      true;

    this.hideInteractionHint();

    const container =
      this.elements.messageContainer;

    if (!container) {
      return;
    }

    if (this.elements.messageTitle) {
      this.elements.messageTitle.textContent =
        title ||
        "Mensagem";
    }

    if (this.elements.messageText) {
      this.elements.messageText.textContent =
        text ||
        "";
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
    this.messageOpen =
      false;

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

  // =====================================================
  // SAÍDA
  // =====================================================

  handleDoorExit() {
    if (
      !this.doorUnlocked ||
      this.completed ||
      !this.player ||
      !this.world
    ) {
      return;
    }

    const door =
      this.world.exitDoor || {
        x: 110,
        y: 330,
        width: 120,
        height: 190
      };

    const doorCenterX =
      door.x +
      door.width / 2;

    const doorCenterY =
      door.y +
      door.height / 2;

    const distance =
      Math.hypot(
        this.player.x -
          doorCenterX,
        this.player.y -
          doorCenterY
      );

    if (distance < 110) {
      this.completeGame();
    }
  }

  openDoor() {
    if (!this.doorUnlocked) {
      return;
    }

    if (this.world) {
      this.world.setDoorOpen(
        true
      );
    }

    this.setObjective(
      "Atravesse a porta."
    );

    this.setStatus(
      "A saída está aberta."
    );
  }

  // =====================================================
  // CONCLUSÃO
  // =====================================================

  completeGame() {
    if (this.completed) {
      return;
    }

    this.completed =
      true;

    this.state =
      "completed";

    if (this.world) {
      this.world.setDoorOpen(
        true
      );
    }

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
      45
    );

    this.playSuccessSound();
  }

  // =====================================================
  // RENDER
  // =====================================================

  render() {
    const ctx =
      this.ctx;

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

    this.drawCanvasBackground(
      ctx
    );

    let shakeX = 0;
    let shakeY = 0;

    if (this.shakeTime > 0) {
      shakeX =
        (
          Math.random() -
          0.5
        ) *
        this.shakeStrength;

      shakeY =
        (
          Math.random() -
          0.5
        ) *
        this.shakeStrength;
    }

    const renderCamera = {
      x:
        this.camera.x -
        shakeX,

      y:
        this.camera.y -
        shakeY
    };

    // -----------------------------------------------------
    // MUNDO
    // -----------------------------------------------------

    if (this.world) {
      this.world.render(
        ctx,
        renderCamera
      );
    }

    // -----------------------------------------------------
    // PARTÍCULAS
    // -----------------------------------------------------

    this.renderParticles(
      ctx,
      renderCamera
    );

    // -----------------------------------------------------
    // PLAYER
    // -----------------------------------------------------

    if (this.player) {
      this.player.render(
        ctx,
        renderCamera
      );
    }

    // -----------------------------------------------------
    // ILUMINAÇÃO
    // -----------------------------------------------------

    if (
      this.world &&
      this.player
    ) {
      this.world.renderLighting(
        ctx,
        this.player,
        renderCamera,
        this.gameTime
      );
    }

    // -----------------------------------------------------
    // ATMOSFERA
    // -----------------------------------------------------

    this.renderAtmosphere(
      ctx
    );

    ctx.restore();
  }

  // =====================================================
  // FUNDO
  // =====================================================

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
      "#07090d"
    );

    gradient.addColorStop(
      1,
      "#12171c"
    );

    ctx.fillStyle =
      gradient;

    ctx.fillRect(
      0,
      0,
      this.width,
      this.height
    );
  }

  // =====================================================
  // ATMOSFERA
  // =====================================================

  renderAtmosphere(ctx) {
    ctx.save();

    for (
      let i = 0;
      i < 70;
      i++
    ) {
      const x =
        (
          i * 137.31 +
          this.gameTime * 3
        ) %
        this.width;

      const y =
        (
          i * 71.19 +
          Math.sin(
            this.gameTime +
            i
          ) *
            4
        ) %
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

  // =====================================================
  // PARTÍCULAS
  // =====================================================

  createInitialParticles() {
    this.particles =
      [];

    for (
      let i = 0;
      i < 28;
      i++
    ) {
      const life =
        2 +
        Math.random() *
          3;

      this.particles.push({
        x:
          Math.random() *
          this.worldWidth,

        y:
          320 +
          Math.random() *
            480,

        vx:
          (
            Math.random() -
            0.5
          ) * 8,

        vy:
          -Math.random() *
          5,

        life:
          life,

        maxLife:
          life,

        size:
          Math.random() >
          0.75
            ? 2
            : 1,

        type:
          "dust"
      });
    }
  }

  spawnSparkles(
    x,
    y,
    amount = 12
  ) {
    for (
      let i = 0;
      i < amount;
      i++
    ) {
      const life =
        0.5 +
        Math.random() *
          0.8;

      this.particles.push({
        x:
          x +
          (
            Math.random() -
            0.5
          ) *
            40,

        y:
          y +
          (
            Math.random() -
            0.5
          ) *
            40,

        vx:
          (
            Math.random() -
            0.5
          ) *
          50,

        vy:
          (
            Math.random() -
            0.5
          ) *
          50,

        life:
          life,

        maxLife:
          life,

        size:
          Math.random() >
          0.5
            ? 2
            : 1,

        type:
          "spark"
      });
    }
  }

  updateParticles(deltaTime) {
    for (
      let i =
        this.particles.length -
        1;
      i >= 0;
      i--
    ) {
      const particle =
        this.particles[i];

      particle.life -=
        deltaTime;

      if (
        particle.life <=
        0
      ) {
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

  renderParticles(
    ctx,
    camera
  ) {
    ctx.save();

    for (
      const particle of
      this.particles
    ) {
      const x =
        particle.x -
        camera.x;

      const y =
        particle.y -
        camera.y;

      if (
        x < -10 ||
        y < -10 ||
        x >
          this.width +
            10 ||
        y >
          this.height +
            10
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
          `rgba(245,220,160,${alpha * 0.8})`;
      } else {
        ctx.fillStyle =
          `rgba(220,208,178,${alpha * 0.16})`;
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

  // =====================================================
  // HUD
  // =====================================================

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

  showInteractionHint(
    target
  ) {
    const hint =
      this.elements.interactionHint;

    if (!hint) {
      return;
    }

    hint.classList.add(
      "is-visible"
    );

    if (
      this.elements.interactionKey
    ) {
      this.elements.interactionKey.textContent =
        "E";
    }

    if (
      this.elements.interactionText
    ) {
      this.elements.interactionText.textContent =
        `Interagir: ${
          target.label ||
          "objeto"
        }`;
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

  // =====================================================
  // TELAS
  // =====================================================

  showScreen(id) {
    const screens = [
      "menuScreen",
      "pauseScreen",
      "completionScreen"
    ];

    for (
      const screenId of
      screens
    ) {
      const element =
        this.elements[
          screenId
        ];

      if (!element) {
        continue;
      }

      if (
        screenId === id
      ) {
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
    }
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

  // =====================================================
  // OVERLAYS
  // =====================================================

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
    this.messageOpen =
      false;

    this.currentPuzzle =
      null;

    this.currentTerminal =
      null;

    this.hideOverlayElements();
  }

  // =====================================================
  // ÁUDIO
  // =====================================================

  startAudio() {
    if (this.audioStarted) {
      return;
    }

    this.audioStarted =
      true;

    try {
      const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

      if (AudioContext) {
        this.audioContext =
          new AudioContext();
      }
    } catch (error) {
      this.audioContext =
        null;
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

      oscillator.type =
        type;

      oscillator.frequency.value =
        frequency;

      const now =
        this.audioContext.currentTime;

      gain.gain.setValueAtTime(
        0,
        now
      );

      gain.gain.linearRampToValueAtTime(
        volume,
        now + 0.01
      );

      gain.gain.exponentialRampToValueAtTime(
        0.001,
        now + duration
      );

      oscillator.connect(
        gain
      );

      gain.connect(
        this.audioContext.destination
      );

      oscillator.start(
        now
      );

      oscillator.stop(
        now + duration
      );
    } catch (error) {
      // O jogo continua normalmente
      // mesmo sem áudio.
    }
  }

  playSuccessSound() {
    this.playTone(
      523.25,
      0.12,
      "sine",
      0.035
    );

    window.setTimeout(
      () => {
        this.playTone(
          659.25,
          0.14,
          "sine",
          0.035
        );
      },
      90
    );

    window.setTimeout(
      () => {
        this.playTone(
          783.99,
          0.18,
          "sine",
          0.035
        );
      },
      190
    );
  }

  playErrorSound() {
    this.playTone(
      150,
      0.16,
      "square",
      0.025
    );
  }

  // =====================================================
  // TECLADO
  // =====================================================

  handleKeyDown(event) {
    if (!event) {
      return;
    }

    const key =
      typeof event.key ===
      "string"
        ? event.key.toLowerCase()
        : "";

    // -----------------------------------------------------
    // Mensagem
    // -----------------------------------------------------

    if (
      key === "enter" &&
      this.messageOpen
    ) {
      event.preventDefault();

      this.closeMessage();

      return;
    }

    // -----------------------------------------------------
    // Terminal
    // -----------------------------------------------------

    if (
      key === "escape" &&
      this.currentTerminal
    ) {
      event.preventDefault();

      this.closeTerminal();

      return;
    }

    // -----------------------------------------------------
    // Puzzle
    // -----------------------------------------------------

    if (
      key === "escape" &&
      this.currentPuzzle
    ) {
      event.preventDefault();

      this.closePuzzle();

      return;
    }
  }

  // =====================================================
  // UTILIDADES
  // =====================================================

  clamp(
    value,
    min,
    max
  ) {
    return Math.max(
      min,
      Math.min(
        max,
        value
      )
    );
  }

  formatTime(seconds) {
    const totalSeconds =
      Math.max(
        0,
        Math.floor(
          seconds
        )
      );

    const minutes =
      Math.floor(
        totalSeconds / 60
      );

    const remaining =
      totalSeconds % 60;

    return (
      String(minutes).padStart(
        2,
        "0"
      ) +
      ":" +
      String(remaining).padStart(
        2,
        "0"
      )
    );
  }

  // =====================================================
  // DESTRUIR
  // =====================================================

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
        // Ignora erro de encerramento.
      }
    }

    this.input = null;
    this.world = null;
    this.player = null;
    this.canvas = null;
    this.ctx = null;
    this.audioContext = null;
  }
}