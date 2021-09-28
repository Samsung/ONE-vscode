var importConfigPath = "";

const getFileName = function(oneToolList){
    let filePath = importConfigPath;
    if(filePath === ""){
        filePath = getFirstInputFilePath(oneToolList);
    }
    let fileName = filePath.split(/[\/\\]/).reverse()[0];
    fileName = fileName.split(".");
    if(fileName.length > 1){
        fileName.pop();
    }
    fileName = fileName.join(".");
    return fileName;
};

const getFirstInputFilePath = function(oneToolList){
    for(let i = 0; i < oneToolList.length; i++){
        if(oneToolList[i].use === true){
            for(let j = 0; j < oneToolList[i].options.length; j++){
                if(oneToolList[i].options[j].optionName === "input_path"){
                    return oneToolList[i].options[j].optionValue;
                }
            }
        }
    }
    return "one-build-template";
};
