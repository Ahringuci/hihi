// ---------- > CHOICE
export const choice = (...arr) => {
    return arr[~~(Math.random() * arr.length)];
};
// ---------- > IRANDOM
export const irandom_range = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
};

// ---------- > RANDOM
export const random_range = (min, max) => {
    return Math.random() * (max - min) + min;
};

// ---------- > DRAW TEXT
export const draw_text = (c, x, y, text, color) => {
    c.fillStyle = color;
    c.fillText(text, x, y);
};

// ---------- > DRAW TEXT EXT
export const draw_text_ext = (c, x, y, text, color, align = "left") => {
    c.save();
    c.textAlign = align;
    c.fillStyle = color;
    c.fillText(text, x, y);
    c.restore();
};

// ---------- > DRAW CIRCLE
export const draw_circle = (c, x, y, r, color, outline = false) => {
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2, false);
    if (outline) {
        c.lineWidth = 1;
        c.strokeStyle = color;
        c.stroke();
    } else {
        c.fillStyle = color;
        c.fill();
    }
};
// ---------- > draw rectangle
export const draw_rect = (c, x, y, width, height, color) => {
    c.fillStyle = color;
    c.fillRect(x, y, width, height);
};

// ---------- > DRAW SPRITE
export const draw_sprite_ext = (
    c,
    sprite_index,
    sprite_x,
    sprite_y,
    sprite_size,
    x,
    y,
    size
) => {
    c.drawImage(
        sprite_index,
        sprite_x,
        sprite_y,
        sprite_size,
        sprite_size,
        x,
        y,
        size,
        size
    );
};
// ---------- > DRAW SPRITE PART
export const draw_sprite_part = (
    c,
    sprite_index,
    sprite_x,
    sprite_y,
    sprite_width,
    sprite_heigh,
    x,
    y,
    width,
    height
) => {
    c.drawImage(
        sprite_index,
        sprite_x,
        sprite_y,
        sprite_width,
        sprite_heigh,
        x,
        y,
        width,
        height
    );
};

// ---------- > PLACE_METTING
export const place_metting = (x1, y1, s1, x2, y2, s2) => {
    let _col = !(x1 + s1 < x2 || x2 + s2 < x1 || y1 + s1 < y2 || y2 + s2 < y1);
    return _col;
};

// ---------- > point distance
export const point_distance = (x1, y1, x2, y2) => {
    let _col = (x1 - x2) ** 2 + (y1 - y2) ** 2;
    return Math.sqrt(_col);
};
