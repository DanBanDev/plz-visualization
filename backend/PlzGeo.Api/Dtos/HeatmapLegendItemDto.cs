namespace PlzGeo.Api.Dtos
{
    public class HeatmapLegendItemDto
    {
        public decimal FromValue { get; set; }

        public decimal ToValue { get; set; }

        public string Color { get; set; } = null!;
    }
}
