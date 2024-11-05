 class bufferSynth {

    constructor(name) {
        this.amplitude = new Array(32).fill(0.0);
        this.active = false;
        this.animated = false;
        this.name = name;
        //jank upcoming Actually idk if this is nessicary

        if (name === "black") {this.id = 0;}
        if (name === "red") {this.id = 1;}
        if (name === "blue") {this.id = 2;}
        if (name === "yellow") {this.id = 3;}

    }

    setValue(index, value) {
        // Takes the non-Normalised amplitude.
        this.active = true;
        this.amplitude[index] = (value - 15.5) / 15.5
    }

    getValue(column){
        return (this.amplitude[column] * 15.5) + 15.5;
    }

    reset(){
        this.active = false;
        this.amplitude.fill(0.0);
    }

    getAmp(freq, sampleIndex, SAMPLE_RATE, SPEED) {
        return this.amplitude[Math.floor(((freq / SAMPLE_RATE) * sampleIndex * SPEED) % 32)];
    }

    fillBuffer(channelBuffer, freq, SAMPLE_RATE, SPEED) {
        if (this.animated) {
            throw "animation not currently supported";
        }
        else if (this.active) {
            console.log("active")
            const dx = 1 / (SAMPLE_RATE * freq);
            //const count = 10 * (SAMPLE_RATE / freq)


            for(
                let i=0, x=0;
                i < (SAMPLE_RATE * 2);
                ++i, x+=dx) {
                channelBuffer[i] = this.getAmp(freq, i, SAMPLE_RATE, SPEED);
            }
        }
    }

}
class envelope{
    constructor(){
        this.a0 = 0;
        this.s0 = 100;
        this.d0 = 0;
        this.a1 = 0;
        this.s1 = 100;
        this.d1 = 0;
        this.a2 = 0;
        this.s2 = 100;
        this.d2 = 0;
        this.a3 = 0;
        this.s3 = 100;
        this.d3 = 0;
    }

    update(id, a, s, d){
        switch (id){
            case 0:
                this.a0 = a;
                this.s0 = s;
                this.d0 = d;
                break;
            case 1:
                this.a1 = a;
                this.s1 = s;
                this.d1 = d;
                break;
            case 2:
                this.a2 = a;
                this.s2 = s;
                this.d2 = d;
                break;
            case 3:
                this.a3 = a;
                this.s3 = s;
                this.d3 = d;
                break;
        }
    }
}

// audio functions:

function newContext() {
    context = new AudioContext({latencyHint: "interactive", sampleRate:44100});
}

// Controllers
const CHANNELS = 4;
const canvas = document.getElementById('canvas');
const form  = document.querySelector('form');
let isClick = false;
let COLOR = 'black';
let ID = 0;
const buffers = new Array(CHANNELS);
var context;
const SAMPLE_RATE = 44100;
const SAMPLE_COUNT = SAMPLE_RATE * 2;
var completeBuffer;
const env = new envelope();
var prevAmplitude = 0; //cosmetic

//Populate channels
 buffers[0] = new bufferSynth('black');
 buffers[1] = new bufferSynth('red');
 buffers[2] = new bufferSynth('blue');
 buffers[3] = new bufferSynth('yellow');

/*button.onclick = () => {
    COLOR = button.innerHTML;
    console.log(COLOR);
    }
    */

 let blackButton = document.getElementById('black');
 let redButton = document.getElementById('red');
 let blueButton = document.getElementById('blue');
 let yellowButton = document.getElementById('yellow');

 blackButton.addEventListener('click', function() {
     COLOR = 'black';
     ID = 0;
     console.log(COLOR);
 });
 redButton.addEventListener('click', function() {
     COLOR = 'red';
     ID = 2;
     console.log(COLOR);
 });
 blueButton.addEventListener('click', function() {
     COLOR = 'blue';
     ID = 3;
     console.log(COLOR);
 });
 yellowButton.addEventListener('click', function() {
     COLOR = 'yellow';
     ID = 4;
     console.log(COLOR);
 });

function updateT(element){
    if (element.toString() !== 'canvas') {
        console.log(element)
        let column = Math.floor(element / 100);
        let row = element % 100;

        for (let i = 0; i < 4; i++) {
            if (buffers[i].name === COLOR) {
                buffers[i].setValue(column, row);
                console.log("Value set!")
            }
        }

        let lineStyle = document.forms["settings"]["style"].value

        if (lineStyle === "line"){
            if (column === 0) {
                prevAmplitude = row;
            }
            else {
                prevAmplitude = buffers[ID].getValue(column - 1);
            }
            resetColumn(column, row, COLOR, row)
        }

        else {
            resetColumn(column, row, COLOR, 32)
        }
    }
    else { isClick = false; }
}

function resetColumn(column, row, color, prev) {
    console.log(column);
    const parent = document.getElementById(column+32);
    let children = parent.children;
    for (let i = 0; i < children.length; i++) {
        if ((i >= row && i < prev) || (i <= row && i > prev) || ( i === prev && i === row)) {
            if (color === 'black'){
                children.item(i).style.setProperty('--color1', 'black');
            }
            if (color === 'red'){
                children.item(i).style.setProperty('--color2', 'red');
            }
            if (color === 'blue'){
                children.item(i).style.setProperty('--color3',  'blue');
            }
            if (color === 'yellow'){
                children.item(i).style.setProperty('--color4', 'orange');
            }
        }
        else {
            if (color === 'black'){
                children.item(i).style.setProperty('--color1', 'white');
            }
            if (color === 'red'){
                children.item(i).style.setProperty('--color2', 'white');
            }
            if (color === 'blue'){
                children.item(i).style.setProperty('--color3', 'white');
            }
            if (color === 'yellow'){
                children.item(i).style.setProperty('--color4', 'white');
            }
        }
    }
}


canvas.addEventListener('mousedown', (e) => {
    isClick = true;
    // create audio context, but only create buffers when mouseup
    if (!context) {
        newContext();

    }

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

    //audio
    completeBuffer = context.createBuffer(CHANNELS, SAMPLE_COUNT, SAMPLE_RATE);
});

form.addEventListener('change', () => {
     env.update(ID, document.forms["env"]["a"].value, document.forms["env"]["s"].value, document.forms["env"]["d"].value);
     console.log("updated envelope");
 });


/* playback & Audio handling



*/

 let play = document.getElementById('play');

 play.addEventListener('click', function() {

     const frequency = 440;
     console.log('i');
     for (let i = 0; i < 4; i++) {
         buffers[i].fillBuffer(completeBuffer.getChannelData(i), frequency, SAMPLE_RATE, 16);
         console.log(buffers[i]);
     }

     const source = context.createBufferSource();
     source.buffer = completeBuffer;
     const splitter = context.createChannelSplitter(4);
     source.connect(splitter);
     const merger = context.createChannelMerger(4);
     /*const gainNodes = Array(4);

     for (i = 0; i > 4; i++){
         gainNodes[i] = context.createGain();

     }*/

     const gainNode0 = context.createGain();
     gainNode0.gain.setValueAtTime(0.0, context.currentTime + 0);
     gainNode0.gain.linearRampToValueAtTime(1.0, context.currentTime + (env.a0 / 10)); // envelope
     gainNode0.gain.setValueAtTime((env.s0 / 100), context.currentTime + 10); // envelope
     //gainNode0.gain.linearRampToValueAtTime(0.0, context.currentTime + 10);
     splitter.connect(gainNode0, 0);

     const gainNode1 = context.createGain();
     gainNode1.gain.setValueAtTime(0.0, context.currentTime + 0);
     gainNode1.gain.linearRampToValueAtTime(1.0, (context.currentTime + (env.a1 / 10))); // envelope
     gainNode1.gain.setValueAtTime((env.s0 / 100), context.currentTime + 10); // envelope
     //gainNode1.gain.linearRampToValueAtTime(0.0, context.currentTime + 10);
     splitter.connect(gainNode1, 1);

     gainNode0.connect(merger, 0, 0);
     gainNode1.connect(merger, 0, 1);


     source.connect(merger).connect(context.destination);
     source.start();
 });



 // Notes:
 // Maybe add automatic canvas population?
 // buffer created for length of decay, repeat section of frequency.
 // customisable colors
 // Animation
 // To do:
 // Finish website. kofi, fill out yt, create post system, tweak
 //.  home screen, sitemap, CNAME. Video page instead of contact. visit count? -1 day
 // Presets
 // Package inclusion & pitch control & envelope - 1 Day
 // Gui and design - 2 Days
 // Help page - 1/2
 // Fixes:
 // 1 page code
 // errors highlighting the columns
 //


