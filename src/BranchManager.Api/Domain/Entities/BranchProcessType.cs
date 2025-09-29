using System.ComponentModel.DataAnnotations;

namespace BranchManager.Api.Domain.Entities;

public class BranchProcessType
{
    [Key]
    public int Id { get; set; }

    [MaxLength(50)]
    public string? ProcessType { get; set; }
}
