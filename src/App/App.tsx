// src/routes/App.tsx
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "../Pages/LoginPage";
import HomePage from "../Pages/HomePageMain";

import MainDashboardLayout from "../features/MainDepartment/Layout/AppLayoutMainDepartment";
import OfficeDashboardLayout from "../features/OfficeDashboard/Layout/AppLayoutOfficeDepartment";
import { RequireAuth } from "../auth/requireAuth";

// صفحات الإدارة (M)
import Cities from "../features/MainDepartment/Cities/Cities";
import Banks from "../features/MainDepartment/Banks/Banks";
import Office from "../features/MainDepartment/Offices/Office";
import AddOffice from "../features/MainDepartment/Offices/AddOffice";
import OfficeDetailsView from "../features/MainDepartment/Offices/OfficeAdded";
import EditOffice from "../features/MainDepartment/Offices/EditOffice";
import SubventionTypes from "../features/MainDepartment/Subvention/SubventionTypes";
import KafaraValues from "../features/MainDepartment/Kafara/KafaraValues";
import ZakahTypes from "../features/MainDepartment/Zakah/ZakahTypes";
import Privileges from "../features/MainDepartment/Privelges/PrivelgesTypes";
import AddPrivelges from "../features/MainDepartment/Privelges/AddPrivelges";
import UpdatePrivileges from "../features/MainDepartment/Privelges/updatePrivelgesPage";
import Users from "../features/MainDepartment/Users/Users";
import UserCreated from "../features/MainDepartment/Users/userCreated";
import AddUserPage from "../features/MainDepartment/Users/AddUserForm";
import ZakahGoldValues from "../features/MainDepartment/ZakahGold/ZakahGoldValues";
import SacrificeDataTypes from "../features/MainDepartment/SacrificeData/SacrificeDataTypes";
import AssistanceDataTypes from "../features/MainDepartment/AssistanceData/AssistanceDataTypes";
import GetCampaignData from "../features/MainDepartment/GetCashCampaign/getCampaignData";

// صفحات المكتب (O)
import UsersOffice from "../features/OfficeDashboard/Users/UsersOffice";
import PrivelgesOfficeTypes from "../features/OfficeDashboard/PrivelegesOffice/PrivelgesOfficeTypes";
import CampaignOffice from "../features/OfficeDashboard/CashCampaignOffice/CampaignOffice";

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
            <Route path="banks" element={<Banks />} />

            <Route path="offices" element={<Office />} />
            <Route path="offices/add" element={<AddOffice />} />
            <Route path="offices/created" element={<OfficeDetailsView />} />
            <Route path="offices/edit/:id" element={<EditOffice />} />

            <Route path="subventionTypes" element={<SubventionTypes />} />
            <Route path="kafara" element={<KafaraValues />} />
            <Route path="zakah" element={<ZakahTypes />} />

            <Route path="privelges" element={<Privileges />} />
            <Route path="privelges/add" element={<AddPrivelges />} />
            <Route path="privelges/update" element={<UpdatePrivileges />} />

            <Route path="users" element={<Users />} />
            <Route path="users/add" element={<AddUserPage />} />
            <Route path="users/edit/:id" element={<AddUserPage />} />
            <Route path="users/created" element={<UserCreated />} />

            <Route path="zakatGold" element={<ZakahGoldValues />} />
            <Route path="sacirificeTypes" element={<SacrificeDataTypes />} />
            <Route path="assistanceData" element={<AssistanceDataTypes />} />
            <Route path="campaign" element={<GetCampaignData />} />
          </Route>
        </Route>

        {/* Office Dashboard - O */}
        <Route element={<RequireAuth allow={["O"]} />}>
          <Route path="/officedashboard" element={<OfficeDashboardLayout />}>
            <Route index element={<HomePage />} />
            <Route path="home" element={<HomePage />} />

            {/* قائمة مستخدمي المكتب + نفس فورم الإضافة/التعديل */}
            <Route path="usersOffice" element={<UsersOffice />} />
            <Route path="usersOffice/add" element={<AddUserPage />} />
            <Route path="users/edit/:id" element={<AddUserPage />} />

            <Route path="privelgesOffice" element={<PrivelgesOfficeTypes />} />
               <Route path="privelgesOffice/add" element={<AddPrivelges />} />

               <Route path="campaignOffice" element={<CampaignOffice />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<h1>404 | Page Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
