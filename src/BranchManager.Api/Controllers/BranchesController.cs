using BranchManager.Api.Domain.Entities;
using BranchManager.Api.Infrastructure;
using BranchManager.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BranchManager.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BranchesController(BranchManagerDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BranchSummaryDto>>> GetBranches(CancellationToken cancellationToken)
    {
        var branches = await context.Branches
            .AsNoTracking()
            .Select(b => new BranchSummaryDto(
                b.BranchCode,
                b.BranchName,
                b.CityCode,
                b.IsActive))
            .OrderBy(b => b.BranchCode)
            .ToListAsync(cancellationToken);

        return Ok(branches);
    }

    [HttpGet("{branchCode}")]
    public async Task<ActionResult<BranchDetailDto>> GetBranch(string branchCode, CancellationToken cancellationToken)
    {
        var branch = await context.Branches
            .AsNoTracking()
            .Where(b => b.BranchCode == branchCode)
            .Select(b => new BranchDetailDto(
                b.BranchCode,
                b.BranchName,
                b.CompanyCode,
                b.CityCode,
                b.LocationCode,
                b.Phone,
                b.Address,
                b.Latitude,
                b.Longitude,
                b.IsActive))
            .FirstOrDefaultAsync(cancellationToken);

        if (branch is null)
        {
            return NotFound();
        }

        return Ok(branch);
    }

    [HttpPost]
    public async Task<ActionResult<BranchDetailDto>> CreateBranch([FromBody] UpsertBranchDto request, CancellationToken cancellationToken)
    {
        var exists = await context.Branches.AnyAsync(b => b.BranchCode == request.BranchCode, cancellationToken);
        if (exists)
        {
            return Conflict($"{request.BranchCode} koduna sahip şube zaten mevcut.");
        }

        var branch = new Branch
        {
            BranchCode = request.BranchCode,
            BranchName = request.BranchName,
            CompanyCode = request.CompanyCode,
            CityCode = request.CityCode,
            LocationCode = request.LocationCode,
            Phone = request.Phone,
            Address = request.Address,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            IsActive = request.IsActive
        };

        context.Branches.Add(branch);
        await context.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetBranch), new { branchCode = branch.BranchCode },
            new BranchDetailDto(
                branch.BranchCode,
                branch.BranchName,
                branch.CompanyCode,
                branch.CityCode,
                branch.LocationCode,
                branch.Phone,
                branch.Address,
                branch.Latitude,
                branch.Longitude,
                branch.IsActive));
    }

    [HttpPut("{branchCode}")]
    public async Task<ActionResult> UpdateBranch(string branchCode, [FromBody] UpsertBranchDto request, CancellationToken cancellationToken)
    {
        if (!string.Equals(branchCode, request.BranchCode, StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest("Güncellenecek şube kodu gövde ile eşleşmeli.");
        }

        var branch = await context.Branches.FirstOrDefaultAsync(b => b.BranchCode == branchCode, cancellationToken);
        if (branch is null)
        {
            return NotFound();
        }

        branch.BranchName = request.BranchName;
        branch.CompanyCode = request.CompanyCode;
        branch.CityCode = request.CityCode;
        branch.LocationCode = request.LocationCode;
        branch.Phone = request.Phone;
        branch.Address = request.Address;
        branch.Latitude = request.Latitude;
        branch.Longitude = request.Longitude;
        branch.IsActive = request.IsActive;

        await context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpPatch("{branchCode}/activation")]
    public async Task<ActionResult> ChangeBranchActivation(string branchCode, [FromBody] BranchActivationRequest request, CancellationToken cancellationToken)
    {
        var branch = await context.Branches.FirstOrDefaultAsync(b => b.BranchCode == branchCode, cancellationToken);
        if (branch is null)
        {
            return NotFound();
        }

        branch.IsActive = request.IsActive;
        await context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
