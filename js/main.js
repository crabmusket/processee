$(document).ready(function() {
	window.cm = CodeMirror.fromTextArea($('#codemirror')[0], {
		mode: 'processee',
		theme: 'processee-light',
		lineNumbers: true,
	});

	$('#output').toggle(false);

	var resize = function() {
		window.cm.setSize(null, $(window).height());
		window.cm.refresh();
	};
	$(window).resize(resize);
	resize();

	$('.output').click(function() {
		window.processee.stop();
	});
});

window.processee = {
	procedures: [],
	setups: [],

	do: function(fn) {
		window.processee.procedures.push({
			layer: 1,
			procedure: fn,
		});
	},

	setup: function(fn) {
		window.processee.setups.push(fn);
	},

	doOnLayer: function(layer, fn) {
		window.processee.procedures.push({
			layer: layer,
			procedure: fn,
		});
	},

	run: function() {
		$('#output').toggle(true);
		eval(CoffeeScript.compile(window.cm.getValue()));
		window.processee.procedures.sort(function(a, b) { return a.layer - b.layer; });
		if(window.processingInstance) window.processingInstance.exit();
		window.processingInstance = new Processing($('#processing')[0],
			window.processee.create());
	},

	stop: function() {
		$('#output').toggle(false);
		if(window.processingInstance) window.processingInstance.exit();
	},
};
