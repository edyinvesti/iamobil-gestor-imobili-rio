# ✅ Checklist de Deploy - Render

Use esta lista para garantir que tudo está pronto antes do deploy:

## Antes do Deploy

- [ ] Todas as alterações estão commitadas
- [ ] Arquivo `.env` está configurado localmente (não commitar!)
- [ ] Testei a aplicação localmente com `npm run dev`
- [ ] Build funciona sem erros: `npm run build`
- [ ] Preview funciona: `npm run preview`
- [ ] Tenho a chave API do Gemini

## Durante o Deploy no Render

- [ ] Repositório conectado ao Render
- [ ] Arquivo `render.yaml` detectado
- [ ] Variável `GEMINI_API_KEY` configurada
- [ ] Variável `VITE_API_URL` configurada (se necessário)
- [ ] Build iniciado com sucesso

## Após o Deploy

- [ ] Aplicação acessível pela URL do Render
- [ ] Funcionalidades principais testadas
- [ ] Console do navegador sem erros críticos
- [ ] Dados salvos no localStorage funcionando
- [ ] Integração com API funcionando (se aplicável)

## Comandos Úteis

```bash
# Testar localmente antes do deploy
npm install
npm run build
npm run preview

# Commitar e fazer push
git add .
git commit -m "Deploy: descrição das mudanças"
git push origin main

# Ver logs no Render
# Acesse: https://dashboard.render.com → Seu serviço → Logs
```

## URLs Importantes

- **Dashboard Render**: https://dashboard.render.com
- **Documentação**: https://render.com/docs
- **Sua aplicação**: `https://iamobil-gestor.onrender.com` (após deploy)

## Problemas Comuns

### ❌ Build falha
→ Verifique os logs no Render
→ Teste `npm run build` localmente

### ❌ Página em branco
→ Verifique variáveis de ambiente
→ Veja o console do navegador (F12)

### ❌ API não conecta
→ Verifique `VITE_API_URL`
→ Confirme que o backend está rodando

---

**Dica**: Salve a URL da sua aplicação após o primeiro deploy! 🚀
