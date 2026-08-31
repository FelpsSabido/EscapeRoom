/* ============================================================
   ESCAPE ROOM — INPUT.JS
   Sistema central de entrada do jogador
   ============================================================ */

export class Input {

    /* ========================================================
       CONSTRUTOR
       ======================================================== */

    constructor() {

        /*
         * Todas as teclas atualmente pressionadas.
         */

        this.keys = new Set();


        /*
         * Teclas que foram pressionadas neste frame.
         *
         * Diferente de "keys", isso permite detectar
         * uma ação apenas uma vez.
         */

        this.justPressed = new Set();


        /*
         * Teclas que foram liberadas neste frame.
         */

        this.justReleased = new Set();


        /*
         * Estado do sistema.
         */

        this.enabled = true;


        /*
         * Lista de teclas utilizadas pelo jogo.
         */

        this.allowedKeys = new Set([
            "w",
            "a",
            "s",
            "d",

            "arrowup",
            "arrowdown",
            "arrowleft",
            "arrowright",

            "e",
            "escape",

            "shift",
            "control",

            "enter",
            "space"
        ]);


        /*
         * Eventos vinculados.
         *
         * Guardamos as referências para conseguir
         * remover os eventos posteriormente.
         */

        this.boundKeyDown =
            this.handleKeyDown.bind(this);

        this.boundKeyUp =
            this.handleKeyUp.bind(this);

        this.boundBlur =
            this.handleBlur.bind(this);


        /*
         * Inicializa os listeners.
         */

        this.initialize();
    }


    /* ========================================================
       INICIALIZAÇÃO
       ======================================================== */

    initialize() {

        window.addEventListener(
            "keydown",
            this.boundKeyDown
        );


        window.addEventListener(
            "keyup",
            this.boundKeyUp
        );


        window.addEventListener(
            "blur",
            this.boundBlur
        );
    }


    /* ========================================================
       KEY DOWN
       ======================================================== */

    handleKeyDown(event) {

        if (!this.enabled) {
            return;
        }


        const key =
            this.normalizeKey(event.key);


        /*
         * Ignora teclas que não fazem parte
         * do sistema de controle.
         */

        if (
            !this.allowedKeys.has(key)
        ) {

            return;
        }


        /*
         * Evita comportamentos padrão do navegador
         * para as teclas utilizadas pelo jogo.
         */

        if (
            this.shouldPreventDefault(key)
        ) {

            event.preventDefault();
        }


        /*
         * Se a tecla ainda não estava pressionada,
         * registramos como "just pressed".
         */

        if (
            !this.keys.has(key)
        ) {

            this.justPressed.add(key);
        }


        /*
         * Marca como pressionada.
         */

        this.keys.add(key);
    }


    /* ========================================================
       KEY UP
       ======================================================== */

    handleKeyUp(event) {

        if (!this.enabled) {
            return;
        }


        const key =
            this.normalizeKey(event.key);


        if (
            !this.allowedKeys.has(key)
        ) {

            return;
        }


        /*
         * Remove da lista de teclas pressionadas.
         */

        this.keys.delete(key);


        /*
         * Registra que foi liberada neste frame.
         */

        this.justReleased.add(key);
    }


    /* ========================================================
       NORMALIZAÇÃO
       ======================================================== */

    normalizeKey(key) {

        return String(key)
            .toLowerCase()
            .trim();
    }


    /* ========================================================
       PREVENIR COMPORTAMENTO PADRÃO
       ======================================================== */

    shouldPreventDefault(key) {

        const preventKeys = [
            "w",
            "a",
            "s",
            "d",

            "arrowup",
            "arrowdown",
            "arrowleft",
            "arrowright",

            "space"
        ];


        return preventKeys.includes(key);
    }


    /* ========================================================
       VERIFICAR TECLA PRESSIONADA
       ======================================================== */

    isDown(key) {

        const normalizedKey =
            this.normalizeKey(key);


        return this.keys.has(
            normalizedKey
        );
    }


    /* ========================================================
       VERIFICAR TECLA PRESSIONADA NESTE FRAME
       ======================================================== */

    wasPressed(key) {

        const normalizedKey =
            this.normalizeKey(key);


        return this.justPressed.has(
            normalizedKey
        );
    }


    /* ========================================================
       VERIFICAR TECLA LIBERADA NESTE FRAME
       ======================================================== */

    wasReleased(key) {

        const normalizedKey =
            this.normalizeKey(key);


        return this.justReleased.has(
            normalizedKey
        );
    }


    /* ========================================================
       MOVIMENTO HORIZONTAL
       ======================================================== */

    getHorizontalAxis() {

        let value = 0;


        if (
            this.isDown("a") ||
            this.isDown("arrowleft")
        ) {

            value -= 1;
        }


        if (
            this.isDown("d") ||
            this.isDown("arrowright")
        ) {

            value += 1;
        }


        return value;
    }


    /* ========================================================
       MOVIMENTO VERTICAL
       ======================================================== */

    getVerticalAxis() {

        let value = 0;


        if (
            this.isDown("w") ||
            this.isDown("arrowup")
        ) {

            value -= 1;
        }


        if (
            this.isDown("s") ||
            this.isDown("arrowdown")
        ) {

            value += 1;
        }


        return value;
    }


    /* ========================================================
       VETOR DE MOVIMENTO
       ======================================================== */

    getMovementVector() {

        let x =
            this.getHorizontalAxis();

        let y =
            this.getVerticalAxis();


        /*
         * Normalização.
         *
         * Impede que o jogador se mova mais rápido
         * quando estiver andando na diagonal.
         */

        const magnitude =
            Math.sqrt(
                x * x +
                y * y
            );


        if (
            magnitude > 1
        ) {

            x /=
                magnitude;

            y /=
                magnitude;
        }


        return {
            x,
            y
        };
    }


    /* ========================================================
       AÇÕES DO JOGO
       ======================================================== */

    isMoving() {

        return (
            this.getHorizontalAxis() !== 0 ||
            this.getVerticalAxis() !== 0
        );
    }


    wantsInteract() {

        return this.wasPressed("e");
    }


    wantsPause() {

        return this.wasPressed("escape");
    }


    wantsConfirm() {

        return (
            this.wasPressed("enter") ||
            this.wasPressed("space")
        );
    }


    /* ========================================================
       FIM DO FRAME
       ======================================================== */

    endFrame() {

        /*
         * As teclas "justPressed" e "justReleased"
         * existem somente durante um frame.
         *
         * As teclas que continuam pressionadas
         * permanecem em "keys".
         */

        this.justPressed.clear();

        this.justReleased.clear();
    }


    /* ========================================================
       ATIVAR SISTEMA
       ======================================================== */

    enable() {

        this.enabled = true;
    }


    /* ========================================================
       DESATIVAR SISTEMA
       ======================================================== */

    disable() {

        this.enabled = false;

        this.clear();
    }


    /* ========================================================
       LIMPAR INPUT
       ======================================================== */

    clear() {

        this.keys.clear();

        this.justPressed.clear();

        this.justReleased.clear();
    }


    /* ========================================================
       RESETAR
       ======================================================== */

    reset() {

        this.clear();

        this.enabled = true;
    }


    /* ========================================================
       BLUR
       ======================================================== */

    handleBlur() {

        /*
         * Se o usuário trocar de aba ou janela,
         * nenhuma tecla deve continuar presa.
         */

        this.clear();
    }


    /* ========================================================
       DESTRUIR
       ======================================================== */

    destroy() {

        window.removeEventListener(
            "keydown",
            this.boundKeyDown
        );


        window.removeEventListener(
            "keyup",
            this.boundKeyUp
        );


        window.removeEventListener(
            "blur",
            this.boundBlur
        );


        this.clear();

        this.enabled = false;
    }
}