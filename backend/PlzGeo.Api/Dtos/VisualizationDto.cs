namespace PlzGeo.Api.Dtos
{
    public abstract class VisualizationDto : VisualizationInfoDto
    {
        public List<VisualizationValueDto> Values { get; set; } = [];
    }
}
