            <label class="mt-5" for="categoria_adicionada">Categoria(s): <span>(Se necessário marque mais de uma)</span></label>
            <button type="button" id="btn-adicionar-categoria"><i class="fa fa-plus" aria-hidden="true"></i> Adicionar</button>

            <input type="hidden" name="categoria_vaga" id="categoria_vaga" value="">

            <div class="box-categorias-add"></div>
            
            <div class="categorias">
                <label class="container-label">Vendedor
                    <input type="checkbox" name="checks[]" value="Vendedor">
                    <span class="checkmark"></span>
                </label>
                  
				<label class="container-label">Recepcionista
				<input type="checkbox" name="checks[]" value="Recepcionista">
				<span class="checkmark"></span>
				</label>
                  
				<label class="container-label">Soldador
				<input type="checkbox" name="checks[]" value="Soldador">
				<span class="checkmark"></span>
				</label>
				
				<label class="container-label">Atendente
				<input type="checkbox" name="checks[]" value="Atendente">
				<span class="checkmark"></span>
				</label>
                  
            </div><!--categorias -->

            <label class="mt-5" for="select_experiencia">Experiência requerida: <span>(opcional)</span></label>
            <select class="custom-select" id="experiencia_vaga" name="experiencia_vaga">
                <option selected value="com_experiencia">Com experiência</option>
                <option value="com_sem_experiencia">Com ou sem experiência</option>
                <option value="sem_experiencia">Sem experiência</option>
              </select>

            <label class="mt-5" for="descricao_vaga">Descrição da vaga: <span>(opcional)</span></label>
            <textarea id="descricao_vaga" name="descricao_vaga" placeholder="Digite aqui..."></textarea>







            categoria: req.body.categoria_vaga,
            experiencia: req.body.experiencia_vaga,
            descricao: req.body.descricao_vaga,