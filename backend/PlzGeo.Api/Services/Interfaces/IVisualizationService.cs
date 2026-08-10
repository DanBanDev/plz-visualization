using PlzGeo.Api.Dtos;

namespace PlzGeo.Api.Services.Interfaces
{
    public interface IVisualizationService
    {
        Task<List<VisualizationInfoDto>> GetVisualizations(Guid userId);
        Task<VisualizationDto?> GetVisualizationById(Guid userId, Guid id);
    }
}
