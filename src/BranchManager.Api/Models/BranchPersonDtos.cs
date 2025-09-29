using System.ComponentModel.DataAnnotations;

namespace BranchManager.Api.Models;

public record BranchPersonDto(
    int Id,
    string BranchCode,
    string Name,
    string? Email,
    string? AccountName,
    int? MakeCodeId,
    int? ProcessTypeId,
    string? PhotoUrl,
    bool IsActive
);

public class UpsertBranchPersonDto
{
    public int? Id { get; set; }

    [Required]
    [MaxLength(10)]
    public string BranchCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    [EmailAddress]
    [MaxLength(50)]
    public string? Email { get; set; }

    [MaxLength(50)]
    public string? AccountName { get; set; }

    public int? MakeCodeId { get; set; }

    public int? ProcessTypeId { get; set; }

    [Url]
    [MaxLength(250)]
    public string? PhotoUrl { get; set; }

    public bool IsActive { get; set; } = true;
}

public class BranchPersonActivationRequest
{
    public bool IsActive { get; set; }
}
