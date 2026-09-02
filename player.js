// player.js
// Escape Room — Personagem
// Personagem frontal em pixel art, com movimentação suave,
// animação de caminhada, sombra e bengala.

export class Player {
  constructor(options = {}) {
    this.world = options.world || null;

    this.width = 42;
    this.height = 64;

    this.hitboxWidth = 20;
    this.hitboxHeight = 18;

    this.speed = 185;

    this.acceleration = 1050;
    this.deceleration = 1350;

    this.x = 800;
    this.y = 800;

    this.velocityX = 0;
    this.velocityY = 0;

    this.direction = "down";

    this.walkTime = 0;
    this.walkFrame = 0;

    this.isMoving = false;

    this.caneWave = 0;

    this.bobTime = 0;

    this.visible = true;

    this.palette = {
      skin: "#d49a76",
      skinLight: "#e4ad86",
      skinShadow: "#a86d55",

      hair: "#17181c",
      hairLight: "#292a2f",

      shirt: "#3f6687",
      shirtLight: "#557f9f",
      shirtDark: "#2d4b65",

      pants: "#28333d",
      pantsLight: "#34434f",

      shoe: "#17191c",
      shoeLight: "#2a2e32",

      cane: "#ded6c2",
      caneDark: "#8f8879",

      backpack: "#704b39",
      backpackLight: "#8a5c45",

      eye: "#161616",

      shadow: "rgba(0,0,0,0.45)"
    };

    this.reset();
  }

  // =========================================================
  // RESET
  // =========================================================

  reset() {
    if (this.world && typeof this.world.getSpawnPoint === "function") {
      const spawn = this.world.getSpawnPoint();

      this.x = spawn.x;
      this.y = spawn.y;
    } else {
      this.x = 800;
      this.y = 800;
    }

    this.velocityX = 0;
    this.velocityY = 0;

    this.direction = "down";

    this.walkTime = 0;
    this.walkFrame = 0;

    this.isMoving = false;

    this.caneWave = 0;
    this.bobTime = 0;
  }

  // =========================================================
  // UPDATE
  // =========================================================

  update(deltaTime, input) {
    if (!input) {
      this.stopMovement(deltaTime);
      this.updateAnimation(deltaTime);
      return;
    }

    const movement = input.getMovementVector();

    let targetX = movement.x * this.speed;
    let targetY = movement.y * this.speed;

    // Aceleração horizontal
    if (Math.abs(targetX) > 0.001) {
      this.velocityX = this.moveTowards(
        this.velocityX,
        targetX,
        this.acceleration * deltaTime
      );
    } else {
      this.velocityX = this.moveTowards(
        this.velocityX,
        0,
        this.deceleration * deltaTime
      );
    }

    // Aceleração vertical
    if (Math.abs(targetY) > 0.001) {
      this.velocityY = this.moveTowards(
        this.velocityY,
        targetY,
        this.acceleration * deltaTime
      );
    } else {
      this.velocityY = this.moveTowards(
        this.velocityY,
        0,
        this.deceleration * deltaTime
      );
    }

    const moving =
      Math.abs(movement.x) > 0 ||
      Math.abs(movement.y) > 0;

    this.isMoving = moving;

    if (moving) {
      this.updateDirection(movement);

      this.walkTime += deltaTime;

      const frameDuration = 0.11;

      if (this.walkTime >= frameDuration) {
        this.walkTime -= frameDuration;
        this.walkFrame =
          (this.walkFrame + 1) % 4;
      }

      this.bobTime += deltaTime * 10;
    } else {
      this.walkFrame = 0;

      this.bobTime += deltaTime * 2;
    }

    this.caneWave += deltaTime * 5;

    this.moveWithCollision(
      this.velocityX * deltaTime,
      this.velocityY * deltaTime
    );
  }

  // =========================================================
  // DIREÇÃO
  // =========================================================

  updateDirection(movement) {
    if (
      Math.abs(movement.x) >
      Math.abs(movement.y)
    ) {
      if (movement.x > 0) {
        this.direction = "right";
      } else if (movement.x < 0) {
        this.direction = "left";
      }
    } else {
      if (movement.y > 0) {
        this.direction = "down";
      } else if (movement.y < 0) {
        this.direction = "up";
      }
    }
  }

  // =========================================================
  // MOVIMENTO
  // =========================================================

  moveWithCollision(dx, dy) {
    if (!this.world) {
      this.x += dx;
      this.y += dy;
      return;
    }

    if (dx !== 0) {
      const nextX = this.x + dx;

      if (
        this.canMoveTo(
          nextX,
          this.y
        )
      ) {
        this.x = nextX;
      } else {
        this.velocityX = 0;
      }
    }

    if (dy !== 0) {
      const nextY = this.y + dy;

      if (
        this.canMoveTo(
          this.x,
          nextY
        )
      ) {
        this.y = nextY;
      } else {
        this.velocityY = 0;
      }
    }
  }

  canMoveTo(x, y) {
    if (!this.world) {
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

  // =========================================================
  // DESACELERAÇÃO
  // =========================================================

  stopMovement(deltaTime) {
    this.velocityX = this.moveTowards(
      this.velocityX,
      0,
      this.deceleration * deltaTime
    );

    this.velocityY = this.moveTowards(
      this.velocityY,
      0,
      this.deceleration * deltaTime
    );

    this.isMoving =
      Math.abs(this.velocityX) > 1 ||
      Math.abs(this.velocityY) > 1;
  }

  moveTowards(current, target, amount) {
    if (current < target) {
      return Math.min(
        current + amount,
        target
      );
    }

    if (current > target) {
      return Math.max(
        current - amount,
        target
      );
    }

    return target;
  }

  // =========================================================
  // ANIMAÇÃO
  // =========================================================

  updateAnimation(deltaTime) {
    if (this.isMoving) {
      this.walkTime += deltaTime;

      if (this.walkTime >= 0.11) {
        this.walkTime -= 0.11;

        this.walkFrame =
          (this.walkFrame + 1) % 4;
      }
    }
  }

  getWalkOffset() {
    if (!this.isMoving) {
      return 0;
    }

    const animation =
      Math.sin(this.bobTime);

    return animation * 2;
  }

  getLegOffset(side) {
    if (!this.isMoving) {
      return 0;
    }

    const frameOffsets = [
      0,
      3,
      0,
      -3
    ];

    const value =
      frameOffsets[this.walkFrame] || 0;

    return side === "left"
      ? value
      : -value;
  }

  // =========================================================
  // RENDER
  // =========================================================

  render(ctx, camera = { x: 0, y: 0 }) {
    if (!this.visible) {
      return;
    }

    const screenX =
      this.x - camera.x;

    const screenY =
      this.y - camera.y;

    ctx.save();

    // Sombra fica fixa no chão
    this.drawShadow(
      ctx,
      screenX,
      screenY
    );

    // Pequeno movimento vertical
    const bob =
      this.getWalkOffset();

    ctx.translate(
      Math.round(screenX),
      Math.round(screenY + bob)
    );

    this.drawCharacter(ctx);

    ctx.restore();
  }

  // =========================================================
  // SOMBRA
  // =========================================================

  drawShadow(ctx, x, y) {
    ctx.save();

    const movingScale =
      this.isMoving
        ? 1 + Math.sin(this.bobTime) * 0.05
        : 1;

    ctx.fillStyle =
      this.palette.shadow;

    ctx.beginPath();

    ctx.ellipse(
      x,
      y + 4,
      25 * movingScale,
      8 * movingScale,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
  }

  // =========================================================
  // PERSONAGEM
  // =========================================================

  drawCharacter(ctx) {
    const flip =
      this.direction === "left"
        ? -1
        : 1;

    ctx.save();

    ctx.scale(flip, 1);

    // Ordem:
    // mochila -> pernas -> corpo -> braços ->
    // cabeça -> cabelo -> rosto -> bengala.

    this.drawBackpack(ctx);

    this.drawLegs(ctx);

    this.drawBody(ctx);

    this.drawArms(ctx);

    this.drawHead(ctx);

    this.drawHair(ctx);

    this.drawFace(ctx);

    this.drawCane(ctx);

    ctx.restore();
  }

  // =========================================================
  // MOCHILA
  // =========================================================

  drawBackpack(ctx) {
    ctx.fillStyle =
      this.palette.backpackDark ||
      this.palette.backpack;

    ctx.fillStyle =
      this.palette.backpack;

    // Mochila atrás do corpo
    ctx.fillRect(
      -18,
      -35,
      12,
      33
    );

    ctx.fillStyle =
      this.palette.backpackLight;

    ctx.fillRect(
      -16,
      -32,
      8,
      24
    );

    ctx.fillStyle =
      this.palette.backpack;

    ctx.fillRect(
      -17,
      -10,
      10,
      7
    );
  }

  // =========================================================
  // PERNAS
  // =========================================================

  drawLegs(ctx) {
    const leftOffset =
      this.getLegOffset("left");

    const rightOffset =
      this.getLegOffset("right");

    // Perna esquerda
    ctx.fillStyle =
      this.palette.pants;

    ctx.fillRect(
      -13 + leftOffset,
      20,
      11,
      25
    );

    // Perna direita
    ctx.fillRect(
      2 + rightOffset,
      20,
      11,
      25
    );

    // Luz da calça
    ctx.fillStyle =
      this.palette.pantsLight;

    ctx.fillRect(
      -12 + leftOffset,
      22,
      4,
      18
    );

    ctx.fillRect(
      3 + rightOffset,
      22,
      4,
      18
    );

    // Sapatos
    ctx.fillStyle =
      this.palette.shoe;

    ctx.fillRect(
      -16 + leftOffset,
      42,
      15,
      7
    );

    ctx.fillRect(
      0 + rightOffset,
      42,
      15,
      7
    );

    ctx.fillStyle =
      this.palette.shoeLight;

    ctx.fillRect(
      -13 + leftOffset,
      43,
      8,
      2
    );

    ctx.fillRect(
      3 + rightOffset,
      43,
      8,
      2
    );
  }

  // =========================================================
  // CORPO
  // =========================================================

  drawBody(ctx) {
    // Pescoço
    ctx.fillStyle =
      this.palette.skin;

    ctx.fillRect(
      -7,
      -12,
      14,
      12
    );

    // Camisa principal
    ctx.fillStyle =
      this.palette.shirtDark;

    ctx.fillRect(
      -18,
      -5,
      36,
      31
    );

    ctx.fillStyle =
      this.palette.shirt;

    ctx.fillRect(
      -14,
      -5,
      28,
      28
    );

    // Parte iluminada
    ctx.fillStyle =
      this.palette.shirtLight;

    ctx.fillRect(
      -10,
      -3,
      7,
      23
    );

    // Barra inferior
    ctx.fillStyle =
      this.palette.shirtDark;

    ctx.fillRect(
      -14,
      20,
      28,
      6
    );

    // Pequeno detalhe da camisa
    ctx.fillStyle =
      "rgba(255,255,255,0.12)";

    ctx.fillRect(
      -5,
      2,
      10,
      3
    );
  }

  // =========================================================
  // BRAÇOS
  // =========================================================

  drawArms(ctx) {
    let leftOffset = 0;
    let rightOffset = 0;

    if (this.isMoving) {
      const swing =
        Math.sin(this.bobTime) * 3;

      leftOffset = swing;
      rightOffset = -swing;
    }

    // Braço esquerdo
    ctx.fillStyle =
      this.palette.shirtDark;

    ctx.fillRect(
      -22,
      -2 + leftOffset,
      8,
      25
    );

    // Braço direito
    ctx.fillRect(
      14,
      -2 + rightOffset,
      8,
      25
    );

    // Mãos
    ctx.fillStyle =
      this.palette.skin;

    ctx.fillRect(
      -21,
      20 + leftOffset,
      8,
      9
    );

    ctx.fillRect(
      14,
      20 + rightOffset,
      8,
      9
    );

    // Luz nas mãos
    ctx.fillStyle =
      this.palette.skinLight;

    ctx.fillRect(
      -20,
      21 + leftOffset,
      4,
      4
    );

    ctx.fillRect(
      15,
      21 + rightOffset,
      4,
      4
    );
  }

  // =========================================================
  // CABEÇA
  // =========================================================

  drawHead(ctx) {
    // Orelhas
    ctx.fillStyle =
      this.palette.skin;

    ctx.fillRect(
      -22,
      -32,
      7,
      12
    );

    ctx.fillRect(
      15,
      -32,
      7,
      12
    );

    // Pescoço/sombra
    ctx.fillStyle =
      this.palette.skinShadow;

    ctx.fillRect(
      -7,
      -15,
      14,
      8
    );

    // Cabeça
    ctx.fillStyle =
      this.palette.skin;

    ctx.fillRect(
      -19,
      -53,
      38,
      39
    );

    // Luz
    ctx.fillStyle =
      this.palette.skinLight;

    ctx.fillRect(
      -15,
      -49,
      8,
      25
    );

    // Sombra lateral
    ctx.fillStyle =
      this.palette.skinShadow;

    ctx.fillRect(
      12,
      -46,
      6,
      28
    );
  }

  // =========================================================
  // CABELO
  // =========================================================

  drawHair(ctx) {
    ctx.fillStyle =
      this.palette.hair;

    // Topo
    ctx.fillRect(
      -20,
      -56,
      40,
      17
    );

    ctx.fillRect(
      -17,
      -61,
      34,
      8
    );

    ctx.fillRect(
      -13,
      -64,
      25,
      6
    );

    // Laterais
    ctx.fillRect(
      -20,
      -51,
      8,
      21
    );

    ctx.fillRect(
      13,
      -52,
      8,
      22
    );

    // Franja
    ctx.fillRect(
      -13,
      -45,
      26,
      8
    );

    ctx.fillRect(
      -9,
      -42,
      9,
      6
    );

    // Brilho do cabelo
    ctx.fillStyle =
      this.palette.hairLight;

    ctx.fillRect(
      -11,
      -57,
      5,
      7
    );

    ctx.fillRect(
      -5,
      -59,
      4,
      5
    );
  }

  // =========================================================
  // ROSTO
  // =========================================================

  drawFace(ctx) {
    // Olhos
    ctx.fillStyle =
      this.palette.eye;

    ctx.fillRect(
      -12,
      -31,
      5,
      6
    );

    ctx.fillRect(
      7,
      -31,
      5,
      6
    );

    // Brilho dos olhos
    ctx.fillStyle =
      "#f2eee2";

    ctx.fillRect(
      -11,
      -30,
      2,
      2
    );

    ctx.fillRect(
      8,
      -30,
      2,
      2
    );

    // Nariz
    ctx.fillStyle =
      this.palette.skinShadow;

    ctx.fillRect(
      -2,
      -27,
      5,
      5
    );

    // Boca
    ctx.fillStyle =
      "#703f3c";

    ctx.fillRect(
      -5,
      -19,
      10,
      3
    );

    ctx.fillStyle =
      "rgba(255,255,255,0.22)";

    ctx.fillRect(
      -3,
      -19,
      6,
      1
    );
  }

  // =========================================================
  // BENGALA
  // =========================================================

  drawCane(ctx) {
    const wave =
      Math.sin(this.caneWave) * 4;

    const moving =
      this.isMoving;

    const caneX =
      23;

    const topY =
      2 + wave * (moving ? 0.35 : 0);

    const bottomY =
      58;

    ctx.strokeStyle =
      this.palette.caneDark;

    ctx.lineWidth = 5;

    ctx.beginPath();

    ctx.moveTo(
      caneX,
      topY
    );

    ctx.lineTo(
      caneX + wave * 0.18,
      bottomY
    );

    ctx.stroke();

    ctx.strokeStyle =
      this.palette.cane;

    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.moveTo(
      caneX - 1,
      topY
    );

    ctx.lineTo(
      caneX - 1 + wave * 0.18,
      bottomY
    );

    ctx.stroke();

    // Empunhadura
    ctx.fillStyle =
      this.palette.caneDark;

    ctx.fillRect(
      caneX - 4,
      topY - 5,
      10,
      4
    );

    // Ponta
    ctx.fillStyle =
      this.palette.cane;

    ctx.fillRect(
      caneX - 4,
      bottomY,
      8,
      5
    );
  }

  // =========================================================
  // POSIÇÃO
  // =========================================================

  setPosition(x, y) {
    this.x = x;
    this.y = y;

    this.velocityX = 0;
    this.velocityY = 0;
  }

  getPosition() {
    return {
      x: this.x,
      y: this.y
    };
  }

  // =========================================================
  // LIMITES
  // =========================================================

  getBounds() {
    return {
      x:
        this.x -
        this.hitboxWidth / 2,

      y:
        this.y -
        this.hitboxHeight / 2,

      width:
        this.hitboxWidth,

      height:
        this.hitboxHeight
    };
  }

  // =========================================================
  // VELOCIDADE
  // =========================================================

  getSpeed() {
    return Math.hypot(
      this.velocityX,
      this.velocityY
    );
  }

  // =========================================================
  // ESTADO
  // =========================================================

  getIsMoving() {
    return this.isMoving;
  }

  isWalking() {
    return this.isMoving;
  }

  // =========================================================
  // DESTRUIR
  // =========================================================

  destroy() {
    this.world = null;
    this.visible = false;

    this.velocityX = 0;
    this.velocityY = 0;
  }
}