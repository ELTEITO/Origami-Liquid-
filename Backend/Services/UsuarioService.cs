using OrigamiBack.Data;
using OrigamiBack.Data.Modelos;
using OrigamiBack.Services.Interface;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using Microsoft.Extensions.Logging;

namespace OrigamiBack.Services
{
    public class UsuarioService : IUsuarioService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;
        private readonly ILogger<UsuarioService> _logger;

        public UsuarioService(
            ApplicationDbContext applicationDbContext, 
            IConfiguration configuration,
            ILogger<UsuarioService> logger)
        {
            _context = applicationDbContext;
            _config = configuration;
            _logger = logger;
        }

        public async Task<Usuario?> ValidarCredencialesAsync(string email, string password)
        {
            try
            {
                if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
                {
                    _logger.LogWarning("Intento de login con email o password vacío");
                    return null;
                }

                email = email.ToLower().Trim();
                _logger.LogInformation($"Intentando login para email: {email}");

                var usuario = await _context.Usuarios
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == email);

                if (usuario == null)
                {
                    _logger.LogWarning($"Usuario no encontrado para email: {email}");
                    return null;
                }

                _logger.LogInformation($"Usuario encontrado. Verificando contraseña...");

                try
                {
                    bool claveOk = BCrypt.Net.BCrypt.Verify(password, usuario.ClaveHash);
                    
                    if (!claveOk)
                    {
                        _logger.LogWarning($"Contraseña incorrecta para usuario: {email}");
                        return null;
                    }

                    _logger.LogInformation($"Login exitoso para usuario: {email}");
                    return usuario;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error al verificar la contraseña");
                    return null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al validar credenciales para email: {email}");
                return null;
            }
        }

        public string GenerarToken(Usuario usuario)
        {
            try
            {
                var secretKey = _config["JWTKey:Secret"] ?? 
                    throw new InvalidOperationException("JWT Secret no configurado");
                
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
                var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var claims = new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
                    new Claim(ClaimTypes.Email, usuario.Email),
                    new Claim(ClaimTypes.Role, usuario.Rol ?? "USER")
                };

                var token = new JwtSecurityToken(
                    issuer: _config["JWTKey:ValidIssuer"],
                    audience: _config["JWTKey:ValidAudience"],
                    claims: claims,
                    expires: DateTime.Now.AddHours(1),
                    signingCredentials: credentials
                );

                return new JwtSecurityTokenHandler().WriteToken(token);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar token JWT");
                throw;
            }
        }

        public async Task<Usuario?> ObtenerUsuarioPorEmailAsync(string email)
        {
            try
            {
                return await _context.Usuarios
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al buscar usuario por email: {email}");
                throw;
            }
        }

        public async Task<Usuario> CrearUsuarioAsync(Usuario usuario)
        {
            try
            {
                if (string.IsNullOrEmpty(usuario.Email) || string.IsNullOrEmpty(usuario.ClaveHash))
                {
                    throw new ArgumentException("Email y contraseña son requeridos");
                }

                if (await ObtenerUsuarioPorEmailAsync(usuario.Email) != null)
                {
                    throw new InvalidOperationException("El email ya está registrado");
                }

                usuario.Email = usuario.Email.ToLower().Trim();
                usuario.ClaveHash = BCrypt.Net.BCrypt.HashPassword(usuario.ClaveHash);
                usuario.Rol ??= "USER";

                _logger.LogInformation($"Creando usuario: {usuario.Email}");

                _context.Usuarios.Add(usuario);
                await _context.SaveChangesAsync();

                return usuario;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al crear usuario: {usuario.Email}");
                throw;
            }
        }

        public async Task ActualizarProductoAsync(Productos producto, int id)
        {
            var modelo = await _context.Productos.FindAsync(id);
            if (modelo != null)
            {
                modelo.Marca = producto.Marca;
                modelo.Modelo = producto.Modelo;
                modelo.Categoria = producto.Categoria;
                modelo.Img = producto.Img;
                _context.Productos.Update(modelo);
                await _context.SaveChangesAsync();
            }
            else
            {
                throw new KeyNotFoundException("Producto no encontrado.");
            }
        }

        public Task EliminarProducto(int id)
        {
            throw new NotImplementedException();
        }

        public Task<Productos> ObtenerByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<List<Productos>> ObtenerTodosProductosAsync()
        {
            throw new NotImplementedException();
        }

        public Task CrearVarianteAsync(ProductosVariantes productosVariantes)
        {
            throw new NotImplementedException();
        }

        public Task ActualizarVarianteAsync(ProductosVariantes productosVariantes, int id)
        {
            throw new NotImplementedException();
        }

        public Task EliminarVarianteProducto(int id)
        {
            throw new NotImplementedException();
        }

        public Task<ProductosVariantes> ObtenerVarianteByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<List<ProductosVariantes>> ObtenerVariantePorModeloAsync(int idproducto)
        {
            throw new NotImplementedException();
        }

        public Task<List<ProductosVariantes>> ObtenerAllVariantesAsync()
        {
            throw new NotImplementedException();
        }
    }
}

