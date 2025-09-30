using OrigamiBack.Data.Modelos;

namespace OrigamiBack.Services.Interface
{
    public interface ICelularesService
    {
        Task<List<object>> ObtenerEquiposUnicosAsync();
        Task<List<string>> ObtenerMarcasAsync();
        Task<List<string>> ObtenerModelosAsync();
        Task<List<string>> ObtenerModelosPorMarcaAsync(string marca);
        Task<List<object>> ObtenerInfoPorMarcaYModeloAsync(string marca, string modelo);

    }
}
