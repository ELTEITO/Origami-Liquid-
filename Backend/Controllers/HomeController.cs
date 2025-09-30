using OrigamiBack.Data;
using OrigamiBack.Data.Modelos;
using OrigamiBack.Data.Vistas;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace OrigamiBack.Controllers
{
    public class HomeController : Controller
    {
        private readonly ApplicationDbContext _context;

        public HomeController(ApplicationDbContext applicationDb)
        {
            _context = applicationDb;
        }

        public IActionResult Index()
        {
            var Marcas = _context.Celulares.Select(c => c.marca).Where(m => !string.IsNullOrEmpty(m)).Distinct().ToList();
            ViewBag.marca = Marcas;
            var viewModel = new PresupuestoConsultaViewModel();
            return View(viewModel);
        }

        

        // Nueva acción para mostrar el resumen desde sesión
        [HttpGet]
        public IActionResult Resumen()
        {
            var jsonString = HttpContext.Session.GetString("Presupuesto");
            if (string.IsNullOrEmpty(jsonString))
            {
                return RedirectToAction("Index");
            }

            var modelo = JsonSerializer.Deserialize<PresupuestoConsultaViewModel>(jsonString);
            if (modelo == null)
            {
                return RedirectToAction("Index");
            }

            return View(modelo);
        }

        [HttpGet]
        public JsonResult ObtenerModelos(string Marca)
        {
            var modelos = _context.Celulares
                .Where(c => c.marca == Marca)
                .Select(c => c.modelo)
                .Where(m => !string.IsNullOrEmpty(m))
                .Distinct()
                .ToList();

            return Json(modelos);
        }
    }
}
