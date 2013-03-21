$(document).ready(function() {
	window.cm = CodeMirror.fromTextArea($('#codemirror')[0], {
		mode: 'coffeescript',
		//theme: 'monokai',
		lineNumbers: true,
	});

	var resize = function() {
		window.cm.setSize(null, $(window).height());
		window.cm.refresh();
	};
	$(window).resize(resize);
	resize();

	$('#output').toggle(false);

	window.run = function() {
		$('#output').toggle(true);
		function using(set, fn) {
			set();
			fn();
			//reset();
		};
		eval(CoffeeScript.compile(window.cm.getValue()));
	};

	window.stop = function() {
		$('#output').toggle(false);
		if(window.processingInstance) window.processingInstance.exit();
	};

	$('.output').click(function() {
		stop();
	});

	function processingShim(p) {
		var shim = {};
		for(key in p) {
			shim[key] = p[key];
		}
		shim.reset = function() {
			p.fill(255);
			p.stroke(0);
		};
		shim.with = function(set, fn) {
			set.call(shim);
			fn.call(shim);
			shim.reset();
		};
		return shim;
	};

	var processing = {
		do: function(fn) {
			if(window.processingInstance) window.processingInstance.exit();
			window.processingInstance = new Processing(
				document.getElementById('processing'),
				processee(fn));
		},
	};
});