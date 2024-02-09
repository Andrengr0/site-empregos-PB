$(document).ready(function(){

    let el = $('.btn-menu-mobile');

    $('#hamburger').change(function(){
        if(this.checked) {
            $('.content-painel aside').css('left', '0px');
            $('.btn-menu-mobile').css('left', '226px');
        } else {
            $('.content-painel aside').css('left', '-220px');
            $('.btn-menu-mobile').css('left', '0px');
        }
    });

    $(window).on('resize', function() {
        if ($(window).width() <= 1105) {
           // Esconda o menu
           $('.content-painel aside').css('left', '-300px');
           $('#hamburger').prop('checked', false);
           $('.btn-menu-mobile').css('left', '0px');
        } else {
            $('.content-painel aside').css('left', '0px');
        }
    });

    $('.content-painel aside a').click(function(){
        if($(window).width() <= 1105){
            // Esconda o menu
            $('#hamburger').prop('checked', false);
            $('.content-painel aside').css('left', '-300px');
            $('.btn-menu-mobile').css('left', '0px');
        }
    })

    $('body').click(function() {
        if($(window).width() <= 1105){
            // Esconda o menu
            $('#hamburger').prop('checked', false);
            $('.content-painel aside').css('left', '-300px');
            $('.btn-menu-mobile').css('left', '0px');

            $(el).click(function(e){
                e.stopPropagation();
            })
        }
    });
});