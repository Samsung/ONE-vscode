const timeUnit = {
  ms: 10 ** -3,
  us: 1,
  ns: 10 ** 3,
};

export function renderSingleDetail(data) {
  const detailSection = document.querySelector(".detail-container section");
  const ul = document.createElement("ul");
  ul.className = "detail";

  Object.keys(data).map((key) => {
    // invisible backgroundColor and pk
    if (key === "backgroundColor" || key === "pk") {
      return;
    }
    const li = document.createElement("li");

    if (key === "args") {
      // show args in list
      li.innerText = "args";
      li.className = "args";
      li.addEventListener("click", () => {
        li.classList.toggle("fold");
      });
      li.append(renderArgs(data[key]));
    } else if (key === "ts" || key === "dur") {
      // show time with displayTimeUnit
      const setData = document.querySelector(".set-data");
      const displayTimeUnit = setData.dataset["displayTimeUnit"];
      li.innerText = `${key} : ${
        parseInt(data[key] * timeUnit[displayTimeUnit] * 1000) / 1000
      } ${displayTimeUnit}`;
    } else {
      // show others
      li.innerText = `${key} : ${data[key]}`;
    }

    // append DOM
    ul.append(li);
    detailSection.append(ul);
  });
}

function renderArgs(args) {
  const ul = document.createElement("ul");
  args.split(".#/#.").forEach((element) => {
    const li = document.createElement("li");
    li.innerText = element;
    ul.append(li);
  });
  return ul;
}

export function renderMultipleDetail() {
  makeTable();
  refinedSelectedOp();
}

function makeTable() {
  const detailSection = document.querySelector(".detail-container section");
  const table = document.createElement("table");
  table.className = "detail";

  const thead = document.createElement("thead");
  const tr = document.createElement("tr");

  const thName = document.createElement("th");
  thName.innerText = "name";

  const thWall = document.createElement("th");
  thWall.innerText = "Wall Duration";

  const thAverage = document.createElement("th");
  thAverage.innerText = "Average Wall Duration";

  const thOccurrences = document.createElement("th");
  thOccurrences.innerText = "Occurrences";

  tr.append(thName, thWall, thAverage, thOccurrences);
  thead.append(tr);
  table.append(thead);
  detailSection.append(table);
}

function refinedSelectedOp() {
  const selectedOpList = document.querySelectorAll(".selected-op");
  const refinedOP = [];
  const refinedOPDict = {};
  let idx = 0;

  selectedOpList.forEach((element) => {
    const name = element.dataset.name;
    const ts = element.dataset.ts * 1;
    const dur = element.dataset.dur * 1;

    const info = {
      name,
      ts,
      dur,
      occurrences: 1,
    };

    if (name in refinedOPDict) {
      const idx = refinedOPDict[name];
      refinedOP[idx].dur += info.dur;
      refinedOP[idx].occurrences += 1;
    } else {
      refinedOP.push(info);
      refinedOPDict[name] = idx;
      idx += 1;
    }
  });

  renderTds(refinedOP);
}

function renderTds(value) {
  const totals = {
    name: "totals",
    dur: 0,
    occurrences: 0,
  };

  value.forEach((op) => {
    totals.dur += op.dur;
    totals.occurrences += op.occurrences;
  });

  value.push(totals);

  const setData = document.querySelector(".set-data");
  const displayTimeUnit = setData.dataset["displayTimeUnit"];
  const detail = document.querySelector(".detail");

  value.forEach((ele) => {
    const tr = document.createElement("tr");

    if (ele["name"] === "totals") {
      tr.className = "totals";
    }

    const name = document.createElement("td");
    name.innerText = ele["name"];

    const dur = document.createElement("td");
    dur.innerText = `${
      Math.round(ele["dur"] * timeUnit[displayTimeUnit] * 1000) / 1000
    } ${displayTimeUnit}`;

    const durAvg = document.createElement("td");
    durAvg.innerText = `${
      Math.round(ele["dur"] * timeUnit[displayTimeUnit] * 1000) /
      1000 /
      ele["occurrences"]
    } ${displayTimeUnit}`;

    const occurrences = document.createElement("td");
    occurrences.innerText = ele["occurrences"];

    tr.append(name, dur, durAvg, occurrences);
    detail.append(tr);
  });
}
