import { Game } from "./game.js";


/* ============================================================
   CONFIGURAÇÕES GERAIS
   ============================================================ */

const GAME_CONFIG = {
    canvasWidth: 960,
    canvasHeight: 540,
    backgroundColor: "#08090d",
    pixelArt: true
};


/* ============================================================
   ESTADO DA APLICAÇÃO
   ============================================================ */

const App = {
    canvas: null,
    context: null,
    game: null,

    initialized: false,
    started: false,

    elements: {
        root: null,
        viewport: null,
        canvas: null,

        startScreen: null,
        startButton: null,

        pauseScreen: null,
        resumeButton: null,

        completionScreen: null,
        restartButton: null,

        loadingScreen: null,
        loadingProgress: null,
        loadingStatus: null,

        hud: null,
        interactionPrompt: null,
        dialogueBox: null,
        terminalOverlay: null,
        systemMessage: null,
        screenEffects: null
    }
};


/* ============================================================
   LOCALIZAÇÃO DOS ELEMENTOS HTML
   ============================================================ */

function cacheDOM() {
    App.elements.root =
        document.getElementById("game-root");

    App.elements.viewport =
        document.getElementById("game-viewport");

    App.elements.canvas =
        document.getElementById("game-canvas");

    App.elements.startScreen =
        document.getElementById("start-screen");

    App.elements.startButton =
        document.getElementById("start-button");

    App.elements.pauseScreen =
        document.getElementById("pause-screen");

    App.elements.resumeButton =
        document.getElementById("resume-button");

    App.elements.completionScreen =
        document.getElementById("completion-screen");

    App.elements.restartButton =
        document.getElementById("restart-button");

    App.elements.loadingScreen =
        document.getElementById("loading-screen");

    App.elements.loadingProgress =
        document.getElementById("loading-progress");

    App.elements.loadingStatus =
        document.getElementById("loading-status");

    App.elements.hud =
        document.getElementById("game-hud");

    App.elements.interactionPrompt =
        document.getElementById("interaction-prompt");

    App.elements.dialogueBox =
        document.getElementById("dialogue-box");

    App.elements.terminalOverlay =
        document.getElementById("terminal-overlay");

    App.elements.systemMessage =
        document.getElementById("system-message");

    App.elements.screenEffects =
        document.getElementById("screen-effects");
}


/* ============================================================
   VALIDAÇÃO DO HTML
   ============================================================ */

function validateDOM() {
    const requiredElements = [
        ["game-root", App.elements.root],
        ["game-viewport", App.elements.viewport],
        ["game-canvas", App.elements.canvas],

        ["start-screen", App.elements.startScreen],
        ["start-button", App.elements.startButton],

        ["pause-screen", App.elements.pauseScreen],
        ["resume-button", App.elements.resumeButton],

        ["completion-screen", App.elements.completionScreen],
        ["restart-button", App.elements.restartButton],

        ["loading-screen", App.elements.loadingScreen],
        ["loading-progress", App.elements.loadingProgress],
        ["loading-status", App.elements.loadingStatus]
    ];

    const missingElements = requiredElements
        .filter(function (item) {
            return !item[1];
        })
        .map(function (item) {
            return item[0];
        });

    if (missingElements.length > 0) {
        console.error(
            "[ESCAPE ROOM] Elementos HTML ausentes:",
            missingElements
        );

        return false;
    }

    return true;
}


/* ============================================================
   CONFIGURAÇÃO DO CANVAS
   ============================================================ */

function setupCanvas() {
    App.canvas =
        App.elements.canvas;

    App.canvas.width =
        GAME_CONFIG.canvasWidth;

    App.canvas.height =
        GAME_CONFIG.canvasHeight;

    App.context =
        App.canvas.getContext("2d", {
            alpha: false
        });

    if (!App.context) {
        throw new Error(
            "Não foi possível inicializar o Canvas 2D."
        );
    }

    App.context.imageSmoothingEnabled = false;

    App.canvas.style.aspectRatio =
        GAME_CONFIG.canvasWidth +
        " / " +
        GAME_CONFIG.canvasHeight;

    App.context.fillStyle =
        GAME_CONFIG.backgroundColor;

    App.context.fillRect(
        0,
        0,
        GAME_CONFIG.canvasWidth,
        GAME_CONFIG.canvasHeight
    );
}


/* ============================================================
   LOADING SCREEN
   ============================================================ */

function setLoadingProgress(progress, status) {
    const safeProgress =
        Math.max(
            0,
            Math.min(100, progress)
        );

    if (App.elements.loadingProgress) {
        App.elements.loadingProgress.style.width =
            safeProgress + "%";
    }

    if (
        status &&
        App.elements.loadingStatus
    ) {
        App.elements.loadingStatus.textContent =
            status;
    }
}


async function initializeGame() {
    setLoadingProgress(
        10,
        "PREPARANDO CANVAS..."
    );

    await nextFrame();

    setLoadingProgress(
        35,
        "CARREGANDO SISTEMA..."
    );

    await nextFrame();

    App.game = new Game({
        canvas: App.canvas,
        context: App.context,
        width: GAME_CONFIG.canvasWidth,
        height: GAME_CONFIG.canvasHeight
    });

    setLoadingProgress(
        70,
        "INICIALIZANDO MUNDO..."
    );

    await nextFrame();

    if (
        App.game &&
        typeof App.game.initialize === "function"
    ) {
        await App.game.initialize();
    }

    setLoadingProgress(
        100,
        "SISTEMA PRONTO."
    );

    await wait(350);

    hideLoadingScreen();

    App.initialized = true;

    showStartScreen();
}


/* ============================================================
   INICIAR JOGO
   ============================================================ */

function startGame() {
    if (!App.initialized) {
        console.warn(
            "[ESCAPE ROOM] O jogo ainda está inicializando."
        );

        return;
    }

    if (App.started) {
        return;
    }

    App.started = true;

    hideElement(
        App.elements.startScreen
    );

    hideElement(
        App.elements.pauseScreen
    );

    hideElement(
        App.elements.completionScreen
    );

    showElement(
        App.elements.hud
    );

    if (
        App.game &&
        typeof App.game.start === "function"
    ) {
        App.game.start();
    }
}


/* ============================================================
   REINICIAR JOGO
   ============================================================ */

function restartGame() {
    if (!App.game) {
        return;
    }

    hideElement(
        App.elements.completionScreen
    );

    App.started = true;

    if (
        typeof App.game.restart === "function"
    ) {
        App.game.restart();
    }

    showElement(
        App.elements.hud
    );
}


/* ============================================================
   PAUSAR JOGO
   ============================================================ */

function togglePause() {
    if (!App.started || !App.game) {
        return;
    }

    if (
        typeof App.game.isPaused === "function" &&
        typeof App.game.setPaused === "function"
    ) {
        const currentlyPaused =
            App.game.isPaused();

        App.game.setPaused(
            !currentlyPaused
        );

        if (!currentlyPaused) {
            showElement(
                App.elements.pauseScreen
            );
        } else {
            hideElement(
                App.elements.pauseScreen
            );
        }
    }
}


/* ============================================================
   TELA INICIAL
   ============================================================ */

function showStartScreen() {
    showElement(
        App.elements.startScreen
    );

    hideElement(
        App.elements.pauseScreen
    );

    hideElement(
        App.elements.completionScreen
    );

    hideElement(
        App.elements.hud
    );
}


/* ============================================================
   ESCONDER LOADING
   ============================================================ */

function hideLoadingScreen() {
    if (
        !App.elements.loadingScreen
    ) {
        return;
    }

    App.elements.loadingScreen.classList.add(
        "ui-hidden"
    );
}


/* ============================================================
   TELA DE CONCLUSÃO
   ============================================================ */

function showCompletionScreen() {
    hideElement(
        App.elements.hud
    );

    hideElement(
        App.elements.pauseScreen
    );

    hideElement(
        App.elements.dialogueBox
    );

    hideElement(
        App.elements.interactionPrompt
    );

    showElement(
        App.elements.completionScreen
    );
}


/* ============================================================
   FUNÇÕES DE INTERFACE
   ============================================================ */

function showElement(element) {
    if (!element) {
        return;
    }

    element.classList.remove(
        "ui-hidden"
    );
}


function hideElement(element) {
    if (!element) {
        return;
    }

    element.classList.add(
        "ui-hidden"
    );
}


/* ============================================================
   CONTROLE DE TEMPO
   ============================================================ */

function wait(milliseconds) {
    return new Promise(function (resolve) {
        setTimeout(
            resolve,
            milliseconds
        );
    });
}


function nextFrame() {
    return new Promise(function (resolve) {
        requestAnimationFrame(function () {
            resolve();
        });
    });
}


/* ============================================================
   EVENTOS DA INTERFACE
   ============================================================ */

function setupUIEvents() {
    App.elements.startButton.addEventListener(
        "click",
        function () {
            startGame();
        }
    );

    App.elements.resumeButton.addEventListener(
        "click",
        function () {
            if (
                App.game &&
                typeof App.game.setPaused === "function"
            ) {
                App.game.setPaused(false);
            }

            hideElement(
                App.elements.pauseScreen
            );
        }
    );

    App.elements.restartButton.addEventListener(
        "click",
        function () {
            restartGame();
        }
    );

    window.addEventListener(
        "keydown",
        function (event) {
            if (
                event.key === "Escape"
            ) {
                togglePause();
            }
        }
    );
}


/* ============================================================
   VISIBILIDADE DA PÁGINA
   ============================================================ */

function setupVisibilityHandling() {
    document.addEventListener(
        "visibilitychange",
        function () {
            if (
                document.hidden &&
                App.started &&
                App.game &&
                typeof App.game.setPaused === "function"
            ) {
                App.game.setPaused(true);

                showElement(
                    App.elements.pauseScreen
                );
            }
        }
    );
}


/* ============================================================
   REDIMENSIONAMENTO
   ============================================================ */

function setupResizeHandling() {
    window.addEventListener(
        "resize",
        function () {
            if (
                App.game &&
                typeof App.game.resize === "function"
            ) {
                App.game.resize();
            }
        }
    );
}


/* ============================================================
   TRATAMENTO DE ERROS
   ============================================================ */

function setupErrorHandling() {
    window.addEventListener(
        "error",
        function (event) {
            console.error(
                "[ESCAPE ROOM] Erro:",
                event.error || event.message
            );
        }
    );

    window.addEventListener(
        "unhandledrejection",
        function (event) {
            console.error(
                "[ESCAPE ROOM] Promise rejeitada:",
                event.reason
            );
        }
    );
}


/* ============================================================
   INICIALIZAÇÃO PRINCIPAL
   ============================================================ */

async function boot() {
    try {
        cacheDOM();

        if (!validateDOM()) {
            throw new Error(
                "A estrutura HTML necessária não foi encontrada."
            );
        }

        setupCanvas();

        setupUIEvents();

        setupVisibilityHandling();

        setupResizeHandling();

        setupErrorHandling();

        showElement(
            App.elements.loadingScreen
        );

        await initializeGame();

        console.info(
            "[ESCAPE ROOM] Sistema inicializado com sucesso."
        );
    } catch (error) {
        console.error(
            "[ESCAPE ROOM] Falha crítica na inicialização:",
            error
        );

        if (
            App.elements.loadingStatus
        ) {
            App.elements.loadingStatus.textContent =
                "ERRO AO INICIALIZAR SISTEMA.";
        }
    }
}


/* ============================================================
   ACESSO DE DESENVOLVIMENTO
   ============================================================ */

window.EscapeRoom = {
    get game() {
        return App.game;
    },

    get initialized() {
        return App.initialized;
    },

    get started() {
        return App.started;
    },

    start: function () {
        startGame();
    },

    restart: function () {
        restartGame();
    }
};


/* ============================================================
   EXECUÇÃO
   ============================================================ */

if (
    document.readyState === "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        boot,
        {
            once: true
        }
    );
} else {
    boot();
}