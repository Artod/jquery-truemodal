/*
* jQuery TrueModal
* 09.06.2014 (c) http://artod.ru
*/

;(function($, window, document) {
	'use strict';

	var $window = $(window),
		$body,
		$html,
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
		$html = $('html');
		$body.append('<div id="true-modals"></div>');

		$('head').append('<style>\n' +
		'	#true-modals {}\n' +
		'		#true-modals .true-modal{display:none; position:fixed; top:0; left:0; right:0; bottom:0; z-index:1000;}\n' +
		'			#true-modals .true-modal-overlay{position:absolute; top:0; left:0; background-color:#000; height:100%; width:100%; z-index:1000;}\n' +
		'			#true-modals .true-modal-viewport{position:absolute; top:0; left:0;  height:100%; width:100%; z-index:1000; -webkit-overflow-scrolling: touch;}\n' +
		'				#true-modals .true-modal-container{position:relative; top:0; left:0; background-color:transparent; margin:0px 0px 20px 0px; float:left;}\n' +
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
			render: function(content, modal) {
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
		
		this.currentScroll = null; // for setting scroll because in some browsers there are auto scroll if set empty hash and in IE trables

		this.$container.append( this.opts.render(this.opts.content, this) );

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

			var margin = $html.data('true-modal-margin');

			$html.css({
				overflow: 'visible',
				'margin-right': margin
			});

			if (this.currentScroll !== null) {
				$window.scrollTop(this.currentScroll);		
			}
			
			this.opts.afterBodyOverflowOn(this, margin);
		},
		bodyOverflowOff: function() {
			if (this.opts.statical || $html.css('overflow') === 'hidden') {
				return false;
			}			

			this.currentScroll = $window.scrollTop();

			var currentMargin = $html.css('margin-right');
			$html.data('true-modal-margin', currentMargin);

			var oldBodyOuterWidth = $html.outerWidth();
			$html.css({overflow: 'hidden'});

			var newBodyOuterWidth = $html.outerWidth(),
				margin = newBodyOuterWidth - oldBodyOuterWidth + parseInt(currentMargin);

			$html.css('margin-right', margin + 'px');

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
			if (top === 'auto') {
				top = 10;
				
				if (!this.opts.statical) {
					top = Math.round( ( $window.height() - this.$container.outerHeight() ) / 3 );
				}
				
				if (top < 10) {
					top = 10;
				}
			}

			if (this.opts.width) {
				this.$container.width(this.opts.width);
			}

			var $viewport = this.opts.statical ? $document : $window,
				margin = Math.round( ( $viewport.width() - this.$container.outerWidth() ) / 2 );

			this.$container.css({
				'margin-left': (margin < 0 ? 0 : margin) + 'px',
				top: (this.opts.statical ? $viewport.scrollTop() : 0) + parseInt(top) + 'px'
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