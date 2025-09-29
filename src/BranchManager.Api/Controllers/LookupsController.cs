using BranchManager.Api.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BranchManager.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LookupsController(BranchManagerDbContext context) : ControllerBase
{
    [HttpGet("makes")]
    public async Task<ActionResult> GetMakes(CancellationToken cancellationToken)
    {
        var makes = await context.Makes
            .AsNoTracking()
            .OrderBy(m => m.MakeCode)
            .Select(m => new { m.Id, m.MakeCode })
            .ToListAsync(cancellationToken);

        return Ok(makes);
    }

    [HttpGet("process-types")]
    public async Task<ActionResult> GetProcessTypes(CancellationToken cancellationToken)
    {
        var processTypes = await context.BranchProcessTypes
            .AsNoTracking()
            .OrderBy(p => p.ProcessType)
            .Select(p => new { p.Id, p.ProcessType })
            .ToListAsync(cancellationToken);

        return Ok(processTypes);
    }
}
