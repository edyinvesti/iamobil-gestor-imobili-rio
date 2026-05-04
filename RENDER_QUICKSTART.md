# 🚀 Deploy Rápido no Render

## Passo a Passo Visual

### 1️⃣ Preparar o Código

```bash
# Certifique-se de que tudo está funcionando
npm install
npm run build
npm run preview

# Commite e faça push
git add .
git commit -m "Preparar para deploy no Render"
git push origin main
```

### 2️⃣ Criar Conta no Render

1. Acesse: https://render.com
2. Clique em **"Get Started"**
3. Faça login com GitHub/GitLab/Bitbucket

### 3️⃣ Criar Novo Web Service

```
Dashboard → New + → Web Service
```

1. **Connect Repository**: Selecione seu repositório
2. **Name**: `iamobil-gestor` (ou outro nome)
3. **Runtime**: Node
4. **Build Command**: `npm install && npm run build`
5. **Start Command**: `npx vite preview --host 0.0.0.0 --port $PORT`

### 4️⃣ Adicionar Variáveis de Ambiente

Na seção **Environment**:

```
GEMINI_API_KEY = sua_chave_api_aqui
VITE_API_URL = https://seu-backend.onrender.com (opcional)
NODE_VERSION = 18.17.0
```

### 5️⃣ Deploy!

1. Clique em **"Create Web Service"**
2. Aguarde o build (3-5 minutos)
3. Acesse a URL fornecida

## ✅ Verificação Pós-Deploy

- [ ] URL abre sem erros
- [ ] Console do navegador (F12) sem erros críticos
- [ ] Funcionalidades principais funcionando
- [ ] LocalStorage salvando dados

## 🔗 Links Úteis

- **Seu Dashboard**: https://dashboard.render.com
- **Logs**: Dashboard → Seu Serviço → Logs
- **Settings**: Dashboard → Seu Serviço → Settings

## 🆘 Problemas?

### Build falha
```bash
# Teste localmente
npm run build
```
Veja os logs no Render para detalhes do erro.

### Página em branco
1. Abra o console (F12)
2. Verifique se as variáveis de ambiente estão corretas
3. Confirme que `GEMINI_API_KEY` está configurada

### Demora para carregar
- Plano Free do Render "dorme" após inatividade
- Primeiro acesso pode levar 30-60 segundos
- Considere upgrade para plano pago se necessário

## 💡 Dicas

- **Auto-Deploy**: Render faz deploy automático a cada push
- **Custom Domain**: Configure em Settings → Custom Domain
- **Logs em Tempo Real**: Use a aba Logs para debug
- **Rollback**: Settings → Deploy → Selecione deploy anterior

## 🎉 Pronto!

Sua aplicação está no ar! Compartilhe a URL:

```
https://iamobil-gestor.onrender.com
```

---

**Precisa de mais ajuda?** Veja [DEPLOY_RENDER.md](DEPLOY_RENDER.md) para instruções detalhadas.
