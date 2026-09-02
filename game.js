import { Input } from "./input.js?v=20260902-4";
import { Player } from "./player.js?v=20260902-4";
import { World } from "./world.js?v=20260902-4";

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });

    if (!this.ctx) {
      throw new Error("Canvas 2D indisponível.");
    }

    this.ctx.imageSmoothingEnabled = false;

    this.width = 960;
    this.height = 540;
    this.worldWidth = 1600;
    this.worldHeight = 900;

    this.state = "menu";
    this.gameTime = 0;
    this.completed = false;

    this.world = new World(this.worldWidth, this.worldHeight);
    this.player = new Player({ world: this.world });
    this.input = new Input();

    this.camera = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.cameraSmoothing = 10;

    this.currentInteraction = null;
    this.messageOpen = false;
    this.currentPuzzle = null;
    this.currentTerminal = null;

    this.doorUnlocked = false;
    this.elapsedTime = 0;

    this.particles = [];
    this.shakeTime = 0;
    this.shakeStrength = 0;

    this.audioContext = null;

    this.elements = {};
    this.cacheDOM();
    this.bindDOM();

    this.reset();
    this.showScreen("menuScreen");

    console.log("Escape Room v2026-09-02-4 carregado.");
  }

  cacheDOM() {
    const ids = [
      "menuScreen", "pauseScreen", "completionScreen",
      "startButton", "resumeButton", "pauseRestartButton", "restartButton",
      "objectivePanel", "objectiveText", "interactionHint", "interactionKey",
      "interactionText", "statusPanel", "statusText", "pauseButton",
      "sceneTransition", "messageContainer", "messageTitle", "messageText",
      "messageContinue", "terminalOverlay", "terminalDisplay",
      "terminalFeedback", "puzzleOverlay", "puzzleTitle", "puzzleQuestion",
      "puzzleOptions", "puzzleFeedback", "completionTime"
    ];

    for (const id of ids) {
      this.elements[id] = document.getElementById(id);
    }
  }

  bindDOM() {
    this.elements.startButton?.addEventListener("click", () => this.start());
    this.elements.resumeButton?.addEventListener("click", () => this.resume());
    this.elements.pauseRestartButton?.addEventListener("click", () => this.restart());
    this.elements.restartButton?.addEventListener("click", () => this.restart());
    this.elements.pauseButton?.addEventListener("click", () => this.togglePause());
    this.elements.messageContinue?.addEventListener("click", () => this.closeMessage());

    this.elements.terminalOverlay?.querySelectorAll("[data-key]").forEach(button => {
      button.addEventListener("click", () => this.handleTerminalKey(button.dataset.key));
    });

    this.elements.terminalOverlay?.querySelector("[data-action='clear']")
      ?.addEventListener("click", () => this.clearTerminal());

    this.elements.terminalOverlay?.querySelector("[data-action='enter']")
      ?.addEventListener("click", () => this.submitTerminal());

    this.elements.terminalOverlay?.querySelector("[data-action='close']")
      ?.addEventListener("click", () => this.closeTerminal());
  }

  reset() {
    this.state = "menu";
    this.gameTime = 0;
    this.elapsedTime = 0;
    this.completed = false;
    this.doorUnlocked = false;

    this.currentInteraction = null;
    this.messageOpen = false;
    this.currentPuzzle = null;
    this.currentTerminal = null;

    this.world.reset();
    this.player.reset();

    this.particles = [];
    this.shakeTime = 0;
    this.shakeStrength = 0;

    this.updateCamera(true);
    this.hideAllOverlays();

    this.setObjective("Encontre uma maneira de escapar da sala.");
    this.setStatus("Explore a sala.");
  }

  start() {
    this.reset();
    this.state = "playing";
    this.hideScreen("menuScreen");
    this.hideScreen("pauseScreen");
    this.hideScreen("completionScreen");
    this.showGameplayUI();
    this.startAudio();

    // Não abre uma caixa de diálogo no início:
    // o jogador já começa com controle total.
    this.openingPulse();
  }

  restart() {
    this.start();
  }

  update(deltaTime) {
    if (!Number.isFinite(deltaTime)) deltaTime = 0;
    deltaTime = Math.min(deltaTime, 0.05);

    if (this.state === "menu") {
      this.world.update(deltaTime);
      this.input.endFrame();
      return;
    }

    if (this.state === "paused" || this.state === "completed") {
      this.input.endFrame();
      return;
    }

    if (this.state !== "playing") {
      this.input.endFrame();
      return;
    }

    if (this.messageOpen) {
      if (this.input.wantsConfirm()) this.closeMessage();
      this.input.endFrame();
      return;
    }

    if (this.currentPuzzle || this.currentTerminal) {
      const digit = this.input.getPressedDigit();
      if (this.currentTerminal && digit) this.handleTerminalKey(digit);
      if (this.input.wantsConfirm() && this.currentTerminal) this.submitTerminal();
      if (this.input.wantsConfirm() && this.currentPuzzle) {
        // O puzzle é respondido pelos botões para evitar escolhas acidentais.
      }
      this.input.endFrame();
      return;
    }

    if (this.input.wantsPause()) {
      this.pause();
      this.input.endFrame();
      return;
    }

    this.gameTime += deltaTime;
    this.elapsedTime += deltaTime;

    this.player.update(deltaTime, this.input);
    this.world.update(deltaTime);
    this.updateCamera();
    this.updateInteraction();
    this.updateParticles(deltaTime);

    if (this.input.wantsInteract()) {
      this.handleInteraction();
    }

    this.handleDoorExit();

    if (this.shakeTime > 0) {
      this.shakeTime -= deltaTime;
      if (this.shakeTime <= 0) {
        this.shakeTime = 0;
        this.shakeStrength = 0;
      }
    }

    this.input.endFrame();
  }

  pause() {
    if (this.state !== "playing" || this.messageOpen || this.currentPuzzle || this.currentTerminal) return;
    this.state = "paused";
    this.showScreen("pauseScreen");
    this.hideGameplayUI();
  }

  resume() {
    if (this.state !== "paused") return;
    this.state = "playing";
    this.hideScreen("pauseScreen");
    this.showGameplayUI();
  }

  togglePause() {
    if (this.state === "playing") this.pause();
    else if (this.state === "paused") this.resume();
  }

  updateCamera(force = false) {
    const targetX = this.clamp(
      this.player.x - this.width / 2,
      0,
      Math.max(0, this.worldWidth - this.width)
    );

    const targetY = this.clamp(
      this.player.y - this.height / 2,
      0,
      Math.max(0, this.worldHeight - this.height)
    );

    this.camera.targetX = targetX;
    this.camera.targetY = targetY;

    if (force) {
      this.camera.x = targetX;
      this.camera.y = targetY;
      return;
    }

    const amount = 1 - Math.exp(-this.cameraSmoothing / 60);
    this.camera.x += (targetX - this.camera.x) * amount;
    this.camera.y += (targetY - this.camera.y) * amount;
  }

  updateInteraction() {
    this.currentInteraction = this.world.getNearestInteraction(this.player);

    if (this.currentInteraction) {
      this.showInteractionHint(this.currentInteraction);
    } else {
      this.hideInteractionHint();
    }
  }

  handleInteraction() {
    const target = this.currentInteraction;
    if (!target) return;

    switch (target.id) {
      case "board":
        this.openMessage(
          "O QUADRO",
          "Algumas marcas de giz formam uma sequência. A sala parece ter sido preparada para esconder informações."
        );
        this.setStatus("Uma pista foi encontrada.");
        break;

      case "clock":
        this.openMessage(
          "O RELÓGIO",
          "Os ponteiros estão quase imóveis. Talvez a hora marcada seja uma pista."
        );
        break;

      case "bookshelf":
        this.openMessage(
          "A ESTANTE",
          "Um dos livros está deslocado. Atrás dele há uma anotação: quatro números podem ser importantes."
        );
        this.setObjective("Use as pistas para descobrir o código.");
        break;

      case "cabinet":
        this.openCabinetPuzzle();
        break;

      case "computer":
        this.openTerminal();
        break;

      case "teacherDesk":
        this.openMessage(
          "MESA DO PROFESSOR",
          "Entre os papéis existe uma frase circulada: “Nem tudo precisa ser visto para ser encontrado.”"
        );
        break;

      case "flag":
        this.openMessage(
          "BANDEIRA",
          "A bandeira do Brasil está presa à parede. Atrás dela existe apenas uma pequena marca no reboco."
        );
        break;

      case "exit":
        if (this.doorUnlocked) {
          this.openDoor();
        } else {
          this.openMessage(
            "A PORTA",
            "Está trancada. Primeiro encontre a solução dos desafios e descubra o código do terminal."
          );
          this.setObjective("Encontre o código para abrir a porta.");
        }
        break;

      default:
        this.openMessage(
          target.label || "OBJETO",
          "Não há nada para fazer aqui."
        );
        break;
    }
  }

  openCabinetPuzzle() {
    this.currentPuzzle = {
      title: "O ARMÁRIO",
      question: "Qual número completa a sequência: 2, 4, 8, 16, ?",
      options: ["24", "28", "32", "36"],
      answer: "32"
    };

    this.elements.puzzleTitle.textContent = this.currentPuzzle.title;
    this.elements.puzzleQuestion.textContent = this.currentPuzzle.question;
    this.elements.puzzleFeedback.textContent = "";
    this.elements.puzzleOptions.innerHTML = "";

    for (const option of this.currentPuzzle.options) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "puzzle-option";
      button.textContent = option;
      button.addEventListener("click", () => this.answerPuzzle(option));
      this.elements.puzzleOptions.appendChild(button);
    }

    this.elements.puzzleOverlay.classList.add("is-visible");
    this.elements.puzzleOverlay.setAttribute("aria-hidden", "false");
  }

  answerPuzzle(answer) {
    if (!this.currentPuzzle) return;

    if (answer === this.currentPuzzle.answer) {
      this.currentPuzzle = null;
      this.elements.puzzleOverlay.classList.remove("is-visible");
      this.elements.puzzleOverlay.setAttribute("aria-hidden", "true");

      this.setStatus("Desafio resolvido.");
      this.setObjective("Encontre o terminal e use o código encontrado.");
      this.openMessage(
        "PISTA DESCOBERTA",
        "O armário se abre. Dentro dele há um bilhete com uma sequência de quatro dígitos: 4 — 8 — 1 — 6."
      );
      this.spawnSparkles(this.player.x, this.player.y, 24);
      this.playSuccessSound();
    } else {
      this.elements.puzzleFeedback.textContent = "Essa resposta não completa a sequência.";
      this.shake(0.14, 3);
      this.playErrorSound();
    }
  }

  openTerminal() {
    this.currentTerminal = {
      code: "4816",
      entered: ""
    };

    this.elements.terminalDisplay.textContent = "----";
    this.elements.terminalFeedback.textContent = "";
    this.elements.terminalOverlay.classList.add("is-visible");
    this.elements.terminalOverlay.setAttribute("aria-hidden", "false");
    this.setStatus("Digite o código encontrado.");
  }

  handleTerminalKey(key) {
    if (!this.currentTerminal || !/^\d$/.test(key)) return;
    if (this.currentTerminal.entered.length >= 4) return;

    this.currentTerminal.entered += key;
    this.elements.terminalDisplay.textContent =
      this.currentTerminal.entered.padEnd(4, "•");

    if (this.currentTerminal.entered.length === 4) {
      this.submitTerminal();
    }
  }

  clearTerminal() {
    if (!this.currentTerminal) return;
    this.currentTerminal.entered = "";
    this.elements.terminalDisplay.textContent = "----";
    this.elements.terminalFeedback.textContent = "";
  }

  submitTerminal() {
    if (!this.currentTerminal) return;

    if (this.currentTerminal.entered.length !== 4) {
      this.elements.terminalFeedback.textContent = "Digite 4 números.";
      return;
    }

    if (this.currentTerminal.entered === this.currentTerminal.code) {
      this.currentTerminal = null;
      this.elements.terminalOverlay.classList.remove("is-visible");
      this.elements.terminalOverlay.setAttribute("aria-hidden", "true");

      this.doorUnlocked = true;
      this.world.setDoorOpen(true);

      this.setObjective("A porta está aberta. Vá até a saída.");
      this.setStatus("Sistema de segurança desativado.");
      this.spawnSparkles(this.player.x, this.player.y, 32);
      this.shake(0.22, 2);
      this.playSuccessSound();

      this.openMessage(
        "PORTA DESBLOQUEADA",
        "O sistema de segurança foi desativado. A porta agora está aberta. Vá até a esquerda da sala e atravesse a saída."
      );
    } else {
      this.elements.terminalFeedback.textContent = "Código incorreto.";
      this.currentTerminal.entered = "";
      this.elements.terminalDisplay.textContent = "----";
      this.shake(0.16, 3);
      this.playErrorSound();
    }
  }

  closeTerminal() {
    this.currentTerminal = null;
    this.elements.terminalOverlay.classList.remove("is-visible");
    this.elements.terminalOverlay.setAttribute("aria-hidden", "true");
  }

  openDoor() {
    if (!this.doorUnlocked) return;
    this.world.setDoorOpen(true);
    this.setObjective("Atravesse a porta.");
    this.setStatus("A saída está aberta.");
  }

  handleDoorExit() {
    if (!this.doorUnlocked || this.completed) return;

    const door = this.world.exitDoor;
    const centerX = door.x + door.width / 2;
    const centerY = door.y + door.height / 2;

    if (
      Math.hypot(this.player.x - centerX, this.player.y - centerY) < 80
    ) {
      this.completeGame();
    }
  }

  completeGame() {
    if (this.completed) return;

    this.completed = true;
    this.state = "completed";
    this.world.setDoorOpen(true);

    this.hideGameplayUI();
    this.hideAllOverlays();

    this.elements.completionTime.textContent = this.formatTime(this.elapsedTime);
    this.showScreen("completionScreen");

    this.spawnSparkles(this.player.x, this.player.y, 50);
    this.playSuccessSound();
  }

  openMessage(title, text) {
    this.messageOpen = true;
    this.elements.messageTitle.textContent = title || "Mensagem";
    this.elements.messageText.textContent = text || "";
    this.elements.messageContainer.classList.add("is-visible");
    this.elements.messageContainer.setAttribute("aria-hidden", "false");
    this.hideInteractionHint();
  }

  closeMessage() {
    this.messageOpen = false;
    this.elements.messageContainer.classList.remove("is-visible");
    this.elements.messageContainer.setAttribute("aria-hidden", "true");
  }

  showInteractionHint(target) {
    this.elements.interactionKey.textContent = "E";
    this.elements.interactionText.textContent =
      `Interagir: ${target.label || "objeto"}`;

    this.elements.interactionHint.classList.add("is-visible");
    this.elements.interactionHint.setAttribute("aria-hidden", "false");
  }

  hideInteractionHint() {
    this.elements.interactionHint.classList.remove("is-visible");
    this.elements.interactionHint.setAttribute("aria-hidden", "true");
  }

  setObjective(text) {
    this.elements.objectiveText.textContent = text;
  }

  setStatus(text) {
    this.elements.statusText.textContent = text;
  }

  showGameplayUI() {
    this.elements.objectivePanel.classList.add("is-visible");
    this.elements.statusPanel.classList.add("is-visible");
    this.elements.pauseButton.classList.add("is-visible");
  }

  hideGameplayUI() {
    this.elements.objectivePanel.classList.remove("is-visible");
    this.elements.statusPanel.classList.remove("is-visible");
    this.elements.pauseButton.classList.remove("is-visible");
    this.hideInteractionHint();
  }

  showScreen(id) {
    for (const screenId of ["menuScreen", "pauseScreen", "completionScreen"]) {
      const element = this.elements[screenId];
      if (!element) continue;

      const active = screenId === id;
      element.classList.toggle("is-visible", active);
      element.setAttribute("aria-hidden", active ? "false" : "true");
    }
  }

  hideScreen(id) {
    const element = this.elements[id];
    if (!element) return;
    element.classList.remove("is-visible");
    element.setAttribute("aria-hidden", "true");
  }

  hideAllOverlays() {
    this.messageOpen = false;
    this.currentPuzzle = null;
    this.currentTerminal = null;

    for (const id of ["messageContainer", "puzzleOverlay", "terminalOverlay"]) {
      const element = this.elements[id];
      if (!element) continue;
      element.classList.remove("is-visible");
      element.setAttribute("aria-hidden", "true");
    }

    this.hideInteractionHint();
  }

  openingPulse() {
    this.spawnSparkles(this.player.x, this.player.y, 8);
  }

  shake(duration, strength) {
    this.shakeTime = duration;
    this.shakeStrength = strength;
  }

  spawnSparkles(x, y, amount) {
    for (let i = 0; i < amount; i += 1) {
      const life = 0.5 + Math.random() * 0.8;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 50,
        y: y + (Math.random() - 0.5) * 50,
        vx: (Math.random() - 0.5) * 60,
        vy: (Math.random() - 0.5) * 60,
        life,
        maxLife: life,
        size: Math.random() > 0.5 ? 2 : 1
      });
    }
  }

  updateParticles(deltaTime) {
    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const p = this.particles[i];
      p.life -= deltaTime;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      p.vy += 18 * deltaTime;
      p.vx *= 0.985;
      p.vy *= 0.985;
    }
  }

  renderParticles(ctx, camera) {
    for (const p of this.particles) {
      const x = p.x - camera.x;
      const y = p.y - camera.y;
      const alpha = Math.max(0, p.life / p.maxLife);

      if (x < -5 || y < -5 || x > this.width + 5 || y > this.height + 5) continue;

      ctx.fillStyle = `rgba(245,220,160,${alpha * 0.7})`;
      ctx.fillRect(Math.round(x), Math.round(y), p.size, p.size);
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    let shakeX = 0;
    let shakeY = 0;

    if (this.shakeTime > 0) {
      shakeX = (Math.random() - 0.5) * this.shakeStrength;
      shakeY = (Math.random() - 0.5) * this.shakeStrength;
    }

    const camera = {
      x: this.camera.x - shakeX,
      y: this.camera.y - shakeY
    };

    this.drawBackground(ctx);
    this.world.render(ctx, camera);
    this.renderParticles(ctx, camera);
    this.player.render(ctx, camera);
    this.world.renderLighting(ctx, this.player, camera, this.gameTime);
    this.renderAtmosphere(ctx);
  }

  drawBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, "#070a0d");
    gradient.addColorStop(1, "#11171a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  renderAtmosphere(ctx) {
    ctx.save();

    for (let i = 0; i < 38; i += 1) {
      const x = (i * 97.13 + this.gameTime * 2.5) % this.width;
      const y = (i * 51.77 + Math.sin(this.gameTime * 0.4 + i) * 5) % this.height;

      ctx.fillStyle = i % 4 === 0
        ? "rgba(255,255,255,0.03)"
        : "rgba(255,255,255,0.012)";

      ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
    }

    ctx.restore();
  }

  startAudio() {
    if (this.audioContext) {
      if (this.audioContext.state === "suspended") this.audioContext.resume();
      return;
    }

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.audioContext = new AudioContext();
    } catch {
      this.audioContext = null;
    }
  }

  playTone(frequency, duration = 0.08, type = "sine", volume = 0.025) {
    if (!this.audioContext) return;

    try {
      if (this.audioContext.state === "suspended") this.audioContext.resume();

      const now = this.audioContext.currentTime;
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      oscillator.connect(gain);
      gain.connect(this.audioContext.destination);

      oscillator.start(now);
      oscillator.stop(now + duration + 0.02);
    } catch {
      // O jogo continua funcionando sem áudio.
    }
  }

  playSuccessSound() {
    this.playTone(523.25, 0.09, "sine", 0.03);
    window.setTimeout(() => this.playTone(659.25, 0.12, "sine", 0.025), 65);
  }

  playErrorSound() {
    this.playTone(150, 0.12, "sawtooth", 0.018);
  }

  formatTime(seconds) {
    const total = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(total / 60);
    const secs = total % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  destroy() {
    this.input.destroy();

    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch {}
    }

    this.audioContext = null;
  }
}