using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PlzGeo.Api.Dtos;
using PlzGeo.Api.Models;
using PlzGeo.Api.Services.Interfaces;
using System.Security.Claims;

namespace PlzGeo.Api.Controllers
{
    [Route("api/visualizations")]
    [ApiController]
    [Authorize]
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
        public async Task<ActionResult<List<VisualizationInfoDto>>> GetVisualizationInfos()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userIdClaim is null)
            {
                return Unauthorized();
            }

            var userId = Guid.Parse(userIdClaim);

            var visualizations =
                await _visualizationService.GetVisualizations(userId);

            return Ok(visualizations);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<VisualizationDto>> GetVisualization(Guid id)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userIdClaim is null)
            {
                return Unauthorized();
            }

            var userId = Guid.Parse(userIdClaim);

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
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userIdClaim is null)
            {
                return Unauthorized();
            }

            var userId = Guid.Parse(userIdClaim);

            var visualizationInfo = await _visualizationService.CreateHeatmapVisualization(userId, createDto);

            return Ok(visualizationInfo);
        }

        [HttpPost("group")]
        public async Task<ActionResult<VisualizationInfoDto>> UploadGroupVisualization([FromBody] CreateGroupVisualizationDto createDto)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userIdClaim is null)
            {
                return Unauthorized();
            }

            var userId = Guid.Parse(userIdClaim);

            var visualizationInfo = await _visualizationService.CreateGroupVisualization(userId, createDto);

            return Ok(visualizationInfo);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVisualization(Guid id)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userIdClaim is null)
            {
                return Unauthorized();
            }

            var userId = Guid.Parse(userIdClaim);

            await _visualizationService.DeleteVisualization(userId, id);

            return new NoContentResult();
        }

    }
}
