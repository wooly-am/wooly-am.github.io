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


// audio functions:

function newContext() {
    context = new AudioContext({latencyHint: "interactive", sampleRate:44100});
}

// Controllers
const CHANNELS = 4;
const canvas = document.getElementById('canvas');
let isClick = false;
let COLOR = 'black';
const buffers = new Array(CHANNELS);
var context;
const SAMPLE_RATE = 44100;
const SAMPLE_COUNT = SAMPLE_RATE * 2;
var completeBuffer;

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
     console.log(COLOR);
 });
 redButton.addEventListener('click', function() {
     COLOR = 'red';
     console.log(COLOR);
 });
 blueButton.addEventListener('click', function() {
     COLOR = 'blue';
     console.log(COLOR);
 });
 yellowButton.addEventListener('click', function() {
     COLOR = 'yellow';
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
        resetColumn(column, row, COLOR)
    }
    else { isClick = false; }
}

function resetColumn(column, row, color) {
    console.log(column);
    const parent = document.getElementById(column+32);
    let children = parent.children;
    for (let i = 0; i < children.length; i++) {
        if (i === row) {
            if (color === 'black'){
                children.item(i).style.setProperty('--color1', 'black');
            }
            if (color === 'red'){
                children.item(i).style.setProperty('--color2', 'orange');
            }
            if (color === 'blue'){
                children.item(i).style.setProperty('--color3',  'purple');
            }
            if (color === 'yellow'){
                children.item(i).style.setProperty('--color4', 'cyan');
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

//playback

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
     console.log(completeBuffer);
     source.connect(context.destination);
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


