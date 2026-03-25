# surge-core/snippets.md — Registro de Correções Reutilizáveis

Erros corrigidos pelo surge-core são registrados aqui para evitar retrabalho em sessões futuras.
Formato: sintoma → causa → correção → quando reutilizar.

---

## Next.js + Supabase: Session cookie race condition

**Sintoma**: signUp redireciona de volta para login sem entrar
**Causa**: `router.push('/rota')` aciona SSR antes do cookie de sessão ser escrito
**Correção**: usar `window.location.href = '/rota'` (hard redirect força leitura do cookie)
**Reutilizar quando**: Next.js App Router + Supabase Auth (signUp ou signIn)

---

## Supabase: "URL and Key required" (500)

**Sintoma**: 500 ao carregar qualquer página que usa Supabase client
**Causa**: `.env.local` ausente ou sem `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
**Correção**: criar `.env.local` com valores reais via ConnectPro (MCP get_publishable_keys)
**Reutilizar quando**: qualquer projeto Next.js + Supabase

---

## Next.js: Module not found @/ (cached)

**Sintoma**: `Module not found: @/components/X` mesmo com arquivo existindo
**Causa**: `.next` cache com resolução de módulo antiga
**Correção**: `rm -rf .next && npm run dev` (limpar cache e reiniciar)
**Reutilizar quando**: erro de módulo que persiste após criar/mover arquivo

---

## preview_start: "cwd outside project root"

**Sintoma**: preview_start falha ao tentar abrir projeto que está fora do diretório do Claude Code
**Causa**: projetos irmãos (ex: `skills-for-dummies/` e `notes-app-test/` lado a lado)
**Correção**: usar `npm --prefix /caminho/absoluto` no launch.json runtimeArgs, não campo cwd
**Reutilizar quando**: projeto alvo está em diretório irmão do session root

---

## Port 3000 in use

**Sintoma**: `EADDRINUSE` ao iniciar dev server
**Causa**: processo anterior não foi encerrado
**Correção**: `netstat -aon | findstr :3000` → `taskkill //F //PID {pid}` (Windows)
**Reutilizar quando**: qualquer conflito de porta no dev server

---

## Supabase: auth.config doesn't exist

**Sintoma**: `UPDATE auth.config SET mailer_autoconfirm = true` falha com "relation does not exist"
**Causa**: `auth.config` não é uma tabela SQL acessível — é configuração do dashboard
**Correção**: usar browser automation (Claude in Chrome MCP) para navegar ao dashboard e desabilitar email confirmation
**Reutilizar quando**: qualquer configuração Supabase que só existe no dashboard, não em SQL
