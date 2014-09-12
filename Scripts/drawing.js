// ----------------------------------------------------------------------
// Canvas
// ----------------------------------------------------------------------
var Canvas = function(htmlContainer) {
    // --------------------------------------------------
    // Public Properties
    // --------------------------------------------------
    var pub = {};
    
    pub.container = htmlContainer || "body";

    pub.dimensions = {
	   width: 960,
	   height: 800,
	   position: $(pub.container + " " + "svg").offset()
    };

    pub.svg = {
	   base: d3.select(pub.container).append("svg")
		  .attr("width", pub.dimensions.width)
		  .attr("height", pub.dimensions.height)
		  .call(d3.behavior.zoom().on("zoom", onZoom))
    };
	   // Simple zoom by encapsulating in a group and transforming
    pub.svg.transformed = pub.svg.base.append("g");
    
    

    // --------------------------------------------------
    // Private Function
    // --------------------------------------------------
    function onZoom() {
	   pub.svg.transformed.attr("transform",
			  "translate(" + d3.event.translate + ")"
			  + " scale(" + d3.event.scale + ")");
    }

    function updateWindow(){
	   // This actually shouldn't change
	   pub.dimensions.position =
		  $(pub.container + " " + "svg").offset();

	   pub.dimensions.width =
		  $(window).width() - $(".right-sidebar").outerWidth()
		  - $(".left-sidebar").outerWidth() - 20;
	   pub.dimensions.height =
		  $(window).height() - $(".header").outerHeight()
		  - $(".footer").outerHeight() - 20;

	   pub.svg.base
		  .attr("width", pub.dimensions.width)
		  .attr("height", pub.dimensions.height);
    }
    window.onresize = updateWindow;
    // might want to append as oppose to overwrite the event here
    
    updateWindow();
    
    // --------------------------------------------------
    // Public Function
    // --------------------------------------------------
    function remove(container) {
	   pub.svg.base.remove();
    }

    // --------------------------------------------------
    // Publicize 
    // --------------------------------------------------
    return pub;
};
var canvas = Canvas("#svg");

// ----------------------------------------------------------------------
// Drawing
// ----------------------------------------------------------------------
// Encapsulate?
var currentLinks, currentNodes;

var linkColor, nodeColor;

var force = d3.layout.force()
	   .size([canvas.dimensions.width,
			canvas.dimensions.height])
	   .linkDistance(75)
	   .charge(-300)
	   .friction(0.75);

// End Markers
canvas.svg.transformed.append("svg:defs").selectAll("marker")
    .data(["end"])
    .enter().append("svg:marker")
    .attr("id", String)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 20)
    // .attr("refY", -1.5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5");


function drawNetwork(n, l) {
    // Extract the array of nodes from the map by name.
    var nodes = n;

    // Start the force layout.
    force
        .nodes(nodes)
        .links(l)
        .on("tick", tick)
	   .start();


    
    // Create the link lines.
    var link = canvas.svg.transformed.selectAll(".link")
		  .data(l, function(d) {return d.source.name + " - " +
						    d.target.name;});
    
    link.enter().insert("line", ".node")
	   .attr("class", "link")
	   .attr("marker-end", "url(#end)");
    link.exit().remove();

    linkColor = d3.rgb(link.style("stroke"));
    
    // Create the node circles
    var node = canvas.svg.transformed.selectAll("circle.node")
		  .data(nodes, function(d) {return d.name;});
    
    node.enter().append("circle")
	   .attr("r", 8)
	   .attr("cx", function(d) { return d.x; })
	   .attr("cy", function(d) { return d.y; })
	   .attr("class", "node")
	   .on("click", onClick)
	   .on("mouseover", onMouseOver)
	   .on("mouseout", onMouseOut);
    node.exit().remove();

    nodeColor = d3.rgb(node.style("fill"));

    // Create the text
    var text = canvas.svg.transformed.selectAll("text.node")
		  .data(nodes, function(d) {return d.name;});
    
    text.enter().append("text")
    	   .attr("class", "node")
    	   .text(function(d) { return d.name; })
	   .attr("opacity", 0);
    text.exit().remove();
    

    function tick() {
	   link.attr("x1", function(d) { return d.source.x; })
	   	  .attr("y1", function(d) { return d.source.y; })
	   	  .attr("x2", function(d) { return d.target.x; })
	   	  .attr("y2", function(d) { return d.target.y; });

	   node.attr("cx", function(d) { return d.x; })
	   	  .attr("cy", function(d) { return d.y; });
	   text.attr("x", function(d) { return d.x + 15; })
	   	  .attr("y", function(d) { return d.y - 15; });
    }
}

function getChildrenLinks(d, graph) {
    if(_.isUndefined(graph))
	   graph = data.links;
    
    var nodes = _.where(graph, {supervisor: d.id});
    nodes = nodes.concat(_.where(graph, {subordinate: d.id}));    
    return nodes;
}

function getNodesFromLinks(l) {
    var nodes = _.pluck(l, "source");
    nodes = _.union(nodes, _.pluck(l, "target"));
     
    return nodes;
}

function onClick(d) {
    console.log("Clicked");
    
    // Add Node ----------------------------------------
    var thisLinks = getChildrenLinks(d);
    if(thisLinks.length > 0 &
	  _.difference(thisLinks, currentLinks).length > 0) {

	   // Fix closing circular loops not showing children
	   var existing = _.intersection(getNodesFromLinks(thisLinks),
	   						   currentNodes);
	   existing = _.without(existing, d);
	   if(existing.length > 0) {
	   	  existing.forEach(function(x) {
	   		 thisLinks = _.union(thisLinks, getChildrenLinks(x));
	   	  });
	   }

	   // Set Initial Position for new Nodes
	   thisLinks.forEach(function(x) {
		  var size = 10;
		  if(d.id != x.source.id & _.isUndefined(x.source.px)){
			 x.source.px = d.x + size * (Math.random()/2 - 1);		 
			 x.source.py = d.y + size * (Math.random()/2 - 1);
			 x.source.x = x.source.px;
			 x.source.y = x.source.py;	
		  }
		  if(d.id != x.target.id & _.isUndefined(x.target.px)){
			 x.target.px = d.x + size * (Math.random()/2 - 1);
			 x.target.py = d.y + size * (Math.random()/2 - 1);
			 x.target.x = x.target.px;
			 x.target.y = x.target.py;
		  }
	   });
	   
	   currentLinks = _.union(currentLinks, thisLinks);
	   currentNodes = getNodesFromLinks(currentLinks);
	   drawNetwork(currentNodes, currentLinks);
    }
    // Delete Node ------------------------------
    // We only delete nodes that have no children from the node we clicked.
    // Furthermore ALL nodes must meet this criteria (except one, the parent)
    // * As a side affect, a single root with children will always be shown
    // * Once a closed circuit has been shown, one cannot delete any of those
    //	nodes or children
    else {
	   var children = _.without(getNodesFromLinks(thisLinks), d);
	   var parent = _.filter(children, function(x) {
		  return getChildrenLinks(x, currentLinks).length > 1;});

	   if(parent.length == 1 & children.length > 1) {
		  children = _.without(children, parent[0]);
		  children.forEach(function(x) {
			 currentLinks =
				_.difference(currentLinks,
						   getChildrenLinks(x, currentLinks));});
		  currentNodes = getNodesFromLinks(currentLinks);
		  drawNetwork(currentNodes, currentLinks);
	   }
    }
}

function onMouseOver(d) {
    d3.selectAll(".link").filter(function(x){
	   if(x.source == d) {
		  d3.selectAll("text.node")
			 .filter(function(y) {
				return x.target == y;})
			 .transition().duration(250).attr("opacity", 1);
		  return true;
	   }
	   return false;})
	   .transition().duration(250)
	   .style("stroke", "pink");

    d3.selectAll(".link").filter(function(x){
	   if(x.target == d) {
		  d3.selectAll("text.node")
			 .filter(function(y) {
				return x.source == y;})
			 .transition().duration(250).attr("opacity", 1);
		  return true;
	   }
	   return false;})
	   .transition().duration(250)
	   .style("stroke", "lightgreen");
    
    d3.selectAll("text.node").filter(function(x){
	   return x == d;})
	   .transition().duration(250).attr("opacity", 1);
    d3.select(this)
    	   .transition().duration(250)
    	   .style("fill", nodeColor.darker(2));

    var infoFields =
		  ["title", "department",
		   "company", "name"];

    infoFields.forEach(function(i) {
	   $(".controlInfo#" +i).text(d[i]);
    });

    $(".controlInfo#mail a")
	   .attr("href", "mailto:" + d.mail)
	   .text(d.mail);
}

function onMouseOut(d) {
     d3.select(this)
    	   .transition().duration(250)
    	   .style("fill", nodeColor);
    d3.selectAll("text.node").transition().duration(250).attr("opacity", 0);
    d3.selectAll(".link").transition().duration(250).style("stroke", linkColor);
}



function animateGrowth() {
    function animate() {
	   var i = _.random(0, currentNodes.length);
	   onClick(currentNodes[i]);
    }
    
    return setInterval(animate, 1000);
}

