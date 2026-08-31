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
           CONFIGURAÇÕES
           ==================================================== */

        this.config = {

            floorColor:
                "#17191d",

            floorSecondaryColor:
                "#1c1f24",

            wallColor:
                "#292d34",

            wallTopColor:
                "#343943",

            wallSideColor:
                "#111318",

            obstacleColor:
                "#24282e",

            obstacleBorderColor:
                "#414752",

            gridColor:
                "rgba(255,255,255,0.018)",

            shadowColor:
                "rgba(0,0,0,0.35)"
        };


        /* ====================================================
           PAREDES
           ==================================================== */

        this.walls = [

            /*
             * Parede superior
             */

            {
                x: 0,
                y: 0,
                width: this.width,
                height: 80,
                type: "wall"
            },


            /*
             * Parede inferior
             */

            {
                x: 0,
                y: this.height - 80,
                width: this.width,
                height: 80,
                type: "wall"
            },


            /*
             * Parede esquerda
             */

            {
                x: 0,
                y: 80,
                width: 80,
                height: this.height - 160,
                type: "wall"
            },


            /*
             * Parede direita
             */

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

            /*
             * Mesa central
             */

            {
                x: 850,
                y: 490,
                width: 700,
                height: 150,
                type: "table",
                solid: true
            },


            /*
             * Mesa lateral esquerda
             */

            {
                x: 260,
                y: 300,
                width: 320,
                height: 120,
                type: "table",
                solid: true
            },


            /*
             * Mesa lateral direita
             */

            {
                x: 1820,
                y: 300,
                width: 320,
                height: 120,
                type: "table",
                solid: true
            },


            /*
             * Armário esquerdo
             */

            {
                x: 230,
                y: 760,
                width: 250,
                height: 420,
                type: "cabinet",
                solid: true
            },


            /*
             * Armário direito
             */

            {
                x: 1920,
                y: 760,
                width: 250,
                height: 420,
                type: "cabinet",
                solid: true
            },


            /*
             * Pequena mesa inferior esquerda
             */

            {
                x: 650,
                y: 930,
                width: 260,
                height: 110,
                type: "table",
                solid: true
            },


            /*
             * Pequena mesa inferior direita
             */

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
           OBJETOS NÃO SÓLIDOS
           ==================================================== */

        this.decorations = [

            /*
             * Quadro na parede superior
             */

            {
                x: 850,
                y: 105,
                width: 700,
                height: 35,
                type: "board"
            },


            /*
             * Porta
             */

            {
                x: 1120,
                y: 0,
                width: 160,
                height: 80,
                type: "door"
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
         * O mundo atualmente é estático.
         *
         * Este método existe para permitir futuramente:
         *
         * - portas animadas
         * - objetos móveis
         * - iluminação dinâmica
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

        this.renderObstacles(ctx);

        this.renderDecorations(ctx);
    }


    /* ========================================================
       PISO
       ======================================================== */

    renderFloor(ctx) {

        /*
         * Base do piso
         */

        ctx.fillStyle =
            this.config.floorColor;


        ctx.fillRect(
            0,
            0,
            this.width,
            this.height
        );


        /*
         * Área interna
         */

        ctx.fillStyle =
            this.config.floorSecondaryColor;


        ctx.fillRect(
            80,
            80,
            this.width - 160,
            this.height - 160
        );


        /*
         * Pequena grade arquitetônica.
         */

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


    /* ========================================================
       PAREDE INDIVIDUAL
       ======================================================== */

    renderWall(
        ctx,
        wall
    ) {

        /*
         * Sombra
         */

        ctx.fillStyle =
            this.config.shadowColor;


        ctx.fillRect(
            wall.x + 8,
            wall.y + 8,
            wall.width,
            wall.height
        );


        /*
         * Corpo da parede
         */

        ctx.fillStyle =
            this.config.wallColor;


        ctx.fillRect(
            wall.x,
            wall.y,
            wall.width,
            wall.height
        );


        /*
         * Parte superior iluminada
         */

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
                Math.min(
                    10,
                    wall.height
                )
            );

        } else {

            ctx.fillRect(
                wall.x,
                wall.y,
                Math.min(
                    10,
                    wall.width
                ),
                wall.height
            );
        }


        /*
         * Contorno
         */

        ctx.strokeStyle =
            this.config.wallSideColor;


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
       OBSTÁCULO INDIVIDUAL
       ======================================================== */

    renderObstacle(
        ctx,
        obstacle
    ) {

        /*
         * Sombra
         */

        ctx.fillStyle =
            this.config.shadowColor;


        ctx.fillRect(
            obstacle.x + 10,
            obstacle.y + 10,
            obstacle.width,
            obstacle.height
        );


        /*
         * Corpo
         */

        ctx.fillStyle =
            this.config.obstacleColor;


        ctx.fillRect(
            obstacle.x,
            obstacle.y,
            obstacle.width,
            obstacle.height
        );


        /*
         * Borda
         */

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


        /*
         * Detalhes específicos
         */

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
       DETALHES DA MESA
       ======================================================== */

    renderTableDetails(
        ctx,
        table
    ) {

        /*
         * Linha central
         */

        ctx.strokeStyle =
            "rgba(255,255,255,0.06)";


        ctx.lineWidth =
            2;


        ctx.beginPath();


        ctx.moveTo(
            table.x + table.width / 2,
            table.y
        );


        ctx.lineTo(
            table.x + table.width / 2,
            table.y + table.height
        );


        ctx.stroke();


        /*
         * Pequenos detalhes nas extremidades
         */

        ctx.fillStyle =
            "rgba(255,255,255,0.035)";


        ctx.fillRect(
            table.x + 15,
            table.y + 15,
            table.width - 30,
            2
        );


        ctx.fillRect(
            table.x + 15,
            table.y + table.height - 17,
            table.width - 30,
            2
        );
    }


    /* ========================================================
       DETALHES DO ARMÁRIO
       ======================================================== */

    renderCabinetDetails(
        ctx,
        cabinet
    ) {

        const doorWidth =
            cabinet.width / 2;


        ctx.strokeStyle =
            "rgba(255,255,255,0.08)";


        ctx.lineWidth =
            2;


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


        /*
         * Maçanetas
         */

        ctx.fillStyle =
            "rgba(255,255,255,0.16)";


        ctx.beginPath();


        ctx.arc(
            cabinet.x + doorWidth - 15,
            cabinet.y + cabinet.height / 2,
            4,
            0,
            Math.PI * 2
        );


        ctx.fill();


        ctx.beginPath();


        ctx.arc(
            cabinet.x + doorWidth + 15,
            cabinet.y + cabinet.height / 2,
            4,
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
        }
    }


    /* ========================================================
       QUADRO
       ======================================================== */

    renderBoard(
        ctx,
        board
    ) {

        /*
         * Sombra
         */

        ctx.fillStyle =
            "rgba(0,0,0,0.4)";


        ctx.fillRect(
            board.x + 8,
            board.y + 8,
            board.width,
            board.height
        );


        /*
         * Quadro
         */

        ctx.fillStyle =
            "#20252b";


        ctx.fillRect(
            board.x,
            board.y,
            board.width,
            board.height
        );


        /*
         * Moldura
         */

        ctx.strokeStyle =
            "#4a5059";


        ctx.lineWidth =
            4;


        ctx.strokeRect(
            board.x,
            board.y,
            board.width,
            board.height
        );
    }


    /* ========================================================
       PORTA
       ======================================================== */

    renderDoor(
        ctx,
        door
    ) {

        /*
         * A porta fica sobre a parede superior.
         */

        ctx.fillStyle =
            "#15181d";


        ctx.fillRect(
            door.x,
            door.y,
            door.width,
            door.height
        );


        /*
         * Moldura
         */

        ctx.strokeStyle =
            "#555b65";


        ctx.lineWidth =
            4;


        ctx.strokeRect(
            door.x,
            door.y,
            door.width,
            door.height
        );


        /*
         * Maçaneta
         */

        ctx.fillStyle =
            "#aeb4bd";


        ctx.beginPath();


        ctx.arc(
            door.x + door.width - 25,
            door.y + door.height / 2,
            5,
            0,
            Math.PI * 2
        );


        ctx.fill();
    }


    /* ========================================================
       COLISÃO
       ======================================================== */

    collides(
        rect
    ) {

        if (
            !rect
        ) {

            return false;
        }


        /*
         * Colisão com paredes
         */

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


        /*
         * Colisão com objetos sólidos
         */

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
       INTERSEÇÃO DE RETÂNGULOS
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
       RETÂNGULO DE COLISÃO DO MUNDO
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
         * O mundo atualmente é estático.
         *
         * Este método fica preparado para futuras fases.
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