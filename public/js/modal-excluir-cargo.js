$(()=>{
    $('.lista-cargos .deletar-cargo').click(function(){
        let idCargo = $(this).attr('id');
        $('.'+idCargo).css('display','block');
    
        $('.btn-cancelar').click(function(){
            $('.'+idCargo).css('display','none');
        })
        return false;
    })
})