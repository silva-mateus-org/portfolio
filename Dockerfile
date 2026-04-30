# Usar Nginx Alpine (leve e seguro)
FROM nginx:alpine

# Copiar arquivos do portfólio para o Nginx
COPY . /usr/share/nginx/html

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN apk add --no-cache curl

# Expor porta 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost/ || exit 1

# Nginx já roda automaticamente como CMD