$(() => {

    var item_menu = $('.content-painel aside nav ul li');

    // Obtém o caminho da URL atual
    const currentPath = window.location.pathname;

    // Itera sobre os itens do menu
    item_menu.each(function() {
        let href = $(this).find('a').attr('href');

        // Verifica se o href corresponde ao caminho atual
        if (href === currentPath) {
            // Aplica o estilo desejado para indicar a rota atual
            $(this).css('background-color', '#40464F');
            $(this).find('.fa-caret-left').css('display', 'inline-block');
        }
    });

    item_menu.click(function() {
        let href = $(this).find('a').attr('href');

        // Redireciona para a rota
        window.location.href = href;

    });
});
