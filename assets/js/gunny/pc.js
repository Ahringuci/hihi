const random_range = (min, max) => {
    return Math.random() * (max - min) + min;
};
const random_rgb = () => {
    let _rb = random_range(0, 255),
        _g = random_range(0, 255);
    return {
        r: _rb,
        g: _g,
        b: _rb,
    };
};
const color = ["#f0488b", "#b248f0", "#48f06f", "#aff048", "#f08848"];
(function () {
    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");
    const sprite_index = document.getElementById("js_sprite_index");

    const o = {
        player: {},
        walls: [],
        bullets: [],
        support_items: [],
        bullets_effect: [],
        explosions: [],
    };

    const spaces = [
        {
            id: 1,
            name: "lorem1",
            width: 1,
            height: 2,
            info: {
                asp: 12,
                dmg: 1,
                hp: 10,
                cost: 10,
                cost_each: 0.5,
                level: 1,
            },
            sprite: {
                x: 0,
                y: 0,
                w: 0,
                h: 0,
            },
        },
        {
            id: 2,
            name: "lorem2",
            width: 1,
            height: 2,
            info: {
                asp: 10,
                dmg: 2,
                hp: 12,
                cost: 14,
                cost_each: 0.5,
                level: 1,
            },
            sprite: {
                x: 0,
                y: 0,
                w: 0,
                h: 0,
            },
        },
    ];

    const globals = {
        grav: 0.2,

        key_up: false,
        key_left: false,
        key_down: false,
        key_right: false,
    };

    const settings = {
        // screen
        screen: {
            width: 960,
            height: 540,
            cell: 32,
            scale: 16 / 9,
        },

        // font
        font: "18px Arial",
    };

    const GameSettings = () => {
        const { screen } = settings;
        let _ww = screen.width,
            _wh = screen.height;

        canvas.width = _ww;
        canvas.height = _wh;

        ctx.font = settings.font;

        canvas.onclick = function (e) {
            e.preventDefault();
            const { support_items } = o;
            for (let i = 0; i < support_items.length; i++) {
                let _mx = e.offsetX,
                    _my = e.offsetY;
                let _ = support_items[i];

                if (
                    _mx > _.x &&
                    _my > _.y &&
                    _mx < _.x + _.size &&
                    _my < _.y + _.size
                ) {
                    _.is_clicked = true;
                    _.color = "#000";
                    console.log(_.name);
                }
            }
        };
    };
    GameSettings();

    const draw_text = (c, x, y, txt) => {
        c.fillText(txt, x, y);
    };
    // ---------- > calculator
    const Collision = (x1, y1, x2, y2, r) => {
        let _x = (x1 - x2) ** 2,
            _y = (y1 - y2) ** 2;
        return Math.sqrt(_x + _y) <= r;
    };
    // -> collision
    const collision = (r1, r2) => {
        var hit = !(
            r1.x + r1.s < r2.x ||
            r2.x + r2.s < r1.x ||
            r1.y + r1.s < r2.y ||
            r2.y + r2.s < r1.y
        );

        if (hit) {
            return "ok";
        } else return "none";
    };

    class GameSystem {
        constructor() {
            this.state = "idle";
            this.turn_cd = 100;
        }

        update() {
            this.step();
            this.draw();
        }
        step() {}
        draw() {}
    }

    // ----------+----------+---------- > player
    class Players {
        // ---------- > state:idle x, y, energy, vspd
        constructor(x, y, energy) {
            this.state = "idle";

            this.x = x;
            this.y = y;

            this.hspd = 0;
            this.spd = 2;
            this.vspd = 0;

            this.bullet_size = 10;

            this.direction = 90;
            this.holding = false;
            this.holding_time = 0;
            this.holding_time_prev = 0;

            this.size = 32;
            this.energy = energy;

            this.is_shoot = false;
            this.is_shooting = false;
            this.shot_counter_each = 30;
            this.shot_counter = 1;
        }
        your_turn() {
            console.log("first");
            this.holding_time = 0;
            this.is_shoot = false;
            this.shot_counter = 1;
        }
        control() {
            const _ = this;
            window.addEventListener("keydown", (e) => {
                let _keyCode = e.key;
                if (
                    _keyCode !== "ArrowRight" &&
                    _keyCode !== "ArrowUp" &&
                    _keyCode !== "ArrowDown" &&
                    _keyCode !== "ArrowLeft" &&
                    _keyCode !== " "
                )
                    return;
                _.key_pressed(_keyCode);
            });
            window.addEventListener("keyup", (e) => {
                let _keyCode = e.key;
                if (
                    _keyCode !== "ArrowRight" &&
                    _keyCode !== "ArrowUp" &&
                    _keyCode !== "ArrowDown" &&
                    _keyCode !== "ArrowLeft" &&
                    _keyCode !== " "
                )
                    return;
                _.key_release(_keyCode);
            });
        }

        key_pressed(key) {
            if (!this.is_shooting) {
                switch (key) {
                    case "ArrowUp": {
                        this.direction += 1;
                        break;
                    }
                    case "ArrowDown": {
                        this.direction -= 1;
                        break;
                    }
                    case "ArrowRight": {
                        this.hspd = this.spd;

                        break;
                    }
                    case "ArrowLeft": {
                        this.hspd = -this.spd;

                        break;
                    }
                    case " ": {
                        this.holding = true;

                        break;
                    }

                    default:
                        break;
                }
            }
        }

        key_release(key) {
            switch (key) {
                case "ArrowRight":
                case "ArrowLeft": {
                    this.hspd = 0;
                    break;
                }

                case " ": {
                    if (!this.is_shooting) {
                        if (this.holding) {
                            this.is_shoot = true;
                            this.holding_time_prev = this.holding_time;

                            let _l = this.holding_time / 4,
                                _a = this.direction * (Math.PI / 180),
                                _x = 0,
                                _y = 0;

                            if (this.direction === 90) {
                                _x = 0;
                                _y = Math.sin(_a) * -_l - 2;
                            } else if (this.direction === 0) {
                                _x = Math.cos(_a) * _l;
                                _y = 0;
                            } else {
                                _x = Math.cos(_a) * _l;
                                _y = Math.sin(_a) * -_l - 2;
                            }

                            if (this.state === "fly") {
                                let _b = new PlayerFly(
                                    this.x,
                                    this.y - this.size,
                                    _x,
                                    _y,
                                    this.size
                                );
                                o.bullets.push(_b);
                            }

                            if (this.state === "idle") {
                                let _b = new Bullets(
                                    this.x + this.size * 0.5,
                                    this.y,
                                    _x,
                                    _y,
                                    this.bullet_size
                                );
                                o.bullets.push(_b);
                            }

                            for (
                                let _i = 0;
                                _i < o.support_items.length;
                                _i++
                            ) {
                                o.support_items[_i].is_clicked = false;
                                o.support_items[_i].is_set = false;
                                o.support_items[_i].color = "#fff";
                            }

                            this.holding = false;
                        }
                        this.your_turn();
                    }
                    break;
                }

                default:
                    break;
            }
        }

        update() {
            this.step();
            this.draw();
        }

        step() {
            this.vspd += globals.grav;

            const { walls } = o;

            for (let _i = 0; _i < walls.length; _i++) {
                let _wall = walls[_i];

                if (
                    _wall.x >= this.x &&
                    _wall.x <= this.x + this.size &&
                    this.y + this.size < _wall.y &&
                    this.y + this.size + this.vspd >= _wall.y
                ) {
                    // while (!(this.y + this.size + 1 >= walls[_i].y)) {
                    //     this.y++;
                    // }
                    this.vspd = 0;
                }

                if (
                    _wall.y >= this.y &&
                    _wall.y <= this.y + this.size &&
                    this.x + this.size + this.hspd >= _wall.x &&
                    this.x + this.hspd <= _wall.x + _wall.size
                ) {
                    this.hspd = 0;
                }
            }

            if (this.holding && !this.is_shoot) {
                this.holding_time += 1;
                if (this.holding_time >= 100) {
                    this.holding_time = 100;
                }
            }

            this.y += this.vspd;
            this.x += this.hspd;
        }

        draw() {
            let _x = 100,
                _y = canvas.height - 40,
                _w = canvas.width - _x * 2,
                _h = 30;

            ctx.fillStyle = "#fff";
            ctx.fillRect(this.x, this.y, this.size, this.size);

            // ---------- > draw gui
            ctx.fillStyle = "#333";
            ctx.fillRect(_x, _y, _w, _h);
            ctx.fillStyle = "rgba(255,255,255, 0.4)";
            ctx.fillRect(_x, _y, (this.holding_time_prev / 100) * _w, _h);

            ctx.fillStyle = "#fff";
            ctx.fillRect(_x, _y, (this.holding_time / 100) * _w, _h);

            ctx.fillText(this.holding_time, 10, 10);

            for (let i = 0; i <= 10; i++) {
                let _i = i * 10,
                    _space = _x + (_i / 100) * _w;

                ctx.fillText(_i, _space - i * 2, _y);
            }
        }
    }

    // ----------+----------+---------- > wall
    class Walls {
        // ---------- > state idle - close | open
        constructor(x, y, size, solid = true) {
            this.x = x;
            this.y = y;
            this.size = size;

            this.solid = solid;
            this.is_destroy = false;
        }

        update() {
            this.step();
            this.draw();
        }
        step() {
            if (this.state === "open") {
                // open
                if (this.create_for_open) {
                    this.create_for_open = true;
                }
            }
        }
        draw() {
            ctx.fillStyle = "#fff";
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }
    }

    // ----------+----------+---------- > explosion
    class Explosions {
        // ---------- > state idle - close | open
        constructor(x, y, size) {
            this.x = x;
            this.y = y;

            this.size = 20;

            this.animation_speed = 30;
            this.is_destroy = false;
        }

        update() {
            this.step();
            this.draw();
        }
        step() {
            this.animation_speed--;
            if (this.animation_speed < 0) {
                this.is_destroy = true;
            }
            const { walls } = o;
            for (let _i = 0; _i < walls.length; _i++) {
                let _wall = walls[_i];
                if (Collision(this.x, this.y, _wall.x, _wall.y, this.size)) {
                    if (!_wall.solid) {
                        _wall.is_destroy = true;
                    }
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = "#00f";
            ctx.fill();
        }
    }

    class PlayerFly {
        // ---------- > state:idle x y xspd yspd size
        constructor(x, y, hspd, vspd, size) {
            this.state = "fly";

            this.x = x;
            this.y = y;

            this.hspd = hspd;
            this.vspd = vspd;

            this.size = size;
            this.effect_time = 6;
        }

        update() {
            this.step();
            this.draw();
        }
        step() {
            this.vspd += globals.grav;
            if (this.vspd > 7) this.vspd = 7;
            this.effect_time--;

            const { walls } = o;
            for (let _i = 0; _i < walls.length; _i++) {
                let _wall = walls[_i];
                if (
                    _wall.x >= this.x &&
                    _wall.x <= this.x + this.size &&
                    this.y + this.vspd <= _wall.y &&
                    this.y + this.size + this.vspd >= _wall.y
                ) {
                    while (
                        !(
                            this.y + Math.sign(this.vspd) <=
                                _wall.y + _wall.size &&
                            this.y + Math.sign(this.vspd) + this.size >= _wall.y
                        )
                    ) {
                        this.y += Math.sign(this.vspd);
                    }
                    this.vspd = 0;
                    this.hspd = 0;
                    if (this.y + this.size + 1 >= _wall.y) {
                        this.state = "destroy";
                    }
                }
            }
            // if (this.state === "fly") {
            //     for (let _i = 0; _i < walls.length; _i++) {
            //         let _wall = walls[_i];
            //         if (
            //             Collision(
            //                 this.x,
            //                 this.y,
            //                 _wall.x,
            //                 _wall.y,
            //                 this.size + _wall.size
            //             )
            //         ) {
            //             while (
            //                 !(
            //                     this.y + Math.sign(this.vspd) <=
            //                     _wall.y + _wall.size
            //                 )
            //             ) {
            //                 this.y--;
            //             }
            //             this.vspd = 0;
            //             this.hspd = 0;
            //             this.state = "falling";
            //         }
            //     }
            // }

            if (this.state === "falling") {
                for (let _i = 0; _i < walls.length; _i++) {
                    let _wall = walls[_i];
                    if (
                        _wall.x > this.x &&
                        _wall.x < this.x + this.size &&
                        this.y < _wall.y &&
                        this.y + this.size + this.vspd >= _wall.y
                    ) {
                        while (
                            !(
                                this.y + Math.sign(this.vspd) + this.size >=
                                _wall.y
                            )
                        ) {
                            this.y++;
                        }
                        this.vspd = 0;
                        this.state = "destroy";
                    }
                }
            }

            if (this.state === "destroy") {
                o.player.x = this.x;
                o.player.y = this.y;
                o.player.state = "idle";
            }

            this.x += this.hspd;
            this.y += this.vspd;
        }
        draw() {
            ctx.fillStyle = "#fff";
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }
    }

    class Bullets {
        // ---------- > state:idle x y xspd yspd size
        constructor(x, y, hspd, vspd, size) {
            this.state = "fly";

            this.x = x;
            this.y = y;

            this.hspd = hspd;
            this.vspd = vspd;

            this.size = size;
            this.effect_time = 6;
        }

        update() {
            this.step();
            this.draw();
        }
        step() {
            this.vspd += globals.grav;

            const { walls } = o;
            for (let _i = 0; _i < walls.length; _i++) {
                let _wall = walls[_i];
                if (Collision(this.x, this.y, _wall.x, _wall.y, this.size)) {
                    this.state = "destroy";
                }
            }
            // ---------- > end
            this.effect_time--;
            if (this.effect_time < 0) {
                for (let i = 0; i < 6; i++) {
                    let _s = 3 * this.size;
                    let _x = random_range(-_s, _s),
                        _y = random_range(-_s, _s);
                    let _e = new BulletsEffect(this.x + _x, this.y + _y);
                    o.bullets_effect.push(_e);
                }

                this.effect_time = 6;
            }
            if (this.state === "destroy") {
                let _e = new Explosions(this.x, this.y);
                o.explosions.push(_e);
            }

            this.x += this.hspd;
            this.y += this.vspd;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = "red";
            ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }
    }

    class BulletsEffect {
        // ---------- > state:idle x y xspd yspd size
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.color = random_rgb();
            this.size = random_range(1, 10);
            this.alpha = 1;
            this.is_destroy = false;
        }

        update() {
            this.step();
            this.draw();
        }
        step() {
            this.alpha -= 0.05;
            if (this.alpha <= 0.05) {
                this.is_destroy = true;
            }
        }
        draw() {
            // ctx.fillStyle = "red";
            // ctx.fillRect(this.x, this.y, this.size, this.size);
            let { r, g, b } = this.color;
            let _c = `rgba(${r}, ${g}, ${b}, ${this.alpha})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = _c;
            ctx.fill();
        }
    }

    class SupportItem {
        // ---------- > state:idle x y xspd yspd size
        constructor(name, x, y) {
            this.name = name;

            this.x = x;
            this.y = y;
            this.color = "#fff";

            this.size = 48;
            this.is_clicked = false;
            this.is_set = false;
        }

        update() {
            this.step();
            this.draw();
        }
        step() {
            if (this.is_clicked && !this.is_set) {
                switch (this.name) {
                    case "fly": {
                        o.player.state = "fly";
                        break;
                    }
                    case "+1": {
                        o.player.shot_counter += 1;
                        break;
                    }
                    case "+2": {
                        o.player.shot_counter += 2;
                        break;
                    }
                    case "+3": {
                        o.player.shot_counter += 3;
                        break;
                    }

                    default:
                        break;
                }
                this.is_set = true;
            }
        }
        draw() {
            ctx.fillStyle = "red";
            ctx.fillRect(this.x, this.y, this.size, this.size);

            ctx.fillStyle = this.color;
            ctx.fillText(this.name, this.x, this.y + this.size * 0.5);
        }
    }

    // #region --------------------------------------------------> create class

    const GameInit = () => {};
    // GameInit();

    // #region --------------------------------------------------> game animate

    const CreateLand = () => {
        for (let i = 0; i < 127; i++) {
            for (let j = 0; j <= 6; j++) {
                let _x = 100 + i * 6,
                    _y = 400 + j * 6,
                    _solid = false;

                if (j >= 5) {
                    _solid = true;
                }
                let w = new Walls(_x, _y, 5, _solid);
                o.walls.push(w);
            }
        }
    };
    CreateLand();
    const CreateSupportItem = () => {
        const item = ["fly", "+1", "+2", "+3", "x2", "x3"];
        for (let i = 0; i < item.length; i++) {
            let _y = 60 + i * 70,
                _x = 30;
            let _item = new SupportItem(item[i], _x, _y);
            o.support_items.push(_item);
        }
    };
    CreateSupportItem();
    for (let i = 0; i <= 60; i++) {
        let _x = 100 + i * 6,
            _y = 100,
            _solid = false;

        let w = new Walls(_x, _y, 5, _solid);
        o.walls.push(w);
    }
    o.player = new Players(200, 200, 20);
    o.player.control();

    function lineToAngle(ctx, x1, y1, length, angle) {
        angle = ((angle - 90) * Math.PI) / 90;
        var x2 = x1 + length * Math.cos(angle),
            y2 = y1 + length * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.fill();

        return {
            x: x2,
            y: y2,
        };
    }

    function draw_arrow(ctx, x1, y1, length, angle) {
        var pos = lineToAngle(ctx, x1, y1, length, angle);
    }

    const animate = () => {
        const { screen } = settings;
        let _width = screen.width,
            _height = screen.height;
        //clear
        ctx.clearRect(0, 0, _width, _height);
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, _width, _height);
        ctx.fillStyle = "#fff";
        ctx.fillText(canvas.width.toString(), 100, 100);

        o.walls = o.walls.filter((w) => !w.is_destroy);
        o.walls.map((w) => w.update());

        if (o.explosions.length !== 0) {
            o.explosions = o.explosions.filter((e) => !e.is_destroy);
            o.explosions.map((e) => e.update());
        }

        if (o.bullets_effect.length !== 0) {
            for (let i = 0; i < o.bullets_effect.length; i++) {
                if (o.bullets_effect[i].is_destroy) {
                    o.bullets_effect.splice(i, 1);
                    i--;
                } else {
                    o.bullets_effect[i].update();
                }
            }
        }
        if (o.bullets.length !== 0) {
            for (let i = 0; i < o.bullets.length; i++) {
                if (o.bullets[i].state !== "destroy") o.bullets[i].update();
            }
        }

        for (let i = 0; i < o.support_items.length; i++) {
            o.support_items[i].update();
        }

        o.player.update();

        requestAnimationFrame(animate);
    };
    animate();
})();
