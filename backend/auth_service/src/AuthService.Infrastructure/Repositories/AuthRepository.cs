using AuthService.Core.Interfaces;
using Microsoft.AspNetCore.Identity;
using AuthService.Core.Entities;

namespace AuthService.Infrastructure.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public async Task<IdentityResult> RegisterUserAsync(ApplicationUser user, string password)
        {
            return await _userManager.CreateAsync(user, password);
        }

        public async Task<IdentityResult> AddToRoleAsync(ApplicationUser user, string role)
        {
            return await _userManager.AddToRoleAsync(user, role);
        }


        public async Task<ApplicationUser?> FindByIdUserAsync(string userId)
        {
            var existingUser = await _userManager.FindByIdAsync(userId);    
            return existingUser;
        }

        public async Task<ApplicationUser?> FindByEmailUserAsync(string email)
        {
            var existingUser = await _userManager.FindByEmailAsync(email);    
            return existingUser;
        }

        public async Task<IdentityResult> UpdateStatusUserAsync(ApplicationUser user)
        {

            return await _userManager.UpdateAsync(existingUser);
        }
    }
}