/*
* TrueModal 07.09.2012
* (c) 2012 Artod, http://artod.ru
*/

;(function($, window, document) {
	'use strict';		

	var $window = $(window),
		$body,
		$mainContainer,
		$document = $(document),
		profiles = {},
		getUID = (function() {
			var id = 0;
			return function() {
				return id++;
			};
		})();

	$(function() {
		$body = $('body');		
		$body.append('<div id="true-modals"></div>');
		
		$('head').append('<style>\n' +
		'	#true-modals {}\n' +
		'		#true-modals .true-modal{display:none; position:fixed; top:0; left:0; right:0; bottom:0;}\n' +
		'			#true-modals .true-modal-overlay{position:absolute; top:0; left:0; background-color:#000; height:100%; width:100%; z-index:100;}\n' +
		'			#true-modals .true-modal-viewport{position:absolute; top:0; left:0;  height:100%; width:100%; z-index:100; -webkit-overflow-scrolling: touch;}\n' +
		'				#true-modals .true-modal-container{position:relative; background-color:transparent; margin:0px auto 20px auto;}\n' +
		'</style>');
		
		$mainContainer = $('#true-modals');
	});
	
	var TrueModal = function(options) {
		this.opts = $.extend({
			content: {html: ''},
			template: '{html}',
			spacerSelector: '',
			width: 0,
			autoShow: true,
			overlayClickClose: true,
			overlayOpacity: 0.2,
			containerTop: 'auto',
			statical: false,
			beforeShow: $.noop,
			afterShow: $.noop,
			beforeRemove: $.noop,
			afterRemove: $.noop,
			beforeHide: $.noop,
			afterHide: $.noop,
			beforeClear: $.noop,
			afterClear: $.noop				
		}, profiles[options.profile] ? profiles[options.profile] : {}, options);
		this.bodyMargin = 0;

		var id = getUID(),
			attrId = 'true-modal-' + id;

		$mainContainer.append('<div class="true-modal" id="' + attrId + '"><div class="true-modal-overlay"></div><div class="true-modal-viewport"><div class="true-modal-container"></div></div></div>');
			
		this.$modal = $('#' + attrId);
		this.$overlay = $('div.true-modal-overlay', this.$modal);
		this.$container = $('div.true-modal-container', this.$modal);
		this.$viewport = $('div.true-modal-viewport', this.$modal);

		this.$container.append( $.nano(this.opts.template, this.opts.content) );
		
		if (this.opts.spacerSelector) {
			this.$spacer = this.$container.find(this.opts.spacerSelector);
		}		

		this.$overlay.css({
			opacity: this.opts.overlayOpacity
		});

		if (this.opts.statical) {
			this.$modal.css({
				position: 'absolute'
			});
		} else {
			this.$viewport.css({
				'overflow-x': 'hidden',
				'overflow-y': 'auto'
			});
		}

		if (this.opts.autoShow) {
			this.show();
		}

		var self = this;

		if (this.opts.overlayClickClose) {
			this.$modal.on('click.trueModal', this.$viewport, function(e) {	
				if ( $(e.target).hasClass('true-modal-viewport') ) {
					self.remove();
					return false;					
				}				
			});
		}

		this.$modal.on('click.trueModal', '.true-modal-remove', function(e) {
			self.remove();
			return false;
		});

		this.$modal.on('click.trueModal', '.true-modal-hide', function(e) {
			self.hide();
			return false;
		});

		if (!this.opts.statical) {
			$window.on('resize.trueModal', function(e) {
				self.adjustContainer();				
				self.adjustModal();
			});
		}

		return this;
	};

	TrueModal.prototype = {
		show: function() {
			if (this.opts.beforeShow() === false) {
				return;
			}

			this.bodyOverflowOff();

			this.$modal.show();

			this.adjustContainer();
			this.adjustModal();

			this.opts.afterShow();
		},
		hide: function() {
			if (this.opts.beforeHide() === false) {
				return;
			}

			this.$modal.hide();
			this.bodyOverflowOn();

			this.opts.afterHide();
		},
		remove: function() {
			if (this.opts.beforeRemove() === false) {
				return;
			}

			this.$modal.remove();
			this.bodyOverflowOn();

			this.opts.afterRemove();
		},
		clear: function() {
			if (this.opts.beforeClear() === false) {
				return;
			}

			this.$container.empty();

			this.opts.afterClear();
		},
		bodyOverflowOn: function() {
			if (this.opts.statical) {	
				return false;
			}

			if (!$mainContainer.find('> div:visible').length) {
				$body.css({
					overflow: 'visible',
					'margin-right': 0
				});
				this.bodyMargin = 0;
			}
		},
		bodyOverflowOff: function() {
			if (this.opts.statical) {	
				return false;
			}

			var oldBodyOuterWidth = $body.outerWidth(true);

			$body.css({overflow: 'hidden'});

			var newBodyOuterWidth = $body.outerWidth(true);

			this.bodyMargin = (newBodyOuterWidth - oldBodyOuterWidth);

			$body.css('margin-right', (newBodyOuterWidth - oldBodyOuterWidth) + 'px');
		},
		adjustModal: function() {
			if (this.opts.statical) {					
				this.$overlay.add(this.$viewport).css({
					height: $document.height(),
					width: $document.width()
				});
			}
		},
		adjustContainer: function() {
			var top = this.opts.containerTop,
				width = this.opts.width;

			if (top == 'auto') {
				top = Math.round(($window.height() - this.$container.outerHeight())/3);
				
				if (top < 0) {
					top = 10;
				}
			}

			if (this.$spacer) {
				width = this.$spacer.outerWidth();
			}
			
			this.$container.css({
				width: width,
				top: (this.opts.statical ? $window.scrollTop() : 0) + top + 'px'
			});
		}
	};

	$.trueModal = {
		go: function(html, options) {
			var trueModal = new TrueModal(html, options);
	
			return trueModal;
		},
		addProfile: function(name, opts) {
			profiles[name] = opts;
		},
		$mainContainer: $mainContainer
	};
})(jQuery, window, document);