namespace ApiServer.Tests;

public class NameValidatorTests
{
    [Theory]
    [InlineData("Mateus")]
    [InlineData("Player_1")]
    [InlineData("John Doe")]
    [InlineData("user.name")]
    [InlineData("test-player")]
    [InlineData("ABC123")]
    public void IsValid_AcceptsCleanNames(string name)
    {
        Assert.True(NameValidator.IsValid(name));
    }

    [Theory]
    [InlineData("=CMD(\"calc\")")]
    [InlineData("+1234")]
    [InlineData("@SUM(A1)")]
    [InlineData("<script>alert(1)</script>")]
    [InlineData("name;DROP TABLE")]
    [InlineData("test'OR'1'='1")]
    [InlineData("user&admin")]
    [InlineData("hello!world")]
    [InlineData("test#tag")]
    [InlineData("path/../etc")]
    public void IsValid_RejectsUnsafeNames(string name)
    {
        Assert.False(NameValidator.IsValid(name));
    }

    [Theory]
    [InlineData("")]
    public void IsValid_RejectsEmptyString(string name)
    {
        Assert.False(NameValidator.IsValid(name));
    }
}
