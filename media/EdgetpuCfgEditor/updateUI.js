/*
 * Copyright (c) 2023 Samsung Electronics Co., Ltd. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export function updateStepUI(step) {
  const allOptionPanels = document.querySelectorAll(".optionPanel .options");
  allOptionPanels.forEach(function (panel) {
    panel.style.display = "none";
  });

  const optionPanel = document.getElementById("option" + step);
  optionPanel.style.display = "block";

  const edgeTPUSearchDelegate = document.getElementById(
    "EdgeTPUSearchDelegate"
  );
  const edgeTPUDelegateSearchStepDiv = document.getElementById(
    "EdgeTPUDelegateSearchStepDiv"
  );
  const edgeTPUIntermediateTensors = document.getElementById(
    "EdgeTPUIntermediateTensors"
  );

  if (edgeTPUSearchDelegate.checked) {
    edgeTPUIntermediateTensors.value = "";
    edgeTPUDelegateSearchStepDiv.style.display = "block";
  } else {
    edgeTPUDelegateSearchStepDiv.style.display = "none";
  }

  const allSteps = document.querySelectorAll(".statusbar .steps .step");
  allSteps.forEach(function (step) {
    step.classList.remove("current");
  });

  const stepbar = document.getElementById("stepbar" + step);
  stepbar.classList.add("current");
}

export function updateEdgeTPUCompileUI() {
  const allOptionPanels = document.querySelectorAll(".optionPanel .options");
  allOptionPanels.forEach(function (panel) {
    panel.style.display = "none";
  });

  const edgeTPUBasicOptions = document.getElementById(
    "optionImportEdgeTPUBasic"
  );
  const edgeTPUAdvancedOptions = document.getElementById(
    "optionImportEdgeTPUAdvanced"
  );
  const edgeTPUSearchDelegate = document.getElementById(
    "EdgeTPUSearchDelegate"
  );
  const edgeTPUDelegateSearchStepDiv = document.getElementById(
    "EdgeTPUDelegateSearchStepDiv"
  );

  edgeTPUBasicOptions.style.display = "none";
  edgeTPUAdvancedOptions.style.display = "none";

  edgeTPUDelegateSearchStepDiv.style.display = edgeTPUSearchDelegate.checked
    ? "block"
    : "none";
  edgeTPUBasicOptions.style.display = "block";
  edgeTPUAdvancedOptions.style.display = "block";
}
