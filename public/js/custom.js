$(()=>{

    $('.vaga-single .deletar-vaga').click(function(){
        let idVaga = $(this).attr('id');
        $('.'+idVaga).css('display','block');

        $('.btn-cancelar').click(function(){
            $('.'+idVaga).css('display','none');
        })
        return false;
    })

    $('.lista-cargos .deletar-cargo').click(function(){
        let idCargo = $(this).attr('id');
        $('.'+idCargo).css('display','block');

        $('.btn-cancelar').click(function(){
            $('.'+idCargo).css('display','none');
        })
        return false;
    })

    $('.tabela-usuarios .btn-resetar-senha').click(function(){
        let idUsuario = $(this).attr('id');
        $('.'+idUsuario).css('display','block');

        $('.btn-cancelar').click(function(){
            $('.'+idUsuario).css('display','none');
        })
        return false;
    })
})

// alert("Funcionou o custom.js")
var redimensionar = $('#preview').croppie({
    // Ativar a leitura de orientação para renderizar corretamente a imagem
    enableExif: true,

    // Ativar orientação personalizada
    enableOrientation: true,

    // O recipiente interno do coppie. A parte visível da imagem
    viewport: {
        width: 300,
        height: 370,
        type: 'square'
    },

    // O recipiente externo do cortador
    boundary: {
        width: 360,
        height: 340
    }

});

function previewImage(input) {
    let arquivo = document.getElementById('arquivo_vaga');
    // console.log(arquivo.files[0].type);
    const formatosAceitos = ["image/png"]
    if(formatosAceitos.includes(arquivo.files[0].type) == false){
        arquivo.value = '';
        alert("Erro: formato de arquivo de imagem inválido! Converta a imagem para a extensão .png")
    }else{
        redimensionar.css('display','block');
        // FileReader para ler de forma assincrona o conteúdo dos arquivos
        var reader = new FileReader();
        
        // onload - Execute após ler o conteúdo
        reader.onload = function (e) {
        
            redimensionar.croppie('bind', {
                // Recuperar a imagem base64
                url: e.target.result
            });
        }

        // O método readAsDataURL é usado para ler o conteúdo do tipo Blob ou File
        reader.readAsDataURL(input.files[0]);
    } 
}



// Adicione um evento de clique ao botão de confirmação
$('#cadastrar_vaga').click(function () {
    // Verificações dos inputs obrigatórios
    var tituloVaga = $('input[name="titulo_vaga"]').val();
    var empresaVaga = $('input[name="empresa_vaga"]').val();
    var cidadeVaga = $('#cidade_vaga').val();
    var cargosSelecionados = $('input[name="checks"]:checked');
    var contatoVaga = $('input[name="contato_vaga"]').val();

    if (tituloVaga == "") {
        alert("Por favor, preencha o título da vaga.");
        return; // Pare a execução da função aqui
    }else if (empresaVaga == "") {
        alert("Por favor, preencha o nome da empresa/estabelecimento.");
        return; // Pare a execução da função aqui
    }else if (cidadeVaga == "escolher") {
        alert("Por favor, escolha uma cidade.");
        return; // Pare a execução da função aqui
    }else if (cargosSelecionados.length == 0) {
        alert("Por favor, selecione pelo menos um cargo.");
        return; // Pare a execução da função aqui
    }else if (contatoVaga == "") {
        alert("Por favor, preencha o campo para contato.");
        return; // Pare a execução da função aqui
    }

    // Verifique se uma imagem foi selecionada
    if ($('#imagem_recortada').val() != "") {
        // Obtenha a imagem cortada do Croppie
        redimensionar.croppie('result', {
            type: 'base64',
            format: 'png', // Ajuste para o formato desejado (png, jpeg, etc.)
            size: 'viewport'
        }).then(function (imagemBase64) {
            $.ajax({
                url: '/admin/cadastro/imagem',
                method: 'POST',
                data: { imagemBase64 },
                success: function (response) {
                    // A resposta do servidor conterá o caminho da imagem
                    const imagePath = response.imagePathMod;
        
                    // Você pode usar imagePath como o caminho da imagem no formulário
                    // e enviá-lo junto com outros dados do formulário
                    $('#imagem_recortada').val(imagePath);
        
                    // Agora, envie o formulário completo para o endpoint de cadastro de vaga
                    enviarFormulario();
                },
                error: function (err) {
                    console.error('Erro ao enviar a imagem:', err);
                }
            });
        });
    } else {
        // Nenhuma imagem foi selecionada, envie o formulário diretamente
        enviarFormulario();
    }
});

function enviarFormulario() {
    $.ajax({
        type: "POST",
        url: "/admin/cadastro/vaga",
        data: $("#form-vaga").serialize(), // Serialize o formulário para enviar os dados corretamente
        success: function (data) {
            if (redimensionar) {
                redimensionar.croppie('destroy');
            }
            location.reload();
        },
        error: function (error) {
            console.error("Erro:", error);
        }
    });
}
