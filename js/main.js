$(document).ready(function() {
	"use strict";

	var stickers = {
		blank: $('#stickers-1'),				//Панель с блоками
		stickerList: $('.sticker-box'), //Блоки
		temp: {},												//Временный элемент
		posList: {},

		//Удалить все блоки
		clearBlank: function() {   
			this.blank.empty();
		},
		//Показать блоки
		showBlank: function() {   
			this.blank.show();
		},
		//Скрыть блоки
		hideBlank: function() {   
			this.blank.hide();
		},

		//Добавить элемент
		addSticker: function(elem) {
			this.blank.append(elem);
		},

		//Удалить элемент
		removeSticker: function(id) {
			$(id).remove();
		},

		//Показать блок
		showSticker: function(elem, speed) {

			elem.animate({
				height:'toggle'
			}).animate({
				opacity: 0
			}, 1000).animate({
				opacity: 1
			}, 1000, function(){
				$(this).clearQueue();
			});

			
			elem.attr('displayed', 'true');

		},

		//Сокрыть блок
		hideSticker: function(elem, speed) {
			elem.animate({
				height: 'toggle'
			}, speed);

			elem.attr('displayed', 'false');

		},

		//Получить текущее положение блоков
		getStickers: function() {
			var i = 1;
			var temp = {};

			$.each($('.sticker-box'), function(){

				var item = 'sticker-'+i;

				temp[item] = {
					id:   $(this).attr('data'),
					top:  $(this).offset().top,
					left: $(this).offset().left
				};

				i++;
			});

			this.posList = temp;

			return this.posList;
		},

		//
		animateStickers: function(delay, discard) {

			var some = this.getStickers();
			var counter = objFunc.getObjectLength( some );

			var timer = setTimeout(function(){
				for (var i = 1; i <= counter; i++) {
					try{

						var top = $('#sticker-'+some['sticker-'+i]['id']).position().top;
						var left = $('#sticker-'+some['sticker-'+i]['id']).position().left;			

						$('#sticker-'+some['sticker-'+i]['id']).animate({
							top: func.randomInt(-300, 0),
							left: func.randomInt(-300, -150)
						}, 400).animate({
							top: func.randomInt(-300, -150),
							left: func.randomInt(100, 500)
						}, 400).animate({
							top: func.randomInt(150, 300),
							left: func.randomInt(150, 300)
						}, 400).animate({
							top: 0,
							left: 0
						}, 400);


					}catch(e){
						console.log(e);
					}
				}
			}, delay);
		},

		stopAnimation: function(elem) {
			elem.clearQueue();
		},
		stopAll: function() {
			this.stickerList.clearQueue();
		}

	};

	var func = {
		//Отрисовка
		enableView: function() {
			if( localStorage.getItem('customPosition') == null ) {
				drawStickers('defaultPosition');
			} else {
				drawStickers('customPosition');
			}
		},

		//Сохранить расположение блоков
		saveOrder: function(place, list) {
			var order = {};
			var i = 1;

			$.each(list, function() {
				var propName = 'item' + i;

				order[propName] = {
					id: $(this).attr('data'),
					displayed: $(this).attr('displayed')
				};
				i++;
			});

			localStorage.setItem( place, JSON.stringify(order) );
		},

		//Закончить редактирование блоков
		disableSortable: function() {
			$('#stickers-1').sortable('destroy');
			$('.sticker').removeClass('active');
		},

		//Сброс настроек вида
		resetToDefault: function() {
			$('#stickers-1 .sticker-box').attr('displayed', true);

			
			drawStickers('defaultPosition');
			this.saveOrder( 'customPosition', $('#stickers-1 .sticker-box') );
		},

		//Рандомное целое число
		randomInt: function(min, max){
		    var rand = min + Math.random() * (max + 1 - min);
		    rand = Math.floor(rand);
		    return rand;
		}
	};


	//Функции над обектами
	var objFunc = {
		getObjectLength: function(obj) {

			var counter = 0;

			for (var key in obj) {
			  counter++;
			}

			return counter;
		}
	};

	(function init() {
		//Save default state
		if( localStorage.getItem('defaultPosition') == null ) {
			func.saveOrder( 'defaultPosition', $('.sticker-box') );
		}
		stickers.displayedStickers = localStorage.getItem('customPosition') || localStorage.getItem('defaultPosition');
		
		stickers.hideBlank();

		func.enableView();
		
		stickers.showBlank();

	})();

	function drawStickers(param){

		var pos = localStorage.getItem(param);
		pos = JSON.parse(pos);		

		for(var i = 1; i <= stickers.stickerList.length; i++){

			try {
				var id = pos['item' + i]['id'];
				var prepareId = '#sticker-' + id;
				var stickerState = pos['item' + i]['displayed'];
				var sticker = $(prepareId);
				
				stickers.temp = $(prepareId);
				stickers.temp.show();
				stickers.removeSticker( prepareId );
				stickers.addSticker( stickers.temp );

				if( stickerState == 'false' ) {
					stickers.hideSticker( $(prepareId), 0 );
				}


				var input = $('[stickerid="'+id+'"]').parent().find('input');

				if ( stickerState == 'true' ) {
					stickerState = true;
				} else {
					stickerState = false;
				}

				input.prop({'checked': stickerState});
			} catch(e) {
				console.log('Can\'t read property \'id\'('+i+')');
			}

		}

		stickers.temp = null;

	}



	//Begin change view
	$('.btn-circle.edit').on('click', function(e) {
		e.preventDefault();

		$('#stickers-1').sortable();

		$('.sticker').addClass('active');
	});

	//Save view
	$('.btn-circle.confirm').on('click', function(e) {
		e.preventDefault();

		func.saveOrder( 'customPosition', $('#stickers-1 .sticker-box') );
		func.disableSortable();

	});

	//Close without saveing
	$('.btn-circle.cancel').on('click', function(e) {
		e.preventDefault();

		func.enableView();
		func.disableSortable();
	});

	//Main button - close menu
	$('.dragable-menu-btn').on('click', function(e){
		e.preventDefault();

		if( $(this).attr('state') == 'open' ) {

			if ( $('.sticker').hasClass('active') ) {
				func.enableView();
				func.disableSortable();
			}
			$('.sticker-box').removeClass('editing');
		}

	});

	//Reset to default view
	$('.btn-circle.reset').on('click', function(e) {
		e.preventDefault();

		$('.onoffswitch-checkbox').checked = true;

		func.resetToDefault();
		
	})



	$('.menu-circle').menuFromCircle(func);

	//Displayng blocks
		$('.btn-circle.display').on('click', function(e) {
			e.preventDefault();

			$('.sticker-box').addClass('editing');

		})

		//Block:hover
		$('.sticker-list').hover( function() {
			objHover( $('.sticker-box'), $(this).attr('param'), 'hover' );
		});

		$('.onoffswitch-label').on('click', function(e) {

			var input = $(this).parent().find('input');
			var stickerId = $(this).attr('stickerid');
			var editableSticker = $( '#sticker-' + stickerId );

			if (input.prop('checked') == true ) {				

				stickers.hideSticker(editableSticker, 1000);
				stickers.animateStickers(500);

			} else {

				
				stickers.animateStickers(0, $( '#sticker-' + stickerId ));
				stickers.showSticker(editableSticker, 1000);

			}

			func.saveOrder( 'customPosition', $('.sticker-box') );

		});




	//
	function objHover( obj, item, state ) {

		obj.removeClass('hovered');


		$.each( obj, function(){
			if( ( $(this).attr('param') == item ) && ( state == 'hover' ) ) {
				$(this).addClass('hovered');
			}
		});
	}

});

(function($){
	$.fn.menuFromCircle = function(options){

		var self = $(this);
		var mainMenu = self.find('.settings');

		var mainBtn = self.find('.main-btn');
		var btns = self.find('.btn-circle.item');
		var btnMenu = self.find('.btn-circle.menu');
		var btnsBack = self.find('.btn-circle.btn-back');

		mainBtn.attr('state', 'close');



		btnMenu.on('click', function(e) {
			e.preventDefault();
			
			mainMenu.find('.group').slideUp();
			$(this).slideUp();

			var submenu = $(this).parent().find('.group');
			$(this).parent().slideDown();
			submenu.slideDown();

		});

		btnsBack.on('click', function(e) {
			e.preventDefault();

			$(this).parent().slideUp();
			btnMenu.slideDown();
			self.find('.settings>.group').slideDown();

		});

		//Status - Complete
		mainBtn.on('click', function(e) {
			e.preventDefault();

			if( $(this).attr('state') == 'close' ) {

				self.find('.settings').slideDown();
				$(this).attr('state', 'open');

				$(this).find('i').css('transform', 'rotate(360deg)');

			}else {
			
				self.find('.settings').slideUp();
				$(this).attr('state', 'close');

				$(this).find('i').css('transform', 'rotate(-360deg)');

				mainMenu.find('.group').css('display', 'none');
				self.find('.settings>.group').css('display', 'block');
				btns.css('display', 'inline-block');

			}

			$(this).find('i').css('transition', '0.7s');
			//
		});

	}
})(jQuery);