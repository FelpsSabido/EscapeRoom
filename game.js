import { Input } from "./input.js?v=20260902-5";
import { World } from "./world.js?v=20260902-5";
import { Player } from "./player.js?v=20260902-5";

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", {
      alpha: false
    });

    if (!this.ctx) {
      throw new Error(
        "Não foi possível iniciar o Canvas."
      );
    }

    this.canvasWidth = 1280;
    this.canvasHeight = 720;

    this.worldWidth = 1800;
    this.worldHeight = 1000;

    this.state = "menu";

    this.input = new Input(this);

    this.world = new World(
      this.worldWidth,
      this.worldHeight
    );

    this.player = new Player({
      world: this.world,
      game: this
    });

    this.world.setGame(this);

    this.camera = {
      x: 0,
      y: 0,

      targetX: 0,
      targetY: 0,

      smoothing: 7
    };

    this.objectiveText =
      "Encontre uma maneira de escapar da sala.";

    this.currentInteractionTarget = null;

    this.messageOpen = false;
    this.puzzleOpen = false;
    this.terminalOpen = false;

    this.currentMessageTitle = "SISTEMA";
    this.currentMessageText = "";

    this.currentPuzzleTitle = "DESAFIO";
    this.currentPuzzleQuestion = "";

    this.currentTerminalText =
      "Insira o código de acesso.";

    this.terminalCodeDisplay = "_ _ _ _";

    this.currentPuzzle = null;
    this.terminalCode = "";

    this.puzzleSolved = false;
    this.terminalUnlocked = false;
    this.doorOpened = false;

    this.isSpeaking = false;

    this.audioContext = null;
    this.masterGain = null;

    this.lastInteractionId = null;
    this.interactionCooldown = 0;

    this.time = 0;

    this.screenShake = 0;

    this.particles = [];

    this.lightFlicker = 0;

    this.resize();

    this.generatePuzzle();
    this.generateTerminalCode();

    this.createParticles();

    this.updateCamera(true);
  }

  /* =========================================================
     RESIZE
  ========================================================== */

  resize() {
    const rect =
      this.canvas.getBoundingClientRect();

    const width =
      rect.width || window.innerWidth;

    const height =
      rect.height || window.innerHeight;

    const dpr =
      Math.min(
        window.devicePixelRatio || 1,
        2
      );

    this.canvas.width =
      Math.floor(
        width * dpr
      );

    this.canvas.height =
      Math.floor(
        height * dpr
      );

    this.ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );

    this.viewWidth = width;
    this.viewHeight = height;
  }

  /* =========================================================
     INICIAR
  ========================================================== */

  start() {
    this.state = "playing";

    this.player.setEnabled(true);

    this.initializeAudio();

    this.generatePuzzle();
    this.generateTerminalCode();

    this.objectiveText =
      "Explore a sala e encontre pistas.";

    this.showIntroMessage();
  }

  /* =========================================================
     ÁUDIO
  ========================================================== */

  initializeAudio() {
    try {
      if (!this.audioContext) {
        const AudioContext =
          window.AudioContext ||
          window.webkitAudioContext;

        if (!AudioContext) {
          return;
        }

        this.audioContext =
          new AudioContext();

        this.masterGain =
          this.audioContext.createGain();

        this.masterGain.gain.value =
          0.08;

        this.masterGain.connect(
          this.audioContext.destination
        );
      }

      if (
        this.audioContext.state ===
        "suspended"
      ) {
        this.audioContext.resume();
      }

    } catch (error) {
      console.warn(
        "Áudio indisponível:",
        error
      );
    }
  }

  playTone(
    frequency = 440,
    duration = 0.08,
    type = "sine",
    volume = 0.06
  ) {
    if (
      !this.audioContext ||
      !this.masterGain
    ) {
      return;
    }

    try {
      const oscillator =
        this.audioContext.createOscillator();

      const gain =
        this.audioContext.createGain();

      oscillator.type = type;

      oscillator.frequency.setValueAtTime(
        frequency,
        this.audioContext.currentTime
      );

      gain.gain.setValueAtTime(
        volume,
        this.audioContext.currentTime
      );

      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioContext.currentTime +
          duration
      );

      oscillator.connect(gain);
      gain.connect(this.masterGain);

      oscillator.start();

      oscillator.stop(
        this.audioContext.currentTime +
          duration
      );
    } catch {
      // O jogo continua mesmo sem áudio.
    }
  }

  playInteractionSound() {
    this.playTone(
      420,
      0.06,
      "square",
      0.045
    );

    window.setTimeout(() => {
      this.playTone(
        620,
        0.07,
        "square",
        0.035
      );
    }, 55);
  }

  playErrorSound() {
    this.playTone(
      170,
      0.12,
      "sawtooth",
      0.045
    );
  }

  playSuccessSound() {
    this.playTone(
      440,
      0.08,
      "sine",
      0.045
    );

    window.setTimeout(() => {
      this.playTone(
        660,
        0.1,
        "sine",
        0.045
      );
    }, 90);

    window.setTimeout(() => {
      this.playTone(
        880,
        0.14,
        "sine",
        0.04
      );
    }, 190);
  }

  /* =========================================================
     VOZ
  ========================================================== */

  speak(text) {
    if (
      !text ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance =
        new SpeechSynthesisUtterance(
          text
        );

      utterance.lang = "pt-BR";

      utterance.rate = 0.88;
      utterance.pitch = 0.82;
      utterance.volume = 0.85;

      const voices =
        window.speechSynthesis.getVoices();

      const preferred =
        voices.find(
          (voice) =>
            voice.lang &&
            voice.lang
              .toLowerCase()
              .startsWith("pt-br")
        ) ||
        voices.find(
          (voice) =>
            voice.lang &&
            voice.lang
              .toLowerCase()
              .startsWith("pt")
        );

      if (preferred) {
        utterance.voice =
          preferred;
      }

      this.isSpeaking = true;

      utterance.onend = () => {
        this.isSpeaking = false;
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
      };

      window.speechSynthesis.speak(
        utterance
      );
    } catch {
      this.isSpeaking = false;
    }
  }

  speakSystem(text) {
    this.speak(
      `Sistema. ${text}`
    );
  }

  speakCurrentText() {
    if (
      this.messageOpen &&
      this.currentMessageText
    ) {
      this.speak(
        this.currentMessageText
      );

      return;
    }

    if (
      this.terminalOpen &&
      this.currentTerminalText
    ) {
      this.speak(
        this.currentTerminalText
      );

      return;
    }

    if (
      this.currentInteractionTarget
    ) {
      this.speak(
        this.currentInteractionTarget.description ||
        this.currentInteractionTarget.label ||
        "Objeto localizado."
      );
    }
  }

  speakCurrentPuzzle() {
    if (
      this.currentPuzzleQuestion
    ) {
      this.speak(
        `Desafio. ${this.currentPuzzleQuestion}`
      );
    }
  }

  speakTerminal() {
    if (
      this.currentTerminalText
    ) {
      this.speak(
        this.currentTerminalText
      );
    }
  }

  /* =========================================================
     INTRODUÇÃO
  ========================================================== */

  showIntroMessage() {
    this.messageOpen = true;

    this.currentMessageTitle =
      "SISTEMA INICIADO";

    this.currentMessageText =
      "Você está em uma sala de aula vazia. " +
      "Você não consegue enxergar, mas pode perceber " +
      "o ambiente através dos sons e das informações " +
      "do sistema. Explore a sala e encontre uma maneira de escapar.";

    this.state = "message";

    this.speak(
      this.currentMessageText
    );
  }

  closeMessage() {
    this.messageOpen = false;

    if (
      this.state === "message"
    ) {
      this.state = "playing";
    }

    this.playInteractionSound();
  }

  /* =========================================================
     PUZZLE
  ========================================================== */

  generatePuzzle() {
    const puzzles = [
      {
        question:
          "Resolva: 7 vezes 8. Qual é o resultado?",
        answer: "56"
      },

      {
        question:
          "Resolva: 9 vezes 6. Qual é o resultado?",
        answer: "54"
      },

      {
        question:
          "Resolva: 12 menos 5. Qual é o resultado?",
        answer: "7"
      },

      {
        question:
          "Resolva: 48 dividido por 6. Qual é o resultado?",
        answer: "8"
      },

      {
        question:
          "Resolva: 15 mais 17. Qual é o resultado?",
        answer: "32"
      },

      {
        question:
          "Resolva: 11 vezes 4. Qual é o resultado?",
        answer: "44"
      }
    ];

    const index =
      Math.floor(
        Math.random() *
        puzzles.length
      );

    this.currentPuzzle =
      puzzles[index];

    this.currentPuzzleQuestion =
      this.currentPuzzle.question;

    this.puzzleSolved = false;
  }

  openPuzzle() {
    if (
      this.puzzleOpen
    ) {
      return;
    }

    this.puzzleOpen = true;
    this.state = "puzzle";

    this.playInteractionSound();

    this.speakCurrentPuzzle();
  }

  closePuzzle() {
    this.puzzleOpen = false;

    if (
      this.state === "puzzle"
    ) {
      this.state = "playing";
    }

    this.clearPuzzleFeedback();
  }

  clearPuzzleFeedback() {
    const element =
      document.getElementById(
        "puzzleFeedback"
      );

    if (element) {
      element.textContent = "";
    }

    const input =
      document.getElementById(
        "puzzleInput"
      );

    if (input) {
      input.value = "";
    }
  }

  submitPuzzle() {
    const input =
      document.getElementById(
        "puzzleInput"
      );

    if (!input) {
      return;
    }

    const answer =
      input.value
        .trim()
        .toLowerCase();

    const correct =
      String(
        this.currentPuzzle.answer
      ).toLowerCase();

    if (
      answer === correct
    ) {
      this.puzzleSolved = true;

      this.puzzleOpen = false;

      this.state = "playing";

      this.objectiveText =
        "Encontre o terminal de segurança.";

      this.playSuccessSound();

      this.showTemporaryMessage(
        "RESPOSTA CORRETA",
        "O sistema reconheceu a resposta. " +
        "Uma informação importante foi liberada."
      );

      return;
    }

    this.playErrorSound();

    const feedback =
      document.getElementById(
        "puzzleFeedback"
      );

    if (feedback) {
      feedback.textContent =
        "Resposta incorreta. Tente novamente.";
    }

    this.speak(
      "Resposta incorreta. Tente novamente."
    );
  }

  /* =========================================================
     TERMINAL
  ========================================================== */

  generateTerminalCode() {
    let code =
      Math.floor(
        1000 +
        Math.random() * 9000
      ).toString();

    if (
      code.length !== 4
    ) {
      code = "4821";
    }

    this.terminalCode = code;

    this.terminalCodeDisplay =
      "_ _ _ _";
  }

  openTerminal() {
    if (
      !this.puzzleSolved
    ) {
      this.showTemporaryMessage(
        "TERMINAL BLOQUEADO",
        "O terminal não responde. " +
        "Talvez exista alguma informação que você ainda precisa descobrir."
      );

      return;
    }

    this.terminalOpen = true;

    this.state = "terminal";

    this.currentTerminalText =
      "Terminal de segurança ativo. " +
      "Insira o código de acesso.";

    this.terminalCodeDisplay =
      "_ _ _ _";

    this.playInteractionSound();

    this.speakTerminal();
  }

  closeTerminal() {
    this.terminalOpen = false;

    if (
      this.state === "terminal"
    ) {
      this.state = "playing";
    }

    const input =
      document.getElementById(
        "terminalInput"
      );

    if (input) {
      input.value = "";
    }

    const feedback =
      document.getElementById(
        "terminalFeedback"
      );

    if (feedback) {
      feedback.textContent = "";
    }
  }

  submitTerminal() {
    const input =
      document.getElementById(
        "terminalInput"
      );

    if (!input) {
      return;
    }

    const code =
      input.value
        .replace(/\D/g, "")
        .slice(0, 4);

    if (
      code === this.terminalCode
    ) {
      this.terminalUnlocked = true;

      this.terminalOpen = false;

      this.state = "playing";

      this.objectiveText =
        "A porta foi desbloqueada. Vá até a saída.";

      this.world.setDoorOpen(true);

      this.playSuccessSound();

      this.showTemporaryMessage(
        "ACESSO LIBERADO",
        "Código correto. O sistema de segurança foi desativado. " +
        "A porta de saída está desbloqueada."
      );

      this.speak(
        "Código correto. A porta de saída está desbloqueada."
      );

      return;
    }

    this.playErrorSound();

    const feedback =
      document.getElementById(
        "terminalFeedback"
      );

    if (feedback) {
      feedback.textContent =
        "SENHA INCORRETA.";
    }

    this.speak(
      "Senha incorreta."
    );
  }

  /* =========================================================
     MENSAGEM TEMPORÁRIA
  ========================================================== */

  showTemporaryMessage(
    title,
    text
  ) {
    this.currentMessageTitle =
      title;

    this.currentMessageText =
      text;

    this.messageOpen = true;

    this.state = "message";

    this.speak(text);
  }

  /* =========================================================
     INTERAÇÃO
  ========================================================== */

  interact() {
    if (
      this.state !== "playing"
    ) {
      return;
    }

    const target =
      this.world.getNearestInteraction(
        this.player
      );

    if (!target) {
      return;
    }

    this.currentInteractionTarget =
      target;

    this.lastInteractionId =
      target.id;

    this.playInteractionSound();

    this.handleInteraction(
      target
    );
  }

  handleInteraction(target) {
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

      case "cabinet":
        this.interactCabinet();
        break;

      case "bookshelf":
        this.interactBookshelf();
        break;

      case "computer":
        this.interactComputer();
        break;

      case "poster_left":
      case "poster_right":
        this.interactPoster(
          target
        );
        break;

      case "exit":
        this.interactExit();
        break;

      default:
        if (
          target.id.startsWith(
            "desk_"
          )
        ) {
          this.interactDesk(
            target
          );
        }

        break;
    }
  }

  interactBoard() {
    this.showTemporaryMessage(
      "QUADRO",
      `Há uma operação escrita no quadro. ${this.currentPuzzleQuestion}`
    );
  }

  interactClock() {
    this.showTemporaryMessage(
      "RELÓGIO",
      "O relógio está parado. " +
      "Os ponteiros marcam uma hora estranha. " +
      "Talvez esse detalhe seja importante."
    );
  }

  interactCabinet() {
    if (
      !this.puzzleSolved
    ) {
      this.showTemporaryMessage(
        "ARMÁRIO",
        "O armário está trancado. " +
        "Você sente uma pequena trava metálica."
      );

      return;
    }

    this.showTemporaryMessage(
      "ARMÁRIO",
      "O armário se abriu. " +
      "Você encontrou uma pequena anotação com símbolos numéricos."
    );
  }

  interactBookshelf() {
    this.showTemporaryMessage(
      "ESTANTE",
      "Você passa a mão pelos livros. " +
      "Um deles parece estar fora do lugar."
    );
  }

  interactComputer() {
    if (
      !this.puzzleSolved
    ) {
      this.showTemporaryMessage(
        "COMPUTADOR",
        "O computador está ligado, mas exige uma autorização."
      );

      return;
    }

    this.openTerminal();
  }

  interactPoster(target) {
    const text =
      target.id ===
      "poster_left"
        ? "Há um cartaz antigo sobre segurança escolar."
        : "Há um cartaz sobre uma atividade matemática.";

    this.showTemporaryMessage(
      "CARTAZ",
      text
    );
  }

  interactDesk(target) {
    this.showTemporaryMessage(
      "MESA",
      "Uma mesa escolar. " +
      "Você sente alguns riscos na madeira."
    );
  }

  interactExit() {
    if (
      !this.terminalUnlocked
    ) {
      this.showTemporaryMessage(
        "PORTA",
        "A porta está trancada. " +
        "O mecanismo eletrônico não permite a abertura."
      );

      this.speak(
        "A porta está trancada."
      );

      return;
    }

    this.openExit();
  }

  /* =========================================================
     SAÍDA
  ========================================================== */

  openExit() {
    if (
      this.doorOpened
    ) {
      return;
    }

    this.doorOpened = true;

    this.world.setDoorOpen(true);

    this.player.setEnabled(false);

    this.state = "transition";

    this.objectiveText =
      "Saída encontrada.";

    this.playSuccessSound();

    this.speak(
      "Porta aberta. Você encontrou a saída."
    );

    window.setTimeout(() => {
      this.state = "complete";
    }, 1400);
  }

  /* =========================================================
     PAUSA
  ========================================================== */

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

    this.state = "paused";

    this.player.setEnabled(false);

    if (
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
    }

    this.isSpeaking = false;
  }

  resume() {
    if (
      this.state !== "paused"
    ) {
      return;
    }

    this.state = "playing";

    this.player.setEnabled(true);

    this.initializeAudio();
  }

  /* =========================================================
     TECLADO
  ========================================================== */

  handleKeyDown(event) {
    if (!event) {
      return;
    }

    if (
      event.key === "Escape"
    ) {
      if (
        this.messageOpen
      ) {
        this.closeMessage();

        return;
      }

      if (
        this.puzzleOpen
      ) {
        this.closePuzzle();

        return;
      }

      if (
        this.terminalOpen
      ) {
        this.closeTerminal();

        return;
      }

      this.togglePause();

      return;
    }

    if (
      event.key.toLowerCase() === "e"
    ) {
      if (
        this.messageOpen ||
        this.puzzleOpen ||
        this.terminalOpen
      ) {
        return;
      }

      this.interact();

      return;
    }

    if (
      event.key.toLowerCase() === "p"
    ) {
      if (
        !this.messageOpen &&
        !this.puzzleOpen &&
        !this.terminalOpen
      ) {
        this.togglePause();
      }
    }

    if (
      event.key.toLowerCase() === "r"
    ) {
      if (
        this.state === "complete"
      ) {
        this.restart();
      }
    }
  }

  /* =========================================================
     UPDATE
  ========================================================== */

  update(deltaTime) {
    const dt =
      Math.min(
        Math.max(
          deltaTime || 0,
          0
        ),
        0.05
      );

    this.time += dt;

    if (
      this.interactionCooldown > 0
    ) {
      this.interactionCooldown -= dt;
    }

    this.updateParticles(dt);

    this.updateLighting(dt);

    if (
      this.state === "playing"
    ) {
      this.player.update(
        dt,
        this.input
      );

      this.updateCamera(false);

      this.currentInteractionTarget =
        this.world.getNearestInteraction(
          this.player
        );
    }

    this.input.endFrame();
  }

  /* =========================================================
     CÂMERA
  ========================================================== */

  updateCamera(immediate = false) {
    if (!this.player) {
      return;
    }

    const targetX =
      this.player.x -
      this.viewWidth / 2;

    const targetY =
      this.player.y -
      this.viewHeight / 2;

    const maxX =
      Math.max(
        0,
        this.worldWidth -
        this.viewWidth
      );

    const maxY =
      Math.max(
        0,
        this.worldHeight -
        this.viewHeight
      );

    this.camera.targetX =
      Math.max(
        0,
        Math.min(
          targetX,
          maxX
        )
      );

    this.camera.targetY =
      Math.max(
        0,
        Math.min(
          targetY,
          maxY
        )
      );

    if (immediate) {
      this.camera.x =
        this.camera.targetX;

      this.camera.y =
        this.camera.targetY;

      return;
    }

    const factor =
      1 -
      Math.exp(
        -this.camera.smoothing *
        0.016
      );

    this.camera.x +=
      (
        this.camera.targetX -
        this.camera.x
      ) * factor;

    this.camera.y +=
      (
        this.camera.targetY -
        this.camera.y
      ) * factor;
  }

  /* =========================================================
     ILUMINAÇÃO
  ========================================================== */

  updateLighting(deltaTime) {
    const flicker =
      Math.sin(
        this.time * 9
      ) * 0.025;

    const irregular =
      Math.sin(
        this.time * 21.7
      ) * 0.012;

    this.lightFlicker =
      flicker +
      irregular;
  }

  /* =========================================================
     PARTÍCULAS
  ========================================================== */

  createParticles() {
    this.particles = [];

    for (
      let i = 0;
      i < 55;
      i++
    ) {
      this.particles.push({
        x:
          Math.random() *
          this.worldWidth,

        y:
          Math.random() *
          this.worldHeight,

        size:
          Math.random() *
          1.8 +
          0.5,

        speed:
          Math.random() *
          5 +
          2,

        alpha:
          Math.random() *
          0.25 +
          0.05
      });
    }
  }

  updateParticles(deltaTime) {
    for (
      const particle of
      this.particles
    ) {
      particle.y -=
        particle.speed *
        deltaTime;

      particle.x +=
        Math.sin(
          this.time +
          particle.y * 0.01
        ) *
        deltaTime *
        2;

      if (
        particle.y < 40
      ) {
        particle.y =
          this.worldHeight - 40;
      }

      if (
        particle.x < 40
      ) {
        particle.x =
          this.worldWidth - 40;
      }

      if (
        particle.x >
        this.worldWidth - 40
      ) {
        particle.x = 40;
      }
    }
  }

  /* =========================================================
     RENDER
  ========================================================== */

  render() {
    if (
      !this.viewWidth ||
      !this.viewHeight
    ) {
      return;
    }

    const ctx =
      this.ctx;

    ctx.setTransform(
      window.devicePixelRatio > 1
        ? Math.min(
            window.devicePixelRatio,
            2
          )
        : 1,
      0,
      0,
      window.devicePixelRatio > 1
        ? Math.min(
            window.devicePixelRatio,
            2
          )
        : 1,
      0,
      0
    );

    ctx.clearRect(
      0,
      0,
      this.viewWidth,
      this.viewHeight
    );

    ctx.save();

    const shakeX =
      this.screenShake > 0
        ? (
            Math.random() -
            0.5
          ) *
          this.screenShake
        : 0;

    const shakeY =
      this.screenShake > 0
        ? (
            Math.random() -
            0.5
          ) *
          this.screenShake
        : 0;

    ctx.translate(
      -this.camera.x +
        shakeX,
      -this.camera.y +
        shakeY
    );

    this.world.render(
      ctx,
      this
    );

    this.renderParticles(
      ctx
    );

    this.player.render(
      ctx
    );

    ctx.restore();

    this.renderVision(
      ctx
    );

    this.renderScreenEffects(
      ctx
    );

    if (
      this.state === "transition"
    ) {
      this.renderExitTransition(
        ctx
      );
    }

    if (
      this.screenShake > 0
    ) {
      this.screenShake =
        Math.max(
          0,
          this.screenShake -
            0.8
        );
    }
  }

  /* =========================================================
     PARTÍCULAS NA TELA
  ========================================================== */

  renderParticles(ctx) {
    ctx.save();

    for (
      const particle of
      this.particles
    ) {
      const distance =
        Math.hypot(
          particle.x -
            this.player.x,
          particle.y -
            this.player.y
        );

      if (
        distance >
        520
      ) {
        continue;
      }

      ctx.globalAlpha =
        particle.alpha *
        Math.max(
          0,
          1 -
            distance /
              520
        );

      ctx.fillStyle =
        "#d6c9a7";

      ctx.fillRect(
        Math.floor(
          particle.x
        ),
        Math.floor(
          particle.y
        ),
        particle.size,
        particle.size
      );
    }

    ctx.restore();
  }

  /* =========================================================
     VISÃO DO PERSONAGEM
     
     IMPORTANTE:
     Não existe mais um "holofote" preso ao personagem.
     
     O efeito é uma limitação suave da visão.
  ========================================================== */

  renderVision(ctx) {
    if (
      this.state === "menu" ||
      this.state === "complete"
    ) {
      return;
    }

    const screenX =
      this.player.x -
      this.camera.x;

    const screenY =
      this.player.y -
      this.camera.y;

    const radius =
      Math.min(
        390,
        Math.max(
          280,
          Math.min(
            this.viewWidth,
            this.viewHeight
          ) * 0.48
        )
      );

    const gradient =
      ctx.createRadialGradient(
        screenX,
        screenY,
        radius * 0.42,
        screenX,
        screenY,
        radius
      );

    gradient.addColorStop(
      0,
      "rgba(0,0,0,0)"
    );

    gradient.addColorStop(
      0.55,
      "rgba(0,0,0,0.03)"
    );

    gradient.addColorStop(
      0.76,
      "rgba(0,0,0,0.20)"
    );

    gradient.addColorStop(
      0.9,
      "rgba(0,0,0,0.58)"
    );

    gradient.addColorStop(
      1,
      "rgba(0,0,0,0.90)"
    );

    ctx.save();

    ctx.fillStyle =
      gradient;

    ctx.fillRect(
      0,
      0,
      this.viewWidth,
      this.viewHeight
    );

    ctx.restore();
  }

  /* =========================================================
     EFEITOS DA TELA
  ========================================================== */

  renderScreenEffects(ctx) {
    const gradient =
      ctx.createRadialGradient(
        this.viewWidth / 2,
        this.viewHeight / 2,
        this.viewHeight * 0.2,
        this.viewWidth / 2,
        this.viewHeight / 2,
        this.viewHeight * 0.8
      );

    gradient.addColorStop(
      0,
      "rgba(0,0,0,0)"
    );

    gradient.addColorStop(
      1,
      "rgba(0,0,0,0.30)"
    );

    ctx.save();

    ctx.fillStyle =
      gradient;

    ctx.fillRect(
      0,
      0,
      this.viewWidth,
      this.viewHeight
    );

    ctx.restore();
  }

  /* =========================================================
     TRANSIÇÃO DA PORTA
  ========================================================== */

  renderExitTransition(ctx) {
    const progress =
      Math.min(
        1,
        (this.time % 2) /
          1.4
      );

    const alpha =
      Math.sin(
        progress * Math.PI
      ) * 0.85;

    ctx.save();

    ctx.fillStyle =
      `rgba(255, 245, 205, ${alpha})`;

    ctx.fillRect(
      0,
      0,
      this.viewWidth,
      this.viewHeight
    );

    ctx.restore();
  }

  /* =========================================================
     REINICIAR
  ========================================================== */

  restart() {
    if (
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
    }

    this.isSpeaking = false;

    this.state = "playing";

    this.messageOpen = false;
    this.puzzleOpen = false;
    this.terminalOpen = false;

    this.puzzleSolved = false;
    this.terminalUnlocked = false;
    this.doorOpened = false;

    this.currentInteractionTarget =
      null;

    this.currentMessageText =
      "";

    this.currentPuzzleQuestion =
      "";

    this.currentTerminalText =
      "Insira o código de acesso.";

    this.generatePuzzle();
    this.generateTerminalCode();

    this.world.reset();

    this.player.reset();

    this.player.setEnabled(true);

    this.objectiveText =
      "Explore a sala e encontre pistas.";

    this.updateCamera(true);

    this.initializeAudio();
  }

  /* =========================================================
     DESTRUIR
  ========================================================== */

  destroy() {
    this.stopSpeech();

    if (
      this.input
    ) {
      this.input.destroy();
    }

    if (
      this.audioContext
    ) {
      try {
        this.audioContext.close();
      } catch {
        // Ignora falhas ao fechar o áudio.
      }

      this.audioContext = null;
    }
  }

  stopSpeech() {
    if (
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
    }

    this.isSpeaking = false;
  }
}