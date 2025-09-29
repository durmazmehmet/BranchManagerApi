using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BranchManager.Api.Domain.Entities;

public class BranchMake
{
    [Key]
    public int Id { get; set; }

    public int? MakeCodeId { get; set; }

    [MaxLength(10)]
    public string? BranchCode { get; set; }

    [MaxLength(20)]
    public string MakeCode { get; set; } = string.Empty;

    public int? ProcessTypeId { get; set; }

    public bool IsActive { get; set; } = true;

    [ForeignKey(nameof(BranchCode))]
    public Branch? Branch { get; set; }

    public BranchProcessType? ProcessType { get; set; }

    public Make? Make { get; set; }
}
