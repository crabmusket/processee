navigator.getUserMedia ||
	(navigator.getUserMedia = navigator.mozGetUserMedia ||
	navigator.webkitGetUserMedia || navigator.msGetUserMedia);

window.processee = {
	getLayer: function(l) {
		var layers = window.processee.layers;
		if(layers[l] === undefined) {
			layers[l] = {
				once: [],
				everyFrame: [],
				objects: []
			};
		}
		return layers[l];
	},

	setup: function(fn) {
		window.processee.setups.push(fn);
	},

	once: function(conf, fn) {
		if(typeof conf == 'function') {
			fn = conf;
			conf = { layer: undefined };
		}
		var layer = window.processee.getLayer(conf.layer || 1);
		layer.once.push(fn);
	},

	everyFrame: function(conf, fn) {
		if(typeof conf == 'function') {
			fn = conf;
			conf = { layer: undefined };
		}
		var layer = window.processee.getLayer(conf.layer || 1);
		layer.everyFrame.push(fn);
	},

	object: function(obj, init) {
		if(!obj.hasOwnProperty('layer') || typeof obj.layer != 'number') {
			obj.layer = 1;
		}
		var layer = window.processee.getLayer(obj.layer);
		layer.objects.push(obj);
		if(init) {
			obj.__processeeInit = init;
		}
	},

	objects: function(objs, init) {
		for(var i = 0; i < objs.length; i++) {
			window.processee.object(objs[i], init);
		}
	},

	clearObjects: function() {
		for(var i = 0; i < window.processee.layers.length; i++) {
			window.processee.getLayer(i).objects.length = 0;
		}
	},

	onMouseMove: function(fn) {
		if(!window.processee.mouse['move']) {
			window.processee.mouse['move'] = [];
		}
		window.processee.mouse['move'].push(fn);
	},

	onClick: function(fn) {
		if(!window.processee.mouse['click']) {
			window.processee.mouse['click'] = [];
		}
		window.processee.mouse['click'].push(fn);
	},

	init: function() {
		if(window.processingInstance) window.processingInstance.exit();
		window.processee.layers = [];
		window.processee.setups = [];
		window.processee.mouse = {};
		$('#processing')[0].width = 0;
		return window.processee;
	},

	run: function(coffee) {
		if(coffee) {
			try { var js = CoffeeScript.compile(coffee); }
			catch(err) { window.processee.handleCompileError(err); }
			try { eval(js); }
			catch(err) { window.processee.handleRuntimeError(err); }
		}
		window.processee.layers.sort();
		window.processingInstance = new Processing(
			$('#processing')[0],
			window.processee.create());
		return window.processee;
	},

	handleCompileError: function(e) {
		if(e.stack) {
			console.log(e.stack);
		}
		if(e.location) {
			alert('Syntax error on line ' + (e.location.first_line + 1));
		}
	},

	handleRuntimeError: function(e) {
		if(e.stack) {
			console.log(e.stack);
		}
		if(!confirm('Error: ' + e.message)) {
			window.processingInstance.exit();
		}
	},
};

function sort(a) {
	a.sort();
	return a;
}

function firstDefined(a) {
	for(var i = 0; i < a.length; i++) {
		if(a[i] !== undefined && !isNaN(a[i])) {
			return a[i];
		}
	}
	return undefined;
}

function objToColor(c) {
	var r = firstDefined([c.r, c.red,   c.gray, 0]);
	var g = firstDefined([c.g, c.green, c.gray, 0]);
	var b = firstDefined([c.b, c.blue , c.gray, 0]);
	var a = firstDefined([c.a, c.alpha, 255]);
	return {r:r, red:r, g:g, green:g, b:b, blue:b, a:a, alpha:a};
}

window.processee.create = function() {
	return function(p) {
		p.__defineSetter__("canvasSize", function(s) {
			p.size(s.w || s.width || 100,
			       s.h || s.height || 100);
			if(window.positionOutput) {
				window.positionOutput();
			}
		});
		p.__defineGetter__("canvasSize", function() {
			return {
				width: $('#processing').width(),
				height: $('#processing').height(),
			};
		});

		p.__defineSetter__("canvasColor", function(c) {
			c = objToColor(c);
			p.background(c.r, c.g, c.b, c.a);
		});

		p.drawLine = function(line) {
			var a = line.a || line.from || line.first;
			var b = line.b || line.to || line.second;
			if(!a || !b)
				return;
			p.line(a.x || 0,
			       a.y || 0,
			       b.x || 10,
			       b.y || 10);
		};

		p.drawLinesBetween = function(points) {
			if(points.length < 2) {
				console.log('@drawLinesBetween needs at least 2 points!');
				return;
			}
			for(var i = 1; i < points.length; i++) {
				var p0 = points[i-1];
				var p1 = points[i];
				p.drawLine({from: p0, to: p1});
			}
		};

		p.drawListOfLines = function(lines) {
			for(var i = 0; i < lines.length; i++) {
				p.drawLine(lines[i]);
			}
		};

		p.drawTriangle = function(tri) {
			var a = tri.a || tri.first;
			var b = tri.b || tri.second;
			var c = tri.c || tri.third;
			if(!a || !b || !c)
				return;
			p.triangle(a.x || 0,
			           a.y || 0,
			           b.x || 0,
			           b.y || 10,
			           c.x || 10,
			           c.y || 10);
		};

		p.drawRect = function(rect) {
			var x1, x2, y1, y2, cx, cy, width, height;
			var cx = firstDefined([rect.x, 0]),
			    cy = firstDefined([rect.y, 0]),
			    width = rect.width,
			    height = rect.height;
			if(rect.min) {
				x1 = firstDefined([rect.min.x, cx - width/2, 0]);
				y1 = firstDefined([rect.min.y, cy - height/2, 0]);
			} else {
				x1 = firstDefined([cx - width/2, 0]);
				y1 = firstDefined([cy - height/2, 0]);
			}
			if(rect.max) {
				x2 = firstDefined([rect.max.x, cx + width/2, 0]);
				y2 = firstDefined([rect.max.y, cy + height/2, 0]);
			} else {
				x2 = firstDefined([cx + width/2, 0]);
				y2 = firstDefined([cy + height/2, 0]);
			}
			p.rect(x1, y1, x2 - x1, y2 - y1);
		};

		p.drawSquare = function(sq) {
			p.rectMode(p.CENTER);
			p.rect(firstDefined([sq.x, 0]),
			       firstDefined([sq.y, 0]),
			       firstDefined([sq.s, sq.size, 10]),
			       firstDefined([sq.s, sq.size, 10]));
			p.rectMode(p.CORNER);
		};

		p.drawEllipse = function(ell) {
			p.ellipse(ell.x || 0,
			          ell.y || 0,
			          ell.w || ell.width || 10,
			          ell.h || ell.height || 10);
		};

		p.drawCircle = function(circ) {
			p.ellipse(circ.x || 0,
			          circ.y || 0,
			          circ.r || circ.radius,
			          circ.r || circ.radius);
		};

		p.getImage = function(i) {
			if(typeof i == "string") {
				if(p.__imageData[i]) {
					return p.__imageData[i];
				} else {
					p.__imageNotLoaded(i);
				}
			} else {
				return i;
			}
		};

		p.__imageNotLoaded = function(file) {
			throw new Error('Image file "' + file + '" has not been loaded.');
		};

		p.drawImage = function(file, cfg) {
			file = p.getImage(file);
			if(!cfg) cfg = {};
			if(file !== undefined) {
				var tempCanvas = $('#processee-internal-canvas')[0];
				tempCanvas.width = file.width;
				tempCanvas.height = file.height;
				tempCanvas.getContext('2d').putImageData(file, 0, 0);
				var x, y;
				if(cfg.center) {
					x = firstDefined([cfg.x, -file.width/2]);
					y = firstDefined([cfg.y, -file.height/2]);
				} else {
					x = firstDefined([cfg.x, 0]);
					y = firstDefined([cfg.y, 0]);
				}
				$('#processing')[0].getContext('2d').drawImage(tempCanvas, x, y);
			} else {
				p.__imageNotLoaded(file);
			}
		};

		p.sizeOf = function(file) {
			var img = p.getImage(file);
			if(img !== undefined) {
				return {
					width: img.width,
					height: img.height,
				};
			} else {
				p.__imageNotLoaded(file);
			}
		};

		p.makeNewImage = function(cfg) {
			var nimg = undefined;
			var name = cfg.name;
			var source = cfg.copy || cfg.data;
			var width = cfg.w || cfg.width;
			var height = cfg.h || cfg.height;
			if(source) {
				var img = p.getImage(source);
				if(img !== undefined) {
					nimg = $('#processee-internal-canvas')[0].getContext('2d').createImageData(img.width, img.height);
					nimg.data.set(img.data);
				} else {
					p.__imageNotLoaded(source);
				}
			} else if(width !== undefined && height !== undefined) {
				nimg = $('#processee-internal-canvas')[0].getContext('2d')
					.createImageData(width, height);
			}
			if(name !== undefined) {
				p.__imageData[name] = nimg;
			}
			return nimg;
		};

		p.copyImage = function(cfg) {
			var nimg = undefined;
			var img = p.getImage(cfg.from);
			var name = cfg.to;
			if(img) {
				nimg = $('#processee-internal-canvas')[0].getContext('2d').createImageData(img.width, img.height);
				nimg.data.set(img.data);
			} else {
				p.__imageNotLoaded(cfg.from);
			}
			if(name !== undefined && typeof name == "string") {
				p.__imageData[name] = nimg;
			}
			return nimg;
		};

		function getPixelFromArray(p, a, i) {
			p.r = p.red = a[i];
			p.g = p.green = a[i+1];
			p.b = p.blue = a[i+2];
			p.a = p.alpha = a[i+3];
		};

		function setArrayFromPixel(a, i, p) {
			a[i] = p.red;
			a[i+1] = p.green;
			a[i+2] = p.blue;
			a[i+3] = p.alpha;
		};

		p.getPixel = function(cfg) {
			var file = cfg.of || cfg.image;
			var x = firstDefined([cfg.x, 0]);
			var y = firstDefined([cfg.y, 0]);
			var img = p.getImage(file);
			if(img !== undefined) {
				if(x < 0 || x >= img.width || y < 0 || y >= img.width) {
					return objToColor({gray: 0});
				}
				var i = x*4 + y*4*img.width;
				var pixel = {};
				getPixelFromArray(pixel, img.data, i);
				return pixel;
			} else {
				p.__imageNotLoaded(file);
			}
		};

		p.setPixel = function(cfg) {
			var file = cfg.of || cfg.image;
			var pixel = cfg.to;
			var x = firstDefined([cfg.x, pixel.x, 0]);
			var y = firstDefined([cfg.y, pixel.y, 0]);
			var img = p.getImage(file);
			if(img !== undefined) {
				var i = x*4 + y*4*img.width;
				setArrayFromPixel(img.data, i, objToColor(pixel));
			} else {
				p.__imageNotLoaded(file);
			}
			return img;
		};

		p.forEachPixelOf = function(cfg) {
			var file = cfg.image || cfg.img;
			var stored = typeof file == "string";
			var img = p.getImage(file);
			var fn = cfg.do;
			if(cfg.inPlace == undefined) cfg.inPlace = false;
			if(cfg.store === undefined) cfg.store = false;
			if(img !== undefined) {
				var tempData;
				if(cfg.inPlace) {
					tempData = img;
				} else {
					tempData = $('#processee-internal-canvas')[0].getContext('2d').createImageData(img.width, img.height);
				}
				var x = 0, y = 0;
				var pixel = {};
				for(var i = 0; i < img.data.length; i+=4) {
					getPixelFromArray(pixel, img.data, i);
					pixel.x = x;
					pixel.y = y;
					pixel.file = file;
					var result = fn.call(p, pixel);
					if(result !== undefined) {
						setArrayFromPixel(tempData.data, i, objToColor(result));
					}
					if(++x == img.width) {
						x = 0;
						y++;
					}
				}
				if(cfg.store) {
					if(stored) {
						p.__imageData[file] = tempData;
					} else if(!cfg.inPlace) {
						for(var i = 0; i < img.data.length; i++) {
							img.data[i] = tempData.data[i];
						}
					}
				}
				return cfg.store? file : tempData;
			} else {
				p.__imageNotLoaded(file);
			}
		};

		p.setEachPixelOf = function(cfg) {
			cfg.do = cfg.to;
			if(cfg.store === undefined) cfg.store = true;
			return p.forEachPixelOf(cfg);
		};

		p.forEachNeighborOf = function(pixel, fn) {
			var x = pixel.x,
			    y = pixel.y;
			var img = p.getImage(pixel.file);
			if(!img) {
				console.log("Pixel is not part of an image.");
				return;
			}
			var len = img.width * img.height * 4;
			var tmp = {};
			tmp.file = pixel.file;
			for(var dx = -1; dx < 2; dx++) {
				for(var dy = -1; dy < 2; dy++) {
					var di = (x+dx)*4 + (y+dy)*4*img.width;
					if(di < 0 || di > len) {
						continue;
					}
					getPixelFromArray(tmp, img.data, di);
					tmp.x = x+dx;
					tmp.y = y+dy;
					fn.call(p, tmp);
				}
			}
		};

		p.__defineSetter__('fillColor', function(c) {
			c = objToColor(c ? c : {gray: 255});
			p.__stack[p.__stack.length-1].fill = {red: c.red, green: c.green, blue: c.blue, alpha: c.alpha};
			p.__stackSet();
		});
		p.__defineGetter__('fillColor', function() {
			return p.__stack[p.__stack.length-1].fill;
		});

		p.__defineSetter__('transparency', function(t) {
			if(t === null) {
				t = 0;
			}
			p.__stack[p.__stack.length-1].transparency = t;
			p.__stackSet();
		});
		p.__defineGetter__('transparency', function() {
			return p.__stack[p.__stack.length-1].transparency;
		});

		p.__defineSetter__('strokeColor', function(c) {
			c = objToColor(c ? c : {gray: 0});
			p.__stack[p.__stack.length-1].stroke = {red: c.red, green: c.green, blue: c.blue, alpha: c.alpha};
			p.__stackSet();
		});
		p.__defineGetter__('strokeColor', function() {
			return p.__stack[p.__stack.length-1].stroke;
		});

		p.__defineSetter__('origin', function(o) {
			var c = p.__stack[p.__stack.length-1].origin;
			p.translate(-c.x, -c.y);
			p.__stack[p.__stack.length-1].origin = {
				x: (o.x || o.posX || 0),
				y: (o.y || o.posY || 0)
			};
			p.translate(o.x || o.posX || 0, o.y || o.posY || 0);
			p.__stackSet();
		});
		p.__defineGetter__('origin', function() {
			return p.__stack[p.__stack.length-1].origin;
		});

		p.__defineSetter__('rotation', function(r) {
			var c = p.__stack[p.__stack.length-1];
			p.rotate(-c.rotation);
			p.__stack[p.__stack.length-1].rotation = r;
			p.rotate(r);
			p.__stackSet();
		});
		p.__defineGetter__('rotation', function() {
			return p.__stack[p.__stack.length-1].rotation;
		});

		p.__defineSetter__('zoom', function(s) {
			var c = p.__stack[p.__stack.length-1];
			p.scale(1 / c.scale);
			p.__stack[p.__stack.length-1].scale = s;
			p.scale(s);
			p.__stackSet();
		});
		p.__defineGetter__('zoom', function() {
			return p.__stack[p.__stack.length-1].scale;
		});

		p.__stack = [];
		p.__stackSet = function() {
			var c = p.__stack[p.__stack.length-1];
			p.fill(c.fill.red, c.fill.green, c.fill.blue, c.fill.alpha);
			p.stroke(c.stroke.red, c.stroke.green, c.stroke.blue, c.stroke.alpha);
			$('#processing')[0].getContext('2d').globalAlpha = 1 - c.transparency;
		};
		p.__stackPush = function() {
			var c = p.__stack[p.__stack.length-1];
			p.pushMatrix();
			p.__stack.push({
				fill: c.fill,
				stroke: c.stroke,
				scale: c.scale,
				origin: {x: 0, y: 0},
				rotation: 0,
				transparency: c.transparency,
			});
		};
		p.__stackPop = function() {
			var o = p.__stack.pop();
			p.popMatrix();
			if(p.__stack.length) {
				p.__stackSet();
			}
		};

		p.reset = function() {
			while(p.__stack.length) {
				p.__stackPop();
			}
			p.__stack = [{
				fill: objToColor({gray: 255}),
				stroke: objToColor({gray: 0}),
				origin: { x: 0, y: 0 },
				rotation: 0,
				transparency: 0,
			}];
			p.__stackSet();
		};

		p.__images = [];
		p.__imageData = {};

		p.loadImage = function(file) {
			p.__images.push(file);
		};

		$('#processee-image-loader').load(function() {
			var img = $('#processee-image-loader');
			var file = img.attr('src');
			if(file == '') {
				return;
			}
			var width = img.width(), height = img.height();
			var canvas = $('#processee-internal-canvas')[0];
			canvas.width = width;
			canvas.height = height;
			var ctx = canvas.getContext('2d');
			ctx.drawImage(img[0], 0, 0);
			var data = ctx.getImageData(0, 0, width, height);
			p.__imageData[file] = data;
			p.__loadImages();
		});

		p.__loadNextImage = function(file) {
			$('#processee-image-loader')
				.attr('src', file);
		};

		p.__loadImages = function() {
			if(!p.__images.length) {
				$('#processee-image-loader').attr('src', '');
				p.__onSetup();
			} else {
				p.__loadNextImage(p.__images.pop());
			}
		};

		p.do = function(fn) {
			p.__stackPush();
			var result = fn.call(p);
			p.__stackPop();
			return result;
		};

		p.at = function(pos, fn) {
			p.__stackPush();
			p.origin = {
				x: pos.x || pos.posX || 0,
				y: pos.y || pos.posY || 0
			};
			p.__stackPush();
			var result = fn.call(p);
			p.__stackPop();
			p.__stackPop();
			return result;
		};

		p.rotatedBy = function(angle, fn) {
			p.__stackPush();
			p.rotation = angle;
			p.__stackPush();
			var result = fn.call(p);
			p.__stackPop();
			p.__stackPop();
			return result;
		};

		p.__webcamImageName = "webcam";
		p.__defineSetter__("webcamImageName", function(n) {
			p.__images[n] = p.__images[p.__webcamImageName];
			p.__webcamImageName = n;
		});
		p.__defineGetter__("webcamImageName", function() {
			return p.__webcamImageName;
		});

		p.__webcam = false;
		p.__defineSetter__("webcam", function(w) {
			if(p.__imageData[p.webcamImageName] == undefined) {
				p.makeNewImage({
					name: p.webcamImageName,
					width: 640,
					height: 480,
				});
			}
			if(w && !p.__webcam) {
				var video = $('#webcam');
				var error = function() {};
				var success = function(stream) {
					if(window.webkitURL) {
						window.processee.webcamSource = window.webkitURL.createObjectURL(stream);
					} else {
						window.processee.webcamSource = stream;
					}
					video[0].src = window.processee.webcamSource;
					video[0].autoplay = true;
					video[0].addEventListener("canplay", function () {});
				};

				if(!window.processee.webcamSource) {
					navigator.getUserMedia({
						video: true,
					}, success, error);
				}
			}
			p.__webcam = w;
		});
		p.__defineGetter__("webcam", function() {
			return p.__webcam;
		});

		p.__webcamCapture = function() {
			$('.webcam').toggle(true);
			var video = $('#webcam');
			var canvas = $('#processee-internal-canvas')[0];
			canvas.width = video[0].clientWidth;
			canvas.height = video[0].clientHeight;
			var context = canvas.getContext('2d');
			context.drawImage(video[0], 0, 0, canvas.width, canvas.height);
			p.__imageData[p.webcamImageName] = context.getImageData(0, 0, canvas.width, canvas.height);
			$('.webcam').toggle(false);
		};

		p.setup = function() {
			p.__processeeSetup = false;
			// Set some Processing defaults that are sane.
			p.rectMode(p.CORNER);
			// Call every setup function.
			var setups = window.processee.setups;
			for(var i = 0; i < setups.length; i++) {
				p.reset();
				try { setups[i].call(p); }
				catch(err) { window.processee.handleRuntimeError(err); }
			}
			p.__loadImages();
		};

		p.__onSetup = function() {
			p.__processeeSetup = true;
			// Capture the webcam if we need to.
			if(p.webcam) {
				p.__webcamCapture();
			}
			// Call do-once routines and setup objects.
			var layers = window.processee.layers;
			var layerOrder = window.processee.layerOrder;
			for(var l = 0; l < layers.length; l++) {
				var layer = layers[l];
				if(!layer) continue;
				for(var j = 0; j < layer.once.length; j++) {
					p.reset();
					try { layer.once[j].call(p); }
					catch(err) { window.processee.handleRuntimeError(err); }
				}
				for(var j = 0; j < layer.objects.length; j++) {
					if('setup' in layer.objects[j]) {
						p.reset();
						try { layer.objects[j].setup.call(p); }
						catch(err) { window.processee.handleRuntimeError(err); }
					}
				}
			}
		};

		p.draw = function() {
			if(!p.__processeeSetup) return;
			var layers = window.processee.layers;
			if(!layers.length) {
				return;
			}
			// Capture the webcam if we need to.
			if(p.webcam) {
				p.__webcamCapture();
			}
			// Call do-once routines and setup objects.
			for(var l = 0; l < layers.length; l++) {
				var layer = layers[l];
				if(!layer) continue;
				for(var j = 0; j < layer.everyFrame.length; j++) {
					p.reset();
					try { layer.everyFrame[j].call(p, layer.objects[j]); }
					catch(err) { window.processee.handleRuntimeError(err); }
				}
				for(var j = 0; j < layer.objects.length; j++) {
					if('__processeeInit' in layer.objects[j]) {
						p.reset();
						try { layer.objects[j].__processeeInit.call(p, layer.objects[j]); }
						catch(err) { window.processee.handleRuntimeError(err); }
						delete layer.objects[j]['__processeeInit'];
					}
					if('draw' in layer.objects[j]) {
						p.reset();
						try { layer.objects[j].draw.call(p, layer.objects[j]); }
						catch(err) { window.processee.handleRuntimeError(err); }
					}
				}
			}
		};

		p.mouse = {
			x: undefined,
			y: undefined,
		};

		p.__mouseEvent = function(event) {
			if(!p.__processeeSetup) return;
			if(p.mouse.x === undefined) p.mouse.x = event.x;
			if(p.mouse.y === undefined) p.mouse.y = event.y;
			handlers = window.processee.mouse[event.type];
			if(handlers) {
				for(var i = 0; i < handlers.length; i++) {
					try { handlers[i].call(p, event); }
					catch(err) { window.processee.handleRuntimeError(err); }
				}
			}
			p.mouse.x = event.x;
			p.mouse.y = event.y;
		};

		p.__keyEvent = function(event) {
			//
		};
	}
};

