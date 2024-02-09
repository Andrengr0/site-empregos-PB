$(()=>{
    $('.tabela-usuarios .btn-remover-usuario').click(function(){
        let idUsuario = $(this).attr('id');
        $('.'+idUsuario).css('display','block');
    
        $('.btn-cancelar').click(function(){
            $('.'+idUsuario).css('display','none');
        })
        return false;
    })
})