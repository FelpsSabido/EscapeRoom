// game.js
// Escape Room — Controlador principal
// Integra jogador, mundo, câmera, interações, puzzles,
// terminal, iluminação, partículas, áudio, HUD e telas.

import { Input } from "./input.js";
import { Player } from "./player.js";
import { World } from "./world.js";

export class Game {
  constructor(canvas) {
    this.canvas = canvas;

    if (!this.canvas) {
      throw new Error("Canvas não encontrado.");
    }

    this.ctx = this.canvas.getContext("2d");

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

    // =========================================================
    // ESTADO
    // =========================================================

    this.state = "menu";

    this.elapsedTime = 0;
    this.gameTime = 0;

    this.completed = false;

    this.doorUnlocked = false;

    this.messageOpen = false;

    this.currentPuzzle = null;

    this.currentTerminal = null;

    this.currentInteraction = null;

    this.interactionCooldown = 0;

    // =========================================================
    // CÂMERA
    // =========================================================

    this.camera = {
      x: 0,
      y: 0,

      targetX: 0,
      targetY: 0,

      smoothing: 10
    };

    // =========================================================
    // EFEITOS
    // =========================================================

    this.particles = [];

    this.shakeTime = 0;
    this.shakeStrength = 0;

    // =========================================================
    // ÁUDIO
    // =========================================================

    this.audioStarted = false;
    this.audioContext = null;

    // =========================================================
    // MUNDO
    // =========================================================

    // IMPORTANTE:
    // World recebe width e height diretamente.
    this.world = new World(
      this.worldWidth,
      this.worldHeight
    );

    // =========================================================
    // PLAYER
    // =========================================================

    this.player = new Player({
      world: this.world
    });

    // =========================================================
    // INPUT
    // =========================================================

    this.input = new Input(this);

    // =========================================================
    // DOM
    // =========================================================

    this.elements = {};

    this.setupCanvas();
    this.setupDOM();

    // =========================================================
    // RESET INICIAL
    // =========================================================

    this.reset();

    // Garante que o jogo começa no menu.
    this.state = "menu";

    this.showScreen("menuScreen");

    this.hideGameplayUI();

    this.hideOverlayElements();
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

    this.canvas.setAttribute(
      "aria-label",
      "Escape Room — A Sala"
    );

    this.canvas.setAttribute(
      "role",
      "application"
    );

    this.canvas.setAttribute(
      "tabindex",
      "0"
    );
  }

  // =========================================================
  // DOM
  // =========================================================

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

      loadingScreen:
        document.getElementById("loadingScreen"),

      gameError:
        document.getElementById("gameError")
    };

    this.bindDOMEvents();
  }

  // =========================================================
  // EVENTOS DOM
  // =========================================================

  bindDOMEvents() {
    const {
      resumeButton,
      pauseRestartButton,
      messageContinue
    } = this.elements;

    /*
     * O botão JOGAR, REINICIAR e PAUSAR já são
     * controlados pelo main.js.
     *
     * Não registramos esses eventos novamente aqui
     * para evitar o jogo iniciar duas vezes.
     */

    if (resumeButton) {
      resumeButton.addEventListener(
        "click",
        () => {
          this.resume();
        }
      );
    }

    if (pauseRestartButton) {
      pauseRestartButton.addEventListener(
        "click",
        () => {
          this.restart();
        }
      );
    }

    if (messageContinue) {
      messageContinue.addEventListener(
        "click",
        () => {
          this.closeMessage();
        }
      );
    }
  }

  // =========================================================
  // RESET
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

    if (this.world) {
      this.world.reset();
    }

    if (this.player) {
      this.player.reset();

      this.ensureSafeSpawn();
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

  // =========================================================
  // SPAWN SEGURO
  // =========================================================

  ensureSafeSpawn() {
    if (!this.player || !this.world) {
      return;
    }

    let spawn = null;

    if (
      typeof this.world.getSpawnPoint ===
      "function"
    ) {
      spawn =
        this.world.getSpawnPoint();
    }

    if (
      !spawn ||
      !Number.isFinite(spawn.x) ||
      !Number.isFinite(spawn.y)
    ) {
      spawn = {
        x: 930,
        y: 620
      };
    }

    /*
     * Primeiro tenta o spawn definido pelo mundo.
     */

    if (
      this.world.canPlayerMoveTo(
        this.player,
        spawn.x,
        spawn.y
      )
    ) {
      this.player.setPosition(
        spawn.x,
        spawn.y
      );

      return;
    }

    /*
     * Se o spawn estiver dentro de uma colisão,
     * procura automaticamente um espaço livre.
     */

    const candidates = [
      { x: 930, y: 620 },
      { x: 930, y: 500 },
      { x: 930, y: 760 },
      { x: 400, y: 500 },
      { x: 450, y: 620 },
      { x: 1180, y: 500 },
      { x: 1180, y: 620 },
      { x: 800, y: 760 },
      { x: 650, y: 480 },
      { x: 1050, y: 620 }
    ];

    for (const candidate of candidates) {
      if (
        this.world.canPlayerMoveTo(
          this.player,
          candidate.x,
          candidate.y
        )
      ) {
        this.player.setPosition(
          candidate.x,
          candidate.y
        );

        return;
      }
    }

    /*
     * Último recurso.
     */

    this.player.setPosition(
      930,
      620
    );
  }

  // =========================================================
  // COMEÇAR
  // =========================================================

  startFromMenu() {
    /*
     * Evita que o botão seja processado duas vezes.
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

    this.hideScreen(
      "completionScreen"
    );

    this.showGameplayUI();

    this.setObjective(
      "Encontre uma maneira de escapar da sala."
    );

    this.setStatus(
      "Use WASD ou as setas para explorar. Pressione E para interagir."
    );

    this.startAudio();

    this.createInitialParticles();

    /*
     * NÃO abrimos a mensagem inicial aqui.
     *
     * Antes ela travava o update() do Player.
     *
     * Agora o jogador pode andar imediatamente.
     */

    if (this.canvas) {
      this.canvas.focus();
    }
  }

  start() {
    this.startFromMenu();
  }

  // =========================================================
  // UPDATE
  // =========================================================

  update(deltaTime) {
    if (!Number.isFinite(deltaTime)) {
      deltaTime = 0;
    }

    deltaTime =
      Math.min(
        deltaTime,
        0.05
      );

    if (this.state === "menu") {
      this.updateMenu(deltaTime);

      return;
    }

    if (this.state === "paused") {
      this.input.endFrame();

      return;
    }

    if (this.state === "completed") {
      this.input.endFrame();

      return;
    }

    if (this.state !== "playing") {
      this.input.endFrame();

      return;
    }

    // =======================================================
    // MENSAGEM
    // =======================================================

    if (this.messageOpen) {
      if (
        this.input.wasPressed(
          "Enter"
        ) ||
        this.input.wasPressed(
          " "
        ) ||
        this.input.wasPressed(
          "e"
        )
      ) {
        this.closeMessage();
      }

      this.input.endFrame();

      return;
    }

    // =======================================================
    // PUZZLE
    // =======================================================

    if (this.currentPuzzle) {
      this.input.endFrame();

      return;
    }

    // =======================================================
    // TERMINAL
    // =======================================================

    if (this.currentTerminal) {
      this.input.endFrame();

      return;
    }

    // =======================================================
    // TEMPO
    // =======================================================

    this.gameTime += deltaTime;

    this.elapsedTime += deltaTime;

    // =======================================================
    // COOLDOWN
    // =======================================================

    if (
      this.interactionCooldown > 0
    ) {
      this.interactionCooldown -=
        deltaTime;

      if (
        this.interactionCooldown < 0
      ) {
        this.interactionCooldown = 0;
      }
    }

    // =======================================================
    // SHAKE
    // =======================================================

    if (
      this.shakeTime > 0
    ) {
      this.shakeTime -=
        deltaTime;

      if (
        this.shakeTime <= 0
      ) {
        this.shakeTime = 0;
        this.shakeStrength = 0;
      }
    }

    // =======================================================
    // PAUSA
    // =======================================================

    if (
      this.input.wantsPause()
    ) {
      this.togglePause();

      this.input.endFrame();

      return;
    }

    // =======================================================
    // PLAYER
    // =======================================================

    this.player.update(
      deltaTime,
      this.input
    );

    // =======================================================
    // WORLD
    // =======================================================

    this.world.update(
      deltaTime
    );

    // =======================================================
    // CÂMERA
    // =======================================================

    this.updateCamera();

    // =======================================================
    // INTERAÇÃO
    // =======================================================

    this.updateInteraction();

    this.handleInteraction();

    // =======================================================
    // PORTA
    // =======================================================

    this.handleDoorExit();

    // =======================================================
    // PARTÍCULAS
    // =======================================================

    this.updateParticles(
      deltaTime
    );

    // =======================================================
    // INPUT
    // =======================================================

    this.input.endFrame();
  }

  // =========================================================
  // MENU
  // =========================================================

  updateMenu(deltaTime) {
    if (this.world) {
      this.world.update(
        deltaTime
      );
    }

    this.input.endFrame();
  }

  // =========================================================
  // PAUSA
  // =========================================================

  togglePause() {
    if (
      this.state === "playing"
    ) {
      this.pause();

      return;
    }

    if (
      this.state === "paused"
    ) {
      this.resume();
    }
  }

  pause() {
    if (
      this.state !== "playing"
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

    this.state = "paused";

    this.showScreen(
      "pauseScreen"
    );

    this.hideGameplayUI();
  }

  resume() {
    if (
      this.state !== "paused"
    ) {
      return;
    }

    this.state = "playing";

    this.hideScreen(
      "pauseScreen"
    );

    this.showGameplayUI();

    if (this.canvas) {
      this.canvas.focus();
    }
  }

  // =========================================================
  // REINICIAR
  // =========================================================

  restart() {
    this.closeAllOverlays();

    this.reset();

    this.state = "playing";

    this.hideScreen(
      "menuScreen"
    );

    this.hideScreen(
      "pauseScreen"
    );

    this.hideScreen(
      "completionScreen"
    );

    this.showGameplayUI();

    this.setObjective(
      "Encontre uma maneira de escapar da sala."
    );

    this.setStatus(
      "Explore a sala."
    );

    this.startAudio();

    this.createInitialParticles();

    if (this.canvas) {
      this.canvas.focus();
    }
  }

  // =========================================================
  // CÂMERA
  // =========================================================

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

    const maxX =
      Math.max(
        0,
        this.worldWidth -
          this.width
      );

    const maxY =
      Math.max(
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

  // =========================================================
  // INTERAÇÃO
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
      this.interactionCooldown >
      0
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

    if (
      !this.currentInteraction
    ) {
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

      case "desk_1":
      case "desk_2":
      case "desk_3":
      case "desk_4":
      case "desk_5":
      case "desk_6":
        this.interactDesk(target);
        break;

      case "poster_left":
      case "poster_right":
        this.interactPoster(target);
        break;

      /*
       * A nova world.js usa "exit".
       *
       * Antes o game.js esperava "door".
       *
       * Agora os dois são aceitos.
       */

      case "exit":
      case "door":
        this.interactDoor();
        break;

      case "teacherDesk":
        this.interactTeacherDesk();
        break;

      case "flag":
        this.interactFlag();
        break;

      default:
        this.openMessage(
          target.label ||
            "OBJETO",
          target.message ||
            target.prompt ||
            "Não há nada de interessante aqui."
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
      "As marcas de giz parecem formar uma sequência. Há números parcialmente apagados e alguns símbolos destacados."
    );

    this.setStatus(
      "Você encontrou uma pista."
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
      "O relógio está parado. Os ponteiros apontam para uma hora específica. Talvez esse horário seja importante."
    );

    this.setStatus(
      "Observe o relógio."
    );

    this.spawnSparkles(
      this.player.x,
      this.player.y - 30,
      10
    );
  }

  // =========================================================
  // ESTANTE
  // =========================================================

  interactBookshelf() {
    this.openMessage(
      "A ESTANTE",
      "Alguns livros estão fora de ordem. Um deles parece ter sido retirado e colocado de volta às pressas."
    );

    this.setObjective(
      "Procure pistas nos objetos da sala."
    );

    this.setStatus(
      "Talvez exista um padrão nos livros."
    );

    this.spawnSparkles(
      this.player.x,
      this.player.y - 25,
      14
    );
  }

  // =========================================================
  // CARTEIRAS
  // =========================================================

  interactDesk(target) {
    const messages = {
      desk_1:
        "Dentro da carteira há uma anotação: 'Comece pelo menor número e siga dobrando.'",

      desk_2:
        "Há quatro símbolos riscados na madeira. O segundo parece ter sido marcado mais vezes.",

      desk_3:
        "Uma folha dobrada diz: 'O que está escondido não precisa estar à vista.'",

      desk_4:
        "No canto da mesa há um número rabiscado: 2.",

      desk_5:
        "O mesmo símbolo aparece repetido quatro vezes. Talvez a quantidade seja importante.",

      desk_6:
        "Debaixo da mesa existe uma pequena etiqueta com a palavra: 'SEQUÊNCIA'."
    };

    this.openMessage(
      "CARTEIRA",
      messages[target.id] ||
        target.message ||
        "Há uma pequena pista escondida aqui."
    );

    this.setStatus(
      "Uma nova pista foi encontrada."
    );

    this.spawnSparkles(
      this.player.x,
      this.player.y - 20,
      8
    );
  }

  // =========================================================
  // CARTAZES
  // =========================================================

  interactPoster(target) {
    if (
      target.id ===
      "poster_left"
    ) {
      this.openMessage(
        "CARTAZ",
        "Algumas letras estão destacadas. Quando observadas em ordem, elas parecem indicar que você deve procurar uma sequência."
      );
    } else {
      this.openMessage(
        "CARTAZ",
        "As formas geométricas aparecem nesta ordem: círculo, quadrado, triângulo. A ordem parece proposital."
      );
    }

    this.setStatus(
      "Observe os detalhes."
    );
  }

  // =========================================================
  // ARMÁRIO
  // =========================================================

  interactCabinet() {
    if (
      !this.doorUnlocked
    ) {
      this.openPuzzle({
        id: "cabinet",

        title:
          "O ARMÁRIO",

        question:
          "Qual número completa a sequência: 2, 4, 8, 16, ?",

        options: [
          "24",
          "28",
          "32",
          "36"
        ],

        answer:
          "32",

        success:
          "A fechadura se abre. Dentro do armário há uma anotação com quatro números.",

        failure:
          "A fechadura não se move."
      });

      return;
    }

    this.openMessage(
      "ARMÁRIO ABERTO",
      "O armário já foi aberto. A pista encontrada aqui pode ajudar a descobrir o código do terminal."
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
      "BANDEIRA DO BRASIL",
      "Atrás da bandeira existe uma pequena marca no reboco. Não parece ser uma coincidência."
    );

    this.spawnSparkles(
      this.player.x,
      this.player.y - 25,
      8
    );
  }

  // =========================================================
  // PORTA
  // =========================================================

  interactDoor() {
    if (
      this.doorUnlocked
    ) {
      this.openDoor();

      return;
    }

    this.openMessage(
      "A PORTA",
      "Está trancada. Ao lado da maçaneta existe uma pequena fechadura numérica."
    );

    this.setObjective(
      "Encontre o código para abrir a porta."
    );

    this.setStatus(
      "A saída ainda está bloqueada."
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

    overlay.classList.add(
      "is-visible"
    );

    overlay.setAttribute(
      "aria-hidden",
      "false"
    );

    this.updateTerminalDisplay();

    this.setTerminalFeedback(
      "Digite o código encontrado."
    );

    this.setStatus(
      "Terminal de segurança."
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
        this.handleTerminalKey(
          button.dataset.key
        );
      };
    });

    const clearButton =
      overlay.querySelector(
        "[data-action='clear']"
      );

    if (clearButton) {
      clearButton.onclick = () => {
        if (
          !this.currentTerminal
        ) {
          return;
        }

        this.currentTerminal.entered =
          "";

        this.updateTerminalDisplay();

        this.setTerminalFeedback(
          ""
        );
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
    if (
      !this.currentTerminal
    ) {
      return;
    }

    if (
      !/^\d$/.test(key)
    ) {
      return;
    }

    if (
      this.currentTerminal.entered
        .length >= 4
    ) {
      return;
    }

    this.currentTerminal.entered +=
      key;

    this.updateTerminalDisplay();

    if (
      this.currentTerminal.entered
        .length === 4
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

    if (
      !this.currentTerminal
    ) {
      display.textContent =
        "----";

      return;
    }

    const value =
      this.currentTerminal.entered;

    display.textContent =
      value.padEnd(
        4,
        "•"
      );
  }

  setTerminalFeedback(text) {
    const feedback =
      this.elements.terminalFeedback;

    if (!feedback) {
      return;
    }

    feedback.textContent =
      text || "";
  }

  submitTerminal() {
    if (
      !this.currentTerminal
    ) {
      return;
    }

    const entered =
      this.currentTerminal.entered;

    if (
      entered.length !== 4
    ) {
      this.setTerminalFeedback(
        "Digite 4 números."
      );

      return;
    }

    if (
      entered ===
      this.currentTerminal.code
    ) {
      this.doorUnlocked =
        true;

      this.world.setDoorOpen(
        true
      );

      this.closeTerminal();

      this.setObjective(
        "A porta está aberta. Vá até a saída."
      );

      this.setStatus(
        "Sistema de segurança desativado."
      );

      this.openMessage(
        "CÓDIGO CORRETO",
        "O terminal emite um sinal. A fechadura da porta é liberada e a saída está disponível."
      );

      this.shakeTime =
        0.2;

      this.shakeStrength =
        2;

      this.spawnSparkles(
        this.player.x,
        this.player.y,
        24
      );

      this.playSuccessSound();

      return;
    }

    this.setTerminalFeedback(
      "Código incorreto."
    );

    this.currentTerminal.entered =
      "";

    this.updateTerminalDisplay();

    this.shakeTime =
      0.15;

    this.shakeStrength =
      3;

    this.playErrorSound();
  }

  closeTerminal() {
    this.currentTerminal =
      null;

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
        data.title ||
        "DESAFIO";
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
    if (
      !this.currentPuzzle
    ) {
      return;
    }

    const puzzle =
      this.currentPuzzle;

    if (
      answer ===
      puzzle.answer
    ) {
      this.closePuzzle();

      /*
       * O puzzle libera a segurança.
       * O terminal continua sendo um elemento
       * explorável, mas a porta já está liberada.
       */

      this.doorUnlocked =
        true;

      this.world.setDoorOpen(
        true
      );

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

      return;
    }

    const feedback =
      this.elements.puzzleFeedback;

    if (feedback) {
      feedback.textContent =
        puzzle.failure ||
        "Resposta incorreta.";
    }

    this.shakeTime =
      0.12;

    this.shakeStrength =
      2;

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

  // =========================================================
  // MENSAGENS
  // =========================================================

  openMessage(title, text) {
    this.messageOpen =
      true;

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
        title ||
        "MENSAGEM";
    }

    if (textElement) {
      textElement.textContent =
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

  // =========================================================
  // PORTA / SAÍDA
  // =========================================================

  handleDoorExit() {
    if (
      !this.doorUnlocked ||
      this.completed
    ) {
      return;
    }

    const door =
      this.world &&
      this.world.exitDoor
        ? this.world.exitDoor
        : {
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

    if (
      distance < 95 &&
      !this.messageOpen
    ) {
      this.completeGame();
    }
  }

  openDoor() {
    if (
      !this.doorUnlocked
    ) {
      return;
    }

    this.world.setDoorOpen(
      true
    );

    this.setObjective(
      "Atravesse a porta."
    );

    this.setStatus(
      "A saída está aberta."
    );

    this.spawnSparkles(
      this.player.x,
      this.player.y,
      18
    );
  }

  // =========================================================
  // CONCLUSÃO
  // =========================================================

  completeGame() {
    if (
      this.completed
    ) {
      return;
    }

    this.completed =
      true;

    this.state =
      "completed";

    this.world.setDoorOpen(
      true
    );

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

    this.spawnSparkles(
      this.player.x,
      this.player.y,
      40
    );

    this.playSuccessSound();

    this.showScreen(
      "completionScreen"
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

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

    if (
      this.shakeTime > 0
    ) {
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

    // =======================================================
    // MUNDO
    // =======================================================

    if (this.world) {
      this.world.render(
        ctx,
        renderCamera
      );
    }

    // =======================================================
    // PARTÍCULAS
    // =======================================================

    this.renderParticles(
      ctx,
      renderCamera
    );

    // =======================================================
    // PLAYER
    // =======================================================

    if (this.player) {
      this.player.render(
        ctx,
        renderCamera
      );
    }

    // =======================================================
    // ILUMINAÇÃO
    // =======================================================

    if (
      this.world &&
      typeof this.world.renderLighting ===
        "function"
    ) {
      this.world.renderLighting(
        ctx,
        this.player,
        renderCamera,
        this.gameTime
      );
    }

    // =======================================================
    // ATMOSFERA
    // =======================================================

    this.renderAtmosphere(
      ctx
    );

    ctx.restore();
  }

  // =========================================================
  // FUNDO
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

    ctx.fillStyle =
      gradient;

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

  // =========================================================
  // PARTÍCULAS
  // =========================================================

  createInitialParticles() {
    this.particles =
      [];

    for (
      let i = 0;
      i < 24;
      i++
    ) {
      const maxLife =
        2 +
        Math.random() * 3;

      this.particles.push({
        x:
          Math.random() *
          this.worldWidth,

        y:
          520 +
          Math.random() *
            300,

        vx:
          (
            Math.random() -
            0.5
          ) *
          8,

        vy:
          -Math.random() *
          5,

        life:
          maxLife,

        maxLife:
          maxLife,

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
      const maxLife =
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
          maxLife,

        maxLife:
          maxLife,

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

  updateParticles(
    deltaTime
  ) {
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
        particle.life <= 0
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

  showInteractionHint(
    target
  ) {
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

    hint.style.pointerEvents =
      "none";

    if (key) {
      key.textContent =
        "E";
    }

    if (text) {
      text.textContent =
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

  // =========================================================
  // TELAS
  // =========================================================

  showScreen(id) {
    const screens = [
      "menuScreen",
      "pauseScreen",
      "completionScreen"
    ];

    screens.forEach(
      screenId => {
        const element =
          this.elements[
            screenId
          ];

        if (!element) {
          return;
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
    );
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
    this.messageOpen =
      false;

    this.currentPuzzle =
      null;

    this.currentTerminal =
      null;

    this.hideOverlayElements();
  }

  // =========================================================
  // ÁUDIO
  // =========================================================

  startAudio() {
    if (
      this.audioStarted
    ) {
      if (
        this.audioContext &&
        this.audioContext.state ===
          "suspended"
      ) {
        this.audioContext.resume();
      }

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
    if (
      !this.audioContext
    ) {
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
      // O jogo continua normalmente sem áudio.
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

  // =========================================================
  // TECLADO
  // =========================================================

  handleKeyDown(event) {
    if (!event) {
      return;
    }

    const key =
      event.key;

    // =======================================================
    // MENSAGEM
    // =======================================================

    if (
      this.messageOpen &&
      (
        key === "Enter" ||
        key === " " ||
        key === "e" ||
        key === "E"
      )
    ) {
      this.closeMessage();

      return;
    }

    // =======================================================
    // TERMINAL
    // =======================================================

    if (
      this.currentTerminal
    ) {
      if (
        /^\d$/.test(key)
      ) {
        this.handleTerminalKey(
          key
        );

        return;
      }

      if (
        key === "Enter"
      ) {
        this.submitTerminal();

        return;
      }

      if (
        key === "Backspace"
      ) {
        this.currentTerminal.entered =
          this.currentTerminal.entered.slice(
            0,
            -1
          );

        this.updateTerminalDisplay();

        return;
      }

      if (
        key === "Escape"
      ) {
        this.closeTerminal();

        return;
      }

      return;
    }

    // =======================================================
    // PUZZLE
    // =======================================================

    if (
      this.currentPuzzle
    ) {
      if (
        key === "Escape"
      ) {
        this.closePuzzle();
      }

      return;
    }

    // =======================================================
    // PAUSA
    // =======================================================

    if (
      key === "Escape" &&
      this.state === "playing"
    ) {
      this.togglePause();
    }
  }

  // =========================================================
  // UTILIDADES
  // =========================================================

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

  formatTime(
    seconds
  ) {
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

    return `${String(
      minutes
    ).padStart(
      2,
      "0"
    )}:${String(
      remaining
    ).padStart(
      2,
      "0"
    )}`;
  }

  // =========================================================
  // DESTRUIR
  // =========================================================

  destroy() {
    if (
      this.input &&
      typeof this.input.destroy ===
        "function"
    ) {
      this.input.destroy();
    }

    if (
      this.world &&
      typeof this.world.destroy ===
        "function"
    ) {
      this.world.destroy();
    }

    if (
      this.player &&
      typeof this.player.destroy ===
        "function"
    ) {
      this.player.destroy();
    }

    if (
      this.audioContext
    ) {
      try {
        this.audioContext.close();
      } catch (error) {
        // Ignora erro de encerramento.
      }
    }

    this.input = null;

    this.world = null;

    this.player = null;

    this.audioContext = null;

    this.canvas = null;

    this.ctx = null;
  }
}