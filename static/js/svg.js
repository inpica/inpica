function canvas(config){
	//config = {pixelsPerFoot, w, h, id}
	this.config = config;
	this.paper = null;
	this.pixelsPerFoot = config.pixelsPerFoot;
	this.id = config.id;
	this.w = config.w;
	this.h = config.h;
	this.pan = config.pan;
	this.panOffset = config.panOffset;
	this.dropPoint = config.dropPoint;
	this.wrapperPosition = config.wrapperPosition;//matter for ruler
	this.focus = null;
	this.robjects = [];
	this.ruler = null;
	this.map = null; //this is a robject but specifically for the map
	this.furnitureModified = false;
	this.init = function(){
		this.paper = new Raphael(document.getElementById(this.id), this.w, this.h);
		$("#" + this.id + ' svg').css({"left":this.pan.x+this.panOffset.x+"px", "top":this.pan.y+this.panOffset.y+"px"});
		this.paper.customAttributes.arc = function (xloc, yloc, value, total, R) {
		    var alpha = 360 / total * value,
		        a = (90 - alpha) * Math.PI / 180,
		        x = xloc + R * Math.cos(a),
		        y = yloc - R * Math.sin(a),
		        path;
		    if (total == value) {
		        path = [
		            ["M", xloc, yloc - R],
		            ["A", R, R, 0, 1, 1, xloc - 0.01, yloc - R]
		        ];
		    } else {
		        path = [
		            ["M", xloc, yloc - R],
		            ["A", R, R, 0, +(alpha > 180), 1, x, y]
		        ];
		    }
		    return {
		        path: path
		    };
		};
	};

	this.addObjects = function(objects, isEditable, isFurniture){
		var cvs = this;
		var rs = this.robjects;
		var clonedObjects = $.extend(true, {}, objects);//do not want to pass reference
		_.each(clonedObjects, function(object){
			object.canvas = cvs;
			robject = ObjectToRobject(object);
			robject.isEditable = isEditable;
			robject.isFurniture = isFurniture;
			rs.push(robject);
		});
	};

	this.addMap = function(map){
		this.removeMap();
		map.canvas = this;
		robject = ObjectToRobject(map);
		robject.isEditable = false;
		robject.isFurniture = false;
		this.map = robject;
		this.map.draw();
		this.map.toBack();
	};

	this.removeMap = function(){
		if(this.map != null){this.map.remove()};
	};

	this.furniture = function(){
		return _.filter(this.robjects, function(robject){return robject.isFurniture })
	};

	this.layout = function(){
		return _.filter(this.robjects, function(robject){return !robject.isFurniture })
	};

	this.removeFurnishing = function(){
		_.each(this.furniture(), function(furniture){
			furniture.remove();
		});
	};

	this.select_set = function(){
		var cvs = this;
		var p = this.paper;
		_.each(this.robjects, function(robject){
			robject.click_set();
		})
		$('#'+cvs.id).on("click", function(e){
			if (!p.getElementByPoint(e.clientX, e.clientY)){
				cvs.focus_clear();				
			};
		});
	};

	this.panselect_set = function(){
		var cvs = this;
		var cvselement = $('#'+cvs.id)

		_.each(this.robjects, function(robject){
			robject.click_set();
		});

		cvselement.on("mousedown", function(edown){
			var temp = {x:edown.clientX, y:edown.clientY}

			var downon = cvs.paper.getElementByPoint(edown.clientX, edown.clientY);

			if(downon){
				if(cvs.map && cvs.map.id == downon.id){
					downon = false;
				};
			};

			if (!downon){
				cvselement.on("mousemove", function(emove){
					cvs.panCanvas(emove.clientX - temp.x, emove.clientY - temp.y);
					temp.x = emove.clientX;
					temp.y = emove.clientY;
				})
				.on("mouseup", function(){
					cvselement.off("mousemove").off("mouseup");
					cvs.focus_clear();
				});
			};
		});
	};

	this.panselect_last = function(){
		//this is used when a user adds an object to the canvas from the picker. probably better way to do it but this is easiest.
		_.last(this.robjects).click_set();
	};

	this.panselect_clear = function(){
		_.each(this.robjects, function(robject){
			robject.click_clear();
		});
		$('#'+this.id).off("mousedown");
	};

	this.panCanvas = function(xpix, ypix){
		this.pan.x += xpix;
		this.pan.y += ypix;
		$("#" + this.id + ' svg').css({"left":this.pan.x+this.panOffset.x+"px", "top":this.pan.y+this.panOffset.y+"px"});
	};

	this.focus_clear = function(){
		if (this.focus != null){
			this.focus.focus_clear();
			if(this.focus.isFurniture && this.focus.modified){
				this.furnitureModified = true;
				$("#"+this.id).trigger("furnitureModified");
			}else if(this.focus.modified && this.focus.isEditable){
				$("#"+this.id).trigger("layoutModified");
			}
			this.focus = null;
			$("#"+this.id).trigger("focusClear");
		};
	};

	this.focus_set = function(robject){
		var isNewFocus = (this.focus == null) || (this.focus.id != robject.id);
		if(this.focus && this.focus.id != robject.id){
			this.focus_clear();
		}
		this.focus = robject;
		this.focus.focus();
		if(isNewFocus){
			$("#"+this.id).trigger("focusSet");
		}
	};

	this.focus_last = function(){
		this.focus_set(_.last(this.robjects));
	};

	this.focus_remove = function(){
		if(this.focus != null){
			var focusid = this.focus.id;
			this.focus.remove();
			this.robjects = _.reject(this.robjects, function(r){ return r.id == focusid});
			this.focus_clear();
			$("#"+this.id).trigger("layoutModified");
		};
	};

	this.draw = function(){
		var cvs = this;
		_.each(cvs.robjects, function(robject){
			if(robject.element == null){
				robject.draw();
				if(robject.isFurniture){
					robject.toFront();
				}else{
					robject.toBack();
				};
			};
		});
	};

	this.zoom = function(pixelsPerFoot){
		this.focus_clear();
		this.pixelsPerFoot = pixelsPerFoot;
		_.each(this.robjects, function(robject){
			robject.redraw();
			robject.click_set();
		});
		if(this.map != null){
			this.map.redraw().toBack();	
		};
	};

	this.ruler_set = function(){
		var cvs = this;
		if(this.ruler != null){this.ruler.remove();};
		this.ruler = new ruler({canvas:cvs});

		$("#"+cvs.id).on("mousedown", function(e){
			cvs.ruler.start(e.pageX, e.pageY);
	        $("#"+cvs.id).on('mousemove', function(e) {
	            cvs.ruler.end(e.pageX, e.pageY);
	        });
	    });

	    $("#"+cvs.id).on("mouseup",function(e) {
	        $(this).off('mousemove');
	    });
	};

	this.ruler_clear = function(){
		if(this.ruler != null){
			this.ruler.remove();
		}
		this.ruler = null;
		$("#"+this.id).off("mouseup").off("mousedown");
	};

	this.feetToPixel = function(feet){
		return this.pixelsPerFoot * feet;
	};

	this.pixelToFeet = function(pixel){
		return pixel/this.pixelsPerFoot;
	};

	this.convertToData_layout = function(){
		var data = [];
		_.each(this.layout(), function(layout){
			data.push(layout.convertToData());
		});
		return data;
	};

	this.convertToData_furnishing = function(){
		var data = [];
		_.each(this.furniture(), function(furniture){
			data.push(furniture.convertToData());
		});
		return data;
	};

	this.furnishing_clear = function(){
		this.furnitureModified = false;
		this.focus_clear();
		_.each(this.furniture(), function(furniture){
			furniture.remove();
		});
		this.robjects = this.layout();
	};
};

function outerpath(data){
	this.id = null;
	this.canvas = data.canvas;
	this.originalData = data;
	this.type = "outerpath";
	this.dim = data.dim;
	this.element = null; //Raphael Element
	this.transform = null;
	this.isEditable = null;
	this.modified = false;
	this.title = "Exterior Wall";
	this.pixelLength = function(){return this.element.getTotalLength();};
	this.startPoint = function(){return Raphael.getPointAtLength(this.mapedPath(), 0);};
	this.endPoint = function(){return Raphael.getPointAtLength(this.mapedPath(), 9999);};
	this.mapedPath = function(){return Raphael.mapPath(this.element.attr("path"), this.element.matrix);};
	this.reverseMapedPath = function(){
		var startPoint = this.startPoint();
		var endPoint = this.endPoint();
		return Raphael.format("M{0},{1}L{2},{3}", endPoint.x, endPoint.y, startPoint.x, startPoint.y);
	};

	this.draw = function(){

		var pathStart = {
			x:this.canvas.dropPoint.x - this.canvas.feetToPixel(this.dim.l)/2,
			y:this.canvas.dropPoint.y
		};
		var pathEnd = {
			x:this.canvas.dropPoint.x + this.canvas.feetToPixel(this.dim.l)/2,
			y:this.canvas.dropPoint.y	
		}

		op = this.canvas.paper.path('M'+pathStart.x+','+pathStart.y+'L'+pathEnd.x+','+pathEnd.y).attr("stroke-width",this.canvas.pixelsPerFoot/2).attr("stroke", "#333");
		ft = this.canvas.paper.freeTransform(op, {keepRatio:true, scale:false, drag:true, draw:['bbox'], snap:{rotate:5}, distance:1.3, attrs:{fill:"red", stroke:"red"}}).hideHandles();
		ft.attrs.rotate = this.dim.r;
		ft.attrs.translate = {
			x: this.canvas.feetToPixel(this.dim.x),
			y: this.canvas.feetToPixel(this.dim.y)
		}
		ft.apply();
		
		this.transform = ft;
		this.element = op;
		this.element.data("robject",this);
		this.id = op.id;

	};

	this.remove = function(){
		if(this.element != null){
			this.element.remove();
		};
	};

	this.redraw = function(){
		this.transform.hideHandles();
		this.element.remove();
		this.draw();
	};

	this.toFront = function(){
		this.element.toFront();
	};

	this.toBack = function(){
		this.element.toBack();
		if(this.canvas.map != null){this.canvas.map.toBack()};
	};

	this.click_set = function(){
		this.element.click(function(){
			var robject = this.data("robject");
			robject.canvas.focus_set(robject);
		});
	};

	this.click_clear = function(){
		this.element.unclick();
	};

	this.focus = function(){
		//TODO - additional things that happen when object put in focus
		this.ft();
		this.element.attr({"stroke":"#ab6565"});
	};

	this.focus_clear = function(){
		//TODO - additional things that happen when object put out of focus
		this.ft_clear();
		this.element.attr({"stroke":"#333"});
	};

	this.ft = function(){
		this.transform.showHandles();
	};

	this.ft_clear = function(){
		var focus = this;
		var focus_length = this.pixelLength();
		var focus_id = this.id;
		var focus_startPoint = this.startPoint();
		var focus_endPoint = this.endPoint();
		_.each(this.canvas.robjects, function(robject){
			if((robject.type == "outerpath" && robject.id != focus_id) || robject.type == "outerarc"){
				var intersect = Raphael.pathIntersection(Raphael.mapPath(focus.element.attr("path"), focus.element.matrix), Raphael.mapPath(robject.element.attr("path"), robject.element.matrix));
				if(intersect[0]){
					var snapPoint;
					if(DistanceBetween(intersect[0], robject.startPoint()) < robject.pixelLength()/2){
						snapPoint = robject.startPoint();
					}else{
						snapPoint = robject.endPoint();
					}

					if(DistanceBetween(intersect[0], focus_endPoint) < focus_length/2){
						//closer to endpoint
						focus.transform.attrs.translate.x += snapPoint.x - focus_endPoint.x;
						focus.transform.attrs.translate.y += snapPoint.y - focus_endPoint.y;
					} else{
						//closer to startpoint
						focus.transform.attrs.translate.x += snapPoint.x - focus_startPoint.x;
						focus.transform.attrs.translate.y += snapPoint.y - focus_startPoint.y;
					}
					focus.transform.apply();
				};
			};
		});

		this.updateDim({
			x:this.canvas.pixelToFeet(this.transform.attrs.translate.x),
			y:this.canvas.pixelToFeet(this.transform.attrs.translate.y),
			r:this.transform.attrs.rotate
		});
		focus.transform.hideHandles();
	};

	this.updateDim = function(params){
		var uX = params.x != undefined ? params.x : this.dim.x;
		var uY = params.y != undefined ? params.y : this.dim.y;
		var uR = params.r != undefined ? params.r : this.dim.r;
		var uL = params.l != undefined ? params.l : this.dim.l;
		if(uX != this.dim.x){this.modified = true; this.dim.x = uX};
		if(uY != this.dim.y){this.modified = true; this.dim.y = uY};
		if(uR != this.dim.r){this.modified = true; this.dim.r = uR};
		if(uL != this.dim.l){this.modified = true; this.dim.l = uL};
	};

	this.convertToData = function(){
		return {
			type:"outerpath",
			dim:this.dim
		}
	};

	this.prop = function(){
		var template = '<div class="prop" robjectid="<%= r.id %>" type="outerpath"> \
			<div class="close">CLOSE X</div> \
			<div class="prop-body"> \
				<div class="title"><h1><%= r.title %></h1></div> \
				<div class="measure"> \
					<h2>Length</h2> \
					<div class="measure-group"> \
						<label>Feet</label><input type="number" class="feet" value="<% print(MeasureToFeetInch(r.dim.l).feet) %>" <% if(!r.isEditable){ %>disabled="disabled"<%}%> /> \
					</div> \
					<div class="measure-group"> \
						<label>Inches</label><input type="number" class="inches" value="<% print(MeasureToFeetInch(r.dim.l).inches) %>" <% if(!r.isEditable){ %>disabled="disabled"<%}%> /> \
					</div> \
				</div> \
				<% if(r.isEditable){ %> \
					<div class="controls"> \
						<input type="button" class="remove" value="Remove" /> \
						<input type="button" class="apply" value="Apply" /> \
					</div> \
				<%}%> \
				</div> \
		</div>';
		return $(_.template(template)({r:this}));
	};
};

function innerpath(data){
	this.id = null;
	this.canvas = data.canvas;
	this.originalData = data;
	this.type = "innerpath";
	this.dim = data.dim;
	this.element = null; //Raphael Element
	this.transform = null;
	this.isEditable = null;
	this.modified = false;
	this.title = "Interior Wall";
	this.pixelLength = function(){return this.element.getTotalLength();};
	this.startPoint = function(){return Raphael.getPointAtLength(Raphael.mapPath(this.element.attr("path"), this.element.matrix), 0);};
	this.endPoint = function(){return Raphael.getPointAtLength(Raphael.mapPath(this.element.attr("path"), this.element.matrix), 9999);};

	this.draw = function(){

		var pathStart = {
			x:this.canvas.dropPoint.x - this.canvas.feetToPixel(this.dim.l)/2,
			y:this.canvas.dropPoint.y
		};
		var pathEnd = {
			x:this.canvas.dropPoint.x + this.canvas.feetToPixel(this.dim.l)/2,
			y:this.canvas.dropPoint.y	
		}

		ip = this.canvas.paper.path('M'+pathStart.x+','+pathStart.y+'L'+pathEnd.x+','+pathEnd.y).attr("stroke-width",this.canvas.pixelsPerFoot/2.5).attr("stroke", "#555");
		ft = this.canvas.paper.freeTransform(ip, {keepRatio:true, scale:false, drag:true, draw:['bbox'], snap:{rotate:5}, distance:1.3, attrs:{fill:"red", stroke:"red"}}).hideHandles();
		ft.attrs.rotate = this.dim.r;
		ft.attrs.translate = {
			x: this.canvas.feetToPixel(this.dim.x),
			y: this.canvas.feetToPixel(this.dim.y)
		}
		ft.apply();

		this.transform = ft;
		this.element = ip;
		this.element.data("robject",this);
		this.id = ip.id;
	};

	this.remove = function(){
		if(this.element != null){
			this.element.remove();
		};
	};

	this.redraw = function(){
		this.transform.hideHandles();
		this.element.remove();
		this.draw();
	};

	this.toFront = function(){
		this.element.toFront();
	};

	this.toBack = function(){
		this.element.toBack();
		if(this.canvas.map != null){this.canvas.map.toBack()};

	};

	this.click_set = function(){
		this.element.click(function(){
			var robject = this.data("robject");
			robject.canvas.focus_set(robject);
		});
	};

	this.click_clear = function(){
		this.element.unclick();
	};

	this.focus = function(){
		//TODO - additional things that happen when object put in focus
		this.ft();
		this.element.attr({"stroke":"#ab6565"});
	};

	this.focus_clear = function(){
		//TODO - additional things that happen when object put out of focus
		this.ft_clear();
		this.element.attr({"stroke":"#555"});
	};

	this.ft = function(){
		this.transform.showHandles();
	};

	this.ft_clear = function(){
		focus = this;
		focus_length = this.pixelLength();
		focus_id = this.id;
		focus_startPoint = this.startPoint();
		focus_endPoint = this.endPoint();
		_.each(this.canvas.robjects, function(robject){
			if(robject.type == "outerpath" || robject.type == "outerarc"){
				var intersect = Raphael.pathIntersection(Raphael.mapPath(focus.element.attr("path"), focus.element.matrix), Raphael.mapPath(robject.element.attr("path"), robject.element.matrix));
				if(intersect[0]){


					var snapPoint = intersect[0];

					if(DistanceBetween(intersect[0], focus_endPoint) < focus_length/2){
						//closer to endpoint
						focus.transform.attrs.translate.x += snapPoint.x - focus_endPoint.x;
						focus.transform.attrs.translate.y += snapPoint.y - focus_endPoint.y;
					} else{
						//closer to startpoint
						focus.transform.attrs.translate.x += snapPoint.x - focus_startPoint.x;
						focus.transform.attrs.translate.y += snapPoint.y - focus_startPoint.y;
					}

					focus.transform.apply();
				};
			};
		});
		
		this.updateDim({
			x:this.canvas.pixelToFeet(this.transform.attrs.translate.x),
			y:this.canvas.pixelToFeet(this.transform.attrs.translate.y),
			r:this.transform.attrs.rotate
		});
		focus.transform.hideHandles();
	};

	this.updateDim = function(params){
		var uX = params.x != undefined ? params.x : this.dim.x;
		var uY = params.y != undefined ? params.y : this.dim.y;
		var uR = params.r != undefined ? params.r : this.dim.r;
		var uL = params.l != undefined ? params.l : this.dim.l;
		if(uX != this.dim.x){this.modified = true; this.dim.x = uX};
		if(uY != this.dim.y){this.modified = true; this.dim.y = uY};
		if(uR != this.dim.r){this.modified = true; this.dim.r = uR};
		if(uL != this.dim.l){this.modified = true; this.dim.l = uL};
	};

	this.convertToData = function(){
		return {
			type:"innerpath",
			dim:this.dim
		}
	};

	this.prop = function(){
		var template = '<div class="prop" robjectid="<%= r.id %>" type="innerpath"> \
			<div class="prop-body"> \
				<div class="close">CLOSE X</div> \
				<div class="title"><h1><%= r.title %></h1></div> \
				<div class="measure"> \
					<h2>Length</h2> \
					<div class="measure-group"> \
						<label>Feet</label><input type="number" class="feet" value="<% print(MeasureToFeetInch(r.dim.l).feet) %>" <% if(!r.isEditable){ %>disabled="disabled"<%}%> /> \
					</div> \
					<div class="measure-group"> \
						<label>Inches</label><input type="number" class="inches" value="<% print(MeasureToFeetInch(r.dim.l).inches) %>" <% if(!r.isEditable){ %>disabled="disabled"<%}%> /> \
					</div> \
				</div> \
				<% if(r.isEditable){ %> \
					<div class="controls"> \
						<input type="button" class="remove" value="Remove" /> \
						<input type="button" class="apply" value="Apply" /> \
					</div> \
				<%}%> \
			</div> \
		</div>';
		return $(_.template(template)({r:this}));
	};
};

function multi(data){
	this.id = null;
	this.canvas = data.canvas;
	this.originalData = data;
	this.type = "multi";
	this.dim = data.dim;
	this.set = null;
	this.transform = null;
	this.objects = data.objects;
	this.robjects = [];
	this.bbox = null;
	this.areaPaths = [];
	this.isEditable = null;

	this.draw = function(){
		var c = this.canvas;
		var rs = this.robjects
		var set = this.set = this.canvas.paper.set();
		_.each(this.objects, function(object){
			object.canvas = c;
			var r = ObjectToRobject(object)
			rs.push(r);
			r.draw();
			set.push(r.element);
		});
		var box = set.getBBox();
		this.bbox = this.canvas.paper.rect(box.x, box.y, box.width, box.height).toFront().attr("fill", "red").attr("opacity", 0);
		this.bbox.data("robject",this);
		set.push(this.bbox);


		areaPathstrings = GenerateAreaPaths(rs);
		areaPaths = this.areaPaths;
		_.each(areaPathstrings, function(p){
			ap = c.paper.path(p).attr("fill", "green").attr("stroke-width",0).toBack();
			set.push(ap);
			areaPaths.push(ap);
		})


		ft = this.canvas.paper.freeTransform(set, {keepRatio:true, scale:false, drag:true, draw:['bbox'], snap:{rotate:5}, distance:1.3, attrs:{fill:"red", stroke:"red"}}).hideHandles();
		ft.attrs.rotate = this.dim.r;
		ft.attrs.translate = {
			x: this.canvas.feetToPixel(this.dim.x),
			y: this.canvas.feetToPixel(this.dim.y)
		}
		ft.apply();
		
		this.transform = ft;
		this.id = this.bbox.id;

	};

	this.remove = function(){
		if(this.set != null){
			this.set.remove();
		};
	};

	this.redraw = function(){
		this.transform.hideHandles();
		this.set.remove();
		this.draw();
	};

	this.toFront = function(){
		this.set.toFront();
	};

	this.toBack = function(){
		this.set.toBack();
		if(this.canvas.map != null){this.canvas.map.toBack()};

	};

	this.click_set = function(){
		this.bbox.click(function(){
			var robject = this.data("robject");
			robject.canvas.focus_set(robject);
		});
	};

	this.click_clear = function(){
		this.bbox.unclick();
	};

	this.focus = function(){
		//TODO - additional things that happen when object put in focus
		this.ft();
	};

	this.focus_clear = function(){
		//TODO - additional things that happen when object put out of focus
		this.ft_clear();
	};

	this.ft = function(){
		this.transform.showHandles();
		this.canvas.focus = this;
	}

	this.ft_clear = function(){
		this.updateDim();
		this.transform.hideHandles();
	};

	this.updateDim = function(){
		this.dim.x = this.canvas.pixelToFeet(this.transform.attrs.translate.x);
		this.dim.y = this.canvas.pixelToFeet(this.transform.attrs.translate.y);
		this.dim.r = this.transform.attrs.rotate;
	};

	this.convertToData = function(){
		var data = {
			type:"multi",
			dim:this.dim,
			objects:[]
		};
		_.each(this.robjects, function(robject){
			data.objects.push(robject.convertToData());
		});
		return data;
	};
};

function outerarc(data){
	this.id = null;
	this.canvas = data.canvas;
	this.originalData = data;
	this.type = "outerarc";
	this.dim = data.dim;
	this.element = null; //Raphael Element
	this.transform = null;
	this.isEditable = null;
	this.modified = false;
	this.title = "Arched Wall"
	this.pixelLength = function(){
		//this is not exact length but the triangle length to help with better positioning in this.ft_clear().
		return 2*Math.sqrt(Math.pow(this.canvas.feetToPixel(this.dim.w)/2, 2) + Math.pow(this.canvas.feetToPixel(this.dim.h),2));
	};
	this.startPoint = function(){return Raphael.getPointAtLength(this.mapedPath(), 0);};
	this.endPoint = function(){return Raphael.getPointAtLength(this.mapedPath(), 9999);};
	this.mapedPath = function(){return Raphael.mapPath(this.element.attr("path"), this.element.matrix);}
	this.reverseMapedPath = function(){
		//did not implement because most arcs are going to be on outer edge of outline, so no real need
		return this.mapedPath();
	};

	this.draw = function(){

		var radius = (this.canvas.feetToPixel(this.dim.h)/2) + Math.pow(this.canvas.feetToPixel(this.dim.w),2)/(8*this.canvas.feetToPixel(this.dim.h));
		var angle = 2*Math.asin(this.canvas.feetToPixel(this.dim.w)/(2*radius));
		var percentage = (angle*100)/(2*Math.PI);

		a = this.canvas.paper.path().attr("arc", [this.canvas.dropPoint.x, this.canvas.dropPoint.y, percentage, 100, radius]).attr("stroke-width",this.canvas.pixelsPerFoot/2).attr("stroke", "#333");
		ft = this.canvas.paper.freeTransform(a, {keepRatio:true, scale:false, drag:true, draw:['bbox'], snap:{rotate:5}, distance:1.3, attrs:{fill:"red", stroke:"red"}}).hideHandles();
		ft.attrs.rotate = this.dim.r;
		ft.attrs.translate = {
		 	x: this.canvas.feetToPixel(this.dim.x),
		 	y: this.canvas.feetToPixel(this.dim.y)
		 }
		ft.apply();
		this.transform = ft;

		this.element = a;
		this.element.data("robject",this);
		this.id = a.id;

	};

	this.remove = function(){
		if(this.element != null){
			this.element.remove();
		};
	};

	this.redraw = function(){
		this.transform.hideHandles();
		this.element.remove();
		this.draw();
	};

	this.toFront = function(){
		this.element.toFront();
	};

	this.toBack = function(){
		this.element.toBack();
		if(this.canvas.map != null){this.canvas.map.toBack()};
	};

	this.click_set = function(){
		this.element.click(function(){
			var robject = this.data("robject");
			robject.canvas.focus_set(robject);
		});
	};

	this.click_clear = function(){
		this.element.unclick();
	};

	this.focus = function(){
		//TODO - additional things that happen when object put in focus
		this.ft();
		this.element.attr({"stroke":"#ab6565"});
	};

	this.focus_clear = function(){
		//TODO - additional things that happen when object put out of focus
		this.ft_clear();
		this.element.attr({"stroke":"#333"});
	};

	this.ft = function(){
		this.transform.showHandles();
	};

	this.ft_clear = function(){

		var focus = this;
		var focus_length = this.pixelLength();
		var focus_id = this.id;
		var focus_startPoint = this.startPoint();
		var focus_endPoint = this.endPoint();
		_.each(this.canvas.robjects, function(robject){
			if((robject.type == "outerarc" && robject.id != focus_id) || robject.type == "outerpath"){
				var intersect = Raphael.pathIntersection(Raphael.mapPath(focus.element.attr("path"), focus.element.matrix), Raphael.mapPath(robject.element.attr("path"), robject.element.matrix));
				if(intersect[0]){
					var point;
					if(DistanceBetween(intersect[0], robject.startPoint()) < robject.pixelLength()/2){
						point = robject.startPoint();
					}else{
						point = robject.endPoint();
					}

					if(DistanceBetween(intersect[0], focus_endPoint) < focus_length/2){
						//closer to arc endpoint
						focus.transform.attrs.translate.x += point.x - focus_endPoint.x;
						focus.transform.attrs.translate.y += point.y - focus_endPoint.y;
					} else{
						//closer to arc startpoint
						focus.transform.attrs.translate.x += point.x - focus_startPoint.x;
						focus.transform.attrs.translate.y += point.y - focus_startPoint.y;
					}
					focus.transform.apply();
				};
			};
		});

		this.updateDim({
			x:this.canvas.pixelToFeet(this.transform.attrs.translate.x),
			y:this.canvas.pixelToFeet(this.transform.attrs.translate.y),
			r:this.transform.attrs.rotate
		});
		this.transform.hideHandles();
	};

	this.updateDim = function(params){
		var uX = params.x != undefined ? params.x : this.dim.x;
		var uY = params.y != undefined ? params.y : this.dim.y;
		var uR = params.r != undefined ? params.r : this.dim.r;
		var uW = params.w != undefined ? params.w : this.dim.w;
		var uH = params.h != undefined ? params.h : this.dim.h;
		if(uX != this.dim.x){this.modified = true; this.dim.x = uX};
		if(uY != this.dim.y){this.modified = true; this.dim.y = uY};
		if(uR != this.dim.r){this.modified = true; this.dim.r = uR};
		if(uW != this.dim.w){this.modified = true; this.dim.w = uW};
		if(uH != this.dim.h){this.modified = true; this.dim.h = uH};
	};

	this.convertToData = function(){
		return {
			type:"outerarc",
			dim:this.dim
		}
	};

	this.prop = function(){
		var template = '<div class="prop" robjectid="<%= r.id %>" type="outerarc"> \
			<div class="close">CLOSE X</div> \
			<div class="prop-body"> \
				<div class="title"><h1><%= r.title %></h1></div> \
				<div class="propimg"></div> \
				<div class="measure w"> \
					<h2>Width</h2> \
					<div class="measure-group"> \
						<label>Feet</label><input type="number" class="feet" value="<% print(MeasureToFeetInch(r.dim.w).feet) %>" <% if(!r.isEditable){ %>disabled="disabled"<%}%> /> \
					</div> \
					<div class="measure-group"> \
						<label>Inches</label><input type="number" class="inches" value="<% print(MeasureToFeetInch(r.dim.w).inches) %>" <% if(!r.isEditable){ %>disabled="disabled"<%}%> /> \
					</div> \
				</div> \
				<div class="measure h"> \
					<h2>Length</h2> \
					<div class="measure-group"> \
						<label>Feet</label><input type="number" class="feet" value="<% print(MeasureToFeetInch(r.dim.h).feet) %>" <% if(!r.isEditable){ %>disabled="disabled"<%}%> /> \
					</div> \
					<div class="measure-group"> \
						<label>Inches</label><input type="number" class="inches" value="<% print(MeasureToFeetInch(r.dim.h).inches) %>" <% if(!r.isEditable){ %>disabled="disabled"<%}%> /> \
					</div> \
				</div> \
				<% if(r.isEditable){ %> \
					<div class="controls"> \
						<input type="button" class="remove" value="Remove" /> \
						<input type="button" class="apply" value="Apply" /> \
					</div> \
				<%}%> \
			</div> \
		</div>';
		return $(_.template(template)({r:this}));
	};
};

function image(data){
	this.id = null;
	this.mid = null;//model id of furniture.
	this.canvas = data.canvas;
	this.originalData = data;
	this.type = "image";
	this.dim = data.dim;
	this.src = data.src;
	this.element = null; //Raphael Element
	this.transform = null;
	this.isEditable = null;
	this.modified = false;
	this.title = data.title;

	this.draw = function(){

		var i = this.canvas.paper.image(this.src, this.canvas.dropPoint.x, this.canvas.dropPoint.y, this.canvas.feetToPixel(this.dim.w), this.canvas.feetToPixel(this.dim.h));
		ft = this.canvas.paper.freeTransform(i, {keepRatio:true, scale:false, drag:true, draw:['bbox'], snap:{rotate:5}, distance:1.3, attrs:{fill:"red", stroke:"red"}}).hideHandles();
		ft.attrs.rotate = this.dim.r;
		ft.attrs.translate = {
		 	x: this.canvas.feetToPixel(this.dim.x),
		 	y: this.canvas.feetToPixel(this.dim.y)
		 }
		ft.apply();
		this.transform = ft;

		this.element = i;
		this.element.data("robject",this);
		this.id = i.id;

		if(this.originalData.mid){
			this.mid = this.originalData.mid;
		};
	};

	this.remove = function(){
		if(this.element != null){
			this.element.remove();
		};
	};

	this.redraw = function(){
		this.transform.hideHandles();
		this.element.remove();
		this.draw();
		return this;
	};

	this.toFront = function(){
		this.element.toFront();
	};

	this.toBack = function(){
		this.element.toBack();
		if(this.canvas.map != null && this.canvas.map.id != this.element.id){this.canvas.map.toBack()};
	};

	this.click_set = function(){
		this.element.click(function(){
			var robject = this.data("robject");
			robject.canvas.focus_set(robject);
		});
	};

	this.click_clear = function(){
		this.element.unclick();
	};

	this.focus = function(){
		//TODO - additional things that happen when object put in focus
		this.ft();
	};

	this.focus_clear = function(){
		//TODO - additional things that happen when object put out of focus
		this.ft_clear();
	};

	this.ft = function(){
		this.transform.showHandles();
	};

	this.ft_clear = function(){
		this.updateDim({
			x:this.canvas.pixelToFeet(this.transform.attrs.translate.x),
			y:this.canvas.pixelToFeet(this.transform.attrs.translate.y),
			r:this.transform.attrs.rotate
		});
		this.transform.hideHandles();
	};

	this.updateDim = function(params){
		var uX = params.x != undefined ? params.x : this.dim.x;
		var uY = params.y != undefined ? params.y : this.dim.y;
		var uR = params.r != undefined ? params.r : this.dim.r;
		var uW = params.w != undefined ? params.w : this.dim.w;
		var uH = params.h != undefined ? params.h : this.dim.h;
		if(uX != this.dim.x){this.modified = true; this.dim.x = uX};
		if(uY != this.dim.y){this.modified = true; this.dim.y = uY};
		if(uR != this.dim.r){this.modified = true; this.dim.r = uR};
		if(uW != this.dim.w){this.modified = true; this.dim.w = uW};
		if(uH != this.dim.h){this.modified = true; this.dim.h = uH};
	};

	this.convertToData = function(){
		return {
			type:"image",
			dim:this.dim,
			src:this.src,
			mid: this.mid ? this.mid : null,
			title: this.title
		}
	};

	this.prop = function(){
		if(this.mid){
			var propHTML = '<div>Error</div>';
			$.ajax({
				type:"POST",
				url:"/furniture/prop/"+this.mid,
				async:false,
				success:function(data){
					propHTML = data;
				}
			});
			return $(propHTML);
		} else{
			var template = '<div class="prop" robjectid="<%= r.id %>" type="image"> \
				<div class="close">CLOSE X</div> \
				<div class="prop-body"> \
					<div class="title"><h1><%= r.title %></h1></div> \
					<div class="propimg"><img src="<%= r.src %>"/></div> \
					<div class="measure w"> \
						<h2>Width</h2> \
						<div class="measure-group"> \
							<label>Feet</label><input type="number" class="feet" value="<% print(MeasureToFeetInch(r.dim.w).feet) %>" <% if(!r.isEditable){ %>disabled="disabled"<%}%> /> \
						</div> \
						<div class="measure-group"> \
							<label>Inches</label><input type="number" class="inches" value="<% print(MeasureToFeetInch(r.dim.w).inches) %>" <% if(!r.isEditable){ %>disabled="disabled"<%}%> /> \
						</div> \
					</div> \
					<div class="measure h"> \
						<h2>Length</h2> \
						<div class="measure-group"> \
							<label>Feet</label><input type="number" class="feet" value="<% print(MeasureToFeetInch(r.dim.h).feet) %>" <% if(!r.isEditable){ %>disabled="disabled"<%}%> /> \
						</div> \
						<div class="measure-group"> \
							<label>Inches</label><input type="number" class="inches" value="<% print(MeasureToFeetInch(r.dim.h).inches) %>" <% if(!r.isEditable){ %>disabled="disabled"<%}%> /> \
						</div> \
					</div> \
					<% if(r.isEditable){ %> \
						<div class="controls"> \
							<input type="button" class="remove" value="Remove" /> \
							<input type="button" class="apply" value="Apply" /> \
						</div> \
					<%}%> \
				</div> \
			</div>';
			return $(_.template(template)({r:this}));
		}
	};
};

function ruler(data){
	this.canvas = data.canvas;
	this.startPoint = null;
	this.endPoint = null;
	this.element = null;

	this.generatePathstring = function(){
		return "M" + (this.startPoint.x) + ',' + (this.startPoint.y)+ "L" + (this.endPoint.x) + "," + (this.endPoint.y);
	};

	this.start = function(x,y){
		if(this.element != null){this.remove();};
		this.startPoint = this.endPoint = {
			x:x + this.canvas.pan.x + this.canvas.panOffset.x - this.canvas.wrapperPosition.x,
			y:y + this.canvas.pan.y + this.canvas.panOffset.y - this.canvas.wrapperPosition.y
		}
		this.element = this.canvas.paper.path(this.generatePathstring()).attr("stroke-width", 5).attr("stroke", "red").toFront();
	};

	this.end = function(x,y){
		this.endPoint = {
			x:x + this.canvas.pan.x + this.canvas.panOffset.x - this.canvas.wrapperPosition.x,
			y:y + this.canvas.pan.y + this.canvas.panOffset.y - this.canvas.wrapperPosition.y
		};
		this.redraw();
	};

	this.redraw = function(){
		this.element.attr("path", this.generatePathstring());
	};

	this.pixelLength = function(){
		return DistanceBetween(this.startPoint, this.endPoint);
	};

	this.feetLength = function(){
		return this.canvas.pixelToFeet(this.pixelLength());
	};

	this.pixelLengthX = function(){
		return Math.abs(this.startPoint.x - this.endPoint.x);
	};

	this.pixelLengthY = function(){
		return Math.abs(this.startPoint.y - this.endPoint.y);
	};

	this.feetLengthX = function(){
		return this.canvas.pixelToFeet(this.pixelLengthX());
	};

	this.feetLengthY = function(){
		return this.canvas.pixelToFeet(this.pixelLengthY());
	};

	this.angle = function(){
		return Raphael.deg(Math.atan(this.pixelLengthY()/this.pixelLengthX()))
	};

	this.remove = function(){
		this.element.remove();
	};
};

function DistanceBetween(point1, point2){
	return Math.sqrt(Math.pow(point2.x-point1.x, 2) + Math.pow(point2.y-point1.y, 2))
}

function MeasureToFeetInch(measure){
	return {
		feet: Math.floor(measure),
		inches: Math.round((measure%1)*12)
	}
};

function FeetInchToMeasure(feet, inch){
	return parseInt(feet) + (parseInt(inch)/12);
};

function GenerateAreaPaths(robjects){//list of robjects
	/*
		list = [
			{robject:, startPoint:, endPoint:, drawn:true/false, startConnect:{item:, point: "end"}, endConnect:{item:, point:"start"}}
		]

	*/
	var list = [];
	var paths = [];

	_.each(robjects, function(robject){if(robject.type == "outerpath" || robject.type == "outerarc"){
		list.push({
			robject:robject,
			startPoint:robject.startPoint(),
			endPoint:robject.endPoint(),
			drawn:false
		});
	}});

	_.each(list, function(focus){
		_.each(list, function(item){if(focus.robject.id != item.robject.id){
			if(DistanceBetween(focus.startPoint, item.startPoint) < 20){
				focus["startConnect"] = {item:item, point:"start"};
			};

			if(DistanceBetween(focus.startPoint, item.endPoint) < 20){
				focus["startConnect"] = {item:item, point:"end"};
			};

			if(DistanceBetween(focus.endPoint, item.startPoint) < 20){
				focus["endConnect"] = {item:item, point:"start"};
			};

			if(DistanceBetween(focus.endPoint, item.endPoint) < 20){
				focus["endConnect"] = {item:item, point:"end"};
			};
		}});
	});

	FindUndrawnEdge = function(){
		//find item with only 1 end connected
		var edge =  _.find(list, function(item){
			return !item.drawn && ((item.startConnect && !item.endConnect) || (!item.startConnect && item.endConnect));
		});
		if(edge){
			return edge;
		};

		//if no items with 1 end connected, then search for any item that has both ends connected
		edge = _.find(list, function(item){
			return !item.drawn && item.startConnect && item.endConnect;
		});
		if(edge){
			return edge;
		};

		return false;
	};

	DrawPath = function(item, beginPoint){
		if(item.drawn){return '';};
		item.drawn = true;
		var s = '';
		if(beginPoint == "start"){
			s = String(item.robject.mapedPath()).replace("M","L");
			// s = '---normal.' + item.robject.type + '---' + String(item.robject.mapedPath())
			// s = String(item.robject.mapedPath())
			if(item.endConnect){
				s += DrawPath(item.endConnect.item, item.endConnect.point);
			} else{
				return s;
			}
		} else{
			s = String(item.robject.reverseMapedPath()).replace("M","L");
			// s = '---reversed.' + item.robject.type + '---' + String(item.robject.reverseMapedPath());
			// s = String(item.robject.reverseMapedPath());
			if(item.startConnect){
				s += DrawPath(item.startConnect.item, item.startConnect.point);
			} else{
				return s;
			}
		}
		return s;
	};

	while(true){
		var edge = FindUndrawnEdge();
		if(!edge){break;};

		var pathstring = '';
		if(edge.startConnect){
			pathstring = Raphael.format("M{0},{1}", edge.startPoint.x, edge.startPoint.y);
		}else{
			pathstring = Raphael.format("M{0},{1}", edge.endPoint.x, edge.endPoint.y);				
		}

		if(edge.endConnect){
			pathstring += DrawPath(edge, "start");
		} else{
			pathstring += DrawPath(edge, "end");				
		}

		if(edge.startConnect){
			pathstring += Raphael.format("L{0},{1}", edge.endPoint.x, edge.endPoint.y);
		}else{
			pathstring += Raphael.format("L{0},{1}", edge.startPoint.x, edge.startPoint.y);				
		}

		paths.push(pathstring);
	};

	return paths;
};

function ObjectToRobject(object){
	//returns Robject based on object data input
	switch(object.type){
		case "outerpath":
			return new outerpath(object);
		case "innerpath":
			return new innerpath(object);
		case "multi":
			return new multi(object);
		case "outerarc":
			return new outerarc(object);
		case "image":
			return new image(object);
	};
};