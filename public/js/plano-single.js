$(document).ready(function() {
    // Adiciona um ouvinte de eventos a cada elemento
    $('.plano-single').on('click', function() {
        // Ativa o botão de opção dentro do elemento clicado
        $(this).find('input[type="radio"]').prop('checked', true);

        // Altera a cor de fundo do elemento clicado
        $(this).css('background-color', '#d6ebfc');

        // Altera a cor de fundo dos outros elementos para a cor original
        $('.plano-single').not(this).css('background-color', '');
    });

    // Adiciona ouvintes de eventos aos inputs
    $('input[type="radio"]').on('focus', function() {
        // Altera a cor de fundo do elemento pai quando o input é focado
        $(this).parent('.plano-single').css('background-color', '#d6ebfc');
    }).on('blur', function() {
        // Reverte a cor de fundo para o original quando o foco é perdido
        $(this).parent('.plano-single').css('background-color', '');
    });
});