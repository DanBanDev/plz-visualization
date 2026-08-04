using System;
using System.Collections.Generic;

namespace PlzGeo.Api.Models;

public partial class User
{
    public Guid Id { get; set; }

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<Visualization> Visualizations { get; set; } = new List<Visualization>();
}
