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
		eval(CoffeeScript.compile(window.cm.getValue()));
	};

	window.stop = function() {
		$('#output').toggle(false);
		if(window.processingInstance) window.processingInstance.exit();
	};

	$('.output').click(function() {
		stop();
	});

	var processing = {
		do: function(fn) {
			if(window.processingInstance) window.processingInstance.exit();
			window.processingInstance = new Processing(
				document.getElementById('processing'),
				processee(fn));
		},
	};
});