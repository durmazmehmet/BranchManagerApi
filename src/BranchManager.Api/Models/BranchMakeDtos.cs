using System.ComponentModel.DataAnnotations;

namespace BranchManager.Api.Models;

public record BranchMakeDto(
    int Id,
    string BranchCode,
    string MakeCode,
    int? MakeCodeId,
    int? ProcessTypeId,
    bool IsActive
);

public class UpsertBranchMakeDto
{
    public int? Id { get; set; }

    [Required]
    [MaxLength(10)]
    public string BranchCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string MakeCode { get; set; } = string.Empty;

    public int? MakeCodeId { get; set; }

    public int? ProcessTypeId { get; set; }

    public bool IsActive { get; set; } = true;
}

public class BranchMakeActivationRequest
{
    public bool IsActive { get; set; }
}
