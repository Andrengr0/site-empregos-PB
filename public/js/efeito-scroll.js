$(document).ready(function(){
    // Adicione o evento de clique em todas as tags <a> que possuem o atributo href começando com #
    $('header a[href^="#"]').on('click', function(event) {

        // Prevenindo o comportamento padrão do clique
        event.preventDefault();

        // Armazenando o valor do href do link clicado
        var target = $(this.getAttribute('href'));

        // Animação de rolagem suave para o alvo do link
        $('html, body').animate({
            scrollTop: target.offset().top - 100
        }, 1000);
    });


    // Função para exibir ou ocultar menu secundário quando a página rola para baixo
    $(window).scroll(function(){
        let windowOffY = $(window).scrollTop();

        if(windowOffY > 90){
            $('header').css('padding-top','10px').css('padding-bottom','0px');
            $('header .logo p').css('line-height','30px');
            $('header .menu-desktop  ul li').css('line-height','30px');    
        }else{
            $('header').css('padding-top','30px').css('padding-bottom','10px');
            $('header .logo p').css('line-height','50px');
            $('header .menu-desktop ul li').css('line-height','60px');
        }
    })
});
