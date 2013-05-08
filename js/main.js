window.setExampleByHash = function() {
	if(location.hash != '') {
		var text = $('#ex-'+location.hash.substring(1)).text().substring(1);
		if(text) {
			window.cm.setValue(text);
		}
		window.processee.run();
	}
};
window.addEventListener("hashchange", window.setExampleByHash, false);

function hideAbout() {
	$('.about').fadeOut('fast');
};
function showAbout() {
	$('.about').fadeIn('fast');
};
function toggleAbout() {
	$('.about').fadeToggle('fast');
}

function saveSketch() {
	var blob = new Blob([window.cm.getValue()], {
		type: "text/plain;charset=utf-8;",
	});
	saveAs(blob, "sketch.coffee");
}

$(document).ready(function() {
	window.cm = CodeMirror.fromTextArea($('#codemirror')[0], {
		mode: 'processee',
		theme: 'processee-light',
		lineNumbers: true,
		tabMode: 'shift',
		extraKeys: {
			'Ctrl-Enter': window.processee.run,
		},
	});

	$('.webcam').toggle(false);

	window.positionOutput = function() {
		var output = $('#output');
		$('#output').css({
			left: $(window).width() * 2/3 - $('#processing').width()/2,
			top: ($(window).height()/3 > $('#processing').height()/2)
				? $(window).height() * 1/3 - $('#processing').height()/2
				: $(window).height() * 1/2 - $('#processing').height()/2,
		});
	};

	var resize = function() {
		window.cm.setSize(null, $(window).height());
		window.cm.refresh();
		window.positionOutput();
	};
	$(window).resize(resize);
	resize();

	$('.about').toggle();
	$('.about a').click(hideAbout);

	var canvas = $('#processing');
	var pageToCanvas = function(e, t) {
		var o = canvas.offset();
		return {
			x: e.pageX - o.left,
			y: e.pageY - o.top,
			type: t,
		};
	};

	canvas.mousedown(function(e) {
		window.processingInstance.__mouseEvent(pageToCanvas(e, 'click'));
	});
	canvas.mousemove(function(e) {
		window.processingInstance.__mouseEvent(pageToCanvas(e, 'move'));
	});

	window.setExampleByHash();
});

