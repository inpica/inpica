var mapc = null;
var map_canvas_width = 700;
var map_canvas_height = null;

$(document).ready(function(){

	$('#map-file').change(function(e){
		var file = e.target.files[0],
            imageType = /image.*/;

        if (!file.type.match(imageType)){
            alert("This is not an image file!");
        };

        var reader = new FileReader();
        reader.onload = mapFileOnload;
        reader.readAsDataURL(file);  
	});

    

    $("#map-uploader-submit").on("click", function(){
    	//TODO: Check if file uploaded and ruler measurements are in
    	var rfeet = parseInt($("#map-uploader .feet").val());
    	var rinches = parseInt($("#map-uploader .inches").val());
    	var rmeasure = rfeet + (rinches/12);

    	var rangle = mapc.ruler.angle();

    	if(rangle%180 != 0){//use the y potion of ruler
    		var ymeasure = rmeasure*Math.sin(Raphael.rad(rangle));
    		var yratio = map_canvas_height/mapc.ruler.pixelLengthY();
    		var mapymeasure = Math.round(yratio*ymeasure*1000)/1000;
    		var xmap_ymap_ratio = map_canvas_width/map_canvas_height;
    		var mapxmeasure = xmap_ymap_ratio*mapymeasure;
    	}else{//use the x portion of the ruler
    		var xmeasure = rmeasure*Math.cos(Raphael.rad(mapc.ruler.angle()));
    		var xratio = map_canvas_width/mapc.ruler.pixelLengthX();
    		var mapxmeasure = Math.round(xratio*xmeasure*1000)/1000;
    		var ymap_xmap_ratio = map_canvas_height/map_canvas_width;
    		var mapymeasure = ymap_xmap_ratio*mapxmeasure;
    	};

    	formdata = new FormData()
    	formdata.append('mapxFeet', mapxmeasure)
    	formdata.append('mapyFeet', mapymeasure)
    	formdata.append('file',$("#map-file")[0].files[0])

    	$.ajax({
    		type:"POST",
    		url:"/floorplan/map-upload/"+floorplan.id,
    		data:formdata,
    		processData: false,
  			contentType: false,
  			success:MapUploadHandler
    	})
    });

});//document.ready

function mapFileOnload(e) {
    var img = new Image;
    img.src = e.target.result;

    map_canvas_height = (map_canvas_width*img.height)/img.width;
    mapc = new canvas({
        pixelsPerFoot: 10,
        w:map_canvas_width,
        h:map_canvas_height,
        panx:0,
        pany:0,
        xoffset:0,
        yoffset:525,
        id:"map-uploader-canvas"
    });

    mapc.init();
    mapc.addObjects([{type:"image",src:e.target.result, dim:{x:0,y:0,r:0,w:map_canvas_width/10, h:map_canvas_height/10}}], true, false)
    mapc.draw();
    mapc.ruler_set();

};

function MapUploadHandler(data){
    c.addMap(data);
};