using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace ApiServer.Tests;

public class ApiIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public ApiIntegrationTests(WebApplicationFactory<Program> factory)
    {
        RateLimiter.Reset();

        _client = factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("ASPNETCORE_ENVIRONMENT", "Development");
        }).CreateClient();
    }

    [Fact]
    public async Task HealthEndpoint_ReturnsHealthy()
    {
        var response = await _client.GetAsync("/api/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("healthy", body.GetProperty("status").GetString());
    }

    [Fact]
    public async Task LeaderboardEndpoint_ReturnsSuccess()
    {
        var response = await _client.GetAsync("/api/coffeemachine/leaderboard");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(body.GetProperty("success").GetBoolean());
    }

    [Fact]
    public async Task SubmitEndpoint_ValidRequest_ReturnsSuccess()
    {
        var payload = new
        {
            name = $"Test-{Guid.NewGuid():N}"[..20],
            time = 150,
            filesRead = 8,
            commandsUsed = 25,
            exploredProc = true,
            technicalCommands = new[] { "ps aux", "top" }
        };

        var response = await _client.PostAsJsonAsync("/api/coffeemachine/submit", payload);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(body.GetProperty("success").GetBoolean());
        Assert.Equal("added", body.GetProperty("action").GetString());
        Assert.True(body.GetProperty("score").GetInt32() > 0);
    }

    [Fact]
    public async Task SubmitEndpoint_EmptyName_ReturnsBadRequest()
    {
        var payload = new
        {
            name = "",
            time = 100,
            filesRead = 5,
            commandsUsed = 10,
            exploredProc = false,
            technicalCommands = Array.Empty<string>()
        };

        var response = await _client.PostAsJsonAsync("/api/coffeemachine/submit", payload);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task SubmitEndpoint_InvalidNameChars_ReturnsBadRequest()
    {
        var payload = new
        {
            name = "<script>alert(1)</script>",
            time = 100,
            filesRead = 5,
            commandsUsed = 10,
            exploredProc = false,
            technicalCommands = Array.Empty<string>()
        };

        var response = await _client.PostAsJsonAsync("/api/coffeemachine/submit", payload);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task SubmitEndpoint_NegativeTime_ReturnsBadRequest()
    {
        var payload = new
        {
            name = "ValidName",
            time = -1,
            filesRead = 5,
            commandsUsed = 10,
            exploredProc = false,
            technicalCommands = Array.Empty<string>()
        };

        var response = await _client.PostAsJsonAsync("/api/coffeemachine/submit", payload);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task SubmitEndpoint_ScoreIsServerCalculated()
    {
        var payload = new
        {
            name = $"Calc-{Guid.NewGuid():N}"[..20],
            time = 60,
            filesRead = 3,
            commandsUsed = 5,
            exploredProc = true,
            technicalCommands = new[] { "ps", "free", "top" }
        };

        var response = await _client.PostAsJsonAsync("/api/coffeemachine/submit", payload);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();

        var expectedScore = ScoreCalculator.Calculate(
            payload.time, payload.filesRead, payload.commandsUsed,
            payload.exploredProc, payload.technicalCommands.ToList());

        Assert.Equal(expectedScore, body.GetProperty("score").GetInt32());
    }

    [Fact]
    public async Task PlayerEndpoint_UnknownPlayer_ReturnsNotFound()
    {
        var response = await _client.GetAsync("/api/coffeemachine/player/NonExistentPlayer999");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.False(body.GetProperty("found").GetBoolean());
    }
}
