
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
    $('.load').css('display','inline-block');
    // Verificações dos inputs obrigatórios
    var tituloVaga = $('input[name="titulo_vaga"]').val();
    var empresaVaga = $('input[name="empresa_vaga"]').val();
    var cidadeVaga = $('#cidade_vaga').val();
    var cargosSelecionados = $('input[name="checks"]:checked');
    var contatoVaga = $('input[name="contato_vaga"]').val();
    var linkVaga = $('input[name="link_vaga"]').val();

    if (tituloVaga == "") {
        $('.load').css('display','none');
        alert("Por favor, preencha o título da vaga.");
        return; // Pare a execução da função aqui
    }else if (empresaVaga == "") {
        $('.load').css('display','none');
        alert("Por favor, preencha o nome da empresa/estabelecimento.");
        return; // Pare a execução da função aqui
    }else if (cidadeVaga == "escolher") {
        $('.load').css('display','none');
        alert("Por favor, escolha uma cidade.");
        return; // Pare a execução da função aqui
    }else if (cargosSelecionados.length == 0) {
        $('.load').css('display','none');
        alert("Por favor, selecione pelo menos um cargo.");
        return; // Pare a execução da função aqui
    }else if (contatoVaga == "" && linkVaga == "") {
        $('.load').css('display','none');
        alert("Por favor, coloque alguma informação no link da vaga ou no contato, para envio de currículo.");
        return; // Pare a execução da função aqui
    }  

    enviarFormulario();
});

function enviarFormulario() {
    $.ajax({
        type: "POST",
        url: "/admin/cadastro/vaga",
        data: $("#form-vaga").serialize(), // Serialize o formulário para enviar os dados corretamente
        success: function (data) {
            alert("Vaga cadastrada com sucesso!");
            location.reload();
        },
        error: function (error) {
            console.error("Erro:", error);
        }
    });
}
