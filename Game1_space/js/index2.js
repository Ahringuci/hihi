import { settings } from "./settings2.js";
import { oSpaceBullets, oMouse, oButtons, oSpace, o } from "./constans2.js";
import {
    sprSpace,
    sprBullet,
    sprMouse,
    sprUI,
    sprDefault,
    sprButton,
} from "./sprites.js";
import { dataSpace } from "./data.js";
import {
    draw_text_ext,
    draw_sprite_at_00,
    draw_sprite_part_ext,
    mouse_inside,
} from "./gml2.js";

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
const sprite_index = document.getElementById("sprite_index");
const fps = 8;
const center_x = (x, size) => {
    return x + size * 0.5;
};
(function () {
    let space;
    class Mouse {
        constructor() {
            this.state = "move";

            this.x = -999;
            this.y = -999;

            this.detail = "";

            this.image_index = 0;
            this.image_length = 1;
            this.image_speed = 0;
        }
        update() {
            this.step();
            this.draw();
        }

        step() {
            const { x, y } = oMouse;
        }

        draw() {
            const { x, y } = oMouse;
            const { left, top, w, h, sw, sh } = sprMouse;
            let _x = Math.round(x / 16) * 16,
                _y = Math.round(y / 16) * 16;
            // -> draw sprite
            this.image_speed++;
            if (this.image_speed >= fps) {
                this.image_index++;
                if (this.image_index > this.image_length) {
                    this.image_index = 0;
                }
                this.image_speed = 0;
            }

            draw_sprite_part_ext(
                ctx,
                sprite_index,
                left + this.image_index * w,
                top,
                w,
                h,
                _x,
                _y,
                sw,
                sh
            );
        }
    }

    class Space {
        constructor(state, data_id) {
            this.state = "demo";

            this.x = 250;
            this.y = 400;
            this.w = 0;
            this.h = 0;

            this.data_id = data_id;

            this.name = "";
            this.sprite = "noone";
            this.sprite_demo = "noone";
            this.id = "noone";
            this.info = "noone";

            this.prepare_for_war = 100;

            this.is_control = false;
            this.is_ready = false;
            this.radius = 0;

            this.firing = 0;
        }

        alarm() {
            // get info
            console.log("get info");
            for (let i = 0; i < dataSpace.length; i++) {
                const _i = dataSpace[i];
                if (_i.id === this.data_id) {
                    this.info = _i.info;
                    this.name = _i.name;
                    break;
                }
            }

            // get sprite
            console.log("get sprite");
            for (let i = 0; i < sprSpace.length; i++) {
                const _i = sprSpace[i];
                if (_i.id === this.data_id) {
                    this.sprite = _i.info;
                    break;
                }
            }
            // get sprite demo default
            for (let i = 0; i < sprDefault.length; i++) {
                const _i = sprDefault[i];
                if (_i.id === this.data_id) {
                    this.sprite_demo = _i.info;
                    break;
                }
            }

            // -> set radius size
            this.w = this.sprite.sw;
            this.h = this.sprite.sh;
            this.radius = this.sprite.s;
            this.is_ready = true;
        }

        update() {
            if (this.is_ready) {
                this.step();
                this.draw();
            } else {
                this.alarm();
            }
        }

        step() {
            // -> demo
            switch (this.state) {
                case "demo": {
                    this.is_control = false;
                    break;
                }
                case "prepare_for_war": {
                    this.prepare_for_war--;
                    if (this.prepare_for_war < 0) {
                        this.prepare_for_war = 100;
                        this.is_control = true;
                        this.state = "playing";
                    }
                    break;
                }

                case "playing": {
                    break;
                }

                default:
                    break;
            }

            // -> firing
            this.firing--;
            if (this.firing < 0) {
                // -> create bullet
                const { type } = this.info;
                switch (type) {
                    case "one_bullet": {
                        const bullet = new SpaceBullets(
                            this.x,
                            this.y,
                            this.info
                        );
                        oSpaceBullets.arr.push(bullet);

                        break;
                    }
                    case "two_bullet": {
                        for (let i = -1; i < 2; i += 2) {
                            let _x = this.x + i * 14;
                            const bullet = new SpaceBullets(
                                _x,
                                this.y,
                                this.info
                            );
                            oSpaceBullets.arr.push(bullet);
                        }
                        break;
                    }
                    case "three_bullet": {
                        for (let i = -1; i < 2; i++) {
                            let _x = this.x + i * 14,
                                _y = this.y + Math.abs(i) * 14;
                            const bullet = new SpaceBullets(_x, _y, this.info);
                            oSpaceBullets.arr.push(bullet);
                        }
                        break;
                    }
                    case "big_bullet": {
                        const bullet = new SpaceBullets(
                            this.x,
                            this.y,
                            this.info
                        );
                        oSpaceBullets.arr.push(bullet);
                        break;
                    }

                    default:
                        break;
                }

                this.firing = this.info.firing_delay;
            }
        }

        draw() {
            // -> draw sprite
            const { left, top, w, h, sw, sh } = this.sprite;
            draw_sprite_part_ext(
                ctx,
                sprite_index,
                left,
                top,
                w,
                h,
                this.x,
                this.y,
                sw,
                sh
            );
            switch (this.state) {
                case "demo": {
                    const { left, top, w, h, sw, sh } = this.sprite_demo;
                    let _pros_x = this.x,
                        _pros_y = this.y + 80;
                    draw_sprite_part_ext(
                        ctx,
                        sprite_index,
                        left,
                        top,
                        w,
                        h,
                        _pros_x,
                        _pros_y,
                        sw,
                        sh
                    );
                    // -> draw name
                    draw_text_ext(
                        ctx,
                        this.x,
                        this.y + 48,
                        this.name,
                        "#fff",
                        "center"
                    );
                    break;
                }
                case "prepare_for_war": {
                    break;
                }

                case "playing": {
                    break;
                }

                default:
                    break;
            }
        }
    }

    class SpaceBullets {
        constructor(x, y, info) {
            this.x = x;
            this.y = y;

            this.state = "idle";

            this.sprite_id = info.bullet_id;
            this.sprite_info = "noone";

            this.info = info;

            this.is_ready = false;
            this.radius = 0;
            this.is_destroy = false;
        }

        alarm() {
            // get sprite
            // console.log("get bullet sprite");
            for (let i = 0; i < sprBullet.length; i++) {
                const _i = sprBullet[i];
                if (_i.id === this.sprite_id) {
                    this.sprite_info = _i.info;
                    break;
                }
            }

            // -> set radius size
            this.radius = this.sprite_info.s;
            this.is_ready = true;
        }

        update() {
            if (this.is_ready) {
                this.step();
                this.draw();
            } else {
                this.alarm();
            }
        }
        step() {
            // -> demo
            const { bullet_speed, atk } = this.info;
            this.y += bullet_speed;
            if (this.y < 200) {
                this.is_destroy = true;
            }
        }
        draw() {
            const { left, top, w, h, sw, sh } = this.sprite_info;
            draw_sprite_part_ext(
                ctx,
                sprite_index,
                left,
                top,
                w,
                h,
                this.x,
                this.y,
                sw,
                sh
            );

            // ctx.beginPath();
            // ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);

            // ctx.lineWidth = 1;
            // ctx.strokeStyle = "#fff";
            // ctx.stroke();
        }
    }

    class Buttons {
        constructor(x, y, sprite_id) {
            this.x = x;
            this.y = y;

            this.sprite_id = sprite_id;
            this.sprite = "noone";

            this.can_clicked = true;
            this.is_clicked = false;

            this.is_ready = false;
            this.is_destroy = false;
        }

        alarm() {
            // get sprite
            console.log("get sprite");
            for (let i = 0; i < sprButton.length; i++) {
                const _i = sprButton[i];
                if (_i.id === this.sprite_id) {
                    this.sprite = _i.info;
                    break;
                }
            }

            // -> set radius size
            this.w = this.sprite.sw;
            this.h = this.sprite.sh;

            this.is_ready = true;
        }
        left_click() {
            switch (this.sprite_id) {
                case "left_slide": {
                    oSpace.target_index--;
                    if (oSpace.target_index < 0) {
                        oSpace.target_index = dataSpace.length - 1;
                    }
                    space.is_ready = false;
                    space.data_id = dataSpace[oSpace.target_index].id;
                    break;
                }
                case "right_slide": {
                    oSpace.target_index++;
                    if (oSpace.target_index > dataSpace.length - 1) {
                        oSpace.target_index = 0;
                    }
                    space.is_ready = false;
                    space.data_id = dataSpace[oSpace.target_index].id;
                    console.log(oSpace.target_index);
                    break;
                }

                default:
                    break;
            }
            this.can_clicked = false;
        }
        update() {
            if (this.is_ready) {
                this.step();
                this.draw();
            } else {
                this.alarm();
            }
        }
        step() {}
        draw() {
            // -> draw sprite space
            const { left, top, w, h, sw, sh } = this.sprite;
            draw_sprite_at_00(
                ctx,
                sprite_index,
                left,
                top,
                w,
                h,
                this.x,
                this.y,
                sw,
                sh
            );

            // ctx.fillStyle = "#fff";
            // ctx.fillRect(this.x, this.y, this.w, this.h);
        }
    }

    class Displayed {
        constructor() {
            this.x = 100;
            this.y = 100;
            this.state = "idle";

            this.is_created = false;

            this.sprite_index = sprSpace[0];
            this.subming = 0;
        }

        update() {
            this.draw();
        }

        draw() {
            // -> draw sprite space
            const { info } = this.sprite_index;
            draw_sprite_part_ext(
                ctx,
                sprite_index,
                info.left,
                info.top,
                info.w,
                info.h,
                this.x,
                this.y,
                info.sw,
                info.sh
            );
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
        canvas.onmousemove = function (e) {
            e.preventDefault();
            let _x = e.offsetX,
                _y = e.offsetY;

            oMouse.x = _x;
            oMouse.y = _y;
        };
        canvas.onclick = function (e) {
            e.preventDefault();
            const { arr: o_button } = oButtons;
            const { x, y } = oMouse;
            for (let i = 0; i < o_button.length; i++) {
                const _i = o_button[i];
                if (mouse_inside(_i.x, _i.y, _i.w, _i.h, x, y)) {
                    _i.left_click();
                }
            }
        };
    };

    GameInit();
    const displayed = new Displayed();
    space = new Space("demo", "blue");
    const mouse = new Mouse();

    const slideLeft = new Buttons(60, 100, "left_slide");
    const slideRight = new Buttons(100, 100, "right_slide");
    oButtons.arr.push(slideLeft);
    oButtons.arr.push(slideRight);

    const Update = () => {
        let _cw = canvas.width,
            _ch = canvas.height;

        ctx.clearRect(0, 0, _cw, _ch);

        // -----------------------------------------> UPDATE
        // ---------- > draw sky background
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, _cw, _ch);

        //displayed.update();
        space.update();
        // mouse.update();

        const { arr: o_space_bullet } = oSpaceBullets;
        for (let i = 0; i < o_space_bullet.length; i++) {
            const _i = o_space_bullet[i];
            if (_i.is_destroy) {
                o_space_bullet.splice(i, 1);
                i--;
            } else {
                _i.update();
            }
        }
        const { arr: o_button } = oButtons;
        for (let i = 0; i < o_button.length; i++) {
            const _i = o_button[i];
            if (_i.is_destroy) {
                o_button.splice(i, 1);
                i--;
            } else {
                _i.update();
            }
        }
    };
    const animate = () => {
        Update();
        requestAnimationFrame(animate);
    };
    animate();
})();
