
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const fs = require('fs')
const multer = require('multer');
const nodemailer = require('nodemailer');
var mongoose = require("mongoose");


const app = express()

const storage = multer.memoryStorage(); // Você pode ajustar isso para armazenar os arquivos no disco se preferir
const upload = multer({ storage: storage });

var session = require('express-session');

app.use(session({ 
    secret: 'keyboard cat', 
    cookie: { maxAge: 720000 },
    resave: false,  // Adicionado para resolver o aviso de depreciação
    saveUninitialized: true  // Adicionado para resolver o aviso de depreciação
}));

const Vagas = require('./Vagas.js');
const Usuarios = require('./Usuarios.js');
const Cargos = require('./Cargos.js');
const Switch = require('./Switch.js');
const Apoiador = require('./Apoiador.js');

mongoose.connect("mongodb+srv://root:uTKJaYuRHvJuAN0C@cluster0.5glkwii.mongodb.net/?retryWrites=true&w=majority",{useNewUrlParser: true, useUnifiedTopology: true}).then(function(){
    console.log('Conectado com sucesso!');
}).catch(function(err){
    console.log(err.message);
})

app.use(bodyParser.json({ limit: '200mb' })); // Aumente esse limite conforme necessário
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true })); // Aumente esse limite conforme necessário


app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('/public', express.static(path.join(__dirname, 'public')));
// app.use('/js', express.static(path.join(__dirname, 'js'))); não usado
app.set('views', path.join(__dirname, '/pages'));




app.get('/', async (req, res) => {
    try {
        const { filtroCargo, filtroCidade, buscar, inicio, limite } = req.query;
        const vagas = await obterVagasFiltradas(filtroCargo, filtroCidade, buscar, inicio, limite);
        
        Cargos.find({}).sort({ cargo: 1 }).then(function(cargos) {
            cargos = cargos.map(function(val) {
                return { cargo: val.cargo };
            });

            res.render('home', { vagas, cargos });
        });
    } catch (err) {
        console.error("Ocorreu um erro:", err);
        res.status(500).send("Erro ao buscar as vagas.");
    }
});

app.get('/api/obterVagasFiltradas', async (req, res) => {
    try {
        const { filtroCargo, filtroCidade, buscar, inicio, limite } = req.query;
        const vagas = await obterVagasFiltradas(filtroCargo, filtroCidade, buscar, inicio, limite);
        res.json(vagas);
    } catch (error) {
        console.error('Erro ao obter vagas filtradas:', error);
        res.status(500).json({ error: 'Erro ao obter vagas filtradas.' });
    }
});

app.post('/api/atualizarEstadoFiltros', async (req, res) => {
    try {
        const { filtroCargo, filtroCidade, buscar, inicio, limite } = req.body;

        const vagasFiltradas = await obterVagasFiltradas(filtroCargo, filtroCidade, buscar, inicio, limite);

        res.json({ success: true, vagas: vagasFiltradas });
    } catch (error) {
        console.error('Erro ao atualizar o estado dos filtros:', error);
        res.status(500).json({ error: 'Erro ao atualizar o estado dos filtros.' });
    }
});


async function obterVagasFiltradas(filtroCargo, filtroCidade, buscar, inicio = 0, limite = 12) {
    try {
        let query = {};

        // Filtro por título da vaga (ignorado se não especificado)
        if (buscar && buscar.trim() !== "") {
            query.titulo = { $regex: new RegExp(buscar, 'i') };
        }

        // Filtro por categoria (ignorado se for "Geral")
        if (filtroCargo && filtroCargo !== "Geral") {
            query.categoria = filtroCargo;
        }

        // Filtro por cidade (ignorado se for "Escolher...")
        if (filtroCidade && filtroCidade !== "Escolher...") {
            query.cidade = filtroCidade;
        }

        // Filtro por __v (ignorado se não especificado)
        query.__v = 1;

        // Obtenha as vagas correspondentes aos filtros
        // Use o método 'skip' para pular as 'inicio' primeiras vagas
        // Use o método 'limit' para limitar o resultado a 'limite' vagas
        const vagas = await Vagas.find(query).sort({'_id': -1}).skip(inicio).limit(limite);

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



const bcrypt = require('bcrypt');

app.post("/admin/login", async (req, res) => {
    try {
        const { email, senha } = req.body;
        const usuario = await Usuarios.findOne({ email });

        if (usuario && await bcrypt.compare(senha, usuario.senha)) {
            // Autenticação bem-sucedida
            req.session.email = usuario.email;
            res.redirect('/admin/login');
        } else {
            // Credenciais inválidas
            res.status(401).send("Credenciais inválidas.");
        }
    } catch (err) {
        console.error("Ocorreu um erro:", err);
        res.status(500).send("Erro ao autenticar o usuário.");
    }
})


app.get('/admin/login', async (req,res)=>{
    if(req.session.email == null){
        // console.log("Não logou")
        res.render('admin-login')
    }else{
        // Recupere o ID do usuário da sessão
        const emailUsuario = req.session.email;

        // Realize uma consulta ao banco de dados para obter o nome do usuário
        const usuario = await Usuarios.findOne({ email: emailUsuario });

        if (!usuario) {
            // Trate o caso em que o usuário não foi encontrado
            res.status(404).send('Usuário não encontrado');
            return;
        }

        let autUsuario;
        if(usuario.adm == "super"){
            autUsuario = 3;
        } else if(usuario.adm == "med"){
            autUsuario = 2;
        }else{
            autUsuario = 1;
        }

        if(usuario.adm == 'super' || usuario.adm == 'med'){
            Vagas.find({'__v': 1}).sort({'_id': -1}).then(function(vagas){
                vagas = vagas.map(function(val){
                    // let linkImage = (val.imagem).split("/");
                    // let formatLinkImage = linkImage[linkImage.length - 1];
                    return {
                        id: val._id,
                        titulo: val.titulo,
                        imagem: val.imagem,
                        descricao: val.descricao,
                        dataCriada: val.dataCriada
                    }
                })
                res.render('vagas-cadastradas', {vagas: vagas, nomeUsuario: usuario.nome, autUsuario});
            })
        }else{
            Vagas.find({'idUsuario': usuario._id}).sort({'_id': -1}).then(function(vagas){
                vagas = vagas.map(function(val){
                    // let linkImage = (val.imagem).split("/");
                    // let formatLinkImage = linkImage[linkImage.length - 1];
                    return {
                        id: val._id,
                        titulo: val.titulo,
                        imagem: val.imagem,
                        descricao: val.descricao,
                        dataCriada: val.dataCriada
                    }
                })
                res.render('vagas-cadastradas', {vagas: vagas, nomeUsuario: usuario.nome, autUsuario});
            })
        }
    }
})


app.post('/filtro/vagas', (req, res)=>{
    res.redirect('/admin/login')
})

app.get('/filtro/vagas', async (req,res)=>{
    if(req.session.email == null){
        // console.log("Não logou")
        res.render('admin-login')
    }else{
        // Recupere o ID do usuário da sessão
        const emailUsuario = req.session.email;

        // Realize uma consulta ao banco de dados para obter o nome do usuário
        const usuario = await Usuarios.findOne({ email: emailUsuario });

        if (usuario.adm !== 'super' && usuario.adm !== 'med') {
            res.send('Não permitido o acesso a essa página!');
            return; // Adicione um return para garantir que não haja envio de múltiplas respostas
        }

        let autUsuario;
        if(usuario.adm == "super"){
            autUsuario = 3;
        } else if(usuario.adm == "med"){
            autUsuario = 2;
        }else{
            autUsuario = 1;
        }

        if (!usuario) {
            // Trate o caso em que o usuário não foi encontrado
            res.status(404).send('Usuário não encontrado');
            return;
        }

        Vagas.find({'__v': 0}).sort({'_id': -1}).then(function(vagas){
            vagas = vagas.map(function(val){
                // let linkImage = (val.imagem).split("/");
                // let formatLinkImage = linkImage[linkImage.length - 1];
                return {
                    id: val._id,
                    titulo: val.titulo,
                    imagem: val.imagem,
                    descricao: val.descricao,
                    dataCriada: val.dataCriada
                }
            })
            res.render('filtro-vagas', {vagas: vagas, nomeUsuario: usuario.nome, autUsuario});
        })
    }
})


// Rota para obter o estado atual
app.get('/api/obterEstadoSwitch', async (req, res) => {
    try {
        const switchState = await Switch.findOne();
        res.json({ estadoAtivo: switchState ? switchState.estado === '1' : false });
    } catch (error) {
        console.error('Erro ao obter o estado do switch:', error);
        res.status(500).json({ error: 'Erro ao obter o estado do switch.' });
    }
});

// Rota para atualizar o estado
app.post('/api/atualizarEstadoSwitch', async (req, res) => {
    try {
        const novoEstado = req.body.estadoAtivo ? '1' : '0';
        const switchState = await Switch.findOneAndUpdate({}, { estado: novoEstado }, { upsert: true, new: true });

        res.json({ estadoAtivo: switchState.estado === '1' });
    } catch (error) {
        console.error('Erro ao atualizar o estado do switch:', error);
        res.status(500).json({ error: 'Erro ao atualizar o estado do switch.' });
    }
});



app.get('/admin/aprovar/vaga/:id', async (req, res) => {
    
    const vaga = await Vagas.findOne({ _id: req.params.id});

    vaga.__v = 1;
    await vaga.save();
    
    res.redirect('/filtro/vagas');
})


app.post('/cadastrar-vaga', (req, res)=>{
    res.redirect('/admin/login')
})

app.get('/cadastrar-vaga', async (req, res) => {
    try {
        if (req.session.email == null) {
            res.render('admin-login');
        } else {
            // Recupere o ID do usuário da sessão
            const emailUsuario = req.session.email;

            // Realize uma consulta ao banco de dados para obter o _id do usuário
            const usuario = await Usuarios.findOne({ email: emailUsuario });

            let autUsuario;
            if(usuario.adm == "super"){
                autUsuario = 3;
            } else if(usuario.adm == "med"){
                autUsuario = 2;
            }else{
                autUsuario = 1;
            }
            
            if (!usuario) {
                // Trate o caso em que o usuário não foi encontrado
                res.status(404).send('Usuário não encontrado');
                return;
            }

            Cargos.find({}).sort({ cargo: 1 }).then(function(cargos){
                cargos = cargos.map(function(val){
                    return {
                        cargo: val.cargo
                    }
                })
                res.render('cadastrar-vaga', {idUsuario: usuario._id, cargos: cargos, nomeUsuario: usuario.nome, autUsuario});
            })
        }
    } catch (err) {
        console.error('Erro ao buscar o usuário:', err);
        res.status(500).send('Erro ao buscar o usuário.');
    }
});



app.post('/usuarios', (req, res)=>{
    res.redirect('admin/login')
})

app.get('/usuarios', async (req,res)=>{
    if(req.session.email == null){
        res.render('admin-login')
    }else{
        // Recupere o ID do usuário da sessão
        const emailUsuario = req.session.email;

        // Realize uma consulta ao banco de dados para obter o _id do usuário
        const usuario = await Usuarios.findOne({ email: emailUsuario });

        let autUsuario;
        if(usuario.adm == "super"){
            autUsuario = 3;
        } else if(usuario.adm == "med"){
            autUsuario = 2;
        }else{
            autUsuario = 1;
        }

        if (usuario.adm !== 'super' && usuario.adm !== 'med') {
            res.send('Não permitido o acesso a essa página!');
            return; // Adicione um return para garantir que não haja envio de múltiplas respostas
        }
        
        if (!usuario) {
            // Trate o caso em que o usuário não foi encontrado
            res.status(404).send('Usuário não encontrado');
            return;
        }

        Usuarios.find({'adm': null}).sort({'_id': -1}).then(function(usuarios){
            usuarios = usuarios.map(function(val){
                // let linkImage = (val.imagem).split("/");
                // let formatLinkImage = linkImage[linkImage.length - 1];
                return {
                    id: val._id,
                    nome: val.nome,
                    email: val.email,
                }
            })
            res.render('usuarios', {usuarios: usuarios, nomeUsuario: usuario.nome, autUsuario});
        })
    }
})

app.post('/apoiadores', (req, res)=>{
    res.redirect('admin/login')
})

app.get('/apoiadores', async (req,res)=>{
    if(req.session.email == null){
        res.render('admin-login')
    }else{
        // Recupere o ID do usuário da sessão
        const emailUsuario = req.session.email;

        // Realize uma consulta ao banco de dados para obter o _id do usuário
        const usuario = await Usuarios.findOne({ email: emailUsuario });
        let autUsuario;
        if(usuario.adm == "super"){
            autUsuario = 3;
        } else if(usuario.adm == "med"){
            autUsuario = 2;
        }else{
            autUsuario = 1;
        }

        if (usuario.adm !== 'super' && usuario.adm !== 'med') {
            res.send('Não permitido o acesso a essa página!');
            return; // Adicione um return para garantir que não haja envio de múltiplas respostas
        }
        
        if (!usuario) {
            // Trate o caso em que o usuário não foi encontrado
            res.status(404).send('Usuário não encontrado');
            return;
        }
        
        Apoiador.find({}).sort({'_id': -1}).then(function(apoiadores){
            apoiadores = apoiadores.map(function(val){
                // let linkImage = (val.imagem).split("/");
                // let formatLinkImage = linkImage[linkImage.length - 1];
                return {
                    id: val._id,
                    nome: val.nome,
                    imagem: val.imagem
                }
            })
            res.render('apoiadores', {apoiadores: apoiadores, nomeUsuario: usuario.nome, autUsuario});
        })
    }
})

app.post('/adicionar/apoiador', async (req,res)=>{
    res.redirect('/admin/login')
})

app.get('/adicionar/apoiador', async (req,res)=>{
    
    try {
        if (req.session.email == null) {
            res.render('admin-login');
        } else {
            // Recupere o ID do usuário da sessão
            const emailUsuario = req.session.email;

            // Realize uma consulta ao banco de dados para obter o _id do usuário
            const usuario = await Usuarios.findOne({ email: emailUsuario });

            let autUsuario;
            if(usuario.adm == "super"){
                autUsuario = 3;
            } else if(usuario.adm == "med"){
                autUsuario = 2;
            }else{
                autUsuario = 1;
            }
            
            if (!usuario) {
                // Trate o caso em que o usuário não foi encontrado
                res.status(404).send('Usuário não encontrado');
                return;
            }
  
            res.render('cadastrar-apoiador', {idUsuario: usuario._id,nomeUsuario: usuario.nome, autUsuario});

            
            // res.render('cadastrar-apoiador', {idUsuario: usuario._id, nomeUsuario: usuario.nome, autUsuario});
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


app.get('/admin/deletar/apoiador/:id/:imagem', (req, res) => {
    // console.log(req.params.imagem)
    if(req.session.email == null){
        // console.log("Não logou")
        res.render('admin-login')
    }else{
        fs.unlink(__dirname+'/public/images_vagas/'+req.params.imagem, (err) => {
            if (err) {
                console.error('Erro ao excluir o arquivo:', err);
            }
            Apoiador.deleteOne({ _id: req.params.id }).then(function () {
                res.redirect('/admin/login');
                // console.log('excluido com sucesso')
            });
        });
    }
})


app.post('/dados-pessoais', (req, res)=>{
    res.redirect('admin/login')
})

app.get('/dados-pessoais', async (req,res)=>{
    if(req.session.email == null){
        res.render('admin-login')
    }else{
        // Recupere o ID do usuário da sessão
        const emailUsuario = req.session.email;

        // Realize uma consulta ao banco de dados para obter o _id do usuário
        const usuario = await Usuarios.findOne({ email: emailUsuario });

        let autUsuario;
        if(usuario.adm == "super"){
            autUsuario = 3;
        } else if(usuario.adm == "med"){
            autUsuario = 2;
        }else{
            autUsuario = 1;
        }
        
        if (!usuario) {
            // Trate o caso em que o usuário não foi encontrado
            res.status(404).send('Usuário não encontrado');
            return;
        }
        res.render('dados-pessoais', {nomeUsuario: usuario.nome, emailUsuario: usuario.email, autUsuario});
    }
})


app.post('/cargos-vagas', (req, res)=>{
    res.redirect('admin/login')
})

app.get('/cargos-vagas', async (req,res)=>{
    if(req.session.email == null){
        // console.log("Não logou")
        res.render('admin-login')
    }else{
        // Recupere o ID do usuário da sessão
        const emailUsuario = req.session.email;

        // Realize uma consulta ao banco de dados para obter o nome do usuário
        const usuario = await Usuarios.findOne({ email: emailUsuario });

        let autUsuario;
        if(usuario.adm == "super"){
            autUsuario = 3;
        } else if(usuario.adm == "med"){
            autUsuario = 2;
        }else{
            autUsuario = 1;
        }

        if (usuario.adm !== 'super' && usuario.adm !== 'med') {
            res.send('Não permitido o acesso a essa página!');
            return; // Adicione um return para garantir que não haja envio de múltiplas respostas
        }

        if (!usuario) {
            // Trate o caso em que o usuário não foi encontrado
            res.status(404).send('Usuário não encontrado');
            return;
        }

        Cargos.find({}).sort({ cargo: 1 }).then(function(cargos){
            cargos = cargos.map(function(val){
                return {
                    id: val._id,
                    cargo: val.cargo
                }
            })
            res.render('cargos-vagas', {cargos: cargos, nomeUsuario: usuario.nome, autUsuario});
        })
    }
})

// Cadastro Cargo
app.post('/admin/cadastro/cargo', upload.single('form_cargo'), async (req, res) => {
    try {

        const cargo = await Cargos.create({
            cargo: req.body.cargo_vaga
        });

        res.redirect('/cargos-vagas');
    } catch (err) {
        console.error('Erro ao cadastrar o cargo:', err);
        res.status(500).send('Erro ao cadastrar o cargo.');
    }
});



// Cadastro Vaga
app.post('/admin/cadastro/vaga', async (req, res) => {
    try {
        // console.log('Dados do corpo da requisição:', req.body);
        const imagem = req.body.imagem_recortada;

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
        const switchState = await Switch.findOne();
        if(switchState.estado === '0'){
            vaga.__v = 1
            // const vaga = await Vagas.findOne({ _id: req.params.id});
            await vaga.save();
        }

        // Imprime todos os atributos da vaga
        // console.log('Vaga cadastrada:', vaga);

        res.redirect('/admin/login');
    } catch (err) {
        console.error('Erro ao cadastrar a vaga:', err);
        res.status(500).send('Erro ao cadastrar a vaga.');
    }
});


// Cadastrando Imagem
app.post('/admin/cadastro/imagem', (req, res) => {
    const base64Data = req.body.imagemBase64;

    // Analise a extensão da imagem a partir dos dados base64
    const matches = base64Data.match(/^data:image\/([A-Za-z]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        return res.status(400).send('Formato de imagem inválido');
    }

    const imageExtension = matches[1];
    const fileName = new Date().getTime() + '.' + imageExtension; // Use a extensão da imagem
    const imagePath = path.join(__dirname, 'public', 'images_vagas', fileName);
    const imagePathMod = 'http://localhost:3000/public/images_vagas/'+ fileName;

    // Decodifique e salve a imagem
    fs.writeFile(imagePath, matches[2], 'base64', (err) => {
        if (err) {
            console.error('Erro ao salvar a imagem:', err);
            res.status(500).send('Erro ao salvar a imagem.');
        } else {
            res.json({ success: true, imagePathMod });
        }
    });
});


app.post('/admin/cadastrar/usuario/form', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.senha, 10); // corrigido para req.body.senha
        const usuario = await Usuarios.create({
            nome: req.body.nome,
            email: req.body.email,
            senha: hashedPassword
        });

        res.send({ success: true, message: 'Usuário cadastrado com sucesso.' });
    } catch (err) {
        console.error('Erro ao cadastrar o usuário:', err);
        res.status(500).send('Erro ao cadastrar o usuário.');
    }
});


app.post('/admin/adicionar/usuario', (req, res)=>{
    const idUsuario = new Date().getTime();
    let link = 'http://localhost:3000/cadastrar/usuario/'+idUsuario;
    res.json({ success: true, link });
})

app.get('/cadastrar/usuario/:id', (req, res)=>{
    // console.log("Funcionou a busca do link")
    res.render('cadastrar-usuario', {})
})

app.get('/deletar/usuario/:id', (req, res) => {
    
    Usuarios.deleteOne({ _id: req.params.id }).then(function () {
        res.redirect('/usuarios');
        // console.log('excluido com sucesso')
    });
})



app.get('/deletar/vaga/:id/:imagem', (req, res) => {
    // console.log(req.params.imagem)
    if(req.session.email == null){
        // console.log("Não logou")
        res.render('admin-login')
    }else{
        fs.unlink(__dirname+'/public/images_vagas/'+req.params.imagem, (err) => {
            if (err) {
                console.error('Erro ao excluir o arquivo:', err);
            }
            Vagas.deleteOne({ _id: req.params.id }).then(function () {
                res.redirect('/admin/login');
                // console.log('excluido com sucesso')
            });
        });
    }
})

app.get('/deletar/cargo/:id', (req, res) => {
    
    if(req.session.email == null){
        // console.log("Não logou")
        res.render('admin-login')
    }else{
        Cargos.deleteOne({ _id: req.params.id }).then(function () {
            res.redirect('/cargos-vagas');
            // console.log('excluido com sucesso')
        });
    }
})

app.get('/vaga/usuario/:id', async (req, res) => {
    
    if(req.session.email == null){
        // console.log("Não logou")
        res.render('admin-login')
    }else{
        // Recupere o ID do usuário da sessão
        const emailUsuario = req.session.email;

        // Realize uma consulta ao banco de dados para obter o nome do usuário
        const usuario = await Usuarios.findOne({ email: emailUsuario });

        if (!usuario) {
            // Trate o caso em que o usuário não foi encontrado
            res.status(404).send('Usuário não encontrado');
            return;
        }

        let autUsuario;
        if(usuario.adm == "super"){
            autUsuario = 3;
        } else if(usuario.adm == "med"){
            autUsuario = 2;
        }else{
            autUsuario = 1;
        }

        if (usuario.adm !== 'super' && usuario.adm !== 'med') {
            res.send('Não permitido o acesso a essa página!');
            return; // Adicione um return para garantir que não haja envio de múltiplas respostas
        }

        const idUsuario = req.params.id;

        const usuarioVagas = await Usuarios.findOne({ _id: idUsuario });

        Vagas.find({idUsuario}).sort({'_id': -1}).then(function(vagas){
            vagas = vagas.map(function(val){
                // let linkImage = (val.imagem).split("/");
                // let formatLinkImage = linkImage[linkImage.length - 1];
                return {
                    id: val._id,
                    titulo: val.titulo,
                    imagem: val.imagem,
                    dataCriada: val.dataCriada
                }
            })
            res.render('vagas-cadastradas-usuario', {vagas: vagas, nomeUsuarioVagas: usuarioVagas.nome, nomeUsuario: usuario.nome, autUsuario});
        })
    }
})



app.get('/:slug', async (req, res) => {
    const requestVagaSlug = req.params.slug;

    try {
        // Consulta a vaga com base no slug
        const vaga = await Vagas.findOne({ slug: requestVagaSlug });

        if (!vaga) {
            // Se a vaga não for encontrada, pode renderizar uma página de erro ou redirecionar, conforme necessário
            res.send('Página não existente!'); // Página de erro 404, ajuste conforme necessário
            return;
        }

        // Renderiza a página 'vaga-single' com os detalhes da vaga
        res.render('vaga-single', { vaga });
    } catch (err) {
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
        } else {
            console.log('E-mail enviado');
        }
    });
}


app.get('/resetar/senha', async (req, res) => {
    // Renderiza a página para o usuário inserir o e-mail
    res.render('resetar-senha', { error: null });
});

// Adicione esta rota para processar o e-mail inserido e enviar o código
app.post('/resetar/senha', async (req, res) => {
    try {
        const { email } = req.body;
        const usuario = await Usuarios.findOne({ email });

        if (!usuario) {
            // Usuário não encontrado, trate conforme necessário (pode redirecionar ou exibir mensagem de erro)
            return res.render('resetar-senha', { error: 'E-mail não encontrado.' });
        }

        // Gerar código de recuperação e salvá-lo no banco de dados
        const codigoRecuperacao = Math.floor(100000 + Math.random() * 900000).toString();
        usuario.codigoRecuperacao = codigoRecuperacao;
        await usuario.save();

        // Envie o código por e-mail (você precisa implementar esta função)
        // Envie o código por e-mail
        enviarCodigoPorEmail(usuario.email, codigoRecuperacao);

        // Renderiza a página de confirmação
        // console.log('Email enviado, renderizar pagina agora!')
        res.render('codigo-recuperacao-enviado', {emailUsuario: usuario.email, error: null});
    } catch (err) {
        console.error('Erro ao resetar a senha:', err);
        res.status(500).send('Erro ao resetar a senha.');
    }
});


app.post('/verificar/codigo', async (req, res) => {
    try {
        const email = req.body.email_usuario;
        const usuario = await Usuarios.findOne({ email });

        if (!usuario) {
            return res.render('codigo-recuperacao-enviado', {emailUsuario: usuario.email, error: 'Usuário não encontrado.' });
        }

        let codigo = req.body.codigo;

        if (usuario.codigoRecuperacao && codigo == usuario.codigoRecuperacao) {
            res.render('nova-senha', { emailUsuario: usuario.email });
        } else {
            return res.render('codigo-recuperacao-enviado', { error: 'Código de verificação inválido.' });
        }
    } catch (err) {
        console.error('Erro ao resetar a senha:', err);
        res.status(500).send('Erro ao resetar a senha.');
    }
});


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



app.post('/admin/cadastrar/nova/senha', async (req, res) => {
    try {
        const email = req.body.email;
        const usuario = await Usuarios.findOne({ email });

        if (!usuario) {
            // Usuário não encontrado, trate conforme necessário (pode redirecionar ou exibir mensagem de erro)
            return res.render('nova-senha', { error: 'E-mail não encontrado.' });
        }
        const hashedPassword = await bcrypt.hash(req.body.senha, 10);

        usuario.senha = hashedPassword;
        await usuario.save();

        res.send({ success: true, message: 'Senha cadastrada com sucesso.' });
    } catch (err) {
        console.error('Erro ao resetar a senha:', err);
        res.status(500).send('Erro ao resetar a senha.');
    }
});


app.get('/admin/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.error('Erro ao encerrar a sessão:', err);
        res.status(500).send('Erro ao encerrar a sessão.');
      } else {
        res.redirect('/'); // Redirecione para a página inicial ou qualquer outra página desejada
      }
    });
});  




app.listen(3000, ()=>{
    console.log('Server Rodando')
})