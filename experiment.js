// ----------------------------------------------------
// Automated Shortened OSPAN
// Development Version 0.1
// ----------------------------------------------------

//--------------------------------------------------
// Configuration
//--------------------------------------------------

const CONFIG = {

    DEV_MODE: true,

    LETTER_DURATION: 800,

    LETTER_ISI: 250,

    MATH_PRACTICE_TRIALS: 15,

    COMBINED_PRACTICE_TRIALS: 3,

    SET_SIZES: [3,4,5,6,7],

    LETTERS: [
        "F","H","J",
        "K","L","N",
        "P","Q","R",
        "S","T","Y"
    ]

};
// Initialize jsPsych
const jsPsych = initJsPsych({
    on_finish: function () {
        console.log(jsPsych.data.get().csv());
    }
});

// Timeline
const timeline = [];

// ----------------------------------------------------
// Welcome Screen
// ----------------------------------------------------

timeline.push({
    type: jsPsychHtmlButtonResponse,

    stimulus: `
        <h1>Automated Shortened OSPAN</h1>

        <p><strong>Development Version 0.1</strong></p>

        <p>If you can see this screen, jsPsych is working correctly.</p>
    `,

    choices: ["Continue"]
});

// ----------------------------------------------------
// Recall Grid
// ----------------------------------------------------

timeline.push({

    type: jsPsychHtmlKeyboardResponse,

    stimulus: createRecallGrid(),

    choices: "NO_KEYS",

    trial_duration: null,

    on_load: function () {

        initializeRecallGrid();

        document
            .getElementById("enterBtn")
            .addEventListener("click", function () {

                jsPsych.finishTrial({

                    recall: recallResponses

                });

            });

    }

});

// ----------------------------------------------------
// End Screen
// ----------------------------------------------------

timeline.push({

    type: jsPsychHtmlButtonResponse,

    stimulus: `
        <h2>Success!</h2>

        <p>The timeline executed correctly.</p>
    `,

    choices: ["Finish"]

});

// ----------------------------------------------------
// Run Experiment
// ----------------------------------------------------

jsPsych.run(timeline);