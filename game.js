import { Input } from "./input.js";
import { Player } from "./player.js";
import { World } from "./world.js";

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.width = canvas.width;
    this.height = canvas.height;

    this.world = new World({
      width: 1500,
      height: 900
    });

    const spawn = this.world.getSpawnPoint();

    this.player = new Player({
      x: spawn.x,
      y: spawn.y
    });

    this.input = new Input(this);

    this.state = "menu";

    this.camera = {
      x: 0,
      y: 0,
      width: this.width,
      height: this.height
    };

    this.elapsedTime = 0;
    this.startedAt = 0;

    this.interactionTarget = null;
    this.messageTimer = 0;

    this.particles = [];

    this.lastPlayerX = this.player.x;
    this.lastPlayerY = this.player.y;

    this.dom = {
      menu: document.getElementById("menuScreen"),
      pause: document.getElementById("pauseScreen"),
      completed: document.getElementById("completedScreen"),

      startButton: document.getElementById("startButton"),
      restartButton: document.getElementById("restartButton"),
      pauseButton: document.getElementById("pauseButton"),
      resumeButton: document.getElementById("resumeButton"),
      pauseRestartButton: document.getElementById("pauseRestartButton"),

      objectivePanel: document.getElementById("objectivePanel"),
      objectiveText: document.getElementById("objectiveText"),

      interactionHint: document.getElementById("interactionHint"),
      interactionText: document.getElementById("interactionText"),

      completionTime: document.getElementById("completionTime"),

      messageContainer: document.getElementById("messageContainer"),
      messageTitle: document.getElementById("messageTitle"),
      messageText: document.getElementById("messageText")
    };

    this.setupDomEvents();
    this.showMenu();
  }

  setupDomEvents() {
    if (this.dom.startButton) {
      this.dom.startButton.addEventListener("click", () => {
        this.startFromMenu();
      });
    }

    if (this.dom.restartButton) {
      this.dom.restartButton.addEventListener("click", () => {
        this.restart();
      });
    }

    if (this.dom.pauseButton) {
      this.dom.pauseButton.addEventListener("click", () => {
        this.togglePause();
      });
    }

    if (this.dom.resumeButton) {
      this.dom.resumeButton.addEventListener("click", () => {
        this.resume();
      });
    }

    if (this.dom.pauseRestartButton) {
      this.dom.pauseRestartButton.addEventListener("click", () => {
        this.restart();
      });
    }
  }

  startFromMenu() {
    if (this.state !== "menu") {
      return;
    }

    this.start();
  }

  start() {
    this.state = "playing";

    this.elapsedTime = 0;
    this.startedAt = performance.now();

    this.hideAllScreens();

    this.showHud();

    this.world.reset();

    const spawn = this.world.getSpawnPoint();

    this.player.reset(spawn.x, spawn.y);

    this.camera.x = 0;
    this.camera.y = 0;

    this.interactionTarget = null;

    this.clearMessage();

    this.particles = [];

    this.updateObjective(
      "Explore a sala, encontre as pistas e descubra como escapar."
    );

    this.canvas.focus();
  }

  resume() {
    if (this.state !== "paused") {
      return;
    }

    this.state = "playing";

    this.hidePauseScreen();

    this.showHud();

    this.canvas.focus();
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

    this.state = "paused";

    this.showPauseScreen();
  }

  restart() {
    this.state = "playing";

    this.elapsedTime = 0;
    this.startedAt = performance.now();

    this.world.reset();

    const spawn = this.world.getSpawnPoint();

    this.player.reset(spawn.x, spawn.y);

    this.camera.x = 0;
    this.camera.y = 0;

    this.interactionTarget = null;

    this.particles = [];

    this.clearMessage();

    this.hideAllScreens();

    this.showHud();

    this.updateObjective(
      "Explore a sala, encontre as pistas e descubra como escapar."
    );

    this.canvas.focus();
  }

  complete() {
    if (this.state === "completed") {
      return;
    }

    this.state = "completed";

    this.elapsedTime = (performance.now() - this.startedAt) / 1000;

    if (this.dom.completionTime) {
      this.dom.completionTime.textContent = this.formatTime(
        this.elapsedTime
      );
    }

    this.hideHud();

    this.hidePauseScreen();

    if (this.dom.completed) {
      this.dom.completed.classList.add("active");
      this.dom.completed.removeAttribute("hidden");
    }

    this.spawnSuccessParticles();

    if (this.world && typeof this.world.setDoorOpen === "function") {
      this.world.setDoorOpen(true);
    }
  }

  update(deltaTime) {
    if (!this.input) {
      return;
    }

    if (this.input.wantsPause()) {
      if (this.state === "playing" || this.state === "paused") {
        this.togglePause();
      }
    }

    if (this.state === "menu") {
      this.input.endFrame();
      return;
    }

    if (this.state === "paused") {
      this.input.endFrame();
      return;
    }

    if (this.state === "completed") {
      if (this.input.wantsRestart()) {
        this.restart();
      }

      this.updateParticles(deltaTime);

      this.input.endFrame();
      return;
    }

    if (this.state !== "playing") {
      this.input.endFrame();
      return;
    }

    this.elapsedTime =
      (performance.now() - this.startedAt) / 1000;

    this.player.update(deltaTime, this.input, this.world);

    this.updateCamera(deltaTime);

    this.updateInteraction();

    if (this.input.wantsInteract()) {
      this.handleInteraction();
    }

    this.updateParticles(deltaTime);

    if (this.messageTimer > 0) {
      this.messageTimer -= deltaTime;

      if (this.messageTimer <= 0) {
        this.clearMessage();
      }
    }

    this.checkEscape();

    this.input.endFrame();
  }

  updateCamera(deltaTime) {
    const targetX =
      this.player.x -
      this.camera.width / 2;

    const targetY =
      this.player.y -
      this.camera.height / 2;

    const maxCameraX =
      this.world.width -
      this.camera.width;

    const maxCameraY =
      this.world.height -
      this.camera.height;

    const desiredX = Math.max(
      0,
      Math.min(maxCameraX, targetX)
    );

    const desiredY = Math.max(
      0,
      Math.min(maxCameraY, targetY)
    );

    const smoothing = Math.min(
      1,
      deltaTime * 8
    );

    this.camera.x +=
      (desiredX - this.camera.x) *
      smoothing;

    this.camera.y +=
      (desiredY - this.camera.y) *
      smoothing;
  }

  updateInteraction() {
    if (!this.world || !this.player) {
      this.interactionTarget = null;
      this.hideInteractionHint();
      return;
    }

    if (
      typeof this.world.getNearestInteraction !==
      "function"
    ) {
      this.interactionTarget = null;
      this.hideInteractionHint();
      return;
    }

    this.interactionTarget =
      this.world.getNearestInteraction(
        this.player.x,
        this.player.y
      );

    if (this.interactionTarget) {
      this.showInteractionHint(
        this.interactionTarget
      );
    } else {
      this.hideInteractionHint();
    }
  }

  handleInteraction() {
    if (!this.interactionTarget) {
      return;
    }

    const target = this.interactionTarget;

    const type =
      target.type ||
      target.id ||
      target.name ||
      "object";

    switch (type) {
      case "board":
        this.interactBoard(target);
        break;

      case "computer":
        this.interactComputer(target);
        break;

      case "cabinet":
        this.interactCabinet(target);
        break;

      case "bookshelf":
        this.interactBookshelf(target);
        break;

      case "door":
        this.interactDoor(target);
        break;

      case "teacherDesk":
      case "teacher-desk":
        this.interactTeacherDesk(target);
        break;

      default:
        this.showMessage(
          "Interação",
          "Você encontrou algo interessante, mas ainda não sabe como usar.",
          3
        );
        break;
    }
  }

  interactBoard() {
    this.showMessage(
      "Quadro",
      "Há anotações espalhadas pelo quadro. Talvez alguma delas seja importante para resolver o enigma.",
      5
    );

    this.updateObjective(
      "Observe o quadro e procure uma pista."
    );
  }

  interactComputer() {
    this.showMessage(
      "Computador",
      "O computador está ligado, mas pede uma senha. Você ainda precisa descobrir o código.",
      5
    );

    this.updateObjective(
      "Encontre a senha necessária para acessar o computador."
    );
  }

  interactCabinet() {
    this.showMessage(
      "Armário",
      "Você encontrou alguns materiais escolares. Entre eles há uma pista escondida.",
      5
    );

    this.updateObjective(
      "Continue investigando a sala em busca de pistas."
    );
  }

  interactBookshelf() {
    this.showMessage(
      "Estante",
      "Entre os livros existe uma anotação estranha. Parece fazer parte do enigma.",
      5
    );

    this.updateObjective(
      "Use as pistas encontradas para descobrir o código."
    );
  }

  interactTeacherDesk() {
    this.showMessage(
      "Mesa do professor",
      "Há papéis e objetos sobre a mesa. Um deles parece indicar algo importante.",
      5
    );

    this.updateObjective(
      "Investigue todos os pontos importantes da sala."
    );
  }

  interactDoor() {
    if (
      typeof this.world.setDoorOpen ===
      "function"
    ) {
      this.world.setDoorOpen(true);
    }

    this.showMessage(
      "Porta",
      "Você conseguiu abrir a porta! A saída está logo à frente.",
      4
    );

    this.updateObjective(
      "Saia da sala pela porta."
    );

    this.complete();
  }

  checkEscape() {
    if (this.state !== "playing") {
      return;
    }

    if (!this.player || !this.world) {
      return;
    }

    const targets =
      typeof this.world.getInteractionTargets ===
      "function"
        ? this.world.getInteractionTargets()
        : [];

    const door = targets.find(target => {
      const type =
        target.type ||
        target.id ||
        target.name ||
        "";

      return type === "door";
    });

    if (!door) {
      return;
    }

    const distance = Math.hypot(
      this.player.x - door.x,
      this.player.y - door.y
    );

    if (
      distance < 48 &&
      door.open === true
    ) {
      this.complete();
    }
  }

  updateObjective(text) {
    if (this.dom.objectiveText) {
      this.dom.objectiveText.textContent = text;
    }
  }

  showInteractionHint(target) {
    if (!this.dom.interactionHint) {
      return;
    }

    this.dom.interactionHint.classList.add(
      "active"
    );

    this.dom.interactionHint.removeAttribute(
      "hidden"
    );

    let label = "objeto";

    if (target) {
      label =
        target.label ||
        target.name ||
        target.type ||
        "objeto";
    }

    if (this.dom.interactionText) {
      this.dom.interactionText.textContent =
        `Pressione E para interagir com ${label}.`;
    }
  }

  hideInteractionHint() {
    if (!this.dom.interactionHint) {
      return;
    }

    this.dom.interactionHint.classList.remove(
      "active"
    );

    this.dom.interactionHint.setAttribute(
      "hidden",
      ""
    );
  }

  showMessage(title, text, duration = 4) {
    if (this.dom.messageContainer) {
      this.dom.messageContainer.classList.add(
        "active"
      );

      this.dom.messageContainer.removeAttribute(
        "hidden"
      );
    }

    if (this.dom.messageTitle) {
      this.dom.messageTitle.textContent =
        title;
    }

    if (this.dom.messageText) {
      this.dom.messageText.textContent =
        text;
    }

    this.messageTimer = duration;
  }

  clearMessage() {
    this.messageTimer = 0;

    if (this.dom.messageContainer) {
      this.dom.messageContainer.classList.remove(
        "active"
      );

      this.dom.messageContainer.setAttribute(
        "hidden",
        ""
      );
    }
  }

  showMenu() {
    this.hidePauseScreen();

    this.hideCompletedScreen();

    this.hideHud();

    if (this.dom.menu) {
      this.dom.menu.classList.add("active");
      this.dom.menu.removeAttribute("hidden");
    }
  }

  hideMenu() {
    if (!this.dom.menu) {
      return;
    }

    this.dom.menu.classList.remove("active");
    this.dom.menu.setAttribute("hidden", "");
  }

  showPauseScreen() {
    this.hideMenu();
    this.hideCompletedScreen();

    if (this.dom.pause) {
      this.dom.pause.classList.add("active");
      this.dom.pause.removeAttribute("hidden");
    }
  }

  hidePauseScreen() {
    if (!this.dom.pause) {
      return;
    }

    this.dom.pause.classList.remove("active");
    this.dom.pause.setAttribute("hidden", "");
  }

  hideCompletedScreen() {
    if (!this.dom.completed) {
      return;
    }

    this.dom.completed.classList.remove(
      "active"
    );

    this.dom.completed.setAttribute(
      "hidden",
      ""
    );
  }

  showHud() {
    if (this.dom.objectivePanel) {
      this.dom.objectivePanel.classList.add(
        "active"
      );

      this.dom.objectivePanel.removeAttribute(
        "hidden"
      );
    }

    if (this.dom.pauseButton) {
      this.dom.pauseButton.classList.add(
        "active"
      );

      this.dom.pauseButton.removeAttribute(
        "hidden"
      );
    }
  }

  hideHud() {
    if (this.dom.objectivePanel) {
      this.dom.objectivePanel.classList.remove(
        "active"
      );

      this.dom.objectivePanel.setAttribute(
        "hidden",
        ""
      );
    }

    this.hideInteractionHint();

    if (this.dom.pauseButton) {
      this.dom.pauseButton.classList.remove(
        "active"
      );

      this.dom.pauseButton.setAttribute(
        "hidden",
        ""
      );
    }
  }

  hideAllScreens() {
    this.hideMenu();
    this.hidePauseScreen();
    this.hideCompletedScreen();
  }

  formatTime(seconds) {
    const totalSeconds = Math.max(
      0,
      Math.floor(seconds)
    );

    const minutes = Math.floor(
      totalSeconds / 60
    );

    const remainingSeconds =
      totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }

  spawnSuccessParticles() {
    const centerX = this.player
      ? this.player.x
      : this.world.width / 2;

    const centerY = this.player
      ? this.player.y
      : this.world.height / 2;

    for (let i = 0; i < 80; i++) {
      const angle =
        Math.random() *
        Math.PI *
        2;

      const speed =
        50 +
        Math.random() *
        180;

      this.particles.push({
        x: centerX,
        y: centerY,
        vx:
          Math.cos(angle) *
          speed,
        vy:
          Math.sin(angle) *
          speed,

        life: 1.5 +
          Math.random(),

        maxLife: 2.5,

        size:
          2 +
          Math.random() *
          4
      });
    }
  }

  updateParticles(deltaTime) {
    for (
      let i = this.particles.length - 1;
      i >= 0;
      i--
    ) {
      const particle =
        this.particles[i];

      particle.x +=
        particle.vx *
        deltaTime;

      particle.y +=
        particle.vy *
        deltaTime;

      particle.vy +=
        100 *
        deltaTime;

      particle.life -=
        deltaTime;

      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  renderParticles() {
    if (!this.ctx) {
      return;
    }

    const ctx = this.ctx;

    for (const particle of this.particles) {
      const alpha =
        Math.max(
          0,
          particle.life /
            particle.maxLife
        );

      const screenX =
        particle.x -
        this.camera.x;

      const screenY =
        particle.y -
        this.camera.y;

      ctx.save();

      ctx.globalAlpha = alpha;

      ctx.fillStyle = "#ffffff";

      ctx.fillRect(
        Math.round(screenX),
        Math.round(screenY),
        particle.size,
        particle.size
      );

      ctx.restore();
    }
  }

  render() {
    if (!this.ctx) {
      return;
    }

    const ctx = this.ctx;

    ctx.clearRect(
      0,
      0,
      this.width,
      this.height
    );

    ctx.imageSmoothingEnabled = false;

    this.renderBackground();

    ctx.save();

    if (
      this.world &&
      typeof this.world.render ===
        "function"
    ) {
      this.world.render(
        ctx,
        this.camera
      );
    }

    if (
      this.player &&
      typeof this.player.render ===
        "function"
    ) {
      this.player.render(
        ctx,
        this.camera
      );
    }

    this.renderParticles();

    ctx.restore();

    this.renderLighting();

    if (this.state === "completed") {
      this.renderCompletionOverlay();
    }

    if (this.state === "paused") {
      this.renderPauseOverlay();
    }
  }

  renderBackground() {
    const ctx = this.ctx;

    const gradient =
      ctx.createLinearGradient(
        0,
        0,
        0,
        this.height
      );

    gradient.addColorStop(
      0,
      "#101827"
    );

    gradient.addColorStop(
      1,
      "#172235"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
      0,
      0,
      this.width,
      this.height
    );
  }

  renderLighting() {
    const ctx = this.ctx;

    if (!this.player) {
      return;
    }

    const x =
      this.player.x -
      this.camera.x;

    const y =
      this.player.y -
      this.camera.y;

    const gradient =
      ctx.createRadialGradient(
        x,
        y,
        40,
        x,
        y,
        300
      );

    gradient.addColorStop(
      0,
      "rgba(255,255,255,0)"
    );

    gradient.addColorStop(
      0.55,
      "rgba(0,0,0,0.04)"
    );

    gradient.addColorStop(
      1,
      "rgba(0,0,0,0.38)"
    );

    ctx.save();

    ctx.fillStyle = gradient;

    ctx.fillRect(
      0,
      0,
      this.width,
      this.height
    );

    ctx.restore();
  }

  renderPauseOverlay() {
    const ctx = this.ctx;

    ctx.save();

    ctx.fillStyle =
      "rgba(5,10,20,0.38)";

    ctx.fillRect(
      0,
      0,
      this.width,
      this.height
    );

    ctx.restore();
  }

  renderCompletionOverlay() {
    const ctx = this.ctx;

    ctx.save();

    const gradient =
      ctx.createRadialGradient(
        this.width / 2,
        this.height / 2,
        50,
        this.width / 2,
        this.height / 2,
        500
      );

    gradient.addColorStop(
      0,
      "rgba(255,255,255,0.08)"
    );

    gradient.addColorStop(
      1,
      "rgba(0,0,0,0.35)"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
      0,
      0,
      this.width,
      this.height
    );

    ctx.restore();
  }

  handleKeyDown(event) {
    if (!event) {
      return;
    }

    const key =
      typeof event.key === "string"
        ? event.key.toLowerCase()
        : "";

    if (key === "enter") {
      if (this.state === "menu") {
        this.startFromMenu();
      } else if (this.state === "paused") {
        this.resume();
      } else if (this.state === "completed") {
        this.restart();
      }
    }
  }

  destroy() {
    if (this.input) {
      this.input.destroy();
    }

    if (
      this.player &&
      typeof this.player.destroy ===
        "function"
    ) {
      this.player.destroy();
    }

    if (
      this.world &&
      typeof this.world.destroy ===
        "function"
    ) {
      this.world.destroy();
    }

    this.player = null;
    this.world = null;
    this.input = null;
    this.canvas = null;
    this.ctx = null;
  }
}