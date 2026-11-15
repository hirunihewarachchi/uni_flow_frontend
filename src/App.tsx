
import {BrowserRouter,Routes,Route,Navigate,} from "react-router-dom";

import MainLayouts from "./components/layout/MainLayouts";
import Dashboard from "./pages/Dashboard";
import Course from "./pages/Course";
import Department from "./pages/Department";
import Enrollment from "./pages/Enrollment";
import SkillGaps from "./pages/SkillGaps";
import CareerRoadmap from "./pages/CareerRoadmap";
import Finance from "./pages/Finance";
import ExamTimetable from "./pages/ExamTimeTable";
import Results from "./pages/Results";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgetPassword";


function App() {
  return (
    <BrowserRouter>
      <Routes>
  <Route element={<MainLayouts />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/courses" element={<Course />} />
    <Route path="/departments" element={<Department />} />
    <Route path="/enrollment" element={<Enrollment />} />
    <Route path="/skill-gaps" element={<SkillGaps />} />
    <Route path="/career-roadmap" element={<CareerRoadmap />} />
    <Route path="/finance" element={<Finance />} />
    <Route path="/exam-timetable" element={<ExamTimetable />} />
    <Route path="/results" element={<Results />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    
  </Route>
</Routes>
    </BrowserRouter>
  );
}

export default App;
