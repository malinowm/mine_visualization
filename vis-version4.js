function makePlot(geneX, geneY, studyID)
{
    var e = document.getElementById("selectColorCode");
    var colorCode = e.options[e.selectedIndex].value;

    //THESE ARE EASILY CHANGABLE, DYNAMIC, USER DECISIONS
    //var colorCode = "age";  // choose between age, ancestry, gender
    var color1 = "yellow";
    var color2 = "blue";


    //Width and height
    var w = document.getElementsByTagName("div")["plot"].offsetWidth;
    var h = document.getElementsByTagName("div")["plot"].offsetHeight;

    //sets padding
    var padding = 4*Math.log(w) +30;
    //var xAxis = d3.svg.axis();


    //I'm not really sure why this is here...? It might not be necessary any more.
    var gene_x = geneX;
    var gene_y = geneY; 

    //Create SVG element
    var svg = d3.select("#plot")
	.append("svg")
	.attr("id","this")
	.attr("width", w)
	.attr("height", h);
    var data = {studyid: "GSE" + studyID, gene_x: gene_x, gene_y: gene_y};
    $.getJSON("http://yates.webfactional.com/studies/getChartData", data,  function(d){
    //getting data
	    //  alert(d[0].sample.age);
    //   $.getJSON("complexData.txt", function(d){
	    //    alert(d);
	    //finds max x and y to set the scale
	    var xMax = d3.max(d, function(d){return d.x; });
	    var xMin = d3.min(d, function(d){return d.x; });
	    var yMax = d3.max(d, function(d){ return d.y; });
	    var yMin = d3.min(d, function(d){ return d.y; });
	    
	    //returns an array of keys (i.e. gender, age, id, ancestry, etc.)
	    var getKeys = Object.keys(d[0].sample);
	    //creates an array to hold keyTypeObject objects
	    var attributes = [];
	    /*The keyTypeObject has:
for all
key (i.e. gender, age, etc.)
dataType (i.e. number, string, etc.)
for numbers
keyMax (maximum value that ever occurs for this key)
keyMin (minimum value that ever occurs for this key)
	    */
	    var keyTypeObject;
	    //function to create colorObjects. These contain i.d.s (i.e. male, female), and colors that correspond with those i.d.s
	    function colorObject (id, color)
	    {
		this.id = id;
		this.color = color;
	    };
	    //loops through the keys that were returned to create the keyTypeObjects
	    getKeys.forEach( function(keyTemp, i){
		    //gets the first value in the data set to verify the type of the key
		    var typeIndicator = d[0].sample[keyTemp];
		    //creates a keyTypeObject
		    keyTypeObject = {
			key: keyTemp,
			dataType: typeof typeIndicator
		    };
		    //gives the object the min and max properties if it is a number.
		    if (keyTypeObject.dataType == "number")
			{
			    keyTypeObject.keyMax = d3.max(d, function(d){return d.sample[keyTypeObject.key]; }); 
			    keyTypeObject.keyMin = d3.min(d, function(d){return d.sample[keyTypeObject.key]; });

			}
		    else if (keyTypeObject.dataType == "string")
			{
			    //stringTypes is an array that will hold colorObjects
			    var stringTypes = [];
			    //this is an array that will just hold the ids of key object. This exists for the purpose of checking whether or not the id already exists before creating a new object for it.
			    var stringTypesCheck =[];
			    //creates the first color object. This one will be used to check the existance of the id against the others. The color that is in place is temporary
			    var first = new colorObject(d[0].sample[keyTemp], "#ff0000");
			    //pushes the first id to the array of strings
			    stringTypesCheck.push(d[0].sample[keyTemp]);
			    //pushes the first color object to the array of colorObjects
			    stringTypes.push(first);
			    //goes through the whole data set to look for different definitions of the temporary key.
			    d.forEach(function(keyValue){

				    //if this new definition (i.e. female) does not already exist 
				    if(stringTypesCheck.indexOf(keyValue.sample[keyTemp])<0)
					{
					    //creates a new color object for the definition and assigns it a dummy variable color
					    var colorTemp = new colorObject( keyValue.sample[keyTemp], "#ff0000");
					    //pushes the definition to the array and the color object to the array of color objects.
					    stringTypesCheck.push(keyValue.sample[keyTemp]);
					    stringTypes.push(colorTemp);
					}
				    
				});
			    //adds the array of color objects to the keyTypeObject object
			    keyTypeObject.colorsList = stringTypes;
			    //counts how long the list is
			    keyTypeObject.numColors = stringTypes.length;
			}
		    //pushes the keyTypeObject, with all of the properties filled in, back to the attributes array
		    attributes.push(keyTypeObject);
		});
	    //sets the x- scale
	    var xScale = d3.scale.linear()
		.domain([xMin-(xMin*.1), xMax + (xMax*.05)])
		.range([padding, w- padding]);

	    //sets the y- scale
	    var yScale = d3.scale.linear()
		.domain([yMin-(yMin*.1),yMax + (yMax*.05)])
		.range([h - padding, padding]);

	    //creates a colorInterpolator
	    var colorInterpolator;
	    //These make it just... easier to deal with stuff later
	    var string = false, num =false;
	    //finds the index of the key in the attributes array
	    var colorIndex;
	    drawGraph();
	    function drawGraph(){
		//goes through attributes array
		var color1 = "yellow";
		var color2 = "blue";
		e = document.getElementById("selectColorCode");
		colorCode = e.options[e.selectedIndex].value;
		attributes.forEach(function(keyType, i){
			// if the key matches the colorCode (i.e. gender, age)
			if (keyType.key == colorCode)
			    {
				colorIndex = i;
				//alert(colorCode);

				//if the key definitions are numbers
				if (keyType.dataType=="number")
				    {
					//alert("num");
					var colorDomainMin = keyType.keyMin;
					//creates an rgb interpolator if the hue values are too far apart (i.e. red/ blue or red/ purple)
					if (Math.abs(d3.hsl(color1).h - d3.hsl(color2).h)>200)
					    {
						colorInterpolator = d3.scale.linear()
						    .domain( [keyType.keyMin , keyType.keyMax] ) //
						    .interpolate(d3.interpolateRgb)
						    .range([color1,  color2]);
						
					    }
					else 
					    {
						color1 = d3.hsl(color1);
						color2 = d3.hsl(color2);
						colorInterpolator = d3.scale.linear()
						    .domain([keyType.keyMin, keyType.keyMax])
						    .interpolate(d3.interpolateHsl)
						    .range([color1, color2]);
					    }
					num = true;
					string= false;
				    }
				//if the key definitions are strings
				if (keyType.dataType=="string")
				    {
					//alert("string");
					//start of the hsl hue range (this should probably be the actually start)
					color1 = d3.hsl("red");
					//near the end of the hsl hue range
					color2 = d3.hsl("purple");
					//creates an hsl interpolator for the rainbow of colors
					colorInterpolator = d3.scale.linear()
					    .domain([0, keyType.numColors])
					    .interpolate(d3.interpolateHsl)
					    .range([color1, color2]);
					//sets colors to go with colorObjects. Colors are equally divided among the hue range
					for (j=0; j<keyType.numColors; j++)
					    {
						keyType.colorsList[j].color = colorInterpolator(j);
					    }
					string = true;
					num=false;
					       
				    }
			    }


		    });
		//alert(d.length);
		//goes through the points to plot
		d.forEach(function(point,i){
			//finds the x and y location
			var x = point.x;
			var y = point.y;
			       
			//finds the piece of data that is crucial to color coding the graph
			numCol = point.sample[colorCode];
			//finds the index for the correct key in the colorsList array as defined by colorCode
			var colIndex;
			//DRAWS ALL THE THINGS!!!

			svg.append("circle")
			    .attr("cx", function() {
				    return xScale(x);
				})
			    .attr("cy", function(d) {
				    return yScale(y);
				})
			    .attr("r", w*h/108000)
			    .attr("id", "allCircles")
			    .attr("fill", function(){ if (num)
					{
					    //interpolates a color with the color interpolator
					    return (colorInterpolator(numCol));
					}
				    else
					{ 
					    //finds the colorObject key that matches the data from point.
					    attributes[colorIndex].colorsList.forEach(function(c, i){
						    if (c.id==numCol)
							{
							    colIndex = i;
							}
						});
					    //returns the corresponding color
					    return attributes[colorIndex].colorsList[colIndex].color;
					           
					}
				})
			    .style("opacity", .3)
			    .attr("stroke", "black")
			    .attr("stroke-width", .5)
			    .on("mouseover", function(){
				    //shows the x and y location: This needs to be changed still.
				    svg.append("rect")
					.attr("fill", "white")
					//.text(function(){return (colorCode + ": " + point.sample[colorCode])})//"(" + x + ", " + y + ")";})
					.attr("x",  function() { return xScale(x);} )
					.attr("y", function() { return yScale(y)-16;})
					.attr("id", "boxText")
					.attr("width", function(){return (5+(8*(colorCode.length + (String(point.sample[colorCode]).length))));})
					.attr("height", 20)
					//.attr("font-size", 10)
					svg.append("text")
					.text(function(){return (colorCode + ": " + point.sample[colorCode])})//"(" + x + ", " + y + ")";})
					.attr("x",  function() { return xScale(x);} )
					.attr("y", function() { return yScale(y);})
					.attr("id", "pointText")
					.attr("font-size", 13)
					.attr("font-family", "sans-serif");
				})
			    .on("mouseout", function(){
				    var elem = document.getElementById("pointText");
				    elem.parentNode.removeChild(elem);
				    elem = document.getElementById("boxText");
				    elem.parentNode.removeChild(elem);

				});
		    });// semi colon added
		svg.append("text")
		    .attr("class", "text")
		    .attr("id", "keyText")
		    .attr("text-anchor", "front")
		    .attr("x", w*.7+ padding/2)
		    .attr("y", padding/2 +5)
		    .text("Colored By: " + colorCode)
		    .attr("font-family", "sans-serif")
		    .attr("font-size", w/70)
		    .attr("fill", "black");
	    };//semi colon
	    //creates the axises
	           
	    $("#selectColorCode").change(function(e) {
		    var circlesToRemove = svg.selectAll("circle");
		    circlesToRemove.remove();
		    var textToRemove = document.getElementById("keyText");
		    textToRemove.parentNode.removeChild(textToRemove);

		    drawGraph(d); 
		});
	    var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("bottom")
		.ticks(w*.015);  //Set rough # of ticks

	    var yAxis = d3.svg.axis()
		.scale(yScale)
		.orient("left")
		.ticks(h*.015);

	    svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(2," + (h - padding) + ")")
		.call(xAxis);

	    svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" +( padding + 2 )+ ",0)")
		.call(yAxis);
	});

    //creates an x label
    svg.append("text")
	.attr("class", "x label")
	.attr("text-anchor", "middle")
	.attr("x", w*.5- padding*.5)
	.attr("y", h-padding*.2)
	.text(gene_x)
	.attr("font-family", "sans-serif")
	.attr("font-size", padding*.22)
	.attr("fill", "black");

    //creates a title
    svg.append("text")
	.attr("class", "title")
	.attr("text-anchor", "middle")
	.attr("x", w/2- padding/2)
	.attr("y", padding/2)
	.text("GSE25935 HEALTHY LIVER")
	.attr("font-family", "sans-serif")
	.attr("font-size", 10+w/70)
	.attr("fill", "black");


           
    //creates a y label
    svg.append("text")
	.attr("class", "y label")
	.attr("text-anchor", "middle")
	.attr("y", padding*.2)
	.attr("x", -h/2)
	.attr("transform", "rotate(-90)")
	.text(gene_y)
	.attr("font-family", "sans-serif")
	.attr("font-size", padding*.22)
	.attr("fill", "black");
           
    //function to debounce events that I got online. THANK YOU!!!
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
 
    };//added semicolon
    //reloads the graph on resize
    /*    $(window).resize(debounce(function (e) {
		window.location.reload(false);
	    }, 250, false));
    */
}