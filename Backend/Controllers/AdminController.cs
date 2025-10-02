using OrigamiBack.Data;
using OrigamiBack.Data.Modelos;
using OrigamiBack.Services;
using OrigamiBack.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using Microsoft.AspNetCore.RateLimiting;
using OrigamiBack.Middleware;
namespace OrigamiBack.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN")]
    [EnableRateLimiting("AuthPolicy")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IUsuarioService _usuarioService;
        //private readonly ICelularesService _celularesService;
        public AdminController(ApplicationDbContext context, IConfiguration config, IUsuarioService usuarioService)
        {
            _context = context;
            _configuration = config;
            _usuarioService = usuarioService;
        }

        [HttpPost("registro")]
        [RateLimit("registro", 2, 10)]
         [AllowAnonymous]
        public async Task<IActionResult> CrearAdmin([FromBody] Usuario usuario)
        {
            try
            {
                if (string.IsNullOrEmpty(usuario.Email) || string.IsNullOrEmpty(usuario.ClaveHash))
                {
                    return BadRequest(new { message = "Email y contraseña son requeridos" });
                }

                usuario.Rol = "ADMIN";
                var usuarioCreado = await _usuarioService.CrearUsuarioAsync(usuario);

                return Ok(new
                {
                    message = "Administrador creado correctamente",
                    usuario = new
                    {
                        id = usuarioCreado.Id,
                        email = usuarioCreado.Email,
                        rol = usuarioCreado.Rol
                    }
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al crear el administrador", error = ex.Message });
            }
        }

        [HttpPost("login")]
        [AllowAnonymous]
        [RateLimit("login", 3, 5)]
        public async Task<IActionResult> Login([FromBody] Auth auth)
        {
            try
            {
                if (string.IsNullOrEmpty(auth.Email) || string.IsNullOrEmpty(auth.Password))
                {
                    return BadRequest("Email y contraseña son requeridos");
                }

                var usuario = await _usuarioService.ValidarCredencialesAsync(auth.Email, auth.Password);
                
                if (usuario == null)
                {
                    return Unauthorized(new { message = "Credenciales inválidas" });
                }

                if (usuario.Rol?.ToUpper() != "ADMIN")
                {
                    return Unauthorized(new { message = "No tienes permisos de administrador" });
                }

                var token = _usuarioService.GenerarToken(usuario);

                // Configurar cookie httpOnly
                var cookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = false,
                    SameSite = SameSiteMode.Lax,
                    Expires = DateTimeOffset.UtcNow.AddHours(24),
                    Path = "/",
                    IsEssential = true // Evita que CookiePolicy la bloquee por consentimiento
                    // No establecer Domain para que funcione en mismo origen
                };

                // En producción, usar configuración más segura
                if (_configuration["ASPNETCORE_ENVIRONMENT"] == "Production")
                {
                    cookieOptions.Secure = true;
                    cookieOptions.SameSite = SameSiteMode.Strict;
                }

                Response.Cookies.Append("AuthToken", token, cookieOptions);

                // Log para debug
                Console.WriteLine($"\n========== LOGIN ==========");
                Console.WriteLine($"✅ Usuario: {usuario.Email}");
                Console.WriteLine($"✅ Cookie configurada: HttpOnly={cookieOptions.HttpOnly}, SameSite={cookieOptions.SameSite}");
                Console.WriteLine($"===========================\n");

                return Ok(new
                {
                    message = "Inicio de sesión exitoso",
                    usuario = new
                    {
                        id = usuario.Id,
                        email = usuario.Email,
                        rol = usuario.Rol
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al iniciar sesión", error = ex.Message });
            }
        }

        [HttpPost("logout")]
        [AllowAnonymous]
        public IActionResult Logout()
        {
            try
            {
                // Eliminar cookie de autenticación
                // Coincidir Path y atributos clave para garantizar borrado en todos los navegadores
                Response.Cookies.Delete("AuthToken", new CookieOptions
                {
                    Path = "/",
                    SameSite = SameSiteMode.Lax,
                    Secure = _configuration["ASPNETCORE_ENVIRONMENT"] == "Production"
                });
                
                return Ok(new { message = "Sesión cerrada exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al cerrar sesión", error = ex.Message });
            }
        }

        [HttpGet("verify")]
        [AllowAnonymous]
        public IActionResult VerifySession()
        {
            try
            {
                Console.WriteLine("\n========== VERIFY SESSION ==========");
                Console.WriteLine($"Cookies recibidas: {Request.Cookies.Count}");

                foreach (var cookie in Request.Cookies)
                {
                    Console.WriteLine($"  - {cookie.Key}");
                }

                // Verificar si hay token en cookies
                if (Request.Cookies.TryGetValue("AuthToken", out var token))
                {
                    Console.WriteLine($"✅ AuthToken ENCONTRADO");
                    Console.WriteLine($"Usuario autenticado: {User.Identity?.IsAuthenticated}");

                    // El middleware JwtCookieMiddleware ya habrá validado el token
                    if (User.Identity?.IsAuthenticated == true)
                    {
                        var email = User.FindFirst(ClaimTypes.Email)?.Value;
                        Console.WriteLine($"✅ SESIÓN VÁLIDA para: {email}");
                        Console.WriteLine($"====================================\n");

                        return Ok(new
                        {
                            isAuthenticated = true,
                            usuario = new
                            {
                                id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                                email = email,
                                rol = User.FindFirst(ClaimTypes.Role)?.Value
                            }
                        });
                    }
                    else
                    {
                        Console.WriteLine("❌ Token presente pero NO autenticado (middleware falló)");
                        Console.WriteLine($"====================================\n");
                    }
                }
                else
                {
                    Console.WriteLine("❌ AuthToken NO encontrado");
                    Console.WriteLine($"====================================\n");
                }

                return Ok(new { isAuthenticated = false });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Exception: {ex.Message}");
                Console.WriteLine($"====================================\n");
                return StatusCode(500, new { message = "Error al verificar sesión", error = ex.Message });
            }
        }

        private async Task<bool> AlreadyExist(string email)
        {
            return await _context.Usuarios.AnyAsync(u=>u.Email.ToLower()== email.ToLower());
        }

        // ============================= ENDPOINTS PROTEGIDOS =============================
      
    }
}
