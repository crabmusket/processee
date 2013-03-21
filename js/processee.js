function processee(fn) {
	return function(p) {
		p.make = {
			rect: function(x, y, w, h) {
				if(typeof x == "object") {
					if(typeof x.pos == "object") {
						x.x = x.pos.x || x.x;
						x.y = x.pos.y || x.y;
					}
					p.rect(x.x || x.posX,
						   x.y || x.posY,
						   x.w || x.width,
						   x.h || x.height);
				} else {
					p.rect(x, y, w, h);
				}
			},
		};
		p.setup = function() {
			//reset();
		};
		p.draw = function() {
			fn.call(p);
		};
		p.reset = function() {
			p.fill(255);
			p.stroke(0);
		};
		p.with = function(set, fn) {
			set.call(p);
			fn.call(p);
			p.reset();
		};
	}
};
