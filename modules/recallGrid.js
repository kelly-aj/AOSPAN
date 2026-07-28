// =====================================================
// Automated Shortened OSPAN
// Recall Grid Module
// Version 1.0
// =====================================================

// -----------------------------------------------------
// Constants
// -----------------------------------------------------

const LETTERS = [

    "F","H","J","K",
    "L","N","P","Q",
    "R","S","T","Y"

];

// -----------------------------------------------------
// Global Recall State
// -----------------------------------------------------

let recallResponses = [];

let recallCallback = null;

// -----------------------------------------------------
// Build Recall Grid
// -----------------------------------------------------

function createRecallGrid(){

    let html = "";

    html += `

    <div class="recall-panel">

        <h2>Recall</h2>

        <p class="instructions">

            Select the letters in the order they appeared.

        </p>

        <div class="letter-grid">

    `;

    LETTERS.forEach(letter=>{

        html += `

            <div class="letter-cell">

                <div

                    class="number-box"

                    id="box-${letter}"

                    data-letter="${letter}"

                ></div>

                <div class="letter">

                    ${letter}

                </div>

            </div>

        `;

    });

    html += `

        </div>

        <div

            class="response-string"

            id="responseString">

        </div>

        <div class="button-row">

            <button id="clearBtn">

                Clear

            </button>

            <button id="blankBtn">

                Blank

            </button>

            <button

                id="enterBtn"

                disabled>

                Enter

            </button>

        </div>

    </div>

    `;

    return html;

}

// -----------------------------------------------------
// Initialize Recall Grid
// -----------------------------------------------------

function initializeRecallGrid(callback){

    recallResponses = [];

    recallCallback = callback;

    LETTERS.forEach(letter=>{

        document

            .getElementById(`box-${letter}`)

            .addEventListener(

                "click",

                function(){

                    selectLetter(letter);

                }

            );

    });

    document

        .getElementById("clearBtn")

        .addEventListener(

            "click",

            clearRecall

        );

    document

        .getElementById("blankBtn")

        .addEventListener(

            "click",

            blankRecall

        );

    document

        .getElementById("enterBtn")

        .addEventListener(

            "click",

            finishRecall

        );

}

// -----------------------------------------------------
// Select Letter
// -----------------------------------------------------

function selectLetter(letter){

    if(recallResponses.includes(letter))

        return;

    recallResponses.push(letter);

    updateRecallDisplay();

}

// -----------------------------------------------------
// Blank
// -----------------------------------------------------

function blankRecall(){

    recallResponses.push("_");

    updateRecallDisplay();

}

// -----------------------------------------------------
// Clear
// -----------------------------------------------------

function clearRecall(){

    recallResponses = [];

    updateRecallDisplay();

}

// -----------------------------------------------------
// Update Display
// -----------------------------------------------------

function updateRecallDisplay(){

    LETTERS.forEach(letter=>{

        const box =

            document.getElementById(

                `box-${letter}`

            );

        const index =

            recallResponses.indexOf(letter);

        if(index === -1){

            box.innerHTML = "";

        }

        else{

            box.innerHTML = index + 1;

        }

    });

    document

        .getElementById("responseString")

        .innerHTML =

        recallResponses.join(" ");

    document

        .getElementById("enterBtn")

        .disabled =

        recallResponses.length === 0;

}

// -----------------------------------------------------
// Finish Recall
// -----------------------------------------------------

function finishRecall(){

    if(recallCallback){

        recallCallback(

            [...recallResponses]

        );

    }

}