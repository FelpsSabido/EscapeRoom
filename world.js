/* ============================================================
   ESCAPE ROOM — WORLD.JS
   Sala de aula pixel art — versão visual avançada
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

            floor:
                "#c99a67",

            floorLight:
                "#d9ad78",

            floorDark:
                "#b98250",

            wall:
                "#d8d0bd",

            wallLight:
                "#eee7d6",

            wallDark:
                "#a99f8b",

            wood:
                "#8f5735",

            woodLight:
                "#b87548",

            woodDark:
                "#633a27",

            desk:
                "#c48750",

            deskLight:
                "#dfa36b",

            deskDark:
                "#75452c",

            metal:
                "#59616a",

            metalLight:
                "#858e98",

            board:
                "#263d36",

            boardLight:
                "#35564b",

            chalk:
                "#eee9d8",

            window:
                "#91c9dc",

            windowLight:
                "#c4edf5",

            plant:
                "#4f7d43",

            plantLight:
                "#76a95c",

            plantDark:
                "#315a32",

            flagGreen:
                "#16843b",

            flagYellow:
                "#f5d33c",

            flagBlue:
                "#2455a4",

            flagWhite:
                "#f4f0df",

            shadow:
                "rgba(40,25,15,0.25)",

            deepShadow:
                "rgba(30,20,15,0.38)",

            outline:
                "#513c31"
        };


        /* ====================================================
           PAREDES
           ==================================================== */

        this.walls = [

            {
                x: 0,
                y: 0,
                width: this.width,
                height: 95,
                type: "wall"
            },

            {
                x: 0,
                y: this.height - 95,
                width: this.width,
                height: 95,
                type: "wall"
            },

            {
                x: 0,
                y: 95,
                width: 95,
                height: this.height - 190,
                type: "wall"
            },

            {
                x: this.width - 95,
                y: 95,
                width: 95,
                height: this.height - 190,
                type: "wall"
            }
        ];


        /* ====================================================
           MESAS DOS ALUNOS
           ==================================================== */

        this.obstacles = [];


        const deskPositions = [

            [280, 245],
            [600, 245],
            [920, 245],
            [1240, 245],
            [1560, 245],
            [1880, 245],

            [280, 430],
            [600, 430],
            [920, 430],
            [1240, 430],
            [1560, 430],
            [1880, 430],

            [280, 760],
            [600, 760],
            [920, 760],
            [1240, 760],
            [1560, 760],
            [1880, 760],

            [280, 945],
            [600, 945],
            [920, 945],
            [1240, 945],
            [1560, 945],
            [1880, 945]
        ];


        for (
            const position of deskPositions
        ) {

            this.obstacles.push({

                x:
                    position[0],

                y:
                    position[1],

                width:
                    190,

                height:
                    105,

                type:
                    "studentDesk",

                solid:
                    true
            });
        }


        /* ====================================================
           MESA DO PROFESSOR
           ==================================================== */

        this.obstacles.push({

            x:
                1080,

            y:
                1080,

            width:
                240,

            height:
                115,

            type:
                "teacherDesk",

            solid:
                true
        });


        /* ====================================================
           ARMÁRIOS
           ==================================================== */

        this.obstacles.push({

            x:
                145,

            y:
                180,

            width:
                90,

            height:
                390,

            type:
                "cabinet",

            solid:
                true
        });


        this.obstacles.push({

            x:
                2165,

            y:
                180,

            width:
                90,

            height:
                390,

            type:
                "cabinet",

            solid:
                true
        });


        /* ====================================================
           ESTANTE
           ==================================================== */

        this.obstacles.push({

            x:
                145,

            y:
                700,

            width:
                150,

            height:
                330,

            type:
                "bookshelf",

            solid:
                true
        });


        /* ====================================================
           ÁREA DE JOGO
           ==================================================== */

        this.playArea = {

            x:
                95,

            y:
                95,

            width:
                this.width - 190,

            height:
                this.height - 190
        };


        /* ====================================================
           DECORAÇÕES
           ==================================================== */

        this.decorations = [

            /* QUADRO */

            {
                x:
                    650,

                y:
                    115,

                width:
                    1100,

                height:
                    125,

                type:
                    "board"
            },


            /* BANDEIRA DO BRASIL */

            {
                x:
                    1860,

                y:
                    112,

                width:
                    210,

                height:
                    135,

                type:
                    "brazilFlag"
            },


            /* JANELAS */

            {
                x:
                    310,

                y:
                    112,

                width:
                    270,

                height:
                    105,

                type:
                    "window"
            },


            {
                x:
                    1830,

                y:
                    112,

                width:
                    0,

                height:
                    0,

                type:
                    "none"
            },


            /* PORTA */

            {
                x:
                    1100,

                y:
                    0,

                width:
                    200,

                height:
                    95,

                type:
                    "door"
            },


            /* PLANTAS */

            {
                x:
                    360,

                y:
                    1110,

                width:
                    100,

                height:
                    100,

                type:
                    "plant"
            },


            {
                x:
                    1980,

                y:
                    1110,

                width:
                    100,

                height:
                    100,

                type:
                    "plant"
            }
        ];
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
         * Mundo estático.
         *
         * Preparado para futuras animações.
         */
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
    }


    /* ========================================================
       PISO
       ======================================================== */

    renderFloor(ctx) {

        ctx.fillStyle =
            this.config.floorDark;

        ctx.fillRect(
            0,
            0,
            this.width,
            this.height
        );


        ctx.fillStyle =
            this.config.floor;

        ctx.fillRect(
            95,
            95,
            this.width - 190,
            this.height - 190
        );


        /*
         * Tábuas do piso.
         */

        const plankHeight =
            48;


        ctx.strokeStyle =
            "rgba(80,45,25,0.10)";

        ctx.lineWidth =
            2;


        for (
            let y = 95;
            y < this.height - 95;
            y += plankHeight
        ) {

            ctx.beginPath();

            ctx.moveTo(
                95,
                y
            );

            ctx.lineTo(
                this.width - 95,
                y
            );

            ctx.stroke();
        }


        /*
         * Linhas alternadas das tábuas.
         */

        for (
            let y = 95;
            y < this.height - 95;
            y += plankHeight
        ) {

            const offset =
                ((y / plankHeight) % 2) *
                110;


            for (
                let x = 95 - offset;
                x < this.width;
                x += 220
            ) {

                ctx.beginPath();

                ctx.moveTo(
                    x,
                    y
                );

                ctx.lineTo(
                    x,
                    y + plankHeight
                );

                ctx.stroke();
            }
        }


        /*
         * Pequenas marcas da madeira.
         */

        ctx.strokeStyle =
            "rgba(100,55,30,0.08)";

        ctx.lineWidth =
            1;


        for (
            let y = 125;
            y < this.height - 100;
            y += 96
        ) {

            for (
                let x = 130;
                x < this.width - 100;
                x += 260
            ) {

                ctx.beginPath();

                ctx.moveTo(
                    x,
                    y
                );

                ctx.quadraticCurveTo(
                    x + 35,
                    y - 5,
                    x + 70,
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


    renderWall(ctx, wall) {

        /*
         * Sombra.
         */

        ctx.fillStyle =
            this.config.shadow;

        ctx.fillRect(
            wall.x + 10,
            wall.y + 10,
            wall.width,
            wall.height
        );


        /*
         * Parede.
         */

        ctx.fillStyle =
            this.config.wall;

        ctx.fillRect(
            wall.x,
            wall.y,
            wall.width,
            wall.height
        );


        /*
         * Parte iluminada.
         */

        ctx.fillStyle =
            this.config.wallLight;


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


        /*
         * Rodapé.
         */

        ctx.fillStyle =
            this.config.wallDark;


        if (
            wall.width >
            wall.height
        ) {

            ctx.fillRect(
                wall.x,
                wall.y + wall.height - 18,
                wall.width,
                18
            );

        } else {

            ctx.fillRect(
                wall.x + wall.width - 18,
                wall.y,
                18,
                wall.height
            );
        }


        /*
         * Contorno.
         */

        ctx.strokeStyle =
            this.config.outline;

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

        /*
         * Sombra.
         */

        ctx.fillStyle =
            this.config.deepShadow;

        ctx.fillRect(
            obstacle.x + 9,
            obstacle.y + 11,
            obstacle.width,
            obstacle.height
        );


        if (
            obstacle.type ===
            "studentDesk"
        ) {

            this.renderStudentDesk(
                ctx,
                obstacle
            );

            return;
        }


        if (
            obstacle.type ===
            "teacherDesk"
        ) {

            this.renderTeacherDesk(
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


        if (
            obstacle.type ===
            "bookshelf"
        ) {

            this.renderBookshelf(
                ctx,
                obstacle
            );
        }
    }


    /* ========================================================
       CARTEIRA DO ALUNO
       ======================================================== */

    renderStudentDesk(
        ctx,
        desk
    ) {

        /*
         * Tampo.
         */

        ctx.fillStyle =
            this.config.desk;

        ctx.fillRect(
            desk.x,
            desk.y,
            desk.width,
            desk.height
        );


        /*
         * Parte iluminada.
         */

        ctx.fillStyle =
            this.config.deskLight;

        ctx.fillRect(
            desk.x + 8,
            desk.y + 8,
            desk.width - 16,
            12
        );


        /*
         * Frente da carteira.
         */

        ctx.fillStyle =
            this.config.deskDark;

        ctx.fillRect(
            desk.x + 8,
            desk.y + 65,
            desk.width - 16,
            32
        );


        /*
         * Pés metálicos.
         */

        ctx.strokeStyle =
            this.config.metal;

        ctx.lineWidth =
            7;


        ctx.beginPath();

        ctx.moveTo(
            desk.x + 25,
            desk.y + 96
        );

        ctx.lineTo(
            desk.x + 25,
            desk.y + 108
        );

        ctx.moveTo(
            desk.x + desk.width - 25,
            desk.y + 96
        );

        ctx.lineTo(
            desk.x + desk.width - 25,
            desk.y + 108
        );

        ctx.stroke();


        /*
         * Contorno.
         */

        ctx.strokeStyle =
            this.config.outline;

        ctx.lineWidth =
            3;

        ctx.strokeRect(
            desk.x,
            desk.y,
            desk.width,
            desk.height
        );


        /*
         * Caderno em cima da mesa.
         */

        ctx.fillStyle =
            "#f0ead9";

        ctx.fillRect(
            desk.x + 55,
            desk.y + 28,
            65,
            28
        );


        ctx.strokeStyle =
            "#8b8173";

        ctx.lineWidth =
            1;

        ctx.strokeRect(
            desk.x + 55,
            desk.y + 28,
            65,
            28
        );


        /*
         * Lápis.
         */

        ctx.strokeStyle =
            "#d04e3e";

        ctx.lineWidth =
            4;

        ctx.beginPath();

        ctx.moveTo(
            desk.x + 130,
            desk.y + 40
        );

        ctx.lineTo(
            desk.x + 165,
            desk.y + 40
        );

        ctx.stroke();
    }


    /* ========================================================
       MESA DO PROFESSOR
       ======================================================== */

    renderTeacherDesk(
        ctx,
        desk
    ) {

        ctx.fillStyle =
            "#74462f";

        ctx.fillRect(
            desk.x,
            desk.y,
            desk.width,
            desk.height
        );


        ctx.fillStyle =
            "#a96743";

        ctx.fillRect(
            desk.x + 8,
            desk.y + 8,
            desk.width - 16,
            18
        );


        ctx.fillStyle =
            "#523021";

        ctx.fillRect(
            desk.x + 15,
            desk.y + 65,
            desk.width - 30,
            35
        );


        ctx.strokeStyle =
            this.config.outline;

        ctx.lineWidth =
            4;

        ctx.strokeRect(
            desk.x,
            desk.y,
            desk.width,
            desk.height
        );


        /*
         * Computador/livro do professor.
         */

        ctx.fillStyle =
            "#303840";

        ctx.fillRect(
            desk.x + 55,
            desk.y + 28,
            70,
            38
        );


        ctx.fillStyle =
            "#83b8c5";

        ctx.fillRect(
            desk.x + 62,
            desk.y + 34,
            56,
            25
        );
    }


    /* ========================================================
       ARMÁRIO
       ======================================================== */

    renderCabinet(
        ctx,
        cabinet
    ) {

        ctx.fillStyle =
            "#6d4b39";

        ctx.fillRect(
            cabinet.x,
            cabinet.y,
            cabinet.width,
            cabinet.height
        );


        ctx.fillStyle =
            "#9a6c4b";

        ctx.fillRect(
            cabinet.x + 8,
            cabinet.y + 8,
            cabinet.width - 16,
            cabinet.height - 16
        );


        /*
         * Divisões.
         */

        ctx.strokeStyle =
            "#5a3d2f";

        ctx.lineWidth =
            4;


        for (
            let y = cabinet.y + 75;
            y < cabinet.y + cabinet.height;
            y += 75
        ) {

            ctx.beginPath();

            ctx.moveTo(
                cabinet.x + 10,
                y
            );

            ctx.lineTo(
                cabinet.x + cabinet.width - 10,
                y
            );

            ctx.stroke();
        }


        /*
         * Livros.
         */

        const bookColors = [
            "#d94f45",
            "#3e72a8",
            "#e0b83e",
            "#57945c"
        ];


        let bookIndex =
            0;


        for (
            let y = cabinet.y + 18;
            y < cabinet.y + cabinet.height - 20;
            y += 75
        ) {

            for (
                let x = cabinet.x + 16;
                x < cabinet.x + cabinet.width - 12;
                x += 20
            ) {

                ctx.fillStyle =
                    bookColors[
                        bookIndex %
                        bookColors.length
                    ];

                ctx.fillRect(
                    x,
                    y,
                    13,
                    42
                );

                bookIndex++;
            }
        }


        ctx.strokeStyle =
            this.config.outline;

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
       ESTANTE
       ======================================================== */

    renderBookshelf(
        ctx,
        shelf
    ) {

        ctx.fillStyle =
            "#744a32";

        ctx.fillRect(
            shelf.x,
            shelf.y,
            shelf.width,
            shelf.height
        );


        ctx.fillStyle =
            "#a56c48";

        ctx.fillRect(
            shelf.x + 8,
            shelf.y + 8,
            shelf.width - 16,
            shelf.height - 16
        );


        const colors = [
            "#c94b43",
            "#3970a4",
            "#e0b53e",
            "#4e8d58",
            "#81539b"
        ];


        for (
            let row = 0;
            row < 4;
            row++
        ) {

            const baseY =
                shelf.y +
                20 +
                row * 72;


            ctx.fillStyle =
                "#5e3b29";

            ctx.fillRect(
                shelf.x + 8,
                baseY + 52,
                shelf.width - 16,
                8
            );


            for (
                let book = 0;
                book < 5;
                book++
            ) {

                ctx.fillStyle =
                    colors[
                        (book + row) %
                        colors.length
                    ];


                ctx.fillRect(
                    shelf.x + 18 + book * 24,
                    baseY,
                    18,
                    52
                );
            }
        }


        ctx.strokeStyle =
            this.config.outline;

        ctx.lineWidth =
            3;

        ctx.strokeRect(
            shelf.x,
            shelf.y,
            shelf.width,
            shelf.height
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


                case "brazilFlag":

                    this.renderBrazilFlag(
                        ctx,
                        decoration
                    );

                    break;


                case "window":

                    this.renderWindow(
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


                case "plant":

                    this.renderPlant(
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

        /*
         * Sombra.
         */

        ctx.fillStyle =
            this.config.deepShadow;

        ctx.fillRect(
            board.x + 10,
            board.y + 12,
            board.width,
            board.height
        );


        /*
         * Moldura de madeira.
         */

        ctx.fillStyle =
            this.config.woodDark;

        ctx.fillRect(
            board.x - 10,
            board.y - 10,
            board.width + 20,
            board.height + 20
        );


        ctx.fillStyle =
            this.config.board;

        ctx.fillRect(
            board.x,
            board.y,
            board.width,
            board.height
        );


        /*
         * Reflexo do quadro.
         */

        ctx.fillStyle =
            this.config.boardLight;

        ctx.fillRect(
            board.x + 8,
            board.y + 8,
            board.width - 16,
            8
        );


        /*
         * Escrita decorativa.
         */

        ctx.strokeStyle =
            this.config.chalk;

        ctx.lineWidth =
            4;


        ctx.beginPath();

        ctx.moveTo(
            board.x + 70,
            board.y + 55
        );

        ctx.lineTo(
            board.x + 260,
            board.y + 55
        );

        ctx.lineTo(
            board.x + 300,
            board.y + 35
        );

        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(
            board.x + 420,
            board.y + 45
        );

        ctx.lineTo(
            board.x + 650,
            board.y + 45
        );

        ctx.stroke();


        ctx.beginPath();

        ctx.arc(
            board.x + 800,
            board.y + 62,
            30,
            0,
            Math.PI * 2
        );

        ctx.stroke();


        /*
         * Contorno.
         */

        ctx.strokeStyle =
            this.config.outline;

        ctx.lineWidth =
            4;

        ctx.strokeRect(
            board.x - 10,
            board.y - 10,
            board.width + 20,
            board.height + 20
        );
    }


    /* ========================================================
       BANDEIRA DO BRASIL
       ======================================================== */

    renderBrazilFlag(
        ctx,
        flag
    ) {

        /*
         * Sombra.
         */

        ctx.fillStyle =
            this.config.deepShadow;

        ctx.fillRect(
            flag.x + 8,
            flag.y + 8,
            flag.width,
            flag.height
        );


        /*
         * Fundo verde.
         */

        ctx.fillStyle =
            this.config.flagGreen;

        ctx.fillRect(
            flag.x,
            flag.y,
            flag.width,
            flag.height
        );


        /*
         * Losango amarelo.
         */

        ctx.fillStyle =
            this.config.flagYellow;

        ctx.beginPath();

        ctx.moveTo(
            flag.x + flag.width / 2,
            flag.y + 12
        );

        ctx.lineTo(
            flag.x + flag.width - 15,
            flag.y + flag.height / 2
        );

        ctx.lineTo(
            flag.x + flag.width / 2,
            flag.y + flag.height - 12
        );

        ctx.lineTo(
            flag.x + 15,
            flag.y + flag.height / 2
        );

        ctx.closePath();

        ctx.fill();


        /*
         * Círculo azul.
         */

        ctx.fillStyle =
            this.config.flagBlue;

        ctx.beginPath();

        ctx.arc(
            flag.x + flag.width / 2,
            flag.y + flag.height / 2,
            31,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /*
         * Faixa branca.
         */

        ctx.strokeStyle =
            this.config.flagWhite;

        ctx.lineWidth =
            7;

        ctx.beginPath();

        ctx.arc(
            flag.x + flag.width / 2,
            flag.y + flag.height / 2,
            31,
            Math.PI * 0.17,
            Math.PI * 0.83
        );

        ctx.stroke();


        /*
         * Estrelas simplificadas.
         */

        ctx.fillStyle =
            this.config.flagWhite;


        const stars = [

            [-12, -12],
            [2, -17],
            [15, -5],
            [-20, 3],
            [8, 11]
        ];


        for (
            const star of stars
        ) {

            ctx.beginPath();

            ctx.arc(
                flag.x +
                flag.width / 2 +
                star[0],

                flag.y +
                flag.height / 2 +
                star[1],

                2,

                0,

                Math.PI * 2
            );

            ctx.fill();
        }


        /*
         * Moldura.
         */

        ctx.strokeStyle =
            this.config.outline;

        ctx.lineWidth =
            4;

        ctx.strokeRect(
            flag.x,
            flag.y,
            flag.width,
            flag.height
        );
    }


    /* ========================================================
       JANELA
       ======================================================== */

    renderWindow(
        ctx,
        window
    ) {

        /*
         * Moldura.
         */

        ctx.fillStyle =
            this.config.woodDark;

        ctx.fillRect(
            window.x - 8,
            window.y - 8,
            window.width + 16,
            window.height + 16
        );


        /*
         * Céu.
         */

        ctx.fillStyle =
            this.config.window;

        ctx.fillRect(
            window.x,
            window.y,
            window.width,
            window.height
        );


        /*
         * Luz.

         */

        ctx.fillStyle =
            this.config.windowLight;

        ctx.fillRect(
            window.x + 8,
            window.y + 8,
            window.width - 16,
            18
        );


        /*
         * Divisórias.

         */

        ctx.fillStyle =
            this.config.woodDark;

        ctx.fillRect(
            window.x +
            window.width / 2 -
            5,

            window.y,

            10,

            window.height
        );


        ctx.fillRect(
            window.x,

            window.y +
            window.height / 2 -
            5,

            window.width,

            10
        );


        /*
         * Nuvens.
         */

        ctx.fillStyle =
            "rgba(255,255,255,0.45)";


        ctx.beginPath();

        ctx.arc(
            window.x + 55,
            window.y + 45,
            14,
            0,
            Math.PI * 2
        );

        ctx.arc(
            window.x + 72,
            window.y + 42,
            18,
            0,
            Math.PI * 2
        );

        ctx.arc(
            window.x + 92,
            window.y + 48,
            13,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /*
         * Contorno.
         */

        ctx.strokeStyle =
            this.config.outline;

        ctx.lineWidth =
            4;

        ctx.strokeRect(
            window.x - 8,
            window.y - 8,
            window.width + 16,
            window.height + 16
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
         * Sombra.
         */

        ctx.fillStyle =
            this.config.deepShadow;

        ctx.fillRect(
            door.x + 8,
            door.y + 8,
            door.width,
            door.height
        );


        /*
         * Porta de madeira.
         */

        ctx.fillStyle =
            "#70452f";

        ctx.fillRect(
            door.x,
            door.y,
            door.width,
            door.height
        );


        /*
         * Painéis.

         */

        ctx.strokeStyle =
            "#4d3023";

        ctx.lineWidth =
            5;


        ctx.strokeRect(
            door.x + 18,
            door.y + 12,
            door.width - 36,
            30
        );


        ctx.strokeRect(
            door.x + 18,
            door.y + 52,
            door.width - 36,
            30
        );


        /*
         * Maçaneta.
         */

        ctx.fillStyle =
            "#d5a84d";

        ctx.beginPath();

        ctx.arc(
            door.x + door.width - 25,
            door.y + door.height / 2,
            7,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /*
         * Contorno.

         */

        ctx.strokeStyle =
            this.config.outline;

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
       PLANTA
       ======================================================== */

    renderPlant(
        ctx,
        plant
    ) {

        /*
         * Vaso.
         */

        ctx.fillStyle =
            "#b85f3d";

        ctx.beginPath();

        ctx.moveTo(
            plant.x + 22,
            plant.y + 55
        );

        ctx.lineTo(
            plant.x + 78,
            plant.y + 55
        );

        ctx.lineTo(
            plant.x + 68,
            plant.y + 92
        );

        ctx.lineTo(
            plant.x + 32,
            plant.y + 92
        );

        ctx.closePath();

        ctx.fill();


        /*
         * Terra.
         */

        ctx.fillStyle =
            "#533525";

        ctx.fillRect(
            plant.x + 27,
            plant.y + 51,
            46,
            10
        );


        /*
         * Folhas.
         */

        ctx.fillStyle =
            this.config.plant;


        const leaves = [

            [42, 48, -0.6],
            [58, 43, 0],
            [74, 48, 0.6],
            [50, 28, -0.3],
            [66, 25, 0.3],
            [58, 12, 0]
        ];


        for (
            const leaf of leaves
        ) {

            ctx.save();

            ctx.translate(
                plant.x + leaf[0],
                plant.y + leaf[1]
            );

            ctx.rotate(
                leaf[2]
            );

            ctx.beginPath();

            ctx.ellipse(
                0,
                0,
                12,
                25,
                0,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.restore();
        }


        /*
         * Folhas claras.
         */

        ctx.fillStyle =
            this.config.plantLight;

        ctx.beginPath();

        ctx.ellipse(
            plant.x + 48,
            plant.y + 30,
            7,
            18,
            -0.5,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.beginPath();

        ctx.ellipse(
            plant.x + 69,
            plant.y + 27,
            7,
            18,
            0.5,
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
       LIMITES
       ======================================================== */

    getBounds() {

        return {

            x:
                0,

            y:
                0,

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
         * Preparado para futuras fases.
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