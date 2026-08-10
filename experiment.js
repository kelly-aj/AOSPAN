console.log("experiment.v2.js loaded");

// =====================================================
// Automated Shortened OSPAN (v2)
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
                displayedAnswer = correctAnswer + randInt(-2,2);
            }while(
                displayedAnswer === correctAnswer ||
                displayedAnswer < 0 ||
                displayedAnswer > 15
            );
        }

        return{
            equation: `${leftText} ${add ? "+" : "-"} ${c} = ${displayedAnswer}`,
            correctAnswer: correctAnswer,
            displayedAnswer: displayedAnswer,
            isTrue: isTrue
        };
    }
}

// =====================================================
// Welcome
// =====================================================

timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <p>In this task, you will complete a series of activities that involve solving math problems and remembering letters. </p>
        <p>On each trial, you will first see a simple math problem. Solve the problem as quickly and accurately as you can. You will then be shown a proposed answer and asked whether the answer is <strong>True</strong> or <strong>False</strong>.</p>
        <p>After making your decision, a letter will appear on the screen. Remember the letter and its position in the sequence.</p>
        <p>You will repeat this process several times. At the end of each sequence, you will be asked to recall the letters in the order in which they appeared.</p>
        <p>We will now practice both the letter and math portions of the task separately.The practice activities are designed to help you become familiar with each part of the task.</p>
    `,
    choices:["Continue"]
});

// =====================================================
// Ready
// =====================================================

timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <h2>Letter Practice</h2>
        <p>First, you will practice remembering letters.</p>
        <p>You will see a series of letters on the screen, one at a time. You should try to remember each letter in the order presented.</p>
        <p>After the last letter has been presented, you will see a grid of letters on the screen. You should select the letters you saw in the order presented. You can submit your answer by pressing the Enter button. </p>
            `,
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
            trial_duration:800
        });

        trials.push({
            type: jsPsychHtmlKeyboardResponse,
            stimulus:"",
            choices: "NO_KEYS",
            trial_duration:250
        });
    });

    return trials;
}

// =====================================================
// Build One Complete OSPAN Trial
// =====================================================

function createOSPANTrial(setSize){
    const trial = {
        letters: sampleLetters(setSize),
        math: []
    };

    for(let i=0;i<setSize;i++){
        trial.math.push(generateMathProblem());
    }

    return trial;
}

// =====================================================
// PRACTICE SESSIONS
// =====================================================

// Intro instructions
timeline.push({
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <p>If you cannot remember a letter for a particular position, click the <strong>Blank</strong> button.</p>
    <p>Use the <strong>Blank</strong> button only when you do not remember the letter for that position. You can still enter letters for the other positions.</p>
    <p>If you make a mistake, you can use the clear button to clear your responses and start over. </p>
  `,
  choices: ['Continue']
});

// --- 1) Letter-only practice: 3 trials, span = 2 ---
timeline.push({
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <p>There are 3 practice trials.</p>
    <p>Are you ready to begin?.</p>
  `,
  choices: ['Begin Letter Practice']
});

for (let p=0; p<3; p++){
  const letters = sampleLetters(2);

  timeline.push(...createLetterPresentation(letters));

  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function(){ return createRecallGrid(); },
    choices: "NO_KEYS",
    trial_duration: null,
    data: { practice: true, practiceType: 'letter' },
    on_load: function(){
      initializeRecallGrid(function(responses){
        const score = scoreRecall(letters, responses);
        jsPsych.finishTrial({
          practice: true,
          practiceType: 'letter',
          span: letters.length,
          presentedLetters: letters,
          recalledLetters: responses,
          correctLetters: score
        });
      });
    }
  });

  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: function(){
      const last = jsPsych.data.get().last(1).values()[0];
      return `
        <h3>Practice feedback</h3>
        <p>You recalled <strong>${last.correctLetters}</strong> of <strong>${last.span}</strong> letters correctly.</p>
      `;
    },
    choices: ['Continue'],
    data: { practice: true, practiceType: 'letter_feedback' }
  });
}

// short break
timeline.push({ type: jsPsychHtmlButtonResponse, stimulus: '<p>Press Continue when you are ready for the math practice.</p>', choices: ['Continue'], data: { practice: true } });

// --- 2) Math-only practice: 3 trials ---
timeline.push({
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <h2>Math Practice</h2>
    <p>First, a math problem will appear on the screen. Solve the problem as quickly and accurately as you can. When you have solved it, click the mouse to continue.</p>
    <p>You will then see a proposed answer. Decide whether the proposed answer is <strong>True</strong> or <strong>False</strong>.</p>
    <p>Try to respond both quickly and accurately.</p>
  `,
  choices: ['Continue']
});

for (let p=0; p<3; p++){
  const problem = generateMathProblem();

  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div style="font-size:48px; text-align:center;">
        ${problem.equation.replace(/=.+/, '= ?')}
      </div>
      <br><br>
      <p>Work the problem, then click the mouse.</p>
    `,
    choices: "NO_KEYS",
    response_ends_trial: false,
    on_load: function(){
      setTimeout(function(){
        document.addEventListener("click", advanceMathScreen);
      }, 200);
      function advanceMathScreen(){
        document.removeEventListener("click", advanceMathScreen);
        jsPsych.finishTrial();
      }
    },
    data: { practice: true, practiceType: 'math_stem' }
  });

  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: `<div style="font-size:48px;">${problem.displayedAnswer}</div>`,
    choices: ['True','False'],
    data: { practice: true, practiceType: 'math_decision', correctAnswer: problem.isTrue },
    on_finish: function(data){
      data.correctMath = (data.response === 0 && problem.isTrue) || (data.response === 1 && !problem.isTrue);
    }
  });

  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: function(){
      const last = jsPsych.data.get().last(1).values()[0];
      const correct = last.correctMath ? 'correct' : 'incorrect';
      return `
        <h3>Practice feedback</h3>
        <p>Your answer was <strong>${correct}</strong>.</p>
      `;
    },
    choices: ['Continue'],
    data: { practice: true, practiceType: 'math_feedback' }
  });
}

// short break
timeline.push({ type: jsPsychHtmlButtonResponse, stimulus: '<p>. Press Continue when you are ready to practice both tasks together.</p>', choices: ['Continue'], data: { practice: true } });

// --- 3) Combined practice: span = 2, 3 trials (math -> decision -> letter) ---
timeline.push({
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <h2>Combined Practice</h2>
    <p>Now you will practice the full task.</p>
    <p>On each trial, you will first solve a math problem and decide whether the proposed answer is <strong>True</strong> or <strong>False</strong>.
    <p>After making that decision, you will see a letter appear on the screen. </p>
    <p>This sequence of math problem and then letter will repeat several times. After the last letter, the grid will appear and you should recall the letters you saw in the order in whcih they appeared </p>
    <p>Remember: <strong>do your best to solve the math problems quickly and accurately while also remembering the letters.</strong></p>
  `,
  choices: ['Continue']
});

for (let p=0; p<3; p++){
  const blockTrial = createOSPANTrial(2); // span = 2

  for (let i=0; i<blockTrial.letters.length; i++){
    timeline.push({
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `
        <div style="font-size:48px; text-align:center;">
          ${blockTrial.math[i].equation.replace(/=.+/, '= ?')}
        </div>
        <br><br>
        <p>Work the problem, then click the mouse.</p>
      `,
      choices: "NO_KEYS",
      response_ends_trial: false,
      on_load: function(){
        setTimeout(function(){
          document.addEventListener("click", advanceMathScreen);
        }, 200);
        function advanceMathScreen(){
          document.removeEventListener("click", advanceMathScreen);
          jsPsych.finishTrial();
        }
      },
      data: { practice: true, practiceType: 'combined_math_stem' }
    });

    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: `<div style="font-size:48px;">${blockTrial.math[i].displayedAnswer}</div>`,
      choices: ['True','False'],
      data: { practice: true, practiceType: 'combined_math_decision', correctAnswer: blockTrial.math[i].isTrue },
      on_finish: function(data){
        data.correctMath = (data.response === 0 && blockTrial.math[i].isTrue) || (data.response === 1 && !blockTrial.math[i].isTrue);
      }
    });

    timeline.push(...createLetterPresentation([ blockTrial.letters[i] ]));
  }

  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function(){ return createRecallGrid(); },
    choices: "NO_KEYS",
    trial_duration: null,
    data: { practice: true, practiceType: 'combined_recall' },
    on_load: function(){
      initializeRecallGrid(function(responses){
        const score = scoreRecall(blockTrial.letters, responses);
        jsPsych.finishTrial({
          practice: true,
          practiceType: 'combined',
          span: blockTrial.letters.length,
          presentedLetters: blockTrial.letters,
          recalledLetters: responses,
          correctLetters: score
        });
      });
    }
  });

  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: function(){
      const last = jsPsych.data.get().last(1).values()[0];
      return `<h3>Practice feedback</h3><p>You recalled <strong>${last.correctLetters}</strong> of <strong>${last.span}</strong> letters correctly.</p>`;
    },
    choices: ['Continue'],
    data: { practice: true, practiceType: 'combined_feedback' }
  });

  timeline.push({ type: jsPsychHtmlButtonResponse, stimulus: '<p>Short break before the next practice trial.</p>', choices: ['Continue'], data: { practice: true } });
}

// =====================================================
// Run blocks for spans 3..7 in random order
// =====================================================

window.spans = jsPsych.randomization.shuffle([3,4,5,6,7]);
console.log('Block order (spans):', window.spans);

for (const span of window.spans){
    // Block start screen
    timeline.push({
        type: jsPsychHtmlButtonResponse,
        stimulus: `<h2>Span size: ${span}</h2><p>Press Continue to begin this block.</p>`,
        choices:["Continue"]
    });

    const blockTrial = createOSPANTrial(span);

    // Present math + letter for each item
    for (let i=0;i<blockTrial.letters.length;i++){
        timeline.push(...createMathTimeline(blockTrial.math[i]));
        timeline.push(...createLetterPresentation([ blockTrial.letters[i] ]));
    }

    // Recall screen for this block
    timeline.push({
        type: jsPsychHtmlKeyboardResponse,
        stimulus:function(){
            return createRecallGrid();
        },
        choices: "NO_KEYS",
        trial_duration:null,
        on_load:function(){
            initializeRecallGrid(function(responses){
                const score = scoreRecall(blockTrial.letters, responses);

                jsPsych.finishTrial({
                    span: blockTrial.letters.length,
                    presentedLetters: blockTrial.letters,
                    recalledLetters: responses,
                    correctLetters: score
                });
            });
        }
    });

    // Feedback for this block
    timeline.push({
        type: jsPsychHtmlButtonResponse,
        stimulus:function(){
            const last = jsPsych.data.get().last(1).values()[0];

            return `
                <h2>Block feedback — span ${last.span}</h2>
                <p>You recalled <strong>${last.correctLetters}</strong> of <strong>${last.span}</strong> letters correctly.</p>
            `;
        },
        choices:["Continue"]
    });

    // Short break
    timeline.push({
        type: jsPsychHtmlButtonResponse,
        stimulus: `<p>Short break. Press Continue when ready for the next block.</p>`,
        choices:["Continue"]
    });
}

// =====================================================
// Create One Math Trial
// =====================================================

function createMathTimeline(problem){
    return [
        // Equation
        {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: `
                <div style="
                    font-size:48px;
                    font-family:Arial;
                    text-align:center;
                ">
                    ${problem.equation.replace(/=.+/, "= ?")}
                </div>
                <br><br>
                <p>Work the problem, then click the mouse.</p>
            `,
            choices: "NO_KEYS",
            response_ends_trial: false,
            on_load: function(){
                setTimeout(function(){
                    document.addEventListener("click", advanceMathScreen);
                },200);

                function advanceMathScreen(){
                    document.removeEventListener("click", advanceMathScreen);
                    jsPsych.finishTrial();
                }
            }
        },

        // True / False Screen
        {
            type: jsPsychHtmlButtonResponse,
            stimulus: `
                <div style="
                    font-size:48px;
                    font-family:Arial;
                ">
                    ${problem.displayedAnswer}
                </div>
            `,
            choices:["True","False"],
            data:{
                correct: problem.isTrue
            },
            on_finish:function(data){
                data.correctMath =
                    (data.response===0 && problem.isTrue) ||
                    (data.response===1 && !problem.isTrue);
            }
        }
    ];
}

// =====================================================
// Run
// =====================================================

jsPsych.run(timeline);
