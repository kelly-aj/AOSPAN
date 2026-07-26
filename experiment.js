// =====================================================
// Automated Shortened OSPAN
// Version 0.4
// Random Letter Practice
// =====================================================

// Initialize jsPsych
const jsPsych = initJsPsych({

    on_finish: function () {

        console.log(jsPsych.data.get().csv());

    }

});

const timeline = [];

// =====================================================
// OSPAN Letters
// =====================================================

const LETTERS = [
    "F","H","J","K",
    "L","N","P","Q",
    "R","S","T","Y"
];

// =====================================================
// Random Sample Without Replacement
// =====================================================

function sampleLetters(n){

    let pool = [...LETTERS];

    // Fisher-Yates shuffle

    for(let i = pool.length - 1; i > 0; i--){

        const j = Math.floor(Math.random() * (i + 1));

        [pool[i], pool[j]] = [pool[j], pool[i]];

    }

    return pool.slice(0,n);

}

// =====================================================
// Letter Presentation
// =====================================================

function createLetterPresentation(letterArray){

    const trials = [];

    letterArray.forEach(letter=>{

        trials.push({

            type: jsPsychHtmlKeyboardResponse,

            stimulus:`
                <div style="
                    font-size:72px;
                    font-family:Arial;
                    font-weight:bold;
                ">
                    ${letter}
                </div>
            `,

            choices:"NO_KEYS",

            trial_duration:800

        });

        trials.push({

            type: jsPsychHtmlKeyboardResponse,

            stimulus:"",

            choices:"NO_KEYS",

            trial_duration:250

        });

    });

    return trials;

}

// =====================================================
// Generate One Random Practice Trial
// =====================================================

const practiceLetters = sampleLetters(3);

// =====================================================
// Welcome
// =====================================================

timeline.push({

    type: jsPsychHtmlButtonResponse,

    stimulus:`

        <h1>Automated Shortened OSPAN</h1>

        <p>Development Version 0.4</p>

    `,

    choices:["Continue"]

});

// =====================================================
// Ready
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
// Letters
// =====================================================

timeline.push(

    ...createLetterPresentation(practiceLetters)

);

// =====================================================
// Recall
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

                presentedLetters: practiceLetters,

                recalledLetters: responses

            });

        });

    }

});

// =====================================================
// End
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