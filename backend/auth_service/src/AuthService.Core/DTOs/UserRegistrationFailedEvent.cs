using System.ComponentModel.DataAnnotations;

namespace AuthService.Core.DTOs
{
    public class UserRegistrationFailedEvent
    {
        [Required]
        public string UserId { get; set; }
        public string Reason { get; set; }
    }
}