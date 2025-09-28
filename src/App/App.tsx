import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../Pages/LoginPage";
import HomePage from "../Pages/HomePageMain";
import MainDashboardLayout from "../MainDepartment/Layout/AppLayoutMainDepartment";
import OfficeDashboardLayout from "../OfficeDashboard/Layout/AppLayoutOfficeDepartment";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect للّوجين */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Main Dashboard */}
        <Route path="/maindashboard" element={<MainDashboardLayout />}>
          <Route index element={<HomePage />} />
          <Route path="home" element={<HomePage />} />
        </Route>

        {/* Office Dashboard */}
        <Route path="/officedashboard" element={<OfficeDashboardLayout />}>
        <Route index element={<HomePage />} />
          <Route path="home" element={<HomePage />} />

        </Route>

        {/* 404 */}
        <Route path="*" element={<h1>404 | Page Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
