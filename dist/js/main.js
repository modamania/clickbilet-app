'use strict';

var $countStartFrom = 0;
var Scheme = {
	init: function init() {
		this.cacheDom();
		this.bindEvents();
	},
	cacheDom: function cacheDom() {
		// form
		this.$form = $('.js-checkout-form');
		this.$submitButton = this.$form.find('.js-form-submit');
		// hidden form
		this.$orderNumber = this.$form.find('.js-order-number');
		this.$orderAmount = this.$form.find('.js-order-amount');
		this.$resOk = this.$form.find('.js-res-ok');
		this.$resNo = this.$form.find('.js-res-no');
		// scheme
		this.$scheme = $('.scheme');
		this.$map = this.$scheme.find('.map');
		this.$sectionSelectButton = this.$scheme.find('.js-section-select');
		this.$section = this.$scheme.find('.section');
		this.$quantityInput = this.$scheme.find('.js-ins-input');
		// ins
		this.$numIns = $('.js-num-ins');
		this.$numInsControl = this.$numIns.find('.js-ins-control');
	},
	bindEvents: function bindEvents() {
		this.$submitButton.on('click', this.ajaxForm.bind(this));
		this.$quantityInput.on('change', this.calcPrice.bind(this));
		this.$sectionSelectButton.on('click', this.showSection.bind(this));
		this.$numInsControl.on('click', this.setNumIns);
	},
	calcPrice: function calcPrice() {
		var $sumOutput = $('.js-sum-output');
		var $quantity = this.$quantityInput.val();
		var $price = this.$section.attr('data-section-price');
		var $sum = $quantity * $price;

		if (!isNaN($quantity) && $quantity >= 1) {
			$({ countNum: $countStartFrom }).animate({ countNum: $sum }, {
				duration: 480,
				easing: 'swing',
				step: function step() {
					$sumOutput.text(Math.floor(this.countNum));
				},
				complete: function complete() {
					$countStartFrom = this.countNum;
					$sumOutput.text($countStartFrom);
				}
			});
		} else {
			$(this.$quantityInput).val(1);
			Scheme.calcPrice();
		}
	},
	setNumIns: function setNumIns() {
		var $controlType = $(this).attr('data-control');
		var $numInput = $(this).closest('.js-num-ins').find('.js-ins-input');
		var $currentVal = $numInput.val();
		var $insMaxRange = 10;
		var $insMinRange = 1;

		if ($controlType === 'inc') {
			if ($currentVal >= $insMaxRange) {
				return;
			}
			$currentVal++;
			$($numInput.val($currentVal));
			Scheme.calcPrice();
		}

		if ($controlType === 'dec') {
			if ($currentVal <= $insMinRange) {
				return;
			}
			$currentVal--;
			$($numInput.val($currentVal));
			Scheme.calcPrice();
		}
	},
	showSection: function showSection() {
		var $sectionId = this.$sectionSelectButton.attr('rel');
		this.$scheme.find('.section[data-section-id=\'' + $sectionId + '\']').removeClass('hidden');
		this.$map.addClass('hidden');
		this.$submitButton.prop('disabled', false);

		this.calcPrice();
	},
	fillForm: function fillForm(data) {
		this.$orderNumber.val(data.number);
		this.$orderAmount.val(data.amount);
		this.$resOk.val('http://localhost:8000/order/' + data.id + '/ok');
		this.$resNo.val('http://localhost:8000/order/' + data.id + '/no');
	},
	disableButton: function disableButton() {
		this.$submitButton.attr('disabled', 'disabled');
	},
	submitForm: function submitForm() {
		this.$form.submit();
		this.$submitButton.prop('disabled', false);
	},
	ajaxForm: function ajaxForm() {
		var dataApi = 'http://localhost:3000/order_info';
		var reqMethod = 'get';
		var data = {
			section_id: this.$form.attr('data-section-id'),
			quantity: this.$quantityInput.val()
		};

		$.ajax({
			type: reqMethod,
			url: dataApi,
			dataType: 'json',
			data: data,
			beforeSend: this.disableButton.bind(this),
			success: this.fillForm.bind(this),
			complete: this.submitForm.bind(this)
		});
	}
};

(function () {
	Scheme.init();
})();