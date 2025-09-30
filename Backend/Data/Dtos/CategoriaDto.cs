using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrigamiBack.Data.Dtos
{
    public class CategoriaDto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "El nombre es requerido")]
        public string Nombre { get; set; } = string.Empty;

        public string Descripcion { get; set; } = string.Empty;

    }
}