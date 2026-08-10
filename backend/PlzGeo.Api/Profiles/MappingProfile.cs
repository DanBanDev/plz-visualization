
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
            CreateMap<Visualization, VisualizationInfoDto>()
                .ForMember(dest => dest.Type,
                        opt => opt.MapFrom(src => Enum.Parse<VisualizationType>(src.Type)));

            CreateMap<Visualization, GroupVisualizationDto>();

            CreateMap<Visualization, HeatmapVisualizationDto>();

            CreateMap<VisualizationValue, VisualizationValueDto>()
                    .ForMember(
                        dest => dest.PostalCode,
                        opt => opt.MapFrom(src => src.PostalArea.PostalCode));

            CreateMap<GroupLegendItem, GroupLegendItemDto>();

            CreateMap<HeatmapLegendItem, HeatmapLegendItemDto>();
        }
}
}
