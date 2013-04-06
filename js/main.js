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
	$('#output').toggle(false);
	window.setExampleByHash();

	var resize = function() {
		window.cm.setSize(null, $(window).height());
		window.cm.refresh();
	};
	$(window).resize(resize);
	resize();

	$('.output').click(function() {
		window.processee.stop();
	});

	$('.about').toggle();
	$('.about a').click(hideAbout);
});

