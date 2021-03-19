lastOut = '';

function convertTo(range,value) {
    return (range*value/127);
}

WebMidi.enable(function (err) {
  if (err) {
    console.log("WebMidi could not be enabled.", err);
  } else {
    console.log("WebMidi enabled!");
  }
});

/* WebMidi.enable(function (err) {
    console.log(WebMidi.inputs);
    console.log(WebMidi.outputs);
}); */
WebMidi.enable(function (err) {
  for (var i = 0; i < WebMidi.inputs.length; i++) {
      lastOut =  WebMidi.inputs[i]._midiInput.name ;
      console.log("Nb" + i + " name " + lastOut);
  }
  console.log("Connect to "+ lastOut);
  var input = WebMidi.getInputByName(lastOut);

  // Listen for a 'note on' message on all channels
  input.addListener('noteon', 1,
    function (e) {
      console.log("    Received 'noteon' message (" + e.note.name + e.note.octave + ").");
      playNote(e.note.name + e.note.octave);
    }
  );

    input.addListener('noteoff', 1,
    function (e) {
      console.log("    Received 'noteoff' message (" + e.note.name + e.note.octave + ").");
      releaseNote(e.note.name + e.note.octave);
    }
  );

  // Listen to pitch bend message on channel 3
  input.addListener('pitchbend', 3,
    function (e) {
      console.log("    Received 'pitchbend' message.", e);
    }
  );

  // Listen to control change message on all channels
  input.addListener('controlchange', 1,
    function (e) {
      console.log("    Received 'controlchange' message : ", e.channel,  e.controller.number, e.data[2]);
      if (e.controller.number == 74) {
        cur_filter_freq = convertTo(9000, e.data[2]);
        filter.set({
          frequency: cur_filter_freq
        });
        log_info("Filter " + cur_filter_freq.toFixed(1));

      } else if (e.controller.number == 71) {
        cur_detune = convertTo(127, e.data[2]);
        synth.set({ oscillator: { spread : cur_detune.toFixed(1) }});
        log_info("Detune " + cur_detune.toFixed(1));

      }
    }
  );


});