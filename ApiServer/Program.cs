using System.Collections.Concurrent;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

var builder = WebApplication.CreateBuilder(args);
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.NumberHandling = JsonNumberHandling.AllowReadingFromString;
});
builder.Services.AddCors();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseCors(policy => policy
        .AllowAnyOrigin()
        .AllowAnyMethod()
        .AllowAnyHeader());
}
else
{
    var allowedOrigins = Environment.GetEnvironmentVariable("CORS_ORIGINS")?.Split(',') ?? [];
    app.UseCors(policy => policy
        .WithOrigins(allowedOrigins)
        .AllowAnyMethod()
        .AllowAnyHeader());
}

app.MapGet("/api/coffeemachine/leaderboard", () =>
{
    var scores = HighscoreStore.Read();
    var leaderboard = scores
        .Take(Limits.MaxEntries)
        .Select((score, index) => new
        {
            rank = index + 1,
            name = score.Name,
            score = score.Score,
            time = score.Time,
            filesRead = score.FilesRead,
            commandsUsed = score.CommandsUsed,
            date = score.Date
        });

    return Results.Ok(new { success = true, leaderboard });
});

app.MapPost("/api/coffeemachine/submit", (HttpContext ctx, SubmitScoreRequest request) =>
{
    if (request is null)
    {
        return Results.BadRequest(new { success = false, error = "Invalid JSON body" });
    }

    var ip = ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    if (!RateLimiter.TryAcquire(ip))
    {
        return Results.Json(
            new { success = false, error = "Too many requests. Try again later." },
            statusCode: 429);
    }

    var name = request.Name?.Trim() ?? string.Empty;
    if (string.IsNullOrWhiteSpace(name) || name.Length > Limits.MaxNameLength)
    {
        return Results.BadRequest(new { success = false, error = "Invalid name (must be 1-50 characters)" });
    }

    if (!NameValidator.IsValid(name))
    {
        return Results.BadRequest(new { success = false, error = "Name contains invalid characters" });
    }

    if (!request.TryValidate(out var errorMessage))
    {
        return Results.BadRequest(new { success = false, error = errorMessage });
    }

    var calculatedScore = ScoreCalculator.Calculate(
        request.Time,
        request.FilesRead,
        request.CommandsUsed,
        request.ExploredProc,
        request.TechnicalCommands);

    lock (HighscoreStore.FileLock)
    {
        var scores = HighscoreStore.Read();
        var previousSnapshot = scores
            .Select(score => (score.Name.ToLowerInvariant(), score.Score, score.Time))
            .ToList();

        var newScore = new ScoreEntry(
            name,
            calculatedScore,
            request.Time,
            request.FilesRead,
            request.CommandsUsed,
            DateTime.Now.ToString("o"));

        var existingIndex = scores.FindIndex(score => score.Name.Equals(name, StringComparison.OrdinalIgnoreCase));
        string action;

        if (existingIndex >= 0)
        {
            if (newScore.Score > scores[existingIndex].Score)
            {
                scores[existingIndex] = newScore;
                action = "updated";
            }
            else
            {
                action = "kept_old";
                newScore = scores[existingIndex];
            }
        }
        else
        {
            scores.Add(newScore);
            action = "added";
        }

        scores = scores
            .OrderByDescending(score => score.Score)
            .Take(Limits.MaxEntries)
            .ToList();

        try
        {
            HighscoreStore.Write(scores);
        }
        catch (Exception ex)
        {
            return Results.Json(new { success = false, error = ex.Message }, statusCode: 500);
        }

        var rankIndex = scores.FindIndex(score => score.Name.Equals(name, StringComparison.OrdinalIgnoreCase));
        int? rank = rankIndex >= 0 ? rankIndex + 1 : null;

        var currentSnapshot = scores
            .Select(score => (score.Name.ToLowerInvariant(), score.Score, score.Time))
            .ToList();

        if (!currentSnapshot.SequenceEqual(previousSnapshot))
        {
            EmailNotifier.TrySend(newScore, rank, action);
        }

        return Results.Ok(new
        {
            success = true,
            action,
            rank,
            score = newScore.Score
        });
    }
});

app.MapGet("/api/coffeemachine/player/{name}", (string name) =>
{
    var scores = HighscoreStore.Read();
    var playerScore = scores.FirstOrDefault(score => score.Name.Equals(name, StringComparison.OrdinalIgnoreCase));

    if (playerScore is null)
    {
        return Results.Ok(new { success = true, found = false });
    }

    var rank = scores.FindIndex(score => score.Name.Equals(playerScore.Name, StringComparison.OrdinalIgnoreCase)) + 1;
    var payload = new
    {
        rank,
        name = playerScore.Name,
        score = playerScore.Score,
        time = playerScore.Time,
        filesRead = playerScore.FilesRead,
        commandsUsed = playerScore.CommandsUsed,
        date = playerScore.Date
    };

    return Results.Ok(new { success = true, found = true, player = payload });
});

app.MapGet("/api/health", () =>
{
    return Results.Ok(new
    {
        status = "healthy",
        service = "Coffee Machine Debug API",
        timestamp = DateTime.Now.ToString("o")
    });
});

app.Lifetime.ApplicationStarted.Register(() =>
{
    Console.WriteLine(new string('=', 50));
    Console.WriteLine("Coffee Machine Debug - API Server");
    Console.WriteLine(new string('=', 50));
    Console.WriteLine("Starting server on http://localhost:5000");
    Console.WriteLine("Endpoints:");
    Console.WriteLine("  GET  /api/coffeemachine/leaderboard");
    Console.WriteLine("  POST /api/coffeemachine/submit");
    Console.WriteLine("  GET  /api/coffeemachine/player/<name>");
    Console.WriteLine("  GET  /api/health");
    Console.WriteLine(new string('=', 50));
});

HighscoreStore.EnsureCreated();
app.Run();

static class Limits
{
    public const int MaxEntries = 10;
    public const int MaxNameLength = 50;
    public const int MaxTimeSeconds = 3600;
    public const int MaxFilesRead = 500;
    public const int MaxCommandsUsed = 1000;
    public const int MaxTechnicalCommands = 200;
}

static partial class NameValidator
{
    [GeneratedRegex(@"^[a-zA-Z0-9 _.\-]+$")]
    private static partial Regex AllowedPattern();

    public static bool IsValid(string name) => AllowedPattern().IsMatch(name);
}

static class ScoreCalculator
{
    private static readonly HashSet<string> ValidTechnicalCmds =
        ["ps", "free", "top", "env", "systemctl"];

    public static int Calculate(int time, int filesRead, int commandsUsed,
        bool exploredProc, List<string>? technicalCommands)
    {
        var score = 10000;

        if (time < 120) score += 2000;
        else if (time < 180) score += 1100;
        else if (time < 240) score += 500;

        if (filesRead <= 6) score += 2000;
        else if (filesRead <= 10) score += 1500;
        else if (filesRead <= 15) score += 800;

        var validCount = technicalCommands?
            .Where(cmd => ValidTechnicalCmds.Any(tech => cmd.StartsWith(tech, StringComparison.OrdinalIgnoreCase)))
            .Count() ?? 0;

        score += Math.Min(validCount, Limits.MaxTechnicalCommands) * 300;

        if (exploredProc) score += 600;

        if (filesRead > 12) score -= (filesRead - 12) * 100;

        return Math.Max(score, 5000);
    }
}

static class RateLimiter
{
    private static readonly ConcurrentDictionary<string, DateTime> LastSubmit = new();
    private static readonly TimeSpan Cooldown = TimeSpan.FromSeconds(60);
    private static readonly TimeSpan CleanupThreshold = TimeSpan.FromMinutes(5);

    public static bool TryAcquire(string ip)
    {
        Cleanup();

        var now = DateTime.UtcNow;
        if (LastSubmit.TryGetValue(ip, out var last) && now - last < Cooldown)
        {
            return false;
        }

        LastSubmit[ip] = now;
        return true;
    }

    internal static void Reset() => LastSubmit.Clear();

    private static void Cleanup()
    {
        var cutoff = DateTime.UtcNow - CleanupThreshold;
        foreach (var entry in LastSubmit)
        {
            if (entry.Value < cutoff)
            {
                LastSubmit.TryRemove(entry.Key, out _);
            }
        }
    }
}

static class HighscoreStore
{
    private const string HighscoreFile = "data/highscores.csv";
    public static readonly object FileLock = new();

    private static readonly string[] CsvHeaders =
    [
        "rank",
        "name",
        "score",
        "time",
        "filesRead",
        "commandsUsed",
        "date"
    ];

    public static void EnsureCreated()
    {
        Directory.CreateDirectory("data");
        if (!File.Exists(HighscoreFile))
        {
            using var writer = new StreamWriter(HighscoreFile, false, new UTF8Encoding(false));
            writer.WriteLine(string.Join(",", CsvHeaders));
        }
    }

    public static List<ScoreEntry> Read()
    {
        EnsureCreated();
        var scores = new List<ScoreEntry>();

        try
        {
            using var reader = new StreamReader(HighscoreFile, Encoding.UTF8);
            var headerLine = reader.ReadLine();
            if (string.IsNullOrWhiteSpace(headerLine))
            {
                return scores;
            }

            var headers = ParseCsvLine(headerLine);
            var headerMap = headers
                .Select((header, index) => new { header, index })
                .ToDictionary(item => item.header, item => item.index, StringComparer.OrdinalIgnoreCase);

            string? line;
            while ((line = reader.ReadLine()) != null)
            {
                if (string.IsNullOrWhiteSpace(line))
                {
                    continue;
                }

                var fields = ParseCsvLine(line);
                var name = GetField(fields, headerMap, "name");
                var scoreText = GetField(fields, headerMap, "score");

                if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(scoreText))
                {
                    continue;
                }

                scores.Add(new ScoreEntry(
                    name,
                    int.Parse(scoreText),
                    int.Parse(GetField(fields, headerMap, "time")),
                    int.Parse(GetField(fields, headerMap, "filesRead")),
                    int.Parse(GetField(fields, headerMap, "commandsUsed")),
                    GetField(fields, headerMap, "date")));
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error reading CSV: {ex.Message}");
            return [];
        }

        scores.Sort((a, b) => b.Score.CompareTo(a.Score));
        return scores.Take(Limits.MaxEntries).ToList();
    }

    public static void Write(List<ScoreEntry> scores)
    {
        EnsureCreated();

        scores.Sort((a, b) => b.Score.CompareTo(a.Score));
        var limited = scores.Take(Limits.MaxEntries).ToList();

        using var writer = new StreamWriter(HighscoreFile, false, new UTF8Encoding(false));
        writer.WriteLine(string.Join(",", CsvHeaders));

        for (var i = 0; i < limited.Count; i++)
        {
            var score = limited[i];
            var fields = new[]
            {
                (i + 1).ToString(),
                score.Name,
                score.Score.ToString(),
                score.Time.ToString(),
                score.FilesRead.ToString(),
                score.CommandsUsed.ToString(),
                score.Date
            };

            writer.WriteLine(string.Join(",", fields.Select(EscapeCsv)));
        }
    }

    private static string GetField(IReadOnlyList<string> fields, Dictionary<string, int> headerMap, string key)
    {
        if (!headerMap.TryGetValue(key, out var index))
        {
            return string.Empty;
        }

        return index >= 0 && index < fields.Count ? fields[index] : string.Empty;
    }

    private static List<string> ParseCsvLine(string line)
    {
        var result = new List<string>();
        var sb = new StringBuilder();
        var inQuotes = false;

        for (var i = 0; i < line.Length; i++)
        {
            var c = line[i];
            if (c == '"')
            {
                if (inQuotes && i + 1 < line.Length && line[i + 1] == '"')
                {
                    sb.Append('"');
                    i++;
                }
                else
                {
                    inQuotes = !inQuotes;
                }
            }
            else if (c == ',' && !inQuotes)
            {
                result.Add(sb.ToString());
                sb.Clear();
            }
            else
            {
                sb.Append(c);
            }
        }

        result.Add(sb.ToString());
        return result;
    }

    private static string EscapeCsv(string value)
    {
        if (value.Length > 0 && value[0] is '=' or '+' or '-' or '@')
        {
            value = "'" + value;
        }

        if (value.Contains('"'))
        {
            value = value.Replace("\"", "\"\"");
        }

        if (value.Contains(',') || value.Contains('"') || value.Contains('\n') || value.Contains('\r'))
        {
            return $"\"{value}\"";
        }

        return value;
    }
}

static class EmailNotifier
{
    private const string SmtpHost = "smtp.gmail.com";
    private const int SmtpPort = 587;

    public static bool TrySend(ScoreEntry score, int? rank, string action)
    {
        var smtpUser = Environment.GetEnvironmentVariable("SMTP_USER");
        var smtpPassword = Environment.GetEnvironmentVariable("SMTP_APP_PASSWORD");
        var smtpTo = Environment.GetEnvironmentVariable("SMTP_TO");
        var smtpFrom = Environment.GetEnvironmentVariable("SMTP_FROM") ?? smtpUser;

        if (string.IsNullOrWhiteSpace(smtpUser) ||
            string.IsNullOrWhiteSpace(smtpPassword) ||
            string.IsNullOrWhiteSpace(smtpTo) ||
            string.IsNullOrWhiteSpace(smtpFrom))
        {
            return false;
        }

        var recipients = smtpTo
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .ToList();

        if (recipients.Count == 0)
        {
            return false;
        }

        var subject = "Coffee Machine Debug - Highscore Updated";
        var lines = new[]
        {
            $"Player: {score.Name}",
            $"Score: {score.Score}",
            $"Time: {score.Time}s",
            $"Files Read: {score.FilesRead}",
            $"Commands Used: {score.CommandsUsed}",
            $"Rank: {(rank.HasValue ? rank.Value.ToString() : "N/A")}",
            $"Action: {action}",
            $"Date: {score.Date}"
        };
        var body = string.Join("\n", lines);

        try
        {
            using var message = new MailMessage
            {
                Subject = subject,
                Body = body,
                From = new MailAddress(smtpFrom)
            };

            foreach (var recipient in recipients)
            {
                message.To.Add(recipient);
            }

            using var client = new SmtpClient(SmtpHost, SmtpPort)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(smtpUser, smtpPassword)
            };

            client.Send(message);
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Email notification failed: {ex.Message}");
            return false;
        }
    }
}

sealed record ScoreEntry(
    string Name,
    int Score,
    int Time,
    int FilesRead,
    int CommandsUsed,
    string Date);

sealed class SubmitScoreRequest
{
    public string? Name { get; init; }
    public int Time { get; init; }
    public int FilesRead { get; init; }
    public int CommandsUsed { get; init; }
    public bool ExploredProc { get; init; }
    public List<string>? TechnicalCommands { get; init; }

    public bool TryValidate(out string errorMessage)
    {
        if (Time < 0 || Time > Limits.MaxTimeSeconds)
        {
            errorMessage = "Time out of allowed range";
            return false;
        }

        if (FilesRead < 0 || FilesRead > Limits.MaxFilesRead)
        {
            errorMessage = "Files read out of allowed range";
            return false;
        }

        if (CommandsUsed < 0 || CommandsUsed > Limits.MaxCommandsUsed)
        {
            errorMessage = "Commands used out of allowed range";
            return false;
        }

        errorMessage = string.Empty;
        return true;
    }
}

public partial class Program;
