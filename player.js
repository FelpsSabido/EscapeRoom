/* =========================================================
   A SALA — ESCAPE ROOM
   PLAYER.JS

   Responsável por:

   - Personagem
   - Movimento
   - Colisão
   - Animação
   - Direção
   - Sombra
   - Pixel art
   - Posição
   - Velocidade
   ========================================================= */

export class Player {

  constructor(options = {}) {

    /* -------------------------------------------------------
       REFERÊNCIAS
    ------------------------------------------------------- */

    this.world =
      options.world || null;

    this.game =
      options.game || null;


    /* -------------------------------------------------------
       TAMANHO DO PERSONAGEM

       O ponto x/y representa o centro do personagem.
    ------------------------------------------------------- */

    this.width = 34;

    this.height = 52;


    /* -------------------------------------------------------
       POSIÇÃO
    ------------------------------------------------------- */

    const spawn =
      this.world &&
      typeof this.world.getSpawnPoint === "function"
        ? this.world.getSpawnPoint()
        : {
            x: 900,
            y: 500
          };


    this.x =
      Number.isFinite(options.x)
        ? options.x
        : spawn.x;


    this.y =
      Number.isFinite(options.y)
        ? options.y
        : spawn.y;


    /* -------------------------------------------------------
       VELOCIDADE
    ------------------------------------------------------- */

    this.velocityX = 0;

    this.velocityY = 0;

    this.speed = 220;

    this.acceleration = 1800;

    this.friction = 1500;


    /* -------------------------------------------------------
       DIREÇÃO

       down = frente
       up = costas
       left = esquerda
       right = direita
    ------------------------------------------------------- */

    this.direction = "down";


    /* -------------------------------------------------------
       ANIMAÇÃO
    ------------------------------------------------------- */

    this.walkTime = 0;

    this.walkFrame = 0;

    this.isMoving = false;


    /* -------------------------------------------------------
       PEQUENOS EFEITOS
    ------------------------------------------------------- */

    this.bob = 0;

    this.shadowPulse = 0;


    /* -------------------------------------------------------
       ESTADO
    ------------------------------------------------------- */

    this.enabled = true;

  }


  /* =========================================================
     SET GAME
     ========================================================= */

  setGame(game) {

    this.game = game;

  }


  /* =========================================================
     UPDATE
     ========================================================= */

  update(
    deltaTime,
    input
  ) {

    if (
      !this.enabled
    ) {

      return;

    }


    if (
      !Number.isFinite(deltaTime)
    ) {

      deltaTime = 0;

    }


    /*
     * Evita saltos gigantes caso a aba fique congelada.
     */

    deltaTime =
      Math.min(
        deltaTime,
        0.05
      );


    /* -------------------------------------------------------
       MOVIMENTO
    ------------------------------------------------------- */

    const movement =
      input &&
      typeof input.getMovementVector ===
      "function"

        ? input.getMovementVector()

        : {
            x: 0,
            y: 0
          };


    const moving =
      Math.abs(movement.x) > 0 ||
      Math.abs(movement.y) > 0;


    this.isMoving =
      moving;


    /* -------------------------------------------------------
       DIREÇÃO

       Priorizamos o eixo com maior intensidade para evitar
       que a direção fique mudando rapidamente na diagonal.
    ------------------------------------------------------- */

    if (
      moving
    ) {

      if (
        Math.abs(movement.x) >
        Math.abs(movement.y)
      ) {

        this.direction =
          movement.x > 0
            ? "right"
            : "left";

      } else {

        this.direction =
          movement.y > 0
            ? "down"
            : "up";

      }

    }


    /* -------------------------------------------------------
       VELOCIDADE DESEJADA
    ------------------------------------------------------- */

    const targetVelocityX =
      movement.x *
      this.speed;


    const targetVelocityY =
      movement.y *
      this.speed;


    /*
     * Aceleração.
     */

    this.velocityX =
      this.approach(
        this.velocityX,
        targetVelocityX,
        this.acceleration *
        deltaTime
      );


    this.velocityY =
      this.approach(
        this.velocityY,
        targetVelocityY,
        this.acceleration *
        deltaTime
      );


    /*
     * Quando não estamos apertando nada, desaceleramos
     * gradualmente.
     */

    if (
      !moving
    ) {

      this.velocityX =
        this.approach(
          this.velocityX,
          0,
          this.friction *
          deltaTime
        );


      this.velocityY =
        this.approach(
          this.velocityY,
          0,
          this.friction *
          deltaTime
        );

    }


    /* -------------------------------------------------------
       MOVIMENTO COM COLISÃO
    ------------------------------------------------------- */

    const dx =
      this.velocityX *
      deltaTime;


    const dy =
      this.velocityY *
      deltaTime;


    this.moveWithCollision(
      dx,
      dy
    );


    /* -------------------------------------------------------
       ANIMAÇÃO
    ------------------------------------------------------- */

    if (
      this.isMoving &&
      (
        Math.abs(this.velocityX) > 5 ||
        Math.abs(this.velocityY) > 5
      )
    ) {

      this.walkTime +=
        deltaTime;

      /*
       * Quatro quadros de caminhada.
       */

      const frameDuration =
        0.11;


      this.walkFrame =
        Math.floor(
          this.walkTime /
          frameDuration
        ) % 4;


      /*
       * Movimento vertical do corpo.
       */

      this.bob =
        Math.sin(
          this.walkTime *
          Math.PI *
          9
        ) *
        1.5;

    } else {

      this.walkTime = 0;

      this.walkFrame = 0;

      this.bob =
        this.approach(
          this.bob,
          0,
          15 * deltaTime
        );

    }


    /*
     * Pequena pulsação da sombra.
     */

    this.shadowPulse +=
      deltaTime;

  }


  /* =========================================================
     APPROACH
     ========================================================= */

  approach(
    current,
    target,
    amount
  ) {

    if (
      current < target
    ) {

      return Math.min(
        current + amount,
        target
      );

    }


    if (
      current > target
    ) {

      return Math.max(
        current - amount,
        target
      );

    }


    return target;

  }


  /* =========================================================
     MOVEMENT + COLLISION
     ========================================================= */

  moveWithCollision(
    dx,
    dy
  ) {

    if (
      !this.world
    ) {

      this.x += dx;

      this.y += dy;

      return;

    }


    /*
     * Eixo X separado do eixo Y.
     *
     * Isso permite que o personagem deslize pela lateral
     * dos móveis em vez de ficar completamente travado.
     */

    if (
      dx !== 0
    ) {

      const nextX =
        this.x +
        dx;


      if (
        this.canMoveTo(
          nextX,
          this.y
        )
      ) {

        this.x =
          nextX;

      } else {

        this.velocityX =
          0;

      }

    }


    if (
      dy !== 0
    ) {

      const nextY =
        this.y +
        dy;


      if (
        this.canMoveTo(
          this.x,
          nextY
        )
      ) {

        this.y =
          nextY;

      } else {

        this.velocityY =
          0;

      }

    }


    /*
     * Limite de segurança.
     *
     * Mesmo que algo estranho aconteça com a colisão,
     * o personagem nunca consegue sair do mundo.
     */

    const margin =
      25;


    this.x =
      Math.max(
        margin,
        Math.min(
          this.world.width -
          margin,
          this.x
        )
      );


    this.y =
      Math.max(
        margin,
        Math.min(
          this.world.height -
          margin,
          this.y
        )
      );

  }


  /* =========================================================
     CAN MOVE TO
     ========================================================= */

  canMoveTo(
    x,
    y
  ) {

    if (
      !this.world
    ) {

      return true;

    }


    if (
      typeof this.world.canPlayerMoveTo !==
      "function"
    ) {

      return true;

    }


    return this.world.canPlayerMoveTo(
      this,
      x,
      y
    );

  }


  /* =========================================================
     GET BOUNDS
     ========================================================= */

  getBoundsAt(
    x,
    y
  ) {

    return {

      x:
        x -
        this.width / 2,

      y:
        y -
        this.height / 2,

      width:
        this.width,

      height:
        this.height

    };

  }


  /* =========================================================
     GET BOUNDS
     ========================================================= */

  getBounds() {

    return this.getBoundsAt(
      this.x,
      this.y
    );

  }


  /* =========================================================
     GET POSITION
     ========================================================= */

  getPosition() {

    return {

      x:
        this.x,

      y:
        this.y

    };

  }


  /* =========================================================
     SET POSITION
     ========================================================= */

  setPosition(
    x,
    y
  ) {

    if (
      Number.isFinite(x)
    ) {

      this.x =
        x;

    }


    if (
      Number.isFinite(y)
    ) {

      this.y =
        y;

    }


    this.velocityX = 0;

    this.velocityY = 0;

  }


  /* =========================================================
     RESET
     ========================================================= */

  reset() {

    if (
      this.world &&
      typeof this.world.getSpawnPoint ===
      "function"
    ) {

      const spawn =
        this.world.getSpawnPoint();


      this.x =
        spawn.x;


      this.y =
        spawn.y;

    }


    this.velocityX = 0;

    this.velocityY = 0;

    this.direction = "down";

    this.walkTime = 0;

    this.walkFrame = 0;

    this.isMoving = false;

    this.bob = 0;

  }


  /* =========================================================
     ENABLE / DISABLE
     ========================================================= */

  setEnabled(
    enabled
  ) {

    this.enabled =
      Boolean(enabled);


    if (
      !this.enabled
    ) {

      this.velocityX = 0;

      this.velocityY = 0;

    }

  }


  /* =========================================================
     RENDER
     ========================================================= */

  render(
    ctx
  ) {

    if (
      !ctx
    ) {

      return;

    }


    ctx.save();


    /*
     * Sombra.
     */

    this.renderShadow(
      ctx
    );


    /*
     * Corpo.

     * O personagem é desenhado alguns pixels acima
     * do ponto de colisão para dar sensação de profundidade.
     */

    const drawX =
      Math.round(
        this.x
      );


    const drawY =
      Math.round(
        this.y +
        this.bob
      );


    /*
     * Pixel art sem suavização.

     */

    ctx.imageSmoothingEnabled =
      false;


    this.renderCharacter(
      ctx,
      drawX,
      drawY
    );


    ctx.restore();

  }


  /* =========================================================
     SHADOW
     ========================================================= */

  renderShadow(
    ctx
  ) {

    const pulse =
      Math.sin(
        this.shadowPulse *
        4
      ) *
      0.04;


    const width =
      26 +
      pulse * 10;


    const height =
      9 +
      pulse * 3;


    ctx.save();


    ctx.fillStyle =
      "rgba(0,0,0,0.45)";


    ctx.beginPath();


    ctx.ellipse(
      this.x,
      this.y +
      this.height / 2 -
      2,

      width,
      height,

      0,

      0,

      Math.PI * 2
    );


    ctx.fill();


    ctx.restore();

  }


  /* =========================================================
     CHARACTER
     ========================================================= */

  renderCharacter(
    ctx,
    x,
    y
  ) {

    /*
     * Tamanho base em pixels.

     * O personagem é construído com retângulos e polígonos
     * simples para manter o estilo pixel-art.
     */

    const walk =
      this.isMoving
        ? this.walkFrame
        : 0;


    /*
     * Pequena oscilação dos braços/pernas.
     */

    let legOffset = 0;

    let armOffset = 0;


    if (
      this.isMoving
    ) {

      if (
        walk === 0 ||
        walk === 2
      ) {

        legOffset = 2;

        armOffset = -2;

      } else {

        legOffset = -2;

        armOffset = 2;

      }

    }


    /*
     * ======================================================
     * DIREÇÃO PARA BAIXO
     * ======================================================
     */

    if (
      this.direction ===
      "down"
    ) {

      this.renderDown(
        ctx,
        x,
        y,
        legOffset,
        armOffset
      );

      return;

    }


    /*
     * ======================================================
     * DIREÇÃO PARA CIMA
     * ======================================================
     */

    if (
      this.direction ===
      "up"
    ) {

      this.renderUp(
        ctx,
        x,
        y,
        legOffset,
        armOffset
      );

      return;

    }


    /*
     * ======================================================
     * ESQUERDA
     * ======================================================
     */

    if (
      this.direction ===
      "left"
    ) {

      this.renderSide(
        ctx,
        x,
        y,
        -1,
        legOffset,
        armOffset
      );

      return;

    }


    /*
     * ======================================================
     * DIREITA
     * ======================================================
     */

    this.renderSide(
      ctx,
      x,
      y,
      1,
      legOffset,
      armOffset
    );

  }


  /* =========================================================
     FRONT
     ========================================================= */

  renderDown(
    ctx,
    x,
    y,
    legOffset,
    armOffset
  ) {

    /*
     * CABELO — sombra atrás da cabeça.
     */

    ctx.fillStyle =
      "#24201f";


    ctx.fillRect(
      x - 13,
      y - 26,
      26,
      23
    );


    /*
     * Cabelo lateral.
     */

    ctx.fillRect(
      x - 16,
      y - 18,
      5,
      15
    );


    ctx.fillRect(
      x + 11,
      y - 18,
      5,
      15
    );


    /*
     * ROSTO.

     */

    ctx.fillStyle =
      "#c58f6b";


    ctx.fillRect(
      x - 11,
      y - 20,
      22,
      22
    );


    /*
     * Orelhas.

     */

    ctx.fillRect(
      x - 14,
      y - 14,
      4,
      9
    );


    ctx.fillRect(
      x + 10,
      y - 14,
      4,
      9
    );


    /*
     * Franja.

     */

    ctx.fillStyle =
      "#302725";


    ctx.fillRect(
      x - 11,
      y - 21,
      22,
      7
    );


    ctx.fillRect(
      x - 7,
      y - 25,
      14,
      7
    );


    /*
     * Olhos.

     */

    ctx.fillStyle =
      "#191919";


    ctx.fillRect(
      x - 7,
      y - 11,
      4,
      4
    );


    ctx.fillRect(
      x + 3,
      y - 11,
      4,
      4
    );


    /*
     * Nariz.

     */

    ctx.fillStyle =
      "#9d684f";


    ctx.fillRect(
      x - 1,
      y - 5,
      3,
      4
    );


    /*
     * Boca.

     */

    ctx.fillStyle =
      "#75483d";


    ctx.fillRect(
      x - 4,
      y + 2,
      8,
      2
    );


    /*
     * PESCOÇO.

     */

    ctx.fillStyle =
      "#ad775a";


    ctx.fillRect(
      x - 6,
      y + 2,
      12,
      8
    );


    /*
     * CORPO / BLUSA.

     */

    ctx.fillStyle =
      "#4e5964";


    ctx.fillRect(
      x - 15,
      y + 8,
      30,
      25
    );


    /*
     * Detalhe central da camisa.

     */

    ctx.fillStyle =
      "#707985";


    ctx.fillRect(
      x - 3,
      y + 9,
      6,
      22
    );


    /*
     * BRAÇO ESQUERDO.

     */

    ctx.fillStyle =
      "#4e5964";


    ctx.fillRect(
      x - 21,
      y + 11 +
      armOffset,
      7,
      20
    );


    /*
     * Mão esquerda.

     */

    ctx.fillStyle =
      "#c58f6b";


    ctx.fillRect(
      x - 21,
      y + 29 +
      armOffset,
      7,
      7
    );


    /*
     * BRAÇO DIREITO.

     */

    ctx.fillStyle =
      "#4e5964";


    ctx.fillRect(
      x + 14,
      y + 11 -
      armOffset,
      7,
      20
    );


    /*
     * Mão direita.

     */

    ctx.fillStyle =
      "#c58f6b";


    ctx.fillRect(
      x + 14,
      y + 29 -
      armOffset,
      7,
      7
    );


    /*
     * CALÇA.

     */

    ctx.fillStyle =
      "#303a45";


    ctx.fillRect(
      x - 14,
      y + 32,
      28,
      16
    );


    /*
     * PERNAS.

     */

    ctx.fillStyle =
      "#303a45";


    ctx.fillRect(
      x - 12,
      y + 45 +
      legOffset,
      9,
      12
    );


    ctx.fillRect(
      x + 3,
      y + 45 -
      legOffset,
      9,
      12
    );


    /*
     * TÊNIS.

     */

    ctx.fillStyle =
      "#252526";


    ctx.fillRect(
      x - 14,
      y + 55 +
      legOffset,
      12,
      6
    );


    ctx.fillRect(
      x + 2,
      y + 55 -
      legOffset,
      12,
      6
    );


    /*
     * Pequenos detalhes claros.

     */

    ctx.fillStyle =
      "#8f9497";


    ctx.fillRect(
      x - 11,
      y + 55 +
      legOffset,
      6,
      2
    );


    ctx.fillRect(
      x + 5,
      y + 55 -
      legOffset,
      6,
      2
    );

  }


  /* =========================================================
     BACK
     ========================================================= */

  renderUp(
    ctx,
    x,
    y,
    legOffset,
    armOffset
  ) {

    /*
     * CABELO.

     */

    ctx.fillStyle =
      "#24201f";


    ctx.fillRect(
      x - 14,
      y - 26,
      28,
      27
    );


    ctx.fillRect(
      x - 17,
      y - 18,
      5,
      17
    );


    ctx.fillRect(
      x + 12,
      y - 18,
      5,
      17
    );


    /*
     * Pescoço.

     */

    ctx.fillStyle =
      "#ad775a";


    ctx.fillRect(
      x - 6,
      y,
      12,
      9
    );


    /*
     * Corpo.

     */

    ctx.fillStyle =
      "#4e5964";


    ctx.fillRect(
      x - 15,
      y + 7,
      30,
      26
    );


    /*
     * Mochila.

     */

    ctx.fillStyle =
      "#39434d";


    ctx.fillRect(
      x - 12,
      y + 10,
      24,
      22
    );


    ctx.fillStyle =
      "#596773";


    ctx.fillRect(
      x - 8,
      y + 14,
      16,
      3
    );


    /*
     * Alças.

     */

    ctx.strokeStyle =
      "#252c32";


    ctx.lineWidth =
      3;


    ctx.beginPath();


    ctx.moveTo(
      x - 12,
      y + 8
    );


    ctx.lineTo(
      x - 7,
      y + 22
    );


    ctx.stroke();


    ctx.beginPath();


    ctx.moveTo(
      x + 12,
      y + 8
    );


    ctx.lineTo(
      x + 7,
      y + 22
    );


    ctx.stroke();


    /*
     * Braços.

     */

    ctx.fillStyle =
      "#4e5964";


    ctx.fillRect(
      x - 21,
      y + 10 +
      armOffset,
      7,
      21
    );


    ctx.fillRect(
      x + 14,
      y + 10 -
      armOffset,
      7,
      21
    );


    /*
     * Mãos.

     */

    ctx.fillStyle =
      "#c58f6b";


    ctx.fillRect(
      x - 21,
      y + 29 +
      armOffset,
      7,
      7
    );


    ctx.fillRect(
      x + 14,
      y + 29 -
      armOffset,
      7,
      7
    );


    /*
     * Calça.

     */

    ctx.fillStyle =
      "#303a45";


    ctx.fillRect(
      x - 14,
      y + 32,
      28,
      16
    );


    /*
     * Pernas.

     */

    ctx.fillRect(
      x - 12,
      y + 45 +
      legOffset,
      9,
      12
    );


    ctx.fillRect(
      x + 3,
      y + 45 -
      legOffset,
      9,
      12
    );


    /*
     * Tênis.

     */

    ctx.fillStyle =
      "#252526";


    ctx.fillRect(
      x - 14,
      y + 55 +
      legOffset,
      12,
      6
    );


    ctx.fillRect(
      x + 2,
      y + 55 -
      legOffset,
      12,
      6
    );

  }


  /* =========================================================
     SIDE
     ========================================================= */

  renderSide(
    ctx,
    x,
    y,
    side,
    legOffset,
    armOffset
  ) {

    const flip =
      side === -1;


    ctx.save();


    /*
     * Espelhamos tudo quando andando para esquerda.

     */

    if (
      flip
    ) {

      ctx.translate(
        x * 2,
        0
      );


      ctx.scale(
        -1,
        1
      );

    }


    /*
     * CABELO.

     */

    ctx.fillStyle =
      "#24201f";


    ctx.fillRect(
      x - 10,
      y - 26,
      20,
      25
    );


    ctx.fillRect(
      x - 14,
      y - 18,
      6,
      17
    );


    /*
     * ROSTO.

     */

    ctx.fillStyle =
      "#c58f6b";


    ctx.fillRect(
      x - 6,
      y - 20,
      18,
      21
    );


    /*
     * Nariz.

     */

    ctx.fillRect(
      x + 10,
      y - 10,
      5,
      5
    );


    /*
     * Franja.

     */

    ctx.fillStyle =
      "#302725";


    ctx.fillRect(
      x - 7,
      y - 22,
      18,
      7
    );


    /*
     * Olho.

     */

    ctx.fillStyle =
      "#191919";


    ctx.fillRect(
      x + 5,
      y - 11,
      4,
      4
    );


    /*
     * Pescoço.

     */

    ctx.fillStyle =
      "#ad775a";


    ctx.fillRect(
      x - 3,
      y,
      10,
      9
    );


    /*
     * Corpo.

     */

    ctx.fillStyle =
      "#4e5964";


    ctx.fillRect(
      x - 11,
      y + 8,
      27,
      25
    );


    /*
     * Braço visível.

     */

    ctx.fillRect(
      x + 10,
      y + 11 +
      armOffset,
      8,
      21
    );


    /*
     * Mão.

     */

    ctx.fillStyle =
      "#c58f6b";


    ctx.fillRect(
      x + 10,
      y + 30 +
      armOffset,
      8,
      7
    );


    /*
     * Calça.

     */

    ctx.fillStyle =
      "#303a45";


    ctx.fillRect(
      x - 10,
      y + 32,
      24,
      16
    );


    /*
     * Pernas.

     */

    ctx.fillRect(
      x - 8,
      y + 45 +
      legOffset,
      9,
      12
    );


    ctx.fillRect(
      x + 5,
      y + 45 -
      legOffset,
      9,
      12
    );


    /*
     * Tênis.

     */

    ctx.fillStyle =
      "#252526";


    ctx.fillRect(
      x - 10,
      y + 55 +
      legOffset,
      13,
      6
    );


    ctx.fillRect(
      x + 4,
      y + 55 -
      legOffset,
      13,
      6
    );


    ctx.restore();

  }


  /* =========================================================
     DESTROY
     ========================================================= */

  destroy() {

    this.world = null;

    this.game = null;

    this.enabled = false;

  }

}