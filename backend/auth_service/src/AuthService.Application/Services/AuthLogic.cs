using AuthService.Core.Interfaces;
using AuthService.Core.DTOs;
using AuthService.Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

namespace AuthService.Application.Services 
{
    public class AuthLogic : IAuthService
    {
        private readonly IAuthRepository _authRepository;
        private readonly IRabbitMQPublisher _rabbitMQPublisher;
        private readonly ITokenService _tokenService;
        
        public AuthLogic(IAuthRepository authRepository, IRabbitMQPublisher rabbitMQPublisher, ITokenService tokenService)
        {
            _authRepository = authRepository;
            _rabbitMQPublisher = rabbitMQPublisher;
            _tokenService = tokenService;
        }

        public async Task<IdentityResult> RegisterUserAsync(RegisterRequestDto registerRequest)
        {
            var existingUser = await _authRepository.FindByEmailUserAsync(registerRequest.email);

            if (existingUser != null)
            {
                return IdentityResult.Failed(new IdentityError { Description = "Email already in use." });
            }

            var user = new ApplicationUser
            {
                UserName = registerRequest.email,
                Email = registerRequest.email,
                Status = UserStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            var result = await _authRepository.RegisterUserAsync(user, registerRequest.password);

            if(result.Succeeded)
            {
                var userCreatedEvent = new UserRegistrationPublishEvent
                {
                    userId = user.Id,
                    userName = registerRequest.user_name,
                    email = user.Email,
                    createdAt = DateTime.UtcNow
                };

                await _rabbitMQPublisher.PublishAsync(userCreatedEvent, "user.user_created");
            }

            return result;
        }

        public async Task<IdentityResult> UpdateStatusUserAsync(UserRegistrationConsumeEvent userRegistrationEvent)
        {
            var userFindByEmail = await _authRepository.FindByEmailUserAsync(userRegistrationEvent.Email);
            var userFindById = await _authRepository.FindByIdUserAsync(userRegistrationEvent.UserId);

            if (userFindByEmail == null && userFindById == null)
            {
                throw new KeyNotFoundException($"User existing not found.");
            }

            var user = userFindByEmail ?? userFindById;

            user.Status = userRegistrationEvent.Status switch
            {
                "Success" => UserStatus.Active,
                "Fail" => UserStatus.Rejected,
                _ => UserStatus.Pending
            };

            var result = await _authRepository.UpdateStatusUserAsync(user);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"Failed to update user status: {errors}");
            }

            return result;
        }

        public async Task<LoginResponseDto> LoginUserAsync(LoginRequestDto loginRequest)
        {
            var user = await _authRepository.FindByEmailUserAsync(loginRequest.email);

            if (user == null || user.Status != UserStatus.Active)
            {
                throw new UnauthorizedAccessException("Invalid email or password");
            }

            var passwordValid = await _authRepository.CheckPasswordAsync(user, loginRequest.password);

            if (!passwordValid)
            {
                throw new UnauthorizedAccessException("Invalid email or password");
            }

            var token = _tokenService.GenerateToken(user);

            return new LoginResponseDto { Token = token };
        }
    }
}