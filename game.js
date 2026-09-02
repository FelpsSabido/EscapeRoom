/* ============================================================
   ESCAPE ROOM — SALA DE AULA
   GAME ENGINE
   Vista frontal / 2.5D
   ============================================================ */

class EscapeRoomGame {
    constructor() {
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");

        this.WIDTH = 1280;
        this.HEIGHT = 720;

        this.canvas.width = this.WIDTH;
        this.canvas.height = this.HEIGHT;

        this.state = "loading";

        this.keys = new Set();

        this.lastTime = 0;
        this.elapsed = 0;

        this.dialogueOpen = false;
        this.puzzleOpen = false;

        this.currentPuzzle = null;

        this.messageQueue = [];

        this.nearObject = null;

        this.lights = {
            main: 1,
            left: 1,
            center: 1,
            right: 1
        };

        this.lightTimer = 0;

        this.dustParticles = [];
        this.sparkParticles = [];
        this.ambientParticles = [];

        this.audioStarted = false;
        this.audioContext = null;
        this.masterGain = null;
        this.ambientGain = null;
        this.heartbeatTimer = 0;

        this.doorUnlocked = false;
        this.doorOpen = false;

        this.computerSolved = false;
        this.boardSolved = false;
        this.booksSolved = false;
        this.cabinetSolved = false;
        this.clockSolved = false;

        this.inventory = [];

        this.randomCode = this.generateCode();

        this.puzzles = {
            board: false,
            books: false,
            cabinet: false,
            clock: false,
            computer: false
        };

        this.player = {
            x: 640,
            y: 610,

            width: 34,
            height: 58,

            speed: 235,

            direction: "up",

            walking: false,

            animation: 0,

            bob: 0
        };

        this.objects = {
            board: {
                id: "board",
                x: 640,
                y: 190,
                width: 470,
                height: 125,
                label: "quadro"
            },

            clock: {
                id: "clock",
                x: 240,
                y: 157,
                width: 58,
                height: 58,
                label: "relógio"
            },

            calendar: {
                id: "calendar",
                x: 315,
                y: 210,
                width: 48,
                height: 66,
                label: "calendário"
            },

            computer: {
                id: "computer",
                x: 1000,
                y: 425,
                width: 105,
                height: 95,
                label: "computador"
            },

            bookshelf: {
                id: "bookshelf",
                x: 1090,
                y: 505,
                width: 125,
                height: 180,
                label: "estante"
            },

            cabinet: {
                id: "cabinet",
                x: 155,
                y: 505,
                width: 115,
                height: 165,
                label: "armário"
            },

            teacherDesk: {
                id: "teacherDesk",
                x: 640,
                y: 390,
                width: 190,
                height: 110,
                label: "mesa do professor"
            },

            door: {
                id: "door",
                x: 1115,
                y: 255,
                width: 110,
                height: 230,
                label: "porta"
            }
        };

        this.desks = this.createDesks();

        this.createParticles();

        this.bindEvents();

        this.setupInterface();

        this.resizeCanvas();

        window.addEventListener(
            "resize",
            () => this.resizeCanvas()
        );

        requestAnimationFrame(
            (time) => this.loop(time)
        );
    }

    /* ========================================================
       INICIALIZAÇÃO
       ======================================================== */

    setupInterface() {
        const startButton =
            document.getElementById("startButton");

        const pauseButton =
            document.getElementById("pauseButton");

        const resumeButton =
            document.getElementById("resumeButton");

        const restartButton =
            document.getElementById("restartButton");

        const playAgainButton =
            document.getElementById("playAgainButton");

        const dialogueContinue =
            document.getElementById("dialogueContinue");

        const puzzleClose =
            document.getElementById("puzzleClose");

        if (startButton) {
            startButton.addEventListener(
                "click",
                () => {
                    this.startGame();
                }
            );
        }

        if (pauseButton) {
            pauseButton.addEventListener(
                "click",
                () => {
                    this.togglePause();
                }
            );
        }

        if (resumeButton) {
            resumeButton.addEventListener(
                "click",
                () => {
                    this.resumeGame();
                }
            );
        }

        if (restartButton) {
            restartButton.addEventListener(
                "click",
                () => {
                    this.restartGame();
                }
            );
        }

        if (playAgainButton) {
            playAgainButton.addEventListener(
                "click",
                () => {
                    this.restartGame();
                }
            );
        }

        if (dialogueContinue) {
            dialogueContinue.addEventListener(
                "click",
                () => {
                    this.closeDialogue();
                }
            );
        }

        if (puzzleClose) {
            puzzleClose.addEventListener(
                "click",
                () => {
                    this.closePuzzle();
                }
            );
        }

        this.finishLoading();
    }

    finishLoading() {
        const loadingScreen =
            document.getElementById(
                "loadingScreen"
            );

        const progress =
            document.getElementById(
                "loadingProgress"
            );

        let value = 0;

        const interval =
            setInterval(() => {
                value += 10;

                if (progress) {
                    progress.style.width =
                        `${value}%`;
                }

                if (value >= 100) {
                    clearInterval(interval);

                    setTimeout(() => {
                        if (loadingScreen) {
                            loadingScreen.classList.add(
                                "loaded"
                            );
                        }

                        this.state = "menu";

                        this.render();
                    }, 250);
                }
            }, 45);
    }

    bindEvents() {
        window.addEventListener(
            "keydown",
            (event) => {
                const key =
                    event.key.toLowerCase();

                if (
                    [
                        " ",
                        "arrowup",
                        "arrowdown",
                        "arrowleft",
                        "arrowright"
                    ].includes(key)
                ) {
                    event.preventDefault();
                }

                this.keys.add(key);

                if (
                    key === "e" &&
                    this.state === "playing" &&
                    !this.dialogueOpen &&
                    !this.puzzleOpen
                ) {
                    this.interact();
                }

                if (
                    key === "escape"
                ) {
                    if (this.puzzleOpen) {
                        this.closePuzzle();
                        return;
                    }

                    if (this.dialogueOpen) {
                        this.closeDialogue();
                        return;
                    }

                    this.togglePause();
                }

                if (
                    key === "enter" &&
                    this.dialogueOpen
                ) {
                    this.closeDialogue();
                }
            }
        );

        window.addEventListener(
            "keyup",
            (event) => {
                this.keys.delete(
                    event.key.toLowerCase()
                );
            }
        );

        window.addEventListener(
            "blur",
            () => {
                this.keys.clear();
            }
        );
    }

    resizeCanvas() {
        const ratio =
            this.WIDTH / this.HEIGHT;

        let width =
            window.innerWidth;

        let height =
            width / ratio;

        if (height > window.innerHeight) {
            height =
                window.innerHeight;

            width =
                height * ratio;
        }

        this.canvas.style.width =
            `${width}px`;

        this.canvas.style.height =
            `${height}px`;
    }

    /* ========================================================
       GAME FLOW
       ======================================================== */

    startGame() {
        this.startAudio();

        this.state = "playing";

        this.elapsed = 0;

        this.doorUnlocked = false;
        this.doorOpen = false;

        this.computerSolved = false;
        this.boardSolved = false;
        this.booksSolved = false;
        this.cabinetSolved = false;
        this.clockSolved = false;

        this.inventory = [];

        this.puzzles = {
            board: false,
            books: false,
            cabinet: false,
            clock: false,
            computer: false
        };

        this.randomCode =
            this.generateCode();

        this.player.x = 640;
        this.player.y = 610;

        this.hideElement(
            "menuScreen"
        );

        this.hideElement(
            "pauseScreen"
        );

        this.hideElement(
            "completeScreen"
        );

        this.showElement("hud");

        this.updateObjective(
            "Explore a sala e encontre as primeiras pistas."
        );

        this.updateTimer();

        this.canvas.focus();

        this.playSound("start");

        setTimeout(() => {
            this.showDialogue(
                "A sala está vazia.",
                "Você acorda sozinho em uma sala de aula. A porta está trancada. Há alguma coisa errada aqui..."
            );
        }, 500);
    }

    restartGame() {
        this.startAudio();

        this.closeDialogue();
        this.closePuzzle();

        this.state = "playing";

        this.elapsed = 0;

        this.doorUnlocked = false;
        this.doorOpen = false;

        this.computerSolved = false;
        this.boardSolved = false;
        this.booksSolved = false;
        this.cabinetSolved = false;
        this.clockSolved = false;

        this.inventory = [];

        this.puzzles = {
            board: false,
            books: false,
            cabinet: false,
            clock: false,
            computer: false
        };

        this.randomCode =
            this.generateCode();

        this.player.x = 640;
        this.player.y = 610;

        this.hideElement(
            "menuScreen"
        );

        this.hideElement(
            "pauseScreen"
        );

        this.hideElement(
            "completeScreen"
        );

        this.showElement("hud");

        this.updateObjective(
            "Explore a sala e encontre as primeiras pistas."
        );

        this.playSound("start");
    }

    togglePause() {
        if (
            this.state === "playing"
        ) {
            this.state = "paused";

            this.showElement(
                "pauseScreen"
            );

            this.playSound("pause");

            return;
        }

        if (
            this.state === "paused"
        ) {
            this.resumeGame();
        }
    }

    resumeGame() {
        if (
            this.state !== "paused"
        ) {
            return;
        }

        this.state = "playing";

        this.hideElement(
            "pauseScreen"
        );

        this.playSound("click");

        this.canvas.focus();
    }

    completeGame() {
        if (
            this.state === "complete"
        ) {
            return;
        }

        this.state = "complete";

        this.doorOpen = true;

        this.playSound("success");

        this.spawnVictoryParticles();

        this.hideElement("hud");

        const finalTime =
            document.getElementById(
                "finalTime"
            );

        if (finalTime) {
            finalTime.textContent =
                this.formatTime(
                    this.elapsed
                );
        }

        setTimeout(() => {
            this.showElement(
                "completeScreen"
            );
        }, 900);
    }

    /* ========================================================
       UPDATE
       ======================================================== */

    update(deltaTime) {
        if (
            this.state !== "playing"
        ) {
            return;
        }

        if (
            this.dialogueOpen ||
            this.puzzleOpen
        ) {
            this.updateParticles(
                deltaTime
            );

            this.updateLights(
                deltaTime
            );

            return;
        }

        this.elapsed += deltaTime;

        this.updatePlayer(
            deltaTime
        );

        this.updateInteractionTarget();

        this.updateParticles(
            deltaTime
        );

        this.updateLights(
            deltaTime
        );

        this.updateAmbientAudio(
            deltaTime
        );

        this.updateTimer();

        this.checkDoorEscape();
    }

    updatePlayer(deltaTime) {
        let dx = 0;
        let dy = 0;

        if (
            this.keys.has("a") ||
            this.keys.has("arrowleft")
        ) {
            dx -= 1;
        }

        if (
            this.keys.has("d") ||
            this.keys.has("arrowright")
        ) {
            dx += 1;
        }

        if (
            this.keys.has("w") ||
            this.keys.has("arrowup")
        ) {
            dy -= 1;
        }

        if (
            this.keys.has("s") ||
            this.keys.has("arrowdown")
        ) {
            dy += 1;
        }

        if (
            dx !== 0 ||
            dy !== 0
        ) {
            const length =
                Math.hypot(
                    dx,
                    dy
                );

            dx /= length;
            dy /= length;

            this.player.x +=
                dx *
                this.player.speed *
                deltaTime;

            this.player.y +=
                dy *
                this.player.speed *
                deltaTime;

            this.player.walking =
                true;

            this.player.animation +=
                deltaTime * 9;

            this.player.bob =
                Math.sin(
                    this.player.animation
                ) * 2;

            if (
                Math.abs(dx) >
                Math.abs(dy)
            ) {
                this.player.direction =
                    dx > 0
                        ? "right"
                        : "left";
            } else {
                this.player.direction =
                    dy > 0
                        ? "down"
                        : "up";
            }

            if (
                Math.random() < 0.04
            ) {
                this.playSound(
                    "step"
                );
            }
        } else {
            this.player.walking =
                false;

            this.player.bob =
                0;
        }

        /*
         * A área jogável fica principalmente
         * na parte inferior da sala.
         */

        this.player.x =
            Math.max(
                80,
                Math.min(
                    1200,
                    this.player.x
                )
            );

        this.player.y =
            Math.max(
                390,
                Math.min(
                    665,
                    this.player.y
                )
            );

        /*
         * Evita que o personagem atravesse
         * a mesa do professor.
         */

        if (
            this.isInsideRect(
                this.player.x,
                this.player.y,
                this.objects.teacherDesk
            )
        ) {
            if (
                this.player.x <
                this.objects.teacherDesk.x
            ) {
                this.player.x =
                    this.objects.teacherDesk.x -
                    this.objects.teacherDesk.width /
                        2 -
                    22;
            } else {
                this.player.x =
                    this.objects.teacherDesk.x +
                    this.objects.teacherDesk.width /
                        2 +
                    22;
            }
        }
    }

    updateInteractionTarget() {
        this.nearObject = null;

        let closest =
            Infinity;

        for (
            const object of Object.values(
                this.objects
            )
        ) {
            const distance =
                Math.hypot(
                    this.player.x -
                        object.x,
                    this.player.y -
                        object.y
                );

            let range = 115;

            if (
                object.id === "board"
            ) {
                range = 170;
            }

            if (
                object.id === "door"
            ) {
                range = 125;
            }

            if (
                distance <
                    range &&
                distance <
                    closest
            ) {
                closest = distance;

                this.nearObject =
                    object;
            }
        }

        const hint =
            document.getElementById(
                "interactionHint"
            );

        const hintText =
            document.getElementById(
                "interactionText"
            );

        if (
            this.nearObject &&
            hint &&
            hintText
        ) {
            hint.classList.remove(
                "hidden"
            );

            hintText.textContent =
                `Pressione E para interagir com ${this.nearObject.label}.`;
        } else if (hint) {
            hint.classList.add(
                "hidden"
            );
        }
    }

    updateLights(deltaTime) {
        this.lightTimer +=
            deltaTime;

        if (
            this.lightTimer >
            3.5
        ) {
            this.lightTimer = 0;

            if (
                Math.random() <
                0.3
            ) {
                this.lights.right =
                    0.25;

                setTimeout(() => {
                    this.lights.right =
                        1;
                }, 80);

                setTimeout(() => {
                    this.lights.right =
                        0.35;
                }, 170);

                setTimeout(() => {
                    this.lights.right =
                        1;
                }, 250);
            }
        }
    }

    updateAmbientAudio(deltaTime) {
        if (
            !this.audioStarted ||
            !this.audioContext
        ) {
            return;
        }

        this.heartbeatTimer +=
            deltaTime;

        if (
            this.heartbeatTimer >
            6
        ) {
            this.heartbeatTimer = 0;

            if (
                this.state ===
                "playing"
            ) {
                this.playHeartbeat();
            }
        }
    }

    updateTimer() {
        const timer =
            document.getElementById(
                "timer"
            );

        if (timer) {
            timer.textContent =
                this.formatTime(
                    this.elapsed
                );
        }
    }

    /* ========================================================
       INTERAÇÕES
       ======================================================== */

    interact() {
        if (
            !this.nearObject
        ) {
            return;
        }

        const id =
            this.nearObject.id;

        switch (id) {
            case "board":
                this.interactBoard();
                break;

            case "clock":
                this.interactClock();
                break;

            case "calendar":
                this.interactCalendar();
                break;

            case "cabinet":
                this.interactCabinet();
                break;

            case "bookshelf":
                this.interactBookshelf();
                break;

            case "computer":
                this.interactComputer();
                break;

            case "teacherDesk":
                this.interactTeacherDesk();
                break;

            case "door":
                this.interactDoor();
                break;
        }
    }

    interactBoard() {
        if (
            this.boardSolved
        ) {
            this.showDialogue(
                "Quadro",
                "Você já encontrou a pista principal aqui."
            );

            return;
        }

        this.showPuzzle(
            "PISTA 01",
            "As anotações no quadro",
            "No quadro existe uma sequência de números. Descubra qual número está faltando.",
            `
                <div class="riddleCard">
                    <div class="riddleSequence">
                        2 &nbsp; — &nbsp; 4 &nbsp; — &nbsp; 8 &nbsp; — &nbsp; 16 &nbsp; — &nbsp; ?
                    </div>

                    <input
                        id="puzzleInput"
                        type="number"
                        placeholder="Digite o próximo número"
                        autocomplete="off"
                    >

                    <button
                        id="puzzleSubmit"
                        type="button"
                    >
                        CONFIRMAR
                    </button>

                    <div
                        id="puzzleFeedback"
                        class="puzzleFeedback"
                    ></div>
                </div>
            `,
            () => {
                const input =
                    document.getElementById(
                        "puzzleInput"
                    );

                const feedback =
                    document.getElementById(
                        "puzzleFeedback"
                    );

                if (
                    !input ||
                    !feedback
                ) {
                    return;
                }

                if (
                    Number(input.value) ===
                    32
                ) {
                    this.boardSolved =
                        true;

                    this.puzzles.board =
                        true;

                    this.inventory.push(
                        "pista_quadro"
                    );

                    feedback.textContent =
                        "CORRETO. A pista foi encontrada.";

                    feedback.style.color =
                        "#75b982";

                    this.playSound(
                        "correct"
                    );

                    this.updateObjective(
                        "A primeira pista foi encontrada. Investigue o relógio."
                    );

                    setTimeout(() => {
                        this.closePuzzle();

                        this.showDialogue(
                            "Primeira pista",
                            "A sequência dobra a cada etapa. O número encontrado é 32. Guarde essa informação."
                        );
                    }, 850);
                } else {
                    feedback.textContent =
                        "Resposta incorreta. Observe a sequência novamente.";

                    feedback.style.color =
                        "#c85d5d";

                    this.playSound(
                        "error"
                    );
                }
            }
        );
    }

    interactClock() {
        if (
            this.clockSolved
        ) {
            this.showDialogue(
                "Relógio",
                "Agora você entende por que o relógio estava parado."
            );

            return;
        }

        this.showPuzzle(
            "PISTA 02",
            "O relógio parado",
            "O relógio está marcando 08:32. A primeira pista que você encontrou foi 32. Qual é o número que completa a sequência?",
            `
                <div class="riddleCard">

                    <div class="clockPuzzle">
                        <div class="fakeClock">
                            <div class="clockHand hour"></div>
                            <div class="clockHand minute"></div>
                            <div class="clockCenter"></div>
                        </div>

                        <strong>
                            08 : 32
                        </strong>
                    </div>

                    <input
                        id="puzzleInput"
                        type="number"
                        placeholder="Digite o número"
                        autocomplete="off"
                    >

                    <button
                        id="puzzleSubmit"
                        type="button"
                    >
                        CONFIRMAR
                    </button>

                    <div
                        id="puzzleFeedback"
                        class="puzzleFeedback"
                    ></div>

                </div>
            `,
            () => {
                const input =
                    document.getElementById(
                        "puzzleInput"
                    );

                const feedback =
                    document.getElementById(
                        "puzzleFeedback"
                    );

                if (
                    !input ||
                    !feedback
                ) {
                    return;
                }

                if (
                    Number(input.value) ===
                    32
                ) {
                    this.clockSolved =
                        true;

                    this.puzzles.clock =
                        true;

                    this.inventory.push(
                        "pista_relogio"
                    );

                    feedback.textContent =
                        "CORRETO. O relógio confirmou a pista.";

                    feedback.style.color =
                        "#75b982";

                    this.playSound(
                        "correct"
                    );

                    this.updateObjective(
                        "Procure algo fora do lugar na sala."
                    );

                    setTimeout(() => {
                        this.closePuzzle();
                    }, 750);
                } else {
                    feedback.textContent =
                        "Não é esse número. Pense na pista anterior.";

                    feedback.style.color =
                        "#c85d5d";

                    this.playSound(
                        "error"
                    );
                }
            }
        );
    }

    interactCalendar() {
        this.showDialogue(
            "Calendário",
            "Há uma data circulada várias vezes. 17 de outubro. Talvez isso seja importante mais tarde."
        );

        this.playSound(
            "paper"
        );
    }

    interactCabinet() {
        if (
            this.cabinetSolved
        ) {
            this.showDialogue(
                "Armário",
                "O armário já foi investigado."
            );

            return;
        }

        this.showPuzzle(
            "PISTA 03",
            "O armário",
            "Existem três gavetas. Apenas uma possui uma marca diferente.",
            `
                <div class="cabinetPuzzle">

                    <button
                        class="cabinetOption"
                        data-answer="1"
                        type="button"
                    >
                        GAVETA 01
                    </button>

                    <button
                        class="cabinetOption"
                        data-answer="2"
                        type="button"
                    >
                        GAVETA 02
                    </button>

                    <button
                        class="cabinetOption"
                        data-answer="3"
                        type="button"
                    >
                        GAVETA 03
                    </button>

                    <div
                        id="puzzleFeedback"
                        class="puzzleFeedback"
                    ></div>

                </div>
            `,
            () => {
                const buttons =
                    document.querySelectorAll(
                        ".cabinetOption"
                    );

                const feedback =
                    document.getElementById(
                        "puzzleFeedback"
                    );

                buttons.forEach(
                    button => {
                        button.addEventListener(
                            "click",
                            () => {
                                const answer =
                                    button.dataset.answer;

                                if (
                                    answer ===
                                    "2"
                                ) {
                                    this.cabinetSolved =
                                        true;

                                    this.puzzles.cabinet =
                                        true;

                                    this.inventory.push(
                                        "chave_pequena"
                                    );

                                    feedback.textContent =
                                        "A gaveta abriu. Você encontrou uma pequena chave.";

                                    feedback.style.color =
                                        "#75b982";

                                    this.playSound(
                                        "correct"
                                    );

                                    this.updateObjective(
                                        "Você encontrou uma chave. Talvez ela abra algo."
                                    );

                                    setTimeout(() => {
                                        this.closePuzzle();
                                    }, 900);
                                } else {
                                    feedback.textContent =
                                        "Nada acontece.";

                                    feedback.style.color =
                                        "#c85d5d";

                                    this.playSound(
                                        "error"
                                    );
                                }
                            }
                        );
                    }
                );
            }
        );
    }

    interactBookshelf() {
        if (
            this.booksSolved
        ) {
            this.showDialogue(
                "Estante",
                "O livro que estava fora do lugar já revelou sua pista."
            );

            return;
        }

        this.showPuzzle(
            "PISTA 04",
            "O livro fora do lugar",
            "Quatro livros estão organizados por número. Um deles está invertido.",
            `
                <div class="bookPuzzle">

                    <div class="booksRow">
                        <span>7</span>
                        <span>14</span>
                        <span>28</span>
                        <span>56</span>
                        <span>?</span>
                    </div>

                    <input
                        id="puzzleInput"
                        type="number"
                        placeholder="Qual seria o próximo?"
                        autocomplete="off"
                    >

                    <button
                        id="puzzleSubmit"
                        type="button"
                    >
                        CONFIRMAR
                    </button>

                    <div
                        id="puzzleFeedback"
                        class="puzzleFeedback"
                    ></div>

                </div>
            `,
            () => {
                const input =
                    document.getElementById(
                        "puzzleInput"
                    );

                const feedback =
                    document.getElementById(
                        "puzzleFeedback"
                    );

                if (
                    !input ||
                    !feedback
                ) {
                    return;
                }

                if (
                    Number(input.value) ===
                    112
                ) {
                    this.booksSolved =
                        true;

                    this.puzzles.books =
                        true;

                    this.inventory.push(
                        "pista_estante"
                    );

                    feedback.textContent =
                        "CORRETO. Atrás do livro havia uma anotação.";

                    feedback.style.color =
                        "#75b982";

                    this.playSound(
                        "correct"
                    );

                    this.updateObjective(
                        "Você já possui pistas suficientes. Procure o computador."
                    );

                    setTimeout(() => {
                        this.closePuzzle();

                        this.showDialogue(
                            "Anotação",
                            "A anotação diz: 'Os números encontrados devem ser usados na ordem em que foram descobertos.'"
                        );
                    }, 850);
                } else {
                    feedback.textContent =
                        "Resposta incorreta.";

                    feedback.style.color =
                        "#c85d5d";

                    this.playSound(
                        "error"
                    );
                }
            }
        );
    }

    interactComputer() {
        if (
            this.computerSolved
        ) {
            this.showDialogue(
                "Computador",
                "O computador já está desbloqueado. A porta está pronta para receber o código final."
            );

            return;
        }

        const hasClues =
            this.boardSolved &&
            this.clockSolved &&
            this.cabinetSolved &&
            this.booksSolved;

        if (!hasClues) {
            this.showDialogue(
                "Computador",
                "A tela pede um código de quatro dígitos. Você ainda não reuniu pistas suficientes."
            );

            this.playSound(
                "computer"
            );

            return;
        }

        this.showPuzzle(
            "DESAFIO FINAL",
            "Terminal da sala",
            "As pistas encontradas indicam que você precisa descobrir o código de quatro dígitos.",
            `
                <div class="computerPuzzle">

                    <div class="terminalScreen">
                        <span>
                            ACCESS REQUIRED
                        </span>

                        <strong>
                            _ _ _ _
                        </strong>
                    </div>

                    <input
                        id="puzzleInput"
                        type="text"
                        inputmode="numeric"
                        maxlength="4"
                        placeholder="0000"
                        autocomplete="off"
                    >

                    <button
                        id="puzzleSubmit"
                        type="button"
                    >
                        DESBLOQUEAR
                    </button>

                    <div
                        id="puzzleFeedback"
                        class="puzzleFeedback"
                    ></div>

                </div>
            `,
            () => {
                const input =
                    document.getElementById(
                        "puzzleInput"
                    );

                const feedback =
                    document.getElementById(
                        "puzzleFeedback"
                    );

                if (
                    !input ||
                    !feedback
                ) {
                    return;
                }

                const answer =
                    input.value.trim();

                if (
                    answer ===
                    this.randomCode
                ) {
                    this.computerSolved =
                        true;

                    this.puzzles.computer =
                        true;

                    this.doorUnlocked =
                        true;

                    feedback.textContent =
                        "ACESSO LIBERADO. A fechadura da porta foi desativada.";

                    feedback.style.color =
                        "#75b982";

                    this.playSound(
                        "unlock"
                    );

                    this.updateObjective(
                        "O computador foi desbloqueado. Vá até a porta."
                    );

                    setTimeout(() => {
                        this.closePuzzle();

                        this.showDialogue(
                            "Sistema desbloqueado",
                            "A fechadura eletrônica da porta acabou de emitir um clique. A saída está próxima."
                        );
                    }, 900);
                } else {
                    feedback.textContent =
                        "CÓDIGO INCORRETO.";

                    feedback.style.color =
                        "#c85d5d";

                    this.playSound(
                        "error"
                    );
                }
            }
        );

        /*
         * Mostra discretamente o código no console
         * apenas para facilitar testes durante
         * o desenvolvimento.
         */

        console.log(
            "[ESCAPE ROOM] Código desta partida:",
            this.randomCode
        );
    }

    interactTeacherDesk() {
        if (
            this.inventory.includes(
                "pista_mesa"
            )
        ) {
            this.showDialogue(
                "Mesa do professor",
                "Você já encontrou tudo o que havia aqui."
            );

            return;
        }

        this.inventory.push(
            "pista_mesa"
        );

        this.playSound(
            "paper"
        );

        this.showDialogue(
            "Mesa do professor",
            "Debaixo de uma folha você encontrou uma anotação: 'A ordem importa.'"
        );

        this.updateObjective(
            "Você encontrou outra pista. Agora investigue o restante da sala."
        );
    }

    interactDoor() {
        if (
            !this.doorUnlocked
        ) {
            this.showDialogue(
                "Porta trancada",
                "A porta possui uma fechadura eletrônica. Ela não vai abrir sem o código correto."
            );

            this.playSound(
                "locked"
            );

            return;
        }

        if (
            !this.doorOpen
        ) {
            this.doorOpen =
                true;

            this.playSound(
                "door"
            );

            this.updateObjective(
                "A porta está aberta. Saia da sala!"
            );

            this.showDialogue(
                "A porta abriu",
                "O mecanismo destravou. Você conseguiu chegar à saída."
            );

            setTimeout(() => {
                this.completeGame();
            }, 1000);
        }
    }

    checkDoorEscape() {
        if (
            !this.doorOpen ||
            this.state !== "playing"
        ) {
            return;
        }

        if (
            this.player.x >
                1070 &&
            this.player.y <
                500
        ) {
            this.completeGame();
        }
    }

    /* ========================================================
       PUZZLE SYSTEM
       ======================================================== */

    showPuzzle(
        category,
        title,
        description,
        html,
        callback
    ) {
        const modal =
            document.getElementById(
                "puzzleModal"
            );

        const categoryElement =
            document.getElementById(
                "puzzleCategory"
            );

        const titleElement =
            document.getElementById(
                "puzzleTitle"
            );

        const descriptionElement =
            document.getElementById(
                "puzzleDescription"
            );

        const content =
            document.getElementById(
                "puzzleContent"
            );

        if (
            !modal ||
            !categoryElement ||
            !titleElement ||
            !descriptionElement ||
            !content
        ) {
            return;
        }

        categoryElement.textContent =
            category;

        titleElement.textContent =
            title;

        descriptionElement.textContent =
            description;

        content.innerHTML =
            html;

        modal.classList.remove(
            "hidden"
        );

        this.puzzleOpen =
            true;

        this.currentPuzzle =
            callback;

        this.playSound(
            "open"
        );

        setTimeout(() => {
            const input =
                document.getElementById(
                    "puzzleInput"
                );

            if (input) {
                input.focus();
            }

            const submit =
                document.getElementById(
                    "puzzleSubmit"
                );

            if (submit) {
                submit.addEventListener(
                    "click",
                    () => {
                        if (
                            this.currentPuzzle
                        ) {
                            this.currentPuzzle();
                        }
                    }
                );
            }
        }, 50);
    }

    closePuzzle() {
        const modal =
            document.getElementById(
                "puzzleModal"
            );

        if (modal) {
            modal.classList.add(
                "hidden"
            );
        }

        this.puzzleOpen =
            false;

        this.currentPuzzle =
            null;
    }

    /* ========================================================
       DIÁLOGOS
       ======================================================== */

    showDialogue(
        title,
        text
    ) {
        const dialogue =
            document.getElementById(
                "dialogue"
            );

        const titleElement =
            document.getElementById(
                "dialogueTitle"
            );

        const textElement =
            document.getElementById(
                "dialogueText"
            );

        if (
            !dialogue ||
            !titleElement ||
            !textElement
        ) {
            return;
        }

        titleElement.textContent =
            title;

        textElement.textContent =
            text;

        dialogue.classList.remove(
            "hidden"
        );

        this.dialogueOpen =
            true;

        this.playSound(
            "dialogue"
        );
    }

    closeDialogue() {
        const dialogue =
            document.getElementById(
                "dialogue"
            );

        if (dialogue) {
            dialogue.classList.add(
                "hidden"
            );
        }

        this.dialogueOpen =
            false;
    }

    /* ========================================================
       RENDER
       ======================================================== */

    render() {
        const ctx =
            this.ctx;

        ctx.clearRect(
            0,
            0,
            this.WIDTH,
            this.HEIGHT
        );

        ctx.imageSmoothingEnabled =
            false;

        this.drawBackground();

        this.drawWindows();

        this.drawWalls();

        this.drawCeiling();

        this.drawLights();

        this.drawBoard();

        this.drawClock();

        this.drawCalendar();

        this.drawCabinet();

        this.drawBookshelf();

        this.drawDoor();

        this.drawTeacherDesk();

        this.drawDesks();

        this.drawFloor();

        this.drawAmbientParticles();

        this.drawPlayer();

        this.drawForegroundEffects();

        this.drawVignette();
    }

    drawBackground() {
        const ctx =
            this.ctx;

        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                this.HEIGHT
            );

        gradient.addColorStop(
            0,
            "#b9977f"
        );

        gradient.addColorStop(
            0.45,
            "#c5a68f"
        );

        gradient.addColorStop(
            1,
            "#6f4e3c"
        );

        ctx.fillStyle =
            gradient;

        ctx.fillRect(
            0,
            0,
            this.WIDTH,
            this.HEIGHT
        );
    }

    drawWalls() {
        const ctx =
            this.ctx;

        /*
         * Parede principal.
         */

        ctx.fillStyle =
            "#d4bca8";

        ctx.fillRect(
            0,
            120,
            this.WIDTH,
            330
        );

        /*
         * Faixa superior.
         */

        ctx.fillStyle =
            "#795747";

        ctx.fillRect(
            0,
            90,
            this.WIDTH,
            42
        );

        ctx.fillStyle =
            "#4e372e";

        ctx.fillRect(
            0,
            126,
            this.WIDTH,
            8
        );

        /*
         * Faixa inferior.
         */

        ctx.fillStyle =
            "#8e6753";

        ctx.fillRect(
            0,
            420,
            this.WIDTH,
            55
        );

        ctx.fillStyle =
            "#5e4337";

        ctx.fillRect(
            0,
            468,
            this.WIDTH,
            10
        );

        /*
         * Molduras verticais.
         */

        for (
            const x of [
                275,
                775,
                895
            ]
        ) {
            ctx.fillStyle =
                "#65483a";

            ctx.fillRect(
                x,
                95,
                12,
                365
            );

            ctx.fillStyle =
                "rgba(255,255,255,0.12)";

            ctx.fillRect(
                x + 3,
                105,
                3,
                340
            );
        }
    }

    drawCeiling() {
        const ctx =
            this.ctx;

        ctx.fillStyle =
            "#ded3c5";

        ctx.fillRect(
            0,
            0,
            this.WIDTH,
            92
        );

        ctx.strokeStyle =
            "rgba(86,67,57,0.35)";

        ctx.lineWidth = 2;

        for (
            let x = 0;
            x < this.WIDTH;
            x += 80
        ) {
            ctx.beginPath();

            ctx.moveTo(
                x,
                0
            );

            ctx.lineTo(
                x,
                92
            );

            ctx.stroke();
        }

        for (
            let y = 0;
            y < 92;
            y += 30
        ) {
            ctx.beginPath();

            ctx.moveTo(
                0,
                y
            );

            ctx.lineTo(
                this.WIDTH,
                y
            );

            ctx.stroke();
        }
    }

    drawWindows() {
        const ctx =
            this.ctx;

        const windowX = 18;
        const windowY = 132;
        const windowW = 230;
        const windowH = 250;

        /*
         * Moldura.
         */

        ctx.fillStyle =
            "#8a513a";

        ctx.fillRect(
            windowX - 10,
            windowY - 10,
            windowW + 20,
            windowH + 20
        );

        /*
         * Céu.
         */

        const sky =
            ctx.createLinearGradient(
                0,
                windowY,
                0,
                windowY + windowH
            );

        sky.addColorStop(
            0,
            "#9ed0e0"
        );

        sky.addColorStop(
            0.65,
            "#dce8c7"
        );

        sky.addColorStop(
            1,
            "#75a36b"
        );

        ctx.fillStyle =
            sky;

        ctx.fillRect(
            windowX,
            windowY,
            windowW,
            windowH
        );

        /*
         * Vegetação externa.
         */

        ctx.fillStyle =
            "#527c48";

        for (
            let i = 0;
            i < 18;
            i++
        ) {
            const x =
                windowX +
                Math.random() *
                    windowW;

            const y =
                windowY +
                210 +
                Math.random() *
                    35;

            ctx.fillRect(
                x,
                y,
                8 +
                    Math.random() *
                        15,
                35
            );
        }

        /*
         * Divisões das janelas.
         */

        ctx.fillStyle =
            "#f1dfc8";

        ctx.fillRect(
            windowX + 72,
            windowY,
            9,
            windowH
        );

        ctx.fillRect(
            windowX + 150,
            windowY,
            9,
            windowH
        );

        ctx.fillRect(
            windowX,
            windowY + 118,
            windowW,
            9
        );

        /*
         * Brilho solar.
         */

        const glow =
            ctx.createLinearGradient(
                windowX,
                windowY,
                windowX + windowW,
                windowY
            );

        glow.addColorStop(
            0,
            "rgba(255,246,199,0.42)"
        );

        glow.addColorStop(
            1,
            "rgba(255,246,199,0)"
        );

        ctx.fillStyle =
            glow;

        ctx.fillRect(
            windowX,
            windowY,
            windowW,
            windowH
        );
    }

    drawLights() {
        const ctx =
            this.ctx;

        const positions = [
            {
                x: 360,
                power: this.lights.left
            },
            {
                x: 640,
                power: this.lights.center
            },
            {
                x: 920,
                power: this.lights.right
            }
        ];

        for (
            const light of positions
        ) {
            ctx.fillStyle =
                "#f1e9dc";

            ctx.fillRect(
                light.x - 58,
                30,
                116,
                12
            );

            ctx.fillStyle =
                `rgba(255,242,194,${0.22 * light.power})`;

            ctx.fillRect(
                light.x - 80,
                42,
                160,
                100
            );
        }
    }

    drawBoard() {
        const ctx =
            this.ctx;

        const x = 385;
        const y = 155;
        const w = 520;
        const h = 155;

        /*
         * Sombra.
         */

        ctx.fillStyle =
            "rgba(0,0,0,0.25)";

        ctx.fillRect(
            x + 14,
            y + 14,
            w,
            h
        );

        /*
         * Moldura.
         */

        ctx.fillStyle =
            "#4b2d23";

        ctx.fillRect(
            x - 8,
            y - 8,
            w + 16,
            h + 16
        );

        ctx.fillStyle =
            "#a96f43";

        ctx.fillRect(
            x - 3,
            y - 3,
            w + 6,
            h + 6
        );

        /*
         * Quadro.
         */

        ctx.fillStyle =
            "#193b31";

        ctx.fillRect(
            x,
            y,
            w,
            h
        );

        /*
         * Reflexo.
         */

        const shine =
            ctx.createLinearGradient(
                x,
                y,
                x + w,
                y + h
            );

        shine.addColorStop(
            0,
            "rgba(255,255,255,0.13)"
        );

        shine.addColorStop(
            0.3,
            "rgba(255,255,255,0)"
        );

        shine.addColorStop(
            1,
            "rgba(0,0,0,0.12)"
        );

        ctx.fillStyle =
            shine;

        ctx.fillRect(
            x,
            y,
            w,
            h
        );

        /*
         * Escrita no quadro.
         */

        ctx.strokeStyle =
            "rgba(230,238,213,0.65)";

        ctx.lineWidth = 3;

        ctx.font =
            "bold 22px monospace";

        ctx.fillStyle =
            "rgba(230,238,213,0.68)";

        ctx.fillText(
            "2   →   4   →   8   →   16   →   ?",
            x + 45,
            y + 70
        );

        ctx.font =
            "16px monospace";

        ctx.fillText(
            "A ORDEM IMPORTA",
            x + 155,
            y + 115
        );

        /*
         * Giz.
         */

        ctx.fillStyle =
            "#dfdfd2";

        ctx.fillRect(
            x + 390,
            y + h + 8,
            25,
            7
        );

        ctx.fillStyle =
            "#e6a064";

        ctx.fillRect(
            x + 425,
            y + h + 8,
            25,
            7
        );
    }

    drawClock() {
        const ctx =
            this.ctx;

        const x = 240;
        const y = 157;
        const radius = 29;

        ctx.save();

        ctx.shadowColor =
            "rgba(0,0,0,0.35)";

        ctx.shadowBlur = 8;

        ctx.fillStyle =
            "#d6d0c3";

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.shadowBlur = 0;

        ctx.strokeStyle =
            "#5d4b42";

        ctx.lineWidth = 4;

        ctx.stroke();

        ctx.fillStyle =
            "#4c3c34";

        for (
            let i = 0;
            i < 12;
            i++
        ) {
            const angle =
                i *
                Math.PI /
                6;

            const px =
                x +
                Math.cos(angle) *
                    20;

            const py =
                y +
                Math.sin(angle) *
                    20;

            ctx.fillRect(
                px - 1,
                py - 1,
                3,
                3
            );
        }

        ctx.strokeStyle =
            "#44352f";

        ctx.lineWidth = 3;

        ctx.beginPath();

        ctx.moveTo(
            x,
            y
        );

        ctx.lineTo(
            x,
            y - 14
        );

        ctx.stroke();

        ctx.beginPath();

        ctx.moveTo(
            x,
            y
        );

        ctx.lineTo(
            x + 12,
            y + 5
        );

        ctx.stroke();

        ctx.restore();
    }

    drawCalendar() {
        const ctx =
            this.ctx;

        const x = 292;
        const y = 188;

        ctx.fillStyle =
            "#e9dfca";

        ctx.fillRect(
            x,
            y,
            50,
            68
        );

        ctx.strokeStyle =
            "#7c5545";

        ctx.lineWidth = 3;

        ctx.strokeRect(
            x,
            y,
            50,
            68
        );

        ctx.fillStyle =
            "#a64e40";

        ctx.fillRect(
            x,
            y,
            50,
            15
        );

        ctx.fillStyle =
            "#53453c";

        ctx.font =
            "bold 8px monospace";

        ctx.fillText(
            "17",
            x + 17,
            y + 43
        );

        ctx.font =
            "6px monospace";

        ctx.fillText(
            "OUT",
            x + 15,
            y + 55
        );
    }

    drawCabinet() {
        const ctx =
            this.ctx;

        const x = 105;
        const y = 330;
        const w = 125;
        const h = 145;

        ctx.fillStyle =
            "rgba(0,0,0,0.25)";

        ctx.fillRect(
            x + 12,
            y + 12,
            w,
            h
        );

        ctx.fillStyle =
            "#6b5145";

        ctx.fillRect(
            x,
            y,
            w,
            h
        );

        ctx.fillStyle =
            "#9b7760";

        ctx.fillRect(
            x + 8,
            y + 8,
            w - 16,
            h - 16
        );

        for (
            let i = 0;
            i < 3;
            i++
        ) {
            const yy =
                y +
                12 +
                i * 40;

            ctx.fillStyle =
                "#775a4a";

            ctx.fillRect(
                x + 12,
                yy,
                w - 24,
                34
            );

            ctx.fillStyle =
                "#d3b18d";

            ctx.fillRect(
                x + 55,
                yy + 14,
                15,
                4
            );
        }
    }

    drawBookshelf() {
        const ctx =
            this.ctx;

        const x = 1020;
        const y = 330;
        const w = 145;
        const h = 160;

        ctx.fillStyle =
            "rgba(0,0,0,0.3)";

        ctx.fillRect(
            x + 10,
            y + 10,
            w,
            h
        );

        ctx.fillStyle =
            "#654433";

        ctx.fillRect(
            x,
            y,
            w,
            h
        );

        ctx.fillStyle =
            "#3f2c24";

        ctx.fillRect(
            x + 10,
            y + 10,
            w - 20,
            h - 20
        );

        for (
            let row = 0;
            row < 3;
            row++
        ) {
            const shelfY =
                y +
                25 +
                row * 42;

            ctx.fillStyle =
                "#8f6549";

            ctx.fillRect(
                x + 8,
                shelfY,
                w - 16,
                5
            );

            const colors = [
                "#9e5744",
                "#496b62",
                "#b78b52",
                "#536e82",
                "#8b6257",
                "#7e814c"
            ];

            for (
                let i = 0;
                i < 6;
                i++
            ) {
                ctx.fillStyle =
                    colors[
                        (i + row) %
                        colors.length
                    ];

                const bookHeight =
                    27 +
                    (i % 2) * 5;

                ctx.fillRect(
                    x +
                        15 +
                        i * 19,
                    shelfY -
                        bookHeight,
                    15,
                    bookHeight
                );
            }
        }
    }

    drawDoor() {
        const ctx =
            this.ctx;

        const x = 1110;
        const y = 145;
        const w = 125;
        const h = 275;

        ctx.fillStyle =
            "rgba(0,0,0,0.3)";

        ctx.fillRect(
            x + 12,
            y + 12,
            w,
            h
        );

        ctx.fillStyle =
            "#4b2c25";

        ctx.fillRect(
            x,
            y,
            w,
            h
        );

        if (
            this.doorOpen
        ) {
            ctx.fillStyle =
                "#151b20";

            ctx.fillRect(
                x + 13,
                y + 13,
                w - 26,
                h - 13
            );

            ctx.fillStyle =
                "rgba(80,150,180,0.16)";

            ctx.fillRect(
                x + 20,
                y + 20,
                w - 40,
                h - 35
            );
        } else {
            ctx.fillStyle =
                "#704737";

            ctx.fillRect(
                x + 13,
                y + 13,
                w - 26,
                h - 13
            );

            ctx.fillStyle =
                "#9b684e";

            ctx.fillRect(
                x + 22,
                y + 22,
                w - 44,
                70
            );

            ctx.fillStyle =
                "#91b8bf";

            ctx.fillRect(
                x + 31,
                y + 31,
                w - 62,
                52
            );

            /*
             * Fechadura.
             */

            ctx.fillStyle =
                "#252a2e";

            ctx.fillRect(
                x + 83,
                y + 145,
                20,
                38
            );

            ctx.fillStyle =
                this.doorUnlocked
                    ? "#70c886"
                    : "#b94d4d";

            ctx.fillRect(
                x + 89,
                y + 151,
                8,
                8
            );

            ctx.fillStyle =
                "#d6b47c";

            ctx.fillRect(
                x + 90,
                y + 170,
                5,
                5
            );
        }
    }

    drawTeacherDesk() {
        const ctx =
            this.ctx;

        const x = 545;
        const y = 340;
        const w = 190;
        const h = 105;

        ctx.fillStyle =
            "rgba(0,0,0,0.3)";

        ctx.fillRect(
            x + 12,
            y + 15,
            w,
            h
        );

        ctx.fillStyle =
            "#75432f";

        ctx.fillRect(
            x,
            y,
            w,
            22
        );

        ctx.fillStyle =
            "#b36c43";

        ctx.fillRect(
            x + 8,
            y + 22,
            w - 16,
            60
        );

        ctx.fillStyle =
            "#71422f";

        ctx.fillRect(
            x + 20,
            y + 82,
            12,
            35
        );

        ctx.fillRect(
            x + w - 32,
            y + 82,
            12,
            35
        );

        ctx.fillStyle =
            "rgba(255,220,170,0.25)";

        ctx.fillRect(
            x + 18,
            y + 34,
            90,
            7
        );
    }

    createDesks() {
        const desks = [];

        const rows = [
            480,
            535,
            590
        ];

        const columns = [
            370,
            500,
            760,
            890
        ];

        for (
            const y of rows
        ) {
            for (
                const x of columns
            ) {
                desks.push({
                    x,
                    y
                });
            }
        }

        return desks;
    }

    drawDesks() {
        const ctx =
            this.ctx;

        for (
            const desk of this.desks
        ) {
            const x =
                desk.x;

            const y =
                desk.y;

            /*
             * Sombra.
             */

            ctx.fillStyle =
                "rgba(0,0,0,0.24)";

            ctx.fillRect(
                x - 43,
                y + 33,
                86,
                13
            );

            /*
             * Mesa.
             */

            ctx.fillStyle =
                "#5a3628";

            ctx.fillRect(
                x - 42,
                y - 7,
                84,
                48
            );

            ctx.fillStyle =
                "#9a5c3b";

            ctx.fillRect(
                x - 37,
                y - 2,
                74,
                35
            );

            /*
             * Tampo.
             */

            ctx.fillStyle =
                "rgba(255,206,157,0.22)";

            ctx.fillRect(
                x - 30,
                y + 3,
                45,
                4
            );

            /*
             * Pernas.
             */

            ctx.fillStyle =
                "#3d2b25";

            ctx.fillRect(
                x - 34,
                y + 31,
                6,
                31
            );

            ctx.fillRect(
                x + 28,
                y + 31,
                6,
                31
            );

            /*
             * Encosto da cadeira.
             */

            ctx.fillStyle =
                "#51362c";

            ctx.fillRect(
                x - 29,
                y + 44,
                58,
                50
            );

            ctx.fillStyle =
                "#8e6047";

            ctx.fillRect(
                x - 24,
                y + 49,
                48,
                38
            );

            /*
             * Pernas da cadeira.
             */

            ctx.fillStyle =
                "#392923";

            ctx.fillRect(
                x - 21,
                y + 87,
                5,
                25
            );

            ctx.fillRect(
                x + 16,
                y + 87,
                5,
                25
            );
        }
    }

    drawFloor() {
        const ctx =
            this.ctx;

        const floorY = 475;

        /*
         * Piso.
         */

        const gradient =
            ctx.createLinearGradient(
                0,
                floorY,
                0,
                this.HEIGHT
            );

        gradient.addColorStop(
            0,
            "#a87554"
        );

        gradient.addColorStop(
            1,
            "#6a4535"
        );

        ctx.fillStyle =
            gradient;

        ctx.fillRect(
            0,
            floorY,
            this.WIDTH,
            this.HEIGHT -
                floorY
        );

        /*
         * Linhas de perspectiva.
         */

        ctx.strokeStyle =
            "rgba(54,36,29,0.32)";

        ctx.lineWidth = 2;

        for (
            let x = -500;
            x <
            this.WIDTH + 500;
            x += 80
        ) {
            ctx.beginPath();

            ctx.moveTo(
                640,
                floorY
            );

            ctx.lineTo(
                x,
                this.HEIGHT
            );

            ctx.stroke();
        }

        for (
            let y = floorY + 35;
            y <
            this.HEIGHT;
            y += 35
        ) {
            ctx.beginPath();

            ctx.moveTo(
                0,
                y
            );

            ctx.lineTo(
                this.WIDTH,
                y
            );

            ctx.stroke();
        }
    }

    drawPlayer() {
        const ctx =
            this.ctx;

        const x =
            this.player.x;

        const y =
            this.player.y +
            this.player.bob;

        /*
         * Sombra do personagem.
         */

        ctx.save();

        ctx.fillStyle =
            "rgba(0,0,0,0.32)";

        ctx.beginPath();

        ctx.ellipse(
            x,
            y + 32,
            25,
            8,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();

        /*
         * Pernas.
         */

        ctx.fillStyle =
            "#263344";

        ctx.fillRect(
            x - 11,
            y + 16,
            9,
            23
        );

        ctx.fillRect(
            x + 2,
            y + 16,
            9,
            23
        );

        /*
         * Sapatos.
         */

        ctx.fillStyle =
            "#202226";

        ctx.fillRect(
            x - 14,
            y + 35,
            13,
            7
        );

        ctx.fillRect(
            x + 3,
            y + 35,
            13,
            7
        );

        /*
         * Corpo.
         */

        ctx.fillStyle =
            "#416b86";

        ctx.fillRect(
            x - 17,
            y - 13,
            34,
            34
        );

        /*
         * Mochila.
         */

        ctx.fillStyle =
            "#4d3b35";

        if (
            this.player.direction ===
            "left"
        ) {
            ctx.fillRect(
                x + 10,
                y - 10,
                12,
                27
            );
        } else {
            ctx.fillRect(
                x - 22,
                y - 10,
                12,
                27
            );
        }

        /*
         * Braços.
         */

        ctx.fillStyle =
            "#d79e76";

        ctx.fillRect(
            x - 22,
            y - 7,
            7,
            25
        );

        ctx.fillRect(
            x + 15,
            y - 7,
            7,
            25
        );

        /*
         * Cabeça.
         */

        ctx.fillStyle =
            "#d9a17b";

        ctx.fillRect(
            x - 14,
            y - 39,
            28,
            27
        );

        /*
         * Cabelo.
         */

        ctx.fillStyle =
            "#30251f";

        ctx.fillRect(
            x - 15,
            y - 43,
            30,
            12
        );

        ctx.fillRect(
            x - 12,
            y - 47,
            23,
            8
        );

        /*
         * Orelhas.
         */

        ctx.fillStyle =
            "#c58d6e";

        ctx.fillRect(
            x - 18,
            y - 31,
            5,
            9
        );

        ctx.fillRect(
            x + 13,
            y - 31,
            5,
            9
        );

        /*
         * Olhos.
         */

        ctx.fillStyle =
            "#20242a";

        ctx.fillRect(
            x - 8,
            y - 27,
            4,
            4
        );

        ctx.fillRect(
            x + 4,
            y - 27,
            4,
            4
        );

        /*
         * Boca.
         */

        ctx.fillRect(
            x - 3,
            y - 18,
            7,
            2
        );

        /*
         * Bengala.
         */

        ctx.strokeStyle =
            "#e7e0d3";

        ctx.lineWidth = 3;

        ctx.beginPath();

        ctx.moveTo(
            x + 25,
            y - 3
        );

        ctx.lineTo(
            x + 31,
            y + 42
        );

        ctx.stroke();

        ctx.beginPath();

        ctx.arc(
            x + 26,
            y - 4,
            6,
            Math.PI,
            Math.PI * 1.7
        );

        ctx.stroke();
    }

    drawAmbientParticles() {
        const ctx =
            this.ctx;

        for (
            const particle of
            this.dustParticles
        ) {
            ctx.fillStyle =
                `rgba(255,239,205,${particle.alpha})`;

            ctx.fillRect(
                particle.x,
                particle.y,
                particle.size,
                particle.size
            );
        }

        for (
            const particle of
            this.sparkParticles
        ) {
            ctx.fillStyle =
                `rgba(244,205,136,${particle.alpha})`;

            ctx.fillRect(
                particle.x,
                particle.y,
                particle.size,
                particle.size
            );
        }
    }

    drawForegroundEffects() {
        const ctx =
            this.ctx;

        /*
         * Luz quente vinda das janelas.
         */

        const sunlight =
            ctx.createLinearGradient(
                80,
                300,
                600,
                650
            );

        sunlight.addColorStop(
            0,
            "rgba(255,224,170,0.14)"
        );

        sunlight.addColorStop(
            1,
            "rgba(255,224,170,0)"
        );

        ctx.fillStyle =
            sunlight;

        ctx.beginPath();

        ctx.moveTo(
            70,
            360
        );

        ctx.lineTo(
            280,
            360
        );

        ctx.lineTo(
            670,
            720
        );

        ctx.lineTo(
            300,
            720
        );

        ctx.closePath();

        ctx.fill();

        /*
         * Pequeno granulado visual.
         */

        ctx.fillStyle =
            "rgba(255,255,255,0.018)";

        for (
            let i = 0;
            i < 100;
            i++
        ) {
            const x =
                Math.random() *
                this.WIDTH;

            const y =
                Math.random() *
                this.HEIGHT;

            ctx.fillRect(
                x,
                y,
                1,
                1
            );
        }
    }

    drawVignette() {
        const ctx =
            this.ctx;

        const gradient =
            ctx.createRadialGradient(
                this.WIDTH / 2,
                this.HEIGHT / 2,
                250,
                this.WIDTH / 2,
                this.HEIGHT / 2,
                760
            );

        gradient.addColorStop(
            0,
            "rgba(0,0,0,0)"
        );

        gradient.addColorStop(
            0.7,
            "rgba(0,0,0,0.06)"
        );

        gradient.addColorStop(
            1,
            "rgba(0,0,0,0.48)"
        );

        ctx.fillStyle =
            gradient;

        ctx.fillRect(
            0,
            0,
            this.WIDTH,
            this.HEIGHT
        );
    }

    /* ========================================================
       PARTICLES
       ======================================================== */

    createParticles() {
        this.dustParticles = [];

        for (
            let i = 0;
            i < 85;
            i++
        ) {
            this.dustParticles.push({
                x:
                    Math.random() *
                    this.WIDTH,

                y:
                    130 +
                    Math.random() *
                        530,

                size:
                    1 +
                    Math.random() *
                        2,

                alpha:
                    0.05 +
                    Math.random() *
                        0.2,

                speed:
                    5 +
                    Math.random() *
                        12
            });
        }

        this.sparkParticles = [];
    }

    updateParticles(deltaTime) {
        for (
            const particle of
            this.dustParticles
        ) {
            particle.y -=
                particle.speed *
                deltaTime;

            particle.x +=
                Math.sin(
                    particle.y *
                    0.01
                ) *
                deltaTime *
                4;

            if (
                particle.y <
                120
            ) {
                particle.y =
                    680;

                particle.x =
                    Math.random() *
                    this.WIDTH;
            }
        }

        for (
            let i =
                this.sparkParticles.length -
                1;
            i >= 0;
            i--
        ) {
            const particle =
                this.sparkParticles[i];

            particle.x +=
                particle.vx *
                deltaTime;

            particle.y +=
                particle.vy *
                deltaTime;

            particle.vy +=
                30 *
                deltaTime;

            particle.life -=
                deltaTime;

            particle.alpha =
                Math.max(
                    0,
                    particle.life /
                        particle.maxLife
                );

            if (
                particle.life <=
                0
            ) {
                this.sparkParticles.splice(
                    i,
                    1
                );
            }
        }
    }

    spawnVictoryParticles() {
        for (
            let i = 0;
            i < 90;
            i++
        ) {
            const angle =
                Math.random() *
                Math.PI *
                2;

            const speed =
                50 +
                Math.random() *
                    170;

            this.sparkParticles.push({
                x:
                    this.player.x,

                y:
                    this.player.y,

                vx:
                    Math.cos(angle) *
                    speed,

                vy:
                    Math.sin(angle) *
                    speed,

                life:
                    1 +
                    Math.random(),

                maxLife:
                    2.2,

                size:
                    2 +
                    Math.random() *
                        3,

                alpha: 1
            });
        }
    }

    /* ========================================================
       ÁUDIO
       ======================================================== */

    startAudio() {
        if (
            this.audioStarted
        ) {
            if (
                this.audioContext &&
                this.audioContext.state ===
                    "suspended"
            ) {
                this.audioContext.resume();
            }

            return;
        }

        try {
            const AudioContext =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContext) {
                return;
            }

            this.audioContext =
                new AudioContext();

            this.masterGain =
                this.audioContext.createGain();

            this.masterGain.gain.value =
                0.18;

            this.masterGain.connect(
                this.audioContext.destination
            );

            this.ambientGain =
                this.audioContext.createGain();

            this.ambientGain.gain.value =
                0.025;

            this.ambientGain.connect(
                this.masterGain
            );

            /*
             * Drone grave contínuo.
             */

            const oscillator =
                this.audioContext.createOscillator();

            const gain =
                this.audioContext.createGain();

            oscillator.type =
                "sine";

            oscillator.frequency.value =
                55;

            gain.gain.value =
                0.12;

            oscillator.connect(
                gain
            );

            gain.connect(
                this.ambientGain
            );

            oscillator.start();

            /*
             * Segundo drone.
             */

            const oscillator2 =
                this.audioContext.createOscillator();

            const gain2 =
                this.audioContext.createGain();

            oscillator2.type =
                "triangle";

            oscillator2.frequency.value =
                82.4;

            gain2.gain.value =
                0.025;

            oscillator2.connect(
                gain2
            );

            gain2.connect(
                this.ambientGain
            );

            oscillator2.start();

            this.audioStarted =
                true;

            const indicator =
                document.getElementById(
                    "soundIndicator"
                );

            if (indicator) {
                indicator.style.opacity =
                    "1";
            }
        } catch (error) {
            console.warn(
                "Áudio não pôde ser inicializado:",
                error
            );
        }
    }

    playSound(type) {
        if (
            !this.audioStarted ||
            !this.audioContext
        ) {
            return;
        }

        const ctx =
            this.audioContext;

        const now =
            ctx.currentTime;

        const oscillator =
            ctx.createOscillator();

        const gain =
            ctx.createGain();

        oscillator.connect(
            gain
        );

        gain.connect(
            this.masterGain
        );

        let frequency = 300;
        let duration = 0.12;
        let volume = 0.15;
        let wave = "sine";

        switch (type) {
            case "click":
                frequency = 520;
                duration = 0.06;
                volume = 0.12;
                wave = "square";
                break;

            case "start":
                frequency = 220;
                duration = 0.5;
                volume = 0.22;
                wave = "sine";
                break;

            case "correct":
                frequency = 620;
                duration = 0.25;
                volume = 0.2;
                wave = "sine";
                break;

            case "error":
                frequency = 110;
                duration = 0.3;
                volume = 0.22;
                wave = "sawtooth";
                break;

            case "unlock":
                frequency = 740;
                duration = 0.45;
                volume = 0.22;
                wave = "triangle";
                break;

            case "success":
                frequency = 880;
                duration = 0.8;
                volume = 0.3;
                wave = "sine";
                break;

            case "door":
                frequency = 170;
                duration = 0.9;
                volume = 0.25;
                wave = "sawtooth";
                break;

            case "locked":
                frequency = 90;
                duration = 0.22;
                volume = 0.2;
                wave = "square";
                break;

            case "step":
                frequency = 75;
                duration = 0.045;
                volume = 0.06;
                wave = "triangle";
                break;

            case "paper":
                frequency = 900;
                duration = 0.08;
                volume = 0.04;
                wave = "triangle";
                break;

            case "computer":
                frequency = 180;
                duration = 0.16;
                volume = 0.08;
                wave = "square";
                break;

            case "open":
                frequency = 400;
                duration = 0.12;
                volume = 0.08;
                wave = "sine";
                break;

            case "pause":
                frequency = 180;
                duration = 0.1;
                volume = 0.08;
                wave = "triangle";
                break;

            case "dialogue":
                frequency = 330;
                duration = 0.04;
                volume = 0.035;
                wave = "triangle";
                break;
        }

        oscillator.type =
            wave;

        oscillator.frequency.setValueAtTime(
            frequency,
            now
        );

        gain.gain.setValueAtTime(
            0.0001,
            now
        );

        gain.gain.exponentialRampToValueAtTime(
            volume,
            now + 0.01
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + duration
        );

        oscillator.start(now);

        oscillator.stop(
            now + duration + 0.02
        );

        /*
         * Algumas ações ganham uma segunda nota.
         */

        if (
            type === "correct"
        ) {
            setTimeout(() => {
                this.playTone(
                    880,
                    0.25,
                    0.15
                );
            }, 100);
        }

        if (
            type === "success"
        ) {
            setTimeout(() => {
                this.playTone(
                    1175,
                    0.8,
                    0.18
                );
            }, 180);
        }
    }

    playTone(
        frequency,
        duration,
        volume
    ) {
        if (
            !this.audioContext ||
            !this.masterGain
        ) {
            return;
        }

        const ctx =
            this.audioContext;

        const oscillator =
            ctx.createOscillator();

        const gain =
            ctx.createGain();

        oscillator.type =
            "sine";

        oscillator.frequency.value =
            frequency;

        oscillator.connect(
            gain
        );

        gain.connect(
            this.masterGain
        );

        const now =
            ctx.currentTime;

        gain.gain.setValueAtTime(
            0.0001,
            now
        );

        gain.gain.exponentialRampToValueAtTime(
            volume,
            now + 0.01
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + duration
        );

        oscillator.start(now);

        oscillator.stop(
            now + duration + 0.02
        );
    }

    playHeartbeat() {
        this.playTone(
            58,
            0.12,
            0.12
        );

        setTimeout(() => {
            this.playTone(
                48,
                0.1,
                0.08
            );
        }, 170);
    }

    /* ========================================================
       UTILITÁRIOS
       ======================================================== */

    generateCode() {
        const code =
            1000 +
            Math.floor(
                Math.random() *
                    9000
            );

        return String(
            code
        );
    }

    isInsideRect(
        x,
        y,
        object
    ) {
        return (
            x >
                object.x -
                    object.width /
                        2 &&
            x <
                object.x +
                    object.width /
                        2 &&
            y >
                object.y -
                    object.height /
                        2 &&
            y <
                object.y +
                    object.height /
                        2
        );
    }

    updateObjective(
        text
    ) {
        const element =
            document.getElementById(
                "objectiveText"
            );

        if (element) {
            element.textContent =
                text;
        }
    }

    showElement(
        id
    ) {
        const element =
            document.getElementById(
                id
            );

        if (!element) {
            return;
        }

        element.classList.remove(
            "hidden"
        );

        element.classList.add(
            "active"
        );
    }

    hideElement(
        id
    ) {
        const element =
            document.getElementById(
                id
            );

        if (!element) {
            return;
        }

        element.classList.add(
            "hidden"
        );

        element.classList.remove(
            "active"
        );
    }

    formatTime(
        seconds
    ) {
        const total =
            Math.floor(
                seconds
            );

        const minutes =
            Math.floor(
                total / 60
            );

        const secs =
            total % 60;

        return (
            String(minutes)
                .padStart(2, "0") +
            ":" +
            String(secs)
                .padStart(2, "0")
        );
    }

    /* ========================================================
       LOOP PRINCIPAL
       ======================================================== */

    loop(
        currentTime
    ) {
        if (
            !this.lastTime
        ) {
            this.lastTime =
                currentTime;
        }

        let deltaTime =
            (currentTime -
                this.lastTime) /
            1000;

        this.lastTime =
            currentTime;

        deltaTime =
            Math.min(
                deltaTime,
                0.05
            );

        this.update(
            deltaTime
        );

        this.render();

        requestAnimationFrame(
            (time) =>
                this.loop(time)
        );
    }
}


/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */

let game = null;

function initializeGame() {
    try {
        game =
            new EscapeRoomGame();

        window.escapeRoom =
            game;

    } catch (error) {
        console.error(
            "Erro ao iniciar Escape Room:",
            error
        );

        const loading =
            document.getElementById(
                "loadingScreen"
            );

        if (loading) {
            loading.innerHTML = `
                <div style="
                    max-width:520px;
                    padding:30px;
                    text-align:center;
                    color:#fff;
                    font-family:Arial,sans-serif;
                ">
                    <strong style="
                        display:block;
                        font-size:22px;
                        margin-bottom:12px;
                    ">
                        Erro ao carregar o jogo
                    </strong>

                    <span style="
                        color:#aaa;
                        font-size:13px;
                        line-height:1.6;
                    ">
                        Atualize a página e tente novamente.
                    </span>
                </div>
            `;
        }
    }
}

if (
    document.readyState ===
    "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        initializeGame,
        {
            once: true
        }
    );
} else {
    initializeGame();
}