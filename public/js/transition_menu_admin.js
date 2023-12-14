$(()=>{
    
    var item_menu = $('.content-painel aside nav ul li');


    item_menu.click(function(){
        $('section').css('display','none');
        $('.content-painel aside nav ul li').css('background-color','#24282D');
        $('.content-painel aside nav ul li .fa-caret-left').css('display','none');
        $(this).css('background-color','#40464F')
        $(this).find('.fa-caret-left').css('display','inline-block');


        let el = $(this).find('a').attr('href');
        // console.log(el)
        $(el).css('display','block');
        
        return false;
    })


    
})