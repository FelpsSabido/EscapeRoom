/* =========================================================
   A SALA — ESCAPE ROOM
   GAME.JS
   ========================================================= */

import { Input } from "./input.js";
import { World } from "./world.js";
import { Player } from "./player.js";


/* =========================================================
   GAME
   ========================================================= */

export class Game {

  constructor(canvas) {

    this.canvas = canvas;

    this.ctx =
      canvas.getContext("2d");


    if (!this.ctx) {
      throw new Error(
        "Não foi possível criar o contexto 2D."
      );
    }


    this.ctx.imageSmoothingEnabled = false;


    /* -------------------------------------------------------
       DIMENSÕES
    ------------------------------------------------------- */

    this.width = canvas.width;

    this.height = canvas.height;


    this.worldWidth = 1800;

    this.worldHeight = 1000;


    /* -------------------------------------------------------
       ESTADO
    ------------------------------------------------------- */

    this.state = "menu";

    this.started = false;

    this.messageOpen = false;

    this.puzzleOpen = false;

    this.terminalOpen = false;


    /* -------------------------------------------------------
       TEMPO
    ------------------------------------------------------- */

    this.time = 0;

    this.playTime = 0;

    this.lightTime = 0;

    this.flickerTimer = 0;

    this.flickerStrength = 0;

    this.flickerCooldown = 2.5;


    /* -------------------------------------------------------
       CÂMERA
    ------------------------------------------------------- */

    this.camera = {
      x: 0,
      y: 0,

      targetX: 0,
      targetY: 0,

      smooth: 0.12
    };


    /* -------------------------------------------------------
       MUNDO
    ------------------------------------------------------- */

    this.world =
      new World(
        this.worldWidth,
        this.worldHeight
      );


    /* -------------------------------------------------------
       INPUT
    ------------------------------------------------------- */

    this.input =
      new Input(this);


    /* -------------------------------------------------------
       PLAYER
    ------------------------------------------------------- */

    const spawn =
      this.world.getSpawnPoint();


    this.player =
      new Player({
        world: this.world,
        x: spawn.x,
        y: spawn.y
      });


    /* -------------------------------------------------------
       PROGRESSO
    ------------------------------------------------------- */

    this.progress = {

      board: false,

      clock: false,

      cabinet: false,

      bookshelf: false,

      computer: false,

      desk1: false,

      desk2: false,

      desk3: false,

      desk4: false,

      desk5: false,

      desk6: false,

      posterLeft: false,

      posterRight: false,

      terminal: false,

      codeSolved: false,

      exitUnlocked: false

    };


    /* -------------------------------------------------------
       SENHA E PISTAS
    ------------------------------------------------------- */

    this.puzzleData =
      this.generatePuzzle();


    this.currentMessage = {
      title: "",
      text: ""
    };


    this.currentPuzzle = null;


    /* -------------------------------------------------------
       ÁUDIO
    ------------------------------------------------------- */

    this.voiceEnabled =
      "speechSynthesis" in window;

    this.speech =
      window.speechSynthesis || null;


    this.voiceRate = 0.92;

    this.voicePitch = 0.9;

    this.voiceVolume = 1;


    /* -------------------------------------------------------
       AMBIENTE
    ------------------------------------------------------- */

    this.particles = [];

    this.ambientParticles = [];

    this.initializeParticles();


    /* -------------------------------------------------------
       INTERAÇÃO
    ------------------------------------------------------- */

    this.nearestInteraction = null;

    this.interactionCooldown = 0;


    /* -------------------------------------------------------
       ANIMAÇÕES
    ------------------------------------------------------- */

    this.doorAnimation = 0;

    this.playerLightPulse = 0;

    this.screenShake = 0;

    this.flashAlpha = 0;


    /* -------------------------------------------------------
       SOM
    ------------------------------------------------------- */

    this.audioContext = null;

    this.audioUnlocked = false;


    /* -------------------------------------------------------
       CONFIGURAÇÃO
    ------------------------------------------------------- */

    this.setupWorld();

    this.updateCamera(true);

    this.updateHUD();

  }


  /* =========================================================
     CONFIGURAÇÃO DO MUNDO
     ========================================================= */

  setupWorld() {

    if (
      typeof this.world.setGame ===
      "function"
    ) {

      this.world.setGame(this);

    }

  }


  /* =========================================================
     GERADOR DE PUZZLE
     ========================================================= */

  generatePuzzle() {

    /*
     * Cada carregamento cria uma combinação diferente.
     *
     * O código final é montado a partir das respostas
     * dos desafios encontrados durante a investigação.
     */

    const randomDigit =
      () => Math.floor(
        Math.random() * 9
      ) + 1;


    const digits = [
      randomDigit(),
      randomDigit(),
      randomDigit(),
      randomDigit()
    ];


    /*
     * Evita código com quatro números iguais.
     */

    if (
      digits.every(
        value => value === digits[0]
      )
    ) {

      digits[3] =
        digits[3] === 9
          ? 1
          : digits[3] + 1;

    }


    const order =
      this.shuffle([
        0,
        1,
        2,
        3
      ]);


    const clues = [
      {
        id: "clue1",

        answer:
          String(digits[0]),

        text:
          `No quadro existe uma sequência incompleta.

Observe com atenção:

2, 4, 6, ?

Qual número completa a sequência?`,

        hint:
          "A sequência aumenta sempre pelo mesmo valor.",

        voice:
          "No quadro existe uma sequência incompleta. Dois, quatro, seis. Qual número vem depois?"
      },

      {
        id: "clue2",

        answer:
          String(digits[1]),

        text:
          `O relógio parece estranho.

Conte quantas marcas principais
existem no mostrador.

Depois descubra qual número deve
ser observado na posição indicada
pela pista do ambiente.`,

        hint:
          "Nem sempre a resposta está escrita diretamente.",

        voice:
          "O relógio parece estranho. Observe suas marcas e procure a posição indicada pela pista."
      },

      {
        id: "clue3",

        answer:
          String(digits[2]),

        text:
          `Entre os objetos da sala existe
uma pequena anotação.

Ela diz:

"Comece com cinco.
Acrescente dois.
Retire um."

Qual é o resultado?`,

        hint:
          "Faça as operações na ordem.",

        voice:
          "A anotação diz: comece com cinco, acrescente dois e retire um. Qual é o resultado?"
      },

      {
        id: "clue4",

        answer:
          String(digits[3]),

        text:
          `Uma das carteiras possui uma pista:

"Sou o número de lados
de uma forma simples,
mas acrescente uma unidade."

Qual número você encontra?`,

        hint:
          "Pense em uma forma geométrica básica.",

        voice:
          "Uma carteira possui uma pista. Sou o número de lados de uma forma simples, mas acrescente uma unidade."
      }
    ];


    /*
     * Para que a senha seja realmente diferente,
     * recalculamos os números das pistas conforme
     * a ordem sorteada.
     */

    const shuffledClues =
      order.map(
        index => clues[index]
      );


    const code =
      digits.join("");


    return {

      code,

      digits,

      clues: shuffledClues,

      used: [],

      currentIndex: 0

    };

  }


  /* =========================================================
     SHUFFLE
     ========================================================= */

  shuffle(array) {

    const result =
      [...array];


    for (
      let i = result.length - 1;
      i > 0;
      i--
    ) {

      const j =
        Math.floor(
          Math.random() * (i + 1)
        );


      [
        result[i],
        result[j]
      ] =
      [
        result[j],
        result[i]
      ];

    }


    return result;

  }


  /* =========================================================
     START
     ========================================================= */

  start() {

    if (
      this.state === "playing"
    ) {

      return;

    }


    this.unlockAudio();


    this.state = "playing";

    this.started = true;

    this.messageOpen = false;

    this.puzzleOpen = false;

    this.terminalOpen = false;


    this.showHUD();


    this.player.resetTo(
      this.world.getSpawnPoint()
    );


    this.updateCamera(true);


    this.showMessage(
      "A SALA",
      "A porta está trancada.\n\nA sala está silenciosa demais.\n\nExplore o ambiente. Há pistas escondidas por todos os lados.\n\nUse E para investigar objetos."
    );


    this.speak(
      "A porta está trancada. A sala está silenciosa demais. Explore o ambiente. Há pistas escondidas por todos os lados. Use a tecla E para investigar objetos."
    );

  }


  /* =========================================================
     RESTART
     ========================================================= */

  restart() {

    this.stopSpeaking();


    this.state = "playing";

    this.started = true;


    this.progress = {

      board: false,

      clock: false,

      cabinet: false,

      bookshelf: false,

      computer: false,

      desk1: false,

      desk2: false,

      desk3: false,

      desk4: false,

      desk5: false,

      desk6: false,

      posterLeft: false,

      posterRight: false,

      terminal: false,

      codeSolved: false,

      exitUnlocked: false

    };


    this.puzzleData =
      this.generatePuzzle();


    this.currentMessage = {
      title: "",
      text: ""
    };


    this.currentPuzzle = null;


    this.world.reset();


    this.player.resetTo(
      this.world.getSpawnPoint()
    );


    this.doorAnimation = 0;

    this.flashAlpha = 0;

    this.screenShake = 0;


    this.closeAllOverlays();

    this.showHUD();

    this.updateCamera(true);


    this.unlockAudio();


    this.showMessage(
      "NOVA PARTIDA",
      "A sala mudou.\n\nAs pistas foram reorganizadas e um novo código foi criado.\n\nBoa sorte."
    );


    this.speak(
      "Nova partida. As pistas foram reorganizadas e um novo código foi criado."
    );

  }


  /* =========================================================
     PAUSE
     ========================================================= */

  togglePause() {

    if (
      this.state === "playing"
    ) {

      this.pause();

      return;

    }


    if (
      this.state === "paused"
    ) {

      this.resume();

    }

  }


  pause() {

    if (
      this.state !== "playing"
    ) {

      return;

    }


    this.state = "paused";


    const pauseScreen =
      document.getElementById(
        "pauseScreen"
      );


    if (pauseScreen) {

      pauseScreen.classList.remove(
        "hidden"
      );

    }

  }


  resume() {

    if (
      this.state !== "paused"
    ) {

      return;

    }


    this.state = "playing";


    const pauseScreen =
      document.getElementById(
        "pauseScreen"
      );


    if (pauseScreen) {

      pauseScreen.classList.add(
        "hidden"
      );

    }


    this.canvas.focus();

  }


  /* =========================================================
     UPDATE
     ========================================================= */

  update(deltaTime) {

    if (
      !Number.isFinite(deltaTime)
    ) {

      return;

    }


    this.time += deltaTime;


    this.updateAmbient(
      deltaTime
    );


    if (
      this.state !== "playing"
    ) {

      this.input.endFrame();

      return;

    }


    if (
      this.messageOpen ||
      this.puzzleOpen ||
      this.terminalOpen
    ) {

      this.updateCamera();

      this.input.endFrame();

      return;

    }


    this.playTime += deltaTime;


    this.interactionCooldown =
      Math.max(
        0,
        this.interactionCooldown -
        deltaTime
      );


    this.updatePlayer(
      deltaTime
    );


    this.updateInteraction();


    this.updateCamera();


    this.updateLighting(
      deltaTime
    );


    this.updateAnimations(
      deltaTime
    );


    this.updateHUD();


    if (
      this.input.wantsPause()
    ) {

      this.pause();

    }


    if (
      this.input.wantsInteract()
    ) {

      this.interact();

    }


    this.input.endFrame();

  }


  /* =========================================================
     PLAYER
     ========================================================= */

  updatePlayer(deltaTime) {

    const movement =
      this.input.getMovementVector();


    if (
      movement.x === 0 &&
      movement.y === 0
    ) {

      this.player.update(
        deltaTime,
        0,
        0
      );

      return;

    }


    this.player.update(
      deltaTime,
      movement.x,
      movement.y
    );

  }


  /* =========================================================
     INTERAÇÃO
     ========================================================= */

  updateInteraction() {

    if (
      !this.world ||
      !this.player
    ) {

      return;

    }


    this.nearestInteraction =
      this.world.getNearestInteraction(
        this.player
      );

  }


  interact() {

    if (
      this.interactionCooldown > 0
    ) {

      return;

    }


    this.interactionCooldown =
      0.25;


    const target =
      this.nearestInteraction ||
      this.world.getNearestInteraction(
        this.player
      );


    if (!target) {

      this.playBeep(
        120,
        0.04,
        "triangle"
      );

      return;

    }


    this.handleInteraction(
      target
    );

  }


  /* =========================================================
     TRATAMENTO DE INTERAÇÃO
     ========================================================= */

  handleInteraction(target) {

    switch (target.id) {

      case "board":

        this.interactBoard();

        break;


      case "clock":

        this.interactClock();

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


      case "poster_left":

        this.interactPosterLeft();

        break;


      case "poster_right":

        this.interactPosterRight();

        break;


      case "desk_1":
      case "desk_2":
      case "desk_3":
      case "desk_4":
      case "desk_5":
      case "desk_6":

        this.interactDesk(
          target.id
        );

        break;


      case "exit":

        this.interactExit();

        break;


      default:

        this.showMessage(
          "OBJETO",
          "Não parece haver nada de especial aqui."
        );

        break;

    }

  }


  /* =========================================================
     QUADRO
     ========================================================= */

  interactBoard() {

    this.progress.board = true;


    const clue =
      this.puzzleData.clues[0];


    this.showMessage(
      "QUADRO",
      "Há várias anotações apagadas.\n\nUma delas chama sua atenção:\n\n" +
      clue.text
    );


    this.speak(
      "Quadro. " +
      clue.voice
    );


    this.playBeep(
      440,
      0.08,
      "sine"
    );

  }


  /* =========================================================
     RELÓGIO
     ========================================================= */

  interactClock() {

    this.progress.clock = true;


    const clue =
      this.puzzleData.clues[1];


    this.showMessage(
      "RELÓGIO",
      "O relógio parou.\n\nOs ponteiros não parecem marcar uma hora normal.\n\n" +
      clue.text
    );


    this.speak(
      "Relógio. " +
      clue.voice
    );


    this.playBeep(
      330,
      0.08,
      "sine"
    );

  }


  /* =========================================================
     ARMÁRIO
     ========================================================= */

  interactCabinet() {

    this.progress.cabinet = true;


    this.showMessage(
      "ARMÁRIO",
      "Você abre uma das portas.\n\nHá materiais escolares antigos, alguns livros e uma folha dobrada.\n\nNa folha está escrito:\n\n\"Nem toda pista precisa estar onde você espera.\""
    );


    this.speak(
      "Armário. Você encontra materiais escolares antigos e uma folha. Nela está escrito: Nem toda pista precisa estar onde você espera."
    );


    this.playBeep(
      250,
      0.07,
      "triangle"
    );

  }


  /* =========================================================
     ESTANTE
     ========================================================= */

  interactBookshelf() {

    this.progress.bookshelf = true;


    const clue =
      this.puzzleData.clues[2];


    this.showMessage(
      "ESTANTE",
      "Entre os livros há uma folha escondida.\n\n" +
      clue.text
    );


    this.speak(
      "Estante. " +
      clue.voice
    );


    this.playBeep(
      520,
      0.08,
      "sine"
    );

  }


  /* =========================================================
     COMPUTADOR
     ========================================================= */

  interactComputer() {

    this.progress.computer = true;


    if (
      !this.progress.codeSolved
    ) {

      this.showMessage(
        "COMPUTADOR",
        "O computador está ligado.\n\nA tela mostra:\n\n\"ACESSO RESTRITO\"\n\n\"O sistema exige um código de quatro dígitos.\""
      );


      this.speak(
        "Computador. A tela mostra acesso restrito. O sistema exige um código de quatro dígitos."
      );


      return;

    }


    this.openTerminal();

  }


  /* =========================================================
     PÔSTER ESQUERDO
     ========================================================= */

  interactPosterLeft() {

    this.progress.posterLeft =
      true;


    this.showMessage(
      "AVISO",
      "Um cartaz antigo está preso à parede.\n\nVocê percebe pequenas marcas no papel.\n\nParece que alguém usou o cartaz para esconder alguma coisa."
    );


    this.speak(
      "Aviso. Um cartaz antigo está preso à parede. Pequenas marcas indicam que alguém pode ter escondido alguma coisa ali."
    );

  }


  /* =========================================================
     PÔSTER DIREITO
     ========================================================= */

  interactPosterRight() {

    this.progress.posterRight =
      true;


    const clue =
      this.puzzleData.clues[3];


    this.showMessage(
      "ANOTAÇÃO",
      "Atrás do cartaz existe uma pequena anotação.\n\n" +
      clue.text
    );


    this.speak(
      "Anotação. " +
      clue.voice
    );

  }


  /* =========================================================
     CARTEIRAS
     ========================================================= */

  interactDesk(id) {

    this.progress[
      this.deskProgressKey(id)
    ] = true;


    const deskNumber =
      Number(
        id.replace(
          "desk_",
          ""
        )
      );


    const messages = {

      1:
        "A carteira está cheia de riscos. Alguém escreveu uma sequência e depois tentou apagá-la.",

      2:
        "Você encontra um lápis quebrado e um pequeno pedaço de papel. Não parece ser a pista principal.",

      3:
        "Há uma frase escrita na madeira: \"Observe o que está acima de você.\"", 

      4:
        "Debaixo da carteira existe uma marca em forma de seta apontando para a parede.",

      5:
        "Você encontra uma folha em branco. Quando olha contra a luz, percebe algumas marcas.",

      6:
        "A última carteira está estranhamente limpa. Talvez alguém tenha procurado alguma coisa aqui."
    };


    let message =
      messages[deskNumber] ||
      "Não há nada de especial nesta carteira.";


    /*
     * A carteira que contém a pista principal
     * muda a cada partida.
     */

    const clueIndex =
      3;


    if (
      deskNumber ===
      this.getSpecialDesk()
    ) {

      const clue =
        this.puzzleData.clues[
          clueIndex
        ];


      message +=
        "\n\nAtrás da carteira você encontra uma anotação:\n\n" +
        clue.text;


      this.speak(
        "Carteira " +
        deskNumber +
        ". " +
        clue.voice
      );

    } else {

      this.speak(
        "Carteira " +
        deskNumber +
        ". " +
        message
      );

    }


    this.showMessage(
      "CARTEIRA " +
      deskNumber,
      message
    );


    this.playBeep(
      300 +
      deskNumber * 35,
      0.06,
      "triangle"
    );

  }


  /* =========================================================
     CARTEIRA ESPECIAL
     ========================================================= */

  getSpecialDesk() {

    /*
     * O local da quarta pista também muda.
     */

    const seed =
      this.puzzleData.digits[0] +
      this.puzzleData.digits[1];


    return (
      seed % 6
    ) + 1;

  }


  /* =========================================================
     PROGRESS KEY
     ========================================================= */

  deskProgressKey(id) {

    return id
      .replace(
        "desk_",
        "desk"
      );

  }


  /* =========================================================
     SAÍDA
     ========================================================= */

  interactExit() {

    if (
      !this.progress.exitUnlocked
    ) {

      const remaining =
        this.countMissingEvidence();


      if (
        remaining > 0
      ) {

        this.showMessage(
          "PORTA",
          "A porta está trancada.\n\nParece que ainda falta investigar " +
          remaining +
          (remaining === 1
            ? " parte importante"
            : " partes importantes") +
          " da sala."
        );


        this.speak(
          "A porta está trancada. Ainda faltam pistas importantes."
        );


        return;

      }


      this.showMessage(
        "PORTA",
        "A fechadura possui um pequeno teclado.\n\nTalvez o computador tenha alguma resposta."
      );


      this.speak(
        "A fechadura possui um pequeno teclado. Talvez o computador tenha alguma resposta."
      );


      return;

    }


    this.completeGame();

  }


  /* =========================================================
     CONTAGEM DE EVIDÊNCIAS
     ========================================================= */

  countMissingEvidence() {

    let found = 0;


    if (this.progress.board) {
      found++;
    }

    if (this.progress.clock) {
      found++;
    }

    if (this.progress.bookshelf) {
      found++;
    }

    if (this.progress.posterRight) {
      found++;
    }


    return Math.max(
      0,
      3 - found
    );

  }


  /* =========================================================
     TERMINAL
     ========================================================= */

  openTerminal() {

    if (
      !this.progress.computer
    ) {

      return;

    }


    this.terminalOpen = true;


    const overlay =
      document.getElementById(
        "terminalOverlay"
      );


    const input =
      document.getElementById(
        "terminalInput"
      );


    const feedback =
      document.getElementById(
        "terminalFeedback"
      );


    const display =
      document.getElementById(
        "terminalCodeDisplay"
      );


    if (overlay) {

      overlay.classList.remove(
        "hidden"
      );

    }


    if (feedback) {

      feedback.textContent = "";

    }


    if (display) {

      display.textContent =
        "_ _ _ _";

    }


    if (input) {

      input.value = "";

      setTimeout(
        () => input.focus(),
        50
      );

    }


    this.speakTerminal();

  }


  /* =========================================================
     TERMINAL VOICE
     ========================================================= */

  speakTerminal() {

    this.speak(
      "Terminal. Sistema bloqueado. Digite o código de quatro dígitos encontrado nas pistas."
    );

  }


  /* =========================================================
     SUBMIT TERMINAL
     ========================================================= */

  submitTerminal() {

    const input =
      document.getElementById(
        "terminalInput"
      );


    const feedback =
      document.getElementById(
        "terminalFeedback"
      );


    if (!input) {
      return;
    }


    const value =
      input.value
        .replace(
          /\D/g,
          ""
        )
        .slice(
          0,
          4
        );


    input.value =
      value;


    if (
      value.length !== 4
    ) {

      if (feedback) {

        feedback.textContent =
          "Digite quatro números.";

      }


      this.speak(
        "Digite quatro números."
      );


      return;

    }


    if (
      value ===
      this.puzzleData.code
    ) {

      this.progress.codeSolved =
        true;

      this.progress.exitUnlocked =
        true;


      this.terminalOpen = false;


      const overlay =
        document.getElementById(
          "terminalOverlay"
        );


      if (overlay) {

        overlay.classList.add(
          "hidden"
        );

      }


      this.world.setDoorOpen(
        true
      );


      this.showMessage(
        "ACESSO LIBERADO",
        "Código correto.\n\nO computador emite um som baixo.\n\nEm algum lugar da sala, a fechadura da porta se solta.\n\nAgora você precisa chegar até a saída."
      );


      this.speak(
        "Código correto. A fechadura da porta foi liberada. Agora você precisa chegar até a saída."
      );


      this.flashAlpha =
        0.5;


      this.screenShake =
        5;


      this.playSuccessSound();


      return;

    }


    if (feedback) {

      feedback.textContent =
        "Código incorreto. As pistas ainda escondem a resposta.";

    }


    this.speak(
      "Código incorreto. As pistas ainda escondem a resposta."
    );


    this.playErrorSound();


    this.screenShake =
      3;

  }


  /* =========================================================
     CLOSE TERMINAL
     ========================================================= */

  closeTerminal() {

    this.terminalOpen = false;


    const overlay =
      document.getElementById(
        "terminalOverlay"
      );


    if (overlay) {

      overlay.classList.add(
        "hidden"
      );

    }


    this.canvas.focus();

  }


  /* =========================================================
     PUZZLE
     ========================================================= */

  openPuzzle(clue) {

    if (!clue) {
      return;
    }


    this.currentPuzzle =
      clue;


    this.puzzleOpen = true;


    const overlay =
      document.getElementById(
        "puzzleOverlay"
      );


    const title =
      document.getElementById(
        "puzzleTitle"
      );


    const question =
      document.getElementById(
        "puzzleQuestion"
      );


    const feedback =
      document.getElementById(
        "puzzleFeedback"
      );


    const input =
      document.getElementById(
        "puzzleInput"
      );


    if (title) {

      title.textContent =
        "DESAFIO";

    }


    if (question) {

      question.textContent =
        clue.text;

    }


    if (feedback) {

      feedback.textContent = "";

    }


    if (input) {

      input.value = "";

    }


    if (overlay) {

      overlay.classList.remove(
        "hidden"
      );

    }


    this.speakCurrentPuzzle();


    setTimeout(
      () => {

        if (input) {

          input.focus();

        }

      },
      50
    );

  }


  /* =========================================================
     SUBMIT PUZZLE
     ========================================================= */

  submitPuzzle() {

    if (
      !this.currentPuzzle
    ) {

      return;

    }


    const input =
      document.getElementById(
        "puzzleInput"
      );


    const feedback =
      document.getElementById(
        "puzzleFeedback"
      );


    if (!input) {
      return;
    }


    const answer =
      input.value
        .trim()
        .toLowerCase();


    const expected =
      String(
        this.currentPuzzle.answer
      )
      .trim()
      .toLowerCase();


    if (
      answer === expected
    ) {

      this.puzzleOpen = false;


      const overlay =
        document.getElementById(
          "puzzleOverlay"
        );


      if (overlay) {

        overlay.classList.add(
          "hidden"
        );

      }


      this.progress[
        this.currentPuzzle.id
      ] = true;


      this.showMessage(
        "PISTA ENCONTRADA",
        "Resposta correta.\n\nVocê encontrou uma parte importante do código."
      );


      this.speak(
        "Resposta correta. Você encontrou uma parte importante do código."
      );


      this.playSuccessSound();


      return;

    }


    if (feedback) {

      feedback.textContent =
        "Não é essa. Observe melhor a pista.";

    }


    this.speak(
      "Não é essa resposta. Observe melhor a pista."
    );


    this.playErrorSound();

  }


  /* =========================================================
     CLOSE PUZZLE
     ========================================================= */

  closePuzzle() {

    this.puzzleOpen = false;

    this.currentPuzzle = null;


    const overlay =
      document.getElementById(
        "puzzleOverlay"
      );


    if (overlay) {

      overlay.classList.add(
        "hidden"
      );

    }


    this.canvas.focus();

  }


  /* =========================================================
     MESSAGE
     ========================================================= */

  showMessage(title, text) {

    this.currentMessage = {
      title,
      text
    };


    this.messageOpen = true;


    const overlay =
      document.getElementById(
        "messageOverlay"
      );


    const titleElement =
      document.getElementById(
        "messageTitle"
      );


    const textElement =
      document.getElementById(
        "messageText"
      );


    if (titleElement) {

      titleElement.textContent =
        title;

    }


    if (textElement) {

      textElement.textContent =
        text;

    }


    if (overlay) {

      overlay.classList.remove(
        "hidden"
      );

    }

  }


  /* =========================================================
     CLOSE MESSAGE
     ========================================================= */

  closeMessage() {

    this.messageOpen = false;


    const overlay =
      document.getElementById(
        "messageOverlay"
      );


    if (overlay) {

      overlay.classList.add(
        "hidden"
      );

    }


    this.canvas.focus();

  }


  /* =========================================================
     SPEAK CURRENT TEXT
     ========================================================= */

  speakCurrentText() {

    if (
      !this.currentMessage
    ) {

      return;

    }


    this.speak(
      this.currentMessage.text
    );

  }


  /* =========================================================
     SPEAK CURRENT PUZZLE
     ========================================================= */

  speakCurrentPuzzle() {

    if (
      !this.currentPuzzle
    ) {

      return;

    }


    this.speak(
      this.currentPuzzle.voice ||
      this.currentPuzzle.text
    );

  }


  /* =========================================================
     VOZ
     ========================================================= */

  speak(text) {

    if (
      !this.voiceEnabled ||
      !this.speech ||
      !text
    ) {

      return;

    }


    this.stopSpeaking();


    const utterance =
      new SpeechSynthesisUtterance(
        text
      );


    utterance.lang =
      "pt-BR";


    utterance.rate =
      this.voiceRate;


    utterance.pitch =
      this.voicePitch;


    utterance.volume =
      this.voiceVolume;


    const voices =
      this.speech.getVoices();


    const portugueseVoice =
      voices.find(
        voice =>
          voice.lang &&
          voice.lang
            .toLowerCase()
            .startsWith("pt-br")
      ) ||
      voices.find(
        voice =>
          voice.lang &&
          voice.lang
            .toLowerCase()
            .startsWith("pt")
      );


    if (
      portugueseVoice
    ) {

      utterance.voice =
        portugueseVoice;

    }


    const indicator =
      document.getElementById(
        "voiceIndicator"
      );


    if (indicator) {

      indicator.classList.remove(
        "hidden"
      );

    }


    utterance.onend =
      () => {

        if (indicator) {

          indicator.classList.add(
            "hidden"
          );

        }

      };


    utterance.onerror =
      () => {

        if (indicator) {

          indicator.classList.add(
            "hidden"
          );

        }

      };


    this.speech.speak(
      utterance
    );

  }


  /* =========================================================
     STOP SPEAKING
     ========================================================= */

  stopSpeaking() {

    if (
      this.speech
    ) {

      this.speech.cancel();

    }


    const indicator =
      document.getElementById(
        "voiceIndicator"
      );


    if (indicator) {

      indicator.classList.add(
        "hidden"
      );

    }

  }


  /* =========================================================
     AUDIO
     ========================================================= */

  unlockAudio() {

    if (
      this.audioUnlocked
    ) {

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


      if (
        this.audioContext.state ===
        "suspended"
      ) {

        this.audioContext.resume();

      }


      this.audioUnlocked =
        true;


    } catch (error) {

      console.warn(
        "Áudio não disponível:",
        error
      );

    }

  }


  playBeep(
    frequency = 440,
    duration = 0.08,
    type = "sine"
  ) {

    if (
      !this.audioContext
    ) {

      return;

    }


    try {

      const oscillator =
        this.audioContext.createOscillator();


      const gain =
        this.audioContext.createGain();


      oscillator.type =
        type;


      oscillator.frequency.value =
        frequency;


      gain.gain.setValueAtTime(
        0.0001,
        this.audioContext.currentTime
      );


      gain.gain.exponentialRampToValueAtTime(
        0.055,
        this.audioContext.currentTime + 0.01
      );


      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        this.audioContext.currentTime + duration
      );


      oscillator.connect(
        gain
      );


      gain.connect(
        this.audioContext.destination
      );


      oscillator.start();


      oscillator.stop(
        this.audioContext.currentTime +
        duration
      );

    } catch (error) {

      console.warn(
        "Erro no beep:",
        error
      );

    }

  }


  /* =========================================================
     SOM DE SUCESSO
     ========================================================= */

  playSuccessSound() {

    this.playBeep(
      523,
      0.12,
      "sine"
    );


    setTimeout(
      () => {

        this.playBeep(
          659,
          0.12,
          "sine"
        );

      },
      110
    );


    setTimeout(
      () => {

        this.playBeep(
          784,
          0.18,
          "sine"
        );

      },
      220
    );

  }


  /* =========================================================
     SOM DE ERRO
     ========================================================= */

  playErrorSound() {

    this.playBeep(
      160,
      0.18,
      "sawtooth"
    );


    setTimeout(
      () => {

        this.playBeep(
          110,
          0.2,
          "sawtooth"
        );

      },
      100
    );

  }


  /* =========================================================
     AMBIENTE
     ========================================================= */

  initializeParticles() {

    for (
      let i = 0;
      i < 100;
      i++
    ) {

      this.ambientParticles.push({

        x:
          Math.random() *
          this.worldWidth,

        y:
          Math.random() *
          this.worldHeight,

        size:
          Math.random() *
          2 + 0.5,

        speed:
          Math.random() *
          5 + 2,

        alpha:
          Math.random() *
          0.35 + 0.05

      });

    }

  }


  updateAmbient(deltaTime) {

    for (
      const particle of
      this.ambientParticles
    ) {

      particle.y -=
        particle.speed *
        deltaTime;


      if (
        particle.y < 50
      ) {

        particle.y =
          this.worldHeight;

      }

    }

  }


  /* =========================================================
     ILUMINAÇÃO
     ========================================================= */

  updateLighting(deltaTime) {

    this.lightTime +=
      deltaTime;


    this.flickerCooldown -=
      deltaTime;


    if (
      this.flickerCooldown <= 0
    ) {

      /*
       * Piscadas irregulares.
       */

      if (
        Math.random() < 0.35
      ) {

        this.flickerStrength =
          0.65 +
          Math.random() * 0.35;


        this.flickerTimer =
          0.06 +
          Math.random() * 0.16;


        this.screenShake =
          Math.max(
            this.screenShake,
            1
          );

      }


      this.flickerCooldown =
        2.5 +
        Math.random() * 5;

    }


    if (
      this.flickerTimer > 0
    ) {

      this.flickerTimer -=
        deltaTime;

    } else {

      this.flickerStrength =
        Math.max(
          0,
          this.flickerStrength -
          deltaTime * 2.8
        );

    }


    this.playerLightPulse =
      Math.sin(
        this.time * 2.2
      ) *
      0.025;


    this.flashAlpha =
      Math.max(
        0,
        this.flashAlpha -
        deltaTime * 2.5
      );


    this.screenShake =
      Math.max(
        0,
        this.screenShake -
        deltaTime * 9
      );

  }


  /* =========================================================
     ANIMAÇÕES
     ========================================================= */

  updateAnimations(deltaTime) {

    if (
      this.progress.exitUnlocked
    ) {

      this.doorAnimation =
        Math.min(
          1,
          this.doorAnimation +
          deltaTime * 1.7
        );

    }

  }


  /* =========================================================
     PARTÍCULAS
     ========================================================= */

  updateParticles(deltaTime) {

    for (
      const particle of
      this.particles
    ) {

      particle.life -=
        deltaTime;

      particle.y -=
        particle.speed *
        deltaTime;


      if (
        particle.life <= 0
      ) {

        particle.reset =
          true;

      }

    }


    this.particles =
      this.particles.filter(
        particle =>
          !particle.reset
      );

  }


  /* =========================================================
     CÂMERA
     ========================================================= */

  updateCamera(immediate = false) {

    if (
      !this.player
    ) {

      return;

    }


    this.camera.targetX =
      this.player.x -
      this.width / 2;


    this.camera.targetY =
      this.player.y -
      this.height / 2;


    const maxX =
      this.worldWidth -
      this.width;


    const maxY =
      this.worldHeight -
      this.height;


    this.camera.targetX =
      Math.max(
        0,
        Math.min(
          maxX,
          this.camera.targetX
        )
      );


    this.camera.targetY =
      Math.max(
        0,
        Math.min(
          maxY,
          this.camera.targetY
        )
      );


    if (
      immediate
    ) {

      this.camera.x =
        this.camera.targetX;

      this.camera.y =
        this.camera.targetY;

      return;

    }


    this.camera.x +=
      (
        this.camera.targetX -
        this.camera.x
      ) *
      this.camera.smooth;


    this.camera.y +=
      (
        this.camera.targetY -
        this.camera.y
      ) *
      this.camera.smooth;

  }


  /* =========================================================
     RENDER
     ========================================================= */

  render() {

    const ctx =
      this.ctx;


    ctx.clearRect(
      0,
      0,
      this.width,
      this.height
    );


    ctx.save();


    /*
     * Pequeno tremor quando a iluminação
     * falha ou acontece algum evento.
     */

    if (
      this.screenShake > 0
    ) {

      const shake =
        this.screenShake;


      ctx.translate(
        (Math.random() - 0.5) *
        shake,

        (Math.random() - 0.5) *
        shake
      );

    }


    ctx.translate(
      -Math.floor(
        this.camera.x
      ),

      -Math.floor(
        this.camera.y
      )
    );


    this.world.render(
      ctx,
      this
    );


    this.renderAmbientParticles(
      ctx
    );


    this.player.render(
      ctx
    );


    this.renderLighting(
      ctx
    );


    ctx.restore();


    this.renderFlash();

  }


  /* =========================================================
     AMBIENT PARTICLES RENDER
     ========================================================= */

  renderAmbientParticles(ctx) {

    for (
      const particle of
      this.ambientParticles
    ) {

      const distance =
        Math.hypot(
          particle.x -
          this.player.x,

          particle.y -
          this.player.y
        );


      if (
        distance >
        450
      ) {

        continue;

      }


      ctx.save();


      ctx.globalAlpha =
        particle.alpha *
        Math.max(
          0,
          1 -
          distance / 450
        );


      ctx.fillStyle =
        "#d8c9a5";


      ctx.fillRect(
        Math.floor(
          particle.x
        ),

        Math.floor(
          particle.y
        ),

        Math.max(
          1,
          Math.floor(
            particle.size
          )
        ),

        Math.max(
          1,
          Math.floor(
            particle.size
          )
        )
      );


      ctx.restore();

    }

  }


  /* =========================================================
     LIGHTING
     ========================================================= */

  renderLighting(ctx) {

    const playerX =
      this.player.x;


    const playerY =
      this.player.y;


    const baseDarkness =
      0.76;


    const flicker =
      this.flickerStrength;


    /*
     * Tudo começa escuro.
     */

    ctx.save();


    ctx.fillStyle =
      `rgba(0, 0, 0, ${baseDarkness})`;


    ctx.fillRect(
      this.camera.x,
      this.camera.y,
      this.width,
      this.height
    );


    /*
     * Campo de visão do jogador.
     */

    const radius =
      225 +
      Math.sin(
        this.time * 2
      ) * 7;


    const gradient =
      ctx.createRadialGradient(
        playerX,
        playerY,
        20,

        playerX,
        playerY,
        radius
      );


    gradient.addColorStop(
      0,
      "rgba(255, 241, 196, 0.78)"
    );


    gradient.addColorStop(
      0.2,
      "rgba(235, 216, 169, 0.42)"
    );


    gradient.addColorStop(
      0.52,
      "rgba(150, 136, 106, 0.18)"
    );


    gradient.addColorStop(
      0.78,
      "rgba(30, 32, 32, 0.08)"
    );


    gradient.addColorStop(
      1,
      "rgba(0, 0, 0, 0)"
    );


    ctx.globalCompositeOperation =
      "lighter";


    ctx.fillStyle =
      gradient;


    ctx.beginPath();

    ctx.arc(
      playerX,
      playerY,
      radius,
      0,
      Math.PI * 2
    );

    ctx.fill();


    /*
     * Luz secundária no ambiente.
     */

    this.renderLampGlow(
      ctx,
      640,
      80,
      125,
      0.16
    );


    this.renderLampGlow(
      ctx,
      1370,
      90,
      110,
      0.12
    );


    this.renderLampGlow(
      ctx,
      450,
      510,
      85,
      0.08
    );


    /*
     * Piscada.
     */

    if (
      flicker > 0
    ) {

      ctx.globalCompositeOperation =
        "source-over";


      ctx.fillStyle =
        `rgba(5, 6, 7, ${
          Math.min(
            0.8,
            flicker
          )
        })`;


      ctx.fillRect(
        this.camera.x,
        this.camera.y,
        this.width,
        this.height
      );

    }


    ctx.restore();

  }


  /* =========================================================
     LAMP GLOW
     ========================================================= */

  renderLampGlow(
    ctx,
    x,
    y,
    radius,
    alpha
  ) {

    const gradient =
      ctx.createRadialGradient(
        x,
        y,
        5,
        x,
        y,
        radius
      );


    gradient.addColorStop(
      0,
      `rgba(255, 222, 151, ${alpha})`
    );


    gradient.addColorStop(
      0.45,
      `rgba(209, 170, 96, ${
        alpha * 0.35
      })`
    );


    gradient.addColorStop(
      1,
      "rgba(0,0,0,0)"
    );


    ctx.save();


    ctx.globalCompositeOperation =
      "lighter";


    ctx.fillStyle =
      gradient;


    ctx.beginPath();


    ctx.arc(
      x,
      y,
      radius,
      0,
      Math.PI * 2
    );


    ctx.fill();


    ctx.restore();

  }


  /* =========================================================
     FLASH
     ========================================================= */

  renderFlash() {

    if (
      this.flashAlpha <= 0
    ) {

      return;

    }


    this.ctx.save();


    this.ctx.fillStyle =
      `rgba(255,244,210,${
        this.flashAlpha
      })`;


    this.ctx.fillRect(
      0,
      0,
      this.width,
      this.height
    );


    this.ctx.restore();

  }


  /* =========================================================
     HUD
     ========================================================= */

  updateHUD() {

    const hint =
      document.getElementById(
        "interactionHint"
      );


    if (!hint) {
      return;
    }


    if (
      this.state !== "playing"
    ) {

      return;

    }


    if (
      this.nearestInteraction
    ) {

      hint.textContent =
        "E — " +
        (
          this.nearestInteraction.label ||
          "Investigar"
        );

    } else {

      hint.textContent =
        "Explore a sala...";

    }

  }


  /* =========================================================
     SHOW HUD
     ========================================================= */

  showHUD() {

    const hud =
      document.getElementById(
        "hud"
      );


    const voice =
      document.getElementById(
        "voiceButton"
      );


    if (hud) {

      hud.classList.remove(
        "hidden"
      );

    }


    if (voice) {

      voice.classList.remove(
        "hidden"
      );

    }


    const start =
      document.getElementById(
        "startScreen"
      );


    if (start) {

      start.classList.add(
        "hidden"
      );

    }

  }


  /* =========================================================
     CLOSE ALL OVERLAYS
     ========================================================= */

  closeAllOverlays() {

    const ids = [

      "messageOverlay",

      "puzzleOverlay",

      "terminalOverlay",

      "pauseScreen",

      "completeScreen"

    ];


    for (
      const id of ids
    ) {

      const element =
        document.getElementById(
          id
        );


      if (element) {

        element.classList.add(
          "hidden"
        );

      }

    }


    this.messageOpen = false;

    this.puzzleOpen = false;

    this.terminalOpen = false;

  }


  /* =========================================================
     COMPLETE
     ========================================================= */

  completeGame() {

    this.state =
      "complete";


    this.started =
      false;


    this.stopSpeaking();


    this.playSuccessSound();


    const screen =
      document.getElementById(
        "completeScreen"
      );


    if (screen) {

      screen.classList.remove(
        "hidden"
      );

    }


    const hud =
      document.getElementById(
        "hud"
      );


    if (hud) {

      hud.classList.add(
        "hidden"
      );

    }


    const voice =
      document.getElementById(
        "voiceButton"
      );


    if (voice) {

      voice.classList.add(
        "hidden"
      );

    }

  }


  /* =========================================================
     KEYBOARD HANDLER
     ========================================================= */

  handleKeyDown(event) {

    if (!event) {
      return;
    }


    if (
      event.key ===
      "Enter"
    ) {

      if (
        this.messageOpen
      ) {

        event.preventDefault();

        this.closeMessage();

        return;

      }

    }


    if (
      event.key ===
      "Escape"
    ) {

      if (
        this.messageOpen
      ) {

        event.preventDefault();

        this.closeMessage();

        return;

      }


      if (
        this.puzzleOpen
      ) {

        event.preventDefault();

        this.closePuzzle();

        return;

      }


      if (
        this.terminalOpen
      ) {

        event.preventDefault();

        this.closeTerminal();

        return;

      }

    }

  }


  /* =========================================================
     DESTROY
     ========================================================= */

  destroy() {

    this.stopSpeaking();


    if (
      this.input &&
      typeof this.input.destroy ===
      "function"
    ) {

      this.input.destroy();

    }


    if (
      this.audioContext
    ) {

      try {

        this.audioContext.close();

      } catch (error) {

        console.warn(
          "Erro fechando áudio:",
          error
        );

      }

    }

  }

}     