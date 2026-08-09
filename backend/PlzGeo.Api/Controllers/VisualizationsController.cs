using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PlzGeo.Api.Dtos;
using PlzGeo.Api.Models;
using PlzGeo.Api.Services.Interfaces;

namespace PlzGeo.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VisualizationsController : ControllerBase
    {
        private readonly IVisualizationService _visualizationService;

        public VisualizationsController(
            IVisualizationService visualizationService)
        {
            _visualizationService = visualizationService;
        }

        [HttpGet]
        public async Task<ActionResult<List<VisualizationSummaryDto>>> Get()
        {
            // Temporäre Test-UserId
            var userId = Guid.Parse("c369438e-5935-4273-8080-6ae7b4b61301");

            var visualizations =
                await _visualizationService.GetVisualizationsAsync(userId);

            return Ok(visualizations);
        }

    }
}
