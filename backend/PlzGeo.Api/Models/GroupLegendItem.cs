using System;
using System.Collections.Generic;

namespace PlzGeo.Api.Models;

public partial class GroupLegendItem
{
    public Guid Id { get; set; }

    public Guid VisualizationId { get; set; }

    public int Value { get; set; }

    public string Name { get; set; } = null!;

    public string Color { get; set; } = null!;

    public virtual Visualization Visualization { get; set; } = null!;
}
