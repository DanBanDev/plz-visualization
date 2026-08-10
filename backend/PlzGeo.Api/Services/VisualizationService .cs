using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using PlzGeo.Api.Dtos;
using PlzGeo.Api.Models;
using PlzGeo.Api.Services.Interfaces;

namespace PlzGeo.Api.Services
{
    public class VisualizationService : IVisualizationService
    {
        private readonly PlzGisContext _context;
        private readonly IMapper _mapper;

        public VisualizationService(PlzGisContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<VisualizationInfoDto>> GetVisualizations(Guid userId)
        {
            return await _context.Visualizations
                .Where(v => v.UserId == userId)
                .OrderBy(v => v.Name)
                .ProjectTo<VisualizationInfoDto>(_mapper.ConfigurationProvider)
                .ToListAsync();
        }


        public async Task<VisualizationDto> GetVisualizationById(Guid userId, Guid id)
        {
            var visualizationInfo = await _context.Visualizations
                .Where(v => v.UserId == userId && v.Id == id)
                .ProjectTo<VisualizationInfoDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync();
             

            var visualizationValues = await _context.VisualizationValues
                .Where(vv => vv.VisualizationId == id)
                .ProjectTo<VisualizationValueDto>(_mapper.ConfigurationProvider)
                .ToListAsync();

            if(visualizationInfo.Type == VisualizationType.Group)
            {
               var groupLegendItems = await _context.GroupLegendItems
                    .Where(li => li.VisualizationId == id)
                    .ProjectTo<GroupLegendItemDto>(_mapper.ConfigurationProvider)
                    .ToListAsync();
                return new GroupVisualizationDto()
                {            
                        Id = visualizationInfo.Id,
                        Name = visualizationInfo.Name,
                        Type = visualizationInfo.Type,
                        Values = visualizationValues,
                        Legend = groupLegendItems
                    
                };
            }
            else
            {
                var heatmapLegendItems = await _context.HeatmapLegendItems
                 .Where(li => li.VisualizationId == id)
                 .ProjectTo<HeatmapLegendItemDto>(_mapper.ConfigurationProvider)
                 .ToListAsync();
                return new HeatmapVisualizationDto()
                {
                    Id = visualizationInfo.Id,
                    Name = visualizationInfo.Name,
                    Type = visualizationInfo.Type,
                    Values = visualizationValues,
                    Legend = heatmapLegendItems
                };
            }
        }
    }
}
