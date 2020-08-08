/*
 * Plugin to show a circular 'dial' with a moveable cursor, allowing for 
 * continuous responses on a circular scale (e.g. direction/orientation, colors on a color wheel).
 * Plugin uses the jQuery Knob library: https://github.com/aterrien/jQuery-Knob
 * Written for compatibility with jsPsych v6.1.0.
 * 
 * Becky Gilbert, July 2020
 * 
 */

jsPsych.plugins["dial-response"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "dial-response",
    parameters: {
      display_input: {
        type: jsPsych.plugins.parameterType.BOOL, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
        default: true,
        description: 'Whether or not to show the current value inside the dial.'
      },
      min: {
        type: jsPsych.plugins.parameterType.FLOAT,
        default: 0,
        description: 'Minimum dial value.'
      },
      max: {
        type: jsPsych.plugins.parameterType.FLOAT,
        default: 100,
        description: 'Maximum dial value.'
      },
      step: {
        type: jsPsych.plugins.parameterType.FLOAT,
        default: 1,
        description: 'Dial step size.'
      },
      starting_value: {
        type: jsPsych.plugins.parameterType.FLOAT,
        default: 1,
        description: 'Dial starting value.'
      },
      width: {
        type: jsPsych.plugins.parameterType.INT,
        default: 300,
        description: 'Dial width. Default units are pixels, but can also be a percentage of the container width, e.g. 80%.'
      },
      height: {
        type: jsPsych.plugins.parameterType.INT,
        default: 300,
        description: 'Dial height. Default units are pixels, but can also be a percentage of the container height, e.g. 80%.'
      },
      cursor_mode: {
        type: jsPsych.plugins.parameterType.BOOL,
        default: true,
        description: 'If true, the dial value will be shown with a fixed-size cursor that moves in response to the user input. '+
                     'If false, the dial will be shown in "gauge" mode, where one end is fixed to the '+
                     '"angle_offset" location), and the other end will start at the "starting_value" and move in response to the user input.'
      },
      cursor_size: {
        type: jsPsych.plugins.parameterType.INT,
        default: null,
        description: 'When "cursor_mode" is true and the value is not null, this value determines the cursor size.'
      },
      angle_offset: {
        type: jsPsych.plugins.parameterType.FLOAT,
        default: 0,
        description: 'Starting angle, in degrees. Default is 0.'
      }, 
      angle_arc: {
        type: jsPsych.plugins.parameterType.INT,
        default: 360,
        description: 'Dial arc size in degrees. Default is 360.'
      },
      rotation: {
        type: jsPsych.plugins.parameterType.STRING,
        default: 'clockwise',
        description: 'Direction of progression. Options are "clockwise" and "anticlockwise".'
      },
      read_only: {
        type: jsPsych.plugins.parameterType.BOOL,
        default: false,
        description: 'If true, the dial will be shown but will not accept user input.'
      }, 
      thickness: {
        type: jsPsych.plugins.parameterType.FLOAT,
        default: 0.3,
        description: 'Cursor/gauge thickness. 1 = fully filled-in circle, .01 = slim border.'
      }, 
      gauge_color: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "black",
        description: 'Gauge color.'
      },
      background_color: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "white",
        description: 'Background color.'
      },
      input_color: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "black",
        description: 'Color of the value (number) shown inside the dial, when "display_input" is true.'
      },
      line_cap: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "butt",
        description: 'Ending type for the gauge. Can be "butt" for a flat edge or "round" for a rounded edge.'
      },
      show_next_button: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Show next button',
        default: true,
        description: 'Whether or not to show a Next button on the screen.'
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Next &gt;',
        description: 'Label of the button to advance, if show_next_button is true.'
      },
      button_margin_vertical: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button margin vertical',
        default:  '8px',
        description: 'Top and bottom margins for the Next button, if show_next_button is true.'
      },
      require_movement: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Require movement',
        default: false,
        description: 'If true, the participant will have to move the dial gauge/cursor before continuing.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed above the dial.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show the trial.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: false,
        description: 'If true, trial will end when user makes a response.'
      },
      feedback: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Feedback',
        default: false,
        description: 'If true, the value of correct response will be shown along with the starting value.'
      },
      correct_response: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: 'Correct response',
        default: null,
        description: 'If feedback is true, this value will be marked with a line, indicating the correct response.'
      },
      feedback_color: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Feedback color',
        default: null,
        description: 'If feedback is true, this will be the color of the correct response value.'
      },
      allow_key_to_end_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Allow key to end trial',
        default: false,
        description: 'Whether or not to allow a keyboard key to end the trial.'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices',
        default: jsPsych.NO_KEYS,
        description: 'The keys the subject is allowed to press to end the trial. If allow_key_to_end_trial is true, then you must specify one or more key choices.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    if (trial.cursor_mode) {
      if (trial.cursor_size !== null) {
        trial.cursor_mode = trial.cursor_size;
      }
    }

    var response = {
        rt: null,
        response: null
    };
    var first_change_rt = null;

    // create HTML string with prompt and knob element
    var html = '<div id="jspsych-dial-response-wrapper">'; 
    if (trial.prompt !== null) {
        html += trial.prompt;
    }
    html += '<div class="jspsych-dial-response-container">';
    html += '<input type="text" id="jspsych-dial-response-response" class="dial" value="'+trial.starting_value+'">';
    //html += '<input type="text" class="dial" value="'+trial.start+'" min="'+trial.min+'" max="'+trial.max+'" step="'+trial.step+'" style="width: 100%;" id="jspsych-dial-response-response">';
    html += '</div>';
    html += '</div>';
    
    // add next button if necessary
    if (trial.show_next_button) {
      html += '<div class="jspsych-dial-response-next-btn-container" style="display: inline-block;" id="jspsych-dial-response-next-btn-container">';
      html += '<button id="jspsych-dial-response-next-btn" class="jspsych-btn" '+
            'style="margin-top:'+trial.button_margin_vertical+'; margin-bottom:'+trial.button_margin_vertical+ ';" ' + 
            (trial.require_movement ? "disabled" : "")+'>'+trial.button_label+'</button></div>';
    }

    display_element.innerHTML = html;

    // configure the dial based on trial parameters
    $(".dial").knob({
        'displayInput': trial.display_input, 
        'min':trial.min,
        'max':trial.max,
        'step':trial.step,
        'width': trial.width,
        'height': trial.height,
        'cursor': trial.cursor_mode, 
        'thickness': trial.thickness, 
        'fgColor': trial.gauge_color, 
        'bgColor': trial.background_color, 
        'angleOffset':trial.angle_offset,
        'angleArc':trial.angle_arc,
        'rotation':trial.rotation,
        'readOnly':trial.readOnly,
        'lineCap':trial.line_cap,
        'inputColor':trial.input_color,
        'release': function(value) {
          if (trial.response_ends_trial) {
            get_response(value)
          }
        },
        'change': function(value) {
          if (first_change_rt == null) {
            var first_change_time = performance.now();
            first_change_rt = first_change_time - start_time;
          }
          if (trial.require_movement & trial.show_next_button) {
            display_element.querySelector('#jspsych-dial-response-next-btn').disabled = false;
          }
        }
    });    

    if (trial.feedback) {
      var dial = display_element.querySelector("canvas");
      var dial_ctx = dial.getContext("2d");
      var dial_w = dial.width;
      var dial_h = dial.height;
      // convert start/end points to radians, need to subract 90 deg because 0 rad is 90 deg
      var arc_start = ((trial.correct_response - trial.cursor_size)-90) * (Math.PI / 180);
      var arc_end = ((trial.correct_response + trial.cursor_size)-90) * (Math.PI / 180);
      var dial_r = (dial_w <= dial_h) ? (dial_w/2) : (dial_h/2);
      dial_ctx.beginPath();
      dial_ctx.moveTo(dial_w/2, dial_h/2);
      dial_ctx.arc(dial_w/2, dial_h/2, dial_r, arc_start, arc_end);
      dial_ctx.lineTo(dial_w/2, dial_h/2);
      dial_ctx.closePath();
      dial_ctx.fillStyle = trial.feedback_color;
      dial_ctx.fill();
    }

    if (trial.show_next_button) {
      display_element.querySelector('#jspsych-dial-response-next-btn').addEventListener('click', get_response);
    }

    function get_response(val) {
      var end_time = performance.now();
      if (typeof val !== 'number') {
        // if 'value' hasn't been passed into the function, then define the value variable
        // and set its value to be the current dial value
        var val = display_element.querySelector('#jspsych-dial-response-response').value;
      }
      response.response = val;
      response.rt = end_time - start_time;
      end_trial();
    }

    function end_trial() {

        jsPsych.pluginAPI.clearAllTimeouts();

        // kill keyboard listeners
        if (typeof keyboardListener !== 'undefined') {
          jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
        }

        var trial_data = {
            response: response.response,
            rt: response.rt,
            first_change_rt: first_change_rt
        };

        if (trial.correct_response !== null) {
          trial_data.correct_response = trial.correct_response;
        }

        display_element.innerHTML = '';
    
        // end trial
        jsPsych.finishTrial(trial_data);
    }

    // start the keyboard listener
    if ((trial.allow_key_to_end_trial == true) & (trial.choices != jsPsych.NO_KEYS)) {
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: get_response,
        valid_responses: trial.choices,
        rt_method: 'performance',
        persist: false,
        allow_held_key: false
      });
    }

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
        jsPsych.pluginAPI.setTimeout(get_response, trial.trial_duration);
    }
  
    var start_time = performance.now();

  };

  return plugin;
})();
