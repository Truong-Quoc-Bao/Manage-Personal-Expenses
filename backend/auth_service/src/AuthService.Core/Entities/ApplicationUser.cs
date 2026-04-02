using Microsoft.AspNetCore.Identity;

namespace AuthService.Core.Entities
{
    public enum UserStatus
    {
        Pending,
        Active,
        Rejected
    }
    public class ApplicationUser : IdentityUser
    {
        public UserStatus Status { get; set; } = UserStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}