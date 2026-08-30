using PlzGeo.Api.Models;

namespace PlzGeo.Api.Services.Interfaces
{
    public interface IJwtTokenService
    {
        string GenerateToken(ApplicationUser user);
    }
}
