export const draw_sprite_part = (
    ctx,
    sprite,
    left,
    top,
    width,
    height,
    x,
    y
) => {
    let _x = x - width * 0.5,
        _y = y - height * 0.5;
    ctx.drawImage(sprite, left, top, width, height, _x, _y, width, height);
};
export const draw_sprite_part_ext = (
    ctx,
    sprite,
    left,
    top,
    width,
    height,
    x,
    y,
    sw,
    sh
) => {
    let _x = x - sw * 0.5,
        _y = y - sh * 0.5;
    ctx.drawImage(sprite, left, top, width, height, _x, _y, sw, sh);
};

class Notification {
    constructor(ctx, x, y) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.vspd = 0;

        this.timeDestroy = 40;
        this.state = "falling";
    }

    update() {
        this.step();
        this.draw();
    }
    step() {
        this.vspd += 0.15;
        this.y -= this.vspd;

        this.timeDestroy--;
        if (this.timeDestroy < 0) {
            this.state = "destroy";
        }
    }

    draw() {
        let _x = this.x,
            _y = this.y;

        // ---------- > DRAW TEXT
        gml.draw_text(this.ctx, _x, _y, "+1", "#fff");
    }
}

export const choice = (...arr) => {
    return arr[~~(Math.random() * arr.length)];
};

export const irandom_range = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
};

export const random_range = (min, max) => {
    return Math.random() * (max - min) + min;
};

export const draw_text = (c, x, y, text, color) => {
    c.fillStyle = color;
    c.fillText(text, x, y);
};

export const draw_text_ext = (c, x, y, text, color, align = "left") => {
    c.save();
    c.textAlign = align;
    c.fillStyle = color;
    c.fillText(text, x, y);
    c.restore();
};
export const point_distance = (x1, y1, x2, y2) => {
    let _col = (x1 - x2) ** 2 + (y1 - y2) ** 2;
    return Math.sqrt(_col);
};
