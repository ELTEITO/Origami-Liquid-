using OrigamiBack.Data.Modelos;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace OrigamiBack.Data.Dtos
{
    public class ProductosVariantesDto
    {
        public int Id { get; set; }
        public int ProductoId { get; set; }

        [Required(ErrorMessage = "La RAM es requerida")]
        public string Ram { get; set; } = string.Empty;

        [Required(ErrorMessage = "El almacenamiento es requerido")]
        public string Almacenamiento { get; set; } = string.Empty;

        [Required(ErrorMessage = "El color es requerido")]
        public string Color { get; set; } = string.Empty;

        [Required(ErrorMessage = "El precio es requerido")]
        [Range(0, double.MaxValue, ErrorMessage = "El precio debe ser mayor o igual a 0")]
        public decimal Precio { get; set; }

        [Required(ErrorMessage = "El stock es requerido")]
        [Range(0, int.MaxValue, ErrorMessage = "El stock debe ser mayor o igual a 0")]
        public int Stock { get; set; }

        [JsonIgnore]
        public ProductoDto? Producto { get; set; }

    }
}