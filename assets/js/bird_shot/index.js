import { settings } from "./settings.js";
import { OBJ } from "./constans.js";
import * as gml from "../gml.js";

import * as classes from "./classes.js";

//color: ["#f0488b", "#b248f0", "#48f06f", "#aff048", "#f08848"];
(function () {
    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");
    OBJ.sprite_index = document.getElementById("js_sprite");

    // #region ----------+---------+----------+---------+ > INIT
    // ----------+----------+---------- > GAME INIT
    let _rightClick = false,
        _mousex = 0,
        _mousey = 0;

    const GameSettings = () => {
        const { screen, fonts } = settings;

        // ---------- > set canvas width height
        canvas.width = screen.width;
        canvas.height = screen.height;

        ctx.font = fonts.font;
        settings.zoom = 1;

        const getHighscore = localStorage.getItem("bird_highscore");
        if (getHighscore) {
            OBJ.highscore = getHighscore;
        }

        // ---------- > right click
        canvas.oncontextmenu = function (e) {
            e.preventDefault();
            const { screen } = settings;
            if (screen.scale === 1) {
                screen.scale = 1.4;
            } else {
                screen.scale = 1;
            }

            _rightClick = !_rightClick;
        };

        // ---------- > left click
        canvas.onmousedown = function (e) {
            e.preventDefault();
            if (e.which === 1) {
                if (OBJ.firing <= 0 && OBJ.bulletAmount >= 0) {
                    let _bullet = new classes.Bullet(ctx, _mousex, _mousey);
                    OBJ.bullets.push(_bullet);

                    OBJ.bulletAmount--;
                    OBJ.firing = OBJ.firingDelay;
                }
                OBJ.autoAttack = true;
            }
        };
        canvas.onmouseup = function (e) {
            e.preventDefault();
            OBJ.autoAttack = false;
        };

        canvas.onmousemove = function (e) {
            e.preventDefault();
            _mousex = e.offsetX;
            _mousey = e.offsetY;
        };
        canvas.onmouseleave = function (e) {
            e.preventDefault();
            _mousex = 0;
            _mousey = 0;
            OBJ.autoAttack = false;
        };

        let _bc = gml.choice(0, 1),
            _y = OBJ.backgroundImage.y;
        if (_bc) {
            _y = 1567;
        }
        OBJ.o_background = new classes.BackgroundImage(ctx, _y);
    };
    GameSettings();

    const BirdInit = () => {
        const { screen } = settings;
        const { birds } = OBJ;
        // for (let i = 0; i < spamSpawn; i++) {
        let _xOry = gml.choice(0, 1),
            _lOrr = gml.choice(-1, 1),
            _spr = gml.choice(0, 2, 4),
            _xy = gml.random_range(0, screen.width),
            _size = gml.irandom_range(20, 50),
            _speedx = gml.random_range(0.5, 2),
            _speedy = gml.random_range(0.5, 2);

        if (_speedx === 0) {
            _speedx = 1;
        }
        if (_speedy === 0) {
            _speedy = 1;
        }
        let _dir = 1;
        if (_speedx * _lOrr < 0) {
            _dir = -1;
        }
        if (_xOry === 0) {
            // ---------- > x left right, y random

            let _x = screen.width * (0.5 + 0.5 * _lOrr) + _size * _lOrr;
            let _bird = new classes.Bird(
                ctx,
                _x,
                _xy,
                _size,
                _speedx * -_lOrr,
                _speedy,
                _lOrr,
                _spr
            );
            birds.push(_bird);
        } else {
            // ---------- > x random, y top bottom

            let _y = screen.width * (0.5 + 0.5 * _lOrr) + _size * _lOrr;
            let _bird = new classes.Bird(
                ctx,
                _xy,
                _y,
                _size,
                _speedx,
                _speedy * -_lOrr,
                _dir * -_lOrr,
                _spr
            );
            birds.push(_bird);
        }
        // }
    };
    // const GameInit = () => {
    //     BirdInit();
    // };
    //GameInit();
    // ----------+----------+---------- > Update

    const Update = () => {
        const { screen } = settings;
        const {
            birds,
            bullets,
            autoAttack,
            bulletAmount,
            spamCounterMax,
            bloods,
            score,
            highscore,
            o_background,
        } = OBJ;

        let _cw = canvas.width,
            _ch = canvas.height;

        ctx.globalCompositeOperation = "source-over";
        ctx.clearRect(0, 0, _cw, _ch);

        // -----------------------------------------> UPDATE
        // ---------- > draw sky background
        // ctx.fillStyle = screen.background_color;
        // ctx.fillRect(0, 0, _cw, _ch);

        if (o_background !== "noone") {
            let _x = _mousex - screen.width * 0.5,
                _y = 0;
            if (screen.scale !== 1) {
                _x = _mousex;
                _y = _mousey;
            }
            o_background.x = _x;
            o_background.y = _y;
            o_background.update();
        }
        if (OBJ.spamCounter <= 0) {
            OBJ.spamMili--;
            if (OBJ.spamMili < 0) {
                BirdInit();
                OBJ.spamSpawn--;
                if (OBJ.spamSpawn < 0) {
                    OBJ.spamSpawn = 10;
                    OBJ.spamCounter = spamCounterMax;
                }
                OBJ.spamMili = 20;
            }
        } else {
            OBJ.spamCounter--;
        }
        if (OBJ.firing <= 0 && bulletAmount >= 0) {
            if (autoAttack) {
                let _bullet = new classes.Bullet(ctx, _mousex, _mousey);
                OBJ.bullets.push(_bullet);

                OBJ.firing = OBJ.firingDelay;
                OBJ.bulletAmount--;
            }
        } else {
            OBJ.firing -= 1;
        }
        ctx.save();
        // ----------+----------+---------- > controller

        if (birds.length !== 0) {
            OBJ.birds = birds.filter((bird) => bird.state !== "destroy");
            birds.map((bird) => bird.update());
        }
        if (bloods.length !== 0) {
            OBJ.bloods = bloods.filter((blood) => blood.state !== "destroy");
            bloods.map((blood) => blood.update());
        }

        if (bullets.length !== 0) {
            OBJ.bullets = bullets.filter(
                (bullet) => bullet.state !== "destroy"
            );
            bullets.map((bullet) => bullet.update());
        }
        if (_rightClick) {
            ctx.beginPath();

            gml.draw_sprite_ext(
                ctx,
                OBJ.sprite_index,
                64,
                0,
                256,
                _mousex - 128,
                _mousey - 128,
                256
            );
            ctx.globalCompositeOperation = "destination-in";
            ctx.fillStyle = "#fff";

            ctx.arc(_mousex, _mousey, 128, 0, 2 * Math.PI, false);
            ctx.fill();

            ctx.closePath();
        } else {
            gml.draw_sprite_ext(
                ctx,
                OBJ.sprite_index,
                0,
                0,
                64,
                _mousex - 32,
                _mousey - 32,
                64
            );
        }

        ctx.restore();
        // ---------- > draw bullet
        gml.draw_text(
            ctx,
            10,
            30,
            "Bullet: " + bulletAmount.toString(),
            "#fff"
        );
        gml.draw_text(
            ctx,
            10,
            60,
            "Birds: " + birds.length.toString() + "/14",
            "#fff"
        );
        gml.draw_text(ctx, 10, 90, "Score: " + score.toString(), "#fff");
        gml.draw_text(
            ctx,
            10,
            120,
            "High Score: " + highscore.toString(),
            "#fff"
        );

        if (OBJ.birds.length > 14 || OBJ.bulletAmount <= 0) {
            OBJ.state = "destroy";
        }
    };

    // #region --------------------------------------------------> game animate
    const animate = () => {
        Update();

        if (OBJ.state === "playing") {
            requestAnimationFrame(animate);
        }
        if (OBJ.state === "destroy") {
            const { screen } = settings;
            ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
            ctx.fillRect(0, 0, screen.width, screen.height);

            gml.draw_text(ctx, screen.width * 0.5 - 16, 260, "End", "#fff");
            gml.draw_text(
                ctx,
                screen.width * 0.5 - 60,
                300,
                "Your score: " + OBJ.score.toString(),
                "#fff"
            );
        }
    };
    animate();

    const buttonStart = document.querySelector(".js_game_start");
    const rule = document.querySelector(".rule");
    buttonStart.onclick = function () {
        if (OBJ.state !== "playing") {
            OBJ.state = "playing";
            animate();

            buttonStart.classList.add("hidden");
            rule.classList.add("hidden");
        }
    };
})();
