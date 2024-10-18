//import "./noteEvent"
//var keys = require("./audiokeys/AudioKeys.js");
var keyboard = new AudioKeys();

const amplitude = new Array(32).fill(0.0);

const canvas = document.getElementById('canvas');
let isClick = false;

canvas.addEventListener('mousedown', (e) => {
    isClick = true;
    let px = document.elementFromPoint(e.clientX,e.clientY);
    updateT(px.id);

});
canvas.addEventListener('mousemove', (e) => {
   if (isClick) {
       let px = document.elementFromPoint(e.clientX,e.clientY);
       updateT(px.id);
   }
});
canvas.addEventListener('mouseup', () => {
    isClick = false;
});


function updateT(element) {
    //Stupid JS no int division...
    let column = Math.floor(element / 100);
    let row = element % 100;

    amplitude[column] = normalize(row);
    console.log("Update:", amplitude);
    resetColumn(column, row);
}

function normalize(amp) {
    amp = (amp-15.5)/15.5;
    return amp;
}

function resetColumn(column, row) {
    console.log(column);
    const parent = document.getElementById(column+32);
    let children = parent.children;
    for (let i = 0; i < children.length; i++) {
        if (i != row) {

            children.item(i).style.backgroundColor = "white";
        }
        else {
            children.item(row).style.backgroundColor = "black";
        }
    }
}



// Renderer:
// Fun idea: add more colors for multiple oscillators!
// Most of this is from j2i blog, thank you!
const SAMPLE_RATE = 44100;
const CHANNEL_COUNT = 1;
const SAMPLE_COUNT = 2 * SAMPLE_RATE;
const SPEED = 32;
const TARGET_FREQUENCY = 440;


const button = document.querySelector("Button");
var context;

// may not be necessary?? ,
//AudioContext = window.AudioContext || window.webkitAudioContext;
function newContext() {
    context = new AudioContext({latencyHint: "interactive", sampleRate:44100});
}

function getAmp(freq, sampleIndex) {
    return amplitude[Math.floor(((freq / SAMPLE_RATE) * sampleIndex * SPEED) % 32)];
}

/// have a toggle for each note. Idk
keyboard.down( function(note) {
    console.log(`Note on: ${note.frequency}`)
});

keyboard.up( function(note) {
    console.log(`Note off: ${note.pitch}`)
});

button.onclick = () => {
    if (!context) {
        newContext();
    }
    const audioBuffer = context.createBuffer(CHANNEL_COUNT, SAMPLE_COUNT, SAMPLE_RATE);
    const dx = 1 / (SAMPLE_RATE * TARGET_FREQUENCY);

    const channelBuffer = audioBuffer.getChannelData(0);
    for(let i=0, x=0;i<SAMPLE_COUNT;++i, x+=dx) {
        channelBuffer[i] = getAmp(TARGET_FREQUENCY, i);
    }
    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(context.destination);
    source.start();
}

