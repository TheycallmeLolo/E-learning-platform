import { Routes, Route } from 'react-router-dom';
import PrivateRoute from '../utils/PrivateRoute';

import Home               from '../pages/Home';
import Courses            from '../pages/Courses';
import CreateCourse       from '../pages/CreateCourse';
import ManageCourse       from '../pages/ManageCourse';
import Profile            from '../pages/Profile';
import NotFound           from '../pages/NotFound';
import AdminCourses       from '../pages/AdminCourses';
import Instructors        from '../pages/Instructors';
import InstructorDetail   from '../pages/InstructorDetail';
import SectionExperiences from '../pages/SectionExperiences';
import CreateExperience   from '../pages/CreateExperience';
import ExperienceDetail   from '../components/experiences/ExperienceDetail'; // ✅ جديد
import RoadmapPage from '../pages/RoadmapPage';

import Login               from '../components/auth/Login';
import Register            from '../components/auth/Register';
import CourseDetail        from '../components/courses/CourseDetail';
import StudentDashboard    from '../components/dashboard/StudentDashboard';
import InstructorDashboard from '../components/dashboard/InstructorDashboard';

const AppRoutes = () => (
  <Routes>
    <Route path="/"                  element={<Home />} />
    <Route path="/courses"           element={<Courses />} />
    <Route path="/courses/:id"       element={<CourseDetail />} />
    <Route path="/admin/courses"     element={<AdminCourses />} />
    <Route path="/login"             element={<Login />} />
    <Route path="/register"          element={<Register />} />
    <Route path="/instructors"       element={<Instructors />} />
    <Route path="/instructors/:id"   element={<InstructorDetail />} />
    <Route path="/roadmap"            element={<RoadmapPage />} />
    

    {/* Experiences */}
    <Route path="/experiences"         element={<SectionExperiences />} />
    <Route path="/experiences/:id"     element={<ExperienceDetail />} />  {/* ✅ */}
    <Route path="/experiences/create"
      element={<PrivateRoute requireInstructor={true}><CreateExperience /></PrivateRoute>} />

    <Route path="/courses/create"
      element={<PrivateRoute><CreateCourse /></PrivateRoute>} />
    <Route path="/courses/:id/manage"
      element={<PrivateRoute><ManageCourse /></PrivateRoute>} />
    <Route path="/dashboard/student"
      element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
    <Route path="/dashboard/instructor"
      element={<PrivateRoute requireInstructor={true}><InstructorDashboard /></PrivateRoute>} />
    <Route path="/profile"
      element={<PrivateRoute><Profile /></PrivateRoute>} />

    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;