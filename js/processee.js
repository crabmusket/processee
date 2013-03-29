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

window.processee.create = function() {
	return function(p) {
		p.__defineSetter__("canvasSize", function(s) {
			p.size(s.w || s.width || 100,
			       s.h || s.height || 100);
		});

		p.__defineSetter__("canvasBackground", function(c) {
			p.background(c.red, c.green, c.blue, c.alpha);
		});

		p.drawLine = function(x1, y1, x2, y2) {
			if(typeof x1 == 'object') {
				p.line(x1.from.x,
				       x1.from.y,
				       x1.to.x,
				       x1.to.y);
			} else {
				p.line(x1, y1, x2, y2);
			}
		};

		p.drawLinesBetween = function(points) {
			if(points.length < 2) {
				console.log('@drawLinesBetween needs at least 2 points!');
				return;
			}
			for(var i = 1; i < points.length; i++) {
				var p0 = points[i-1];
				var p1 = points[i];
				p.line(p0.x, p0.y, p1.x, p1.y);
			}
		};

		p.drawTriangle = function(x1, y1, x2, y2, x3, y3) {
			if(typeof x1 == 'object') {
				p.triangle(x1.a.x || x1.a.posX || 0,
				           x1.a.y || x1.a.posY || 0,
				           x1.b.x || x1.b.posX || 0,
				           x1.b.y || x1.b.posY || 0,
				           x1.c.x || x1.c.posX || 0,
				           x1.c.y || x1.c.posY || 0);
			} else {
				p.triangle(x1, y1, x2, y2, x3, y3);
			}
		};

		p.drawRect = function(x, y, w, h) {
			if(typeof x == 'object') {
				p.rect(x.x || x.posX || 0,
				       x.y || x.posY || 0,
				       x.w || x.width,
				       x.h || x.height);
			} else {
				p.rect(x, y, w, h);
			}
		};

		p.drawSquare = function(x, y, s) {
			if(typeof x == 'object') {
				p.rect(x.x || x.posX || 0,
				       x.y || x.posY || 0,
				       x.s || x.size || 0,
				       x.s || x.size || 0);
			} else {
				p.rect(x, y, s, s);
			}
		};

		p.drawEllipse = function(x, y, w, h) {
			if(typeof x == 'object') {
				p.ellipse(x.x || x.posX,
				          x.y || x.posY || 0,
				          x.w || x.width || 0,
				          x.h || x.height);
			} else {
				p.ellipse(x, y, w, h);
			}
		};

		p.drawCircle = function(x, y, r) {
			if(typeof x == 'object') {
				p.ellipse(x.x || x.posX || 0,
				          x.y || x.posY || 0,
				          x.r || x.radius,
				          x.r || x.radius);
			} else {
				p.ellipse(x, y, r, r);
			}
		};

		p.drawImage = function(file, x, y) {
			if(p.__imageData[file] !== undefined) {
				if(x === undefined) {
					x = 0;
					y = 0;
				}
				if(typeof x == 'object') {
					y = x.y || x.yPos;
					x = x.x || x.xPos;
				}
				$('#processing')[0].getContext('2d').putImageData(p.__imageData[file], x, y);
			} else {
				console.log('Image file "' + file + '" has not been loaded.');
			}
		};

		p.sizeOfImage = function(file) {
			var img = p.__imageData[file];
			if(img !== undefined) {
				return {
					width: img.width,
					height: img.height,
				};
			}
		};

		p.makeNewImage = function(name, w, h) {
			if(typeof w == 'string') {
				var file = w;
				var img = p.__imageData[file];
				if(img !== undefined) {
					var nimg = $('#processee-internal-canvas')[0].getContext('2d').createImageData(img.width, img.height);
					nimg.data.set(img.data);
				} else {
					console.log('Image file "' + file + '" has not been loaded.');
					return;
				}
			} else {
				if(typeof w == 'object') {
					h = w.height || w.h;
					w = w.width || w.w;
				}
				var nimg = $('#processee-internal-canvas')[0].getContext('2d').createImageData(w, h);
			}
			p.__imageData[name] = nimg;
			return nimg;
		};

		function getPixelFromArray(a, i) {
			return {
				red: a[i],
				green: a[i+1],
				blue: a[i+2],
				alpha: a[i+3],
			};
		};

		function setArrayFromPixel(a, i, p) {
			a[i] = p.red;
			a[i+1] = p.green;
			a[i+2] = p.blue;
			a[i+3] = p.alpha;
		};

		p.forEachPixelOf = function(file, fn) {
			var img = p.__imageData[file];
			if(img !== undefined) {
				var tempData = $('#processee-internal-canvas')[0].getContext('2d').createImageData(img.width, img.height);
				var x = 0, y = 0;
				for(var i = 0; i < img.data.length; i+=4) {
					var pixel = getPixelFromArray(img.data, i);
					pixel.x = x;
					pixel.y = y;
					var result = fn.call(p, pixel);
					setArrayFromPixel(tempData.data, i, result);
					if(++x == img.width) {
						x = 0;
						y++;
					}
				}
				p.__imageData[file] = tempData;
			} else {
				console.log('Image file "' + file + '" has not been loaded.');
			}
		};

		p.forEachGridOf = function(file, fn) {
			var img = p.__imageData[file];
			if(img !== undefined) {
				var tempData = $('#processee-internal-canvas')[0].getContext('2d').createImageData(img.width, img.height);
				for(var x = 1; x < img.width - 1; x++) {
					for(var y = 1; y < img.height - 1; y++) {
						var pixels = [];
						var i = x*4 + y*4*img.width;
						for(var dx = -1; dx < 2; dx++) {
							for(var dy = -1; dy < 2; dy++) {
								var di = (x + dx)*4 + (y + dy)*4*img.width;
								var pixel = getPixelFromArray(img.data, di);
								pixel.x = x + dx;
								pixel.y = y + dy;
								pixels.push(pixel);
							}
						}
						result = fn.call(p, pixels);
						setArrayFromPixel(tempData.data, i, result);
					}
				}
				p.__imageData[file] = tempData;
			} else {
				console.log('Image file "' + file + '" has not been loaded.');
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
			window.logCount = 0;
			return function(pixels) {
				var sumR = 0, sumG = 0, sumB = 0;
				for(var i = 0; i < mat.length; i++) {
					sumR += pixels[i].red * mat[i] * scale;
					sumG += pixels[i].green * mat[i] * scale;
					sumB += pixels[i].blue * mat[i] * scale;
				}
				return rgb(sumR, sumG, sumB);
			};
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

		p.__stack = [];
		p.__stackSet = function() {
			var c = p.__stack[p.__stack.length-1];
			p.colorMode(c.mode);
			p.fill(c.fill.red, c.fill.green, c.fill.blue, c.fill.alpha);
			p.stroke(c.stroke.red, c.stroke.green, c.stroke.blue, c.stroke.alpha);
		};
		p.__stackPush = function() {
			var c = p.__stack[p.__stack.length-1];
			p.__stack.push({
				mode: c.mode,
				fill: c.fill,
				stroke: c.stroke,
				origin: {x: 0, y: 0},
				rotation: 0,
			});
		};
		p.__stackPop = function() {
			var o = p.__stack.pop();
			p.translate(-o.origin.x, -o.origin.y);
			p.rotate(-o.rotation);
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

		p.setup = function() {
			p.rectMode(p.CENTER);
			var setups = window.processee.setups;
			for(var i = 0; i < setups.length; i++) {
				setups[i].call(p);
			}
			
			p.__loadImages(); // Calls __onSetup eventually
		};

		p.__onSetup = function() {
			var procedures = window.processee.procedures;
			for(var i = 0; i < procedures.length; i++) {
				p.reset();
				procedures[i].procedure.call(p);
			}
		};

		p.draw = function() {
		};
	}
};
