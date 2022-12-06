import { settings } from "./settings.js";
import { o } from "./constans.js";
import * as gml from "../gml.js";
const pi = 3.14;

//color: ["#f0488b", "#b248f0", "#48f06f", "#aff048", "#f08848"];
(function () {
    const HIGHSCORE = "game1_space__highscore";
    const ENEMY_TYPE = [
        "none",
        "none",
        "none",
        "none",
        "none",
        "none",
        "random",
        "random",
    ];
    const ENEMY_MODE = [
        "none",
        "none",
        "none",
        "none",
        "none",
        "boom",
        "boom",
        "boom_bigger",
    ];

    const PLAYER_MODE = [
        "none",
        "straight3",
        "straight5",
        "straight7",
        "multi3",
        "multi5",
        "multi9",
    ];
    const PLAYER_TYPE = ["none", "boom", "boom_bigger"];

    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");
    o.sprite_index = document.getElementById("js_sprite");

    const create_instance_blood = (x, y, amount) => {
        for (let _i = 0; _i < amount; _i++) {
            const blood = new Blood(x, y);
            o.bloods.push(blood);
        }
    };

    const create_instance_enemy = (x, hp, type, mode, size) => {
        const enemy = new Enemys(
            settings.counter.id,
            x,
            -40,
            hp,
            type,
            mode,
            size
        );

        o.enemys.push(enemy);
        settings.counter.id++;
    };
    const create_instance_enemy_boss = (hp) => {
        let _size = gml.irandom_range(20, 40);
        const enemy = new EnemyBoss(settings.counter.id, hp, _size);

        o.enemys.push(enemy);
        settings.counter.id++;
    };

    const create_instance_item = (x, y) => {
        let _mode = gml.choice(0, 1);
        if (_mode) {
            // ---------- > create mode
            let _mode = PLAYER_MODE[gml.irandom_range(0, PLAYER_MODE.length)];
            const item = new Items(x, y, "mode", _mode);
            o.items.push(item);
        } else {
            // ---------- > creat cast
            let _cast = PLAYER_TYPE[gml.irandom_range(0, PLAYER_TYPE.length)];
            const item = new Items(x, y, "cast", _cast);
            o.items.push(item);
        }
    };

    // #region ----------+---------+----------+---------+ > INIT
    // ----------+----------+---------- > GAME INIT
    let _mx = 272 - 30 * 0.5,
        _my = 444;

    class Button {
        constructor(x, y, type, text) {
            this.x = x;
            this.y = y;
            this.w = 160;
            this.h = 60;

            this.type = type;
            this.text = text;
            this.is_clicked = false;
        }
        update() {
            this.step();
            this.draw();
        }
        step() {
            if (this.is_clicked) {
                switch (this.type) {
                    case "play": {
                        const { stage } = o;
                        stage.state = "change_stage";
                        break;
                    }
                    default:
                        break;
                }

                this.is_destroy = true;
            }
        }
        draw() {
            ctx.fillStyle = "#08c6d4";
            ctx.fillRect(this.x, this.y, this.w, this.h);
            gml.draw_text_ext(
                ctx,
                this.x + this.w * 0.5,
                this.y + this.h * 0.5,
                this.text,
                "#fff",
                "center"
            );
        }
    }

    class Stage {
        constructor() {
            this.level = 1;

            this.spawn = 3;
            this.time_spawn = 20;
            this.spawn_at_time = 1;
            this.spawn_repeat = 5;
            this.enemy_hp = 4;

            this.score = 0;
            this.highscore = 0;

            this.state = "idle";
            this.is_prepare = false;
            this.time_break = 100;
            this.next_level = false;
        }

        reset() {
            this.level = 1;

            this.spawn = 3;
            this.time_spawn = 20;
            this.spawn_at_time = 1;
            this.spawn_repeat = 5;
            this.enemy_hp = 4;

            this.score = 0;

            this.state = "idle";
            this.is_prepare = false;
            this.time_break = 100;
            this.next_level = false;
        }
        update() {
            this.step();
            this.draw();
        }

        step() {
            if (this.state === "change_stage") {
                this.time_break--;
                this.next_level = false;
                if (this.time_break < 0) {
                    this.state = "ready";
                    this.time_break = 100;
                }
            }

            if (this.state === "ready") {
                if (this.spawn > 0) {
                    this.time_spawn--;
                    if (this.time_spawn < 0) {
                        if (this.level % 2 === 0) {
                            create_instance_enemy_boss(40 + this.level * 40);

                            this.spawn = 0;
                        } else {
                            const { w, pad } = settings.camera;
                            // ---------- > create enemy
                            this.spawn--;

                            let _x = gml.irandom_range(pad, w - pad),
                                _i = this.level * 0.5;
                            if (_i > 3) _i == 3;
                            let _type =
                                    ENEMY_TYPE[
                                        gml.irandom_range(_i, ENEMY_TYPE.length)
                                    ],
                                _mode =
                                    ENEMY_MODE[
                                        gml.irandom_range(_i, ENEMY_MODE.length)
                                    ];

                            let _size = 22 - this.level;
                            if (_size < 10) _size = 10;
                            create_instance_enemy(
                                _x,
                                this.level * 4,
                                _type,
                                _mode,
                                _size
                            );
                        }
                        this.time_spawn = 20;
                    }
                } else {
                    this.next_level = true;
                }
            }

            if (this.state === "endgame") {
                const { camera } = settings;
                if (!this.is_prepare) {
                    let _starButtonX = camera.w * 0.5 - 80,
                        _starButtonY = camera.h * 0.5 + 100;

                    const startButton = new Button(
                        _starButtonX,
                        _starButtonY,
                        "play",
                        "Click to play"
                    );
                    o.buttons.push(startButton);

                    // ---------- > reset all
                    o.items = [];
                    o.enemys = [];
                    o.bullets = [];
                    o.enemy_bullets = [];
                    o.bloods = [];

                    this.is_prepare = true;
                }
            }

            if (this.next_level && o.enemys.length === 0) {
                console.log("first");
                this.level++;
                this.spawn = this.level + 4;
                if (this.spawn > 30) {
                    this.spawn = 30;
                }

                // ---------- > bonus
                o.playerweapon.firing_delay -= 0.5;
                o.playerweapon.atk++;
                if (o.playerweapon.firing_delay < 3) {
                    o.playerweapon.firing_delay = 3;
                }

                this.state = "change_stage";
            }
        }
        draw() {
            const { camera } = settings;
            let _y = camera.h;
            gml.draw_text_ext(ctx, 10, 56, this.level, "#fff");
            gml.draw_text_ext(ctx, 10, _y - 60, "state " + this.state, "#fff");
            gml.draw_text_ext(ctx, 10, _y - 40, "Score " + this.score, "#fff");
            gml.draw_text_ext(
                ctx,
                10,
                _y - 20,
                "HighScore " + this.highscore,
                "#fff"
            );

            if (this.state === "change_stage") {
                ctx.save();
                ctx.font = settings.font.stage;
                let _cx = camera.w * 0.5,
                    _cy = camera.h * 0.55;
                gml.draw_text_ext(
                    ctx,
                    _cx,
                    _cy,
                    "STAGE " + this.level,
                    "#fff",
                    "center"
                );
                ctx.restore();
            }
            if (this.state === "endgame") {
                ctx.save();
                ctx.font = settings.font.stage;
                let _cx = camera.w * 0.5,
                    _cy = camera.h * 0.55;
                gml.draw_text_ext(ctx, _cx, _cy, "LOSE", "#fff", "center");
                ctx.restore();
                gml.draw_text_ext(
                    ctx,
                    _cx,
                    _cy + 30,
                    "Your score " + this.score,
                    "#fff",
                    "center"
                );
            }
        }
    }

    class Player {
        constructor() {
            this.x = 272 - 30 * 0.5;
            this.y = 444;

            this.hp = 15;
            this.hp_max = 15;

            this.state = "idle";

            this.size = 16;

            this.mode = "none";

            this.can_take_dmg = true;
            this.time_take_dmg = 12;

            this.is_destroy = false;
            this.time_destroy = 60;
        }

        reset() {
            this.x = 272 - 30 * 0.5;
            this.y = 444;

            this.hp = 10;

            this.state = "idle";

            this.mode = "none";

            this.can_take_dmg = true;
            this.time_take_dmg = 12;

            this.is_destroy = false;
            this.time_destroy = 60;
        }
        update() {
            this.step();
            this.draw();
        }

        step() {
            if (this.state === "idle") {
                let _xto = _mx - this.x,
                    _yto = _my - this.y;

                this.x += _xto * 0.2;
                this.y += _yto * 0.2;

                if (!this.can_take_dmg) {
                    this.time_take_dmg--;
                    if (this.time_take_dmg < 0) {
                        this.can_take_dmg = true;
                        this.time_take_dmg = 12;
                    }
                }
            }
            if (this.is_destroy) {
                this.time_destroy--;
                if (this.time_destroy < 0) {
                    o.stage.state = "endgame";
                }
            }
        }

        draw() {
            // ---------- > draw hp
            for (let i = 0; i < this.hp_max; i++) {
                let _x = 10 + i * 16,
                    _y = 10,
                    _rgb = `rgb(210, 210, ${110 + i * 10} )`;
                if (this.hp < i) {
                    _rgb = "#023d4f";
                }
                ctx.fillStyle = _rgb;
                ctx.fillRect(_x, _y, 6, 24);
            }
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = "#10b2e3";
            ctx.fill();

            ctx.closePath();
        }
    }

    class PlayerWeapon {
        constructor() {
            this.state = "idle";

            this.firing_mode = "none";
            this.firing_cast = "none";

            this.atk = 1;
            this.bullet_size = 4;
            // none straight2 3 4 || multi degree 3 5 || direction
            this.firing = 4;
            this.firing_delay = 10;
            this.multi_degree = 15;
        }
        reset() {
            this.state = "idle";
            this.firing_mode = "none";
            this.firing_cast = "none";
            this.atk = 1;
            this.bullet_size = 4;
            this.firing = 4;
            this.firing_delay = 10;
        }
        update() {
            this.step();
            this.draw();
        }

        step() {
            this.firing--;
            if (this.firing < 0) {
                const { x, y, size } = o.player;
                let _cy = y + size * 0.5;

                this.bullet_size = 4;
                if (this.firing_cast === "boom") {
                    this.bullet_size = 8;
                }
                if (this.firing_cast === "boom_bigger") {
                    this.bullet_size = 12;
                }

                switch (this.firing_mode) {
                    case "none": {
                        for (let i = -1; i <= 1; i += 2) {
                            let _x = x + i * size,
                                _bullet = new Bullet(
                                    _x,
                                    _cy,
                                    this.atk,
                                    "none",
                                    0,
                                    10,
                                    this.bullet_size
                                );
                            o.bullets.push(_bullet);
                        }
                        break;
                    }

                    case "straight3": {
                        this.createstraight(1);
                        break;
                    }

                    case "straight5": {
                        this.createstraight(2);
                        break;
                    }

                    case "straight7": {
                        this.createstraight(3);
                        break;
                    }

                    case "multi3": {
                        this.createmulti(1);
                        break;
                    }

                    case "multi5": {
                        this.createmulti(2);
                        break;
                    }

                    case "multi9": {
                        this.createmulti(4);
                        break;
                    }

                    default:
                        break;
                }

                this.firing = this.firing_delay;
            }
        }

        createmulti(e) {
            const { x, y, size } = o.player;
            let _cy = y + size * 0.5;

            for (let i = -e; i <= e; i++) {
                let _deg = -180 + 90 + i * this.multi_degree,
                    _spdx = 10 * Math.cos((_deg * pi) / 180),
                    _spdy = -10 * Math.sin((_deg * pi) / 180);

                const bullet = new Bullet(
                    x,
                    _cy,
                    this.atk,
                    "none",
                    _spdx,
                    _spdy,
                    this.bullet_size
                );
                o.bullets.push(bullet);
            }
        }

        createstraight(e) {
            const { x, y, size } = o.player;

            for (let i = -e; i <= e; i++) {
                let _x = x + i * (size + 5 * e),
                    _y = y + i * size;
                if (i < 0) {
                    _y = y + -i * size;
                }
                const bullet = new Bullet(
                    _x,
                    _y,
                    this.atk,
                    "none",
                    0,
                    10,
                    this.bullet_size
                );
                o.bullets.push(bullet);
            }
        }

        draw() {
            const { w, h, pad } = settings.camera;
            gml.draw_text_ext(
                ctx,
                w - pad,
                h - 40,
                "ATK: " + this.atk,
                "#fff",
                "right"
            );

            let _asp = (60 / this.firing_delay) | 0;
            gml.draw_text_ext(
                ctx,
                w - pad,
                h - 20,
                "ASP: " + _asp,
                "#fff",
                "right"
            );
        }
    }

    class Items {
        constructor(x, y, type, mode) {
            this.x = x;
            this.y = y;

            this.type = type;
            this.mode = mode;

            this.size = 24;
            // none straight2 3 4 || multi degree 3 5 || direction
            this.falling = true;
            this.falling_y = gml.random_range(100, 400);

            this.time_destroy = 120;
            this.is_destroy = false;
        }

        update() {
            this.step();
            this.draw();
        }

        step() {
            this.time_destroy--;
            if (this.time_destroy < 0) {
                this.is_destroy = true;
            }
            if (this.y < this.falling_y) {
                this.y++;
            }
            const { x, y, size } = o.player;
            if (gml.point_distance(this.x, this.y, x, y) < size + this.size) {
                switch (this.type) {
                    case "cast": {
                        o.playerweapon.firing_cast = this.mode;
                        break;
                    }
                    case "mode": {
                        o.playerweapon.firing_mode = this.mode;

                        break;
                    }

                    default:
                        break;
                }
                this.is_destroy = true;
            }
        }

        draw() {
            ctx.fillStyle = "#d4084c";
            ctx.fillRect(this.x, this.y, this.size, this.size);

            gml.draw_text(ctx, this.x, this.y - 32, this.mode);
        }
    }

    class Bullet {
        // ---------- > time, size, speed
        constructor(x, y, atk, type, hspd, vspd, size) {
            this.x = x;
            this.y = y;
            this.atk = atk;

            this.type = type;

            this.size = size;
            this.hspd = hspd;
            this.vspd = vspd;

            this.is_destroy = false;
        }

        update() {
            this.step();
            this.draw();
        }
        step() {
            switch (this.type) {
                case "none": {
                    this.x += this.hspd;
                    this.y -= this.vspd;
                    if (this.y < 0) {
                        this.is_destroy = true;
                    }
                    break;
                }

                default:
                    break;
            }

            const { enemys } = o;
            for (let i = 0; i < enemys.length; i++) {
                let enemy = enemys[i];
                if (
                    gml.point_distance(this.x, this.y, enemy.x, enemy.y) <
                    this.size + enemy.size
                ) {
                    if (enemy.can_take_dmg) {
                        enemy.can_take_dmg = false;
                        enemy.hp -= this.atk;
                        if (enemy.hp <= 0) {
                            let _rd = gml.irandom_range(3, 6);
                            create_instance_blood(this.x, this.y, _rd);

                            o.stage.score += o.stage.level;
                            if (o.stage.score > o.stage.highscore) {
                                o.stage.highscore = o.stage.score;
                                localStorage.setItem(
                                    HIGHSCORE,
                                    o.stage.highscore
                                );
                            }

                            if (enemy.create_item >= 4) {
                                create_instance_item(this.x, this.y);
                            }
                            enemy.is_destroy = true;
                        }
                    }

                    this.is_destroy = true;
                }
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = "#10b2e3";
            ctx.fill();

            ctx.closePath();
        }
    }

    class Enemys {
        constructor(id, x, y, hp, type, mode, size) {
            this.state = "idle";
            this.id = id;
            this.x = x;
            this.y = y;

            this.hp = hp;

            this.type = type;
            this.mode = mode;

            this.size = size;

            this.bullet_size = 4;
            this.bullet_speed = 2;
            // none straight2 3 4 || multi degree 3 5 || direction
            this.falling = true;
            this.falling_y = gml.random_range(250, 400);
            this.is_destroy = false;

            this.can_take_dmg = true;
            this.time_take_dmg = 12;

            // ---------- > random
            this.firing = 0;
            this.firing_random = 4;
            this.random_counter = 3;

            this.create_item = gml.irandom_range(1, 5);
        }

        update() {
            this.step();
            this.draw();
        }

        step() {
            if (this.state === "idle") {
                this.y++;

                if (this.y > this.falling_y) {
                    this.state = "attacking";
                }
            }

            const { x, y, size, can_take_dmg } = o.player;
            const { enemys } = o;
            for (let i = 0; i < enemys.length; i++) {
                let enemy = enemys[i];
                if (enemy.id !== this.id) {
                    if (
                        this.y + this.size + 10 > enemy.y &&
                        this.x + this.size > enemy.x &&
                        this.x < enemy.x + enemy.size
                    ) {
                        this.state = "attacking";
                    } else {
                        if (this.y < this.falling_y) {
                            this.state = "idle";
                        }
                    }
                }
            }

            if (gml.point_distance(this.x, this.y, x, y) < size + this.size) {
                if (can_take_dmg) {
                    o.player.hp--;
                    if (o.player.hp <= 0) {
                        o.player.is_destroy = true;
                    }
                    o.player.can_take_dmg = false;
                }
                if (this.can_take_dmg) {
                    this.hp--;
                    if (this.hp <= 0) {
                        this.is_destroy = true;
                    }
                    this.can_take_dmg = false;
                }
            }

            if (!this.can_take_dmg) {
                this.time_take_dmg--;
                if (this.time_take_dmg < 0) {
                    this.can_take_dmg = true;
                    this.time_take_dmg = 12;
                }
            }

            this.bullet_size = 4;
            if (this.mode === "boom") {
                this.bullet_size = 8;
            }
            if (this.mode === "boom_bigger") {
                this.bullet_size = 12;
            }

            let _cy = this.y + size * 0.5;
            // if (this.state === "attacking") {
            switch (this.type) {
                case "none": {
                    this.firing--;
                    if (this.firing < 0) {
                        const bullet = new EnemysBullet(
                            this.x,
                            _cy,
                            "none",
                            0,
                            this.bullet_speed,
                            this.bullet_size
                        );
                        o.enemy_bullets.push(bullet);

                        this.firing = 120;
                    }
                    break;
                }

                case "random": {
                    this.firing_random--;
                    if (this.firing_random < 0) {
                        this.firing--;
                        if (this.firing < 0 && this.random_counter > 0) {
                            let _deg = gml.irandom_range(0, 180),
                                _spdx =
                                    this.bullet_speed *
                                    Math.cos((_deg * pi) / 180),
                                _spdy =
                                    this.bullet_speed *
                                    Math.sin((_deg * pi) / 180);
                            const bullet = new EnemysBullet(
                                this.x,
                                _cy,
                                "none",
                                _spdx,
                                _spdy,
                                this.bullet_size
                            );
                            o.enemy_bullets.push(bullet);

                            this.firing = 4;
                            this.random_counter--;
                            if (this.random_counter === 0) {
                                this.firing_random = 60;
                                this.random_counter = gml.irandom_range(3, 10);
                            }
                        }
                    }

                    break;
                }

                default:
                    break;
            }
            // }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = "red";
            ctx.fill();

            ctx.closePath();
            gml.draw_text(ctx, this.x, this.y - 32, this.hp);
        }
    }

    class EnemyBoss {
        constructor(id, hp, size) {
            this.state = "idle";
            this.state_timing = 120;
            this.x = 200;
            this.y = 200;

            this.id = id;
            this.hp = hp;

            this.size = size;
            this.hspd = 0.5;
            this.vspd = 0.5;

            this.bullet_size = 6;
            this.bullet_speed = 3;

            this.is_destroy = false;

            this.can_take_dmg = true;
            this.time_take_dmg = 12;

            // ---------- > random
            this.firing = 0;
            this.firing_random = 4;
            this.random_counter = 3;
        }

        update() {
            this.step();
            this.draw();
        }

        step() {
            if (this.state === "destroy") {
                this.is_destroy = true;
            }

            if (this.state === "idle") {
                this.state_timing--;

                if (this.state_timing < 0) {
                    this.state = "moving";
                    this.type = gml.choice("none", "random", "blabla");
                    this.state_timing = gml.irandom_range(100, 200);
                }
            }

            if (this.state === "moving") {
                const { camera } = settings;
                this.state_timing--;

                if (this.x <= camera.pad || this.x + this.size >= camera.w)
                    this.hspd *= -1;
                if (this.y <= camera.pad || this.y + this.size >= camera.w)
                    this.vspd *= -1;

                this.x += this.hspd;
                this.y += this.vspd;

                if (this.state_timing < 0) {
                    this.state = "idle";
                    this.state_timing = 120;
                }
            }

            const { x, y, size, can_take_dmg } = o.player;
            if (gml.point_distance(this.x, this.y, x, y) < size + this.size) {
                if (can_take_dmg) {
                    o.player.hp -= 2;
                    if (o.player.hp <= 0) {
                        o.player.is_destroy = true;
                    }
                    o.player.can_take_dmg = false;
                }
                if (this.can_take_dmg) {
                    this.hp--;
                    if (this.hp <= 0) {
                        this.state = "destroy";
                    }
                    this.can_take_dmg = false;
                }
            }

            if (!this.can_take_dmg) {
                this.time_take_dmg--;
                if (this.time_take_dmg < 0) {
                    this.can_take_dmg = true;
                    this.time_take_dmg = 12;
                }
            }

            let _cy = this.y + size * 0.5;
            // if (this.state === "attacking") {
            switch (this.type) {
                case "none": {
                    this.firing--;
                    if (this.firing < 0) {
                        const bullet = new EnemysBullet(
                            this.x,
                            _cy,
                            "none",
                            0,
                            this.bullet_speed,
                            this.bullet_size
                        );
                        o.enemy_bullets.push(bullet);

                        this.firing = 120;
                    }
                    break;
                }

                case "random": {
                    this.firing_random--;
                    if (this.firing_random < 0) {
                        this.firing--;
                        if (this.firing < 0 && this.random_counter > 0) {
                            let _deg = gml.irandom_range(0, 180),
                                _spdx =
                                    this.bullet_speed *
                                    Math.cos((_deg * pi) / 180),
                                _spdy =
                                    this.bullet_speed *
                                    Math.sin((_deg * pi) / 180);
                            const bullet = new EnemysBullet(
                                this.x,
                                _cy,
                                "none",
                                _spdx,
                                _spdy,
                                this.bullet_size
                            );
                            o.enemy_bullets.push(bullet);

                            this.firing = 4;
                            this.random_counter--;
                            if (this.random_counter === 0) {
                                this.firing_random = 60;
                                this.random_counter = gml.irandom_range(3, 10);
                            }
                        }
                    }

                    break;
                }

                default:
                    break;
            }
            // }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = "red";
            ctx.fill();

            ctx.closePath();
            gml.draw_text(ctx, this.x, this.y - 32, this.hp);
        }
    }

    class EnemysBullet {
        // ---------- > time, size, speed
        constructor(x, y, type, hspd, vspd, size) {
            this.x = x;
            this.y = y;

            this.type = type;

            this.size = size;
            this.hspd = hspd;
            this.vspd = vspd;

            this.is_destroy = false;
        }

        update() {
            this.step();
            this.draw();
        }
        step() {
            switch (this.type) {
                case "none": {
                    this.x += this.hspd;
                    this.y += this.vspd;
                    if (
                        this.y < 0 ||
                        this.x < 0 ||
                        this.x > canvas.width ||
                        this.y > canvas.height
                    ) {
                        this.is_destroy = true;
                    }
                    break;
                }

                default:
                    break;
            }
            const { player } = o;
            if (
                gml.point_distance(this.x, this.y, player.x, player.y) <
                this.size + player.size
            ) {
                if (player.can_take_dmg) {
                    player.can_take_dmg = false;
                    player.hp--;
                    if (player.hp <= 0) {
                        let _rd = gml.irandom_range(3, 6);
                        create_instance_blood(this.x, this.y, _rd);

                        player.is_destroy = true;
                    }
                }

                this.is_destroy = true;
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = "red";
            ctx.fill();

            ctx.closePath();
        }
    }

    class Blood {
        constructor(x, y) {
            this.x = x;
            this.y = y;

            this.vspd = 0;

            this.speedx = gml.random_range(-3, 3);
            this.speedy = gml.random_range(-4, -2);

            this.color = "#ff66c4";
            this.size = gml.irandom_range(4, 10);

            this.is_destroy = false;
        }

        update() {
            this.step();
            this.draw();
        }
        step() {
            this.vspd += 0.12;
            this.x += this.speedx;
            this.y += this.speedy + this.vspd;
            this.size -= 0.04;

            if (this.size < 0.5 || this.x < 0 || this.y > canvas.width) {
                this.is_destroy = true;
            }
        }

        draw() {
            // ---------- > DRAW TEXT
            gml.draw_circle(ctx, this.x, this.y, this.size, this.color);
        }
    }

    const GameSetting = () => {
        const { camera, font } = settings;
        // ---------- > set canvas width height
        canvas.width = camera.w;
        canvas.height = camera.h;

        ctx.font = font.normal;
    };
    GameSetting();

    const GameInit = () => {
        const { camera } = settings;

        o.stage = new Stage();
        const highscore = localStorage.getItem(HIGHSCORE);
        if (highscore) {
            o.stage.highscore = highscore;
        }
        o.player = new Player();
        o.playerweapon = new PlayerWeapon();
        o.playerweapon = new PlayerWeapon();

        let _starButtonX = camera.w * 0.5 - 80,
            _starButtonY = camera.h * 0.5 - 20;

        const startButton = new Button(
            _starButtonX,
            _starButtonY,
            "play",
            "Click to play"
        );
        o.buttons.push(startButton);

        canvas.onmousemove = function (e) {
            e.preventDefault();
            _mx = e.offsetX;
            _my = e.offsetY;
        };
        canvas.onclick = function (e) {
            e.preventDefault();
            const { buttons } = o;
            for (let i = 0; i < buttons.length; i++) {
                const button = buttons[i];
                if (
                    _mx > button.x &&
                    _my > button.y &&
                    _mx < button.x + button.w &&
                    _my < button.y + button.h
                ) {
                    button.is_clicked = true;
                }
            }
        };
    };
    GameInit();

    // ----------+----------+---------- > Update

    const Update = () => {
        const {
            stage,
            player,
            playerweapon,
            bullets,
            items,
            enemys,
            enemy_bullets,
            bloods,
            buttons,
        } = o;

        let _cw = canvas.width,
            _ch = canvas.height;

        ctx.clearRect(0, 0, _cw, _ch);

        // -----------------------------------------> UPDATE
        // ---------- > draw sky background
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, _cw, _ch);

        // ctx.save();
        // ----------+----------+---------- > controller
        stage.update();
        for (let i = 0; i < buttons.length; i++) {
            const button = buttons[i];
            if (button.is_destroy) {
                o.buttons.splice(i, 1);
                i--;
            } else {
                button.update();
            }
        }

        if (stage.state === "ready") {
            for (let i = 0; i < enemys.length; i++) {
                const enemy = enemys[i];
                if (enemy.is_destroy) {
                    let _rd = gml.irandom_range(3, 6);
                    create_instance_blood(enemy.x, enemy.y, _rd);
                    o.enemys.splice(i, 1);
                    i--;
                } else {
                    enemy.update();
                }
            }

            for (let i = 0; i < enemy_bullets.length; i++) {
                const bullet = enemy_bullets[i];
                if (bullet.is_destroy) {
                    o.enemy_bullets.splice(i, 1);
                    i--;
                } else {
                    bullet.update();
                }
            }

            player.update();
            playerweapon.update();

            for (let i = 0; i < bullets.length; i++) {
                const bullet = bullets[i];
                if (bullet.is_destroy) {
                    let _rd = gml.irandom_range(3, 6);
                    create_instance_blood(_rd);
                    o.bullets.splice(i, 1);
                    i--;
                } else {
                    bullet.update();
                }
            }

            for (let i = 0; i < bloods.length; i++) {
                const blood = bloods[i];
                if (blood.is_destroy) {
                    o.bloods.splice(i, 1);
                    i--;
                } else {
                    blood.update();
                }
            }

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.is_destroy) {
                    o.items.splice(i, 1);
                    i--;
                } else {
                    item.update();
                }
            }
        }
        // console.log(bullets.length);
        // ctx.restore();
        // ---------- > draw bullet
    };

    // #region --------------------------------------------------> game animate
    const animate = () => {
        Update();
        requestAnimationFrame(animate);
    };
    animate();
})();
