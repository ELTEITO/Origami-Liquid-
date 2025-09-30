using OrigamiBack.Data;
using OrigamiBack.Data.Dtos;
using OrigamiBack.Data.Modelos;
using OrigamiBack.Services.Interface;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;

namespace OrigamiBack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [EnableRateLimiting("AuthPolicy")]
    public class ProductoController : ControllerBase
    {
        private readonly IProductoService _productoService;
        private readonly ILogger<ProductoController> _logger;

        public ProductoController(IProductoService productoService, ILogger<ProductoController> logger)
        {
            _productoService = productoService;
            _logger = logger;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductoDto>>> GetAll()
        {
            try
            {
                var productos = await _productoService.GetAllProductsAsync();
                return Ok(productos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener todos los productos");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductoDto>> GetById(int id)
        {
            try
            {
                var producto = await _productoService.GetByIdWithVarianteAsync(id);
                if (producto == null)
                {
                    return NotFound($"No se encontró el producto con ID {id}");
                }
                return Ok(producto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener el producto {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [AllowAnonymous]
        [HttpGet("{productoId}/variantes")]
        public async Task<ActionResult<IEnumerable<ProductosVariantesDto>>> GetVariantesAsync(int productoId)
        {
            try
            {
                var variantes = await _productoService.GetVariantesByIdAsync(productoId);
                // Siempre devolver un array, incluso si está vacío
                return Ok(variantes ?? new List<ProductosVariantesDto>());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener variantes para el producto {productoId}");
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [AllowAnonymous]
        [HttpGet("{productoId}/Ram-Opciones")]
        public async Task<ActionResult<IEnumerable<string>>> GetDistinctRamAsync(int productoId)
        {
            try
            {
                var producto = await _productoService.GetByIdWithVarianteAsync(productoId);
                if (producto == null)
                {
                    return NotFound($"No se encontró el producto con ID {productoId}");
                }
                var opciones = producto.GetAvailableRAM();
                return Ok(opciones);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [AllowAnonymous]
        [HttpGet("{productoId}/Almacenamiento-Opciones")]
        public async Task<ActionResult<IEnumerable<string>>> GetDistinctAlmacenamientosAsync(int productoId, [FromQuery] string ram)
        {
            try
            {
                var producto = await _productoService.GetByIdWithVarianteAsync(productoId);
                if (producto == null)
                {
                    return NotFound($"No se encontró el producto con ID {productoId}");
                }
                var almacenamientos = producto.GetAvailableStorage(ram);
                return Ok(almacenamientos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [AllowAnonymous]
        [HttpGet("{productoId}/Color-Opciones")]
        public async Task<ActionResult<IEnumerable<string>>> GetDistinctColorsAsync(int productoId, [FromQuery] string ram, [FromQuery] string almacenamiento)
        {
            try
            {
                var producto = await _productoService.GetByIdWithVarianteAsync(productoId);
                if (producto == null)
                {
                    return NotFound($"No se encontró el producto con ID {productoId}");
                }
                var colores = producto.GetAvailableColors(ram, almacenamiento);
                return Ok(colores);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [AllowAnonymous]
        [HttpGet("{productId}/variante")]
        public async Task<ActionResult<ProductosVariantesDto>> GetVarianteSpecAsync(
            int productId,
            [FromQuery] string ram,
            [FromQuery] string storage,
            [FromQuery] string color)
        {
            try
            {
                var variante = await _productoService.GetVarianteSpecAsync(productId, ram, storage, color);
                if (variante == null)
                {
                    return NotFound($"No se encontró la variante con las especificaciones solicitadas");
                }
                return Ok(variante);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [Authorize(Roles = "ADMIN")]
        [HttpPost]
        [EnableRateLimiting("CriticalPolicy")]
        public async Task<ActionResult<ProductoDto>> Create([FromBody] ProductoDto producto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var nuevoProducto = await _productoService.AddAsync(producto);
                return CreatedAtAction(nameof(GetById), new { id = nuevoProducto.Id }, nuevoProducto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear el producto");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Update(int id, [FromBody] ProductoDto productoDto)
        {
            try
            {
                if (id != productoDto.Id)
                    return BadRequest("El ID del producto no coincide");

                // Obtener el producto existente
                var existingProducto = await _productoService.GetByIdWithVarianteAsync(id);
                if (existingProducto == null)
                    return NotFound($"No se encontró el producto con ID {id}");

                // Si no se proporciona una nueva imagen, mantener la existente
                if (string.IsNullOrEmpty(productoDto.Img))
                    productoDto.Img = existingProducto.Img;

                await _productoService.UpdateAsync(productoDto);
                return Ok(productoDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al actualizar el producto {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN")]
        [EnableRateLimiting("CriticalPolicy")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var producto = await _productoService.GetByIdWithVarianteAsync(id);
                if (producto == null)
                {
                    return NotFound($"No se encontró el producto con ID {id}");
                }

                await _productoService.DeleteAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al eliminar el producto {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpGet("variante/{id}")]
        public async Task<ActionResult<ProductosVariantesDto>> GetVarianteById(int id)
        {
            try
            {
                var variante = await _productoService.GetVarianteByIdAsync(id);
                if (variante == null)
                {
                    return NotFound($"No se encontró la variante con ID {id}");
                }
                return Ok(variante);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener la variante {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpPost("variante")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> CreateVariante([FromBody] ProductosVariantesDto varianteDto)
        {
            try
            {
                // Verificar si ya existe una variante con las mismas especificaciones
                var existingVariante = await _productoService.GetVarianteSpecAsync(
                    varianteDto.ProductoId,
                    varianteDto.Ram,
                    varianteDto.Almacenamiento,
                    varianteDto.Color
                );

                if (existingVariante != null)
                {
                    return BadRequest("Ya existe una variante con estas especificaciones");
                }

                // Crear la nueva variante
                var createdVariante = await _productoService.AddVarianteAsync(varianteDto);
                return CreatedAtAction(nameof(GetVarianteById), new { id = createdVariante.Id }, createdVariante);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear la variante");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpPut("variante/{varianteId}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> UpdateVariante(int varianteId, [FromBody] ProductosVariantesDto varianteDto)
        {
            // 1. Buscar la variante existente
            var existingVariante = await _productoService.GetVarianteByIdAsync(varianteId);
            if (existingVariante == null)
                return NotFound($"No se encontró la variante con ID {varianteId}");

            // 2. Validar duplicados (misma combinación de ram, almacenamiento y color en el mismo producto)
            var duplicateCheck = await _productoService.GetVarianteSpecAsync(
                existingVariante.ProductoId,
                varianteDto.Ram,
                varianteDto.Almacenamiento,
                varianteDto.Color
            );
            if (duplicateCheck != null && duplicateCheck.Id != varianteId)
                return BadRequest("Ya existe una variante con estas especificaciones");

            // 3. Asignar los IDs correctos al DTO
            varianteDto.Id = varianteId;
            varianteDto.ProductoId = existingVariante.ProductoId;

            // 4. Actualizar la variante (solo update, nunca delete)
            await _productoService.UpdateVarianteAsync(varianteDto);

            // 5. Devolver la variante actualizada
            return Ok(varianteDto);
        }

        [HttpDelete("variante/{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> DeleteVariante(int id)
        {
            try
            {
                var variante = await _productoService.GetVarianteByIdAsync(id);
                if (variante == null)
                {
                    return NotFound($"No se encontró la variante con ID {id}");
                }

                await _productoService.DeleteVarianteAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al eliminar la variante {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }
    }
}
