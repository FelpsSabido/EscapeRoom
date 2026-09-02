export class Player {
  constructor({
    world,
    game = null
  } = {}) {
    this.world = world;
    this.game = game;

    this.width = 42;
    this.height = 64;

    /*
      Hitbox menor que o sprite.

      Isso permite que o personagem passe
      naturalmente pelos espaços entre as mesas.
    */

    this.hitboxWidth = 20;
    this.hitboxHeight = 18;

    this.speed = 210;

    this.acceleration = 1450;
    this.deceleration = 1700;

    this.velocityX = 0;
    this.velocityY = 0;

    this.x = 0;
    this.y = 0;

    this.direction = "down";

    this.isMoving = false;
    this.enabled = true;

    this.animationTime = 0;
    this.animationFrame = 0;

    this.reset();
  }

  /* =========================================================
     RESET
  ========================================================== */

  reset() {
    const spawn =
      this.world.getSpawnPoint();

    this.x = spawn.x;
    this.y = spawn.y;

    this.velocityX = 0;
    this.velocityY = 0;

    this.direction = "down";

    this.isMoving = false;

    this.animationTime = 0;
    this.animationFrame = 0;

    this.enabled = true;
  }

  /* =========================================================
     ATIVAR / DESATIVAR
  ========================================================== */

  setEnabled(enabled) {
    this.enabled =
      Boolean(enabled);

    if (!this.enabled) {
      this.velocityX = 0;
      this.velocityY = 0;
      this.isMoving = false;
    }
  }

  /* =========================================================
     UPDATE
  ========================================================== */

  update(
    deltaTime,
    input
  ) {
    if (
      !this.enabled ||
      !input
    ) {
      return;
    }

    const movement =
      input.getMovementVector();

    const targetX =
      movement.x *
      this.speed;

    const targetY =
      movement.y *
      this.speed;

    /*
      Aceleração suave.
    */

    if (
      Math.abs(movement.x) > 0
    ) {
      this.velocityX =
        this.moveTowards(
          this.velocityX,
          targetX,
          this.acceleration *
            deltaTime
        );
    } else {
      this.velocityX =
        this.moveTowards(
          this.velocityX,
          0,
          this.deceleration *
            deltaTime
        );
    }

    if (
      Math.abs(movement.y) > 0
    ) {
      this.velocityY =
        this.moveTowards(
          this.velocityY,
          targetY,
          this.acceleration *
            deltaTime
        );
    } else {
      this.velocityY =
        this.moveTowards(
          this.velocityY,
          0,
          this.deceleration *
            deltaTime
        );
    }

    this.isMoving =
      Math.abs(
        this.velocityX
      ) > 1 ||
      Math.abs(
        this.velocityY
      ) > 1;

    /*
      Direção do personagem.
    */

    if (
      Math.abs(movement.x) >
      Math.abs(movement.y)
    ) {
      if (
        movement.x > 0
      ) {
        this.direction =
          "right";
      } else if (
        movement.x < 0
      ) {
        this.direction =
          "left";
      }
    } else if (
      Math.abs(movement.y) > 0
    ) {
      if (
        movement.y > 0
      ) {
        this.direction =
          "down";
      } else {
        this.direction =
          "up";
      }
    }

    /*
      Movimento com colisão.
    */

    this.moveWithCollision(
      this.velocityX *
        deltaTime,
      this.velocityY *
        deltaTime
    );

    /*
      Animação.
    */

    if (
      this.isMoving
    ) {
      this.animationTime +=
        deltaTime;

      if (
        this.animationTime >=
        0.11
      ) {
        this.animationTime =
          0;

        this.animationFrame =
          (
            this.animationFrame +
            1
          ) %
          4;
      }
    } else {
      this.animationTime = 0;
      this.animationFrame = 0;
    }
  }

  /* =========================================================
     MOVIMENTO COM COLISÃO
  ========================================================== */

  moveWithCollision(
    deltaX,
    deltaY
  ) {
    /*
      Primeiro tenta mover horizontalmente.
    */

    if (
      Math.abs(deltaX) > 0
    ) {
      const nextX =
        this.x +
        deltaX;

      if (
        this.world.canPlayerMoveTo(
          nextX,
          this.y,
          this.hitboxWidth,
          this.hitboxHeight
        )
      ) {
        this.x = nextX;
      } else {
        this.velocityX = 0;
      }
    }

    /*
      Depois tenta mover verticalmente.

      Separar os eixos permite que o jogador
      "deslize" pelas paredes e mesas.
    */

    if (
      Math.abs(deltaY) > 0
    ) {
      const nextY =
        this.y +
        deltaY;

      if (
        this.world.canPlayerMoveTo(
          this.x,
          nextY,
          this.hitboxWidth,
          this.hitboxHeight
        )
      ) {
        this.y = nextY;
      } else {
        this.velocityY = 0;
      }
    }

    /*
      Garantia adicional para nunca sair
      dos limites da sala.
    */

    const margin = 70;

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
     ACELERAÇÃO
  ========================================================== */

  moveTowards(
    current,
    target,
    amount
  ) {
    if (
      current <
      target
    ) {
      return Math.min(
        current +
          amount,
        target
      );
    }

    if (
      current >
      target
    ) {
      return Math.max(
        current -
          amount,
        target
      );
    }

    return target;
  }

  /* =========================================================
     RENDER
  ========================================================== */

  render(ctx) {
    if (!ctx) {
      return;
    }

    ctx.save();

    /*
      O x/y representa o centro inferior
      aproximado do personagem.
    */

    const drawX =
      Math.round(
        this.x -
          this.width / 2
      );

    const drawY =
      Math.round(
        this.y -
          this.height +
          10
      );

    /*
      Sombra no chão.
    */

    this.renderShadow(
      ctx,
      this.x,
      this.y
    );

    /*
      Pequeno balanço durante a caminhada.
    */

    let bob = 0;

    if (
      this.isMoving
    ) {
      bob =
        Math.sin(
          this.animationFrame *
            Math.PI / 2
        ) *
        2;
    }

    ctx.translate(
      0,
      bob
    );

    /*
      Sprite pixel-art.
    */

    this.renderCharacter(
      ctx,
      drawX,
      drawY
    );

    ctx.restore();
  }

  /* =========================================================
     SOMBRA
  ========================================================== */

  renderShadow(
    ctx,
    x,
    y
  ) {
    ctx.save();

    ctx.fillStyle =
      "rgba(0,0,0,0.48)";

    ctx.beginPath();

    ctx.ellipse(
      Math.round(x),
      Math.round(y + 4),
      23,
      8,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();

    /*
      Pequeno núcleo da sombra.
    */

    ctx.fillStyle =
      "rgba(0,0,0,0.25)";

    ctx.beginPath();

    ctx.ellipse(
      Math.round(x),
      Math.round(y + 3),
      13,
      4,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
  }

  /* =========================================================
     PERSONAGEM
  ========================================================== */

  renderCharacter(
    ctx,
    x,
    y
  ) {
    /*
      Paleta própria do personagem.

      Tudo é desenhado em blocos,
      mantendo aparência pixel-art.
    */

    const skin =
      "#c88f6a";

    const skinDark =
      "#8e5d49";

    const hair =
      "#211d22";

    const hairLight =
      "#352d31";

    const shirt =
      "#596b6f";

    const shirtDark =
      "#39474a";

    const pants =
      "#282d35";

    const pantsLight =
      "#3b424d";

    const shoes =
      "#16181c";

    /*
      CABEÇA
    */

    ctx.fillStyle =
      hair;

    ctx.fillRect(
      x + 11,
      y + 2,
      21,
      10
    );

    ctx.fillRect(
      x + 7,
      y + 9,
      29,
      22
    );

    /*
      Cabelo lateral.
    */

    ctx.fillRect(
      x + 7,
      y + 13,
      6,
      17
    );

    ctx.fillRect(
      x + 30,
      y + 13,
      6,
      15
    );

    /*
      Rosto
    */

    ctx.fillStyle =
      skin;

    ctx.fillRect(
      x + 13,
      y + 11,
      18,
      17
    );

    /*
      Orelhas
    */

    ctx.fillRect(
      x + 10,
      y + 17,
      4,
      7
    );

    ctx.fillRect(
      x + 30,
      y + 17,
      4,
      7
    );

    /*
      Sombra do rosto
    */

    ctx.fillStyle =
      skinDark;

    ctx.fillRect(
      x + 13,
      y + 24,
      18,
      4
    );

    /*
      Cabelo frontal.
    */

    ctx.fillStyle =
      hair;

    ctx.fillRect(
      x + 12,
      y + 7,
      20,
      7
    );

    ctx.fillRect(
      x + 16,
      y + 4,
      13,
      6
    );

    ctx.fillRect(
      x + 10,
      y + 10,
      6,
      6
    );

    /*
      Pequeno detalhe do cabelo.
    */

    ctx.fillStyle =
      hairLight;

    ctx.fillRect(
      x + 18,
      y + 5,
      8,
      3
    );

    /*
      OLHOS

      Como o protagonista não enxerga,
      mantemos os olhos estilizados,
      sem depender deles para jogar.
    */

    ctx.fillStyle =
      "#272126";

    if (
      this.direction ===
      "down"
    ) {
      ctx.fillRect(
        x + 17,
        y + 17,
        3,
        3
      );

      ctx.fillRect(
        x + 25,
        y + 17,
        3,
        3
      );
    }

    /*
      CORPO
    */

    ctx.fillStyle =
      shirtDark;

    ctx.fillRect(
      x + 8,
      y + 30,
      27,
      25
    );

    ctx.fillStyle =
      shirt;

    ctx.fillRect(
      x + 12,
      y + 31,
      19,
      21
    );

    /*
      Detalhe da camisa.
    */

    ctx.fillStyle =
      "rgba(220,220,205,0.16)";

    ctx.fillRect(
      x + 19,
      y + 33,
      5,
      15
    );

    /*
      BRAÇOS
    */

    ctx.fillStyle =
      skin;

    ctx.fillRect(
      x + 5,
      y + 33,
      7,
      20
    );

    ctx.fillRect(
      x + 31,
      y + 33,
      7,
      20
    );

    /*
      Mãos
    */

    ctx.fillStyle =
      skinDark;

    ctx.fillRect(
      x + 5,
      y + 50,
      7,
      6
    );

    ctx.fillRect(
      x + 31,
      y + 50,
      7,
      6
    );

    /*
      Calça
    */

    ctx.fillStyle =
      pants;

    ctx.fillRect(
      x + 10,
      y + 53,
      23,
      18
    );

    /*
      Separação das pernas.
    */

    ctx.fillStyle =
      pantsLight;

    ctx.fillRect(
      x + 20,
      y + 54,
      3,
      15
    );

    /*
      PERNAS
    */

    ctx.fillStyle =
      pants;

    ctx.fillRect(
      x + 11,
      y + 66,
      9,
      16
    );

    ctx.fillRect(
      x + 23,
      y + 66,
      9,
      16
    );

    /*
      ANIMAÇÃO DOS PÉS
    */

    if (
      this.isMoving
    ) {
      if (
        this.animationFrame %
          2 ===
        0
      ) {
        ctx.fillRect(
          x + 9,
          y + 78,
          12,
          6
        );

        ctx.fillRect(
          x + 24,
          y + 76,
          12,
          6
        );
      } else {
        ctx.fillRect(
          x + 7,
          y + 76,
          12,
          6
        );

        ctx.fillRect(
          x + 25,
          y + 79,
          12,
          6
        );
      }
    }

    /*
      SAPATOS
    */

    ctx.fillStyle =
      shoes;

    ctx.fillRect(
      x + 8,
      y + 79,
      12,
      7
    );

    ctx.fillRect(
      x + 25,
      y + 79,
      12,
      7
    );

    /*
      DETALHE DA BENGALA / ACESSIBILIDADE

      O objeto acompanha o personagem e reforça
      visualmente a proposta do protagonista.
    */

    this.renderWalkingStick(
      ctx,
      x,
      y
    );
  }

  /* =========================================================
     BENGALA
  ========================================================== */

  renderWalkingStick(
    ctx,
    x,
    y
  ) {
    ctx.save();

    ctx.strokeStyle =
      "#d1d0c5";

    ctx.lineWidth = 3;

    ctx.beginPath();

    if (
      this.direction ===
      "left"
    ) {
      ctx.moveTo(
        x + 9,
        y + 44
      );

      ctx.lineTo(
        x - 2,
        y + 78
      );

      ctx.lineTo(
        x - 8,
        y + 82
      );
    } else if (
      this.direction ===
      "right"
    ) {
      ctx.moveTo(
        x + 34,
        y + 44
      );

      ctx.lineTo(
        x + 46,
        y + 78
      );

      ctx.lineTo(
        x + 52,
        y + 82
      );
    } else {
      ctx.moveTo(
        x + 34,
        y + 44
      );

      ctx.lineTo(
        x + 40,
        y + 78
      );

      ctx.lineTo(
        x + 47,
        y + 82
      );
    }

    ctx.stroke();

    /*
      Ponta.
    */

    ctx.fillStyle =
      "#e0ddd1";

    if (
      this.direction ===
      "left"
    ) {
      ctx.fillRect(
        x - 10,
        y + 80,
        7,
        3
      );
    } else if (
      this.direction ===
      "right"
    ) {
      ctx.fillRect(
        x + 49,
        y + 80,
        7,
        3
      );
    } else {
      ctx.fillRect(
        x + 44,
        y + 80,
        7,
        3
      );
    }

    ctx.restore();
  }
}