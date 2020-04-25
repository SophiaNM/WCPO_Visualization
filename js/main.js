
// select divs by id:
var mapDiv = d3.select("#mapDiv");
var barDiv = d3.select("#barDiv");
var sankeyDiv = d3.select("#sankeyDiv");

var speed = 300;

var barTooltip = d3.select("body")
	.append("div")
	.attr("id", "bar-tooltip")
	.attr("class", "tooltip");

var positionInfo = document.getElementById('mapDiv').getBoundingClientRect();
var margin = {top: 45, right: 10, bottom: 20, left: -70};
var width = positionInfo.width;
	width = width - margin.left - margin.right;
var height = positionInfo.height + margin.bottom;

var main = mapDiv.append("svg")
	.attr("viewBox", `0 0 ${width} ${height}`);
    // .attr("width", width)
    // .attr("height", height);
var svg = main.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var mapG = svg.append("g")

// Map and projection
var path = d3.geoPath();
var projection = d3.geoMercator()
	.scale(width/9)
	.translate([width/2, height-height/4 - 30])
	.precision(0.1)
	.center([0, -20 ])
	.scale(110)
	.rotate([-160,0]);;
	  
// Data and color scale
var data = d3.map();
barTooltip = d3.select("#bar-tooltip");

function highlightCountry(d){
	d3.selectAll(".bar_chart")
		.style("stroke-opacity", 0.2)
		.style("fill-opacity", 0.2);
		
	d3.selectAll("#bar_" + d.id)
		.style("stroke-opacity", 1)
		.style("fill-opacity", 1);
	if(d3.select(this).classed('mapBackgroundSelect') === false){
		d3.select(this).attr("class", 'mapBackgroundHighlight');
	}
	if(d3.select(this).classed('mapBorder') === false){
		d3.select(this).classed("mapBorderHigh", true);
	}
	barTooltip.html('<b>' +idToName(d.id) + '</b> <br/>');
	barTooltip.transition()
		.duration(50)
		.style("display", "block")
		.style("opacity", 1);
}

function highlightChoropleth(d) {

	return console.log("YYaya")

}

function onMouseMove(){
	barTooltip.style("top", (d3.event.pageY-25)+"px")
	.style("left", (d3.event.pageX+10)+"px");
}
function clearHighlight(d){
	if(d3.select(this).classed('mapBackground') === false){
		d3.select(this).attr("class", 'mapBackground');
	}
	if(d3.select(this).classed('mapBorder') === false){
		d3.select(this).classed("mapBorderHigh", false);
	}
	d3.selectAll(".bar_chart")
		.style("stroke-opacity", 1)
		.style("fill-opacity", 1);
	
	d3.selectAll("#bar_" + d.id)
		.style("stroke-width", 1)
		.style("fill-opacity", 1);
	barTooltip.transition()
		.duration(1)
		.style("display", "none");
}
function onMapClick(d){
	d3.selectAll(".bar_chart")
		.style("stroke-opacity", 0.2)
		.style("fill-opacity", 0.2);
		
	d3.selectAll("#bar_" + d.id)
		.style("stroke-opacity", 1)
		.style("fill-opacity", 1);
}

function onFlowLegend(d){
	// if (d === "Fleet to Processing") {
	// 	if (d3.selectAll("#process-market") === True)
	// 		d3.selectAll("#arcs")
	// 			.attr("stroke-opacity", 0.1)
	// 			.attr("fill-opacity", 0.1);
	// 		// .attr("stroke", "blue");
	// }
	// else if ( d === "Resource to Processing"){}
	// else {}
	console.log(d)
}


// Load Data
var promises = [
	d3.json("data/worldcountries.json"),
	d3.json("data/flows.json"),
	d3.json("data/stackDataPrepared.json"),
	d3.json("data/sankey_data.json"),
	d3.json("data/worldcountriesChoropleth.json"),
	d3.csv("data/beneficiary.csv")

];
Promise.all(promises).then(ready);

function ready([topo, flows, stack, graph, topoChoropleth, beneficiaryData]) {
	continentFlows = {
		"nodes": [],
		"links": []
	}
	countryFlows = {
		"nodes": [],
		"links": []
	}
	countryArr = [];
	continentArr = [];
	cntryName = [];
	continentName = [];
	flows.forEach(function(d){
		if (d.continent.fromName !== d.continent.toName){
			if (continentName.indexOf(d.continent.fromName) == -1){
				continentArr.push({"name": d.continent.fromName});
				continentName.push(d.continent.fromName);
			}
			if (continentName.indexOf(d.continent.toName) == -1){
				continentArr.push({"name":d.continent.toName});
				continentName.push(d.continent.toName);
			}			
		}
		continentFlows.links.push({"source": d.continent.fromName, "target": d.continent.toName, "value": d.value});		
		if (d.country.fromName !== d.country.toName){
			if (cntryName.indexOf(d.country.fromName) == -1){
				countryArr.push({"name": d.country.fromName});
				cntryName.push(d.country.fromName);
			}
			if (cntryName.indexOf(d.country.toName) == -1){
				countryArr.push({"name":d.country.toName});
				cntryName.push(d.country.toName);
			}
			countryFlows.links.push({"source": d.country.fromName, "target": d.country.toName, "value": d.value});	
		}		
	});
	countryFlows.nodes = countryArr;
	continentFlows.nodes = continentArr;
	snkdata = {
		"continent": continentFlows, "country": countryFlows
	};



	var zoom = d3.zoom()
		.scaleExtent([1, 8])
		.on("zoom", zoomed)
		;

	// zoom.translate([100,100])
	// mapG.call(zoom);

	function zoomed() {
		var transform = d3.event.transform;
		mapG.style("stroke-width", 1.9 / transform.k + "px");
		mapG.attr("transform", transform);
		// svg.selectAll(".exclude-from-zoom").attr("transform", "scale(" + d3.event.scale + ")");
	}

	d3.select('#zoom-in').on('click', function() {
		// Smooth zooming
		zoom.scaleBy(mapG.transition().duration(750), 1.3);
		// d3.selectAll(".exclude-from-zoom").attr("transform", "scale(" + d3.event.scale + ")");
	});

	d3.select('#zoom-out').on('click', function() {
		// Ordinal zooming
		zoom.scaleBy(mapG.transition().duration(750), 1 / 1.3);
		// d3.selectAll(".exclude-from-zoom").attr("transform", "scale(" + d3.event.scale + ")");
	});


	var defs = svg.append("svg:defs");
	var types = ["pm-mp", "fp-pf", "fr"];
	// see http://apike.ca/prog_svg_patterns.html
	defs.selectAll("marker").data(types)
		.join("marker")
		.attr("id", function(d){ return "arrow-" + d;})
		.attr("viewBox", "0 0 10 10")
		.attr("refX", 5)
		.attr("refY", 5)
		.attr("orient", "auto")
		.attr("markerWidth", 5)
		.attr("markerHeight", 3)
		.append("polyline")
		.attr("points", "0,0 10,5 0,10 1,5")
		.attr("fill", function(d){
			if (d == "pm-mp") return "#00bcd4";
			else if(d == "fp-pf") return "#a3a0fb";
			else return "#f00314";
		});

	function renderFlow() {
		// Clear all previous drawn elements
		d3.selectAll(".choroplethBackground").remove()
		d3.selectAll("#choroplethLegend").remove()
		d3.selectAll("#arcs").remove()
		d3.selectAll("#circles").remove()
		d3.selectAll(".mapBackground").remove()
		d3.selectAll("#mapLegend").remove()

		// Draw new elements
		var map = mapG.selectAll("path")
			.data(topojson.feature(topo, topo.objects.countries).features)
			.enter()
			.append("path")
			.attr("id", function(d){return "path_" + d.id})
			.attr("class", "mapBackground")
			// draw each country
			.attr("d", d3.geoPath()
			   .projection(projection)
			)
			.on("click", onMapClick)
			.on("mousemove", onMouseMove)
			.on('mouseover', highlightCountry)
			.on('mouseout', clearHighlight);

		//Add end and Start Node Circles
		var center = mapG.append("g")
			.selectAll("circle")
			.data(flows).enter().append("g")
			.attr("id", "circles");;
		center.append("circle")
			.attr("class", "control")
			.attr("r", 6)
			.attr("fill", "none")
			.attr("stroke", "darkblue")
			.attr("stroke-width", 2)
			.attr("cx", function(d){
				return projection(d.country.origin)[0];
			})
			.attr("cy", function(d){
				return projection(d.country.origin)[1];
			});
		center.append("circle")
			.attr("class", "control")
			.attr("r", 6)
			.attr("fill", "none")
			.attr("stroke", "green")
			.attr("stroke-width", 2)
			.attr("cx", function(d){
				return projection(d.country.destination)[0];
			})
			.attr("cy", function(d){
				return projection(d.country.destination)[1];
			});

		// Add flows
		line = d3.line();
		var arcs = mapG.append("g").attr("id", "arcs");
		arcNodes = arcs.selectAll("path.lines")
			.data(flows).enter()
			.append("path")
			.attr("class", "lines linesMovement")
			.attr("stroke-width", function(d) {
				return 0.06 * d.value;
			})
			/*.attr('marker-end', function(d){
				if((d.country.beneficiary_typefrom == "p" && d.country.beneficiary_typeto == "m") | ((d.country.beneficiary_typefrom == "m" && d.country.beneficiary_typeto == "p"))) return "url(#arrow-pm-mp)";
				else if((d.country.beneficiary_typefrom == "f" && d.country.beneficiary_typeto == "p") | ((d.country.beneficiary_typefrom == "p" && d.country.beneficiary_typeto == "f"))) return "url(#arrow-fp-pf)";
				else return 'url(#arrow-fr)';
			})*/
			.attr('stroke-dasharray', '15, 5, 5, 10')
			.attr("stroke-linecap", "round")
			.attr("stroke-linejoin", "round")
			.attr("id", function(d){
				if((d.country.beneficiary_typefrom == "p" && d.country.beneficiary_typeto == "m") | ((d.country.beneficiary_typefrom == "m" && d.country.beneficiary_typeto == "p"))) return "process-market";
				else if((d.country.beneficiary_typefrom == "f" && d.country.beneficiary_typeto == "p") | ((d.country.beneficiary_typefrom == "p" && d.country.beneficiary_typeto == "f"))) return "fleet-process";
				else return "resource-process";
			})
			.attr("stroke", function(d){
				if((d.country.beneficiary_typefrom == "p" && d.country.beneficiary_typeto == "m") | ((d.country.beneficiary_typefrom == "m" && d.country.beneficiary_typeto == "p"))) return "#00bcd4";
				else if((d.country.beneficiary_typefrom == "f" && d.country.beneficiary_typeto == "p") | ((d.country.beneficiary_typefrom == "p" && d.country.beneficiary_typeto == "f"))) return "#a175fb";
				else return "#f00314";
			})
			.attr('d', function(d) {
				return createArcs(line([projection(d.country.origin), projection(d.country.destination)]));
			});
		arcNodes.append("svg:title").text(function(d) {
			beneficiarytypefrom = d.country.beneficiary_typefrom
			beneficiarytypeto = d.country.beneficiary_typeto

			if ( beneficiarytypefrom == 'p'){beneficiarytypefrom = 'processing'}
			else if ( beneficiarytypefrom == 'm') {beneficiarytypefrom = 'market'}
			else if ( beneficiarytypefrom == 'f') {beneficiarytypefrom = 'fleet'}
			else {beneficiarytypefrom = 'fleet and resource'};

			if ( beneficiarytypeto == 'p'){beneficiarytypeto = 'processing'}
			else if ( beneficiarytypeto == 'm') {beneficiarytypeto = 'market'}
			else if ( beneficiarytypeto == 'f') {beneficiarytypeto = 'fleet'}
			else {beneficiarytypeto = 'fleet and resource'};


			return d.country.fromName+" -> "+d.country.toName+"\n" + d.value +"% share" + "\n" + beneficiarytypefrom + " -> " + beneficiarytypeto;
		});


		// Defining flow map legend
		mapkeys = ["Resource to Processing","Fleet to Processing", "Processing to Market"]
		var colorScale = d3.scaleOrdinal()
			.range(["#00bcd4", "#a175fb", "#f00314"])
			.domain(mapkeys);

		var Leg = svg.append("g").attr("id","mapLegend")
			.attr("class", "exclude-from-zoom");

		var mapFlowlegend = Leg.selectAll(".legend")
			.data(mapkeys.slice())
			.enter().append("g")
			.attr("class", "legend")
			.on("click", onFlowLegend)
			.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

		var mapL = mapFlowlegend.append('g')
			.attr("transform", "translate(1000,260)");

			mapL.append("rect")
				.attr("x", -18)
				.attr("width", 15)
				.attr("height", 15)
				.style("fill", function(d){return colorScale(d)});

			mapL.append("text")
				.attr("x", -24)
				.attr("y", 9)
				.attr("dy", ".35em")
				.style("text-anchor", "end")
				.text(function(d) {return d});

	};






	function renderResource(beneficiaryType) {
		// Defining ColorScale
		d3.selectAll("#arcs").remove()
		d3.selectAll("#circles").remove()
		d3.selectAll(".mapBackground").remove()
		d3.selectAll("#mapLegend").remove()
		d3.selectAll("#choroplethLegend").remove()
		d3.selectAll(".choroplethBackground").remove()

		// Choropleth Data Merge
		var countries = topojson.feature(topo, topo.objects.countries);
		var countryName = beneficiaryData.reduce((accumulator, d) =>{accumulator[d.id] = d;return accumulator;}, {});
		countries.features.forEach(d => {	Object.assign(d.properties, countryName[d.id]);});
		console.log(countryName)

		// Choropleth Color Scheme

		var colorScheme = d3.schemeBlues[6];
			colorScheme.unshift("#ecf0ff")
		var colorScale
		var colorValue
		var catchValue
		var dollarValue

		if (beneficiaryType === "resource"){
			colorValue = d => d.properties.perc_resource;
			catchValue = d => d.properties.resource_catch;
			colorScale = d3.scaleThreshold()
				.domain([0.01, 1, 4, 10, 15, 20])
				.range(colorScheme);
		}
		else if (beneficiaryType === "fleet") {
			colorValue = d => d.properties.perc_fleet;
			catchValue = d => d.properties.fleet_catch;
			colorScale = d3.scaleThreshold()
				.domain([1, 3, 6, 9, 12, 15])
				.range(colorScheme);
		}
		else if (beneficiaryType === "processing") {
			colorValue = d => d.properties.perc_processing;
			catchValue = d => d.properties.processing_weight;
			colorScale = d3.scaleThreshold()
				.domain([1, 3, 6, 8, 10, 12])
				.range(colorScheme);

		}

		//Loading choropleth  map
		var mapChoropleth = mapG.append("g")
		mapChoropleth.attr("class", "choroplethBackground")
			.selectAll("path")
			.data(countries.features)
			.enter()
			.append("path")
			.attr("class", "choroplethHighlight")
			.attr("d", d3.geoPath()
				.projection(projection)	)
			.attr("fill", d => (colorValue(d) === undefined )
				? '#ecf0ff'
				: colorScale(colorValue(d)))
			.attr("stroke", 2)
			.append('title')
			.text(d => (colorValue(d) === undefined )
				? idToName(d.id) + "\nMissing Data"
				: d.properties.country_name +"\n"+"Share Distribution: " + colorValue(d) + "%\n" + "Tuna Weight: " + catchValue(d)+ " mT"   )
			.exit().remove();

		// Choropleth Legend
		var x = d3.scaleSqrt()
			.domain([0.1,32])
			.rangeRound([0,200])

		g = svg.append("g")
			.attr("id","choroplethLegend")
			.attr("class", "key")
			.attr("transform", "translate(820,320)");

		g.selectAll("rect")
			.data(colorScale.range().map(function(d) {
				d = colorScale.invertExtent(d);
				if (d[0] == null) d[0] = x.domain()[0];
				if (d[1] == null) d[1] = x.domain()[1];
				return d;
			}))
			.enter().append("rect")
			.attr("height", 8)
			.attr("x", function(d) { return x(d[0]); })
			.attr("width", function(d) { return x(d[1]) - x(d[0]); })
			.attr("fill", function(d) { return colorScale(d[0]); });

		g.append("text")
			.attr("class", "caption")
			.attr("x", x.range()[0])
			.attr("y", -9)
			.attr("fill", "#000")
			.attr("text-anchor", "start")
			.attr("font-weight", "bold")
			.text("Resource Percentage Distribution");

		g.call(d3.axisBottom(x)
			.tickSize(13)
			.tickValues(colorScale.domain()))
			.select(".domain")
			.remove();


	};

	// Switch map views
	renderFlow()
	d3.select('#overview').on('click', function(){
		renderFlow()
	})
	d3.select('#resource').on('click', function(){
		renderResource("resource")
	})
	d3.select('#fleet').on('click', function(){
		renderResource("fleet")
	})
	d3.select('#process').on('click', function(){
		renderResource("processing")
	})




	//Bar Chart
	
	const div = document.getElementById('barDiv'); /* Reference to the bar chart container */
	var positionInfo = div.getBoundingClientRect();
	var margin = {top: 40, right: 10, bottom: 50, left: 70};
	var width = positionInfo.width - margin.left - margin.right,
	height = positionInfo.height - margin.top - margin.bottom;	
	
	keys = ["Resource Owner","Fleet Owner", "Processing"];
	
	stack = stack.country;
	stack.forEach(function(d) {
		d.total = d3.sum(keys, k => +d[k])
		return d
	});

	barchart = barDiv.append("svg")
		.attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
		// .attr("width", width + margin.left + margin.right)
		// .attr("height", height + margin.top + margin.bottom)
		.attr("class", "barDiv")
		.append("g")
		.attr("class", "barDiv")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	var x = d3.scaleBand().range([0,width]).padding(0.1)

	var y = d3.scaleLinear().rangeRound([height ,0]);
		
	y.domain([0, d3.max(stack, d => d3.sum(keys, k => +d[k]))]).nice();
		
	var xAxis = barchart.append("g")
		.attr("transform", 'translate(0, '+ height + ')')
		.attr("class", "x-axis");
		
	var yAxis = barchart.append("g")
		.attr("transform", 'translate(0,0)')
		.attr("class", "y-axis");

	var z = d3.scaleOrdinal()
		.range(["#00bcd4", "#55d8fe", "#ff8373"])
		.domain(keys);
		
	barchart.selectAll(".y-axis").transition().duration(speed)
		  .call(d3.axisLeft(y).ticks(null, "s"));
		
	x.domain(stack.map(d => d.code	));

	// var xAxistick = x.domain(stack.map(d => d.name	));
	xAxisTickFormat = number => (number).replace(number,x.domain(stack.map(d => d.code)))

	barchart.selectAll(".x-axis")
		.transition().duration(speed)
		.call(d3.axisBottom(x).tickSizeOuter(0))
		.selectAll("text")
		.attr("y", 0)
		.attr("x", 9)
		.attr("dy", ".35em")
		.attr("transform", "rotate(90)")
		.style("text-anchor", "start");
		// .text( d => d.id);

	barchart

		
	barchart.append("text")
			.attr("transform", "translate(0," + height + ")")
			.attr("id", "xaxis_label")
			.attr("x",width/2)
			.attr("y", 45)
			.style("fill", "#404040")
			.style("font-size", "13px")
			.style("font-weight", 400)
			.style("text-anchor", "middle")
			.text("Country ID");

	barchart.append("text")
			.attr("transform", "translate(0,0) rotate(-90)")
			.attr("id", "yaxis_label")
			.attr("x",-height/2)
			.attr("y", -40)
			.style("fill", "#404040")
			.style("font-size", "13px")
			.style("font-weight", 400)
			.style("text-anchor", "middle")
			.text("% Share Distribution");

	var group = barchart.selectAll("g.layer")
			.data(d3.stack().keys(keys)(stack), d => d.key)

	group.exit().remove()

	group.enter().append("g")
		.classed("layer", true)
		.attr("fill", d => z(d.key));

	var bars = barchart.selectAll("g.layer").selectAll("rect")
		.data(d => d, e => e.data.code);

	bars.exit().remove()

	bars.enter().append("rect")
		.attr("id", function(d){
			code = nameToId(d.data.name);
				return "bar_" + code; 
			})
		.attr("class", "bar_chart")
		.on("mouseover", onMouseOverChart)
		.on("mousemove", onMouseMove)
		.on("mouseout", onMouseOutOfChart)
		.attr("width", x.bandwidth())
		.merge(bars)
		.transition().duration(speed)
		.attr("x", d => x(d.data.code))
		.attr("y", d => y(d[1]))
		.attr("height", d => y(d[0]) - y(d[1]));

	var text = barchart.selectAll(".text")
			.data(stack, d => d.code);

	text.exit().remove()

	// text.enter().append("text")
	// 	.attr("class", "text")
	// 	.attr("text-anchor", "middle")
	// 	.merge(text)
	// 	.transition().duration(speed)
	// 	.attr("x", d => x(d.code) + x.bandwidth() / 2)
	// 	.attr("y", d => y(d.total) - 5)
	// 	.text(d => d.total);
	
	var legend = barchart.selectAll(".legend")
		  .data(keys.slice().reverse())
		  .enter().append("g")
		  .attr("class", "legend")
		  .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
	 
		legend.append("rect")
		  .attr("x", width - 18)
		  .attr("width", 18)
		  .attr("height", 18)
		  .style("fill", function(d){return z(d)});
	 
		legend.append("text")
		  .attr("x", width - 24)
		  .attr("y", 9)
		  .attr("dy", ".35em")
		  .style("text-anchor", "end")
		  .text(function(d) {return d});
		  
	function onMouseOverChart(record){
		d3.selectAll('#bar_' + nameToId(record.data.name))
			.style("stroke", "#222")
			.style("stroke-width", 2)
			.style("fill-opacity", 0.9);
		/* display tooltip including some record data */

        barTooltip.html('<div>Country: '+ record.data.name + '</div>' +
			'<div> Resource Dist: ' + record.data['Resource Owner'] + ' %<div />'+
			'<div> Fleet Dist: ' + record.data['Fleet Owner'] + ' %<div />'+
			'<div> Processing Dist: ' + record.data['Processing'] + ' %<div />');
        barTooltip.transition()
			.duration(50)
			.style("display", "block")
			.style("opacity", 0.9);
		if (nameToId(record.data.name) !== -1)
			if (document.getElementById("path_" + nameToId(record.data.name)))
			{
				if(d3.selectAll("#path_" + nameToId(record.data.name)).classed('mapBackgroundSelect') === false){
					d3.selectAll("#path_" + nameToId(record.data.name)).attr("class", 'mapBackgroundHighlight');
				}
				if(d3.selectAll("#path_" + nameToId(record.data.name)).classed('mapBorder') === false){
					d3.selectAll("#path_" + nameToId(record.data.name)).classed("mapBorderHigh", true);
				}
			}
				
	};
	
	function onMouseOutOfChart(record){
		d3.selectAll('#bar_' + nameToId(record.data.name))
			.style("stroke", "#AAA")
			.style("stroke-width", 1)
			.style("fill-opacity", 1);
		/* hide the tooltip */
        barTooltip.transition()
			.duration(1)
			.style("display", "none");
		if (nameToId(record.data.name) !== -1)
			if (document.getElementById("path_" + nameToId(record.data.name)))
			{
				if(d3.selectAll("#path_" + nameToId(record.data.name)).classed('mapBackground') === false){
					d3.selectAll("#path_" + nameToId(record.data.name)).attr("class", 'mapBackground');
				}
				if(d3.selectAll("#path_" + nameToId(record.data.name)).classed('mapBorder') === false){
					d3.selectAll("#path_" + nameToId(record.data.name)).classed("mapBorderHigh", false);
				}
			}
    };	

	var units = "%";
	var positionInfo = document.getElementById('sankeyDiv').getBoundingClientRect();
	var margin = {top: 10, right: 200, bottom: 30, left: 150};
	
	var width = positionInfo.width - margin.left - margin.right;
	var height = positionInfo.height - margin.top - margin.bottom;
	
	// format variables
	var formatNumber = d3.format(",.0f"),    // zero decimal places
		format = function(d) { return formatNumber(d) + " " + units; };

	sankeySvg = sankeyDiv.append("svg")
		.attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
		// .attr("width", width + margin.left + margin.right)
		// .attr("height", height + margin.top + margin.bottom)
		.attr("class", "sankeyDiv")
		.append("g")
		.attr("class", "sankeyDiv")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	// Set the sankey diagram properties
	const sankey = d3.sankey()
		  .nodeId(d => d.name)
		  .nodeWidth(15)
		  .nodePadding(10)
		  .size([width, height]);
		  
	const {nodes, links} = sankey(graph);
	
	const color = d3.scaleOrdinal(d3.schemeCategory10);
	console.log(color(nodes));

	// add in the nodes
	sankeySvg.append("g")
		.attr("stroke", "#000")
		.selectAll("rect")
		.data(nodes)
		.join("rect")
		.attr("x", d => d.x0)
		.attr("y", d => d.y0)
		.attr("height", function(d){
			if (d.y1 - d.y0 < 5){
				return 5;
			}
			return d.y1 - d.y0;
		})
		.attr("width", d => d.x1 - d.x0)
		.attr("fill", function(d){return color(d.name);})
		.append("title")
		.text(d => `${d.name}\n${format(d.value)}`);

	// add in the links
	var link = sankeySvg.append("g")
		.attr("fill", "none")
		.attr("stroke-opacity", 0.2)
		.selectAll("g")
		.data(links)
		.join("g")
        .style("mix-blend-mode", "multiply");
	
	
	edgeColor = "input";
	link.append("path")
      .attr("d", d3.sankeyLinkHorizontal())      
      .attr("stroke-width", d => Math.max(1, d.width))
	  .sort(function(a, b) { return b.dy - a.dy; })
	  .on("mouseover", function(d){
		  d3.select(this).attr("stroke-opacity", 1);
	   })
	  .on("mouseout", function(d){
		  d3.select(this).attr("stroke-opacity", 0.2);
	  });
	 // add the link titles
	 link.append("title")
      .text(d => `${d.source.name} → ${d.target.name}\n${format(d.value)}`);
	  
	  
	// add gradient to links
	  link.style('stroke', (d, i) => {
		// make unique gradient ids  
		const gradientID = `gradient${i}`;

		const startColor = color(d.source.name);
		const stopColor = color(d.target.name);

		const linearGradient = defs.append('linearGradient')
			.attr('id', gradientID);

		linearGradient.selectAll('stop') 
		  .data([                             
			  {offset: '10%', color: startColor },      
			  {offset: '90%', color: stopColor }    
			])                  
		  .enter().append('stop')
		  .attr('offset', d => {
			return d.offset; 
		  })   
		  .attr('stop-color', d => {
			return d.color;
		  });

		return `url(#${gradientID})`;
	  })
	
	sankeySvg.append("g")
		.attr("font-family", "sans-serif")
		.attr("font-size", 10)
		.selectAll("text")
		.data(nodes)
		.join("text")
		.attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
		.attr("y", d => (d.y1 + d.y0) / 2)
		.attr("dy", "0.35em")
		.attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
		.text(d => d.name);
	
}

