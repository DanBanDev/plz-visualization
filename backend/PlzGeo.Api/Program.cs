using AutoMapper;
using Microsoft.EntityFrameworkCore;
using PlzGeo.Api.Models;
using PlzGeo.Api.Profiles;
using PlzGeo.Api.Services;
using PlzGeo.Api.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<PlzGisContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("Postgis")));
builder.Services.AddAutoMapper(cfg => { }, typeof(MappingProfile));
builder.Services.AddScoped<IVisualizationService, VisualizationService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
