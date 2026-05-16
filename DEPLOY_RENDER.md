# Deploy no Render - IAmobil Gestor

## 📋 Pré-requisitos

- Conta no [Render](https://render.com)
- Repositório Git (GitHub, GitLab ou Bitbucket)
- Chave API do Gemini

## 🚀 Passos para Deploy

### 1. Preparar o Repositório

Certifique-se de que todos os arquivos estão commitados:

```bash
git add .
git commit -m "Preparar para deploy no Render"
git push origin main
```

### 2. Criar Serviço no Render

1. Acesse [dashboard.render.com](https://dashboard.render.com)
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório Git
4. Selecione o repositório **iamobil-gestor**

### 3. Configurar o Serviço

O Render detectará automaticamente o arquivo `render.yaml`. Verifique as configurações:

- **Name**: `iamobil-gestor-imobili-rio`
- **Runtime**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `node server/index.cjs`
- **Plan**: Free (ou escolha outro plano)

### 4. Configurar Variáveis de Ambiente

Na seção **Environment**, adicione:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `GEMINI_API_KEY` | `sua-chave-api` | Chave da API do Google Gemini |
| `VITE_API_URL` | `https://iamobil-gestor-imobili-rio.onrender.com` | URL do seu sistema |
| `DATABASE_URL` | `libsql://sua-url-turso` | URL do banco de dados (ex: Turso) |
| `NODE_VERSION` | `20.x` | Versão do Node.js |

⚠️ **Importante**: Não compartilhe suas chaves de API publicamente!

### 5. Deploy

1. Clique em **"Create Web Service"**
2. O Render iniciará o build automaticamente
3. Aguarde a conclusão (pode levar alguns minutos)
4. Acesse a URL fornecida pelo Render

## 🔧 Configurações Adicionais

### Custom Domain (Opcional)

1. Vá em **Settings** → **Custom Domain**
2. Adicione seu domínio personalizado
3. Configure os registros DNS conforme instruções

### Auto-Deploy

Por padrão, o Render faz deploy automático quando você faz push para a branch principal.

Para desabilitar:
1. Vá em **Settings** → **Build & Deploy**
2. Desmarque **"Auto-Deploy"**

### Logs e Monitoramento

- Acesse **Logs** para ver os logs em tempo real
- Use **Metrics** para monitorar performance
- Configure **Notifications** para alertas

## 🐛 Troubleshooting

### Build falha

```bash
# Teste localmente primeiro
npm install
npm run build
npm run preview
```

### Variáveis de ambiente não carregam

- Verifique se as variáveis começam com `VITE_` para serem expostas no frontend
- Reinicie o serviço após adicionar variáveis

### Porta incorreta

O Render define automaticamente a variável `$PORT`. O comando de start já está configurado para usá-la.

## 📚 Recursos

- [Documentação do Render](https://render.com/docs)
- [Render + Vite](https://render.com/docs/deploy-vite)
- [Variáveis de Ambiente no Vite](https://vitejs.dev/guide/env-and-mode.html)

## 🔄 Atualizações

Para atualizar a aplicação:

```bash
git add .
git commit -m "Atualização: descrição das mudanças"
git push origin main
```

O Render fará o deploy automaticamente! 🎉
