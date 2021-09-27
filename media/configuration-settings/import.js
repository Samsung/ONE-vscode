function oneImportTools(data, importOpt, tool, idx, defaultImportObject) {
    oneImport.use = true;
    for (let i = 0; i < defaultImportObject.options.length; i++) {
      if (importOpt === defaultImportObject.options[i].optionName) {
        defaultImportObject.options[i].optionValue = data[tool][importOpt];
      }
    }
    for (let i = 0; i < oneImport.options.length; i++) {
      if (i === idx) {
        oneImport.options[i].optionValue = true;
      } else {
        oneImport.options[i].optionValue = false;
      }
    }
  }
  
function oneOtherTools(data, importOpt, tool, otherTool) {
    for (let i = 0; i < otherTool.options.length; i++) {
        if (
            importOpt === otherTool.options[i].optionName &&
            data[tool][importOpt] === "False"
        ) {
            otherTool.options[i].optionValue = false;
        } else if (
            importOpt === otherTool.options[i].optionName &&
            data[tool][importOpt] === "True"
        ) {
            otherTool.options[i].optionValue = true;
        } else if (importOpt === otherTool.options[i].optionName) {
            otherTool.options[i].optionValue = data[tool][importOpt];
        }
    }
}
