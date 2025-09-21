var keys = require('./audiokeys/AudioKeys');

// use midi thing
// this will be for the envelope and stuff.
// polyphony 10,

if ( navigator.requestMIDIAccess) {
    console.log('MIDI supported by Browser');
    navigator.requestMIDIAccess().then(success, failure);
}
else console.log('MIDI not supported! Chromium-based or Firefox browser recommended')
function success(midi) {
    //init midi
}

function failure() {
    console.warn("MIDI cannot be initialized!");
}



var octave = 4;

class noteEvent {
    constructor(key, e) {

    }

}

// audio keys:

