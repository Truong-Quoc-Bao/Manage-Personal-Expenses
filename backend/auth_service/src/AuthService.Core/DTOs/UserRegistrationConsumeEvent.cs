using System.ComponentModel.DataAnnotations;

namespace AuthService.Core.DTOs
{
    public class UserRegistrationConsumeEvent
    {
        [Required]
        public string UserId { get; set; }
        public string Email { get; set; }
        public string Reason { get; set; }
        public string Status { get; set; }
    }
}