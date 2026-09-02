# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências de desenvolvimento e produção
RUN npm ci

# Copiar código-fonte
COPY . .

# Desabilitar telemetria do Next.js e compilar o projeto
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production stage - serve static export with lightweight nginx
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Clear default nginx HTML files
RUN rm -rf ./*

# Copy exported static files from build stage
COPY --from=builder /app/out ./

# Expose port 3000 and configure nginx
RUN sed -i 's/listen       80;/listen       3000;/' /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
