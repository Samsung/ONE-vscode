function openDetail() {
    document.querySelector('#main').style.marginRight = "35%";
    document.querySelector('#detail').style.width = "35%";
    document.querySelector("#detail").style.display = "block";
}

function closeDetail() {
    document.querySelector('#main').style.marginRight = "0%";
    document.querySelector("#detail").style.display = "none";
}

function createDetailContent(nodes, id, g) {
    var _node = g.node(id);
    console.log("Clicked " + id, _node);

    removeElementsByClass('detail-content-list');
    nodes.forEach(node => {
        if (node.index == id) {
            for (let key in node) {
                if (key === 'type' || key === 'location') {
                    createDetailItem(key, node[key], '#node-properties-content');
                }

                if (key == 'attributes') {
                    node[key].forEach(element => {
                        createDetailItem(element['attribute'], element['value'], '#attributes-content');
                    })
                }

                if (key == 'inputs') {
                    node[key].forEach((input, idx) => {
                        createDetailItem(`input ${idx}`, `name: ${input['name']}`, '#inputs-content');
                        createDetailItem('', `type: [${getTypeArray(',', input['type'])}]`, '#inputs-content');
                        createDetailItem('', `location: ${input['location']}`, '#inputs-content');
                    })
                }

                if (key == 'outputs') {
                    node[key].forEach((output, idx) => {
                        createDetailItem(`output ${idx}`, `name: ${output['name']}`, '#outputs-content');
                        createDetailItem('', `type: [${getTypeArray(',', output['type'])}]`, '#outputs-content');
                        createDetailItem('', `location: ${output['location']}`, '#outputs-content');
                    })
                }
            }
        }
    })
    openDetail();
}

function removeElementsByClass(className) {
    const elements = document.getElementsByClassName(className);
    while (elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
    }
}

function getTypeArray(delimeter, type) {
    let result = '';
    for (key in type) {
        result = result + type[key] + delimeter;
    }
    result = result.slice(0, -1);
    return result;
}

function createDetailItem(key, inputValue, selector) {
    let name = document.createElement('div');
    name.setAttribute("class", "detail-content-name detail-content-list");
    let label = document.createElement('label');
    label.innerHTML = key;
    name.appendChild(label);

    let value = document.createElement('div');
    value.setAttribute("class", "detail-content-item detail-content-list");
    value.innerHTML = inputValue;

    document.querySelector(selector).appendChild(name);
    document.querySelector(selector).appendChild(value);
}