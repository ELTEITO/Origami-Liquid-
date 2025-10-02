using OrigamiBack.Data.Dtos;
using OrigamiBack.Data.Modelos;

namespace OrigamiBack.Services.Interface
{
    public interface IMarcaService
    {
        Task<MarcaDto> GetMarcaByIdAsync(int id);
        Task<MarcaDto> AddMarcaAsync(MarcaDto marcaDto);
        Task UpdateMarcaAsync(MarcaDto marcaDto);
        Task DeleteMarcaAsync(int id);

        //Task<MarcaDto?> GetMarcasAsync(int id);  
        Task<IEnumerable<MarcaDto>> GetAllMarcasAsync();

    }
}
