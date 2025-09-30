using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrigamiBack.Data.Modelos
{
    public class Rol 
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string NormalizedName { get; set; }
        public required string ConcurrencyStamp { get; set; }
        // Constructor por defecto
        public Rol() { }
        // Constructor con parámetros
        public Rol(int id, string nombre, string descripcion, string currencyStamp)
        {
            Id = id;
            Name = nombre;
            NormalizedName= descripcion;
            ConcurrencyStamp = currencyStamp;
        }

    }
}
