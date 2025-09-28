import { Outlet } from 'react-router'

import { chakra } from '@chakra-ui/react'
import PageHeader from '../../Components/HomePageHeader/PageHeader';
import SideBarMainDepartment from '../../features/MainDashboardUi/SideBarMainDepartment';


const StyledAppLayout = chakra("div", {
  baseStyle: {
    display: "grid",
    minHeight   : "100vh",
    gridTemplateColumns: "314px 1fr",          
    gridTemplateRows: "72px 1fr",              
    gridTemplateAreas: `
      "sidebar header"
      "sidebar main"
    `,
    bg: "gray.50",
  },
});

const Main = chakra("main", {
  baseStyle: {
    gridArea: "main",
    p: 4,                  
    overflowY: "auto",
  },
});

export default function MainDashboardLayout() {
  return (
    <StyledAppLayout>

       <PageHeader /> 
       <SideBarMainDepartment />

        <Main>
        <Outlet />
        </Main>
    </StyledAppLayout>
  )
}

