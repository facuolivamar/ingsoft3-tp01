variable "docker_host" {
  description = "Daemon de Docker al que habla el provider"
  type        = string
  default     = "npipe:////./pipe/dockerDesktopLinuxEngine"
}

variable "env" {
  description = "Nombre del entorno; prefija todos los recursos"
  type        = string
  default     = "preprod"
}

variable "api_tag" {
  description = "Etiqueta de las imágenes del TP7 (sha-<commit de main>). Sin default: se elige al aplicar"
  type        = string
}

variable "db_password" {
  description = "Contraseña de postgres de preprod. Sin default: TF_VAR_db_password o un *.tfvars ignorado"
  type        = string
  sensitive   = true
}

variable "api_port" {
  description = "Puerto del host para la api (QA usa 8001, PROD 8002)"
  type        = number
  default     = 8003
}

variable "web_port" {
  description = "Puerto del host para el front (QA usa 8081, PROD 8082)"
  type        = number
  default     = 8083
}
