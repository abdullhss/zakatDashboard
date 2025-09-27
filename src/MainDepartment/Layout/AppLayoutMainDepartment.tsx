import { Outlet } from 'react-router'

import { chakra } from '@chakra-ui/react'
import SideBar from '../../features/DashboardUi/SideBar';
import PageHeader from '../../Components/HomePageHeader/PageHeader';


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

export default function DashboardLayout() {
  return (
    <StyledAppLayout>
      {/* <Header /> */}
       <PageHeader /> 
       <SideBar />

        <Main>
        <Outlet />
        </Main>
    </StyledAppLayout>
  )
}

