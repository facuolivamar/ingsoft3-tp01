output "api_url" {
  description = "API de preprod (health: /api/health)"
  value       = "http://localhost:${docker_container.api.ports[0].external}"
}

output "web_url" {
  description = "Front de preprod"
  value       = "http://localhost:${docker_container.web.ports[0].external}"
}
