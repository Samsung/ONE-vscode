let jsonLoadCheck = 0;
function openFileSelector(flag) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'text/plain';
    input.onchange = (event) => {
        setFileName(event.target.files[0].name, flag);
        processFile(event.target.files[0], flag);
    };
    input.click();
}

function setFileName(name, flag) {
    if (flag === '1') {
        document.querySelector('#first-json-btn').innerHTML = name;
    } else if (flag === '2') {
        document.querySelector('#second-json-btn').innerHTML = name;
    }
}

function processFile(file, flag) {
    const reader = new FileReader();
    reader.onload = () => {
        const data = JSON.parse(reader.result);
        processData(data.displayTimeUnit, data.traceEvents, flag);
    };
    reader.readAsText(file, 'euc-kr');
}

function processData(timeUnit, traceEvents, flag) {
    if (flag === '1') {
        ++jsonLoadCheck;
        document.querySelector('#first-json-btn').disabled = true;
    } else if (flag === '2') {
        ++jsonLoadCheck;
        document.querySelector('#second-json-btn').disabled = true;
    }

    traceEvents.forEach((elem) => {
        if (elem.args !== undefined && elem.args.origin !== undefined) {
            let origins = elem.args.origin.split(',');
            let size = origins.length;
            origins.forEach((origin) => {
                let nodeId = origin.split(':')[0];
                let nodeName = origin.split(':')[1];

                if (durCircleJson[nodeId] !== undefined && nodeName !== 'Unknown') {
                    if (durCircleJson[nodeId].duration === undefined) {
                        durCircleJson[nodeId].duration = { timeUnit: timeUnit, dur1: 0, dur2: 0 };
                    }

                    if (flag === '1') {
                        durCircleJson[nodeId].duration.dur1 += elem.dur / size;
                    } else {
                        durCircleJson[nodeId].duration.dur2 += elem.dur / size;
                    }
                }
            });
        }
    });

    // graph reset
    if (jsonLoadCheck == 2) {
        let graphWrapper = document.querySelector('#wrapper');

        while (graphWrapper.hasChildNodes()) {
            graphWrapper.removeChild(graphWrapper.firstChild);
        }

        TreeMap(durCircleJson);
    }

    console.log(durCircleJson);
}

function reset() {
    jsonLoadCheck = 0;

    // button reset
    let firstJsonBtn = document.querySelector('#first-json-btn');
    let secondJsonBtn = document.querySelector('#second-json-btn');
    firstJsonBtn.disabled = false;
    secondJsonBtn.disabled = false;

    firstJsonBtn.innerHTML = 'Load First Json File';
    secondJsonBtn.innerHTML = 'Load Second Json File';

    if (jsonLoadCheck == 2) {
        let graphWrapper = document.querySelector('#wrapper');

        while (graphWrapper.hasChildNodes()) {
            graphWrapper.removeChild(graphWrapper.firstChild);
        }

        TreeMap(circleJson);
    }
}