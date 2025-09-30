using OrigamiBack.Data.Modelos;

namespace OrigamiBack.Data.Vistas
{
    public class PresupuestoConsultaViewModel
    {
        public string Marca { get; set; } = string.Empty;
        public string Modelo { get; set; } = string.Empty;

        public decimal? ArregloBateria { get; set; }
        public decimal? ArregloPin { get; set; }

        public List<ModuloOpcionViewModel> ModuloOpciones { get; set; } = new();
        public bool TieneVariantesModulo => ModuloOpciones.Count > 1;

        public decimal? ArregloModuloSeleccionado { get; set; }


    }
}
