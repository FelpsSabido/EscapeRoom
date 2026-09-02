export class World {
  constructor(width = 1800, height = 1000) {
    this.width = width;
    this.height = height;

    this.game = null;

    this.floorColor = "#17191d";
    this.wallColor = "#25282d";
    this.wallDark = "#111318";
    this.lineColor = "#343941";

    this.exitDoor = {
      id: "exit",
      x: 70,
      y: 365,
      width: 120,
      height: 220,
      open: false
    };

    this.objects = [];
    this.colliders = [];

    this.build();
  }

  /* =========================================================
     GAME
  ========================================================== */

  setGame(game) {
    this.game = game;
  }

  /* =========================================================
     CONSTRUÇÃO DO MAPA
  ========================================================== */

  build() {
    this.objects = [];
    this.colliders = [];

    /*
      QUADRO
    */

    this.addObject({
      id: "board",
      type: "board",
      x: 525,
      y: 90,
      width: 570,
      height: 175,
      label: "Quadro",
      description:
        "Um grande quadro está preso à parede."
    });

    /*
      RELÓGIO
    */

    this.addObject({
      id: "clock",
      type: "clock",
      x: 1370,
      y: 105,
      width: 90,
      height: 90,
      label: "Relógio",
      description:
        "Um relógio antigo está preso à parede."
    });

    /*
      JANELAS
    */

    this.addObject({
      id: "window_1",
      type: "window",
      x: 240,
      y: 82,
      width: 205,
      height: 145,
      label: "Janela",
      description:
        "Uma janela grande ocupa parte da parede."
    });

    this.addObject({
      id: "window_2",
      type: "window",
      x: 1190,
      y: 82,
      width: 205,
      height: 145,
      label: "Janela",
      description:
        "Uma segunda janela deixa entrar uma luz fraca."
    });

    /*
      ARMÁRIO
    */

    this.addObject({
      id: "cabinet",
      type: "cabinet",
      x: 1450,
      y: 350,
      width: 170,
      height: 270,
      label: "Armário",
      description:
        "Um armário escolar de madeira."
    });

    /*
      ESTANTE
    */

    this.addObject({
      id: "bookshelf",
      type: "bookshelf",
      x: 210,
      y: 325,
      width: 185,
      height: 300,
      label: "Estante",
      description:
        "Uma estante cheia de livros."
    });

    /*
      MESA DO PROFESSOR
    */

    this.addObject({
      id: "teacherDesk",
      type: "teacherDesk",
      x: 1225,
      y: 675,
      width: 310,
      height: 115,
      label: "Mesa do professor",
      description:
        "Uma grande mesa de professor."
    });

    /*
      COMPUTADOR
    */

    this.addObject({
      id: "computer",
      type: "computer",
      x: 1330,
      y: 625,
      width: 95,
      height: 85,
      label: "Computador",
      description:
        "Um computador permanece ligado sobre a mesa."
    });

    /*
      CARTAZES
    */

    this.addObject({
      id: "poster_left",
      type: "poster",
      x: 405,
      y: 105,
      width: 80,
      height: 115,
      label: "Cartaz",
      description:
        "Um cartaz antigo está preso à parede."
    });

    this.addObject({
      id: "poster_right",
      type: "poster",
      x: 1115,
      y: 105,
      width: 55,
      height: 110,
      label: "Cartaz",
      description:
        "Um pequeno cartaz está preso à parede."
    });

    /*
      PLANTA
    */

    this.addObject({
      id: "plant",
      type: "plant",
      x: 1540,
      y: 210,
      width: 85,
      height: 110,
      label: "Planta",
      description:
        "Uma planta está em um vaso no canto da sala."
    });

    /*
      LIXEIRA
    */

    this.addObject({
      id: "trash",
      type: "trash",
      x: 410,
      y: 650,
      width: 65,
      height: 85,
      label: "Lixeira",
      description:
        "Uma lixeira metálica."
    });

    /*
      BANDEIRA / ELEMENTO DECORATIVO
    */

    this.addObject({
      id: "flag",
      type: "flag",
      x: 1650,
      y: 120,
      width: 80,
      height: 110,
      label: "Painel",
      description:
        "Um painel decorativo da sala."
    });

    /*
      MESAS DOS ALUNOS
    */

    const desks = [
      {
        id: "desk_1",
        x: 500,
        y: 355
      },
      {
        id: "desk_2",
        x: 750,
        y: 355
      },
      {
        id: "desk_3",
        x: 1000,
        y: 355
      },
      {
        id: "desk_4",
        x: 500,
        y: 680
      },
      {
        id: "desk_5",
        x: 750,
        y: 680
      },
      {
        id: "desk_6",
        x: 1000,
        y: 680
      }
    ];

    for (
      const desk of desks
    ) {
      this.addObject({
        id: desk.id,
        type: "desk",
        x: desk.x,
        y: desk.y,
        width: 185,
        height: 120,
        label: "Mesa escolar",
        description:
          "Uma mesa escolar de madeira."
      });
    }

    /*
      CONSTRUÇÃO DAS COLISÕES
    */

    this.buildColliders();
  }

  /* =========================================================
     OBJETOS
  ========================================================== */

  addObject(object) {
    this.objects.push(object);
  }

  /* =========================================================
     COLISORES
  ========================================================== */

  buildColliders() {
    this.colliders = [];

    /*
      PAREDES EXTERNAS
    */

    this.colliders.push({
      x: 0,
      y: 0,
      width: this.width,
      height: 55
    });

    this.colliders.push({
      x: 0,
      y: this.height - 55,
      width: this.width,
      height: 55
    });

    this.colliders.push({
      x: 0,
      y: 0,
      width: 55,
      height: this.height
    });

    /*
      Parede direita.
      Existe uma abertura correspondente
      à porta de saída.
    */

    this.colliders.push({
      x: this.width - 55,
      y: 0,
      width: 55,
      height: this.height
    });

    /*
      OBJETOS BLOQUEADORES
    */

    for (
      const object of this.objects
    ) {
      if (
        object.type === "window" ||
        object.type === "board" ||
        object.type === "clock" ||
        object.type === "poster" ||
        object.type === "flag" ||
        object.type === "plant" ||
        object.type === "trash"
      ) {
        continue;
      }

      this.colliders.push({
        x: object.x,
        y: object.y,
        width: object.width,
        height: object.height
      });
    }

    /*
      PORTA FECHADA
    */

    if (
      !this.exitDoor.open
    ) {
      this.colliders.push({
        x: this.exitDoor.x,
        y: this.exitDoor.y,
        width: this.exitDoor.width,
        height: this.exitDoor.height
      });
    }
  }

  /* =========================================================
     RESET
  ========================================================== */

  reset() {
    this.exitDoor.open = false;

    this.buildColliders();
  }

  setDoorOpen(open) {
    this.exitDoor.open =
      Boolean(open);

    this.buildColliders();
  }

  /* =========================================================
     SPAWN
  ========================================================== */

  getSpawnPoint() {
    /*
      IMPORTANTE:
      Este ponto fica em uma área livre da sala,
      longe das mesas.

      Não alterar para dentro da área
      de colisão da desk_6.
    */

    return {
      x: 1160,
      y: 600
    };
  }

  /* =========================================================
     COLISÃO DO JOGADOR
  ========================================================== */

  canPlayerMoveTo(
    x,
    y,
    width = 20,
    height = 18
  ) {
    const halfWidth =
      width / 2;

    const halfHeight =
      height / 2;

    const playerRect = {
      x:
        x - halfWidth,

      y:
        y - halfHeight,

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
        return false;
      }
    }

    return true;
  }

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
     INTERAÇÕES
  ========================================================== */

  getNearestInteraction(
    player
  ) {
    if (!player) {
      return null;
    }

    let nearest = null;

    let nearestDistance =
      Infinity;

    const interactionRadius =
      105;

    for (
      const object of
      this.objects
    ) {
      if (
        !object.label
      ) {
        continue;
      }

      const centerX =
        object.x +
        object.width / 2;

      const centerY =
        object.y +
        object.height / 2;

      const distance =
        Math.hypot(
          player.x -
            centerX,
          player.y -
            centerY
        );

      if (
        distance <
          interactionRadius &&
        distance <
          nearestDistance
      ) {
        nearest =
          object;

        nearestDistance =
          distance;
      }
    }

    /*
      PORTA
    */

    const doorCenterX =
      this.exitDoor.x +
      this.exitDoor.width / 2;

    const doorCenterY =
      this.exitDoor.y +
      this.exitDoor.height / 2;

    const doorDistance =
      Math.hypot(
        player.x -
          doorCenterX,
        player.y -
          doorCenterY
      );

    if (
      doorDistance <
        interactionRadius &&
      doorDistance <
        nearestDistance
    ) {
      nearest = {
        ...this.exitDoor,
        label: "Porta de saída",
        description:
          "Uma porta pesada está diante de você."
      };
    }

    return nearest;
  }

  /* =========================================================
     RENDERIZAÇÃO PRINCIPAL
  ========================================================== */

  render(
    ctx,
    game
  ) {
    if (!ctx) {
      return;
    }

    const camera =
      game?.camera || {
        x: 0,
        y: 0
      };

    ctx.save();

    ctx.translate(
      -Math.round(
        camera.x
      ),
      -Math.round(
        camera.y
      )
    );

    this.renderRoom(
      ctx
    );

    this.renderWindows(
      ctx
    );

    this.renderBoard(
      ctx
    );

    this.renderClock(
      ctx
    );

    this.renderDoor(
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

    this.renderPosters(
      ctx
    );

    this.renderPlant(
      ctx
    );

    this.renderTrash(
      ctx
    );

    this.renderFlag(
      ctx
    );

    this.renderInteractionMarkers(
      ctx,
      game
    );

    ctx.restore();

    /*
      Iluminação é aplicada em coordenadas
      de tela, portanto vem depois da câmera.
    */

    this.renderLighting(
      ctx,
      game?.player,
      camera,
      game?.time || 0
    );
  }

  /* =========================================================
     SALA
  ========================================================== */

  renderRoom(ctx) {
    /*
      Piso
    */

    ctx.fillStyle =
      this.floorColor;

    ctx.fillRect(
      0,
      0,
      this.width,
      this.height
    );

    /*
      Parede superior
    */

    ctx.fillStyle =
      this.wallColor;

    ctx.fillRect(
      0,
      0,
      this.width,
      55
    );

    /*
      Parede inferior
    */

    ctx.fillRect(
      0,
      this.height - 55,
      this.width,
      55
    );

    /*
      Parede esquerda
    */

    ctx.fillRect(
      0,
      0,
      55,
      this.height
    );

    /*
      Parede direita
    */

    ctx.fillRect(
      this.width - 55,
      0,
      55,
      this.height
    );

    /*
      Faixa escura nas paredes
    */

    ctx.fillStyle =
      this.wallDark;

    ctx.fillRect(
      0,
      50,
      this.width,
      7
    );

    ctx.fillRect(
      0,
      this.height - 57,
      this.width,
      7
    );

    /*
      Linhas do piso
    */

    ctx.strokeStyle =
      this.lineColor;

    ctx.lineWidth = 1;

    const tileSize = 64;

    for (
      let x = 55;
      x <
        this.width - 55;
      x += tileSize
    ) {
      ctx.beginPath();

      ctx.moveTo(
        x,
        55
      );

      ctx.lineTo(
        x,
        this.height - 55
      );

      ctx.stroke();
    }

    for (
      let y = 55;
      y <
        this.height - 55;
      y += tileSize
    ) {
      ctx.beginPath();

      ctx.moveTo(
        55,
        y
      );

      ctx.lineTo(
        this.width - 55,
        y
      );

      ctx.stroke();
    }

    /*
      Pequenos detalhes no piso
    */

    ctx.fillStyle =
      "rgba(255,255,255,0.025)";

    for (
      let x = 80;
      x < this.width - 80;
      x += 128
    ) {
      for (
        let y = 80;
        y < this.height - 80;
        y += 128
      ) {
        ctx.fillRect(
          x,
          y,
          2,
          2
        );
      }
    }
  }

  /* =========================================================
     JANELAS
  ========================================================== */

  renderWindows(ctx) {
    const windows =
      this.objects.filter(
        (object) =>
          object.type ===
          "window"
      );

    for (
      const windowObject of
      windows
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
        Moldura
      */

      ctx.fillStyle =
        "#0d1014";

      ctx.fillRect(
        x - 7,
        y - 7,
        w + 14,
        h + 14
      );

      /*
        Vidro
      */

      ctx.fillStyle =
        "#29343b";

      ctx.fillRect(
        x,
        y,
        w,
        h
      );

      /*
        Reflexo
      */

      ctx.fillStyle =
        "rgba(210,220,220,0.06)";

      ctx.fillRect(
        x + 12,
        y + 12,
        w * 0.42,
        h - 24
      );

      /*
        Divisórias
      */

      ctx.fillStyle =
        "#11151a";

      ctx.fillRect(
        x + w / 2 - 4,
        y,
        8,
        h
      );

      ctx.fillRect(
        x,
        y + h / 2 - 4,
        w,
        8
      );

      /*
        Luz exterior fraca
      */

      const glow =
        ctx.createLinearGradient(
          x,
          y,
          x,
          y + h
        );

      glow.addColorStop(
        0,
        "rgba(190,205,200,0.08)"
      );

      glow.addColorStop(
        1,
        "rgba(190,205,200,0)"
      );

      ctx.fillStyle =
        glow;

      ctx.fillRect(
        x,
        y,
        w,
        h
      );
    }
  }

  /* =========================================================
     QUADRO
  ========================================================== */

  renderBoard(ctx) {
    const board =
      this.objects.find(
        (object) =>
          object.id ===
          "board"
      );

    if (!board) {
      return;
    }

    const x = board.x;
    const y = board.y;
    const w = board.width;
    const h = board.height;

    /*
      Sombra
    */

    ctx.fillStyle =
      "rgba(0,0,0,0.42)";

    ctx.fillRect(
      x + 12,
      y + 14,
      w,
      h
    );

    /*
      Moldura
    */

    ctx.fillStyle =
      "#533e2c";

    ctx.fillRect(
      x - 8,
      y - 8,
      w + 16,
      h + 16
    );

    /*
      Quadro
    */

    ctx.fillStyle =
      "#17251f";

    ctx.fillRect(
      x,
      y,
      w,
      h
    );

    /*
      Textura
    */

    ctx.fillStyle =
      "rgba(255,255,255,0.025)";

    for (
      let i = 0;
      i < 35;
      i++
    ) {
      const px =
        x +
        Math.random() *
          w;

      const py =
        y +
        Math.random() *
          h;

      ctx.fillRect(
        px,
        py,
        2,
        2
      );
    }

    /*
      Escrita em pixel art simples
    */

    ctx.fillStyle =
      "rgba(224,226,207,0.55)";

    ctx.font =
      "bold 22px monospace";

    ctx.fillText(
      "7 × 8 = ?",
      x + 34,
      y + 58
    );

    ctx.fillStyle =
      "rgba(224,226,207,0.28)";

    ctx.font =
      "17px monospace";

    ctx.fillText(
      "PENSE ANTES DE RESPONDER",
      x + 34,
      y + 94
    );

    ctx.fillStyle =
      "rgba(224,226,207,0.20)";

    ctx.fillText(
      "A resposta pode abrir um caminho.",
      x + 34,
      y + 130
    );

    /*
      Giz
    */

    ctx.fillStyle =
      "#d8d3be";

    ctx.fillRect(
      x + w - 100,
      y + h - 26,
      72,
      6
    );

    ctx.fillStyle =
      "#8e8a7c";

    ctx.fillRect(
      x + w - 28,
      y + h - 26,
      10,
      6
    );
  }

  /* =========================================================
     RELÓGIO
  ========================================================== */

  renderClock(ctx) {
    const clock =
      this.objects.find(
        (object) =>
          object.id ===
          "clock"
      );

    if (!clock) {
      return;
    }

    const cx =
      clock.x +
      clock.width / 2;

    const cy =
      clock.y +
      clock.height / 2;

    const radius =
      clock.width / 2;

    /*
      Sombra
    */

    ctx.fillStyle =
      "rgba(0,0,0,0.4)";

    ctx.beginPath();

    ctx.arc(
      cx + 7,
      cy + 9,
      radius,
      0,
      Math.PI * 2
    );

    ctx.fill();

    /*
      Corpo
    */

    ctx.fillStyle =
      "#5a4635";

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
      Mostrador
    */

    ctx.fillStyle =
      "#d2c8a8";

    ctx.beginPath();

    ctx.arc(
      cx,
      cy,
      radius - 8,
      0,
      Math.PI * 2
    );

    ctx.fill();

    /*
      Ponteiros
    */

    ctx.strokeStyle =
      "#22252a";

    ctx.lineWidth = 5;

    ctx.beginPath();

    ctx.moveTo(
      cx,
      cy
    );

    ctx.lineTo(
      cx - 12,
      cy - 21
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(
      cx,
      cy
    );

    ctx.lineTo(
      cx + 22,
      cy + 7
    );

    ctx.stroke();

    /*
      Centro
    */

    ctx.fillStyle =
      "#25282d";

    ctx.beginPath();

    ctx.arc(
      cx,
      cy,
      6,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  /* =========================================================
     PORTA
  ========================================================== */

  renderDoor(ctx) {
    const door =
      this.exitDoor;

    const x = door.x;
    const y = door.y;
    const w = door.width;
    const h = door.height;

    /*
      Moldura
    */

    ctx.fillStyle =
      "#0d0f12";

    ctx.fillRect(
      x - 12,
      y - 12,
      w + 24,
      h + 24
    );

    if (
      door.open
    ) {
      /*
        Interior escuro
      */

      ctx.fillStyle =
        "#050609";

      ctx.fillRect(
        x,
        y,
        w,
        h
      );

      /*
        Luz vindo de fora
      */

      const light =
        ctx.createLinearGradient(
          x,
          y,
          x + w,
          y
        );

      light.addColorStop(
        0,
        "rgba(220,215,180,0.04)"
      );

      light.addColorStop(
        0.5,
        "rgba(220,215,180,0.16)"
      );

      light.addColorStop(
        1,
        "rgba(220,215,180,0)"
      );

      ctx.fillStyle =
        light;

      ctx.fillRect(
        x,
        y,
        w,
        h
      );

      return;
    }

    /*
      Porta fechada
    */

    ctx.fillStyle =
      "#473528";

    ctx.fillRect(
      x,
      y,
      w,
      h
    );

    /*
      Painéis
    */

    ctx.strokeStyle =
      "#2c211a";

    ctx.lineWidth = 8;

    ctx.strokeRect(
      x + 13,
      y + 14,
      w - 26,
      h - 28
    );

    ctx.strokeRect(
      x + 27,
      y + 28,
      w - 54,
      h - 56
    );

    /*
      Maçaneta
    */

    ctx.fillStyle =
      "#c0a86d";

    ctx.beginPath();

    ctx.arc(
      x + w - 24,
      y + h / 2,
      7,
      0,
      Math.PI * 2
    );

    ctx.fill();

    /*
      Placa
    */

    ctx.fillStyle =
      "#b9a77c";

    ctx.fillRect(
      x + 25,
      y + 20,
      w - 50,
      28
    );

    ctx.fillStyle =
      "#25201a";

    ctx.font =
      "bold 14px monospace";

    ctx.textAlign =
      "center";

    ctx.fillText(
      "SAÍDA",
      x + w / 2,
      y + 40
    );

    ctx.textAlign =
      "left";
  }

  /* =========================================================
     ARMÁRIO
  ========================================================== */

  renderCabinet(ctx) {
    const object =
      this.objects.find(
        (item) =>
          item.id ===
          "cabinet"
      );

    if (!object) {
      return;
    }

    const x = object.x;
    const y = object.y;
    const w = object.width;
    const h = object.height;

    /*
      Sombra
    */

    ctx.fillStyle =
      "rgba(0,0,0,0.42)";

    ctx.fillRect(
      x + 12,
      y + 14,
      w,
      h
    );

    /*
      Estrutura
    */

    ctx.fillStyle =
      "#49382c";

    ctx.fillRect(
      x,
      y,
      w,
      h
    );

    /*
      Portas
    */

    ctx.fillStyle =
      "#5a4434";

    ctx.fillRect(
      x + 12,
      y + 14,
      w / 2 - 17,
      h - 28
    );

    ctx.fillRect(
      x + w / 2 + 5,
      y + 14,
      w / 2 - 17,
      h - 28
    );

    /*
      Divisão
    */

    ctx.fillStyle =
      "#2c211a";

    ctx.fillRect(
      x + w / 2 - 3,
      y + 14,
      6,
      h - 28
    );

    /*
      Puxadores
    */

    ctx.fillStyle =
      "#b29a6c";

    ctx.fillRect(
      x + w / 2 - 20,
      y + h / 2 - 4,
      8,
      8
    );

    ctx.fillRect(
      x + w / 2 + 12,
      y + h / 2 - 4,
      8,
      8
    );
  }

  /* =========================================================
     ESTANTE
  ========================================================== */

  renderBookshelf(ctx) {
    const object =
      this.objects.find(
        (item) =>
          item.id ===
          "bookshelf"
      );

    if (!object) {
      return;
    }

    const x = object.x;
    const y = object.y;
    const w = object.width;
    const h = object.height;

    /*
      Sombra
    */

    ctx.fillStyle =
      "rgba(0,0,0,0.4)";

    ctx.fillRect(
      x + 10,
      y + 12,
      w,
      h
    );

    /*
      Madeira
    */

    ctx.fillStyle =
      "#513d2c";

    ctx.fillRect(
      x,
      y,
      w,
      h
    );

    /*
      Nichos
    */

    const shelfHeight =
      h / 4;

    for (
      let i = 0;
      i < 4;
      i++
    ) {
      const shelfY =
        y +
        i *
          shelfHeight;

      ctx.fillStyle =
        "#241c17";

      ctx.fillRect(
        x + 12,
        shelfY + 10,
        w - 24,
        shelfHeight - 16
      );

      ctx.fillStyle =
        "#604832";

      ctx.fillRect(
        x + 5,
        shelfY +
          shelfHeight -
          9,
        w - 10,
        9
      );

      /*
        Livros
      */

      const bookColors = [
        "#6b4b3d",
        "#41505a",
        "#766244",
        "#594c63",
        "#405447",
        "#704c38"
      ];

      let bookX =
        x + 22;

      const maxX =
        x + w - 22;

      let index = i;

      while (
        bookX <
        maxX - 15
      ) {
        const bookWidth =
          12 +
          (
            index * 7
          ) %
            16;

        ctx.fillStyle =
          bookColors[
            index %
              bookColors.length
          ];

        ctx.fillRect(
          bookX,
          shelfY + 18,
          bookWidth,
          shelfHeight - 34
        );

        bookX +=
          bookWidth + 4;

        index++;
      }
    }
  }

  /* =========================================================
     MESA DO PROFESSOR
  ========================================================== */

  renderTeacherDesk(ctx) {
    const object =
      this.objects.find(
        (item) =>
          item.id ===
          "teacherDesk"
      );

    if (!object) {
      return;
    }

    const x = object.x;
    const y = object.y;
    const w = object.width;
    const h = object.height;

    /*
      Sombra
    */

    ctx.fillStyle =
      "rgba(0,0,0,0.4)";

    ctx.fillRect(
      x + 10,
      y + 12,
      w,
      h
    );

    /*
      Tampo
    */

    ctx.fillStyle =
      "#654a34";

    ctx.fillRect(
      x,
      y,
      w,
      32
    );

    /*
      Frente
    */

    ctx.fillStyle =
      "#4a3527";

    ctx.fillRect(
      x + 12,
      y + 32,
      w - 24,
      h - 32
    );

    /*
      Gavetas
    */

    ctx.fillStyle =
      "#35261e";

    ctx.fillRect(
      x + 30,
      y + 50,
      90,
      35
    );

    ctx.fillRect(
      x + 30,
      y + 88,
      90,
      18
    );

    ctx.fillRect(
      x + w - 120,
      y + 50,
      90,
      35
    );

    /*
      Puxadores
    */

    ctx.fillStyle =
      "#b29a6c";

    ctx.fillRect(
      x + 72,
      y + 65,
      18,
      5
    );

    ctx.fillRect(
      x + w - 78,
      y + 65,
      18,
      5
    );
  }

  /* =========================================================
     COMPUTADOR
  ========================================================== */

  renderComputer(ctx) {
    const object =
      this.objects.find(
        (item) =>
          item.id ===
          "computer"
      );

    if (!object) {
      return;
    }

    const x = object.x;
    const y = object.y;

    /*
      Monitor
    */

    ctx.fillStyle =
      "#171a1e";

    ctx.fillRect(
      x,
      y,
      95,
      58
    );

    ctx.fillStyle =
      "#29343a";

    ctx.fillRect(
      x + 7,
      y + 7,
      81,
      44
    );

    /*
      Tela
    */

    ctx.fillStyle =
      "#687d72";

    ctx.fillRect(
      x + 13,
      y + 13,
      69,
      32
    );

    /*
      Texto da tela
    */

    ctx.fillStyle =
      "rgba(10,20,15,0.75)";

    ctx.font =
      "9px monospace";

    ctx.fillText(
      "ACCESS",
      x + 22,
      y + 27
    );

    ctx.fillText(
      "LOCKED",
      x + 22,
      y + 38
    );

    /*
      Base
    */

    ctx.fillStyle =
      "#171a1e";

    ctx.fillRect(
      x + 35,
      y + 58,
      25,
      18
    );

    ctx.fillRect(
      x + 20,
      y + 76,
      55,
      7
    );
  }

  /* =========================================================
     MESAS DOS ALUNOS
  ========================================================== */

  renderDesks(ctx) {
    const desks =
      this.objects.filter(
        (object) =>
          object.type ===
          "desk"
      );

    for (
      const desk of desks
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
    const x = desk.x;
    const y = desk.y;
    const w = desk.width;
    const h = desk.height;

    /*
      Sombra
    */

    ctx.fillStyle =
      "rgba(0,0,0,0.38)";

    ctx.fillRect(
      x + 10,
      y + 12,
      w,
      h
    );

    /*
      Cadeira
    */

    ctx.fillStyle =
      "#3b4146";

    ctx.fillRect(
      x + 54,
      y + h + 15,
      78,
      35
    );

    ctx.fillRect(
      x + 61,
      y + h + 47,
      8,
      28
    );

    ctx.fillRect(
      x + 117,
      y + h + 47,
      8,
      28
    );

    /*
      Tampo
    */

    ctx.fillStyle =
      "#654a34";

    ctx.fillRect(
      x,
      y,
      w,
      32
    );

    /*
      Borda
    */

    ctx.fillStyle =
      "#422f23";

    ctx.fillRect(
      x,
      y + 28,
      w,
      7
    );

    /*
      Painel frontal
    */

    ctx.fillStyle =
      "#4d392b";

    ctx.fillRect(
      x + 14,
      y + 35,
      w - 28,
      52
    );

    /*
      Pernas
    */

    ctx.fillStyle =
      "#302a26";

    ctx.fillRect(
      x + 16,
      y + 87,
      10,
      32
    );

    ctx.fillRect(
      x + w - 26,
      y + 87,
      10,
      32
    );

    /*
      Caderno
    */

    ctx.fillStyle =
      "#b9b39e";

    ctx.fillRect(
      x + 45,
      y + 8,
      65,
      17
    );

    ctx.fillStyle =
      "#6c6b62";

    ctx.fillRect(
      x + 51,
      y + 12,
      42,
      2
    );

    ctx.fillRect(
      x + 51,
      y + 17,
      34,
      2
    );

    /*
      Lápis
    */

    ctx.fillStyle =
      "#b89558";

    ctx.fillRect(
      x + 119,
      y + 9,
      37,
      5
    );
  }

  /* =========================================================
     CARTAZES
  ========================================================== */

  renderPosters(ctx) {
    const posters =
      this.objects.filter(
        (object) =>
          object.type ===
          "poster"
      );

    for (
      const poster of posters
    ) {
      const x = poster.x;
      const y = poster.y;
      const w = poster.width;
      const h = poster.height;

      ctx.fillStyle =
        "rgba(0,0,0,0.35)";

      ctx.fillRect(
        x + 6,
        y + 7,
        w,
        h
      );

      ctx.fillStyle =
        "#b4a17b";

      ctx.fillRect(
        x,
        y,
        w,
        h
      );

      ctx.strokeStyle =
        "#5c4d3a";

      ctx.lineWidth = 4;

      ctx.strokeRect(
        x,
        y,
        w,
        h
      );

      ctx.fillStyle =
        "rgba(35,35,30,0.6)";

      ctx.font =
        "bold 10px monospace";

      ctx.textAlign =
        "center";

      ctx.fillText(
        poster.id ===
          "poster_left"
          ? "SEGURANÇA"
          : "MATEMÁTICA",
        x + w / 2,
        y + 28
      );

      ctx.fillStyle =
        "rgba(35,35,30,0.35)";

      ctx.fillRect(
        x + 12,
        y + 42,
        w - 24,
        5
      );

      ctx.fillRect(
        x + 12,
        y + 55,
        w - 32,
        5
      );

      ctx.fillRect(
        x + 12,
        y + 68,
        w - 18,
        5
      );

      ctx.textAlign =
        "left";
    }
  }

  /* =========================================================
     PLANTA
  ========================================================== */

  renderPlant(ctx) {
    const object =
      this.objects.find(
        (item) =>
          item.id ===
          "plant"
      );

    if (!object) {
      return;
    }

    const cx =
      object.x +
      object.width / 2;

    const bottom =
      object.y +
      object.height;

    /*
      Sombra
    */

    ctx.fillStyle =
      "rgba(0,0,0,0.38)";

    ctx.beginPath();

    ctx.ellipse(
      cx + 8,
      bottom - 5,
      35,
      10,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();

    /*
      Vaso
    */

    ctx.fillStyle =
      "#694839";

    ctx.fillRect(
      cx - 27,
      bottom - 42,
      54,
      42
    );

    ctx.fillStyle =
      "#412e25";

    ctx.fillRect(
      cx - 20,
      bottom - 36,
      40,
      7
    );

    /*
      Folhas
    */

    ctx.fillStyle =
      "#3e5942";

    const leaves = [
      [-25, -48],
      [-8, -65],
      [12, -54],
      [28, -39],
      [4, -78],
      [-30, -29]
    ];

    for (
      const [
        lx,
        ly
      ] of leaves
    ) {
      ctx.fillRect(
        cx + lx,
        bottom + ly,
        18,
        28
      );
    }
  }

  /* =========================================================
     LIXEIRA
  ========================================================== */

  renderTrash(ctx) {
    const object =
      this.objects.find(
        (item) =>
          item.id ===
          "trash"
      );

    if (!object) {
      return;
    }

    const x = object.x;
    const y = object.y;

    ctx.fillStyle =
      "rgba(0,0,0,0.4)";

    ctx.fillRect(
      x + 8,
      y + 10,
      object.width,
      object.height
    );

    ctx.fillStyle =
      "#4b5051";

    ctx.fillRect(
      x + 5,
      y + 10,
      object.width - 10,
      object.height - 10
    );

    ctx.fillStyle =
      "#292d2f";

    ctx.fillRect(
      x,
      y + 4,
      object.width,
      12
    );

    ctx.fillStyle =
      "#707477";

    for (
      let i = 0;
      i < 4;
      i++
    ) {
      ctx.fillRect(
        x + 14 + i * 10,
        y + 25,
        4,
        object.height - 30
      );
    }
  }

  /* =========================================================
     PAINEL DECORATIVO
  ========================================================== */

  renderFlag(ctx) {
    const object =
      this.objects.find(
        (item) =>
          item.id ===
          "flag"
      );

    if (!object) {
      return;
    }

    const x = object.x;
    const y = object.y;

    ctx.fillStyle =
      "#17191d";

    ctx.fillRect(
      x + 38,
      y,
      7,
      object.height
    );

    ctx.fillStyle =
      "#6e5b45";

    ctx.fillRect(
      x,
      y + 8,
      65,
      45
    );

    ctx.fillStyle =
      "#3b3027";

    ctx.fillRect(
      x + 8,
      y + 16,
      48,
      4
    );

    ctx.fillRect(
      x + 8,
      y + 27,
      35,
      4
    );

    ctx.fillRect(
      x + 8,
      y + 38,
      44,
      4
    );
  }

  /* =========================================================
     INDICADOR DE INTERAÇÃO
  ========================================================== */

  renderInteractionMarkers(
    ctx,
    game
  ) {
    if (
      !game ||
      game.state !==
        "playing"
    ) {
      return;
    }

    const target =
      game.currentInteractionTarget;

    if (!target) {
      return;
    }

    const x =
      target.x +
      target.width / 2;

    const y =
      target.y - 18;

    const pulse =
      Math.sin(
        game.time * 5
      ) * 3;

    ctx.save();

    ctx.globalAlpha =
      0.72;

    ctx.fillStyle =
      "#d9c99a";

    ctx.font =
      "bold 15px monospace";

    ctx.textAlign =
      "center";

    ctx.fillText(
      "E",
      x,
      y + pulse
    );

    ctx.textAlign =
      "left";

    ctx.restore();
  }

  /* =========================================================
     ILUMINAÇÃO
     
     A visão acompanha o jogador.
     O centro permanece visível e as
     bordas ficam progressivamente mais escuras.
     
     Não existe brilho branco.
  ========================================================== */

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
      camera.x;

    const py =
      player.y -
      camera.y;

    const radius =
      330 +
      Math.sin(
        gameTime * 0.8
      ) * 4;

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

    ctx.fillStyle =
      vision;

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
}