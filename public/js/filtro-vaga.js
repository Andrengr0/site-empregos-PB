var totalCarregado;
var limite;

$(()=>{
    totalCarregado = 0;
    limite = 12;

    $('#carregar-mais').click( function(event) {
        event.preventDefault();

        
        // Atualize o total de vagas já carregadas
        totalCarregado += limite;
        
        // Obtenha os valores dos filtros
        const filtroCargo = document.getElementById('filtro-cargo').value;
        const filtroCidade = document.getElementById('filtro-cidade').value;
        const buscar = document.getElementById('buscar-vaga').value;

        // Faça uma solicitação GET para '/api/obterVagasFiltradas' com os parâmetros 'inicio', 'limite' e os filtros
        fetch(`/api/obterVagasFiltradas?inicio=${totalCarregado}&limite=${limite}&filtroCargo=${filtroCargo}&filtroCidade=${filtroCidade}&buscar=${buscar}`)
            .then(response => response.json())
            .then(vagas => {
                // Adicione as novas vagas à página
                renderizarVagas(vagas);

                // Se o número de vagas retornadas é menor que o limite, desative o botão "Carregar mais..."
                if (vagas.length < limite) {
                    $('.msg-sem-vagas').fadeIn();
                    document.getElementById('carregar-mais').disabled = true;
                    $('#carregar-mais').css('background-color','#ccc')
                }
            })
            .catch(error => console.error('Erro ao carregar mais vagas:', error));
    });
})



function renderizarVagas(vagas) {
    const boxVagas = document.querySelector('.box-vagas');

    vagas.forEach(vaga => {
        const vagaElement = document.createElement('div');
        vagaElement.className = 'vaga-single mt-4';
        vagaElement.innerHTML = `
            <h5>${vaga.titulo}</h5>
            <h6>Cidade: ${vaga.cidade}</h6>
            <h6>Nº de vagas: ${vaga.quantVagas}</h6>
            <h6>Publicada: ${vaga.dataCriada}</h6>
            <a class="btn-detalhes" href="/${vaga.slug}">Ver detalhes</a>
        `;
        boxVagas.appendChild(vagaElement);
    });
}




// Evento de clique no botão de aplicar filtro
$('.btn-aplicar-filtro').click( async (event) => {
    event.preventDefault(); // Evite o comportamento padrão do formulário

    totalCarregado = 0;
    limite = 12;


    // Obtenha os valores dos filtros
    $('.box-vagas').fadeOut();
    $('.msg-sem-vagas').fadeOut(0);
    $('.dot-spinner').fadeIn();
    const filtroCargo = document.getElementById('filtro-cargo').value;
    const filtroCidade = document.getElementById('filtro-cidade').value;
    const buscar = document.getElementById('buscar-vaga').value;

    // Armazene os valores dos filtros no localStorage
    localStorage.setItem('filtroCargo', filtroCargo);
    localStorage.setItem('filtroCidade', filtroCidade);
    localStorage.setItem('buscar', buscar);

    // Envie uma solicitação ao servidor para atualizar o estado dos filtros
    const response = await fetch('/api/atualizarEstadoFiltros', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            filtroCargo,
            filtroCidade,
            buscar
        })
    });
    // Verifique se a atualização foi bem-sucedida antes de recarregar a página
    const data = await response.json();

    if (data.success) {
        // Chame a função para obter e exibir as vagas filtradas
        $('.dot-spinner').css('display','none');
        $('.box-vagas').fadeIn();
        await obterVagasFiltradasEExibir();
        $('.msg-atualizado').fadeIn();
        setTimeout(function() {
            $('.msg-atualizado').fadeOut();
        }, 2000);
        $('#carregar-mais').prop('enabled', true);
        $('#carregar-mais').css('background-color','#2c0c52')
    } else {
        console.error('Erro ao atualizar os filtros:', data.error);
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    // Ao carregar a página, obtenha o estado atual do servidor
    const filtroCargo = localStorage.getItem('filtroCargo');
    const filtroCidade = localStorage.getItem('filtroCidade');
    const buscar = localStorage.getItem('buscar');

    // Atualize a interface do usuário com base no estado recebido
    document.getElementById('filtro-cargo').value = filtroCargo ? filtroCargo : 'Geral';
    document.getElementById('filtro-cidade').value = filtroCidade ? filtroCidade : 'Escolher...';
    document.getElementById('buscar-vaga').value = buscar ? buscar : '';

    // Chame a função para obter e exibir as vagas filtradas
    await obterVagasFiltradasEExibir();
});


// Armazene os valores dos filtros no localStorage
localStorage.setItem('filtroCargo', filtroCargo);
localStorage.setItem('filtroCidade', filtroCidade);
localStorage.setItem('buscar', buscar);
localStorage.setItem('horaSalvar', new Date().getTime());

// Ao carregar a página, obtenha o estado atual do servidor
const filtroCargo = localStorage.getItem('filtroCargo');
const filtroCidade = localStorage.getItem('filtroCidade');
const buscar = localStorage.getItem('buscar');
const horaSalvar = localStorage.getItem('horaSalvar');

// Verifique se passou 1 hora
const umaHora = 60 * 60 * 1000; // 1 hora em milissegundos
if (new Date().getTime() - horaSalvar > umaHora) {
    // Limpe os dados se passou 1 hora
    localStorage.removeItem('filtroCargo');
    localStorage.removeItem('filtroCidade');
    localStorage.removeItem('buscar');
    localStorage.removeItem('horaSalvar');
}

// Função para obter e exibir as vagas filtradas
async function obterVagasFiltradasEExibir() {
    // Obtenha os valores dos filtros
    const filtroCargo = document.getElementById('filtro-cargo').value;
    const filtroCidade = document.getElementById('filtro-cidade').value;
    const buscar = document.getElementById('buscar-vaga').value;

    // Envie uma solicitação ao servidor para obter as vagas filtradas
    const response = await fetch(`/api/obterVagasFiltradas?filtroCargo=${filtroCargo}&filtroCidade=${filtroCidade}&buscar=${buscar}`);
    const vagas = await response.json();

    if(vagas.length == 0){
        $('.msg-sem-vagas').fadeIn();
    }

    // Atualize a interface do usuário com as vagas obtidas
    const boxVagas = document.querySelector('.box-vagas');
    boxVagas.innerHTML = "";

    vagas.forEach(vaga => {
        const vagaElement = document.createElement('div');
        vagaElement.classList.add('vaga-single', 'mt-4');
        vagaElement.innerHTML = `
            <h5>${vaga.titulo}</h5>
            <h6>Cidade: ${vaga.cidade}</h6>
            <h6>Nº de vagas: ${vaga.quantVagas}</h6>
            <h6>Publicada: ${vaga.dataCriada}</h6>
            <a class="btn-detalhes" href="/${vaga.slug}">Ver detalhes</a>
        `;
        boxVagas.appendChild(vagaElement);
    });

}

