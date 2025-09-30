using OrigamiBack.Data.Modelos;

namespace OrigamiBack.Services.Interface
{
    public interface IvCelularesInfoService
    {
        //BATERIAS
        Task<List<object>> ObtenerCelularesInfoAsync();
        Task<List<string>> ObtenerMarcasAsync();
        Task<List<string>> ObtenerModelosAsync();
        Task<List<string>> ObtenerModelosPorMarcaAsync(string marca);
        Task<List<object>> ObtenerCelularesInfoByMarcaAsync(string marca);
        Task<List<string>> ObtenerCelularesInfoByModeloAsync(string modelo);
        Task<List<object>> ObtenerCelularesInfoByModeloYMarcaAsync(string marca, string modelo);
        Task<List<object>> ObtenerInfoPorMarcaYModeloAsync(string marca, string modelo);
        
        // Nuevos métodos para estadísticas y búsqueda avanzada
        Task<List<object>> ObtenerEstadisticasPreciosAsync();
        Task<List<object>> BuscarDispositivosAvanzadoAsync(
            string? termino = null,
            string? marca = null,
            string? modelo = null,
            decimal? precioMinimo = null,
            decimal? precioMaximo = null,
            bool? tieneMarco = null,
            int limit = 100);
        
        // Gestión de caché
        void LimpiarCache();
    }
}
