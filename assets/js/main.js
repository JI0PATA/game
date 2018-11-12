// РАБОТА С DOM
const $ = el => document.querySelector(el);
const $$ = el => document.querySelectorAll(el);
const on = (el, ev, func) => el.addEventListener(ev, func);
const $$on = (el, ev, func) => $$(el).forEach(elFor => {
    on(elFor, ev, func);
});

// ПАРАМЕТРЫ
const MAP_WIDTH = 3000;
const WIDTH_SCREEN = window.innerWidth;

// ДЛЯ ПЕРСОНАЖА
const PLAYER_SPEED = 5;

class Frame {
    constructor() {

    }

}

/**
 * BASE DRAW
 */
class Drawable extends Frame {
    constructor() {
        super();
    }

    /**
     * DRAW UNITS
     */
    draw() {
        this.img.style.left = `${this.x}px`;
    }

    static checkCollision(main_object, addi_object) {
        let a = {
            x1: main_object.x,
            x2: main_object.x + main_object.w,
            y1: main_object.y,
            y2: main_object.y + main_object.h
        };

        let b = {
            x1: addi_object.x,
            x2: addi_object.x + addi_object.w,
            y1: addi_object.y,
            y2: addi_object.y + addi_object.h
        };

        return !(
            (a.x2 < b.x1 || a.x1 > b.x2) ||
            (a.y2 < b.y1 || a.y1 > b.y2)
        );
    }

    paused() {
        this.img.classList.add('animPaused');
    }

    resume() {
        this.img.classList.remove('animPaused');
    }

    removeImg() {
        this.img.remove();
        delete GAME.objects[GAME.objects.indexOf(this)];
    }

    direction(dir) {
        if (dir === 'left') {
            this.img.classList.remove('unit-right');
            this.img.classList.add('unit-left');
        } else {
            this.img.classList.remove('unit-left');
            this.img.classList.add('unit-right');
        }
    }
}

/**
 * BASE CLASS MONSTERS
 */
class Monster extends Drawable {
    constructor() {
        super();

        this.w = 0;
        this.h = 0;
        this.x = Game.random(GAME.Player.innerX, GAME.Player.innerX + WIDTH_SCREEN);

        this.canMove = true;
        this.canHit = true;
        this.visible = true;

        this.createImg();
    }

    eachFrame() {
        this.update();
        this.draw();

        if (this.checkHit()) this.applyHit();
    }

    update() {
        if (!this.canMove) return;

        if (GAME.Player.innerX < this.x) {
            this.direction('left');
            this.x -= this.params.speed;
        }
        else if (GAME.Player.innerX > this.x + this.w / 2) {
            this.direction('right');
            this.x += this.params.speed;
        }

    }

    create() {
        this.createImg();
    }

    checkHit() {
        if (Math.abs((GAME.Player.innerX) - this.x) <= 100) return true;
    }

    /**
     * Нанести удар игроку
     */
    applyHit() {
        if (!this.canHit) return;
        this.canHit = false;
        // Анимация удара для каждого персонажа
        this.animationHit();
        setTimeout(_ => {
            if (this.checkHit() && !GAME.Player.def) {
                window.GAME.states.hp -= this.params.damage;
            }
            this.canHit = true;
        }, 1500);
    }
}

/**
 * MONSTER - DOG
 */
class Dog extends Monster {
    constructor() {
        super();

        this.w = 128;

        this.params = {
            hp: 15,
            damage: 2,
            speed: 4,
            nameFolder: 'dog'
        };
    }

    createImg() {
        this.img = document.createElement('div');
        this.img.classList.add('dog');
        window.GAME.board.appendChild(this.img);
    }

    animationHit() {
        // this.img.style.backgroundImage = 'dog_attack.png';
    }
}

/**
 * MONSTER - ELF
 */
class Elf extends Monster {
    constructor() {
        super();

        this.params = {
            hp: 30,
            damage: 5,
            speed: 3,
            nameFolder: 'elf'
        };
    }

    animationHit() {
        this.img.style.backgroundImage = '';
    }

    createImg() {
        this.img = document.createElement('div');
        this.img.classList.add('elf');
        window.GAME.board.appendChild(this.img);
    }
}

/**
 * MONSTER - GRINCH
 */
class Grinch extends Monster {
    constructor() {
        super();

        this.params = {
            hp: 60,
            damage: 10,
            speed: 2,
            nameFolder: 'grinch'
        };
    }

    animationHit() {
        this.img.style.backgroundImage = 'grinch_attack.png';
    }

    createImg() {
        this.img = document.createElement('div');
        this.img.classList.add('grinch');
        window.GAME.board.appendChild(this.img);
    }
}

/**
 * PLAYER
 */
class Player extends Drawable {
    constructor() {
        super();

        this.innerX = 0;

        this.w = 169;

        this.params = {
            skills: {
                skill1: new Skill1(),
                skill2: new Skill2(),
                skill3: new Skill3(),
                skill4: new Skill4(),
            },
            def: false
        };

        this.keys = {
            37: false,
            39: false,
        };

        this.bindEvents();

        this.createImg();
    }

    bindEvents() {
        document.addEventListener('keydown', ev => {
            this.setKey(ev.which, true);
        });
        document.addEventListener('keyup', ev => {
            this.setKey(ev.which, false);
        });
    }

    setKey(key, val) {
        this.keys[key] = val;
    }

    eachFrame() {
        this.update();
        this.draw();
    }

    update() {
        this.idle();

        if (this.innerX + this.w >= MAP_WIDTH) {
            GAME.gameOver();
        }

        if (this.keys[37] && this.innerX >= 0) {
            this.checkMove();
            this.innerX -= PLAYER_SPEED;
            this.run();
            this.direction('left');
        } else if (this.keys[39] && this.innerX + this.w <= MAP_WIDTH) {
            this.checkMove();
            this.innerX += PLAYER_SPEED;
            this.run();
            this.direction('right');
        }
        this.x = this.innerX;
    }

    checkMove() {
        if (this.innerX + this.w / 2 >= WIDTH_SCREEN / 2 && this.innerX + this.w / 2 <= MAP_WIDTH - WIDTH_SCREEN / 2) {
            window.GAME.backgroundScreen.style.backgroundPositionX = `-${this.innerX + this.w / 2- WIDTH_SCREEN / 2}px`;
            window.GAME.board.style.left = `-${this.innerX + this.w / 2 - WIDTH_SCREEN / 2}px`;
        }
    }

    /**
     * HIT SWORD
     */
    skill1() {
        this.img.style.backgroundImage = 'attack.png';
    }

    /**
     * ЗАЩИТА ЩИТОМ
     */
    skill2() {
        this.def = true;
        this.img.style.backgroundImage = 'def.png';
    }

    createImg() {
        this.img = document.createElement('div');
        this.img.setAttribute('id', 'player');
        this.img.classList.add('idle');
        window.GAME.board.appendChild(this.img);
    }

    run() {
        this.w = 203;
        this.img.classList.remove('idle');
        this.img.classList.add('run');
    }

    idle() {
        this.w = 169;
        this.img.classList.remove('run');
        this.img.classList.add('idle');
    }

}

class Skill extends Frame {
    constructor() {
        super();

        this.leftReload = 0;
    }

    /**
     * CHECK USE SKILL
     */
    checkApplySkill() {
        if (this.leftReload !== 0) return;

        this.applySkill();

        this.leftReload = this.params.reload;
    }

    eachFrame() {
        this.setReloadTime();
    }

    /**
     * SET REALOD TIME FOR SKILL TIME ON BOARD
     */
    setReloadTime() {
        if (GAME.frame % 60 === 0) {
            this.leftReload -= 1;
        }
    }

    bindEvents() {
        document.addEventListener('keydown', ev => {
            if (ev.which === this.params.keyCode) this.checkApplySkill();
        });
    }
}

class Skill1 extends Skill {
    constructor() {
        super();

        this.params = {
            keyCode: 49,
            reload: 0,
            mp: 0,
            damage: 15,
            icon: ''
        };

        this.bindEvents();
    }

    applySkill() {
        // Удар мечом
        // Реализовать у игрока смену анимации на удар мечом
        // Player.skill1
        // console.log('skill1');
    }
}

class Skill2 extends Skill {
    constructor() {
        super();

        this.params = {
            keyCode: 50,
            reload: 0,
            mp: 0,
            damage: 15,
            icon: ''
        };

        this.bindEvents();
    }

    applySkill() {
        // Защита щитом
        // Смена анимации на защиту щитом
        // Player.skill2
        // console.log('skill2');
    }
}

class Skill3 extends Skill {
    constructor() {
        super();

        this.params = {
            keyCode: 51,
            reload: 3,
            mp: 0,
            damage: 15,
            icon: ''
        };

        this.img = null;

        this.bindEvents();
    }

    createImg() {

    }

    update() {

    }

    applySkill() {
        // Метания ножей
        // console.log('skill3');
    }
}

class Skill4 extends Skill {
    constructor() {
        super();

        this.params = {
            keyCode: 52,
            reload: 15,
            mp: 0,
            damage: 15,
            icon: ''
        };

        this.bindEvents();
    }

    applySkill() {
        // console.log('skill4');
    }
}

/**
 * CLASS GAME
 */
class Game {
    constructor() {
        this.states = {
            name: '',
            score: 0,
            time: 0,
            hp: 100,
            mp: 100,
            isPaused: false,
            isNewGame: false,
            isGameOver: false,
            token: 0,
            screens: {
                startScreen: new StartScreen(),
                resultScreen: new ResultScreen()
            }
        };
        this.fields = {
            name: $('#player-name'),
            buttonNewGame: $('#start-game')
        };

        this.board = $('#board');
        this.backgroundScreen = $('#screen-game');

        this.frame = 0;
        this.objects = [];

        this.bindEvents();

        // УДАЛИТЬ
        // this.newGame();
    }

    resetValues() {
        this.frame = 0;
        this.objects = [];
        this.states.score = 0;
        this.states.time = 0;
        this.states.hp = 100;
        this.states.mp = 100;
        this.states.isPaused = false;
        this.states.isGameOver = false;
    }

    bindEvents() {
        on(this.fields.name, 'input', _ => {
            if (this.fields.name.value.trim().length === 0) this.fields.buttonNewGame.classList.add('disabled');
            else this.fields.buttonNewGame.classList.remove('disabled');
            this.states.name = this.fields.name.value.trim();
        });
        on(this.fields.buttonNewGame, 'click', _ => {
            if (this.states.name.length !== 0) this.newGame();
        });
        on(document, 'keydown', ev => {
            if (ev.which === 27) this.state();
        });
        on($('#restart-game'), 'click', _ => {
            this.restartGame();
        })
    }

    /**
     * PLAY NEW GAME
     */
    newGame() {
        if (this.states.isNewGame) return;
        this.states.isNewGame = true;

        // this.states.token = this.setToken();

        this.states.screens.startScreen.hiddenScreen();
        this.setPlayerName();

        this.createPlayer();
        this.loop();
    }

    createPlayer() {
        this.Player = new Player();
        this.objects.push(this.Player);
    }

    /**
     * GET RANDOM NUMBER
     * @param min
     * @param max
     * @returns {number}
     */
    static random(min, max) {
        return Math.round(Math.random() * (max - min) + min);
    }

    /**
     * GENERATE TOKEN PLAYER
     * @returns {number}
     */
    static generateToken() {
        return Game.random(10000, 99999);
    }

    setToken() {
        this.states.token = Game.generateToken();
    }

    /**
     * GAME LOOP
     */
    loop() {
        if (this.states.isPaused) return;

        this.objects.forEach(el => {
            if (el.eachFrame !== null) el.eachFrame();
        });

        if (this.frame % 180 === 1) this.generateMonster();

        this.setHP();


        this.timer();

        this.frame += 1;
        requestAnimationFrame(_ => this.loop());
    }

    /**
     * PAUSE / PLAY
     */
    state() {
        if (this.states.isGameOver) return;

        this.states.isPaused = !this.states.isPaused;

        if (this.states.isPaused) {
            this.stopAllAnimation();
        } else {
            this.resumeAllAnimation();
            this.loop();
        }
    }

    /**
     * STOP ALL ANIMATION
     */
    stopAllAnimation() {
        this.objects.forEach(el => {
            el.paused();
        });
    }

    /**
     * RESUME ALL ANIMATION
     */
    resumeAllAnimation() {
        this.objects.forEach(el => {
            el.resume();
        });
    }

    /**
     * TIMER
     */
    timer() {
        if (this.frame % 60 === 1) {
            this.states.time += 1;

            let minutes = Math.floor(this.states.time / 60);
            let seconds = this.states.time - minutes * 60;

            if (minutes < 10) minutes = '0' + minutes;
            if (seconds < 10) seconds = '0' + seconds;

            $('#minutes').innerText = minutes;
            $('#seconds').innerText = seconds;
        }
    }

    /**
     * SET PLAYER NAME ON BOARD
     */
    setPlayerName() {
        $('#board-player-name').innerText = this.states.name;
    }

    /**
     * GENERATE RANDOM MONSTER
     */
    generateMonster() {
        if (this.objects.length >= 11) return;

        let rand_monster = Game.random(1, 3);

        if (rand_monster === 1) this.objects.push(new Dog());
        else if (rand_monster === 2) this.objects.push(new Elf());
        else if (rand_monster === 3) this.objects.push(new Grinch());
    }

    /**
     * SET HP ON BOARD
     */
    setHP() {
        if (this.states.hp <= 0) {
            this.gameOver();
            this.states.hp = 0;
        }

        if (this.states.hp < 100 && this.frame % 60 === 0) this.states.hp += 2;

        $('#board-hp').style.width = `${this.states.hp}%`;
        $('#board-hp-value').innerText = this.states.hp;
    }

    /**
     * GAME OVER
     */
    gameOver() {
        this.state();
        this.states.isGameOver = true;
        this.states.screens.resultScreen.showScreen();

        this.sendResult();
    }

    /**
     * RESTART GAME
     */
    restartGame() {
        this.objects.forEach(el => {
            el.removeImg();
        });

        this.board.style.left = `0px`;
        this.backgroundScreen.style.backgroundPositionX = `0px`;

        this.resetValues();
        this.states.screens.resultScreen.hiddenScreen();
        this.createPlayer();
        this.loop();
    }

    /**
     * SEND RESULT TO DB
     */
    sendResult() {
        let fd = new FormData();
        fd.append('username', this.states.name);
        fd.append('score', this.states.score);
        fd.append('time', this.states.time);

        fetch('register.php', {
            method: 'post',
            body: fd
        })
            .then(res => res.json())
            .then(res => {
                this.fillTable(res);
            });
    }

    /**
     * FILL TABLE DATA
     */
    fillTable(res) {
        let resSort = res.sort((a, b) => {
            return a.time - b.time;
        });

        let i = 0;

        resSort.forEach(el => {
            if (i >= 10) return;

            let selectRow;

            if (el.username === this.states.name && el.time == this.states.time) selectRow = 'selectRow';
            else selectRow = '';

            let minutes = Math.floor(el.time / 60);
            let seconds = el.time - minutes * 60;

            if (minutes < 10) minutes = '0' + minutes;
            if (seconds < 10) seconds = '0' + seconds;

            let tr = `
            <tr class="${selectRow}">
                <td>${i + 1}</td>
                <td>${el.username}</td>
                <td>${el.score}</td>
                <td>${minutes}:${seconds}</td>
            </tr>
`;

            $('#result-table').innerHTML += tr;
            i += 1;
        });
    }
}

/**
 * BASE CLASS FOR SCREENS
 */
class Screen {
    /**
     * SHOW SCREEN
     */
    showScreen() {
        this.screen.classList.remove('hidden');
        this.screen.classList.remove('hiddenScreenAnim');
        this.screen.classList.add('showScreenAnim');
    }

    /**
     * HIDDEN SCREEN
     */
    hiddenScreen() {
        this.screen.classList.remove('showScreenAnim');
        this.screen.classList.add('hiddenScreenAnim');
        setTimeout(_ => {
            this.screen.classList.add('hidden');
        }, 500);
    }
}

/**
 * START SCREEN
 */
class StartScreen extends Screen {
    constructor() {
        super();

        this.screen = $('#start-screen');
    }
}

/**
 * RESULT SCREEN
 */
class ResultScreen extends Screen {
    constructor() {
        super();

        this.screen = $('#result-screen');
    }
}

/**
 * GAME INSTANCE
 * @type {Game}
 */
window.GAME = new Game();
