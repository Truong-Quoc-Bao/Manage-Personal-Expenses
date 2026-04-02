using System.ComponentModel.DataAnnotations;

namespace AuthService.Core.DTOs
{
    public class RegisterRequestDto
    {
        [Required]
        [DataType(DataType.EmailAddress)]
        public string email { get; set; }

        [Required]
        [DataType(DataType.Password)]
        [MinLength(6)]
        public string password { get; set; }
    }
}