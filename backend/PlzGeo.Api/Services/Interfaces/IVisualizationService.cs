using PlzGeo.Api.Dtos;

namespace PlzGeo.Api.Services.Interfaces
{
    public interface IVisualizationService
    {
        Task<List<VisualizationSummaryDto>> GetVisualizationsAsync(Guid userId);
    }
}
