// ----------+----------+---------- > CAMERA
const camera = {
    w: 900,
    h: 600,
    pad: 100,
};

// ----------+----------+---------- > PLAYER SETTINGS
const player = {
    x: 100,
    y: 500,
    hp: 25,
    mp: 25,
    spr: {
        x: 0,
        y: 0,
        w: 128,
        h: 128,
        sw: 128,
        sh: 128,
    },
};

// ----------+----------+---------- > FONT SETTINGS
const font = {
    thin: "14px Consolas",
    normal: "16px Consolas",
    bigger: "20px Consolas",
    stage: "100px Consolas",
};

// ----------+----------+---------- > ID
const counter = {
    id: 0,
};

const mouse = {
    x: -1,
    y: -1,
};
export const settings = {
    camera,
    mouse,
    player,
    font,
    counter,
};
