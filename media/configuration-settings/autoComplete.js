// autoCompletePath copy former output_path to later input_path
const autoCompletePath = function () {
    for (let i = 0; i < oneToolList.length; i++) {
      if (oneToolList[i].use === true) {
        for (let j = 0; j < oneToolList[i].options.length; j++) {
          if (
            oneToolList[i].options[j].optionName === "output_path" &&
            oneToolList[i].options[j].optionValue.trim() !== ""
          ) {
            for (let k = i + 1; k < oneToolList.length; k++) {
              if (oneToolList[k].use === true) {
                for (let l = 0; l < oneToolList[k].options.length; l++) {
                  if (oneToolList[k].options[l].optionName === "input_path") {
                    oneToolList[k].options[l].optionValue =
                      oneToolList[i].options[j].optionValue;
                    break;
                  }
                }
                break;
              }
            }
          }
        }
      }
    }
};
