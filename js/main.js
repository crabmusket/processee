window.setExampleByHash = function() {
	if(location.hash != '') {
		var text = $('#ex-'+location.hash.substring(1)).text().substring(1);
		if(text) {
			window.cm.setValue(text);
		}
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

$(document).ready(function() {
	window.cm = CodeMirror.fromTextArea($('#codemirror')[0], {
		mode: 'processee',
		theme: 'processee-light',
		lineNumbers: true,
	});

	$('.webcam').toggle(false);
	window.setExampleByHash();

	window.positionOutput = function() {
		var output = $('#output');
		$('#output').css({
			left: $(window).width() * 2/3 - $('#processing').width()/2,
			top: $(window).height() / 10,
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
});

