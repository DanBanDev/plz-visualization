using System;
using System.Collections.Generic;

namespace PlzGeo.Api.Models;

public partial class HeatmapLegendItem
{
    public Guid Id { get; set; }

    public Guid VisualizationId { get; set; }

    public decimal FromValue { get; set; }

    public decimal ToValue { get; set; }

    public string Color { get; set; } = null!;

    public virtual Visualization Visualization { get; set; } = null!;
}
