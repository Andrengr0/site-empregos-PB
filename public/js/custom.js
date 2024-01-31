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
    }

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



// Adicione um evento de clique ao botão de confirmação
$('#cadastrar_vaga').click(function () {
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
            // $('#confirm-image').css('background-color', 'green');
            // Agora, envie o formulário completo para o endpoint de cadastro de palestra

            $.ajax({
                type: "POST",
                url: "/admin/cadastro/vaga",
                data: $("#form-vaga").serialize(), // Serialize o formulário para enviar os dados corretamente
                success: function (data) {
                    redimensionar.croppie('destroy');
                    // console.log("Sucesso ao cadastrar");
                    location.reload();
                },
                error: function (error) {
                    console.error("Erro:", error);
                }
            });
    
            //$('#form-vaga').submit(); // Substitua 'seu-formulario' pelo ID do seu formulário
        },
        error: function (err) {
            console.error('Erro ao enviar a imagem:', err);
        }
        });
    });
});

