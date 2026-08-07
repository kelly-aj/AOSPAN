console.log("experiment.js loaded");

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

const practiceTrial = createOSPANTrial(3);

// =====================================================
// Math Practice
// =====================================================

for(let i=0;i<practiceTrial.letters.length;i++){
    timeline.push(
        ...createMathTimeline(practiceTrial.math[i])
    );

    timeline.push(
        ...createLetterPresentation([ practiceTrial.letters[i] ])
    );
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
// Recall
// =====================================================

timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus:function(){
        return createRecallGrid();
    },
    choices: "NO_KEYS",
    trial_duration:null,
    on_load:function(){
        initializeRecallGrid(function(responses){
            const score = scoreRecall(practiceTrial.letters, responses);

            jsPsych.finishTrial({
                presentedLetters: practiceTrial.letters,
                recalledLetters: responses,
                correctLetters: score
            });
        });
    }
});

// =====================================================
// Feedback
// =====================================================

timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus:function(){
        const last = jsPsych.data.get().last(1).values()[0];

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
// Diagnostic: find timeline items with invalid plugin types
// =====================================================
function findInvalidPluginTypes(node, path = "root"){
    const problems = [];

    function inspect(description, currentPath){
        if (Array.isArray(description)){
            description.forEach((child, i)=> inspect(child, `${currentPath}[${i}]`));
            return;
        }
        if (typeof description !== 'object' || description === null) return;
        // If it's a timeline description (has timeline) descend
        if (description.timeline){
            inspect(description.timeline, `${currentPath}.timeline`);
            return;
        }
        // It's a trial description if it has a type
        if (description.type !== undefined){
            const t = description.type;
            const hasInfo = t && typeof t === 'object' && t.info;
            if (typeof t === 'string' || !hasInfo){
                problems.push({ path: currentPath, type: t });
            }
        }
    }

    inspect(node, path);
    return problems;
}

const diagnostics = findInvalidPluginTypes(timeline, 'timeline');
if (diagnostics.length > 0){
    console.error('Found timeline items with invalid plugin types. This will cause the "Plugin not recognized" error in jsPsych v7.');
    console.table(diagnostics);
    // Also surface a readable listing
    diagnostics.forEach(d => console.error('Invalid type at', d.path, '->', d.type));
}

// =====================================================
// Compatibility mapping for legacy plugin name strings
// If the running experiment still has string plugin names (e.g., "html-button-response"),
// replace them with the plugin globals so jsPsych v7 can instantiate them.
// This is a safe, small runtime patch while Pages caching propagates.
// =====================================================
function mapLegacyPluginTypes(node){
    const mapping = {
        'html-button-response': typeof jsPsychHtmlButtonResponse !== 'undefined' ? jsPsychHtmlButtonResponse : null,
        'html-keyboard-response': typeof jsPsychHtmlKeyboardResponse !== 'undefined' ? jsPsychHtmlKeyboardResponse : null
    };

    let replaced = 0;

    function inspectAndReplace(description){
        if (Array.isArray(description)){
            description.forEach(inspectAndReplace);
            return;
        }
        if (!description || typeof description !== 'object') return;
        if (description.timeline){
            inspectAndReplace(description.timeline);
            return;
        }
        if (description.type !== undefined){
            if (typeof description.type === 'string'){
                const mapped = mapping[description.type];
                if (mapped){
                    console.warn(`Mapping legacy plugin type '${description.type}' -> plugin global.`);
                    description.type = mapped;
                    replaced++;
                }
            }
        }
    }

    inspectAndReplace(node);
    return replaced;
}

const nReplaced = mapLegacyPluginTypes(timeline);
if (nReplaced > 0){
    console.log(`Mapped ${nReplaced} legacy plugin type(s) to plugin globals.`);
}

// =====================================================
// Run
// =====================================================

jsPsych.run(timeline);
