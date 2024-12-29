 class bufferSynth {

    constructor(name) {
        this.amplitude = new Array(32).fill(0.0);
        this.active = false;
        this.animated = false;
        this.name = name;
        //jank upcoming Actually idk if this is nessicary

        if (name === "black") {this.id = 0;}
        if (name === "red") {this.id = 1;}
        if (name === "yellow") {this.id = 2;}
        if (name === "blue") {this.id = 3;}

    }

    setValue(index, value) {
        // Takes the non-Normalised amplitude.
        this.active = true;
        this.amplitude[index] = (value - 15.5) / 15.5
    }

    activate(){
        this.active = true;
    }

    deactivate(){
        this.active = false;
        this.amplitude = new Array(32).fill(0.0);
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
            //console.log("active")
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
        this.d = [0,0,0,0];
        this.s = [99,99,99,99];
        this.r = [0,0,0,0];

        document.getElementById("a").value = 0;
        document.getElementById("d").value = 0;
        document.getElementById("s").value = 99;
        document.getElementById("r").value = 0;
    }

    update(id, a, d, s, r){
        console.log(id,a,s,d,r);
        this.a[id] = a;
        this.d[id] = d;
        this.s[id] = s;
        this.r[id] = r;
    }

}

// Constants and Init:

 const CHANNELS = 4;
 const SAMPLE_RATE = 44100;
 const SAMPLE_COUNT = SAMPLE_RATE * 2;
 let ID = 0;

 let isClick = false;
 let msgNum = 0;

 const env = new envelope();
 const buffers = new Array(CHANNELS);

 var context;
 var compressor;
 var completeBuffer;

 const canvas = document.getElementById('canvas');

 // Presets:
 const sine = [-0.0967741935483871,-0.22580645161290322,-0.41935483870967744,-0.6129032258064516,-0.7419354838709677,-0.8709677419354839,-0.9354838709677419,-1,-1,-1,-0.9354838709677419,-0.8709677419354839,-0.7419354838709677,-0.6129032258064516,-0.41935483870967744,-0.16129032258064516,0.03225806451612903,0.22580645161290322,0.41935483870967744,0.6129032258064516,0.7419354838709677,0.8709677419354839,0.9354838709677419,1,1,0.9354838709677419,0.8709677419354839,0.7419354838709677,0.6129032258064516,0.41935483870967744,0.22580645161290322,0.03225806451612903];
 const square = [-0.8709677419354839,-0.8709677419354839,-0.8709677419354839,-0.8709677419354839,-0.8709677419354839,-0.8709677419354839,-0.8709677419354839,-0.8709677419354839,-0.8709677419354839,-0.8709677419354839,-0.8709677419354839,-0.8709677419354839,-0.8709677419354839,-0.8709677419354839,-0.8709677419354839,-0.8709677419354839,0.9354838709677419,0.9354838709677419,0.9354838709677419,0.9354838709677419,0.9354838709677419,0.9354838709677419,0.9354838709677419,0.9354838709677419,0.9354838709677419,0.9354838709677419,0.9354838709677419,0.9354838709677419,0.9354838709677419,0.9354838709677419,0.9354838709677419,0.9354838709677419];
 const saw = [-0.03225806451612903,-0.0967741935483871,-0.16129032258064516,-0.22580645161290322,-0.2903225806451613,-0.3548387096774194,-0.41935483870967744,-0.4838709677419355,-0.5483870967741935,-0.6129032258064516,-0.6774193548387096,-0.7419354838709677,-0.8064516129032258,-0.8709677419354839,-0.9354838709677419,-1,1,0.9354838709677419,0.8709677419354839,0.8064516129032258,0.7419354838709677,0.6774193548387096,0.6129032258064516,0.5483870967741935,0.4838709677419355,0.41935483870967744,0.3548387096774194,0.2903225806451613,0.22580645161290322,0.16129032258064516,0.0967741935483871,0.03225806451612903];

const fun1 = [[ -0.0967741935483871,-0.22580645161290322,-0.41935483870967744,-0.6129032258064516,-0.7419354838709677,-0.8709677419354839,-0.9354838709677419,-1,-1,-1,-0.9354838709677419,-0.8709677419354839,-0.7419354838709677,-0.6129032258064516,-0.41935483870967744,-0.16129032258064516 ,0.03225806451612903 ,0.22580645161290322 ,0.41935483870967744 ,0.6129032258064516 ,0.7419354838709677 ,0.8709677419354839 ,0.9354838709677419 ,1 ,1 ,0.9354838709677419 ,0.8064516129032258 ,0.7419354838709677 ,0.6129032258064516 ,0.41935483870967744 ,0.22580645161290322 ,0.03225806451612903],[ 0.8064516129032258 ,0.8709677419354839 ,0.6774193548387096 ,1 ,0.8064516129032258 ,0.8709677419354839 ,0.6774193548387096 ,1 ,0.8064516129032258 ,0.7419354838709677 ,0.6774193548387096 ,0.7419354838709677 ,0.8064516129032258 ,0.7419354838709677 ,0.9354838709677419 ,0.8064516129032258 ,0.8064516129032258 ,0.8709677419354839 ,0.6774193548387096 ,1 ,0.8064516129032258 ,0.8709677419354839 ,0.6774193548387096 ,1 ,0.8064516129032258 ,0.8709677419354839 ,0.6774193548387096 ,1 ,0.8064516129032258 ,0.8709677419354839 ,0.6774193548387096 ,1],[ -0.03225806451612903 ,-0.03225806451612903 ,-0.0967741935483871 ,-0.0967741935483871 ,-0.16129032258064516 ,-0.16129032258064516 ,-0.22580645161290322 ,-0.22580645161290322 ,-0.2903225806451613 ,-0.2903225806451613 ,-0.3548387096774194 ,-0.3548387096774194 ,-0.41935483870967744 ,-0.41935483870967744 ,-0.4838709677419355 ,-0.4838709677419355 ,0.4838709677419355 ,0.4838709677419355 ,0.41935483870967744 ,0.41935483870967744 ,0.3548387096774194 ,0.3548387096774194 ,0.2903225806451613 ,0.2903225806451613 ,0.22580645161290322 ,0.22580645161290322 ,0.16129032258064516 ,0.16129032258064516 ,0.0967741935483871 ,0.0967741935483871 ,0.03225806451612903 ,0.03225806451612903]];
 const fun1Env = [[23,0,99,15],[12,8,29,9],[44,0,99,10]];
const fun2 = [[-0.03225806451612903,-0.16129032258064516,-0.41935483870967744,-0.6129032258064516,-0.7419354838709677,-0.8064516129032258,-0.8709677419354839,-0.9354838709677419,-0.9354838709677419,-0.8709677419354839,-0.8709677419354839,-0.7419354838709677,-0.4838709677419355,-0.2903225806451613,-0.0967741935483871,0.03225806451612903,0.0967741935483871,0.0967741935483871,0.03225806451612903,-0.0967741935483871,-0.0967741935483871,-0.0967741935483871,-0.03225806451612903,0.41935483870967744,0.6129032258064516,0.7419354838709677,0.8064516129032258,0.8064516129032258,0.7419354838709677,0.6774193548387096,0.5483870967741935,0.3548387096774194],[0.0967741935483871,0.16129032258064516,-0.03225806451612903,-0.3548387096774194,-0.6129032258064516,-0.6774193548387096,-0.6129032258064516,-0.0967741935483871,0.22580645161290322,0.3548387096774194,0.4838709677419355,0.4838709677419355,0.41935483870967744,0.2903225806451613,0.16129032258064516,-0.03225806451612903,-0.2903225806451613,-0.5483870967741935,-0.6774193548387096,-0.7419354838709677,-0.7419354838709677,-0.6774193548387096,-0.6129032258064516,-0.4838709677419355,-0.3548387096774194,-0.2903225806451613,-0.22580645161290322,-0.16129032258064516,-0.16129032258064516,-0.16129032258064516,-0.16129032258064516,-0.22580645161290322],[0.2903225806451613,0.22580645161290322,0.0967741935483871,0.03225806451612903,0.2903225806451613,0.16129032258064516,0.0967741935483871,0.03225806451612903,0.22580645161290322,-0.0967741935483871,-0.2903225806451613,0.3548387096774194,0.2903225806451613,-0.0967741935483871,-0.3548387096774194,0.4838709677419355,0.41935483870967744,0.3548387096774194,-0.16129032258064516,-0.5483870967741935,0.41935483870967744,0.3548387096774194,0.16129032258064516,-0.0967741935483871,0.4838709677419355,0.41935483870967744,0.16129032258064516,-0.2903225806451613,0.5483870967741935,0.41935483870967744,0.0967741935483871,-0.22580645161290322],[-0.0967741935483871,0.22580645161290322,-0.0967741935483871,0.22580645161290322,-0.0967741935483871,0.22580645161290322,-0.0967741935483871,0.22580645161290322,-0.0967741935483871,0.22580645161290322,-0.0967741935483871,0.22580645161290322,-0.0967741935483871,0.22580645161290322,-0.0967741935483871,0.22580645161290322,-0.0967741935483871,0.22580645161290322,-0.0967741935483871,0.22580645161290322,-0.0967741935483871,0.22580645161290322,-0.0967741935483871,0.22580645161290322,-0.0967741935483871,0.22580645161290322,-0.0967741935483871,0.22580645161290322,-0.0967741935483871,0.22580645161290322,-0.0967741935483871,0.22580645161290322]];
const fun2Env = [[14,0,99,5],[17,0,99,5],[23,0,99,5],[30,0,99,5]];
const flute = [[-0.0967741935483871,-0.22580645161290322,-0.41935483870967744,-0.6129032258064516,-0.7419354838709677,-0.8709677419354839,-0.9354838709677419,-1,-1,-1,-0.9354838709677419,-0.8709677419354839,-0.8064516129032258,-0.6774193548387096,-0.4838709677419355,-0.2903225806451613,-0.16129032258064516,0.22580645161290322,0.41935483870967744,0.4838709677419355,0.7419354838709677,0.8709677419354839,0.8709677419354839,0.8709677419354839,0.8709677419354839,0.8709677419354839,0.8709677419354839,0.7419354838709677,0.6129032258064516,0.41935483870967744,0.22580645161290322,0.03225806451612903],[-0.16129032258064516,-0.3548387096774194,-0.4838709677419355,-0.6129032258064516,-0.6129032258064516,-0.4838709677419355,-0.3548387096774194,-0.16129032258064516,0.22580645161290322,0.41935483870967744,0.5483870967741935,0.6774193548387096,0.6774193548387096,0.5483870967741935,0.41935483870967744,0.22580645161290322,-0.16129032258064516,-0.3548387096774194,-0.4838709677419355,-0.6129032258064516,-0.6129032258064516,-0.4838709677419355,-0.3548387096774194,-0.16129032258064516,0.22580645161290322,0.41935483870967744,0.5483870967741935,0.6774193548387096,0.6774193548387096,0.5483870967741935,0.41935483870967744,0.22580645161290322],[0.03225806451612903,-0.22580645161290322,0.03225806451612903,0.2903225806451613,0.03225806451612903,-0.22580645161290322,0.03225806451612903,0.2903225806451613,0.03225806451612903,-0.22580645161290322,0.03225806451612903,0.2903225806451613,0.03225806451612903,-0.22580645161290322,0.03225806451612903,0.2903225806451613,0.03225806451612903,-0.22580645161290322,0.03225806451612903,0.2903225806451613,0.03225806451612903,-0.22580645161290322,0.03225806451612903,0.2903225806451613,0.03225806451612903,-0.22580645161290322,0.03225806451612903,0.2903225806451613,0.03225806451612903,-0.22580645161290322,0.03225806451612903,0.2903225806451613],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]];
const fluteEnv = [[13,7,88,5],[10,0,99,5],[12,0,99,5]];
const fun3 = [[-0.03225806451612903,-0.0967741935483871,-0.0967741935483871,-0.6129032258064516,-0.16129032258064516,-0.16129032258064516,-0.22580645161290322,-0.22580645161290322,-0.5483870967741935,-0.3548387096774194,-0.3548387096774194,-0.41935483870967744,-0.4838709677419355,-0.5483870967741935,-0.6129032258064516,-0.6129032258064516,0.7419354838709677,0.6774193548387096,0.6774193548387096,0.6129032258064516,0.5483870967741935,0.0967741935483871,0.4838709677419355,0.41935483870967744,0.3548387096774194,0.2903225806451613,0.7419354838709677,0.22580645161290322,0.16129032258064516,0.0967741935483871,0.03225806451612903,-0.3548387096774194],[-0.5483870967741935,-0.6129032258064516,-0.6774193548387096,-0.7419354838709677,-0.8064516129032258,-0.8709677419354839,-0.8709677419354839,-0.8709677419354839,-0.8709677419354839,-0.8709677419354839,-0.8064516129032258,-0.7419354838709677,-0.6774193548387096,-0.6129032258064516,-0.5483870967741935,-0.4838709677419355,0.4838709677419355,0.6129032258064516,0.6774193548387096,0.7419354838709677,0.8064516129032258,0.8709677419354839,0.9354838709677419,0.9354838709677419,0.9354838709677419,0.9354838709677419,0.9354838709677419,0.8709677419354839,0.7419354838709677,0.6774193548387096,0.5483870967741935,0.4838709677419355],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]];
const fun3Env = [[0,2,0,0],[0,5,0,0]];
const fun4 = [[-0.41935483870967744,-0.3548387096774194,-0.3548387096774194,-0.2903225806451613,-0.2903225806451613,-0.2903225806451613,-0.2903225806451613,-0.2903225806451613,-0.2903225806451613,-0.2903225806451613,-0.2903225806451613,-0.2903225806451613,-0.2903225806451613,-0.2903225806451613,-0.3548387096774194,-0.3548387096774194,-0.3548387096774194,-0.3548387096774194,-0.3548387096774194,-0.3548387096774194,-0.41935483870967744,-0.41935483870967744,-0.41935483870967744,-0.41935483870967744,-0.41935483870967744,-0.41935483870967744,-0.41935483870967744,-0.41935483870967744,-0.41935483870967744,-0.41935483870967744,-0.2903225806451613,-0.22580645161290322],[-0.16129032258064516,-0.16129032258064516,-0.16129032258064516,-0.22580645161290322,-0.2903225806451613,-0.3548387096774194,-0.3548387096774194,-0.41935483870967744,-0.3548387096774194,-0.2903225806451613,-0.22580645161290322,-0.16129032258064516,-0.16129032258064516,-0.16129032258064516,-0.16129032258064516,-0.22580645161290322,-0.2903225806451613,-0.3548387096774194,-0.41935483870967744,-0.41935483870967744,-0.3548387096774194,-0.2903225806451613,-0.22580645161290322,-0.16129032258064516,-0.16129032258064516,-0.16129032258064516,-0.16129032258064516,-0.22580645161290322,-0.22580645161290322,-0.2903225806451613,-0.41935483870967744,-0.41935483870967744],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]];
const fun4Env = [[23,77,42,18],[16,37,22,55]];


 // DOM
 const blackButton = document.getElementById('black');
 const redButton = document.getElementById('red');
 const blueButton = document.getElementById('blue');
 const yellowButton = document.getElementById('yellow');
 const tooltip = document.getElementById("tooltip");
 const schro = document.getElementById("schro");
 const attack = document.getElementById("envelopeInput").elements.namedItem("a");
 const decay = document.getElementById("envelopeInput").elements.namedItem("d");
 const sustain = document.getElementById("envelopeInput").elements.namedItem("s");
 const release = document.getElementById("envelopeInput").elements.namedItem("r");

 constUpdate()

 //Populate channels
 buffers[0] = new bufferSynth('black');
 buffers[1] = new bufferSynth('red');
 buffers[2] = new bufferSynth('yellow');
 buffers[3] = new bufferSynth('blue');


 // Schroeder messages!!!

 const messages =
     ["Hello! im Schroeder, click HERE for wiki",
         "To play, Use Midi or keyboard (qwerty and asdf rows)",
         "Try using different envelopes for each colo(u)r :)",
         "Merry hodlidays",
         "ok stop touching me"
 ]

 // FUNCTIONS

 // Output display

 function updateCanvasColumn(row, column){
     buffers[ID].setValue(column, row);

     let lineStyle = document.forms["settings"]["style"].value

     if (lineStyle === "line"){
         resetColumn(column, row, ID, row)
     }
     else {
         resetColumn(column, row, ID, 32)
     }
 }

 function resetColumn(column, row, id, prev) {
     //console.log(column);
     const parent = document.getElementById(column+32);
     let children = parent.children;
     for (let i = 0; i < children.length; i++) {
         if ((i >= row && i < prev) || (i <= row && i > prev) || ( i === prev && i === row)) {
             if (id === 0){
                 children.item(i).style.setProperty('--color1', 'black');
             }
             if (id === 1){
                 children.item(i).style.setProperty('--color2', 'red');
             }
             if (id === 2){
                 children.item(i).style.setProperty('--color4', 'orange');
             }
             if (id === 3){
                 children.item(i).style.setProperty('--color3',  'blue');
             }
         }
         else {
             if (id === 0){
                 children.item(i).style.setProperty('--color1', 'white');
             }
             if (id === 1){
                 children.item(i).style.setProperty('--color2', 'white');
             }
             if (id === 2){
                 children.item(i).style.setProperty('--color4', 'white');
             }
             if (id === 3){
                 children.item(i).style.setProperty('--color3', 'white');
             }
         }
     }
 }

 function loadPreset(buffer, envelope){
     //Input: takes a 2d array of size 4 of 32 floats.
     if (!context) {
         newContext();
         compressor = context.createDynamicsCompressor();
     }
     for (let i = 0; i < buffer.length; i++){
         env.update((i+ ID) % 4, envelope[i][0], envelope[i][1], envelope[i][2], envelope[i][3]);

         attack.value = envelope[i][0];
         decay.value = envelope[i][1];
         sustain.value = envelope[i][2];
         release.value = envelope[i][3];

         buffers[(i+ ID) % 4].activate();
         buffers[(i+ ID) % 4].amplitude = buffer[i];
         //console.log(env.a, env.d, env.s, env.r);

         for(let j = 0; j < buffer[i].length; j++){
             let lineStyle = document.forms["settings"]["style"].value;
             let row = (buffer[i][j] * 15.5) + 15.5;
             if (lineStyle === "line"){
                 resetColumn(j, row, (i+ ID) % 4, row)
             }
             else {
                 resetColumn(j, row, (i+ ID) % 4, 32)
             }
         }
     }
     updateDisplay();
 }

 function loadSimplePreset(buffer){
     if (!context) {
         newContext();
         compressor = context.createDynamicsCompressor();
     }

     buffers[ID].activate();
     buffers[ID].amplitude = buffer;

     for(let j = 0; j < 32; j++){
         let lineStyle = document.forms["settings"]["style"].value
         let row = (buffer[j] * 15.5) + 15.5;
         if (lineStyle === "line"){
             resetColumn(j, row, ID, row)
         }
         else {
             resetColumn(j, row, ID, 32)
         }
     }
 }

 function loadPresetReset(){
     buffers[ID].deactivate();

     for( let j = 0; j < 32; j++){
         resetColumn(j, -3, ID, 0)
     }
 }

function newContext() {
    context = new AudioContext({latencyHint: "interactive", sampleRate:44100});
}

// Schroeder area

 function speak(msg, cooldown){
     document.getElementById("tooltipper").innerText = msg;
     tooltip.style.setProperty("visibility", "visible");
     schro.style.setProperty("animation", "talk 0.3s steps(2) infinite");

     setTimeout(() => {
         document.getElementById("tooltip").style.setProperty("visibility", "hidden")
         document.getElementById("schro").style.setProperty("animation", "idle 0.5s steps(2) infinite");
     }, cooldown * 1000)
 }



/*button.onclick = () => {
    COLOR = button.innerHTML;
    console.log(COLOR);
    }
    */

 function constUpdate(){
     // populates gainNodes

     env.update(ID, attack.value, decay.value, sustain.value, release.value);
     updateDisplay();

    //document.getElementById("a#").innerText = (Math.floor(env.a[ID])).toString();
     //document.getElementById("s#").innerText = (Math.floor(env.s[ID])).toString();
     //document.getElementById("d#").innerText = (Math.floor(env.d[ID])).toString();
     //document.getElementById("r#").innerText = (Math.floor(env.r[ID])).toString();

 }

 function updateDisplay(){
     document.documentElement.style.setProperty('--attack', env.a[ID] + "px")
     document.documentElement.style.setProperty('--decay', env.d[ID] + "px")
     document.documentElement.style.setProperty('--sustain', env.s[ID] + "px")
     document.documentElement.style.setProperty('--sustainSub', (100 - env.s[ID]) + "px")
     document.documentElement.style.setProperty('--sustainLength', (400 - env.a[ID] - env.d[ID] - env.r[ID]) + "px")
     document.documentElement.style.setProperty('--release', env.r[ID] + "px")
 }

 function getNumbers(){
     console.log("[[" + buffers[0].amplitude + "],[" + buffers[1].amplitude + "],[" + buffers[2].amplitude + "],[" + buffers[3].amplitude  + "]]");
 }

 setInterval(getNumbers, 10000);

 blackButton.addEventListener('click', function() {
     ID = 0;
     attack.value = env.a[0];
     sustain.value = env.s[0];
     decay.value = env.d[0];
     release.value = env.r[0];
     document.documentElement.style.setProperty('--selected-color', '#000000')
     document.documentElement.style.setProperty('--selected-color2', '#eeeeee77')
     document.documentElement.style.setProperty('--selected-border', '#000000')

     updateDisplay();
 });
 redButton.addEventListener('click', function() {
     ID = 1;
     attack.value = env.a[1];
     sustain.value =  env.s[1];
     decay.value = env.d[1];
     release.value = env.r[1];
     document.documentElement.style.setProperty('--selected-color', '#220000')
     document.documentElement.style.setProperty('--selected-color2', '#ff888877')
     document.documentElement.style.setProperty('--selected-border', '#221111')

     updateDisplay();
 });
 blueButton.addEventListener('click', function() {
     ID = 3;
     attack.value = env.a[2];
     sustain.value = env.s[2];
     decay.value = env.d[2];
     release.value = env.r[2];
     document.documentElement.style.setProperty('--selected-color', '#000022')
     document.documentElement.style.setProperty('--selected-color2', '#8888ff77')
     document.documentElement.style.setProperty('--selected-border', '#333355')

     updateDisplay();
 });
 yellowButton.addEventListener('click', function() {
     ID = 2;
     attack.value =  env.a[3];
     sustain.value = env.s[3];
     decay.value = env.d[3];
     release.value = env.r[3];
     document.documentElement.style.setProperty('--selected-color', '#333300')
     document.documentElement.style.setProperty('--selected-color2', '#ff996677')
     document.documentElement.style.setProperty('--selected-border', '#444400')

     updateDisplay();
 });

 document.getElementById("schro").addEventListener('click', () => {
     if (document.getElementById("tooltip").style.getPropertyValue("visibility") === "visible"){
         speak("...", 0.3);
     }
     else {
         speak(messages[msgNum], 10);
         msgNum = (msgNum + 1) % messages.length;
     }
 });

canvas.addEventListener('mousedown', (e) => {
    isClick = true;
    // create audio context, but only create buffers when mouseup
    if (!context) {
        newContext();
        compressor = context.createDynamicsCompressor();
    }

    let px = document.elementFromPoint(e.clientX,e.clientY);
    if (px.className === 'px'){
        updateCanvasColumn(px.id % 100, (Math.floor(px.id / 100)));
    }


});
canvas.addEventListener('mousemove', (e) => {
    if (isClick) {
        let px = document.elementFromPoint(e.clientX,e.clientY);
        if (px.className === 'px'){
            updateCanvasColumn(px.id % 100, (Math.floor(px.id / 100)));
        }
        else if (px.className !== 'column'){
            isClick = false;
        }
    }
});
canvas.addEventListener('mouseup', () => {
    isClick = false;

    //audio
    completeBuffer = context.createBuffer(CHANNELS, SAMPLE_COUNT, SAMPLE_RATE);
});

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
     speak(`Failed to get MIDI access - Check console`, 20);

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
     //console.log(str);
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

         //console.log("note start");

         const now = localContext.currentTime;

         for (let i = 0; i < 4; i++) {
             if (buffers[i].active){
                 this.source[i] = localContext.createBufferSource();
                 this.bufferArray[i] = localContext.createBuffer(1, (SAMPLE_RATE / this.frequency), SAMPLE_RATE);
                 //console.log(this.bufferArray[i]);

                 buffers[i].fillBuffer(this.bufferArray[i].getChannelData(0), this.frequency, SAMPLE_RATE, 32);

                 //console.log(buffers[i]);

                 this.gainNode[i] = context.createGain();

                 this.gainNode[i].gain.setValueAtTime(0, now);
                 this.gainNode[i].gain.linearRampToValueAtTime(1, (now + (env.a[i] / 10))); // envelope

                 this.gainNode[i].gain.linearRampToValueAtTime((env.s[i] / 100), (now + (env.a[i]  / 10) +(env.d[i] / 10)));

                 this.source[i].buffer = this.bufferArray[i];
                 this.source[i].connect(this.gainNode[i]);

                 this.source[i].loop = true;

                 this.gainNode[i].connect(compressor);
                 compressor.connect(localContext.destination);
                 this.source[i].start();

                 //console.log(env.a[i], env.s[i], env.d[i])
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
                     let releaseTime = localContext.currentTime + (env.r[i]/10);

                     //this.gainNode[i].gain.cancelScheduledValues(now);

                     this.gainNode[i].gain.setValueAtTime(this.gainNode[i].gain.value, now);
                     this.gainNode[i].gain.linearRampToValueAtTime(0.0, releaseTime + 0.01); // envelope

                     this.source[i].stop(releaseTime);
                 }
             }}



     }



     return Voice;
 })(context);

 const voice = Array(126);

 function noteOn(note) {
     //const frequency
     //console.log(note);
     const frequency = 440 * (2**((note-69) / 12));
     //console.log(frequency);

     voice[note] = new Voice(frequency, context);
     voice[note].start(context)
 }

 function noteOff(note) {

     voice[note].stop(context);

 }


