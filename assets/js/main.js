/*
	Sacred Hollow Reiki Main Script
	Cleaned and Optimized
*/

(function($) {

	var	$window = $(window),
		$body = $('body'),
		$html = $('html');

	// Breakpoints. (Relies on assets/js/breakpoints.min.js)
	breakpoints({
		large:   [ '981px',  '1680px' ],
		medium:  [ '737px',  '980px'  ],
		small:   [ '481px',  '736px'  ],
		xsmall:  [ null,     '480px'  ]
	});

	// Play initial animations on page load.
	$window.on('load', function() {
		window.setTimeout(function() {
			$body.removeClass('is-preload');
		}, 100);
	});

	// Touch mode adjustments
	if (browser.mobile) {
		$html.addClass('is-touch');
	}

	// Initialize Smooth Scrolling (Scrolly)
	// (Relies on assets/js/jquery.scrolly.min.js)
	$('.scrolly').scrolly({
		speed: 1000,
		offset: function() { return 0; }
	});

	// Header Title Fade Effect on Scroll
	var $header = $('#header'),
		$headerTitle = $header.find('header');

	$window.on('scroll', function() {
		// Only fade if we are actually scrolling past header
		var progress = Math.min(1, $window.scrollTop() / ($header.height() - 100));
		
		if (progress > 0) {
			$headerTitle.css('opacity', 1 - progress);
		} else {
			$headerTitle.css('opacity', 1);
		}
	});

})(jQuery);