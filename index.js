
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const fs = require('fs')
var mongoose = require("mongoose");


const app = express()

var session = require('express-session');

app.use(session({ 
    secret: 'keyboard cat', 
    cookie: { maxAge: 360000 },
    resave: false,  // Adicionado para resolver o aviso de depreciação
    saveUninitialized: true  // Adicionado para resolver o aviso de depreciação
}));

const Vagas = require('./Vagas.js');
const Usuarios = require('./Usuarios.js');

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
  
        res.render('home', {});   
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


app.get('/admin/login',(req,res)=>{
    if(req.session.email == null){
        // console.log("Não logou")
        res.render('admin-login')
    }else{
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
            res.render('vagas-cadastradas', {vagas: vagas});
        })
    }
})


app.post('/cadastrar-vaga', (req, res)=>{
    res.redirect('admin/login')
})

app.get('/cadastrar-vaga',(req,res)=>{
    if(req.session.email == null){
        res.render('admin-login')
    }else{
        res.render('cadastrar-vaga', {});
    }
})


app.post('/usuarios', (req, res)=>{
    res.redirect('admin/login')
})

app.get('/usuarios',(req,res)=>{
    if(req.session.email == null){
        res.render('admin-login')
    }else{
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
            res.render('usuarios', {usuarios: usuarios});
        })
    }
})


app.get('/apoiadores',(req,res)=>{
    if(req.session.email == null){
        res.render('admin-login')
    }else{
        res.render('apoiadores', {});
    }
})


app.get('/dados-pessoais',(req,res)=>{
    if(req.session.email == null){
        res.render('admin-login')
    }else{
        res.render('dados-pessoais', {});
    }
})




// Cadastro Vaga
app.post('/admin/cadastro/vaga', async (req, res) => {
    try {
        // console.log('Dados do corpo da requisição:', req.body);
        const imagem = req.body.imagem_recortada;

        const vaga = await Vagas.create({
            titulo: req.body.titulo_vaga,
            categoria: req.body.checks,
            experiencia: req.body.experiencia_vaga,
            descricao: req.body.descricao_vaga,
            imagem: imagem,
            dataCriada: new Date().toLocaleString('pt-br').substr(0, 10)
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





app.listen(3000, ()=>{
    console.log('Server Rodando')
})