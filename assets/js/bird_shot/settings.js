// ----------+----------+---------- > SCREEN SETTINGS
const screenSeetings = {
    width: 544,
    height: 544,
    scale: 1,
    padding: 40,

    color: "#00ffee",
    background_color: "#666699",
};
// ['#044a57, '#1196ad', '#43cde6', '#68def2',]

// ----------+----------+---------- > CAMERA
const cameraSettings = {
    width: 660,
    height: 300,
    x: 20,
    y: 20,
};

// ----------+----------+---------- > PLAYER SETTINGS
const playerSettings = {
    point: 0,
    hp: 25,
};

// ----------+----------+---------- > SPRITE SHEET
const spriteSettings = {
    up: {
        x: 0,
        y: 0,
        size: 128,
    },
    down: {
        x: 128,
        y: 128,
        size: 128,
    },
    right: {
        x: 128,
        y: 0,
        size: 128,
    },
    left: {
        x: 0,
        y: 128,
        size: 128,
    },
};

// ----------+----------+---------- > FONT SETTINGS
const fontSettings = {
    font: "24px Alata",
};

// ----------+----------+---------- > ID
const idSettings = {
    id: 0,
};

export const settings = {
    // ---------- > ID
    id: idSettings,

    // ---------- > SCREEN
    screen: screenSeetings,

    // ---------- > CAMERA
    camera: cameraSettings,

    // ---------- > FONT
    fonts: fontSettings,

    // ---------- > PLAYER
    player: playerSettings,

    // ---------- > SPRITE SHEET
    sprite: spriteSettings,
};
