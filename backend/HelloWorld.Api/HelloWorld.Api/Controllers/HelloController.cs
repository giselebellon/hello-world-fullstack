using Microsoft.AspNetCore.Mvc;

namespace HelloWorld.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HelloController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            message = "Hello World from .NET Core API!"
        });
    }
}