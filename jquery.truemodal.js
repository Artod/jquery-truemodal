/*
* jQuery TrueModal
* 01.10.2012 (c) http://artod.ru
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
		'		#true-modals .true-modal{display:none; position:fixed; top:0; left:0; right:0; bottom:0; z-index:1000;}\n' +
		'			#true-modals .true-modal-overlay{position:absolute; top:0; left:0; background-color:#000; height:100%; width:100%; z-index:1000;}\n' +
		'			#true-modals .true-modal-viewport{position:absolute; top:0; left:0;  height:100%; width:100%; z-index:1000; -webkit-overflow-scrolling: touch;}\n' +
		'				#true-modals .true-modal-container{position:relative; background-color:transparent; margin:0px 0px 20px 0px; left:50%; float:left;}\n' +
		'</style>');

		$.trueModal.$container = $mainContainer = $('#true-modals');

		$window.on('keyup.trueModal', function(e) {
			var attrId = $mainContainer.find('> div.true-modal:visible').last().attr('id');

			if (!attrId) {
				return;
			}

			var modal = $.trueModal.getModalById(attrId);

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
			content: '',
			width: 0,
			autoShow: true,
			overlayOpacity: 0.3,
			containerTop: 'auto',
			statical: false,
			onEsc: 'remove',
			onOverlayClick: 'remove',
			render: function(content) {
				return content;
			},
			afterBodyOverflowOn: function(modal, margin) { },
			afterBodyOverflowOff: function(modal, margin) { },
			beforeShow: function(modal) { },
			afterShow: function(modal) { },
			beforeHide: function(modal) { },
			afterHide: function(modal) { },
			beforeClear: function(modal) { },
			afterClear: function(modal) { },
			beforeRemove: function(modal) { },
			afterRemove: function(modal) { }
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

		this.$container.append( this.opts.render(this.opts.content) );

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
		show: function(noFilter) {
			if (!noFilter && this.opts.beforeShow(this) === false) {
				return;
			}

			this.bodyOverflowOff();

			this.$modal.show();

			this.adjustContainer();
			this.adjustModal();

			this.opts.afterShow(this);
		},
		hide: function(noFilter) {
			if (noFilter !== true && this.opts.beforeHide(this) === false) {
				return;
			}

			this.$modal.hide();
			this.bodyOverflowOn();

			this.opts.afterHide(this);
		},
		remove: function(noFilter) {
			if (!modals[this.getId()] || ( noFilter !== true && this.opts.beforeRemove(this) === false )) {
				return;
			}

			this.$modal.remove();
			this.bodyOverflowOn();

			this.opts.afterRemove(this);

			delete modals[this.getId()];
		},
		clear: function(noFilter) {
			if (noFilter !== true && this.opts.beforeClear(this) === false) {
				return;
			}

			this.$container.empty();

			this.opts.afterClear(this);
		},
		bodyOverflowOn: function() {
			if (this.opts.statical || $mainContainer.find('> div.true-modal:visible').length) {
				return false;
			}

			var margin = $body.data('true-modal-margin');

			$body.css({
				overflow: 'visible',
				'margin-right': margin
			});

			this.opts.afterBodyOverflowOn(this, margin);
		},
		bodyOverflowOff: function() {
			if (this.opts.statical || $body.css('overflow') == 'hidden') {
				return false;
			}

			var currentMargin = $body.css('margin-right');
			$body.data('true-modal-margin', currentMargin);

			var oldBodyOuterWidth = $body.outerWidth();
			$body.css({overflow: 'hidden'});

			var newBodyOuterWidth = $body.outerWidth(),
				margin = newBodyOuterWidth - oldBodyOuterWidth + parseInt(currentMargin);

			$body.css('margin-right', margin + 'px');

			this.opts.afterBodyOverflowOff(this, margin);
		},
		adjustModal: function() {
			if (!this.opts.statical) {
				return false;
			}

			this.$overlay.add(this.$viewport).css({
				height: $document.height(),
				width: $document.width()
			});
		},
		adjustContainer: function() {
			var top = this.opts.containerTop;
			if (top == 'auto') {
				top = Math.round(($window.height() - this.$container.outerHeight())/3);

				if (top < 0) {
					top = 10;
				}
			}

			if (this.opts.width) {
				this.$container.width(this.opts.width);
			}

			this.$container.css({
				'margin-left': '-' + this.$container.width()/2 + 'px',
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
		getModalById: function(id) {
			return modals[(id + '').replace('true-modal-', '')];
		},
		getModalByElem: function($el) {
			var $modal = $el.hasClass('div.true-modal') ? $el : $el.closest('div.true-modal');

			return $modal.length ? modals[ $modal.attr('id').replace('true-modal-', '') ] : null;
		},
		getAllModals: function() {
			return modals;
		},
		removeAll: function() {
			$.each(modals, function(id, modal) {
				modal.remove();
			});
		},
		$container: null
	};
})(jQuery, window, document);