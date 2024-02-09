$(()=>{
    $('.vaga-single .deletar-vaga').click(function(){
        let idVaga = $(this).attr('id');
        $('.'+idVaga).css('display','block');

        $('.btn-cancelar').click(function(){
            $('.'+idVaga).css('display','none');
        })
        return false;
    })
})