const express = require("express");
const axios = require("axios"); //Biblioteca para fazer requisições HTTP
const mongoose = require("mongoose");
const dotenv = require("dotenv");

//Importando o model
const Address = require("../backend/model/Address");

//Configurando o dotenvx
dotenv.config();


//Chama o Express (Framework para criar servidores)
const app = express();

//CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); //Permite que qualquer origem acesse a API
  res.header("Access-Control-Allow-Methods", "GET, POST"); //Permite os métodos GET, POST
  res.header("Access-Control-Allow-Headers", "Content-Type"); //Permite os headers Content-Type
  next();
});

app.use(express.json()); //Permite que o servidor entenda JSON

//Rota para buscar um endereço pelo CEP
app.get("/api/cep/:cep", async (req, res) => {
  const { cep } = req.params; //Obtem o CEP da URL

  try {
    //Faz a requisição para a API ViaCEP, passando o CEP
    const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
    res.json(response.data); //Retorna o endereço encontrado
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar o CEP" }); //Se deu erro, retorna a mensagem de erro
  }
});

app.post("/api/address", async (req, res) => {
  // Corpo que deve ser enviado:
  const { cep, logradouro, bairro, cidade, estado } = req.body;

  try {
    const newAddress = new Address({ cep, logradouro, bairro, cidade, estado });
    await newAddress.save(); // Salva o endereço no banco de dados
    // Retorna sucesso com os dados salvos
    res
      .status(201)
      .json({ message: "Endereço salvo com sucesso!", data: newAddress });
  } catch (error) {
    // Retorna erro se não salvar
    res.status(500).json({ error: "Erro ao salvar o endereço!" });
  }
});

//Obtem as credencuais do MongoDB armaenadas no arquivo .env
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

//cria a string de conexão com o MongoDB
const mongoURI = `mongodb+srv://${dbUser}:${dbPassword}@apiuc13.hnbpm.mongodb.net/?retryWrites=true&w=majority&appName=APIUC13`;

//define a porta do servidor
const port = 3000;

mongoose
  .connect(mongoURI) //conectou ao banco com o link de conexão
  .then(() => {
    console.log("Conectado ao MongoDB"); //Se conectou, imprime a mensagem
    //Inicia o servidor apos a conexão com o MongoDB
    app.listen(port, () => {
      console.log(`Servidor rodando na porta http://localhost:${port}`);
    });
  }) //Conecta com o MongoDB

  .catch((err) => console.log("Erro ao conectar ao MongoDB", err)); //Se não conectou, imprime a mensagem
