
$(document).ready(function(){

        // Selecione o elemento de input por ID
        var valorVagaInput = $('#salario_vaga');

        // Inicialize o autoNumeric no elemento de input
        var autoNumericInstance = new AutoNumeric(valorVagaInput, {
            currencySymbol: 'R$ ', // Símbolo da moeda
            decimalCharacter: ',', // Caractere decimal
            digitGroupSeparator: '.', // Separador de milhares
            decimalPlaces: 2 // Número de casas decimais
        });
    });


    document.getElementById('descricao_vaga').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
    
            const textarea = e.target;
            const cursorPos = textarea.selectionStart;
            const textBefore = textarea.value.substring(0, cursorPos);
            const textAfter = textarea.value.substring(cursorPos);
    
            textarea.value = textBefore + '\n' + textAfter; // Adiciona quebra de linha na posição do cursor
            const newCursorPos = cursorPos + 1; // Move o cursor para o início da linha seguinte
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }
        });
