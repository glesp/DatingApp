﻿namespace API.Entities;

public class Connection
{
    public Connection()         //Entity framework also requires empty constructor to function
    {
        
    }
    public Connection(string connectionId, string username)
    {
        ConnectionId = connectionId;
        Username = username;

    }

    public string ConnectionId { get; set; }
    public string Username { get; set; }
}
