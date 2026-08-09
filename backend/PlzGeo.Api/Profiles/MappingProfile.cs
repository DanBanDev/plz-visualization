
using AutoMapper;
using PlzGeo.Api.Dtos;
using PlzGeo.Api.Models;

namespace PlzGeo.Api.Profiles
{
    public class MappingProfile: Profile
    {
        public MappingProfile()
        {
            // Beispiel: Mapping von Source auf Destination (und umgekehrt mit ReverseMap)
            // CreateMap<SourceModel, DestinationDto>().ReverseMap();
            CreateMap<Visualization, VisualizationSummaryDto>();
        }
}
}
