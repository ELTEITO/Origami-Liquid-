using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using OrigamiBack.Services.Interface;
using OrigamiBack.Data.Dtos;

namespace OrigamiBack.Controllers
{
    [ApiController]
    [Route("api/Categoria")]
    public class CategoriaController : ControllerBase
    {
        private readonly ICategoriaService _categoriaService;

        public CategoriaController(ICategoriaService categoriaService)
        {
            _categoriaService = categoriaService;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoriaDto>>> GetAll()
        {
            var items = await _categoriaService.GetAllCategoriasAsync();
            return Ok(items);
        }

        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult<CategoriaDto>> GetById(int id)
        {
            var item = await _categoriaService.GetCategoriaByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost]
        public async Task<ActionResult<CategoriaDto>> Create([FromBody] CategoriaDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var created = await _categoriaService.AddCategoriaAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CategoriaDto dto)
        {
            if (id != dto.Id) return BadRequest("Id mismatch");
            await _categoriaService.UpdateCategoriaAsync(dto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _categoriaService.DeleteCategoriaAsync(id);
            return NoContent();
        }
    }
}


