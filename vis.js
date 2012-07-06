function makePlot( geneX, geneY, studyID)
{
    //THESE ARE EASILY CHANGABLE, DYNAMIC, USER DECISIONS
    document.getElementById("list").innerHTML = "";
    document.getElementById("hist").innerHTML = "";
    var color1 = "yellow";
    var color2 = "blue";


    //Width and height
    var w = document.getElementsByTagName("div")["plot"].offsetWidth;
    var h = document.getElementsByTagName("div")["plot"].offsetHeight;
    
    //sets padding
    var padding = 4*Math.log(w) +30;
    //var xAxis = d3.svg.axis();
    

    var gene_x = geneX;
    var gene_y = geneY; 
    var studyid = studyID;
    //Create SVG element
    var svg = d3.select("#plot")
	.append("svg")
	.attr("exists","true")
	.attr("id", "this")
	.attr("width", w)
	.attr("height", h);
    
    var wCol = document.getElementsByTagName("div")["list"].offsetWidth;
    var hCol = document.getElementsByTagName("div")["list"].offsetHeight;

    var data = {studyid: studyid, gene_x: gene_x, gene_y: gene_y};
    $.getJSON("http://yates.webfactional.com/studies/getChartData", data, function(d){
	    // $.getJSON("complexData.txt", data, function(d){
	    //getting data
	    var list = document.getElementById("list");
	    var isListEmpty = list.firstChild
	    
   
		//  $.getJSON("complexData.txt", data, function(d){
		var select = document.getElementById("selectColorCode");
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
	    function colorObject (id, color, numOfType)
	    {
		this.id = id;
		this.color = color;
		this.numOfType = numOfType;
	    };
	    
	    var isInSelect = (select.length==0);
   
	    //loops through the keys that were returned to create the keyTypeObjects
	    getKeys.forEach( function(keyTemp, i){
		    //gets the first value in the data set to verify the type of the key
		    var typeIndicator = d[0].sample[keyTemp];
		    if(isInSelect)
			select.options[select.options.length] = new Option(keyTemp, keyTemp);
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
			    //goes through the whole data set to look for different definitions of the temporary key.
			    d.forEach(function(keyValue){
				        
				    //if this new definition (i.e. female) does not already exist
				        
				    if(stringTypesCheck.indexOf(keyValue.sample[keyTemp])<0)
					{
					    //creates a new color object for the definition and assigns it a dummy variable color
					    var colorTemp = new colorObject( keyValue.sample[keyTemp], "#ff0000", 1);
					    //pushes the definition to the array and the color object to the array of color objects.
					    stringTypesCheck.push(keyValue.sample[keyTemp]);
					    stringTypes.push(colorTemp);
					}
				    else 
					{
					    keyIndex = stringTypesCheck.indexOf(keyValue.sample[keyTemp]);
					    var numBefore = stringTypes[keyIndex].numOfType;
					    stringTypes[keyIndex].numOfType = numBefore + 1;
					        
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
	    //var e = document.getElementById("selectColorCode");
	    //var colorCode =  select.options[select.selectedIndex].value;
	    //sets the x- scale
	    var xScale = d3.scale.linear()
		.domain([xMin-(xMin*.1), xMax + (xMax*.05)])
		.range([padding, w- padding]);

	    //sets the y- scale
	    var yScale = d3.scale.linear()
		.domain([yMin-(yMin*.1),yMax + (yMax*.05)])
		.range([h - padding, padding]);

	    //creates a colorInterpolator

	    //These make it just... easier to deal with stuff later
	    var string = false, num =false;
	    //finds the index of the key in the attributes array
	    var colorIndex;
	    
	    drawGraph();
	    function drawGraph(){
       
		    //goes through attributes array
		var color1 = "yellow";
		var color2 = "blue";
		var colorInterpolator;
		select = document.getElementById("selectColorCode");
		colorCode = select.options[select.selectedIndex].value;
		var dataSetLength  = d.length;
		//var textAll= document.getElementsByTagName("div")["list"];// for the rest of the known world
		attributes.forEach(function(keyType, i){
			// if the key matches the colorCode (i.e. gender, age)
			if (keyType.key == colorCode)
			    {
				colorIndex = i;
				//alert(colorCode);
				var heightOfText = 15;
				
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
					
					
					//<div id="histogramScale" style="height:200px; width:400px; border:2px solid blue;"></div>
					
					var divWords = document.createElement("div");
					/*
					  var divHist = document.createElement("div");
					  
					  divHist.style.width = "400px";
					  divHist.style.height = "200px";
					  divHist.style.border = "2px solid blue";
					  divHist.setAttribute("id", "histogramScale");


					  document.body.appendChild(divHist);
					*/
					var histValues = [];
					d.forEach(function(point, i){
						histValues[i] = point.sample[colorCode];
					    });
					
					var numBins =15;
					var wHist = document.getElementsByTagName("div")["hist"].offsetWidth;
					var hHist = document.getElementsByTagName("div")["hist"].offsetHeight;
					var histPadding = .1*Math.sqrt(hHist*wHist);

					//histogram.range(keyType.keyMin, keyType.keyMax).bins(1);
					var domainMinxScale; 
					if (keyType.keyMin>=0){
					    domainMinxScale = 0;
					}
					else{
					    domainMinxScale = keyType.keyMin - ((keyType.keyMax-keyType.keyMin)/(numBins-1));
					}
					
					var xHist = d3.scale.linear()
					    .domain([domainMinxScale, keyType.keyMax + ((keyType.keyMax-keyType.keyMin)/(numBins-1))])
					    .range([histPadding, wHist-histPadding]);
					
					var histogram = d3.layout.histogram().bins(xHist.ticks(numBins))
					    (histValues);
					//alert(xHist.ticks(numBins).length);
					var yHist = d3.scale.linear()
					    .domain([0, d3.max(histogram, function(h) { return h.y; })])
					    .range([(hHist-histPadding), histPadding]);
					
					var svgHist= d3.select("#hist")
					    .append("svg")
					    .attr("width", wHist)
					    .attr("height", hHist)
					    .attr("id", "histsvg");
					
					
					svgHist.selectAll("rect")
					    .data(histogram)
					    .enter()
					    .append("rect")
					    .attr("id", "histogramRectangles")
					    .attr("width", function(h) {return xHist(h.dx)-xHist(0) - 1;})
					    .attr("x", function(h) { 
						    return xHist(h.x); })
					    .attr("y", function(h) { return yHist(h.y); })
					    .attr("height", function(h) {return hHist - yHist(h.y) - histPadding;})//yHist(h.y); })
					    .attr("fill", function(h){  return colorInterpolator(h.x); });
					
					var xAxisHist = d3.svg.axis()
					    .scale(xHist)
					    .orient("bottom")
					    .ticks(numBins);
					
					var yAxisHist = d3.svg.axis()
					    .scale(yHist)
					    .orient("left")
					    .ticks(hHist*.05);
					
					svgHist.append("g")
					    .attr("class", "axis")
					    .attr("transform", "translate( 0," + (hHist - histPadding) + ")")
					    .call(xAxisHist);
					
					svgHist.append("g")
					    .attr("class", "axis")
					    .attr("transform", "translate(" +(histPadding)+ ", 0 )")
					    .call(yAxisHist);
					
					

					num = true;
					string= false;
					var minMax;
					minMax = "Minimum " + keyType.key + ": " + keyType.keyMin; 
					var divMin = document.createElement("div");
					divMin.textContent= minMax;
					
					    divMin.style.fontSize = heightOfText + "px";
					divMin.style.position = "relative";
					divMin.style.fontFamily = "sans-serif";
					divMin.style.top="1px";
					if (isListEmpty==null)
					    list.appendChild(divMin);
					
					var divMax = document.createElement("div");
                                        divMax.textContent= minMax;

					divMax.style.fontSize = heightOfText + "px";
                                        divMax.style.position = "relative";
                                        divMax.style.fontFamily = "sans-serif";
                                        divMax.style.top="1px";

					minMax = "Maximum " + keyType.key + ": "  + keyType.keyMax;
					divMax.textContent = minMax;
				        if (isListEmpty==null)
					    list.appendChild(divMax);

				    }
				//if the key definitions are strings
				if (keyType.dataType=="string")
				    {
					var allSame=true;
					if(keyType.numColors<6)
					    {
						var presetColors= ["hsl(54, 100%, 51%)", "hsl(142, 100%, 44%)", "red", "hsl(290, 100%, 39%)", "hsl(28, 100%, 58%)",  "hsl(215, 100%, 40%)"];
					    }

					var typeAndNum;
					var maxNumOfType = 0;
					//sets colors to go with colorObjects. Colors are equally divided among the hue range
					for (j=0; j<keyType.numColors; j++)
					    {
						if(keyType.numColors<6)
						    {
							
							if(keyType.key=="gender"||keyType.key=="sex")
							    {
								if(keyType.colorsList[j].id=="male"||keyType.colorsList[j].id=="man"||keyType.colorsList[j].id=="boy")
								    keyType.colorsList[j].color = "blue";
								else if (keyType.colorsList[j].id=="woman"||keyType.colorsList[j].id=="female"||keyType.colorsList[j].id=="girl")
								    keyType.colorsList[j].color = "fuchsia";
								else 
								    keyType.colorsList[j].color = presetColors[j];
							    }
							else
							    {
								keyType.colorsList[j].color = presetColors[j];
							    }
						    }
						else{
						    //alert("Using interpolator: " + colorInterpolatorA((keyType.numColors/2)));
						    var hueVal = j*280/keyType.numColors;
						    var hueColor =  "hsl(" + (hueVal) + ", 100%, 50%)";
						    keyType.colorsList[j].color =  hueColor;//colorInterpolator(j);
						    //keyType.colorsList[j].color = colorInterpolator(j);
						}

						if (keyType.colorsList[j].numOfType> maxNumOfType)
						    maxNumOfType = keyType.colorsList[j].numOfType;
						
						
						typeAndNum = (keyType.colorsList[j].id )  + "  (" + (keyType.colorsList[j].numOfType) + ")";
						
						//var list = document.getElementsByTagName("div")["list"];
						var tab=document.createElement('table');
						var tbo=document.createElement('tbody');
						var row, cell;

						var divRect = document.createElement("div")
						    divRect.style.width = "30px";
						divRect.style.height = heightOfText + "px";
						divRect.style.background = keyType.colorsList[j].color;
						
						divRect.style.top=  "0px";
						row=document.createElement('tr');
						cell=document.createElement('td');
						cell.appendChild(divRect);
						row.appendChild(cell);
						var divWords = document.createElement("div");
						divWords.textContent= typeAndNum;
						divWords.style.fontSize = heightOfText + "px";
						divWords.style.left= "40px";
						//divWords.style.height = heightOfText + "px";
						divWords.style.fontFamily = "sans-serif";
						divWords.style.top= "0px";
						divWords.style.maxWidth= "200px";
						      

						cell = document.createElement('td');
						cell.appendChild(divWords);
                                                row.appendChild(cell);

						tbo.appendChild(row);
						tab.appendChild(tbo);
						if (isListEmpty== null)
						    list.appendChild(tab);

					    }
					if((keyType.numColors< dataSetLength)&&(keyType.numColors>1))
					    {
						/*var divHist = document.createElement("div");
						  
						  divHist.style.width = "400px";
						  divHist.style.height = "200px";
						  divHist.style.border = "2px solid blue";
						  divHist.setAttribute("id", "histogramScale");


						  document.body.appendChild(divHist);
						*/
						
						var wHist = document.getElementsByTagName("div")["hist"].offsetWidth;
						var hHist = document.getElementsByTagName("div")["hist"].offsetHeight;
						var histPadding = .1*Math.sqrt(hHist*wHist);

						
						
						var yHist = d3.scale.linear()
						    .domain([0, maxNumOfType])
						    .range([(hHist-histPadding), histPadding]);
						
						var xHist = d3.scale.linear()
						    .domain([0, keyType.numColors])
						    .range([histPadding, wHist-histPadding]);
						
						
						var svgHist= d3.select("#hist")
						    .append("svg")
						    .attr("width", wHist)
						    .attr("height", hHist)
						    .attr("id", "histsvg");
						var xScaleData = []
						    keyType.colorsList.forEach(function(s, i){
							    xScaleData[i] = s.id;
							    svgHist.append("rect")
							    .attr("id", "histogramRectangles")
							    .attr("width", function(h) {return (wHist-(2*histPadding))/(keyType.numColors) - 1;})
							    .attr("x", function(h) { 
								    return xHist(i); })
							    .attr("y", function(h) { return yHist(s.numOfType); })
							    .attr("height", function(h) {return hHist - yHist(s.numOfType) - histPadding;})//yHist(h.y); })
							    .attr("fill", function(){ return s.color;} );
							});
						
						
						var yAxisHist = d3.svg.axis()
						    .scale(yHist)
						    .orient("left")
						    .ticks(hHist*.03);
						
						svgHist.append("g")
						    .attr("class", "axis")
						    .attr("transform", "translate(" +(histPadding)+ ", 0 )")
						    .call(yAxisHist);
						
						var xHistOrdinal = d3.scale.ordinal()
						    .domain(xScaleData)
						    .rangeRoundBands([histPadding, wHist-histPadding]);
						
						var xAxisHist = d3.svg.axis()
						    .scale(xHistOrdinal)
						    .orient("bottom")
						    .ticks(wHist*.03);
						
						svgHist.append("g")
						    .attr("class", "x axis")
						    .attr("transform", "translate( 0," + (hHist - histPadding) + ")")
						    .call(xAxisHist);
						
					    }
					
					string = true;
					num=false;
				    }
			    }


		    });

		//goes through the points to plot
		d.forEach(function(point,i){
			//finds the x and y location
			var x = point.x;
			var y = point.y;
			
			//finds the piece of data that is crucial to color coding the graph (i.e. male)
			numCol = point.sample[colorCode];
			//finds the index for the correct key in the colorsList array as defined by colorCode

			var colIndex;
			//DRAWS ALL THE THINGS!!!
			var numOfType= [];
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
					.attr("height", 20);
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
		/*
		  svg.append("text")
		      .attr("class", "text")
		          .attr("id", "keyText")
			      .attr("text-anchor", "front")
			          .attr("x", w*.7+ padding/2)
				      .attr("y", padding/2 +5)
				          .text("Colored By: " + colorCode)
					      .attr("font-family", "sans-serif")
					          .attr("font-size", w/70)
						  .attr("fill", "black");*/
	    };//semi colon
	    //creates the axises
	        
	    $("#selectColorCode").change(function(e) {
		        
		    if ($('#this').attr("exists") == "true"){
			var circlesToRemove = svg.selectAll("circle");
			circlesToRemove.remove();
			
			document.getElementById("list").innerHTML = "";
			document.getElementById("hist").innerHTML = "";
			
			
			drawGraph(d); 

		    }
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
	.text(studyid)
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

 
    //added semicolon
    //reloads the graph on resize
    /*$(window).resize(debounce(function (e) {
    window.location.reload(false);
    }, 250, false));*/

    //Trying to use a brush now!!!!
    /*var brush = d3.svg.brush()
      .on("brushstart", brushstart)
      .on("brush", brush)
      .on("brushed", brushend);

    */

}