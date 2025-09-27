import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import LoginPage from "../Pages/LoginPage"
import HomePage from "../Pages/HomePageMain"
import DashboardLayout from "../MainDepartment/Layout/AppLayoutMainDepartment"


function App() {``

  return (
<BrowserRouter>
<Routes>

<Route path="/" element={<Navigate to="/login" replace />} />
 <Route path="/login" element={<LoginPage />} />
    
<Route path="/dashboard" element={<DashboardLayout />}>
 <Route path="home" element={<HomePage />} /> 
        
 </Route>
    
    {/* مسار احتياطي للخطأ (اختياري) */}
    <Route path="*" element={<h1>404 | Page Not Found</h1>} />
</Routes>
</BrowserRouter>

  )
}

export default App
