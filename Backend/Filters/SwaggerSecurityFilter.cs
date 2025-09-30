using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace OrigamiBack.Filters;

public class SwaggerSecurityFilter : IDocumentFilter
{
    public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
    {
        // Ocultar endpoints que no deben aparecer en documentación
        var pathsToRemove = new List<string>();

        foreach (var path in swaggerDoc.Paths)
        {
            // Ocultar endpoints de administración o internos
            if (path.Key.Contains("/admin/") ||
                path.Key.Contains("/internal/") ||
                path.Key.Contains("/debug/"))
            {
                pathsToRemove.Add(path.Key);
            }
        }

        foreach (var path in pathsToRemove)
        {
            swaggerDoc.Paths.Remove(path);
        }
    }
}