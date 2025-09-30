using OrigamiBack.Data.Modelos;
using OrigamiBack.Data.Vistas;
using Microsoft.EntityFrameworkCore;

namespace OrigamiBack.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
             : base(options) { }

        public DbSet<Celular> Celulares { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Productos> Productos { get; set; }
        public DbSet<Categorias> Categorias { get; set; }
        public DbSet<ProductosVariantes> ProductosVariantes { get; set; }

        /// VISTAS

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            modelBuilder.Entity<Usuario>()
                .ToTable("usuarios")
                .HasKey(x => x.Id);

            modelBuilder.Entity<Celular>()
                .ToTable("celulares")
                .HasKey(e => e.id);

          modelBuilder.Entity<Categorias>()
                .ToTable("categorias")
                .HasKey(p => p.Id);

            modelBuilder.Entity<Productos>()
                .ToTable("productos")
                .HasKey(p => p.Id);

            modelBuilder.Entity<Productos>()
                .HasMany(p => p.Variantes)
                .WithOne(v => v.Producto)
                .HasForeignKey(v => v.ProductoId)
                .OnDelete(DeleteBehavior.Cascade);


            modelBuilder.Entity<ProductosVariantes>()
                .ToTable("productos_variantes")
                .HasKey(v => v.Id);
        
          
        }
    }
}
