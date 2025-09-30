using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;


namespace OrigamiBack.Data.Modelos
{
    public class ProductosVariantes
    {
        [Key]
        public int Id { get; set; }
        public int ProductoId { get; set; }
        [Column("stock")]
        [Required]
        public int Stock { get; set; }
        [Column("color")]
        [Required]
        public required string Color { get; set; }
        [Column("ram")]
        [Required]
        public required string Ram { get; set; }
        [Column("almacenamiento")]
        [Required]
        public required string Almacenamiento { get; set; }
        [Column("precio")]
        [Required]
        public decimal Precio { get; set; }
        [JsonIgnore]
        public Productos? Producto { get; set; }



    }
}
