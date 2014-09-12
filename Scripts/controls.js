// ----------------------------------------------------------------------
// Controls
// ----------------------------------------------------------------------

function populateSelector() {
    $("#selector-name").select2({
	   minimumInputLength: 2,
	   data:{ results: _.toArray(data.nodes),
			text: function(item) {
			    return item.name + " - " + item.mail; } },
	   formatSelection: function(item) {
		  return item.name + " - " + item.mail; },
	   formatResult: function(item) {
		  return item.name + " - " + item.mail; }
    });

    
    $("#selector-name")
	   .on("change", function(e) {
		  var infoFields =
				["title", "department",
				 "company", "name"];

		  infoFields.forEach(function(i) {
			 $(".controlInfo#" +i).text(e.added[i]);
		  });

		  $(".controlInfo#mail a")
			 .attr("href", "mailto:" + e.added.mail)
			 .text(e.added.mail);
		  
		  currentLinks = getChildrenLinks(e.added);
		  currentNodes = getNodesFromLinks(currentLinks);
		  drawNetwork(currentNodes, currentLinks);});
}



$(function() {
    $( "#dialog-help" ).dialog({
	   autoOpen: false,
	   modal: true,
	   width: "50%"
    });
    
    $( "#button-help" )
	   .button()
	   .click(function() {
		  $( "#dialog-help" ).dialog( "open" );
	   });

    $( "#dialog-data" ).dialog({
	   autoOpen: false,
	   modal: true,
	   width: "30%"
    });
    
    $( "#button-data" )
	   .button()
	   .click(function() {
		  $( "#dialog-data" ).dialog( "open" );
	   });
});
 
	
