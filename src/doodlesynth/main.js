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
        this.a = [0,0,0,0];
        this.s = [100,100,100,100];
        this.d = [0,0,0,0];
    }

    update(id, a, s, d){
        switch (id){
            case 0:
                this.a[0] = a;
                this.s[0] = s;
                this.d[0] = d;
                break;
            case 1:
                this.a[1] = a;
                this.s[1] = s;
                this.d[1] = d;
                break;
            case 2:
                this.a[2] = a;
                this.s[2] = s;
                this.d[2] = d;
                break;
            case 3:
                this.a[3] = a;
                this.s[3] = s;
                this.d[3] = d;
                break;
        }
    }
}

// audio functions:

function newContext() {
    context = new AudioContext({latencyHint: "interactive", sampleRate:44100});
}

// Controllers

 // presets:
function sine(){

}

 function tabClick(color){
     if (color === "black") {
         attack.val(100 - env.a[0]);
         sustain.val(100 - env.s[0]);
         decay.val(100 - env.d[0]);
         document.documentElement.style.setProperty('--selected-color', '#000000')
         document.documentElement.style.setProperty('--selected-color2', '#eeeeee')
         document.documentElement.style.setProperty('--selected-border', '#000000')

     }

     if (color === "red") {
         attack.val(100 - env.a[1]);
         sustain.val(100 - env.s[1]);
         decay.val(100 - env.d[1]);
         document.documentElement.style.setProperty('--selected-color', '#220000')
         document.documentElement.style.setProperty('--selected-color2', '#ff8888')
         document.documentElement.style.setProperty('--selected-border', '#221111')

     }

     if (color === "blue") {
         attack.val(100 - env.a[2]);
         sustain.val(100 - env.s[2]);
         decay.val(100 - env.d[2]);
         document.documentElement.style.setProperty('--selected-color', '#000022')
         document.documentElement.style.setProperty('--selected-color2', '#8888ff')
         document.documentElement.style.setProperty('--selected-border', '#333355')

     }

     if (color === "yellow") {
         attack.val(100 - env.a[3]);
         sustain.val(100 - env.s[3]);
         decay.val(100 - env.d[3]);
         document.documentElement.style.setProperty('--selected-color', '#333300')
         document.documentElement.style.setProperty('--selected-color2', '#ff9966')
         document.documentElement.style.setProperty('--selected-border', '#444400')

     }

 }

function loadEnvelope(){
    switch (COLOR){
        case "black":
            attack.val(100 - env.a[0]);
            sustain.val(100 - env.s[0]);
            decay.val(100 - env.d[0]);
            break;
        case "red":
            attack.val(100 - env.a[1]);
            sustain.val(100 - env.s[1]);
            decay.val(100 - env.d[1]);
            break;
        case "blue":
            attack.val(100 - env.a[2]);
            sustain.val(100 - env.s[2]);
            decay.val(100 - env.d[2]);
            break;
        case "yellow":
            attack.val(100 - env.a[3]);
            sustain.val(100 - env.s[3]);
            decay.val(100 - env.d[3]);
            break;
    }

}

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
 var compressor;

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
     attack.val(100 - env.a[0]);
     sustain.val(100 - env.s[0]);
     decay.val(100 - env.d[0]);
     document.documentElement.style.setProperty('--selected-color', '#000000')
     document.documentElement.style.setProperty('--selected-color2', '#eeeeee77')
     document.documentElement.style.setProperty('--selected-border', '#000000')
     console.log(COLOR);
 });
 redButton.addEventListener('click', function() {
     COLOR = 'red';
     ID = 1;
     attack.val(100 - env.a[1]);
     sustain.val(100 - env.s[1]);
     decay.val(100 - env.d[1]);
     document.documentElement.style.setProperty('--selected-color', '#220000')
     document.documentElement.style.setProperty('--selected-color2', '#ff888877')
     document.documentElement.style.setProperty('--selected-border', '#221111')
 });
 blueButton.addEventListener('click', function() {
     COLOR = 'blue';
     ID = 2;
     attack.val(100 - env.a[2]);
     sustain.val(100 - env.s[2]);
     decay.val(100 - env.d[2]);
     document.documentElement.style.setProperty('--selected-color', '#000022')
     document.documentElement.style.setProperty('--selected-color2', '#8888ff77')
     document.documentElement.style.setProperty('--selected-border', '#333355')
     console.log(COLOR);
 });
 yellowButton.addEventListener('click', function() {
     COLOR = 'yellow';
     ID = 3;
     attack.val(100 - env.a[3]);
     sustain.val(100 - env.s[3]);
     decay.val(100 - env.d[3]);
     document.documentElement.style.setProperty('--selected-color', '#333300')
     document.documentElement.style.setProperty('--selected-color2', '#ff996677')
     document.documentElement.style.setProperty('--selected-border', '#444400')
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



 document.getElementById("schro").addEventListener('click', () => {
    document.getElementById("tooltip").style.setProperty("visibility", "visible")
 });

canvas.addEventListener('mousedown', (e) => {
    isClick = true;
    // create audio context, but only create buffers when mouseup
    if (!context) {
        newContext();
        compressor = context.createDynamicsCompressor();

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

document.getElementById('envelope').addEventListener('mouseover', () => {
     env.update(ID, 100 - attack.val(null), 100 - sustain.val(null), 100 - decay.val(null));
     console.log("updated envelope", attack.val(null), sustain.val(null), decay.val(null));
 });

document.getElementById("schro").addEventListener('click', () => {

})

/* playback & Audio handling

*/

 let play = document.getElementById('test');

 play.addEventListener('click', function() {

     noteOn(69);
     setTimeout(function() {
         noteOff(69);
     }, 1000);
 });

 //midi handler:

 let midi = null; // global MIDIAccess object
 function onMIDISuccess(midiAccess) {
     console.log("MIDI ready!");
     midi = midiAccess; // store in the global (in real usage, would probably keep in an object instance)
     listInputsAndOutputs(midi);
     startLoggingMIDIInput(midi);
 }

 function onMIDIFailure(msg) {
     console.error(`Failed to get MIDI access - ${msg}`);
 }

 navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

 function listInputsAndOutputs(midiAccess) {
     for (const entry of midiAccess.inputs) {
         const input = entry[1];
         console.log(
             `Input port [type:'${input.type}']` +
             ` id:'${input.id}'` +
             ` manufacturer:'${input.manufacturer}'` +
             ` name:'${input.name}'` +
             ` version:'${input.version}'`,
         );
     }

     for (const entry of midiAccess.outputs) {
         const output = entry[1];
         console.log(
             `Output port [type:'${output.type}'] id:'${output.id}' manufacturer:'${output.manufacturer}' name:'${output.name}' version:'${output.version}'`,
         );
     }
 }

 // list of 10 active notes:


 function onMIDIMessage(event) {
     let str = `MIDI message received at timestamp ${event.timeStamp}[${event.data.length} bytes]: `;
     for (const character of event.data) {
         str += `0x${character.toString(16)} `;
     }
     console.log(str);
     if (event.data[0] === 144){
         noteOn(event.data[1])
     }
     else if (event.data[0] === 128){
         noteOff(event.data[1])
     }
 }

 function startLoggingMIDIInput(midiAccess) {
     midiAccess.inputs.forEach((entry) => {
         entry.onmidimessage = onMIDIMessage;
     });
 }

 /// Start and stop note function:
 const keyboard = new AudioKeys();

 keyboard.down( function(note) {
     noteOn(note.note);
 });

 keyboard.up( function(note) {
     noteOff(note.note);
 });

 const Voice = (function() {

     //let localContext = new AudioContext({latencyHint: "interactive", sampleRate:44100});

     function Voice(frequency, localContext){
         this.frequency = frequency;

         this.bufferArray = Array(4);
         this.source = Array(4);
         this.gainNode = Array(4);

     }

     Voice.prototype.start = function(localContext) {

         for (let i = 0; i < 4; i++) {
             if (buffers[i].active){
                 this.source[i] = localContext.createBufferSource();
                 this.bufferArray[i] = localContext.createBuffer(1, (SAMPLE_RATE / this.frequency), SAMPLE_RATE);
                 console.log(this.bufferArray[i]);

                 buffers[i].fillBuffer(this.bufferArray[i].getChannelData(0), this.frequency, SAMPLE_RATE, 32);

                 console.log(buffers[i]);

                 this.gainNode[i] = localContext.createGain();
                 this.gainNode[i].gain.setValueAtTime(0.0, localContext.currentTime);
                 if (env.a[i] > 0){
                     this.gainNode[i].gain.linearRampToValueAtTime(1.0, localContext.currentTime + (env.a[i]  / 50)); // envelope
                 }
                 this.gainNode[i].gain.setValueAtTime((env.s[i] / 100), localContext.currentTime + (env.a[i] / 50)); // envelope
                 //gainNode0.gain.linearRampToValueAtTime(0.0, context.currentTime + 10);

                 this.source[i].buffer = this.bufferArray[i];
                 this.source[i].connect(this.gainNode[i]);

                 this.source[i].loop = true;

                 this.gainNode[i].connect(compressor);
                 compressor.connect(localContext.destination);
                 this.source[i].start();

                 console.log(env.a[i], env.s[i], env.d[i])
             }
         }

     }
     Voice.prototype.stop = function(localContext) {
         for (let i = 0; i < 4; i++) {
             if (buffers[i].active){
                 if (env.d[i] === 0){
                     this.source[i].stop();
                 }
                 else {

                     const now = localContext.currentTime;
                     const releaseTime = localContext.currentTime + (env.d[i]/50);

                     this.gainNode[i].gain.cancelScheduledValues(now);

                     this.gainNode[i].gain.setValueAtTime(this.gainNode[i].gain.value, now);
                     this.gainNode[i].gain.linearRampToValueAtTime(0.0, releaseTime); // envelope

                     this.source[i].stop(releaseTime);
                 }
             }}



     }



     return Voice;
 })(context);

 const voice = Array(126);

 function noteOn(note) {
     //const frequency
     console.log(note);
     const frequency = 440 * (2**((note-69) / 12));
     console.log(frequency);

     voice[note] = new Voice(frequency, context);
     voice[note].start(context)
 }

 function noteOff(note) {

     voice[note].stop(context);

 }


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


