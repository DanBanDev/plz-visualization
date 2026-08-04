using System;
using System.Collections.Generic;

namespace PlzGeo.Api.Models;

public partial class PostalArea
{
    public int Id { get; set; }

    public string PostalCode { get; set; } = null!;

    public virtual ICollection<VisualizationValue> VisualizationValues { get; set; } = new List<VisualizationValue>();
}
