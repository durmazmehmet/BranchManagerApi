using System.ComponentModel.DataAnnotations;

namespace BranchManager.Api.Domain.Entities;

public class Make
{
    [Key]
    public int Id { get; set; }

    [MaxLength(20)]
    public string MakeCode { get; set; } = string.Empty;

    [MaxLength(250)]
    public string? Photo1x { get; set; }

    [MaxLength(250)]
    public string? Photo2x { get; set; }

    [MaxLength(250)]
    public string? Photo3x { get; set; }
}
