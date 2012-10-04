trueModal
========

Modal popup with non scrollable background.
Copyright (c) 2012 Artod - gartod@gmail.com

Demo
----------

http://artod.ru/true-modal/demo/

How to use
----------

To get started, download the plugin, unzip it and copy files to your website/application directory.
Load files in the 'head' section of your HTML document. Make sure you also add the jQuery library.

    <head>
        <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7/jquery.min.js"></script>		
        <script src="jquery.truemodal.js"></script>
    </head>

Initialise the script like this:

    <script>
        $(document).ready(function() {
			var modal = $.trueModal.go({
				content: 'Hello :)',
				width: 200
			});
        });
    </script>

May also be passed an optional options object which will extend the default values. Example:

    <script>
        $(document).ready(function() {
			var isMobileBrowser = false; // need define mobile browser

			var modal = $.trueModal.go({
				content: {
					html: 'Hello! :)',
					button: '<input type="button" value="OK" class="true-modal-remove" /> | <input type="button" value="Cancel" class="true-modal-remove" />'
				},
				render: function(content) {
					return '<div style="text-align:right;"><a href="#" class="true-modal-remove">Close</a> | <a href="#" class="true-modal-hide">Hide</a></div> <div>' + content.html + '</div><div>' + content.button + '</div>';
				},
				statical: isMobileBrowser,
				containerTop: 20,
				overlayOpacity: 0.3,
				width: 500,
				onOverlayClick: 'remove',
				onEsc: 'hide',
				beforeRemove: function(modal) {
					return confirm('You sure?');
				},
				afterRemove: function(modal) {
					alert('afterRemove');
				},
				beforeHide: function(modal) {
					alert('beforeHide');
				},
				afterHide: function(modal) {
					alert('afterHide');
				},
				beforeShow: function(modal) {
					alert('beforeShow');
				},
				afterShow: function(modal) {
					alert('afterShow');
				}
			});
        });
    </script>

You can create profiles in order to not pass options many time:

    <script>
        $(document).ready(function() {
			$.trueModal.addProfile('loader', {
				content: '<img src="loader.gif" />',
				width: 50,
				autoShow: true
			});

			window.trueModalLoader = $.trueModal.go('loader', {
				onEsc: 'hide',
				onOverlayClick: 'hide',
				autoShow: false,
				beforeRemove: function() {
					return false;
				}
			});
	
			window.trueModalLoader.show();
        });
    </script>