namespace ApiServer.Tests;

public class RateLimiterTests
{
    [Fact]
    public void TryAcquire_FirstRequest_Succeeds()
    {
        var ip = $"first-{Guid.NewGuid()}";
        Assert.True(RateLimiter.TryAcquire(ip));
    }

    [Fact]
    public void TryAcquire_ImmediateSecondRequest_Fails()
    {
        var ip = $"dup-{Guid.NewGuid()}";
        RateLimiter.TryAcquire(ip);
        Assert.False(RateLimiter.TryAcquire(ip));
    }

    [Fact]
    public void TryAcquire_DifferentIPs_BothSucceed()
    {
        var ip1 = $"a-{Guid.NewGuid()}";
        var ip2 = $"b-{Guid.NewGuid()}";

        Assert.True(RateLimiter.TryAcquire(ip1));
        Assert.True(RateLimiter.TryAcquire(ip2));
    }
}
