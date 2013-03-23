function rgb(r, g, b) {
	return {
		mode: 'rgb',
		x: r, y: g, z: b,
	};
}

function rgba(r, g, b, a) {
	return {
		mode: 'rgb',
		x: r, y: g, z: b, w: a
	};
}

function gray(v) {
	return {
		mode: 'rgb',
		x: v, y: v, z: v,
	};
}

function hsv(h, s, v) {
	return {
		mode: 'hsv',
		x: h, y: s, z: v,
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
			p.background(c.x, c.y, c.z, c.w);
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

		p.__defineSetter__("fillColor", function(c) {
			if(!c.mode) {
				console.log('Cannot set fill without a color mode. Given:', c);
				return;
			}
			p.__stack[p.__stack.length-1].mode = c.mode == 'hsv' ? p.HSV : p.RGB;
			p.__stack[p.__stack.length-1].fill = {x: c.x, y: c.y, z: c.z};
			p.__stackSet();
		});

		p.__defineSetter__("strokeColor", function(c) {
			if(!c.mode) {
				console.log('Cannot set stroke without a color mode. Given:', c);
				return;
			}
			p.__stack[p.__stack.length-1].stroke = {x: c.x, y: c.y, z: c.z};
			p.__stackSet();
		});

		p.__defineSetter__("origin", function(o) {
			var c = p.__stack[p.__stack.length-1].origin;
			p.translate(-c.x, -c.y);
			p.__stack[p.__stack.length-1].origin = {
				x: (o.x || o.posX || 0),
				y: (o.y || o.posY || 0)
			};
			p.translate(o.x || o.posX || 0, o.y || o.posY || 0);
			p.__stackSet();
		});

		p.__defineSetter__("rotation", function(r) {
			var c = p.__stack[p.__stack.length-1];
			p.rotate(-c.rotation);
			p.__stack[p.__stack.length-1].rotation = r;
			p.rotate(r);
			p.__stackSet();
		});

		p.__stack = [];
		p.__stackSet = function() {
			var c = p.__stack[p.__stack.length-1];
			p.colorMode(c.mode);
			p.fill(c.fill.x, c.fill.y, c.fill.z);
			p.stroke(c.stroke.x, c.stroke.y, c.stroke.z);
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
				fill: { x: 255, y: 255, z: 255 },
				stroke: { x: 0, y: 0, z: 0 },
				origin: { x: 0, y: 0 },
				rotation: 0,
			}];
			p.__stackSet();
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
