export class World {
  constructor(width = 1600, height = 900) {
    this.width = width;
    this.height = height;
    this.time = 0;
    this.doorOpen = false;

    this.exitDoor = {
      x: 75,
      y: 305,
      width: 120,
      height: 205,
      interactionRadius: 145
    };

    this.objects = [
      { id: "board", type: "board", label: "quadro", x: 515, y: 92, width: 500, height: 185, solid: true, interactionRadius: 105 },
      { id: "clock", type: "clock", label: "relógio", x: 1280, y: 100, width: 92, height: 92, solid: false, interactionRadius: 105 },
      { id: "window1", type: "window", x: 270, y: 105, width: 180, height: 175, solid: true },
      { id: "window2", type: "window", x: 1095, y: 105, width: 180, height: 175, solid: true },
      { id: "cabinet", type: "cabinet", label: "armário", x: 255, y: 565, width: 165, height: 215, solid: true, interactionRadius: 105 },
      { id: "bookshelf", type: "bookshelf", label: "estante", x: 1260, y: 550, width: 185, height: 245, solid: true, interactionRadius: 115 },
      { id: "teacherDesk", type: "teacherDesk", label: "mesa do professor", x: 575, y: 520, width: 300, height: 120, solid: true, interactionRadius: 110 },
      { id: "computer", type: "computer", label: "computador", x: 680, y: 452, width: 92, height: 76, solid: false, interactionRadius: 90 },
      { id: "plant", type: "plant", x: 1450, y: 640, width: 70, height: 150, solid: true },
      { id: "trash", type: "trash", x: 455, y: 690, width: 72, height: 90, solid: true },
      { id: "flag", type: "flag", label: "bandeira", x: 1375, y: 250, width: 110, height: 70, solid: false, interactionRadius: 90 },
      { id: "poster1", type: "poster", x: 320, y: 340, width: 100, height: 120, solid: false },
      { id: "poster2", type: "poster", x: 1190, y: 330, width: 100, height: 125, solid: false }
    ];

    this.desks = [
      { id: "desk_1", x: 470, y: 335, width: 155, height: 100 },
      { id: "desk_2", x: 715, y: 335, width: 155, height: 100 },
      { id: "desk_3", x: 960, y: 335, width: 155, height: 100 },
      { id: "desk_4", x: 470, y: 690, width: 155, height: 100 },
      { id: "desk_5", x: 715, y: 690, width: 155, height: 100 },
      { id: "desk_6", x: 960, y: 690, width: 155, height: 100 }
    ];

    this.reset();
  }

  reset() {
    this.doorOpen = false;
    this.time = 0;
  }

  update(deltaTime) {
    this.time += deltaTime;
  }

  getSpawnPoint() {
    return { x: 1110, y: 600 };
  }

  getSolidRectangles() {
    const solids = [];

    solids.push({ x: 0, y: 0, width: this.width, height: 34 });
    solids.push({ x: 0, y: this.height - 34, width: this.width, height: 34 });
    solids.push({ x: 0, y: 0, width: 34, height: this.height });

    if (!this.doorOpen) {
      solids.push({ x: 0, y: 0, width: 34, height: 305 });
      solids.push({ x: 0, y: 510, width: 34, height: this.height - 510 });
    } else {
      solids.push({ x: 0, y: 0, width: 34, height: this.height });
    }

    for (const object of this.objects) {
      if (object.solid) {
        solids.push({
          x: object.x,
          y: object.y,
          width: object.width,
          height: object.height
        });
      }
    }

    for (const desk of this.desks) {
      solids.push({
        x: desk.x,
        y: desk.y,
        width: desk.width,
        height: desk.height
      });
    }

    return solids;
  }

  collides(x, y, width, height) {
    const a = { x, y, width, height };

    for (const b of this.getSolidRectangles()) {
      if (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
      ) {
        return true;
      }
    }

    return false;
  }

  canPlayerMoveTo(player, x, y) {
    const hitboxWidth = player.hitboxWidth || 20;
    const hitboxHeight = player.hitboxHeight || 18;

    return !this.collides(
      x - hitboxWidth / 2,
      y - hitboxHeight / 2,
      hitboxWidth,
      hitboxHeight
    );
  }

  getInteractionTargets() {
    const targets = [];

    for (const object of this.objects) {
      if (!object.label) continue;
      targets.push({
        ...object,
        centerX: object.x + object.width / 2,
        centerY: object.y + object.height / 2
      });
    }

    for (const desk of this.desks) {
      targets.push({
        ...desk,
        id: desk.id,
        type: "desk",
        label: "mesa",
        centerX: desk.x + desk.width / 2,
        centerY: desk.y + desk.height / 2,
        interactionRadius: 72
      });
    }

    const door = this.exitDoor;
    targets.push({
      ...door,
      id: "exit",
      type: "exit",
      label: this.doorOpen ? "porta aberta" : "porta trancada",
      centerX: door.x + door.width / 2,
      centerY: door.y + door.height / 2
    });

    return targets;
  }

  getNearestInteraction(player) {
    let nearest = null;
    let nearestDistance = Infinity;

    for (const target of this.getInteractionTargets()) {
      const radius = target.interactionRadius || 80;
      const distance = Math.hypot(
        player.x - target.centerX,
        player.y - target.centerY
      );

      if (distance <= radius && distance < nearestDistance) {
        nearest = target;
        nearestDistance = distance;
      }
    }

    return nearest;
  }

  setDoorOpen(open) {
    this.doorOpen = Boolean(open);
  }

  render(ctx, camera) {
    ctx.save();
    ctx.translate(-Math.round(camera.x), -Math.round(camera.y));

    this.drawRoom(ctx);
    this.drawWindows(ctx);
    this.drawBoard(ctx);
    this.drawClock(ctx);
    this.drawDoor(ctx);
    this.drawCabinet(ctx);
    this.drawBookshelf(ctx);
    this.drawTeacherDesk(ctx);
    this.drawComputer(ctx);
    this.drawDesks(ctx);
    this.drawPosters(ctx);
    this.drawFlag(ctx);
    this.drawPlant(ctx);
    this.drawTrash(ctx);

    ctx.restore();
  }

  drawRoom(ctx) {
    ctx.fillStyle = "#17201f";
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = "#202925";
    ctx.fillRect(34, 34, this.width - 68, this.height - 68);

    ctx.fillStyle = "#26302b";
    ctx.fillRect(34, 34, this.width - 68, 300);

    ctx.fillStyle = "#7b6850";
    ctx.fillRect(34, 300, this.width - 68, 8);

    ctx.fillStyle = "#393d38";
    ctx.fillRect(34, 308, this.width - 68, this.height - 342);

    ctx.fillStyle = "#323732";
    for (let x = 45; x < this.width - 40; x += 48) {
      for (let y = 320; y < this.height - 45; y += 48) {
        ctx.fillRect(x, y, 44, 44);
        ctx.fillStyle = "#353a35";
        ctx.fillRect(x + 2, y + 2, 40, 2);
        ctx.fillStyle = "#323732";
      }
    }

    ctx.fillStyle = "#171d1b";
    ctx.fillRect(34, 34, this.width - 68, 5);
    ctx.fillRect(34, this.height - 39, this.width - 68, 5);

    ctx.fillStyle = "rgba(0,0,0,0.24)";
    ctx.fillRect(34, 308, this.width - 68, 18);
  }

  drawWindows(ctx) {
    for (const object of this.objects.filter(item => item.type === "window")) {
      const { x, y, width, height } = object;

      ctx.fillStyle = "#3b3128";
      ctx.fillRect(x - 7, y - 7, width + 14, height + 14);

      ctx.fillStyle = "#8d806d";
      ctx.fillRect(x, y, width, height);

      const sky = ctx.createLinearGradient(x, y, x, y + height);
      sky.addColorStop(0, "#32424a");
      sky.addColorStop(1, "#18262b");
      ctx.fillStyle = sky;
      ctx.fillRect(x + 7, y + 7, width - 14, height - 14);

      ctx.fillStyle = "rgba(231,224,190,0.09)";
      for (let i = 0; i < 7; i++) {
        ctx.fillRect(x + 16 + i * 24, y + 14, 3, height - 28);
      }

      ctx.fillStyle = "#9b8b72";
      ctx.fillRect(x + width / 2 - 3, y, 6, height);
      ctx.fillRect(x, y + height / 2 - 3, width, 6);
    }
  }

  drawBoard(ctx) {
    const o = this.objects.find(item => item.id === "board");
    if (!o) return;

    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(o.x + 10, o.y + 12, o.width, o.height);

    ctx.fillStyle = "#563f2d";
    ctx.fillRect(o.x - 10, o.y - 10, o.width + 20, o.height + 20);

    ctx.fillStyle = "#1e2925";
    ctx.fillRect(o.x, o.y, o.width, o.height);

    ctx.fillStyle = "rgba(236,232,207,0.6)";
    ctx.fillRect(o.x + 36, o.y + 46, 210, 4);
    ctx.fillRect(o.x + 36, o.y + 70, 145, 4);
    ctx.fillRect(o.x + 260, o.y + 46, 130, 4);
    ctx.fillRect(o.x + 260, o.y + 70, 190, 4);

    ctx.fillStyle = "rgba(236,232,207,0.34)";
    ctx.fillRect(o.x + 75, o.y + 120, 100, 4);
    ctx.fillRect(o.x + 75, o.y + 144, 155, 4);
  }

  drawClock(ctx) {
    const o = this.objects.find(item => item.id === "clock");
    const cx = o.x + o.width / 2;
    const cy = o.y + o.height / 2;

    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.arc(cx + 6, cy + 7, 48, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#d2c4a6";
    ctx.beginPath();
    ctx.arc(cx, cy, 46, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#242a29";
    ctx.beginPath();
    ctx.arc(cx, cy, 39, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#d7d1bd";
    ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6;
      const x1 = cx + Math.cos(a) * 31;
      const y1 = cy + Math.sin(a) * 31;
      const x2 = cx + Math.cos(a) * 35;
      const y2 = cy + Math.sin(a) * 35;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    const minute = -Math.PI / 2 + Math.sin(this.time * 0.25) * 0.2;
    const hour = -Math.PI / 2 + Math.cos(this.time * 0.1) * 0.6;

    ctx.strokeStyle = "#d7c178";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(hour) * 19, cy + Math.sin(hour) * 19);
    ctx.stroke();

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(minute) * 29, cy + Math.sin(minute) * 29);
    ctx.stroke();

    ctx.fillStyle = "#d7c178";
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  drawDoor(ctx) {
    const d = this.exitDoor;

    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(d.x + 10, d.y + 12, d.width, d.height);

    ctx.fillStyle = "#5a4030";
    ctx.fillRect(d.x - 9, d.y - 9, d.width + 18, d.height + 18);

    if (this.doorOpen) {
      ctx.fillStyle = "#090c0e";
      ctx.fillRect(d.x, d.y, d.width, d.height);

      ctx.fillStyle = "rgba(222, 195, 125, 0.18)";
      ctx.fillRect(d.x + 12, d.y + 12, d.width - 24, d.height - 24);

      ctx.fillStyle = "#d7c178";
      ctx.fillRect(d.x + d.width - 26, d.y + d.height / 2, 7, 7);
    } else {
      ctx.fillStyle = "#3c3028";
      ctx.fillRect(d.x, d.y, d.width, d.height);

      ctx.fillStyle = "#513d30";
      ctx.fillRect(d.x + 13, d.y + 13, d.width - 26, d.height - 26);

      ctx.fillStyle = "#c05e55";
      ctx.fillRect(d.x + d.width - 27, d.y + d.height / 2, 8, 8);
    }

    ctx.fillStyle = "#2a211c";
    ctx.fillRect(d.x - 3, d.y - 3, 7, d.height + 6);
    ctx.fillRect(d.x + d.width - 4, d.y - 3, 7, d.height + 6);
  }

  drawCabinet(ctx) {
    const o = this.objects.find(item => item.id === "cabinet");
    this.drawWoodFurniture(ctx, o, "#654a36");
    ctx.fillStyle = "#3b3028";
    ctx.fillRect(o.x + 13, o.y + 15, o.width - 26, 82);
    ctx.fillRect(o.x + 13, o.y + 112, o.width - 26, 82);
    ctx.fillStyle = "#c0a36f";
    ctx.fillRect(o.x + o.width - 28, o.y + 52, 6, 16);
    ctx.fillRect(o.x + o.width - 28, o.y + 149, 6, 16);
  }

  drawBookshelf(ctx) {
    const o = this.objects.find(item => item.id === "bookshelf");
    this.drawWoodFurniture(ctx, o, "#594332");

    const colors = ["#745a47", "#80664b", "#5f6b5b", "#7d4f45", "#8b7857"];
    for (let row = 0; row < 3; row++) {
      const baseY = o.y + 25 + row * 68;
      ctx.fillStyle = "#30251f";
      ctx.fillRect(o.x + 13, baseY + 50, o.width - 26, 7);

      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = colors[(i + row) % colors.length];
        ctx.fillRect(o.x + 18 + i * 19, baseY + 8, 14, 42);
      }
    }
  }

  drawTeacherDesk(ctx) {
    const o = this.objects.find(item => item.id === "teacherDesk");
    this.drawWoodFurniture(ctx, o, "#624935");
    ctx.fillStyle = "#473429";
    ctx.fillRect(o.x + 12, o.y + 14, o.width - 24, 38);
    ctx.fillStyle = "#70533b";
    ctx.fillRect(o.x + 24, o.y + 65, 18, 42);
    ctx.fillRect(o.x + o.width - 42, o.y + 65, 18, 42);
  }

  drawComputer(ctx) {
    const o = this.objects.find(item => item.id === "computer");
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(o.x + 7, o.y + 7, o.width, o.height);

    ctx.fillStyle = "#171a1c";
    ctx.fillRect(o.x, o.y, o.width, 56);
    ctx.fillStyle = "#718176";
    ctx.fillRect(o.x + 7, o.y + 7, o.width - 14, 42);

    ctx.fillStyle = "rgba(205, 218, 187, 0.3)";
    ctx.fillRect(o.x + 15, o.y + 15, 32, 3);
    ctx.fillRect(o.x + 15, o.y + 25, 47, 3);
    ctx.fillRect(o.x + 15, o.y + 35, 26, 3);

    ctx.fillStyle = "#222527";
    ctx.fillRect(o.x + 37, o.y + 56, 18, 14);
    ctx.fillRect(o.x + 24, o.y + 69, 45, 6);
  }

  drawDesks(ctx) {
    for (const desk of this.desks) {
      this.drawWoodFurniture(ctx, desk, "#6b4d36");

      ctx.fillStyle = "#513b2c";
      ctx.fillRect(desk.x + 12, desk.y + 13, desk.width - 24, 34);

      ctx.fillStyle = "#3c3028";
      ctx.fillRect(desk.x + 16, desk.y + 54, 14, 33);
      ctx.fillRect(desk.x + desk.width - 30, desk.y + 54, 14, 33);

      ctx.fillStyle = "#a5845c";
      ctx.fillRect(desk.x + 20, desk.y + 17, 46, 3);

      this.drawChair(ctx, desk.x + desk.width / 2, desk.y + desk.height + 23);
    }
  }

  drawChair(ctx, x, y) {
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.fillRect(x - 28, y + 7, 56, 7);

    ctx.fillStyle = "#4e5c5a";
    ctx.fillRect(x - 27, y - 6, 54, 9);
    ctx.fillRect(x - 22, y + 3, 8, 25);
    ctx.fillRect(x + 14, y + 3, 8, 25);
    ctx.fillRect(x - 20, y - 27, 40, 7);
    ctx.fillRect(x - 17, y - 21, 6, 17);
    ctx.fillRect(x + 11, y - 21, 6, 17);
  }

  drawPosters(ctx) {
    for (const o of this.objects.filter(item => item.type === "poster")) {
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(o.x + 5, o.y + 6, o.width, o.height);
      ctx.fillStyle = "#c7b995";
      ctx.fillRect(o.x, o.y, o.width, o.height);
      ctx.fillStyle = "#5d675d";
      ctx.fillRect(o.x + 14, o.y + 16, o.width - 28, 8);
      ctx.fillRect(o.x + 14, o.y + 36, o.width - 38, 5);
      ctx.fillRect(o.x + 14, o.y + 54, o.width - 25, 5);
      ctx.fillStyle = "#8d7650";
      ctx.fillRect(o.x + 14, o.y + 78, 35, 25);
    }
  }

  drawFlag(ctx) {
    const o = this.objects.find(item => item.id === "flag");
    ctx.fillStyle = "#6b5943";
    ctx.fillRect(o.x, o.y, 5, 74);

    ctx.fillStyle = "#3e6a4c";
    ctx.beginPath();
    ctx.moveTo(o.x + 5, o.y + 3);
    ctx.lineTo(o.x + 105, o.y + 22);
    ctx.lineTo(o.x + 5, o.y + 60);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#d6c46e";
    ctx.beginPath();
    ctx.moveTo(o.x + 54, o.y + 14);
    ctx.lineTo(o.x + 82, o.y + 31);
    ctx.lineTo(o.x + 54, o.y + 48);
    ctx.lineTo(o.x + 28, o.y + 31);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#405d77";
    ctx.fillRect(o.x + 45, o.y + 26, 22, 10);
  }

  drawPlant(ctx) {
    const o = this.objects.find(item => item.id === "plant");
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(o.x - 8, o.y + 126, 84, 10);

    ctx.fillStyle = "#754d35";
    ctx.fillRect(o.x + 14, o.y + 90, 48, 46);
    ctx.fillStyle = "#8b5f42";
    ctx.fillRect(o.x + 19, o.y + 97, 38, 6);

    ctx.fillStyle = "#48664e";
    const leaves = [
      [18, 78, -18], [32, 62, 6], [45, 76, 19],
      [26, 48, -9], [47, 48, 11], [35, 35, 0]
    ];

    for (const [dx, dy, tilt] of leaves) {
      ctx.save();
      ctx.translate(o.x + dx, o.y + dy);
      ctx.rotate(tilt * Math.PI / 180);
      ctx.fillRect(-6, -20, 12, 28);
      ctx.restore();
    }
  }

  drawTrash(ctx) {
    const o = this.objects.find(item => item.id === "trash");
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.fillRect(o.x + 4, o.y + 7, o.width, o.height);

    ctx.fillStyle = "#59615d";
    ctx.fillRect(o.x + 8, o.y + 10, o.width - 16, o.height - 10);
    ctx.fillStyle = "#717a73";
    ctx.fillRect(o.x + 3, o.y + 4, o.width - 6, 9);
    ctx.fillStyle = "#3f4743";
    ctx.fillRect(o.x + 16, o.y + 24, 6, 44);
    ctx.fillRect(o.x + o.width - 22, o.y + 24, 6, 44);
  }

  drawWoodFurniture(ctx, object, baseColor) {
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(object.x + 8, object.y + 10, object.width, object.height);

    ctx.fillStyle = baseColor;
    ctx.fillRect(object.x, object.y, object.width, object.height);

    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(object.x + 3, object.y + 3, object.width - 6, 5);

    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.fillRect(object.x + 5, object.y + object.height - 9, object.width - 10, 6);
  }

  renderLighting(ctx, player, camera, gameTime = 0) {
    const px = player.x - camera.x;
    const py = player.y - camera.y;

    ctx.save();

    ctx.fillStyle = "rgba(2,4,6,0.73)";
    ctx.fillRect(0, 0, this.width / 1.0, this.height / 1.0);

    const radius = 190 + Math.sin(gameTime * 1.4) * 6;
    const gradient = ctx.createRadialGradient(
      px, py, 15,
      px, py, radius
    );

    gradient.addColorStop(0, "rgba(255,241,194,0.98)");
    gradient.addColorStop(0.16, "rgba(238,218,171,0.78)");
    gradient.addColorStop(0.46, "rgba(206,190,150,0.3)");
    gradient.addColorStop(0.78, "rgba(80,76,65,0.08)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");

    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = "screen";
    const glow = ctx.createRadialGradient(px, py, 0, px, py, 105);
    glow.addColorStop(0, "rgba(255,226,158,0.13)");
    glow.addColorStop(1, "rgba(255,226,158,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(px, py, 105, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}