var svg = $("#chart")
  , svg_width = svg.width() + ($(window).width() - $(".container").width())/2 * .9
  , svg_height = 500;

var rectDemo = d3.select("#chart")
    .append("svg:svg")
    .attr("width", svg_width)
    .attr("height", svg_height)
    .on("click", function(){
      d3.select(this).selectAll(".detail").remove();
    });

$.getJSON("/media/static/visualization/scatterplot.json", function(r){
  var total = r.data.length
    , count = 0
    , chart_width = svg_width*.95
    , chart_height = svg_height*.95
    , label_width = svg_width-chart_width
    , label_height = svg_height-chart_height;
  var all = rectDemo.append("svg:g").attr("width", chart_width).attr("height", chart_height).attr("x", label_width).attr("y", label_height);
  r.data.forEach(function(point){
    if(!(point.x < 0.3 && point.y < 0.3)){
      count++;
      all.append("svg:circle")
         .attr("class", "point")
         .attr("r", 4)
         .attr("cx", (point.x) * chart_width + label_width)
         .attr("cy", svg_height-point.y * chart_height - label_height)
         .attr("gene_x", point.pair[0])
         .attr("gene_y", point.pair[1])
         .on("click", function(e){
           rectDemo.selectAll(".detail").remove();
           draw_scatter_plot_for(this);
           d3.event.preventDefault();
           d3.event.stopPropagation();
         })
         .on("mouseover", function(e){
           d3.select(this).attr("r", 10).attr("class", "point hover");
         })
         .on("mouseout", function(){
           d3.select(this).attr("r", 4).attr("class", "point");
         });
    }
  });
  all.append("svg:text").attr("x", label_width).attr("y", 350).attr("dy", "1em").text(""+(total-count)+" points hidden");

  // label for x
  rectDemo.append("svg:text")
      .attr("x", chart_width/2.5)
      .attr("y", chart_height)
      .text("PCC^2 Score");

  // label for y
  rectDemo.append("svg:text")
      .attr("x", -chart_width * .4)
      .attr("y", 20)
      .attr("transform", "rotate(270)")
      .text("MIC Score");
    });

function draw_scatter_plot_for(point){
  var self = d3.select(point)
    , x = parseFloat(self.attr("cx"))
    , y = parseFloat(self.attr("cy"))
    , pair = self.attr("pair")
    , pairwise_width = svg_width * 0.4
    , pairwise_height = svg_height * 0.4
    , radius = 5
    , gene_x = self.attr("gene_x")
    , gene_y = self.attr("gene_y");

  var data = {studyid: "GSE15745", gene_x: gene_x, gene_y: gene_y};

  $.getJSON("/studies/getData", data, function(res){
    var max = d3.max(res.data, function(d){ return Math.max(d.x, d.y); })
      , fudge = pairwise_width * 0.15;
    alert(res.data);
    if((x + pairwise_width + fudge) > svg_width){
      x -= pairwise_width;
    }
    if((y + pairwise_height + fudge) > svg_height){
      y -= pairwise_height;
    }

    var rect = rectDemo.append("svg:g")
                .attr("class", "detail")
                .attr("transform", "translate("+x+","+y+")")
                .attr("width", pairwise_width + fudge)
                .attr("height", pairwise_height + fudge);

    rect.append("svg:rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", pairwise_width + fudge)
        .attr("height", pairwise_height + fudge);

    // label for gene_x
    rect.append("svg:text")
        .attr("x", pairwise_width * .3)
        .attr("y", pairwise_height + fudge * .8)
        .text(gene_x);

    // label for gene_y
    rect.append("svg:text")
        .attr("x", -pairwise_width * .7)
        .attr("y", pairwise_height * .1)
        .attr("transform", "rotate(270)")
        .text(gene_y);

    res.data.forEach(function(point){
      var x = point.x/max * pairwise_width
        , y = pairwise_height - point.y/max * pairwise_height;
      rect.append("svg:circle")
          .attr("class", "pairwise_point")
          .attr("cx", x + fudge/2)
          .attr("cy", y + fudge/2)
          .attr("r", radius)
          .on("mouseover", function(){
            var tooltip = rect.append("svg:g")
                .attr("transform", "translate("+(x+radius*2)+","+(y-radius*2)+")")
                .attr("class", "tip")
                .attr("width", 90)
                .attr("height", 15);
            tooltip.append("svg:rect")
                   .attr("x", 0)
                   .attr("y", 0)
                   .attr("width", 90)
                   .attr("height", 15).attr("style", "fill:yellow");
            tooltip.append("svg:text")
                   .attr("x", 2).attr("y", 13)
                   .text([Math.round(point.x), Math.round(point.y)].join(","))
          })
          .on("mouseout", function(){
            d3.selectAll(".tip").remove();
          });
    });
  });
}
