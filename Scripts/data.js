// ----------------------------------------------------------------------
// Data
// ----------------------------------------------------------------------
var data = function(){
    // --------------------------------------------------
    // Private Properties
    // --------------------------------------------------
    var linkFile = "data/links.csv";
    var nodeFile = "data/nodes.csv";
    
    // --------------------------------------------------
    // Public Properties
    // --------------------------------------------------
    var pub = {};
    
    pub.links = {};
    pub.nodes = {};

    // --------------------------------------------------
    // Private Function
    // --------------------------------------------------
    function loadNodeData(callback) {
	   d3.csv(nodeFile, function(error, l) {
		  l.forEach(function(node) {
			 node.name = node.displayName;
			 delete(node.displayName);
			 data.nodes[+node.id] = node;
		  });

		  d3.csv(linkFile, function(error, l) {
			 l.forEach(function(link) {
				link.source = data.nodes[+link.supervisor];
				link.target = data.nodes[+link.subordinate];
			 });

			 data.links = l;
			 callback(error);
		  });
	   });
    }

    function onDataLoad() {
	   populateSelector();

	   var initNode = _.findWhere(data.nodes,
    							{name: "Battle, Deborah"});

	   $("#selector-name")
    		  .select2("data", initNode);

	   var infoFields =
			 ["title", "department",
			  "company", "name"];

	   infoFields.forEach(function(i) {
		  $(".controlInfo#" +i).text(initNode[i]);
	   });

	   $(".controlInfo#mail a")
		  .attr("href", "mailto:" + initNode.mail)
		  .text(initNode.mail);

	   currentLinks = getChildrenLinks(initNode);
	   currentNodes = getNodesFromLinks(currentLinks);
	   drawNetwork(currentNodes, currentLinks);
    }

    // --------------------------------------------------
    // Initialization
    // --------------------------------------------------
    var timer;
    $( "#animate" ).button()
	   .click(function () {
		  if ($(this).is(':checked')) 
			 timer = animateGrowth();
		  else 
			 clearInterval(timer);
	   });
    
    queue()
	   .defer(loadNodeData)
	   .await(onDataLoad);

    // --------------------------------------------------
    // Publicize 
    // --------------------------------------------------
    return pub;
}();




