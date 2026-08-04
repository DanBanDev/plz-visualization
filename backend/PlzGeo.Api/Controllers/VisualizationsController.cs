using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PlzGeo.Api.Models;

namespace PlzGeo.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VisualizationsController : ControllerBase
    {
        [HttpGet]
        public ActionResult<IEnumerable<VisualizationSummary>> Get()
        {
            return Ok(new[]
            {
            new VisualizationSummary
            {
                Id = Guid.NewGuid(),
                Name = "Einwohnerdichte",
                Type = "Heatmap"
            },
            new VisualizationSummary
            {
                Id = Guid.NewGuid(),
                Name = "Vertriebsregionen",
                Type = "Group"
            }
        });
        }

    }
}
