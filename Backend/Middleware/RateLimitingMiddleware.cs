using Microsoft.Extensions.Caching.Memory;
using System.Collections.Concurrent;
using System.Net;

namespace OrigamiBack.Middleware
{
    public class RateLimitingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RateLimitingMiddleware> _logger;
        private readonly IMemoryCache _cache;
        private readonly ConcurrentDictionary<string, List<DateTime>> _requests;

        public RateLimitingMiddleware(RequestDelegate next, ILogger<RateLimitingMiddleware> logger, IMemoryCache cache)
        {
            _next = next;
            _logger = logger;
            _cache = cache;
            _requests = new ConcurrentDictionary<string, List<DateTime>>();
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var endpoint = context.GetEndpoint();
            var rateLimitAttribute = endpoint?.Metadata.GetMetadata<RateLimitAttribute>();

            if (rateLimitAttribute != null)
            {
                var clientId = GetClientIdentifier(context);
                var key = $"{rateLimitAttribute.Name}:{clientId}";

                if (!await IsRequestAllowed(key, rateLimitAttribute))
                {
                    await HandleRateLimitExceeded(context, rateLimitAttribute);
                    return;
                }
            }

            await _next(context);
        }

        private string GetClientIdentifier(HttpContext context)
        {
            // Prioridad: Usuario autenticado -> IP -> Identificador genérico
            return context.User?.Identity?.Name 
                ?? context.Connection.RemoteIpAddress?.ToString() 
                ?? "anonymous";
        }

        private async Task<bool> IsRequestAllowed(string key, RateLimitAttribute rateLimitAttribute)
        {
            var now = DateTime.UtcNow;
            var windowStart = now.AddMinutes(-rateLimitAttribute.WindowMinutes);

            var requestTimes = _requests.GetOrAdd(key, _ => new List<DateTime>());

            lock (requestTimes)
            {
                // Limpiar requests antiguos
                requestTimes.RemoveAll(time => time < windowStart);

                // Verificar si se excede el límite
                if (requestTimes.Count >= rateLimitAttribute.MaxRequests)
                {
                    _logger.LogWarning($"Rate limit exceeded for key: {key}");
                    return false;
                }

                // Agregar request actual
                requestTimes.Add(now);
                return true;
            }
        }

        private async Task HandleRateLimitExceeded(HttpContext context, RateLimitAttribute rateLimitAttribute)
        {
            context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
            context.Response.Headers["Retry-After"] = (rateLimitAttribute.WindowMinutes * 60).ToString();

            var response = new
            {
                error = "Rate limit exceeded",
                message = $"Maximum {rateLimitAttribute.MaxRequests} requests per {rateLimitAttribute.WindowMinutes} minutes",
                retryAfter = rateLimitAttribute.WindowMinutes * 60
            };

            await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(response));
        }
    }

    // Atributo para decorar controladores/acciones
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
    public class RateLimitAttribute : Attribute
    {
        public string Name { get; }
        public int MaxRequests { get; }
        public int WindowMinutes { get; }

        public RateLimitAttribute(string name, int maxRequests, int windowMinutes = 1)
        {
            Name = name;
            MaxRequests = maxRequests;
            WindowMinutes = windowMinutes;
        }
    }
}