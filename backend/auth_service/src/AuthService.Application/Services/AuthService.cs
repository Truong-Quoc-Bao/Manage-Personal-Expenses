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
                    var userCreatedEvent = new 
                    {
                        UserId = user.Id,
                        Email = user.Email,
                        Timestamp = DateTime.UtcNow
                    };
                    await _rabbitMQPublisher.PublishAsync(userCreatedEvent, "user.user_create");
                }

            }

            return result;
        }

        public async Task<IdentityResult> UpdateStatusUserAsync(UserRegistrationFailedEvent userRegistrationFailedEvent)
        {
            var user = new ApplicationUser
            {
                Id = userRegistrationFailedEvent.UserId,
                Status = UserStatus.Rejected,
            };

            return await _authRepository.UpdateStatusUserAsync(user);
        }
    }
}