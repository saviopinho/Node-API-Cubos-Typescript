# Nome do projeto

<!---Esses são exemplos. Veja https://shields.io para outras pessoas ou para personalizar este conjunto de escudos. Você pode querer incluir dependências, status do projeto e informações de licença aqui--->

![exemplo imagem](https://vagas.byintera.com/wp-content/uploads/2022/08/cubos_newLogo.png)

> ## **API Operação Financeira desenvolvido em: NodeJS, TypeScript, ExpressJS, PostgresSQL, TypeORM e Docker.**
>
> Sávio Pinho Nunes - saviopinhonunes@gmail.com - (85) 997191702.

## 💻 Pré-requisitos

Antes de começar, verifique se você atendeu aos seguintes requisitos:

* Ter o Docker instalado e rodando para que seja criada a base de dados dessa aplicação.
* NodeJS Instalado na máquina.

## 🚀 Instalação

Para instalar a API, siga estas etapas:

### Clonar Projeto
```
git clone https://github.com/saviopinho/Node-API-Cubos-Typescript.git
```

### Instalar Packages
```
npm run install
```

### Criar e subir container PostgresSQL com Docker
```
npm run docker:compose
```

### Criar arquivo de migrations do TypeORM
```
npm run migrate:generate
```

### Executar as migrations do TypeORM
```
npm run migrate:run
```
### Iniciar nosso servidor API 
* Caso queira rodar o servidor e testar manualmente
```
npm run start
```
* Caso queria rodar os testes de integração
```
npm run test
```

## ☕ Usando `<API Cubos>`

* Usar a ferramenta de sua preferência para testar as rotas e os endpoints criados.
