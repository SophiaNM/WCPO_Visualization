/*

Last Modified on 2020-05-31
@author: Njeri Murage

main.js file:
- read data using d3
- create flow map, barchart and sankey diagram using d3 and svg

*/
/////////// Define variables and functions /////////////////

// select divs by id:
var mapDiv = d3.select("#mapDiv");
var barDiv = d3.select("#barDiv");
var sankeyDiv = d3.select("#sankeyDiv");
var sideLegend = d3.select("#SidebarLegend");
var searchCountry = d3.select("#searchCountry");


var speed = 300;
var barTooltip = d3.select("body")
	.append("div")
	.attr("id", "bar-tooltip")
	.attr("class", "tooltip");

// Client position
var positionInfo = document.getElementById('mapDiv').getBoundingClientRect();
var margin = {top: -5, right: 20, bottom: 0, left: -20};
var width = positionInfo.width;
	width = width - margin.left - margin.right;
var height = positionInfo.height + margin.bottom;

var main = mapDiv.append("svg")	.attr("viewBox", `0 0 ${width} ${height}`);
var svg = main.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var mapG = svg.append("g").attr("id","flowMapContainer")

// Map and projection
var projection = d3.geoMercator()
	.scale(width/9)
	.translate([width/2, height-height/4 - 30])
	.precision(0.1)
	.center([-8, -20 ])
	.scale(125)
	.rotate([-160,0]);

var path = d3.geoPath().projection(projection);

// Data and color scale
var data = d3.map();
barTooltip = d3.select("#bar-tooltip");

// Interactive functions
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
};


function onMouseMove(){
	barTooltip.style("top", (d3.event.pageY-25)+"px")
	.style("left", (d3.event.pageX+10)+"px");
};


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
};


function highlightSankeyFlows(d) {

	d3.select(this).attr("stroke-opacity", 1);
	d3.selectAll(".lines")
		.style("stroke-opacity", 0.05)
		.style("fill-opacity", 0.05);

	d3.selectAll("#resource-process_"+d.codeId )
		.style("stroke-opacity", 1)
		.style("fill-opacity", 1);

	d3.selectAll("#fleet-process_"+d.codeId)
		.style("stroke-opacity", 1)
		.style("fill-opacity", 1);
	d3.selectAll("#process-market_" +d.codeId)
		.style("stroke-opacity", 1)
		.style("fill-opacity", 1);

}


function clearHLSankeyFlows() {

	d3.select(this).attr("stroke-opacity", 0.2);
	d3.selectAll(".lines")
		.style("stroke-opacity", 1)
		.style("fill-opacity", 1);
}


function onMapClick(d){
	d3.selectAll(".bar_chart")
		.style("stroke-opacity", 0.2)
		.style("fill-opacity", 0.2);
		
	d3.selectAll("#bar_" + d.id)
		.style("stroke-opacity", 1)
		.style("fill-opacity", 1);
};


$( document.body ).click(function(e) {
	var elem = document.elementFromPoint(e.pageX, e.pageY);
	if (elem.getAttribute('class') !== null && elem.getAttribute('class').indexOf("legendFlowClass") === 0){
		console.log(elem.getAttribute('class').indexOf("legendFlowClass"))
	} else {
		clearflowHighlight();

	}
});


function onFlowHighlight(d) {

	d3.selectAll(".lines")
		.style("stroke-opacity", 0.05)
		.style("fill-opacity", 0.05);

	if (d === "Resource & Fleet to Processing") {
		d3.selectAll("[id^='resource-process_']")
			.style("stroke-opacity", 1)
			.style("fill-opacity", 1);
		console.log(d3.selectAll("[id^='resource-process_']"))
	} else if (d === "Fleet only to Processing") {
		d3.selectAll("[id^='fleet-process_']")
			.style("stroke-opacity", 1)
			.style("fill-opacity", 1);
	} else if (d === "Processing to Market") {
		d3.selectAll("[id^='process-market_']")
			.style("stroke-opacity", 1)
			.style("fill-opacity", 1);
	}
};


function clearflowHighlight() {
	d3.selectAll(".lines")
		.style("stroke-opacity", 1)
		.style("fill-opacity", 1);
	d3.selectAll(".circles")
		.style("stroke-opacity",1)
		.style("fill-opacity", 1);
};


var zoom = d3.zoom()
	.scaleExtent([1, 8])
	.on("zoom", zoomed);

function zoomed() {
	var transform = d3.event.transform;
	mapG.style("stroke-width", 1.9 / transform.k + "px");
	mapG.attr("transform", transform);
}

d3.select('#zoom-in').on('click', function() {	zoom.scaleBy(mapG.transition().duration(750), 1.3)});
d3.select('#zoom-out').on('click', function() {zoom.scaleBy(mapG.transition().duration(750), 1 / 1.3)	});

// End

///////////////// Load All Data ///////////////////////
var promises = [
	d3.json("data/worldcountries.json"),
	d3.json("data/wcpo.json"),
	d3.json("data/flows.json"),
	d3.json("data/stackDataPrepared.json"),
	d3.json("data/sankey_data.json"),
	d3.csv("data/beneficiary.csv")

];
Promise.all(promises).then(ready);

function ready([topo, boundary,flows, stack, graph, beneficiaryData]) {

	// Initialize variables and preparing data
	continentFlows = {
		"nodes": [],
		"links": []
	}
	countryFlows = {
		"nodes": [],
		"links": []
	}
	countryArr = [];
	idArr =[]
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
				// idArr.push(d.country.id);
			}
			if (cntryName.indexOf(d.country.toName) == -1){
				countryArr.push({"name":d.country.toName});
				cntryName.push(d.country.toName);
				// idArr.push(d.country.id);
			}

			countryFlows.links.push({"source": d.country.fromName, "target": d.country.toName, "value": d.value, "codeId": d.id});
		}		
	});
	countryFlows.nodes = countryArr;
	continentFlows.nodes = continentArr;
	snkdata = {
		"continent": continentFlows, "country": countryFlows
	};


	// Defs for flows and sankey
	var defs = svg.append("svg:defs");
	var types = ["pm-mp", "fp-pf", "fr"];
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


	// Sidebar Legend Margins
	var sidebarLegend = sideLegend.append("svg")
		.attr("width",200)
		.attr("height",400);



	////////////////////////////// Sidebar Search Information////////////////////////////
	var margin = {top: 40, right: 5, bottom: 50, left: 60},
		width = 330 - margin.left - margin.right,
		height = 530 - margin.top - margin.bottom;

	var countrySVG = searchCountry.append("svg")
		.attr("class", "searchCountry")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);

	var countryTextG = countrySVG.append("g")
		.attr("transform", "translate(4,38)")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);

	var countryChartG = countrySVG.append("g").attr("id","countryChartG")
		.attr("transform", "translate(80,100)")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);


	searchList = []

	// loop through row_nodes
	beneficiaryData.forEach(function (d) {searchList.push( d.country_name )});

	// use Jquery autocomplete
	$( "#search_box" ).autocomplete({source: searchList});

	// submit when press enter
	$("#search_box").keyup(function (e) {
		if (e.keyCode == 13) {
			findCountry();
		}
	});
	// submit when clicked
	document.getElementById ("search_submit")
		.addEventListener ("click", findCountry, false);

	// select country function
	function findCountry(){
		// get the searched country
		search_country = $('#search_box').val();
		//
		if (searchList.indexOf(search_country) != -1){
			// 	// zoom_and_highlight_country(search_country);
			country_selection = search_country;
			console.log(country_selection);
			updateData(country_selection);
			console.log("id it on");
		}
	}

	var country_selection = "Samoa"
	var countryData
	beneficiaryData.forEach(function (d) {
		if (d.country_name == country_selection) {
			countryData = d
			return countryData;
		}
	});


	// Draw Initial Visualization
	countryTextG.data(countryData)
		.enter().attr("id", "countryData")
		.attr("width", 100)
		.attr("height", 100)

	countryTextG
		.append("text")
		.attr("x", 0)
		.attr("y", 9)
		.attr("dy", ".35em");

	countryTextG.append("foreignObject")
		.attr("class","countryText")
		.attr("width", 317)
		.attr("height", 200)
		.append("xhtml:body")
		.style("font", "14px 'Helvetica Neue'")
		.html(
			"<div> Country: "+ countryData.country_name + "</div>" + "<div>Year: 2013</div>" +
			"<div>Tuna caught as resource owner: " + countryData.resource_catch + " mT ("+ countryData.perc_resource +" %)</div> "+
			"<div>Valued at: $" + countryData.resource_value + "\n</div>"+
			"<div>Tuna caught as fleet owner: " + countryData.fleet_catch + " mT ("+ countryData.perc_fleet +" %)</div> " +
			"<div>Number of vessels: " + countryData.fleet_vessels + "</div>"+
			"<div>Tuna processed: " + countryData.processing_weight + " mT ("+ countryData.perc_processing +" %)</div> "
		)
		.style("line-height", 1.8)
		.selectAll('div')
		.style("padding",5)

	;

	//Drawing Bar Chart
	countryData = [
		{label:"resource", value:+countryData.resource_catch},
		{label:"fleet", value:+countryData.fleet_catch},
		{label:"process", value:+countryData.processing_weight}
	]

	barHeight = 240
	var x = d3.scaleBand()
		.range([ 0, width ])
		.domain(countryData.map(function(d) { return d.label; }))
		.padding(0.2);

	countryChartG.append("g")
		.attr("transform", "translate(-80,390)")
		.attr("height",barHeight)
		.call(d3.axisBottom(x))

	var y = d3.scaleLinear()
		.domain([0, d3.max(countryData,d => d.value)])
		.range([ barHeight, 0]);
	countryChartG.append("g")
		.attr("class", "myYaxis");


	// var countrytooltip = countryChartG.append("div").attr("class", "countrytoolTip");

	countryChartG = countryChartG.append("g")
		.attr("id","countryChart")
		.attr("transform", "translate(-80,150)")
		.attr("height",barHeight);

	var countryBarChart = countryChartG.selectAll("rect")
		.data(countryData)

	countryBarChart.enter()
		.append("rect")
		.attr("class","countryBars")
		.merge(countryBarChart)
		.transition()
		.duration(1000)
		.attr("x", function(d) { return x(d.label); })
		.attr("y", function(d) { return y(d.value); })
		.attr("width", x.bandwidth())
		.attr("height", function(d) { return barHeight - y(d.value); })
		.attr("fill", "#46c4da");

	// Bar Text
	var text = countryChartG.selectAll(".text")
		.data(countryData);
	text.exit().remove()
	text.enter().append("text")
		.attr("class", "text")
		.attr("text-anchor", "middle")
		.merge(text)
		.transition().duration(speed)
		.attr("x", d => x(d.label) + x.bandwidth() / 2)
		.attr("y", d => y(d.value) - 5)
		.text(d => d.value + " mT");

	function updateData(country_selection){
		beneficiaryData.forEach(function (d) {
			if (d.country_name == country_selection) {

				var countryData = d
				var margin = {top: 40, right: 5, bottom: 50, left: 60};
				var width = 330 - margin.left - margin.right;
				var height = 530 - margin.top - margin.bottom;

				//zoom to selection
				newPath = d3.select("#path_"+countryData.id);


				d3.selectAll("#countryData").remove()
				d3.selectAll("#countryChartG").remove()

				countryTextG.data(countryData)
					.enter().attr("id", "countryData")
					.attr("width", 100)
					.attr("height", 100)

				countryTextG
					.append("text")
					.attr("x", 0)
					.attr("y", 9)
					.attr("dy", ".35em");

				countryTextG.append("foreignObject")
					.attr("class","countryText")
					.attr("width", 317)
					.attr("height", 200)
					.append("xhtml:body")
					.style("font", "14px 'Helvetica Neue'")
					.html(
						"<div> Country: "+ countryData.country_name + "</div>" + "<div>Year: 2013</div>" +
						"<div>Tuna caught as resource owner: " + countryData.resource_catch + " mT ("+ countryData.perc_resource +" %)</div> "+
						"<div>Valued at: $" + countryData.resource_value + "\n</div>"+
						"<div>Tuna caught as fleet owner: " + countryData.fleet_catch + " mT ("+ countryData.perc_fleet +" %)</div> " +
						"<div>Number of vessels: " + countryData.fleet_vessels + "</div>"+
						"<div>Tuna processed: " + countryData.processing_weight + " mT ("+ countryData.perc_processing +" %)</div> ")
					.style("line-height", 1.8)
					.selectAll('div')
					.style("padding",5)	;

				//Drawing Bar Chart
				var countryChartG = countrySVG.append("g").attr("id","countryChartG")
					.attr("transform", "translate(80,100)")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom);

				countryData = [
					{label:"resource", value:+countryData.resource_catch},
					{label:"fleet", value:+countryData.fleet_catch},
					{label:"process", value:+countryData.processing_weight}

				]

				barHeight = 240
				var x = d3.scaleBand()
					.range([ 0, width ])
					.domain(countryData.map(function(d) { return d.label; }))
					.padding(0.2);

				countryChartG.append("g")
					.attr("transform", "translate(-80,390)")
					.attr("height",barHeight)
					.call(d3.axisBottom(x))

				var y = d3.scaleLinear()
					.domain([0, d3.max(countryData,d => d.value)])
					.range([ barHeight, 0]);
				countryChartG.append("g")
					.attr("class", "myYaxis");


				countryChartG = countryChartG.append("g")
					.attr("id","countryChart")
					.attr("transform", "translate(-80,150)")
					.attr("height",barHeight);

				var countryBarChart = countryChartG.selectAll("rect")
					.data(countryData)

				countryBarChart.enter()
					.append("rect")
					.attr("class","countryBars")
					.merge(countryBarChart)
					.transition()
					.duration(1000)
					.attr("x", function(d) { return x(d.label); })
					.attr("y", function(d) { return y(d.value); })
					.attr("width", x.bandwidth())
					.attr("height", function(d) { return barHeight - y(d.value); })
					.attr("fill", "#46c4da");

				// Bar Text
				var text = countryChartG.selectAll(".text")
					.data(countryData);
				text.exit().remove()
				text.enter().append("text")
					.attr("class", "text")
					.attr("text-anchor", "middle")
					.merge(text)
					.transition().duration(speed)
					.attr("x", d => x(d.label) + x.bandwidth() / 2)
					.attr("y", d => y(d.value) - 5)
					.text(d => d.value + " mT");

				// var pathExist = newPath["_groups"][0][0]
				//
				// if ( pathExist === null) {
				// 	console.log("do nothing")
				// } else {
				// 	bounds = path.bounds(newPath.datum());
				//
				// 	dx = bounds[1][0] - bounds[0][0],
				// 		dy = bounds[1][1] - bounds[0][1],
				// 		x = (bounds[0][0] + bounds[1][0]) / 2,
				// 		y = (bounds[0][1] + bounds[1][1]) / 2,
				// 		scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
				// 		translate = [width / 2 - scale * x, height / 2 - scale * y];
				//
				// 	mapG.transition()
				// 		.duration(750)
				// 		.call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));}

				newPath
					.attr("class", 'mapBackgroundHighlight')
					.on("mouseout", clearHighlight)	;

			}
		});
	}

	// End
	////////////////////////






	/////////////////////////////////// Draw Flow Map ///////////////////////////////////////

	function renderFlow() {
		// Clear all previous drawn elements
		d3.selectAll(".choroplethBackground").remove()
		d3.selectAll("#choroplethLegend").remove()
		d3.selectAll("#arcs").remove()
		d3.selectAll("#circles").remove()
		d3.selectAll(".mapBackground").remove()
		d3.selectAll("#mapLegend").remove()
		d3.selectAll("#sideFlowLegend").remove()
		d3.selectAll("#sideChoroplethLeg").remove()
		d3.selectAll("#wcpoBoundary").remove()
		d3.selectAll("#boundaryLegendFlow").remove()
		d3.selectAll("#mapInfoTitle").remove()
		d3.selectAll("#flowmapInfoTitle").remove()
		d3.selectAll("#flowPreview").style("opacity","1")		;


		d3.selectAll("flowMapContainer").on("mouseclick", clearflowHighlight)

		var mapsDistTitle = mapG.append("g").attr("transform", "translate(80,10)");

		mapsDistTitle.append("text")
			.attr("id","flowmapInfoTitle")
			.attr("x", -24)
			.attr("y", 9)
			.attr("dy", ".35em")
			.style("text-anchor", "start")
			.style("font-size", "14px")
			.style("fill", "grey")
			.text("Map showing flows of economic benefits of tuna fish for the purse seine fishery");

		// Draw new elements
		var map = mapG.selectAll("path")
			.data(topojson.feature(topo, topo.objects.countries).features)
			.enter()
			.append("path")
			.attr("id", function(d){return "path_" + d.id})
			.attr("class", "mapBackground")
			// draw each country
			.attr("d", path)
			.on("click", onMapClick)
			.on("mousemove", onMouseMove)
			.on('mouseover', highlightCountry)
			.on("mouseout", clearHighlight);

		// Loading Boundary of WCPO
		var boundaryG = mapG.append("g").attr("id",'wcpoBoundary')
		boundaryG.selectAll("path")
			.data(topojson.feature(boundary, boundary.objects.RFB_WCPFC).features)
			.enter()
			.append("path")
			.attr("fill", "none")
			.attr("stroke", "#52575b")
			.attr("stroke-width", 0.2)
			.attr("d", d3.geoPath().projection(projection));

		var boundaryLegG = svg.append("g").attr("id","boundaryLegendFlow");
		var boundaryL = boundaryLegG.append('g')
			.attr("transform", "translate(865,600)");

		boundaryL.append("rect")
			.attr("x", -18)
			.attr("width", 15)
			.attr("height", 15)
			.style("fill", "none")
			.style("stroke", "#878e99")
			.style("stroke-width", 1);

		boundaryL.append("text")
			.attr("x", -24)
			.attr("y", 9)
			.attr("dy", ".35em")
			.style("text-anchor", "end")
			.text("WFCPC Boundary");
		// End

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
			.attr("stroke", "darkblue")
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
			.attr("class", "lines linesMovement ")
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
				if((d.country.beneficiary_typefrom == "p" && d.country.beneficiary_typeto == "m") | ((d.country.beneficiary_typefrom == "m" && d.country.beneficiary_typeto == "p"))) { return "process-market_" + d.id}
				else if((d.country.beneficiary_typefrom == "f" && d.country.beneficiary_typeto == "p") | ((d.country.beneficiary_typefrom == "p" && d.country.beneficiary_typeto == "f"))) {return "fleet-process_" + d.id}
				else {return "resource-process_" + d.id};
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
		mapkeys = ["Resource & Fleet to Processing","Fleet only to Processing", "Processing to Market"]
		var colorScale = d3.scaleOrdinal()
			.range(["#f00314", "#a175fb", "#00bcd4"])
			.domain(mapkeys);

		var Leg = svg.append("g").attr("id","mapLegend")
			.attr("class", "exclude-from-zoom");
			// .on("mouseout", clearflowHighlight);

		var mapFlowlegend = Leg.selectAll(".legend")
			.data(mapkeys.slice())
			.enter().append("g")
			.attr("class", "legend")
			// .on("mouseover", onFlowHighlight)
			.on("click", onFlowHighlight)
			.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

		var mapL = mapFlowlegend.append('g')
			.attr("transform", "translate(850,615)");

			mapL.append("line")
				.attr("class", "legendFlowClass")
				.attr("x1", - 18)
				.attr("x2",18 )
				.attr("y1", 10)
				.attr("y2", 10)
				.style("stroke-dasharray"," 15, 8, 5 ")
				.style("stroke-width","7")
				.attr("stroke-linecap", "round")
				.attr("stroke-linejoin", "round")
				// .attr("x", -18)
				// .attr("width", 15)
				// .attr("height", 15)
				.style("stroke", function(d){return colorScale(d)});

			mapL.append("text")
				.attr("class", "legendFlowClass")
				.attr("x", -24)
				.attr("y", 9)
				.attr("dy", ".35em")
				.style("text-anchor", "end")
				.text(function(d) {return d});

		var sideLegendGroup = sidebarLegend.append("g").attr("id","sideFlowLegend")
			.attr("transform", "translate(70, 25)");

		var sideLegendG = sideLegendGroup.selectAll(".legend")
			.data(mapkeys.slice())
			.enter().append("g")
			.attr("class", "legend")
			.on("mouseover", onFlowHighlight)
			.on("mouseout", clearflowHighlight)
			.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

		sideLegendG = sideLegendG.append('g')
			.attr("transform", "translate(0,0)");

		sidebarLegend.append("text")
			.attr("transform", "translate(75,-30)")
			.attr("x",-5)
			.attr("y", 45)
			.style("fill", "#404040")
			.style("font-size", "13px")
			.style("font-weight", 400)
			.style("text-anchor", "middle")
			.text("Flow Legend Beneficiary");


		sideLegendG.append("line")
			.attr("x1", -65)
			.attr("x2", -30 )
			.attr("y1", 10)
			.attr("y2", 10)
			.style("stroke-dasharray"," 15, 8, 5 ")
			.style("stroke-width","7")
			.attr("stroke-linecap", "round")
			.attr("stroke-linejoin", "round")
			// .attr("x", -18)
			// .attr("width", 15)
			// .attr("height", 15)
			.style("stroke", function(d){return colorScale(d)});

		sideLegendG.append("text")
			.attr("x", -24)
			.attr("y", 9)
			.attr("dy", ".35em")
			.style("text-anchor", "start")
			.text(function(d) {return d});

		var boundaryLegG = sideLegendGroup.append("g").attr("id","boundarysideLegendFlow");
		var boundaryL = boundaryLegG.append('g')
			.attr("transform", "translate(-20,80)");

		boundaryL.append("rect")
			.attr("x", -45)
			.attr("width", 15)
			.attr("height", 15)
			.style("fill", "none")
			.style("stroke", "#878e99")
			.style("stroke-width", 1);

		boundaryL.append("text")
			.attr("x", -24)
			.attr("y", 7)
			.attr("dy", ".4em")
			.style("text-anchor", "start")
			.style("font-size", "13px")
			.style("font-weight", 400)
			.text("WFCPC Boundary");


	};


	/////////////////////////////Draw Choropleth Maps ///////////////////////////////////////
	function renderResource(beneficiaryType) {
		// Clear drawn elements
		d3.selectAll("#arcs").remove()
		d3.selectAll("#circles").remove()
		d3.selectAll(".mapBackground").remove()
		d3.selectAll("#mapLegend").remove()
		d3.selectAll("#choroplethLegend").remove()
		d3.selectAll(".choroplethBackground").remove()
		d3.selectAll("#sideChoroplethLeg").remove()
		d3.selectAll("#boundaryLegendFlow").remove()
		d3.selectAll("#mapInfoTitle").remove()
		d3.selectAll("#flowmapInfoTitle").remove()
		d3.selectAll("#flowPreview").style("opacity","0");

		// Choropleth Data Merge
		var countries = topojson.feature(topo, topo.objects.countries);
		var countryName = beneficiaryData.reduce((accumulator, d) =>{accumulator[d.id] = d;return accumulator;}, {});
		countries.features.forEach(d => {	Object.assign(d.properties, countryName[d.id]);});

		console.log(countries.features)
		// Choropleth Color Scheme
		var legendTitle
		var colorScheme = d3.schemeBlues[7];
		var colorScale
		var colorValue
		var catchValue
		// var dollarValue

		if (beneficiaryType === "resource"){
			legendTitle = "Resource Percentage Distribution";
			colorValue = d => d.properties.perc_resource;
			catchValue = d => d.properties.resource_catch;
			colorScale = d3.scaleThreshold().domain([0.01, 1, 3, 6 , 10 ,15, 20]).range(colorScheme);
			mapTitle = "Map of Resource Distribution by percentage of weight in MT for the purse seine fishery";
		}
		else if (beneficiaryType === "fleet") {
			legendTitle = "Fleet Percentage Distribution";
			colorValue = d => d.properties.perc_fleet;
			catchValue = d => d.properties.fleet_catch;
			colorScale = d3.scaleThreshold().domain([0.1, 1, 3, 6, 9, 12,20 ]).range(colorScheme);
			mapTitle = "Map of Fleet Distribution by percentage of weight in MT for the purse seine fishery";
		}
		else if (beneficiaryType === "processing") {
			legendTitle = "Processing Percentage Distribution";
			colorValue = d => d.properties.perc_processing;
			catchValue = d => (d.properties.processing_weight == 0)
				? "no data weight"
				: d.properties.processing_weight;
			colorScale = d3.scaleThreshold().domain([0.1, 1, 3, 6, 9, 12 ,20]).range(colorScheme);
			mapTitle = "Map of Processing Distribution by percentage of weight in MT for the purse seine fishery";

		}

		var mapsDistTitle = mapG.append("g").attr("transform", "translate(80,10)");
		mapsDistTitle.append("text")
			.attr("id","mapInfoTitle")
			.attr("x", -24)
			.attr("y", 9)
			.attr("dy", ".35em")
			.style("text-anchor", "start")
			.style("fill", "grey")
			.style("font-size", "14px")
			.text(mapTitle);

		console.log(countries.features)
		//Loading choropleth  map
		var mapChoropleth = mapG.append("g")
		mapChoropleth
			.attr("class", "choroplethBackground")
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
				: d.properties.country_name +"\n"+"Share Distribution: " + colorValue(d) + "%\n" + "Tuna Weight: " +
				catchValue(d) +  " mT")
			.exit().remove();


		// Loading Boundary of WCPO
		var boundaryG = mapG.append("g").attr("id",'wcpoBoundary')

		boundaryG.selectAll("path")
			.data(topojson.feature(boundary, boundary.objects.RFB_WCPFC).features)
			.enter()
			.append("path")
			.attr("fill", "none")
			.attr("stroke", "#62c3d4")
			.attr("stroke-width", 0.2)
			.attr("d", d3.geoPath().projection(projection));

		var boundaryLegG = svg.append("g").attr("id","boundaryLegendFlow");
		var boundaryL = boundaryLegG.append('g')
			.attr("transform", "translate(850,610)");

		boundaryL.append("rect")
			.attr("x", -18)
			.attr("width", 15)
			.attr("height", 15)
			.style("fill", "none")
			.style("stroke", "#009ad4")
			.style("stroke-width", 1);

		boundaryL.append("text")
			.attr("x", -24)
			.attr("y", 9)
			.attr("dy", ".35em")
			.style("text-anchor", "end")
			.text("WFCPC Boundary");
		// End

		// Choropleth Legend
		var x = d3.scaleSqrt()
			.domain([0.1,32])
			.rangeRound([0,200])

		legG = svg.append("g")
			.attr("id","choroplethLegend")
			.attr("class", "key")
			.attr("transform", "translate(700,655)");

		legG.selectAll("rect")
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

		legG.append("text")
			.attr("class", "caption")
			.attr("x", x.range()[0])
			.attr("y", -9)
			.attr("fill", "#000")
			.attr("text-anchor", "start")
			// .attr("font-weight", "bold")
			.text(legendTitle);

		legG.call(d3.axisBottom(x)
			.tickSize(13)
			.tickValues(colorScale.domain()))
			.select(".domain")
			.remove();
		// End


		/////// Siderbar Choropleth Legend ////////
		var sideChoroplethG = sidebarLegend.append("g").attr("id","sideChoroplethLeg")
			.attr("transform", "translate(18, 190)");

		sideChoroplethG.append("text")
			.attr("transform", "translate(-220,-70)")
			.attr("x",width/2)
			.attr("y", 45)
			.style("fill", "#404040")
			.style("font-size", "13px")
			.style("font-weight", 400)
			.style("text-anchor", "middle")
			.text("Beneficiary Type Legend");

		sideChoroplethG.selectAll("rect")
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

		sideChoroplethG.append("text")
			.attr("class", "caption")
			.attr("x", 0)
			.attr("y", -9)
			.attr("fill", "#000")
			.attr("text-anchor", "start")
			// .attr("font-weight", "bold")
			.text(legendTitle);

		sideChoroplethG.call(d3.axisBottom(x)
			.tickSize(13)
			.tickValues(colorScale.domain()))
			.select(".domain")
			.remove();

	};

	// End Choropleth
	////////////////////////////////////////////////////////////////////

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



	////////////////////////////////////// Stack Bar Chart ////////////////////////////////////
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
		.range(["#007cc9", "#55d8fe", "#ff8373"])
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


	barchart.append("text")
			.attr("transform", "translate(0," + height + ")")
			.attr("id", "xaxis_label")
			.attr("x",width/2)
			.attr("y", 45)
			.style("fill", "#404040")
			.style("font-size", "13px")
			.style("font-weight", 400)
			.style("text-anchor", "middle")
			.text("Country Codes");

	barchart.append("text")
			.attr("transform", "translate(0,0) rotate(-90)")
			.attr("id", "yaxis_label")
			.attr("x",-height/2)
			.attr("y", -40)
			.style("fill", "#404040")
			.style("font-size", "13px")
			.style("font-weight", 400)
			.style("text-anchor", "middle")
			.text("Percentage distribution by beneficiary type");

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
			'<div> Resource: ' + record.data['Resource Owner'] + ' % <div />'+
			'<div> Fleet: ' + record.data['Fleet Owner'] + ' %<div />'+
			'<div> Processing: ' + record.data['Processing'] + ' %<div />');
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
	// End
	////////////////////////////////////////////////



	////////////////////////// Drawing Sankey Diagram //////////////////////////////////////////
	var units = "%";
	var positionInfo = document.getElementById('sankeyDiv').getBoundingClientRect();
	var margin = {top: 30, right: 30, bottom: 20, left: 30};
	var width = positionInfo.width - margin.left - margin.right;
	var height = positionInfo.height - margin.top - margin.bottom;
	
	// format variables
	var formatNumber = d3.format(",.0f"),    // zero decimal places
		format = function(d) { return formatNumber(d) + " " + units; };
	sankeySvg = sankeyDiv.append("svg")
		.attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
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
	scheme = d3.schemeCategory10
	scheme.splice(3,1)
	// scheme.splice(7,1)

	const color = d3.scaleOrdinal(scheme)


	// add in the nodes
	sankeySvg.append("g")
		.attr("stroke", "#f3f3ff")
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
		.attr("stroke-opacity", 0.3)
		.selectAll("g")
		.data(links)
		.join("g")
        .style("mix-blend-mode", "multiply");
	
	
	edgeColor = "input";
	link.append("path")
      .attr("d", d3.sankeyLinkHorizontal())      
      .attr("stroke-width", d => Math.max(1, d.width))
	  .sort(function(a, b) { return b.dy - a.dy; })
	  .on("mouseover", highlightSankeyFlows )
	  .on("mouseout", clearHLSankeyFlows)
		.attr("id",d => d.source.name);
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
		.text(d => d.name)
		.attr("class","sankeytext");
	
}
// End of Sakey
////////////////////////////////////////////////////////////////////////////////////////

