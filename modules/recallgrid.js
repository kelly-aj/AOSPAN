CONFIG.LETTERS

let recallResponses = [];

function createRecallGrid(){

    let html = "";

    html += `
    <div class="recall-panel">

        <h2>Recall</h2>

        <p class="instructions">
        Select the letters in the order presented.
        Use Blank if you forgot one.
        </p>

        <div id="letterGrid" class="letter-grid">
    `;

    LETTERS.forEach(letter=>{

        html += `

        <div class="letter-cell">

            <div
                id="box-${letter}"
                class="number-box"
                data-letter="${letter}">

            </div>

            <span class="letter">${letter}</span>

        </div>

        `;

    });

    html += `
        </div>

        <div class="response-string"
             id="responseString">

        </div>

        <div class="button-row">

            <button id="clearBtn">

                Clear

            </button>

            <button id="blankBtn">

                Blank

            </button>

            <button id="enterBtn"
                    disabled>

                Enter

            </button>

        </div>

    </div>
    `;

    return html;

}

function initializeRecallGrid(){

    recallResponses = [];

    LETTERS.forEach(letter=>{

        const box =
            document.getElementById(`box-${letter}`);

        box.addEventListener("click",()=>{

            if(recallResponses.includes(letter))
                return;

            recallResponses.push(letter);

            updateRecallGrid();

        });

    });

    document
        .getElementById("clearBtn")
        .addEventListener("click",clearRecall);

    document
        .getElementById("blankBtn")
        .addEventListener("click",blankRecall);

}

function blankRecall(){

    recallResponses.push("_");

    updateRecallGrid();

}

function clearRecall(){

    recallResponses=[];

    updateRecallGrid();

}

function updateRecallGrid(){

    LETTERS.forEach(letter=>{

        const box =
            document.getElementById(`box-${letter}`);

        const index =
            recallResponses.indexOf(letter);

        if(index==-1){

            box.innerHTML="";

        }

        else{

            box.innerHTML=index+1;

        }

    });

    document
        .getElementById("responseString")
        .innerHTML=
        recallResponses.join("");

    document
        .getElementById("enterBtn")
        .disabled=
        recallResponses.length===0;

}