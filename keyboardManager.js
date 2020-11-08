
var osc_type =  ['sine','square', 'triangle', 'sawtooth'];
var osc_color = ['#507C9E', '#FFFF33', '#008000', '#ff4500'];
var cur_osc_id = 0;
var tempo_value =  ['2n','4n', '8n', '16n', '32n', '64n', '128n'];
var cur_tempo_id = 0 ;
var cur_tempo = tempo_value[cur_tempo_id] ;
var cur_enveloppe_attack = 0.0;
var cur_enveloppe_sustain =  0.1;
var cur_filter_freq = 9000;
var cur_disto =  0.0;
var cur_delay =  0.0;
var cur_detune =  0.0;
var cur_delay_time =  '128n';
var octave_shift = 3;
var arpOn = false ;

var key_note = {};
var note_on = [];
recalulate_note();


const filter = new Tone.Filter({type : "lowpass" ,frequency : cur_filter_freq ,rolloff : -12 ,Q : 5 ,gain : 0});
const pingpongdelay =  new Tone.PingPongDelay(cur_delay_time, cur_delay);
const distortion = new Tone.Distortion(cur_disto);
const synth  = new Tone.PolySynth(Tone.Synth).toDestination();
const synth2 = new Tone.PolySynth(Tone.Synth).toDestination();
synth2.set({ detune: -10 });

Tone.Destination.chain(filter, distortion, pingpongdelay);
log_info("Synth ready");

let osc = new Nexus.Oscilloscope("#scope", {'size': [340,480] });
osc.colorize("accent",osc_color[cur_osc_id])
//document.getElementById('display').style.color = osc_color[cur_osc_id];
osc.colorize("fill","#000000")
osc.connect(Tone.Master);
log_info("Oscillo ready");



function playNote(note) {
    keyboard.addButtonTheme(enTofr(note), "hg-highlight"); 
    if (note_on.length < 4) {
        note_on.push(note);
        if (arpOn) {
            //Tone.Transport.stop();
            Tone.Transport.position = 0;
            Tone.Transport.cancel();
            Tone.Transport.scheduleRepeat((time) => {
                var relativeTime = 0;
                for (const note_arp in note_on.sort()) {
                    log_info("   sched ARP " + note_on[note_arp] + " " + relativeTime + " " + cur_tempo);
                    synth.triggerAttackRelease( note_on[note_arp], getdelayArp(cur_tempo_id, note_on.length), time + relativeTime);
                    relativeTime += Tone.Time(getdelayArp(cur_tempo_id, note_on.length)).toSeconds();
                }
            }, cur_tempo);
            // transport must be started before it starts invoking events
            Tone.Transport.start();
            log_info("  ARP " + note_on);
        } else {
                
                synth.triggerAttack(note, Tone.now(), 1);
                noteLow = Tone.Frequency(note).transpose(-2);
                noteFreq = Tone.Frequency(note).toFrequency();
                //synth2.triggerAttack(noteLow, Tone.now(), 1);
                log_info("  Play " + enTofr(note)  + " " + noteFreq.toFixed(1)+ "hz");
            }
    }
    else {
        log_info("  Reach max poly " + note_on.length + " skipping");
    }
}


function releaseNote(note) {
    keyboard.removeButtonTheme(enTofr(note), "hg-highlight");
    if (arpOn) {
        //Tone.Transport.stop();
        Tone.Transport.position = 0;
        Tone.Transport.cancel();

    }
    else {
        synth.triggerRelease(note);
        noteLow = Tone.Frequency(note).transpose(-2);
        //synth2.triggerRelease(noteLow);
        
        //log_info("  note stop (key)   " + enTofr(note) );
    }


    const index = note_on.indexOf(note);
    if (index > -1) {
        note_on.splice(index, 1);
    }
    log_info("  Stop " + enTofr(note) );
}


document.onkeyup = function(e) {
    if (e.which in key_note) {
        var note_string = key_note[e.which]
        releaseNote(note_string);
    }
    else if (e.which == 39)  {
        cur_detune = 0;
        synth.set({ detune: cur_detune });

    }
    else if (e.which == 37)  {
        cur_detune = 0;
        synth.set({ detune: cur_detune });
    }
}

document.onkeydown = function(e) {
    console.log(e.which);
    if (e.which in key_note) {
        var note_string = key_note[e.which]
        if (note_on.includes(note_string)) {
            //log_info(" note skiiip " + note_string )
        } else {
            playNote(note_string)
        }                
    }
    if (e.which == 49)  {
        cur_enveloppe_attack = cur_enveloppe_attack - 0.05;
        if (cur_enveloppe_attack < 0)  { cur_enveloppe_attack = 0;}
        log_info("Attack +" + cur_enveloppe_attack)
        synth.set({envelope: {attack: cur_enveloppe_attack }});
        synth2.set({envelope: {attack: cur_enveloppe_attack }});
    }  else if (e.which == 50)  {
        cur_enveloppe_attack = cur_enveloppe_attack + 0.05;
        if (cur_enveloppe_attack > 1)  { cur_enveloppe_attack = 1;}
        log_info("Attack +" + cur_enveloppe_attack)
        synth.set({envelope: {attack: cur_enveloppe_attack }});
        synth2.set({envelope: {attack: cur_enveloppe_attack }});
    }  else if (e.which == 51)  {
        cur_enveloppe_sustain = cur_enveloppe_sustain - 0.05;
        if (cur_enveloppe_sustain < 0)  { cur_enveloppe_sustain = 0;}
        log_info("Sustain -" + cur_enveloppe_sustain)
        synth.set({envelope: {sustain: cur_enveloppe_sustain }});
        synth2.set({envelope: {sustain: cur_enveloppe_sustain }});
    } else if (e.which == 52)  {
        cur_enveloppe_sustain = cur_enveloppe_sustain + 0.05;
        if (cur_enveloppe_sustain > 1)  { cur_enveloppe_sustain = 1;}
        log_info("Sustain +" + cur_enveloppe_sustain)
        synth.set({envelope: {sustain: cur_enveloppe_sustain }});
        synth2.set({envelope: {sustain: cur_enveloppe_sustain }});
    }
    else if (e.which == 53)  {
        
        cur_filter_freq = cur_filter_freq - ((cur_filter_freq )/10);
        if (cur_filter_freq < 1)  { cur_filter_freq = 1;}
        filter.set({
            frequency: cur_filter_freq
        });
        log_info("Filter -" + cur_filter_freq)
        
    } else if (e.which == 54)  {
        cur_filter_freq = cur_filter_freq + ((cur_filter_freq )/10);
        if (cur_filter_freq > 9000)  { cur_filter_freq = 9000;}
        filter.set({
            frequency: cur_filter_freq
        });
        log_info("Filter +" + cur_filter_freq)

    } else if (e.which == 55)  {
        
        cur_disto = cur_disto - 0.05;
        if (cur_disto < 0)  { cur_disto = 0;}
        distortion.set({
            distortion: cur_disto
        });
        log_info("Disto -" + cur_disto)
        
    } else if (e.which == 56)  {
        cur_disto = cur_disto + 0.05;
        if (cur_disto > 1)  { cur_disto = 1;}
        distortion.set({
            distortion: cur_disto
        });
        log_info("Disto +" + cur_disto)

    } else if (e.which == 16)  {
        cur_osc_id = cur_osc_id + 1
        if (cur_osc_id >= osc_type.length) {cur_osc_id = 0}
        synth.set({oscillator: { type: osc_type[cur_osc_id] } });
        synth2.set({oscillator: { type: osc_type[cur_osc_id] } });
        osc.colorize("accent",osc_color[cur_osc_id]);
        //document.getElementById('display').style.color = osc_color[cur_osc_id];
        log_info("Osc " + osc_type[cur_osc_id]);
    } else if (e.which == 38)  {
        // arrow up
        octave_shift = octave_shift + 1;
        log_info("Octave + " + octave_shift)
        recalulate_note();

    } else if (e.which == 40)  {
        // arrow down
        octave_shift = octave_shift - 1;
        log_info("Octave - " + octave_shift)
        recalulate_note();

    } else if (e.which == 57)  {
        cur_delay = cur_delay  - 0.1;
        if (cur_delay < 0)  { cur_delay = 0;}
        cur_delay_time = getHigherTempo(cur_tempo);
        if (cur_delay === 0) {cur_delay_time = '128n'}
        pingpongdelay.set({delayTime : cur_tempo , feedback: cur_delay });
        log_info("Delay - " + cur_delay + " - " + cur_delay_time);

    } else if (e.which == 48)  {
        cur_delay = cur_delay  + 0.1;
        if (cur_delay > 1)  { cur_delay = 1;}
        cur_delay_time = getHigherTempo(cur_tempo);
        if (cur_delay === 0) {cur_delay_time = '128n'}
        pingpongdelay.set({delayTime : cur_delay_time , feedback: cur_delay });
        log_info("Delay - " + cur_delay + " - " + cur_delay_time);
    } else if (e.which == 39)  {
        cur_detune = cur_detune + (20 - (cur_detune / 10));
        synth.set({ detune: cur_detune });
        log_info("Detune + " + cur_detune.toFixed(1));

    } else if (e.which == 37)  {
        cur_detune = cur_detune - (20 - (cur_detune / 10));
        synth.set({ detune: cur_detune });
        log_info("Detune - " + cur_detune.toFixed(1));
    }else if (e.which == 219)  {
        cur_tempo_id = cur_tempo_id - 1;
        if (cur_tempo_id <= 0) {cur_tempo_id = 0};
        cur_tempo =  tempo_value[cur_tempo_id]
        cur_delay_time = getHigherTempo(cur_tempo);
        log_info("Tempo - " + cur_tempo + " " + cur_tempo_id);
        if (cur_delay === 0) {cur_delay_time = '128n'}
        pingpongdelay.set({delayTime : cur_delay_time , feedback: cur_delay });
    }else if (e.which == 187)  {
        cur_tempo_id = cur_tempo_id + 1
        if (cur_tempo_id >= (tempo_value.length - 2)) {cur_tempo_id = (tempo_value.length -2)};
        cur_tempo =  tempo_value[cur_tempo_id]
        cur_delay_time = getHigherTempo(cur_tempo);
        if (cur_delay === 0) {cur_delay_time = '128n'}
        pingpongdelay.set({delayTime : cur_delay_time , feedback: cur_delay });
        log_info("Tempo + " + cur_tempo + " " + cur_tempo_id);
    } else if (e.which == 32)  {
        handleShift();
    } else if (e.which == 20)  {
        arpOn = !arpOn;
        if (arpOn) {
            keyboard.addButtonTheme("Poly-Arp", "hg-highlight");
        } else {
            keyboard.removeButtonTheme("Poly-Arp", "hg-highlight");
        }
    }
}

function getHigherTempo(mytempo) {
    var index = tempo_value.indexOf(mytempo);
    if (index > -1) {
        index = index + 1;
        if (index > tempo_value.length) {index = tempo_value.length }
    }
    return tempo_value[index];
}

function getdelayArp(tempo, note_cpt) {
    if (note_cpt === 1) {
        return tempo_value[tempo+1]
    } else if (note_cpt === 2) {
        return tempo_value[tempo+1]
    } else if (note_cpt === 3) {
        return tempo_value[tempo+2]
    } else {
        return tempo_value[tempo+2]
    }
}

function delayTimeCalc(delay) {
    var timeDelay = '128n'
    switch (true) {
        case (delay < 0.1):
            timeDelay = '64n';
            break;
        case (delay < 0.2):
            timeDelay = '16n';
            break;
        case (delay < 0.3):
            timeDelay = '16n';
            break;
        case (delay < 0.5):
            timeDelay = '8n';
            break;
        case (delay < 0.6):
            timeDelay = '4n';
            break;
        default:
            timeDelay = '4n';
            break;
    }
    return timeDelay;

}


function recalulate_note() {
    key_note[81] = "C" + octave_shift;
    key_note[83] = "D" + octave_shift;
    key_note[68] = "E" + octave_shift;
    key_note[70] = "F" + octave_shift;
    key_note[71] = "G" + octave_shift;
    key_note[72] = "A" + octave_shift;
    key_note[74] = "B" + octave_shift;
    key_note[90] = "C#" + octave_shift;
    key_note[69] = "D#" + octave_shift;
    key_note[84] = "F#" + octave_shift;
    key_note[89] = "G#" + octave_shift;
    key_note[85] = "A#" + octave_shift;
    key_note[79] = "C#" + (octave_shift + 1);
    key_note[80] = "D#" + (octave_shift + 1);
    key_note[75] = "C" + (octave_shift + 1);
    key_note[76] = "D" + (octave_shift + 1);
    key_note[77] = "E" + (octave_shift + 1);
    key_note[192] = "F" + (octave_shift + 1);
    key_note[220] = "G" + (octave_shift + 1);
    key_note[87] = "C" + (octave_shift - 1);
    key_note[88] = "D" + (octave_shift - 1);
    key_note[67] = "E" + (octave_shift - 1);
    key_note[86] = "F" + (octave_shift - 1);
    key_note[66] = "G" + (octave_shift - 1);
    key_note[78] = "A" + (octave_shift - 1);
    key_note[188] = "B" + (octave_shift - 1);
    key_note[190] = "C" + octave_shift;
    key_note[191] = "D" + octave_shift;
    key_note[223] = "E" + octave_shift;
}


function handleShift() {
    let currentLayout = keyboard.options.layoutName;
    let shiftToggle = currentLayout === "default" ? "shift" : "default";
  
    keyboard.setOptions({
      layoutName: shiftToggle
    });
    keyboardArrows.setOptions({
      layoutName: shiftToggle
    });
  }


function log_info(mytext) {
    console.log(mytext);
    document.getElementById('logs').value = document.getElementById('logs').value + " LOG:\t" +  mytext + '\n';
    document.getElementById('logs').scrollTop = document.getElementById('logs').scrollHeight ;
    document.getElementById('display').value =  ' Attack       : ' + cur_enveloppe_attack.toFixed(2) + '\t';
    document.getElementById('display').value += ' Sustain      : ' + cur_enveloppe_sustain.toFixed(2) + '\t';
    document.getElementById('display').value += ' Oscillator   : ' + osc_type[cur_osc_id] + '\n';
    document.getElementById('display').value += ' Cut Off      : ' + cur_filter_freq.toFixed(0) + '\t';
    document.getElementById('display').value += ' Distortion   : ' + cur_disto.toFixed(2) + '\t';
    document.getElementById('display').value += ' Delay        : ' + cur_delay.toFixed(1) + "\n";
    document.getElementById('display').value += ' Detune       : ' + cur_detune.toFixed(1) + '\t';
    document.getElementById('display').value += ' Octave shift : ' + octave_shift + '\t';
    document.getElementById('display').value += ' Tempo        : ' + cur_tempo ;
    document.getElementById('notes').value =  enTofrTab(note_on);
}

function enTofrTab(noteArray) {
    var noteDisplay = '';
    for (const noteAr in noteArray) {
        noteDisplay = noteDisplay + " " + enTofr(noteArray[noteAr]);
    }
    return noteDisplay
}

function enTofr(noteIn) {

    note = noteIn.replace('D','Re').replace('C','Do').replace('E','Mi').replace('F','Fa').replace('G','Sol').replace('A','La').replace('B','Si');
    octave = parseInt(note.charAt(note.length-1));
    var note = note.slice(0, -1);
    addition = ''
    if (octave > octave_shift) {
        addition = '+';
    } else if (octave === octave_shift) {
        addition = ''
    }
    else {
        addition = '-';
    }
    return note + addition;
}