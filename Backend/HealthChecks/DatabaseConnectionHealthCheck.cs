using OrigamiBack.Data;
using OrigamiBack.Data.Modelos;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace OrigamiBack.HealthChecks;

public class DatabaseConnectionHealthCheck : IHealthCheck
{
    private readonly ApplicationDbContext _context;

    public DatabaseConnectionHealthCheck(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

            // Intenta ejecutar una consulta simple
            var canConnect = await _context.Database.CanConnectAsync(cancellationToken);

            if (!canConnect)
            {
                return new HealthCheckResult(
                    HealthStatus.Unhealthy,
                    description: "Cannot connect to database");
            }

            // Verifica con una consulta real
            var userCount = await _context.Set<Usuario>().CountAsync(cancellationToken);
            stopwatch.Stop();

            var responseTime = stopwatch.ElapsedMilliseconds;
            var status = responseTime < 100 ? HealthStatus.Healthy :
                        responseTime < 500 ? HealthStatus.Degraded :
                        HealthStatus.Unhealthy;

            return new HealthCheckResult(
                status,
                description: $"Database connection successful. Response time: {responseTime}ms. Users: {userCount}",
                data: new Dictionary<string, object>
                {
                    ["response_time_ms"] = responseTime,
                    ["user_count"] = userCount
                });
        }
        catch (Exception ex)
        {
            return new HealthCheckResult(
                HealthStatus.Unhealthy,
                description: "Database health check failed",
                exception: ex);
        }
    }
}