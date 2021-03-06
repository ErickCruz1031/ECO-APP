import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
// material
import { styled } from '@mui/material/styles';
//
import DashboardNavbar from './DashboardNavbar';
import DashboardSidebar from './DashboardSidebar';
import DashboardApp from '../../pages/DashboardApp';
import { useAuth0 } from "@auth0/auth0-react";

// ----------------------------------------------------------------------

const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 92;

const RootStyle = styled('div')({
  display: 'flex',
  minHeight: '100%',
  overflow: 'hidden'
});

const MainStyle = styled('div')(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  minHeight: '100%',
  paddingTop: APP_BAR_MOBILE + 24,
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.up('lg')]: {
    paddingTop: APP_BAR_DESKTOP + 24,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  }
}));

// ----------------------------------------------------------------------

export default function DashboardLayout({updateFunc}) {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated} = useAuth0();



  useEffect(() =>{
    //console.log("This is the value of the thing: ", isAuthenticated());

    //console.log("Calling function from layout");
    //updateFunc("Layer 1");

    if(isAuthenticated){
      console.log("This is the user from deeeez: ", user)

    }
    else{
      console.log("The function returned false and this is the user: ", user)
      if (user==null){
        console.log("This thing is NULL")
      }
    }
    
  });

  return (
    <RootStyle>
      <DashboardNavbar onOpenSidebar={() => setOpen(true)} userObject={user} updateSearchBook={updateFunc}/>
      <DashboardSidebar isOpenSidebar={open} onCloseSidebar={() => setOpen(false)} userObject={user}/>
      <MainStyle>
        <Outlet />  
      </MainStyle>
    </RootStyle>
  );
}

/*

    <RootStyle>
      <DashboardNavbar onOpenSidebar={() => setOpen(true)} />
      <DashboardSidebar isOpenSidebar={open} onCloseSidebar={() => setOpen(false)} />
      <MainStyle>
        <Outlet />
      </MainStyle>
    </RootStyle>



          <MainStyle>
        <DashboardApp />
      </MainStyle>

  */