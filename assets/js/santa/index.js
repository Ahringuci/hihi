//  color: ['#f0488b', '#b248f0', '#48f06f', '#aff048', '#f08848'];

import * as gml from "../gml.js";
function requestFullScreen(element) {
    // Supports most browsers and their versions.
    var requestMethod =
        element.requestFullScreen ||
        element.webkitRequestFullScreen ||
        element.mozRequestFullScreen ||
        element.msRequestFullScreen;

    if (requestMethod) {
        // Native full screen.
        requestMethod.call(element);
    } else if (typeof window.ActiveXObject !== "undefined") {
        // Older IE.
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
            wscript.SendKeys("{F11}");
        }
    }
}

var elem = document.body; // Make the body go full screen.
requestFullScreen(elem);

(function () {
    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");
    const sprite_index = document.getElementById("js_spritesheet");
    const app = $(".app");

    if (app.requestFullscreen) {
        console.log("first");
        app.requestFullscreen();
    } else if (app.webkitRequestFullscreen) {
        /* Safari */
        console.log("asd");
        app.webkitRequestFullscreen();
    }

    console.log(app.requestFullscreen);
    // ----------+----------+---------- > SCREEN SETTINGS
    const screenSeetings = {
        mobile: false,
        width: 640,
        height: 400,
        padding: 40,
        asp: 16 / 9,

        color: "#00ffee",
        background_color: "#333399",
    };

    // ----------+----------+---------- > SPRITE SHEET
    const spriteSettings = {
        wall: {
            x: 0,
            y: 128,
            size: 32,
        },
        gift: {
            x: 0,
            y: 192,
            size: 64,
        },
        bc: {
            x: 0,
            y: 258,
            width: 640,
            height: 320,
        },
    };

    // ----------+----------+---------- > FONT SETTINGS
    const fontSettings = {
        font: "24px Alata",
    };

    // ----------+----------+---------- > ID
    const idSettings = {
        id: 0,
    };

    // ----------+----------+---------- > GAME RULE
    const gameRuleSettings = {
        speed: 1.5,
        level: 1,
        point: 0,
        high_point: 0,
    };

    const settings = {
        // ---------- > ID
        id: idSettings,

        // ---------- > RULE
        rule: gameRuleSettings,

        // ---------- > SCREEN
        screen: screenSeetings,

        // ---------- > FONT
        fonts: fontSettings,
        // ---------- > SPRITE SHEET
        sprite: spriteSettings,
    };

    // #region ----------+---------+----------+---------+ > CLASS
    // ---------- > CONTROLLER
    class Controller {
        // ---------- > state = ['idle', 'jump', 'die'];
        // ---------- > spam time, spam time max, time idle
        constructor() {
            this.state = "idle";
            this.spam_time_max = 51;
            this.spam_time = 1;
            this.spam_counter_max = 6;
            this.spam_counter = 6;
        }

        update() {
            this.step();
            this.draw();
        }

        step() {
            // ---------- > BEGIN
            this.spam_time--;
            if (this.spam_time < 0) {
                // ---------- > create block
                const { screen, rule } = settings;
                let _x = screen.width,
                    _y = gml.random_range(-2.5, 2.5) * 10 + canvas.height - 120,
                    _size = gml.irandom_range(2, 6),
                    _spam = 51 + (_size * 32) / rule.speed + rule.speed * 2;

                const wl = new Wall(_x, _y, _size * 32, "normal", "idle");
                __walls.push(wl);

                // ---------- > create wall point
                const wp = new WallPoint(_x + _size * 16 - 32, _y - 64);
                __wallspoint.push(wp);

                this.spam_counter--;
                if (this.spam_counter < 0) {
                    const { rule, screen } = settings;

                    // ---------- > level up
                    rule.level += 1;
                    let _point = rule.level * 100;
                    rule.point += _point;
                    let _spd = rule.speed + 0.5;
                    if (_spd > 8) {
                        _spd = 8;
                    }
                    rule.speed = _spd;

                    this.spam_counter_max += rule.level * 2;
                    this.spam_counter = this.spam_counter_max;

                    // ---------- > noti
                    let _noti1 = new Notification(
                        screen.width * 0.5 - 32,
                        100,
                        "LEVEL UP"
                    );
                    __notification.push(_noti1);
                    let _noti2 = new Notification(
                        screen.width * 0.5 - 24,
                        140,
                        "+" + _point.toString()
                    );
                    __notification.push(_noti2);
                }
                this.spam_time = _spam;
                this.spam_time_max = _spam;
            }

            // ---------- > END
        }

        draw() {
            // ---------- > SELF

            // ---------- > GUI
            // ---------- > controller state
            gml.draw_text_ext(ctx, 10, 26, this.state, "#fff");
            const { rule, screen } = settings;
            // ---------- > spam counter

            if (this.spam_counter === 0) {
                let _x1 = 10,
                    _y1 = 0,
                    _xw = screen.width - 20,
                    _xper = _xw * (this.spam_time / this.spam_time_max),
                    _yw = 2;

                ctx.fillStyle = "#fff";
                ctx.fillRect(_x1, _y1, _xper, _yw);
            }

            // ---------- > draw point
            gml.draw_text_ext(ctx, 10, 54, "high: " + rule.high_point, "#fff");
            gml.draw_text_ext(ctx, 10, 78, "score: " + rule.point, "#fff");
            gml.draw_text_ext(
                ctx,
                screen.width - 20,
                26,
                "level: " + rule.level,
                "#fff",
                "right"
            );
        }
    }

    // ---------- > PLAYER
    class Player {
        // ---------- > x, y, size = 45, jump each space press => key down true ,  key up false
        // ---------- > state = ['idle', 'jump', 'die'];
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = 16;

            this.vspd = 0;
            this.onground = false;
            // ---------- > jump
            this.grav = 0.2;
            this.jump_height = 7;
            this.jump_height_max = 10;

            // ---------- > animation
            this.image_speed = 16;
            this.image_speed_max = 16;
            this.image_index = 0;
            this.image_length = 2;
        }

        update() {
            this.step();
            this.draw();
        }

        step() {
            // ---------- > BEGIN
            this.onground = false;
            this.vspd += this.grav;

            if (this.vspd > 10) this.vspd = 10;

            if (__walls.length > 0) {
                let _onground = false;
                __walls.map((_wall) => {
                    if (
                        gml.place_metting(
                            this.x,
                            this.y + this.vspd,
                            this.size,
                            _wall.x,
                            _wall.y,
                            _wall.size
                        )
                    ) {
                        // ---------- > left
                        if (this.y + this.size > _wall.y && this.x < _wall.x) {
                            this.x = _wall.x - this.size;
                        } else {
                            this.vspd = 0;
                            _onground = true;
                            if (this.state === "onaiblock") {
                                this.y = _wall.y - this.size;
                                console.log("first");
                            } else {
                                while (
                                    !gml.place_metting(
                                        this.x,
                                        this.y + 1,
                                        this.size,
                                        _wall.x,
                                        _wall.y,
                                        _wall.size
                                    )
                                ) {
                                    this.y += 1;
                                }
                            }
                        }
                    }
                });
                if (_onground) {
                    this.onground = true;
                }
            }

            // ---------- > END
            this.y += this.vspd;

            if (this.x <= 0 || this.y > settings.screen.height) {
                this.state = "destroy";
                __controller !== "noone" && (__controller.state = "destroy");
            }
        }

        draw() {
            // ---------- > SELF
            this.image_speed--;
            if (this.image_speed < 0) {
                this.image_index++;

                if (this.image_index >= this.image_length) {
                    this.image_index = 0;
                }

                this.image_speed = this.image_speed_max;
            }

            gml.draw_sprite_ext(
                ctx,
                sprite_index,
                this.image_index * 70,
                0,
                70,
                this.x - 24,
                this.y - 48,
                64
            );
            //  gml.draw_text(ctx, this.x, this.y - 32, this.vspd.toString());
            // ctx.fillStyle = "red";
            // ctx.fillRect(this.x, this.y, this.size, this.size);
            // ---------- > GUI
        }
    }

    // ---------- > BACKGROUND
    class Background {
        // ---------- > x, y, size = random,
        // ---------- > state = ['idle', 'jump', 'destroy'];
        constructor(x, y, size, type, state) {
            this.x = x;
            this.y = y;
        }

        update() {
            this.step();
            this.draw();
        }

        step() {
            const { rule, screen } = settings;
            // ---------- > BEGIN
            this.x += rule.speed * 0.2;
            if (this.x >= screen.width) {
                this.x = 0;
            }
            // ---------- > END
        }

        draw() {
            // ---------- > SELF
            const { bc } = settings.sprite;
            let _x = this.x,
                _y = this.y;
            gml.draw_sprite_part(
                ctx,
                sprite_index,
                bc.x,
                bc.y,
                bc.width,
                bc.height,
                _x,
                _y,
                bc.width,
                bc.height
            );
            gml.draw_sprite_part(
                ctx,
                sprite_index,
                bc.x,
                bc.y,
                bc.width,
                bc.height,
                _x - bc.width,
                _y,
                bc.width + 2,
                bc.height
            );

            // ctx.fillStyle = "red";
            // ctx.fillRect(_x, _y, this.size, this.size);
        }
    }

    // ---------- > BLOCK
    class Wall {
        // ---------- > x, y, size = random,
        // ---------- > state = ['idle', 'jump', 'destroy'];
        constructor(x, y, size, type, state) {
            this.x = x;
            this.y = y;
            this.size = size;
            this.type = type;
            this.state = type;

            this.vspd = 0;
            // ---------- > jump
            this.grav = 0.05;
            this.jump_height = 0;
            this.jump_height_max = 2;
        }

        update() {
            this.step();
            this.draw();
        }

        step() {
            const { rule } = settings;
            // ---------- > BEGIN
            this.x -= rule.speed;

            // ---------- > destroy
            if (this.x + this.size < 0) {
                this.state = "destroy";
            }

            // switch (this.type) {
            //     case "normal": {
            //         // ---------- > up down random
            //         this.vspd += this.grav;
            //         if (Math.abs(this.vspd) > this.jump_height_max) {
            //             this.grav *= -1;
            //         }

            //         this.y += this.vspd;
            //         // ---------- > player stand on

            //         if (
            //             __player.x < this.x + this.size &&
            //             __player.x > this.x &&
            //             __player.y + __player.size + __player.vspd > this.y + 1
            //         ) {
            //             __player.state = "onaiblock";
            //             console.log("first");
            //         }

            //         break;
            //     }

            //     default:
            //         break;
            // }
            // ---------- > END
        }

        draw() {
            // ---------- > SELF
            const { wall } = settings.sprite;
            let _x = this.x,
                _y = this.y,
                _s = this.size / 32;

            for (let _i = 0; _i < _s; _i++) {
                gml.draw_sprite_ext(
                    ctx,
                    sprite_index,
                    wall.x,
                    wall.y,
                    wall.size,
                    _x + _i * 32,
                    _y,
                    32
                );
            }
            // ---------- > GUI
        }
    }

    // ---------- > BLOCK POINT
    class WallPoint {
        // ---------- > x, y, size = 16,
        // ---------- > state = ['idle', 'destroy'];
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = 64;
            this.state = "idle";
            this.order = gml.irandom_range(0, 7);
        }

        update() {
            this.step();
            this.draw();
        }

        step() {
            const { rule } = settings;
            // ---------- > BEGIN
            this.x -= rule.speed;

            // ---------- > destroy
            if (this.x + this.size < 0) {
                this.state = "destroy";
            }
            // ---------- > END

            if (__player !== "noone") {
                if (
                    gml.place_metting(
                        this.x,
                        this.y,
                        this.size,
                        __player.x,
                        __player.y,
                        __player.size
                    )
                ) {
                    const { rule } = settings;
                    let _point = rule.speed * 2;
                    settings.rule.point += _point;

                    if (settings.rule.high_point < settings.rule.point) {
                        settings.rule.high_point = settings.rule.point;
                        console.log("first");
                        localStorage.setItem(
                            "high_score",
                            settings.rule.high_point
                        );
                    }

                    let _noti = new Notification(
                        this.x - 24,
                        this.y - 12,
                        "+" + _point.toString()
                    );

                    __notification.push(_noti);
                    this.state = "destroy";
                }
            }
        }

        draw() {
            // ---------- > SELF
            const { gift } = settings.sprite;
            let _x = this.x,
                _y = this.y,
                _s = this.size;
            // ctx.fillStyle = "red";
            // ctx.fillRect(_x, _y, this.size, this.size);
            gml.draw_sprite_ext(
                ctx,
                sprite_index,
                gift.x + this.order * gift.size,
                gift.y,
                gift.size,
                _x,
                _y,
                _s
            );

            // ---------- > GUI
        }
    }

    // ---------- > BLOCK POINT
    class Notification {
        // ---------- > x, y, size = 16,
        // ---------- > state = ['idle', 'destroy'];
        constructor(x, y, txt) {
            this.x = x;
            this.y = y;
            this.txt = txt;
            this.time_destroy = 30;
            this.state = "idle";
        }

        update() {
            this.step();
            this.draw();
        }

        step() {
            // ---------- > BEGIN
            this.y--;
            this.time_destroy--;
            // ---------- > destroy
            if (this.time_destroy < 0) {
                this.state = "destroy";
            }
            // ---------- > END
        }

        draw() {
            // ---------- > SELF
            let _x = this.x - 4,
                _y = this.y;

            gml.draw_text_ext(ctx, _x, _y, this.txt, "#fff");
            // ---------- > GUI
        }
    }

    // #region ----------+---------+----------+---------+ > GAME START SETTINGS
    let __controller = "noone",
        __walls = [],
        __wallspoint = [],
        __player = "noone",
        __background = "noone",
        __notification = [];

    const GameSettings = () => {
        const { screen, fonts } = settings;
        let _ww = window.innerWidth;

        if (_ww < 767) {
            let _w = _ww - 100,
                _h = _w / screen.asp;

            settings.screen.width = _w;
            settings.screen.height = _h;
            settings.fonts.font = "16px Alata";
            settings.mobile = true;
        }

        // ---------- > set canvas width height

        canvas.width = screen.width;
        canvas.height = screen.height;

        ctx.font = fonts.font;

        // ---------- > click
        canvas.onclick = function () {
            if (__controller !== "noone") {
                if (__controller.state === "idle") {
                    __controller.state = "playing";
                }
                if (__controller.state === "destroy") {
                    ctx.clearRect(0, 0, 640, 400);
                    GameReset();
                    GameInit();
                    Update();
                }
                if (__controller.state === "playing") {
                    checkPress();
                }
            }
        };
    };
    GameSettings();

    // #region ----------+---------+----------+---------+ > GAME INIT

    const GameReset = () => {
        settings.id = { id: 0 };
        // ---------- > RULE
        settings.rule = {
            speed: 1.5,
            level: 1,
            point: 0,
        };
        __controller = "noone";
        __walls = [];
        __wallspoint = [];
        __player = "noone";
        __background = "noone";
        __notification = [];
    };
    // ---------- > Controller Init
    const ControllerInit = () => {
        __controller = new Controller();
    };
    // ---------- > Background Init
    const BackgroundInit = () => {
        const { screen } = settings;
        __background = new Background(0, screen.height - 300);
    };

    // ---------- > Player Init
    const PlayerInit = () => {
        const { screen } = settings;

        __player = new Player(80, screen.height - 200, 32);
    };
    // ---------- > Wall Init
    const WallInit = () => {
        const { screen } = settings;
        const wall = new Wall(0, screen.height - 80, 32 * 18);
        __walls.push(wall);
    };

    const GameInit = () => {
        const localHighScore = localStorage.getItem("high_score") || 0;
        settings.rule.high_point = localHighScore;
        // ---------- > background
        BackgroundInit();
        // ---------- > controller
        ControllerInit();

        // ---------- > player
        PlayerInit();
        // ---------- > wall
        WallInit();
    };
    GameInit();

    const checkPress = () => {
        if (__player !== "noone") {
            if (__player.onground) {
                __player.state = "jumping";
                __player.vspd -= __player.jump_height;
                __player.onground = false;
            }
        }
    };

    window.addEventListener("keydown", (e) => {
        let _keyCode = e.keyCode;
        if (_keyCode !== 32) return;
        checkPress();
    });

    const Update = () => {
        const { screen } = settings;
        let _cw = screen.width,
            _ch = screen.height;

        // ---------- > CLEAR BACKGROUND
        ctx.clearRect(0, 0, _cw, _ch);
        // -----------------------------------------> UPDATE
        // ---------- > DRAW BACKGROUND
        ctx.fillStyle = screen.background_color;
        ctx.fillRect(0, 0, _cw, _ch);

        // ---------- > CONTROLLER
        if (__controller !== "noone") {
            // ---------- > update
            __controller.update();
        }

        // ---------- > BACKGROUND
        if (__background !== "noone") {
            // ---------- > update
            __background.update();
        }

        // ---------- > WALLS
        if (__walls.length > 0) {
            // ---------- > filter
            __walls = __walls.filter((_wall) => _wall.state !== "destroy");
            // ---------- > update
            __walls.map((_wall) => _wall.update());
        }

        // ---------- > PLAYER
        if (__player !== "noone") {
            // ---------- > update
            __player.update();
        }
        // ---------- > WALLS POINT
        if (__wallspoint.length > 0) {
            // ---------- > filter
            __wallspoint = __wallspoint.filter(
                (_wall) => _wall.state !== "destroy"
            );
            // ---------- > update
            __wallspoint.map((_wall) => _wall.update());
        }
        // ---------- > NOTIFICATION
        if (__notification.length > 0) {
            // ---------- > filter
            __notification = __notification.filter(
                (_n) => _n.state !== "destroy"
            );
            // ---------- > update
            __notification.map((_n) => _n.update());
        }
    };
    Update();

    // #region --------------------------------------------------> game animate
    const animate = () => {
        if (__controller.state === "playing") {
            Update();
        }
        requestAnimationFrame(animate);
    };
    animate();

    const rule = $(".rule");
    const gameStart = $(".js_game_start");
    const gameReStart = $(".js_game_restart");
    const gamePause = $(".js_game_pause");
    const gameClear = $(".js_game_clear");
    let _isPause = false;
    gameStart.on("click", function () {
        StartButtonInit();
    });
    gamePause.on("click", function () {
        PauseButtonInit();
    });
    gameReStart.on("click", function () {
        RestartButtonInit();
    });
    gameClear.on("click", function () {
        ClearButtonInit();
        RestartButtonInit();
    });
    const StartButtonInit = () => {
        if (__controller.state !== "destroy") {
            gamePause.removeClass("hidden");
            gameStart.addClass("hidden");
            rule.addClass("hidden");
            if (_isPause) {
                __controller.state = "playing";
            } else {
                GameInit();
            }
            __controller.state = "playing";
        }
    };
    const PauseButtonInit = () => {
        if (__controller.state !== "destroy") {
            gameStart.removeClass("hidden");
            gamePause.addClass("hidden");
            __controller.state = "idle";
            _isPause = true;
        }
    };
    const RestartButtonInit = () => {
        ctx.clearRect(0, 0, 640, 400);
        GameReset();
        GameInit();
        Update();

        gameStart.removeClass("hidden");
        gamePause.addClass("hidden");
    };
    const ClearButtonInit = () => {
        localStorage.setItem("high_score", 0);
    };
})();
