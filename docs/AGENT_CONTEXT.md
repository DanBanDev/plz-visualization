# PLZ GIS Web Application - Agent Context

## Project Overview

This project is a web-based GIS application for visualizing German 5-digit postal code areas (PLZ5).

Users can upload CSV files containing postal codes and associated values. These datasets can then be visualized on an interactive map using different visualization types.

The project serves as a portfolio application demonstrating modern full-stack web development, GIS integration, spatial databases, and interactive data visualization.

---

# Technology Stack

## Frontend

* Angular 19
* Angular Material
* NgRx Store
* NgRx Effects
* NgRx Selectors
* RxJS
* OpenLayers
* TypeScript

## Backend

* ASP.NET Core Web API (.NET 10)
* Entity Framework Core
* AutoMapper

## Database

* PostgreSQL
* PostGIS

## Infrastructure

* Docker Desktop
* PostGIS running inside Docker containers
* DBeaver for database management

## GIS Tooling

* QGIS
* GRASS GIS

---

# Application Architecture

The application follows a client-heavy architecture.

The frontend is responsible for:

* Rendering the map
* Rendering all postal code polygons
* Generating legends
* Generating color gradients
* Displaying popups
* User interactions

The backend is responsible for:

* Authentication
* Persisting visualizations
* Managing users
* Returning stored visualization data

The backend does NOT generate map layers.

---

# Authentication

Users must be authenticated before they can create or manage visualizations.

A custom authentication system is planned.

Current user table:

```text
users
-----
id
email
password_hash
created_at
```

Microsoft Identity Platform is not used.

Windows Authentication is not used.

---

# Map

## Base Layer

The map uses OpenStreetMap as the base layer.

## Postal Code Layer

All German PLZ5 areas are loaded from a simplified GeoJSON file:

```text
simplify-plz.geojson
```

The file is downloaded once when the application starts.

The GeoJSON remains in browser memory and is reused for all visualizations.

No additional geometry requests are required after startup.

---

# Postal Code Interaction

When the user clicks a postal code area:

1. The clicked polygon receives a highlighted border color.
2. A small popup is displayed.
3. The popup shows the postal code of the clicked area.
4. Only one area should be highlighted at a time.

The popup is informational only.

---

# Main Page Layout

The application consists primarily of:

* Map
* Search field
* Upload Heatmap button
* Upload Group Visualization button
* User menu

User menu entries:

* My Visualizations
* Logout

---

# Visualization Types

## Heatmap Visualization

CSV format:

```csv
postal_code,value
96450,100.2
80331,250.8
20095,150.7
94315,120.4
```

*First column values have always 5 digits (otherwise the row is ignored).
*Second column values can also be decimal values.

### Workflow

1. User clicks the "Select CSV File" button.
2. File selection dialog opens.
3. User selects a CSV file.
4. CSV is parsed immediately and file path is displayed right to the button.
5. Distinct numeric values are analyzed.
6. Values are distributed into intervals and generate legend preview and text "X postcode values were read in." is displayed.


Object from type create-heatmap-visualization.model is generated.

The application generates legend preview (colors plus values) in dialog:

* Maximum 6 intervals (legend rows)
* Minimum 1 interval  (legend row)

If the CSV contains fewer distinct values, fewer intervals are generated.

### Legend Preview

The upload dialog dynamically generates legend rows.

Each row contains:

* Color preview
* Text label

Example:

```text
■ From 0 to 100
■ From 101 to 200
■ From 201 to 300
```

### Color Selection

User selects:

* Start color
* End color

The application automatically generates a gradient.

Whenever start or end color changes:

* All legend preview colors update immediately.
* Legend names or colors for heatmap preview cannot be edited (only color over color gradient).

### Upload Completion

After successful upload:

```http
HTTP 200
```

the frontend automatically requests the newly created visualization.

The visualization data is then applied to the postal code layer.

A static legend is displayed in the upper-left corner of the map.

---

## Group Visualization

CSV format:

```csv
postal_code,value
96450,1
80331,2
94315,2
80334,1
20095,3

```

Equal values belong to the same group.
*First column values have always 5 digits (otherwise the row is ignored).
*If in the second column exists decimal values, position after decimal point is ignored.

### Workflow

1. User clicks the "Select CSV File" button.
2. File selection dialog opens.
3. CSV is parsed immediately.
4. Distinct group values are detected.
5. Legend preview rows are generated and text "X postcode values were read in." is displayed.

Object from type create-group-visualization.model is generated.

### Group Limit

Maximum allowed groups:

```text
100
```

Set height for legend preview scrollable if needed.

If more than 100 groups are detected:

* Upload is blocked.
* Validation error is displayed.

### Legend Preview

Each generated row contains:

* Color preview
* Group value
* Editable legend color (color picker)
* Editable legend name

Example:

```text
■ 1 Sales
■ 2 Production
■ 3 Administration
```

### Color Management

The user may choose:

* Start color
* End color

A color gradient is generated automatically.

Additionally:

* Every row has its own color picker.
* Colors can be customized individually.

Whenever start color or end color changes:

* All preview colors are recalculated immediately.

### Preview Legend Name and Color Editing

Before upload:

* Legend preview for group visualization may be edited (color and name).

### Upload Completion

After successful upload:

```http
HTTP 200
```

the frontend automatically loads the created visualization.

The map updates immediately.

A static legend is displayed in the upper-left corner of the map.

The map legend is identical to the dialog preview except:

* Colors are not editable
* Names are not editable

---

# Visualization Persistence

Users can save visualizations.

Previously uploaded visualizations are available through:

```text
My Visualizations
```

inside the user menu.

Selecting a saved visualization reloads it onto the map.

---

# Database Model

## users

```text
id
email
password_hash
created_at
```

## visualizations

```text
id
user_id
name
type
created_at
```

Types:

```text
Heatmap
Group
```

## visualization_values

Composite Primary Key:

```text
visualization_id
postal_area_id
```

Additional field:

```text
value
```

## heatmap_legend_item

```text
id
visualization_id
from_value
to_value
color
```

## group_legend_item

```text
id
visualization_id
value
name
color
```

## postal_areas

```text
id
postal_code
```

---

# GIS Data

Source:

German PLZ5 polygons.

Imported from a shapefile.

The original column:

```text
NAME
```

was renamed to:

```text
plz
```

---

# Geometry Simplification

Performed using:

* QGIS
* GRASS GIS v.generalize

Approximate file sizes:

```text
Original Shapefile: ~60 MB
Optimized GeoJSON: ~23 MB
```

---

# API Endpoints

## Visualizations

```http
GET    /api/visualizations
GET    /api/visualizations/{id}
POST   /api/visualizations/heatmap
POST   /api/visualizations/group
DELETE /api/visualizations/{id}
```

## Geodata

```http
GET /simplify-plz.geojson
```

---

# Frontend Conventions

The project uses NgModules.

Standalone components are intentionally not used.

---

# Goal

Build a performant GIS web application that enables users to upload, store, manage, and visualize postal-code-based datasets on an interactive map of Germany.

