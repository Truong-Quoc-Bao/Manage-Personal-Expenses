using AuthService.Core.Interfaces;
using AuthService.Core.DTOs;
using AuthService.Core.Entities;
using Microsoft.AspNetCore.Identity;


namespace AuthService.Application.Services 
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepository;
        private readonly IRabbitMQPublisher _rabbitMQPublisher;
        
        public AuthService(IAuthRepository authRepository, IRabbitMQPublisher rabbitMQPublisher)
        {
            _authRepository = authRepository;
            _rabbitMQPublisher = rabbitMQPublisher;
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
                result = await _authRepository.AddToRoleAsync(user, "User");
                if(result.Succeeded)
                {
                    var userCreatedEvent = new UserRegistrationPublishEvent
                    {
                        userId = user.Id,
                        userName = registerRequest.user_name,
                        email = user.Email,
                        createdAt = DateTime.UtcNow
                    };
                    await _rabbitMQPublisher.PublishAsync(userCreatedEvent, "user.user_create");
                }

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
    }
}