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
        {optionName: 'v1', optionValue: false},
        {optionName: 'v2', optionValue: false},
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
        {optionName: 'v1', optionValue: false},
        {optionName: 'v2', optionValue: false},
        {optionName: 'graph_def', optionValue: false},
        {optionName: 'saved_model', optionValue: false},
        {optionName: 'keras_model', optionValue: false},
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

const changeOptimizeUse = function() {
    const optionFieldset = document.querySelector('#options')
    if (optimize.use === true) {
        optimize.use = false
        optionFieldset.disabled = true
    } else {
        optimize.use = true
        optionFieldset.disabled = false
    }
}

const changeQuantizeUse = function() {
    const optionFieldset = document.querySelector('#options')
    if (quantize.use === true) {
        quantize.use = false
        optionFieldset.disabled = true
    } else {
        quantize.use = true
        optionFieldset.disabled = false
    }
}

const changePackUse = function() {
    const optionFieldset = document.querySelector('#options')
    if (pack.use === true) {
        pack.use = false
        optionFieldset.disabled = true
    } else {
        pack.use = true
        optionFieldset.disabled = false
    }
}

const changeCodegenUse = function() {
    const optionFieldset = document.querySelector('#options')
    if (codegen.use === true) {
        codegen.use === false
        optionFieldset.disabled = true
    } else {
        codegen.use === true
        optionFieldset.disabled = false
    }
}

const changeProfileUse = function() {
    const optionFieldset = document.querySelector('#options')
    if (profile.use === true) {
        profile.use = false
        optionFieldset.disabled = true
    } else {
        profile.use = true
        optionFieldset.disabled = false
    }
}

const configurations = [
    oneImport,
    oneImportBcq,
    oneImportOnnx,
    oneImportTf,
    oneImportTflite,
    optimize,
    quantize,
    pack,
    codegen,
    profile
]

const emptyOptionBox = function() {
    const useBtn = document.querySelector('#useBtn')
    useBtn.removeEventListener('click', changeOptimizeUse)
    useBtn.removeEventListener('click', changeQuantizeUse)
    useBtn.removeEventListener('click', changePackUse)
    useBtn.removeEventListener('click', changeCodegenUse)
    useBtn.removeEventListener('click', changeProfileUse)
    const optionsName = document.querySelector('#optionsName')
    while (optionsName.hasChildNodes()) {
        optionsName.removeChild(optionsName.firstChild)
    }
    const optionsValue = document.querySelector('#optionsValue')
    while (optionsValue.hasChildNodes()) {
        optionsValue.removeChild(optionsValue.firstChild)
    }
}

const showOptions = function(event) {
    emptyOptionBox()
    switch (event.target.id) {
        case 'import':{
            console.log(type)
            break
        }
        case 'optimize':{
            // tool 이름이랑 토글버튼 변경하는 부분
            const h2Tag = document.querySelector('#toolName')
            h2Tag.innerText = 'Options for Optimize'
            const useBtn = document.querySelector('#useBtn')
            useBtn.addEventListener('click', changeOptimizeUse)
            const optionFieldset = document.querySelector('#options')
            if (optimize.use === true) {
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
            for (let i=0;i<optimize.options.length;i++) {
                const nameLiTag = document.createElement('li')
                const valueLiTag = document.createElement('li')
                if (typeof optimize.options[i].optionValue === 'boolean') {
                    // 들어오는 값이 boolean 값일 경우
                    const valueLabelTag = document.createElement('label')
                    valueLabelTag.classList.add('switch')
                    const inputTag = document.createElement('input')
                    inputTag.type = 'checkbox'
                    if (optimize.options[i].optionValue === true) {
                        inputTag.checked = true
                    }
                    inputTag.addEventListener('click', function() {
                        if (optimize.options[i].optionValue === true) {
                            optimize.options[i].optionValue = false
                        } else {
                            optimize.options[i].optionValue = true
                        }
                    })
                    const spanTag = document.createElement('span')
                    spanTag.classList.add('slider')
                    spanTag.classList.add('round')
                    valueLabelTag.appendChild(inputTag)
                    valueLabelTag.appendChild(spanTag)
                    valueLiTag.appendChild(valueLabelTag)
                    nameLiTag.innerText = optimize.options[i].optionName
                } else {
                    // 들어오는 값이 string 값일 경우
                    nameLiTag.innerText = optimize.options[i].optionName
                    const inputTag = document.createElement('input')
                    if (optimize.options[i].optionValue.trim() !== '') {
                        inputTag.value = optimize.options[i].optionValue
                    }
                    inputTag.addEventListener('change', function(event) {
                        optimize.options[i].optionValue = event.target.value
                    })
                    valueLiTag.appendChild(inputTag)
                }
                valueUlTag.appendChild(valueLiTag)
                nameUlTag.appendChild(nameLiTag)
            }
            optionsValueTag.appendChild(valueUlTag)
            optionsNameTag.appendChild(nameUlTag)
            break
        }
        case 'quantize':{
            // tool 이름이랑 토글버튼 변경하는 부분
            const h2Tag = document.querySelector('#toolName')
            h2Tag.innerText = 'Options for Quantize'
            const useBtn = document.querySelector('#useBtn')
            useBtn.addEventListener('click', changeQuantizeUse)
            const optionFieldset = document.querySelector('#options')
            if (quantize.use === true) {
                useBtn.checked = true
                optionFieldset.disabled = false
            } else {
                useBtn.checked = false
                optionFieldset.disabled = true
            }
            const optionsNameTag = document.querySelector('#optionsName')
            const optionsValueTag = document.querySelector('#optionsValue')
            const nameUlTag = document.createElement('ul')
            const valueUlTag = document.createElement('ul')
            // 내부 옵션들 하나씩 포문 돌면서 생성하는 기능
            for (let i=0;i<quantize.options.length;i++) {
                const nameLiTag = document.createElement('li')
                const valueLiTag = document.createElement('li')
                if (typeof quantize.options[i].optionValue === 'boolean') {
                    // 들어오는 값이 boolean 값일 경우
                    const valueLabelTag = document.createElement('label')
                    valueLabelTag.classList.add('switch')
                    const inputTag = document.createElement('input')
                    inputTag.type = 'checkbox'
                    if (quantize.options[i].optionValue === true) {
                        inputTag.checked = true
                    }
                    inputTag.addEventListener('click', function() {
                        if (quantize.options[i].optionValue === true) {
                            quantize.options[i].optionValue = false
                        } else {
                            quantize.options[i].optionValue = true
                        }
                    })
                    const spanTag = document.createElement('span')
                    spanTag.classList.add('slider')
                    spanTag.classList.add('round')
                    valueLabelTag.appendChild(inputTag)
                    valueLabelTag.appendChild(spanTag)
                    valueLiTag.appendChild(valueLabelTag)
                    nameLiTag.innerText = quantize.options[i].optionName
                } else {
                    // 들어오는 값이 string 값일 경우
                    nameLiTag.innerText = quantize.options[i].optionName
                    const inputTag = document.createElement('input')
                    if (quantize.options[i].optionValue.trim() !== '') {
                        inputTag.value = quantize.options[i].optionValue
                    }
                    inputTag.addEventListener('change', function(event) {
                        quantize.options[i].optionValue = event.target.value
                    })
                    valueLiTag.appendChild(inputTag)
                }
                valueUlTag.appendChild(valueLiTag)
                nameUlTag.appendChild(nameLiTag)
            }
            optionsValueTag.appendChild(valueUlTag)
            optionsNameTag.appendChild(nameUlTag)
            break
        }
        case 'pack': {
            const h2Tag = document.querySelector('#toolName')
            h2Tag.innerText = 'Options for Pack'
            const useBtn = document.querySelector('#useBtn')
            useBtn.addEventListener('click', changePackUse)
            const optionFieldset = document.querySelector('#options')
            if (pack.use === true) {
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
            for (let i=0;i<pack.options.length;i++) {
                const nameLiTag = document.createElement('li')
                const valueLiTag = document.createElement('li')
                if (typeof pack.options[i].optionValue === 'boolean') {
                    // 들어오는 값이 boolean 값일 경우
                    const valueLabelTag = document.createElement('label')
                    valueLabelTag.classList.add('switch')
                    const inputTag = document.createElement('input')
                    inputTag.type = 'checkbox'
                    if (pack.options[i].optionValue === true) {
                        inputTag.checked = true
                    }
                    inputTag.addEventListener('click', function() {
                        if (pack.options[i].optionValue === true) {
                            pack.options[i].optionValue = false
                        } else {
                            pack.options[i].optionValue = true
                        }
                    })
                    const spanTag = document.createElement('span')
                    spanTag.classList.add('slider')
                    spanTag.classList.add('round')
                    valueLabelTag.appendChild(inputTag)
                    valueLabelTag.appendChild(spanTag)
                    valueLiTag.appendChild(valueLabelTag)
                    nameLiTag.innerText = pack.options[i].optionName
                } else {
                    // 들어오는 값이 string 값일 경우
                    nameLiTag.innerText = pack.options[i].optionName
                    const inputTag = document.createElement('input')
                    if (pack.options[i].optionValue.trim() !== '') {
                        inputTag.value = pack.options[i].optionValue
                    }
                    inputTag.addEventListener('change', function(event) {
                        pack.options[i].optionValue = event.target.value
                    })
                    valueLiTag.appendChild(inputTag)
                }
                valueUlTag.appendChild(valueLiTag)
                nameUlTag.appendChild(nameLiTag)
            }
            optionsValueTag.appendChild(valueUlTag)
            optionsNameTag.appendChild(nameUlTag)
            break
        }
        case 'codegen': {
            const h2Tag = document.querySelector('#toolName')
            h2Tag.innerText = 'Options for Codegen'
            const useBtn = document.querySelector('#useBtn')
            useBtn.addEventListener('click', changeCodegenUse)
            const optionFieldset = document.querySelector('#options')
            if (codegen.use === true) {
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
            for (let i=0;i<codegen.options.length;i++) {
                const nameLiTag = document.createElement('li')
                const valueLiTag = document.createElement('li')
                if (typeof codegen.options[i].optionValue === 'boolean') {
                    // 들어오는 값이 boolean 값일 경우
                    const valueLabelTag = document.createElement('label')
                    valueLabelTag.classList.add('switch')
                    const inputTag = document.createElement('input')
                    inputTag.type = 'checkbox'
                    if (codegen.options[i].optionValue === true) {
                        inputTag.checked = true
                    }
                    inputTag.addEventListener('click', function() {
                        if (codegen.options[i].optionValue === true) {
                            codegen.options[i].optionValue = false
                        } else {
                            codegen.options[i].optionValue = true
                        }
                    })
                    const spanTag = document.createElement('span')
                    spanTag.classList.add('slider')
                    spanTag.classList.add('round')
                    valueLabelTag.appendChild(inputTag)
                    valueLabelTag.appendChild(spanTag)
                    valueLiTag.appendChild(valueLabelTag)
                    nameLiTag.innerText = codegen.options[i].optionName
                } else {
                    // 들어오는 값이 string 값일 경우
                    nameLiTag.innerText = codegen.options[i].optionName
                    const inputTag = document.createElement('input')
                    if (codegen.options[i].optionValue.trim() !== '') {
                        inputTag.value = codegen.options[i].optionValue
                    }
                    inputTag.addEventListener('change', function(event) {
                        codegen.options[i].optionValue = event.target.value
                    })
                    valueLiTag.appendChild(inputTag)
                }
                valueUlTag.appendChild(valueLiTag)
                nameUlTag.appendChild(nameLiTag)
            }
            optionsValueTag.appendChild(valueUlTag)
            optionsNameTag.appendChild(nameUlTag)
            break
        }
        case 'profile': {
            const h2Tag = document.querySelector('#toolName')
            h2Tag.innerText = 'Options for Profile'
            const useBtn = document.querySelector('#useBtn')
            useBtn.addEventListener('click', changeProfileUse)
            const optionFieldset = document.querySelector('#options')
            if (profile.use === true) {
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
            for (let i=0;i<profile.options.length;i++) {
                const nameLiTag = document.createElement('li')
                const valueLiTag = document.createElement('li')
                if (typeof profile.options[i].optionValue === 'boolean') {
                    // 들어오는 값이 boolean 값일 경우
                    const valueLabelTag = document.createElement('label')
                    valueLabelTag.classList.add('switch')
                    const inputTag = document.createElement('input')
                    inputTag.type = 'checkbox'
                    if (profile.options[i].optionValue === true) {
                        inputTag.checked = true
                    }
                    inputTag.addEventListener('click', function() {
                        if (profile.options[i].optionValue === true) {
                            profile.options[i].optionValue = false
                        } else {
                            profile.options[i].optionValue = true
                        }
                    })
                    const spanTag = document.createElement('span')
                    spanTag.classList.add('slider')
                    spanTag.classList.add('round')
                    valueLabelTag.appendChild(inputTag)
                    valueLabelTag.appendChild(spanTag)
                    valueLiTag.appendChild(valueLabelTag)
                    nameLiTag.innerText = profile.options[i].optionName
                } else {
                    // 들어오는 값이 string 값일 경우
                    nameLiTag.innerText = profile.options[i].optionName
                    const inputTag = document.createElement('input')
                    if (profile.options[i].optionValue.trim() !== '') {
                        inputTag.value = profile.options[i].optionValue
                    }
                    inputTag.addEventListener('change', function(event) {
                        profile.options[i].optionValue = event.target.value
                    })
                    valueLiTag.appendChild(inputTag)
                }
                valueUlTag.appendChild(valueLiTag)
                nameUlTag.appendChild(nameLiTag)
            }
            optionsValueTag.appendChild(valueUlTag)
            optionsNameTag.appendChild(nameUlTag)
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
