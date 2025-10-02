using AutoMapper;
using OrigamiBack.Data;
using OrigamiBack.Data.Dtos;
using OrigamiBack.Data.Modelos;
using OrigamiBack.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace OrigamiBack.Services
{
    public class MarcasService : IMarcaService
    {
        private readonly IMapper _mapper;
        private readonly ApplicationDbContext _dbContext;

        public MarcasService(IMapper mapper, ApplicationDbContext applicationDbContext)
        {
            _dbContext = applicationDbContext;
            _mapper = mapper;
        }

        public async Task<MarcaDto> AddMarcaAsync(MarcaDto marcaDto)
        {
            var marca = _mapper.Map<Marcas>(marcaDto);
            await _dbContext.Marcas.AddAsync(marca);
            await _dbContext.SaveChangesAsync();
            return _mapper.Map<MarcaDto>(marca);
        }

        public Task<CategoriaDto> AddMarcaAsync(CategoriaDto categoriaDto)
        {
            throw new NotImplementedException();
        }

        public async Task DeleteMarcaAsync(int id)
        {
            var marca = await _dbContext.Marcas.FindAsync(id);
            if (marca != null)
            {
                _dbContext.Marcas.Remove(marca);
                await _dbContext.SaveChangesAsync();
            }
            else
            {
                throw new KeyNotFoundException($"Categoria with id {id} not found.");
            }
        }

        public async Task<IEnumerable<MarcaDto>> GetAllMarcasAsync()
        {
            var cate = await _dbContext.Marcas.AsNoTracking().ToListAsync();
            return _mapper.Map<List<MarcaDto>>(cate);
        }

        public async Task<MarcaDto> GetMarcaByIdAsync(int id)
        {
            var cate = await _dbContext.Marcas.FirstOrDefaultAsync(c => c.Id == id);

            if (cate == null) return null;

            return new MarcaDto
            {
                Id = cate.Id,
                Nombre = cate.Nombre
            };

        }


        public async Task UpdateMarcaAsync(MarcaDto marcaDto)
        {
            var marcas = await _dbContext.Marcas.FirstOrDefaultAsync(c => c.Id == marcaDto.Id);

            if (marcas != null)
            {
                marcas.Nombre = marcaDto.Nombre;
                _dbContext.Marcas.Update(marcas);
                await _dbContext.SaveChangesAsync();

            }

        }

   
    }
}
