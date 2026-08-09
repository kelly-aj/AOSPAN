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
    stimulus: `
        <h2>Letter Practice</h2>
        <p>Get ready.</p>
    `,
    choices:["Begin"]
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
    <h2>Practice Overview</h2>
    <p>You'll complete three short practice sections:</p>
    <ol>
      <li>Letter recall (2 letters)</li>
      <li>Math decisions</li>
      <li>Combined (math + decision + letter) using spans of 2</li>
    </ol>
    <p>Each part has 3 practice trials.</p>
  `,
  choices: ['Begin practice']
});

// --- 1) Letter-only practice: 3 trials, span = 2 ---
timeline.push({
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <h2>Practice 1 — Letter Recall</h2>
    <p>You will see 2 letters in sequence. Afterward, type them in order using the recall grid.</p>
    <p>There are 3 practice trials.</p>
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
timeline.push({ type: jsPsychHtmlButtonResponse, stimulus: '<p>Short break. Press Continue when ready for the math practice.</p>', choices: ['Continue'], data: { practice: true } });

// --- 2) Math-only practice: 3 trials ---
timeline.push({
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <h2>Practice 2 — Math Decisions</h2>
    <p>You will be shown simple equations. Click to reveal, then choose True or False.</p>
    <p>There are 3 practice problems.</p>
  `,
  choices: ['Begin Math Practice']
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
timeline.push({ type: jsPsychHtmlButtonResponse, stimulus: '<p>Short break. Press Continue when ready for the combined practice.</p>', choices: ['Continue'], data: { practice: true } });

// --- 3) Combined practice: span = 2, 3 trials (math -> decision -> letter) ---
timeline.push({
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <h2>Practice 3 — Combined (math + letters)</h2>
    <p>You'll practice the full sequence: math problem, decide True/False, then a letter appears.</p>
    <p>Each trial uses span = 2 (2 math+letter items); there are 3 practice trials.</p>
  `,
  choices: ['Begin Combined Practice']
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
