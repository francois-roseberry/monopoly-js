(function() {
	"use strict";

	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	exports.render = function (container, tradeTask) {
		precondition(container, 'A TradeWidget requires a container to render into');
		precondition(tradeTask, 'A Tradewidget requires a TradeTask');
			
		var dialog = renderDialog(container[0], tradeTask);
			
		tradeTask.offer().subscribeOnCompleted(function () {
			dialog.remove();
		});
		
		$(dialog[0]).modal({
			'backdrop': 'static',
			'keyboard': false
		});		
		$(dialog[0]).modal('show');
	};
	
	function renderDialog(container, tradeTask) {
		var dialog = d3.select(container).append('div')
			.attr({
				'tabindex': '-1',
				'role': 'dialog'
			})
			.classed({
				'modal': true,
				'fade': true,
				'monopoly-trade-panel': true
			});
			
		var dialogContent = dialog
			.append('div')
			.attr('role', 'document')
			.classed('modal-dialog', true)
			.append('div')
			.classed('modal-content', true);
			
		dialogContent.append('div')
			.classed('modal-header', true)
			.append('h4')
			.attr('id', 'trade-title')
			.classed('modal-title', true)
			.text(i18n.TRADE_TITLE);
			
		var modalBody = dialogContent.append('div')
			.classed('modal-body', true);
		
		renderPlayerPanel(modalBody, tradeTask.currentPlayer(), tradeTask, 0);
		renderPlayerPanel(modalBody, tradeTask.otherPlayer(), tradeTask, 1);
		
		modalBody.append('div')
			.classed('clearfix', true);
		
		var modalFooter = dialogContent.append('div')
			.classed('modal-footer', true);
		
		renderCancelTradeButton(modalFooter, tradeTask);
		renderMakeOfferButton(modalFooter, tradeTask);
		
		return dialog;
	}
	
	function renderCancelTradeButton(container, tradeTask) {
		container.append('button')
			.attr({
				'type': 'button',
				'data-dismiss': 'modal',
				'data-ui': 'cancel-trade-btn'
			})
			.classed({
				'btn': true,
				'btn-default': true
			})
			.text(i18n.TRADE_CANCEL)
			.on('click', function () {
				tradeTask.cancel();
			});
	}
	
	function renderMakeOfferButton(container, tradeTask) {
		var makeOfferBtn = container.append('button')
			.attr({
				'type': 'button',
				'data-dismiss': 'modal',
				'data-ui': 'make-offer-btn'
			})
			.classed({
				'btn': true,
				'btn-primary': true
			})
			.text(i18n.TRADE_MAKE_OFFER)
			.on('click', function () {
				tradeTask.makeOffer();
			});
			
		tradeTask.offer()
			.map(function (offer) {
				return offer.isValid();
			})
			.subscribe(function (valid) {
				makeOfferBtn.attr('disabled', valid ? null : 'disabled');
			});
	}
	
	function renderPlayerPanel(container, player, tradeTask, playerIndex) {
		var panel = container.append('div')
			.classed('monopoly-trade-player-panel', true)
			.attr('data-ui', player.id());
			
		panel.append('span')
			.classed('monopoly-trade-player-name', true)
			.text(player.name());
			
		var list = panel.append('div')
			.classed('monopoly-trade-player-properties', true);
			
		tradeTask.offer()
			.map(function (offer) {
				return offer.propertiesFor(playerIndex);
			})
			.distinctUntilChanged()
			.subscribe(function (selectedProperties) {
				var items = list.selectAll('.monopoly-trade-player-property')
					.data(player.properties());
					
				items.enter()
					.append('button')
					.classed('monopoly-trade-player-property', true)
					.text(function (property) {
						return property.name();
					})
					.style('background-color', function (property) {
						return property.group().color();
					})
					.on('click', function (property) {
						tradeTask.togglePropertyOfferedByPlayer(property.id(), playerIndex);
					});
					
				items.classed('monopoly-trade-player-property-selected', function (property) {
					var propertyIds = _.map(selectedProperties, function (property) {
						return property.id();
					});
					
					return _.contains(propertyIds, property.id());
				});
			});
		
		panel.append('input')
			.attr('type', 'text')
			.classed('monopoly-trade-player-money-spinner', true)
			.each(function () {
				$(this).spinner({
					min: 0, max: player.money(), step: 1,
					change: onMoneySpinnerChange(tradeTask, playerIndex),
					stop: onMoneySpinnerChange(tradeTask, playerIndex)
				})
				.val(0)
				.on('input', function () {
					if ($(this).data('onInputPrevented')) {
						return;
					}
					var val = this.value;
					var $this = $(this);
					var max = $this.spinner('option', 'max');
					var min = $this.spinner('option', 'min');
					// We want only number, no alpha. 
					// We set it to previous default value.         
					if (!val.match(/^[+-]?[\d]{0,}$/)) {
						val = $(this).data('defaultValue');
					}
					this.value = val > max ? max : val < min ? min : val;
				}).on('keydown', function (e) {
					// we set default value for spinner.
					if (!$(this).data('defaultValue')) {
						$(this).data('defaultValue', this.value);
					}
					// To handle backspace
					$(this).data('onInputPrevented', e.which === 8 ? true : false);
				});
			});
			
		panel.append('span')
			.classed('monopoly-trade-player-money-total', true)
			.text('/ ' + i18n.formatPrice(player.money()));
	}
	
	function onMoneySpinnerChange(task, playerIndex) {
		return function (event, ui) {
			task.setMoneyOfferedByPlayer($(event.target).spinner('value'), playerIndex);
		};
	}
}());
