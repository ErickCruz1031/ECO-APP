import { filter } from 'lodash';
import { Icon } from '@iconify/react';
import { sentenceCase } from 'change-case';
import { useState, useEffect,useLocation, useRef } from 'react';
import plusFill from '@iconify/icons-eva/plus-fill';
import { Link as RouterLink } from 'react-router-dom';
// material
import {
  Divider,
  Card,
  Table,
  Stack,
  Avatar,
  Button,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  MenuItem,
  Typography,
  TableContainer,
  TablePagination,
  fabClasses
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import BookPopover from '../components/BookPopover';


// components
import Page from '../components/Page';
import Label from '../components/Label';
import Scrollbar from '../components/Scrollbar';
import SearchNotFound from '../components/SearchNotFound';
import { UserListHead, UserListToolbar, UserMoreMenuList } from '../components/_dashboard/user';
//
import USERLIST from '../_mocks_/user';
import { useAuth0 } from "@auth0/auth0-react";

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'title', label: 'Title', alignRight: false },
  { id: 'author', label: 'Author', alignRight: false },
  { id: 'category', label: 'Category', alignRight: false },
  { id: 'dateadded', label: 'Date Added', alignRight: false },
  { id: 'status', label: 'Currently Reading?', alignRight: false },
  { id: '' }
];

// ----------------------------------------------------------------------

const MENU_OPTIONS = [
  {
    label: 'Update Progress',
    icon: 'homeFill',
    linkTo: '/'
  },
  {
    label: 'Finished?',
    icon: 'personFill',
    linkTo: '#'
  }
];






// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function UserList() {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [booksKey, setBooksKey] = useState("AIzaSyAd_ygAfqMtL2kbMXpsBd_9KPSxi_wwQn8");//Temporary only. Will store this in AWS Secrets manager
  const [queryResult, setResult] = useState([]);//This is where we will store the results from the Google API
  const [bearerToken, setBearer] = useState("");//Bearer token that will be used for backend calls
  const [searchingState, setSearchState] = useState(true);//Will tell us if we're fetching the list which we are in the beginning 
  const [popOverOpen, setPopoverOpen] = useState([]);//This will contain the IDs of the items whose popover should be open ; should not exceed 1
  const anchorRef = useRef(null);


  useEffect(() =>{
    console.log("We are here in the User List");
    //TODO: This will be the call that queries the MongoDB for user list

    const queryCall = async (token) =>{
      console.log("This is the user that we are looking for ", user.nickname);

      const response = await fetch(`http://localhost:8080/userlist`,{
        method: 'POST',
        headers:{
          "Authorization": `Bearer ${token}`,
          "Content-Type": 'application/json',
          "Accept": 'application/json'
          
          
        },
        body:JSON.stringify({
          username: user.nickname
        })
      });//Backend call to get the userlist for this user

      const content = await response.json();
      console.log("This is the list for this current user: ", content.data);
      setResult(content.data);// Set the variable state
      setSearchState(false);//Turn off the loading component

    }//Backend call to get the userlist for current user



    const callAPI = async () =>{
    const domain = "dev--hn8vcuo.us.auth0.com";
    const accessToken = await getAccessTokenSilently({
      audience: `https://userAuth.com`,
      scope: "read:user",
    });
    console.log("This is the token: ", accessToken);
    setBearer(accessToken);
    queryCall(accessToken);//Call the backend call with the new bearer token
    }//Call to get the Bearer token to make backend API calls


     console.log("Called to mount the UserList")
     console.log("The user in UserList is the following: ", user)
     
     if (queryResult.length == 0 && searchingState == true){
      callAPI(); //Get the bearer token and then call backend call
     }
     
     
 
  },[]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = queryResult.map((n) => n.volumeInfo.title);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    //event.target.checked = true;
    console.log("Selected with these parameters: ", event, " ", name);
    //return;
    
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    console.log("This is the new selected ", newSelected);
    setSelected(newSelected);
    
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };

  const handleDelete = bookID =>{
    console.log("Pressed the delete button from Userlist with ID ", bookID);

    const deleteCall = async () =>{
      console.log("This is the arguments being added ", bookID);

      const response = await fetch(`http://localhost:8080/removebook`,{
        method: 'POST',
        headers:{
          "Authorization": `Bearer ${bearerToken}`,
          "Content-Type": 'application/json',
          "Accept": 'application/json'
          
          
        },
        body:JSON.stringify({
          username: user.nickname,
          id: bookID
        })
      });//Backend call to add the array of books into the MongoDB instance

      const result = await response.json();
      console.log("This is the response: ", result);
      setResult(result.data);//Update the array being displayed with the new contents


    }

    deleteCall();
  }


  const handleRefresh = e =>{
    console.log("We are calling backend function to retrieve documents");

  }//Function to handle the refresh 

  const rowClick = (e, name) => {
    console.log("Clicked one of the Table Rows with the following title: ", name)

    const currentIndex = popOverOpen.indexOf(name);
    let newOpen = [];
    //event.target.checked = true;
    console.log("Selected with these parameters: ", e, " ", name);
    //return;
    
    if (currentIndex === -1) {
      newOpen = newOpen.concat(popOverOpen, name);
    } else if (currentIndex === 0) {
      newOpen = newOpen.concat(popOverOpen.slice(1));
    } else if (currentIndex === popOverOpen.length - 1) {
      newOpen = newOpen.concat(popOverOpen.slice(0, -1));
    } else if (currentIndex > 0) {
      newOpen = newOpen.concat(
        popOverOpen.slice(0, currentIndex),
        popOverOpen.slice(currentIndex + 1)
      );
    }

    console.log("This is the new selected ", newOpen);
    setPopoverOpen(newOpen);
  }

  const handlePopoverClose = e => {
    console.log("Closing the popover");
  }

  const popoverAction = (e, action) => {

    console.log("Called the function wit ", e, " and ", action);

  }

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - queryResult.length) : 0;

  const filteredUsers = applySortFilter(USERLIST, getComparator(order, orderBy), filterName);

  const isUserNotFound = filteredUsers.length === 0;

  return (

    <>
      { (searchingState == true)?
                              
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
      :
      <Page title="User List| Minimal-UI">
        <Container>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              User Book List
            </Typography>
          </Stack>
  
          <Card>
            <UserListToolbar
              numSelected={selected.length}
              filterName={filterName}
              onFilterName={handleFilterByName}
            />


            {(queryResult.length == 0) ? 


            <Stack sx={{ width: '100%' }} spacing={2}>
              <Alert severity="error">
                <AlertTitle>Error</AlertTitle>
                List for User is Empty
              </Alert>
            </Stack>

            :
          
  
            <Scrollbar>
              <TableContainer sx={{ minWidth: 800 }}>
                <Table>
                  <UserListHead
                    order={order}
                    orderBy={orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={queryResult.length}
                    numSelected={selected.length}
                    onRequestSort={handleRequestSort}
                    onSelectAllClick={handleSelectAllClick}
                    ref={anchorRef}
                  />
                  <TableBody>
                    {queryResult
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row) => {
                        //const { id, name, role, status, company, avatarUrl, isVerified } = row;


                        const title = row.title;
                        const author = row.author;
                        const category = row.category;
                        const date_added = row.date_added;
                        const currently_reading = row.currently_reading
                        const image_url = row.thumbnail;//Need to change this
                        const marker = row._id;
                        console.log("MAPPING THE USERLIST OBJECTS RIGHT NOW");

                        const isItemSelected = selected.indexOf(title) !== -1;
                        const isPopoverOpen = popOverOpen.indexOf(title) !== -1;
                        //const isPopoverOpen = true; //This will be true once the rest of the items are finished
  
                        return (
                          <TableRow
                            hover
                            key={marker}
                            onClick={(event) => rowClick(event, title)}
                            tabIndex={-1}
                            role="checkbox"
                            selected={isItemSelected}
                            aria-checked={isItemSelected}
                          >


                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={isItemSelected}
                                onChange={(event) => handleClick(event, title)}
                              />
                            </TableCell>
                            <TableCell component="th" scope="row" padding="none">
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar alt={title} src={image_url} />
                                <Typography variant="subtitle2" noWrap>
                                  {title}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell align="left">{author}</TableCell>
                            <TableCell align="left">{category}</TableCell>
                            <TableCell align="left">{date_added}</TableCell>
                            <TableCell align="left">
                              <Label
                                variant="ghost"
                                color={(currently_reading === 'banned' && 'error') || 'success'}
                              >
                                {currently_reading}
                              </Label>
                            </TableCell>
  
                            <TableCell align="right">
                              <UserMoreMenuList deleteFunc={handleDelete} id={marker}/>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    {emptyRows > 0 && (
                      <TableRow style={{ height: 53 * emptyRows }}>
                        <TableCell colSpan={6} />
                      </TableRow>
                    )}
                  </TableBody>
                  {isUserNotFound && (
                    <TableBody>
                      <TableRow>
                        <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                          <SearchNotFound searchQuery={filterName} />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  )}
                </Table>
              </TableContainer>
            </Scrollbar>
            }         
  
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={queryResult.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Card>
        </Container>
      </Page>
      }
    </>
  );
}


/*
{filteredUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => {
                      const { id, name, role, status, company, avatarUrl, isVerified } = row;
                      const isItemSelected = selected.indexOf(name) !== -1;
*/