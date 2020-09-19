// Store our API endpoint inside queryUrl

var myMap = L.map("map").setView([37.8, -96], 5);
var legend;
var latestDate;

var stateMap = L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=" +
    API_KEY,
  {
    id: "mapbox/light-v9",
    attribution: "mapbox",
    tileSize: 512,
    zoomOffset: -1,
  }
).addTo(myMap);

// Create a base layer that holds all three maps.
let baseMaps = {
  Streets: stateMap,
};

// Create the layers for our two different sets of data, earthquakes and tectonicplates.
let positiveCasesLayer = new L.LayerGroup();
let hospitizationsLayer = new L.LayerGroup();
let totalTestsLayer = new L.LayerGroup();
let deathsLayer = new L.LayerGroup();

// let tectonicplates = new L.LayerGroup();

// We define an object contains all of our overlays.
// This overlay will be visible all the time.
let overlayMaps = {
  "Total Tests": totalTestsLayer,
  "Positive Cases": positiveCasesLayer,
  Hospitalizations: hospitizationsLayer,
  "Total Deaths": deathsLayer,
};

styleLayerSelection = [
  "Total Tests",
  "Positive Cases",
  "Hospitalizations",
  "Total Deaths",
];

// Then we add a control to the map that will allow the user to change which
// layers are visible.
// L.control.layers(baseMaps, overlayMaps).addTo(myMap);

// console.log("statesData.features", statesData.features);

function formatNumber(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

var geojson;

function thousandsSeparators(num) {
  var num_parts = num.toString().split(".");
  num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return num_parts.join(".");
}

function selectionList(d) {
  //d is stylelayerSelection
  formatDate =
    latestDate.slice(6) +
    "-" +
    latestDate.slice(4, 6) +
    "-" +
    latestDate.slice(0, 4);
  // console.log("sliced date",latestDate.slice(0,4))
  // console.log("sliced date",latestDate.slice(4,6))
  // console.log("sliced date",latestDate.slice(6))
  if (d == 0) {
    var selectionDisplay =
      '<select id ="mySelection' +
      '"><option value = "0' +
      '"selected>' +
      styleLayerSelection[0] +
      '</option><option value = "1">' +
      styleLayerSelection[1] +
      '</option><option value = "2">' +
      styleLayerSelection[2] +
      '</option><option value = "3">' +
      styleLayerSelection[3] +
      "</option></select><h4>Date:" +
      formatDate +
      "</h4>";
  } else if (d == 1) {
    var selectionDisplay =
      '<select id ="mySelection' +
      '"><option value = "0">' +
      styleLayerSelection[0] +
      '</option><option value = "1' +
      '"selected>' +
      styleLayerSelection[1] +
      '</option><option value = "2">' +
      styleLayerSelection[2] +
      '</option><option value = "3">' +
      styleLayerSelection[3] +
      "</option></select><h4>Date:" +
      formatDate +
      "</h4>";
  } else if (d == 2) {
    var selectionDisplay =
      '<select id ="mySelection' +
      '"><option value = "0">' +
      styleLayerSelection[0] +
      '</option><option value = "1">' +
      styleLayerSelection[1] +
      '</option><option value = "2' +
      '"selected>' +
      styleLayerSelection[2] +
      '</option><option value = "3">' +
      styleLayerSelection[3] +
      "</option></select><h4>Date:" +
      formatDate +
      "</h4>";
  } else {
    var selectionDisplay =
      '<select id ="mySelection' +
      '"><option value = "0">' +
      styleLayerSelection[0] +
      '</option><option value = "1">' +
      styleLayerSelection[1] +
      '</option><option value = "2">' +
      styleLayerSelection[2] +
      '</option><option value = "3' +
      '"selected>' +
      styleLayerSelection[3] +
      "</option></select><h4>Date:" +
      formatDate +
      "</h4>";
  }
  return selectionDisplay;
}

// console.log("Thousands test", thousandsSeparators(857392847));
// console.log(thousandsSeparators(10000.23));
// console.log(thousandsSeparators(100000));

function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 5,
    //color: '#666',
    dashArray: "",
    fillOpacity: 0.7,
  });
  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
}

function resetHighlight(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 2,
    opacity: 1,
    color: "white",
    dashArray: "3",
    fillOpacity: 0.7,
  });
}

// function zoomToFeature(e) {
//   map.fitBounds(e.target.getBounds());
// }

var oneDataset = [];

//
console.log("states data++++++++++++++++", statesData);
// })

function onEachFeature(feature, layer) {
  // console.log("feature", feature.properties)
  // console.log("layer", layer)
  // console.log("fill color", layer.options.fillColor)
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    //click: zoomToFeature
  });
  //console.log("number with comma",(feature.properties.positive).toLocaleString('en') )
  // console.log("feature2", feature.properties.name)
  // console.log("feature3", thousandsSeparators(637738822))
  //var numb = thousandsSeparators(feature.properties.positive)
  //console.log("numb", numb)
  //var layer1 = `<h3>State: ${numb} </h3>`
  //console.log("layer1", layer1)
  //inserting layer1 does not work.  Insersting numb does not work.  Bizarre.
  layer.bindPopup(
    "<h3>State: " +
      feature.properties.name +
      "</h3><h4>Total Tests: " +
      parseFloat(feature.properties.totalTestResults).toLocaleString("en") +
      "</h4><h4>Total Positive: " +
      parseFloat(feature.properties.positive).toLocaleString("en") +
      "</h4><h4>Hospitalized Currently: " +
      parseFloat(feature.properties.hospitalizedCurrently).toLocaleString(
        "en"
      ) +
      "</h4><h4>Total deaths: " +
      parseFloat(feature.properties.deaths).toLocaleString("en") +
      "</h4>"
  );
}

d3.csv("./static/data/AugustSeptemberCovid.csv")
  .then(function (data) {
    latestDate = data[0].date;
    // console.log("latest date", latestDate)
    return data.filter(function (d) {
      return d.date == latestDate;
    });
  })
  .then(function (oneDataset) {
    console.log("oneDataset...........", oneDataset);
    statesData.features.forEach(function (stateData) {
      oneDataset.forEach(function (oneData) {
        // console.log("ddddd", stateData)
        // console.log("oneDataset", oneData)
        // console.log("properaties name", stateData.properties.name)
        // console.log("oneDataset statename", oneData.statename)
        if (stateData.properties.name == oneData.statename) {
          // console.log("stateData.properties", stateData.properties)
          // console.log("oneData", oneData)
          //stateData.properties.density = 67898
          stateData.properties.hospitalizedCurrently = +oneData.hospitalizedCurrently;
          stateData.properties.positive = +oneData.positive;
          stateData.properties.totalTestResults = +oneData.totalTestResults;
          stateData.properties.deaths = +oneData.deaths;
          //console.log("stateData.properties------------------", stateData.properties)
        }
        //console.log("stateData.properties88888888888888888", stateData.properties)
      });
    });
    console.log("staes data final", statesData);

    L.geoJson(statesData).addTo(myMap);
    console.log("statesData+_+_+_+_+_+", statesData);

    var colorsList = [
      "#800026",
      "#bd0026",
      "#FCAA67",
      "#ffffc7",
      "#548687",
      "#2660a4",
      "#b9dfdc",
      "#bbacc1",
      "#545643",
      "#68c2f3",
    ];
    //
    var colorValues = [];

    var colorLabels = [];

    //lets scale the color values for the property selected

    var positiveMap = statesData.features.map(function (d) {
      return d.properties.positive;
    });

    var hospitalizedCurrentlyMap = statesData.features.map(function (d) {
      return d.properties.hospitalizedCurrently;
    });

    var deathsMap = statesData.features.map(function (d) {
      return d.properties.deaths;
    });

    var totalTestResultsMap = statesData.features.map(function (d) {
      return d.properties.totalTestResults;
    });

    drawMap(0);

    //testStyle.on("submit", console.log("wassup"));
    function drawMap(styleLayerSelection) {
      //var styleLayerSelection = 0
      var selectionListText = selectionList(styleLayerSelection);

      var mapSelection = [
        totalTestResultsMap,
        positiveMap,
        hospitalizedCurrentlyMap,
        deathsMap,
      ];

      // console.log("styleLayerSelectionMap", mapSelection[styleLayerSelection])

      var graphSetting = [
        "totalTestResults",
        "positive",
        "hospitalizedCurrently",
        "deaths",
      ];

      var legendLabel = [
        "Total Number of Test Results",
        "Positive Cases",
        "Number Currently Hospitalized",
        "Cumulative Deaths",
      ];

      //function setScaleColor()
      colorValues[0] =
        Math.max.apply(Math, mapSelection[styleLayerSelection]) * 0.82;
      colorValues[colorsList.length - 1] =
        Math.min.apply(Math, mapSelection[styleLayerSelection]) * 1.1;
      console.log(
        "maximum value",
        Math.max.apply(Math, mapSelection[styleLayerSelection])
      );
      console.log(
        "minimum value",
        Math.min.apply(Math, mapSelection[styleLayerSelection])
      );
      console.log("first color", colorValues[0]);
      var colorValueRangeInterval =
        (colorValues[0] - colorValues[colorsList.length - 1]) /
        colorsList.length;

      console.log("colorvaluerange interval", colorValueRangeInterval);
      for (var i = 1; i < colorsList.length; i++) {
        //console.log("Math.exp((i-1)/2)", i, Math.exp((i - 1) / 3))
        colorValues[i] = colorValues[0] / Math.exp(i / 3);
      }

      console.log("colorValues==", colorValues);

      colorValues.forEach(function (d, i) {
        if (i == 0) {
          colorLabels[i] =
            thousandsSeparators(Math.floor(colorValues[i])) + " > ";
        } else if (i == colorValues.length - 1) {
          //I am not sure I understand why this colorValues needs a -1.  It works!!
          colorLabels[i] =
            thousandsSeparators(Math.floor(colorValues[i - 1])) + " < ";
        } else {
          // console.log("else statement", i);
          colorLabels[i] =
            thousandsSeparators(Math.floor(colorValues[i])) +
            " - " +
            thousandsSeparators(Math.floor(colorValues[i - 1]));
        }
      });

      colorLabels.push(
        thousandsSeparators(Math.floor(colorValues[colorValues.length - 1])) +
          " < "
      );

      legend = L.control({ position: "bottomright" });
      legend.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend");

        //    var colors = earthquakes.options.colors;
        var labels = [];

        // Add min & max
        var legendInfo = `<h1>COVID-19<br>${legendLabel[styleLayerSelection]}</h1>`;

        div.innerHTML = legendInfo;
        //console.log("color values _$_%_^_", colorValues)
        colorsList.forEach(function (d, index) {
          //     labels.push("<p><li style=\"background-color: " + colors[index] + "\"></li>" + quakeLabels[index] +"</p>");

          labels.push(
            '<li style="background-color:' +
              d +
              '"></li><span>' +
              colorLabels[index] +
              "</span>"
          );
        });

        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;
      };
      legend.addTo(myMap);

      var legend2 = L.control({ position: "topright" });
      legend2.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend2");

        // Add min & max
        // var legendInfo = `<h1>${legendLabel[styleLayerSelection]}</h1>`;

        // div.innerHTML = legendInfo;
        div.innerHTML = selectionListText;

        //div.innerHTML = "<select><option>0</option><option>1</option><option>2</option><option>3</option></select>";
        div.firstChild.onmousedown = div.firstChild.ondblclick =
          L.DomEvent.stopPropagation;
        return div;
      };
      legend2.addTo(myMap);

      //this is jQuery.  don't even know what the heck it is but it works.

      $("select").change(function () {
        var x = document.getElementById("mySelection").value;
        //styleLayerSelection = 2
        var newVar = 5;
        //console.log("stylelayerSelection", stylelayerSelection)
        myMap.removeControl(legend);
        myMap.removeControl(legend2);
        //alert(x)

        drawMap(x);
      });

      geojson = L.geoJson(statesData, {
        style: style,
        onEachFeature: onEachFeature,
        //onEachFeatured: onEachFeatured
      }).addTo(myMap);
      //console.log("covidData...........", covidData)

      function getColor(d) {
        // console.log("get color", d);
        return d > colorValues[0]
          ? colorsList[0]
          : d > colorValues[1]
          ? colorsList[1]
          : d > colorValues[2]
          ? colorsList[2]
          : d > colorValues[3]
          ? colorsList[3]
          : d > colorValues[4]
          ? colorsList[4]
          : d > colorValues[5]
          ? colorsList[5]
          : d > colorValues[6]
          ? colorsList[6]
          : d > colorValues[7]
          ? colorsList[7]
          : d > colorValues[8]
          ? colorsList[8]
          : colorsList[9];
      }

      var graphSetting = ["positive"];
      var variableG = graphSetting[0];
      // console.log("graphsettings", graphSetting[0]);
      // console.log("variableG", graphSetting[0]);
      // console.log("feature.properties.positive", feature.properties)
      // console.log("feature.properties.graphsetting[0]", feature.properties.graphSetting[0])
      // console.log(eval(graphSetting[0]))
      function style(feature) {
        var colorStyle = feature.properties[graphSetting[styleLayerSelection]];
        return {
          fillColor: getColor(colorStyle),
          weight: 2,
          opacity: 1,
          color: "white",
          dashArray: "3",
          fillOpacity: 0.7,
        };
      }
    }
    // console.log("geojson", geojson)
    // L.control.layers(baseMaps, overlayMaps, {
    //   collapsed: false
    // }).addTo(myMap);
  })
  // .catch(console.log.bind(console));
