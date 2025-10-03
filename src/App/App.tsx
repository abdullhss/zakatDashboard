import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../Pages/LoginPage";
import HomePage from "../Pages/HomePageMain";
import MainDashboardLayout from "../features/MainDepartment/Layout/AppLayoutMainDepartment";
import OfficeDashboardLayout from "../features/OfficeDashboard/Layout/AppLayoutOfficeDepartment";
import { RequireAuth } from "../auth/requireAuth";
import Cities from "../features/MainDepartment/Cities/Cities";
import Banks from "../features/MainDepartment/Banks/Banks";
import Office from "../features/MainDepartment/Offices/Office";
import AddOffice from "../features/MainDepartment/Offices/AddOffice";
import OfficeDetailsView from "../features/MainDepartment/Offices/OfficeAdded";
import SubventionTypes from "../features/MainDepartment/Subvention/SubventionTypes";
import KafaraValues from "../features/MainDepartment/Kafara/KafaraValues";
import ZakahTypes from "../features/MainDepartment/Zakah/ZakahTypes";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Main Dashboard - M */}
        <Route element={<RequireAuth allow={["M"]} />}>
          <Route path="/maindashboard" element={<MainDashboardLayout />}>
            <Route index element={<HomePage />} />
            <Route path="home" element={<HomePage />} />
            <Route path="cities" element={<Cities />} />
            <Route path="banks" element ={<Banks />} />
            <Route path="offices" element={<Office />} />
             <Route path="/maindashboard/offices/add" element={<AddOffice />} />
             <Route path="/maindashboard/offices/created" element={<OfficeDetailsView />} />
             <Route path="subventionTypes" element={<SubventionTypes />} />
             <Route path="kafara" element={<KafaraValues />}  />
             <Route path="zakah" element={<ZakahTypes />} />
          </Route>
        </Route>

        {/* Office Dashboard - O */}
        <Route element={<RequireAuth allow={["O"]} />}>
          <Route path="/officedashboard" element={<OfficeDashboardLayout />}>
            <Route index element={<HomePage />} />
            <Route path="home" element={<HomePage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<h1>404 | Page Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
