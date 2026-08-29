using Microsoft.AspNetCore.Identity;

namespace PlzGeo.Api.Models
{
    public class ApplicationUser : IdentityUser<Guid>
    {       
        public virtual ICollection<Visualization> Visualizations { get; set; } = new List<Visualization>();
    }
}
