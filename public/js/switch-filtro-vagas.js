async function obterEstadoSwitch() {
    try {
        const response = await fetch('/api/obterEstadoSwitch');
        const data = await response.json();

        // Atualize a interface do usuário com base no estado recebido
        document.getElementById('switch').checked = data.estadoAtivo;
    } catch (error) {
        console.error('Erro ao obter o estado do switch:', error);
    }
}

async function atualizarEstadoSwitch(novoEstado) {
    try {
        await fetch('/api/atualizarEstadoSwitch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ estadoAtivo: novoEstado }),
        });

        // Após atualizar o estado, obtenha o novo estado do switch
        await obterEstadoSwitch();
    } catch (error) {
        console.error('Erro ao atualizar o estado do switch:', error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Ao carregar a página, obtenha o estado atual do switch do servidor
    await obterEstadoSwitch();

    // Adicione o evento de alteração
    document.getElementById('switch').addEventListener('change', async (event) => {
        // Quando o switch é alterado, envie uma solicitação ao servidor para atualizar o estado
        const novoEstado = event.target.checked;

        // Atualize o estado do switch, incluindo a obtenção do estado após a atualização
        await atualizarEstadoSwitch(novoEstado);
    });
});