using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace OrigamiBack.HealthChecks;

public class MemoryHealthCheck : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        var allocatedBytes = GC.GetTotalMemory(false);
        var allocatedMB = allocatedBytes / (1024 * 1024);

        var status = allocatedMB < 1024 ? HealthStatus.Healthy :
                    allocatedMB < 2048 ? HealthStatus.Degraded :
                    HealthStatus.Unhealthy;

        return Task.FromResult(new HealthCheckResult(
            status,
            description: $"Memory usage: {allocatedMB} MB",
            data: new Dictionary<string, object> { ["allocated_mb"] = allocatedMB }));
    }
}