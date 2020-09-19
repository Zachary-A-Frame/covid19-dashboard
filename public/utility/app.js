url = "./utility/AugustSeptemberCovid.csv";

d3.csv(url).then(function (data) {
  let validationArray = [];
  for (i = 0; i < data.length; i++) {
    if (!validationArray.includes(data[i].state)) {
      d3.select("#selDataset1")
        .append("option")
        .attr("value", i)
        .text(data[i].state);
      validationArray.push(data[i].state);
    }
  }
});

d3.csv(url).then(function (data) {
  let validationArray = [];
  for (i = 0; i < data.length; i++) {
    if (!validationArray.includes(data[i].state)) {
      d3.select("#selDataset2")
        .append("option")
        .attr("value", i)
        .text(data[i].state);
      validationArray.push(data[i].state);
    }
  }
});

// ===================================================

function init() {
  let xValues = [];
  let yValues = [];

  let secondaryYValues = [];

  d3.csv(url).then(function (data) {
    let validationArray = [];
    for (i = 0; i < data.length; i++) {
      if (
        validationArray.includes(data[i].date) === true ||
        data[i].date > 20200831
      ) {
        continue;
      } else {
        let dateOption = data[i].date;
        let formattedDate =
          dateOption.slice(4, 6) + "/" + dateOption.slice(6, 8);
        xValues.push(formattedDate);
        validationArray.push(dateOption);
        yValues.push(data[i].positive);
        secondaryYValues.push(data[i + 1].positive);
      }
    }

    // console.log(yValues, xValues, secondaryYValues);
    yValues = yValues.reverse();
    xValues = xValues.reverse();
    secondaryYValues = secondaryYValues.reverse();

    let layout = {
      title: "AL vs. AR positive cases",
      barmode: "group",

      margin: {
        l: 100,
        r: 100,
        t: 100,
        b: 100,
      },
    };

    let trace1 = {
      x: xValues,
      y: yValues,
      name: "AL",
      orientation: "v",
      type: "scatter",
      color: "blue",
      marker: {
        opacity: 0.5,
        color: "red",
      },
    };

    let trace2 = {
      x: xValues,
      y: secondaryYValues,
      name: "AR",
      orientation: "v",
      type: "scatter",
      marker: {
        opacity: 0.5,
        color: "green",
      },
    };

    let completeData = [trace1, trace2];

    Plotly.newPlot("line", completeData, layout);
  });
}

let updatePlotly = () => {
  let y = [];
  let secondaryY = [];

  d3.csv(url).then(function (data) {
    // === First State Selection ===
    let dropdownMenu = d3.select("#selDataset1 option:checked");
    let dataset = dropdownMenu.text();
    // === Second State Selection ===
    let dropdownMenu2 = d3.select("#selDataset2 option:checked");
    let dataset2 = dropdownMenu2.text();
    // === Data Selection ===
    let dataSelect = d3.select("#selectData option:checked");
    let dataValue = dataSelect.property("value");

    for (i = 0; i < data.length; i++) {
      if (data[i].state === dataset) {
        y.push(data[i][dataValue]);
      }
    }

    for (i = 0; i < data.length; i++) {
      if (data[i].state === dataset2) {
        secondaryY.push(data[i][dataValue]);
      }
    }

    let update = {
      title: `${dataset} vs ${dataset2} ${dataValue}`,
    };

    Plotly.restyle("line", "y", [y.reverse()]);
    Plotly.restyle("line", "y", [, secondaryY.reverse()]);
    Plotly.restyle("line", "name", [dataset]);
    Plotly.restyle("line", "name", [, dataset2]);
    Plotly.relayout("line", update);
  });
};

d3.selectAll("#selDataset1").on("change", updatePlotly);
d3.selectAll("#selDataset2").on("change", updatePlotly);
d3.selectAll("#selectData").on("change", updatePlotly);

init();
