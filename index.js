let Keyboard = window.SimpleKeyboard.default;

const french = {
    shift: [
      "\u00B2 & \u00E9 \" ' ( - \u00E8 _ \u00E7 \u00E0 ) = {bksp}",
      "{tab} a z e r t y u i o p ^ $ {enter}",
      "caps q s d f g h j k l m \u00F9 * {enter}",
      "{shift} < w x c v b n , ; : ! {shift}",
      "Ctrl @ ToggleDocumentation Ctrl"
    ],
    default: [
      "\u00B2 A- A+ S- S+ Dt- Dt+ Di- Di+ De- De+ T- T+ {bksp}",
      "{tab} a Do# Re# r Fa# Sol# La# i Do#+ Re#+ ^ $ {enter}",
      "Poly-Arp Do Re Mi Fa Sol La Si Do+ Re+ Mi+ Fa+ Sol+ {enter}",
      "Wav\nForm < Do- Re- Mi- Fa- Sol- La- Si- Do Re Mi Wav\nForm",
      "Hold @ ToggleDocumentation Hold"
    ]
  };

let layout = french;

let mybuttonTheme = [
    {
      class: "hg-blacknote",
      buttons: "Do# Re# Fa# Sol# La# Do#+ Re#+"
    },
    {
      class: "hg-whitenote",
      buttons: "Do- Re- Mi- Fa- Sol- La- Si- Do Re Mi Fa Sol La Si Do+ Re+ Mi+ Fa+ Sol+ La+ Si+"
    },
    {
      class: "hg-large",
      buttons: "caps Poly-Arp Ctrl Hold"
    },
    {
      class: "hg-small",
      buttons: "< \u00B2"
    },
    {
      class: "hg-used",
      buttons: "A- A+ S- S+ Dt- Dt+ Di- Di+ De- De+ T- T+ ToggleDocumentation Wav\nForm Poly-Arp"
    }
  ];


  let commonKeyboardOptions = {
    onChange: input => onChange(input),
    onKeyPress: button => onKeyPress(button),
    theme: "simple-keyboard hg-theme-default hg-layout-default",
    physicalKeyboardHighlight: true,
    syncInstanceInputs: true,
    mergeDisplay: true,
    debug: true
  };

  
let keyboard = new Keyboard({
  ...commonKeyboardOptions,
  layout: layout, 
  buttonTheme : mybuttonTheme
});

let mybuttonThemeArrows = [ 
  {
    class: "hg-used",
    buttons: "Filter- Octave- Octave+ Filter+"
  }
];
let keyboardArrows = new Keyboard(".simple-keyboard-arrows", {
  ...commonKeyboardOptions,
  buttonTheme : mybuttonThemeArrows,
  layout: {
    shift: ["{arrowup}", "{arrowleft} {arrowdown} {arrowright}"],
    default: ["Octave+", "Filter- Octave- Filter+"]
  }
});

/**
 * Update simple-keyboard when input is changed directly
 */

console.log(keyboard);

function onChange(input) {
  console.log("Input changed", input);
}

function onKeyPress(button) {
  console.log("Button pressed", button);
  playNote("C4");
  releaseNote("C4");

}

document.onkeydown = function(e) {
//function onKeyPress(button) {
  let mybutton = e.code;
  console.log("Button pressed", mybutton);
}


