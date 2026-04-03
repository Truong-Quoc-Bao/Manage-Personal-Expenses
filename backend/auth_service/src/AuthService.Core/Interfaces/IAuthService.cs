using AuthService.Core.DTOs;
using Microsoft.AspNetCore.Identity;


namespace AuthService.Core.Interfaces
{
    public interface IAuthService
    {
        Task<IdentityResult> RegisterUserAsync(RegisterRequestDto registerRequest);
        Task<IdentityResult> UpdateStatusUserAsync(UserRegistrationConsumeEvent userRegistrationFailedEvent);
    }
}