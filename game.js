/* ============================================================
   ESCAPE ROOM — GAME.JS
   Motor principal do jogo
   ============================================================ */

import { Input } from "./input.js";
import { Player } from "./player.js";
import { World } from "./world.js";


export class Game {

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
            new World({

                width:
                    2400,

                height:
                    1350
            });


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
                "#111827"
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
           MUNDO
           ==================================================== */

        this.world.initialize();


        /* ====================================================
           INPUT
           ==================================================== */

        this.input =
            new Input();


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
                    1200,

                y:
                    680,

                width:
                    32,

                height:
                    42,

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
           CALLBACKS
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
                () => {},

            onDirectionChange:
                () => {}
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
           FINAL
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
            false;
    }


    /* ========================================================
       CÂMERA
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


    clampCamera() {

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


        this.animationFrame =
            requestAnimationFrame(
                this.gameLoop.bind(this)
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


        if (
            !this.paused
        ) {

            this.totalTime +=
                this.deltaTime;

            this.elapsedTime =
                this.totalTime;


            this.update(
                this.deltaTime
            );
        }


        this.render();


        this.updateFPS(
            this.deltaTime
        );


        if (
            this.input
        ) {

            this.input.endFrame();
        }


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


        if (
            this.input &&
            this.input.wantsPause()
        ) {

            this.togglePause();

            return;
        }


        if (
            this.input &&
            this.input.wantsInteract()
        ) {

            this.interact();
        }


        if (
            this.world
        ) {

            this.world.update(
                deltaTime
            );
        }


        if (
            this.player
        ) {

            this.player.update(
                deltaTime
            );
        }


        this.updateCamera(
            deltaTime
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


        ctx.clearRect(
            0,
            0,
            this.width,
            this.height
        );


        ctx.fillStyle =
            this.config.backgroundColor;


        ctx.fillRect(
            0,
            0,
            this.width,
            this.height
        );


        /* ====================================================
           MUNDO
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


        ctx.restore();


        /* ====================================================
           EFEITOS
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
         * Vinheta.
         */

        const gradient =
            ctx.createRadialGradient(
                this.width / 2,
                this.height / 2,
                this.height * 0.18,
                this.width / 2,
                this.height / 2,
                this.height * 0.75
            );


        gradient.addColorStop(
            0,
            "rgba(0,0,0,0)"
        );


        gradient.addColorStop(
            1,
            "rgba(0,0,0,0.42)"
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


    togglePause() {

        if (
            this.paused
        ) {

            this.resume();

        } else {

            this.pause();
        }
    }


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


        if (
            this.input
        ) {

            this.input.reset();
        }


        this.lastTime =
            0;

        this.deltaTime =
            0;

        this.totalTime =
            0;

        this.elapsedTime =
            0;


        if (
            this.world
        ) {

            this.world.reset();
        }


        if (
            this.player
        ) {

            this.player.reset(
                1200,
                680
            );
        }


        this.initializeCamera();


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