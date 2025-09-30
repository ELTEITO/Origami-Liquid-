using OrigamiBack.Data;
using OrigamiBack.Services.Interface;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.RateLimiting;
namespace OrigamiBack.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [EnableRateLimiting("AuthPolicy")]
    public class CelularesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IvCelularesInfoService _celularesService;
        public CelularesController(ApplicationDbContext context, IvCelularesInfoService celularesService)
        {
            _context = context;
            _celularesService = celularesService;
        }

        [HttpGet]
        public async Task<IActionResult> GetCelulares()
         => Ok(await _celularesService.ObtenerCelularesInfoAsync());

        [HttpGet("marcas")]
        public async Task<IActionResult> GetMarcas()
            => Ok(await _celularesService.ObtenerMarcasAsync());

        [HttpGet("modelos")]
        public async Task<IActionResult> GetModelos()
            => Ok(await _celularesService.ObtenerModelosAsync());
    
        [HttpGet("modelos/{marca}")]
        public async Task<IActionResult> GetModelosPorMarca(string marca) 
            => Ok(await _celularesService.ObtenerCelularesInfoByMarcaAsync(marca));

        

        
    }
}
