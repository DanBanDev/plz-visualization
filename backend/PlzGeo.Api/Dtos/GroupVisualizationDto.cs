namespace PlzGeo.Api.Dtos
{
    public class GroupVisualizationDto : VisualizationDto
    {
        public List<GroupLegendItemDto> Legend { get; set; } = [];
    }
}
