# ---- Etapa 1: build (compila la SPA) ----
# Node y las 117 dependencias de desarrollo solo hacen falta para producir los
# estaticos. Nada de eso tiene que viajar a produccion.
FROM node:22-alpine AS build

WORKDIR /build

# package.json y el lock primero: mientras no cambien, Docker reutiliza la capa
# del npm ci y se saltea la descarga entera.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Etapa 2: runtime (nginx sirve los estaticos) ----
# La imagen final no tiene Node: es un servidor web con archivos HTML, CSS y JS.
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /build/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
