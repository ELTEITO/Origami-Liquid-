using OrigamiBack.Data.Dtos;
using OrigamiBack.Data.Modelos;

namespace OrigamiBack.Services.Interface
{
    public interface ICategoriaService
    {
        Task<CategoriaDto> GetCategoriaByIdAsync(int id);
        Task<CategoriaDto> AddCategoriaAsync(CategoriaDto categoriaDto);
        Task UpdateCategoriaAsync(CategoriaDto categoriaDto);
        Task DeleteCategoriaAsync(int id);

        //Task<CategoriaDto?> GetCategoriasAsync(int id);  
        Task<IEnumerable<CategoriaDto>> GetAllCategoriasAsync();

    }
}
