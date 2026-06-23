/**
 * @copyright 2026 KittKat
 */

let lookuplist = [
    [" ", " / "],
];

const defaultWPM = 12;

addEventListener("DOMContentLoaded", (event) => {
    initBindings();
    loadLookupList();
    text = document.getElementById("comptext").textContent;
    document.getElementById("compcode").textContent = encode(text);
});

let keyState = false;

let audioCtx = new(window.AudioContext || window.webkitAudioContext)();
// create Oscillator node
let oscillator;
const gainNode = audioCtx.createGain();
gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime); // 50% volume
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
    for (let i = 0; i < lookuplist.length; i++) {
        if (lookuplist[i][1] == text.toUpperCase()) {
            return lookuplist[i][0];
        }
    }
    return String.fromCodePoint(0xFFFD);
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
    }, wpmToUnit(defaultWPM) * 1.05);
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
    }, wpmToUnit(defaultWPM) * 1.05);
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
}

function keyDown() {
    if (keyState) return;
    keyState = true;
    document.getElementById("key").classList.remove("btn-primary");
    document.getElementById("key").classList.add("btn-danger");
    oscillator.start();
    timerStart();
}
function keyUp() {
    keyState = false;
    document.getElementById("key").classList.add("btn-primary");
    document.getElementById("key").classList.remove("btn-danger");
    oscillator.stop();
    timerStop();
    document.getElementById("usertext").textContent = decode(message);
    document.getElementById("usercode").textContent = message;
    oscillator = audioCtx.createOscillator();
    oscillator.type = 'square';
    oscillator.frequency.value = 475; // value in hertz
    oscillator.connect(gainNode);
}