/* ============================================================
   ESCAPE ROOM — GAME.JS
   Motor principal e gerenciamento do jogo
   ============================================================ */

import { Input } from "./input.js";
import { Player } from "./player.js";
import { World } from "./world.js";


export class Game {

    /* ========================================================
       CONSTRUTOR
       ======================================================== */

    constructor(options = {}) {

        /* ====================================================
           CANVAS
           ==================================================== */

        this.canvas =
            options.canvas || null;


        this.context =
            options.context || null;


        this.width =
            options.width || 960;


        this.height =
            options.height || 540;


        /* ====================================================
           ESTADO
           ==================================================== */

        this.state =
            "loading";


        this.running =
            false;


        this.paused =
            false;


        this.initialized =
            false;


        /* ====================================================
           TEMPO
           ==================================================== */

        this.lastTime =
            0;


        this.deltaTime =
            0;


        this.totalTime =
            0;


        this.elapsedTime =
            0;


        /* ====================================================
           LOOP
           ==================================================== */

        this.animationFrame =
            null;


        /* ====================================================
           FPS
           ==================================================== */

        this.fps =
            60;


        this.frameCounter =
            0;


        this.fpsTimer =
            0;


        /* ====================================================
           INPUT
           ==================================================== */

        this.input =
            null;


        /* ====================================================
           MUNDO
           ==================================================== */

        this.world =
            new World();


        /*
         * Garante dimensões mínimas para compatibilidade
         * com diferentes versões do World.
         */

        if (
            typeof this.world.width !==
            "number"
        ) {

            this.world.width =
                2400;
        }


        if (
            typeof this.world.height !==
            "number"
        ) {

            this.world.height =
                1350;
        }


        /* ====================================================
           JOGADOR
           ==================================================== */

        this.player =
            null;


        /* ====================================================
           CÂMERA
           ==================================================== */

        this.camera = {

            x:
                0,

            y:
                0,

            width:
                this.width,

            height:
                this.height,

            zoom:
                1,

            smoothing:
                8
        };


        /* ====================================================
           CONFIGURAÇÕES
           ==================================================== */

        this.config = {

            debug:
                false,

            backgroundColor:
                "#0b0d12",

            worldColor:
                "#171a20",

            gridColor:
                "rgba(255,255,255,0.025)",

            borderColor:
                "rgba(190,200,220,0.15)"
        };


        /* ====================================================
           CALLBACKS
           ==================================================== */

        this.callbacks = {

            onComplete:
                null,

            onPause:
                null,

            onResume:
                null,

            onInteraction:
                null,

            onPlayerMove:
                null
        };
    }


    /* ========================================================
       INICIALIZAÇÃO
       ======================================================== */

    async initialize() {

        if (
            this.initialized
        ) {

            return;
        }


        this.state =
            "loading";


        /* ====================================================
           VALIDAÇÃO DO CANVAS
           ==================================================== */

        if (
            !this.canvas
        ) {

            throw new Error(
                "Game: Canvas não foi fornecido."
            );
        }


        if (
            !this.context
        ) {

            throw new Error(
                "Game: contexto 2D não foi fornecido."
            );
        }


        /* ====================================================
           CONFIGURAÇÃO DO CANVAS
           ==================================================== */

        this.configureCanvas();


        /* ====================================================
           INPUT
           ==================================================== */

        this.input =
            new Input();


        /* ====================================================
           INICIALIZAÇÃO DO MUNDO
           ==================================================== */

        if (
            typeof this.world.initialize ===
            "function"
        ) {

            await this.world.initialize();
        }


        /*
         * Atualiza as dimensões caso o World tenha
         * definido suas próprias dimensões durante
         * a inicialização.
         */

        if (
            typeof this.world.width ===
            "number"
        ) {

            this.worldWidth =
                this.world.width;
        }


        if (
            typeof this.world.height ===
            "number"
        ) {

            this.worldHeight =
                this.world.height;
        }


        /* ====================================================
           JOGADOR
           ==================================================== */

        this.player =
            new Player({

                input:
                    this.input,

                world:
                    this.world,

                x:
                    this.world.width / 2,

                y:
                    this.world.height / 2,

                width:
                    28,

                height:
                    38,

                speed:
                    180,

                maxSpeed:
                    180,

                acceleration:
                    1200,

                deceleration:
                    1400
            });


        this.player.initialize();


        /* ====================================================
           CALLBACKS DO JOGADOR
           ==================================================== */

        this.player.setCallbacks({

            onMove:
                () => {

                    if (
                        typeof this.callbacks.onPlayerMove ===
                        "function"
                    ) {

                        this.callbacks.onPlayerMove(
                            this.player
                        );
                    }
                },

            onStop:
                () => {

                    /*
                     * Reservado para efeitos futuros.
                     */
                },

            onDirectionChange:
                () => {

                    /*
                     * Reservado para animações futuras.
                     */
                }
        });


        /* ====================================================
           CÂMERA
           ==================================================== */

        this.initializeCamera();


        /* ====================================================
           RENDERIZAÇÃO INICIAL
           ==================================================== */

        this.render();


        /* ====================================================
           ESTADO FINAL
           ==================================================== */

        this.initialized =
            true;


        this.state =
            "menu";


        console.info(
            "[ESCAPE ROOM] Motor inicializado."
        );
    }


    /* ========================================================
       CONFIGURAÇÃO DO CANVAS
       ======================================================== */

    configureCanvas() {

        /*
         * Resolução lógica do jogo.
         */

        this.canvas.width =
            this.width;


        this.canvas.height =
            this.height;


        /*
         * Suavização gráfica.
         */

        this.context.imageSmoothingEnabled =
            true;
    }


    /* ========================================================
       INICIALIZAÇÃO DA CÂMERA
       ======================================================== */

    initializeCamera() {

        if (
            !this.player
        ) {

            return;
        }


        this.camera.x =
            this.player.x -
            this.camera.width / 2;


        this.camera.y =
            this.player.y -
            this.camera.height / 2;


        this.clampCamera();
    }


    /* ========================================================
       START
       ======================================================== */

    start() {

        if (
            !this.initialized
        ) {

            console.warn(
                "[ESCAPE ROOM] O jogo ainda não foi inicializado."
            );

            return;
        }


        if (
            this.running
        ) {

            return;
        }


        this.running =
            true;


        this.paused =
            false;


        this.state =
            "playing";


        this.lastTime =
            performance.now();


        this.deltaTime =
            0;


        this.totalTime =
            0;


        this.elapsedTime =
            0;


        this.frameCounter =
            0;


        this.fpsTimer =
            0;


        this.animationFrame =
            requestAnimationFrame(
                this.gameLoop.bind(this)
            );


        console.info(
            "[ESCAPE ROOM] Jogo iniciado."
        );
    }


    /* ========================================================
       GAME LOOP
       ======================================================== */

    gameLoop(timestamp) {

        if (
            !this.running
        ) {

            return;
        }


        /* ====================================================
           DELTA TIME
           ==================================================== */

        if (
            !this.lastTime
        ) {

            this.lastTime =
                timestamp;
        }


        this.deltaTime =
            (
                timestamp -
                this.lastTime
            ) / 1000;


        this.lastTime =
            timestamp;


        /*
         * Proteção contra valores muito grandes.
         */

        this.deltaTime =
            Math.min(
                this.deltaTime,
                0.05
            );


        /* ====================================================
           TEMPO
           ==================================================== */

        if (
            !this.paused
        ) {

            this.totalTime +=
                this.deltaTime;


            this.elapsedTime =
                this.totalTime;
        }


        /* ====================================================
           UPDATE
           ==================================================== */

        if (
            !this.paused
        ) {

            this.update(
                this.deltaTime
            );
        }


        /* ====================================================
           RENDER
           ==================================================== */

        this.render();


        /* ====================================================
           FPS
           ==================================================== */

        this.updateFPS(
            this.deltaTime
        );


        /* ====================================================
           INPUT — FINAL DO FRAME
           ==================================================== */

        if (
            this.input
        ) {

            this.input.endFrame();
        }


        /* ====================================================
           PRÓXIMO FRAME
           ==================================================== */

        this.animationFrame =
            requestAnimationFrame(
                this.gameLoop.bind(this)
            );
    }


    /* ========================================================
       UPDATE
       ======================================================== */

    update(deltaTime) {

        if (
            this.state !==
            "playing"
        ) {

            return;
        }


        /* ====================================================
           PAUSA
           ==================================================== */

        if (
            this.input &&
            this.input.wantsPause()
        ) {

            this.togglePause();

            return;
        }


        /* ====================================================
           INTERAÇÃO
           ==================================================== */

        if (
            this.input &&
            this.input.wantsInteract()
        ) {

            this.interact();
        }


        /* ====================================================
           MUNDO
           ==================================================== */

        if (
            this.world &&
            typeof this.world.update ===
            "function"
        ) {

            this.world.update(
                deltaTime
            );
        }


        /* ====================================================
           JOGADOR
           ==================================================== */

        if (
            this.player
        ) {

            this.player.update(
                deltaTime
            );
        }


        /* ====================================================
           CÂMERA
           ==================================================== */

        this.updateCamera(
            deltaTime
        );
    }


    /* ========================================================
       CÂMERA
       ======================================================== */

    updateCamera(deltaTime) {

        if (
            !this.player
        ) {

            return;
        }


        const targetX =
            this.player.x -
            this.camera.width / 2;


        const targetY =
            this.player.y -
            this.camera.height / 2;


        /*
         * Suavização independente do FPS.
         */

        const smoothing =
            1 -
            Math.exp(
                -this.camera.smoothing *
                deltaTime
            );


        this.camera.x +=
            (
                targetX -
                this.camera.x
            ) *
            smoothing;


        this.camera.y +=
            (
                targetY -
                this.camera.y
            ) *
            smoothing;


        this.clampCamera();
    }


    /* ========================================================
       LIMITES DA CÂMERA
       ======================================================== */

    clampCamera() {

        const worldWidth =
            typeof this.world.width ===
            "number"
                ? this.world.width
                : 2400;


        const worldHeight =
            typeof this.world.height ===
            "number"
                ? this.world.height
                : 1350;


        const maxX =
            Math.max(
                0,
                worldWidth -
                this.camera.width
            );


        const maxY =
            Math.max(
                0,
                worldHeight -
                this.camera.height
            );


        this.camera.x =
            Math.max(
                0,
                Math.min(
                    maxX,
                    this.camera.x
                )
            );


        this.camera.y =
            Math.max(
                0,
                Math.min(
                    maxY,
                    this.camera.y
                )
            );
    }


    /* ========================================================
       RENDER
       ======================================================== */

    render() {

        if (
            !this.context
        ) {

            return;
        }


        /* ====================================================
           LIMPEZA
           ==================================================== */

        this.context.clearRect(
            0,
            0,
            this.width,
            this.height
        );


        /* ====================================================
           FUNDO
           ==================================================== */

        this.context.fillStyle =
            this.config.backgroundColor;


        this.context.fillRect(
            0,
            0,
            this.width,
            this.height
        );


        /* ====================================================
           CÂMERA
           ==================================================== */

        this.context.save();


        this.context.translate(
            -Math.floor(
                this.camera.x
            ),

            -Math.floor(
                this.camera.y
            )
        );


        /* ====================================================
           MUNDO
           ==================================================== */

        this.renderWorld();


        /* ====================================================
           JOGADOR
           ==================================================== */

        if (
            this.player
        ) {

            this.player.render(
                this.context,
                this.camera
            );
        }


        /* ====================================================
           DEBUG
           ==================================================== */

        if (
            this.config.debug
        ) {

            this.renderDebug();
        }


        this.context.restore();


        /* ====================================================
           EFEITOS DE TELA
           ==================================================== */

        this.renderScreenEffects();
    }


    /* ========================================================
       RENDER DO MUNDO
       ======================================================== */

    renderWorld() {

        const ctx =
            this.context;


        /*
         * Se o World possuir seu próprio método
         * de renderização, ele assume o controle.
         */

        if (
            this.world &&
            typeof this.world.render ===
            "function"
        ) {

            this.world.render(
                ctx,
                this.camera
            );

            return;
        }


        /*
         * Fallback visual.
         *
         * Isso evita que o jogo fique completamente
         * vazio caso o World ainda não possua render().
         */

        const worldWidth =
            typeof this.world.width ===
            "number"
                ? this.world.width
                : 2400;


        const worldHeight =
            typeof this.world.height ===
            "number"
                ? this.world.height
                : 1350;


        /* ====================================================
           PISO
           ==================================================== */

        ctx.fillStyle =
            this.config.worldColor;


        ctx.fillRect(
            0,
            0,
            worldWidth,
            worldHeight
        );


        /* ====================================================
           GRADE
           ==================================================== */

        const gridSize =
            64;


        ctx.strokeStyle =
            this.config.gridColor;


        ctx.lineWidth =
            1;


        for (
            let x = 0;
            x <= worldWidth;
            x += gridSize
        ) {

            ctx.beginPath();


            ctx.moveTo(
                x + 0.5,
                0
            );


            ctx.lineTo(
                x + 0.5,
                worldHeight
            );


            ctx.stroke();
        }


        for (
            let y = 0;
            y <= worldHeight;
            y += gridSize
        ) {

            ctx.beginPath();


            ctx.moveTo(
                0,
                y + 0.5
            );


            ctx.lineTo(
                worldWidth,
                y + 0.5
            );


            ctx.stroke();
        }


        /* ====================================================
           BORDA DO MUNDO
           ==================================================== */

        ctx.strokeStyle =
            this.config.borderColor;


        ctx.lineWidth =
            4;


        ctx.strokeRect(
            0,
            0,
            worldWidth,
            worldHeight
        );
    }


    /* ========================================================
       EFEITOS DE TELA
       ======================================================== */

    renderScreenEffects() {

        /*
         * Aqui entrarão futuramente:
         *
         * - Vinheta
         * - Iluminação
         * - Partículas
         * - Glitch
         * - Efeitos cinematográficos
         * - Transições
         */
    }


    /* ========================================================
       DEBUG
       ======================================================== */

    renderDebug() {

        if (
            !this.player
        ) {

            return;
        }


        const ctx =
            this.context;


        ctx.save();


        ctx.strokeStyle =
            "#ff0000";


        ctx.lineWidth =
            1;


        if (
            typeof this.player.getCollisionRect ===
            "function"
        ) {

            const collision =
                this.player.getCollisionRect();


            ctx.strokeRect(
                collision.x,
                collision.y,
                collision.width,
                collision.height
            );
        }


        ctx.fillStyle =
            "#ffffff";


        ctx.font =
            "12px monospace";


        ctx.fillText(
            "PLAYER X: " +
            Math.round(
                this.player.x
            ),

            this.camera.x + 12,

            this.camera.y + 20
        );


        ctx.fillText(
            "PLAYER Y: " +
            Math.round(
                this.player.y
            ),

            this.camera.x + 12,

            this.camera.y + 36
        );


        ctx.fillText(
            "FPS: " +
            this.fps,

            this.camera.x + 12,

            this.camera.y + 52
        );


        ctx.fillText(
            "STATE: " +
            this.state,

            this.camera.x + 12,

            this.camera.y + 68
        );


        ctx.restore();
    }


    /* ========================================================
       FPS
       ======================================================== */

    updateFPS(deltaTime) {

        this.frameCounter +=
            1;


        this.fpsTimer +=
            deltaTime;


        if (
            this.fpsTimer >=
            1
        ) {

            this.fps =
                Math.round(
                    this.frameCounter /
                    this.fpsTimer
                );


            this.frameCounter =
                0;


            this.fpsTimer =
                0;
        }
    }


    /* ========================================================
       INTERAÇÃO
       ======================================================== */

    interact() {

        if (
            this.state !==
            "playing"
        ) {

            return;
        }


        console.log(
            "[ESCAPE ROOM] Interação solicitada."
        );


        if (
            typeof this.callbacks.onInteraction ===
            "function"
        ) {

            this.callbacks.onInteraction(
                this.player
            );
        }
    }


    /* ========================================================
       PAUSA
       ======================================================== */

    pause() {

        if (
            this.paused
        ) {

            return;
        }


        this.paused =
            true;


        this.state =
            "paused";


        if (
            typeof this.callbacks.onPause ===
            "function"
        ) {

            this.callbacks.onPause();
        }
    }


    /* ========================================================
       RETOMAR
       ======================================================== */

    resume() {

        if (
            !this.paused
        ) {

            return;
        }


        this.paused =
            false;


        this.state =
            "playing";


        this.lastTime =
            performance.now();


        if (
            typeof this.callbacks.onResume ===
            "function"
        ) {

            this.callbacks.onResume();
        }
    }


    /* ========================================================
       ALTERNAR PAUSA
       ======================================================== */

    togglePause() {

        if (
            this.paused
        ) {

            this.resume();

        } else {

            this.pause();
        }
    }


    /* ========================================================
       VERIFICAR PAUSA
       ======================================================== */

    isPaused() {

        return this.paused;
    }


    /* ========================================================
       COMPLETAR JOGO
       ======================================================== */

    complete() {

        if (
            this.state ===
            "completed"
        ) {

            return;
        }


        this.state =
            "completed";


        this.running =
            false;


        this.paused =
            false;


        if (
            this.animationFrame !==
            null
        ) {

            cancelAnimationFrame(
                this.animationFrame
            );


            this.animationFrame =
                null;
        }


        if (
            typeof this.callbacks.onComplete ===
            "function"
        ) {

            this.callbacks.onComplete(
                this.elapsedTime
            );
        }


        console.info(
            "[ESCAPE ROOM] Jogo concluído."
        );
    }


    /* ========================================================
       REINICIAR
       ======================================================== */

    restart() {

        /*
         * Interrompe o loop atual.
         */

        this.running =
            false;


        if (
            this.animationFrame !==
            null
        ) {

            cancelAnimationFrame(
                this.animationFrame
            );


            this.animationFrame =
                null;
        }


        /* ====================================================
           INPUT
           ==================================================== */

        if (
            this.input
        ) {

            this.input.reset();
        }


        /* ====================================================
           TEMPO
           ==================================================== */

        this.lastTime =
            0;


        this.deltaTime =
            0;


        this.totalTime =
            0;


        this.elapsedTime =
            0;


        /* ====================================================
           MUNDO
           ==================================================== */

        if (
            this.world &&
            typeof this.world.reset ===
            "function"
        ) {

            this.world.reset();
        }


        /* ====================================================
           JOGADOR
           ==================================================== */

        if (
            this.player
        ) {

            this.player.reset(
                this.world.width / 2,
                this.world.height / 2
            );
        }


        /* ====================================================
           CÂMERA
           ==================================================== */

        this.initializeCamera();


        /* ====================================================
           ESTADO
           ==================================================== */

        this.paused =
            false;


        this.state =
            "playing";


        /* ====================================================
           INICIA NOVAMENTE
           ==================================================== */

        this.start();
    }


    /* ========================================================
       RESIZE
       ======================================================== */

    resize(
        width = this.width,
        height = this.height
    ) {

        if (
            !this.canvas
        ) {

            return;
        }


        this.camera.width =
            this.width;


        this.camera.height =
            this.height;


        this.clampCamera();
    }


    /* ========================================================
       CALLBACKS
       ======================================================== */

    setCallbacks(
        callbacks = {}
    ) {

        if (
            typeof callbacks.onComplete ===
            "function"
        ) {

            this.callbacks.onComplete =
                callbacks.onComplete;
        }


        if (
            typeof callbacks.onPause ===
            "function"
        ) {

            this.callbacks.onPause =
                callbacks.onPause;
        }


        if (
            typeof callbacks.onResume ===
            "function"
        ) {

            this.callbacks.onResume =
                callbacks.onResume;
        }


        if (
            typeof callbacks.onInteraction ===
            "function"
        ) {

            this.callbacks.onInteraction =
                callbacks.onInteraction;
        }


        if (
            typeof callbacks.onPlayerMove ===
            "function"
        ) {

            this.callbacks.onPlayerMove =
                callbacks.onPlayerMove;
        }
    }


    /* ========================================================
       DESTRUIR
       ======================================================== */

    destroy() {

        /*
         * Para o loop.
         */

        this.running =
            false;


        if (
            this.animationFrame !==
            null
        ) {

            cancelAnimationFrame(
                this.animationFrame
            );


            this.animationFrame =
                null;
        }


        /*
         * Destrói o sistema de input.
         */

        if (
            this.input
        ) {

            this.input.destroy();

            this.input =
                null;
        }


        /*
         * Destrói o mundo.
         */

        if (
            this.world &&
            typeof this.world.destroy ===
            "function"
        ) {

            this.world.destroy();
        }


        /*
         * Destrói o jogador.
         */

        if (
            this.player
        ) {

            this.player.destroy();

            this.player =
                null;
        }


        /*
         * Estado final.
         */

        this.initialized =
            false;


        this.state =
            "loading";
    }
}


/* ============================================================
   FIM DO GAME.JS
   ============================================================ */