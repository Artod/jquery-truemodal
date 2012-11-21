test('Open/close', function() {
	expect(13);

	var getMessage = function(callback) {
		return 'Callback ' + callback + ' should be called';
	};

	var text = 'Test text';
	
	var modal = $.trueModal.go({
		content: {
			html: text,
			button: '<input type="button" value="OK" class="true-modal-remove" /> | <input type="button" value="Cancel" class="true-modal-remove" />'
		},
		render: function(content) {
			return '<div style="text-align:right;"><a href="#" class="true-modal-remove">Close</a> | <a href="#" class="true-modal-hide">Hide</a></div> <div>' + content.html + '</div><div>' + content.button + '</div>';
		},
		width: 300,
		autoShow: false,
		overlayOpacity: 0.3,
		containerTop: 'auto',
		statical: false,
		onEsc: 'remove',
		onOverlayClick: 'remove',
		afterBodyOverflowOn: function(modal, margin) {
			ok(true, getMessage('afterBodyOverflowOn'));
		},
		afterBodyOverflowOff: function(modal, margin) {
			ok(true, getMessage('afterBodyOverflowOff'));
		},
		beforeShow: function(modal) {
			ok(true, getMessage('beforeShow'));
		},
		afterShow: function(modal) {
			ok(true, getMessage('afterShow'));
			ok(modal.$modal.find('div:contains("' + text + '")').length, 'Popup should be filled.');

			modal.clear();
		},
		beforeHide: function(modal) {
			ok(true, getMessage('beforeHide'));
		},
		afterHide: function(modal) {
			ok(true, getMessage('afterHide'));

			modal.remove();
		},
		beforeClear: function(modal) {
			ok(true, getMessage('beforeClear'));
		},
		afterClear: function(modal) {
			ok(true, getMessage('afterClear'));
			ok(modal.$modal.find('div:contains("' + text + '")').length == 0, 'Popup should be empty.');

			modal.hide();
		},
		beforeRemove: function(modal) {
			ok(true, getMessage('beforeRemove'));
		},
		afterRemove: function(modal) {
			ok(true, getMessage('afterRemove'));
		}
	});

	modal.show();
});