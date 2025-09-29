using System.ComponentModel.DataAnnotations;

namespace BranchManager.Api.Domain.Entities;

public class Branch
{
    [Key]
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

    public ICollection<BranchMake> BranchMakes { get; set; } = new List<BranchMake>();

    public ICollection<BranchPerson> BranchPeople { get; set; } = new List<BranchPerson>();
}
