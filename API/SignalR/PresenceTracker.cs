namespace API.SignalR;

public class PresenceTracker
{
    private static readonly Dictionary<string, List<string>> OnlineUsers =    //key value pair List of connection Ids for that user (same user diff device)
        new Dictionary<string, List<string>>();

    public Task<bool> UserConnected(string username, string connectionId) 
    {
        bool isOnline = false;
        lock(OnlineUsers)               // lock dictionary to prevent multiple users accessing dict at same time, queue system
        {
            if (OnlineUsers.ContainsKey(username))          // if already connected on another device, adds new id to dict
            {
                OnlineUsers[username].Add(connectionId);       // add value to dict key
            }
            else 
            {
                OnlineUsers.Add(username, new List<string>{connectionId});      // list is the value of the dict
                isOnline = true;
            }
        }
        return Task.FromResult(isOnline);
    }   

    public Task<bool> UserDisconnected(string username, string connectionId)
    {
        bool isOffline = false;

        lock(OnlineUsers)
        {
            if (!OnlineUsers.ContainsKey(username)) return Task.FromResult(isOffline);

            OnlineUsers[username].Remove(connectionId);

            if (OnlineUsers[username].Count == 0)
            {
                OnlineUsers.Remove(username);
                isOffline = true;               //Only change when removing last connection, not above
            }
        }

        return Task.FromResult(isOffline);
    }   

    public Task<string[]> GetOnlineUsers() 
    {
        string[] onlineUsers;

        lock(OnlineUsers)
        {
            onlineUsers = OnlineUsers.OrderBy(k => k.Key).Select(k => k.Key).ToArray();     // Alphabetical list of online users as array
        }

        return Task.FromResult(onlineUsers);
    }   

    public static Task<List<string>> GetConnectionsForUser(string username)
    {
        List<string> connectionIds;

        lock (OnlineUsers)
        {
            connectionIds = OnlineUsers.GetValueOrDefault(username);
        }

        return Task.FromResult(connectionIds);
    }
}
