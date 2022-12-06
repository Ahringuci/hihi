import { OBJ } from "./constans.js";
import { settings } from "./settings.js";
import * as gml from "../gml.js";

const colorArray = ["#f0488b", "#b248f0", "#48f06f", "#aff048", "#f08848"];
export class Bullet {
    // ---------- > time, size, speed
    constructor(ctx, targetx, targety) {
        this.ctx = ctx;

        this.x = 272 - 30 * 0.5;
        this.y = 544 + 30 * 0.5;

        this.targetx = targetx;
        this.targety = targety;

        this.state = "fly";

        this.size = 30;
        this.sizeOrigin = 30;
        this.speed = 1.6;

        this.distanceOrigin = 0;
        this.distance = 1;

        this.color = colorArray[~~(Math.random() * 5)];
    }

    update() {
        this.step();
        this.draw();
    }
    step() {
        // ---------- > begin step

        if (this.state === "fly") {
            let _xto = this.targetx - this.x,
                _yto = this.targety - this.y,
                _mag = Math.sqrt(_xto ** 2 + _yto ** 2);

            const { screen } = settings;
            let _scale = screen.scale;

            if (this.distanceOrigin === 0) {
                this.distanceOrigin = Math.sqrt(_xto ** 2 + _yto ** 2);
                this.distance = this.distanceOrigin;
            } else {
                this.distance = this.distanceOrigin * _scale;
                this.size = (_mag * this.sizeOrigin) / this.distance + 1;
            }
            //  gml.draw_text(this.ctx, this.x, this.y, _mag.toString(), "red");
            this.x += (_xto * 0.04 * this.speed) / _scale;
            this.y += (_yto * 0.04 * this.speed) / _scale;

            if (_mag < 2 * _scale) {
                this.state = "destroy";
            }

            const { birds } = OBJ;
            if (birds.length !== 0) {
                birds.map((bird) => {
                    const { x, y, size } = bird;
                    if (
                        gml.place_metting(this.x, this.y, this.size, x, y, size)
                    ) {
                        this.state = "destroy";
                        bird.state = "destroy";

                        let _rd = gml.irandom_range(3, 6);

                        for (let _i = 0; _i < _rd; _i++) {
                            let _blood = new Blood(this.ctx, this.x, this.y);
                            OBJ.bloods.push(_blood);
                        }

                        OBJ.score++;
                        if (OBJ.score > OBJ.highscore) {
                            OBJ.highscore = OBJ.score;

                            localStorage.setItem(
                                "bird_highscore",
                                OBJ.highscore
                            );
                        }
                    }
                });
            }
        }
        // ---------- > step
        // ---------- > end step
    }
    draw() {
        // ---------- > draw self;
        if (this.state !== "destroy") {
            const { screen } = settings;
            let _scale = screen.scale;
            gml.draw_circle(
                this.ctx,
                this.x,
                this.y,
                this.size * _scale,
                this.color
            );
        }
        //  gml.draw_text(this.ctx, this.x, this.y, this.size.toString());
        // ---------- > draw gui;
    }
}

export class Bird {
    // ---------- > ctx,  time, size, speed
    constructor(ctx, x, y, size, speedx, speedy, dir, spritey) {
        this.ctx = ctx;

        this.x = x;
        this.y = y;

        this.state = "idle";

        this.size = size;
        this.sizeOrigin = size;

        this.speedx = speedx;
        this.speedy = speedy;

        this.distanceOrigin = 0;
        this.distance = 1;

        this.dir = dir;
        this.spritey = spritey;

        this.spriteIndex = 0;
        this.spriteLength = 3;
        this.spriteSpeed = 8;
        this.spriteCounter = 10;
    }

    update() {
        this.step();
        this.draw();
    }
    step() {
        // ---------- > begin step

        if (this.state === "idle") {
            const { screen } = settings;
            let _off = 100;
            if (
                this.x > 0 &&
                this.x + this.size < screen.width &&
                this.y > 0 &&
                this.y + this.size < screen.width
            ) {
                this.state = "fly";
            }
            this.x += this.speedx;
            this.y += this.speedy;

            if (
                this.x < -(this.size + 10) ||
                this.y < -(this.size + 10) ||
                this.x > screen.width + (this.size + 10) ||
                this.y > screen.height + (this.size + 10)
            ) {
                this.state = "destroy";
            }
        }

        if (this.state === "fly") {
            const { screen } = settings;
            let _scale = screen.scale;

            // ---------- > collision left right
            if (this.x < 0 || this.x + this.size > screen.width) {
                this.speedx *= -1;
                this.dir *= -1;
            }
            // ---------- > collision top bottom
            if (this.y < 0 || this.y + this.size > screen.height) {
                this.speedy *= -1;
            }
            this.x += this.speedx * _scale;
            this.y += this.speedy * _scale;
        }
    }
    draw() {
        // ---------- > draw self;
        const { screen } = settings;
        let _scale = screen.scale;
        if (this.state !== "destroy") {
            this.spriteCounter--;

            if (this.spriteCounter < 0) {
                this.spriteIndex++;

                if (this.spriteIndex === this.spriteLength) {
                    this.spriteIndex = 0;
                }
                this.spriteCounter = this.spriteSpeed;
            }
            let _spry = 256 + 128 * this.spritey;
            if (this.dir === 1) {
                _spry += 128;
            }
            gml.draw_sprite_ext(
                this.ctx,
                OBJ.sprite_index,
                this.spriteIndex * 128,
                _spry,
                128,
                this.x - 20 * _scale,
                this.y - 20 * _scale,
                (this.size + 40) * _scale
            );
        }
        // ---------- > draw gui;
    }
}

class Blood {
    constructor(ctx, x, y) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;

        this.vspd = 0;

        this.speedx = gml.random_range(-3, 3);
        this.speedy = gml.random_range(-4, -2);

        this.state = "falling";
        this.color = "#ff66c4";

        this.size = gml.irandom_range(4, 10);
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

        if (this.size < 0.5) {
            this.state = "destroy";
        }
    }

    draw() {
        const { screen } = settings;
        let _scale = screen.scale;
        let _x = this.x,
            _y = this.y,
            _c = this.color;

        // ---------- > DRAW TEXT
        gml.draw_circle(this.ctx, _x, _y, this.size * _scale, _c);
    }
}

export class BackgroundImage {
    constructor(ctx, spritey) {
        this.ctx = ctx;
        this.xOrigin = -1436 * 0.5 + settings.screen.width * 0.5;
        this.x = -1436 * 0.5 + settings.screen.width * 0.5;
        this.y = 0;

        this.width = 1436;
        this.height = 544;

        this.speedx = 0.5;

        this.spritey = spritey;
    }

    update() {
        this.step();
        this.draw();
    }
    step() {}

    draw() {
        const { screen } = settings;
        let _scale = screen.scale;

        // ---------- > DRAW TEXT
        let _spriteWidth = this.width * _scale,
            _spriteHeight = this.height * _scale,
            _x = this.x * (1 - _scale),
            _y = this.y * (1 - _scale);

        gml.draw_sprite_part(
            this.ctx,
            OBJ.sprite_index,
            0,
            this.spritey,
            this.width,
            this.height,
            _x,
            _y,
            _spriteWidth,
            _spriteHeight
        );
    }
}
