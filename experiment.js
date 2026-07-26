// =====================================================
// Automated Shortened OSPAN
// Version 0.2
// =====================================================

// Initialize jsPsych
const jsPsych = initJsPsych({

    on_finish: function () {

        console.log(jsPsych.data.get().csv());

    }

});

// Timeline
const timeline = [];

// =====================================================
// Welcome Screen
// =====================================================

timeline.push({

    type: jsPsychHtmlButtonResponse,

    stimulus: `

        <h1>Automated Shortened OSPAN</h1>

        <p><strong>Version 0.2</strong></p>

        <p>This is the development version of the task.</p>

    `,

    choices: ["Continue"]

});

// =====================================================
// Recall Grid Trial
// =====================================================

timeline.push({

    type: jsPsychHtmlKeyboardResponse,

    stimulus: function () {

        return createRecallGrid();

    },

    choices: "NO_KEYS",

    trial_duration: null,

    on_load: function () {

        initializeRecallGrid(function(responses){

            jsPsych.finishTrial({

                recall: responses

            });

        });

    }

});

// =====================================================
// End Screen
// =====================================================

timeline.push({

    type: jsPsychHtmlButtonResponse,

    stimulus: `

        <h2>Success!</h2>

        <p>The recall grid returned data correctly.</p>

    `,

    choices: ["Finish"]

});

// =====================================================
// Run Experiment
// =====================================================

jsPsych.run(timeline);