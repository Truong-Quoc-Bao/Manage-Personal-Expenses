using System.ComponentModel.DataAnnotations;

namespace AuthService.Core.DTOs
{
    public class UserRegistrationEvent
    {
        [Required]
        public string UserId { get; set; }
        public string Reason { get; set; }
        public string Status { get; set; }
    }
}