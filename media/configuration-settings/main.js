// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

// const vscode = acquireVsCodeApi();

console.log('view from javascript.');

const oneImport = {
    type: 'import',
    use: true,
    options: [
        {optionName: 'bcq', optionValue: false},
        {optionName: 'onnx', optionValue: false},
        {optionName: 'tf', optionValue: false},
        {optionName: 'tflite', optionValue: false}
    ]
}

const oneImportBcq = {
    type: 'import_bcq',
    use: false,
    options: [
        {optionName: 'converter_version', optionValue:['v1','v2'], chosenValue:'v1'},
        {optionName: 'input_path', optionValue: ''},
        {optionName: 'output_path', optionValue: ''},
        {optionName: 'input_arrays', optionValue: ''},
        {optionName: 'input_shapes', optionValue: ''},
        {optionName: 'output_arrays', optionValue: ''},
    ]
}

const oneImportOnnx = {
    type: 'import_onnx',
    use: false,
    options: [
        {optionName: 'input_path', optionValue: ''},
        {optionName: 'output_path', optionValue: ''},
        {optionName: 'input_arrays', optionValue: ''},
        {optionName: 'output_arrays', optionValue: ''},
        {optionName: 'model_format', optionValue: ''},
        {optionName: 'converter_verstion', optionValue: ''},
    ]
}

const oneImportTf = {
    type: 'import_tf',
    use: false,
    options: [
        {optionName: 'converter_version', optionValue: ['v1', 'v2'], chosenValue:'v1'},
        {optionName: 'model_format', optionValue:['graph_def','saved_model','keras_model'], chosenValue:'graph_def'},
        {optionName: 'input_path', optionValue: ''},
        {optionName: 'output_path', optionValue: ''},
        {optionName: 'input_arrays', optionValue: ''},
        {optionName: 'output_arrays', optionValue: ''},
        {optionName: 'input_shapes', optionValue: ''},
    ]
}

const oneImportTflite = {
    type: 'import_tflite',
    use: false,
    options: [
        {optionName: 'input_path', optionValue: ''},
        {optionName: 'output_path', optionValue: ''},
    ]
}

const oneImportOptions = [
    oneImportBcq,
    oneImportOnnx,
    oneImportTf,
    oneImportTflite
]

const optimize = {
    type: 'optimize',
    use: true,
    options: [
        {optionName: 'p', optionValue: false},
        {optionName: 'change_outputs', optionValue: false},
        {optionName: 'input_path', optionValue: ''},
        {optionName: 'output_path', optionValue: ''},
        {optionName: '01', optionValue: false},
        {optionName: 'conver_nchw_to_nhwd', optionValue: false},
        {optionName: 'nchw_to_nhwc_input_shape', optionValue: false},
        {optionName: 'nchw_to_nhwc_output_shape', optionValue: false},
        {optionName: 'fold_add_v2', optionValue: false},
        {optionName: 'fold_cast', optionValue: false},
        {optionName: 'fold_dequantize', optionValue: false},
        {optionName: 'fold_sparse_to_dense', optionValue: false},
        {optionName: 'forward_reshape_to_unaryop', optionValue: false},
        {optionName: 'fuse_add_with_tconv', optionValue: false},
        {optionName: 'fuse_batchnorm_with_conv', optionValue: false},
        {optionName: 'fuse_batchnorm_with_dwconv', optionValue: false},
        {optionName: 'fuse_batchnorm_with_tconv', optionValue: false},
        {optionName: 'fuse_bcq', optionValue: false},
        {optionName: 'fuse_preactivation_batchnorm', optionValue: false},
        {optionName: 'fuse_mean_with_mean', optionValue: false},
        {optionName: 'fuse_transpose_with_mean', optionValue: false},
        {optionName: 'make_batchnorm_gamma_positive', optionValue: false},
        {optionName: 'fuse_activation_function', optionValue: false},
        {optionName: 'fuse_instnorm ', optionValue: false},
        {optionName: 'replace_cw_mul_add_with_depthwise_conv', optionValue: false},
        {optionName: 'remove_fakequant', optionValue: false},
        {optionName: 'remove_quantdequant', optionValue: false},
        {optionName: 'remove_redundant_reshape', optionValue: false},
        {optionName: 'remove_redundant_transpose', optionValue: false},
        {optionName: 'remove_unnecessary_reshape', optionValue: false},
        {optionName: 'remove_unnecessary_slice', optionValue: false},
        {optionName: 'remove_unnecessary_strided_slice', optionValue: false},
        {optionName: 'remove_unnecessary_split', optionValue: false},
        {optionName: 'resolve_customop_add', optionValue: false},
        {optionName: 'resolve_customop_batchmatmul', optionValue: false},
        {optionName: 'resolve_customop_matmul', optionValue: false},
        {optionName: 'resolve_customop_max_pool_with_argmax', optionValue: false},
        {optionName: 'shuffle_weight_to_16x1float32', optionValue: false},
        {optionName: 'substitute_pack_to_reshape', optionValue: false},
        {optionName: 'substitute_squeeze_to_reshape', optionValue: false},
        {optionName: 'substitute_strided_slice_to_reshape', optionValue: false},
        {optionName: 'substitute_transpose_to_reshape', optionValue: false},
        {optionName: 'transform_min_max_to_relu6', optionValue: false},
        {optionName: 'transform_min_relu_to_relu6', optionValue: false},
    ]
}

const quantize = {
    type: 'pack',
    use: true,
    options: [
        {optionName: 'input_path', optionValue: ''},
        {optionName: 'input_data', optionValue: ''},
        {optionName: 'input_data_format', optionValue: ''},
        {optionName: 'output_path', optionValue: ''},
        {optionName: 'p', optionValue: false},
        {optionName: 'input_dtype', optionValue: ''},
        {optionName: 'quantized_dtype', optionValue: ''},
        {optionName: 'granularity', optionValue: ''},
        {optionName: 'min_percentile', optionValue: ''},
        {optionName: 'min_percentile', optionValue: ''},
        {optionName: 'max_percentile', optionValue: ''},
        {optionName: 'mode', optionValue: ''},
    ]
}

const pack = {
    type: 'pack',
    use: true,
    options: [
        {optionName: 'input_path', optionValue: ''},
        {optionName: 'output_path', optionValue: ''},
    ]
}

const codegen = {
    type: 'codegen',
    use: false,
    options: [
        {optionName: 'backend', optionValue: ''},
        {optionName: 'command', optionValue: ''},
    ]
}

const profile = {
    type: 'profile',
    use: false,
    options: [
        {optionName: 'backend', optionValue: ''},
        {optionName: 'command', optionValue: ''},
    ]
}

const changeTargetUse = function(target) {
    const optionFieldset = document.querySelector('#options')
    if (target.use === true) {
        target.use = false
        optionFieldset.disabled = true
    } else {
        target.use = true
        optionFieldset.disabled = false
    }
}

const emptyOptionBox = function(isImport) { 
    if (!isImport) {
        const locaForSelect = document.querySelector('#locaForSelect')
        while (locaForSelect.hasChildNodes()) {
        locaForSelect.removeChild(locaForSelect.firstChild)
        }
    }
    const optionsName = document.querySelector('#optionsName')
    while (optionsName.hasChildNodes()) {
        optionsName.removeChild(optionsName.firstChild)
    }
    const optionsValue = document.querySelector('#optionsValue')
    while (optionsValue.hasChildNodes()) {
        optionsValue.removeChild(optionsValue.firstChild)
    }
}

const buildOptionDom = function(target) {
    // tool 이름이랑 토글버튼 변경하는 부분
    const h2Tag = document.querySelector('#toolName')
    h2Tag.innerText = `Options for ${target.type}`
    const useBtn = document.querySelector('#useBtn')
    if (target.type.startsWith('import')) {
        useBtn.disabled = true
    } else {
        useBtn.disabled = false
    }
    useBtn.addEventListener('click', function(target) {
        const optionFieldset = document.querySelector('#options')
        if (target.use === true) {
            target.use = false
            optionFieldset.disabled = true
        } else {
            target.use = true
            optionFieldset.disabled = false
        }
    })
    const optionFieldset = document.querySelector('#options')
    if (target.use === true) {
        useBtn.checked = true
        optionFieldset.disabled = false
    } else {
        useBtn.checked = false
        optionFieldset.disabled = true
    }
    // 내부 옵션들 하나씩 포문 돌면서 생성하는 기능
    const optionsNameTag = document.querySelector('#optionsName')
    const optionsValueTag = document.querySelector('#optionsValue')
    const nameUlTag = document.createElement('ul')
    const valueUlTag = document.createElement('ul')
    for (let i=0;i<target.options.length;i++) {
        const nameLiTag = document.createElement('li')
        const valueLiTag = document.createElement('li')
        if (typeof target.options[i].optionValue === 'boolean') {
            // 들어오는 값이 boolean 값일 경우
            const valueLabelTag = document.createElement('label')
            valueLabelTag.classList.add('switch')
            const inputTag = document.createElement('input')
            inputTag.type = 'checkbox'
            if (target.options[i].optionValue === true) {
                inputTag.checked = true
            }
            inputTag.addEventListener('click', function() {
                if (target.options[i].optionValue === true) {
                    target.options[i].optionValue = false
                } else {
                    target.options[i].optionValue = true
                }
            })
            const spanTag = document.createElement('span')
            spanTag.classList.add('slider')
            spanTag.classList.add('round')
            valueLabelTag.appendChild(inputTag)
            valueLabelTag.appendChild(spanTag)
            valueLiTag.appendChild(valueLabelTag)
            nameLiTag.innerText = target.options[i].optionName
        } else if (typeof target.options[i].optionValue === 'string') {
            // 들어오는 값이 string 값일 경우
            nameLiTag.innerText = target.options[i].optionName
            if (target.options[i].optionName === 'input_path') {
                const inputTag = document.createElement('input')
                inputTag.disabled = true
                inputTag.id = target.options[i].optionName
                if (target.options[i].optionValue.trim() !== '') {
                    inputTag.value = target.options[i].optionValue
                }
                const btn = document.createElement('button')
                btn.innerText = "Search"
                valueLiTag.appendChild(inputTag)
                valueLiTag.appendChild(btn)
            } else if (target.options[i].optionName === 'output_path') {
                const inputTag = document.createElement('input')
                inputTag.disabled = true
                inputTag.id = target.options[i].optionName
                if (target.options[i].optionValue.trim() !== '') {
                    inputTag.value = target.options[i].optionValue
                }
                const btn = document.createElement('button')
                btn.innerText = "Search"
                valueLiTag.appendChild(inputTag)
                valueLiTag.appendChild(btn)
            } else {
                const inputTag = document.createElement('input')
                if (target.options[i].optionValue.trim() !== '') {
                    inputTag.value = target.options[i].optionValue
                }
                inputTag.addEventListener('change', function(event) {
                    target.options[i].optionValue = event.target.value
                })
                valueLiTag.appendChild(inputTag)
            }
        } else {
            nameLiTag.innerText =target.options[i].optionName
            const select = document.createElement('select')
            select.id = target.options[i].optionName
            select.name = target.options[i].optionName
            for (let j=0; j<target.options[i].optionValue.length;j++) {
                const option = document.createElement('option')
                option.value = target.options[i].optionValue[j]
                option.text = target.options[i].optionValue[j]
                if (target.options[i].optionValue[j]  === target.options[i].chosenValue) {
                    option.selected = true
                }
                select.appendChild(option)
            }
            select.addEventListener('change', function(event) {
                target.options[i].chosenValue = select[event.target.selectedIndex].value
            })
            
            valueLiTag.appendChild(select)
        }
        valueUlTag.appendChild(valueLiTag)
        nameUlTag.appendChild(nameLiTag)
    }
    optionsValueTag.appendChild(valueUlTag)
    optionsNameTag.appendChild(nameUlTag)
}

const changeSelect = function(event) {
    emptyOptionBox(true)
    const selectedText = event.target.options[event.target.selectedIndex].text
    switch (selectedText) {
        case 'bcq': {
            oneImportBcq.use = true
            oneImportOnnx.use = false
            oneImportTf.use = false
            oneImportTflite.use = false
            for (let i=0;i<oneImport.options.length;i++) {
                if (i === 0) {
                    oneImport.options[i].optionValue = true
                } else {
                    oneImport.options[i].optionValue = false
                }
            }
            buildOptionDom(oneImportBcq)
            break
        }
        case 'onnx': {
            oneImportBcq.use = false
            oneImportOnnx.use = true
            oneImportTf.use = false
            oneImportTflite.use = false
            for (let i=0;i<oneImport.options.length;i++) {
                if (i === 1) {
                    oneImport.options[i].optionValue = true
                } else {
                    oneImport.options[i].optionValue = false
                }
            }
            buildOptionDom(oneImportOnnx)
            break
        }
        case 'tf': {
            oneImportBcq.use = false
            oneImportOnnx.use = false
            oneImportTf.use = true
            oneImportTflite.use = false
            for (let i=0;i<oneImport.options.length;i++) {
                if (i === 2) {
                    oneImport.options[i].optionValue = true
                } else {
                    oneImport.options[i].optionValue = false
                }
            }
            buildOptionDom(oneImportTf)
            break
        }
        case 'tflite': {
            for (let i=0;i<oneImport.options.length;i++) {
                if (i === 3) {
                    oneImport.options[i].optionValue = true
                } else {
                    oneImport.options[i].optionValue = false
                }
            }
            oneImportBcq.use = false
            oneImportOnnx.use = false
            oneImportTf.use = false
            oneImportTflite.use = true
            buildOptionDom(oneImportTflite)
            break
        }
    }
}

const showOptions = function(event) {
    emptyOptionBox(false)
    switch (event.target.id) {
        case 'import':{
            const h2Tag = document.querySelector('#toolName')
            h2Tag.innerText = 'Options for Import'
            const useBtn = document.querySelector('#useBtn')
            useBtn.checked = true
            useBtn.disabled = true
            const locaForSelect = document.querySelector('#locaForSelect')
            const select = document.createElement('select')
            select.id = 'framework'
            select.name = 'framework'
            const defaultOption = document.createElement('option')
            defaultOption.value = 'beforeDecision'
            defaultOption.text='choose your framework'
            select.appendChild(defaultOption)
            for (let i=0; i<oneImport.options.length;i++) {
                const option = document.createElement('option')
                option.value = oneImport.options[i].optionName
                option.text = oneImport.options[i].optionName
                select.appendChild(option)
            }
            select.addEventListener('change',changeSelect)
            locaForSelect.appendChild(select)
            let flag = -1
            for (let i=0; i<oneImport.options.length;i++) {
                if (oneImport.options[i].optionValue === true) {
                    flag = i
                    break
                }
            }
            if (flag !== -1) {
                select.options[flag+1].selected = true
                buildOptionDom(oneImportOptions[flag])
            }
            break
        }
        case 'optimize':{
            buildOptionDom(optimize)
            break
        }
        case 'quantize':{
            buildOptionDom(quantize)
            break
        }
        case 'pack': {
            buildOptionDom(pack)
            break
        }
        case 'codegen': {
            buildOptionDom(codegen)
            break
        }
        case 'profile': {
            buildOptionDom(profile)
            break
        }
    }
}

const exportConfiguration = function() {

}
const runConfiguration = function() {

}
const importConfiguration = function() {

}
document.querySelector('#import').addEventListener('click', showOptions)
document.querySelector('#optimize').addEventListener('click', showOptions)
document.querySelector('#quantize').addEventListener('click', showOptions)
document.querySelector('#pack').addEventListener('click', showOptions)
document.querySelector('#codegen').addEventListener('click', showOptions)
document.querySelector('#profile').addEventListener('click', showOptions)
document.querySelector('#importBtn').addEventListener('click', importConfiguration)
document.querySelector('#runBtn').addEventListener('click',runConfiguration)
document.querySelector('#exportBtn').addEventListener('click', exportConfiguration)
const tmpEvent = {
    target: {
        id:'import'
    }
}
showOptions(tmpEvent)