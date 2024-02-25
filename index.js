
// Importação de módulos e configuração inicial
const express = require('express'); // Importa o framework Express
const bodyParser = require('body-parser'); // Middleware para parsear corpos de requisições HTTP
const path = require('path'); // Utilitário para trabalhar com caminhos de arquivos e diretórios
const fs = require('fs'); // Módulo para manipulação de arquivos no sistema de arquivos
const multer = require('multer'); // Middleware para lidar com upload de arquivos
const nodemailer = require('nodemailer'); // Módulo para envio de emails
const bcrypt = require('bcrypt'); // Módulo para criptografar senhas
var mongoose = require("mongoose"); // ODM (Object Data Modeling) para MongoDB

const app = express(); // Inicializa a aplicação Express

// Configurações do Multer para armazenamento de arquivos em memória
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Configurações da sessão do Express
var session = require('express-session');
app.use(session({ 
    secret: 'keyboard cat', 
    cookie: { maxAge: 720000 },
    resave: false, 
    saveUninitialized: true  
}));

// Importação dos modelos de dados (Vagas, Usuários, Cargos, Switch, Apoiador)
const Vagas = require('./Vagas.js');
const Usuarios = require('./Usuarios.js');
const Cargos = require('./Cargos.js');
const Switch = require('./Switch.js');
const Apoiador = require('./Apoiador.js');

// Conexão com o banco de dados MongoDB (produção)
mongoose.connect("mongodb+srv://root:uTKJaYuRHvJuAN0C@cluster0.5glkwii.mongodb.net/EmpregosPB?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }).then(function(){
        console.log('Conectado com sucesso!');
    }).catch(function(err){
        console.log(err.message);
    });

// Configuração do body-parser para parsear payloads JSON e codificados em URL com limite aumentado
app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));

// Configuração do EJS como o mecanismo de renderização de HTML
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Define o diretório de recursos estáticos e de visualizações
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/pages'));





// Rota principal para exibir as vagas de emprego filtradas
app.get('/', async (req, res) => {
    try {
        // Extrai os parâmetros de filtro da requisição
        const { filtroCargo, filtroCidade, buscar, inicio, limite } = req.query;
        // Obtém as vagas filtradas com base nos parâmetros
        const vagas = await obterVagasFiltradas(filtroCargo, filtroCidade, buscar, inicio, limite);
        // Consulta e ordena os cargos disponíveis
        Cargos.find({}).sort({ cargo: 1 }).then(function(cargos) {
            // Mapeia os cargos para um formato mais conveniente
            cargos = cargos.map(function(val) {
                return { cargo: val.cargo };
            });
            // Renderiza a página inicial com as vagas e cargos filtrados
            res.render('home', { vagas, cargos });
        });
    } catch (err) {
        console.error("Ocorreu um erro:", err);
        res.status(500).send("Erro ao buscar as vagas.");
    }
});

// Rota para obter as vagas filtradas em formato JSON
app.get('/api/obterVagasFiltradas', async (req, res) => {
    try {
        // Extrai os parâmetros de filtro da requisição
        const { filtroCargo, filtroCidade, buscar, inicio, limite } = req.query;
        // Obtém as vagas filtradas com base nos parâmetros e retorna como JSON
        const vagas = await obterVagasFiltradas(filtroCargo, filtroCidade, buscar, inicio, limite);
        res.json(vagas);
    } catch (error) {
        console.error('Erro ao obter vagas filtradas:', error);
        res.status(500).json({ error: 'Erro ao obter vagas filtradas.' });
    }
});

// Rota para atualizar o estado dos filtros
app.post('/api/atualizarEstadoFiltros', async (req, res) => {
    try {
        // Extrai os parâmetros de filtro da requisição
        const { filtroCargo, filtroCidade, buscar, inicio, limite } = req.body;
        // Obtém as vagas filtradas com base nos parâmetros e retorna como JSON
        const vagasFiltradas = await obterVagasFiltradas(filtroCargo, filtroCidade, buscar, inicio, limite);
        res.json({ success: true, vagas: vagasFiltradas });
    } catch (error) {
        console.error('Erro ao atualizar o estado dos filtros:', error);
        res.status(500).json({ error: 'Erro ao atualizar o estado dos filtros.' });
    }
});

// Função assíncrona para obter vagas filtradas com base nos parâmetros fornecidos
async function obterVagasFiltradas(filtroCargo, filtroCidade, buscar, inicio = 0, limite = 12) {
    try {
        // Inicializa um objeto de consulta vazio
        let query = {};
        // Aplica filtros de acordo com os parâmetros fornecidos
        if (buscar && buscar.trim() !== "") {
            query.titulo = { $regex: new RegExp(buscar, 'i') };
        }
        if (filtroCargo && filtroCargo !== "Geral") {
            query.categoria = filtroCargo;
        }
        if (filtroCidade && filtroCidade !== "Escolher...") {
            query.cidade = filtroCidade;
        }
        query.__v = 1;
        // Consulta as vagas correspondentes aos filtros
        const vagas = await Vagas.find(query).sort({'_id': -1}).skip(inicio).limit(limite);
        // Formata o resultado para um formato mais conveniente
        return vagas.map(val => ({
            titulo: val.titulo,
            categoria: val.categoria,
            cidade: val.cidade,
            imagem: val.imagem,
            quantVagas: val.quantidade,
            dataCriada: val.dataCriada,
            slug: val.slug
        }));
    } catch (error) {
        console.error('Erro ao obter vagas filtradas:', error);
        throw new Error('Erro ao obter vagas filtradas: ' + error.message);
    }
}

// Rota para autenticar o usuário administrador
app.post("/admin/login", async (req, res) => {
    try {
        // Extrai email e senha da requisição
        const { email, senha } = req.body;
        // Procura o usuário com o email fornecido no banco de dados
        const usuario = await Usuarios.findOne({ email });
        // Verifica se o usuário existe e se a senha está correta
        if (usuario && await bcrypt.compare(senha, usuario.senha)) {
            // Autenticação bem-sucedida, armazena o email do usuário na sessão
            req.session.email = usuario.email;
            res.redirect('/admin/login');
        } else {
            // Credenciais inválidas, renderiza a página de login com erro
            return res.render('admin-login', { error: 'Credenciais inválidas.' });
        }
    } catch (err) {
        console.error("Ocorreu um erro:", err);
        res.status(500).send("Erro ao autenticar o usuário.");
    }
});

// Rota para renderizar a página de login do administrador
app.get('/admin/login', async (req,res)=>{
    // Verifica se o usuário está autenticado
    if(req.session.email == null){
        res.render('admin-login', { error: null })
    }else{
        // Recupera o ID do usuário da sessão
        const emailUsuario = req.session.email;
        // Realiza uma consulta ao banco de dados para obter o nome do usuário
        const usuario = await Usuarios.findOne({ email: emailUsuario });
        // Verifica se o usuário foi encontrado
        if (!usuario) {
            res.status(404).send('Usuário não encontrado');
            return;
        }
        // Determina o nível de autorização do usuário
        let autUsuario;
        if(usuario.adm == "super"){
            autUsuario = 3;
        } else if(usuario.adm == "med"){
            autUsuario = 2;
        }else{
            autUsuario = 1;
        }
        // Renderiza a página de vagas cadastradas ou aprovadas, dependendo do nível de autorização
        if(usuario.adm == 'super' || usuario.adm == 'med'){
            Vagas.find({'__v': 1}).sort({'_id': -1}).then(function(vagas){
                // Formata os dados das vagas para renderização na página
                vagas = vagas.map(function(val){
                    return {
                        id: val._id,
                        titulo: val.titulo,
                        imagem: val.imagem,
                        slug: val.slug,
                        dataCriada: val.dataCriada,
                        status: val.__v
                    }
                })
                res.render('vagas-cadastradas', {vagas: vagas, nomeUsuario: usuario.nome, autUsuario});
            })
        }else{
            // Se o usuário não é super ou médio, ele só pode ver as vagas que cadastrou
            Vagas.find({'idUsuario': usuario._id}).sort({'_id': -1}).then(function(vagas){
                vagas = vagas.map(function(val){
                    return {
                        id: val._id,
                        titulo: val.titulo,
                        imagem: val.imagem,
                        descricao: val.descricao,
                        dataCriada: val.dataCriada,
                        slug: val.slug,
                        status: val.__v
                    }
                })
                res.render('vagas-cadastradas', {vagas: vagas, nomeUsuario: usuario.nome, autUsuario});
            })
        }
    }
})



// Rota para exibir as vagas pendentes de aprovação para administradores
app.get('/filtro/vagas', async (req, res) => {
    // Verifica se o usuário está autenticado
    if (req.session.email == null) {
        res.render('sessao-expirou');
    } else {
        // Recupera o email do usuário da sessão
        const emailUsuario = req.session.email;

        // Consulta o banco de dados para obter o usuário pelo email
        const usuario = await Usuarios.findOne({ email: emailUsuario });

        // Verifica se o usuário tem permissão de administrador
        if (usuario.adm !== 'super' && usuario.adm !== 'med') {
            res.send('Não permitido o acesso a essa página!');
            return; // Adiciona um return para garantir que não haja envio de múltiplas respostas
        }

        // Determina o nível de autorização do usuário
        let autUsuario;
        if (usuario.adm == "super") {
            autUsuario = 3;
        } else if (usuario.adm == "med") {
            autUsuario = 2;
        } else {
            autUsuario = 1;
        }

        // Verifica se o usuário foi encontrado
        if (!usuario) {
            res.status(404).send('Usuário não encontrado');
            return;
        }

        // Consulta as vagas pendentes de aprovação e renderiza a página de filtro de vagas
        Vagas.find({ '__v': 0 }).sort({ '_id': -1 }).then(function (vagas) {
            // Formata os dados das vagas para renderização na página
            vagas = vagas.map(function (val) {
                return {
                    id: val._id,
                    titulo: val.titulo,
                    imagem: val.imagem,
                    descricao: val.descricao,
                    dataCriada: val.dataCriada
                }
            })
            res.render('filtro-vagas', { vagas: vagas, nomeUsuario: usuario.nome, autUsuario });
        })
    }
})

// Rotas para obter e atualizar o estado do switch
app.get('/api/obterEstadoSwitch', async (req, res) => {
    try {
        // Consulta o estado atual do switch no banco de dados
        const switchState = await Switch.findOne();
        // Retorna o estado do switch como JSON
        res.json({ estadoAtivo: switchState ? switchState.estado === '1' : false });
    } catch (error) {
        console.error('Erro ao obter o estado do switch:', error);
        res.status(500).json({ error: 'Erro ao obter o estado do switch.' });
    }
});

app.post('/api/atualizarEstadoSwitch', async (req, res) => {
    try {
        // Extrai o novo estado do switch do corpo da requisição
        const novoEstado = req.body.estadoAtivo ? '1' : '0';
        // Atualiza o estado do switch no banco de dados
        const switchState = await Switch.findOneAndUpdate({}, { estado: novoEstado }, { upsert: true, new: true });
        // Retorna o novo estado do switch como JSON
        res.json({ estadoAtivo: switchState.estado === '1' });
    } catch (error) {
        console.error('Erro ao atualizar o estado do switch:', error);
        res.status(500).json({ error: 'Erro ao atualizar o estado do switch.' });
    }
});

// Rota para aprovar uma vaga de emprego
app.get('/admin/aprovar/vaga/:id', async (req, res) => {
    // Busca a vaga de emprego pelo ID fornecido
    const vaga = await Vagas.findOne({ _id: req.params.id });

    // Define o status da vaga como aprovada
    vaga.__v = 1;
    // Salva a alteração no banco de dados
    await vaga.save();

    // Redireciona de volta para a página de filtro de vagas
    res.redirect('/filtro/vagas');
});

// Rota para renderizar o formulário de cadastro de vaga de emprego
app.get('/cadastrar-vaga', async (req, res) => {
    try {
        // Verifica se o usuário está autenticado
        if (req.session.email == null) {
            res.render('sessao-expirou');
        } else {
            // Recupera o email do usuário da sessão
            const emailUsuario = req.session.email;

            // Consulta o banco de dados para obter o usuário pelo email
            const usuario = await Usuarios.findOne({ email: emailUsuario });

            // Determina o nível de autorização do usuário
            let autUsuario;
            if (usuario.adm == "super") {
                autUsuario = 3;
            } else if (usuario.adm == "med") {
                autUsuario = 2;
            } else {
                autUsuario = 1;
            }

            // Verifica se o usuário foi encontrado
            if (!usuario) {
                // Trata o caso em que o usuário não foi encontrado
                res.status(404).send('Usuário não encontrado');
                return;
            }

            // Consulta os cargos disponíveis no banco de dados
            Cargos.find({}).sort({ cargo: 1 }).then(function (cargos) {
                // Formata os dados dos cargos para renderização na página
                cargos = cargos.map(function (val) {
                    return {
                        cargo: val.cargo
                    }
                })
                // Renderiza o formulário de cadastro de vaga de emprego
                res.render('cadastrar-vaga', { idUsuario: usuario._id, cargos: cargos, nomeUsuario: usuario.nome, autUsuario });
            })
        }
    } catch (err) {
        console.error('Erro ao buscar o usuário:', err);
        res.status(500).send('Erro ao buscar o usuário.');
    }
});

// Rota para exibir todos os usuários
app.get('/usuarios', async (req, res) => {
    if (req.session.email == null) {
        res.render('sessao-expirou');
    } else {
        // Recupera o email do usuário da sessão
        const emailUsuario = req.session.email;

        // Consulta o banco de dados para obter o usuário pelo email
        const usuario = await Usuarios.findOne({ email: emailUsuario });

        // Determina o nível de autorização do usuário
        let autUsuario;
        if (usuario.adm == "super") {
            autUsuario = 3;
        } else if (usuario.adm == "med") {
            autUsuario = 2;
        } else {
            autUsuario = 1;
        }

        // Verifica se o usuário tem permissão para acessar esta página
        if (usuario.adm !== 'super' && usuario.adm !== 'med') {
            res.send('Não permitido o acesso a essa página!');
            return; // Adiciona um return para garantir que não haja envio de múltiplas respostas
        }

        // Verifica se o usuário foi encontrado
        if (!usuario) {
            res.status(404).send('Usuário não encontrado');
            return;
        }

        // Consulta todos os usuários no banco de dados
        Usuarios.find({ 'adm': null }).sort({ '_id': -1 }).then(function (usuarios) {
            // Formata os dados dos usuários para renderização na página
            usuarios = usuarios.map(function (val) {
                return {
                    id: val._id,
                    nome: val.nome,
                    email: val.email,
                }
            })
            // Renderiza a página de usuários
            res.render('usuarios', { usuarios: usuarios, nomeUsuario: usuario.nome, autUsuario });
        })
    }
})

// Rota para exibir todos os apoiadores
app.get('/apoiadores', async (req, res) => {
    if (req.session.email == null) {
        res.render('sessao-expirou');
    } else {
        // Recupera o email do usuário da sessão
        const emailUsuario = req.session.email;

        // Consulta o banco de dados para obter o usuário pelo email
        const usuario = await Usuarios.findOne({ email: emailUsuario });

        // Determina o nível de autorização do usuário
        let autUsuario;
        if (usuario.adm == "super") {
            autUsuario = 3;
        } else if (usuario.adm == "med") {
            autUsuario = 2;
        } else {
            autUsuario = 1;
        }

        // Verifica se o usuário tem permissão para acessar esta página
        if (usuario.adm !== 'super' && usuario.adm !== 'med') {
            res.send('Não permitido o acesso a essa página!');
            return; // Adiciona um return para garantir que não haja envio de múltiplas respostas
        }

        // Verifica se o usuário foi encontrado
        if (!usuario) {
            res.status(404).send('Usuário não encontrado');
            return;
        }

        // Consulta todos os apoiadores no banco de dados
        Apoiador.find({}).sort({ '_id': -1 }).then(function (apoiadores) {
            // Formata os dados dos apoiadores para renderização na página
            apoiadores = apoiadores.map(function (val) {
                return {
                    id: val._id,
                    nome: val.nome,
                    imagem: val.imagem
                }
            })
            // Renderiza a página de apoiadores
            res.render('apoiadores', { apoiadores: apoiadores, nomeUsuario: usuario.nome, autUsuario });
        })
    }
})

// Rota para renderizar o formulário de cadastro de apoiador
app.get('/adicionar/apoiador', async (req, res) => {
    try {
        if (req.session.email == null) {
            res.render('sessao-expirou');
        } else {
            // Recupera o email do usuário da sessão
            const emailUsuario = req.session.email;

            // Consulta o banco de dados para obter o usuário pelo email
            const usuario = await Usuarios.findOne({ email: emailUsuario });

            // Determina o nível de autorização do usuário
            let autUsuario;
            if (usuario.adm == "super") {
                autUsuario = 3;
            } else if (usuario.adm == "med") {
                autUsuario = 2;
            } else {
                autUsuario = 1;
            }

            // Verifica se o usuário foi encontrado
            if (!usuario) {
                // Trata o caso em que o usuário não foi encontrado
                res.status(404).send('Usuário não encontrado');
                return;
            }

            // Renderiza o formulário de cadastro de apoiador
            res.render('cadastrar-apoiador', { idUsuario: usuario._id, nomeUsuario: usuario.nome, autUsuario });

        }
    } catch (err) {
        console.error('Erro ao buscar o usuário:', err);
        res.status(500).send('Erro ao buscar o usuário.');
    }
});



// app.post('/admin/cadastro/apoiador', async (req, res) => {
//     try {
//       const imagem = req.body.imagem_recortada;
  
//       const apoiador = await Apoiador.create({
//         nome: req.body.nome_apoiador,
//         link: req.body.link,
//         imagem: imagem,
//         plano: req.body.plano,
//         statusPayment: 'pendente', // padrão
//         dataCriada: new Date(),
//         idUsuario: req.body.id_usuario,
//       });
  
//       // Se for um plano pago, criar pagamento
//       if (req.body.plano !== 'gratuito') {
//         const valorPlano = calcularValorDoPlano(req.body.plano); // Implemente esta função
//         const pagamento = await criarPagamentoMercadoPago(req, apoiador, valorPlano);
//         apoiador.statusPayment = 'pendente'; // Status inicial é pendente
  
//         // Adicionar o ID do pagamento ao apoiador (você pode salvar no banco se quiser)
//         apoiador.idPagamento = pagamento.id;
//         await apoiador.save();
  
//         const link_pagamento = pagamento.point_of_interaction.transaction_data.ticket_url;
//         console.log(link_pagamento)
//         // Redirecionar para a página de pagamento
//         // res.redirect(response.init_point);
//         res.send({ link_pagamento });
//       } else {
//         // Se for gratuito, atualizar status para 'pago'
//         apoiador.statusPayment = 'pago';
//         await apoiador.save();
//         return res.redirect('/admin/login');
//       }
//     } catch (err) {
//       console.error('Erro ao cadastrar o apoiador:', err);
//       res.status(500).send('Erro ao cadastrar o apoiador.');
//     }
//   });

//   function calcularValorDoPlano(plano) {
//     // Lógica para determinar o valor do plano
//     // Substitua com sua própria lógica
//     return plano === 'premium' ? 49.99 : plano === 'moderado' ? 9.99 : 0;
//   }
  
// // Passo 1: Importe as partes do módulo que você deseja usar
// const { MercadoPagoConfig, Payment} = require('mercadopago');

// async function criarPagamentoMercadoPago(req, apoiador, valor) {
//     const client = new MercadoPagoConfig({
//       accessToken: 'TEST-87769228305025-011020-0cee964ae859bff392e5924e20606050-393147628', // Substitua pelo seu token real do Mercado Pago
//       options: {
//         timeout: 5000,
//         idempotencyKey: 'abc',
//       },
//     });

// const payment = new Payment(client);

// const emailUsuario = req.session.email;
// // console.log(emailUsuario);

// const body = {
//     transaction_amount: valor, // Substitua pelo valor desejado
//     description: `Assinatura do Plano - ${apoiador.plano}`,
//     payment_method_id: 'pix', // Substitua pelo ID do método de pagamento desejado
//     payer: {
//       email: `${emailUsuario}`, // Substitua pelo email do pagador
//     },
// };

// try {
//     const pagamento = await payment.create({ body });

//     // console.log(pagamento)
//     return pagamento;
// } catch (error) {
//     console.error('Erro ao criar pagamento no Mercado Pago:', error);
//     throw error;
// }
// }




// app.post('/webhook-mercado-pago', async (req, res) => {
//     try {
//       const evento = req.body;
  
//       // Verifique o tipo de evento
//       if (evento.type === 'payment') {
//         const pagamento = evento.data;
  
//         // Verifique se o pagamento foi confirmado
//         if (pagamento.status === 'approved') {
//           // Atualize o status do apoiador para 'pago' no banco de dados
//           await atualizarStatusApoiador(pagamento.external_reference, 'pago');
//         }
//       }
  
//       res.status(200).send('OK');
//     } catch (error) {
//       console.error('Erro no webhook do Mercado Pago:', error);
//       res.status(500).send('Erro no webhook do Mercado Pago.');
//     }
//   });
  
// async function atualizarStatusApoiador(idPagamento, novoStatus) {
//     try {
//       // Consulte o apoiador com base no idPagamento
//       const apoiador = await Apoiador.findOne({ idPagamento });
  
//       if (!apoiador) {
//         console.error('Apoiador não encontrado:', idPagamento);
//         return;
//       }
  
//       // Atualize o statusPayment
//       apoiador.statusPayment = novoStatus;
//       await apoiador.save();
//       console.log(`Status do apoiador atualizado para ${novoStatus}:`, idPagamento);
//     } catch (error) {
//       console.error('Erro ao atualizar status do apoiador:', error);
//     }
// }

// // ///////////////////////////////////////////////////

// // Lógica de verificação periódica (pode ser um cron job ou outra estratégia)
// function verificarPagamentosPendentes() {
//     // Lógica para obter todos os pagamentos pendentes do seu sistema ou banco de dados
//     const pagamentosPendentes = obterPagamentosPendentes();

//     // Verificar cada pagamento
//     pagamentosPendentes.forEach(async (pagamento) => {
//         const tempoDecorrido = calcularTempoDecorrido(pagamento.dataCriacao);

//         // Se o pagamento está pendente por mais de 10 minutos, cancelar
//         if (tempoDecorrido > 10 * 60 * 1000) { // 10 minutos em milissegundos
//             try {
//                 // Utilize a API do Mercado Pago para cancelar o pagamento
//                 await cancelarPagamentoNoMercadoPago(pagamento.idPagamento);
//                 // Atualize o status do pagamento no seu sistema como cancelado
//                 marcarPagamentoComoCancelado(pagamento.id);
//             } catch (error) {
//                 console.error('Erro ao cancelar pagamento:', error);
//             }
//         }
//     });
// }

// // Exemplo de como calcular o tempo decorrido desde a criação
// function calcularTempoDecorrido(dataCriacao) {
//     const agora = new Date();
//     const tempoDecorrido = agora - new Date(dataCriacao);
//     return tempoDecorrido;
// }

// // Exemplo de como obter pagamentos pendentes do seu sistema ou banco de dados
// function obterPagamentosPendentes() {
//     // Lógica para obter os pagamentos pendentes do seu sistema ou banco de dados
//     // Retorne uma lista de pagamentos pendentes
//     return listaDePagamentosPendentes;
// }

// // Exemplo de como cancelar um pagamento no Mercado Pago
// async function cancelarPagamentoNoMercadoPago(idPagamento) {
//     // Utilize a API do Mercado Pago para cancelar o pagamento
//     // Substitua 'API_DO_MERCADO_PAGO' pelo seu token de acesso real
//     const mercadoPagoClient = new MercadoPagoClient({ accessToken: 'API_DO_MERCADO_PAGO' });
//     const pagamentoAPI = new PagamentoAPI(mercadoPagoClient);

//     await pagamentoAPI.cancelarPagamento(idPagamento);
// }

// // Exemplo de como marcar um pagamento como cancelado no seu sistema ou banco de dados
// function marcarPagamentoComoCancelado(idPagamento) {
//     // Lógica para atualizar o status do pagamento no seu sistema como cancelado
// }

// // ////////////////////////////////
  

// const cron = require('node-cron');

// // agendar tarefa para ser executada a cada hora
// cron.schedule('0 * * * *', async () => {
//     const agora = new Date();
//     const vinteQuatroHorasAtras = new Date(agora - 24 * 60 * 60 * 1000);

//     // encontrar e deletar todos os apoiadores com plano 'gratuito' criados há mais de 24 horas
//     await Apoiador.deleteMany({
//         plano: 'gratuito',
//         dataCriada: { $lt: vinteQuatroHorasAtras }
//     });
// });


// Rota para deletar um apoiador específico
app.get('/admin/deletar/apoiador/:id/:imagem', (req, res) => {
    // Verifica se há uma sessão ativa
    if(req.session.email == null){
        // Se não houver sessão, renderiza a página de sessão expirada
        res.render('sessao-expirou');
    } else {
        // Remove o arquivo de imagem associado ao apoiador
        fs.unlink(__dirname+'/public/images_vagas/'+req.params.imagem, (err) => {
            if (err) {
                console.error('Erro ao excluir o arquivo:', err);
            }
            // Deleta o apoiador do banco de dados
            Apoiador.deleteOne({ _id: req.params.id }).then(function () {
                // Redireciona para a página de login do administrador após a exclusão
                res.redirect('/admin/login');
                // console.log('excluido com sucesso')
            });
        });
    }
});

// Rota para exibir os dados pessoais do usuário
app.get('/dados-pessoais', async (req,res)=>{
    // Verifica se há uma sessão ativa
    if(req.session.email == null){
        // Se não houver sessão, renderiza a página de sessão expirada
        res.render('sessao-expirou');
    } else {
        // Recupera o email do usuário da sessão
        const emailUsuario = req.session.email;

        // Realiza uma consulta ao banco de dados para obter o usuário com base no email
        const usuario = await Usuarios.findOne({ email: emailUsuario });

        let autUsuario;
        // Determina o nível de autorização do usuário
        if(usuario.adm == "super"){
            autUsuario = 3;
        } else if(usuario.adm == "med"){
            autUsuario = 2;
        } else {
            autUsuario = 1;
        }
        
        if (!usuario) {
            // Trata o caso em que o usuário não foi encontrado
            res.status(404).send('Usuário não encontrado');
            return;
        }
        // Renderiza a página de dados pessoais do usuário
        res.render('dados-pessoais', {nomeUsuario: usuario.nome, emailUsuario: usuario.email, autUsuario});
    }
});

// Rota para exibir os cargos e vagas disponíveis
app.get('/cargos-vagas', async (req,res)=>{
    // Verifica se há uma sessão ativa
    if(req.session.email == null){
        // Se não houver sessão, renderiza a página de sessão expirada
        res.render('sessao-expirou');
    } else {
        // Recupera o email do usuário da sessão
        const emailUsuario = req.session.email;

        // Realiza uma consulta ao banco de dados para obter o usuário com base no email
        const usuario = await Usuarios.findOne({ email: emailUsuario });

        let autUsuario;
        // Determina o nível de autorização do usuário
        if(usuario.adm == "super"){
            autUsuario = 3;
        } else if(usuario.adm == "med"){
            autUsuario = 2;
        } else {
            autUsuario = 1;
        }

        // Verifica se o usuário tem permissão para acessar a página de cargos e vagas
        if (usuario.adm !== 'super' && usuario.adm !== 'med') {
            // Se não tiver permissão, envia uma mensagem indicando que o acesso não é permitido
            res.send('Não permitido o acesso a essa página!');
            return; // Adicione um return para garantir que não haja envio de múltiplas respostas
        }

        if (!usuario) {
            // Trata o caso em que o usuário não foi encontrado
            res.status(404).send('Usuário não encontrado');
            return;
        }

        // Realiza uma consulta ao banco de dados para obter todos os cargos disponíveis, ordenados por ordem alfabética
        Cargos.find({}).sort({ cargo: 1 }).then(function(cargos){
            // Formata os cargos para torná-los adequados para renderização na página
            cargos = cargos.map(function(val){
                return {
                    id: val._id,
                    cargo: val.cargo
                }
            })
            // Renderiza a página de cargos e vagas, passando os dados necessários para renderização
            res.render('cargos-vagas', {cargos: cargos, nomeUsuario: usuario.nome, autUsuario});
        })
    }
});


// Rota para cadastrar um novo cargo
app.post('/admin/cadastro/cargo', upload.single('form_cargo'), async (req, res) => {
    try {
        // Cria um novo cargo no banco de dados com base nos dados recebidos do formulário
        const cargo = await Cargos.create({
            cargo: req.body.cargo_vaga
        });

        // Redireciona para a página de cargos e vagas após o cadastro do cargo
        res.redirect('/cargos-vagas');
    } catch (err) {
        // Em caso de erro, exibe uma mensagem de erro e status 500
        console.error('Erro ao cadastrar o cargo:', err);
        res.status(500).send('Erro ao cadastrar o cargo.');
    }
});

// Rota para cadastrar uma nova vaga
app.post('/admin/cadastro/vaga', async (req, res) => {
    try {
        // Extrai os dados do corpo da requisição
        const imagem = req.body.imagem_recortada;

        // Cria uma nova vaga no banco de dados com base nos dados recebidos do formulário
        const vaga = await Vagas.create({
            titulo: req.body.titulo_vaga,
            empresa: req.body.empresa_vaga,
            cidade: req.body.cidade_vaga,
            quantidade: req.body.quant_vaga,
            categoria: req.body.checks,
            experiencia: req.body.experiencia_vaga,
            modelo: req.body.modelo_vaga,
            descricao: req.body.descricao_vaga,
            salario: req.body.salario_vaga,
            contato: req.body.contato_vaga,
            imagem: imagem,
            dataCriada: new Date().toLocaleString('pt-br').substr(0, 10),
            slug: new Date().getTime(),
            idUsuario: req.body.id_usuario
        });

        // Verifica o estado do switch antes de salvar a vaga
        const switchState = await Switch.findOne();
        if(switchState.estado === '0'){
            // Se o switch estiver desligado, marca a versão da vaga como 1
            vaga.__v = 1
            // Salva a vaga com a versão marcada
            await vaga.save();
        }

        // Redireciona para a página de login do administrador após o cadastro da vaga
        res.redirect('/admin/login');
    } catch (err) {
        // Em caso de erro, exibe uma mensagem de erro e status 500
        console.error('Erro ao cadastrar a vaga:', err);
        res.status(500).send('Erro ao cadastrar a vaga.');
    }
});

// Rota para cadastrar uma nova imagem
app.post('/admin/cadastro/imagem', (req, res) => {
    // Extrai os dados da imagem em base64 do corpo da requisição
    const base64Data = req.body.imagemBase64;

    // Analisa a extensão da imagem a partir dos dados base64
    const matches = base64Data.match(/^data:image\/([A-Za-z]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        // Se o formato da imagem for inválido, retorna um status 400 e uma mensagem de erro
        return res.status(400).send('Formato de imagem inválido');
    }

    // Extrai a extensão da imagem e gera um nome de arquivo único
    const imageExtension = matches[1];
    const fileName = new Date().getTime() + '.' + imageExtension;
    const imagePath = path.join(__dirname, 'public', 'images_vagas', fileName);
    const imagePathMod = 'https://empregospb.com/public/images_vagas/'+ fileName;

    // Decodifica e salva a imagem
    fs.writeFile(imagePath, matches[2], 'base64', (err) => {
        if (err) {
            // Em caso de erro ao salvar a imagem, exibe uma mensagem de erro e status 500
            console.error('Erro ao salvar a imagem:', err);
            res.status(500).send('Erro ao salvar a imagem.');
        } else {
            // Se a imagem for salva com sucesso, retorna um JSON indicando o sucesso e o caminho da imagem
            res.json({ success: true, imagePathMod });
        }
    });
});



// Rota para cadastrar um novo usuário a partir de um formulário
app.post('/admin/cadastrar/usuario/form', async (req, res) => {
    try {
        // Verifica se o email já está cadastrado no banco de dados
        const usuarioExistente = await Usuarios.findOne({ email: req.body.email });
        if (usuarioExistente) {
            // Se o email já estiver cadastrado, retorna um status 400 e uma mensagem de erro
            return res.status(400).send({ success: false, message: 'Email já está em uso.' });
        }

        // Hash da senha do usuário antes de armazená-la no banco de dados
        const hashedPassword = await bcrypt.hash(req.body.senha, 10);

        // Cria um novo usuário no banco de dados com os dados fornecidos no formulário
        const usuario = await Usuarios.create({
            nome: req.body.nome,
            email: req.body.email,
            senha: hashedPassword
        });

        // Responde com um JSON indicando sucesso e uma mensagem
        res.send({ success: true, message: 'Usuário cadastrado com sucesso.' });
    } catch (err) {
        // Em caso de erro, exibe uma mensagem de erro e status 500
        console.error('Erro ao cadastrar o usuário:', err);
        res.status(500).send('Erro ao cadastrar o usuário.');
    }
});

// Rota para adicionar um novo usuário
app.post('/admin/adicionar/usuario', (req, res)=>{
    // Gera um ID único para o novo usuário baseado no tempo atual
    const idUsuario = new Date().getTime();
    // Constrói o link para o cadastro do usuário com base no ID gerado
    let link = 'https://empregospb.com/cadastrar/usuario/'+idUsuario;
    // Retorna um JSON indicando sucesso e o link para cadastro do usuário
    res.json({ success: true, link });
});

// Rota para renderizar a página de cadastro de usuário com base no ID fornecido
app.get('/cadastrar/usuario/:id', (req, res)=>{
    // Renderiza a página 'cadastrar-usuario'
    res.render('cadastrar-usuario', {});
});

// Rota para deletar um usuário específico com base no ID fornecido
app.get('/deletar/usuario/:id', (req, res) => {
    // Deleta o usuário do banco de dados com base no ID fornecido na requisição
    Usuarios.deleteOne({ _id: req.params.id }).then(function () {
        // Redireciona para a página de usuários após a exclusão
        res.redirect('/usuarios');
        // console.log('excluido com sucesso')
    });
});

// Rota para deletar uma vaga específica com base no ID e na imagem fornecidos
app.get('/deletar/vaga/:id/:imagem', (req, res) => {
    if(req.session.email == null){
        // Se a sessão do usuário expirou, renderiza a página 'sessao-expirou'
        res.render('sessao-expirou');
    }else{
        // Constrói o caminho completo da imagem a ser deletada
        const imagePath = __dirname+'/public/images_vagas/'+req.params.imagem;
        if (fs.existsSync(imagePath)) {
            // Se a imagem existe, exclui-a
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error('Erro ao excluir o arquivo:', err);
                }
                // Após excluir a imagem, deleta a vaga do banco de dados com base no ID fornecido
                Vagas.deleteOne({ _id: req.params.id }).then(function () {
                    // Redireciona para a página de login do administrador após a exclusão
                    res.redirect('/admin/login');
                });
            });
        } else {
            // Se a imagem não existe, apenas deleta a vaga do banco de dados com base no ID fornecido
            Vagas.deleteOne({ _id: req.params.id }).then(function () {
                // Redireciona para a página de login do administrador após a exclusão
                res.redirect('/admin/login');
                // console.log('excluido com sucesso')
            });
        }
    }
});

// Rota para deletar um cargo específico com base no ID fornecido
app.get('/deletar/cargo/:id', (req, res) => {
    if(req.session.email == null){
        // Se a sessão do usuário expirou, renderiza a página 'sessao-expirou'
        res.render('sessao-expirou');
    }else{
        // Deleta o cargo do banco de dados com base no ID fornecido na requisição
        Cargos.deleteOne({ _id: req.params.id }).then(function () {
            // Redireciona para a página de cargos e vagas após a exclusão
            res.redirect('/cargos-vagas');
            // console.log('excluido com sucesso')
        });
    }
});



// Rota para exibir as vagas cadastradas por um usuário específico
app.get('/vaga/usuario/:id', async (req, res) => {
    // Verifica se há uma sessão ativa
    if(req.session.email == null){
        // Se não houver sessão ativa, renderiza a página 'sessao-expirou'
        res.render('sessao-expirou');
    }else{
        // Recupera o email do usuário da sessão
        const emailUsuario = req.session.email;

        // Realiza uma consulta ao banco de dados para obter os dados do usuário logado
        const usuario = await Usuarios.findOne({ email: emailUsuario });

        if (!usuario) {
            // Se o usuário não for encontrado, retorna um erro 404
            res.status(404).send('Usuário não encontrado');
            return;
        }

        // Define o nível de autorização do usuário (super, med, ou normal)
        let autUsuario;
        if(usuario.adm == "super"){
            autUsuario = 3;
        } else if(usuario.adm == "med"){
            autUsuario = 2;
        }else{
            autUsuario = 1;
        }

        // Verifica se o usuário tem permissão para acessar esta página
        if (usuario.adm !== 'super' && usuario.adm !== 'med') {
            res.send('Não permitido o acesso a essa página!');
            return;
        }

        // Recupera o ID do usuário específico fornecido na requisição
        const idUsuario = req.params.id;

        // Realiza uma consulta ao banco de dados para obter os dados do usuário cujas vagas serão exibidas
        const usuarioVagas = await Usuarios.findOne({ _id: idUsuario });

        // Realiza uma consulta ao banco de dados para obter as vagas cadastradas pelo usuário específico
        Vagas.find({idUsuario}).sort({'_id': -1}).then(function(vagas){
            // Mapeia as informações das vagas para um formato mais adequado
            vagas = vagas.map(function(val){
                return {
                    id: val._id,
                    titulo: val.titulo,
                    imagem: val.imagem,
                    slug: val.slug,
                    dataCriada: val.dataCriada
                }
            })
            // Renderiza a página 'vagas-cadastradas-usuario' com as vagas do usuário específico
            res.render('vagas-cadastradas-usuario', {vagas: vagas, nomeUsuarioVagas: usuarioVagas.nome, nomeUsuario: usuario.nome, autUsuario});
        })
    }
})

// Rota para exibir os detalhes de uma vaga com base no slug
app.get('/:slug', async (req, res) => {
    const requestVagaSlug = req.params.slug;
    let user = null;

    try {
        // Consulta a vaga com base no slug fornecido na requisição
        const vaga = await Vagas.findOne({ slug: requestVagaSlug });

        if (!vaga) {
            // Se a vaga não for encontrada, retorna uma mensagem de página não existente
            res.send('Página não existente!'); // Página de erro 404, ajuste conforme necessário
            return;
        }

        // Renderiza a página 'vaga-single' com os detalhes da vaga
        res.render('vaga-single', {vaga, user});
    } catch (err) {
        // Em caso de erro, exibe uma mensagem de erro e status 500
        console.error("Ocorreu um erro:", err);
        res.status(500).send("Erro ao buscar a vaga.");
    }
});

// Rota para exibir os detalhes de uma vaga com base no slug e no usuário
app.get('/:slug/:user', async (req, res) => {
    const requestVagaSlug = req.params.slug;
    const user = req.params.user;

    try {
        // Consulta a vaga com base no slug fornecido na requisição
        const vaga = await Vagas.findOne({ slug: requestVagaSlug });

        if (!vaga) {
            // Se a vaga não for encontrada, retorna uma mensagem de página não existente
            res.send('Página não existente!'); // Página de erro 404, ajuste conforme necessário
            return;
        }

        // Renderiza a página 'vaga-single' com os detalhes da vaga
        res.render('vaga-single', {vaga, user});
    } catch (err) {
        // Em caso de erro, exibe uma mensagem de erro e status 500
        console.error("Ocorreu um erro:", err);
        res.status(500).send("Erro ao buscar a vaga.");
    }
});



// Configuração do Nodemailer (configure conforme o seu provedor de e-mail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'empregospbweb@gmail.com',
        pass: 'lsxh fswu pzjl jque'
    }
});

// Função para enviar o código por e-mail
function enviarCodigoPorEmail(destinatario, codigo) {
    const mailOptions = {
        from: 'empregospbweb@gmail.com',
        to: destinatario,
        subject: 'Código de Recuperação de Senha',
        text: `Seu código de recuperação é: ${codigo}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Erro ao enviar o e-mail:', error);
        }
    });
}

// Rota para exibir a página de inserção de e-mail para resetar a senha
app.get('/resetar/senha/usuario', async (req, res) => {
    // Renderiza a página para o usuário inserir o e-mail
    res.render('resetar-senha', { error: null });
});

// Rota para processar o e-mail inserido e enviar o código de recuperação
app.post('/resetar/senha/usuario', async (req, res) => {
    try {
        const { email } = req.body;
        const usuario = await Usuarios.findOne({ email });

        if (!usuario) {
            // Usuário não encontrado, retorna mensagem de erro
            return res.render('resetar-senha', { error: 'E-mail não encontrado.' });
        }

        // Gerar código de recuperação e salvá-lo no banco de dados
        const codigoRecuperacao = Math.floor(100000 + Math.random() * 900000).toString();
        usuario.codigoRecuperacao = codigoRecuperacao;
        await usuario.save();

        // Enviar o código por e-mail
        enviarCodigoPorEmail(usuario.email, codigoRecuperacao);

        // Renderizar a página de confirmação
        res.render('codigo-recuperacao-enviado', {emailUsuario: usuario.email, error: null});
    } catch (err) {
        console.error('Erro ao resetar a senha:', err);
        res.status(500).send('Erro ao resetar a senha.');
    }
});

// Rota para verificar o código de recuperação
app.post('/verificar/codigo/usuario', async (req, res) => {
    try {
        const email = req.body.email_usuario;
        const usuario = await Usuarios.findOne({ email });

        if (!usuario) {
            // Usuário não encontrado, retorna mensagem de erro
            return res.render('codigo-recuperacao-enviado', {emailUsuario: usuario.email, error: 'Usuário não encontrado.' });
        }

        const codigo = req.body.codigo;

        if (usuario.codigoRecuperacao && codigo == usuario.codigoRecuperacao) {
            // Renderiza a página para definir uma nova senha
            res.render('nova-senha', { emailUsuario: usuario.email });
        } else {
            // Código de verificação inválido, retorna mensagem de erro
            return res.render('codigo-recuperacao-enviado', { error: 'Código de verificação inválido.' });
        }
    } catch (err) {
        console.error('Erro ao resetar a senha:', err);
        res.status(500).send('Erro ao resetar a senha.');
    }
});

// Rota para acessar a página de mudança de senha
app.get('/admin/cadastrar/nova/senha', async (req, res) => {
    try {
        const email = req.session.email;
        const usuario = await Usuarios.findOne({ email });

        if (!usuario) {
            console.log("Usuário não existe!");
        }

        return res.render('nova-senha', { emailUsuario: usuario.email });
    } catch (err) {
        console.error('Erro ao acessar a página para mudar senha:', err);
        res.status(500).send('Erro ao resetar a senha.');
    }
});

// Rota para processar a mudança de senha
app.post('/admin/cadastrar/nova/senha', async (req, res) => {
    try {
        const email = req.body.email;
        const usuario = await Usuarios.findOne({ email });

        if (!usuario) {
            // Usuário não encontrado, retorna mensagem de erro
            return res.render('nova-senha', { error: 'E-mail não encontrado.' });
        }
        const hashedPassword = await bcrypt.hash(req.body.senha, 10);

        // Atualiza a senha do usuário no banco de dados
        usuario.senha = hashedPassword;
        await usuario.save();

        // Retorna uma mensagem de sucesso
        res.send({ success: true, message: 'Senha cadastrada com sucesso.' });
    } catch (err) {
        console.error('Erro ao resetar a senha:', err);
        res.status(500).send('Erro ao resetar a senha.');
    }
});



// Rota para sair do painel do usuário e encerrar a sessão
app.get('/sair/painel/usuario', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Erro ao encerrar a sessão:', err);
            res.status(500).send('Erro ao encerrar a sessão.');
        } else {
            res.redirect('/'); // Redirecione para a página inicial ou qualquer outra página desejada
        }
    });
});

// Inicia o servidor na porta 3000
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
