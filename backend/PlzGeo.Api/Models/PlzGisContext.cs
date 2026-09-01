using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;

namespace PlzGeo.Api.Models;

public partial class PlzGisContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>
{
    public PlzGisContext()
    {
    }

    public PlzGisContext(DbContextOptions<PlzGisContext> options)
        : base(options)
    {
    }

    public virtual DbSet<GroupLegendItem> GroupLegendItems { get; set; }

    public virtual DbSet<HeatmapLegendItem> HeatmapLegendItems { get; set; }

    public virtual DbSet<Plz5De> Plz5Des { get; set; }

    public virtual DbSet<PostalArea> PostalAreas { get; set; }

    public virtual DbSet<Visualization> Visualizations { get; set; }

    public virtual DbSet<VisualizationValue> VisualizationValues { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseNpgsql(x => x.UseNetTopologySuite());

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder
            .HasPostgresExtension("fuzzystrmatch")
            .HasPostgresExtension("postgis")
            .HasPostgresExtension("tiger", "postgis_tiger_geocoder")
            .HasPostgresExtension("topology", "postgis_topology");

        modelBuilder.Entity<GroupLegendItem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("group_legend_items_pkey");

            entity.ToTable("group_legend_items");

            entity.Property(e => e.Id)
                .ValueGeneratedNever()
                .HasColumnName("id");
            entity.Property(e => e.Color)
                .HasMaxLength(20)
                .HasColumnName("color");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.Value).HasColumnName("value");
            entity.Property(e => e.VisualizationId).HasColumnName("visualization_id");

            entity.HasOne(d => d.Visualization).WithMany(p => p.GroupLegendItems)
                .HasForeignKey(d => d.VisualizationId)
                .HasConstraintName("group_legend_items_visualization_id_fkey");
        });

        modelBuilder.Entity<HeatmapLegendItem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("heatmap_legend_items_pkey");

            entity.ToTable("heatmap_legend_items");

            entity.Property(e => e.Id)
                .ValueGeneratedNever()
                .HasColumnName("id");
            entity.Property(e => e.Color)
                .HasMaxLength(20)
                .HasColumnName("color");
            entity.Property(e => e.FromValue).HasColumnName("from_value");
            entity.Property(e => e.ToValue).HasColumnName("to_value");
            entity.Property(e => e.VisualizationId).HasColumnName("visualization_id");

            entity.HasOne(d => d.Visualization).WithMany(p => p.HeatmapLegendItems)
                .HasForeignKey(d => d.VisualizationId)
                .HasConstraintName("heatmap_legend_items_visualization_id_fkey");
        });

        modelBuilder.Entity<Plz5De>(entity =>
        {
            entity.HasKey(e => e.OgcFid).HasName("plz_5_de_pk");

            entity.ToTable("plz_5_de");

            entity.HasIndex(e => e.WkbGeometry, "plz_5_de_wkb_geometry_geom_idx").HasMethod("gist");

            entity.Property(e => e.OgcFid).HasColumnName("ogc_fid");
            entity.Property(e => e.AdminLeve)
                .HasMaxLength(254)
                .HasColumnName("admin_leve");
            entity.Property(e => e.BorderTyp)
                .HasMaxLength(254)
                .HasColumnName("border_typ");
            entity.Property(e => e.Boundary)
                .HasMaxLength(254)
                .HasColumnName("boundary");
            entity.Property(e => e.Fid)
                .HasPrecision(20, 0)
                .HasColumnName("fid");
            entity.Property(e => e.OsmId).HasColumnName("osm_id");
            entity.Property(e => e.Plz)
                .HasMaxLength(5)
                .HasColumnName("plz");
            entity.Property(e => e.PostalAreaId).HasColumnName("postal_area_id");
            entity.Property(e => e.Type)
                .HasMaxLength(254)
                .HasColumnName("type");
            entity.Property(e => e.WkbGeometry)
                .HasColumnType("geometry(MultiPolygon,4326)")
                .HasColumnName("wkb_geometry");

            entity.HasOne(d => d.PostalArea).WithMany(p => p.Plz5Des)
                .HasForeignKey(d => d.PostalAreaId)
                .HasConstraintName("fk_plz_postal_area");
        });

        modelBuilder.Entity<PostalArea>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("postal_areas_pkey");

            entity.ToTable("postal_areas");

            entity.HasIndex(e => e.PostalCode, "postal_areas_plz_key").IsUnique();

            entity.HasIndex(e => e.PostalCode, "uq_postal_areas_plz").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.PostalCode)
                .HasMaxLength(5)
                .HasColumnName("postal_code");
        });


        modelBuilder.Entity<Visualization>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("visualizations_pkey");

            entity.ToTable("visualizations");

            entity.Property(e => e.Id)
                .ValueGeneratedNever()
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.Name)
                .HasMaxLength(200)
                .HasColumnName("name");
            entity.Property(e => e.Type)
                .HasMaxLength(50)
                .HasColumnName("type");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.Visualizations)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("visualizations_user_id_fkey");
        });

        modelBuilder.Entity<VisualizationValue>(entity =>
        {
            entity.HasKey(e => new { e.VisualizationId, e.PostalAreaId }).HasName("visualization_values_pkey");

            entity.ToTable("visualization_values");

            entity.HasIndex(e => new { e.VisualizationId, e.PostalAreaId }, "uq_visualization_postal_area").IsUnique();

            entity.Property(e => e.VisualizationId).HasColumnName("visualization_id");
            entity.Property(e => e.PostalAreaId).HasColumnName("postal_area_id");
            entity.Property(e => e.Value).HasColumnName("value");

            entity.HasOne(d => d.PostalArea).WithMany(p => p.VisualizationValues)
                .HasForeignKey(d => d.PostalAreaId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("visualization_values_postal_area_id_fkey");

            entity.HasOne(d => d.Visualization).WithMany(p => p.VisualizationValues)
                .HasForeignKey(d => d.VisualizationId)
                .HasConstraintName("visualization_values_visualization_id_fkey");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
