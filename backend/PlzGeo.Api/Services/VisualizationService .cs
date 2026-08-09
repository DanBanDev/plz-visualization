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

        public async Task<List<VisualizationSummaryDto>> GetVisualizationsAsync(Guid userId)
        {
            return await _context.Visualizations
                .Where(v => v.UserId == userId)
                .OrderBy(v => v.Name)
                .ProjectTo<VisualizationSummaryDto>(_mapper.ConfigurationProvider)
                .ToListAsync();
        }
    }
}
