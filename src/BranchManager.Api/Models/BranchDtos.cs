using System.ComponentModel.DataAnnotations;

namespace BranchManager.Api.Models;

public record BranchSummaryDto(
    string BranchCode,
    string? BranchName,
    string? CityCode,
    bool? IsActive
);

public record BranchDetailDto(
    string BranchCode,
    string? BranchName,
    string? CompanyCode,
    string? CityCode,
    string? LocationCode,
    string? Phone,
    string? Address,
    string? Latitude,
    string? Longitude,
    bool? IsActive
);

public class UpsertBranchDto
{
    [Required]
    [MaxLength(10)]
    public string BranchCode { get; set; } = string.Empty;

    [MaxLength(10)]
    public string? CompanyCode { get; set; }

    [MaxLength(150)]
    public string? BranchName { get; set; }

    [MaxLength(10)]
    public string? CityCode { get; set; }

    [MaxLength(10)]
    public string? LocationCode { get; set; }

    [MaxLength(50)]
    public string? Phone { get; set; }

    [MaxLength(250)]
    public string? Address { get; set; }

    [MaxLength(50)]
    public string? Latitude { get; set; }

    [MaxLength(50)]
    public string? Longitude { get; set; }

    public bool? IsActive { get; set; } = true;
}

public class BranchActivationRequest
{
    public bool IsActive { get; set; }
}
