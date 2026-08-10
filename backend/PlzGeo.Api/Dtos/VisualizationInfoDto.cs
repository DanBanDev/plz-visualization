using PlzGeo.Api.Models;

namespace PlzGeo.Api.Dtos
{
    public class VisualizationInfoDto
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public VisualizationType Type { get; set; } = VisualizationType.Group;
    }
}
