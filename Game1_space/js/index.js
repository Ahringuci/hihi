import { settings } from "./settings.js";
import {
    o,
    enemys_line,
    sprites,
    animations,
    supports,
    stages,
} from "./constans.js";

import {
    draw_sprite_part,
    draw_sprite_part_ext,
    irandom_range,
    draw_text_ext,
    point_distance,
    draw_text,
    mouse_inside,
} from "./gml.js";
const pi = 3.14;
const defaults = {
    size: 16,
    eline: [
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
        "i",
        "j",
        "k",
        "az",
        "bz",
        "cz",
        "dz",
        "ez",
        "fz",
        "heart",
        "diamond",
        "spade",
    ],
};

//color: ["#f0488b", "#b248f0", "#48f06f", "#aff048", "#f08848"];
(function () {
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
    const sprite_index = document.getElementById("sprite_index");

    const game_save = () => {
        let _x = JSON.stringify(stages.data);
        localStorage.setItem("game1_map", _x);
    };
    const game_load = () => {
        const map_load = localStorage.getItem("game1_map");
        if (map_load) {
            stages.data = JSON.parse(map_load);
        }
    };

    const create_enemy_line = (order, arr, hp) => {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === 1) {
                let _dx = defaults.size * 2 + 54,
                    _dy = defaults.size * 2 + 26,
                    _id = settings.counter.id,
                    _x = 100 + _dx * i,
                    _y = defaults.size * -1.5,
                    _hp = hp,
                    _y_target = 60 + _dy * order,
                    _type = "none",
                    _mode = "mode",
                    _size = defaults.size;
                const enemy = new Enemys(
                    _id,
                    _x,
                    _y,
                    _hp,
                    _y_target,
                    _type,
                    _mode,
                    _size
                );
                o.enemys.push(enemy);

                settings.counter.id++;
            }
        }
        console.log("create enemy line is success");
    };

    const create_instance_enemy_boss = (hp) => {
        let _size = irandom_range(20, 40);
        const enemy = new EnemyBoss(settings.counter.id, hp, _size);

        o.enemys.push(enemy);
        settings.counter.id++;
    };
    const create_player = (sprite) => {
        let _sprite = sprites[sprite];
        o.player = new Player(_sprite);
        o.playerweapon = new PlayerWeapon(_sprite);
    };
    const create_map_item = () => {
        let _row = 0,
            _col = 0;

        const { data } = stages;
        for (let i = 0; i < data.length; i++) {
            let _x = 110 + _row * 80,
                _y = 100 + _col * 80,
                _item = data[i];

            const mapitem = new MapItem(i, _x, _y, _item);
            o.stage_map.push(mapitem);

            _row++;
            if (_row % 9 === 0) {
                _col++;
                _row = 0;
            }
        }
    };

    const create_instance_item = (x, y) => {
        // ---------- > create mode
        let _mode = PLAYER_MODE[irandom_range(0, PLAYER_MODE.length)];
        const item = new Items(x, y, "mode", _mode);
        o.items.push(item);
    };

    // #region ----------+---------+----------+---------+ > INIT
    // ----------+----------+---------- > GAME INIT
    let _mx = 272 - 30 * 0.5,
        _my = 444;

    class System {
        constructor() {
            this.screen = "home";
            this.state = "idle";

            this.setting = false;
        }
        update() {
            this.step();
            this.draw();
        }
        step() {
            if (!this.setting) {
                // -> create something for game
                game_load();
                create_map_item();

                const startButton = new Button(370, 460, "play_stage", true);
                o.buttons.push(startButton);

                this.setting = true;
            }
        }
        draw() {
            draw_text_ext(ctx, 800, 30, this.screen, "#fff", "right");
            draw_text_ext(ctx, 800, 60, this.state, "#fff", "right");
        }
    }

    class MapItem {
        // ---------- > time, size, speed
        constructor(id, x, y, map_data) {
            this.id = id;
            this.x = x;
            this.y = y;

            this.size = 48;
            this.is_hover = false;
            this.is_selected = false;
            this.is_clicked = false;

            this.map_data = map_data;
            this.is_destroy = false;
        }

        update() {
            this.step();
            this.draw();
        }

        step() {
            // -> hover
            let _is_hover = false;
            const { mouse } = o;
            if (
                mouse_inside(
                    this.x,
                    this.y,
                    this.size,
                    this.size,
                    mouse.x,
                    mouse.y
                )
            ) {
                _is_hover = true;
            }
            this.is_hover = _is_hover;

            if (this.is_clicked && !this.is_selected && this.map_data.unlock) {
                const { stage_map } = o;
                for (let i = 0; i < stage_map.length; i++) {
                    const a = stage_map[i];
                    a.is_selected = false;
                    a.is_clicked = false;
                    if (!a.map_data.unlock) {
                        break;
                    }
                }
                o.stage_map_id = this.map_data.id;
                this.is_selected = true;
            }
        }

        draw() {
            const { id, star, unlock } = this.map_data;
            if ((this.is_hover && unlock) || this.is_selected) {
                ctx.fillStyle = "blue";
                ctx.fillRect(this.x, this.y, this.size, this.size);
            } else {
                ctx.fillStyle = "red";
                ctx.fillRect(this.x, this.y, this.size, this.size);
            }

            if (unlock) {
                for (let i = 0; i < star; i++) {
                    let _x = this.x + i * 12,
                        _y = this.y;
                    draw_text_ext(ctx, _x, _y, "*", "#fff");
                }
            } else {
                draw_text_ext(ctx, this.x, this.y, "unlock", "#fff");
            }
        }
    }

    class Button {
        constructor(x, y, type, can_click) {
            this.x = x;
            this.y = y;

            this.w = 160;
            this.h = 60;

            this.type = type;
            this.can_click = can_click;

            this.is_clicked = false;
        }
        update() {
            this.step();
            this.draw();
        }
        step() {
            if (this.is_clicked && this.can_click) {
                switch (this.type) {
                    case "play_stage": {
                        const { stage_map_id } = o;
                        console.log(stage_map_id);
                        if (stage_map_id === -1) {
                            alert("select map first");
                        } else {
                            const { stage_map, buttons, stage, system } = o;
                            stage_map.length = 0;
                            buttons.length = 0;

                            stage.state = stage.enum.change_state;
                            stage.is_playing = true;
                            stage.enemy_shape = enemys_line.shape[stage_map_id];

                            system.screen = "map_stage";
                            create_player("blue");
                        }
                        break;
                    }
                    default:
                        break;
                }

                this.is_clicked = false;
            }
        }
        draw() {
            if (!this.can_click) {
                ctx.fillStyle = "red";
                ctx.fillRect(this.x, this.y, this.w, this.h);
            } else {
                ctx.fillStyle = "#08c6d4";
                ctx.fillRect(this.x, this.y, this.w, this.h);
            }
        }
    }

    class Stage {
        constructor() {
            this.enum = {
                idle: "idle",
                ready: "ready",
                create_enemy: "create_enemy",
                change_state: "change_state",
                end_game: "end_game",
            };

            this.state = "idle";
            this.is_playing = false;

            this.enemy_shape = [];
            this.enemy_shape_line = 7;

            this.time_create_each_line = 60;
            this.time_create_each_line_max = 60;

            this.is_prepare = false;
            this.time_break = 100;

            this.is_get_result = false;
            this.view_result_timing = 100;
        }

        reset() {}

        update() {
            this.step();
            this.draw();
        }

        step() {
            if (this.state === this.enum.change_state) {
                this.time_break--;
                if (this.time_break < 0) {
                    this.state = this.enum.create_enemy;
                    this.time_break = 100;
                }
            }

            // -> create enemy with shape
            if (this.state === this.enum.create_enemy) {
                this.time_create_each_line--;

                if (this.time_create_each_line < 0) {
                    // -> create enemy with line
                    if (this.enemy_shape_line < 0) {
                        this.state = "waiting";
                        this.enemy_shape_line = 7;
                    } else {
                        let _order = this.enemy_shape_line;
                        const line = this.enemy_shape[_order];

                        create_enemy_line(_order, line, 6);

                        // -> update info with shape
                        this.enemy_shape_line--;
                    }
                    this.time_create_each_line = this.time_create_each_line_max;
                }
            }

            // -> waiting end game
            if (this.state === "waiting") {
                const { enemys } = o;

                if (enemys.length === 0) {
                    console.log("first");
                    this.is_playing = false;
                    this.state = "get_result";
                }
            }
            // -> is get result
            if (this.state === "get_result") {
                if (!this.is_get_result) {
                    const { stage_map_id } = o;

                    const { data } = stages;
                    for (let i = 0; i < data.length; i++) {
                        const a = data[i];

                        if (a.id === stage_map_id) {
                            console.log("first");
                            a.star = 3;
                            if (a.star === 3) {
                                if (i !== data.length - 1) {
                                    console.log("i");
                                    data[i + 1].unlock = true;
                                } else {
                                    console.log("end");
                                    break;
                                }
                            } else {
                                break;
                            }
                        }
                    }

                    // -> save
                    game_save();

                    this.is_get_result = true;
                }

                this.view_result_timing--;
                if (this.view_result_timing < 0) {
                    this.state = "idle";
                    o.system.screen = "home";
                    o.player = "noone";
                    o.playerweapon = "noone";
                    o.system.setting = false;
                    o.stage_map_id = -1;
                    o.bullets = [];
                    o.items = [];
                    o.enemy_bullets = [];

                    this.is_get_result = false;
                    this.view_result_timing = 100;
                }
            }
        }

        draw() {
            const { camera } = settings;
            let _y = camera.h;

            draw_text_ext(ctx, 10, _y - 60, "state " + this.state, "#fff");

            // -> draw text stage level in ready state
            if (this.state === this.enum.change_state) {
                ctx.save();
                ctx.font = settings.font.stage;
                let _cx = camera.w * 0.5,
                    _cy = camera.h * 0.55,
                    _rgba = `rgba(255,255,255,${this.time_break / 100})`;
                draw_text_ext(ctx, _cx, _cy, "ready", _rgba, "center");
                ctx.restore();
            }

            if (this.state === "endgame") {
                ctx.save();
                ctx.font = settings.font.stage;
                let _cx = camera.w * 0.5,
                    _cy = camera.h * 0.55;
                draw_text_ext(ctx, _cx, _cy, "LOSE", "#fff", "center");
                ctx.restore();
            }
        }
    }

    class Player {
        constructor(sprite, hp) {
            this.x = 272 - 30 * 0.5;
            this.y = 444;

            this.hp = hp;
            this.hp_max = hp;

            this.state = "idle";

            this.size = 24;

            this.is_destroy = false;

            this.sprite = sprite;
        }

        reset() {}
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
            }

            if (this.hp <= 0) {
                this.is_destroy = true;
                o.stage.state = o.stage.enum.end_game;
                o.stage.is_playing = false;
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

            // ctx.fillStyle = "red";
            // ctx.fillRect(this.x, this.y, 32, 32);
            const { x, y, w, h } = this.sprite;
            draw_sprite_part(ctx, sprite_index, x, y, w, h, this.x, this.y);
        }
    }

    class PlayerWeapon {
        constructor(sprite) {
            this.state = "idle";

            this.firing = 15;
            this.multi_degree = 15;

            this.sprite = sprite;
            this.bullet_level = "lv1";

            // -> buff
            this.buff_asp = false;
            this.buff_asp_x2 = 1;
            this.buff_asp_x2_timing = 200;
        }
        reset() {}
        update() {
            this.step();
            this.draw();
        }

        step() {
            // -> buff
            if (this.buff_asp) {
                this.buff_asp_x2_timing--;
                this.buff_asp_x2 = 0.5;

                if (this.buff_asp_x2_timing < 0) {
                    this.buff_asp = false;
                    this.buff_asp_x2 = 1;
                    this.buff_asp_x2_timing = 200;
                }
            }

            this.firing--;
            if (this.firing < 0) {
                const { x, y, size } = o.player;

                // -> bullet from const
                const { atk, firing_delay, type, bullet_speed } = this.sprite;

                switch (type) {
                    // -> case yellow bullet
                    case "three_bullet": {
                        const bulletSprite = this.sprite.bullet;
                        let _sprite = bulletSprite[this.bullet_level];

                        for (let i = -1; i <= 1; i++) {
                            let _xx = x,
                                _yy = y + i * 12,
                                _bullet = new Bullet(
                                    _sprite,
                                    _xx,
                                    _yy,
                                    atk,
                                    "none",
                                    0,
                                    10,
                                    bullet_speed
                                );
                            o.bullets.push(_bullet);
                        }
                        this.firing = firing_delay * this.buff_asp_x2;
                        break;
                    }

                    // -> case red bullet
                    case "big_bullet": {
                        const bulletSprite = this.sprite.bullet;
                        let _sprite = bulletSprite[this.bullet_level];

                        let _xx = x,
                            _yy = y,
                            _bullet = new Bullet(
                                _sprite,
                                _xx,
                                _yy,
                                atk,
                                "none",
                                0,
                                10,
                                bullet_speed
                            );
                        o.bullets.push(_bullet);
                        this.firing = firing_delay * this.buff_asp_x2;
                        break;
                    }

                    // -> case green bullet
                    case "double_bullet": {
                        const bulletSprite = this.sprite.bullet;
                        let _sprite = bulletSprite[this.bullet_level];
                        for (let i = -1; i <= 1; i += 2) {
                            let _xx = x + i * size * 0.5,
                                _yy = y,
                                _bullet = new Bullet(
                                    _sprite,
                                    _xx,
                                    _yy,
                                    atk,
                                    "none",
                                    0,
                                    10,
                                    bullet_speed
                                );
                            o.bullets.push(_bullet);
                        }
                        this.firing = firing_delay * this.buff_asp_x2;
                        break;
                    }

                    // -> case blue bullet
                    case "triple_bullet": {
                        const bulletSprite = this.sprite.bullet;
                        let _sprite = bulletSprite[this.bullet_level];
                        for (let i = -1; i <= 1; i++) {
                            let _xx = x + i * size * 0.8,
                                _yy = y + Math.abs(i) * 10,
                                _bullet = new Bullet(
                                    _sprite,
                                    _xx,
                                    _yy,
                                    atk,
                                    "none",
                                    0,
                                    10,
                                    bullet_speed
                                );
                            o.bullets.push(_bullet);
                        }
                        this.firing = firing_delay * this.buff_asp_x2;
                        break;
                    }

                    default:
                        break;
                }
            }
        }

        draw() {
            const { w, h, pad } = settings.camera;
            draw_text_ext(
                ctx,
                w - pad,
                h - 40,
                "ATK: " + this.atk,
                "#fff",
                "right"
            );

            let _asp = (60 / this.firing_delay) | 0;
            draw_text_ext(
                ctx,
                w - pad,
                h - 20,
                "ASP: " + _asp,
                "#fff",
                "right"
            );
        }
    }

    class PlayerWeaponSuport {
        constructor(type, subming) {
            this.type = type;
            this.subming = subming;

            this.x = 250;
            this.y = 544;

            this.firing = 15;
            this.sprite = supports[subming];
            this.bullet_level = "lv2";

            // -> buff
            this.atk = 2;
            this.firing = 10;
        }
        reset() {}
        update() {
            this.step();
            this.draw();
        }

        step() {
            // -> buff
            let _xto = (o.player.x - 64 - this.x) * 0.25,
                _yto = o.player.y;

            if (this.type === "right") {
                _xto = (o.player.x + 60 - this.x) * 0.25;
            }
            this.x += _xto;
            this.y = _yto;

            this.firing--;
            if (this.firing < 0) {
                // -> bullet from const
                const { firing_delay, type } = this.sprite;

                switch (type) {
                    // -> case yellow bullet
                    case "three_bullet": {
                        let _data = this.sprite.bullet;
                        for (let i = -1; i <= 1; i++) {
                            let _xx = this.x,
                                _yy = this.y + i * 12,
                                _bullet = new Bullet(
                                    _data,
                                    _xx,
                                    _yy,
                                    2,
                                    "none",
                                    0,
                                    10,
                                    8
                                );
                            o.bullets.push(_bullet);
                        }
                        this.firing = firing_delay;
                        break;
                    }

                    // -> case red bullet
                    case "big_bullet": {
                        let _data = this.sprite.bullet;

                        let _xx = this.x,
                            _yy = this.y,
                            _bullet = new Bullet(
                                _data,
                                _xx,
                                _yy,
                                2,
                                "none",
                                0,
                                10,
                                6
                            );
                        o.bullets.push(_bullet);
                        this.firing = firing_delay;
                        break;
                    }

                    // -> case green bullet
                    case "double_bullet": {
                        let _data = this.sprite.bullet;
                        for (let i = -1; i <= 1; i += 2) {
                            let _xx = this.x + i * 10 * 0.5,
                                _yy = this.y,
                                _bullet = new Bullet(
                                    _data,
                                    _xx,
                                    _yy,
                                    2,
                                    "none",
                                    0,
                                    10,
                                    6
                                );
                            o.bullets.push(_bullet);
                        }
                        this.firing = firing_delay;
                        break;
                    }

                    // -> case blue bullet
                    case "triple_bullet": {
                        let _data = this.sprite.bullet;
                        for (let i = -1; i <= 1; i++) {
                            let _xx = this.x + i * 10 * 0.8,
                                _yy = this.y + Math.abs(i) * 10,
                                _bullet = new Bullet(
                                    _data,
                                    _xx,
                                    _yy,
                                    2,
                                    "none",
                                    0,
                                    10,
                                    6
                                );
                            o.bullets.push(_bullet);
                        }
                        this.firing = firing_delay;
                        break;
                    }

                    default:
                        break;
                }
            }
        }

        draw() {
            let _sprite = this.sprite[this.type];
            const { x, y, w, h, sw, sh } = _sprite;
            draw_sprite_part_ext(
                ctx,
                sprite_index,
                x,
                y,
                w,
                h,
                this.x,
                this.y,
                sw,
                sh
            );
        }
    }

    class PlayerWeaponSuportasd {
        constructor() {
            this.state = "idle";

            this.firing = 60;
            this.multi_degree = 15;

            this.sprite = sprites.blue;
            this.bullet_level = "lv1";
        }
        reset() {}
        update() {
            this.step();
            this.draw();
        }

        step() {
            this.firing--;
            if (this.firing < 0) {
                const { x, y, size } = o.player;

                // -> bullet from const
                const { atk, firing_delay, type } = this.sprite;

                switch (type) {
                    // -> case yellow bullet
                    case "three_bullet": {
                        const bulletSprite = this.sprite.bullet;
                        let _sprite = bulletSprite[this.bullet_level];

                        for (let i = -1; i <= 1; i++) {
                            let _xx = x,
                                _yy = y + i * 12,
                                _bullet = new Bullet(
                                    _sprite,
                                    _xx,
                                    _yy,
                                    atk,
                                    "none",
                                    0,
                                    10,
                                    8
                                );
                            o.bullets.push(_bullet);
                        }
                        this.firing = firing_delay;
                        break;
                    }

                    case "big_bullet": {
                        const bulletSprite = this.sprite.bullet;
                        let _sprite = bulletSprite[this.bullet_level];

                        let _xx = x,
                            _yy = y,
                            _bullet = new Bullet(
                                _sprite,
                                _xx,
                                _yy,
                                atk,
                                "none",
                                0,
                                10,
                                6
                            );
                        o.bullets.push(_bullet);
                        this.firing = firing_delay;
                        break;
                    }

                    case "double_bullet": {
                        const bulletSprite = this.sprite.bullet;
                        let _sprite = bulletSprite[this.bullet_level];
                        for (let i = -1; i <= 1; i += 2) {
                            let _xx = x + i * size * 0.5,
                                _yy = y,
                                _bullet = new Bullet(
                                    _sprite,
                                    _xx,
                                    _yy,
                                    atk,
                                    "none",
                                    0,
                                    10,
                                    6
                                );
                            o.bullets.push(_bullet);
                        }
                        this.firing = firing_delay;
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
            draw_text_ext(
                ctx,
                w - pad,
                h - 40,
                "ATK: " + this.atk,
                "#fff",
                "right"
            );

            let _asp = (60 / this.firing_delay) | 0;
            draw_text_ext(
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

            this.time_destroy = 180;
            this.is_destroy = false;
        }

        update() {
            this.step();
            this.draw();
        }

        step() {
            this.time_destroy--;
            this.y++;
            if (this.time_destroy < 0 || this.y > canvas.height) {
                this.is_destroy = true;
            }

            const { x, y, size } = o.player;
            if (point_distance(this.x, this.y, x, y) < size + this.size) {
                o.playerweapon.firing_mode = this.mode;
                this.is_destroy = true;
            }
        }

        draw() {
            ctx.fillStyle = "#d4084c";
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }
    }

    class Bullet {
        // ---------- > time, size, speed
        constructor(sprite, x, y, atk, type, hspd, vspd, size) {
            this.sprite = sprite;

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
            this.x += this.hspd;
            this.y -= this.vspd;
            if (this.y < 0) {
                this.is_destroy = true;
            }

            const { enemys } = o;
            for (let i = 0; i < enemys.length; i++) {
                let enemy = enemys[i];
                if (
                    point_distance(this.x, this.y, enemy.x, enemy.y) <
                    this.size + enemy.size
                ) {
                    enemy.hp -= this.atk;
                    if (enemy.hp <= 0) {
                        const animation = new Animation(
                            animations.explosion,
                            enemy.x + enemy.size * 0.5,
                            enemy.y + enemy.size * 0.5
                        );
                        o.animations.push(animation);

                        if (enemy.create_item >= 4) {
                            create_instance_item(this.x, this.y);
                        }
                        enemy.is_destroy = true;
                    }

                    const animation = new Animation(
                        animations.explosion_for_bullet,
                        this.x,
                        this.y
                    );
                    o.animations.push(animation);

                    this.is_destroy = true;
                }
            }
        }
        draw() {
            const { x, y, w, h, s, sw, sh } = this.sprite;
            this.size = s;
            draw_sprite_part_ext(
                ctx,
                sprite_index,
                x,
                y,
                w,
                h,
                this.x,
                this.y,
                sw,
                sh
            );

            // ctx.beginPath();
            // ctx.arc(this.x, this.y, s, 0, Math.PI * 2, false);

            // // ctx.lineWidth = 1;
            // ctx.strokeStyle = "blue";
            // ctx.stroke();
        }
    }

    class Animation {
        constructor(sprite, x, y) {
            this.x = x;
            this.y = y;

            this.image_speed = 0;
            this.image_index = 0;

            this.is_destroy = false;

            this.sprite = sprite;
        }

        update() {
            this.step();
            this.draw();
        }
        step() {
            this.image_speed++;
            const { f, fps } = this.sprite;
            if (this.image_speed > fps) {
                this.image_index++;

                if (this.image_index > f) {
                    this.is_destroy = true;
                }
                this.image_speed = 0;
            }
        }

        draw() {
            // ---------- > DRAW TEXT
            const { x, y, w, h, sw, sh } = this.sprite;

            let _xx = x + this.image_index * w;
            draw_sprite_part_ext(
                ctx,
                sprite_index,
                _xx,
                y,
                w,
                h,
                this.x,
                this.y,
                sw,
                sh
            );
        }
    }

    class Enemys {
        constructor(id, x, y, hp, y_target, type, mode, size) {
            this.state = "idle";

            this.id = id;
            this.x = x;
            this.x_left = x - 40;
            this.x_right = x + 40;

            this.y = y;

            this.hp = hp;
            this.hp_max = hp;

            this.hspd = 0;
            this.velocity = 1;
            this.vspd = 0;

            this.type = "a";
            this.mode = "a";

            this.size = size;

            this.y_target = y_target;
            this.time_for_stand = irandom_range(120, 300);
            this.move_auto = false;

            this.create_item = irandom_range(1, 5);

            this.sprite = animations.enemy1;
            this.image_speed = 0;
            this.image_index = 0;
            this.is_destroy = false;
        }

        update() {
            this.step();
            this.draw();
        }

        step() {
            if (this.y < this.y_target) {
                this.y++;
            } else {
                this.time_for_stand--;
                this.state = "move_x";
                if (this.time_for_stand < 0 && !this.move_auto) {
                    this.state = "move_auto";
                }
            }
            if (this.hp <= this.hp_max * 0.3 && !this.move_auto) {
                this.state = "move_auto";
            }
            if (this.state === "move_x") {
                this.x += this.velocity;
                if (this.x <= this.x_left || this.x >= this.x_right) {
                    this.velocity *= -1;
                }
            }
            if (this.state === "move_auto") {
                this.move_auto = true;
                let _x = this.x - o.player.x,
                    _y = this.y - o.player.y,
                    _mag = Math.sqrt(_x ** 2 + _y ** 2),
                    _spdx = -8 * (_x / _mag),
                    _spdy = -8 * (_y / _mag);

                this.hspd = _spdx;
                this.vspd = _spdy;

                const { enemys } = o;
                for (let i = 0; i < enemys.length; i++) {
                    if (enemys[i].id !== this.id && !enemys[i].move_auto) {
                        enemys[i].time_for_stand += 10;
                    }
                }
                this.state = "";
            }

            this.x += this.hspd;
            this.y += this.vspd;
            if (
                point_distance(this.x, this.y, o.player.x, o.player.y) <
                this.size + o.player.size
            ) {
                this.is_destroy = true;
                o.player.hp -= 2;
                const animation = new Animation(
                    animations.explosion,
                    this.x,
                    this.y
                );
                o.animations.push(animation);
            }
            this.image_speed++;
            const { f, fps } = this.sprite;
            if (this.image_speed > fps) {
                this.image_index++;

                if (this.image_index >= f) {
                    this.image_index = 0;
                }
                this.image_speed = 0;
            }

            if (
                this.state === "move_auto" &&
                (this.y < canvas.h ||
                    this.x < 0 ||
                    this.x > canvas.w ||
                    this.x < 0)
            ) {
                this.is_destroy = true;
            }
        }

        draw() {
            // ---------- > DRAW TEXT
            const { x, y, w, h, sw, sh } = this.sprite;

            let _xx = x + this.image_index * w;
            draw_sprite_part_ext(
                ctx,
                sprite_index,
                _xx,
                y,
                w,
                h,
                this.x,
                this.y,
                sw,
                sh
            );
            draw_text_ext(
                ctx,
                this.x,
                this.y - 16,
                this.time_for_stand,
                "#fff"
            );
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
                    this.type = choice("none", "random", "blabla");
                    this.state_timing = irandom_range(100, 200);
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
            if (point_distance(this.x, this.y, x, y) < size + this.size) {
                if (can_take_dmg) {
                    o.player.hp -= 2;
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
                            let _deg = irandom_range(0, 180),
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
                                this.random_counter = irandom_range(3, 10);
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
            draw_text(ctx, this.x, this.y - 32, this.hp);
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
                point_distance(this.x, this.y, player.x, player.y) <
                this.size + player.size
            ) {
                if (player.can_take_dmg) {
                    player.can_take_dmg = false;
                    player.hp--;
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
        o.system = new System();

        o.stage = new Stage();

        // let _l = new PlayerWeaponSuport("left", "blue");
        // o.weapon_supports.push(_l);
        // let _r = new PlayerWeaponSuport("right", "blue");
        // o.weapon_supports.push(_r);

        canvas.onmousemove = function (e) {
            e.preventDefault();
            let x = e.offsetX,
                y = e.offsetY;

            o.mouse = { x, y };

            _mx = e.offsetX;
            _my = e.offsetY;
        };
        canvas.onclick = function (e) {
            e.preventDefault();
            const { buttons, mouse, stage_map } = o;
            for (let i = 0; i < buttons.length; i++) {
                const a = buttons[i];
                if (mouse_inside(a.x, a.y, a.w, a.h, mouse.x, mouse.y)) {
                    a.is_clicked = true;
                }
            }

            for (let i = 0; i < stage_map.length; i++) {
                const a = stage_map[i];
                if (
                    mouse.x > a.x &&
                    mouse.y > a.y &&
                    mouse.x < a.x + a.size &&
                    mouse.y < a.y + a.size
                ) {
                    a.is_clicked = true;
                }
            }
        };
    };
    GameInit();

    // ----------+----------+---------- > Update

    const Update = () => {
        const {
            system,
            stage,
            stage_map,
            player,
            playerweapon,
            bullets,
            items,
            enemys,
            enemy_bullets,
            buttons,
            animations,
            weapon_supports,
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
        system.update();
        if (system.screen === "home") {
            for (let i = 0; i < stage_map.length; i++) {
                const a = stage_map[i];
                if (a.is_destroy) {
                    o.stage_map.splice(i, 1);
                    i--;
                } else {
                    a.update();
                }
            }
        }
        if (system.screen === "map_stage") {
            stage.update();
        }

        for (let i = 0; i < buttons.length; i++) {
            const a = buttons[i];
            if (a.is_destroy) {
                buttons.splice(i, 1);
                i--;
            } else {
                a.update();
            }
        }
        if (stage.is_playing && stage.state !== "end_game") {
            for (let i = 0; i < enemy_bullets.length; i++) {
                const a = enemy_bullets[i];
                if (a.is_destroy) {
                    o.enemy_bullets.splice(i, 1);
                    i--;
                } else {
                    a.update();
                }
            }
            for (let i = 0; i < enemys.length; i++) {
                const a = enemys[i];
                if (a.is_destroy) {
                    o.enemys.splice(i, 1);
                    i--;
                } else {
                    a.update();
                }
            }

            for (let i = 0; i < bullets.length; i++) {
                const a = bullets[i];
                if (a.is_destroy) {
                    o.bullets.splice(i, 1);
                    i--;
                } else {
                    a.update();
                }
            }
            for (let i = 0; i < weapon_supports.length; i++) {
                const a = weapon_supports[i];
                if (a.is_destroy) {
                    o.weapon_supports.splice(i, 1);
                    i--;
                } else {
                    a.update();
                }
            }

            if (player !== "noone") {
                player.update();
            }
            if (playerweapon !== "noone") {
                playerweapon.update();
            }
            for (let i = 0; i < animations.length; i++) {
                const a = o.animations[i];
                if (a.is_destroy) {
                    o.animations.splice(i, 1);
                    i--;
                } else {
                    a.update();
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
