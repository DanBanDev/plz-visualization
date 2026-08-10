namespace PlzGeo.Api.Dtos
{
    public class CreateHeatmapVisualizationDto : CreateVisualizationDto
    {
        public List<HeatmapLegendItemDto> Legend { get; set; } = [];
    }
}
