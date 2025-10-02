using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrigamiBack.Data.Dtos;
using OrigamiBack.Services.Interface;

namespace OrigamiBack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MarcaController : ControllerBase
    {
        private readonly IMarcaService _marcaService;
        private readonly ILogger<MarcaController> _logger;

        public MarcaController(IMarcaService marcaService, ILogger<MarcaController> logger)
        {
            _marcaService = marcaService;
            _logger = logger;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MarcaDto>>> GetAll()
        {
            try
            {
                var marcas = await _marcaService.GetAllMarcasAsync();
                return Ok(marcas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener marcas");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [AllowAnonymous]
        [HttpGet("{id:int}")]
        public async Task<ActionResult<MarcaDto>> GetById(int id)
        {
            try
            {
                var marca = await _marcaService.GetMarcaByIdAsync(id);
                if (marca == null) return NotFound();
                return Ok(marca);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener marca por id {Id}", id);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpPost]
        public async Task<ActionResult<MarcaDto>> Create([FromBody] MarcaDto marcaDto)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);
                var created = await _marcaService.AddMarcaAsync(marcaDto);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear marca");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] MarcaDto marcaDto)
        {
            try
            {
                if (id != marcaDto.Id) return BadRequest("El id de la ruta no coincide con el del cuerpo");
                if (!ModelState.IsValid) return BadRequest(ModelState);
                await _marcaService.UpdateMarcaAsync(marcaDto);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar marca {Id}", id);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _marcaService.DeleteMarcaAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar marca {Id}", id);
                return StatusCode(500, "Error interno del servidor");
            }
        }
    }
}


