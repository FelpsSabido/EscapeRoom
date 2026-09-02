import { Input } from "./input.js";
import { Player } from "./player.js";
import { World } from "./world.js";

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.width = 960;
        this.height = 540;

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.ctx.imageSmoothingEnabled = false;

        this.state = "loading";

        this.lastTime = 0;
        this.deltaTime = 0;

        this.fps = 60;
        this.frameCounter = 0;
        this.fpsTimer = 0;

        this.camera = {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0,
            smoothness: 8,
            shake: 0
        };

        this.world = new World({
            width: 1500,
            height: 900
        });

        this.input = new Input(this);

        const spawn = this.world.getSpawnPoint();

        this.player = new Player({
            input: this.input,
            world: this.world,
            x: spawn.x,
            y: spawn.y,
            width: 30,
            height: 42,
            speed: 180,
            maxSpeed: 180,
            acceleration: 1250,
            deceleration: 1500
        });

        this.interaction = {
            current: null,
            pulse: 0
        };

        this.particles = [];

        this.lightTime = 0;

        this.screenFlash = 0;

        this.vignetteStrength = 0.25;

        this.debug = false;

        this.running = false;

        this.callbacks = {
            onComplete: null,
            onPause: null,
            onResume: null,
            onInteraction: null,
            onPlayerMove: null
        };

        this.world.initialize();

        this.player.initialize();

        this.updateCamera(1);

        this.state = "menu";

        this.render();

        this.loop = this.loop.bind(this);
    }

    start() {
        if (this.running) {
            return;
        }

        this.running = true;

        this.state = "playing";

        this.lastTime = performance.now();

        requestAnimationFrame(this.loop);
    }

    loop(timestamp) {
        if (!this.running) {
            return;
        }

        this.deltaTime =
            Math.min(
                (timestamp - this.lastTime) / 1000,
                0.05
            );

        this.lastTime = timestamp;

        this.update(this.deltaTime);

        this.render();

        requestAnimationFrame(this.loop);
    }

    update(deltaTime) {
        if (this.state === "playing") {
            this.world.update(deltaTime);

            this.player.update(deltaTime);

            this.updateCamera(deltaTime);

            this.updateInteraction(deltaTime);

            this.updateParticles(deltaTime);

            this.updateLighting(deltaTime);

            this.updateEffects(deltaTime);

            this.checkGameState();
        }

        this.updateFPS(deltaTime);

        if (this.input) {
            if (this.input.wantsPause()) {
                this.togglePause();
            }

            if (this.input.wantsInteract()) {
                this.interact();
            }

            this.input.endFrame();
        }
    }

    updateCamera(deltaTime) {
        if (!this.player) {
            return;
        }

        this.camera.targetX =
            this.player.x - this.width / 2;

        this.camera.targetY =
            this.player.y - this.height / 2;

        const maxCameraX =
            this.world.width - this.width;

        const maxCameraY =
            this.world.height - this.height;

        this.camera.targetX =
            Math.max(
                0,
                Math.min(
                    maxCameraX,
                    this.camera.targetX
                )
            );

        this.camera.targetY =
            Math.max(
                0,
                Math.min(
                    maxCameraY,
                    this.camera.targetY
                )
            );

        const interpolation =
            1 -
            Math.exp(
                -this.camera.smoothness *
                deltaTime
            );

        this.camera.x +=
            (this.camera.targetX - this.camera.x) *
            interpolation;

        this.camera.y +=
            (this.camera.targetY - this.camera.y) *
            interpolation;

        if (this.camera.shake > 0) {
            this.camera.shake -= deltaTime;

            if (this.camera.shake < 0) {
                this.camera.shake = 0;
            }
        }
    }

    updateInteraction(deltaTime) {
        this.interaction.pulse +=
            deltaTime * 4;

        const target =
            this.world.getNearestInteraction(
                this.player.x,
                this.player.y,
                95
            );

        this.interaction.current = target;
    }

    updateParticles(deltaTime) {
        for (const particle of this.particles) {
            particle.x +=
                particle.vx * deltaTime;

            particle.y +=
                particle.vy * deltaTime;

            particle.life -= deltaTime;

            particle.alpha =
                Math.max(
                    0,
                    particle.life /
                    particle.maxLife
                );
        }

        this.particles =
            this.particles.filter(
                particle =>
                    particle.life > 0
            );

        if (
            this.particles.length < 70 &&
            Math.random() < deltaTime * 8
        ) {
            this.createDustParticle();
        }
    }

    createDustParticle() {
        const x =
            this.camera.x +
            Math.random() * this.width;

        const y =
            this.camera.y +
            Math.random() * this.height;

        if (
            x < 70 ||
            x > this.world.width - 70 ||
            y < 80 ||
            y > this.world.height - 70
        ) {
            return;
        }

        this.particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 8,
            vy: -5 - Math.random() * 8,
            life: 1.2 + Math.random() * 2,
            maxLife: 1.2 + Math.random() * 2,
            alpha: 0,
            size: 1 + Math.random() * 2
        });
    }

    updateLighting(deltaTime) {
        this.lightTime += deltaTime;

        this.vignetteStrength =
            0.23 +
            Math.sin(this.lightTime * 0.8) *
            0.015;
    }

    updateEffects(deltaTime) {
        if (this.screenFlash > 0) {
            this.screenFlash -= deltaTime;

            if (this.screenFlash < 0) {
                this.screenFlash = 0;
            }
        }
    }

    checkGameState() {
        if (
            this.world.door.open &&
            this.player.x >
            this.world.door.x + 25 &&
            this.player.x <
            this.world.door.x +
            this.world.door.width - 25 &&
            this.player.y < 80
        ) {
            this.complete();
        }

        if (this.callbacks.onPlayerMove) {
            this.callbacks.onPlayerMove({
                x: this.player.x,
                y: this.player.y
            });
        }
    }

    interact() {
        if (this.state !== "playing") {
            return;
        }

        const target =
            this.interaction.current;

        if (!target) {
            return;
        }

        if (target.id === "door") {
            this.tryDoor();
        } else {
            this.triggerInteraction(target);
        }
    }

    triggerInteraction(target) {
        if (this.callbacks.onInteraction) {
            this.callbacks.onInteraction(target);
        }

        this.spawnInteractionParticles(
            target.x + target.width / 2,
            target.y + target.height / 2
        );

        this.camera.shake = 0.08;
    }

    tryDoor() {
        if (this.world.door.open) {
            return;
        }

        if (this.callbacks.onInteraction) {
            this.callbacks.onInteraction({
                id: "door",
                type: "door",
                label: "Porta",
                message:
                    "A porta está trancada. Você precisa descobrir a senha."
            });
        }

        this.spawnInteractionParticles(
            this.world.door.x +
            this.world.door.width / 2,
            this.world.door.y +
            this.world.door.height / 2
        );
    }

    openDoor() {
        this.world.setDoorOpen(true);

        this.screenFlash = 0.15;

        this.camera.shake = 0.2;

        this.spawnInteractionParticles(
            this.world.door.x +
            this.world.door.width / 2,
            this.world.door.y +
            this.world.door.height / 2,
            20
        );
    }

    spawnInteractionParticles(
        x,
        y,
        amount = 8
    ) {
        for (let i = 0; i < amount; i++) {
            const angle =
                Math.random() *
                Math.PI *
                2;

            const speed =
                20 +
                Math.random() * 45;

            const life =
                0.35 +
                Math.random() * 0.5;

            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life,
                maxLife: life,
                alpha: 1,
                size:
                    1 +
                    Math.random() * 3
            });
        }
    }

    render() {
        const ctx = this.ctx;

        ctx.clearRect(
            0,
            0,
            this.width,
            this.height
        );

        this.renderBackground(ctx);

        ctx.save();

        let shakeX = 0;
        let shakeY = 0;

        if (this.camera.shake > 0) {
            const intensity =
                this.camera.shake * 18;

            shakeX =
                (Math.random() - 0.5) *
                intensity;

            shakeY =
                (Math.random() - 0.5) *
                intensity;
        }

        ctx.translate(
            -Math.floor(this.camera.x) +
            shakeX,
            -Math.floor(this.camera.y) +
            shakeY
        );

        this.world.render(ctx);

        this.renderParticles(ctx);

        this.player.render(ctx);

        this.renderPlayerLight(ctx);

        ctx.restore();

        this.renderLighting(ctx);

        this.renderInteractionHint(ctx);

        this.renderHUD(ctx);

        this.renderScreenEffects(ctx);

        if (this.debug) {
            this.renderDebug(ctx);
        }
    }

    renderBackground(ctx) {
        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                this.height
            );

        gradient.addColorStop(
            0,
            "#6d8fa1"
        );

        gradient.addColorStop(
            0.45,
            "#9eb5ad"
        );

        gradient.addColorStop(
            1,
            "#536b69"
        );

        ctx.fillStyle = gradient;

        ctx.fillRect(
            0,
            0,
            this.width,
            this.height
        );
    }

    renderParticles(ctx) {
        for (const particle of this.particles) {
            ctx.save();

            ctx.globalAlpha =
                particle.alpha * 0.65;

            ctx.fillStyle = "#fff0c7";

            ctx.fillRect(
                Math.floor(particle.x),
                Math.floor(particle.y),
                particle.size,
                particle.size
            );

            ctx.restore();
        }
    }

    renderPlayerLight(ctx) {
        if (!this.player) {
            return;
        }

        const x = this.player.x;
        const y = this.player.y;

        const gradient =
            ctx.createRadialGradient(
                x,
                y,
                10,
                x,
                y,
                135
            );

        gradient.addColorStop(
            0,
            "rgba(255,245,205,0.10)"
        );

        gradient.addColorStop(
            0.55,
            "rgba(255,220,150,0.035)"
        );

        gradient.addColorStop(
            1,
            "rgba(255,220,150,0)"
        );

        ctx.save();

        ctx.fillStyle = gradient;

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            135,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
    }

    renderLighting(ctx) {
        ctx.save();

        ctx.globalCompositeOperation =
            "multiply";

        const gradient =
            ctx.createRadialGradient(
                this.width / 2,
                this.height / 2,
                120,
                this.width / 2,
                this.height / 2,
                620
            );

        gradient.addColorStop(
            0,
            "rgba(255,255,255,1)"
        );

        gradient.addColorStop(
            0.55,
            "rgba(255,255,255,0.95)"
        );

        gradient.addColorStop(
            1,
            `rgba(30,35,50,${this.vignetteStrength})`
        );

        ctx.fillStyle = gradient;

        ctx.fillRect(
            0,
            0,
            this.width,
            this.height
        );

        ctx.restore();

        this.renderCeilingGlow(ctx);
    }

    renderCeilingGlow(ctx) {
        const lights = [
            {
                x: 515 - this.camera.x,
                y: 100 - this.camera.y
            },
            {
                x: 915 - this.camera.x,
                y: 100 - this.camera.y
            },
            {
                x: 1250 - this.camera.x,
                y: 100 - this.camera.y
            }
        ];

        ctx.save();

        ctx.globalCompositeOperation =
            "screen";

        for (const light of lights) {
            const flicker =
                0.88 +
                Math.sin(
                    this.lightTime * 6 +
                    light.x
                ) *
                0.035;

            const gradient =
                ctx.createRadialGradient(
                    light.x,
                    light.y,
                    10,
                    light.x,
                    light.y,
                    170
                );

            gradient.addColorStop(
                0,
                `rgba(255,235,175,${0.13 * flicker})`
            );

            gradient.addColorStop(
                0.5,
                `rgba(255,220,150,${0.045 * flicker})`
            );

            gradient.addColorStop(
                1,
                "rgba(255,220,150,0)"
            );

            ctx.fillStyle = gradient;

            ctx.beginPath();

            ctx.arc(
                light.x,
                light.y,
                170,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }

        ctx.restore();
    }

    renderInteractionHint(ctx) {
        const target =
            this.interaction.current;

        if (!target) {
            return;
        }

        const pulse =
            Math.sin(
                this.interaction.pulse
            ) * 2;

        const text =
            `E  •  ${target.label}`;

        ctx.save();

        ctx.font =
            "bold 14px Arial, sans-serif";

        const textWidth =
            ctx.measureText(text).width;

        const boxWidth =
            textWidth + 28;

        const boxHeight = 34;

        const x =
            this.width / 2 -
            boxWidth / 2;

        const y =
            this.height - 68 +
            pulse;

        ctx.fillStyle =
            "rgba(30,35,38,0.88)";

        this.roundRect(
            ctx,
            x,
            y,
            boxWidth,
            boxHeight,
            8
        );

        ctx.fill();

        ctx.strokeStyle =
            "rgba(255,235,190,0.35)";

        ctx.lineWidth = 1;

        this.roundRect(
            ctx,
            x,
            y,
            boxWidth,
            boxHeight,
            8
        );

        ctx.stroke();

        ctx.fillStyle =
            "#fff0c8";

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(
            text,
            this.width / 2,
            y + boxHeight / 2
        );

        ctx.restore();
    }

    renderHUD(ctx) {
        if (this.state === "menu") {
            this.renderMenu(ctx);
            return;
        }

        if (this.state === "paused") {
            this.renderPause(ctx);
            return;
        }

        if (this.state === "completed") {
            this.renderCompleted(ctx);
        }
    }

    renderMenu(ctx) {
        ctx.save();

        ctx.fillStyle =
            "rgba(20,25,30,0.45)";

        ctx.fillRect(
            0,
            0,
            this.width,
            this.height
        );

        ctx.fillStyle =
            "#f8e8c4";

        ctx.textAlign = "center";

        ctx.font =
            "bold 38px Arial, sans-serif";

        ctx.fillText(
            "ESCAPE ROOM",
            this.width / 2,
            185
        );

        ctx.font =
            "bold 20px Arial, sans-serif";

        ctx.fillStyle =
            "#f0cf78";

        ctx.fillText(
            "A SALA DE AULA",
            this.width / 2,
            220
        );

        ctx.font =
            "16px Arial, sans-serif";

        ctx.fillStyle =
            "#fff4dd";

        ctx.fillText(
            "Encontre as pistas, descubra a senha e escape.",
            this.width / 2,
            270
        );

        ctx.font =
            "bold 17px Arial, sans-serif";

        ctx.fillStyle =
            "#ffffff";

        ctx.fillText(
            "WASD / SETAS  •  Mover",
            this.width / 2,
            325
        );

        ctx.fillText(
            "E  •  Interagir",
            this.width / 2,
            355
        );

        ctx.fillStyle =
            "#e4bf68";

        ctx.font =
            "bold 18px Arial, sans-serif";

        ctx.fillText(
            "Pressione ENTER para começar",
            this.width / 2,
            420
        );

        ctx.restore();
    }

    renderPause(ctx) {
        ctx.save();

        ctx.fillStyle =
            "rgba(15,20,25,0.62)";

        ctx.fillRect(
            0,
            0,
            this.width,
            this.height
        );

        ctx.textAlign = "center";

        ctx.fillStyle =
            "#fff0cd";

        ctx.font =
            "bold 34px Arial, sans-serif";

        ctx.fillText(
            "PAUSADO",
            this.width / 2,
            this.height / 2 - 20
        );

        ctx.font =
            "16px Arial, sans-serif";

        ctx.fillText(
            "Pressione ESC ou P para continuar",
            this.width / 2,
            this.height / 2 + 25
        );

        ctx.restore();
    }

    renderCompleted(ctx) {
        ctx.save();

        ctx.fillStyle =
            "rgba(15,25,20,0.78)";

        ctx.fillRect(
            0,
            0,
            this.width,
            this.height
        );

        ctx.textAlign = "center";

        ctx.fillStyle =
            "#e7d078";

        ctx.font =
            "bold 40px Arial, sans-serif";

        ctx.fillText(
            "VOCÊ ESCAPOU!",
            this.width / 2,
            220
        );

        ctx.fillStyle =
            "#fff3d2";

        ctx.font =
            "18px Arial, sans-serif";

        ctx.fillText(
            "Parabéns! Você conseguiu encontrar a saída.",
            this.width / 2,
            265
        );

        ctx.fillStyle =
            "#e8c66f";

        ctx.font =
            "bold 18px Arial, sans-serif";

        ctx.fillText(
            "Pressione ENTER para jogar novamente",
            this.width / 2,
            330
        );

        ctx.restore();
    }

    renderScreenEffects(ctx) {
        if (this.screenFlash > 0) {
            ctx.save();

            ctx.globalAlpha =
                Math.min(
                    1,
                    this.screenFlash * 4
                );

            ctx.fillStyle =
                "#fff3ce";

            ctx.fillRect(
                0,
                0,
                this.width,
                this.height
            );

            ctx.restore();
        }

        // Pequena camada cinematográfica
        ctx.save();

        ctx.fillStyle =
            "rgba(20,25,30,0.07)";

        ctx.fillRect(
            0,
            0,
            this.width,
            2
        );

        ctx.fillRect(
            0,
            this.height - 2,
            this.width,
            2
        );

        ctx.restore();
    }

    renderDebug(ctx) {
        ctx.save();

        ctx.fillStyle =
            "rgba(0,0,0,0.75)";

        ctx.fillRect(
            10,
            10,
            220,
            125
        );

        ctx.fillStyle =
            "#ffffff";

        ctx.font =
            "12px monospace";

        ctx.fillText(
            `FPS: ${this.fps}`,
            20,
            30
        );

        ctx.fillText(
            `STATE: ${this.state}`,
            20,
            48
        );

        ctx.fillText(
            `PLAYER X: ${this.player.x.toFixed(1)}`,
            20,
            66
        );

        ctx.fillText(
            `PLAYER Y: ${this.player.y.toFixed(1)}`,
            20,
            84
        );

        ctx.fillText(
            `CAMERA X: ${this.camera.x.toFixed(1)}`,
            20,
            102
        );

        ctx.fillText(
            `CAMERA Y: ${this.camera.y.toFixed(1)}`,
            20,
            120
        );

        ctx.restore();
    }

    updateFPS(deltaTime) {
        this.frameCounter++;
        this.fpsTimer += deltaTime;

        if (this.fpsTimer >= 1) {
            this.fps =
                this.frameCounter;

            this.frameCounter = 0;

            this.fpsTimer = 0;
        }
    }

    togglePause() {
        if (this.state === "playing") {
            this.pause();
        } else if (this.state === "paused") {
            this.resume();
        }
    }

    pause() {
        if (this.state !== "playing") {
            return;
        }

        this.state = "paused";

        if (this.callbacks.onPause) {
            this.callbacks.onPause();
        }
    }

    resume() {
        if (this.state !== "paused") {
            return;
        }

        this.state = "playing";

        if (this.callbacks.onResume) {
            this.callbacks.onResume();
        }
    }

    complete() {
        if (this.state === "completed") {
            return;
        }

        this.state = "completed";

        if (this.callbacks.onComplete) {
            this.callbacks.onComplete();
        }
    }

    restart() {
        const spawn =
            this.world.getSpawnPoint();

        this.world.reset();

        this.player.reset(
            spawn.x,
            spawn.y
        );

        this.particles = [];

        this.interaction.current = null;

        this.camera.x =
            Math.max(
                0,
                spawn.x -
                this.width / 2
            );

        this.camera.y =
            Math.max(
                0,
                spawn.y -
                this.height / 2
            );

        this.camera.targetX =
            this.camera.x;

        this.camera.targetY =
            this.camera.y;

        this.state = "playing";

        this.lastTime =
            performance.now();
    }

    startFromMenu() {
        if (this.state === "menu") {
            this.state = "playing";
            this.lastTime = performance.now();
        }
    }

    handleKeyDown(event) {
        if (
            this.state === "menu" &&
            event.key === "Enter"
        ) {
            this.startFromMenu();
            return;
        }

        if (
            this.state === "completed" &&
            event.key === "Enter"
        ) {
            this.restart();
            return;
        }

        if (
            event.key === "Escape" ||
            event.key.toLowerCase() === "p"
        ) {
            this.togglePause();
        }

        if (
            event.key.toLowerCase() === "e"
        ) {
            this.interact();
        }
    }

    setCallbacks(callbacks = {}) {
        this.callbacks = {
            ...this.callbacks,
            ...callbacks
        };
    }

    getState() {
        return this.state;
    }

    getPlayerPosition() {
        return {
            x: this.player.x,
            y: this.player.y
        };
    }

    roundRect(
        ctx,
        x,
        y,
        width,
        height,
        radius
    ) {
        const r =
            Math.min(
                radius,
                width / 2,
                height / 2
            );

        ctx.beginPath();

        ctx.moveTo(
            x + r,
            y
        );

        ctx.lineTo(
            x + width - r,
            y
        );

        ctx.quadraticCurveTo(
            x + width,
            y,
            x + width,
            y + r
        );

        ctx.lineTo(
            x + width,
            y + height - r
        );

        ctx.quadraticCurveTo(
            x + width,
            y + height,
            x + width - r,
            y + height
        );

        ctx.lineTo(
            x + r,
            y + height
        );

        ctx.quadraticCurveTo(
            x,
            y + height,
            x,
            y + height - r
        );

        ctx.lineTo(
            x,
            y + r
        );

        ctx.quadraticCurveTo(
            x,
            y,
            x + r,
            y
        );

        ctx.closePath();
    }

    destroy() {
        this.running = false;

        if (this.input) {
            this.input.destroy();
        }

        if (this.player) {
            this.player.destroy();
        }

        if (this.world) {
            this.world.destroy();
        }

        this.particles = [];
    }
}