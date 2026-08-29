using System;
using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace PlzGeo.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialBaseline : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:fuzzystrmatch", ",,")
                .Annotation("Npgsql:PostgresExtension:postgis", ",,")
                .Annotation("Npgsql:PostgresExtension:tiger.postgis_tiger_geocoder", ",,")
                .Annotation("Npgsql:PostgresExtension:topology.postgis_topology", ",,");

            migrationBuilder.CreateTable(
                name: "postal_areas",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    postal_code = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("postal_areas_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    password_hash = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("users_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "plz_5_de",
                columns: table => new
                {
                    ogc_fid = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    wkb_geometry = table.Column<MultiPolygon>(type: "geometry(MultiPolygon,4326)", nullable: true),
                    fid = table.Column<decimal>(type: "numeric(20)", precision: 20, nullable: true),
                    osm_id = table.Column<double>(type: "double precision", nullable: true),
                    boundary = table.Column<string>(type: "character varying(254)", maxLength: 254, nullable: true),
                    admin_leve = table.Column<string>(type: "character varying(254)", maxLength: 254, nullable: true),
                    type = table.Column<string>(type: "character varying(254)", maxLength: 254, nullable: true),
                    border_typ = table.Column<string>(type: "character varying(254)", maxLength: 254, nullable: true),
                    plz = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: true),
                    postal_area_id = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("plz_5_de_pk", x => x.ogc_fid);
                    table.ForeignKey(
                        name: "fk_plz_postal_area",
                        column: x => x.postal_area_id,
                        principalTable: "postal_areas",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "visualizations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("visualizations_pkey", x => x.id);
                    table.ForeignKey(
                        name: "visualizations_user_id_fkey",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "group_legend_items",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    visualization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    value = table.Column<int>(type: "integer", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    color = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("group_legend_items_pkey", x => x.id);
                    table.ForeignKey(
                        name: "group_legend_items_visualization_id_fkey",
                        column: x => x.visualization_id,
                        principalTable: "visualizations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "heatmap_legend_items",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    visualization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    from_value = table.Column<decimal>(type: "numeric", nullable: false),
                    to_value = table.Column<decimal>(type: "numeric", nullable: false),
                    color = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("heatmap_legend_items_pkey", x => x.id);
                    table.ForeignKey(
                        name: "heatmap_legend_items_visualization_id_fkey",
                        column: x => x.visualization_id,
                        principalTable: "visualizations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "visualization_values",
                columns: table => new
                {
                    visualization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    postal_area_id = table.Column<int>(type: "integer", nullable: false),
                    value = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("visualization_values_pkey", x => new { x.visualization_id, x.postal_area_id });
                    table.ForeignKey(
                        name: "visualization_values_postal_area_id_fkey",
                        column: x => x.postal_area_id,
                        principalTable: "postal_areas",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "visualization_values_visualization_id_fkey",
                        column: x => x.visualization_id,
                        principalTable: "visualizations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_group_legend_items_visualization_id",
                table: "group_legend_items",
                column: "visualization_id");

            migrationBuilder.CreateIndex(
                name: "IX_heatmap_legend_items_visualization_id",
                table: "heatmap_legend_items",
                column: "visualization_id");

            migrationBuilder.CreateIndex(
                name: "IX_plz_5_de_postal_area_id",
                table: "plz_5_de",
                column: "postal_area_id");

            migrationBuilder.CreateIndex(
                name: "plz_5_de_wkb_geometry_geom_idx",
                table: "plz_5_de",
                column: "wkb_geometry")
                .Annotation("Npgsql:IndexMethod", "gist");

            migrationBuilder.CreateIndex(
                name: "postal_areas_plz_key",
                table: "postal_areas",
                column: "postal_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "uq_postal_areas_plz",
                table: "postal_areas",
                column: "postal_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "users_email_key",
                table: "users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_visualization_values_postal_area_id",
                table: "visualization_values",
                column: "postal_area_id");

            migrationBuilder.CreateIndex(
                name: "uq_visualization_postal_area",
                table: "visualization_values",
                columns: new[] { "visualization_id", "postal_area_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_visualizations_user_id",
                table: "visualizations",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "group_legend_items");

            migrationBuilder.DropTable(
                name: "heatmap_legend_items");

            migrationBuilder.DropTable(
                name: "plz_5_de");

            migrationBuilder.DropTable(
                name: "visualization_values");

            migrationBuilder.DropTable(
                name: "postal_areas");

            migrationBuilder.DropTable(
                name: "visualizations");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
