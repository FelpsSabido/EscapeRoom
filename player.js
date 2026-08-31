/* ============================================================
   ESCAPE ROOM — PLAYER.JS
   Sistema completo do jogador
   ============================================================ */

export class Player {

    /* ========================================================
       CONSTRUTOR
       ======================================================== */

    constructor(options = {}) {

        /* ====================================================
           REFERÊNCIAS
           ==================================================== */

        this.input =
            options.input || null;

        this.world =
            options.world || null;


        /* ====================================================
           POSIÇÃO
           ==================================================== */

        this.x =
            options.x ?? 0;

        this.y =
            options.y ?? 0;


        /* ====================================================
           DIMENSÕES
           ==================================================== */

        this.width =
            options.width ?? 28;

        this.height =
            options.height ?? 38;


        /* ====================================================
           MOVIMENTO
           ==================================================== */

        this.speed =
            options.speed ?? 180;

        this.maxSpeed =
            options.maxSpeed ?? 180;

        this.acceleration =
            options.acceleration ?? 1200;

        this.deceleration =
            options.deceleration ?? 1400;


        this.velocityX =
            0;

        this.velocityY =
            0;


        /* ====================================================
           DIREÇÃO
           ==================================================== */

        this.direction =
            "down";


        /*
         * Direções possíveis:
         *
         * up
         * down
         * left
         * right
         */


        /* ====================================================
           ESTADO
           ==================================================== */

        this.moving =
            false;

        this.enabled =
            true;

        this.visible =
            true;


        /* ====================================================
           ANIMAÇÃO
           ==================================================== */

        this.animation = {

            frame: 0,

            timer: 0,

            speed: 0.12,

            maxFrames: 4
        };


        /* ====================================================
           COLISÃO
           ==================================================== */

        this.collision = {

            enabled: true,

            offsetX: 4,

            offsetY: 8,

            width: 20,

            height: 24
        };


        /* ====================================================
           ESTADO ANTERIOR
           ==================================================== */

        this.previousPosition = {

            x: this.x,

            y: this.y
        };


        /* ====================================================
           CONFIGURAÇÕES
           ==================================================== */

        this.config = {

            debug: false,

            shadow: true,

            shadowWidth: 20,

            shadowHeight: 7,

            shadowOpacity: 0.35
        };


        /* ====================================================
           CALLBACKS
           ==================================================== */

        this.callbacks = {

            onMove: null,

            onStop: null,

            onDirectionChange: null
        };
    }


    /* ========================================================
       INICIALIZAÇÃO
       ======================================================== */

    initialize() {

        this.velocityX =
            0;

        this.velocityY =
            0;

        this.moving =
            false;

        this.animation.frame =
            0;

        this.animation.timer =
            0;

        this.previousPosition.x =
            this.x;

        this.previousPosition.y =
            this.y;
    }


    /* ========================================================
       ATUALIZAÇÃO
       ======================================================== */

    update(deltaTime) {

        if (!this.enabled) {

            this.stop();

            return;
        }


        /*
         * Guarda a posição anterior.
         */

        this.previousPosition.x =
            this.x;

        this.previousPosition.y =
            this.y;


        /*
         * Se não houver input,
         * simplesmente desacelera.
         */

        if (!this.input) {

            this.applyDeceleration(
                deltaTime
            );

            this.applyVelocity(
                deltaTime
            );

            this.updateAnimation(
                deltaTime
            );

            return;
        }


        /*
         * Obtém o vetor de movimento.
         */

        const movement =
            this.input.getMovementVector();


        const inputX =
            movement.x;

        const inputY =
            movement.y;


        const hasInput =
            inputX !== 0 ||
            inputY !== 0;


        /*
         * Atualiza direção.
         */

        if (hasInput) {

            this.updateDirection(
                inputX,
                inputY
            );
        }


        /*
         * Aceleração.
         */

        if (hasInput) {

            this.applyAcceleration(
                inputX,
                inputY,
                deltaTime
            );

        } else {

            this.applyDeceleration(
                deltaTime
            );
        }


        /*
         * Aplica velocidade.
         */

        this.applyVelocity(
            deltaTime
        );


        /*
         * Verifica se está realmente andando.
         */

        const wasMoving =
            this.moving;


        this.moving =
            Math.abs(this.velocityX) > 1 ||
            Math.abs(this.velocityY) > 1;


        /*
         * Atualiza animação.
         */

        this.updateAnimation(
            deltaTime
        );


        /*
         * Callbacks de movimento.
         */

        if (
            this.moving &&
            !wasMoving
        ) {

            if (
                typeof this.callbacks.onMove ===
                "function"
            ) {

                this.callbacks.onMove();
            }
        }


        if (
            !this.moving &&
            wasMoving
        ) {

            if (
                typeof this.callbacks.onStop ===
                "function"
            ) {

                this.callbacks.onStop();
            }
        }
    }


    /* ========================================================
       ACELERAÇÃO
       ======================================================== */

    applyAcceleration(
        inputX,
        inputY,
        deltaTime
    ) {

        this.velocityX +=
            inputX *
            this.acceleration *
            deltaTime;


        this.velocityY +=
            inputY *
            this.acceleration *
            deltaTime;


        /*
         * Limita velocidade.
         */

        const velocityMagnitude =
            Math.sqrt(
                this.velocityX *
                this.velocityX +
                this.velocityY *
                this.velocityY
            );


        if (
            velocityMagnitude >
            this.maxSpeed
        ) {

            const factor =
                this.maxSpeed /
                velocityMagnitude;


            this.velocityX *=
                factor;

            this.velocityY *=
                factor;
        }
    }


    /* ========================================================
       DESACELERAÇÃO
       ======================================================== */

    applyDeceleration(deltaTime) {

        const amount =
            this.deceleration *
            deltaTime;


        this.velocityX =
            this.moveToward(
                this.velocityX,
                0,
                amount
            );


        this.velocityY =
            this.moveToward(
                this.velocityY,
                0,
                amount
            );
    }


    /* ========================================================
       MOVE TOWARD
       ======================================================== */

    moveToward(
        current,
        target,
        amount
    ) {

        if (
            current < target
        ) {

            return Math.min(
                current + amount,
                target
            );
        }


        if (
            current > target
        ) {

            return Math.max(
                current - amount,
                target
            );
        }


        return target;
    }


    /* ========================================================
       APLICAR VELOCIDADE
       ======================================================== */

    applyVelocity(deltaTime) {

        const oldX =
            this.x;

        const oldY =
            this.y;


        const nextX =
            this.x +
            this.velocityX *
            deltaTime;


        const nextY =
            this.y +
            this.velocityY *
            deltaTime;


        /*
         * Colisão horizontal.
         */

        if (
            this.canMoveTo(
                nextX,
                this.y
            )
        ) {

            this.x =
                nextX;

        } else {

            this.velocityX =
                0;
        }


        /*
         * Colisão vertical.
         */

        if (
            this.canMoveTo(
                this.x,
                nextY
            )
        ) {

            this.y =
                nextY;

        } else {

            this.velocityY =
                0;
        }


        /*
         * Limites do mundo.
         */

        this.clampToWorld();


        /*
         * Se não houve movimento,
         * zera pequenas velocidades residuais.
         */

        if (
            Math.abs(
                this.x - oldX
            ) < 0.001
        ) {

            if (
                Math.abs(
                    this.velocityX
                ) < 1
            ) {

                this.velocityX =
                    0;
            }
        }


        if (
            Math.abs(
                this.y - oldY
            ) < 0.001
        ) {

            if (
                Math.abs(
                    this.velocityY
                ) < 1
            ) {

                this.velocityY =
                    0;
            }
        }
    }


    /* ========================================================
       COLISÃO COM O MUNDO
       ======================================================== */

    canMoveTo(
        targetX,
        targetY
    ) {

        /*
         * Se não existe mundo ou sistema de colisão,
         * permitimos o movimento.
         */

        if (!this.world) {

            return true;
        }


        /*
         * Se o mundo possuir um método próprio
         * de colisão, utilizamos ele.
         */

        if (
            typeof this.world.canPlayerMoveTo ===
            "function"
        ) {

            return this.world.canPlayerMoveTo(
                this,
                targetX,
                targetY
            );
        }


        /*
         * Caso contrário, permitimos.
         *
         * Os limites externos serão tratados
         * por clampToWorld().
         */

        return true;
    }


    /* ========================================================
       LIMITES DO MUNDO
       ======================================================== */

    clampToWorld() {

        if (!this.world) {

            return;
        }


        const worldWidth =
            this.world.width;


        const worldHeight =
            this.world.height;


        if (
            typeof worldWidth !==
            "number" ||
            typeof worldHeight !==
            "number"
        ) {

            return;
        }


        const halfWidth =
            this.width / 2;


        const halfHeight =
            this.height / 2;


        this.x =
            Math.max(
                halfWidth,
                Math.min(
                    worldWidth -
                    halfWidth,
                    this.x
                )
            );


        this.y =
            Math.max(
                halfHeight,
                Math.min(
                    worldHeight -
                    halfHeight,
                    this.y
                )
            );
    }


    /* ========================================================
       DIREÇÃO
       ======================================================== */

    updateDirection(
        inputX,
        inputY
    ) {

        const previousDirection =
            this.direction;


        /*
         * Quando o movimento horizontal é
         * dominante.
         */

        if (
            Math.abs(inputX) >
            Math.abs(inputY)
        ) {

            if (
                inputX > 0
            ) {

                this.direction =
                    "right";

            } else {

                this.direction =
                    "left";
            }


        /*
         * Quando o movimento vertical é
         * dominante.
         */

        } else {

            if (
                inputY > 0
            ) {

                this.direction =
                    "down";

            } else {

                this.direction =
                    "up";
            }
        }


        /*
         * Detecta mudança de direção.
         */

        if (
            previousDirection !==
            this.direction
        ) {

            if (
                typeof this.callbacks
                    .onDirectionChange ===
                "function"
            ) {

                this.callbacks.onDirectionChange(
                    this.direction
                );
            }
        }
    }


    /* ========================================================
       ANIMAÇÃO
       ======================================================== */

    updateAnimation(deltaTime) {

        if (!this.moving) {

            this.animation.frame =
                0;

            this.animation.timer =
                0;

            return;
        }


        this.animation.timer +=
            deltaTime;


        if (
            this.animation.timer >=
            this.animation.speed
        ) {

            this.animation.timer =
                0;


            this.animation.frame++;


            if (
                this.animation.frame >=
                this.animation.maxFrames
            ) {

                this.animation.frame =
                    0;
            }
        }
    }


    /* ========================================================
       RENDER
       ======================================================== */

    render(
        context,
        camera = null
    ) {

        if (
            !context ||
            !this.visible
        ) {

            return;
        }


        /*
         * Salva estado do Canvas.
         */

        context.save();


        /*
         * Calcula posição de renderização.
         */

        let renderX =
            this.x;

        let renderY =
            this.y;


        /*
         * A câmera não é aplicada diretamente aqui
         * porque o Game poderá aplicar a transformação
         * do mundo antes de chamar render().
         */

        if (camera) {

            /*
             * Mantemos a referência disponível
             * para futuros sistemas de renderização.
             */

            renderX =
                this.x;

            renderY =
                this.y;
        }


        /*
         * Sombra.
         */

        if (
            this.config.shadow
        ) {

            this.renderShadow(
                context,
                renderX,
                renderY
            );
        }


        /*
         * Corpo.
         */

        this.renderBody(
            context,
            renderX,
            renderY
        );


        /*
         * Debug.
         */

        if (
            this.config.debug
        ) {

            this.renderDebug(
                context,
                renderX,
                renderY
            );
        }


        context.restore();
    }


    /* ========================================================
       SOMBRA
       ======================================================== */

    renderShadow(
        context,
        x,
        y
    ) {

        context.save();


        context.fillStyle =
            "rgba(0, 0, 0, " +
            this.config.shadowOpacity +
            ")";


        context.beginPath();


        context.ellipse(
            x,
            y +
            this.height *
            0.42,

            this.config.shadowWidth,

            this.config.shadowHeight,

            0,

            0,

            Math.PI * 2
        );


        context.fill();


        context.restore();
    }


    /* ========================================================
       CORPO
       ======================================================== */

    renderBody(
        context,
        x,
        y
    ) {

        const width =
            this.width;


        const height =
            this.height;


        /*
         * Corpo principal.
         */

        context.fillStyle =
            "#d6dbe5";


        context.fillRect(
            Math.floor(
                x -
                width / 2
            ),

            Math.floor(
                y -
                height / 2
            ),

            width,

            height
        );


        /*
         * Cabeça.
         */

        context.fillStyle =
            "#b9c0cc";


        const headWidth =
            Math.floor(
                width *
                0.64
            );


        const headHeight =
            Math.floor(
                height *
                0.42
            );


        context.fillRect(
            Math.floor(
                x -
                headWidth / 2
            ),

            Math.floor(
                y -
                height *
                0.56
            ),

            headWidth,

            headHeight
        );


        /*
         * Detalhes da roupa.
         */

        context.fillStyle =
            "#596170";


        context.fillRect(
            Math.floor(
                x -
                width * 0.28
            ),

            Math.floor(
                y -
                height * 0.02
            ),

            Math.floor(
                width * 0.56
            ),

            Math.floor(
                height * 0.12
            )
        );


        /*
         * Rosto / direção.
         */

        this.renderFace(
            context,
            x,
            y
        );
    }


    /* ========================================================
       ROSTO
       ======================================================== */

    renderFace(
        context,
        x,
        y
    ) {

        context.fillStyle =
            "#252a34";


        const eyeSize =
            4;


        if (
            this.direction ===
            "down"
        ) {

            context.fillRect(
                Math.floor(
                    x - 7
                ),

                Math.floor(
                    y - 13
                ),

                eyeSize,

                eyeSize
            );


            context.fillRect(
                Math.floor(
                    x + 3
                ),

                Math.floor(
                    y - 13
                ),

                eyeSize,

                eyeSize
            );


        } else if (
            this.direction ===
            "up"
        ) {

            context.fillRect(
                Math.floor(
                    x - 5
                ),

                Math.floor(
                    y - 17
                ),

                10,

                3
            );


        } else if (
            this.direction ===
            "left"
        ) {

            context.fillRect(
                Math.floor(
                    x - 11
                ),

                Math.floor(
                    y - 9
                ),

                eyeSize,

                7
            );


        } else if (
            this.direction ===
            "right"
        ) {

            context.fillRect(
                Math.floor(
                    x + 7
                ),

                Math.floor(
                    y - 9
                ),

                eyeSize,

                7
            );
        }
    }


    /* ========================================================
       DEBUG
       ======================================================== */

    renderDebug(
        context,
        x,
        y
    ) {

        /*
         * Hitbox de colisão.
         */

        context.strokeStyle =
            "#ff0000";


        context.lineWidth =
            1;


        context.strokeRect(
            Math.floor(
                x -
                this.collision.width /
                2
            ),

            Math.floor(
                y -
                this.collision.height /
                2
            ),

            this.collision.width,

            this.collision.height
        );


        /*
         * Centro do jogador.
         */

        context.fillStyle =
            "#ffff00";


        context.fillRect(
            Math.floor(
                x - 2
            ),

            Math.floor(
                y - 2
            ),

            4,

            4
        );
    }


    /* ========================================================
       PARAR
       ======================================================== */

    stop() {

        const wasMoving =
            this.moving;


        this.velocityX =
            0;

        this.velocityY =
            0;

        this.moving =
            false;


        this.animation.frame =
            0;

        this.animation.timer =
            0;


        if (
            wasMoving &&
            typeof this.callbacks.onStop ===
            "function"
        ) {

            this.callbacks.onStop();
        }
    }


    /* ========================================================
       TELEPORTAR
       ======================================================== */

    setPosition(
        x,
        y
    ) {

        this.x =
            x;

        this.y =
            y;


        this.previousPosition.x =
            x;

        this.previousPosition.y =
            y;


        this.stop();


        this.clampToWorld();
    }


    /* ========================================================
       DIREÇÃO MANUAL
       ======================================================== */

    setDirection(
        direction
    ) {

        const validDirections = [
            "up",
            "down",
            "left",
            "right"
        ];


        if (
            !validDirections.includes(
                direction
            )
        ) {

            return;
        }


        this.direction =
            direction;
    }


    /* ========================================================
       ATIVAR
       ======================================================== */

    enable() {

        this.enabled =
            true;
    }


    /* ========================================================
       DESATIVAR
       ======================================================== */

    disable() {

        this.enabled =
            false;

        this.stop();
    }


    /* ========================================================
       RESET
       ======================================================== */

    reset(
        x,
        y
    ) {

        this.x =
            x;

        this.y =
            y;


        this.direction =
            "down";


        this.velocityX =
            0;

        this.velocityY =
            0;


        this.moving =
            false;


        this.animation.frame =
            0;

        this.animation.timer =
            0;


        this.enabled =
            true;

        this.visible =
            true;


        this.previousPosition.x =
            x;

        this.previousPosition.y =
            y;


        this.clampToWorld();
    }


    /* ========================================================
       CENTRO
       ======================================================== */

    getCenter() {

        return {
            x: this.x,
            y: this.y
        };
    }


    /* ========================================================
       RETÂNGULO DE COLISÃO
       ======================================================== */

    getCollisionRect(
        x = this.x,
        y = this.y
    ) {

        return {

            x:
                x -
                this.collision.width /
                2,

            y:
                y -
                this.collision.height /
                2,

            width:
                this.collision.width,

            height:
                this.collision.height
        };
    }


    /* ========================================================
       RETÂNGULO VISUAL
       ======================================================== */

    getBounds() {

        return {

            x:
                this.x -
                this.width /
                2,

            y:
                this.y -
                this.height /
                2,

            width:
                this.width,

            height:
                this.height
        };
    }


    /* ========================================================
       CALLBACKS
       ======================================================== */

    setCallbacks(
        callbacks = {}
    ) {

        if (
            typeof callbacks.onMove ===
            "function"
        ) {

            this.callbacks.onMove =
                callbacks.onMove;
        }


        if (
            typeof callbacks.onStop ===
            "function"
        ) {

            this.callbacks.onStop =
                callbacks.onStop;
        }


        if (
            typeof callbacks.onDirectionChange ===
            "function"
        ) {

            this.callbacks.onDirectionChange =
                callbacks.onDirectionChange;
        }
    }


    /* ========================================================
       DESTRUIR
       ======================================================== */

    destroy() {

        this.stop();

        this.input =
            null;

        this.world =
            null;

        this.callbacks =
            {

                onMove: null,

                onStop: null,

                onDirectionChange: null
            };
    }
}