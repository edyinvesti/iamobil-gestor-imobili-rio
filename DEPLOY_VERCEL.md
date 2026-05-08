# 🚀 Guia de Deploy no Vercel - IAmobil Gestor

Siga estes passos exatos para colocar sua plataforma "nas nuvens" sem erros de 404.

## 1. Preparação do Código
Já fiz as seguintes correções para você:
- [x] Adicionado **favicon.png** na pasta `public/`.
- [x] Atualizado **index.html** para encontrar o ícone.
- [x] Configurado **vercel.json** para redirecionar as chamadas de API para o seu servidor no Render.

## 2. Passo a Passo no Dashbord do Vercel
1. Vá para [vercel.com/new](https://vercel.com/new).
2. Conecte seu repositório: `edyinvesti/iamobil-gestor-imobili-rio`.
3. Em **Framework Preset**, selecione **Vite**.
4. **Root Directory**: Deixe em branco (ou `./`).
5. **Build & Development Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## 3. Variáveis de Ambiente (CRÍTICO)
No site do Vercel, vá em **Environment Variables** e adicione:

| Key | Value |
| :--- | :--- |
| `VITE_API_URL` | `https://iamobil-cloud-1.onrender.com` |
| `GEMINI_API_KEY` | *(Sua chave do Gemini)* |

## 4. Como atualizar agora?
Para que as correções que eu fiz apareçam no site, você precisa rodar este comando no seu terminal:

```bash
git add .
git commit -m "Fix: favicon and deployment config"
git push origin main
```

Assim que você der o `push`, o Vercel vai notar a mudança e reconstruir o site automaticamente.

---
> [!IMPORTANT]
> Se o erro 404 persistir, verifique na aba **"Deployments"** do Vercel se o build terminou com "Ready" (Verde). Se estiver vermelho, me mande o erro que aparece lá!
