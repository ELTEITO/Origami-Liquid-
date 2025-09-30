// using OrigamiBack.Data;
// using OrigamiBack.Data.Modelos;
// using OrigamiBack.Services.Interface;
// using Microsoft.EntityFrameworkCore;
// using Microsoft.Extensions.Caching.Memory;
// using System.Linq;

// namespace OrigamiBack.Services
// {
//     public class vCelularesInfoService : IvCelularesInfoService
//     {
//         private readonly ApplicationDbContext _context;
//         private readonly IMemoryCache _cache;
//         private readonly ILogger<vCelularesInfoService> _logger;
//         private const int CACHE_DURATION_MINUTES = 30;

//         public vCelularesInfoService(
//             ApplicationDbContext applicationDbContext, 
//             IMemoryCache cache,
//             ILogger<vCelularesInfoService> logger)
//         {
//             _context = applicationDbContext;
//             _cache = cache;
//             _logger = logger;
//         }

//         public async Task<List<object>> ObtenerCelularesInfoAsync()
//         {
//             const string cacheKey = "celulares_info_all";
            
//             if (_cache.TryGetValue(cacheKey, out List<object> cachedResult))
//             {
//                 _logger.LogInformation("Retornando datos de celulares desde caché");
//                 return cachedResult;
//             }

//             try
//             {
//                 _logger.LogInformation("Obteniendo información de celulares desde base de datos");
                
//                 var resultado = await _context.vCelularesMBP
//                     .AsNoTracking()
//                     .Select(v => new { v.marca, v.modelo, v.arreglomodulo, v.arreglobat, v.arreglopin, v.placa, v.tipopin })
//                     .Distinct()
//                     .Cast<object>()
//                     .ToListAsync();

//                 var cacheOptions = new MemoryCacheEntryOptions()
//                     .SetAbsoluteExpiration(TimeSpan.FromMinutes(CACHE_DURATION_MINUTES));

//                 _cache.Set(cacheKey, resultado, cacheOptions);
                
//                 _logger.LogInformation("Información de celulares obtenida y cacheada. Total: {Count}", resultado.Count);
//                 return resultado;
//             }
//             catch (Exception ex)
//             {
//                 _logger.LogError(ex, "Error al obtener información de celulares");
//                 throw;
//             }
//         }

//         public async Task<List<string>> ObtenerMarcasAsync()
//         {
//             const string cacheKey = "marcas_all";
            
//             if (_cache.TryGetValue(cacheKey, out List<string> cachedResult))
//             {
//                 _logger.LogInformation("Retornando marcas desde caché");
//                 return cachedResult;
//             }

//             try
//             {
//                 _logger.LogInformation("Obteniendo marcas desde base de datos");
                
//                 var resultado = await _context.vCelularesMBP
//                     .AsNoTracking()
//                     .Select(v => v.marca)
//                     .Where(m => !string.IsNullOrEmpty(m))
//                     .Distinct()
//                     .OrderBy(m => m)
//                     .ToListAsync();

//                 var cacheOptions = new MemoryCacheEntryOptions()
//                     .SetAbsoluteExpiration(TimeSpan.FromMinutes(CACHE_DURATION_MINUTES));

//                 _cache.Set(cacheKey, resultado, cacheOptions);
                
//                 _logger.LogInformation("Marcas obtenidas y cacheadas. Total: {Count}", resultado.Count);
//                 return resultado ?? new List<string>();
//             }
//             catch (Exception ex)
//             {
//                 _logger.LogError(ex, "Error al obtener marcas");
//                 throw;
//             }
//         }
        
//         public async Task<List<string>> ObtenerModelosAsync()
//         {
//             const string cacheKey = "modelos_all";
            
//             if (_cache.TryGetValue(cacheKey, out List<string> cachedResult))
//             {
//                 _logger.LogInformation("Retornando modelos desde caché");
//                 return cachedResult;
//             }

//             try
//             {
//                 _logger.LogInformation("Obteniendo modelos desde base de datos");
                
//                 var resultado = await _context.vCelularesMBP
//                     .AsNoTracking()
//                     .Select(v => v.modelo)
//                     .Where(m => !string.IsNullOrEmpty(m))
//                     .Distinct()
//                     .OrderBy(m => m)
//                     .ToListAsync();

//                 var cacheOptions = new MemoryCacheEntryOptions()
//                     .SetAbsoluteExpiration(TimeSpan.FromMinutes(CACHE_DURATION_MINUTES));

//                 _cache.Set(cacheKey, resultado, cacheOptions);
                
//                 _logger.LogInformation("Modelos obtenidos y cacheados. Total: {Count}", resultado.Count);
//                 return resultado ?? new List<string>();
//             }
//             catch (Exception ex)
//             {
//                 _logger.LogError(ex, "Error al obtener modelos");
//                 throw;
//             }
//         }
        
//         public async Task<List<string>> ObtenerModelosPorMarcaAsync(string marca)
//         {
//             if (string.IsNullOrWhiteSpace(marca))
//             {
//                 _logger.LogWarning("Se intentó obtener modelos con marca vacía");
//                 return new List<string>();
//             }

//             var cacheKey = $"modelos_marca_{marca.ToLower()}";
            
//             if (_cache.TryGetValue(cacheKey, out List<string> cachedResult))
//             {
//                 _logger.LogInformation("Retornando modelos para marca {Marca} desde caché", marca);
//                 return cachedResult;
//             }

//             try
//             {
//                 _logger.LogInformation("Obteniendo modelos para marca: {Marca}", marca);
                
//                 var resultado = await _context.vCelularesMBP
//                     .AsNoTracking()
//                     .Where(v => v.marca == marca)
//                     .Select(v => v.modelo)
//                     .Where(m => !string.IsNullOrEmpty(m))
//                     .Distinct()
//                     .OrderBy(m => m)
//                     .ToListAsync();

//                 var cacheOptions = new MemoryCacheEntryOptions()
//                     .SetAbsoluteExpiration(TimeSpan.FromMinutes(CACHE_DURATION_MINUTES));

//                 _cache.Set(cacheKey, resultado, cacheOptions);
                
//                 _logger.LogInformation("Modelos obtenidos para marca {Marca}. Total: {Count}", marca, resultado.Count);
//                 return resultado ?? new List<string>();
//             }
//             catch (Exception ex)
//             {
//                 _logger.LogError(ex, "Error al obtener modelos para marca: {Marca}", marca);
//                 throw;
//             }
//         }

//         public async Task<List<object>> ObtenerCelularesInfoByMarcaAsync(string marca) 
//         {
//             if (string.IsNullOrWhiteSpace(marca))
//             {
//                 _logger.LogWarning("Se intentó obtener información con marca vacía");
//                 return new List<object>();
//             }

//             try
//             {
//                 _logger.LogInformation("Obteniendo información de celulares por marca: {Marca}", marca);
                
//                 var resultado = await _context.vCelularesMBP
//                     .AsNoTracking()
//                     .Where(v => v.marca == marca)
//                     .Select(m => m.modelo)
//                     .Where(m => !string.IsNullOrEmpty(m))
//                     .Distinct()
//                     .OrderBy(m => m)
//                     .Cast<object>()
//                     .ToListAsync();

//                 _logger.LogInformation("Información obtenida para marca {Marca}. Total: {Count}", marca, resultado.Count);
//                 return resultado;
//             }
//             catch (Exception ex)
//             {
//                 _logger.LogError(ex, "Error al obtener información por marca: {Marca}", marca);
//                 throw;
//             }
//         }

//         public async Task<List<string>> ObtenerCelularesInfoByModeloAsync(string modelo)
//         {
//             if (string.IsNullOrWhiteSpace(modelo))
//             {
//                 _logger.LogWarning("Se intentó obtener información con modelo vacío");
//                 return new List<string>();
//             }

//             try
//             {
//                 _logger.LogInformation("Obteniendo marcas por modelo: {Modelo}", modelo);
                
//                 var resultado = await _context.vCelularesMBP
//                     .AsNoTracking()
//                     .Where(v => v.modelo == modelo)
//                     .Select(m => m.marca)
//                     .Where(m => !string.IsNullOrEmpty(m))
//                     .Distinct()
//                     .OrderBy(m => m)
//                     .ToListAsync();

//                 _logger.LogInformation("Marcas obtenidas para modelo {Modelo}. Total: {Count}", modelo, resultado.Count);
//                 return resultado ?? new List<string>();
//             }
//             catch (Exception ex)
//             {
//                 _logger.LogError(ex, "Error al obtener marcas por modelo: {Modelo}", modelo);
//                 throw;
//             }
//         }
        
//         public async Task<List<object>> ObtenerCelularesInfoByModeloYMarcaAsync(string marca, string modelo)
//         {
//             if (string.IsNullOrWhiteSpace(marca) || string.IsNullOrWhiteSpace(modelo))
//             {
//                 _logger.LogWarning("Se intentó obtener información con marca o modelo vacío");
//                 return new List<object>();
//             }

//             try
//             {
//                 _logger.LogInformation("Obteniendo información para {Marca} {Modelo}", marca, modelo);
                
//                 var resultado = await _context.vCelularesMBP
//                     .AsNoTracking()
//                     .Where(v => v.marca == marca && v.modelo == modelo)
//                     .Select(m => new { m.marca, m.modelo, m.arreglomodulo, m.arreglobat, m.arreglopin, m.placa, m.tipopin })
//                     .Distinct()
//                     .Cast<object>()
//                     .ToListAsync();

//                 _logger.LogInformation("Información obtenida para {Marca} {Modelo}. Total: {Count}", marca, modelo, resultado.Count);
//                 return resultado;
//             }
//             catch (Exception ex)
//             {
//                 _logger.LogError(ex, "Error al obtener información para {Marca} {Modelo}", marca, modelo);
//                 throw;
//             }
//         }

//         public async Task<List<object>> ObtenerInfoPorMarcaYModeloAsync(string marca, string modelo)
//         {
//             if (string.IsNullOrWhiteSpace(marca) || string.IsNullOrWhiteSpace(modelo))
//             {
//                 _logger.LogWarning("Se intentó obtener información detallada con marca o modelo vacío");
//                 return new List<object>();
//             }

//             try
//             {
//                 _logger.LogInformation("Obteniendo información detallada para {Marca} {Modelo}", marca, modelo);
                
//                 var resultado = await _context.vCelularesMBP
//                     .AsNoTracking()
//                     .Where(v => v.marca == marca && v.modelo == modelo)
//                     .Select(v => new
//                     {
//                         v.marca,
//                         v.modelo,
//                         arreglomodulo = v.arreglomodulo,
//                         arreglobateria = v.arreglobat,
//                         arreglopin = v.arreglopin,
//                         colormodulo = v.color,
//                         v.tipo,
//                         v.tipopin,
//                         v.marco,
//                         v.version,
//                         v.placa
//                     })
//                     .OrderBy(v => v.colormodulo)
//                     .ThenBy(v => v.tipo)
//                     .ThenBy(v => v.version)
//                     .Cast<object>()
//                     .ToListAsync();

//                 _logger.LogInformation("Información detallada obtenida para {Marca} {Modelo}. Total: {Count}", marca, modelo, resultado.Count);
//                 return resultado;
//             }
//             catch (Exception ex)
//             {
//                 _logger.LogError(ex, "Error al obtener información detallada para {Marca} {Modelo}", marca, modelo);
//                 throw;
//             }
//         }

//         /// <summary>
//         /// Obtiene estadísticas de precios por marca
//         /// </summary>
//         public async Task<List<object>> ObtenerEstadisticasPreciosAsync()
//         {
//             const string cacheKey = "estadisticas_precios";
            
//             if (_cache.TryGetValue(cacheKey, out List<object> cachedResult))
//             {
//                 _logger.LogInformation("Retornando estadísticas desde caché");
//                 return cachedResult;
//             }

//             try
//             {
//                 _logger.LogInformation("Obteniendo estadísticas de precios");
                
//                 var resultado = await _context.vCelularesMBP
//                     .AsNoTracking()
//                     .GroupBy(v => v.marca)
//                     .Select(g => new
//                     {
//                         marca = g.Key,
//                         totalModelos = g.Select(v => v.modelo).Distinct().Count(),
//                         promedioModulo = g.Average(v => v.arreglomodulo),
//                         promedioBateria = g.Average(v => v.arreglobat),
//                         promedioPin = g.Average(v => v.arreglopin),
//                         precioMinimoModulo = g.Min(v => v.arreglomodulo),
//                         precioMaximoModulo = g.Max(v => v.arreglomodulo),
//                         precioMinimoBateria = g.Min(v => v.arreglobat),
//                         precioMaximoBateria = g.Max(v => v.arreglobat),
//                         precioMinimoPin = g.Min(v => v.arreglopin),
//                         precioMaximoPin = g.Max(v => v.arreglopin)
//                     })
//                     .OrderBy(s => s.marca)
//                     .Cast<object>()
//                     .ToListAsync();

//                 var cacheOptions = new MemoryCacheEntryOptions()
//                     .SetAbsoluteExpiration(TimeSpan.FromMinutes(CACHE_DURATION_MINUTES));

//                 _cache.Set(cacheKey, resultado, cacheOptions);
                
//                 _logger.LogInformation("Estadísticas obtenidas y cacheadas. Total marcas: {Count}", resultado.Count);
//                 return resultado;
//             }
//             catch (Exception ex)
//             {
//                 _logger.LogError(ex, "Error al obtener estadísticas de precios");
//                 throw;
//             }
//         }

//         /// <summary>
//         /// Busca dispositivos con filtros avanzados
//         /// </summary>
//         public async Task<List<object>> BuscarDispositivosAvanzadoAsync(
//             string? termino = null,
//             string? marca = null,
//             string? modelo = null,
//             decimal? precioMinimo = null,
//             decimal? precioMaximo = null,
//             bool? tieneMarco = null,
//             int limit = 100)
//         {
//             try
//             {
//                 _logger.LogInformation("Búsqueda avanzada - Término: {Termino}, Marca: {Marca}, Modelo: {Modelo}, Precio: {PrecioMin}-{PrecioMax}, Marco: {Marco}, Límite: {Limit}", 
//                     termino, marca, modelo, precioMinimo, precioMaximo, tieneMarco, limit);

//                 var query = _context.vCelularesMBP.AsQueryable();

//                 // Filtros básicos
//                 if (!string.IsNullOrEmpty(termino))
//                 {
//                     query = query.Where(v => 
//                         (v.marca != null && EF.Functions.ILike(v.marca, $"%{termino}%")) || 
//                         (v.modelo != null && EF.Functions.ILike(v.modelo, $"%{termino}%"))
//                     );
//                 }

//                 if (!string.IsNullOrEmpty(marca))
//                 {
//                     query = query.Where(v => v.marca != null && EF.Functions.ILike(v.marca, marca));
//                 }

//                 if (!string.IsNullOrEmpty(modelo))
//                 {
//                     query = query.Where(v => v.modelo != null && EF.Functions.ILike(v.modelo, modelo));
//                 }

//                 // Filtros de precio
//                 if (precioMinimo.HasValue)
//                 {
//                     query = query.Where(v => 
//                         (v.arreglomodulo >= precioMinimo) || 
//                         (v.arreglobat >= precioMinimo) || 
//                         (v.arreglopin >= precioMinimo)
//                     );
//                 }

//                 if (precioMaximo.HasValue)
//                 {
//                     query = query.Where(v => 
//                         (v.arreglomodulo <= precioMaximo) || 
//                         (v.arreglobat <= precioMaximo) || 
//                         (v.arreglopin <= precioMaximo)
//                     );
//                 }

//                 // Filtro de marco
//                 if (tieneMarco.HasValue)
//                 {
//                     query = query.Where(v => v.marco == tieneMarco.Value);
//                 }

//                 var resultado = await query
//                     .Take(limit)
//                     .Select(v => new
//                     {
//                         v.marca,
//                         v.modelo,
//                         v.arreglomodulo,
//                         v.arreglobat,
//                         v.arreglopin,
//                         v.color,
//                         v.tipo,
//                         v.tipopin,
//                         v.marco,
//                         v.placa,
//                         v.version
//                     })
//                     .OrderBy(v => v.marca)
//                     .ThenBy(v => v.modelo)
//                     .Cast<object>()
//                     .ToListAsync();

//                 _logger.LogInformation("Búsqueda avanzada completada. Resultados: {Count}", resultado.Count);
//                 return resultado;
//             }
//             catch (Exception ex)
//             {
//                 _logger.LogError(ex, "Error en búsqueda avanzada");
//                 throw;
//             }
//         }

//         /// <summary>
//         /// Limpia el caché del servicio
//         /// </summary>
//         public void LimpiarCache()
//         {
//             _logger.LogInformation("Limpiando caché del servicio");
            
//             // Remover claves específicas del caché
//             _cache.Remove("celulares_info_all");
//             _cache.Remove("marcas_all");
//             _cache.Remove("modelos_all");
//             _cache.Remove("estadisticas_precios");
            
//             // Nota: Para limpiar claves dinámicas como "modelos_marca_*" 
//             // se necesitaría implementar un sistema de tracking de claves
//             // o usar un caché distribuido como Redis
//         }
//     }
// }
