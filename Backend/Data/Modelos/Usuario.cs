    using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrigamiBack.Data.Modelos
    {
    public class Usuario
    {
        public int Id { get; set; }

        public string Email { get; set; } = string.Empty;

        public string ClaveHash { get; set; } = string.Empty;

        public string Rol { get; set; } = "Admin";
    }

}

