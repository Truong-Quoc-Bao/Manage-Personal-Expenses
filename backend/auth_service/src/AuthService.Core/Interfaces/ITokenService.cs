using Microsoft.AspNetCore.Identity;
using AuthService.Core.Entities;

namespace AuthService.Core.Interfaces
{
    public interface ITokenService
    {
        string GenerateToken(ApplicationUser user);
    }
}