$(()=>{

    // Adicione um evento de clique ao botão de adicionar usuario
    $('.btn-adicionar-usuario').click(function () {
    
    $.ajax({
        url: '/admin/adicionar/usuario',
        method: 'POST',
        success: function (response) {
            // A resposta do servidor conterá o link
            const link = response.link;
    
            $('.text-link-usuario').append(link);

        },
        error: function (err) {
            console.error('Erro ao enviar a imagem:', err);
        }
        });
    });
});