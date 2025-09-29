using BranchManager.Api.Domain.Entities;
using BranchManager.Api.Infrastructure;
using BranchManager.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BranchManager.Api.Controllers;

[ApiController]
[Route("api/branches/{branchCode}/people")]
public class BranchPeopleController(BranchManagerDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BranchPersonDto>>> GetPeople(string branchCode, CancellationToken cancellationToken)
    {
        var people = await context.BranchPeople
            .AsNoTracking()
            .Where(p => p.BranchCode == branchCode)
            .Select(p => new BranchPersonDto(
                p.Id,
                p.BranchCode,
                p.Name,
                p.Email,
                p.AccountName,
                p.MakeCodeId,
                p.ProcessTypeId,
                p.PhotoUrl,
                p.IsActive))
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);

        return Ok(people);
    }

    [HttpPost]
    public async Task<ActionResult<BranchPersonDto>> CreatePerson(string branchCode, [FromBody] UpsertBranchPersonDto request, CancellationToken cancellationToken)
    {
        if (!string.Equals(branchCode, request.BranchCode, StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest("Şube kodu uyuşmuyor.");
        }

        var branchExists = await context.Branches.AnyAsync(b => b.BranchCode == branchCode, cancellationToken);
        if (!branchExists)
        {
            return NotFound($"{branchCode} kodlu şube bulunamadı.");
        }

        var person = new BranchPerson
        {
            BranchCode = branchCode,
            Name = request.Name,
            Email = request.Email,
            AccountName = request.AccountName,
            MakeCodeId = request.MakeCodeId,
            ProcessTypeId = request.ProcessTypeId,
            PhotoUrl = request.PhotoUrl,
            IsActive = request.IsActive
        };

        context.BranchPeople.Add(person);
        await context.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetPeople), new { branchCode },
            new BranchPersonDto(person.Id, branchCode, person.Name, person.Email, person.AccountName, person.MakeCodeId, person.ProcessTypeId, person.PhotoUrl, person.IsActive));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> UpdatePerson(string branchCode, int id, [FromBody] UpsertBranchPersonDto request, CancellationToken cancellationToken)
    {
        var person = await context.BranchPeople.FirstOrDefaultAsync(p => p.Id == id && p.BranchCode == branchCode, cancellationToken);
        if (person is null)
        {
            return NotFound();
        }

        person.Name = request.Name;
        person.Email = request.Email;
        person.AccountName = request.AccountName;
        person.MakeCodeId = request.MakeCodeId;
        person.ProcessTypeId = request.ProcessTypeId;
        person.PhotoUrl = request.PhotoUrl;
        person.IsActive = request.IsActive;

        await context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpPatch("{id:int}/activation")]
    public async Task<ActionResult> ChangeActivation(string branchCode, int id, [FromBody] BranchPersonActivationRequest request, CancellationToken cancellationToken)
    {
        var person = await context.BranchPeople.FirstOrDefaultAsync(p => p.Id == id && p.BranchCode == branchCode, cancellationToken);
        if (person is null)
        {
            return NotFound();
        }

        person.IsActive = request.IsActive;
        await context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
