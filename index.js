
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const fs = require('fs')
const multer = require('multer');
var mongoose = require("mongoose");


const app = express()

const storage = multer.memoryStorage(); // Você pode ajustar isso para armazenar os arquivos no disco se preferir
const upload = multer({ storage: storage });

var session = require('express-session');

app.use(session({ 
    secret: 'keyboard cat', 
    cookie: { maxAge: 360000 },
    resave: false,  // Adicionado para resolver o aviso de depreciação
    saveUninitialized: true  // Adicionado para resolver o aviso de depreciação
}));

const Vagas = require('./Vagas.js');
const Usuarios = require('./Usuarios.js');
const Cargos = require('./Cargos.js')

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
      if (req.query.busca == null) {
  
        const vagas = await Vagas.find({}).sort({data: 1});
            var vagasReturn= vagas.map(function(val){
                return {
                    titulo: val.titulo,
                    cidade: val.cidade,
                    imagem: val.imagem,
                    slug: val.slug 
                }
            })
            
        res.render('home', {vagas: vagasReturn});  
      } 
    } catch (err) {
        console.error("Ocorreu um erro:", err);
        res.status(500).send("Erro ao buscar as palestras.");
    }
  });


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

        Vagas.find({}).sort({'_id': -1}).then(function(vagas){
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
            res.render('vagas-cadastradas', {vagas: vagas, nomeUsuario: usuario.nome});
        })
    }
})


app.post('/cadastrar-vaga', (req, res)=>{
    res.redirect('admin/login')
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
                res.render('cadastrar-vaga', {idUsuario: usuario._id, cargos: cargos, nomeUsuario: usuario.nome});
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
        
        if (!usuario) {
            // Trate o caso em que o usuário não foi encontrado
            res.status(404).send('Usuário não encontrado');
            return;
        }

        Usuarios.find({}).sort({'_id': -1}).then(function(usuarios){
            usuarios = usuarios.map(function(val){
                // let linkImage = (val.imagem).split("/");
                // let formatLinkImage = linkImage[linkImage.length - 1];
                return {
                    id: val._id,
                    nome: val.nome,
                    email: val.email,
                }
            })
            res.render('usuarios', {usuarios: usuarios, nomeUsuario: usuario.nome});
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
        
        if (!usuario) {
            // Trate o caso em que o usuário não foi encontrado
            res.status(404).send('Usuário não encontrado');
            return;
        }
        res.render('apoiadores', {nomeUsuario: usuario.nome});
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
        
        if (!usuario) {
            // Trate o caso em que o usuário não foi encontrado
            res.status(404).send('Usuário não encontrado');
            return;
        }
        res.render('dados-pessoais', {nomeUsuario: usuario.nome});
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
            res.render('cargos-vagas', {cargos: cargos, nomeUsuario: usuario.nome});
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



app.get('/deletar/vaga/:id/:imagem', (req, res) => {
    // console.log(req.params.imagem)
    fs.unlink(__dirname+'/public/images_vagas/'+req.params.imagem, (err) => {
        if (err) {
            console.error('Erro ao excluir o arquivo:', err);
        }
        Vagas.deleteOne({ _id: req.params.id }).then(function () {
            res.redirect('/admin/login');
            // console.log('excluido com sucesso')
        });
    });
})

app.get('/deletar/cargo/:id', (req, res) => {
    
    Cargos.deleteOne({ _id: req.params.id }).then(function () {
        res.redirect('/cargos-vagas');
        // console.log('excluido com sucesso')
    });
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


app.get('/resetar/senha', async (req, res) => {
    // Renderiza a página para o usuário inserir o e-mail
    res.render('resetar-senha');
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
        // Exemplo: enviarCodigoPorEmail(usuario.email, codigoRecuperacao);

        // Renderiza a página de confirmação
        res.render('codigo-recuperacao-enviado');
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