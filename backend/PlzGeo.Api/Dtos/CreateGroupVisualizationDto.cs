namespace PlzGeo.Api.Dtos
{
    public class CreateGroupVisualizationDto : CreateVisualizationDto
    {
        public List<GroupLegendItemDto> Legend { get; set; } = [];
    }
}
