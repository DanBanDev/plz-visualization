using System;
using System.Collections.Generic;

namespace PlzGeo.Api.Models;

public partial class VisualizationValue
{
    public Guid Id { get; set; }

    public Guid VisualizationId { get; set; }

    public int PostalAreaId { get; set; }

    public decimal Value { get; set; }

    public virtual PostalArea PostalArea { get; set; } = null!;

    public virtual Visualization Visualization { get; set; } = null!;
}
