using PlzGeo.Api.Models;

namespace PlzGeo.Api.Dtos
{
    public abstract class CreateVisualizationDto
    {
        public string Name { get; set; } = string.Empty;

        public VisualizationType Type { get; set; }

        public List<VisualizationValueDto> Values { get; set; } = [];
    }
}
