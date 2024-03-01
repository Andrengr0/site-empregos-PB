$(document).ready(function(){
    let el = $('.menu-mobile, .icon-menu-mobile');

    if ($(window).width() <= 910) {
        $('.menu-desktop').fadeOut(0);
        $(el).fadeIn(0);
    } else {
        $('.menu-desktop').fadeIn(0);
        $(el).fadeOut(0);
    }

    $(window).on('resize', function() {
        if ($(window).width() <= 910) {
            $('.menu-desktop').fadeOut(0);
            $(el).fadeIn(0);
        } else {
            $('.menu-desktop').fadeIn(0);
            $(el).fadeOut(0);
        }
    });

    $('#burger').change(function(){
        if(this.checked) {
            $('.menu-mobile').css('right', '0');
        } else {
            $('.menu-mobile').css('right', '-300px');
        }
    });

    $('header .menu-mobile ul li a').click(function(){
        // Esconda o menu
        $('#burger').prop('checked', false);
        $('.menu-mobile').css('right', '-300px');
    })

    $('body').click(function() {
        // Esconda o menu
        $('#burger').prop('checked', false);
        $('.menu-mobile').css('right', '-300px');

        $(el).click(function(e){
            e.stopPropagation();
        })

    });
});