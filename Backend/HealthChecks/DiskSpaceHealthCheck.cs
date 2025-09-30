using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace OrigamiBack.HealthChecks;

public class DiskSpaceHealthCheck : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            var drive = new DriveInfo(Directory.GetCurrentDirectory());
            var freeSpaceGB = drive.AvailableFreeSpace / (1024 * 1024 * 1024);
            var totalSpaceGB = drive.TotalSize / (1024 * 1024 * 1024);
            var usedPercentage = ((double)(totalSpaceGB - freeSpaceGB) / totalSpaceGB) * 100;

            var status = usedPercentage < 80 ? HealthStatus.Healthy :
                        usedPercentage < 90 ? HealthStatus.Degraded :
                        HealthStatus.Unhealthy;

            return Task.FromResult(new HealthCheckResult(
                status,
                description: $"Disk usage: {usedPercentage:F1}% ({freeSpaceGB} GB free of {totalSpaceGB} GB)",
                data: new Dictionary<string, object>
                {
                    ["free_space_gb"] = freeSpaceGB,
                    ["total_space_gb"] = totalSpaceGB,
                    ["used_percentage"] = usedPercentage
                }));
        }
        catch (Exception ex)
        {
            return Task.FromResult(new HealthCheckResult(
                HealthStatus.Unhealthy,
                description: "Unable to check disk space",
                exception: ex));
        }
    }
}