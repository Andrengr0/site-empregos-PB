$(()=>{

    $('#btn-voltar-ao-topo').click(function(){
        $('html, body').animate({
            scrollTop: 0
        }, 1000);
    })
})