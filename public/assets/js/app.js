// setup svg area
var width = 800;
var height = 600;
var margin = 10;
var labelArea = 110;
var padding = 45;

// Create an SVG wrapper
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "chart");

function drawAxes() {

    // append svg group that will hold our chart - x axis labels
    svg.append("g").attr("class", "xText");
    var xText = d3.select(".xText");

    // transform to adjust for xText
    var bottomTextX = (width - labelArea) / 2 + labelArea;
    var bottomTextY = height - margin - padding;

    xText.attr("transform", `translate(${bottomTextX}, ${bottomTextY})`);

    // build x axis labels
    xText.append("text")
        .attr("y", -20)
        .attr("data-name", "hospitalizedCurrently")
        .attr("data-axis", "x")
        .attr("class", "aText active x")
        .text("Hospitalized Currently");

    xText.append("text")
        .attr("y", 0)
        .attr("data-name", "deaths")
        .attr("data-axis", "x")
        .attr("class", "aText inactive x")
        .text("Deaths");

    // append svg group that will hold our chart - y axis labels
    svg.append("g").attr("class", "yText");
    var yText = d3.select(".yText");

    // transform to adjust for xText
    var leftTextX = margin + padding;
    var leftTextY = (height + labelArea) / 2 - labelArea;

    yText.attr("transform", `translate(${leftTextX}, ${leftTextY})rotate(-90)`);

    // build y axis labels
    yText.append("text")
        .attr("y", -22)
        .attr("data-name", "totalTestResults")
        .attr("data-axis", "y")
        .attr("class", "aText active y")
        .text("Tests");

    yText.append("text")
        .attr("y", 0)
        .attr("data-name", "positive")
        .attr("data-axis", "y")
        .attr("class", "aText inactive y")
        .text("Cases");

}
//  define circle radius - responsive
var cRadius;
function updateRadius() {
    if (width <= 530) {
        circRadius = 8;
    }
    else {
        circRadius = 12;
    }
}
updateRadius();

// read in dates and create list of unique dates for Drop Down
d3.csv("assets/data/data.csv").then((importedData) => {
    var data = importedData

    // get list of unique dates for dropdown
    var options = [...new Set(data.map(item => item.date))];

    // Put unique dates  array into dropdown list
    var select = document.getElementById("selDataset");

    for (var i = 0; i < options.length; i++) {
        var opt = options[i];

        var el = document.createElement("option");
        el.text = (opt.slice(4, 6) + "/" + opt.slice(6, 8));
        el.value = opt;

        // select.add(el);
        select.appendChild(el);
    };
});

// Function called by DOM changes to filter data by date
function optionChanged(subject) {

    // clear svg
    d3.selectAll("svg > *").remove();

    // read in data
    d3.csv("assets/data/data.csv").then(function (data) {

        // filter data by selected date
        var sampleData = data.filter(record => record.date == subject);

        // update axis
        drawAxes()

        // visualize filtered data
        visualize(sampleData)
    });
}
// Initializing graph
optionChanged(20200911)

function visualize(csvData) {

    var xMin;
    var xMax;
    var yMin;
    var yMax;

    // console.log(csvData)

    // default selections
    var currentX = "hospitalizedCurrently";
    var currentY = "totalTestResults";

    // tool tip box      state, x axis data and y axis data

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([40, -60])
        .html(function (d) {

            //put together textbox and format numbers - poverty is %
            var stateLine = `<div>${d.state}</div>`;

            var yLine = `<div>${currentY}: ${d[currentY]}</div>`;

            var xLine = `<div>${currentX}: ${d[currentX]}</div>`;

            return stateLine + xLine + yLine
        });

    // add tooltip to svg
    svg.call(toolTip);

    // click x and y labels and up

    function updateLabel(axis, clickText) {
        // switch active to inactive
        d3.selectAll(".aText")
            .filter("." + axis)
            .filter(".active")
            .classed("active", false)
            .classed("inactive", true);

        // switch inactive to active
        clickText.classed("inactive", false).classed("active", true);
    }

    // determine the data max & min values for scaling

    function xMinMax() {
        xMin = d3.min(csvData, function (d) {
            return parseFloat(d[currentX]) * 0.85;
        });
        xMax = d3.max(csvData, function (d) {
            return parseFloat(d[currentX]) * 1.15;
        });
    }

    function yMinMax() {
        yMin = d3.min(csvData, function (d) {
            return parseFloat(d[currentY]) * 0.85;
        });
        yMax = d3.max(csvData, function (d) {
            return parseFloat(d[currentY]) * 1.15;
        });
    }

    xMinMax();
    yMinMax();

    // adjust scales

    var xScale = d3
        .scaleLinear()
        .domain([xMin, xMax])
        .range([margin + labelArea, width - margin])

    var yScale = d3
        .scaleLinear()
        .domain([yMin, yMax])
        .range([height - margin - labelArea, margin])


    // add the scaled axis

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    // determine tickmarks

    function tickCount() {
        if (width <= 530) {
            xAxis.ticks(5);
            yAxis.ticks(5);
        }
        else {
            xAxis.ticks(10);
            yAxis.ticks(10);
        }
    }
    tickCount();

    // append axis to the svg
    svg.append("g").call(xAxis)
        .attr("class", "xAxis")
        .attr("transform", `translate(
                0,
                ${height - margin - labelArea})`
        );

    svg.append("g").call(yAxis)
        .attr("class", "yAxis")
        .attr("transform", `translate(
                ${margin + labelArea},
                0 )`
        );

    // append the circles for each state
    var allCircles = svg.selectAll("g allCircles").data(csvData).enter();

    allCircles.append("circle")
        .attr("cx", function (d) {
            // xScale figures the pixels
            return xScale(d[currentX]);
        })
        .attr("cy", function (d) {
            return yScale(d[currentY]);
        })
        .attr("r", circRadius)
        .attr("class", function (d) {
            return "stateCircle " + d.state;
        })
        .on("mouseover", function (d) {
            // show tooltip when mouse is hover on circle
            toolTip.show(d, this);
        })
        .on("mouseout", function (d) {
            // remove the tooltip when leave
            toolTip.hide(d);
        });

      // add state abbrev to circles
    allCircles
        .append("text")
        .attr("font-size", circRadius)
        .attr("class", "stateText")
        .attr("dx", function (d) {
            return xScale(d[currentX]);
        })
        .attr("dy", function (d) {
            // move text to center of the circle
            return yScale(d[currentY]) + circRadius / 3;

        })
        .text(function (d) {
            return d.state;
        })

        .on("mouseover", function (d) {
            toolTip.show(d);
            d3.select("." + d.state).style("stroke", "#323232");
        })

        .on("mouseout", function (d) {
            toolTip.hide(d);
            d3.select("." + d.state).style("stroke", "#e3e3e3");
        });

    // update graph on click
    d3.selectAll(".aText").on("click", function () {
        var self = d3.select(this)

        // select inactive
        if (self.classed("inactive")) {
            // get name and axis saved
            var axis = self.attr("data-axis")
            var name = self.attr("data-name")

            if (axis === "x") {
                currentX = name;

                // update min and max of domain for x
                xMinMax();
                xScale.domain([xMin, xMax]);

                svg.select(".xAxis")
                    .transition().duration(800)
                    .call(xAxis);

                // update location of the circles
                d3.selectAll("circle").each(function () {
                    d3.select(this)
                        .transition().duration(800)
                        .attr("cx", function (d) {
                            return xScale(d[currentX])
                        });
                });

                d3.selectAll(".stateText").each(function () {
                    d3.select(this)
                        .transition().duration(800)
                        .attr("dx", function (d) {
                            return xScale(d[currentX])
                        });
                });
                // update
                updateLabel(axis, self);
            }

            // update for Y axis
            else {
                currentY = name;

                // update min and max of range for y
                yMinMax();
                yScale.domain([yMin, yMax]);

                svg.select(".yAxis")
                    .transition().duration(800)
                    .call(yAxis);

                //  update location of the circles
                d3.selectAll("circle").each(function () {
                    d3.select(this)
                        .transition().duration(800)
                        .attr("cy", function (d) {
                            return yScale(d[currentY])
                        });
                });

                d3.selectAll(".stateText").each(function () {
                    d3.select(this)
                        .transition().duration(800)
                        .attr("dy", function (d) {
                            return yScale(d[currentY]) + circRadius / 3;
                        });
                });

                // update for the X axis
                updateLabel(axis, self);
            }
        }
    });
}
