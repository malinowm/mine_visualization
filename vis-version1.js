function makePlot(gx, gy, studyName){
    //note: this has yet to be implemented. I want to use onMouseOver, onMouseOut, and onClick to make it tell when a point has been moused over
    var curr_height = document.getElementsByTagName("div")["plot"].offsetHeight;
 var curr_width = document.getElementsByTagName("div")["plot"].offsetWidth;

//Width and height
 var h = curr_height-20 //curr_width;
var w = curr_width-40 //curr_height;

var padding = 4*Math.log(w) +30;
var xAxis = d3.svg.axis();

//Data
//var data;// = {gene_x: gene_x, gene_y: gene_y};
//Create SVG element
var svg = d3.select("#plot")
    .insert("svg")
    .attr("width", w)
    .attr("height", h);


var gene_x = gx;
var  gene_y =gy;
var data = {studyid: "GSE"+studyName, gene_x: gene_x, gene_y: gene_y};

$.getJSON("http://yates.webfactional.com/studies/getData", data, function(d){
       
	 
	 //finds the mins and maxes for scaling
	var xMax = d3.max(d.data, function(d){return d.x; });
	var xMin = d3.min(d.data, function(d){return d.x; });
	var yMax = d3.max(d.data, function(d){ return d.y; });
	var yMin = d3.min(d.data, function(d){ return d.y; });

	//sets the x- scale
	var xScale = d3.scale.linear()
	    .domain([xMin-(xMin*.1), xMax+5])
	    .range([padding, w- padding]);

	//sets the y- scale
	var yScale = d3.scale.linear()
	    .domain([yMin-(yMin*.1),yMax+5])
	    .range([h - padding, padding]);
	
	d.data.forEach(function(point,i){
		var x = point.x;
		var y = point.y;
		
		var color1 = "yellow";
		var color2 = "red";
		var colorInterpolator; 
    //change these if statements to use hsl checking
       	if (Math.abs(d3.hsl(color1).h - d3.hsl(color2).h)>200)
	{
	    colorInterpolator = d3.scale.linear()
		.domain([0, d.data.length])
		.interpolate(d3.interpolateRgb)
		.range([color1,  color2]);
	}
    else 
	{
	    color1 = d3.hsl(color1);
	    color2 = d3.hsl(color2);
	    colorInterpolator = d3.scale.linear()
		.domain([0, d.data.length])
		.interpolate(d3.interpolateHsl)
		.range([color1, color2]);
	}

svg.append("circle")
    .attr("cx", function(d) {
	    return xScale(x);
	})
    .attr("cy", function(d) {
	    return yScale(y);
	})
    .attr("r", w*h/108000)
    .attr("fill",  (colorInterpolator(i)))
    .style("opacity", .3)
    .attr("id", "points")
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .on("mouseover", function(){
            svg.append("text")
                .text(function(){return "(" + x + ", " + y + ")";})
                .attr("x",  function() { return xScale(x);} )
                .attr("y", function() { return yScale(y);})
		.attr("id", "pointText")
		.attr("font-size", 10)
		.attr("text-anchor", "bottom");
	})
    .on("mouseout", function(){
	    var elem = document.getElementById("pointText");
	    elem.parentNode.removeChild(elem);
 });
	    });
	    //alert("all of the plotting has been done");
	    //xAxis.scale(xScale);
	    //xAxis.orient("bottom");
	    var xAxis = d3.svg.axis()
	    .scale(xScale)
	    .orient("bottom")
	    .ticks(w*.008);  //Set rough # of ticks

	var yAxis = d3.svg.axis()
	    .scale(yScale)
	    .orient("left")
	    .ticks(h*.008);

	svg.append("g")
	    .attr("class", "axis")
	    .attr("transform", "translate(2," + (h - padding) + ")")
	    .call(xAxis);

      	svg.append("g")
	    .attr("class", "axis")
	    .attr("transform", "translate(" +( padding + 2 )+ ",0)")
	    .call(yAxis);


    });

svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "middle")
    .attr("x", w*.5- padding*.5)
    .attr("y", h-padding*.2)
    .text(gx)
    .attr("font-family", "sans-serif")
    .attr("font-size", padding*.2)
    .attr("fill", "rgba(10, 100, 80, 0.8)");


svg.append("text")
    .attr("class", "title")
    .attr("text-anchor", "middle")
    .attr("x", w/2- padding/2)
    .attr("y", padding/2)
    .text("Study: GSE" + studyName)
    .attr("font-family", "sans-serif")
    .attr("font-size", 10+w/70)
    .attr("fill", "rgba(10, 100, 80, 0.8)");


svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("y", padding*.3)
    .attr("x", -h/2)
    .attr("transform", "rotate(-90)")
    .text(gy)
    .attr("font-family", "sans-serif")
    .attr("font-size", padding*.2)
    .attr("fill", "rgba(10, 100, 80, 0.8)");

//RESIZE HELP!!!! AHHHHHHHHH!!!!!!!!!

var debounce = function (func, threshold, execAsap) {
 
    var timeout;
    return function debounced () {
        var obj = this, args = arguments;
        function delayed () {
            if (!execAsap)
                func.apply(obj, args);
            timeout = null; 
        };
 
        if (timeout)
            clearTimeout(timeout);
        else if (execAsap)
            func.apply(obj, args);
 
        timeout = setTimeout(delayed, threshold || 100); 
    };
 
};
    $(window).resize(debounce(function (e) {
		window.location.reload(false);
	    }, 250, false));

}

