'use strict';
let $countStartFrom = 0;
let Scheme = {
	init() {
			this.cacheDom();
			this.bindEvents();
		},
		cacheDom() {
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
		bindEvents() {
			this.$submitButton.on('click', this.ajaxForm.bind(this));
			this.$quantityInput.on('change', this.calcPrice.bind(this));
			this.$sectionSelectButton.on('click', this.showSection.bind(this));
			this.$numInsControl.on('click', this.setNumIns);
		},
		calcPrice() {
			let $sumOutput = $('.js-sum-output');
			let $quantity = this.$quantityInput.val();
			let $price = this.$section.attr('data-section-price');
			let $sum = $quantity * $price;

			if(!isNaN($quantity) && $quantity >= 1 ) {
				$({countNum: $countStartFrom}).animate({countNum: $sum}, {
					duration: 480,
					easing: 'swing',
					step() {
						$sumOutput.text( Math.floor(this.countNum) );
					},
					complete() {
						$countStartFrom = this.countNum;
						$sumOutput.text( $countStartFrom );
					}
				});
			} else {
				$(this.$quantityInput).val(1);
				Scheme.calcPrice();
			}
		},
		setNumIns() {
			let $controlType = $(this).attr('data-control');
			let $numInput = $(this).closest('.js-num-ins').find('.js-ins-input');
			let $currentVal = $numInput.val();
			let $insMaxRange = 10;
			let $insMinRange = 1;

			if ($controlType === 'inc') {
				if ($currentVal >= $insMaxRange) { return; }
				$currentVal++;
				$($numInput.val($currentVal));
				Scheme.calcPrice();
			}

			if ($controlType === 'dec') {
				if ($currentVal <= $insMinRange) { return; }
				$currentVal--;
				$($numInput.val($currentVal));
				Scheme.calcPrice();
			}
		},
		showSection() {
			let $sectionId = this.$sectionSelectButton.attr('rel');
			this.$scheme.find(`.section[data-section-id='${$sectionId}']`).removeClass('hidden');
			this.$map.addClass('hidden');
			this.$submitButton.prop('disabled', false);

			this.calcPrice();
		},
		fillForm(data) {
			this.$orderNumber.val(data.number);
			this.$orderAmount.val(data.amount);
			this.$resOk.val(`http://localhost:8000/order/${data.id}/ok`);
			this.$resNo.val(`http://localhost:8000/order/${data.id}/no`);
		},
		disableButton() {
			this.$submitButton.attr('disabled', 'disabled');
		},
		submitForm() {
			this.$form.submit();
			this.$submitButton.prop('disabled', false);
		},
		ajaxForm() {
			let dataApi = 'http://localhost:3000/order_info';
			let reqMethod = 'get';
			let data = {
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

(function() {
	Scheme.init();
})();
