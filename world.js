/* ============================================================
   ESCAPE ROOM — WORLD.JS
   Mundo físico e visual da sala
   Versão visual aprimorada
   ============================================================ */

export class World {

    constructor(options = {}) {

        /* ====================================================
           DIMENSÕES
           ==================================================== */

        this.width =
            options.width || 2400;

        this.height =
            options.height || 1350;


        /* ====================================================
           CONFIGURAÇÕES VISUAIS
           ==================================================== */

        this.config = {

            /* Piso */

            floorColor:
                "#3b4652",

            floorSecondaryColor:
                "#465463",

            floorTileColor:
                "rgba(255,255,255,0.035)",

            floorLineColor:
                "rgba(20,25,32,0.35)",


            /* Paredes */

            wallColor:
                "#202936",

            wallTopColor:
                "#526273",

            wallLightColor:
                "#68798c",

            wallSideColor:
                "#111722",


            /* Objetos */

            tableColor:
                "#765238",

            tableTopColor:
                "#a8764e",

            tableEdgeColor:
                "#4c3021",

            cabinetColor:
                "#34495e",

            cabinetLightColor:
                "#49647d",

            cabinetDarkColor:
                "#202c39",


            /* Decoração */

            boardColor:
                "#233c35",

            boardFrameColor:
                "#9b7448",

            doorColor:
                "#713f3f",

            doorLightColor:
                "#a55c52",

            plantColor:
                "#4f8b62",

            plantDarkColor:
                "#2d5940",

            carpetColor:
                "#634b70",

            carpetBorderColor:
                "#8c6ca0",


            /* Luz */

            ambientLight:
                "rgba(255,225,170,0.035)",

            shadowColor:
                "rgba(0,0,0,0.32)",

            deepShadowColor:
                "rgba(0,0,0,0.5)"
        };


        /* ====================================================
           PAREDES
           ==================================================== */

        this.walls = [

            {
                x: 0,
                y: 0,
                width: this.width,
                height: 90,
                type: "wall"
            },

            {
                x: 0,
                y: this.height - 90,
                width: this.width,
                height: 90,
                type: "wall"
            },

            {
                x: 0,
                y: 90,
                width: 90,
                height: this.height - 180,
                type: "wall"
            },

            {
                x: this.width - 90,
                y: 90,
                width: 90,
                height: this.height - 180,
                type: "wall"
            }
        ];


        /* ====================================================
           OBSTÁCULOS
           ==================================================== */

        this.obstacles = [

            /* Mesa central */

            {
                x: 820,
                y: 480,
                width: 760,
                height: 170,
                type: "table",
                solid: true
            },


            /* Mesa esquerda */

            {
                x: 250,
                y: 285,
                width: 340,
                height: 135,
                type: "table",
                solid: true
            },


            /* Mesa direita */

            {
                x: 1810,
                y: 285,
                width: 340,
                height: 135,
                type: "table",
                solid: true
            },


            /* Armário esquerdo */

            {
                x: 220,
                y: 750,
                width: 270,
                height: 440,
                type: "cabinet",
                solid: true
            },


            /* Armário direito */

            {
                x: 1910,
                y: 750,
                width: 270,
                height: 440,
                type: "cabinet",
                solid: true
            },


            /* Mesa inferior esquerda */

            {
                x: 630,
                y: 940,
                width: 280,
                height: 115,
                type: "table",
                solid: true
            },


            /* Mesa inferior direita */

            {
                x: 1490,
                y: 940,
                width: 280,
                height: 115,
                type: "table",
                solid: true
            }
        ];


        /* ====================================================
           DECORAÇÕES
           ==================================================== */

        this.decorations = [

            /* Quadro superior */

            {
                x: 790,
                y: 115,
                width: 820,
                height: 45,
                type: "board"
            },


            /* Porta */

            {
                x: 1110,
                y: 0,
                width: 180,
                height: 90,
                type: "door"
            },


            /* Tapete */

            {
                x: 1020,
                y: 730,
                width: 360,
                height: 190,
                type: "carpet"
            },


            /* Planta esquerda */

            {
                x: 120,
                y: 230,
                width: 110,
                height: 150,
                type: "plant"
            },


            /* Planta direita */

            {
                x: 2170,
                y: 230,
                width: 110,
                height: 150,
                type: "plant"
            },


            /* Quadro esquerdo */

            {
                x: 120,
                y: 500,
                width: 180,
                height: 125,
                type: "picture"
            },


            /* Quadro direito */

            {
                x: 2100,
                y: 500,
                width: 180,
                height: 125,
                type: "picture"
            },


            /* Estante decorativa */

            {
                x: 600,
                y: 180,
                width: 150,
                height: 55,
                type: "shelf"
            },


            {
                x: 1650,
                y: 180,
                width: 150,
                height: 55,
                type: "shelf"
            }
        ];


        /* ====================================================
           ÁREA JOGÁVEL
           ==================================================== */

        this.playArea = {

            x: 90,

            y: 90,

            width:
                this.width - 180,

            height:
                this.height - 180
        };
    }


    /* ========================================================
       INICIALIZAÇÃO
       ======================================================== */

    initialize() {

        return this;
    }


    /* ========================================================
       ATUALIZAÇÃO
       ======================================================== */

    update(deltaTime) {

        /*
         * Mundo atualmente estático.
         *
         * Preparado para:
         *
         * - objetos animados
         * - iluminação dinâmica
         * - portas
         * - puzzles
         * - partículas
         * - eventos
         */
    }


    /* ========================================================
       RENDERIZAÇÃO
       ======================================================== */

    render(ctx) {

        if (!ctx) {

            return;
        }


        this.renderFloor(ctx);

        this.renderWalls(ctx);

        this.renderCarpet(ctx);

        this.renderObstacles(ctx);

        this.renderDecorations(ctx);

        this.renderAmbientLight(ctx);
    }


    /* ========================================================
       PISO
       ======================================================== */

    renderFloor(ctx) {

        /* Base */

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
            90,
            90,
            this.width - 180,
            this.height - 180
        );


        /* Linhas das placas */

        const tileSize =
            72;


        ctx.strokeStyle =
            this.config.floorLineColor;


        ctx.lineWidth =
            2;


        for (
            let x = 90;
            x <= this.width - 90;
            x += tileSize
        ) {

            ctx.beginPath();

            ctx.moveTo(
                x + 0.5,
                90
            );

            ctx.lineTo(
                x + 0.5,
                this.height - 90
            );

            ctx.stroke();
        }


        for (
            let y = 90;
            y <= this.height - 90;
            y += tileSize
        ) {

            ctx.beginPath();

            ctx.moveTo(
                90,
                y + 0.5
            );

            ctx.lineTo(
                this.width - 90,
                y + 0.5
            );

            ctx.stroke();
        }


        /* Pequenos reflexos */

        ctx.strokeStyle =
            this.config.floorTileColor;


        ctx.lineWidth =
            1;


        for (
            let x = 126;
            x < this.width - 90;
            x += tileSize * 2
        ) {

            for (
                let y = 126;
                y < this.height - 90;
                y += tileSize * 2
            ) {

                ctx.beginPath();

                ctx.moveTo(
                    x,
                    y
                );

                ctx.lineTo(
                    x + 18,
                    y
                );

                ctx.stroke();
            }
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


    /* ========================================================
       PAREDE INDIVIDUAL
       ======================================================== */

    renderWall(ctx, wall) {

        /* Sombra externa */

        ctx.fillStyle =
            this.config.deepShadowColor;


        ctx.fillRect(
            wall.x + 14,
            wall.y + 14,
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


        /* Faixa superior */

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
                14
            );

        } else {

            ctx.fillRect(
                wall.x,
                wall.y,
                14,
                wall.height
            );
        }


        /* Faixa de luz */

        ctx.fillStyle =
            this.config.wallLightColor;


        if (
            wall.width >
            wall.height
        ) {

            ctx.fillRect(
                wall.x,
                wall.y + 14,
                wall.width,
                3
            );

        } else {

            ctx.fillRect(
                wall.x + 14,
                wall.y,
                3,
                wall.height
            );
        }


        /* Contorno */

        ctx.strokeStyle =
            this.config.wallSideColor;


        ctx.lineWidth =
            3;


        ctx.strokeRect(
            wall.x,
            wall.y,
            wall.width,
            wall.height
        );
    }


    /* ========================================================
       TAPETE
       ======================================================== */

    renderCarpet(ctx) {

        for (
            const decoration of this.decorations
        ) {

            if (
                decoration.type !==
                "carpet"
            ) {

                continue;
            }


            ctx.fillStyle =
                this.config.shadowColor;


            ctx.fillRect(
                decoration.x + 12,
                decoration.y + 12,
                decoration.width,
                decoration.height
            );


            ctx.fillStyle =
                this.config.carpetColor;


            ctx.fillRect(
                decoration.x,
                decoration.y,
                decoration.width,
                decoration.height
            );


            ctx.strokeStyle =
                this.config.carpetBorderColor;


            ctx.lineWidth =
                5;


            ctx.strokeRect(
                decoration.x,
                decoration.y,
                decoration.width,
                decoration.height
            );


            ctx.strokeStyle =
                "rgba(255,255,255,0.08)";


            ctx.lineWidth =
                2;


            for (
                let x =
                    decoration.x + 25;

                x <
                    decoration.x +
                    decoration.width -
                    25;

                x += 30
            ) {

                ctx.beginPath();

                ctx.moveTo(
                    x,
                    decoration.y + 15
                );

                ctx.lineTo(
                    x,
                    decoration.y +
                    decoration.height -
                    15
                );

                ctx.stroke();
            }
        }
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

    renderObstacle(ctx, obstacle) {

        /* Sombra */

        ctx.fillStyle =
            this.config.shadowColor;


        ctx.fillRect(
            obstacle.x + 14,
            obstacle.y + 16,
            obstacle.width,
            obstacle.height
        );


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

    renderTable(ctx, table) {

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
            this.config.tableTopColor;


        ctx.fillRect(
            table.x,
            table.y,
            table.width,
            18
        );


        /* Borda inferior */

        ctx.fillStyle =
            this.config.tableEdgeColor;


        ctx.fillRect(
            table.x,
            table.y +
            table.height -
            15,
            table.width,
            15
        );


        /* Contorno */

        ctx.strokeStyle =
            this.config.tableEdgeColor;


        ctx.lineWidth =
            4;


        ctx.strokeRect(
            table.x,
            table.y,
            table.width,
            table.height
        );


        /* Detalhes */

        ctx.strokeStyle =
            "rgba(255,220,180,0.12)";


        ctx.lineWidth =
            2;


        ctx.beginPath();

        ctx.moveTo(
            table.x + 25,
            table.y + 45
        );

        ctx.lineTo(
            table.x +
            table.width -
            25,
            table.y + 45
        );

        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(
            table.x + 25,
            table.y +
            table.height -
            45
        );

        ctx.lineTo(
            table.x +
            table.width -
            25,
            table.y +
            table.height -
            45
        );

        ctx.stroke();


        /* Pernas */

        const legWidth =
            18;

        const legHeight =
            28;


        ctx.fillStyle =
            this.config.tableEdgeColor;


        ctx.fillRect(
            table.x + 25,
            table.y + table.height,
            legWidth,
            legHeight
        );


        ctx.fillRect(
            table.x +
            table.width -
            43,
            table.y + table.height,
            legWidth,
            legHeight
        );
    }


    /* ========================================================
       ARMÁRIO
       ======================================================== */

    renderCabinet(ctx, cabinet) {

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
            18
        );


        /* Divisão */

        const doorWidth =
            cabinet.width / 2;


        ctx.strokeStyle =
            this.config.cabinetDarkColor;


        ctx.lineWidth =
            5;


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
            "rgba(255,255,255,0.12)";


        ctx.lineWidth =
            2;


        ctx.strokeRect(
            cabinet.x + 10,
            cabinet.y + 10,
            doorWidth - 15,
            cabinet.height - 20
        );


        ctx.strokeRect(
            cabinet.x + doorWidth + 5,
            cabinet.y + 10,
            doorWidth - 15,
            cabinet.height - 20
        );


        /* Maçanetas */

        ctx.fillStyle =
            "#d4b879";


        ctx.beginPath();

        ctx.arc(
            cabinet.x +
            doorWidth -
            18,

            cabinet.y +
            cabinet.height / 2,

            6,

            0,

            Math.PI * 2
        );

        ctx.fill();


        ctx.beginPath();

        ctx.arc(
            cabinet.x +
            doorWidth +
            18,

            cabinet.y +
            cabinet.height / 2,

            6,

            0,

            Math.PI * 2
        );

        ctx.fill();


        /* Contorno */

        ctx.strokeStyle =
            this.config.cabinetDarkColor;


        ctx.lineWidth =
            4;


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
                "plant"
            ) {

                this.renderPlant(
                    ctx,
                    decoration
                );
            }


            if (
                decoration.type ===
                "picture"
            ) {

                this.renderPicture(
                    ctx,
                    decoration
                );
            }


            if (
                decoration.type ===
                "shelf"
            ) {

                this.renderShelf(
                    ctx,
                    decoration
                );
            }
        }
    }


    /* ========================================================
       QUADRO PRINCIPAL
       ======================================================== */

    renderBoard(ctx, board) {

        ctx.fillStyle =
            this.config.shadowColor;


        ctx.fillRect(
            board.x + 10,
            board.y + 10,
            board.width,
            board.height
        );


        ctx.fillStyle =
            this.config.boardFrameColor;


        ctx.fillRect(
            board.x - 5,
            board.y - 5,
            board.width + 10,
            board.height + 10
        );


        ctx.fillStyle =
            this.config.boardColor;


        ctx.fillRect(
            board.x,
            board.y,
            board.width,
            board.height
        );


        /* Linhas decorativas */

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
                30;

            x += 90
        ) {

            ctx.beginPath();

            ctx.moveTo(
                x,
                board.y + 12
            );

            ctx.lineTo(
                x + 45,
                board.y + 12
            );

            ctx.stroke();
        }
    }


    /* ========================================================
       PORTA
       ======================================================== */

    renderDoor(ctx, door) {

        ctx.fillStyle =
            this.config.deepShadowColor;


        ctx.fillRect(
            door.x + 12,
            door.y + 12,
            door.width,
            door.height
        );


        ctx.fillStyle =
            this.config.doorColor;


        ctx.fillRect(
            door.x,
            door.y,
            door.width,
            door.height
        );


        ctx.fillStyle =
            this.config.doorLightColor;


        ctx.fillRect(
            door.x + 12,
            door.y + 10,
            door.width - 24,
            8
        );


        ctx.strokeStyle =
            "#d09a72";


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
            "rgba(255,255,255,0.12)";


        ctx.lineWidth =
            3;


        ctx.strokeRect(
            door.x + 20,
            door.y + 22,
            door.width - 40,
            25
        );


        ctx.strokeRect(
            door.x + 20,
            door.y + 55,
            door.width - 40,
            25
        );


        /* Maçaneta */

        ctx.fillStyle =
            "#e2c477";


        ctx.beginPath();


        ctx.arc(
            door.x +
            door.width -
            28,

            door.y +
            door.height / 2,

            7,

            0,

            Math.PI * 2
        );


        ctx.fill();
    }


    /* ========================================================
       PLANTA
       ======================================================== */

    renderPlant(ctx, plant) {

        /* Vaso */

        ctx.fillStyle =
            "#9a6245";


        ctx.fillRect(
            plant.x + 30,
            plant.y + 90,
            50,
            42
        );


        ctx.fillStyle =
            "#6e4230";


        ctx.fillRect(
            plant.x + 25,
            plant.y + 90,
            60,
            10
        );


        /* Folhas */

        ctx.fillStyle =
            this.config.plantDarkColor;


        const leaves = [

            [55, 65, 20],
            [35, 55, 18],
            [75, 55, 18],
            [45, 40, 18],
            [65, 35, 20],
            [55, 20, 17]
        ];


        for (
            const leaf of leaves
        ) {

            ctx.beginPath();

            ctx.arc(
                plant.x + leaf[0],
                plant.y + leaf[1],
                leaf[2],
                0,
                Math.PI * 2
            );

            ctx.fill();
        }


        ctx.fillStyle =
            this.config.plantColor;


        ctx.beginPath();

        ctx.arc(
            plant.x + 55,
            plant.y + 48,
            18,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }


    /* ========================================================
       QUADRO DECORATIVO
       ======================================================== */

    renderPicture(ctx, picture) {

        ctx.fillStyle =
            this.config.shadowColor;


        ctx.fillRect(
            picture.x + 8,
            picture.y + 8,
            picture.width,
            picture.height
        );


        ctx.fillStyle =
            "#b78352";


        ctx.fillRect(
            picture.x,
            picture.y,
            picture.width,
            picture.height
        );


        ctx.fillStyle =
            "#253b50";


        ctx.fillRect(
            picture.x + 12,
            picture.y + 12,
            picture.width - 24,
            picture.height - 24
        );


        /* Arte abstrata */

        ctx.fillStyle =
            "#d99b63";


        ctx.beginPath();

        ctx.moveTo(
            picture.x + 25,
            picture.y +
            picture.height -
            25
        );

        ctx.lineTo(
            picture.x + 75,
            picture.y + 35
        );

        ctx.lineTo(
            picture.x + 110,
            picture.y + 75
        );

        ctx.lineTo(
            picture.x + 145,
            picture.y + 25
        );

        ctx.lineTo(
            picture.x +
            picture.width -
            20,

            picture.y +
            picture.height -
            25
        );

        ctx.closePath();

        ctx.fill();


        ctx.strokeStyle =
            "#d8bd72";


        ctx.lineWidth =
            3;


        ctx.strokeRect(
            picture.x,
            picture.y,
            picture.width,
            picture.height
        );
    }


    /* ========================================================
       ESTANTE
       ======================================================== */

    renderShelf(ctx, shelf) {

        ctx.fillStyle =
            this.config.shadowColor;


        ctx.fillRect(
            shelf.x + 8,
            shelf.y + 8,
            shelf.width,
            shelf.height
        );


        ctx.fillStyle =
            "#6f4b34";


        ctx.fillRect(
            shelf.x,
            shelf.y,
            shelf.width,
            shelf.height
        );


        ctx.fillStyle =
            "#b4774b";


        ctx.fillRect(
            shelf.x,
            shelf.y,
            shelf.width,
            8
        );


        /* Objetos sobre a estante */

        ctx.fillStyle =
            "#d08a5b";


        ctx.fillRect(
            shelf.x + 20,
            shelf.y - 22,
            25,
            22
        );


        ctx.fillStyle =
            "#6683a3";


        ctx.fillRect(
            shelf.x + 60,
            shelf.y - 30,
            22,
            30
        );


        ctx.fillStyle =
            "#c4a15a";


        ctx.fillRect(
            shelf.x + 98,
            shelf.y - 18,
            30,
            18
        );


        ctx.fillStyle =
            "#8b638f";


        ctx.fillRect(
            shelf.x + 135,
            shelf.y - 26,
            20,
            26
        );
    }


    /* ========================================================
       LUZ AMBIENTE
       ======================================================== */

    renderAmbientLight(ctx) {

        ctx.fillStyle =
            this.config.ambientLight;


        ctx.fillRect(
            90,
            90,
            this.width - 180,
            this.height - 180
        );


        /*
         * Pontos de luz no teto.
         */

        const lights = [

            {
                x: 500,
                y: 120
            },

            {
                x: 1200,
                y: 120
            },

            {
                x: 1900,
                y: 120
            }
        ];


        for (
            const light of lights
        ) {

            const gradient =
                ctx.createRadialGradient(
                    light.x,
                    light.y,
                    10,
                    light.x,
                    light.y,
                    180
                );


            gradient.addColorStop(
                0,
                "rgba(255,220,150,0.11)"
            );


            gradient.addColorStop(
                1,
                "rgba(255,220,150,0)"
            );


            ctx.fillStyle =
                gradient;


            ctx.beginPath();


            ctx.arc(
                light.x,
                light.y,
                180,
                0,
                Math.PI * 2
            );


            ctx.fill();
        }
    }


    /* ========================================================
       COLISÃO
       ======================================================== */

    collides(rect) {

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
       COLISÃO DO JOGADOR
       ======================================================== */

    canPlayerMoveTo(
        player,
        targetX,
        targetY
    ) {

        if (!player) {

            return true;
        }


        if (
            typeof player.getCollisionRect !==
            "function"
        ) {

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

    intersects(a, b) {

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

        /*
         * Mundo estático.
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