export const mouse_inside = (x, y, w, h, mx, my) => {
    return mx > x && my > y && mx < x + w && my < y + h;
};
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
    let _center_x = x - sw * 0.5,
        _center_y = y - sh * 0.5;
    ctx.drawImage(
        sprite,
        left,
        top,
        width,
        height,
        _center_x,
        _center_y,
        sw,
        sh
    );
};

export const draw_sprite_at_00 = (
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
    ctx.drawImage(sprite, left, top, width, height, x, y, sw, sh);
};

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
