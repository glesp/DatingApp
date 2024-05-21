using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class FallbackController : Controller
{
    public ActionResult Index() 
    {
        return PhysicalFile(Path.Combine(Directory.GetCurrentDirectory(),       //instructing api server which serves index.html how to get routing from angular
            "wwwroot", "index.html"), "text/HTML");
    }
}
