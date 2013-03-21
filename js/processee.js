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
		p.make = {
			rect: function(r) {
				p.rect(r.x || r.posX,
					   r.y || r.posY,
					   r.w || r.width,
					   r.h || r.height);
			},
		};

		p.set = {};
		p.set.__defineSetter__("fill", function(c) {
			if(!c.mode) {
				console.log('Cannot fill without a mode. Given:', c);
				return;
			}
			p.__stack[p.__stack.length-1].mode = c.mode == 'hsv' ? p.HSV : p.RGB;
			p.__stack[p.__stack.length-1].fill = {x: c.x, y: c.y, z: c.z};
			p.__stackSet();
		});

		p.set.__defineSetter__("stroke", function(c) {
			if(!c.mode) {
				console.log('Cannot stroke without a mode. Given:', c);
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
		};
		p.draw = function() {
			fn.call(p);
		};
	}
};
