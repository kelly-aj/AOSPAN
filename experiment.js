// =====================================================
// Automated Shortened OSPAN
// Version 0.3
// =====================================================

// Initialize jsPsych
const jsPsych = initJsPsych({

    on_finish: function () {

        console.log(jsPsych.data.get().csv());

    }

});

const timeline = [];

// =====================================================
// Helper Function
// Creates a sequence of letter presentations
// =====================================================

function createLetterPresentation(letterArray){

    const trials = [];

    letterArray.forEach(letter=>{

        // Letter

        trials.push({

            type: jsPsychHtmlKeyboardResponse,

            stimulus: `
                <div style="
                    font-size:72px;
                    font-family:Arial;
                    font-weight:bold;
                ">
                    ${letter}
                </div>
            `,

            choices: "NO_KEYS",

            trial_duration: 800

        });

        // Blank ISI

        trials.push({

            type: jsPsychHtmlKeyboardResponse,

            stimulus: "",

            choices: "NO_KEYS",

            trial_duration: 250

        });

    });

    return trials;

}

// =====================================================
// Welcome
// =====================================================

timeline.push({

    type: jsPsychHtmlButtonResponse,

    stimulus: `
        <h1>Automated Shortened OSPAN</h1>

        <p>Development Version 0.3</p>
    `,

    choices:["Continue"]

});

// =====================================================
// Ready Screen
// =====================================================

timeline.push({

    type: jsPsychHtmlButtonResponse,

    stimulus:`

        <h2>Letter Practice</h2>

        <p>Get ready.</p>

    `,

    choices:["Begin"]

});

// =====================================================
// Present Letters
// =====================================================

timeline.push(

    ...createLetterPresentation(["F","P","N"])

);

// =====================================================
// Recall Grid
// =====================================================

timeline.push({

    type: jsPsychHtmlKeyboardResponse,

    stimulus:function(){

        return createRecallGrid();

    },

    choices:"NO_KEYS",

    trial_duration:null,

    on_load:function(){

        initializeRecallGrid(function(responses){

            jsPsych.finishTrial({

                recall:responses

            });

        });

    }

});

// =====================================================
// End Screen
// =====================================================

timeline.push({

    type: jsPsychHtmlButtonResponse,

    stimulus:`

        <h2>Success!</h2>

        <p>Recall complete.</p>

    `,

    choices:["Finish"]

});

// =====================================================
// Run
// =====================================================

jsPsych.run(timeline);