using System;
using System.Collections.Generic;

namespace PlzGeo.Api.Models;

public partial class Visualization
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string Name { get; set; } = null!;

    public string Type { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<GroupLegendItem> GroupLegendItems { get; set; } = new List<GroupLegendItem>();

    public virtual ICollection<HeatmapLegendItem> HeatmapLegendItems { get; set; } = new List<HeatmapLegendItem>();

    public virtual User User { get; set; } = null!;

    public virtual ICollection<VisualizationValue> VisualizationValues { get; set; } = new List<VisualizationValue>();
}
