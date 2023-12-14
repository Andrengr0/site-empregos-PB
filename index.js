
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



var usuarios = [
    {
        login: "Andre",
        senha: "12345"
    }
];

app.post("/admin/login", (req,res)=>{
    usuarios.map(function(val){
        if(val.login == req.body.login && val.senha == req.body.senha){
            req.session.login = "André";
        }
    })
    res.redirect('/admin/login')
})

app.get('/admin/login',(req,res)=>{
    if(req.session.login == null){
        res.render('admin-login')
    }else{
		res.render('admin-panel', {});
        
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
            dataCriada: new Date().toLocaleString('pt-br')
        });

        // Imprime todos os atributos da vaga
        // console.log('Vaga cadastrada:', vaga);

        res.render('admin-panel', {});
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







app.listen(3000, ()=>{
    console.log('Server Rodando')
})