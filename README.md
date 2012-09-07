trueModal
========

Modal popup with non scrollable background.

Copyright (c) 2012 Artod - gartod@gmail.com

How to use
----------

To get started, download the plugin, unzip it and copy files to your website/application directory.
Load files in the <head> section of your HTML document. Make sure you also add the jQuery library.

    <head>
        <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7/jquery.min.js"></script>
		<script src="jquery.nano.js"></script>
        <script src="jquery.truemodal.js"></script>
    </head>

Initialise the script like this:

    <script>
        $(document).ready(function() {
			var modal = $.trueModal.go({
				content: {
					html: 'Hello :)'
				},
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
				static: isMobileBrowser,
				containerTop: 20,
				overlayOpacity: 0.3,
				width: 500,
				template: '<div style="text-align:right;"><a href="#" class="true-modal-remove">Close</a> | <a href="#" class="true-modal-hide">Hide</a></div> <div>{html}</div><div>{button}</div>',				
				overlayClickClose: true,				
				beforeShow: function() {
					alert('beforeShow');
				},
				afterShow: function() {
					alert('afterShow');
				},
				beforeRemove: function() {
					alert('beforeRemove');
				},
				afterRemove: function() {
					alert('afterRemove');
				},
				beforeHide: function() {
					alert('beforeHide');
				},
				afterHide: function() {
					alert('afterHide');
				}
			});
        });
    </script>

May be used profiles. Example:

You can create profiles order to not pass options many time. Example:

    <script>
        $(document).ready(function() {
			$.trueModal.addProfile('myProfile1', {
				static: isMobileBrowser,
				containerTop: 20,
				width: 500,
				template: '<b>{html}</b>'				
			});
			
			var modal = $.trueModal.go({
				content: {
					html: 'Hello! :)'
				},
				profile: 'myProfile1'
			});
        });
    </script>