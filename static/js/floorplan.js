var c;//canvas
var activeFurnishing = null;

var canvas_config = {
	pixelsPerFoot:floorplan.pixelsPerFoot,
	id:'main-canvas',
	w:4000,
	h:2250,
	pan:floorplan.pan,//css left and top values of canvas
	panOffset:floorplan.panOffset,//additional css left and top values of canvas that are not stored in db. Used to provide margins on canvas
	dropPoint:floorplan.dropPoint,//top left point where all objects are dropped
	wrapperPosition:{x:0, y:100}//css left and top of wrapper. Used for ruler
};

$(document).ready(function(){

	//init and draw canvas
	c = new canvas(canvas_config);
	c.init();
	if(layout_data.map){c.addMap(layout_data.map)};
	c.addObjects(layout_data.objects, layout_data.isEditable, false);
	if(!ViewDefaultFurnishing()){//Views the default furnshing. If none found, then draw canvas.
		c.draw();
		c.panselect_set();
	}


	//Toolbar Controls/////////////////////////////////////////////////////////////////
	$('#zoom').slider({
		orientation:"vertical",
		value:floorplan.pixelsPerFoot,
		min:5,
		max:40,
		step:5,
		slide: function(event, ui){
			c.zoom(ui.value);
		}
	});

	$("#clear-furnishing").on("click", function(){
		c.furnishing_clear();
		activeFurnishing = null;
		$('.furnishing-list .furnishing').attr("active", 0);
		ResetAddFurnishing_Title();
	});

	$("#undo-changes").on("click", function(){
		if(activeFurnishing != null){
			ViewFurnishing(activeFurnishing.id);
			ResetAddFurnishing_Title();
		};
	});
	////////////////////////////////////////////////////////////////////////////////////////////
	


	//Picker////////////////////////////////////////////////////////////////////////////////////
	$("#picker-tabs .tab").on("click", function(){
		$("#picker-tabs .tab").attr("active", 0);
		$(this).attr("active", 1);
		$("#picker-wrapper .picker").hide().filter("#"+$(this).attr("ref")).show();
	});

	$("#picker-tabs .tab[active='1']").trigger("click");

	//adding objects to canvas - drag/drop
	$('#layout-picker .object, #furniture-picker .list .object').draggable({
		revert:'invalid',
		helper:"clone",
		cursor:"move",
	});

	$("#main-canvas").droppable({
		drop: function(e, ui){
			var isFurniture = ui.draggable.attr("isFurniture") ? true : false
			AddObjectToCanvas(ui.draggable, isFurniture);
		}
	});

	//adding objects to canvas - click
	$('#layout-picker .object, #furniture-picker .list .object').on("click", function(){
		object = $(this);
		var isFurniture = object.attr("isFurniture") ? true : false
		AddObjectToCanvas(object, isFurniture);
	});

	$("#map-upload-control").on("click", function(){
		$("#map-uploader").show();
	});

	$("#map-remove-control").on("click", function(){
		$.ajax({
			type:"POST",
			url:"/floorplan/map-remove/"+floorplan.id,
			success:function(){
				c.removeMap();
				$("#map-remove-control").hide();
			}
		})
	});

	$("#layout-picker .filter .search-filter").on("keyup", function(){
		var search_query = $(this).val().toLowerCase().replace(/^\s+|\s+$/g, '').replace(" ", "|");
		var objects_list = $("#layout-picker .list .object");
		PickerFilter(search_query, objects_list, "search")
	});

	$("#furniture-picker .filter .search-filter").on("keyup", function(){
		var search_query = $(this).val().toLowerCase().replace(/^\s+|\s+$/g, '').replace(" ", "|");
		var objects_list = $("#furniture-picker .list .object");
		PickerFilter(search_query, objects_list, "search")
	});

	$("#furniture-picker .filter .category-filter").on("change", function(){
		var search_query = $(this).val().toLowerCase();
		var objects_list = $("#furniture-picker .list .object");
		if(search_query == "all"){
			objects_list.attr("category-filter", 1);
		}else{
			PickerFilter(search_query, objects_list, "category");
		}
		
	});

	$("#add-furnishing-btn").on("click", function(){
		if($(this).attr("active") == "1"){
			$("#add-furnishing").hide();
			$(this).attr("active", 0).find(".icon").removeClass().addClass("icon-chevron-down icon");
		} else{
			$("#add-furnishing").show();
			$(this).attr("active", 1).find(".icon").removeClass().addClass("icon-chevron-up icon");;
		}
	})
	////////////////////////////////////////////////////////////////////////////////////////////////////////////


	//Main Canvas Events/////////////////////////////////////////////////////////////////////////////////////////
	$("#main-canvas").on("layoutModified", function(){
		$.ajax({
			type:"POST",
			url:'/floorplan/save/layout/'+floorplan.id,
			contentType: 'application/json',
			data:JSON.stringify(c.convertToData_layout())
		});
	});

	$("#main-canvas").on("furnitureModified", function(){
		ShowAddFurnishing_Title();
	});

	$("#main-canvas").on("focusSet", function(){
		$("#prop-wrapper").empty().css({right:"-100px", display:"block", opacity:0}).append(c.focus.prop()).animate({right:"50px", opacity:1}, 200);
	});

	$("#main-canvas").on("focusClear", function(){
		$("#prop-wrapper").hide();
	});
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////


	//Prop///////////////////////////////////////////////////////////////////////////////////////////////////////
	$("#prop-wrapper").on("click", ".controls .remove", function(){
		c.focus_remove();
	});

	$("#prop-wrapper").on("click", ".controls .apply", function(){
		var newDim = {};
		switch($(this).parents(".prop").attr("type")){
			case "outerpath":
			case "innerpath":
				newDim = {
					l: FeetInchToMeasure($("#prop-wrapper .prop .measure .feet").val(), $("#prop-wrapper .prop .measure .inches").val())
				}
				break;
			case "outerarc":
			case "image":
				newDim = {
					w: FeetInchToMeasure($("#prop-wrapper .prop .w .feet").val(), $("#prop-wrapper .prop .w .inches").val()),
					h: 	FeetInchToMeasure($("#prop-wrapper .prop .h .feet").val(), $("#prop-wrapper .prop .h .inches").val()),
				}
		};
		c.focus.updateDim(newDim);
		c.focus.redraw();
		c.focus.click_set();
		c.focus_set(c.focus);
	});

	$("#prop-wrapper").on("click", ".closeprop", function(){
		c.focus_clear();
	});

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	

	$("#submit-furnishing").on("click", SubmitFurnishing);


});//document.ready

function ResetAddFurnishing(){
	$("#add-furnishing .comment").val('');
	ResetAddFurnishing_Title();
};

function ResetAddFurnishing_Title(){
	$("#add-furnishing .title").val('').hide();
	$("#add-furnishing .instructions").show("fast");
	$("#add-furnishing-btn .text").text("Add Comment");	
};

function ShowAddFurnishing_Title(){
	$("#add-furnishing-btn .text").text("Add Comment + Save Furnishing");
	$("#add-furnishing .title").show("fast");
	$("#add-furnishing .instructions").hide();	
};

function SubmitFurnishing(){

	submitFurnishing = $('#submit-furnishing').off("click");

	var submitData = {
		title:$("#add-furnishing .title").val(),
		comment:$("#add-furnishing .comment").val(),
		objects:c.convertToData_furnishing(),
	}
	$.ajax({
		type:"POST",
		url:'/floorplan/save/furnishing/'+floorplan.id,
		contentType: 'application/json',
		data:JSON.stringify(submitData),
		success:function(data){
			var list = floorplan.isOwner ? $("#owner-furnishing-list") : $("#user-furnishing-list")
			list.prepend(data);
			var furnishingid = $(data).attr("furnishingid");
			furnishing_data.push({
				id:furnishingid,
				objects:submitData.objects,
				isDefault:false,
				isEditable:true
			});
			console.log(furnishingid);
			ResetAddFurnishing();
			ViewFurnishing(furnishingid);
			submitFurnishing.on("click", SubmitFurnishing)
		}
	});
};

function ViewDefaultFurnishing(){//returns true if found, false otherwise
	var fd = _.find(furnishing_data, function(f_d){return f_d.isDefault == true});
	if(fd){
		ViewFurnishing(fd.id);
		return true;
	};
	return false;
};

function ViewFurnishing(id){

	ResetAddFurnishing_Title();

	$('.furnishing-list .furnishing').attr("active", 0);
	$('.furnishing-list .furnishing[furnishingid="'+id+'"]').attr("active", 1);

	activeFurnishing = _.find(furnishing_data, function(f_d){return f_d.id == id});
	c.furnishing_clear();
	if(activeFurnishing){
		c.addObjects(activeFurnishing.objects, activeFurnishing.isEditable, true);
	}
	c.draw();
	c.panselect_clear();
	c.panselect_set();
};

function DeleteFurnishing(id){
	if(activeFurnishing && activeFurnishing.id == id){
		c.furnishing_clear();
	};
	$.ajax({
		type:"POST",
		url:"/floorplan/delete/furnishing/"+id,
		success:function(){
			$('.furnishing-list .furnishing[furnishingid="'+id+'"]').remove();
		}
	})
};

function SetDefaultFurnishing(id){
	$("#furnishings .furnishing").attr("default", 0).filter("[furnishingid='"+id+"']").attr("default", 1);

	$.ajax({
		type:"POST",
		url:"/floorplan/set-default/furnishing/"+id,
	});
};

function PickerFilter(searchQuery, objectsList, filterType){
	var filterSetAttr = filterType + "-filter";
	var filterMatchAttr = filterType + "-filter-match";
	if(!searchQuery){
		objectsList.attr(filterSetAttr, 1);
	}else{
		objectsList.attr(filterSetAttr, 0);
		var re = new RegExp('.*('+searchQuery+').*','i');
		objectsList.each(function(){
			if(re.test($(this).attr(filterMatchAttr))){
				$(this).attr(filterSetAttr, 1);
			}
		});
	};
};


function AddObjectToCanvas(objectelement, isFurniture){

	switch(objectelement.attr("type")){
		case "outerpath":
		case "innerpath":
			c.addObjects([{
				type:objectelement.attr("type"),
				dim:{x:5, y:5, r:0, l:objectelement.attr("l")}
			}], true, false);
			break;
		case "outerarc":
			c.addObjects([{
				type:objectelement.attr("type"),
				dim:{x:5, y:5, r:0, w:objectelement.attr("w"), h:objectelement.attr("h")}
			}], true, false);
			break;
		case "image":
			c.addObjects([{
				type:objectelement.attr("type"),
				dim:{x:5, y:5, r:0, w:objectelement.attr("w"), h:objectelement.attr("h")},
				src:objectelement.attr("staticurl")+objectelement.attr("path"),
				title:objectelement.attr("title"),
				mid: objectelement.attr("mid") ? objectelement.attr("mid") : null
			}], true, isFurniture);
			break;
	};
	c.draw();
	c.panselect_last();
	c.focus_last();
	isFurniture ? $("#main-canvas").trigger("furnitureModified") : $("#main-canvas").trigger("layoutModified")
};


//Map Uploader///////////////////////////////////////////////////////////////////////////////////////////////////////

var mapc = null;
var map_canvas_width = 700;
var map_canvas_height = null;
var mapfileuploaded = false;

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

    	var map_feet = $("#map-uploader .feet").val();
    	var map_inches = $("#map-uploader .inches").val();
    	if(!mapfileuploaded || map_feet == undefined || map_inches == undefined || !mapc.ruler.pixelLength() || FeetInchToMeasure(map_feet, map_inches) <= 0){
    		alert("You must upload a floorplan image, draw a line on the image, and enter the feet/inches specifying the length of that line in relation to the floorplan.");
    		return;
    	}
    	var rmeasure = FeetInchToMeasure(map_feet, map_inches);

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
    	});

    	$('#map-uploader-cancel').trigger("click");
    });

	$('#map-uploader-cancel').on("click", function(){
		$("#map-uploader").hide();
	});

});//document.ready

function mapFileOnload(e) {
    var img = new Image;
    img.src = e.target.result;
    mapfileuploaded = true;

    map_canvas_height = (map_canvas_width*img.height)/img.width;
    mapc = new canvas({
        pixelsPerFoot: 10,
        w:map_canvas_width,
        h:map_canvas_height,
        pan:{x:0, y:0},
        panOffset:{x:0, y:0},
        dropPoint:{x:0, y:0},
        wrapperPosition:{x:470, y:385},
        id:"map-uploader-canvas"
    });

    mapc.init();
    mapc.addObjects([{type:"image",src:e.target.result, dim:{x:0,y:0,r:0,w:map_canvas_width/10, h:map_canvas_height/10}}], true, false)
    mapc.draw();
    mapc.ruler_set();

};

function MapUploadHandler(data){
	$("#map-remove-control").show();
    c.addMap(data);
    
};


//Idea Pic///////////////////////////////////////////////////////////////////////////////////////////////////////

$(document).ready(function(){

	$('#ideapic-file').change(function(e){
		var file = e.target.files[0],
            imageType = /image.*/;

        if (!file.type.match(imageType)){
            alert("This is not an image file!");
        };

        var reader = new FileReader();
        reader.onload = ideaPicFileOnload;
        reader.readAsDataURL(file);  
	});

	function ideaPicFileOnload(e) {
    	var img = new Image;
    	img.src = e.target.result;

    	formdata = new FormData()
    	formdata.append('file',$("#ideapic-file")[0].files[0])

    	$.ajax({
    		type:"POST",
    		url:"/floorplan/ideapic-upload/"+floorplan.id,
    		data:formdata,
    		processData: false,
  			contentType: false,
  			success:IdeapicUploadHandler
    	});

	};

});

function IdeapicUploadHandler(data){
	$("#ideapic-list").append(data);
};