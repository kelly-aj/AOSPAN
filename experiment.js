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
// Score Recall
// =====================================================

function scoreRecall(presented, recalled){

    let correct = 0;

    for(let i = 0; i < presented.length; i++){

        if(recalled[i] === presented[i]){

            correct++;

        }

    }

    return correct;

}

// =====================================================
// Random Integer
// =====================================================

function randInt(min, max){

    return Math.floor(Math.random() * (max - min + 1)) + min;

}

// =====================================================
// Generate One Math Problem
// =====================================================

function generateMathProblem(){

    while(true){

        const a = randInt(1,5);
        const b = randInt(1,5);

        const useMultiply = Math.random() < 0.5;

        let leftValue;
        let leftText;

        if(useMultiply){

            leftValue = a * b;
            leftText = `(${a} × ${b})`;

        }else{

            leftValue = Math.floor(a * b / b);
            leftText = `(${a*b} ÷ ${b})`;

        }

        const c = randInt(1,5);

        const add = Math.random() < 0.5;

        let correctAnswer;

        if(add){

            correctAnswer = leftValue + c;

        }else{

            correctAnswer = leftValue - c;

        }

        if(correctAnswer < 0 || correctAnswer > 15)
            continue;

        const isTrue = Math.random() < 0.5;

        let displayedAnswer;

        if(isTrue){

            displayedAnswer = correctAnswer;

        }else{

            do{

                displayedAnswer =
                    correctAnswer + randInt(-2,2);

            }while(
                displayedAnswer === correctAnswer ||
                displayedAnswer < 0 ||
                displayedAnswer > 15
            );

        }

        return{

            equation:
                `${leftText} ${add ? "+" : "-"} ${c} = ${displayedAnswer}`,

            correctAnswer:correctAnswer,

            displayedAnswer:displayedAnswer,

            isTrue:isTrue

        };

    }

}

// =====================================================
// Math Practice
// =====================================================

timeline.push({

    type: jsPsychHtmlButtonResponse,

    stimulus:function(){

        return `

            <div style="font-size:48px;
                        font-family:Arial;
                        text-align:center;">

                ${practiceMath.equation}

            </div>

            <br><br>

            <p>Work the problem, then press Continue.</p>

        `;

    },

    choices:["Continue"]

});

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
const practiceMath = generateMathProblem();

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

    const score =
        scoreRecall(practiceLetters, responses);

    jsPsych.finishTrial({

        presentedLetters: practiceLetters,

        recalledLetters: responses,

        correctLetters: score

    });

});

    }

});

// =====================================================
// End
// =====================================================

// =====================================================
// Feedback
// =====================================================

timeline.push({

    type: jsPsychHtmlButtonResponse,

    stimulus:function(){

        const last =
            jsPsych.data.get().last(1).values()[0];

        return `

            <h2>Practice Feedback</h2>

            <p>You recalled <strong>${last.correctLetters}</strong>
            out of
            <strong>${last.presentedLetters.length}</strong>
            letters correctly.</p>

        `;

    },

    choices:["Continue"]

});

// =====================================================
// Run
// =====================================================

jsPsych.run(timeline);