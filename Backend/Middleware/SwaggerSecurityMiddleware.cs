// Crear archivo: Middleware/SwaggerSecurityMiddleware.cs
using System.Net;
using System.Text;

namespace OrigamiBack.Middleware
{
    public class SwaggerSecurityMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<SwaggerSecurityMiddleware> _logger;
        private readonly IConfiguration _configuration;

        public SwaggerSecurityMiddleware(RequestDelegate next, ILogger<SwaggerSecurityMiddleware> logger, IConfiguration configuration)
        {
            _next = next;
            _logger = logger;
            _configuration = configuration;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var path = context.Request.Path.Value?.ToLower();
            
            // Verificar si es una request a Swagger
            if (IsSwaggerRequest(path))
            {
                // En producción, bloquear completamente
                if (IsProductionEnvironment())
                {
                    _logger.LogWarning($"🚫 Intento de acceso a Swagger bloqueado desde IP: {context.Connection.RemoteIpAddress}");
                    context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                    await context.Response.WriteAsync("Not Found");
                    return;
                }

                // En staging, verificar autenticación
                if (IsStagingEnvironment())
                {
                    if (!await IsAuthorizedForSwagger(context))
                    {
                        _logger.LogWarning($"🔐 Acceso no autorizado a Swagger desde IP: {context.Connection.RemoteIpAddress}");
                        context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                        context.Response.Headers["WWW-Authenticate"] = "Basic realm=\"API Documentation\"";
                        await context.Response.WriteAsync("Unauthorized");
                        return;
                    }
                }

                // Logging de acceso autorizado
                _logger.LogInformation($"📚 Acceso autorizado a Swagger desde IP: {context.Connection.RemoteIpAddress}");
            }

            await _next(context);
        }

        private bool IsSwaggerRequest(string path)
        {
            return path != null && (
                path.StartsWith("/swagger") ||
                path.StartsWith("/docs") ||
                path.Contains("swagger.json") ||
                path.Contains("swagger-ui")
            );
        }

        private bool IsProductionEnvironment()
        {
            return _configuration["ASPNETCORE_ENVIRONMENT"] == "Production";
        }

        private bool IsStagingEnvironment()
        {
            return _configuration["ASPNETCORE_ENVIRONMENT"] == "Staging";
        }

        private async Task<bool> IsAuthorizedForSwagger(HttpContext context)
        {
            var swaggerPassword = _configuration["Swagger:Password"];
            
            if (string.IsNullOrEmpty(swaggerPassword))
            {
                return false; // Sin contraseña configurada, denegar acceso
            }

            var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
            if (authHeader?.StartsWith("Basic ") != true)
            {
                return false;
            }

            try
            {
                var encodedCredentials = authHeader.Substring("Basic ".Length);
                var credentials = Encoding.UTF8.GetString(Convert.FromBase64String(encodedCredentials));
                var parts = credentials.Split(':');

                return parts.Length == 2 && 
                       parts[0] == "admin" && 
                       parts[1] == swaggerPassword;
            }
            catch
            {
                return false;
            }
        }
    }
}