import renderBar from './bar.js';

export default function renderCategory(endTime, title, data){
  const levelContainerList = document.querySelectorAll('.level-container');
  const levelContainer = levelContainerList[levelContainerList.length - 1];

  const categoryContainer = document.createElement('section');
  categoryContainer.className = "category-container";

  const categoryHeader = document.createElement('header');
  categoryHeader.className = "category-header";

  const categoryTitle = document.createElement('div');
  categoryTitle.className = "category-title";
  categoryTitle.innerText = title;

  const barList = document.createElement('section');
  barList.className = "bar-list";

  categoryHeader.append(categoryTitle);
  categoryContainer.append(categoryHeader, barList);
  levelContainer.append(categoryContainer);

  data.forEach(element => {
    renderBar(endTime, element);
  });
}
