/**
 * Created by budae on 13.08.2017.
 */
$(function(){

    $("#form").validate({  	// используем id формы (можно использовать и имя класса)
        rules: {	// описываем правила проверки полей формы
            name: { 		// указываем имя поля, для которого вводятся правила
                required: true, // в поле должно быть введено значение
                minlength: 3	// устанавливаем минимальную длину значения поля
            },
            company: {
                required: false
            },
            phone: {
                required: true,
                number: true,	// значение поля должно быть десятичным целым числом
                minlength: 6
            },
            email: {
                required: true,
                email: true	// значение поля должно иметь правильный формат адреса email
            },
            message: {
                required: true
            }
        },
        messages: {	// устанавливаем сообщения для пользователя
            name: {
                required: 'Данное поле должно быть заполнено!',
                minlength: 'Минимальная длина: 3'
            },
            company: {
                required: 'Данное поле должно быть заполнено!'
            },
            phone: {
                required: 'Данное поле должно быть заполнено!',
                number: 'Неправильный формат номера телефона',
                minlength: 'Минимальная длина: 6'
            },
            email: 'Неправильный формат адреса e-mail',
            message: {
                required: 'Данное поле должно быть заполнено!'
            }
        },
        success: function(label) {
            // Устанавливаем класс OK для сообщения об ошибке выключаем его через 2 секунды
            label.html('OK').removeClass('error').addClass('ok');
            setTimeout(function(){
                label.fadeOut(500);
            }, 2000)
        }
    });

});