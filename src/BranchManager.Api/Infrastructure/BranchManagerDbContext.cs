using BranchManager.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BranchManager.Api.Infrastructure;

public class BranchManagerDbContext(DbContextOptions<BranchManagerDbContext> options)
    : DbContext(options)
{
    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<BranchMake> BranchMakes => Set<BranchMake>();
    public DbSet<BranchPerson> BranchPeople => Set<BranchPerson>();
    public DbSet<BranchProcessType> BranchProcessTypes => Set<BranchProcessType>();
    public DbSet<Make> Makes => Set<Make>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Branch>(builder =>
        {
            builder.ToTable("Branches", schema: "dbo");
            builder.Property(b => b.BranchCode).HasMaxLength(10);
            builder.Property(b => b.CompanyCode).HasMaxLength(10);
            builder.Property(b => b.BranchName).HasMaxLength(150);
            builder.Property(b => b.CityCode).HasMaxLength(10);
            builder.Property(b => b.LocationCode).HasMaxLength(10);
            builder.Property(b => b.Phone).HasMaxLength(50);
            builder.Property(b => b.Address).HasMaxLength(250);
            builder.Property(b => b.Latitude).HasMaxLength(50);
            builder.Property(b => b.Longitude).HasMaxLength(50);
        });

        modelBuilder.Entity<BranchMake>(builder =>
        {
            builder.ToTable("BranchMakes", schema: "dbo");
            builder.Property(b => b.MakeCode).HasMaxLength(20);
            builder.Property(b => b.BranchCode).HasMaxLength(10);
        });

        modelBuilder.Entity<BranchPerson>(builder =>
        {
            builder.ToTable("BranchPeople", schema: "dbo");
            builder.Property(p => p.BranchCode).HasMaxLength(10);
            builder.Property(p => p.Name).HasMaxLength(50);
            builder.Property(p => p.Email).HasMaxLength(50);
            builder.Property(p => p.AccountName).HasMaxLength(50);
            builder.Property(p => p.PhotoUrl).HasMaxLength(250);
        });

        modelBuilder.Entity<BranchProcessType>(builder =>
        {
            builder.ToTable("BranchProcessTypes", schema: "dbo");
            builder.Property(p => p.ProcessType).HasMaxLength(50);
        });

        modelBuilder.Entity<Make>(builder =>
        {
            builder.ToTable("Makes", schema: "dbo");
            builder.Property(m => m.MakeCode).HasMaxLength(20);
        });
    }
}
