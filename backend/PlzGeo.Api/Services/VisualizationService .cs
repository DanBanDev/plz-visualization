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

        private Visualization CreateVisualization(
            Guid userId,
            string name,
            VisualizationType type)
        {
            var visualization = new Visualization
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Name = name,
                Type = type.ToString()
            };

            _context.Visualizations.Add(visualization);

            return visualization;
        }

        private async Task AddVisualizationValues(
                Guid visualizationId,
                List<VisualizationValueDto> values)
        {
            var postalCodes = values
                .Select(v => v.PostalCode)
                .Distinct()
                .ToList();

            var postalAreas = await _context.PostalAreas
                .Where(pa => postalCodes.Contains(pa.PostalCode))
                .ToDictionaryAsync(pa => pa.PostalCode);

            foreach (var value in values)
            {
                if (!postalAreas.TryGetValue(value.PostalCode, out var postalArea))
                {
                    throw new ArgumentException(
                        $"Postal code '{value.PostalCode}' does not exist.");
                }

                _context.VisualizationValues.Add(
                    new VisualizationValue
                    {
                        VisualizationId = visualizationId,
                        PostalAreaId = postalArea.Id,
                        Value = value.Value
                    });
            }
        }


        public async Task<VisualizationDto> GetVisualizationById(Guid userId, Guid id)
        {
            var visualizationInfo = await _context.Visualizations
                .Where(v => v.UserId == userId && v.Id == id)
                .ProjectTo<VisualizationInfoDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync();

            if (visualizationInfo == null)
            {
                throw new KeyNotFoundException("Visualization not found");
            }

            var visualizationValues = await _context.VisualizationValues
                .Where(vv => vv.VisualizationId == id)
                .ProjectTo<VisualizationValueDto>(_mapper.ConfigurationProvider)
                .ToListAsync();

            if (visualizationInfo.Type == VisualizationType.Group)
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


        public async Task<VisualizationInfoDto> CreateHeatmapVisualization(Guid userId, CreateHeatmapVisualizationDto createDto)
        {
            var visualization = CreateVisualization(
                userId,
                createDto.Name,
                VisualizationType.Heatmap);

            await AddVisualizationValues(
                visualization.Id,
                createDto.Values);

            foreach (var item in createDto.Legend)
            {
                var legendItem = new HeatmapLegendItem
                {
                    Id = Guid.NewGuid(),
                    VisualizationId = visualization.Id,
                    Color = item.Color,
                    FromValue = item.FromValue,
                    ToValue = item.ToValue
                };
                _context.HeatmapLegendItems.Add(legendItem);
            }

            await _context.SaveChangesAsync();

            return _mapper.Map<VisualizationInfoDto>(visualization);
        }


        public async Task<VisualizationInfoDto> CreateGroupVisualization(Guid userId, CreateGroupVisualizationDto createDto)
        {
            var visualization = CreateVisualization(
                userId,
                createDto.Name,
                VisualizationType.Group);

            await AddVisualizationValues(
                visualization.Id,
                createDto.Values);
            foreach (var item in createDto.Legend)
            {
                var legendItem = new GroupLegendItem
                {
                    Id = Guid.NewGuid(),
                    VisualizationId = visualization.Id,
                    Color = item.Color,
                    Name = item.Name
                };
                _context.GroupLegendItems.Add(legendItem);
            }
            await _context.SaveChangesAsync();

            return _mapper.Map<VisualizationInfoDto>(visualization);
        }

    }
}
