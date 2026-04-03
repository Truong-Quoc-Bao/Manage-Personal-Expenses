using AuthService.Core.DTOs;
using Microsoft.AspNetCore.Identity;


namespace AuthService.Core.Interfaces
{
    public interface IAuthService
    {
        Task<IdentityResult> RegisterUserAsync(RegisterRequestDto registerRequest);
        Task<LoginResponseDto> LoginUserAsync(LoginRequestDto loginRequest);
        Task<IdentityResult> UpdateStatusUserAsync(UserRegistrationConsumeEvent userRegistrationFailedEvent);
    }
}