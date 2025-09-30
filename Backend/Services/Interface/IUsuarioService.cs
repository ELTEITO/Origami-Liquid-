using OrigamiBack.Data.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace OrigamiBack.Services.Interface
{
    public interface IUsuarioService
    {
        public Task<Usuario?> ValidarCredencialesAsync(string userName, string password);
        public Task<Usuario> CrearUsuarioAsync(Usuario usuario);
        public Task<Usuario?> ObtenerUsuarioPorEmailAsync(string email);
        public string GenerarToken(Usuario usuario);

        public Task ActualizarProductoAsync(Productos producto, int id);
        public Task EliminarProducto(int id);
        public Task<Productos> ObtenerByIdAsync(int id);
        public Task<List<Productos>> ObtenerTodosProductosAsync();
        public Task CrearVarianteAsync(ProductosVariantes productosVariantes);
        public Task ActualizarVarianteAsync(ProductosVariantes productosVariantes, int id);
        public Task EliminarVarianteProducto(int id);
        public Task<ProductosVariantes> ObtenerVarianteByIdAsync(int id);
        public Task<List<ProductosVariantes>> ObtenerVariantePorModeloAsync(int idproducto);
        public Task<List<ProductosVariantes>> ObtenerAllVariantesAsync();
    }
}
