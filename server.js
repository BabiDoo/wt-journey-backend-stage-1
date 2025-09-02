const express = require('express');
const path = require('path');
const fs = require('fs').promises; //para ler os arquivos
const app = express();
const PORT = 3000;
const contatos = []; //Array para guardar todas as submissoes
app.use(express.static(path.join(__dirname, 'public'))); //para servir arquivos estaticos da pasta public
app.use(express.urlencoded({ extended: true })); //para os formularios
app.use(express.json()); //para aceitar tbm em formato json


app.get('/', async (req, res) => {
  try {
    res.status(200).sendFile(path.join(__dirname, 'views', 'index.html'));
  } catch (error) {
    console.error(`Ops... ${error}`);
    res.status(500).send('Erro interno ao carregar a página');
  }
});

app.all('/', (req, res) => {
  res.status(405).send('Forbidden');
});

app.get('/api/lanches', async (req, res) => {
  try {
    const lanches = JSON.parse(await fs.readFile(path.join(__dirname, 'public', 'data', 'lanches.json'), 'utf8'));
    res.status(200).json(lanches);
  } catch (err) {
    console.error('Erro ao ler lanches.json:', err);
    res.status(500).json('Erro ao buscar os lanches');
  }
});

app.all('/api/lanches', (req, res) => {
  res.status(405).send('Forbidden');
});

app.get('/sugestao', async (req, res) => {
  try { 
  const nome = req.query.nome;
  let ingredientes = req.query.ingredientes || [];
  if (!Array.isArray(ingredientes)) ingredientes = [ingredientes];
  const listaLi = ingredientes.map(i => `<li>${i}</li>`).join('');
  let html = ((await fs.readFile(path.join(__dirname, 'views', 'sugestao.html'),'utf8'))
  .replace(/{{ingredientes}}/g, listaLi))
  .replace(/{{nome}}/g, nome);
  res
    .status(200)
    .send(html);
} catch (error) {
  console.log(`Ops... ${error}`);
}}
);

app.all('/sugestao', (req, res) => {
  res.status(405).send('Forbidden');
});


app.get('/contato', (req, res) => {
  res
    .status(200)
    .type('html')
    .sendFile(path.join(__dirname, 'views', 'contato.html'));
});


app.post('/contato', async (req, res) => {
  const { nome, assunto, email, mensagem } = req.body;
  contatos.push({ nome, assunto, email, mensagem });
  try {
    let html = (await fs.readFile(
      path.join(__dirname, 'views', 'confirmation.html'),
      'utf8'
    )).replace(/{{nome}}/g, nome)
      .replace(/{{email}}/g, email)
      .replace(/{{assunto}}/g, assunto)
      .replace(/{{mensagem}}/g, mensagem);

    return res
      .status(200)
      .send(html);
  } catch (error) {
    console.log(`Ops... ${error}}`);
    return res.status(500).send(`Ocorreu um erro ao enviar sua mensagem. Tente novamente`);
  }
});

app.all('/contato', (req, res) => {
  res.status(405).send('Forbidden');
});

app.get('/api/contato', (req, res) => {
  res.json(contatos);
});

app.all('api/contato', (req, res) => {
  res.status(405).send('Forbidden');
}
)

app.use((req, res) =>{
  res.status(404).redirect('https://http.dog/404.jpg');
});

app.listen(PORT, () => {
  console.log(`Servidor da DevBurger rodando em localhost:${PORT}`);
});
