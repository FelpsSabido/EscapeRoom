export class Player {
  constructor(options = {}) {
    this.world = options.world || null;

    this.width = 42;
    this.height = 64;
    this.hitboxWidth = 20;
    this.hitboxHeight = 18;

    this.speed = 210;
    this.acceleration = 1450;
    this.deceleration = 1700;

    this.x = 800;
    this.y = 700;

    this.velocityX = 0;
    this.velocityY = 0;

    this.direction = "down";
    this.walkTime = 0;
    this.walkFrame = 0;
    this.bobTime = 0;
    this.caneWave = 0;
    this.isMoving = false;
    this.visible = true;

    this.palette = {
      skin: "#d49a76",
      skinLight: "#e7b18b",
      skinShadow: "#a96d55",
      hair: "#15171b",
      hairLight: "#2a2c31",
      shirt: "#3f6687",
      shirtLight: "#638eac",
      shirtDark: "#2b4a63",
      pants: "#29343e",
      pantsLight: "#3b4b58",
      shoe: "#16191c",
      shoeLight: "#353a3e",
      cane: "#ded6c2",
      caneDark: "#8f8879",
      backpack: "#704b39",
      backpackLight: "#8d6048",
      eye: "#111315",
      shadow: "rgba(0,0,0,0.48)"
    };

    this.reset();
  }

  reset() {
    const spawn = this.world && typeof this.world.getSpawnPoint === "function"
      ? this.world.getSpawnPoint()
      : { x: 1110, y: 600 };

    this.x = spawn.x;
    this.y = spawn.y;
    this.velocityX = 0;
    this.velocityY = 0;
    this.direction = "down";
    this.walkTime = 0;
    this.walkFrame = 0;
    this.bobTime = 0;
    this.caneWave = 0;
    this.isMoving = false;
  }

  update(deltaTime, input) {
    const movement = input ? input.getMovementVector() : { x: 0, y: 0 };

    const targetX = movement.x * this.speed;
    const targetY = movement.y * this.speed;

    this.velocityX = this.approach(
      this.velocityX,
      targetX,
      (Math.abs(targetX) > 0.001 ? this.acceleration : this.deceleration) * deltaTime
    );

    this.velocityY = this.approach(
      this.velocityY,
      targetY,
      (Math.abs(targetY) > 0.001 ? this.acceleration : this.deceleration) * deltaTime
    );

    this.isMoving = Math.abs(movement.x) > 0 || Math.abs(movement.y) > 0;

    if (this.isMoving) {
      this.updateDirection(movement);
      this.walkTime += deltaTime;
      this.bobTime += deltaTime * 11;

      if (this.walkTime >= 0.1) {
        this.walkTime -= 0.1;
        this.walkFrame = (this.walkFrame + 1) % 4;
      }
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

  approach(current, target, amount) {
    if (current < target) return Math.min(current + amount, target);
    if (current > target) return Math.max(current - amount, target);
    return target;
  }

  updateDirection(movement) {
    if (Math.abs(movement.x) > Math.abs(movement.y)) {
      this.direction = movement.x > 0 ? "right" : "left";
    } else if (movement.y !== 0) {
      this.direction = movement.y > 0 ? "down" : "up";
    }
  }

  moveWithCollision(dx, dy) {
    if (!this.world || typeof this.world.canPlayerMoveTo !== "function") {
      this.x += dx;
      this.y += dy;
      return;
    }

    if (dx !== 0) {
      const nextX = this.x + dx;
      if (this.world.canPlayerMoveTo(this, nextX, this.y)) {
        this.x = nextX;
      } else {
        this.velocityX = 0;
      }
    }

    if (dy !== 0) {
      const nextY = this.y + dy;
      if (this.world.canPlayerMoveTo(this, this.x, nextY)) {
        this.y = nextY;
      } else {
        this.velocityY = 0;
      }
    }
  }

  render(ctx, camera) {
    if (!this.visible) return;

    const screenX = this.x - camera.x;
    const screenY = this.y - camera.y;
    const bob = this.isMoving ? Math.sin(this.bobTime) * 2 : 0;

    ctx.save();
    this.drawShadow(ctx, screenX, screenY);
    ctx.translate(Math.round(screenX), Math.round(screenY + bob));

    const flip = this.direction === "left" ? -1 : 1;
    ctx.scale(flip, 1);

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

  drawShadow(ctx, x, y) {
    ctx.fillStyle = this.palette.shadow;
    ctx.beginPath();
    ctx.ellipse(
      x,
      y + 5,
      this.isMoving ? 27 : 25,
      this.isMoving ? 8.5 : 8,
      0, 0, Math.PI * 2
    );
    ctx.fill();
  }

  drawBackpack(ctx) {
    ctx.fillStyle = this.palette.backpack;
    ctx.fillRect(-19, -34, 13, 36);
    ctx.fillStyle = this.palette.backpackLight;
    ctx.fillRect(-17, -31, 8, 25);
    ctx.fillStyle = "#4e3529";
    ctx.fillRect(-18, -10, 11, 7);
  }

  drawLegs(ctx) {
    const offset = this.isMoving
      ? [0, 3, 0, -3][this.walkFrame]
      : 0;

    ctx.fillStyle = this.palette.pants;
    ctx.fillRect(-13 + offset, 19, 11, 26);
    ctx.fillRect(2 - offset, 19, 11, 26);

    ctx.fillStyle = this.palette.pantsLight;
    ctx.fillRect(-12 + offset, 22, 4, 18);
    ctx.fillRect(3 - offset, 22, 4, 18);

    ctx.fillStyle = this.palette.shoe;
    ctx.fillRect(-16 + offset, 42, 15, 8);
    ctx.fillRect(0 - offset, 42, 15, 8);

    ctx.fillStyle = this.palette.shoeLight;
    ctx.fillRect(-13 + offset, 43, 8, 2);
    ctx.fillRect(3 - offset, 43, 8, 2);
  }

  drawBody(ctx) {
    ctx.fillStyle = this.palette.skin;
    ctx.fillRect(-7, -13, 14, 12);

    ctx.fillStyle = this.palette.shirtDark;
    ctx.fillRect(-18, -6, 36, 31);

    ctx.fillStyle = this.palette.shirt;
    ctx.fillRect(-14, -5, 28, 28);

    ctx.fillStyle = this.palette.shirtLight;
    ctx.fillRect(-10, -3, 7, 23);

    ctx.fillStyle = "rgba(255,255,255,0.13)";
    ctx.fillRect(-5, 2, 10, 3);

    ctx.fillStyle = this.palette.shirtDark;
    ctx.fillRect(-14, 19, 28, 6);
  }

  drawArms(ctx) {
    const swing = this.isMoving ? Math.sin(this.bobTime) * 3 : 0;

    ctx.fillStyle = this.palette.shirtDark;
    ctx.fillRect(-22, -2 + swing, 8, 25);
    ctx.fillRect(14, -2 - swing, 8, 25);

    ctx.fillStyle = this.palette.skin;
    ctx.fillRect(-21, 20 + swing, 8, 9);
    ctx.fillRect(14, 20 - swing, 8, 9);

    ctx.fillStyle = this.palette.skinLight;
    ctx.fillRect(-20, 21 + swing, 4, 4);
    ctx.fillRect(15, 21 - swing, 4, 4);
  }

  drawHead(ctx) {
    ctx.fillStyle = this.palette.skin;
    ctx.fillRect(-22, -32, 7, 12);
    ctx.fillRect(15, -32, 7, 12);

    ctx.fillStyle = this.palette.skinShadow;
    ctx.fillRect(-7, -15, 14, 8);

    ctx.fillStyle = this.palette.skin;
    ctx.fillRect(-19, -53, 38, 39);

    ctx.fillStyle = this.palette.skinLight;
    ctx.fillRect(-15, -49, 8, 25);

    ctx.fillStyle = this.palette.skinShadow;
    ctx.fillRect(12, -46, 6, 28);
  }

  drawHair(ctx) {
    ctx.fillStyle = this.palette.hair;
    ctx.fillRect(-20, -56, 40, 17);
    ctx.fillRect(-17, -61, 34, 8);
    ctx.fillRect(-13, -64, 25, 6);
    ctx.fillRect(-20, -51, 8, 21);
    ctx.fillRect(13, -52, 8, 22);
    ctx.fillRect(-13, -45, 26, 8);
    ctx.fillRect(-9, -42, 9, 6);

    ctx.fillStyle = this.palette.hairLight;
    ctx.fillRect(-11, -57, 5, 7);
    ctx.fillRect(-5, -59, 4, 5);
  }

  drawFace(ctx) {
    ctx.fillStyle = this.palette.eye;
    ctx.fillRect(-12, -31, 5, 6);
    ctx.fillRect(7, -31, 5, 6);

    ctx.fillStyle = "#f2eee2";
    ctx.fillRect(-11, -30, 2, 2);
    ctx.fillRect(8, -30, 2, 2);

    ctx.fillStyle = this.palette.skinShadow;
    ctx.fillRect(-2, -27, 5, 5);

    ctx.fillStyle = "#703f3c";
    ctx.fillRect(-5, -19, 10, 3);
  }

  drawCane(ctx) {
    const wave = Math.sin(this.caneWave) * 4;
    const x = 23;
    const top = 2 + (this.isMoving ? wave * 0.35 : 0);
    const bottom = 58;

    ctx.strokeStyle = this.palette.caneDark;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x + wave * 0.18, bottom);
    ctx.stroke();

    ctx.strokeStyle = this.palette.cane;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 1, top);
    ctx.lineTo(x - 1 + wave * 0.18, bottom);
    ctx.stroke();

    ctx.fillStyle = this.palette.caneDark;
    ctx.fillRect(x - 4, top - 5, 10, 4);

    ctx.fillStyle = this.palette.cane;
    ctx.fillRect(x - 4, bottom, 8, 5);
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.velocityX = 0;
    this.velocityY = 0;
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }

  getBounds() {
    return {
      x: this.x - this.hitboxWidth / 2,
      y: this.y - this.hitboxHeight / 2,
      width: this.hitboxWidth,
      height: this.hitboxHeight
    };
  }

  getSpeed() {
    return Math.hypot(this.velocityX, this.velocityY);
  }

  destroy() {
    this.world = null;
    this.visible = false;
    this.velocityX = 0;
    this.velocityY = 0;
  }
}