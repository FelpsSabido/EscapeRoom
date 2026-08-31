/* ============================================================
   ESCAPE ROOM — WORLD.JS
   Mundo físico e visual da sala
   ============================================================ */

export class World {

    /* ========================================================
       CONSTRUTOR
       ======================================================== */

    constructor(options = {}) {

        /* ====================================================
           DIMENSÕES
           ==================================================== */

        this.width =
            options.width || 2400;

        this.height =
            options.height || 1350;


        /* ====================================================
           CONFIGURAÇÃO VISUAL
           ==================================================== */

        this.config = {

            floorColor:
                "#252a33",

            floorSecondaryColor:
                "#303641",

            floorTileColor:
                "#353c48",

            floorLineColor:
                "rgba(255,255,255,0.035)",


            wallColor:
                "#454b57",

            wallLightColor:
                "#626a78",

            wallDarkColor:
                "#252a32",

            wallEdgeColor:
                "#747d8d",


            tableColor:
                "#634b38",

            tableLightColor:
                "#806247",

            tableDarkColor:
                "#392b21",

            tableEdgeColor:
                "#967456",


            cabinetColor:
                "#3e5365",

            cabinetLightColor:
                "#5d758a",

            cabinetDarkColor:
                "#263642",


            boardColor:
                "#283d45",

            boardLightColor:
                "#4f7780",


            doorColor:
                "#523d32",

            doorLightColor:
                "#765745",

            doorDarkColor:
                "#2d211c",


            metalColor:
                "#aeb7c4",

            metalDarkColor:
                "#596270",


            shadowColor:
                "rgba(0,0,0,0.32)",

            deepShadowColor:
                "rgba(0,0,0,0.50)",


            glowColor:
                "rgba(255,214,130,0.12)"
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

            /* Mesa central */

            {
                x: 850,
                y: 490,
                width: 700,
                height: 150,
                type: "table",
                solid: true
            },


            /* Mesa esquerda */

            {
                x: 260,
                y: 300,
                width: 320,
                height: 120,
                type: "table",
                solid: true
            },


            /* Mesa direita */

            {
                x: 1820,
                y: 300,
                width: 320,
                height: 120,
                type: "table",
                solid: true
            },


            /* Armário esquerdo */

            {
                x: 230,
                y: 760,
                width: 250,
                height: 420,
                type: "cabinet",
                solid: true
            },


            /* Armário direito */

            {
                x: 1920,
                y: 760,
                width: 250,
                height: 420,
                type: "cabinet",
                solid: true
            },


            /* Mesa inferior esquerda */

            {
                x: 650,
                y: 930,
                width: 260,
                height: 110,
                type: "table",
                solid: true
            },


            /* Mesa inferior direita */

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
                y: 170,
                width: 140,
                height: 80,
                type: "painting"
            },


            {
                x: 2080,
                y: 170,
                width: 140,
                height: 80,
                type: "painting"
            },


            {
                x: 760,
                y: 180,
                width: 80,
                height: 80,
                type: "lamp"
            },


            {
                x: 1560,
                y: 180,
                width: 80,
                height: 80,
                type: "lamp"
            }
        ];


        /* ====================================================
           ÁREA JOGÁVEL
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


    /* ========================================================
       INICIALIZAÇÃO
       ======================================================== */

    initialize() {

        return this;
    }


    /* ========================================================
       UPDATE
       ======================================================== */

    update(deltaTime) {

        /*
         * Futuramente:
         *
         * - objetos animados
         * - portas
         * - iluminação
         * - partículas
         * - puzzles
         * - eventos
         */
    }


    /* ========================================================
       RENDER PRINCIPAL
       ======================================================== */

    render(ctx) {

        if (!ctx) {

            return;
        }


        this.renderFloor(ctx);

        this.renderWalls(ctx);

        this.renderDecorations(ctx);

        this.renderObstacles(ctx);

        this.renderLighting(ctx);
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


        /* Área interna */

        ctx.fillStyle =
            this.config.floorSecondaryColor;


        ctx.fillRect(
            80,
            80,
            this.width - 160,
            this.height - 160
        );


        /* ====================================================
           TILES
           ==================================================== */

        const tileSize = 96;


        ctx.strokeStyle =
            this.config.floorLineColor;


        ctx.lineWidth =
            2;


        for (
            let x = 80;
            x < this.width - 80;
            x += tileSize
        ) {

            for (
                let y = 80;
                y < this.height - 80;
                y += tileSize
            ) {

                if (
                    (
                        Math.floor(
                            x / tileSize
                        ) +
                        Math.floor(
                            y / tileSize
                        )
                    ) % 2 === 0
                ) {

                    ctx.fillStyle =
                        "rgba(255,255,255,0.018)";

                    ctx.fillRect(
                        x,
                        y,
                        tileSize,
                        tileSize
                    );
                }
            }
        }


        /* Linhas */

        for (
            let x = 80;
            x <= this.width - 80;
            x += tileSize
        ) {

            ctx.beginPath();

            ctx.moveTo(
                x,
                80
            );

            ctx.lineTo(
                x,
                this.height - 80
            );

            ctx.stroke();
        }


        for (
            let y = 80;
            y <= this.height - 80;
            y += tileSize
        ) {

            ctx.beginPath();

            ctx.moveTo(
                80,
                y
            );

            ctx.lineTo(
                this.width - 80,
                y
            );

            ctx.stroke();
        }


        /* ====================================================
           BORDA DO PISO
           ==================================================== */

        ctx.strokeStyle =
            "rgba(255,255,255,0.10)";

        ctx.lineWidth =
            4;

        ctx.strokeRect(
            80,
            80,
            this.width - 160,
            this.height - 160
        );
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


    /* ========================================================
       PAREDE INDIVIDUAL
       ======================================================== */

    renderWall(
        ctx,
        wall
    ) {

        /* Sombra profunda */

        ctx.fillStyle =
            this.config.deepShadowColor;


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


        /* Parte iluminada */

        ctx.fillStyle =
            this.config.wallLightColor;


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


        /* Parte escura */

        ctx.fillStyle =
            this.config.wallDarkColor;


        if (
            wall.width >
            wall.height
        ) {

            ctx.fillRect(
                wall.x,
                wall.y + wall.height - 12,
                wall.width,
                12
            );

        } else {

            ctx.fillRect(
                wall.x + wall.width - 12,
                wall.y,
                12,
                wall.height
            );
        }


        /* Contorno */

        ctx.strokeStyle =
            this.config.wallEdgeColor;


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


    /* ========================================================
       OBSTÁCULO
       ======================================================== */

    renderObstacle(
        ctx,
        obstacle
    ) {

        if (
            obstacle.type ===
            "table"
        ) {

            this.renderTable(
                ctx,
                obstacle
            );

            return;
        }


        if (
            obstacle.type ===
            "cabinet"
        ) {

            this.renderCabinet(
                ctx,
                obstacle
            );

            return;
        }
    }


    /* ========================================================
       MESA
       ======================================================== */

    renderTable(
        ctx,
        table
    ) {

        /* Sombra */

        ctx.fillStyle =
            this.config.deepShadowColor;


        ctx.fillRect(
            table.x + 14,
            table.y + 16,
            table.width,
            table.height
        );


        /* Corpo */

        ctx.fillStyle =
            this.config.tableColor;


        ctx.fillRect(
            table.x,
            table.y,
            table.width,
            table.height
        );


        /* Parte superior */

        ctx.fillStyle =
            this.config.tableLightColor;


        ctx.fillRect(
            table.x,
            table.y,
            table.width,
            14
        );


        /* Parte inferior */

        ctx.fillStyle =
            this.config.tableDarkColor;


        ctx.fillRect(
            table.x,
            table.y + table.height - 12,
            table.width,
            12
        );


        /* Borda */

        ctx.strokeStyle =
            this.config.tableEdgeColor;


        ctx.lineWidth =
            3;


        ctx.strokeRect(
            table.x,
            table.y,
            table.width,
            table.height
        );


        /* ====================================================
           DETALHES
           ==================================================== */

        ctx.strokeStyle =
            "rgba(255,255,255,0.10)";


        ctx.lineWidth =
            2;


        ctx.beginPath();


        ctx.moveTo(
            table.x + table.width / 2,
            table.y + 15
        );


        ctx.lineTo(
            table.x + table.width / 2,
            table.y + table.height - 15
        );


        ctx.stroke();


        /* Gaveta central */

        if (
            table.width >
            400
        ) {

            ctx.fillStyle =
                "rgba(0,0,0,0.18)";


            ctx.fillRect(
                table.x +
                table.width / 2 -
                80,

                table.y +
                30,

                160,

                45
            );


            ctx.strokeStyle =
                "rgba(255,255,255,0.08)";


            ctx.strokeRect(
                table.x +
                table.width / 2 -
                80,

                table.y +
                30,

                160,

                45
            );
        }


        /* Pequenos objetos sobre a mesa */

        ctx.fillStyle =
            "rgba(210,220,235,0.18)";


        ctx.fillRect(
            table.x + 28,
            table.y + 30,
            45,
            25
        );


        ctx.fillStyle =
            "rgba(255,255,255,0.08)";


        ctx.fillRect(
            table.x + 30,
            table.y + 32,
            41,
            4
        );
    }


    /* ========================================================
       ARMÁRIO
       ======================================================== */

    renderCabinet(
        ctx,
        cabinet
    ) {

        /* Sombra */

        ctx.fillStyle =
            this.config.deepShadowColor;


        ctx.fillRect(
            cabinet.x + 15,
            cabinet.y + 18,
            cabinet.width,
            cabinet.height
        );


        /* Corpo */

        ctx.fillStyle =
            this.config.cabinetColor;


        ctx.fillRect(
            cabinet.x,
            cabinet.y,
            cabinet.width,
            cabinet.height
        );


        /* Parte superior */

        ctx.fillStyle =
            this.config.cabinetLightColor;


        ctx.fillRect(
            cabinet.x,
            cabinet.y,
            cabinet.width,
            12
        );


        /* Parte inferior */

        ctx.fillStyle =
            this.config.cabinetDarkColor;


        ctx.fillRect(
            cabinet.x,
            cabinet.y +
            cabinet.height -
            15,

            cabinet.width,
            15
        );


        /* Divisão */

        const doorWidth =
            cabinet.width / 2;


        ctx.strokeStyle =
            "rgba(255,255,255,0.14)";


        ctx.lineWidth =
            3;


        ctx.beginPath();


        ctx.moveTo(
            cabinet.x + doorWidth,
            cabinet.y
        );


        ctx.lineTo(
            cabinet.x + doorWidth,
            cabinet.y + cabinet.height
        );


        ctx.stroke();


        /* Portas */

        ctx.strokeStyle =
            "rgba(255,255,255,0.08)";


        ctx.lineWidth =
            2;


        ctx.strokeRect(
            cabinet.x + 10,
            cabinet.y + 12,
            doorWidth - 18,
            cabinet.height - 24
        );


        ctx.strokeRect(
            cabinet.x + doorWidth + 8,
            cabinet.y + 12,
            doorWidth - 18,
            cabinet.height - 24
        );


        /* Maçanetas */

        ctx.fillStyle =
            this.config.metalColor;


        ctx.beginPath();


        ctx.arc(
            cabinet.x +
            doorWidth -
            16,

            cabinet.y +
            cabinet.height / 2,

            5,

            0,

            Math.PI * 2
        );


        ctx.fill();


        ctx.fillStyle =
            this.config.metalDarkColor;


        ctx.beginPath();


        ctx.arc(
            cabinet.x +
            doorWidth +
            16,

            cabinet.y +
            cabinet.height / 2,

            5,

            0,

            Math.PI * 2
        );


        ctx.fill();


        /* Contorno */

        ctx.strokeStyle =
            "rgba(255,255,255,0.18)";


        ctx.lineWidth =
            3;


        ctx.strokeRect(
            cabinet.x,
            cabinet.y,
            cabinet.width,
            cabinet.height
        );
    }


    /* ========================================================
       DECORAÇÕES
       ======================================================== */

    renderDecorations(ctx) {

        for (
            const decoration of this.decorations
        ) {

            switch (
                decoration.type
            ) {

                case "board":

                    this.renderBoard(
                        ctx,
                        decoration
                    );

                    break;


                case "door":

                    this.renderDoor(
                        ctx,
                        decoration
                    );

                    break;


                case "painting":

                    this.renderPainting(
                        ctx,
                        decoration
                    );

                    break;


                case "lamp":

                    this.renderLamp(
                        ctx,
                        decoration
                    );

                    break;
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

        /* Sombra */

        ctx.fillStyle =
            "rgba(0,0,0,0.45)";


        ctx.fillRect(
            board.x + 10,
            board.y + 10,
            board.width,
            board.height
        );


        /* Moldura */

        ctx.fillStyle =
            "#171b21";


        ctx.fillRect(
            board.x - 6,
            board.y - 6,
            board.width + 12,
            board.height + 12
        );


        /* Quadro */

        ctx.fillStyle =
            this.config.boardColor;


        ctx.fillRect(
            board.x,
            board.y,
            board.width,
            board.height
        );


        /* Reflexo */

        ctx.fillStyle =
            "rgba(255,255,255,0.06)";


        ctx.fillRect(
            board.x + 8,
            board.y + 7,
            board.width - 16,
            5
        );


        /* Linhas decorativas */

        ctx.strokeStyle =
            this.config.boardLightColor;


        ctx.lineWidth =
            2;


        ctx.beginPath();


        ctx.moveTo(
            board.x + 40,
            board.y + board.height / 2
        );


        ctx.lineTo(
            board.x + board.width - 40,
            board.y + board.height / 2
        );


        ctx.stroke();
    }


    /* ========================================================
       PORTA
       ======================================================== */

    renderDoor(
        ctx,
        door
    ) {

        /* Sombra */

        ctx.fillStyle =
            "rgba(0,0,0,0.5)";


        ctx.fillRect(
            door.x + 8,
            door.y + 8,
            door.width,
            door.height
        );


        /* Corpo */

        ctx.fillStyle =
            this.config.doorColor;


        ctx.fillRect(
            door.x,
            door.y,
            door.width,
            door.height
        );


        /* Parte central */

        ctx.fillStyle =
            this.config.doorLightColor;


        ctx.fillRect(
            door.x + 10,
            door.y + 10,
            door.width - 20,
            door.height - 20
        );


        /* Painel */

        ctx.strokeStyle =
            this.config.doorDarkColor;


        ctx.lineWidth =
            5;


        ctx.strokeRect(
            door.x + 24,
            door.y + 15,
            door.width - 48,
            door.height - 30
        );


        /* Maçaneta */

        ctx.fillStyle =
            this.config.metalColor;


        ctx.beginPath();


        ctx.arc(
            door.x + door.width - 27,
            door.y + door.height / 2,
            6,
            0,
            Math.PI * 2
        );


        ctx.fill();


        /* Contorno */

        ctx.strokeStyle =
            "#8b6d59";


        ctx.lineWidth =
            4;


        ctx.strokeRect(
            door.x,
            door.y,
            door.width,
            door.height
        );
    }


    /* ========================================================
       QUADRO DECORATIVO
       ======================================================== */

    renderPainting(
        ctx,
        painting
    ) {

        /* Sombra */

        ctx.fillStyle =
            "rgba(0,0,0,0.4)";


        ctx.fillRect(
            painting.x + 8,
            painting.y + 8,
            painting.width,
            painting.height
        );


        /* Moldura */

        ctx.fillStyle =
            "#6b513d";


        ctx.fillRect(
            painting.x - 6,
            painting.y - 6,
            painting.width + 12,
            painting.height + 12
        );


        /* Interior */

        ctx.fillStyle =
            "#263b49";


        ctx.fillRect(
            painting.x,
            painting.y,
            painting.width,
            painting.height
        );


        /* Arte abstrata */

        ctx.fillStyle =
            "rgba(213,165,102,0.65)";


        ctx.beginPath();


        ctx.moveTo(
            painting.x + 15,
            painting.y + painting.height - 12
        );


        ctx.lineTo(
            painting.x + 55,
            painting.y + 20
        );


        ctx.lineTo(
            painting.x + 90,
            painting.y + painting.height - 25
        );


        ctx.lineTo(
            painting.x + 125,
            painting.y + 18
        );


        ctx.lineTo(
            painting.x + painting.width - 10,
            painting.y + painting.height - 12
        );


        ctx.closePath();


        ctx.fill();


        ctx.strokeStyle =
            "rgba(255,255,255,0.15)";


        ctx.lineWidth =
            2;


        ctx.strokeRect(
            painting.x,
            painting.y,
            painting.width,
            painting.height
        );
    }


    /* ========================================================
       LUMINÁRIA
       ======================================================== */

    renderLamp(
        ctx,
        lamp
    ) {

        /* Aura */

        const gradient =
            ctx.createRadialGradient(
                lamp.x + lamp.width / 2,
                lamp.y + lamp.height / 2,
                5,
                lamp.x + lamp.width / 2,
                lamp.y + lamp.height / 2,
                90
            );


        gradient.addColorStop(
            0,
            "rgba(255,220,150,0.20)"
        );


        gradient.addColorStop(
            1,
            "rgba(255,220,150,0)"
        );


        ctx.fillStyle =
            gradient;


        ctx.fillRect(
            lamp.x - 50,
            lamp.y - 50,
            lamp.width + 100,
            lamp.height + 100
        );


        /* Luminária */

        ctx.fillStyle =
            "#a9b1bd";


        ctx.fillRect(
            lamp.x + 10,
            lamp.y + 25,
            lamp.width - 20,
            25
        );


        /* Luz */

        ctx.fillStyle =
            "#ffe3a3";


        ctx.fillRect(
            lamp.x + 18,
            lamp.y + 30,
            lamp.width - 36,
            12
        );


        /* Estrutura */

        ctx.strokeStyle =
            "#59616e";


        ctx.lineWidth =
            3;


        ctx.strokeRect(
            lamp.x + 10,
            lamp.y + 25,
            lamp.width - 20,
            25
        );
    }


    /* ========================================================
       ILUMINAÇÃO GERAL
       ======================================================== */

    renderLighting(ctx) {

        /*
         * Vinheta suave nas extremidades.
         */

        const gradient =
            ctx.createRadialGradient(
                this.width / 2,
                this.height / 2,
                250,
                this.width / 2,
                this.height / 2,
                1100
            );


        gradient.addColorStop(
            0,
            "rgba(0,0,0,0)"
        );


        gradient.addColorStop(
            0.65,
            "rgba(0,0,0,0.04)"
        );


        gradient.addColorStop(
            1,
            "rgba(0,0,0,0.28)"
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


        /* Paredes */

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


        /* Obstáculos */

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
       MOVIMENTO DO PLAYER
       ======================================================== */

    canPlayerMoveTo(
        player,
        targetX,
        targetY
    ) {

        if (!player) {

            return true;
        }


        const rect =
            player.getCollisionRect(
                targetX,
                targetY
            );


        return !this.collides(
            rect
        );
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
       BOUNDS
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

        /*
         * Reservado para futuras fases.
         */
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