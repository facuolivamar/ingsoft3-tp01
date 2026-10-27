terraform {
  required_version = ">= 1.5"

  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }

  # El estado va FUERA del workspace (y fuera del repo): el path se pasa en el init.
  #   terraform init -backend-config="path=$HOME/tfstate/salas-preprod.tfstate"
  backend "local" {}
}

# Habla con el Docker local (Docker Desktop). Sin credenciales: usa el socket/pipe del daemon.
provider "docker" {
  host = var.docker_host
}
