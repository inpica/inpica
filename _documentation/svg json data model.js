var canvas_data = {
	objects:[
		{
			type:"outerpath",
			dim:{x:12, y:6, r:0, l:10}
		},
		{
			type:"outerpath",
			dim:{x:18, y:2, r:0, l:10}
		},
		{
			type:"outerpath",
			dim:{x:10, y:15, r:90, l:5}
		},
		{
			type:"innerpath",
			dim:{x:10, y:15, r:30, l:10}
		},
		{
			type:"multi",
			dim:{x:20, y:10, r:20}, //dim of bbox
			objects:[
				{
					type:"outerpath",
					dim:{x:2.5, y:0, r:0, l:5}
				},
				{
					type:"outerpath",
					dim:{x:0, y:2.5, r:90, l:5}
				},
				{
					type:"outerarc",
					dim:{x:5, y:2.5, r:0, w:5, h:2.5}
				}
			]
		},
		{
			type:"outerarc",
			dim:{x:30, y:10, r:0, w:4, h:1.3}
		},
		{
			type:"image",
			dim:{x:10, y:10, r:10, w:6, h:3},
			src:"couch.png"
		}
	],
}

var canvas_config = {
	pixelsPerFoot:20,
	id:'canvas-container',
	w:960,
	h:400,
	panx:10,//in FEET
	pany,5//in FEET
}


$(document).ready(function(){

	var c = new canvas(canvas_config);
	c.init();
	c.draw(canvas_data.objects)
	c.select_set();

	$("#info").on("click", function(){
		console.log(canvas_context.focus.transform.attrs)
	});

	$('#zoom').on("click", function(){
		zoomamount = $('#zoomamount').val();
		c.zoom(zoomamount);
	});

	$("#offtransforms").on("click", function(){
		ClearFocus();
	});

	$('#outline').on("click", function(){
		
		pathstring = GenerateAreaPaths(canvas_context.robjects);
		_.each(pathstring, function(p){
			canvas_context.paper.path(p).attr("fill", "green").attr("stroke-width",0).toBack();
		})
	});

	$('#ruler').on("click", function(){
		ruler = new ruler();


		$("#canvas-container").on("mousedown", function(e){
			ruler.init(e.pageX, e.pageY);
	        $("#canvas-container").bind('mousemove', function(e) {
	            ruler.update(e.pageX, e.pageY);
	        });
	    });

	    $("#canvas-container").on("mouseup",function(e) {
	        $(this).unbind('mousemove');
	        console.log(ruler.feetLength());
	    });

	});

});
