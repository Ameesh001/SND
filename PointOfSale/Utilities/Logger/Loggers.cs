using Microsoft.Extensions.Configuration;

namespace PointOfSale.Utilities.Logger
{
    public class Loggers
    {

        public void LogWriter(string msg)
        {
            var MyConfig = new ConfigurationBuilder().AddJsonFile("appsettings.json").Build();
            var str = MyConfig.GetValue<string>("AppSettings:logWrite");
            var path = MyConfig.GetValue<string>("AppSettings:logPath");

            if (str == "TRUE")
            {
                try
                {
                    string CurrentPath = path + "\\GatePassLogs";

                    if (!Directory.Exists(CurrentPath))
                    {
                        Directory.CreateDirectory(CurrentPath);
                    }

                    CurrentPath = CurrentPath + "\\" + DateTime.Now.ToString("ddMMyyyy") + "_log.txt";
                    if (!File.Exists(CurrentPath))
                    {
                        File.Create(CurrentPath).Close();
                    }
                    StreamWriter logWriter = new StreamWriter(CurrentPath, true);
                    logWriter.WriteLine(DateTime.Now.ToString("hh:mm:ss") + " : " + msg);
                    logWriter.Close();
                    logWriter.Dispose();

                }
                catch (Exception ex)
                {
                    try
                    {
                        string CurrentPath = @"C:\GatePassLogs";

                        if (!Directory.Exists(CurrentPath))
                        {
                            Directory.CreateDirectory(CurrentPath);
                        }
                        CurrentPath = CurrentPath + "\\" + DateTime.Now.ToString("ddMMyyyy") + "_log.txt";
                        if (!File.Exists(CurrentPath))
                        {
                            File.Create(CurrentPath).Close();
                        }
                        StreamWriter logWriter = new StreamWriter(CurrentPath, true);
                        logWriter.WriteLine(DateTime.Now.ToString("hh:mm:ss") + " : " + ex);
                        logWriter.Close();
                        logWriter.Dispose();
                    }
                    catch (Exception)
                    {
                    }
                }
            }
        }

    }
}
