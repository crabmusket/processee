function rgb(r, g, b) {
	return {
		mode: 'rgb',
		x: r, y: g, z: b,
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

function processee(fn) {
	return function(p) {
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
			});
		};
		p.__stackPop = function() {
			p.__stack.pop();
			p.__stackSet();
		};

		p.reset = function() {
			p.__stack = [{
				mode: p.RGB,
				fill: { x: 255, y: 255, z: 255 },
				stroke: { x: 0, y: 0, z: 0 },
			}];
			p.__stackSet();
		};

		p.do = function(fn) {
			p.__stackPush();
			fn.call(p);
			p.__stackPop();
		};

		p.setup = function() {
			p.reset();
			fn.call(p);
		};
		p.draw = function() {
		};
	}
};
