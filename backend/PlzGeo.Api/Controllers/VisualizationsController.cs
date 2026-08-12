using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PlzGeo.Api.Dtos;
using PlzGeo.Api.Models;
using PlzGeo.Api.Services.Interfaces;

namespace PlzGeo.Api.Controllers
{
    [Route("api/visualizations")]
    [ApiController]
    public class VisualizationsController : ControllerBase
    {
        private readonly IVisualizationService _visualizationService;
        private readonly IMapper _mapper;

        public VisualizationsController(
            IVisualizationService visualizationService,
            IMapper mapper)
        {
            _visualizationService = visualizationService;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<List<VisualizationInfoDto>>> Get()
        {
            // Temporäre Test-UserId
            var userId = Guid.Parse("c369438e-5935-4273-8080-6ae7b4b61301");

            var visualizations =
                await _visualizationService.GetVisualizations(userId);

            return Ok(visualizations);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<VisualizationDto>> GetVisualization(Guid id)
        {
            // Temporäre Test-UserId
            var userId = Guid.Parse("c369438e-5935-4273-8080-6ae7b4b61301");

            var visualization = await _visualizationService.GetVisualizationById(userId, id);

            if (visualization == null)
            {
                return NotFound();
            }

            if (visualization.Type == VisualizationType.Group)
            {
                var groupMapdto = _mapper.Map<GroupVisualizationDto>(visualization);

                return Ok(groupMapdto);
            }

            var heatmapDto = _mapper.Map<HeatmapVisualizationDto>(visualization);

            return Ok(heatmapDto);
        }

        [HttpPost("heatmap")]
        public async Task<ActionResult<VisualizationInfoDto>> UploadHeatmapVisualization([FromBody] CreateHeatmapVisualizationDto createDto)
        {
            // Temporäre Test-UserId
            var userId = Guid.Parse("c369438e-5935-4273-8080-6ae7b4b61301");

            var visualizationInfo = await _visualizationService.CreateHeatmapVisualization(userId, createDto);

            return Ok(visualizationInfo);
        }

        [HttpPost("group")]
        public async Task<ActionResult<VisualizationInfoDto>> UploadGroupVisualization([FromBody] CreateGroupVisualizationDto createDto)
        {
            // Temporäre Test-UserId
            var userId = Guid.Parse("c369438e-5935-4273-8080-6ae7b4b61301");

            var visualizationInfo = await _visualizationService.CreateGroupVisualization(userId, createDto);

            return Ok(visualizationInfo);
        }

    }
}
