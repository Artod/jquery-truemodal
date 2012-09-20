/*
* TrueModal 20.09.2012
* (c) 2012 Artod, http://artod.ru
*/

;(function($, window, document) {
	'use strict';

	var $window = $(window),
		$body,
		$mainContainer,
		$document = $(document),
		profiles = {},
		modals = {},
		getUID = (function() {
			var id = 0;
			return function() {
				return id++;
			};
		})(),		
		switchAction = function(action, obj) {
			if ( $.isFunction(action) ) {
				return action();			
			} else if ( $.isFunction(obj[action]) ) {
				return obj[action]();
			}
		};

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

		$.trueModal.$container = $mainContainer = $('#true-modals');

		$window.on('keyup.trueModal', function(e) {
			var attrId = $mainContainer.find('> div.true-modal:visible').last().attr('id');

			if (!attrId) {
				return;
			}

			var modal = $.trueModal.getObjByAttrId(attrId);

			if (!modal || e.keyCode != 27) {
				return;
			}

			switchAction(modal.opts.onEsc, modal);
		});
	});

	var TrueModal = function(optionsOrProfile, options) {
		var profile;

		if (typeof optionsOrProfile == 'object') {
			var options = optionsOrProfile;
		} else {
			profile = optionsOrProfile;
		}

		this.opts = $.extend({
			content: {html: ''},
			template: '{html}',
			spacerSelector: '',
			width: 0,
			autoShow: true,
			onEsc: 'remove',
			onOverlayClick: 'remove',
			overlayOpacity: 0.3,
			containerTop: 'auto',
			statical: false,			
			beforeShow: $.noop,
			afterShow: $.noop,
			beforeHide: $.noop,
			afterHide: $.noop,
			beforeClear: $.noop,
			afterClear: $.noop,
			beforeRemove: $.noop,
			afterRemove: $.noop
		}, (profiles[profile] ? profiles[profile] : {}), options);

		this.bodyMargin = 0;

		var id = getUID();
		this.getId = function() {
			return id;
		};

		this.attrId = 'true-modal-' + id;

		modals[id] = this;

		$mainContainer.append('<div class="true-modal" id="' + this.attrId + '"><div class="true-modal-overlay"></div><div class="true-modal-viewport"><div class="true-modal-container"></div></div></div>');

		this.$modal = $('#' + this.attrId);
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

		if (this.opts.onOverlayClick) {
			this.$modal.on('click.trueModal', this.$viewport, function(e) {
				if ( $(e.target).hasClass('true-modal-viewport') ) {
					switchAction(self.opts.onOverlayClick, self);
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
			if (this.opts.beforeShow(this) === false) {
				return;
			}

			this.bodyOverflowOff();

			this.$modal.show();

			this.adjustContainer();
			this.adjustModal();

			this.opts.afterShow(this);
		},
		hide: function() {
			if (this.opts.beforeHide(this) === false) {
				return;
			}

			this.$modal.hide();
			this.bodyOverflowOn();

			this.opts.afterHide(this);
		},
		remove: function() {
			if (!modals[this.getId()] || this.opts.beforeRemove(this) === false) {
				return;
			}

			this.$modal.remove();
			this.bodyOverflowOn();

			this.opts.afterRemove(this);

			delete modals[this.getId()];
		},
		clear: function() {
			if (this.opts.beforeClear(this) === false) {
				return;
			}

			this.$container.empty();

			this.opts.afterClear(this);
		},
		bodyOverflowOn: function() {
			if (this.opts.statical) {
				return false;
			}

			if (!$mainContainer.find('> div:visible').length) {
				$body.css({
					overflow: 'visible',
					'margin-right': $body.data('true-modal-margin')
				});
			}
		},
		bodyOverflowOff: function() {
			if (this.opts.statical || $body.css('overflow') == 'hidden') {
				return false;
			}

			var currentMargin = $body.css('margin-right');
			$body.data('true-modal-margin', currentMargin);

			var oldBodyOuterWidth = $body.outerWidth();
			$body.css({overflow: 'hidden'});

			var newBodyOuterWidth = $body.outerWidth();

			$body.css('margin-right', ( newBodyOuterWidth - oldBodyOuterWidth + parseInt(currentMargin) ) + 'px');
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
		go: function(optionsOrProfile, options) {
			return new TrueModal(optionsOrProfile, options);
		},
		addProfile: function(name, options) {
			profiles[name] = options;
		},
		getObjByAttrId: function(attrId) {
			return modals[attrId.replace('true-modal-', '')];
		},
		getAll$modals: function(onlyActive) {
			return $mainContainer.find( '> div.true-modal' + (onlyActive ? ':visible' : '') );
		},
		$container: null
	};
})(jQuery, window, document);