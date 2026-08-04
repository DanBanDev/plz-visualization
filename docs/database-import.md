# PLZ Data Import

The German postal code polygons are stored in a PostGIS database.

Data import workflow:

1. Import original Shapefile into PostGIS
2. Validate geometries
3. Remove invalid records
4. Generate simplified geometries
5. Export GeoJSON for frontend visualization

The original source files are not included in this repository due to their size.
