using System.ComponentModel.DataAnnotations;

namespace API.Entities;

public class Group
{
    public Group()      // empty ctor for entity framework
    {
    }

    public Group(string name)
    {
        Name = name;
    }

    [Key]
    public string Name { get; set; }
    public ICollection<Connection> Connections { get; set; } = new List<Connection>();

}
