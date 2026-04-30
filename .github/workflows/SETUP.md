# CI/CD Setup Guide

Template genérico para projetos com backend .NET + frontend Node.js rodando em self-hosted runner com Watchtower para deploy.

---

## Pré-requisitos

### 1. PAT para submodulo privado

O `core-system` é um repositório privado. Crie um fine-grained PAT com acesso de leitura:

GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token  
→ Resource owner: `silva-mateus`  
→ Repository access: Only select repositories → `core-system`  
→ Permissions → Repository permissions → **Contents: Read**  
→ Copiar o token gerado

Adicionar como secret neste repositório:  
Settings → Secrets and variables → Actions → New repository secret  
→ Name: `CORE_SYSTEM_PAT`  
→ Secret: token gerado acima

### 2. GHCR — visibilidade das imagens

Após o primeiro push, acessar `github.com/silva-mateus?tab=packages` e tornar as imagens **privadas** (padrão é público para orgs, privado para usuários pessoais).

### 3. Watchtower com autenticação GHCR

Watchtower precisa de um PAT com escopo `read:packages` para puxar imagens privadas do GHCR.

```bash
# Gerar base64 das credenciais
echo -n "silva-mateus:SEU_PAT_AQUI" | base64
```

Criar `ghcr-config.json` no homelab (não commitar):

```json
{
  "auths": {
    "ghcr.io": {
      "auth": "BASE64_GERADO_ACIMA"
    }
  }
}
```

No `docker-compose.yml` do homelab:

```yaml
services:
  musicas-igreja-api:
    image: ghcr.io/silva-mateus/musicas-igreja-api:latest

  musicas-igreja-web:
    image: ghcr.io/silva-mateus/musicas-igreja-web:latest

  watchtower:
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./ghcr-config.json:/config.json
    environment:
      DOCKER_CONFIG: /config.json
      WATCHTOWER_POLL_INTERVAL: 300   # verifica a cada 5 min
      WATCHTOWER_CLEANUP: "true"      # remove imagens antigas
    restart: unless-stopped
```

---

## Adaptar para outro app

### Variáveis no topo do `ci.yml`

| Variável | Default | Descrição |
|---|---|---|
| `BACKEND_DIR` | `backend` | Diretório do projeto .NET |
| `BACKEND_TESTS_DIR` | `backend.tests` | Diretório dos testes xUnit |
| `FRONTEND_DIR` | `frontend` | Diretório Node.js |
| `DOTNET_VERSION` | `9.0.x` | Versão do .NET SDK |
| `NODE_VERSION` | `20` | Versão do Node.js |
| `API_IMAGE` | `ghcr.io/silva-mateus/musicas-igreja-api` | Tag GHCR da imagem backend |
| `WEB_IMAGE` | `ghcr.io/silva-mateus/musicas-igreja-web` | Tag GHCR da imagem frontend |

### App sem frontend

Remover ou comentar o job `test-frontend` e ajustar `needs` em `build-and-push`:

```yaml
  build-and-push:
    needs: [test-backend]   # remover test-frontend
```

### App sem submodulo privado

Remover o step `Setup SSH for private submodule` de todos os jobs e remover `CORE_SYSTEM_PAT` dos secrets.

### App sem deploy (só testes)

Remover o job `build-and-push` inteiro.

---

## Troubleshooting

| Erro | Causa | Fix |
|---|---|---|
| `remote: Repository not found` no checkout | Submodulo privado sem auth | Verificar secret `CORE_SYSTEM_PAT` — PAT expirado ou sem acesso a `core-system` |
| `self-hosted runner offline` | Runner parado na VM | `sudo systemctl start actions.runner.*` na VM |
| `denied: permission_denied` no push GHCR | `packages: write` ausente ou token sem permissão | Verificar `permissions: packages: write` no topo do workflow |
| Watchtower não atualiza | Digest igual ou auth falhou | `docker logs watchtower` — verificar credenciais GHCR |
| Build falha por falta de memória | VM com 4GB, builds pesados | Buildar API e Web sequencialmente (mover para steps no mesmo job) |
