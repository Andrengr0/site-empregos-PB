$(function () {
    $('#copiarContato').popover({
        container: 'body'
    })
})
function copiarContato() {
// Seleciona o elemento de texto
var contatoElemento = document.getElementById('contato');

// Cria um campo de texto temporário
var campoTemporario = document.createElement('textarea');

// Define o valor do campo de texto para o conteúdo do elemento
campoTemporario.value = contatoElemento.textContent;

// Adiciona o campo de texto temporário ao documento
document.body.appendChild(campoTemporario);

// Seleciona o conteúdo do campo de texto
campoTemporario.select();
campoTemporario.setSelectionRange(0, 99999); /* Para dispositivos móveis */

// Copia o texto para a área de transferência
document.execCommand('copy');

// Remove o campo de texto temporário do documento
document.body.removeChild(campoTemporario);

 // Esconde o pop-up após 2 segundos (2000 milissegundos)
setTimeout(function () {
$('#copiarContato').popover('hide');
}, 2500);
}



$(function () {
    $('#copiarLink').popover({
        container: 'body'
    })
})

function copiarLink() {
    // Cria um campo de texto temporário
    var campoTemporario = document.createElement('textarea');

    // Define o valor do campo de texto para o URL da página atual
    campoTemporario.value = window.location.href;

    // Adiciona o campo de texto temporário ao documento
    document.body.appendChild(campoTemporario);

    // Seleciona o conteúdo do campo de texto
    campoTemporario.select();
    campoTemporario.setSelectionRange(0, 99999); /* Para dispositivos móveis */

    // Copia o texto para a área de transferência
    document.execCommand('copy');

    // Remove o campo de texto temporário do documento
    document.body.removeChild(campoTemporario);

    // Esconde o pop-up após 2 segundos (2000 milissegundos)
    setTimeout(function () {
        $('#copiarLink').popover('hide');
    }, 2500);
}
