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
            null;


        /* ====================================================
           JOGADOR
           ==================================================== */

        this.player =
            null;


        /* ====================================================
           CÂMERA
           ==================================================== */

        this.camera = {

            x: 0,

            y: 0,

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
                "#11151c"
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
           VALIDAÇÃO
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
           CANVAS
           ==================================================== */

        this.configureCanvas();


        /* ====================================================
           INPUT
           ==================================================== */

        this.input =
            new Input();


        /* ====================================================
           MUNDO
           ==================================================== */

        this.world =
            new World({

                width:
                    2400,

                height:
                    1350
            });


        this.world.initialize();


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
                    32,

                height:
                    44,

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

                },


            onDirectionChange:
                () => {

                }
        });


        /* ====================================================
           CÂMERA
           ==================================================== */

        this.initializeCamera();


        /* ====================================================
           RENDER INICIAL
           ==================================================== */

        this.render();


        /* ====================================================
           FINALIZA
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

        this.canvas.width =
            this.width;

        this.canvas.height =
            this.height;


        this.context.imageSmoothingEnabled =
            true;
    }


    /* ========================================================
       CÂMERA INICIAL
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
           INPUT
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

        if (
            !this.world
        ) {

            return;
        }


        const maxX =
            Math.max(
                0,
                this.world.width -
                this.camera.width
            );


        const maxY =
            Math.max(
                0,
                this.world.height -
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


        const ctx =
            this.context;


        /* ====================================================
           LIMPEZA
           ==================================================== */

        ctx.clearRect(
            0,
            0,
            this.width,
            this.height
        );


        /* ====================================================
           FUNDO DA TELA
           ==================================================== */

        ctx.fillStyle =
            this.config.backgroundColor;


        ctx.fillRect(
            0,
            0,
            this.width,
            this.height
        );


        /* ====================================================
           CÂMERA / MUNDO
           ==================================================== */

        ctx.save();


        ctx.translate(
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

        if (
            this.world
        ) {

            this.world.render(
                ctx
            );
        }


        /* ====================================================
           JOGADOR
           ==================================================== */

        if (
            this.player
        ) {

            this.player.render(
                ctx,
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


        ctx.restore();


        /* ====================================================
           EFEITOS DE TELA
           ==================================================== */

        this.renderScreenEffects();
    }


    /* ========================================================
       EFEITOS DE TELA
       ======================================================== */

    renderScreenEffects() {

        const ctx =
            this.context;


        /*
         * Vinheta cinematográfica.
         */

        const gradient =
            ctx.createRadialGradient(
                this.width / 2,
                this.height / 2,
                this.height * 0.25,
                this.width / 2,
                this.height / 2,
                this.width * 0.75
            );


        gradient.addColorStop(
            0,
            "rgba(0,0,0,0)"
        );


        gradient.addColorStop(
            0.75,
            "rgba(0,0,0,0.03)"
        );


        gradient.addColorStop(
            1,
            "rgba(0,0,0,0.30)"
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
            "#ff3333";


        ctx.lineWidth =
            1;


        const collision =
            this.player.getCollisionRect();


        ctx.strokeRect(
            collision.x,
            collision.y,
            collision.width,
            collision.height
        );


        ctx.fillStyle =
            "#ffffff";


        ctx.font =
            "12px monospace";


        ctx.fillText(
            "X: " +
            Math.round(
                this.player.x
            ),

            this.camera.x + 12,
            this.camera.y + 20
        );


        ctx.fillText(
            "Y: " +
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
       COMPLETAR
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


        /* Input */

        if (
            this.input
        ) {

            this.input.reset();
        }


        /* Tempo */

        this.lastTime =
            0;

        this.deltaTime =
            0;

        this.totalTime =
            0;

        this.elapsedTime =
            0;


        /* Mundo */

        if (
            this.world
        ) {

            this.world.reset();
        }


        /* Jogador */

        if (
            this.player &&
            this.world
        ) {

            this.player.reset(
                this.world.width / 2,
                this.world.height / 2
            );
        }


        /* Câmera */

        this.initializeCamera();


        /* Estado */

        this.paused =
            false;

        this.state =
            "playing";


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


        if (
            this.input
        ) {

            this.input.destroy();

            this.input =
                null;
        }


        if (
            this.player
        ) {

            this.player.destroy();

            this.player =
                null;
        }


        if (
            this.world
        ) {

            this.world.destroy();

            this.world =
                null;
        }


        this.initialized =
            false;

        this.state =
            "loading";
    }
}