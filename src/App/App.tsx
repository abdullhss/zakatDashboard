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
import GetProjects from "../features/OfficeDashboard/Projects/GetProjects";
import AddProjectForm from "../features/OfficeDashboard/Projects/addProjectForm";
import SacrificeDashData from "../features/OfficeDashboard/SacrificesData/getSacrificesData";
import GetSacrificeDataMain from "../features/MainDepartment/GetDashSacrificesData/getDashSacrificesMain";
import GetDashPaymentData from "../features/OfficeDashboard/PaymentData/getDashPaymentData";
import PaymentDetails from "../features/OfficeDashboard/PaymentData/PaymentDetails";
import GetNewsData from "../features/OfficeDashboard/NewsData/getNewsData";
import NewsTypesPage from "../features/OfficeDashboard/NewsData/getNewsTypes";
import AddNewsData from "../features/OfficeDashboard/NewsData/AddNewsData";
// import AboutUs from "../features/MainDepartment/ProgramData/AboutUs";
import UpdatePrivilege from "../features/MainDepartment/Privelges/getGroupRightFeatures";
import AboutUs from "../features/MainDepartment/AboutUs/ContactUsNow";
import LawsData from "../features/MainDepartment/Laws/LawsData";
import AddLaw from "../features/MainDepartment/Laws/AddLaw";
import ContactUs from "../features/MainDepartment/ProgramData/ContactUs";
import UseConditions from "../features/MainDepartment/ProgramData/UseConditions";
import WhoAreWe from "../features/MainDepartment/ProgramData/WhoAreWe";
import GroupRightFeaturesPage from "../features/OfficeDashboard/PrivelegesOffice/GroupRightFeaturesPageOffice";
import TransferData from "../features/OfficeDashboard/TransferBanksData/TransferData";
import AddTransferData from "../features/OfficeDashboard/TransferBanksData/AddTransferData";
import GetPaymentData from "../features/OfficeDashboard/DashPaymentData/GetPaymentData";
import AddPaymentData from "../features/OfficeDashboard/DashPaymentData/addPaymentDashData";
import GetStatmentData from "../features/OfficeDashboard/StatementData/GetStatmentData";
import ContactUsNow from "../features/MainDepartment/AboutUs/ContactUsNow";
import PrivacyPolicy from "../features/MainDepartment/ProgramData/PrivaryPolicy";
import { useEffect } from "react";
import UrgentProjects from "../features/MainDepartment/UrgentProject/UrgentProjects";
import UsersQuestions from "../features/MainDepartment/UsersQuestions/UsersQuestions";
import CommonQuestions from "../features/MainDepartment/CommonQuestions/CommonQuestions";
import AddQuestion from "../features/MainDepartment/CommonQuestions/AddQuestion";
export default function App() {
  useEffect(() => {
    const now = Date.now();
    const lastVisit = localStorage.getItem("lastVisit");

    if (!lastVisit || now - lastVisit > 60 * 60 * 1000) {
      localStorage.clear();
    }

    // حدّث وقت آخر زيارة
    localStorage.setItem("lastVisit", now);
  }, []);
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
            <Route path="offices/edit/:id" element={<AddOffice />} />
            <Route path="subventionTypes" element={<SubventionTypes />} />
            <Route path="kafara" element={<KafaraValues />} />
            <Route path="zakah" element={<ZakahTypes />} />
            <Route path="privelges" element={<Privileges />} />
            <Route path="privelges/add" element={<AddPrivelges />} />
            <Route path="/maindashboard/privelges/update" element={<UpdatePrivilege />} />

            <Route path="users" element={<Users />} />
            <Route path="users/add" element={<AddUserPage />} />
            <Route path="users/edit/:id" element={<AddUserPage />} />
            <Route path="users/created" element={<UserCreated />} />
            <Route path="zakatGold" element={<ZakahGoldValues />} />
            <Route path="sacirificeTypes" element={<SacrificeDataTypes />} />
            <Route path="assistanceData" element={<AssistanceDataTypes />} />
            <Route path="campaign" element={<GetCampaignData />} />
            <Route path="sacrificeDataMain" element={<GetSacrificeDataMain />} />
            <Route path="aboutus" element={<AboutUs />} />
            <Route path="laws" element={<LawsData />} />
            <Route path="laws/add" element={<AddLaw />} />
            {/* <Route path="contactus" element={<ContactUs />} /> */}
            <Route path="conditions" element={<UseConditions />} />
            <Route path="whoarewe" element={<WhoAreWe />} />
            <Route path="ContactUs" element={ <ContactUsNow />}/>
            <Route path="privarypolicy" element={<PrivacyPolicy />} />
            <Route path="UrgentProjects" element={<UrgentProjects/>} />
            <Route path="CommonQuestions" element={<CommonQuestions />} />
            <Route path="CommonQuestions/add" element={<AddQuestion />} />
            <Route path="UsersQuestions" element={<UsersQuestions />} />
          </Route>
        </Route>

 {/* Office Dashboard - O */}
<Route element={<RequireAuth allow={["O"]} />}>
  <Route path="/officedashboard" element={<OfficeDashboardLayout />}>
    <Route index element={<HomePage />} />
    <Route path="home" element={<HomePage />} />
    <Route path="usersOffice" element={<UsersOffice />} />
    <Route path="usersOffice/add" element={<AddUserPage />} />
    <Route path="users/edit/:id" element={<AddUserPage />} />
    <Route path="privelgesOffice" element={<PrivelgesOfficeTypes />} />
    <Route path="privelgesOffice/add" element={<AddPrivelges />} />
    <Route path="/officedashboard/privelges/update" element={<UpdatePrivilege />} />
    <Route path="group-right-features" element={<GroupRightFeaturesPage />} /> 
    <Route path="campaignOffice" element={<CampaignOffice />} />
    <Route path="projects" element={<GetProjects />} />
    <Route path="projects/add" element={<AddProjectForm />} />
    <Route path="sacrificesDashData" element={<SacrificeDashData />} />
    <Route path="paymentData" element={<GetDashPaymentData />} />
    <Route path="newsdata" element={<GetNewsData />} />
    <Route path="newsdata/add" element={<AddNewsData />} />
    <Route path="news-types" element={<NewsTypesPage />}  />
    <Route path="payment-details/:paymentId" element={<PaymentDetails />} />
    <Route path="transferdata" element={<TransferData />} />
    <Route path="transferdata/add" element={<AddTransferData />} />
    <Route path="dashpayment" element={<GetPaymentData />} />
    <Route path="dashpayment/add" element={<AddPaymentData />} />
    <Route path="statement" element={<GetStatmentData />} />
    <Route path="sacrificeDataMain" element={<GetSacrificeDataMain />} />
    <Route path="assistanceData" element={<AssistanceDataTypes />} />


  </Route>
</Route>

        {/* 404 */}
        <Route path="*" element={<h1>404 | Page Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
