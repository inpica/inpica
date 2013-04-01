function canvas(config){
	//config = {pixelsPerFoot, w, h, id}
	this.config = config;
	this.paper = null;
	this.pixelsPerFoot = config.pixelsPerFoot;
	this.id = config.id;
	this.w = config.w;
	this.h = config.h;
	this.panx = config.panx;
	this.pany = config.pany;
	this.xoffset = config.xoffset;//x pixels the canvas' left CSS prop. Only matters for ruler
	this.yoffset = config.yoffset;//x pixels the canvas' top CSS prop. Only matters for ruler
	this.focus = null;
	this.robjects = [];
	this.ruler = null;
	this.map = null; //this is a robject but specifically for the map
	this.init = function(){
		this.paper = new Raphael(document.getElementById(this.id), this.w, this.h);
		this.pan(0,0);
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
		var c = this;
		var rs = this.robjects;
		_.each(objects, function(object){
			object.canvas = c;
			robject = ObjectToRobject(object);
			robject.isEditable = isEditable;
			robject.isFurniture = isFurniture;
			rs.push(robject);
		});
	};

	this.addMap = function(map){
		if(this.map != null){this.map.remove()};
		map.canvas = this;
		robject = ObjectToRobject(map);
		robject.isEditable = false;
		robject.isFurniture = false;
		this.map = robject;
		this.map.draw();
		this.map.toBack();
	};

	this.removeFurnishing = function(){
		_.each(this.robjects, function(robject){if(robject.isFurniture){
			robject.remove();
		}});
	};

	this.select_set = function(){
		var c = this;
		var p = this.paper;
		_.each(this.robjects, function(robject){
			robject.click_set();
		})
		$('#'+this.id).on("click", function(e){
			if (!p.getElementByPoint(e.pageX, e.pageY)){
				c.focus_clear();				
			};
		});
	};

	this.panselect_set = function(){
		var c = this;
		var p = this.paper;

		_.each(this.robjects, function(robject){
			robject.click_set();
		});

		$('#'+c.id).on("mousedown", function(edown){
			var temp = {x:edown.pageX, y:edown.pageY}
			if (!p.getElementByPoint(edown.pageX, edown.pageY)){
				$('#'+c.id).on("mousemove", function(emove){
					c.pan(emove.pageX - temp.x, emove.pageY - temp.y);
					temp.x = emove.pageX;
					temp.y = emove.pageY;
				})
				.on("mouseup", function(){
					$('#'+c.id).unbind("mousemove").unbind("mouseup");
					c.focus_clear();
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
		$('#'+this.id).unbind("mousedown");
	};

	this.pan = function(xpix, ypix){
		this.panx += xpix;
		this.pany += ypix;
		$("#" + this.id + ' svg').css({"left":this.panx+"px", "top":this.pany+"px"});
	};

	this.focus_clear = function(){
		if (this.focus != null){
			this.focus.focus_clear();
			this.focus = null;
		};
	};

	this.focus_set = function(robject){
		this.focus_clear();
		this.focus = robject;
		this.focus.focus();
	};

	this.focus_last = function(){
		this.focus_set(_.last(this.robjects));
	};

	this.draw = function(){
		var c = this;
		_.each(this.robjects, function(robject){
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

		if(this.ruler != null){this.ruler.remove();};
		this.ruler = new ruler({canvas:this});

		c = this;
		$("#"+c.id).on("mousedown", function(e){
			c.ruler.start(e.pageX, e.pageY);
	        $("#"+c.id).on('mousemove', function(e) {
	            c.ruler.end(e.pageX, e.pageY);
	        });
	    });

	    $("#"+c.id).on("mouseup",function(e) {
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

	this.convertToData_floorplan = function(){
		var data = {objects:[]};
		_.each(this.robjects, function(robject){if(!robject.isFurniture){
			data.objects.push(robject.convertToData());
		}});
		return data;
	};

	this.convertToData_furnishing = function(){
		var data = {objects:[]};
		_.each(this.robjects, function(robject){if(robject.isFurniture){
			data.objects.push(robject.convertToData());
		}});
		return data;
	};

	this.furnishing_clear = function(){
		_.each(this.robjects, function(robject){if(robject.isFurniture){
			robject.remove();
		}});
		this.robjects = _.filter(this.robjects, function(robject){return !robject.isFurniture })
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

		
		leftoffset = -this.canvas.feetToPixel(this.dim.l)/2;

		op = this.canvas.paper.path('M'+leftoffset+',0L'+this.canvas.feetToPixel(this.dim.l)/2+',0').attr("stroke-width",this.canvas.pixelsPerFoot/1.5);
		ft = this.canvas.paper.freeTransform(op, {keepRatio:true, scale:false, drag:true, draw:['bbox'], snap:{rotate:10}, distance:1.3}).hideHandles();
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
	};

	this.focus_clear = function(){
		//TODO - additional things that happen when object put out of focus
		this.ft_clear();
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

		this.updateDim();
		focus.transform.hideHandles();
	};

	this.updateDim = function(){
		this.dim.x = this.canvas.pixelToFeet(this.transform.attrs.translate.x);
		this.dim.y = this.canvas.pixelToFeet(this.transform.attrs.translate.y);
		this.dim.r = this.transform.attrs.rotate;
	};

	this.convertToData = function(){
		return {
			type:"outerpath",
			dim:this.dim
		}
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
	this.pixelLength = function(){return this.element.getTotalLength();};
	this.startPoint = function(){return Raphael.getPointAtLength(Raphael.mapPath(this.element.attr("path"), this.element.matrix), 0);};
	this.endPoint = function(){return Raphael.getPointAtLength(Raphael.mapPath(this.element.attr("path"), this.element.matrix), 9999);};

	this.draw = function(){

		leftoffset = -this.canvas.feetToPixel(this.dim.l)/2;
		ip = this.canvas.paper.path('M'+leftoffset+',0L'+this.canvas.feetToPixel(this.dim.l)/2+',0').attr("stroke-width",this.canvas.pixelsPerFoot/2).attr("stroke", "blue");
		ft = this.canvas.paper.freeTransform(ip, {keepRatio:true, scale:false, drag:true, draw:['bbox'], snap:{rotate:10}, distance:1.3}).hideHandles();
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
	};

	this.focus_clear = function(){
		//TODO - additional things that happen when object put out of focus
		this.ft_clear();
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
		
		this.updateDim()
		focus.transform.hideHandles();
	};

	this.updateDim = function(){
		this.dim.x = this.canvas.pixelToFeet(this.transform.attrs.translate.x);
		this.dim.y = this.canvas.pixelToFeet(this.transform.attrs.translate.y);
		this.dim.r = this.transform.attrs.rotate;
	};

	this.convertToData = function(){
		return {
			type:"innerpath",
			dim:this.dim
		}
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


		ft = this.canvas.paper.freeTransform(set, {keepRatio:true, scale:false, drag:true, draw:['bbox'], snap:{rotate:10}, distance:1.3}).hideHandles();
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

		a = this.canvas.paper.path().attr("arc", [0, 0, percentage, 100, radius]).attr("stroke-width",this.canvas.pixelsPerFoot/1.5).attr("stroke", "orange");
		ft = this.canvas.paper.freeTransform(a, {keepRatio:true, scale:false, drag:true, draw:['bbox'], snap:{rotate:10}, distance:1.3}).hideHandles();
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
	};

	this.focus_clear = function(){
		//TODO - additional things that happen when object put out of focus
		this.ft_clear();
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

		this.updateDim();
		this.transform.hideHandles();
	};

	this.updateDim = function(){
		this.dim.x = this.canvas.pixelToFeet(this.transform.attrs.translate.x);
		this.dim.y = this.canvas.pixelToFeet(this.transform.attrs.translate.y);
		this.dim.r = this.transform.attrs.rotate;
	};

	this.convertToData = function(){
		return {
			type:"outerarc",
			dim:this.dim
		}
	};
};

function image(data){
	this.id = null;
	this.canvas = data.canvas;
	this.originalData = data;
	this.type = "image";
	this.dim = data.dim;
	this.src = data.src;
	this.element = null; //Raphael Element
	this.transform = null;
	this.isEditable = null;

	this.draw = function(){

		var i = this.canvas.paper.image(this.src, 0, 0, this.canvas.feetToPixel(this.dim.w), this.canvas.feetToPixel(this.dim.h));
		ft = this.canvas.paper.freeTransform(i, {keepRatio:true, scale:false, drag:true, draw:['bbox'], snap:{rotate:10}, distance:1.3}).hideHandles();
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
	};

	this.remove = function(){
		if(this.element != null){
			this.element.remove();
		};
	};

	this.redraw = function(){
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
		this.updateDim();
		this.transform.hideHandles();
	};

	this.updateDim = function(){
		this.dim.x = this.canvas.pixelToFeet(this.transform.attrs.translate.x);
		this.dim.y = this.canvas.pixelToFeet(this.transform.attrs.translate.y);
		this.dim.r = this.transform.attrs.rotate;
	};

	this.convertToData = function(){
		return {
			type:"image",
			dim:this.dim,
			src:this.src
		}
	};
};

function ruler(data){
	this.canvas = data.canvas;
	this.startPoint = null;
	this.endPoint = null;
	this.element = null;

	this.generatePathstring = function(){
		return "M" + (this.startPoint.x - this.canvas.xoffset) + ',' + (this.startPoint.y - this.canvas.yoffset)+ "L" + (this.endPoint.x - this.canvas.xoffset) + "," + (this.endPoint.y - this.canvas.yoffset);
	};

	this.start = function(x,y){
		if(this.element != null){this.remove();};
		this.startPoint = this.endPoint = {
			x:x,
			y:y
		}
		this.element = this.canvas.paper.path(this.generatePathstring()).attr("stroke-width", 5).attr("stroke", "red").toFront();
	};

	this.end = function(x,y){
		this.endPoint = {
			x:x,
			y:y
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
		return Raphael.deg(Math.atan(this.pixelLengthX()/this.pixelLengthY()))
	};

	this.remove = function(){
		this.element.remove();
	};
};

function DistanceBetween(point1, point2){
	return Math.sqrt(Math.pow(point2.x-point1.x, 2) + Math.pow(point2.y-point1.y, 2))
}

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