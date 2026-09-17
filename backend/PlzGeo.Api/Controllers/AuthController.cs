using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using PlzGeo.Api.Dtos;
using PlzGeo.Api.Models;
using PlzGeo.Api.Services.Interfaces;
using System.Security.Claims;

namespace PlzGeo.Api.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IJwtTokenService _jwtTokenService;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            IJwtTokenService jwtTokenService)
        {
            _userManager = userManager;
            _jwtTokenService = jwtTokenService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid request"
                });
            }

            var userExists = await _userManager.FindByEmailAsync(request.Email);
            if (userExists != null)
            {
                return BadRequest(new AuthResponseDto
                {
                    Success = false,
                    Message = "User with this email already exists"
                });
            }

            var user = new ApplicationUser
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                UserName = request.UserName,
                SecurityStamp = Guid.NewGuid().ToString()
            };

            var result = await _userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return BadRequest(new AuthResponseDto
                {
                    Success = false,
                    Message = $"Registration failed: {errors}"
                });
            }

            var token = _jwtTokenService.GenerateToken(user);
            AppendToken(token);

            return Ok(new AuthResponseDto
            {
                Success = true,
                Message = "Registration successful",
                User = new UserInfoDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    UserName = user.UserName
                }
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid request"
                });
            }

            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                return Unauthorized(new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid email or password"
                });
            }

            var passwordValid = await _userManager.CheckPasswordAsync(user, request.Password);
            if (!passwordValid)
            {
                return Unauthorized(new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid email or password"
                });
            }

            var token = _jwtTokenService.GenerateToken(user);
            AppendToken(token);

            return Ok(new AuthResponseDto
            {
                Success = true,
                Message = "Login successful",
                User = new UserInfoDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    UserName = user.UserName
                }
            });
        }

        [Authorize]
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("jwt_token");
            return Ok(new { message = "Logout successful" });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new AuthResponseDto
                {
                    Success = false,
                    Message = "User not found"
                });
            }

            var userId = Guid.Parse(userIdClaim);
            var user = await _userManager.FindByIdAsync(userId.ToString());

            if (user == null)
            {
                return NotFound(new AuthResponseDto
                {
                    Success = false,
                    Message = "User not found"
                });
            }

            return Ok(new AuthResponseDto
            {
                Success = true,
                User = new UserInfoDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    UserName = user.UserName
                }
            });
        }

        [HttpGet("test")]
        [Authorize]
        public IActionResult Test()
        {
            return Ok(new { message = "Authorization works!" });
        }

        private void AppendToken(string token)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.AddMinutes(60)
            };

            Response.Cookies.Append("jwt_token", token, cookieOptions);
        }
    }
}
