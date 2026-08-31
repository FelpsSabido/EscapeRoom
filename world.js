/* ============================================================
   ESCAPE ROOM — WORLD.JS
   Mundo físico e visual da sala
   ============================================================ */

export class World {

    constructor(options = {}) {

        this.width =
            options.width || 2400;

        this.height =
            options.height || 1350;


        this.config = {

            floorColor:
                "#111419",

            floorSecondaryColor:
                "#181c22",

            wallColor:
                "#292e36",

            wallTopColor:
                "#414752",

            wallSideColor:
                "#0a0c10",

            obstacleColor:
                "#20252c",

            obstacleBorderColor:
                "#505762",

            gridColor:
                "rgba(255,255,255,0.025)",

            shadowColor:
                "rgba(0,0,0,0.45)"
        };


        /* ====================================================
           PAREDES
           ==================================================== */

        this.walls = [

            {
                x: 0,
                y: 0,
                width: this.width,
                height: 80,
                type: "wall"
            },

            {
                x: 0,
                y: this.height - 80,
                width: this.width,
                height: 80,
                type: "wall"
            },

            {
                x: 0,
                y: 80,
                width: 80,
                height: this.height - 160,
                type: "wall"
            },

            {
                x: this.width - 80,
                y: 80,
                width: 80,
                height: this.height - 160,
                type: "wall"
            }
        ];


        /* ====================================================
           OBSTÁCULOS
           ==================================================== */

        this.obstacles = [

            {
                x: 850,
                y: 490,
                width: 700,
                height: 150,
                type: "table",
                solid: true
            },

            {
                x: 260,
                y: 300,
                width: 320,
                height: 120,
                type: "table",
                solid: true
            },

            {
                x: 1820,
                y: 300,
                width: 320,
                height: 120,
                type: "table",
                solid: true
            },

            {
                x: 230,
                y: 760,
                width: 250,
                height: 420,
                type: "cabinet",
                solid: true
            },

            {
                x: 1920,
                y: 760,
                width: 250,
                height: 420,
                type: "cabinet",
                solid: true
            },

            {
                x: 650,
                y: 930,
                width: 260,
                height: 110,
                type: "table",
                solid: true
            },

            {
                x: 1490,
                y: 930,
                width: 260,
                height: 110,
                type: "table",
                solid: true
            }
        ];


        /* ====================================================
           DECORAÇÕES
           ==================================================== */

        this.decorations = [

            {
                x: 850,
                y: 105,
                width: 700,
                height: 35,
                type: "board"
            },

            {
                x: 1120,
                y: 0,
                width: 160,
                height: 80,
                type: "door"
            },

            {
                x: 180,
                y: 120,
                width: 220,
                height: 120,
                type: "window"
            },

            {
                x: 2000,
                y: 120,
                width: 220,
                height: 120,
                type: "window"
            },

            {
                x: 980,
                y: 170,
                width: 440,
                height: 12,
                type: "light"
            },

            {
                x: 900,
                y: 720,
                width: 600,
                height: 12,
                type: "light"
            }
        ];


        /* ====================================================
           ÁREA DE JOGO
           ==================================================== */

        this.playArea = {

            x: 80,

            y: 80,

            width:
                this.width - 160,

            height:
                this.height - 160
        };
    }


    initialize() {

        return this;
    }


    update(deltaTime) {

    }


    /* ========================================================
       RENDER
       ======================================================== */

    render(ctx) {

        if (!ctx) {

            return;
        }


        this.renderFloor(ctx);

        this.renderWalls(ctx);

        this.renderDecorations(ctx);

        this.renderObstacles(ctx);

        this.renderAtmosphere(ctx);
    }


    /* ========================================================
       PISO
       ======================================================== */

    renderFloor(ctx) {

        ctx.fillStyle =
            this.config.floorColor;


        ctx.fillRect(
            0,
            0,
            this.width,
            this.height
        );


        ctx.fillStyle =
            this.config.floorSecondaryColor;


        ctx.fillRect(
            80,
            80,
            this.width - 160,
            this.height - 160
        );


        const gridSize =
            64;


        ctx.strokeStyle =
            this.config.gridColor;


        ctx.lineWidth =
            1;


        for (
            let x = 80;
            x < this.width - 80;
            x += gridSize
        ) {

            ctx.beginPath();

            ctx.moveTo(
                x + 0.5,
                80
            );

            ctx.lineTo(
                x + 0.5,
                this.height - 80
            );

            ctx.stroke();
        }


        for (
            let y = 80;
            y < this.height - 80;
            y += gridSize
        ) {

            ctx.beginPath();

            ctx.moveTo(
                80,
                y + 0.5
            );

            ctx.lineTo(
                this.width - 80,
                y + 0.5
            );

            ctx.stroke();
        }
    }


    /* ========================================================
       PAREDES
       ======================================================== */

    renderWalls(ctx) {

        for (
            const wall of this.walls
        ) {

            this.renderWall(
                ctx,
                wall
            );
        }
    }


    renderWall(
        ctx,
        wall
    ) {

        /* Sombra */

        ctx.fillStyle =
            this.config.shadowColor;


        ctx.fillRect(
            wall.x + 12,
            wall.y + 12,
            wall.width,
            wall.height
        );


        /* Corpo */

        ctx.fillStyle =
            this.config.wallColor;


        ctx.fillRect(
            wall.x,
            wall.y,
            wall.width,
            wall.height
        );


        /* Faixa iluminada */

        ctx.fillStyle =
            this.config.wallTopColor;


        if (
            wall.width >
            wall.height
        ) {

            ctx.fillRect(
                wall.x,
                wall.y,
                wall.width,
                10
            );

        } else {

            ctx.fillRect(
                wall.x,
                wall.y,
                10,
                wall.height
            );
        }


        /* Linha inferior */

        ctx.fillStyle =
            this.config.wallSideColor;


        if (
            wall.width >
            wall.height
        ) {

            ctx.fillRect(
                wall.x,
                wall.y +
                wall.height -
                8,
                wall.width,
                8
            );

        } else {

            ctx.fillRect(
                wall.x +
                wall.width -
                8,
                wall.y,
                8,
                wall.height
            );
        }


        ctx.strokeStyle =
            "#0d1015";


        ctx.lineWidth =
            2;


        ctx.strokeRect(
            wall.x,
            wall.y,
            wall.width,
            wall.height
        );
    }


    /* ========================================================
       OBSTÁCULOS
       ======================================================== */

    renderObstacles(ctx) {

        for (
            const obstacle of this.obstacles
        ) {

            this.renderObstacle(
                ctx,
                obstacle
            );
        }
    }


    renderObstacle(
        ctx,
        obstacle
    ) {

        /* Sombra */

        ctx.fillStyle =
            this.config.shadowColor;


        ctx.fillRect(
            obstacle.x + 14,
            obstacle.y + 14,
            obstacle.width,
            obstacle.height
        );


        /* Corpo */

        ctx.fillStyle =
            this.config.obstacleColor;


        ctx.fillRect(
            obstacle.x,
            obstacle.y,
            obstacle.width,
            obstacle.height
        );


        /* Borda externa */

        ctx.strokeStyle =
            this.config.obstacleBorderColor;


        ctx.lineWidth =
            2;


        ctx.strokeRect(
            obstacle.x,
            obstacle.y,
            obstacle.width,
            obstacle.height
        );


        if (
            obstacle.type ===
            "table"
        ) {

            this.renderTableDetails(
                ctx,
                obstacle
            );
        }


        if (
            obstacle.type ===
            "cabinet"
        ) {

            this.renderCabinetDetails(
                ctx,
                obstacle
            );
        }
    }


    /* ========================================================
       MESAS
       ======================================================== */

    renderTableDetails(
        ctx,
        table
    ) {

        /* Superfície */

        ctx.fillStyle =
            "rgba(255,255,255,0.035)";


        ctx.fillRect(
            table.x + 8,
            table.y + 8,
            table.width - 16,
            table.height - 16
        );


        /* Divisão */

        ctx.strokeStyle =
            "rgba(255,255,255,0.08)";


        ctx.lineWidth =
            2;


        ctx.beginPath();


        ctx.moveTo(
            table.x +
            table.width / 2,

            table.y + 8
        );


        ctx.lineTo(
            table.x +
            table.width / 2,

            table.y +
            table.height -
            8
        );


        ctx.stroke();


        /* Bordas internas */

        ctx.strokeStyle =
            "rgba(0,0,0,0.35)";


        ctx.lineWidth =
            4;


        ctx.strokeRect(
            table.x + 8,
            table.y + 8,
            table.width - 16,
            table.height - 16
        );


        /* Pernas */

        ctx.fillStyle =
            "#12151a";


        ctx.fillRect(
            table.x + 18,
            table.y + table.height,
            20,
            18
        );


        ctx.fillRect(
            table.x +
            table.width -
            38,

            table.y +
            table.height,

            20,
            18
        );
    }


    /* ========================================================
       ARMÁRIOS
       ======================================================== */

    renderCabinetDetails(
        ctx,
        cabinet
    ) {

        const doorWidth =
            cabinet.width / 2;


        /* Divisão das portas */

        ctx.strokeStyle =
            "rgba(255,255,255,0.10)";


        ctx.lineWidth =
            2;


        ctx.beginPath();


        ctx.moveTo(
            cabinet.x +
            doorWidth,

            cabinet.y
        );


        ctx.lineTo(
            cabinet.x +
            doorWidth,

            cabinet.y +
            cabinet.height
        );


        ctx.stroke();


        /* Linhas horizontais */

        ctx.strokeStyle =
            "rgba(255,255,255,0.045)";


        ctx.lineWidth =
            1;


        for (
            let y =
                cabinet.y + 70;

            y <
                cabinet.y +
                cabinet.height;

            y += 70
        ) {

            ctx.beginPath();

            ctx.moveTo(
                cabinet.x + 8,
                y
            );

            ctx.lineTo(
                cabinet.x +
                cabinet.width -
                8,

                y
            );

            ctx.stroke();
        }


        /* Maçanetas */

        ctx.fillStyle =
            "#aab0ba";


        ctx.beginPath();


        ctx.arc(
            cabinet.x +
            doorWidth -
            15,

            cabinet.y +
            cabinet.height / 2,

            5,

            0,

            Math.PI * 2
        );


        ctx.fill();


        ctx.beginPath();


        ctx.arc(
            cabinet.x +
            doorWidth +
            15,

            cabinet.y +
            cabinet.height / 2,

            5,

            0,

            Math.PI * 2
        );


        ctx.fill();
    }


    /* ========================================================
       DECORAÇÕES
       ======================================================== */

    renderDecorations(ctx) {

        for (
            const decoration of this.decorations
        ) {

            if (
                decoration.type ===
                "board"
            ) {

                this.renderBoard(
                    ctx,
                    decoration
                );
            }


            if (
                decoration.type ===
                "door"
            ) {

                this.renderDoor(
                    ctx,
                    decoration
                );
            }


            if (
                decoration.type ===
                "window"
            ) {

                this.renderWindow(
                    ctx,
                    decoration
                );
            }


            if (
                decoration.type ===
                "light"
            ) {

                this.renderLight(
                    ctx,
                    decoration
                );
            }
        }
    }


    /* ========================================================
       QUADRO
       ======================================================== */

    renderBoard(
        ctx,
        board
    ) {

        ctx.fillStyle =
            "rgba(0,0,0,0.5)";


        ctx.fillRect(
            board.x + 10,
            board.y + 10,
            board.width,
            board.height
        );


        ctx.fillStyle =
            "#20252c";


        ctx.fillRect(
            board.x,
            board.y,
            board.width,
            board.height
        );


        ctx.strokeStyle =
            "#606773";


        ctx.lineWidth =
            4;


        ctx.strokeRect(
            board.x,
            board.y,
            board.width,
            board.height
        );


        /* Pequenas marcações */

        ctx.strokeStyle =
            "rgba(255,255,255,0.12)";


        ctx.lineWidth =
            2;


        for (
            let x =
                board.x + 30;

            x <
                board.x +
                board.width -
                20;

            x += 80
        ) {

            ctx.beginPath();

            ctx.moveTo(
                x,
                board.y + 10
            );

            ctx.lineTo(
                x + 35,
                board.y + 25
            );

            ctx.stroke();
        }
    }


    /* ========================================================
       PORTA
       ======================================================== */

    renderDoor(
        ctx,
        door
    ) {

        ctx.fillStyle =
            "rgba(0,0,0,0.5)";


        ctx.fillRect(
            door.x + 10,
            door.y + 10,
            door.width,
            door.height
        );


        ctx.fillStyle =
            "#101318";


        ctx.fillRect(
            door.x,
            door.y,
            door.width,
            door.height
        );


        ctx.strokeStyle =
            "#646b76";


        ctx.lineWidth =
            5;


        ctx.strokeRect(
            door.x,
            door.y,
            door.width,
            door.height
        );


        /* Painéis */

        ctx.strokeStyle =
            "rgba(255,255,255,0.10)";


        ctx.lineWidth =
            2;


        ctx.strokeRect(
            door.x + 18,
            door.y + 14,
            door.width - 36,
            door.height - 28
        );


        /* Maçaneta */

        ctx.fillStyle =
            "#c2c8d0";


        ctx.beginPath();


        ctx.arc(
            door.x +
            door.width -
            25,

            door.y +
            door.height / 2,

            5,

            0,

            Math.PI * 2
        );


        ctx.fill();
    }


    /* ========================================================
       JANELAS
       ======================================================== */

    renderWindow(
        ctx,
        window
    ) {

        ctx.fillStyle =
            "#080b10";


        ctx.fillRect(
            window.x,
            window.y,
            window.width,
            window.height
        );


        ctx.fillStyle =
            "rgba(120,140,170,0.10)";


        ctx.fillRect(
            window.x + 8,
            window.y + 8,
            window.width - 16,
            window.height - 16
        );


        ctx.strokeStyle =
            "#555d68";


        ctx.lineWidth =
            5;


        ctx.strokeRect(
            window.x,
            window.y,
            window.width,
            window.height
        );


        ctx.strokeStyle =
            "rgba(255,255,255,0.08)";


        ctx.lineWidth =
            2;


        ctx.beginPath();

        ctx.moveTo(
            window.x +
            window.width / 2,

            window.y + 8
        );

        ctx.lineTo(
            window.x +
            window.width / 2,

            window.y +
            window.height -
            8
        );

        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(
            window.x + 8,

            window.y +
            window.height / 2
        );

        ctx.lineTo(
            window.x +
            window.width -
            8,

            window.y +
            window.height / 2
        );

        ctx.stroke();
    }


    /* ========================================================
       LUZES
       ======================================================== */

    renderLight(
        ctx,
        light
    ) {

        ctx.fillStyle =
            "rgba(230,235,245,0.12)";


        ctx.fillRect(
            light.x,
            light.y,
            light.width,
            light.height
        );


        ctx.fillStyle =
            "rgba(255,255,255,0.65)";


        ctx.fillRect(
            light.x + 5,
            light.y + 3,
            light.width - 10,
            3
        );
    }


    /* ========================================================
       ATMOSFERA
       ======================================================== */

    renderAtmosphere(ctx) {

        const gradient =
            ctx.createRadialGradient(
                this.width / 2,
                this.height / 2,
                250,
                this.width / 2,
                this.height / 2,
                1500
            );


        gradient.addColorStop(
            0,
            "rgba(255,255,255,0.015)"
        );


        gradient.addColorStop(
            1,
            "rgba(0,0,0,0.22)"
        );


        ctx.fillStyle =
            gradient;


        ctx.fillRect(
            0,
            0,
            this.width,
            this.height
        );
    }


    /* ========================================================
       COLISÃO
       ======================================================== */

    collides(
        rect
    ) {

        if (!rect) {

            return false;
        }


        for (
            const wall of this.walls
        ) {

            if (
                this.intersects(
                    rect,
                    wall
                )
            ) {

                return true;
            }
        }


        for (
            const obstacle of this.obstacles
        ) {

            if (
                obstacle.solid &&
                this.intersects(
                    rect,
                    obstacle
                )
            ) {

                return true;
            }
        }


        return false;
    }


    /* ========================================================
       INTERSEÇÃO
       ======================================================== */

    intersects(
        a,
        b
    ) {

        return (

            a.x <
            b.x + b.width

            &&

            a.x + a.width >
            b.x

            &&

            a.y <
            b.y + b.height

            &&

            a.y + a.height >
            b.y
        );
    }


    /* ========================================================
       LIMITES
       ======================================================== */

    getBounds() {

        return {

            x: 0,

            y: 0,

            width:
                this.width,

            height:
                this.height
        };
    }


    /* ========================================================
       RESET
       ======================================================== */

    reset() {

    }


    /* ========================================================
       DESTRUIR
       ======================================================== */

    destroy() {

        this.walls = [];

        this.obstacles = [];

        this.decorations = [];
    }
}