import renderCategory from "./category.js";

export default function renderLevel(endTime, title, usage, data) {
  const graph = document.querySelector(".graph");

  const levelContainer = document.createElement("section");
  levelContainer.className = "level-container";

  const levelHeader = document.createElement("header");
  levelHeader.className = "level-header";
  levelHeader.addEventListener("click", () => {
    levelHeader.classList.toggle("fold");
  });

  const levelTitle = document.createElement("div");
  levelTitle.className = "level-title";
  levelTitle.innerText = title;

  const utility = document.createElement("span");
  utility.className = "utility";
  utility.innerText = usage < 1 ? " (" + usage * 100 + "%)" : "";

  levelTitle.append(utility);
  levelHeader.append(levelTitle);
  levelContainer.append(levelHeader);
  graph.append(levelContainer);

  Object.keys(data).map(key => {
    renderCategory(endTime, key, data[key]);
  });
}
