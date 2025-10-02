using AutoMapper;
using OrigamiBack.Data.Modelos;
using OrigamiBack.Data.Dtos;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Entidad -> DTO
        CreateMap<Productos, ProductoDto>().ReverseMap();
        CreateMap<ProductosVariantes, ProductosVariantesDto>().ReverseMap();
        // Agrega aquí todos los mapeos que necesites
        CreateMap<ProductoDto, Productos>()
            .ForMember(dest => dest.Img, opt => opt.MapFrom(src =>
                string.IsNullOrEmpty(src.Img) ? null : Convert.FromBase64String(src.Img)));

        CreateMap<Productos, ProductoDto>()
            .ForMember(dest => dest.Img, opt => opt.MapFrom(src =>
                src.Img != null ? Convert.ToBase64String(src.Img) : null));

        // Marcas <-> MarcaDto
        CreateMap<Marcas, MarcaDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Nombre, opt => opt.MapFrom(src => src.Nombre ?? string.Empty));
        CreateMap<MarcaDto, Marcas>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Nombre, opt => opt.MapFrom(src => src.Nombre));

        // Categorias <-> CategoriaDto
        CreateMap<Categorias, CategoriaDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Nombre, opt => opt.MapFrom(src => src.Nombre ?? string.Empty))
            .ForMember(dest => dest.Descripcion, opt => opt.MapFrom(src => src.Descripcion ?? string.Empty))
            .ForMember(dest => dest.Icon, opt => opt.MapFrom(src => src.Icon ?? string.Empty));
        CreateMap<CategoriaDto, Categorias>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Nombre, opt => opt.MapFrom(src => src.Nombre))
            .ForMember(dest => dest.Descripcion, opt => opt.MapFrom(src => src.Descripcion))
            .ForMember(dest => dest.Icon, opt => opt.MapFrom(src => src.Icon));

    }
}
