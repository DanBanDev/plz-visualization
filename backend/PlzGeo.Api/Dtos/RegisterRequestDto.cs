namespace PlzGeo.Api.Dtos
{
    public class RegisterRequestDto
    {
        public string Email { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
}
