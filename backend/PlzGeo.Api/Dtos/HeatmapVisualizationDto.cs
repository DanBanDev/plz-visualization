namespace PlzGeo.Api.Dtos
{
    public class HeatmapVisualizationDto : VisualizationDto
    {
        public List<HeatmapLegendItemDto> Legend { get; set; } = [];
    }
}
