let btn = document.querySelector('#verSenha')
let btnConfirm = document.querySelector('#verConfirmSenha')
let btnRedirectLogin = document.getElementById('btnRedirectLogin');
let btnCadastrar = document.getElementById('btn_cadastrar');

let email = document.querySelector('#email')

let senha = document.querySelector('#senha')
let labelSenha = document.querySelector('#labelSenha')
let validSenha = false

let confirmSenha = document.querySelector('#confirmSenha')
let labelConfirmSenha = document.querySelector('#labelConfirmSenha')
let validConfirmSenha = false

let msgError = document.querySelector('#msgError')
let msgSuccess = document.querySelector('#msgSuccess')

senha.addEventListener('keyup', () => {
if(senha.value.length <= 5){
    labelSenha.setAttribute('style', 'color: red')
    labelSenha.innerHTML = 'Senha *Insira no minimo 6 caracteres'
    senha.setAttribute('style', 'border-color: red')
    validSenha = false
} else {
    labelSenha.setAttribute('style', 'color: green')
    labelSenha.innerHTML = 'Senha'
    senha.setAttribute('style', 'border-color: green')
    validSenha = true
}
})

confirmSenha.addEventListener('keyup', () => {
if(senha.value != confirmSenha.value){
    labelConfirmSenha.setAttribute('style', 'color: red')
    labelConfirmSenha.innerHTML = 'Confirmar Senha *As senhas não conferem'
    confirmSenha.setAttribute('style', 'border-color: red')
    validConfirmSenha = false
} else {
    labelConfirmSenha.setAttribute('style', 'color: green')
    labelConfirmSenha.innerHTML = 'Confirmar Senha'
    confirmSenha.setAttribute('style', 'border-color: green')
    validConfirmSenha = true
}
})

function cadastrar(){
if(validSenha && validConfirmSenha){
    // Crie um objeto com os dados do usuário
    const usuarioData = {
        email: email.value,
        senha: senha.value
    };

    // Use o método $.ajax para enviar os dados para o servidor
    $.ajax({
        url: '/admin/cadastrar/nova/senha',
        method: 'POST',
        data: usuarioData,
        success: function (response) {
            // Aqui você pode manipular a resposta do servidor, se necessário
            btnCadastrar.style.display = 'none';

            // Exibe o botão de redirecionamento
            btnRedirectLogin.style.display = 'block';
            msgSuccess.setAttribute('style', 'display: block');
            msgSuccess.innerHTML = '<strong>Senha atualizada com sucesso...</strong>';
            msgError.setAttribute('style', 'display: none');
            msgError.innerHTML = '';
        },
        error: function (err) {
            console.error('Erro ao cadastrar usuário:', err);
            msgError.setAttribute('style', 'display: block');
            msgError.innerHTML = '<strong>Erro ao cadastrar nova senha. Tente novamente.</strong>';
            msgSuccess.innerHTML = '';
            msgSuccess.setAttribute('style', 'display: none');
        }
    });
} else {
    msgError.setAttribute('style', 'display: block');
    msgError.innerHTML = '<strong>Preencha todos os campos corretamente antes de cadastrar</strong>';
    msgSuccess.innerHTML = '';
    msgSuccess.setAttribute('style', 'display: none');
}
}

btn.addEventListener('click', ()=>{
let inputSenha = document.querySelector('#senha')

if(inputSenha.getAttribute('type') == 'password'){
    inputSenha.setAttribute('type', 'text')
} else {
    inputSenha.setAttribute('type', 'password')
}
})

// Redireciona para a rota de login quando o botão é clicado
btnRedirectLogin.addEventListener('click', function () {
    window.location.href = '/admin/login';
});

btnConfirm.addEventListener('click', ()=>{
let inputConfirmSenha = document.querySelector('#confirmSenha')

if(inputConfirmSenha.getAttribute('type') == 'password'){
    inputConfirmSenha.setAttribute('type', 'text')
} else {
    inputConfirmSenha.setAttribute('type', 'password')
}
})