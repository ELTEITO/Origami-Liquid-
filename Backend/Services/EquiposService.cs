// using OrigamiBack.Data;
// using OrigamiBack.Data.Modelos;
// using OrigamiBack.Services.Interface;
// using Microsoft.EntityFrameworkCore;

// namespace OrigamiBack.Services
// {
//     public class EquiposService : ICelularesService
//     {
//         private readonly ApplicationDbContext _context;

//         public EquiposService(ApplicationDbContext applicationDbContext)
//         {
//             _context = applicationDbContext;
//         }
//         public async Task<List<object>> ObtenerEquiposUnicosAsync()
//         {
//             return await _context.Celulares
//                 .AsNoTracking()
//                 .Select(e => new { e.marca, e.modelo })
//                 .Distinct()
//                 .Cast<object>()
//                 .ToListAsync();
//         }

//         public async Task<List<string>> ObtenerMarcasAsync()
//         {
//             return await _context.Celulares
//                 .AsNoTracking()
//                 .Select(m => m.marca)
//                 .Where(m => !string.IsNullOrEmpty(m))
//                 .Cast<string>()
//                 .Distinct()
//                 .ToListAsync();
//         }

//         public async Task<List<string>> ObtenerModelosAsync()
//         {
//             return await _context.Celulares
//                 .AsNoTracking()
//                 .Select(m => m.modelo)
//                 .Where(m => !string.IsNullOrEmpty(m))
//                 .Cast<string>()
//                 .Distinct()
//                 .ToListAsync();
//         }

//         public async Task<List<string>> ObtenerModelosPorMarcaAsync(string marca)
//         {
//             return await _context.Celulares
//                 .Where(c => c.marca == marca)
//                 .Select(m => m.modelo)
//                 .Where(m => !string.IsNullOrEmpty(m))
//                 .Cast<string>()
//                 .Distinct()
//                 .ToListAsync();
//         }

       
       
//     }
// }
