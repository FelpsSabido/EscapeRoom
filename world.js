// world.js
// Escape Room — Mundo 2D Indie
// Sala de aula frontal em pixel art
//
// Compatível com:
// - game.js
// - player.js
// - input.js
//
// O mundo usa coordenadas próprias de 1600 x 900.
// A câmera do game.js transforma essas coordenadas
// para a tela de 960 x 540.

export class World {
  constructor(width = 1600, height = 900) {
    this.width = width;
    this.height = height;

    this.doorOpen = false;

    // =======================================================
    // PALETA
    // =======================================================

    this.palette = {
      wall: "#25222a",
      wallDark: "#18171d",
      wallLight: "#35303b",

      floor: "#4a3d38",
      floorDark: "#302825",
      floorLight: "#5b4b44",

      wood: "#6f4936",
      woodDark: "#432c23",
      woodLight: "#8d6047",

      black: "#17151a",
      white: "#f4eee3",

      board: "#263c3b",
      boardDark: "#182928",
      boardLine: "#526b64",

      metal: "#62666b",
      metalDark: "#3a3c40",

      blue: "#4d77a7",
      blueDark: "#304e70",

      red: "#9b3e42",
      redDark: "#652c30",

      green: "#496f52",
      greenDark: "#2e4936",

      yellow: "#b8944e",
      yellowDark: "#6e582f",

      paper: "#d7ccb9",
      paperDark: "#9e927e"
    };

    // =======================================================
    // PORTA PRINCIPAL
    //
    // IMPORTANTE:
    // Essas coordenadas precisam bater com o game.js.
    // O game.js usa:
    // doorX = 150
    // doorY = 410
    // =======================================================

    this.exitDoor = {
      x: 110,
      y: 330,
      width: 120,
      height: 190,

      interactionRadius: 150,

      open: false
    };

    // =======================================================
    // OBJETOS DO CENÁRIO
    // =======================================================

    this.objects = [];

    this.createObjects();

    // =======================================================
    // COLISÕES
    // =======================================================

    this.colliders = [];

    this.createColliders();

    // =======================================================
    // INTERAÇÕES
    // =======================================================

    this.interactions = [];

    this.createInteractions();

    // =======================================================
    // PARTÍCULAS AMBIENTAIS
    // =======================================================

    this.dustParticles = [];

    this.createDustParticles();
  }

  // =========================================================
  // CRIAÇÃO DO CENÁRIO
  // =========================================================

  createObjects() {
    this.objects = [
      // -----------------------------------------------------
      // QUADRO
      // -----------------------------------------------------

      {
        type: "board",
        x: 520,
        y: 105,
        width: 500,
        height: 190,
        layer: 1
      },

      // -----------------------------------------------------
      // RELÓGIO
      // -----------------------------------------------------

      {
        type: "clock",
        x: 1290,
        y: 135,
        width: 90,
        height: 90,
        layer: 2
      },

      // -----------------------------------------------------
      // JANELA ESQUERDA
      // -----------------------------------------------------

      {
        type: "window",
        x: 270,
        y: 110,
        width: 180,
        height: 190,
        layer: 1,
        outside: "night"
      },

      // -----------------------------------------------------
      // JANELA DIREITA
      // -----------------------------------------------------

      {
        type: "window",
        x: 1120,
        y: 110,
        width: 180,
        height: 190,
        layer: 1,
        outside: "night"
      },

      // -----------------------------------------------------
      // ARMÁRIO ESQUERDO
      // -----------------------------------------------------

      {
        type: "cabinet",
        x: 260,
        y: 570,
        width: 160,
        height: 210,
        layer: 3
      },

      // -----------------------------------------------------
      // ESTANTE DIREITA
      // -----------------------------------------------------

      {
        type: "bookshelf",
        x: 1210,
        y: 560,
        width: 180,
        height: 230,
        layer: 3
      },

      // -----------------------------------------------------
      // MESA DO PROFESSOR
      // -----------------------------------------------------

      {
        type: "teacherDesk",
        x: 570,
        y: 540,
        width: 310,
        height: 120,
        layer: 4
      },

      // -----------------------------------------------------
      // COMPUTADOR
      // -----------------------------------------------------

      {
        type: "computer",
        x: 690,
        y: 475,
        width: 90,
        height: 75,
        layer: 5
      },

      // -----------------------------------------------------
      // PLANTA
      // -----------------------------------------------------

      {
        type: "plant",
        x: 1430,
        y: 650,
        width: 80,
        height: 150,
        layer: 5
      },

      // -----------------------------------------------------
      // LIXEIRA
      // -----------------------------------------------------

      {
        type: "trash",
        x: 470,
        y: 700,
        width: 70,
        height: 90,
        layer: 5
      },

      // -----------------------------------------------------
      // CARTEIRAS
      // -----------------------------------------------------

      {
        type: "studentDesk",
        x: 500,
        y: 350,
        width: 150,
        height: 100,
        layer: 4,
        id: "desk_1"
      },

      {
        type: "studentDesk",
        x: 750,
        y: 350,
        width: 150,
        height: 100,
        layer: 4,
        id: "desk_2"
      },

      {
        type: "studentDesk",
        x: 1000,
        y: 350,
        width: 150,
        height: 100,
        layer: 4,
        id: "desk_3"
      },

      {
        type: "studentDesk",
        x: 500,
        y: 700,
        width: 150,
        height: 100,
        layer: 4,
        id: "desk_4"
      },

      {
        type: "studentDesk",
        x: 750,
        y: 700,
        width: 150,
        height: 100,
        layer: 4,
        id: "desk_5"
      },

      {
        type: "studentDesk",
        x: 1000,
        y: 700,
        width: 150,
        height: 100,
        layer: 4,
        id: "desk_6"
      },

      // -----------------------------------------------------
      // BANDEIRA DO BRASIL
      // -----------------------------------------------------

      {
        type: "flag",
        x: 1360,
        y: 260,
        width: 100,
        height: 70,
        layer: 2
      },

      // -----------------------------------------------------
      // POSTERES
      // -----------------------------------------------------

      {
        type: "poster",
        x: 320,
        y: 340,
        width: 100,
        height: 130,
        layer: 2,
        variant: 1
      },

      {
        type: "poster",
        x: 1210,
        y: 340,
        width: 100,
        height: 130,
        layer: 2,
        variant: 2
      }
    ];
  }

  // =========================================================
  // COLISORES
  // =========================================================

  createColliders() {
    this.colliders = [
      // -----------------------------------------------------
      // PAREDES
      // -----------------------------------------------------

      {
        x: 0,
        y: 0,
        width: this.width,
        height: 45
      },

      {
        x: 0,
        y: this.height - 45,
        width: this.width,
        height: 45
      },

      {
        x: 0,
        y: 0,
        width: 45,
        height: this.height
      },

      {
        x: this.width - 45,
        y: 0,
        width: 45,
        height: this.height
      },

      // -----------------------------------------------------
      // PORTA
      //
      // Existe uma abertura real na parede.
      // -----------------------------------------------------

      {
        x: 45,
        y: 45,
        width: 20,
        height: 280
      },

      {
        x: 45,
        y: 520,
        width: 20,
        height: 335
      },

      // -----------------------------------------------------
      // JANELAS
      // -----------------------------------------------------

      {
        x: 270,
        y: 110,
        width: 180,
        height: 190
      },

      {
        x: 1120,
        y: 110,
        width: 180,
        height: 190
      },

      // -----------------------------------------------------
      // ARMÁRIO
      // -----------------------------------------------------

      {
        x: 260,
        y: 570,
        width: 160,
        height: 210
      },

      // -----------------------------------------------------
      // ESTANTE
      // -----------------------------------------------------

      {
        x: 1210,
        y: 560,
        width: 180,
        height: 230
      },

      // -----------------------------------------------------
      // MESA DO PROFESSOR
      // -----------------------------------------------------

      {
        x: 570,
        y: 540,
        width: 310,
        height: 120
      },

      // -----------------------------------------------------
      // CARTEIRAS
      // -----------------------------------------------------

      {
        x: 500,
        y: 350,
        width: 150,
        height: 100
      },

      {
        x: 750,
        y: 350,
        width: 150,
        height: 100
      },

      {
        x: 1000,
        y: 350,
        width: 150,
        height: 100
      },

      {
        x: 500,
        y: 700,
        width: 150,
        height: 100
      },

      {
        x: 750,
        y: 700,
        width: 150,
        height: 100
      },

      {
        x: 1000,
        y: 700,
        width: 150,
        height: 100
      },

      // -----------------------------------------------------
      // LIXEIRA
      // -----------------------------------------------------

      {
        x: 470,
        y: 700,
        width: 70,
        height: 90
      },

      // -----------------------------------------------------
      // PLANTA
      // -----------------------------------------------------

      {
        x: 1430,
        y: 700,
        width: 80,
        height: 100
      }
    ];
  }

  // =========================================================
  // INTERAÇÕES
  // =========================================================

  createInteractions() {
    this.interactions = [
      {
        id: "board",
        type: "puzzle",
        x: 770,
        y: 300,
        radius: 130,
        label: "Examinar quadro",
        title: "O quadro da sala",
        message:
          "Há anotações apagadas e alguns números parecem ter sido deixados de propósito."
      },

      {
        id: "computer",
        type: "terminal",
        x: 735,
        y: 480,
        radius: 110,
        label: "Usar computador"
      },

      {
        id: "desk_1",
        type: "clue",
        x: 575,
        y: 410,
        radius: 100,
        label: "Examinar carteira",
        message:
          "Dentro da carteira há uma pequena anotação. Ela parece indicar uma sequência."
      },

      {
        id: "desk_2",
        type: "clue",
        x: 825,
        y: 410,
        radius: 100,
        label: "Examinar carteira",
        message:
          "A madeira está marcada com quatro pequenos símbolos."
      },

      {
        id: "desk_3",
        type: "clue",
        x: 1075,
        y: 410,
        radius: 100,
        label: "Examinar carteira",
        message:
          "Você encontra uma folha dobrada. Há uma pista escrita à mão."
      },

      {
        id: "desk_4",
        type: "clue",
        x: 575,
        y: 760,
        radius: 100,
        label: "Examinar carteira",
        message:
          "Há um número rabiscado no canto inferior da mesa."
      },

      {
        id: "desk_5",
        type: "clue",
        x: 825,
        y: 760,
        radius: 100,
        label: "Examinar carteira",
        message:
          "Um símbolo aparece repetido várias vezes na madeira."
      },

      {
        id: "desk_6",
        type: "clue",
        x: 1075,
        y: 760,
        radius: 100,
        label: "Examinar carteira",
        message:
          "Uma pequena etiqueta está escondida sob a mesa."
      },

      {
        id: "cabinet",
        type: "clue",
        x: 340,
        y: 680,
        radius: 130,
        label: "Examinar armário",
        message:
          "O armário está trancado. Uma das portas possui uma marca estranha."
      },

      {
        id: "bookshelf",
        type: "clue",
        x: 1300,
        y: 680,
        radius: 130,
        label: "Examinar estante",
        message:
          "Alguns livros estão fora de ordem. Talvez exista um padrão."
      },

      {
        id: "clock",
        type: "clue",
        x: 1335,
        y: 180,
        radius: 110,
        label: "Examinar relógio",
        message:
          "O relógio está parado. Os ponteiros apontam para uma hora específica."
      },

      {
        id: "poster_left",
        type: "clue",
        x: 370,
        y: 405,
        radius: 100,
        label: "Examinar cartaz",
        message:
          "O cartaz tem algumas letras destacadas."
      },

      {
        id: "poster_right",
        type: "clue",
        x: 1260,
        y: 405,
        radius: 100,
        label: "Examinar cartaz",
        message:
          "Há uma sequência de formas geométricas desenhada no cartaz."
      },

      {
        id: "exit",
        type: "exit",
        x: 170,
        y: 425,
        radius: 150,
        label: "Examinar porta"
      }
    ];
  }

  // =========================================================
  // PARTÍCULAS DE POEIRA
  // =========================================================

  createDustParticles() {
    this.dustParticles = [];

    let seed = 8127;

    const random = () => {
      seed =
        (seed * 1664525 + 1013904223) %
        4294967296;

      return seed / 4294967296;
    };

    for (let i = 0; i < 85; i++) {
      this.dustParticles.push({
        x: 70 + random() * (this.width - 140),
        y: 60 + random() * (this.height - 120),
        size: 1 + random() * 2,
        alpha: 0.05 + random() * 0.12,
        speed: 3 + random() * 8,
        drift: -2 + random() * 4,
        phase: random() * Math.PI * 2
      });
    }
  }

  // =========================================================
  // UPDATE
  // =========================================================

  update(deltaTime) {
    if (!Number.isFinite(deltaTime)) {
      return;
    }

    const time =
      performance.now() / 1000;

    for (const particle of this.dustParticles) {
      particle.y +=
        particle.speed * deltaTime;

      particle.x +=
        Math.sin(
          time * 0.7 +
          particle.phase
        ) *
        particle.drift *
        deltaTime;

      if (
        particle.y >
        this.height - 55
      ) {
        particle.y = 60;
      }

      if (
        particle.x < 55
      ) {
        particle.x =
          this.width - 55;
      }

      if (
        particle.x >
        this.width - 55
      ) {
        particle.x = 55;
      }
    }
  }

  // =========================================================
  // RENDER
  // =========================================================

  render(ctx, camera = { x: 0, y: 0 }) {
    if (!ctx) {
      return;
    }

    ctx.save();

    // -------------------------------------------------------
    // CÂMERA
    // -------------------------------------------------------

    ctx.translate(
      -camera.x,
      -camera.y
    );

    // -------------------------------------------------------
    // FUNDO
    // -------------------------------------------------------

    this.drawBackground(ctx);

    // -------------------------------------------------------
    // PAREDES
    // -------------------------------------------------------

    this.drawWalls(ctx);

    // -------------------------------------------------------
    // CHÃO
    // -------------------------------------------------------

    this.drawFloor(ctx);

    // -------------------------------------------------------
    // OBJETOS
    // -------------------------------------------------------

    const sortedObjects =
      [...this.objects].sort(
        (a, b) =>
          (a.layer || 0) -
          (b.layer || 0)
      );

    for (const object of sortedObjects) {
      this.drawObject(
        ctx,
        object
      );
    }

    // -------------------------------------------------------
    // PORTA
    // -------------------------------------------------------

    this.drawDoor(ctx);

    // -------------------------------------------------------
    // PARTÍCULAS
    // -------------------------------------------------------

    this.drawDust(ctx);

    ctx.restore();
  }

  // =========================================================
  // FUNDO
  // =========================================================

  drawBackground(ctx) {
    ctx.fillStyle =
      this.palette.wallDark;

    ctx.fillRect(
      0,
      0,
      this.width,
      this.height
    );

    // Faixas verticais sutis
    for (
      let x = 50;
      x < this.width;
      x += 64
    ) {
      ctx.fillStyle =
        x % 128 === 0
          ? "#29252e"
          : "#25222a";

      ctx.fillRect(
        x,
        45,
        1,
        this.height - 90
      );
    }
  }

  // =========================================================
  // PAREDES
  // =========================================================

  drawWalls(ctx) {
    // Parede superior
    ctx.fillStyle =
      this.palette.wall;

    ctx.fillRect(
      45,
      45,
      this.width - 90,
      260
    );

    // Parede inferior
    ctx.fillStyle =
      this.palette.wall;

    ctx.fillRect(
      45,
      810,
      this.width - 90,
      45
    );

    // Parede lateral esquerda
    ctx.fillRect(
      45,
      45,
      20,
      765
    );

    // Parede lateral direita
    ctx.fillRect(
      this.width - 65,
      45,
      20,
      765
    );

    // Rodapé
    ctx.fillStyle =
      this.palette.wallDark;

    ctx.fillRect(
      45,
      810,
      this.width - 90,
      18
    );

    // Linha superior
    ctx.fillStyle =
      this.palette.wallLight;

    ctx.fillRect(
      45,
      45,
      this.width - 90,
      7
    );

    // -------------------------------------------------------
    // TEXTURA PIXELADA DA PAREDE
    // -------------------------------------------------------

    for (
      let y = 70;
      y < 295;
      y += 26
    ) {
      for (
        let x = 75;
        x < this.width - 80;
        x += 48
      ) {
        const variation =
          (x * 13 + y * 7) % 5;

        if (variation === 0) {
          ctx.fillStyle =
            "rgba(255,255,255,0.018)";

          ctx.fillRect(
            x,
            y,
            18,
            2
          );
        }
      }
    }
  }

  // =========================================================
  // CHÃO
  // =========================================================

  drawFloor(ctx) {
    ctx.fillStyle =
      this.palette.floor;

    ctx.fillRect(
      65,
      300,
      this.width - 130,
      510
    );

    // Linhas do piso
    ctx.lineWidth = 2;

    for (
      let y = 300;
      y <= 810;
      y += 72
    ) {
      ctx.strokeStyle =
        "rgba(20,15,15,0.18)";

      ctx.beginPath();

      ctx.moveTo(
        65,
        y
      );

      ctx.lineTo(
        this.width - 65,
        y
      );

      ctx.stroke();
    }

    // Tábuas verticais
    for (
      let x = 65;
      x <= this.width - 65;
      x += 110
    ) {
      ctx.strokeStyle =
        "rgba(20,15,15,0.12)";

      ctx.beginPath();

      ctx.moveTo(
        x,
        300
      );

      ctx.lineTo(
        x,
        810
      );

      ctx.stroke();
    }

    // Pequenas marcas
    for (
      let i = 0;
      i < 90;
      i++
    ) {
      const x =
        75 +
        ((i * 173) %
          (this.width - 160));

      const y =
        320 +
        ((i * 83) % 460);

      ctx.fillStyle =
        "rgba(255,255,255,0.025)";

      ctx.fillRect(
        x,
        y,
        12,
        2
      );
    }
  }

  // =========================================================
  // OBJETOS
  // =========================================================

  drawObject(ctx, object) {
    if (!object) {
      return;
    }

    switch (object.type) {
      case "board":
        this.drawBoard(ctx, object);
        break;

      case "clock":
        this.drawClock(ctx, object);
        break;

      case "window":
        this.drawWindow(ctx, object);
        break;

      case "cabinet":
        this.drawCabinet(ctx, object);
        break;

      case "bookshelf":
        this.drawBookshelf(ctx, object);
        break;

      case "teacherDesk":
        this.drawTeacherDesk(ctx, object);
        break;

      case "computer":
        this.drawComputer(ctx, object);
        break;

      case "plant":
        this.drawPlant(ctx, object);
        break;

      case "trash":
        this.drawTrash(ctx, object);
        break;

      case "studentDesk":
        this.drawStudentDesk(ctx, object);
        break;

      case "flag":
        this.drawFlag(ctx, object);
        break;

      case "poster":
        this.drawPoster(ctx, object);
        break;

      default:
        break;
    }
  }

  // =========================================================
  // SOMBRA GENÉRICA
  // =========================================================

  drawShadow(
    ctx,
    x,
    y,
    width,
    height = 12
  ) {
    ctx.fillStyle =
      "rgba(0,0,0,0.28)";

    ctx.fillRect(
      x - width / 2,
      y - height / 2,
      width,
      height
    );
  }

  // =========================================================
  // QUADRO
  // =========================================================

  drawBoard(ctx, object) {
    const {
      x,
      y,
      width,
      height
    } = object;

    // Moldura
    ctx.fillStyle =
      this.palette.woodDark;

    ctx.fillRect(
      x - 10,
      y - 10,
      width + 20,
      height + 20
    );

    ctx.fillStyle =
      this.palette.wood;

    ctx.fillRect(
      x - 6,
      y - 6,
      width + 12,
      height + 12
    );

    // Quadro
    ctx.fillStyle =
      this.palette.board;

    ctx.fillRect(
      x,
      y,
      width,
      height
    );

    // Brilho do quadro
    ctx.fillStyle =
      "rgba(255,255,255,0.035)";

    ctx.fillRect(
      x + 10,
      y + 10,
      width - 20,
      8
    );

    // Linhas apagadas
    ctx.strokeStyle =
      this.palette.boardLine;

    ctx.lineWidth = 3;

    ctx.globalAlpha = 0.35;

    ctx.beginPath();

    ctx.moveTo(
      x + 55,
      y + 70
    );

    ctx.lineTo(
      x + 190,
      y + 70
    );

    ctx.moveTo(
      x + 235,
      y + 112
    );

    ctx.lineTo(
      x + 405,
      y + 112
    );

    ctx.stroke();

    ctx.globalAlpha = 1;

    // Giz
    ctx.fillStyle =
      this.palette.paper;

    ctx.fillRect(
      x + 40,
      y + height - 25,
      45,
      7
    );

    ctx.fillRect(
      x + 105,
      y + height - 25,
      28,
      7
    );
  }

  // =========================================================
  // RELÓGIO
  // =========================================================

  drawClock(ctx, object) {
    const centerX =
      object.x +
      object.width / 2;

    const centerY =
      object.y +
      object.height / 2;

    const radius =
      object.width / 2;

    ctx.fillStyle =
      "rgba(0,0,0,0.3)";

    ctx.fillRect(
      object.x + 5,
      object.y + 7,
      object.width,
      object.height
    );

    ctx.fillStyle =
      this.palette.paper;

    ctx.beginPath();

    ctx.arc(
      centerX,
      centerY,
      radius,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.strokeStyle =
      this.palette.woodDark;

    ctx.lineWidth = 7;

    ctx.stroke();

    // Ponteiros
    ctx.strokeStyle =
      this.palette.black;

    ctx.lineWidth = 5;

    ctx.beginPath();

    ctx.moveTo(
      centerX,
      centerY
    );

    ctx.lineTo(
      centerX - 17,
      centerY - 23
    );

    ctx.moveTo(
      centerX,
      centerY
    );

    ctx.lineTo(
      centerX + 26,
      centerY + 5
    );

    ctx.stroke();

    // Centro
    ctx.fillStyle =
      this.palette.red;

    ctx.fillRect(
      centerX - 4,
      centerY - 4,
      8,
      8
    );
  }

  // =========================================================
  // JANELA
  // =========================================================

  drawWindow(ctx, object) {
    const {
      x,
      y,
      width,
      height
    } = object;

    // Moldura
    ctx.fillStyle =
      this.palette.woodDark;

    ctx.fillRect(
      x - 9,
      y - 9,
      width + 18,
      height + 18
    );

    ctx.fillStyle =
      this.palette.wood;

    ctx.fillRect(
      x - 4,
      y - 4,
      width + 8,
      height + 8
    );

    // Céu noturno
    ctx.fillStyle =
      "#171c2d";

    ctx.fillRect(
      x,
      y,
      width,
      height
    );

    // Lua
    ctx.fillStyle =
      "#d9d1b7";

    ctx.fillRect(
      x + 30,
      y + 30,
      24,
      24
    );

    ctx.fillStyle =
      "#171c2d";

    ctx.fillRect(
      x + 40,
      y + 26,
      20,
      20
    );

    // Estrelas
    ctx.fillStyle =
      "#d6d0c0";

    const stars = [
      [25, 90],
      [80, 40],
      [125, 105],
      [150, 55],
      [95, 135],
      [45, 150]
    ];

    for (const star of stars) {
      ctx.fillRect(
        x + star[0],
        y + star[1],
        3,
        3
      );
    }

    // Divisórias
    ctx.fillStyle =
      this.palette.woodDark;

    ctx.fillRect(
      x + width / 2 - 4,
      y,
      8,
      height
    );

    ctx.fillRect(
      x,
      y + height / 2 - 4,
      width,
      8
    );

    // Reflexo
    ctx.fillStyle =
      "rgba(255,255,255,0.08)";

    ctx.fillRect(
      x + 12,
      y + 12,
      8,
      height - 24
    );
  }

  // =========================================================
  // ARMÁRIO
  // =========================================================

  drawCabinet(ctx, object) {
    const {
      x,
      y,
      width,
      height
    } = object;

    this.drawShadow(
      ctx,
      x + width / 2,
      y + height + 10,
      width * 0.9,
      18
    );

    ctx.fillStyle =
      this.palette.metalDark;

    ctx.fillRect(
      x,
      y,
      width,
      height
    );

    ctx.fillStyle =
      this.palette.metal;

    ctx.fillRect(
      x + 7,
      y + 7,
      width - 14,
      height - 14
    );

    // Portas
    ctx.fillStyle =
      "#55595e";

    ctx.fillRect(
      x + 14,
      y + 14,
      width / 2 - 18,
      height - 28
    );

    ctx.fillRect(
      x + width / 2 + 4,
      y + 14,
      width / 2 - 18,
      height - 28
    );

    // Divisória
    ctx.fillStyle =
      this.palette.metalDark;

    ctx.fillRect(
      x + width / 2 - 3,
      y + 10,
      6,
      height - 20
    );

    // Maçanetas
    ctx.fillStyle =
      this.palette.yellow;

    ctx.fillRect(
      x + width / 2 - 28,
      y + height / 2,
      9,
      9
    );

    ctx.fillRect(
      x + width / 2 + 19,
      y + height / 2,
      9,
      9
    );

    // Etiqueta
    ctx.fillStyle =
      this.palette.paper;

    ctx.fillRect(
      x + 50,
      y + 30,
      60,
      20
    );

    ctx.fillStyle =
      this.palette.paperDark;

    ctx.fillRect(
      x + 58,
      y + 37,
      44,
      3
    );
  }

  // =========================================================
  // ESTANTE
  // =========================================================

  drawBookshelf(ctx, object) {
    const {
      x,
      y,
      width,
      height
    } = object;

    this.drawShadow(
      ctx,
      x + width / 2,
      y + height + 8,
      width * 0.9,
      18
    );

    ctx.fillStyle =
      this.palette.woodDark;

    ctx.fillRect(
      x,
      y,
      width,
      height
    );

    ctx.fillStyle =
      this.palette.wood;

    ctx.fillRect(
      x + 8,
      y + 8,
      width - 16,
      height - 16
    );

    const shelfHeight =
      (height - 20) / 4;

    for (let i = 0; i < 4; i++) {
      const shelfY =
        y +
        10 +
        i * shelfHeight;

      ctx.fillStyle =
        this.palette.woodDark;

      ctx.fillRect(
        x + 8,
        shelfY + shelfHeight - 8,
        width - 16,
        8
      );

      this.drawBooks(
        ctx,
        x + 20,
        shelfY + 12,
        width - 40,
        shelfHeight - 24,
        i
      );
    }
  }

  // =========================================================
  // LIVROS
  // =========================================================

  drawBooks(
    ctx,
    x,
    y,
    width,
    height,
    row
  ) {
    const books = [
      {
        width: 20,
        color: this.palette.red
      },
      {
        width: 17,
        color: this.palette.blue
      },
      {
        width: 23,
        color: this.palette.green
      },
      {
        width: 15,
        color: this.palette.yellow
      },
      {
        width: 19,
        color: this.palette.redDark
      },
      {
        width: 18,
        color: this.palette.blueDark
      }
    ];

    let currentX = x;

    for (
      let i = 0;
      i < books.length;
      i++
    ) {
      const book =
        books[
          (i + row) %
            books.length
        ];

      if (
        currentX +
          book.width >
        x + width
      ) {
        break;
      }

      ctx.fillStyle =
        book.color;

      ctx.fillRect(
        currentX,
        y + (i % 2) * 3,
        book.width,
        height - 4
      );

      ctx.fillStyle =
        "rgba(255,255,255,0.14)";

      ctx.fillRect(
        currentX + 3,
        y + 4,
        3,
        height - 12
      );

      currentX +=
        book.width + 5;
    }
  }

  // =========================================================
  // MESA DO PROFESSOR
  // =========================================================

  drawTeacherDesk(ctx, object) {
    const {
      x,
      y,
      width,
      height
    } = object;

    this.drawShadow(
      ctx,
      x + width / 2,
      y + height + 12,
      width * 0.95,
      22
    );

    // Tampo
    ctx.fillStyle =
      this.palette.woodDark;

    ctx.fillRect(
      x - 8,
      y,
      width + 16,
      22
    );

    ctx.fillStyle =
      this.palette.woodLight;

    ctx.fillRect(
      x - 4,
      y + 4,
      width + 8,
      12
    );

    // Frente
    ctx.fillStyle =
      this.palette.wood;

    ctx.fillRect(
      x,
      y + 22,
      width,
      height - 22
    );

    // Gavetas
    ctx.fillStyle =
      this.palette.woodDark;

    ctx.fillRect(
      x + 20,
      y + 38,
      90,
      38
    );

    ctx.fillRect(
      x + 20,
      y + 82,
      90,
      24
    );

    ctx.fillStyle =
      this.palette.yellow;

    ctx.fillRect(
      x + 60,
      y + 53,
      10,
      7
    );

    ctx.fillRect(
      x + 60,
      y + 91,
      10,
      6
    );

    // Pernas
    ctx.fillStyle =
      this.palette.woodDark;

    ctx.fillRect(
      x + 18,
      y + height - 5,
      18,
      35
    );

    ctx.fillRect(
      x + width - 36,
      y + height - 5,
      18,
      35
    );
  }

  // =========================================================
  // COMPUTADOR
  // =========================================================

  drawComputer(ctx, object) {
    const {
      x,
      y
    } = object;

    // Monitor
    ctx.fillStyle =
      this.palette.black;

    ctx.fillRect(
      x,
      y,
      82,
      54
    );

    ctx.fillStyle =
      "#27333d";

    ctx.fillRect(
      x + 6,
      y + 6,
      70,
      42
    );

    // Tela
    ctx.fillStyle =
      "#344e55";

    ctx.fillRect(
      x + 10,
      y + 10,
      62,
      34
    );

    // Texto da tela
    ctx.fillStyle =
      "#9eb4a2";

    ctx.fillRect(
      x + 17,
      y + 17,
      28,
      3
    );

    ctx.fillRect(
      x + 17,
      y + 25,
      42,
      3
    );

    ctx.fillRect(
      x + 17,
      y + 33,
      20,
      3
    );

    // Pé
    ctx.fillStyle =
      this.palette.black;

    ctx.fillRect(
      x + 33,
      y + 54,
      16,
      14
    );

    ctx.fillRect(
      x + 24,
      y + 67,
      34,
      6
    );

    // Teclado
    ctx.fillStyle =
      this.palette.metalDark;

    ctx.fillRect(
      x + 2,
      y + 77,
      76,
      13
    );

    ctx.fillStyle =
      this.palette.metal;

    for (
      let i = 0;
      i < 9;
      i++
    ) {
      ctx.fillRect(
        x + 7 + i * 7,
        y + 81,
        4,
        4
      );
    }
  }

  // =========================================================
  // PLANTA
  // =========================================================

  drawPlant(ctx, object) {
    const centerX =
      object.x +
      object.width / 2;

    this.drawShadow(
      ctx,
      centerX,
      object.y +
        object.height -
        5,
      65,
      14
    );

    // Vaso
    ctx.fillStyle =
      this.palette.redDark;

    ctx.fillRect(
      centerX - 27,
      object.y + 75,
      54,
      55
    );

    ctx.fillStyle =
      this.palette.red;

    ctx.fillRect(
      centerX - 22,
      object.y + 82,
      44,
      42
    );

    // Terra
    ctx.fillStyle =
      this.palette.woodDark;

    ctx.fillRect(
      centerX - 21,
      object.y + 78,
      42,
      9
    );

    // Folhas
    ctx.fillStyle =
      this.palette.greenDark;

    const leaves = [
      [-28, 65],
      [-10, 40],
      [8, 50],
      [27, 30],
      [-20, 18],
      [17, 12]
    ];

    for (const leaf of leaves) {
      ctx.fillRect(
        centerX + leaf[0],
        object.y + leaf[1],
        28,
        13
      );
    }

    ctx.fillStyle =
      this.palette.green;

    ctx.fillRect(
      centerX - 8,
      object.y + 30,
      16,
      65
    );
  }

  // =========================================================
  // LIXEIRA
  // =========================================================

  drawTrash(ctx, object) {
    const centerX =
      object.x +
      object.width / 2;

    this.drawShadow(
      ctx,
      centerX,
      object.y +
        object.height,
      50,
      12
    );

    ctx.fillStyle =
      this.palette.metalDark;

    ctx.fillRect(
      centerX - 25,
      object.y + 15,
      50,
      65
    );

    ctx.fillStyle =
      this.palette.metal;

    ctx.fillRect(
      centerX - 20,
      object.y + 20,
      40,
      55
    );

    ctx.fillStyle =
      this.palette.black;

    ctx.fillRect(
      centerX - 28,
      object.y + 8,
      56,
      9
    );

    // Papel
    ctx.fillStyle =
      this.palette.paper;

    ctx.fillRect(
      centerX + 4,
      object.y + 31,
      12,
      15
    );
  }

  // =========================================================
  // CARTEIRA
  // =========================================================

  drawStudentDesk(ctx, object) {
    const {
      x,
      y,
      width,
      height
    } = object;

    const centerX =
      x + width / 2;

    // Sombra
    this.drawShadow(
      ctx,
      centerX,
      y + height + 20,
      width * 0.82,
      18
    );

    // Pernas traseiras
    ctx.fillStyle =
      this.palette.metalDark;

    ctx.fillRect(
      x + 18,
      y + 72,
      10,
      35
    );

    ctx.fillRect(
      x + width - 28,
      y + 72,
      10,
      35
    );

    // Tampo
    ctx.fillStyle =
      this.palette.woodDark;

    ctx.fillRect(
      x - 4,
      y,
      width + 8,
      24
    );

    ctx.fillStyle =
      this.palette.woodLight;

    ctx.fillRect(
      x,
      y + 4,
      width,
      15
    );

    // Frente da mesa
    ctx.fillStyle =
      this.palette.wood;

    ctx.fillRect(
      x + 5,
      y + 24,
      width - 10,
      48
    );

    // Detalhe frontal
    ctx.fillStyle =
      this.palette.woodDark;

    ctx.fillRect(
      x + 20,
      y + 39,
      width - 40,
      4
    );

    // Cantos metálicos
    ctx.fillStyle =
      this.palette.metal;

    ctx.fillRect(
      x + 5,
      y + 2,
      8,
      7
    );

    ctx.fillRect(
      x + width - 13,
      y + 2,
      8,
      7
    );
  }

  // =========================================================
  // BANDEIRA BRASILEIRA
  // =========================================================

  drawFlag(ctx, object) {
    const {
      x,
      y,
      width,
      height
    } = object;

    // Haste
    ctx.fillStyle =
      this.palette.woodDark;

    ctx.fillRect(
      x - 8,
      y - 15,
      7,
      height + 30
    );

    // Fundo verde
    ctx.fillStyle =
      "#2f7046";

    ctx.fillRect(
      x,
      y,
      width,
      height
    );

    // Losango amarelo
    ctx.fillStyle =
      "#c9a93d";

    ctx.beginPath();

    ctx.moveTo(
      x + width / 2,
      y + 8
    );

    ctx.lineTo(
      x + width - 10,
      y + height / 2
    );

    ctx.lineTo(
      x + width / 2,
      y + height - 8
    );

    ctx.lineTo(
      x + 10,
      y + height / 2
    );

    ctx.closePath();

    ctx.fill();

    // Círculo azul
    ctx.fillStyle =
      "#304d88";

    ctx.beginPath();

    ctx.arc(
      x + width / 2,
      y + height / 2,
      18,
      0,
      Math.PI * 2
    );

    ctx.fill();

    // Faixa
    ctx.fillStyle =
      "#e8e0c7";

    ctx.fillRect(
      x + width / 2 - 19,
      y + height / 2 - 3,
      38,
      6
    );
  }

  // =========================================================
  // CARTAZ
  // =========================================================

  drawPoster(ctx, object) {
    const {
      x,
      y,
      width,
      height,
      variant
    } = object;

    ctx.fillStyle =
      "rgba(0,0,0,0.22)";

    ctx.fillRect(
      x + 5,
      y + 6,
      width,
      height
    );

    ctx.fillStyle =
      this.palette.paper;

    ctx.fillRect(
      x,
      y,
      width,
      height
    );

    ctx.fillStyle =
      this.palette.paperDark;

    ctx.fillRect(
      x + 10,
      y + 14,
      width - 20,
      5
    );

    if (variant === 1) {
      // Texto
      for (
        let i = 0;
        i < 7;
        i++
      ) {
        ctx.fillStyle =
          i === 3
            ? this.palette.red
            : this.palette.black;

        ctx.fillRect(
          x + 15,
          y + 35 + i * 12,
          55 - (i % 3) * 10,
          4
        );
      }
    } else {
      // Formas
      ctx.fillStyle =
        this.palette.blue;

      ctx.fillRect(
        x + 20,
        y + 42,
        18,
        18
      );

      ctx.fillStyle =
        this.palette.red;

      ctx.fillRect(
        x + 52,
        y + 42,
        18,
        18
      );

      ctx.fillStyle =
        this.palette.green;

      ctx.fillRect(
        x + 36,
        y + 70,
        18,
        18
      );
    }

    // Fita
    ctx.fillStyle =
      this.palette.paperDark;

    ctx.fillRect(
      x + width / 2 - 10,
      y - 4,
      20,
      8
    );
  }

  // =========================================================
  // PORTA
  // =========================================================

  drawDoor(ctx) {
    const door =
      this.exitDoor;

    // Sombra
    ctx.fillStyle =
      "rgba(0,0,0,0.3)";

    ctx.fillRect(
      door.x + 10,
      door.y + 8,
      door.width,
      door.height
    );

    // Moldura
    ctx.fillStyle =
      this.palette.woodDark;

    ctx.fillRect(
      door.x - 8,
      door.y - 8,
      door.width + 16,
      door.height + 16
    );

    // Porta
    ctx.fillStyle =
      this.palette.wood;

    ctx.fillRect(
      door.x,
      door.y,
      door.width,
      door.height
    );

    // Tábuas
    ctx.fillStyle =
      this.palette.woodLight;

    for (
      let y =
        door.y + 15;
      y <
        door.y +
          door.height -
          10;
      y += 28
    ) {
      ctx.fillRect(
        door.x + 10,
        y,
        door.width - 20,
        4
      );
    }

    // Divisão
    ctx.fillStyle =
      this.palette.woodDark;

    ctx.fillRect(
      door.x +
        door.width -
        22,
      door.y + 20,
      7,
      door.height - 40
    );

    // Maçaneta
    ctx.fillStyle =
      this.palette.yellow;

    ctx.fillRect(
      door.x +
        door.width -
        38,
      door.y +
        door.height / 2 -
        5,
      10,
      10
    );

    // Placa
    ctx.fillStyle =
      this.palette.paper;

    ctx.fillRect(
      door.x + 20,
      door.y + 22,
      80,
      25
    );

    ctx.fillStyle =
      this.palette.black;

    ctx.fillRect(
      door.x + 32,
      door.y + 31,
      55,
      4
    );

    // Porta aberta
    if (this.doorOpen) {
      ctx.fillStyle =
        "rgba(0,0,0,0.85)";

      ctx.fillRect(
        door.x,
        door.y,
        door.width,
        door.height
      );

      // Brilho vindo do outro lado
      ctx.fillStyle =
        "rgba(190,210,190,0.12)";

      ctx.fillRect(
        door.x + 15,
        door.y + 15,
        door.width - 30,
        door.height - 30
      );
    }
  }

  // =========================================================
  // POEIRA
  // =========================================================

  drawDust(ctx) {
    for (
      const particle of this.dustParticles
    ) {
      ctx.fillStyle =
        `rgba(230,220,200,${particle.alpha})`;

      ctx.fillRect(
        Math.floor(particle.x),
        Math.floor(particle.y),
        Math.max(
          1,
          Math.floor(particle.size)
        ),
        Math.max(
          1,
          Math.floor(particle.size)
        )
      );
    }
  }

  // =========================================================
  // ILUMINAÇÃO
  //
  // O campo de visão acompanha o jogador.
  // O ambiente inteiro fica escuro e existe uma área
  // iluminada ao redor do personagem.
  // =========================================================

  renderLighting(
    ctx,
    player,
    camera = { x: 0, y: 0 }
  ) {
    if (
      !ctx ||
      !player
    ) {
      return;
    }

    const playerScreenX =
      player.x -
      camera.x;

    const playerScreenY =
      player.y -
      camera.y;

    ctx.save();

    // -------------------------------------------------------
    // Escuridão geral
    // -------------------------------------------------------

    ctx.fillStyle =
      "rgba(4,5,9,0.78)";

    ctx.fillRect(
      0,
      0,
      ctx.canvas.width,
      ctx.canvas.height
    );

    // -------------------------------------------------------
    // Campo de luz
    // -------------------------------------------------------

    const lightRadius = 235;

    const gradient =
      ctx.createRadialGradient(
        playerScreenX,
        playerScreenY,
        25,
        playerScreenX,
        playerScreenY,
        lightRadius
      );

    gradient.addColorStop(
      0,
      "rgba(255,240,190,0.95)"
    );

    gradient.addColorStop(
      0.18,
      "rgba(255,235,180,0.82)"
    );

    gradient.addColorStop(
      0.45,
      "rgba(255,225,170,0.40)"
    );

    gradient.addColorStop(
      0.72,
      "rgba(255,210,150,0.12)"
    );

    gradient.addColorStop(
      1,
      "rgba(255,210,150,0)"
    );

    ctx.globalCompositeOperation =
      "destination-out";

    ctx.fillStyle =
      gradient;

    ctx.beginPath();

    ctx.arc(
      playerScreenX,
      playerScreenY,
      lightRadius,
      0,
      Math.PI * 2
    );

    ctx.fill();

    // -------------------------------------------------------
    // Luz mais forte no personagem
    // -------------------------------------------------------

    ctx.globalCompositeOperation =
      "destination-out";

    const core =
      ctx.createRadialGradient(
        playerScreenX,
        playerScreenY,
        0,
        playerScreenX,
        playerScreenY,
        100
      );

    core.addColorStop(
      0,
      "rgba(255,255,255,0.5)"
    );

    core.addColorStop(
      1,
      "rgba(255,255,255,0)"
    );

    ctx.fillStyle =
      core;

    ctx.beginPath();

    ctx.arc(
      playerScreenX,
      playerScreenY,
      100,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.restore();

    // -------------------------------------------------------
    // Luz quente sobre o cenário
    // -------------------------------------------------------

    ctx.save();

    ctx.globalCompositeOperation =
      "screen";

    const warmLight =
      ctx.createRadialGradient(
        playerScreenX,
        playerScreenY,
        20,
        playerScreenX,
        playerScreenY,
        lightRadius
      );

    warmLight.addColorStop(
      0,
      "rgba(255,220,150,0.12)"
    );

    warmLight.addColorStop(
      0.5,
      "rgba(255,190,120,0.04)"
    );

    warmLight.addColorStop(
      1,
      "rgba(255,180,100,0)"
    );

    ctx.fillStyle =
      warmLight;

    ctx.beginPath();

    ctx.arc(
      playerScreenX,
      playerScreenY,
      lightRadius,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
  }

  // =========================================================
  // COLISÃO
  // =========================================================

  collides(
    x,
    y,
    width,
    height
  ) {
    const playerRect = {
      x,
      y,
      width,
      height
    };

    for (
      const collider of this.colliders
    ) {
      if (
        this.rectsOverlap(
          playerRect,
          collider
        )
      ) {
        return true;
      }
    }

    // Porta fechada
    if (
      !this.doorOpen &&
      this.rectsOverlap(
        playerRect,
        this.exitDoor
      )
    ) {
      return true;
    }

    return false;
  }

  // =========================================================
  // SOBREPOSIÇÃO
  // =========================================================

  rectsOverlap(
    a,
    b
  ) {
    return (
      a.x <
        b.x + b.width &&
      a.x + a.width >
        b.x &&
      a.y <
        b.y + b.height &&
      a.y + a.height >
        b.y
    );
  }

  // =========================================================
  // MOVIMENTO DO JOGADOR
  // =========================================================

  canPlayerMoveTo(
    player,
    x,
    y
  ) {
    if (!player) {
      return false;
    }

    const bounds =
      player.getBoundsAt
        ? player.getBoundsAt(x, y)
        : {
            x:
              x -
              player.width /
                2,
            y:
              y -
              player.height /
                2,
            width:
              player.width,
            height:
              player.height
          };

    return !this.collides(
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height
    );
  }

  // =========================================================
  // INTERAÇÕES
  // =========================================================

  getInteractionTargets(
    player
  ) {
    if (!player) {
      return [];
    }

    const result = [];

    for (
      const interaction of
        this.interactions
    ) {
      const dx =
        player.x -
        interaction.x;

      const dy =
        player.y -
        interaction.y;

      const distance =
        Math.hypot(
          dx,
          dy
        );

      if (
        distance <=
        interaction.radius
      ) {
        result.push({
          ...interaction,
          distance
        });
      }
    }

    return result.sort(
      (a, b) =>
        a.distance -
        b.distance
    );
  }

  // =========================================================
  // INTERAÇÃO MAIS PRÓXIMA
  // =========================================================

  getNearestInteraction(
    player
  ) {
    const targets =
      this.getInteractionTargets(
        player
      );

    return (
      targets[0] ||
      null
    );
  }

  // =========================================================
  // PORTA
  // =========================================================

  setDoorOpen(
    open
  ) {
    this.doorOpen =
      Boolean(open);

    this.exitDoor.open =
      this.doorOpen;
  }

  // =========================================================
  // LIMITES
  // =========================================================

  getBounds() {
    return {
      x: 45,
      y: 45,
      width:
        this.width - 90,
      height:
        this.height - 90
    };
  }

  // =========================================================
  // SPAWN
  // =========================================================

  getSpawnPoint() {
    return {
      x: 800,
      y: 610
    };
  }

  // =========================================================
  // RESET
  // =========================================================

  reset() {
    this.doorOpen =
      false;

    this.exitDoor.open =
      false;
  }

  // =========================================================
  // DESTROY
  // =========================================================

  destroy() {
    this.objects = [];
    this.colliders = [];
    this.interactions = [];
    this.dustParticles = [];
  }
}