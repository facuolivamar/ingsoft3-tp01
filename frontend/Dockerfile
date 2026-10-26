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

# ---- Etapa 2: tests (parte del build: ya tiene Node y las dependencias) ----
# El `npm ci` de build instala tambien las devDependencies (vitest y su
# medidor de cobertura), asi que no hay que instalar nada mas. El umbral vive en
# vite.config.js: si no se cumple, vitest sale con 1 y el `docker run` falla.
FROM build AS test
ENV COVERAGE_DIR=/out/coverage
ENTRYPOINT ["npx", "vitest", "run", "--coverage", "--reporter=default", "--reporter=junit", "--outputFile.junit=/out/tests.xml"]

# ---- Etapa 3: runtime (nginx sirve los estaticos) ----
# La imagen final no tiene Node: es un servidor web con archivos HTML, CSS y JS.
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /build/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
