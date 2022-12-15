using System.Text.RegularExpressions;

namespace App
{

    struct Sensor
    {
        public int x;
        public int y;
        public int radius;
    }


    class Program
    {
        private static List<(int, int)> union(List<(int, int)> intervals)
        {
            var sortedIntervals = new List<(int, int)>(intervals);
            sortedIntervals.Sort();
            var result = new List<(int, int)>();
            foreach (var (l, r) in sortedIntervals)
            {
                if (result.Count == 0)
                {
                    result.Add((l, r));
                }
                else
                {
                    var (prevL, prevR) = result.Last();
                    if (prevR + 1 >= l)
                    {
                        result[result.Count - 1] = (prevL, Math.Max(r, prevR));
                    }
                    else
                    {
                        result.Add((l, r));
                    }
                }
            }
            return result;
        }
        static void Main()
        {
            //const string inputFile = "../../../15_test.txt";
            //const int maxX = 20;
            //const int maxY = 20;
            const string inputFile = "../../../15.txt";
            const int maxX = 4000000;
            const int maxY = 4000000;

            var inputRe = new Regex(@"Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)");
            var sensors = new List<Sensor>();
            foreach (var line in File.ReadLines(inputFile))
            {
                var match = inputRe.Match(line);
                var nums = match.Groups.Values.ToArray()[1..5].Select(g => int.Parse(g.Value)).ToList();
                var (sx, sy, bx, by) = (nums[0], nums[1], nums[2], nums[3]);
                var radius = Math.Abs(bx - sx) + Math.Abs(by - sy);
                sensors.Add(new Sensor { x = sx, y = sy, radius = radius });
            }

            var sTime = DateTime.Now;

            for (var targetY = 0; targetY <= maxY; ++targetY)
            {
                var intervals = new List<(int, int)>();
                foreach (var s in sensors)
                {
                    var radiusAtTargetY = s.radius - Math.Abs(s.y - targetY);
                    if (radiusAtTargetY >= 0)
                    {
                        intervals.Add((s.x - radiusAtTargetY, s.x + radiusAtTargetY));
                    }
                }
                var intervalUnion = union(intervals);
                for (var i = 0; i < intervalUnion.Count - 1; ++i)
                {
                    var (_, r0) = intervalUnion[i];
                    var (l1, _) = intervalUnion[i + 1];
                    if (l1 - r0 == 2)
                    {
                        var targetX = r0 + 1;
                        if (targetX >= 0 && targetX <= maxX)
                        {
                            Console.WriteLine("{0} {1} {2}", targetX, targetY, (long)targetX * 4000000 + targetY);
                        }
                    }
                }
            }
            Console.WriteLine("Time: {0}", DateTime.Now - sTime);
        }
    }
}