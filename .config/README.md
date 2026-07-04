# 📁 Estrutura de Configuração

## .config/

Pasta com arquivos de configuração e ambiente:

- **`.env.local`** - Variáveis de ambiente local (desenvolvimento)
  - Contém: `YOUTUBE_API_KEY`
  - Nunca comita no Git (está em `.gitignore`)
  - Vercel lê automaticamente

- **`DEPLOY_VERCEL.md`** - Guia de deploy e instruções

---

## Raiz do Projeto

Arquivos necessários na raiz (Vercel requer):

- **`vercel.json`** - Configuração do Vercel
- **`package.json`** - Info do projeto
- **`.gitignore`** - Protege `.config/` e `node_modules/`
- **`api/`** - Backend proxy (Serverless Functions)

---

## 🔒 Segurança

✅ Chave de API em `.env.local` (nunca commitada)
✅ Arquivo `.env.local` está em `.gitignore`
✅ Backend proxy protege a chave no servidor

---

**Leia `DEPLOY_VERCEL.md` para instruções de deploy!**
