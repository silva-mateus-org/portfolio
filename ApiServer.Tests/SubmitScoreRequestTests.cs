namespace ApiServer.Tests;

public class SubmitScoreRequestTests
{
    [Fact]
    public void TryValidate_ValidRequest_ReturnsTrue()
    {
        var request = new SubmitScoreRequest
        {
            Name = "Mateus",
            Time = 120,
            FilesRead = 8,
            CommandsUsed = 30,
            ExploredProc = true,
            TechnicalCommands = ["ps", "top"]
        };

        Assert.True(request.TryValidate(out var error));
        Assert.Empty(error);
    }

    [Fact]
    public void TryValidate_NegativeTime_ReturnsFalse()
    {
        var request = new SubmitScoreRequest { Time = -1, FilesRead = 5, CommandsUsed = 10 };
        Assert.False(request.TryValidate(out _));
    }

    [Fact]
    public void TryValidate_ExcessiveTime_ReturnsFalse()
    {
        var request = new SubmitScoreRequest
        {
            Time = Limits.MaxTimeSeconds + 1,
            FilesRead = 5,
            CommandsUsed = 10
        };
        Assert.False(request.TryValidate(out _));
    }

    [Fact]
    public void TryValidate_NegativeFilesRead_ReturnsFalse()
    {
        var request = new SubmitScoreRequest { Time = 100, FilesRead = -1, CommandsUsed = 10 };
        Assert.False(request.TryValidate(out _));
    }

    [Fact]
    public void TryValidate_ExcessiveFilesRead_ReturnsFalse()
    {
        var request = new SubmitScoreRequest
        {
            Time = 100,
            FilesRead = Limits.MaxFilesRead + 1,
            CommandsUsed = 10
        };
        Assert.False(request.TryValidate(out _));
    }

    [Fact]
    public void TryValidate_NegativeCommandsUsed_ReturnsFalse()
    {
        var request = new SubmitScoreRequest { Time = 100, FilesRead = 5, CommandsUsed = -1 };
        Assert.False(request.TryValidate(out _));
    }

    [Fact]
    public void TryValidate_ExcessiveCommandsUsed_ReturnsFalse()
    {
        var request = new SubmitScoreRequest
        {
            Time = 100,
            FilesRead = 5,
            CommandsUsed = Limits.MaxCommandsUsed + 1
        };
        Assert.False(request.TryValidate(out _));
    }

    [Fact]
    public void TryValidate_BoundaryValues_ReturnsTrue()
    {
        var request = new SubmitScoreRequest
        {
            Time = Limits.MaxTimeSeconds,
            FilesRead = Limits.MaxFilesRead,
            CommandsUsed = Limits.MaxCommandsUsed
        };
        Assert.True(request.TryValidate(out _));
    }

    [Fact]
    public void TryValidate_ZeroValues_ReturnsTrue()
    {
        var request = new SubmitScoreRequest
        {
            Time = 0,
            FilesRead = 0,
            CommandsUsed = 0
        };
        Assert.True(request.TryValidate(out _));
    }
}
