export class Player {
    constructor(options = {}) {
        this.input = options.input;
        this.world = options.world;

        this.x = options.x ?? 760;
        this.y = options.y ?? 430;

        this.startX = this.x;
        this.startY = this.y;

        this.width = options.width ?? 30;
        this.height = options.height ?? 42;

        this.speed = options.speed ?? 180;
        this.maxSpeed = options.maxSpeed ?? 180;

        this.acceleration =
            options.acceleration ?? 1250;

        this.deceleration =
            options.deceleration ?? 1500;

        this.vx = 0;
        this.vy = 0;

        this.direction = "down";

        this.animation = {
            frame: 0,
            timer: 0,
            speed: 0.12,
            moving: false
        };

        this.walkCycle = 0;

        this.shadow = {
            width: 25,
            height: 9,
            alpha: 0.25
        };

        this.cane = {
            length: 28,
            swing: 0
        };

        this.initialized = false;
    }

    initialize() {
        this.initialized = true;
    }

    update(deltaTime) {
        if (!this.input) {
            return;
        }

        const movement =
            this.input.getMovementVector();

        const moving =
            Math.abs(movement.x) > 0 ||
            Math.abs(movement.y) > 0;

        this.animation.moving = moving;

        if (moving) {
            this.vx +=
                movement.x *
                this.acceleration *
                deltaTime;

            this.vy +=
                movement.y *
                this.acceleration *
                deltaTime;

            this.updateDirection(
                movement.x,
                movement.y
            );
        } else {
            this.applyDeceleration(
                deltaTime
            );
        }

        this.limitVelocity();

        const nextX =
            this.x +
            this.vx *
            deltaTime;

        const nextY =
            this.y +
            this.vy *
            deltaTime;

        if (
            this.canMoveTo(
                nextX,
                this.y
            )
        ) {
            this.x = nextX;
        } else {
            this.vx = 0;
        }

        if (
            this.canMoveTo(
                this.x,
                nextY
            )
        ) {
            this.y = nextY;
        } else {
            this.vy = 0;
        }

        this.keepInsideWorld();

        this.updateAnimation(
            deltaTime,
            moving
        );
    }

    updateDirection(horizontal, vertical) {
        if (
            Math.abs(horizontal) >
            Math.abs(vertical)
        ) {
            if (horizontal > 0) {
                this.direction = "right";
            } else if (horizontal < 0) {
                this.direction = "left";
            }
        } else {
            if (vertical > 0) {
                this.direction = "down";
            } else if (vertical < 0) {
                this.direction = "up";
            }
        }
    }

    applyDeceleration(deltaTime) {
        const amount =
            this.deceleration *
            deltaTime;

        if (Math.abs(this.vx) <= amount) {
            this.vx = 0;
        } else {
            this.vx -=
                Math.sign(this.vx) *
                amount;
        }

        if (Math.abs(this.vy) <= amount) {
            this.vy = 0;
        } else {
            this.vy -=
                Math.sign(this.vy) *
                amount;
        }
    }

    limitVelocity() {
        const magnitude =
            Math.hypot(
                this.vx,
                this.vy
            );

        if (
            magnitude <=
            this.maxSpeed
        ) {
            return;
        }

        const scale =
            this.maxSpeed /
            magnitude;

        this.vx *= scale;
        this.vy *= scale;
    }

    updateAnimation(
        deltaTime,
        moving
    ) {
        if (!moving) {
            this.animation.frame = 0;
            this.animation.timer = 0;
            this.walkCycle = 0;
            this.cane.swing = 0;
            return;
        }

        this.animation.timer +=
            deltaTime;

        this.walkCycle +=
            deltaTime * 8;

        this.cane.swing =
            Math.sin(
                this.walkCycle
            ) * 0.15;

        if (
            this.animation.timer >=
            this.animation.speed
        ) {
            this.animation.timer = 0;

            this.animation.frame =
                (this.animation.frame + 1) %
                4;
        }
    }

    render(ctx) {
        ctx.save();

        ctx.imageSmoothingEnabled =
            false;

        this.renderShadow(ctx);

        this.renderCharacter(ctx);

        ctx.restore();
    }

    renderShadow(ctx) {
        const shadowX =
            Math.floor(
                this.x -
                this.shadow.width / 2
            );

        const shadowY =
            Math.floor(
                this.y +
                this.height / 2 -
                2
            );

        ctx.save();

        ctx.globalAlpha =
            this.shadow.alpha;

        ctx.fillStyle =
            "#392b22";

        ctx.beginPath();

        ctx.ellipse(
            shadowX +
                this.shadow.width / 2,
            shadowY,
            this.shadow.width / 2,
            this.shadow.height / 2,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
    }

    renderCharacter(ctx) {
        const px =
            Math.floor(
                this.x -
                this.width / 2
            );

        const py =
            Math.floor(
                this.y -
                this.height / 2
            );

        const walkOffset =
            this.animation.moving
                ? Math.sin(
                      this.walkCycle
                  ) * 2
                : 0;

        ctx.save();

        ctx.translate(
            0,
            walkOffset
        );

        switch (this.direction) {
            case "up":
                this.renderBack(
                    ctx,
                    px,
                    py
                );
                break;

            case "left":
                this.renderSide(
                    ctx,
                    px,
                    py,
                    true
                );
                break;

            case "right":
                this.renderSide(
                    ctx,
                    px,
                    py,
                    false
                );
                break;

            default:
                this.renderFront(
                    ctx,
                    px,
                    py
                );
                break;
        }

        ctx.restore();
    }

    renderFront(ctx, px, py) {
        const centerX =
            px +
            this.width / 2;

        // Pernas
        this.renderLegs(
            ctx,
            centerX,
            py + 31
        );

        // Corpo / camiseta
        ctx.fillStyle =
            "#477fa5";

        ctx.fillRect(
            centerX - 10,
            py + 17,
            20,
            17
        );

        // Detalhe da camiseta
        ctx.fillStyle =
            "#365f7b";

        ctx.fillRect(
            centerX - 10,
            py + 27,
            20,
            7
        );

        // Braço esquerdo
        ctx.fillStyle =
            "#e7b88d";

        ctx.fillRect(
            centerX - 14,
            py + 20,
            5,
            13
        );

        // Braço direito
        ctx.fillRect(
            centerX + 9,
            py + 20,
            5,
            13
        );

        // Mãos
        ctx.fillStyle =
            "#e3aa7e";

        ctx.fillRect(
            centerX - 14,
            py + 31,
            5,
            5
        );

        ctx.fillRect(
            centerX + 9,
            py + 31,
            5,
            5
        );

        // Pescoço
        ctx.fillStyle =
            "#d99e75";

        ctx.fillRect(
            centerX - 4,
            py + 13,
            8,
            6
        );

        // Rosto
        ctx.fillStyle =
            "#e8b88c";

        ctx.fillRect(
            centerX - 10,
            py + 3,
            20,
            15
        );

        // Orelhas
        ctx.fillRect(
            centerX - 12,
            py + 8,
            3,
            7
        );

        ctx.fillRect(
            centerX + 9,
            py + 8,
            3,
            7
        );

        // Cabelo
        ctx.fillStyle =
            "#3a2925";

        ctx.fillRect(
            centerX - 10,
            py + 1,
            20,
            7
        );

        ctx.fillRect(
            centerX - 8,
            py - 2,
            16,
            5
        );

        ctx.fillRect(
            centerX - 12,
            py + 5,
            4,
            8
        );

        ctx.fillRect(
            centerX + 8,
            py + 5,
            4,
            8
        );

        // Franja
        ctx.fillRect(
            centerX - 7,
            py + 3,
            5,
            5
        );

        ctx.fillRect(
            centerX + 2,
            py + 3,
            5,
            5
        );

        // Olhos
        ctx.fillStyle =
            "#252020";

        ctx.fillRect(
            centerX - 6,
            py + 9,
            3,
            3
        );

        ctx.fillRect(
            centerX + 3,
            py + 9,
            3,
            3
        );

        // Sorriso
        ctx.fillStyle =
            "#a45d59";

        ctx.fillRect(
            centerX - 3,
            py + 14,
            6,
            2
        );

        // Mochila
        this.renderBackpack(
            ctx,
            centerX,
            py + 19,
            true
        );

        // Bengala
        this.renderCane(
            ctx,
            centerX + 13,
            py + 25,
            0.12
        );
    }

    renderBack(ctx, px, py) {
        const centerX =
            px +
            this.width / 2;

        this.renderLegs(
            ctx,
            centerX,
            py + 31
        );

        // Mochila
        this.renderBackpack(
            ctx,
            centerX,
            py + 16,
            false
        );

        // Corpo
        ctx.fillStyle =
            "#477fa5";

        ctx.fillRect(
            centerX - 10,
            py + 16,
            20,
            18
        );

        // Mochila principal
        ctx.fillStyle =
            "#8d5145";

        ctx.fillRect(
            centerX - 13,
            py + 14,
            26,
            19
        );

        ctx.fillStyle =
            "#633a35";

        ctx.fillRect(
            centerX - 9,
            py + 19,
            18,
            3
        );

        // Pescoço
        ctx.fillStyle =
            "#d99e75";

        ctx.fillRect(
            centerX - 4,
            py + 11,
            8,
            7
        );

        // Cabeça
        ctx.fillStyle =
            "#e3ad82";

        ctx.fillRect(
            centerX - 10,
            py + 2,
            20,
            16
        );

        // Cabelo
        ctx.fillStyle =
            "#3a2925";

        ctx.fillRect(
            centerX - 11,
            py,
            22,
            12
        );

        ctx.fillRect(
            centerX - 8,
            py - 3,
            16,
            5
        );

        // Orelhas
        ctx.fillStyle =
            "#d69f78";

        ctx.fillRect(
            centerX - 12,
            py + 8,
            3,
            7
        );

        ctx.fillRect(
            centerX + 9,
            py + 8,
            3,
            7
        );

        this.renderCane(
            ctx,
            centerX + 13,
            py + 25,
            -0.12
        );
    }

    renderSide(
        ctx,
        px,
        py,
        facingLeft
    ) {
        const centerX =
            px +
            this.width / 2;

        const direction =
            facingLeft ? -1 : 1;

        this.renderLegs(
            ctx,
            centerX,
            py + 31
        );

        // Mochila
        ctx.fillStyle =
            "#8d5145";

        ctx.fillRect(
            centerX -
                direction * 11 -
                8,
            py + 17,
            13,
            18
        );

        // Corpo
        ctx.fillStyle =
            "#477fa5";

        ctx.fillRect(
            centerX - 9,
            py + 17,
            18,
            18
        );

        // Braço
        ctx.fillStyle =
            "#e5b084";

        ctx.fillRect(
            centerX +
                direction * 7,
            py + 20,
            6,
            13
        );

        // Mão
        ctx.fillRect(
            centerX +
                direction * 8,
            py + 31,
            6,
            5
        );

        // Pescoço
        ctx.fillStyle =
            "#d59d75";

        ctx.fillRect(
            centerX +
                direction * 3 -
                4,
            py + 12,
            8,
            7
        );

        // Rosto
        ctx.fillStyle =
            "#e7b589";

        ctx.fillRect(
            centerX - 9,
            py + 3,
            18,
            16
        );

        // Nariz
        ctx.fillRect(
            centerX +
                direction * 9,
            py + 10,
            4,
            4
        );

        // Cabelo
        ctx.fillStyle =
            "#3a2925";

        ctx.fillRect(
            centerX - 10,
            py + 1,
            20,
            8
        );

        ctx.fillRect(
            centerX -
                direction * 8,
            py + 5,
            5,
            8
        );

        // Olho
        ctx.fillStyle =
            "#252020";

        ctx.fillRect(
            centerX +
                direction * 4,
            py + 9,
            3,
            3
        );

        // Sobrancelha
        ctx.fillRect(
            centerX +
                direction * 3,
            py + 7,
            5,
            2
        );

        this.renderCane(
            ctx,
            centerX +
                direction * 13,
            py + 25,
            direction * 0.15
        );
    }

    renderLegs(
        ctx,
        centerX,
        y
    ) {
        const walking =
            this.animation.moving;

        let offset = 0;

        if (walking) {
            offset =
                Math.sin(
                    this.walkCycle
                ) * 3;
        }

        // Perna esquerda
        ctx.fillStyle =
            "#30475a";

        ctx.fillRect(
            centerX - 8,
            y,
            7,
            11 + offset
        );

        // Perna direita
        ctx.fillRect(
            centerX + 1,
            y,
            7,
            11 - offset
        );

        // Sapatos
        ctx.fillStyle =
            "#342b29";

        ctx.fillRect(
            centerX - 10,
            y + 9 + offset,
            9,
            5
        );

        ctx.fillRect(
            centerX,
            y + 9 - offset,
            9,
            5
        );
    }

    renderBackpack(
        ctx,
        centerX,
        y,
        visible
    ) {
        if (!visible) {
            return;
        }

        ctx.fillStyle =
            "#8d5145";

        ctx.fillRect(
            centerX - 13,
            y,
            7,
            17
        );

        ctx.fillRect(
            centerX + 6,
            y,
            7,
            17
        );
    }

    renderCane(
        ctx,
        x,
        y,
        angle
    ) {
        ctx.save();

        ctx.translate(
            x,
            y
        );

        ctx.rotate(angle);

        // Cabo
        ctx.strokeStyle =
            "#f0eee4";

        ctx.lineWidth = 3;

        ctx.beginPath();

        ctx.moveTo(0, 0);

        ctx.lineTo(
            0,
            this.cane.length
        );

        ctx.stroke();

        // Empunhadura
        ctx.lineWidth = 4;

        ctx.beginPath();

        ctx.moveTo(
            0,
            0
        );

        ctx.lineTo(
            6,
            -5
        );

        ctx.stroke();

        // Ponteira
        ctx.strokeStyle =
            "#c9c5b9";

        ctx.lineWidth = 2;

        ctx.beginPath();

        ctx.arc(
            0,
            this.cane.length,
            4,
            0,
            Math.PI
        );

        ctx.stroke();

        ctx.restore();
    }

    canMoveTo(
        targetX,
        targetY
    ) {
        if (
            this.world &&
            typeof this.world.canPlayerMoveTo ===
                "function"
        ) {
            return this.world.canPlayerMoveTo(
                this,
                targetX,
                targetY
            );
        }

        return true;
    }

    getCollisionRect(
        targetX = this.x,
        targetY = this.y
    ) {
        const collisionWidth = 18;
        const collisionHeight = 18;

        return {
            x:
                targetX -
                collisionWidth / 2,

            y:
                targetY -
                collisionHeight / 2 +
                8,

            width: collisionWidth,
            height: collisionHeight
        };
    }

    getBounds() {
        return {
            x:
                this.x -
                this.width / 2,

            y:
                this.y -
                this.height / 2,

            width: this.width,
            height: this.height
        };
    }

    keepInsideWorld() {
        if (!this.world) {
            return;
        }

        const bounds =
            this.world.getBounds();

        const halfWidth =
            this.width / 2;

        const halfHeight =
            this.height / 2;

        this.x =
            Math.max(
                halfWidth,
                Math.min(
                    bounds.width -
                        halfWidth,
                    this.x
                )
            );

        this.y =
            Math.max(
                halfHeight,
                Math.min(
                    bounds.height -
                        halfHeight,
                    this.y
                )
            );
    }

    reset(
        x = this.startX,
        y = this.startY
    ) {
        this.x = x;
        this.y = y;

        this.vx = 0;
        this.vy = 0;

        this.direction = "down";

        this.animation.frame = 0;
        this.animation.timer = 0;
        this.animation.moving = false;

        this.walkCycle = 0;

        this.cane.swing = 0;
    }

    setPosition(
        x,
        y
    ) {
        this.x = x;
        this.y = y;

        this.keepInsideWorld();
    }

    getSpeed() {
        return Math.hypot(
            this.vx,
            this.vy
        );
    }

    isMoving() {
        return (
            Math.abs(this.vx) > 1 ||
            Math.abs(this.vy) > 1
        );
    }

    setDirection(direction) {
        const validDirections = [
            "up",
            "down",
            "left",
            "right"
        ];

        if (
            validDirections.includes(
                direction
            )
        ) {
            this.direction =
                direction;
        }
    }

    destroy() {
        this.input = null;
        this.world = null;
    }
}