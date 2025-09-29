using BranchManager.Api.Domain.Entities;

namespace BranchManager.Api.Infrastructure;

public static class DataSeeder
{
    public static void Seed(BranchManagerDbContext context)
    {
        if (!context.Makes.Any())
        {
            context.Makes.AddRange(
                new Make { Id = 1, MakeCode = "BMW" },
                new Make { Id = 2, MakeCode = "MINI" },
                new Make { Id = 3, MakeCode = "JLR" }
            );
        }

        if (!context.BranchProcessTypes.Any())
        {
            context.BranchProcessTypes.AddRange(
                new BranchProcessType { Id = 1, ProcessType = "Satış" },
                new BranchProcessType { Id = 2, ProcessType = "Servis" },
                new BranchProcessType { Id = 3, ProcessType = "Yedek Parça" }
            );
        }

        if (!context.Branches.Any())
        {
            var branch = new Branch
            {
                BranchCode = "IST01",
                BranchName = "İstanbul Merkez",
                CityCode = "34",
                Address = "Maslak Mahallesi",
                Phone = "+90 212 000 00 00",
                Latitude = "41.1100",
                Longitude = "29.0200",
                IsActive = true
            };

            var branch2 = new Branch
            {
                BranchCode = "ANK01",
                BranchName = "Ankara Çukurambar",
                CityCode = "06",
                Address = "Çukurambar Mahallesi",
                Phone = "+90 312 000 00 00",
                Latitude = "39.9000",
                Longitude = "32.8500",
                IsActive = true
            };

            context.Branches.AddRange(branch, branch2);
        }

        context.SaveChanges();

        if (!context.BranchMakes.Any())
        {
            context.BranchMakes.AddRange(
                new BranchMake
                {
                    BranchCode = "IST01",
                    MakeCode = "BMW",
                    MakeCodeId = 1,
                    ProcessTypeId = 1,
                    IsActive = true
                },
                new BranchMake
                {
                    BranchCode = "IST01",
                    MakeCode = "BMW",
                    MakeCodeId = 1,
                    ProcessTypeId = 2,
                    IsActive = true
                },
                new BranchMake
                {
                    BranchCode = "ANK01",
                    MakeCode = "MINI",
                    MakeCodeId = 2,
                    ProcessTypeId = 2,
                    IsActive = true
                }
            );
        }

        if (!context.BranchPeople.Any())
        {
            context.BranchPeople.AddRange(
                new BranchPerson
                {
                    BranchCode = "IST01",
                    Name = "Ahmet Yılmaz",
                    AccountName = "ahmet.yilmaz",
                    Email = "ahmet@example.com",
                    MakeCodeId = 1,
                    ProcessTypeId = 2,
                    IsActive = true
                },
                new BranchPerson
                {
                    BranchCode = "ANK01",
                    Name = "Ayşe Demir",
                    AccountName = "ayse.demir",
                    Email = "ayse@example.com",
                    MakeCodeId = 2,
                    ProcessTypeId = 2,
                    IsActive = true
                }
            );
        }

        context.SaveChanges();
    }
}
