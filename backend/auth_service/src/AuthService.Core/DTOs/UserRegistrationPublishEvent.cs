namespace AuthService.Core.DTOs
{
    public class UserRegistrationPublishEvent
    {
        public string userId { get; set; }
        public string userName { get; set; }
        public string email { get; set; }
        public DateTime createdAt { get; set; }
    }
}

