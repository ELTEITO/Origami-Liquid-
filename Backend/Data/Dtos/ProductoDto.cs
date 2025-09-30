using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrigamiBack.Data.Dtos
{
    public class ProductoDto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "La marca es requerida")]
        public string Marca { get; set; } = string.Empty;

        [Required(ErrorMessage = "El modelo es requerido")]
        public string Modelo { get; set; } = string.Empty;

        [Required(ErrorMessage = "La categoría es requerida")]
        public string Categoria { get; set; } = string.Empty;

        // La imagen no es requerida para actualizaciones parciales
        public string? Img { get; set; }

        public List<ProductosVariantesDto> Variantes { get; set; } = new();

        public int GetTotalStock()
        {
            return Variantes?.Sum(v => v.Stock) ?? 0;
        }

        public decimal? GetBasePrice()
        {
            return Variantes?.Min(v => v.Precio);
        }

        public IEnumerable<string> GetAvailableRAM()
        {
            return Variantes?.Select(v => v.Ram)
                .Where(r => r != null)
                .Distinct()
                .OrderBy(r => r) ?? Enumerable.Empty<string>();
        }

        // Método para obtener los almacenamientos disponibles por RAM
        public IEnumerable<string> GetAvailableStorage(string ram)
        {
            return Variantes?.Where(v => v.Ram == ram)
                .Select(v => v.Almacenamiento)
                .Where(s => s != null)
                .Distinct()
                .OrderBy(s => s) ?? Enumerable.Empty<string>();
        }

        // Método para obtener los colores disponibles por RAM y almacenamiento
        public IEnumerable<string> GetAvailableColors(string ram, string storage)
        {
            return Variantes?.Where(v => v.Ram == ram && v.Almacenamiento == storage)
                .Select(v => v.Color)
                .Where(c => c != null)
                .Distinct()
                .OrderBy(c => c) ?? Enumerable.Empty<string>();
        }
    }
}