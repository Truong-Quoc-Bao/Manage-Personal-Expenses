using Microsoft.AspNetCore.Identity;
using AuthService.Core.DTOs;
using AuthService.Core.Entities;

namespace AuthService.Core.Interfaces
{
    public interface IAuthRepository
    {
        Task<IdentityResult> RegisterUserAsync(ApplicationUser user, string password);
        Task<IdentityResult> AddToRoleAsync(ApplicationUser user, string role);
        Task<IdentityResult> UpdateStatusUserAsync(ApplicationUser user);
        Task<ApplicationUser?> FindByIdUserAsync(string userId);
        Task<ApplicationUser?> FindByEmailUserAsync(string email);
        // Task<SignInResult> LoginUserAsync(LoginRequestDto loginRequest);
    }
}