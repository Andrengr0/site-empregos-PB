$(()=>{

    var btn_adcionar_categoria = $('#btn-adicionar-categoria');
    var categorias = $('.box-cadastrar-vaga .categorias');
    var inputCheckbox = $('.box-cadastrar-vaga .categorias input');
    var box_categorias_add = $('.box-cadastrar-vaga .box-categorias-add');

    var controller = 0;

    abrirCategorias();
    function abrirCategorias(){
        btn_adcionar_categoria.click(function(e){
            if(controller == 0){
                e.stopPropagation()
                categorias.css('display','inline');
                controller +=1;
            }else{
                categorias.css('display','none');
                controller -=1;
            }
        });
    }
    

    
    inputCheckbox.click(function() {
        var checkeds = $("input[name='checks']:checked").map(function() {
            return $(this).val();
        }).get();
    
        box_categorias_add.html("");
        checkeds.forEach(function(category) {
            box_categorias_add.append('<span>' + category + '</span>');
        });
    });

    fecharCategorias();

    function fecharCategorias(){
        var el = $('body')
        el.click(function(){
            controller = 0;
            categorias.css('display','none');
        })

        categorias.click(function(e){
            e.stopPropagation();
        })
    }
    
});