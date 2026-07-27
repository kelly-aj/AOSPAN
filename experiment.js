// =====================================================
// Automated Shortened OSPAN
// Version 1.0
// experiment.js
// =====================================================

// -----------------------------------------------------
// Initialize jsPsych
// -----------------------------------------------------

const jsPsych = initJsPsych({

    on_finish: function(){

        console.log(jsPsych.data.get().csv());

    }

});

// -----------------------------------------------------
// Timeline
// -----------------------------------------------------

const timeline = [];

// -----------------------------------------------------
// Utility Functions
// -----------------------------------------------------

function randInt(min,max){

    return Math.floor(

        Math.random()*(max-min+1)

    )+min;

}

// -----------------------------------------------------
// Random Letter Sampling
// -----------------------------------------------------

function sampleLetters(setSize){

    let pool=[...LETTERS];

    for(let i=pool.length-1;i>0;i--){

        const j=Math.floor(

            Math.random()*(i+1)

        );

        [pool[i],pool[j]]=[pool[j],pool[i]];

    }

    return pool.slice(0,setSize);

}

// -----------------------------------------------------
// Recall Scoring
// -----------------------------------------------------

function scoreRecall(presented,recalled){

    let correct=0;

    for(let i=0;i<presented.length;i++){

        if(presented[i]===recalled[i]){

            correct++;

        }

    }

    return correct;

}// -----------------------------------------------------
// Generate One Math Problem
// -----------------------------------------------------

function generateMathProblem(){

    while(true){

        const a = randInt(1,5);
        const b = randInt(1,5);

        const multiply = Math.random() < 0.5;

        let leftValue;
        let leftText;

        if(multiply){

            leftValue = a * b;
            leftText = `(${a} × ${b})`;

        }else{

            leftValue = a;
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

        if(correctAnswer < 0 || correctAnswer > 15){

            continue;

        }

        const isTrue = Math.random() < 0.5;

        let displayedAnswer;

        if(isTrue){

            displayedAnswer = correctAnswer;

        }else{

            do{

                displayedAnswer =
                    correctAnswer + randInt(-2,2);

            }

            while(

                displayedAnswer === correctAnswer ||

                displayedAnswer < 0 ||

                displayedAnswer > 15

            );

        }

        return{

            equation:
                `${leftText} ${add ? "+" : "-"} ${c} = ?`,

            shownAnswer: displayedAnswer,

            isTrue: isTrue

        };

    }

}

// -----------------------------------------------------
// Letter Presentation
// -----------------------------------------------------

function createLetterPresentation(letterArray){

    const trials=[];

    letterArray.forEach(letter=>{

        trials.push({

            type: jsPsychHtmlKeyboardResponse,

            stimulus:`

                <div class="letterStimulus">

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

// -----------------------------------------------------
// Math Timeline
// -----------------------------------------------------

function createMathTimeline(problem){

    return [

        // -----------------------------
        // Equation Screen
        // -----------------------------

        {

            type: jsPsychHtmlKeyboardResponse,

            stimulus:`

                <div class="mathEquation">

                    ${problem.equation}

                </div>

                <div class="mathPrompt">

                    Solve the problem.<br><br>

                    Click the mouse to continue.

                </div>

            `,

            choices:"NO_KEYS",

            response_ends_trial:false,

            on_load:function(){

                setTimeout(function(){

                    document.addEventListener(

                        "click",

                        advanceEquation

                    );

                },200);

                function advanceEquation(){

                    document.removeEventListener(

                        "click",

                        advanceEquation

                    );

                    jsPsych.finishTrial();

                }

            }

        },

        // -----------------------------
        // True / False Screen
        // -----------------------------

        {

            type: jsPsychHtmlButtonResponse,

            stimulus:`

                <div class="mathAnswer">

                    ${problem.shownAnswer}

                </div>

            `,

            choices:["True","False"],

            on_finish:function(data){

                const choseTrue =
                    data.response === 0;

                data.mathCorrect =

                    (choseTrue && problem.isTrue) ||

                    (!choseTrue && !problem.isTrue);

            }

        }

    ];

}

// -----------------------------------------------------
// Build One OSPAN Trial
// -----------------------------------------------------

function createOSPANTrial(setSize){

    const trial={

        letters:sampleLetters(setSize),

        math:[]

    };

    for(let i=0;i<setSize;i++){

        trial.math.push(

            generateMathProblem()

        );

    }

    return trial;

}