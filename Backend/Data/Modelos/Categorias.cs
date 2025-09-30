using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrigamiBack.Data.Modelos
{
    [Table("categorias")]
    public class Categorias
    {
        [Key]
        public int id { get; set; }
        [Column("nombre")]
        public string? nonbre { get; set; }
        [Column("descripcion")]
        public string? descripcion { get; set; }
    }
}
