locals {
  prefix   = "salas-${var.env}"
  db_user  = "salas"
  db_name  = "salas_${var.env}"
  registry = "docker.io/facuolivam"
}

resource "docker_network" "app" {
  name = "${local.prefix}-net"
}

resource "docker_volume" "db_data" {
  name = "${local.prefix}-db-data"
}

# ---- Base de datos ----
resource "docker_image" "postgres" {
  name         = "postgres:16-alpine"
  keep_locally = true # QA y PROD usan la misma imagen: el destroy no la borra
}

resource "docker_container" "db" {
  name    = "${local.prefix}-db"
  image   = docker_image.postgres.image_id
  restart = "unless-stopped"

  env = [
    "POSTGRES_USER=${local.db_user}",
    "POSTGRES_PASSWORD=${var.db_password}",
    "POSTGRES_DB=${local.db_name}",
  ]

  networks_advanced {
    name = docker_network.app.name
  }

  volumes {
    volume_name    = docker_volume.db_data.name
    container_path = "/var/lib/postgresql/data"
  }
}

# ---- Backend: la imagen que publicó el TP7 ----
resource "docker_image" "api" {
  name         = "${local.registry}/salas-backend:${var.api_tag}"
  keep_locally = true
}

resource "docker_container" "api" {
  name  = "${local.prefix}-api"
  image = docker_image.api.image_id
  # depends_on espera que el contenedor de la BD se CREE, no que postgres esté listo:
  # si la api arranca antes y falla, Docker la reintenta.
  restart = "unless-stopped"

  # La conexión se DERIVA del recurso db: host = nombre del contenedor en la red.
  env = [
    "POSTGRES_HOST=${docker_container.db.name}",
    "POSTGRES_PORT=5432",
    "POSTGRES_USER=${local.db_user}",
    "POSTGRES_PASSWORD=${var.db_password}",
    "POSTGRES_DB=${local.db_name}",
  ]

  networks_advanced {
    name = docker_network.app.name
  }

  ports {
    internal = 8000
    external = var.api_port
  }

  depends_on = [docker_container.db]
}

# ---- Frontend: nginx que sirve el build y proxea /api/ ----
resource "docker_image" "web" {
  name         = "${local.registry}/salas-frontend:${var.api_tag}"
  keep_locally = true
}

resource "docker_container" "web" {
  name    = "${local.prefix}-web"
  image   = docker_image.web.image_id
  restart = "unless-stopped"

  # La dirección del backend se DERIVA del recurso api (nombre + puerto interno).
  env = [
    "BACKEND_URL=http://${docker_container.api.name}:${docker_container.api.ports[0].internal}",
  ]

  networks_advanced {
    name = docker_network.app.name
  }

  ports {
    internal = 80
    external = var.web_port
  }
}
