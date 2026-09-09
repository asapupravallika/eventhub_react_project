import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Events from "../pages/Events";
import Favorites from "../pages/Favorites";
import EventDetails from "../pages/EventDetails";
import AddEvent from "../pages/AddEvent";
import EditEvent from "../pages/EditEvent";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Logout from "../pages/Logout";
import Dashboard from "../pages/Dashboard";
import Booking from "../pages/Booking";
import Ticket from "../pages/Ticket";
import Reviews from "../pages/Reviews";
import OrganizerDashboard from "../pages/OrganizerDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import Calendar from "../pages/Calendar";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

export default function AppRoutes() {
  return <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/events" element={<Events />} />
    <Route path="/events/:id" element={<EventDetails />} />
    <Route path="/favorites" element={<Favorites />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/logout" element={<Logout />} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/booking/:id" element={<RoleRoute roles={["CUSTOMER"]}><Booking /></RoleRoute>} />
    <Route path="/ticket/:id" element={<RoleRoute roles={["CUSTOMER"]}><Ticket /></RoleRoute>} />
    <Route path="/reviews/:eventId" element={<RoleRoute roles={["CUSTOMER","ORGANIZER","ADMIN"]}><Reviews /></RoleRoute>} />
    <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
    <Route path="/organizer" element={<RoleRoute roles={["ORGANIZER","ADMIN"]}><OrganizerDashboard /></RoleRoute>} />
    <Route path="/admin" element={<RoleRoute roles={["ADMIN"]}><AdminDashboard /></RoleRoute>} />
    <Route path="/add-event" element={<RoleRoute roles={["ORGANIZER","ADMIN"]}><AddEvent /></RoleRoute>} />
    <Route path="/edit-event/:id" element={<RoleRoute roles={["ORGANIZER","ADMIN"]}><EditEvent /></RoleRoute>} />
  </Routes>;
}
