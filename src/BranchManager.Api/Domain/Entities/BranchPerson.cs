using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BranchManager.Api.Domain.Entities;

public class BranchPerson
{
    [Key]
    public int Id { get; set; }

    [MaxLength(10)]
    public string BranchCode { get; set; } = string.Empty;

    public int? MakeCodeId { get; set; }

    public int? ProcessTypeId { get; set; }

    [MaxLength(50)]
    public string? Email { get; set; }

    [MaxLength(50)]
    public string? AccountName { get; set; }

    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(250)]
    public string? PhotoUrl { get; set; }

    public bool IsActive { get; set; } = true;

    [ForeignKey(nameof(BranchCode))]
    public Branch? Branch { get; set; }

    public BranchProcessType? ProcessType { get; set; }

    public Make? Make { get; set; }
}
