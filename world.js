// world.js
// Escape Room — Mundo
// Sala, objetos, colisões e sistema de interação.

export class World {
  constructor(options = {}) {
    this.width = options.width || 1800;
    this.height = options.height || 1000;

    this.game = options.game || null;

    this.doorOpen = false;

    this.objects = [];
    this.colliders = [];

    this.time = 0;

    this.build();
  }

  // =========================================================
  // CONFIGURAÇÃO
  // =========================================================

  setGame(game) {
    this.game = game;
  }

  build() {
    this.objects = [
      // -----------------------------------------------------
      // PORTA DE SAÍDA
      // -----------------------------------------------------

      {
        id: "door",
        type: "door",
        label: "Porta de saída",
        x: 70,
        y: 365,
        width: 120,
        height: 220,
        interactive: true,
        blocking: true
      },

      // -----------------------------------------------------
      // PAREDES / OBJETOS DA SALA
      // -----------------------------------------------------

      {
        id: "board",
        type: "board",
        label: "Quadro",
        x: 350,
        y: 85,
        width: 390,
        height: 105,
        interactive: true,
        blocking: false
      },

      {
        id: "clock",
        type: "clock",
        label: "Relógio",
        x: 1190,
        y: 105,
        width: 72,
        height: 72,
        interactive: true,
        blocking: false
      },

      {
        id: "windows",
        type: "windows",
        label: "Janelas",
        x: 790,
        y: 55,
        width: 300,
        height: 150,
        interactive: false,
        blocking: false
      },

      {
        id: "cabinet",
        type: "cabinet",
        label: "Armário",
        x: 820,
        y: 230,
        width: 170,
        height: 190,
        interactive: true,
        blocking: true
      },

      {
        id: "bookshelf",
        type: "bookshelf",
        label: "Estante",
        x: 1330,
        y: 575,
        width: 190,
        height: 250,
        interactive: true,
        blocking: true
      },

      {
        id: "teacherDesk",
        type: "teacherDesk",
        label: "Mesa do professor",
        x: 620,
        y: 610,
        width: 220,
        height: 120,
        interactive: true,
        blocking: true
      },

      {
        id: "computer",
        type: "computer",
        label: "Computador",
        x: 680,
        y: 555,
        width: 90,
        height: 65,
        interactive: true,
        blocking: false
      },

      {
        id: "poster_left",
        type: "poster",
        label: "Cartaz",
        x: 245,
        y: 255,
        width: 120,
        height: 150,
        interactive: false,
        blocking: false
      },

      {
        id: "poster_right",
        type: "poster",
        label: "Cartaz",
        x: 1030,
        y: 260,
        width: 120,
        height: 150,
        interactive: false,
        blocking: false
      },

      {
        id: "plant",
        type: "plant",
        label: "Planta",
        x: 1530,
        y: 250,
        width: 80,
        height: 120,
        interactive: false,
        blocking: true
      },

      {
        id: "trash",
        type: "trash",
        label: "Lixeira",
        x: 430,
        y: 780,
        width: 65,
        height: 75,
        interactive: false,
        blocking: true
      },

      {
        id: "flag",
        type: "flag",
        label: "Bandeira",
        x: 1180,
        y: 205,
        width: 90,
        height: 65,
        interactive: true,
        blocking: false
      },

      // -----------------------------------------------------
      // CARTEIRAS
      // -----------------------------------------------------

      {
        id: "desk_1",
        type: "desk",
        label: "Carteira",
        x: 250,
        y: 520,
        width: 125,
        height: 95,
        interactive: false,
        blocking: true
      },

      {
        id: "desk_2",
        type: "desk",
        label: "Carteira",
        x: 430,
        y: 520,
        width: 125,
        height: 95,
        interactive: false,
        blocking: true
      },

      {
        id: "desk_3",
        type: "desk",
        label: "Carteira",
        x: 900,
        y: 520,
        width: 125,
        height: 95,
        interactive: false,
        blocking: true
      },

      {
        id: "desk_4",
        type: "desk",
        label: "Carteira",
        x: 1080,
        y: 520,
        width: 125,
        height: 95,
        interactive: false,
        blocking: true
      },

      {
        id: "desk_5",
        type: "desk",
        label: "Carteira",
        x: 900,
        y: 730,
        width: 125,
        height: 95,
        interactive: false,
        blocking: true
      },

      {
        id: "desk_6",
        type: "desk",
        label: "Carteira",
        x: 1080,
        y: 730,
        width: 125,
        height: 95,
        interactive: false,
        blocking: true
      }
    ];

    this.buildColliders();
  }

  // =========================================================
  // COLISORES
  // =========================================================

  buildColliders() {
    this.colliders = [];

    // Paredes da sala.
    this.colliders.push(
      {
        id: "wall_top",
        x: 0,
        y: 0,
        width: this.width,
        height: 45
      },
      {
        id: "wall_bottom",
        x: 0,
        y: this.height - 45,
        width: this.width,
        height: 45
      },
      {
        id: "wall_left",
        x: 0,
        y: 0,
        width: 45,
        height: this.height
      },
      {
        id: "wall_right",
        x: this.width - 45,
        y: 0,
        width: 45,
        height: this.height
      }
    );

    // Objetos sólidos.
    for (const object of this.objects) {
      if (!object.blocking) {
        continue;
      }

      // A porta só bloqueia enquanto estiver fechada.
      if (object.id === "door" && this.doorOpen) {
        continue;
      }

      this.colliders.push({
        id: object.id,
        x: object.x,
        y: object.y,
        width: object.width,
        height: object.height
      });
    }
  }

  // =========================================================
  // COLISÃO
  // =========================================================

  canPlayerMoveTo(player, x, y) {
    if (!player) {
      return false;
    }

    const halfWidth = player.hitboxWidth / 2;
    const halfHeight = player.hitboxHeight / 2;

    const playerRect = {
      x: x - halfWidth,
      y: y - halfHeight,
      width: player.hitboxWidth,
      height: player.hitboxHeight
    };

    for (const collider of this.colliders) {
      if (
        this.rectsOverlap(
          playerRect,
          collider
        )
      ) {
        return false;
      }
    }

    return true;
  }

  rectsOverlap(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  // =========================================================
  // PORTA
  // =========================================================

  setDoorOpen(open) {
    this.doorOpen = Boolean(open);

    this.buildColliders();
  }

  // =========================================================
  // SPAWN
  // =========================================================

  getSpawnPoint() {
    return {
      x: 1160,
      y: 600
    };
  }

  // =========================================================
  // INTERAÇÕES
  // =========================================================

  getNearestInteraction(player) {
    if (!player) {
      return null;
    }

    let nearest = null;
    let nearestDistance = Infinity;

    for (const object of this.objects) {
      if (!object.interactive) {
        continue;
      }

      // Calcula o ponto mais próximo do objeto.
      const closestX = Math.max(
        object.x,
        Math.min(
          player.x,
          object.x + object.width
        )
      );

      const closestY = Math.max(
        object.y,
        Math.min(
          player.y,
          object.y + object.height
        )
      );

      const dx = player.x - closestX;
      const dy = player.y - closestY;

      const distance = Math.sqrt(
        dx * dx + dy * dy
      );

      // Distância de interação.
      if (distance > 115) {
        continue;
      }

      if (distance < nearestDistance) {
        nearestDistance = distance;

        nearest = {
          id: object.id,
          type: object.type,
          label: object.label,
          x: object.x,
          y: object.y,
          width: object.width,
          height: object.height,
          distance
        };
      }
    }

    return nearest;
  }

  // =========================================================
  // UPDATE
  // =========================================================

  update(deltaTime = 0) {
    this.time += deltaTime;
  }

  // =========================================================
  // RESET
  // =========================================================

  reset() {
    this.doorOpen = false;
    this.time = 0;

    this.buildColliders();
  }

  // =========================================================
  // RENDER
  // =========================================================

  render(ctx, camera = { x: 0, y: 0 }) {
    if (!ctx) {
      return;
    }

    ctx.save();

    ctx.translate(
      -Math.round(camera.x || 0),
      -Math.round(camera.y || 0)
    );

    this.renderRoom(ctx);
    this.renderObjects(ctx);

    ctx.restore();

    if (
      this.game &&
      this.game.player
    ) {
      this.renderLighting(
        ctx,
        this.game.player,
        camera,
        this.time
      );
    }
  }

  // =========================================================
  // SALA
  // =========================================================

  renderRoom(ctx) {
    // Piso.
    ctx.fillStyle = "#171a20";
    ctx.fillRect(
      0,
      0,
      this.width,
      this.height
    );

    // Área interna.
    ctx.fillStyle = "#252a31";
    ctx.fillRect(
      45,
      45,
      this.width - 90,
      this.height - 90
    );

    // Piso em blocos.
    ctx.strokeStyle = "rgba(255,255,255,0.025)";
    ctx.lineWidth = 1;

    const tileSize = 48;

    for (
      let x = 45;
      x < this.width - 45;
      x += tileSize
    ) {
      for (
        let y = 45;
        y < this.height - 45;
        y += tileSize
      ) {
        ctx.strokeRect(
          x,
          y,
          tileSize,
          tileSize
        );
      }
    }

    // Paredes.
    ctx.fillStyle = "#0e1115";

    ctx.fillRect(
      0,
      0,
      this.width,
      45
    );

    ctx.fillRect(
      0,
      this.height - 45,
      this.width,
      45
    );

    ctx.fillRect(
      0,
      0,
      45,
      this.height
    );

    ctx.fillRect(
      this.width - 45,
      0,
      45,
      this.height
    );

    // Linha interna das paredes.
    ctx.strokeStyle = "#3a4048";
    ctx.lineWidth = 3;

    ctx.strokeRect(
      45,
      45,
      this.width - 90,
      this.height - 90
    );
  }

  // =========================================================
  // OBJETOS
  // =========================================================

  renderObjects(ctx) {
    for (const object of this.objects) {
      switch (object.type) {
        case "door":
          this.renderDoor(ctx, object);
          break;

        case "board":
          this.renderBoard(ctx, object);
          break;

        case "clock":
          this.renderClock(ctx, object);
          break;

        case "windows":
          this.renderWindows(ctx, object);
          break;

        case "cabinet":
          this.renderCabinet(ctx, object);
          break;

        case "bookshelf":
          this.renderBookshelf(ctx, object);
          break;

        case "teacherDesk":
          this.renderTeacherDesk(ctx, object);
          break;

        case "computer":
          this.renderComputer(ctx, object);
          break;

        case "poster":
          this.renderPoster(ctx, object);
          break;

        case "plant":
          this.renderPlant(ctx, object);
          break;

        case "trash":
          this.renderTrash(ctx, object);
          break;

        case "flag":
          this.renderFlag(ctx, object);
          break;

        case "desk":
          this.renderDesk(ctx, object);
          break;
      }
    }
  }

  // =========================================================
  // PORTA
  // =========================================================

  renderDoor(ctx, object) {
    const { x, y, width, height } = object;

    ctx.fillStyle = "#11151a";
    ctx.fillRect(
      x - 8,
      y - 8,
      width + 16,
      height + 16
    );

    if (this.doorOpen) {
      ctx.fillStyle = "#080a0d";

      ctx.fillRect(
        x,
        y,
        width,
        height
      );

      ctx.fillStyle = "#202830";

      ctx.fillRect(
        x + 20,
        y + 20,
        width - 40,
        8
      );

      return;
    }

    ctx.fillStyle = "#513d32";

    ctx.fillRect(
      x,
      y,
      width,
      height
    );

    ctx.fillStyle = "#6b4d3d";

    ctx.fillRect(
      x + 12,
      y + 12,
      width - 24,
      height - 24
    );

    ctx.fillStyle = "#d0b06c";

    ctx.fillRect(
      x + width - 28,
      y + height / 2 - 5,
      8,
      10
    );
  }

  // =========================================================
  // QUADRO
  // =========================================================

  renderBoard(ctx, object) {
    const { x, y, width, height } = object;

    ctx.fillStyle = "#382d24";

    ctx.fillRect(
      x - 8,
      y - 8,
      width + 16,
      height + 16
    );

    ctx.fillStyle = "#162522";

    ctx.fillRect(
      x,
      y,
      width,
      height
    );

    ctx.strokeStyle = "#70553e";
    ctx.lineWidth = 5;

    ctx.strokeRect(
      x,
      y,
      width,
      height
    );

    ctx.strokeStyle = "rgba(225,225,205,0.45)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(x + 40, y + 40);
    ctx.lineTo(x + 120, y + 40);
    ctx.lineTo(x + 160, y + 70);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + 220, y + 30);
    ctx.lineTo(x + 300, y + 70);
    ctx.stroke();
  }

  // =========================================================
  // RELÓGIO
  // =========================================================

  renderClock(ctx, object) {
    const cx = object.x;
    const cy = object.y;

    ctx.fillStyle = "#101318";

    ctx.beginPath();

    ctx.arc(
      cx,
      cy,
      38,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.strokeStyle = "#8c8d87";
    ctx.lineWidth = 4;

    ctx.stroke();

    ctx.fillStyle = "#ded8c7";

    ctx.beginPath();

    ctx.arc(
      cx,
      cy,
      31,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.strokeStyle = "#2a2d31";
    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy - 18);

    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + 13, cy + 9);

    ctx.stroke();

    ctx.fillStyle = "#17191c";

    ctx.fillRect(
      cx - 2,
      cy - 2,
      4,
      4
    );
  }

  // =========================================================
  // JANELAS
  // =========================================================

  renderWindows(ctx, object) {
    const { x, y, width, height } = object;

    const windowWidth = width / 3;

    for (let i = 0; i < 3; i++) {
      const wx = x + i * windowWidth;

      ctx.fillStyle = "#0c151c";

      ctx.fillRect(
        wx,
        y,
        windowWidth - 8,
        height
      );

      ctx.fillStyle = "#263a49";

      ctx.fillRect(
        wx + 5,
        y + 5,
        windowWidth - 18,
        height - 10
      );

      ctx.strokeStyle = "#6c5c49";
      ctx.lineWidth = 4;

      ctx.strokeRect(
        wx,
        y,
        windowWidth - 8,
        height
      );

      ctx.strokeStyle = "#536270";
      ctx.lineWidth = 2;

      ctx.beginPath();

      ctx.moveTo(
        wx + (windowWidth - 8) / 2,
        y
      );

      ctx.lineTo(
        wx + (windowWidth - 8) / 2,
        y + height
      );

      ctx.moveTo(
        wx,
        y + height / 2
      );

      ctx.lineTo(
        wx + windowWidth - 8,
        y + height / 2
      );

      ctx.stroke();
    }
  }

  // =========================================================
  // ARMÁRIO
  // =========================================================

  renderCabinet(ctx, object) {
    const { x, y, width, height } = object;

    ctx.fillStyle = "#4a352a";

    ctx.fillRect(
      x,
      y,
      width,
      height
    );

    ctx.strokeStyle = "#75533e";
    ctx.lineWidth = 5;

    ctx.strokeRect(
      x,
      y,
      width,
      height
    );

    ctx.fillStyle = "#3a2a22";

    ctx.fillRect(
      x + 10,
      y + 10,
      width / 2 - 15,
      height - 20
    );

    ctx.fillRect(
      x + width / 2 + 5,
      y + 10,
      width / 2 - 15,
      height - 20
    );

    ctx.fillStyle = "#b99b68";

    ctx.fillRect(
      x + width / 2 - 8,
      y + height / 2,
      6,
      10
    );

    ctx.fillRect(
      x + width / 2 + 2,
      y + height / 2,
      6,
      10
    );
  }

  // =========================================================
  // ESTANTE
  // =========================================================

  renderBookshelf(ctx, object) {
    const { x, y, width, height } = object;

    ctx.fillStyle = "#4c3427";

    ctx.fillRect(
      x,
      y,
      width,
      height
    );

    ctx.strokeStyle = "#76533d";
    ctx.lineWidth = 5;

    ctx.strokeRect(
      x,
      y,
      width,
      height
    );

    const shelfHeight = height / 4;

    for (let i = 1; i < 4; i++) {
      ctx.fillStyle = "#8a6247";

      ctx.fillRect(
        x + 8,
        y + i * shelfHeight,
        width - 16,
        8
      );
    }

    const bookColors = [
      "#76515a",
      "#4e6574",
      "#8a6747",
      "#596b55",
      "#765e42"
    ];

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 6; col++) {
        const bookX =
          x + 15 + col * 27;

        const bookY =
          y + 15 + row * shelfHeight;

        ctx.fillStyle =
          bookColors[
            (row + col) %
            bookColors.length
          ];

        ctx.fillRect(
          bookX,
          bookY,
          20,
          shelfHeight - 22
        );
      }
    }
  }

  // =========================================================
  // MESA DO PROFESSOR
  // =========================================================

  renderTeacherDesk(ctx, object) {
    const { x, y, width, height } = object;

    ctx.fillStyle = "#563c2b";

    ctx.fillRect(
      x,
      y,
      width,
      height
    );

    ctx.fillStyle = "#704e36";

    ctx.fillRect(
      x - 8,
      y - 10,
      width + 16,
      20
    );

    ctx.fillStyle = "#36261d";

    ctx.fillRect(
      x + 15,
      y + 20,
      35,
      height - 20
    );

    ctx.fillRect(
      x + width - 50,
      y + 20,
      35,
      height - 20
    );
  }

  // =========================================================
  // COMPUTADOR
  // =========================================================

  renderComputer(ctx, object) {
    const { x, y } = object;

    ctx.fillStyle = "#111419";

    ctx.fillRect(
      x,
      y,
      70,
      48
    );

    ctx.fillStyle = "#273d48";

    ctx.fillRect(
      x + 6,
      y + 6,
      58,
      34
    );

    ctx.fillStyle = "#697d83";

    ctx.fillRect(
      x + 28,
      y + 48,
      14,
      10
    );

    ctx.fillRect(
      x + 20,
      y + 58,
      30,
      5
    );
  }

  // =========================================================
  // CARTAZ
  // =========================================================

  renderPoster(ctx, object) {
    const { x, y, width, height } = object;

    ctx.fillStyle = "#c7b38a";

    ctx.fillRect(
      x,
      y,
      width,
      height
    );

    ctx.strokeStyle = "#57483c";
    ctx.lineWidth = 4;

    ctx.strokeRect(
      x,
      y,
      width,
      height
    );

    ctx.fillStyle = "#554a3d";

    ctx.fillRect(
      x + 15,
      y + 20,
      width - 30,
      8
    );

    ctx.fillRect(
      x + 15,
      y + 45,
      width - 45,
      6
    );

    ctx.fillRect(
      x + 15,
      y + 65,
      width - 30,
      6
    );
  }

  // =========================================================
  // PLANTA
  // =========================================================

  renderPlant(ctx, object) {
    const x = object.x + object.width / 2;
    const y = object.y + object.height;

    ctx.fillStyle = "#714936";

    ctx.fillRect(
      x - 25,
      y - 45,
      50,
      45
    );

    ctx.fillStyle = "#31553b";

    for (let i = 0; i < 5; i++) {
      ctx.fillRect(
        x - 30 + i * 12,
        y - 100 + Math.abs(i - 2) * 7,
        18,
        55
      );
    }
  }

  // =========================================================
  // LIXEIRA
  // =========================================================

  renderTrash(ctx, object) {
    const { x, y, width, height } = object;

    ctx.fillStyle = "#42484b";

    ctx.fillRect(
      x + 5,
      y + 10,
      width - 10,
      height - 10
    );

    ctx.fillStyle = "#646b6c";

    ctx.fillRect(
      x,
      y,
      width,
      12
    );
  }

  // =========================================================
  // BANDEIRA
  // =========================================================

  renderFlag(ctx, object) {
    const x = object.x;
    const y = object.y;

    ctx.fillStyle = "#7a6248";

    ctx.fillRect(
      x,
      y,
      5,
      75
    );

    ctx.fillStyle = "#2d6b45";

    ctx.beginPath();

    ctx.moveTo(
      x + 5,
      y + 5
    );

    ctx.lineTo(
      x + 82,
      y + 25
    );

    ctx.lineTo(
      x + 5,
      y + 48
    );

    ctx.closePath();

    ctx.fill();

    ctx.fillStyle = "#d0ae43";

    ctx.beginPath();

    ctx.moveTo(
      x + 20,
      y + 27
    );

    ctx.lineTo(
      x + 43,
      y + 16
    );

    ctx.lineTo(
      x + 65,
      y + 27
    );

    ctx.lineTo(
      x + 43,
      y + 38
    );

    ctx.closePath();

    ctx.fill();

    ctx.fillStyle = "#496c9c";

    ctx.beginPath();

    ctx.arc(
      x + 43,
      y + 27,
      8,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  // =========================================================
  // CARTEIRAS
  // =========================================================

  renderDesk(ctx, object) {
    const { x, y, width, height } = object;

    ctx.fillStyle = "#61452f";

    ctx.fillRect(
      x,
      y,
      width,
      18
    );

    ctx.fillStyle = "#473226";

    ctx.fillRect(
      x + 10,
      y + 18,
      15,
      height - 18
    );

    ctx.fillRect(
      x + width - 25,
      y + 18,
      15,
      height - 18
    );

    ctx.fillStyle = "#79583d";

    ctx.fillRect(
      x + 8,
      y - 7,
      width - 16,
      12
    );
  }

  // =========================================================
  // ILUMINAÇÃO
  // =========================================================

  renderLighting(
    ctx,
    player,
    camera,
    gameTime = 0
  ) {
    if (!player) {
      return;
    }

    const px =
      player.x -
      (camera.x || 0);

    const py =
      player.y -
      (camera.y || 0);

    const radius =
      330 +
      Math.sin(gameTime * 0.8) * 4;

    const vision =
      ctx.createRadialGradient(
        px,
        py,
        radius * 0.30,
        px,
        py,
        radius
      );

    vision.addColorStop(
      0,
      "rgba(3,5,8,0)"
    );

    vision.addColorStop(
      0.40,
      "rgba(3,5,8,0.04)"
    );

    vision.addColorStop(
      0.62,
      "rgba(3,5,8,0.14)"
    );

    vision.addColorStop(
      0.80,
      "rgba(3,5,8,0.36)"
    );

    vision.addColorStop(
      0.93,
      "rgba(3,5,8,0.58)"
    );

    vision.addColorStop(
      1,
      "rgba(3,5,8,0.72)"
    );

    ctx.save();

    ctx.fillStyle = vision;

    ctx.fillRect(
      0,
      0,
      this.game?.viewWidth ||
        window.innerWidth,
      this.game?.viewHeight ||
        window.innerHeight
    );

    ctx.restore();
  }

  // =========================================================
  // DESTROY
  // =========================================================

  destroy() {
    this.objects = [];
    this.colliders = [];
    this.game = null;
  }
}