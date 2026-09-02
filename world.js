/* =========================================================
   A SALA — ESCAPE ROOM
   WORLD.JS

   Responsável por:

   - Construção do mapa
   - Paredes
   - Piso
   - Porta
   - Janelas
   - Quadro
   - Carteiras
   - Mesa do professor
   - Computador
   - Armário
   - Estante
   - Relógio
   - Cartazes
   - Planta
   - Lixeira
   - Colisões
   - Objetos interativos
   - Sombras
   - Iluminação ambiente
   - Decoração
   - Pixel art
   ========================================================= */


/* =========================================================
   WORLD
   ========================================================= */

export class World {

  constructor(
    width = 1800,
    height = 1000
  ) {

    this.width = width;

    this.height = height;


    /* -------------------------------------------------------
       ESTADO
    ------------------------------------------------------- */

    this.doorOpen = false;

    this.game = null;


    /* -------------------------------------------------------
       COLEÇÕES
    ------------------------------------------------------- */

    this.colliders = [];

    this.interactions = [];

    this.decorations = [];

    this.lights = [];

    this.desks = [];


    /* -------------------------------------------------------
       CORES DA SALA
    ------------------------------------------------------- */

    this.colors = {

      floor: "#272624",

      floorLight: "#302e2b",

      floorDark: "#1e1d1b",

      wall: "#393733",

      wallTop: "#504c44",

      wallBottom: "#292825",

      wood: "#6c5137",

      woodDark: "#3e2d20",

      woodLight: "#8a6b49",

      metal: "#55585a",

      metalDark: "#292b2c",

      paper: "#d9d0ba",

      paperDark: "#a69d89",

      blackboard: "#17201f",

      blackboardFrame: "#634b32",

      glass: "#283e47",

      glassLight: "#56747b",

      red: "#8b3e3e",

      redDark: "#512727",

      green: "#465b43",

      greenDark: "#263526",

      yellow: "#b69a57",

      white: "#d8d5c9",

      shadow: "rgba(0,0,0,0.40)"

    };


    /* -------------------------------------------------------
       CONSTRUÇÃO
    ------------------------------------------------------- */

    this.buildRoom();

    this.buildObjects();

    this.buildInteractions();

    this.buildLighting();

  }


  /* =========================================================
     GAME
     ========================================================= */

  setGame(game) {

    this.game = game;

  }


  /* =========================================================
     RESET
     ========================================================= */

  reset() {

    this.doorOpen = false;

  }


  /* =========================================================
     ROOM
     ========================================================= */

  buildRoom() {

    /*
     * A sala ocupa praticamente todo o mundo.
     *
     * As paredes possuem espessura suficiente para que
     * o personagem nunca atravesse o cenário.
     */

    this.room = {

      x: 70,

      y: 60,

      width: 1660,

      height: 880

    };


    this.wallThickness = 42;


    /* -------------------------------------------------------
       PAREDE SUPERIOR
    ------------------------------------------------------- */

    this.addCollider({

      x:
        this.room.x,

      y:
        this.room.y,

      width:
        this.room.width,

      height:
        this.wallThickness,

      type:
        "wall"

    });


    /* -------------------------------------------------------
       PAREDE DIREITA
    ------------------------------------------------------- */

    this.addCollider({

      x:
        this.room.x +
        this.room.width -
        this.wallThickness,

      y:
        this.room.y,

      width:
        this.wallThickness,

      height:
        this.room.height,

      type:
        "wall"

    });


    /* -------------------------------------------------------
       PAREDE INFERIOR
    ------------------------------------------------------- */

    this.addCollider({

      x:
        this.room.x,

      y:
        this.room.y +
        this.room.height -
        this.wallThickness,

      width:
        this.room.width,

      height:
        this.wallThickness,

      type:
        "wall"

    });


    /*
     * Parede esquerda.
     *
     * Ela é dividida em duas partes porque a porta de saída
     * fica nela.
     */

    const door = this.getExitDoor();


    /* -------------------------------------------------------
       PAREDE ESQUERDA — PARTE SUPERIOR
    ------------------------------------------------------- */

    this.addCollider({

      x:
        this.room.x,

      y:
        this.room.y,

      width:
        this.wallThickness,

      height:
        door.y -
        this.room.y,

      type:
        "wall"

    });


    /* -------------------------------------------------------
       PAREDE ESQUERDA — PARTE INFERIOR
    ------------------------------------------------------- */

    this.addCollider({

      x:
        this.room.x,

      y:
        door.y +
        door.height,

      width:
        this.wallThickness,

      height:
        (
          this.room.y +
          this.room.height
        ) -
        (
          door.y +
          door.height
        ),

      type:
        "wall"

    });


    /* -------------------------------------------------------
       BORDA DO PISO
    ------------------------------------------------------- */

    this.decorations.push({

      type:
        "floorBorder",

      x:
        this.room.x +
        this.wallThickness,

      y:
        this.room.y +
        this.wallThickness,

      width:
        this.room.width -
        this.wallThickness * 2,

      height:
        this.room.height -
        this.wallThickness * 2

    });

  }


  /* =========================================================
     OBJECTS
     ========================================================= */

  buildObjects() {

    /* -------------------------------------------------------
       PORTA
    ------------------------------------------------------- */

    this.exitDoor = {

      id:
        "exit",

      x:
        70,

      y:
        390,

      width:
        42,

      height:
        170,

      interactionRadius:
        150,

      open:
        false

    };


    /* -------------------------------------------------------
       QUADRO
    ------------------------------------------------------- */

    this.board = {

      id:
        "board",

      x:
        500,

      y:
        105,

      width:
        560,

      height:
        205

    };


    this.addCollider({

      x:
        this.board.x,

      y:
        this.board.y,

      width:
        this.board.width,

      height:
        this.board.height,

      type:
        "board"

    });


    /* -------------------------------------------------------
       JANELA ESQUERDA
    ------------------------------------------------------- */

    this.windowLeft = {

      x:
        270,

      y:
        110,

      width:
        170,

      height:
        190

    };


    this.addCollider({

      x:
        this.windowLeft.x,

      y:
        this.windowLeft.y,

      width:
        this.windowLeft.width,

      height:
        this.windowLeft.height,

      type:
        "window"

    });


    /* -------------------------------------------------------
       JANELA DIREITA
    ------------------------------------------------------- */

    this.windowRight = {

      x:
        1160,

      y:
        110,

      width:
        170,

      height:
        190

    };


    this.addCollider({

      x:
        this.windowRight.x,

      y:
        this.windowRight.y,

      width:
        this.windowRight.width,

      height:
        this.windowRight.height,

      type:
        "window"

    });


    /* -------------------------------------------------------
       ARMÁRIO
    ------------------------------------------------------- */

    this.cabinet = {

      id:
        "cabinet",

      x:
        250,

      y:
        555,

      width:
        175,

      height:
        245

    };


    this.addCollider({

      x:
        this.cabinet.x,

      y:
        this.cabinet.y,

      width:
        this.cabinet.width,

      height:
        this.cabinet.height,

      type:
        "furniture"

    });


    /* -------------------------------------------------------
       ESTANTE
    ------------------------------------------------------- */

    this.bookshelf = {

      id:
        "bookshelf",

      x:
        1390,

      y:
        530,

      width:
        210,

      height:
        270

    };


    this.addCollider({

      x:
        this.bookshelf.x,

      y:
        this.bookshelf.y,

      width:
        this.bookshelf.width,

      height:
        this.bookshelf.height,

      type:
        "furniture"

    });


    /* -------------------------------------------------------
       MESA DO PROFESSOR
    /* ------------------------------------------------------- */

    this.teacherDesk = {

      x:
        610,

      y:
        520,

      width:
        340,

      height:
        120

    };


    this.addCollider({

      x:
        this.teacherDesk.x,

      y:
        this.teacherDesk.y,

      width:
        this.teacherDesk.width,

      height:
        this.teacherDesk.height,

      type:
        "furniture"

    });


    /* -------------------------------------------------------
       COMPUTADOR
    ------------------------------------------------------- */

    this.computer = {

      id:
        "computer",

      x:
        735,

      y:
        470,

      width:
        90,

      height:
        70

    };


    /* -------------------------------------------------------
       RELÓGIO
    ------------------------------------------------------- */

    this.clock = {

      id:
        "clock",

      x:
        1395,

      y:
        115,

      width:
        100,

      height:
        100

    };


    /* -------------------------------------------------------
       CARTAZ ESQUERDO
    ------------------------------------------------------- */

    this.posterLeft = {

      id:
        "poster_left",

      x:
        310,

      y:
        355,

      width:
        145,

      height:
        105

    };


    /* -------------------------------------------------------
       CARTAZ DIREITO
    ------------------------------------------------------- */

    this.posterRight = {

      id:
        "poster_right",

      x:
        1190,

      y:
        355,

      width:
        145,

      height:
        105

    };


    /* -------------------------------------------------------
       PLANTA
    ------------------------------------------------------- */

    this.plant = {

      x:
        1630,

      y:
        700,

      width:
        65,

      height:
        150

    };


    this.addCollider({

      x:
        this.plant.x,

      y:
        this.plant.y,

      width:
        this.plant.width,

      height:
        this.plant.height,

      type:
        "decoration"

    });


    /* -------------------------------------------------------
       LIXEIRA
    ------------------------------------------------------- */

    this.trash = {

      x:
        460,

      y:
        770,

      width:
        65,

      height:
        85

    };


    this.addCollider({

      x:
        this.trash.x,

      y:
        this.trash.y,

      width:
        this.trash.width,

      height:
        this.trash.height,

      type:
        "decoration"

    });


    /* -------------------------------------------------------
       BANDEIRA / SÍMBOLO DA ESCOLA
    ------------------------------------------------------- */

    this.flag = {

      x:
        1535,

      y:
        280,

      width:
        110,

      height:
        120

    };


    /*
     * A bandeira não possui colisão.
     * Ela é somente decoração.
     */


    /* -------------------------------------------------------
       CARTEIRAS
    ------------------------------------------------------- */

    this.createDesks();

  }


  /* =========================================================
     CREATE DESKS
     ========================================================= */

  createDesks() {

    /*
     * A organização foi feita em duas fileiras.
     *
     * Há corredores largos entre elas para o personagem
     * circular sem ficar preso.
     */

    const deskData = [

      {
        id:
          "desk_1",

        x:
          500,

        y:
          350

      },

      {
        id:
          "desk_2",

        x:
          750,

        y:
          350

      },

      {
        id:
          "desk_3",

        x:
          1000,

        y:
          350

      },

      {
        id:
          "desk_4",

        x:
          500,

        y:
          690

      },

      {
        id:
          "desk_5",

        x:
          750,

        y:
          690

      },

      {
        id:
          "desk_6",

        x:
          1000,

        y:
          690

      }

    ];


    for (
      const data of deskData
    ) {

      const desk = {

        id:
          data.id,

        x:
          data.x,

        y:
          data.y,

        width:
          155,

        height:
          105,

        interactionRadius:
          110

      };


      this.desks.push(
        desk
      );


      this.addCollider({

        x:
          desk.x,

        y:
          desk.y,

        width:
          desk.width,

        height:
          desk.height,

        type:
          "desk",

        id:
          desk.id

      });

    }

  }


  /* =========================================================
     INTERACTIONS
     ========================================================= */

  buildInteractions() {

    /* -------------------------------------------------------
       QUADRO
    ------------------------------------------------------- */

    this.addInteraction({

      id:
        "board",

      label:
        "Investigar quadro",

      x:
        this.board.x +
        this.board.width / 2,

      y:
        this.board.y +
        this.board.height +
        25,

      radius:
        150

    });


    /* -------------------------------------------------------
       RELÓGIO
    ------------------------------------------------------- */

    this.addInteraction({

      id:
        "clock",

      label:
        "Investigar relógio",

      x:
        this.clock.x +
        this.clock.width / 2,

      y:
        this.clock.y +
        this.clock.height +
        20,

      radius:
        125

    });


    /* -------------------------------------------------------
       ARMÁRIO
    ------------------------------------------------------- */

    this.addInteraction({

      id:
        "cabinet",

      label:
        "Investigar armário",

      x:
        this.cabinet.x +
        this.cabinet.width / 2,

      y:
        this.cabinet.y +
        this.cabinet.height +
        25,

      radius:
        125

    });


    /* -------------------------------------------------------
       ESTANTE
    ------------------------------------------------------- */

    this.addInteraction({

      id:
        "bookshelf",

      label:
        "Investigar estante",

      x:
        this.bookshelf.x +
        this.bookshelf.width / 2,

      y:
        this.bookshelf.y +
        this.bookshelf.height +
        25,

      radius:
        135

    });


    /* -------------------------------------------------------
       COMPUTADOR
    ------------------------------------------------------- */

    this.addInteraction({

      id:
        "computer",

      label:
        "Investigar computador",

      x:
        this.computer.x +
        this.computer.width / 2,

      y:
        this.computer.y +
        this.computer.height +
        35,

      radius:
        110

    });


    /* -------------------------------------------------------
       CARTAZES
    ------------------------------------------------------- */

    this.addInteraction({

      id:
        "poster_left",

      label:
        "Investigar cartaz",

      x:
        this.posterLeft.x +
        this.posterLeft.width / 2,

      y:
        this.posterLeft.y +
        this.posterLeft.height +
        30,

      radius:
        105

    });


    this.addInteraction({

      id:
        "poster_right",

      label:
        "Investigar cartaz",

      x:
        this.posterRight.x +
        this.posterRight.width / 2,

      y:
        this.posterRight.y +
        this.posterRight.height +
        30,

      radius:
        105

    });


    /* -------------------------------------------------------
       CARTEIRAS
    ------------------------------------------------------- */

    for (
      const desk of this.desks
    ) {

      this.addInteraction({

        id:
          desk.id,

        label:
          "Investigar carteira",

        x:
          desk.x +
          desk.width / 2,

        y:
          desk.y +
          desk.height +
          25,

        radius:
          desk.interactionRadius

      });

    }


    /* -------------------------------------------------------
       PORTA
    ------------------------------------------------------- */

    this.addInteraction({

      id:
        "exit",

      label:
        "Investigar porta",

      x:
        this.exitDoor.x +
        this.exitDoor.width +
        35,

      y:
        this.exitDoor.y +
        this.exitDoor.height / 2,

      radius:
        this.exitDoor.interactionRadius

    });

  }


  /* =========================================================
     LIGHTS
     ========================================================= */

  buildLighting() {

    /*
     * Lâmpadas no teto.
     */

    this.lights = [

      {
        x:
          450,

        y:
          90,

        radius:
          150,

        intensity:
          0.18

      },

      {
        x:
          800,

        y:
          90,

        radius:
          170,

        intensity:
          0.22

      },

      {
        x:
          1150,

        y:
          90,

        radius:
          150,

        intensity:
          0.18

      },

      {
        x:
          1480,

        y:
          90,

        radius:
          140,

        intensity:
          0.16

      }

    ];

  }


  /* =========================================================
     ADD COLLIDER
     ========================================================= */

  addCollider(collider) {

    this.colliders.push(
      collider
    );

  }


  /* =========================================================
     ADD INTERACTION
     ========================================================= */

  addInteraction(interaction) {

    this.interactions.push(
      interaction
    );

  }


  /* =========================================================
     EXIT DOOR
     ========================================================= */

  getExitDoor() {

    return {

      x:
        70,

      y:
        390,

      width:
        42,

      height:
        170

    };

  }


  /* =========================================================
     COLLISION
     ========================================================= */

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
      const collider of
      this.colliders
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


    /*
     * Porta fechada.
     */

    if (
      !this.doorOpen
    ) {

      const door =
        this.exitDoor;


      if (
        this.rectsOverlap(
          playerRect,
          door
        )
      ) {

        return true;

      }

    }


    return false;

  }


  /* =========================================================
     RECT COLLISION
     ========================================================= */

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


  /* =========================================================
     PLAYER COLLISION
     ========================================================= */

  canPlayerMoveTo(
    player,
    x,
    y
  ) {

    if (
      !player
    ) {

      return false;

    }


    const width =
      player.width ||
      36;


    const height =
      player.height ||
      52;


    /*
     * O ponto recebido pelo Player representa o centro
     * do personagem.
     */

    const bounds = {

      x:
        x -
        width / 2,

      y:
        y -
        height / 2,

      width,

      height

    };


    /*
     * Pequena margem para evitar que o personagem
     * fique raspando nos móveis.
     */

    const margin = 4;


    const safeBounds = {

      x:
        bounds.x +
        margin,

      y:
        bounds.y +
        margin,

      width:
        bounds.width -
        margin * 2,

      height:
        bounds.height -
        margin * 2

    };


    return !this.collides(
      safeBounds.x,
      safeBounds.y,
      safeBounds.width,
      safeBounds.height
    );

  }


  /* =========================================================
     INTERACTION TARGETS
     ========================================================= */

  getInteractionTargets(
    player
  ) {

    if (
      !player
    ) {

      return [];

    }


    const px =
      player.x;


    const py =
      player.y;


    return this.interactions
      .map(
        interaction => {

          const distance =
            Math.hypot(
              interaction.x -
              px,

              interaction.y -
              py
            );


          return {

            ...interaction,

            distance

          };

        }
      )
      .filter(
        interaction =>
          interaction.distance <=
          interaction.radius
      )
      .sort(
        (
          a,
          b
        ) =>
          a.distance -
          b.distance
      );

  }


  /* =========================================================
     NEAREST INTERACTION
     ========================================================= */

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


  /* =========================================================
     SET DOOR OPEN
     ========================================================= */

  setDoorOpen(
    open
  ) {

    this.doorOpen =
      Boolean(open);


    this.exitDoor.open =
      this.doorOpen;

  }


  /* =========================================================
     SPAWN
     ========================================================= */

  getSpawnPoint() {

    /*
     * IMPORTANTE:
     *
     * Este ponto fica no corredor central da sala.
     *
     * Não fica dentro da mesa do professor,
     * nem dentro de uma carteira,
     * nem perto demais de uma parede.
     */

    return {

      x:
        1120,

      y:
        610

    };

  }


  /* =========================================================
     RENDER
     ========================================================= */

  render(
    ctx,
    game
  ) {

    if (
      !ctx
    ) {

      return;

    }


    this.renderFloor(
      ctx
    );


    this.renderWall(
      ctx
    );


    this.renderWindows(
      ctx
    );


    this.renderBoard(
      ctx
    );


    this.renderPosters(
      ctx
    );


    this.renderFlag(
      ctx
    );


    this.renderClock(
      ctx
    );


    this.renderCabinet(
      ctx
    );


    this.renderBookshelf(
      ctx
    );


    this.renderTeacherDesk(
      ctx
    );


    this.renderComputer(
      ctx
    );


    this.renderDesks(
      ctx
    );


    this.renderPlant(
      ctx
    );


    this.renderTrash(
      ctx
    );


    this.renderDoor(
      ctx
    );


    this.renderDecorativeDetails(
      ctx
    );


    this.renderWorldLights(
      ctx,
      game
    );

  }


  /* =========================================================
     FLOOR
     ========================================================= */

  renderFloor(ctx) {

    const r =
      this.room;


    /*
     * Base.
     */

    ctx.fillStyle =
      this.colors.floor;


    ctx.fillRect(
      r.x,
      r.y,
      r.width,
      r.height
    );


    /*
     * Faixas de piso.
     */

    const tileSize =
      64;


    for (
      let y =
        r.y +
        this.wallThickness;

      y <
        r.y +
        r.height -
        this.wallThickness;

      y += tileSize
    ) {

      for (
        let x =
          r.x +
          this.wallThickness;

        x <
          r.x +
          r.width -
          this.wallThickness;

        x += tileSize
      ) {

        const alternate =
          (
            Math.floor(
              x / tileSize
            ) +
            Math.floor(
              y / tileSize
            )
          ) % 2;


        ctx.fillStyle =
          alternate
            ? this.colors.floorLight
            : this.colors.floor;


        ctx.fillRect(
          x,
          y,
          tileSize,
          tileSize
        );


        /*
         * Linha fina entre as placas.
         */

        ctx.fillStyle =
          "rgba(0,0,0,0.12)";


        ctx.fillRect(
          x,
          y,
          tileSize,
          2
        );


        ctx.fillRect(
          x,
          y,
          2,
          tileSize
        );

      }

    }


    /*
     * Pequenas imperfeições do piso.
     */

    for (
      let i = 0;
      i < 75;
      i++
    ) {

      const x =
        r.x +
        55 +
        Math.random() *
        (
          r.width -
          110
        );


      const y =
        r.y +
        55 +
        Math.random() *
        (
          r.height -
          110
        );


      ctx.fillStyle =
        "rgba(255,255,255,0.025)";


      ctx.fillRect(
        Math.floor(x),
        Math.floor(y),
        2,
        2
      );

    }

  }


  /* =========================================================
     WALL
     ========================================================= */

  renderWall(ctx) {

    const r =
      this.room;


    /*
     * Parede.
     */

    ctx.fillStyle =
      this.colors.wall;


    ctx.fillRect(
      r.x,
      r.y,
      r.width,
      r.height
    );


    /*
     * Interior do piso.
     */

    ctx.fillStyle =
      this.colors.floor;


    ctx.fillRect(
      r.x +
      this.wallThickness,

      r.y +
      this.wallThickness,

      r.width -
      this.wallThickness * 2,

      r.height -
      this.wallThickness * 2
    );


    /*
     * Parte superior da parede.
     */

    ctx.fillStyle =
      this.colors.wallTop;


    ctx.fillRect(
      r.x,
      r.y,
      r.width,
      12
    );


    /*
     * Sombra inferior da parede.
     */

    ctx.fillStyle =
      this.colors.wallBottom;


    ctx.fillRect(
      r.x,
      r.y +
      this.wallThickness -
      8,

      r.width,

      8
    );


    /*
     * Molduras verticais.
     */

    ctx.fillStyle =
      "rgba(255,255,255,0.035)";


    for (
      let x =
        r.x + 80;

      x <
        r.x +
        r.width -
        80;

      x += 180
    ) {

      ctx.fillRect(
        x,
        r.y,
        3,
        this.wallThickness
      );

    }

  }


  /* =========================================================
     WINDOWS
     ========================================================= */

  renderWindows(ctx) {

    this.renderWindow(
      ctx,
      this.windowLeft
    );


    this.renderWindow(
      ctx,
      this.windowRight
    );

  }


  renderWindow(
    ctx,
    windowObject
  ) {

    const x =
      windowObject.x;


    const y =
      windowObject.y;


    const w =
      windowObject.width;


    const h =
      windowObject.height;


    /*
     * Sombra.
     */

    ctx.fillStyle =
      "rgba(0,0,0,0.35)";


    ctx.fillRect(
      x + 8,
      y + 10,
      w,
      h
    );


    /*
     * Moldura.
     */

    ctx.fillStyle =
      this.colors.woodDark;


    ctx.fillRect(
      x - 8,
      y - 8,
      w + 16,
      h + 16
    );


    /*
     * Vidro.
     */

    ctx.fillStyle =
      this.colors.glass;


    ctx.fillRect(
      x,
      y,
      w,
      h
    );


    /*
     * Céu.
     */

    ctx.fillStyle =
      "#344c52";


    ctx.fillRect(
      x + 8,
      y + 8,
      w - 16,
      h * 0.45
    );


    /*
     * Área externa escura.
     */

    ctx.fillStyle =
      "#1c2729";


    ctx.fillRect(
      x + 8,
      y + 8 + h * 0.45,
      w - 16,
      h * 0.47
    );


    /*
     * Reflexos.
     */

    ctx.fillStyle =
      "rgba(255,255,255,0.09)";


    ctx.fillRect(
      x + 18,
      y + 20,
      8,
      h - 40
    );


    /*
     * Divisórias.
     */

    ctx.fillStyle =
      this.colors.wood;


    ctx.fillRect(
      x +
      w / 2 -
      5,

      y,

      10,

      h
    );


    ctx.fillRect(
      x,

      y +
      h / 2 -
      5,

      w,

      10
    );


    /*
     * Peitoril.
     */

    ctx.fillStyle =
      this.colors.woodLight;


    ctx.fillRect(
      x - 14,
      y + h,
      w + 28,
      13
    );


    ctx.fillStyle =
      this.colors.woodDark;


    ctx.fillRect(
      x - 14,
      y + h + 13,
      w + 28,
      5
    );

  }


  /* =========================================================
     BOARD
     ========================================================= */

  renderBoard(ctx) {

    const b =
      this.board;


    /*
     * Sombra.
     */

    ctx.fillStyle =
      "rgba(0,0,0,0.4)";


    ctx.fillRect(
      b.x + 10,
      b.y + 12,
      b.width,
      b.height
    );


    /*
     * Moldura.
     */

    ctx.fillStyle =
      this.colors.blackboardFrame;


    ctx.fillRect(
      b.x - 10,
      b.y - 10,
      b.width + 20,
      b.height + 20
    );


    /*
     * Quadro.
     */

    ctx.fillStyle =
      this.colors.blackboard;


    ctx.fillRect(
      b.x,
      b.y,
      b.width,
      b.height
    );


    /*
     * Textura.
     */

    for (
      let i = 0;
      i < 30;
      i++
    ) {

      const x =
        b.x +
        Math.random() *
        b.width;


      const y =
        b.y +
        Math.random() *
        b.height;


      ctx.fillStyle =
        "rgba(255,255,255,0.035)";


      ctx.fillRect(
        x,
        y,
        2,
        2
      );

    }


    /*
     * Texto desenhado como pista.
     */

    ctx.fillStyle =
      "#b9b7a9";


    ctx.font =
      "18px monospace";


    ctx.fillText(
      "OBSERVE.",
      b.x + 35,
      b.y + 55
    );


    ctx.fillStyle =
      "#87877d";


    ctx.fillText(
      "2  4  6  ?",
      b.x + 40,
      b.y + 100
    );


    ctx.fillStyle =
      "#676961";


    ctx.fillRect(
      b.x + 40,
      b.y + 125,
      180,
      3
    );


    ctx.fillRect(
      b.x + 40,
      b.y + 145,
      120,
      3
    );


    /*
     * Giz.
     */

    ctx.fillStyle =
      "#d4d0bf";


    ctx.fillRect(
      b.x + 470,
      b.y + 160,
      38,
      7
    );


    ctx.fillStyle =
      "#8c897c";


    ctx.fillRect(
      b.x + 470,
      b.y + 167,
      38,
      3
    );

  }


  /* =========================================================
     POSTERS
     ========================================================= */

  renderPosters(ctx) {

    this.renderPoster(
      ctx,
      this.posterLeft,
      false
    );


    this.renderPoster(
      ctx,
      this.posterRight,
      true
    );

  }


  renderPoster(
    ctx,
    poster,
    second
  ) {

    const x =
      poster.x;


    const y =
      poster.y;


    const w =
      poster.width;


    const h =
      poster.height;


    /*
     * Sombra.
     */

    ctx.fillStyle =
      "rgba(0,0,0,0.28)";


    ctx.fillRect(
      x + 7,
      y + 9,
      w,
      h
    );


    /*
     * Papel.
     */

    ctx.fillStyle =
      second
        ? "#b9c0ae"
        : "#c4bda7";


    ctx.fillRect(
      x,
      y,
      w,
      h
    );


    /*
     * Cabeçalho.
     */

    ctx.fillStyle =
      second
        ? "#596d5b"
        : "#6b6656";


    ctx.fillRect(
      x,
      y,
      w,
      25
    );


    /*
     * Texto.
     */

    ctx.fillStyle =
      "#33352f";


    ctx.font =
      "bold 12px monospace";


    ctx.fillText(
      second
        ? "ATENÇÃO"
        : "ESCOLA",

      x + 12,
      y + 17
    );


    ctx.fillStyle =
      "#626257";


    for (
      let i = 0;
      i < 4;
      i++
    ) {

      ctx.fillRect(
        x + 12,
        y + 42 +
        i * 13,

        w - 24 -
        i * 15,

        3
      );

    }


    /*
     * Alfinete.
     */

    ctx.fillStyle =
      "#8b3535";


    ctx.fillRect(
      x +
      w / 2 -
      3,

      y - 5,

      6,

      6
    );

  }


  /* =========================================================
     FLAG
     ========================================================= */

  renderFlag(ctx) {

    const f =
      this.flag;


    ctx.fillStyle =
      this.colors.woodDark;


    ctx.fillRect(
      f.x,
      f.y,
      7,
      f.height
    );


    ctx.fillStyle =
      "#596b58";


    ctx.beginPath();


    ctx.moveTo(
      f.x + 7,
      f.y + 12
    );


    ctx.lineTo(
      f.x + f.width,
      f.y + 35
    );


    ctx.lineTo(
      f.x + 7,
      f.y + 65
    );


    ctx.closePath();


    ctx.fill();


    /*
     * Símbolo central.
     */

    ctx.fillStyle =
      "#d5cfb4";


    ctx.fillRect(
      f.x + 35,
      f.y + 33,
      22,
      22
    );


    ctx.fillStyle =
      "#596b58";


    ctx.fillRect(
      f.x + 42,
      f.y + 40,
      8,
      8
    );

  }


  /* =========================================================
     CLOCK
     ========================================================= */

  renderClock(ctx) {

    const c =
      this.clock;


    const cx =
      c.x +
      c.width / 2;


    const cy =
      c.y +
      c.height / 2;


    const radius =
      c.width / 2;


    /*
     * Sombra.
     */

    ctx.fillStyle =
      "rgba(0,0,0,0.35)";


    ctx.beginPath();


    ctx.arc(
      cx + 7,
      cy + 8,
      radius + 4,
      0,
      Math.PI * 2
    );


    ctx.fill();


    /*
     * Corpo.
     */

    ctx.fillStyle =
      "#d0c8af";


    ctx.beginPath();


    ctx.arc(
      cx,
      cy,
      radius,
      0,
      Math.PI * 2
    );


    ctx.fill();


    /*
     * Borda.
     */

    ctx.strokeStyle =
      "#6a665a";


    ctx.lineWidth =
      8;


    ctx.stroke();


    /*
     * Interior.
     */

    ctx.fillStyle =
      "#202322";


    ctx.beginPath();


    ctx.arc(
      cx,
      cy,
      radius - 12,
      0,
      Math.PI * 2
    );


    ctx.fill();


    /*
     * Marcas.
     */

    ctx.fillStyle =
      "#c7c2ad";


    for (
      let i = 0;
      i < 12;
      i++
    ) {

      const angle =
        i *
        Math.PI /
        6;


      const inner =
        radius - 25;


      const outer =
        radius - 17;


      const x1 =
        cx +
        Math.cos(angle) *
        inner;


      const y1 =
        cy +
        Math.sin(angle) *
        inner;


      const x2 =
        cx +
        Math.cos(angle) *
        outer;


      const y2 =
        cy +
        Math.sin(angle) *
        outer;


      ctx.strokeStyle =
        "#c7c2ad";


      ctx.lineWidth =
        i % 3 === 0
          ? 3
          : 1;


      ctx.beginPath();


      ctx.moveTo(
        x1,
        y1
      );


      ctx.lineTo(
        x2,
        y2
      );


      ctx.stroke();

    }


    /*
     * Ponteiros.
     */

    ctx.strokeStyle =
      "#d8d3be";


    ctx.lineWidth =
      4;


    ctx.beginPath();


    ctx.moveTo(
      cx,
      cy
    );


    ctx.lineTo(
      cx,
      cy - 25
    );


    ctx.stroke();


    ctx.lineWidth =
      3;


    ctx.beginPath();


    ctx.moveTo(
      cx,
      cy
    );


    ctx.lineTo(
      cx + 27,
      cy
    );


    ctx.stroke();


    /*
     * Centro.
     */

    ctx.fillStyle =
      "#a84e4e";


    ctx.beginPath();


    ctx.arc(
      cx,
      cy,
      5,
      0,
      Math.PI * 2
    );


    ctx.fill();

  }


  /* =========================================================
     CABINET
     ========================================================= */

  renderCabinet(ctx) {

    const c =
      this.cabinet;


    /*
     * Sombra.
     */

    ctx.fillStyle =
      "rgba(0,0,0,0.35)";


    ctx.fillRect(
      c.x + 10,
      c.y + 13,
      c.width,
      c.height
    );


    /*
     * Corpo.
     */

    ctx.fillStyle =
      this.colors.metalDark;


    ctx.fillRect(
      c.x,
      c.y,
      c.width,
      c.height
    );


    /*
     * Parte superior.
     */

    ctx.fillStyle =
      this.colors.metal;


    ctx.fillRect(
      c.x,
      c.y,
      c.width,
      15
    );


    /*
     * Portas.
     */

    const doorWidth =
      c.width / 2 -
      5;


    for (
      let i = 0;
      i < 2;
      i++
    ) {

      const x =
        c.x +
        i *
        (doorWidth + 10);


      ctx.fillStyle =
        "#484b4c";


      ctx.fillRect(
        x,
        c.y + 20,
        doorWidth,
        c.height - 30
      );


      ctx.strokeStyle =
        "#252727";


      ctx.lineWidth =
        3;


      ctx.strokeRect(
        x,
        c.y + 20,
        doorWidth,
        c.height - 30
      );


      /*
       * Maçaneta.
       */

      ctx.fillStyle =
        "#9b9075";


      ctx.fillRect(
        x +
        doorWidth -
        20,

        c.y +
        c.height / 2,

        7,

        7
      );

    }


    /*
     * Pés.
     */

    ctx.fillStyle =
      "#242526";


    ctx.fillRect(
      c.x + 15,
      c.y + c.height,
      15,
      10
    );


    ctx.fillRect(
      c.x + c.width - 30,
      c.y + c.height,
      15,
      10
    );

  }


  /* =========================================================
     BOOKSHELF
     ========================================================= */

  renderBookshelf(ctx) {

    const b =
      this.bookshelf;


    /*
     * Sombra.
     */

    ctx.fillStyle =
      "rgba(0,0,0,0.4)";


    ctx.fillRect(
      b.x + 10,
      b.y + 12,
      b.width,
      b.height
    );


    /*
     * Estrutura.
     */

    ctx.fillStyle =
      this.colors.woodDark;


    ctx.fillRect(
      b.x,
      b.y,
      b.width,
      b.height
    );


    /*
     * Interior.
     */

    ctx.fillStyle =
      "#35281d";


    ctx.fillRect(
      b.x + 12,
      b.y + 12,
      b.width - 24,
      b.height - 24
    );


    const shelfHeight =
      54;


    for (
      let row = 0;
      row < 4;
      row++
    ) {

      const y =
        b.y +
        20 +
        row *
        shelfHeight;


      ctx.fillStyle =
        this.colors.wood;


      ctx.fillRect(
        b.x + 8,
        y + 42,
        b.width - 16,
        9
      );


      /*
       * Livros.
       */

      const bookColors = [

        "#6d4540",

        "#53634d",

        "#786b4e",

        "#4e5964",

        "#73543e"

      ];


      let offset =
        20;


      for (
        let i = 0;
        i < 7;
        i++
      ) {

        const bookWidth =
          15 +
          Math.floor(
            Math.random() * 9
          );


        ctx.fillStyle =
          bookColors[
            (
              i +
              row
            ) %
            bookColors.length
          ];


        ctx.fillRect(
          b.x +
          offset,

          y,

          bookWidth,

          42
        );


        ctx.fillStyle =
          "rgba(255,255,255,0.1)";


        ctx.fillRect(
          b.x +
          offset +
          3,

          y + 5,

          2,

          32
        );


        offset +=
          bookWidth +
          4;


        if (
          offset >
          b.width - 25
        ) {

          break;

        }

      }

    }

  }


  /* =========================================================
     TEACHER DESK
     ========================================================= */

  renderTeacherDesk(ctx) {

    const d =
      this.teacherDesk;


    /*
     * Sombra.
     */

    ctx.fillStyle =
      "rgba(0,0,0,0.42)";


    ctx.fillRect(
      d.x + 12,
      d.y + 15,
      d.width,
      d.height
    );


    /*
     * Corpo.
     */

    ctx.fillStyle =
      this.colors.woodDark;


    ctx.fillRect(
      d.x,
      d.y,
      d.width,
      d.height
    );


    /*
     * Tampo.
     */

    ctx.fillStyle =
      this.colors.woodLight;


    ctx.fillRect(
      d.x - 7,
      d.y - 8,
      d.width + 14,
      18
    );


    /*
     * Frente.

    */

    ctx.fillStyle =
      this.colors.wood;


    ctx.fillRect(
      d.x + 15,
      d.y + 25,
      d.width - 30,
      65
    );


    /*
     * Gavetas.

    */

    ctx.strokeStyle =
      this.colors.woodDark;


    ctx.lineWidth =
      3;


    for (
      let i = 0;
      i < 3;
      i++
    ) {

      ctx.strokeRect(
        d.x + 35 +
        i * 82,

        d.y + 35,

        65,

        38
      );

    }


    /*
     * Puxadores.
     */

    ctx.fillStyle =
      "#a28b64";


    for (
      let i = 0;
      i < 3;
      i++
    ) {

      ctx.fillRect(
        d.x + 64 +
        i * 82,

        d.y + 52,

        9,

        4
      );

    }

  }


  /* =========================================================
     COMPUTER
     ========================================================= */

  renderComputer(ctx) {

    const c =
      this.computer;


    /*
     * Monitor.
     */

    ctx.fillStyle =
      "#242628";


    ctx.fillRect(
      c.x,
      c.y,
      c.width,
      c.height
    );


    ctx.strokeStyle =
      "#111314";


    ctx.lineWidth =
      4;


    ctx.strokeRect(
      c.x,
      c.y,
      c.width,
      c.height
    );


    /*
     * Tela.
     */

    ctx.fillStyle =
      this.doorOpen
        ? "#39594a"
        : "#14221f";


    ctx.fillRect(
      c.x + 8,
      c.y + 8,
      c.width - 16,
      c.height - 22
    );


    /*
     * Texto da tela.

    */

    ctx.fillStyle =
      this.doorOpen
        ? "#9ed0a7"
        : "#768b82";


    ctx.font =
      "8px monospace";


    ctx.fillText(
      this.doorOpen
        ? "ACCESS OK"
        : "LOCKED",

      c.x + 14,
      c.y + 30
    );


    /*
     * Luz.

    */

    ctx.fillStyle =
      this.doorOpen
        ? "#78b98a"
        : "#9b4848";


    ctx.fillRect(
      c.x + 15,
      c.y + 47,
      7,
      7
    );


    /*
     * Pé.

    */

    ctx.fillStyle =
      "#333638";


    ctx.fillRect(
      c.x + 38,
      c.y + c.height,
      14,
      12
    );


    ctx.fillRect(
      c.x + 25,
      c.y + c.height + 10,
      40,
      7
    );

  }


  /* =========================================================
     DESKS
     ========================================================= */

  renderDesks(ctx) {

    for (
      const desk of
      this.desks
    ) {

      this.renderDesk(
        ctx,
        desk
      );

    }

  }


  renderDesk(
    ctx,
    desk
  ) {

    const x =
      desk.x;


    const y =
      desk.y;


    const w =
      desk.width;


    const h =
      desk.height;


    /*
     * Sombra.
     */

    ctx.fillStyle =
      "rgba(0,0,0,0.38)";


    ctx.fillRect(
      x + 9,
      y + 12,
      w,
      h
    );


    /*
     * Tampo.
     */

    ctx.fillStyle =
      this.colors.wood;


    ctx.fillRect(
      x,
      y,
      w,
      55
    );


    /*
     * Borda superior.

    */

    ctx.fillStyle =
      this.colors.woodLight;


    ctx.fillRect(
      x,
      y,
      w,
      7
    );


    /*
     * Parte frontal.

    */

    ctx.fillStyle =
      this.colors.woodDark;


    ctx.fillRect(
      x + 12,
      y + 55,
      w - 24,
      12
    );


    /*
     * Pernas.

    */

    ctx.fillStyle =
      this.colors.metalDark;


    ctx.fillRect(
      x + 15,
      y + 67,
      10,
      38
    );


    ctx.fillRect(
      x + w - 25,
      y + 67,
      10,
      38
    );


    /*
     * Caderno.

    */

    ctx.fillStyle =
      this.colors.paper;


    ctx.fillRect(
      x + 25,
      y + 15,
      50,
      28
    );


    ctx.fillStyle =
      "#7c7768";


    ctx.fillRect(
      x + 32,
      y + 22,
      35,
      2
    );


    ctx.fillRect(
      x + 32,
      y + 29,
      27,
      2
    );


    ctx.fillRect(
      x + 32,
      y + 36,
      32,
      2
    );


    /*
     * Lápis.

    */

    ctx.fillStyle =
      "#a28a5b";


    ctx.fillRect(
      x + 90,
      y + 32,
      42,
      5
    );


    ctx.fillStyle =
      "#3d3024";


    ctx.fillRect(
      x + 128,
      y + 32,
      5,
      5
    );

  }


  /* =========================================================
     PLANT
     ========================================================= */

  renderPlant(ctx) {

    const p =
      this.plant;


    /*
     * Sombra.

    */

    ctx.fillStyle =
      "rgba(0,0,0,0.35)";


    ctx.fillRect(
      p.x - 5,
      p.y + p.height - 10,
      p.width + 10,
      15
    );


    /*
     * Vaso.

    */

    ctx.fillStyle =
      "#8a5942";


    ctx.fillRect(
      p.x + 15,
      p.y + 80,
      40,
      60
    );


    ctx.fillStyle =
      "#674130";


    ctx.fillRect(
      p.x + 10,
      p.y + 78,
      50,
      12
    );


    /*
     * Folhas.

    */

    const leaves = [

      [25, 20, 35],

      [40, 5, 28],

      [55, 30, 35],

      [20, 50, 30],

      [45, 45, 32]

    ];


    for (
      const leaf of leaves
    ) {

      const [
        lx,
        ly,
        size
      ] = leaf;


      ctx.fillStyle =
        "#486447";


      ctx.beginPath();


      ctx.arc(
        p.x + lx,
        p.y + ly,
        size / 2,
        0,
        Math.PI * 2
      );


      ctx.fill();


      ctx.fillStyle =
        "#314a31";


      ctx.fillRect(
        p.x + lx - 2,
        p.y + ly,
        4,
        size / 2
      );

    }

  }


  /* =========================================================
     TRASH
     ========================================================= */

  renderTrash(ctx) {

    const t =
      this.trash;


    /*
     * Sombra.

    */

    ctx.fillStyle =
      "rgba(0,0,0,0.3)";


    ctx.fillRect(
      t.x + 5,
      t.y + t.height - 3,
      t.width,
      10
    );


    /*
     * Corpo.

    */

    ctx.fillStyle =
      "#565958";


    ctx.fillRect(
      t.x + 7,
      t.y + 12,
      t.width - 14,
      t.height - 12
    );


    /*
     * Tampa.

    */

    ctx.fillStyle =
      "#737674";


    ctx.fillRect(
      t.x,
      t.y,
      t.width,
      15
    );


    /*
     * Faixa.

    */

    ctx.fillStyle =
      "#303231";


    ctx.fillRect(
      t.x + 12,
      t.y + 30,
      t.width - 24,
      7
    );

  }


  /* =========================================================
     DOOR
     ========================================================= */

  renderDoor(ctx) {

    const d =
      this.exitDoor;


    /*
     * A porta fica embutida na parede esquerda.
     */

    const x =
      d.x;


    const y =
      d.y;


    const w =
      d.width;


    const h =
      d.height;


    /*
     * Sombra da abertura.

    */

    ctx.fillStyle =
      "#151515";


    ctx.fillRect(
      x,
      y,
      w,
      h
    );


    /*
     * Porta fechada.

    */

    if (
      !this.doorOpen
    ) {

      ctx.fillStyle =
        "#4d3928";


      ctx.fillRect(
        x + 5,
        y + 5,
        w - 10,
        h - 10
      );


      ctx.fillStyle =
        "#715238";


      ctx.fillRect(
        x + 9,
        y + 9,
        7,
        h - 18
      );


      /*
       * Maçaneta.

      */

      ctx.fillStyle =
        "#c2a968";


      ctx.fillRect(
        x + 28,
        y + h / 2,
        7,
        7
      );


      /*
       * Placa.

      */

      ctx.fillStyle =
        "#7d3939";


      ctx.fillRect(
        x + 10,
        y + 35,
        w - 20,
        22
      );


      ctx.fillStyle =
        "#d5c7a7";


      ctx.font =
        "7px monospace";


      ctx.fillText(
        "SAÍDA",
        x + 12,
        y + 49
      );


      return;

    }


    /*
     * Porta aberta.
     */

    ctx.fillStyle =
      "#0b0d0d";


    ctx.fillRect(
      x,
      y,
      w,
      h
    );


    /*
     * Luz vindo do corredor.

    */

    const gradient =
      ctx.createLinearGradient(
        x + w,
        y,
        x,
        y
      );


    gradient.addColorStop(
      0,
      "rgba(189,166,111,0.45)"
    );


    gradient.addColorStop(
      1,
      "rgba(0,0,0,0)"
    );


    ctx.fillStyle =
      gradient;


    ctx.fillRect(
      x - 100,
      y,
      100,
      h
    );


    /*
     * Folha da porta deslocada.

    */

    ctx.fillStyle =
      "#4d3928";


    ctx.fillRect(
      x - 75,
      y + 8,
      70,
      h - 16
    );


    ctx.fillStyle =
      "#715238";


    ctx.fillRect(
      x - 65,
      y + 15,
      7,
      h - 30
    );

  }


  /* =========================================================
     DECORATIVE DETAILS
     ========================================================= */

  renderDecorativeDetails(
    ctx
  ) {

    /*
     * Rodapés.

    */

    const r =
      this.room;


    ctx.fillStyle =
      "#171817";


    ctx.fillRect(
      r.x +
      this.wallThickness,

      r.y +
      this.wallThickness,

      r.width -
      this.wallThickness * 2,

      6
    );


    /*
     * Pequenos detalhes nas paredes.

    */

    ctx.fillStyle =
      "rgba(255,255,255,0.025)";


    for (
      let i = 0;
      i < 35;
      i++
    ) {

      const x =
        r.x +
        Math.random() *
        r.width;


      const y =
        r.y +
        Math.random() *
        r.height;


      ctx.fillRect(
        Math.floor(x),
        Math.floor(y),
        2,
        2
      );

    }


    /*
     * Fios das lâmpadas.

    */

    ctx.strokeStyle =
      "#1a1b1b";


    ctx.lineWidth =
      3;


    for (
      const light of
      this.lights
    ) {

      ctx.beginPath();


      ctx.moveTo(
        light.x,
        r.y
      );


      ctx.lineTo(
        light.x,
        light.y
      );


      ctx.stroke();


      /*
       * Lâmpada.

      */

      ctx.fillStyle =
        "#d0c69d";


      ctx.fillRect(
        light.x - 20,
        light.y,
        40,
        10
      );


      ctx.fillStyle =
        "#6e684f";


      ctx.fillRect(
        light.x - 14,
        light.y + 10,
        28,
        4
      );

    }

  }


  /* =========================================================
     WORLD LIGHTS
     ========================================================= */

  renderWorldLights(
    ctx,
    game
  ) {

    if (
      !game
    ) {

      return;

    }


    /*
     * Pequenas luzes das lâmpadas.
     *
     * A iluminação principal é feita no Game,
     * seguindo o personagem.
     */

    for (
      const light of
      this.lights
    ) {

      const radius =
        light.radius;


      const gradient =
        ctx.createRadialGradient(
          light.x,
          light.y,
          5,

          light.x,
          light.y,
          radius
        );


      gradient.addColorStop(
        0,
        `rgba(245,220,157,${
          light.intensity
        })`
      );


      gradient.addColorStop(
        0.45,
        `rgba(210,185,120,${
          light.intensity * 0.3
        })`
      );


      gradient.addColorStop(
        1,
        "rgba(0,0,0,0)"
      );


      ctx.save();


      ctx.globalCompositeOperation =
        "lighter";


      ctx.fillStyle =
        gradient;


      ctx.beginPath();


      ctx.arc(
        light.x,
        light.y,
        radius,
        0,
        Math.PI * 2
      );


      ctx.fill();


      ctx.restore();

    }

  }


  /* =========================================================
     UTILITY
     ========================================================= */

  isInsideRoom(
    x,
    y
  ) {

    return (

      x >=
      this.room.x +

      this.wallThickness &&

      x <=
      this.room.x +
      this.room.width -
      this.wallThickness &&

      y >=
      this.room.y +
      this.wallThickness &&

      y <=
      this.room.y +
      this.room.height -
      this.wallThickness

    );

  }

}