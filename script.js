// Fetch the data
const dataUrl = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

let globalDataset; // Store dataset globally for resize events

fetch(dataUrl)
    .then((response) => response.json())
    .then((data) => {
        globalDataset = data;
        createChart(data);
        
        // Add resize event listener
        window.addEventListener('resize', () => {
            createChart(globalDataset);
        });
    })
    .catch((error) => {
        console.error("Error fetching the data:", error);
    });

function createChart(dataset) {
    // Clear previous chart
    d3.select(".chart-container").selectAll("*").remove();

    // Get container dimensions
    const container = d3.select(".chart-container");
    const containerWidth = container.node().getBoundingClientRect().width;
    const containerHeight = container.node().getBoundingClientRect().height;

    // Responsive sizing
    const w = Math.min(containerWidth * 0.95, 1200);
    const h = Math.min(containerHeight * 0.75, 600);
    const padding = 60;

    // Add a title to the chart
    container.append("h1")
        .attr("id", "title")
        .text("Doping in Professional Bicycle Racing");

    // Create the SVG container
    const svg = container.append("svg")
        .attr("width", w)
        .attr("height", h)
        .attr("viewBox", `0 0 ${w} ${h}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    // Define scales for x and y axes
    const xScale = d3.scaleLinear()
        .domain([d3.min(dataset, (d) => d.Year) - 1, d3.max(dataset, (d) => d.Year) + 1])
        .range([padding, w - padding]);

    const yScale = d3.scaleTime()
        .domain([
            d3.min(dataset, (d) => new Date(1970, 0, 1, 0, d.Seconds / 60, d.Seconds % 60)),
            d3.max(dataset, (d) => new Date(1970, 0, 1, 0, d.Seconds / 60, d.Seconds % 60))
        ])
        .range([h - padding, padding]);

    // Create x-axis
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", `translate(0, ${h - padding})`)
        .call(xAxis);

    // X-axis label
    svg.append("text")
        .attr("x", w / 2)
        .attr("y", h - 20)
        .attr("text-anchor", "middle")
        .text("Year");

    // Create y-axis
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S"));
    svg.append("g")
        .attr("id", "y-axis")
        .attr("transform", `translate(${padding}, 0)`)
        .call(yAxis);

    // Y-axis label
    svg.append("text")
        .attr("x", -h / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Time of Rider");

    // Tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("id", "tooltip")
        .style("visibility", "hidden")
        .style("position", "absolute")
        .style("background-color", "rgba(0,0,0,0.7)")
        .style("color", "white")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("pointer-events", "none");

    // Append dots for data points
    svg.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("cx", (d) => xScale(d.Year))
        .attr("cy", (d) => yScale(new Date(1970, 0, 1, 0, d.Seconds / 60, d.Seconds % 60)))
        .attr("r", 5)
        .attr("class", (d) => (d["Doping"] === "" ? "dot nodoping" : "dot doping"))
        .attr("data-xvalue", (d) => d.Year)
        .attr("data-yvalue", (d) => new Date(1970, 0, 1, 0, d.Seconds / 60, d.Seconds % 60))
        .on("mouseover", function(event, d) {
            // Highlight current dot
            d3.select(this)
                .transition()
                .duration(200)
                .attr("r", 8);

            // Show tooltip
            tooltip
                .style("visibility", "visible")
                .html(`
                    <strong>${d.Name}</strong>, ${d.Nationality}<br>
                    Year: ${d.Year}, Time: ${d.Time}<br>
                    ${d.Doping ? `Doping Allegations: ${d.Doping}` : 'No doping allegations'}
                `)
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY + 10}px`)
                .attr("data-year", d.Year);
        })
        .on("mouseout", function() {
            // Restore dot size
            d3.select(this)
                .transition()
                .duration(200)
                .attr("r", 5);

            // Hide tooltip
            tooltip.style("visibility", "hidden");
        });

    // Add a legend
    const legend = svg.append("g")
        .attr("id", "legend")
        .attr("transform", `translate(${w - 250}, ${padding})`);

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "#3b82f6");  // Blue for no doping

    legend.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text("No doping allegations")
        .attr("fill", "white");

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 20)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "#ef4444");  // Red for doping

    legend.append("text")
        .attr("x", 20)
        .attr("y", 32)
        .text("Riders with doping allegations")
        .attr("fill", "white");
}

