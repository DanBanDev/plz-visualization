using System;
using System.Collections.Generic;
using NetTopologySuite.Geometries;

namespace PlzGeo.Api.Models;

public partial class Plz5De
{
    public int OgcFid { get; set; }

    public MultiPolygon? WkbGeometry { get; set; }

    public decimal? Fid { get; set; }

    public double? OsmId { get; set; }

    public string? Boundary { get; set; }

    public string? AdminLeve { get; set; }

    public string? Type { get; set; }

    public string? BorderTyp { get; set; }

    public string? Plz { get; set; }

    public int? PostalAreaId { get; set; }

    public virtual PostalArea? PostalArea { get; set; }
}
