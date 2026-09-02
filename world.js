export class World {
    constructor(options = {}) {
        this.width = options.width ?? 1500;
        this.height = options.height ?? 900;

        this.time = 0;

        this.colors = {
            floor: "#c8a875",
            floorLight: "#d8bd8b",
            floorDark: "#b18c5e",
            grout: "rgba(75, 52, 35, 0.16)",

            wall: "#ead9b9",
            wallDark: "#c9b38d",
            wallShadow: "rgba(55, 38, 25, 0.22)",

            wood: "#8b5e3c",
            woodLight: "#b77d4f",
            woodDark: "#634027",

            metal: "#66717b",
            metalDark: "#3f474d",

            green: "#3e7c55",
            greenDark: "#28533a",

            blue: "#4d7ca8",
            blueDark: "#345875",

            red: "#b85450",
            yellow: "#d7aa45",

            black: "#252525",
            white: "#f7f0df"
        };

        this.bounds = {
            left: 60,
            top: 70,
            right: this.width - 60,
            bottom: this.height - 60
        };

        this.door = {
            x: 1180,
            y: 0,
            width: 180,
            height: 70,
            open: false,
            progress: 0
        };

        this.board = {
            x: 390,
            y: 12,
            width: 540,
            height: 48
        };

        this.walls = [];
        this.obstacles = [];
        this.decorations = [];
        this.interactions = [];

        this.createWalls();
        this.createObstacles();
        this.createDecorations();
        this.createInteractions();
    }

    initialize() {
        this.time = 0;
    }

    update(deltaTime) {
        this.time += deltaTime;

        if (this.door.open) {
            this.door.progress += deltaTime * 3;
        } else {
            this.door.progress -= deltaTime * 3;
        }

        this.door.progress = Math.max(
            0,
            Math.min(1, this.door.progress)
        );
    }

    createWalls() {
        const wallThickness = 70;

        this.walls = [
            {
                x: 0,
                y: 0,
                width: this.door.x,
                height: wallThickness
            },

            {
                x: this.door.x + this.door.width,
                y: 0,
                width: this.width - (this.door.x + this.door.width),
                height: wallThickness
            },

            {
                x: 0,
                y: 0,
                width: wallThickness,
                height: this.height
            },

            {
                x: this.width - wallThickness,
                y: 0,
                width: wallThickness,
                height: this.height
            },

            {
                x: 0,
                y: this.height - wallThickness,
                width: this.width,
                height: wallThickness
            }
        ];
    }

    createObstacles() {
        this.obstacles = [
            // Mesa do professor
            {
                id: "teacher-desk",
                type: "desk",
                x: 565,
                y: 135,
                width: 370,
                height: 105,
                solid: true
            },

            // Fileira esquerda
            {
                id: "desk-1",
                type: "desk",
                x: 190,
                y: 300,
                width: 220,
                height: 95,
                solid: true
            },

            {
                id: "desk-2",
                type: "desk",
                x: 190,
                y: 500,
                width: 220,
                height: 95,
                solid: true
            },

            {
                id: "desk-3",
                type: "desk",
                x: 190,
                y: 700,
                width: 220,
                height: 95,
                solid: true
            },

            // Fileira central
            {
                id: "desk-4",
                type: "desk",
                x: 640,
                y: 300,
                width: 220,
                height: 95,
                solid: true
            },

            {
                id: "desk-5",
                type: "desk",
                x: 640,
                y: 500,
                width: 220,
                height: 95,
                solid: true
            },

            {
                id: "desk-6",
                type: "desk",
                x: 640,
                y: 700,
                width: 220,
                height: 95,
                solid: true
            },

            // Fileira direita
            {
                id: "desk-7",
                type: "desk",
                x: 1090,
                y: 300,
                width: 220,
                height: 95,
                solid: true
            },

            {
                id: "desk-8",
                type: "desk",
                x: 1090,
                y: 500,
                width: 220,
                height: 95,
                solid: true
            },

            // Armários
            {
                id: "cabinet-left",
                type: "cabinet",
                x: 95,
                y: 155,
                width: 180,
                height: 115,
                solid: true
            },

            {
                id: "cabinet-right",
                type: "cabinet",
                x: 1225,
                y: 650,
                width: 180,
                height: 150,
                solid: true
            },

            // Estante
            {
                id: "bookshelf",
                type: "bookshelf",
                x: 90,
                y: 610,
                width: 150,
                height: 190,
                solid: true
            },

            // Mesa do computador
            {
                id: "computer-desk",
                type: "computer-desk",
                x: 1020,
                y: 125,
                width: 245,
                height: 110,
                solid: true
            }
        ];
    }

    createDecorations() {
        this.decorations = [
            {
                type: "board",
                ...this.board
            },

            {
                type: "flag",
                x: 970,
                y: 12,
                width: 105,
                height: 48
            },

            {
                type: "clock",
                x: 1100,
                y: 35,
                radius: 25
            },

            {
                type: "window",
                x: 290,
                y: 15,
                width: 110,
                height: 42
            },

            {
                type: "window",
                x: 105,
                y: 300,
                width: 45,
                height: 150
            },

            {
                type: "window",
                x: 1350,
                y: 180,
                width: 45,
                height: 150
            },

            {
                type: "trash",
                x: 475,
                y: 690,
                width: 55,
                height: 65
            },

            {
                type: "plant",
                x: 1390,
                y: 520,
                width: 55,
                height: 90
            },

            {
                type: "poster",
                x: 285,
                y: 80,
                width: 110,
                height: 75,
                variant: 1
            },

            {
                type: "poster",
                x: 1010,
                y: 80,
                width: 110,
                height: 75,
                variant: 2
            },

            {
                type: "poster",
                x: 120,
                y: 470,
                width: 80,
                height: 90,
                variant: 3
            },

            {
                type: "light",
                x: 430,
                y: 90,
                width: 170,
                height: 22
            },

            {
                type: "light",
                x: 830,
                y: 90,
                width: 170,
                height: 22
            },

            {
                type: "light",
                x: 1170,
                y: 90,
                width: 170,
                height: 22
            }
        ];
    }

    createInteractions() {
        this.interactions = [
            {
                id: "board",
                type: "board",
                x: this.board.x,
                y: this.board.y,
                width: this.board.width,
                height: this.board.height,
                radius: 90,
                label: "Quadro",
                message: "Há algo escrito no quadro."
            },

            {
                id: "computer",
                type: "computer",
                x: 1080,
                y: 145,
                width: 120,
                height: 70,
                radius: 80,
                label: "Computador",
                message: "O computador está ligado."
            },

            {
                id: "cabinet",
                type: "cabinet",
                x: 1225,
                y: 650,
                width: 180,
                height: 150,
                radius: 80,
                label: "Armário",
                message: "Você encontrou um armário."
            },

            {
                id: "bookshelf",
                type: "bookshelf",
                x: 90,
                y: 610,
                width: 150,
                height: 190,
                radius: 80,
                label: "Estante",
                message: "Há livros e alguns objetos na estante."
            },

            {
                id: "door",
                type: "door",
                x: this.door.x,
                y: this.door.y,
                width: this.door.width,
                height: this.door.height,
                radius: 110,
                label: "Porta",
                message: "Esta é a porta da sala."
            },

            {
                id: "teacher-desk",
                type: "desk",
                x: 565,
                y: 135,
                width: 370,
                height: 105,
                radius: 90,
                label: "Mesa do professor",
                message: "Uma mesa cheia de materiais."
            }
        ];
    }

    render(ctx) {
        ctx.save();

        ctx.imageSmoothingEnabled = false;

        this.renderFloor(ctx);
        this.renderWalls(ctx);
        this.renderWindows(ctx);
        this.renderObstacles(ctx);
        this.renderDecorations(ctx);
        this.renderDoor(ctx);
        this.renderAmbientDetails(ctx);

        ctx.restore();
    }

    renderFloor(ctx) {
        ctx.fillStyle = this.colors.floor;
        ctx.fillRect(0, 0, this.width, this.height);

        const tileSize = 50;

        for (let y = 70; y < this.height - 60; y += tileSize) {
            for (let x = 60; x < this.width - 60; x += tileSize) {
                const checker =
                    ((x / tileSize) + (y / tileSize)) % 2 === 0;

                ctx.fillStyle = checker
                    ? this.colors.floorLight
                    : this.colors.floor;

                ctx.fillRect(
                    x,
                    y,
                    tileSize,
                    tileSize
                );
            }
        }

        ctx.strokeStyle = this.colors.grout;
        ctx.lineWidth = 2;

        for (let x = 60; x <= this.width - 60; x += tileSize) {
            ctx.beginPath();
            ctx.moveTo(x, 70);
            ctx.lineTo(x, this.height - 60);
            ctx.stroke();
        }

        for (let y = 70; y <= this.height - 60; y += tileSize) {
            ctx.beginPath();
            ctx.moveTo(60, y);
            ctx.lineTo(this.width - 60, y);
            ctx.stroke();
        }

        // Pequenas marcas decorativas no piso
        ctx.fillStyle = "rgba(92, 61, 37, 0.08)";

        for (let i = 0; i < 45; i++) {
            const x = 75 + ((i * 173) % 1350);
            const y = 85 + ((i * 97) % 730);

            ctx.fillRect(x, y, 3, 2);
        }
    }

    renderWalls(ctx) {
        ctx.fillStyle = this.colors.wall;

        for (const wall of this.walls) {
            ctx.fillRect(
                wall.x,
                wall.y,
                wall.width,
                wall.height
            );
        }

        // Sombra das paredes
        ctx.fillStyle = this.colors.wallShadow;

        ctx.fillRect(
            60,
            65,
            this.width - 120,
            10
        );

        ctx.fillRect(
            55,
            70,
            10,
            this.height - 130
        );

        ctx.fillRect(
            this.width - 65,
            70,
            10,
            this.height - 130
        );

        // Rodapé
        ctx.fillStyle = this.colors.wallDark;

        ctx.fillRect(
            60,
            this.height - 70,
            this.width - 120,
            10
        );

        // Textura simples da parede
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";

        for (let x = 80; x < this.width - 80; x += 45) {
            ctx.fillRect(x, 22, 2, 25);
        }
    }

    renderWindows(ctx) {
        for (const decoration of this.decorations) {
            if (decoration.type !== "window") {
                continue;
            }

            const { x, y, width, height } = decoration;

            ctx.fillStyle = "#75543d";
            ctx.fillRect(
                x - 5,
                y - 5,
                width + 10,
                height + 10
            );

            ctx.fillStyle = "#7fb7d5";
            ctx.fillRect(
                x,
                y,
                width,
                height
            );

            ctx.fillStyle = "rgba(255,255,255,0.25)";

            ctx.fillRect(
                x + 8,
                y + 8,
                width * 0.35,
                height * 0.2
            );

            ctx.strokeStyle = "#d8c4a3";
            ctx.lineWidth = 5;

            ctx.beginPath();

            if (height > width) {
                ctx.moveTo(x + width / 2, y);
                ctx.lineTo(x + width / 2, y + height);
            } else {
                ctx.moveTo(x, y + height / 2);
                ctx.lineTo(x + width, y + height / 2);
            }

            ctx.stroke();

            ctx.strokeStyle = "#674832";
            ctx.lineWidth = 3;

            ctx.strokeRect(
                x,
                y,
                width,
                height
            );
        }
    }

    renderObstacles(ctx) {
        for (const obstacle of this.obstacles) {
            switch (obstacle.type) {
                case "desk":
                    this.renderDesk(ctx, obstacle);
                    break;

                case "cabinet":
                    this.renderCabinet(ctx, obstacle);
                    break;

                case "bookshelf":
                    this.renderBookshelf(ctx, obstacle);
                    break;

                case "computer-desk":
                    this.renderComputerDesk(ctx, obstacle);
                    break;
            }
        }
    }

    renderDesk(ctx, desk) {
        const { x, y, width, height } = desk;

        // Sombra
        ctx.fillStyle = "rgba(55, 35, 20, 0.20)";
        ctx.fillRect(
            x + 8,
            y + 10,
            width,
            height
        );

        // Tampo
        ctx.fillStyle = this.colors.woodDark;
        ctx.fillRect(
            x,
            y,
            width,
            height
        );

        ctx.fillStyle = this.colors.woodLight;
        ctx.fillRect(
            x + 5,
            y + 5,
            width - 10,
            height - 16
        );

        // Borda
        ctx.fillStyle = this.colors.wood;
        ctx.fillRect(
            x,
            y + height - 15,
            width,
            15
        );

        // Pernas
        ctx.fillStyle = this.colors.metalDark;

        ctx.fillRect(
            x + 18,
            y + height - 5,
            12,
            28
        );

        ctx.fillRect(
            x + width - 30,
            y + height - 5,
            12,
            28
        );

        // Caderno
        ctx.fillStyle = "#eee4ce";

        ctx.fillRect(
            x + width / 2 - 35,
            y + 20,
            70,
            42
        );

        ctx.strokeStyle = "rgba(60,50,40,0.3)";
        ctx.lineWidth = 2;

        for (let line = 0; line < 4; line++) {
            ctx.beginPath();

            ctx.moveTo(
                x + width / 2 - 27,
                y + 30 + line * 7
            );

            ctx.lineTo(
                x + width / 2 + 27,
                y + 30 + line * 7
            );

            ctx.stroke();
        }

        // Lápis
        ctx.fillStyle = this.colors.yellow;

        ctx.fillRect(
            x + width - 55,
            y + 18,
            35,
            5
        );

        // Cadeira
        this.renderChair(
            ctx,
            x + width / 2 - 30,
            y + height + 20
        );
    }

    renderChair(ctx, x, y) {
        ctx.fillStyle = "rgba(45, 32, 22, 0.18)";

        ctx.fillRect(
            x + 5,
            y + 7,
            60,
            55
        );

        ctx.fillStyle = this.colors.blueDark;

        ctx.fillRect(
            x,
            y,
            60,
            12
        );

        ctx.fillStyle = this.colors.blue;

        ctx.fillRect(
            x + 5,
            y + 5,
            50,
            25
        );

        ctx.fillStyle = this.colors.metalDark;

        ctx.fillRect(
            x + 8,
            y + 28,
            8,
            32
        );

        ctx.fillRect(
            x + 44,
            y + 28,
            8,
            32
        );
    }

    renderCabinet(ctx, cabinet) {
        const { x, y, width, height } = cabinet;

        ctx.fillStyle = "rgba(40, 30, 20, 0.2)";

        ctx.fillRect(
            x + 8,
            y + 10,
            width,
            height
        );

        ctx.fillStyle = this.colors.metalDark;

        ctx.fillRect(
            x,
            y,
            width,
            height
        );

        ctx.fillStyle = this.colors.metal;

        ctx.fillRect(
            x + 7,
            y + 7,
            width - 14,
            height - 14
        );

        const drawers = Math.max(
            2,
            Math.floor(height / 45)
        );

        const drawerHeight =
            (height - 20) / drawers;

        for (let i = 0; i < drawers; i++) {
            const drawerY =
                y + 10 + i * drawerHeight;

            ctx.fillStyle = "#7d8890";

            ctx.fillRect(
                x + 10,
                drawerY,
                width - 20,
                drawerHeight - 5
            );

            ctx.fillStyle = "#4a5359";

            ctx.fillRect(
                x + width / 2 - 10,
                drawerY + drawerHeight / 2 - 3,
                20,
                6
            );
        }
    }

    renderBookshelf(ctx, shelf) {
        const { x, y, width, height } = shelf;

        ctx.fillStyle = "rgba(40, 25, 15, 0.20)";

        ctx.fillRect(
            x + 8,
            y + 10,
            width,
            height
        );

        ctx.fillStyle = this.colors.woodDark;

        ctx.fillRect(
            x,
            y,
            width,
            height
        );

        ctx.fillStyle = this.colors.wood;

        ctx.fillRect(
            x + 8,
            y + 8,
            width - 16,
            height - 16
        );

        const shelfHeight = 52;

        for (
            let shelfY = y + 18;
            shelfY < y + height - 20;
            shelfY += shelfHeight
        ) {
            ctx.fillStyle = this.colors.woodDark;

            ctx.fillRect(
                x + 10,
                shelfY + shelfHeight - 7,
                width - 20,
                7
            );

            this.renderBooks(
                ctx,
                x + 17,
                shelfY + 5,
                width - 34
            );
        }
    }

    renderBooks(ctx, x, y, width) {
        const colors = [
            this.colors.red,
            this.colors.blue,
            this.colors.green,
            this.colors.yellow,
            "#8e6aa8"
        ];

        let cursor = x;

        let index = 0;

        while (cursor < x + width - 8) {
            const bookWidth =
                10 + ((index * 7) % 10);

            const bookHeight =
                28 + ((index * 5) % 15);

            ctx.fillStyle =
                colors[index % colors.length];

            ctx.fillRect(
                cursor,
                y + 35 - bookHeight,
                bookWidth,
                bookHeight
            );

            cursor += bookWidth + 3;
            index++;
        }
    }

    renderComputerDesk(ctx, desk) {
        this.renderDeskBase(
            ctx,
            desk.x,
            desk.y,
            desk.width,
            desk.height
        );

        const monitorX =
            desk.x + desk.width / 2 - 45;

        const monitorY =
            desk.y + 10;

        // Monitor
        ctx.fillStyle = "#252a2e";

        ctx.fillRect(
            monitorX,
            monitorY,
            90,
            60
        );

        ctx.fillStyle = "#74a9c8";

        ctx.fillRect(
            monitorX + 7,
            monitorY + 7,
            76,
            46
        );

        // Tela
        ctx.fillStyle = "rgba(220,245,255,0.6)";

        ctx.fillRect(
            monitorX + 15,
            monitorY + 15,
            40,
            5
        );

        ctx.fillRect(
            monitorX + 15,
            monitorY + 26,
            55,
            4
        );

        ctx.fillRect(
            monitorX + 15,
            monitorY + 37,
            30,
            4
        );

        // Base
        ctx.fillStyle = "#30363b";

        ctx.fillRect(
            monitorX + 37,
            monitorY + 60,
            16,
            12
        );

        ctx.fillRect(
            monitorX + 25,
            monitorY + 70,
            40,
            7
        );

        // Teclado
        ctx.fillStyle = "#353b3f";

        ctx.fillRect(
            desk.x + 45,
            desk.y + 78,
            150,
            20
        );

        // Teclas
        ctx.fillStyle = "#b9c1c4";

        for (let row = 0; row < 2; row++) {
            for (let key = 0; key < 10; key++) {
                ctx.fillRect(
                    desk.x + 53 + key * 13,
                    desk.y + 82 + row * 7,
                    9,
                    4
                );
            }
        }
    }

    renderDeskBase(ctx, x, y, width, height) {
        ctx.fillStyle = "rgba(55, 35, 20, 0.20)";

        ctx.fillRect(
            x + 8,
            y + 10,
            width,
            height
        );

        ctx.fillStyle = this.colors.woodDark;

        ctx.fillRect(
            x,
            y,
            width,
            height
        );

        ctx.fillStyle = this.colors.woodLight;

        ctx.fillRect(
            x + 5,
            y + 5,
            width - 10,
            height - 15
        );

        ctx.fillStyle = this.colors.woodDark;

        ctx.fillRect(
            x,
            y + height - 15,
            width,
            15
        );
    }

    renderDecorations(ctx) {
        for (const decoration of this.decorations) {
            switch (decoration.type) {
                case "board":
                    this.renderBoard(ctx, decoration);
                    break;

                case "flag":
                    this.renderBrazilFlag(ctx, decoration);
                    break;

                case "clock":
                    this.renderClock(ctx, decoration);
                    break;

                case "trash":
                    this.renderTrash(ctx, decoration);
                    break;

                case "plant":
                    this.renderPlant(ctx, decoration);
                    break;

                case "poster":
                    this.renderPoster(ctx, decoration);
                    break;

                case "light":
                    this.renderCeilingLight(ctx, decoration);
                    break;
            }
        }
    }

    renderBoard(ctx, board) {
        const { x, y, width, height } = board;

        // Sombra
        ctx.fillStyle = "rgba(50, 35, 25, 0.25)";

        ctx.fillRect(
            x + 8,
            y + 8,
            width,
            height
        );

        // Moldura
        ctx.fillStyle = "#6b472d";

        ctx.fillRect(
            x - 8,
            y - 6,
            width + 16,
            height + 12
        );

        // Parte metálica
        ctx.fillStyle = "#927151";

        ctx.fillRect(
            x - 4,
            y - 3,
            width + 8,
            height + 6
        );

        // Quadro verde
        ctx.fillStyle = "#28543a";

        ctx.fillRect(
            x,
            y,
            width,
            height
        );

        // Textura
        ctx.fillStyle = "rgba(255,255,255,0.06)";

        for (let i = 0; i < 25; i++) {
            ctx.fillRect(
                x + 10 + ((i * 53) % (width - 20)),
                y + 5 + ((i * 17) % (height - 10)),
                3,
                2
            );
        }

        // Desenho de matemática
        ctx.strokeStyle = "#f2e6c8";
        ctx.lineWidth = 3;

        ctx.beginPath();

        ctx.moveTo(x + 30, y + 19);
        ctx.lineTo(x + 70, y + 19);

        ctx.moveTo(x + 50, y + 8);
        ctx.lineTo(x + 50, y + 30);

        ctx.stroke();

        // Número
        ctx.font = "bold 18px monospace";
        ctx.fillStyle = "#f4e7c9";

        ctx.fillText(
            "3 + ? = 8",
            x + 115,
            y + 29
        );

        // Pequenos desenhos
        ctx.fillStyle = "#e7d7b7";

        ctx.fillRect(
            x + width - 125,
            y + 12,
            70,
            3
        );

        ctx.fillRect(
            x + width - 125,
            y + 22,
            50,
            3
        );

        // Giz
        ctx.fillStyle = "#eee2c9";

        ctx.fillRect(
            x + 20,
            y + height - 4,
            35,
            5
        );
    }

    renderBrazilFlag(ctx, flag) {
        const { x, y, width, height } = flag;

        ctx.fillStyle = "#315f3d";

        ctx.fillRect(
            x,
            y,
            width,
            height
        );

        // Losango
        ctx.fillStyle = "#e3c447";

        ctx.beginPath();

        ctx.moveTo(
            x + width / 2,
            y + 5
        );

        ctx.lineTo(
            x + width - 10,
            y + height / 2
        );

        ctx.lineTo(
            x + width / 2,
            y + height - 5
        );

        ctx.lineTo(
            x + 10,
            y + height / 2
        );

        ctx.closePath();
        ctx.fill();

        // Círculo
        ctx.fillStyle = "#315f9a";

        ctx.beginPath();

        ctx.arc(
            x + width / 2,
            y + height / 2,
            Math.min(width, height) * 0.27,
            0,
            Math.PI * 2
        );

        ctx.fill();

        // Faixa branca
        ctx.strokeStyle = "#f4ecd7";
        ctx.lineWidth = 3;

        ctx.beginPath();

        ctx.moveTo(
            x + width * 0.30,
            y + height * 0.40
        );

        ctx.quadraticCurveTo(
            x + width * 0.50,
            y + height * 0.50,
            x + width * 0.70,
            y + height * 0.60
        );

        ctx.stroke();

        ctx.fillStyle = "#f2d45c";
        ctx.font = "bold 5px monospace";

        ctx.fillText(
            "ORDEM",
            x + width / 2 - 13,
            y + height / 2 + 2
        );

        ctx.strokeStyle = "#61442e";
        ctx.lineWidth = 2;

        ctx.strokeRect(
            x,
            y,
            width,
            height
        );
    }

    renderClock(ctx, clock) {
        const { x, y, radius } = clock;

        ctx.fillStyle = "rgba(40,30,20,0.2)";

        ctx.beginPath();

        ctx.arc(
            x + 4,
            y + 5,
            radius + 3,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle = "#f1e4c8";

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.strokeStyle = "#68472f";
        ctx.lineWidth = 5;

        ctx.stroke();

        ctx.fillStyle = "#43382f";

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            3,
            0,
            Math.PI * 2
        );

        ctx.fill();

        const minuteAngle =
            ((this.time * 0.05) % (Math.PI * 2)) -
            Math.PI / 2;

        const hourAngle =
            ((this.time * 0.004) % (Math.PI * 2)) -
            Math.PI / 2;

        ctx.strokeStyle = "#46392e";
        ctx.lineWidth = 3;

        ctx.beginPath();

        ctx.moveTo(x, y);

        ctx.lineTo(
            x + Math.cos(hourAngle) * radius * 0.45,
            y + Math.sin(hourAngle) * radius * 0.45
        );

        ctx.stroke();

        ctx.lineWidth = 2;

        ctx.beginPath();

        ctx.moveTo(x, y);

        ctx.lineTo(
            x + Math.cos(minuteAngle) * radius * 0.72,
            y + Math.sin(minuteAngle) * radius * 0.72
        );

        ctx.stroke();
    }

    renderTrash(ctx, trash) {
        const { x, y, width, height } = trash;

        ctx.fillStyle = "rgba(40,30,20,0.18)";

        ctx.fillRect(
            x + 6,
            y + 8,
            width,
            height
        );

        ctx.fillStyle = "#657078";

        ctx.fillRect(
            x,
            y + 10,
            width,
            height - 10
        );

        ctx.fillStyle = "#454d52";

        ctx.fillRect(
            x - 5,
            y,
            width + 10,
            12
        );

        ctx.fillStyle = "#9aa4a8";

        ctx.fillRect(
            x + 8,
            y + 23,
            width - 16,
            3
        );

        ctx.fillRect(
            x + 8,
            y + 35,
            width - 16,
            3
        );
    }

    renderPlant(ctx, plant) {
        const { x, y, width, height } = plant;

        ctx.fillStyle = "rgba(40,30,20,0.16)";

        ctx.fillRect(
            x + 5,
            y + height - 8,
            width,
            10
        );

        // Vaso
        ctx.fillStyle = "#b96543";

        ctx.fillRect(
            x + 10,
            y + height - 35,
            width - 20,
            30
        );

        ctx.fillStyle = "#8e4934";

        ctx.fillRect(
            x + 15,
            y + height - 10,
            width - 30,
            7
        );

        // Folhas
        ctx.fillStyle = "#3d784b";

        ctx.fillRect(
            x + width / 2 - 4,
            y + 20,
            8,
            height - 50
        );

        ctx.fillRect(
            x + 5,
            y + 20,
            25,
            10
        );

        ctx.fillRect(
            x + width - 30,
            y + 30,
            25,
            10
        );

        ctx.fillRect(
            x + 12,
            y + 5,
            20,
            12
        );

        ctx.fillRect(
            x + width - 35,
            y + 10,
            25,
            12
        );
    }

    renderPoster(ctx, poster) {
        const { x, y, width, height, variant } = poster;

        ctx.fillStyle = "rgba(45,30,20,0.16)";

        ctx.fillRect(
            x + 5,
            y + 5,
            width,
            height
        );

        ctx.fillStyle = "#f1dfb9";

        ctx.fillRect(
            x,
            y,
            width,
            height
        );

        ctx.strokeStyle = "#755338";
        ctx.lineWidth = 3;

        ctx.strokeRect(
            x,
            y,
            width,
            height
        );

        if (variant === 1) {
            ctx.fillStyle = this.colors.blue;

            ctx.fillRect(
                x + 15,
                y + 15,
                width - 30,
                18
            );

            ctx.fillStyle = this.colors.yellow;

            ctx.beginPath();

            ctx.arc(
                x + width / 2,
                y + 45,
                12,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.fillStyle = "#54412f";
            ctx.font = "bold 10px monospace";

            ctx.fillText(
                "APRENDA!",
                x + 15,
                y + height - 12
            );
        }

        if (variant === 2) {
            ctx.fillStyle = this.colors.green;

            ctx.fillRect(
                x + 12,
                y + 12,
                width - 24,
                height - 24
            );

            ctx.fillStyle = "#f2e7cc";
            ctx.font = "bold 9px monospace";

            ctx.fillText(
                "ESCOLA",
                x + 25,
                y + 38
            );

            ctx.fillText(
                "SEGURA",
                x + 25,
                y + 53
            );
        }

        if (variant === 3) {
            ctx.fillStyle = this.colors.red;

            ctx.fillRect(
                x + 12,
                y + 12,
                width - 24,
                18
            );

            ctx.fillStyle = this.colors.blue;

            ctx.fillRect(
                x + 12,
                y + 40,
                width - 24,
                30
            );

            ctx.fillStyle = "#f2dfb5";
            ctx.font = "bold 8px monospace";

            ctx.fillText(
                "DICA",
                x + 27,
                y + 60
            );
        }
    }

    renderCeilingLight(ctx, light) {
        const { x, y, width, height } = light;

        const flicker =
            0.85 +
            Math.sin(this.time * 7 + x) * 0.05;

        ctx.save();

        ctx.globalAlpha = flicker;

        ctx.fillStyle = "#f5e8c5";

        ctx.fillRect(
            x,
            y,
            width,
            height
        );

        ctx.fillStyle = "#fff4cf";

        ctx.fillRect(
            x + 10,
            y + 5,
            width - 20,
            6
        );

        ctx.restore();
    }

    renderDoor(ctx) {
        const { x, y, width, height } = this.door;

        // Batente
        ctx.fillStyle = "#63432d";

        ctx.fillRect(
            x - 8,
            y,
            width + 16,
            height + 15
        );

        // Área da porta
        ctx.fillStyle = "#8e5d3e";

        ctx.fillRect(
            x,
            y,
            width,
            height
        );

        // Porta abrindo
        const opening =
            this.door.progress;

        ctx.save();

        ctx.translate(
            x + width,
            y
        );

        ctx.scale(
            1 - opening * 0.85,
            1
        );

        ctx.fillStyle = "#a97048";

        ctx.fillRect(
            -width,
            0,
            width,
            height
        );

        ctx.fillStyle = "#7c4f35";

        ctx.fillRect(
            -width + 12,
            10,
            width - 24,
            5
        );

        ctx.fillRect(
            -width + 12,
            height - 15,
            width - 24,
            5
        );

        // Maçaneta
        ctx.fillStyle = "#d5ad55";

        ctx.beginPath();

        ctx.arc(
            -20,
            height / 2,
            5,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();

        // Placa
        ctx.fillStyle = "#f0d76b";

        ctx.fillRect(
            x + width / 2 - 38,
            y + 8,
            76,
            18
        );

        ctx.fillStyle = "#51412e";
        ctx.font = "bold 9px monospace";

        ctx.textAlign = "center";

        ctx.fillText(
            "SAÍDA",
            x + width / 2,
            y + 20
        );

        ctx.textAlign = "left";
    }

    renderAmbientDetails(ctx) {
        // Pequenos pontos de luz no ambiente
        ctx.save();

        ctx.globalAlpha = 0.06;

        const lights = [
            { x: 515, y: 200 },
            { x: 915, y: 200 },
            { x: 1250, y: 250 },
            { x: 330, y: 620 }
        ];

        for (const light of lights) {
            const gradient = ctx.createRadialGradient(
                light.x,
                light.y,
                10,
                light.x,
                light.y,
                170
            );

            gradient.addColorStop(
                0,
                "rgba(255,230,160,0.9)"
            );

            gradient.addColorStop(
                1,
                "rgba(255,230,160,0)"
            );

            ctx.fillStyle = gradient;

            ctx.beginPath();

            ctx.arc(
                light.x,
                light.y,
                170,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }

        ctx.restore();
    }

    collides(rect) {
        for (const wall of this.walls) {
            if (this.intersects(rect, wall)) {
                return true;
            }
        }

        for (const obstacle of this.obstacles) {
            if (
                obstacle.solid &&
                this.intersects(rect, obstacle)
            ) {
                return true;
            }
        }

        return false;
    }

    canPlayerMoveTo(player, targetX, targetY) {
        if (!player) {
            return true;
        }

        let rect;

        if (
            typeof player.getCollisionRect ===
            "function"
        ) {
            rect = player.getCollisionRect(
                targetX,
                targetY
            );
        } else {
            rect = {
                x: targetX - player.width / 2,
                y: targetY - player.height / 2,
                width: player.width,
                height: player.height
            };
        }

        return !this.collides(rect);
    }

    intersects(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }

    getInteractionTargets() {
        return this.interactions;
    }

    getNearestInteraction(x, y, radius = 80) {
        let nearest = null;
        let nearestDistance = Infinity;

        for (const target of this.interactions) {
            const centerX =
                target.x + target.width / 2;

            const centerY =
                target.y + target.height / 2;

            const distance = Math.hypot(
                centerX - x,
                centerY - y
            );

            const interactionRadius =
                target.radius ?? radius;

            if (
                distance <= interactionRadius &&
                distance < nearestDistance
            ) {
                nearest = target;
                nearestDistance = distance;
            }
        }

        return nearest;
    }

    setDoorOpen(open) {
        this.door.open = Boolean(open);
    }

    getBounds() {
        return {
            width: this.width,
            height: this.height
        };
    }

    getSpawnPoint() {
        return {
            x: 760,
            y: 430
        };
    }

    reset() {
        this.time = 0;
        this.door.open = false;
        this.door.progress = 0;
    }

    destroy() {
        this.walls = [];
        this.obstacles = [];
        this.decorations = [];
        this.interactions = [];
    }
}