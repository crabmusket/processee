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

	object: function(obj) {
		if(!obj.hasOwnProperty('layer') || typeof obj.layer != 'number') {
			obj.layer = 1;
		}
		var layer = window.processee.getLayer(obj.layer);
		layer.objects.push(obj);
	},

	objects: function(objs) {
		for(var i = 0; i < objs.length; i++) {
			window.processee.object(objs[i]);
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

	run: function() {
		if(window.processingInstance) window.processingInstance.exit();
		window.processee.layers = [];
		window.processee.setups = [];
		window.processee.mouse = {};
		$('#processing')[0].width = 0;

		var code = CoffeeScript.compile(window.cm.getValue());
		eval(code);

		window.processee.layers.sort();

		window.processingInstance = new Processing(
			$('#processing')[0],
			window.processee.create());
	},
};

function rgb(r, g, b) {
	return {
		mode: 'rgb',
		red: r, green: g, blue: b, alpha: 255,
	};
}

function rgba(r, g, b, a) {
	return {
		mode: 'rgb',
		red: r, green: g, blue: b, alpha: a
	};
}

function gray(v) {
	return {
		mode: 'rgb',
		red: v, green: v, blue: v, alpha: 255,
	};
}

function hsv(h, s, v) {
	return {
		mode: 'hsv',
		red: h, green: s, blue: v, alpha: 255,
	};
}

function point(x, y) {
	return {
		x: x,
		y: y,
	};
}

function polar(r, theta) {
	return {
		x: r * Math.cos(theta),
		y: r * Math.sin(theta),
	};
}

function dim(w, h) {
	return {
		w: w,
		h: h,
	};
}

function sort(a) {
	a.sort();
	return a;
}

window.processee.create = function() {
	return function(p) {
		p.__defineSetter__("canvasSize", function(s) {
			p.size(s.w || s.width || 100,
			       s.h || s.height || 100);
			window.positionOutput();
		});

		p.__defineSetter__("canvasBackground", function(c) {
			p.background(c.red, c.green, c.blue, c.alpha);
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
			p.rect(rect.x || 0,
			       rect.y || 0,
			       rect.w || rect.width || 10,
			       rect.h || rect.height || 10);
		};

		p.drawSquare = function(sq) {
			p.rect(sq.x || sq.posX || 0,
			       sq.y || sq.posY || 0,
			       sq.s || sq.size || 10,
			       sq.s || sq.size || 10);
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

		p.__getImage = function(i) {
			if(typeof i == "string") {
				return p.__imageData[i];
			} else {
				return i;
			}
		};

		p.drawImage = function(file) {
			file = p.__getImage(file);
			if(file !== undefined) {
				var tempCanvas = $('#processee-internal-canvas')[0];
				tempCanvas.width = file.width;
				tempCanvas.height = file.height;
				tempCanvas.getContext('2d').putImageData(file, 0, 0);
				$('#processing')[0].getContext('2d').drawImage(tempCanvas, 0, 0);
			} else {
				console.log('Image file "' + file + '" has not been loaded.');
			}
		};

		p.sizeOf = function(file) {
			var img = p.__getImage(file);
			if(img !== undefined) {
				return {
					width: img.width,
					height: img.height,
				};
			}
		};

		p.makeNewImage = function(name, w, h) {
			var nimg = undefined;
			var copyFrom = undefined;
			var dimensions = undefined;
			if(typeof name == 'object') {
				copyFrom = name.copyFrom;
				dimensions = {
					w: name.w || name.width || name.size.w || name.size.width,
					h: name.h || name.height || name.size.h || name.size.height
				};
				name = name.name;
			} else if(typeof w == 'string' || w.toString == '[object ImageData]') {
				copyFrom = w;
			} else {
				dimensions = w;
			}
			if(copyFrom) {
				var img = p.__getImage(copyFrom);
				if(img !== undefined) {
					nimg = $('#processee-internal-canvas')[0].getContext('2d').createImageData(img.width, img.height);
					nimg.data.set(img.data);
				} else {
					console.log('Image file "' + copyFrom + '" has not been loaded.');
				}
			} else if(dimensions) {
				nimg = $('#processee-internal-canvas')[0].getContext('2d')
					.createImageData(dimensions.w || dimensions.width, dimensions.h || dimensions.height);
			}
			if(name !== undefined) {
				p.__imageData[name] = nimg;
			}
			return nimg;
		};

		function getPixelFromArray(p, a, i) {
			p.red = a[i];
			p.green = a[i+1];
			p.blue = a[i+2];
			p.alpha = a[i+3];
		};

		function setArrayFromPixel(a, i, p) {
			a[i] = p.red;
			a[i+1] = p.green;
			a[i+2] = p.blue;
			a[i+3] = p.alpha;
		};

		p.getImagePixel = function(file, x, y) {
			var img = p.__getImage(file);
			if(img !== undefined) {
				if(typeof x == 'object') {
					y = x.y;
					x = x.x;
				}
				var i = x*4 + y*4*img.width;
				if(i >= img.data.length) {
					console.log("Pixel", x, y, "is out of bounds!");
					return;
				}
				var pixel = {};
				getPixelFromArray(pixel, img.data, i);
				return pixel;
			} else {
				console.log('Image file "' + file + '" has not been loaded.');
			}
		};

		p.setImagePixel = function(file, pixel) {
			var img = p.__getImage(file);
			if(img !== undefined) {
				var i = pixel.x*4 + pixel.y*4*img.width;
				setArrayFromPixel(img.data, i, pixel);
			} else {
				console.log('Image file "' + file + '" has not been loaded.');
			}
		};

		p.forEachPixelOf = function(file, fn) {
			var stored = typeof file == "string";
			var img = p.__getImage(file);
			if(img !== undefined) {
				var tempData = $('#processee-internal-canvas')[0].getContext('2d').createImageData(img.width, img.height);
				var x = 0, y = 0;
				var pixel = {};
				for(var i = 0; i < img.data.length; i+=4) {
					getPixelFromArray(pixel, img.data, i);
					pixel.x = x;
					pixel.y = y;
					pixel.file = file;
					var result = fn.call(p, pixel);
					setArrayFromPixel(tempData.data, i, result);
					if(++x == img.width) {
						x = 0;
						y++;
					}
				}
				if(stored) {
					p.__imageData[file] = tempData;
				}
				return tempData;
			} else {
				console.log('Image file "' + file + '" has not been loaded.');
			}
		};

		p.forEachNeighborOf = function(pixel, fn) {
			var x = pixel.x,
			    y = pixel.y;
			var img = p.__getImage(pixel.file);
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

		p.convolveWith = function(mat, scale) {
			if(typeof mat == 'object' && !mat.length) {
				scale = mat.scale;
				mat = mat.matrix || mat.mat;
			}
			if(scale === undefined) {
				scale = 1;
			}
			var diam = Math.sqrt(mat.length);
			if(parseFloat(diam) != parseInt(diam)) {
				console.log('Matrix', mat, 'is not square!');
				return;
			}
			return function(pixel) {
				var sumR = 0, sumG = 0, sumB = 0, i = 0;
				p.forEachNeighborOf(pixel, function(pix) {
					sumR += pix.red * mat[i] * scale;
					sumG += pix.green * mat[i] * scale;
					sumB += pix.blue * mat[i] * scale;
					i++;
				});
				return rgb(sumR, sumG, sumB);
			}
		};

		p.__defineSetter__('fillColor', function(c) {
			if(c === null) {
				c = rgba(0, 0, 0, 0);
			}
			if(!c.mode) {
				console.log('Cannot set fill without a color mode. Given:', c);
				return;
			}
			p.__stack[p.__stack.length-1].mode = c.mode == 'hsv' ? p.HSV : p.RGB;
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
			if(c === null) {
				c = rgba(0, 0, 0, 0);
			}
			if(!c.mode) {
				console.log('Cannot set stroke without a color mode. Given:', c);
				return;
			}
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
			p.colorMode(c.mode);
			p.fill(c.fill.red, c.fill.green, c.fill.blue, c.fill.alpha);
			p.stroke(c.stroke.red, c.stroke.green, c.stroke.blue, c.stroke.alpha);
			$('#processing')[0].getContext('2d').globalAlpha = 1 - c.transparency;
		};
		p.__stackPush = function() {
			var c = p.__stack[p.__stack.length-1];
			p.pushMatrix();
			p.__stack.push({
				mode: c.mode,
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
				mode: p.RGB,
				fill: gray(255),
				stroke: gray(0),
				origin: { x: 0, y: 0 },
				rotation: 0,
				transparency: 0,
			}];
			p.__stackSet();
		};

		p.__images = [];
		p.webcamImageName = "webcam";
		p.webcam = false;
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
			fn.call(p);
			p.__stackPop();
		};

		p.at = function(pos, fn) {
			p.__stackPush();
			p.origin = {
				x: pos.x || pos.posX || 0,
				y: pos.y || pos.posY || 0
			};
			p.__stackPush();
			fn.call(p);
			p.__stackPop();
			p.__stackPop();
		};

		p.rotatedBy = function(angle, fn) {
			p.__stackPush();
			p.rotation = angle;
			p.__stackPush();
			fn.call(p);
			p.__stackPop();
			p.__stackPop();
		};

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
			// Set some Processing defaults that are sane.
			p.rectMode(p.CENTER);
			// Call every setup function.
			var setups = window.processee.setups;
			for(var i = 0; i < setups.length; i++) {
				setups[i].call(p);
			}

			// Try to get the webcam if we need it, and after that's done load the images.
			if(p.webcam) {
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
					video[0].addEventListener("canplay", function () {
						p.__loadImages();
					});
				};

				if(!window.processee.webcamSource) {
					navigator.getUserMedia({
						video: true,
					}, success, error);
				} else {
					p.__loadImages();
				}
			} else {
				p.__loadImages(); // Calls __onSetup eventually
			}
		};

		p.__onSetup = function() {
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
					layer.once[j].call(p);
				}
				for(var j = 0; j < layer.objects.length; j++) {
					if('setup' in layer.objects[j]) {
						p.reset();
						layer.objects[j].setup.call(p);
					}
				}
			}
		};

		p.draw = function() {
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
					layer.everyFrame[j].call(p, layer.objects[j]);
				}
				for(var j = 0; j < layer.objects.length; j++) {
					if('draw' in layer.objects[j]) {
						p.reset();
						layer.objects[j].draw.call(p, layer.objects[j]);
					}
				}
			}
		};

		p.mouse = {
			x: undefined,
			y: undefined,
		};

		p.__mouseEvent = function(event) {
			if(p.mouse.x === undefined) p.mouse.x = event.x;
			if(p.mouse.y === undefined) p.mouse.y = event.y;
			handlers = window.processee.mouse[event.type];
			if(handlers) {
				for(var i = 0; i < handlers.length; i++) {
					handlers[i].call(p, event);
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

