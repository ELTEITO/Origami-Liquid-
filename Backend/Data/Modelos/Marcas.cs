using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrigamiBack.Data.Modelos
{
    [Table("marcas")]
    public class Marcas
    {
        [Key]
        public int Id { get; set; }
        [Column("Nombre")]
        public string? Nombre { get; set; }
    }
}
