import renderDashboard from './dashboard.js'

const colorList = ['aquamarine', 'cornflowerblue', 'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgreen', 'lightpink', 'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightsteelblue', 'lime', 'limegreen', 'mediumaquamarine', 'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'mistyrose', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid', 'palegreen', 'palevioletred', 'paleturquoise', 'peru', 'pink', 'plum', 'powderblue', 'rosybrown', 'thistle', 'yellowgreen', 'firebrick', 'dodgerblue', 'darkorange', 'crimson', 'darkmagenta']

export default function openFileSelector(){
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "text/plain";
    input.onchange = (event) => {
        setFileName(event.target.files[0].name);
        processFile(event.target.files[0]);
    };
    input.click();
}

function processFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
        const data = JSON.parse(reader.result).traceEvents;
        processData(data);

        const setData = document.querySelector('.set-data')
        setData.dataset['displayTimeUnit'] = JSON.parse(reader.result).displayTimeUnit
    };
    reader.readAsText(file, "euc-kr");
}

function processData(data) {
    const processedData = {};
    const backgroundColor = {};
    const utility = {};
    const colorLen = colorList.length;
    let maxEndTime = 0;
    let colorIdx = 0;

    data.forEach((ele, idx) => {
        if (!ele.pid) { return; }

        processedData[ele.pid] = processedData[ele.pid] ? processedData[ele.pid] : {};
        processedData[ele.pid][ele.tid] = processedData[ele.pid][ele.tid] ? processedData[ele.pid][ele.tid] : [];

        if (!backgroundColor[ele.name]) {
            backgroundColor[ele.name] = colorList[colorIdx];
            colorIdx += 1;
            colorIdx %= colorLen;
        }

        if (ele.ts + ele.dur > maxEndTime){
            maxEndTime = ele.ts + ele.dur;
        }
        
        ele['backgroundColor'] = backgroundColor[ele.name];
        ele['pk'] = idx;
        processedData[ele.pid][ele.tid].push(ele);
        utility[ele.pid] = utility[ele.pid] ? utility[ele.pid] + ele.dur : ele.dur;
    });

    Object.keys(utility).forEach(key => {
        utility[key] = Math.round(utility[key] * 100 / maxEndTime)/100;
    });

    let maxEndTime_ = maxEndTime;
    let deci = 0;
    while (maxEndTime_ > 0) {
        maxEndTime_ = parseInt(maxEndTime_ / 10);
        deci += 1;
    }

    const endTime = Math.ceil(maxEndTime / (10 ** (deci - 1))) * (10 ** (deci - 1))

    const setData = document.querySelector('.set-data')
    setData.dataset['endTime'] = endTime
    setData.dataset['digit'] = deci

    renderDashboard(utility, endTime, deci, processedData)
}

function setFileName(name) {
    const fileName = document.querySelector('.fileName')
    fileName.innerText = name
}