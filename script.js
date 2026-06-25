/**
 * @copyright 2026 KittKat
 */

let lookuplist = [
    [" ", " / "],
];

wpm = 7;

addEventListener("DOMContentLoaded", (event) => {
    initBindings();
    loadLookupList();
    text = document.getElementById("comptext").textContent;
    document.getElementById("compcode").textContent = encode(text);
    setVolume();
});

const delay = ms => new Promise(r => setTimeout(r, ms));

let keyState = false;

let audioCtx = new(window.AudioContext || window.webkitAudioContext)();
// create Oscillator node
let oscillator;
let volume = 25;

const gainNode = audioCtx.createGain();
gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
gainNode.connect(audioCtx.destination);

oscillator = audioCtx.createOscillator();
oscillator.type = 'square';
oscillator.frequency.value = 475; // value in hertz
oscillator.connect(gainNode);

function encodeChar(text) {
    text = text[0];
    for (let i = 0; i < lookuplist.length; i++) {
        if (lookuplist[i][0].toUpperCase() == text.toUpperCase()) {
            return lookuplist[i][1];
        }
    }
    return "";
}

function decodeChar(text) {
    if (!text.trim()) return "";
    for (let i = 0; i < lookuplist.length; i++) {
        if (lookuplist[i][1] == text.toUpperCase()) {
            return lookuplist[i][0];
        }
    }
    return "🗆";
}

function encode(text) {
    code = "";
    for (let i = 0; i < text.length; i++) {
        code += encodeChar(text[i]) + " ";
    }
    return code;
}

function decode(code) {
    text = "";
    codeChunks = code.split(" ");
    for (let i = 0; i < codeChunks.length; i++) {
        if (codeChunks[i] == "/") {
            text += decodeChar(" / ");
            continue;
        }
        text += decodeChar(codeChunks[i]);
    }
    return text;
}

timer = null;
timerDown = null;
timerUnitcount = 0;
timerDownUnitcount = 0;
message = "";

async function playCode(code) {
    let unit = wpmToUnit(wpm);
    for (let i = 0; i < code.length; i++) {
        let c = code[i];
        if (c == ".") {
            oscPlay();
            await delay(unit);
        } else if (c == "-") {
            oscPlay();
            await delay(unit * 3);
        } else if (c == " " || c == "/") {
            await delay(unit * 2);
            continue;
        } else {
            continue;
        }
        oscStop();
        await delay(unit);
    }
}

// Starts the timer
function timerStart() {
    clearInterval(timerDown);
    units = timerDownUnitcount + 1;
    timerDownUnitcount = 0;
    if (units >= 3 && units < 7) {
        message += " ";
    } else if (units >= 7) {
        message += " / ";
    }

    timer = setInterval(function () {
        if (timerUnitcount >= 7) {
            clearInterval(timer);
        } else {
            timerUnitcount += 1;
        }
    }, wpmToUnit(wpm) * 1.05);
}

function timerStop() {
    clearInterval(timer);
    units = timerUnitcount + 1;
    timerUnitcount = 0;
    if (units == 1) {
        message += ".";
    } else if (units >= 2) {
        message += "-";
    }

    timerDown = setInterval(function () {
        if (timerDownUnitcount >= 7) {
            clearInterval(timerDown);
        } else {
            timerDownUnitcount += 1;
        }
    }, wpmToUnit(wpm) * 1.05);
}

function wpmToUnit(wpm) {
    return (1.2 / wpm) * 1000;
}

function unitToWpm(unit) {
    return 1.2 / (unit / 1000);
}

function loadLookupList() {
    let tables = document.getElementsByClassName("code-table");
    for (let i = 0; i < tables.length; i++) {
        let rows = tables[i].getElementsByTagName("tr");
        for (let j = 1; j < rows.length; j++) {
            let cells = rows[j].getElementsByTagName("td");
            for (let k = 0; k < cells.length; k+=2) {
                if (cells[k].textContent) {
                    lookuplist.push([cells[k].textContent, cells[k+1].textContent]);
                }
            }
        }
    }
}

function initBindings() {
    document.body.addEventListener("keydown", function(e) {
        if (e.key == "x" || e.key == "X") {
            keyDown();
        }
    });
    document.body.addEventListener("keyup", function(e) {
        if (e.key == "x" || e.key == "X") {
            keyUp();
        }
    });
    document.getElementById("key").addEventListener("mousedown", function(e) {
        keyDown();
    });
    document.getElementById("key").addEventListener("mouseup", function(e) {
        keyUp();
    });
    document.getElementById("volume-down").addEventListener("click", function (e) {
        volumeDown();
    });
    document.getElementById("volume-up").addEventListener("click", function (e) {
        volumeUp();
    });
    document.getElementById("encode-btn").addEventListener("click", function (e) {
        document.getElementById("compcode").value = encode(document.getElementById("comptext").value);
    });
    document.getElementById("decode-btn").addEventListener("click", function (e) {
        document.getElementById("comptext").value = decode(document.getElementById("compcode").value);
    });
    document.getElementById("play-code-button").addEventListener("click", function (e) {
        playCode(document.getElementById("compcode").value);
    });
    document.getElementById("clear-user-btn").addEventListener("click", function (e) {
        clearUser();
    });
}

function volumeDown() {
    volume -= 5;
    if (volume < 0) volume = 0;
    setVolume();
}

function volumeUp() {
    volume += 5;
    if (volume > 100) volume = 100;
    setVolume();
}

function setVolume() {
    gainNode.gain.setValueAtTime(volume / 600, audioCtx.currentTime);
    text = volume + "%";
    text = " ".repeat(4 - text.length) + text;
    document.getElementById("volume-display").textContent = text;
}


function keyDown() {
    if (keyState) return;
    keyState = true;
    document.getElementById("key").classList.remove("btn-primary");
    document.getElementById("key").classList.add("btn-danger");
    oscPlay();
    timerStart();
}
function keyUp() {
    keyState = false;
    document.getElementById("key").classList.add("btn-primary");
    document.getElementById("key").classList.remove("btn-danger");
    oscStop();
    timerStop();
    document.getElementById("usertext").textContent = decode(message);
    document.getElementById("usercode").textContent = message;
}

function oscPlay() {
    oscillator.start();
}

function oscStop() {
    oscillator.stop();
    oscillator = audioCtx.createOscillator();
    oscillator.type = 'square';
    oscillator.frequency.value = 475; // value in hertz
    oscillator.connect(gainNode);
}

function clearUser() {
    message = "";
    document.getElementById("usertext").textContent = " ";
    document.getElementById("usercode").textContent = " ";
}