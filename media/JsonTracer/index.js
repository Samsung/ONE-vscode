import openFileSelector from "./processData.js";
import dynamicGraduation from "./dynamicGraduation.js";

const graph = document.querySelector(".graph");

const loadBtn = document.querySelector(".load-btn");
loadBtn.addEventListener("click", () => {
  initData();
  openFileSelector();
});

let ratio = 100;
const slider = document.querySelector("input");
slider.addEventListener("input", event => {
  ratio = event.target.value;
  graph.style.width = `${ratio}%`;
  changeSlider(event.target.value, event.target.max, event.target.min);
  dynamicGraduation();
});

const zoomInBtn = document.querySelector(".zoom-in-btn");
zoomInBtn.addEventListener("click", () => {
  // change ratio
  ratio += 50;
  ratio = ratio > 5000 ? 5000 : ratio;
  graph.style.width = `${ratio}%`;

  // change slider
  const slider = document.querySelector("input");
  slider.value = ratio;
  changeSlider(slider.value, slider.max, slider.min);

  // change graduation and set delay
  dynamicGraduation();
  zoomInBtn.disabled = true;
  setTimeout(() => (zoomInBtn.disabled = false), 300);
});

const zoomOutBtn = document.querySelector(".zoom-out-btn");
zoomOutBtn.addEventListener("click", () => {
  // change ratio
  ratio -= 50;
  ratio = ratio < 100 ? 100 : ratio;
  graph.style.width = `${ratio}%`;

  // change slider
  const slider = document.querySelector("input");
  slider.value = ratio;
  changeSlider(slider.value, slider.max, slider.min);

  // change graduation and set delay
  dynamicGraduation();
  zoomOutBtn.disabled = true;
  setTimeout(() => (zoomOutBtn.disabled = false), 300);
});

const captureBtn = document.querySelector(".capture-btn");
captureBtn.addEventListener("click", () => {
  // TODO capture inside vscode extension webview
});

function changeSlider(inputValue, inputMax, inputMin) {
  if (inputMax === inputValue) {
    if (inputMax === "200") {
      slider.max = "400";
      slider.value = "200";
      slider.min = "100";
    } else if (inputMax === "400") {
      slider.max = "800";
      slider.value = "400";
      slider.min = "200";
    } else if (inputMax === "800") {
      slider.max = "1600";
      slider.value = "800";
      slider.min = "400";
    } else if (inputMax === "1600") {
      slider.max = "3200";
      slider.value = "1600";
      slider.min = "800";
    } else if (inputMax === "3200") {
      slider.max = "5000";
      slider.value = "3200";
      slider.min = "1600";
    }
  } else if (inputMin === inputValue) {
    if (inputMin === "100") {
      slider.max = "200";
      slider.value = "100";
      slider.min = "100";
    } else if (inputMin === "200") {
      slider.max = "400";
      slider.value = "200";
      slider.min = "100";
    } else if (inputMin === "400") {
      slider.max = "800";
      slider.value = "400";
      slider.min = "200";
    } else if (inputMin === "800") {
      slider.max = "1600";
      slider.value = "800";
      slider.min = "400";
    } else if (inputMin === "1600") {
      slider.max = "3200";
      slider.value = "1600";
      slider.min = "800";
    }
  } else {
    return;
  }

  // set delay
  slider.disabled = true;
  setTimeout((slider.disabled = false), 100);
}

function initData() {
  const graph = document.querySelector(".graph");
  // init ratio
  ratio = 100;
  graph.style.width = `${ratio}%`;

  // init slider
  const silder = document.querySelector("input");
  silder.max = "200";
  silder.min = "100";
  silder.value = "100";

  // init graph
  while (graph.hasChildNodes()) {
    graph.removeChild(graph.firstChild);
  }

  // init selected bar
  const selected = document.querySelector(".selected");
  while (selected.hasChildNodes()) {
    selected.removeChild(selected.firstChild);
  }

  // init detail
  const detail = document.querySelector(".detail");
  if (detail) {
    detail.remove();
  }
}
