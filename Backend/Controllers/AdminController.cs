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
        private readonly ICelularesService _celularesService;
        public AdminController(ApplicationDbContext context, IConfiguration config, IUsuarioService usuarioService, ICelularesService equiposService)
        {
            _context = context;
            _configuration = config;
            _usuarioService = usuarioService;
            _celularesService = equiposService;
        }

        [HttpPost("registro")]
         [RateLimit("registro", 2, 10)]
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

                return Ok(new { 
                    message = "Administrador creado correctamente",
                    usuario = new {
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
                    Secure = true, // Solo en HTTPS
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTimeOffset.UtcNow.AddHours(24), // Expira en 24 horas
                    Path = "/"
                };

                // En desarrollo, permitir HTTP
                if (_configuration["ASPNETCORE_ENVIRONMENT"] == "Development")
                {
                    cookieOptions.Secure = false;
                }

                Response.Cookies.Append("AuthToken", token, cookieOptions);
                
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
                Response.Cookies.Delete("AuthToken");
                
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
                // Verificar si hay token en cookies
                if (Request.Cookies.TryGetValue("AuthToken", out var token))
                {
                    // El middleware JwtCookieMiddleware ya habrá validado el token
                    // Si llegamos aquí y hay token, significa que es válido
                    if (User.Identity?.IsAuthenticated == true)
                    {
                        return Ok(new 
                        { 
                            isAuthenticated = true,
                            usuario = new
                            {
                                id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                                email = User.FindFirst(ClaimTypes.Email)?.Value,
                                rol = User.FindFirst(ClaimTypes.Role)?.Value
                            }
                        });
                    }
                }
                
                return Ok(new { isAuthenticated = false });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al verificar sesión", error = ex.Message });
            }
        }

        private async Task<bool> AlreadyExist(string email)
        {
            return await _context.Usuarios.AnyAsync(u=>u.Email.ToLower()== email.ToLower());
        }

        // ============================= ENDPOINTS PROTEGIDOS =============================


        [Authorize(Roles = "ADMIN")]
        [HttpGet]
        public async Task<IActionResult> GetCelulares()
        {
            try
            {
                var celulares = await _celularesService.ObtenerEquiposUnicosAsync();
                return Ok(celulares);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error al obtener los celulares", error = ex.Message });
            }
        }   

        [Authorize(Roles = "ADMIN")]
        [HttpGet("marcas")]
        public async Task<IActionResult> GetMarcas()
        {
            try
            {
                var marcas = await _celularesService.ObtenerMarcasAsync();
                return Ok(marcas);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error al obtener las marcas", error = ex.Message });
            }
        }

        [HttpGet("modelos")]
        public async Task<IActionResult> GetModelos()
        {
            try
            {
                var modelos = await _celularesService.ObtenerModelosAsync();
                return Ok(modelos);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error al obtener los modelos", error = ex.Message });
            }
        }

        [HttpGet("modelos/{marca}")]
        public async Task<IActionResult> GetModelosPorMarca(string marca)
        {
            try
            {
                var marcas = await _celularesService.ObtenerModelosPorMarcaAsync(marca);
                return Ok(marcas);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error al obtener los modelos por marca", error = ex.Message });
            }

        }

        [HttpGet("info/{marca}/{modelo}")]
        public async Task<IActionResult> GetModulosByModelo(string marca, string modelo)
        {
            try
            {
                var info = await _celularesService.ObtenerInfoPorMarcaYModeloAsync(marca, modelo);
                if (info == null || !info.Any())
                {
                    return NotFound(new { message = "No se encontraron resultados para la marca y modelo especificados." });
                }
                return Ok(info);
            }
            catch
            {
                return BadRequest(new { message = "Error al obtener la información por marca y modelo." });
            }
        }
        
    }
}
