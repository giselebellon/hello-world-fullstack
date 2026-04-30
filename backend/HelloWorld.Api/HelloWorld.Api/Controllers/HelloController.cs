using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;

namespace HelloWorld.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HelloController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { message = "Hello World from .NET Core API!" });
    }

    [HttpPost("saudacao")]
    public IActionResult PostSaudacao([FromBody] NomeRequest request)
    {
        if (string.IsNullOrWhiteSpace(request?.Nome))
            return BadRequest(new { erro = "O nome é obrigatório." });

        var nome = request.Nome.Trim();

        if (nome.Length < 2)
            return BadRequest(new { erro = "O nome deve ter pelo menos 2 caracteres." });

        if (nome.Length > 50)
            return BadRequest(new { erro = "O nome deve ter no máximo 50 caracteres." });

        if (!Regex.IsMatch(nome, @"^[a-zA-ZÀ-ÿ\s'-]+$"))
            return BadRequest(new { erro = "O nome deve conter apenas letras." });

        return Ok(new { saudacao = $"Olá {nome}!" });
    }
}

public record NomeRequest(string Nome);