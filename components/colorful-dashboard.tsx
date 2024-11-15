// "use client";

// import React, { useEffect, useState } from "react";
// import { createClient } from "@supabase/supabase-js";
// import { motion, AnimatePresence } from "framer-motion";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import {
//   Bell,
//   Users,
//   BarChart,
//   Search,
//   Calendar as CalendarIcon,
// } from "lucide-react";
// import { format } from "date-fns";
// import { Progress } from "@/components/ui/progress";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";

// // Initialize Supabase client
// const supabase = createClient(
//   "https://hmycjepeyhrpffqwvsoy.supabase.co",
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhteWNqZXBleWhycGZmcXd2c295Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkwOTc5NDAsImV4cCI6MjA0NDY3Mzk0MH0.IrtMTIIXHnXq_InAGhOy6WsSkea2Cn7tHV0xFyzxwqg"
// );

// const ColorfulDashboard: React.FC = () => {
//   const [recentAttendance, setRecentAttendance] = useState([]);
//   const [students, setStudents] = useState([]);
//   const [stats, setStats] = useState({ total: 0, present: 0, absent: 0 });
//   const [searchTerm, setSearchTerm] = useState("");
//   const [date, setDate] = useState<Date | undefined>(new Date());
//   const [attendanceRate, setAttendanceRate] = useState(0);
//   const [lateArrivals, setLateArrivals] = useState([]);
//   const [attendanceTrend, setAttendanceTrend] = useState([]);

//   useEffect(() => {
//     fetchAttendance();
//     fetchStudents();
//     fetchStats();
//     fetchLateArrivals();
//     fetchAttendanceTrend();

//     const channel = supabase
//       .channel("attendance_changes")
//       .on(
//         "postgres_changes",
//         { event: "INSERT", schema: "public", table: "attendance" },
//         (payload) => {
//           setRecentAttendance((current) => [
//             payload.new,
//             ...current.slice(0, 4),
//           ]);
//           fetchStats();
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, []);

//   useEffect(() => {
//     if (date) {
//       fetchAttendance();
//       fetchStats();
//       fetchLateArrivals();
//     }
//   }, [date]);

//   const fetchAttendance = async () => {
//     if (!date) return;
//     const { data } = await supabase
//       .from("attendance")
//       .select("*")
//       .gte("created_at", date.toISOString().split("T")[0])
//       .lt(
//         "created_at",
//         new Date(date.getTime() + 86400000).toISOString().split("T")[0]
//       )
//       .order("created_at", { ascending: false })
//       .limit(5);
//     setRecentAttendance(data || []);
//   };

//   const fetchStudents = async () => {
//     const { data } = await supabase.from("students").select("*");
//     setStudents(data || []);
//   };

//   const fetchStats = async () => {
//     if (!date) return;
//     const { data: totalStudents } = await supabase
//       .from("students")
//       .select("id", { count: "exact" });

//     const { data: presentToday } = await supabase
//       .from("attendance")
//       .select("student_id", { count: "exact", distinct: true })
//       .gte("created_at", date.toISOString().split("T")[0])
//       .lt(
//         "created_at",
//         new Date(date.getTime() + 86400000).toISOString().split("T")[0]
//       );

//     const absent = presentToday?.length || 0;
//     const total = totalStudents?.length || 0;
//     const present = total - absent;

//     setStats({ total, present, absent });
//     setAttendanceRate(total > 0 ? (present / total) * 100 : 0);
//   };

//   const fetchLateArrivals = async () => {
//     if (!date) return;
//     const { data } = await supabase
//       .from("attendance")
//       .select("*")
//       .gte("created_at", date.toISOString().split("T")[0])
//       .lt(
//         "created_at",
//         new Date(date.getTime() + 86400000).toISOString().split("T")[0]
//       )
//       .gt("arrival_time", "09:00:00")
//       .order("arrival_time", { ascending: false })
//       .limit(5);
//     setLateArrivals(data || []);
//   };

//   const fetchAttendanceTrend = async () => {
//     if (!date) return;
//     const startDate = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000);
//     const { data } = await supabase
//       .from("attendance")
//       .select("created_at")
//       .gte("created_at", startDate.toISOString().split("T")[0])
//       .lt(
//         "created_at",
//         new Date(date.getTime() + 86400000).toISOString().split("T")[0]
//       );

//     const trendData = Array.from({ length: 7 }, (_, i) => {
//       const day = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
//       const count =
//         data?.filter(
//           (record) =>
//             new Date(record.created_at).toDateString() === day.toDateString()
//         ).length || 0;
//       return { date: format(day, "EEE"), count };
//     });

//     setAttendanceTrend(trendData);
//   };

//   const filteredStudents = students.filter((student) =>
//     student.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const cardVariants = {
//     hover: { scale: 1.05, transition: { duration: 0.3 } },
//     tap: { scale: 0.95, transition: { duration: 0.3 } },
//   };

//   const listItemVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ duration: 0.5 }}
//       className="container mx-auto p-4 font-sans bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen"
//     >
//       <h1 className="text-4xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
//         Student Attendance Dashboard
//       </h1>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//         <motion.div variants={cardVariants} whileHover="hover" whileTap="tap">
//           <Card className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">
//                 Total Students
//               </CardTitle>
//               <Users className="h-4 w-4" />
//             </CardHeader>
//             <CardContent>
//               <motion.div
//                 className="text-2xl font-bold"
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ type: "spring", stiffness: 260, damping: 20 }}
//               >
//                 {stats.total}
//               </motion.div>
//             </CardContent>
//           </Card>
//         </motion.div>
//         <motion.div variants={cardVariants} whileHover="hover" whileTap="tap">
//           <Card className="bg-gradient-to-br from-green-500 to-teal-500 text-white">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">
//                 Present Today
//               </CardTitle>
//               <Bell className="h-4 w-4" />
//             </CardHeader>
//             <CardContent>
//               <motion.div
//                 className="text-2xl font-bold"
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ type: "spring", stiffness: 260, damping: 20 }}
//               >
//                 {stats.present}
//               </motion.div>
//             </CardContent>
//           </Card>
//         </motion.div>
//         <motion.div variants={cardVariants} whileHover="hover" whileTap="tap">
//           <Card className="bg-gradient-to-br from-red-500 to-pink-500 text-white">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">
//                 Absent Today
//               </CardTitle>
//               <BarChart className="h-4 w-4" />
//             </CardHeader>
//             <CardContent>
//               <motion.div
//                 className="text-2xl font-bold"
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ type: "spring", stiffness: 260, damping: 20 }}
//               >
//                 {stats.absent}
//               </motion.div>
//             </CardContent>
//           </Card>
//         </motion.div>
//       </div>

//       <div className="flex justify-between items-center mb-4">
//         <div className="flex items-center space-x-2">
//           <Input
//             type="text"
//             placeholder="Search students..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-64 bg-white/50 backdrop-blur-sm"
//           />
//           <Search className="h-4 w-4 text-gray-500" />
//         </div>
//         <Popover>
//           <PopoverTrigger asChild>
//             <Button
//               variant="outline"
//               className="w-[280px] justify-start text-left font-normal bg-white/50 backdrop-blur-sm"
//             >
//               <CalendarIcon className="mr-2 h-4 w-4" />
//               {date ? format(date, "PPP") : <span>Pick a date</span>}
//             </Button>
//           </PopoverTrigger>
//           <PopoverContent className="w-auto p-0">
//             <Calendar
//               mode="single"
//               selected={date}
//               onSelect={setDate}
//               initialFocus
//             />
//           </PopoverContent>
//         </Popover>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//         <motion.div variants={cardVariants} whileHover="hover" whileTap="tap">
//           <Card className="bg-white/50 backdrop-blur-sm">
//             <CardHeader>
//               <CardTitle className="text-purple-600">Attendance Rate</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-sm font-medium text-purple-600">
//                   {attendanceRate.toFixed(1)}%
//                 </span>
//                 <span className="text-sm text-gray-500">
//                   {stats.present}/{stats.total} students
//                 </span>
//               </div>
//               <Progress
//                 value={attendanceRate}
//                 className="w-full h-2 bg-purple-200"
//               />
//             </CardContent>
//           </Card>
//         </motion.div>
//         <motion.div variants={cardVariants} whileHover="hover" whileTap="tap">
//           <Card className="bg-white/50 backdrop-blur-sm">
//             <CardHeader>
//               <CardTitle className="text-blue-600">
//                 Attendance Trend (Last 7 Days)
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={200}>
//                 <LineChart data={attendanceTrend}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
//                   <XAxis dataKey="date" stroke="#666" />
//                   <YAxis stroke="#666" />
//                   <Tooltip />
//                   <Line
//                     type="monotone"
//                     dataKey="count"
//                     stroke="#8884d8"
//                     strokeWidth={2}
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </motion.div>
//       </div>

//       <Tabs defaultValue="recent" className="mb-6">
//         <TabsList className="bg-white/50 backdrop-blur-sm">
//           <TabsTrigger value="recent">Recent Attendance</TabsTrigger>
//           <TabsTrigger value="late">Late Arrivals</TabsTrigger>
//         </TabsList>
//         <TabsContent value="recent">
//           <Card className="bg-white/50 backdrop-blur-sm">
//             <CardHeader>
//               <CardTitle className="text-green-600">
//                 Recent Attendance
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ul className="space-y-4">
//                 <AnimatePresence>
//                   {recentAttendance.map((record: any) => (
//                     <motion.li
//                       key={record.id}
//                       variants={listItemVariants}
//                       initial="hidden"
//                       animate="visible"
//                       exit="hidden"
//                       className="flex items-center space-x-4 bg-white/30 p-2 rounded-lg"
//                     >
//                       <Avatar>
//                         <AvatarFallback className="bg-green-200 text-green-700">
//                           {record.student_name[0]}
//                         </AvatarFallback>
//                       </Avatar>
//                       <div>
//                         <p className="text-sm font-medium text-green-700">
//                           {record.student_name}
//                         </p>
//                         <p className="text-xs text-gray-500">
//                           {new Date(record.created_at).toLocaleTimeString()}
//                         </p>
//                       </div>
//                       <Badge
//                         variant="secondary"
//                         className="bg-green-100 text-green-700"
//                       >
//                         Present
//                       </Badge>
//                     </motion.li>
//                   ))}
//                 </AnimatePresence>
//               </ul>
//             </CardContent>
//           </Card>
//         </TabsContent>
//         <TabsContent value="late">
//           <Card className="bg-white/50 backdrop-blur-sm">
//             <CardHeader>
//               <CardTitle className="text-orange-600">Late Arrivals</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ul className="space-y-4">
//                 <AnimatePresence>
//                   {lateArrivals.map((record: any) => (
//                     <motion.li
//                       key={record.id}
//                       variants={listItemVariants}
//                       initial="hidden"
//                       animate="visible"
//                       exit="hidden"
//                       className="flex items-center space-x-4  bg-white/30 p-2 rounded-lg"
//                     >
//                       <Avatar>
//                         <AvatarFallback className="bg-orange-200 text-orange-700">
//                           {record.student_name[0]}
//                         </AvatarFallback>
//                       </Avatar>
//                       <div>
//                         <p className="text-sm font-medium text-orange-700">
//                           {record.student_name}
//                         </p>
//                         <p className="text-xs text-gray-500">
//                           Arrived at {record.arrival_time}
//                         </p>
//                       </div>
//                       <Badge
//                         variant="destructive"
//                         className="bg-orange-100 text-orange-700"
//                       >
//                         Late
//                       </Badge>
//                     </motion.li>
//                   ))}
//                 </AnimatePresence>
//               </ul>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>

//       <motion.div variants={cardVariants} whileHover="hover" whileTap="tap">
//         <Card className="bg-white/50 backdrop-blur-sm">
//           <CardHeader>
//             <CardTitle className="text-indigo-600">Student List</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ul className="space-y-4">
//               <AnimatePresence>
//                 {filteredStudents.map((student: any) => (
//                   <motion.li
//                     key={student.id}
//                     variants={listItemVariants}
//                     initial="hidden"
//                     animate="visible"
//                     exit="hidden"
//                     className="flex items-center justify-between bg-white/30 p-2 rounded-lg"
//                   >
//                     <div className="flex items-center space-x-4">
//                       <Avatar>
//                         <AvatarFallback className="bg-indigo-200 text-indigo-700">
//                           {student.name[0]}
//                         </AvatarFallback>
//                       </Avatar>
//                       <p className="text-sm font-medium text-indigo-700">
//                         {student.name}
//                       </p>
//                     </div>
//                     <Badge
//                       variant={student.is_present ? "success" : "destructive"}
//                       className={
//                         student.is_present
//                           ? "bg-green-100 text-green-700"
//                           : "bg-red-100 text-red-700"
//                       }
//                     >
//                       {student.is_present ? "Present" : "Absent"}
//                     </Badge>
//                   </motion.li>
//                 ))}
//               </AnimatePresence>
//             </ul>
//           </CardContent>
//         </Card>
//       </motion.div>
//     </motion.div>
//   );
// };

// export default ColorfulDashboard;

"use client";

import React, { useEffect, useCallback, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bell,
  Users,
  BarChart,
  Search,
  Calendar as CalendarIcon,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Initialize Supabase client
const supabase = createClient(
  "https://hmycjepeyhrpffqwvsoy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmeWNjZXBleWhycGZmcXd2c295Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkwOTc5NDAsImV4cCI6MjA0NDY3Mzk0MH0.IrtMTIIXHnXq_InAGhOy6WsSkea2Cn7tHV0xFyzxwqg"
);

export default function Dashboard() {
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [lateArrivals, setLateArrivals] = useState([]);
  const [attendanceTrend, setAttendanceTrend] = useState([]);

  useEffect(() => {
    fetchAttendance();
    fetchStudents();
    fetchStats();
    fetchLateArrivals();
    fetchAttendanceTrend();

    const channel = supabase
      .channel("attendance_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "attendance" },
        (payload) => {
          console.log("New attendance record:", payload.new);
          fetchAttendance();
          fetchStats();
          fetchLateArrivals();
          fetchAttendanceTrend();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (date) {
      fetchAllData();
    }
  }, [date]);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchAttendance(),
        fetchStudents(),
        fetchStats(),
        fetchLateArrivals(),
        fetchAttendanceTrend(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchAttendance = useCallback(async () => {
    if (!date) return;

    const { data, error } = await supabase
      .from("attendance_view")
      .select("*")
      .gte("timestamp", date.toISOString().split("T")[0])
      .lt(
        "timestamp",
        new Date(date.getTime() + 86400000).toISOString().split("T")[0]
      )
      .order("timestamp", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching attendance:", error);
      return;
    }

    setRecentAttendance(data || []);
  }, [date]);

  const fetchStudents = useCallback(async () => {
    const { data, error } = await supabase.from("students").select("*");
    if (error) {
      console.error("Error fetching students:", error);
      return;
    }
    setStudents(data || []);
  }, []);

  const fetchStats = useCallback(async () => {
    if (!date) return;

    const { data: totalStudents, error: totalError } = await supabase
      .from("students")
      .select("id", { count: "exact" });

    const { data: presentToday, error: presentError } = await supabase
      .from("attendance")
      .select("student_id", { count: "exact", distinct: true })
      .gte("timestamp", date.toISOString().split("T")[0])
      .lt(
        "timestamp",
        new Date(date.getTime() + 86400000).toISOString().split("T")[0]
      )
      .eq("status", "present");

    if (totalError || presentError) {
      console.error("Error fetching stats:", totalError || presentError);
      return;
    }

    const total = totalStudents?.length || 0;
    const present = presentToday?.length || 0;

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const currentTime = new Date();
    let absent = 0;

    if (currentTime > endOfDay) {
      absent = total - present;
    }

    setStats({ total, present, absent });
    setAttendanceRate(total > 0 ? (present / total) * 100 : 0);
  }, [date]);

  const fetchLateArrivals = useCallback(async () => {
    if (!date) return;

    const { data, error } = await supabase
      .from("attendance_view")
      .select("*")
      .gte("timestamp", date.toISOString().split("T")[0])
      .lt(
        "timestamp",
        new Date(date.getTime() + 86400000).toISOString().split("T")[0]
      )
      .gt("timestamp", `${date.toISOString().split("T")[0]}T09:00:00`)
      .order("timestamp", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching late arrivals:", error);
      return;
    }

    setLateArrivals(data || []);
  }, [date]);

  const fetchAttendanceTrend = useCallback(async () => {
    if (!date) return;
    const startDate = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from("attendance")
      .select("timestamp")
      .gte("timestamp", startDate.toISOString().split("T")[0])
      .lt(
        "timestamp",
        new Date(date.getTime() + 86400000).toISOString().split("T")[0]
      );

    if (error) {
      console.error("Error fetching attendance trend:", error);
      return;
    }

    const trendData = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const count =
        data?.filter(
          (record) =>
            new Date(record.timestamp).toDateString() === day.toDateString()
        ).length || 0;
      return { date: format(day, "EEE"), count };
    });

    setAttendanceTrend(trendData);
  }, [date]);

  const resetAttendance = useCallback(async () => {
    if (!date) return;

    const { error } = await supabase
      .from("attendance")
      .delete()
      .gte("timestamp", date.toISOString().split("T")[0])
      .lt(
        "timestamp",
        new Date(date.getTime() + 86400000).toISOString().split("T")[0]
      );

    if (error) {
      console.error("Error resetting attendance:", error);
      return;
    }

    fetchAllData();
  }, [date]);

  const recordAttendance = async (tagId: string) => {
    if (!date) return;

    const { data: existingAttendance, error: checkError } = await supabase
      .from("attendance")
      .select("id")
      .eq("tag_id", tagId)
      .gte("timestamp", date.toISOString().split("T")[0])
      .lt(
        "timestamp",
        new Date(date.getTime() + 86400000).toISOString().split("T")[0]
      )
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing attendance:", checkError);
      return;
    }

    if (existingAttendance) {
      console.log("Attendance already recorded for this tag today");
      return;
    }

    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("tag_id", tagId)
      .single();

    if (studentError) {
      console.error("Error fetching student for tag:", studentError);
      return;
    }

    const { error: insertError } = await supabase
      .from("attendance")
      .insert({
        tag_id: tagId,
        student_id: student.id,
        timestamp: new Date().toISOString(),
        status: "present",
      });

    if (insertError) {
      console.error("Error recording attendance:", insertError);
    } else {
      fetchAttendance();
      fetchStats();
      fetchLateArrivals();
      fetchAttendanceTrend();
    }
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cardVariants = {
    hover: { scale: 1.05, transition: { duration: 0.3 } },
    tap: { scale: 0.95, transition: { duration: 0.3 } },
  };

  const listItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 font-sans bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen"
    >
      <h1 className="text-4xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
        Student Attendance Dashboard
      </h1>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 bg-white/50 backdrop-blur-sm"
          />
          <Search className="h-4 w-4 text-gray-500" />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[280px] justify-start text-left font-normal bg-white/50 backdrop-blur-sm"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button
          onClick={resetAttendance}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset Attendance
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div variants={cardVariants} whileHover="hover" whileTap="tap">
          <Card className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <motion.div
                className="text-2xl font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                {stats.total}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={cardVariants} whileHover="hover" whileTap="tap">
          <Card className="bg-gradient-to-br from-green-500 to-teal-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Present Today
              </CardTitle>
              <Bell className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <motion.div
                className="text-2xl font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                {stats.present}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={cardVariants} whileHover="hover" whileTap="tap">
          <Card className="bg-gradient-to-br from-red-500 to-pink-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Absent Today
              </CardTitle>
              <BarChart className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <motion.div
                className="text-2xl font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                {stats.absent}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <motion.div variants={cardVariants} whileHover="hover" whileTap="tap">
          <Card className="bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-purple-600">Attendance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-600">
                  {attendanceRate.toFixed(1)}%
                </span>
                <span className="text-sm text-gray-500">
                  {stats.present}/{stats.total} students
                </span>
              </div>
              <Progress
                value={attendanceRate}
                className="w-full h-2 bg-purple-200"
              />
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={cardVariants} whileHover="hover" whileTap="tap">
          <Card className="bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-blue-600">
                Attendance Trend (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="recent" className="mb-6">
        <TabsList className="bg-white/50 backdrop-blur-sm">
          <TabsTrigger value="recent">Recent Attendance</TabsTrigger>
          <TabsTrigger value="late">Late Arrivals</TabsTrigger>
        </TabsList>
        <TabsContent value="recent">
          <Card className="bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-green-600">
                Recent Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <AnimatePresence>
                  {recentAttendance.map((record: any) => (
                    <motion.li
                      key={record.id}
                      variants={listItemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="flex items-center space-x-4 bg-white/30 p-2 rounded-lg"
                    >
                      <Avatar>
                        <AvatarFallback className="bg-green-200 text-green-700">
                          {record.student_name?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-green-700">
                          {record.student_name || "Unknown Student"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(record.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700"
                      >
                        {record.status}
                      </Badge>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="late">
          <Card className="bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-orange-600">Late Arrivals</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <AnimatePresence>
                  {lateArrivals.map((record: any) => (
                    <motion.li
                      key={record.id}
                      variants={listItemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="flex items-center space-x-4  bg-white/30 p-2 rounded-lg"
                    >
                      <Avatar>
                        <AvatarFallback className="bg-orange-200 text-orange-700">
                          {record.student_name?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-orange-700">
                          {record.student_name || "Unknown Student"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Arrived at{" "}
                          {new Date(record.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge
                        variant="destructive"
                        className="bg-orange-100 text-orange-700"
                      >
                        Late
                      </Badge>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <motion.div variants={cardVariants} whileHover="hover" whileTap="tap">
        <Card className="bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-indigo-600">Student List</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <AnimatePresence>
                {filteredStudents.map((student: any) => (
                  <motion.li
                    key={student.id}
                    variants={listItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="flex items-center justify-between bg-white/30 p-2 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback className="bg-indigo-200 text-indigo-700">
                          {student.name?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-medium text-indigo-700">
                        {student.name || "Unknown Student"}
                      </p>
                    </div>
                    <Badge
                      variant={student.is_present ? "success" : "destructive"}
                      className={
                        student.is_present
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }
                    >
                      {student.is_present ? "Present" : "Absent"}
                    </Badge>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
