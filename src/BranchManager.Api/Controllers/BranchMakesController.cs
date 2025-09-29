using BranchManager.Api.Domain.Entities;
using BranchManager.Api.Infrastructure;
using BranchManager.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BranchManager.Api.Controllers;

[ApiController]
[Route("api/branches/{branchCode}/makes")]
public class BranchMakesController(BranchManagerDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BranchMakeDto>>> GetBranchMakes(string branchCode, CancellationToken cancellationToken)
    {
        var makes = await context.BranchMakes
            .AsNoTracking()
            .Where(m => m.BranchCode == branchCode)
            .Select(m => new BranchMakeDto(
                m.Id,
                m.BranchCode ?? string.Empty,
                m.MakeCode,
                m.MakeCodeId,
                m.ProcessTypeId,
                m.IsActive))
            .OrderBy(m => m.MakeCode)
            .ThenBy(m => m.ProcessTypeId)
            .ToListAsync(cancellationToken);

        return Ok(makes);
    }

    [HttpPost]
    public async Task<ActionResult<BranchMakeDto>> CreateBranchMake(string branchCode, [FromBody] UpsertBranchMakeDto request, CancellationToken cancellationToken)
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

        var branchMake = new BranchMake
        {
            BranchCode = branchCode,
            MakeCode = request.MakeCode,
            MakeCodeId = request.MakeCodeId,
            ProcessTypeId = request.ProcessTypeId,
            IsActive = request.IsActive
        };

        context.BranchMakes.Add(branchMake);
        await context.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetBranchMakes), new { branchCode },
            new BranchMakeDto(branchMake.Id, branchCode, branchMake.MakeCode, branchMake.MakeCodeId, branchMake.ProcessTypeId, branchMake.IsActive));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> UpdateBranchMake(string branchCode, int id, [FromBody] UpsertBranchMakeDto request, CancellationToken cancellationToken)
    {
        var branchMake = await context.BranchMakes.FirstOrDefaultAsync(m => m.Id == id && m.BranchCode == branchCode, cancellationToken);
        if (branchMake is null)
        {
            return NotFound();
        }

        branchMake.MakeCode = request.MakeCode;
        branchMake.MakeCodeId = request.MakeCodeId;
        branchMake.ProcessTypeId = request.ProcessTypeId;
        branchMake.IsActive = request.IsActive;

        await context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpPatch("{id:int}/activation")]
    public async Task<ActionResult> ChangeActivation(string branchCode, int id, [FromBody] BranchMakeActivationRequest request, CancellationToken cancellationToken)
    {
        var branchMake = await context.BranchMakes.FirstOrDefaultAsync(m => m.Id == id && m.BranchCode == branchCode, cancellationToken);
        if (branchMake is null)
        {
            return NotFound();
        }

        branchMake.IsActive = request.IsActive;
        await context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
