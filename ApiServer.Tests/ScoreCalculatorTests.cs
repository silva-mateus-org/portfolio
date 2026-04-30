namespace ApiServer.Tests;

public class ScoreCalculatorTests
{
    [Fact]
    public void Calculate_BaseScore_Is10000()
    {
        var score = ScoreCalculator.Calculate(
            time: 300, filesRead: 20, commandsUsed: 10,
            exploredProc: false, technicalCommands: null);

        Assert.True(score >= 5000);
    }

    [Theory]
    [InlineData(60, 2000)]
    [InlineData(119, 2000)]
    [InlineData(120, 1100)]
    [InlineData(179, 1100)]
    [InlineData(180, 500)]
    [InlineData(239, 500)]
    [InlineData(240, 0)]
    [InlineData(500, 0)]
    public void Calculate_SpeedBonus_MatchesExpectedTier(int time, int expectedBonus)
    {
        var baseScore = ScoreCalculator.Calculate(
            time: 999, filesRead: 20, commandsUsed: 10,
            exploredProc: false, technicalCommands: null);

        var withBonus = ScoreCalculator.Calculate(
            time: time, filesRead: 20, commandsUsed: 10,
            exploredProc: false, technicalCommands: null);

        Assert.Equal(expectedBonus, withBonus - baseScore);
    }

    [Theory]
    [InlineData(3, 2000)]
    [InlineData(6, 2000)]
    [InlineData(7, 1500)]
    [InlineData(10, 1500)]
    [InlineData(11, 800)]
    [InlineData(15, 800)]
    [InlineData(16, 0)]
    public void Calculate_EfficiencyBonus_MatchesExpectedTier(int filesRead, int expectedBonus)
    {
        var baseScore = ScoreCalculator.Calculate(
            time: 999, filesRead: 50, commandsUsed: 10,
            exploredProc: false, technicalCommands: null);

        var withBonus = ScoreCalculator.Calculate(
            time: 999, filesRead: filesRead, commandsUsed: 10,
            exploredProc: false, technicalCommands: null);

        var penalty = filesRead > 12 ? (filesRead - 12) * 100 : 0;
        var basePenalty = 50 > 12 ? (50 - 12) * 100 : 0;

        Assert.Equal(expectedBonus, (withBonus + penalty) - (baseScore + basePenalty));
    }

    [Fact]
    public void Calculate_TechnicalCommands_Add300Each()
    {
        var without = ScoreCalculator.Calculate(
            time: 999, filesRead: 20, commandsUsed: 10,
            exploredProc: false, technicalCommands: null);

        var withTwo = ScoreCalculator.Calculate(
            time: 999, filesRead: 20, commandsUsed: 10,
            exploredProc: false, technicalCommands: ["ps aux", "top -n 1"]);

        Assert.Equal(600, withTwo - without);
    }

    [Fact]
    public void Calculate_InvalidTechnicalCommands_AreIgnored()
    {
        var without = ScoreCalculator.Calculate(
            time: 999, filesRead: 20, commandsUsed: 10,
            exploredProc: false, technicalCommands: null);

        var withInvalid = ScoreCalculator.Calculate(
            time: 999, filesRead: 20, commandsUsed: 10,
            exploredProc: false, technicalCommands: ["ls", "cat", "cd"]);

        Assert.Equal(0, withInvalid - without);
    }

    [Fact]
    public void Calculate_ExploredProc_Adds600()
    {
        var without = ScoreCalculator.Calculate(
            time: 999, filesRead: 20, commandsUsed: 10,
            exploredProc: false, technicalCommands: null);

        var with = ScoreCalculator.Calculate(
            time: 999, filesRead: 20, commandsUsed: 10,
            exploredProc: true, technicalCommands: null);

        Assert.Equal(600, with - without);
    }

    [Fact]
    public void Calculate_TooManyFiles_AppliesPenalty()
    {
        var at12 = ScoreCalculator.Calculate(
            time: 999, filesRead: 12, commandsUsed: 10,
            exploredProc: false, technicalCommands: null);

        var at15 = ScoreCalculator.Calculate(
            time: 999, filesRead: 15, commandsUsed: 10,
            exploredProc: false, technicalCommands: null);

        Assert.True(at12 > at15);
    }

    [Fact]
    public void Calculate_NeverBelowMinimum()
    {
        var score = ScoreCalculator.Calculate(
            time: 3600, filesRead: 500, commandsUsed: 1000,
            exploredProc: false, technicalCommands: null);

        Assert.Equal(5000, score);
    }

    [Fact]
    public void Calculate_MaxBonuses_ProducesHighScore()
    {
        var score = ScoreCalculator.Calculate(
            time: 60, filesRead: 3, commandsUsed: 5,
            exploredProc: true,
            technicalCommands: ["ps", "free", "top", "env", "systemctl"]);

        var expected = 10000 + 2000 + 2000 + (5 * 300) + 600;
        Assert.Equal(expected, score);
    }

    [Fact]
    public void Calculate_NullTechnicalCommands_DoesNotThrow()
    {
        var score = ScoreCalculator.Calculate(
            time: 100, filesRead: 5, commandsUsed: 10,
            exploredProc: false, technicalCommands: null);

        Assert.True(score > 0);
    }
}
