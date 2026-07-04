# 🚀 Deploy no Vercel (Seguro com API Key)

## O que foi feito?

✅ **Chave da API está segura** - Nunca vai para o GitHub
✅ **Backend proxy** - Chama YouTube a partir do servidor Vercel  
✅ **Frontend seguro** - Chama apenas `/api/youtube`
✅ **Desenvolvimento local** - Pronto para testar localmente

---

## 📋 Passo a Passo (5 minutos)

### 1️⃣ **Preparar o Git**

```bash
git init
git add .
git commit -m "feat: Fadoco site com YouTube proxy seguro"
git remote add origin https://github.com/seu-usuario/seu-repo.git
git push -u origin main
```

### 2️⃣ **Conectar Vercel ao GitHub**

1. Acesse: https://vercel.com/new
2. Clique em **"Import Git Repository"**
3. Cole a URL do seu repositório GitHub
4. Clique em **"Import"**

### 3️⃣ **Configurar as Variáveis de Ambiente**

Antes de fazer deploy, **IMPORTANTE**:

1. Na página de import do Vercel, procure por **"Environment Variables"**
2. Adicione uma nova variável:
   - **Nome**: `YOUTUBE_API_KEY`
   - **Valor**: `AIzaSyDaPbh2ZDKB3Gq16K68V8xatYZ4ZTy2hlQ`
3. Clique em **"Deploy"** ✨

### 4️⃣ **Pronto!** 🎉

Seu site estará em:
```
https://seu-projeto.vercel.app
```

A API estará em:
```
https://seu-projeto.vercel.app/api/youtube
```

---

## 🏠 Testar Localmente (Opcional)

Se quiser testar a API localmente antes de fazer push:

```bash
npm install -g vercel

# Fazer login
vercel login

# Rodar localmente com env vars
vercel dev
```

Depois acesse: `http://localhost:3000`

---

## 🔒 Segurança

- ✅ Chave **NUNCA** aparece no código
- ✅ Chave **NUNCA** vai para o GitHub (está em `.gitignore`)
- ✅ Chave fica segura nas variáveis do Vercel
- ✅ Frontend chama apenas `/api/youtube`
- ✅ Quota de API protegida

---

## 📝 Se Precisar Mudar a Chave

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Edite `YOUTUBE_API_KEY`
5. Redeploy automático

---

## ❌ Troubleshooting

**"API retorna erro 500"**
→ Verificar se `YOUTUBE_API_KEY` está configurada no Vercel

**"YouTube não carrega localmente"**
→ Rodar com `vercel dev` ao invés de Live Server

**"Chave exposta no GitHub"**
→ Regenerar a chave no Google Cloud Console imediatamente!

---

**Pronto! Seu site está seguro e funcionando! 🚀**
