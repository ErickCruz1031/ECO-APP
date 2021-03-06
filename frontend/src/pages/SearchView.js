import { filter } from 'lodash';
import { Icon } from '@iconify/react';
import { sentenceCase } from 'change-case';
import { useState, useEffect,useLocation } from 'react';
import plusFill from '@iconify/icons-eva/plus-fill';
import { Link as RouterLink } from 'react-router-dom';
// material
import {
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
  Typography,
  TableContainer,
  TablePagination,
  fabClasses
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
// components
import Page from '../components/Page';
import Label from '../components/Label';
import Scrollbar from '../components/Scrollbar';
import SearchNotFound from '../components/SearchNotFound';
import { UserListHead, UserListToolbar, UserMoreMenu } from '../components/_dashboard/user';
//
import { useAuth0 } from "@auth0/auth0-react";
import USERLIST from '../_mocks_/user';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'title', label: 'Title', alignRight: false },
  { id: 'author', label: 'Author', alignRight: false },
  { id: 'category', label: 'Category', alignRight: false },
  { id: 'publishdate', label: 'Published Date', alignRight: false },
  { id: 'rating', label: 'Average Rating (Max 5)', alignRight: false },
  { id: '' }
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

export default function SearchView({inputString}) {
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
  const [snackOpen, setSnackOpen] = useState(false);//Will be used to toggle whether or not the Snackbar gets shown
  const [warningOpen, setWarningOpen] = useState(false);//Will be used to toggle whether or not the Snackbar gets shown
  const [errorOpen, setErrorOpen] = useState(false);//Will be used to toggle whether or not the Snackbar gets shown


  useEffect(() =>{
    console.log("We are here in the SearchView with ", inputString);
    //TODO: Call Google Books API with the input as the parameter for the query
     const callBooksAPI = async () =>{
      console.log("Calling the books API");
      const query = `https://www.googleapis.com/books/v1/volumes?q=intitle:${inputString}&key=${booksKey}`
      console.log("The query in this component is ", query);
      const res = await fetch(query);
      const data = await res.json();
      console.log("This is the data from the books API:\n ", data);
      setResult(data.items);

      //TODO: Moving the API call to the the moment that we mount the Search View component
     }//Call Google API to fetch information

     const callAPI = async () =>{
      const domain = "dev--hn8vcuo.us.auth0.com";
      const accessToken = await getAccessTokenSilently({
        audience: `https://userAuth.com`,
        scope: "read:user",
      });
      console.log("This is the token: ", accessToken);
      setBearer(accessToken);
      }



     console.log("THE USER IN SEARCHVIEW IS ", user);
     console.log("Called to mount")
     //TODO: Might have to change this so that we can handle resubmissions for the search
  
     if (queryResult.length == 0 && inputString != null){
      callBooksAPI();
      callAPI();
     }
     
  //Maybe add a dependency on inputString?
  }, [inputString]);

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

  const handleSnackClose = (event, reason) =>{
    if (reason === 'clickaway'){
      return;
    }

    setSnackOpen(false);
    setWarningOpen(false);
    setErrorOpen(false);
  }



  const handleAdd = e =>{
    console.log("Adding books to the user list: ", selected);
    var added_books = []
    for(var i = 0; i < selected.length; i++){
      for(var j = 0; j < queryResult.length;j++){
        if (selected[i] == queryResult[j].etag){
          added_books.push(queryResult[j]);//Add the object with all the book information
          console.log("Added ", queryResult[j].volumeInfo.title)
        }
      }
    }//Loop to contruct the objects being added in the backend 

    const addCall = async () =>{
      var new_object = Object.assign({}, added_books);
      console.log("This is the arguments being added ", new_object);

      const response = await fetch(`http://localhost:8080/addbook`,{
        method: 'POST',
        headers:{
          "Authorization": `Bearer ${bearerToken}`,
          "Content-Type": 'application/json',
          "Accept": 'application/json'
          
          
        },
        body:JSON.stringify({
          books: new_object,
          username: user.nickname
        })
      });//Backend call to add the array of books into the MongoDB instance

      const data = await response.json();
      console.log("The book(s) have been added to the list with this response ", data);
      //setSnackOpen(true);//Show the notification letting user know that the books have been added
      setSelected([]);//After we add the books selected, we empty out the 'selected' array
      if(data.status == 200){
        console.log("The status was 200");
        setSnackOpen(true);
      } else if (data.status == 100){
        console.log("At least 2 of the book(s) was already in the user list");
        setWarningOpen(true);
      } else if (data.status == 500){
        console.log("There was an error during the add request");
        setErrorOpen(true);

      } else{
        console.log("Returned some other status not accounted for");
      }

    

    }
    addCall();//Call the backend to add objects to MongoDB 


  };//This function will handle the backend call to add the books to the list for this user

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - USERLIST.length) : 0;

  const filteredUsers = applySortFilter(USERLIST, getComparator(order, orderBy), filterName);

  const isUserNotFound = filteredUsers.length === 0;

  return (
    <>
    { (queryResult.length == 0) ?
                              
    <Box sx={{ width: '100%' }}>
      <LinearProgress />
    </Box>
    :
    <Page title="Search | Minimal-UI">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Search
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            onClick={handleAdd}
            to="#"
            startIcon={<Icon icon={plusFill} />}
          >
            Add Selected Books
          </Button>
        </Stack>

        <Card>
          <UserListToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
          />

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
                />
                  <TableBody>
                    {queryResult
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row) => {
                        const { id, name, role, status, company, avatarUrl, isVerified } = row;

                        console.log("WORKING WITH THIS ROW: ", row);
                        console.log("This is the value of the check ", row.volumeInfo.hasOwnProperty('imageLinks'));
                        console.log("This is the value for rating ", row.volumeInfo.averageRating)

                        const title = row.volumeInfo.title;
                        const author = row.volumeInfo.authors;//There might be more than 1 but just use the first one
                        const categories = row.volumeInfo.categories;
                        const publishDate = row.volumeInfo.publishedDate;

                        var rating;
                        if (row.volumeInfo.averageRating == null){
                          rating = 'Not Available'

                        }
                        else{
                          rating = row.volumeInfo.averageRating
                        }

                        const marker = row.etag;
                        //const thumbnail = "";//row.volumeInfo.imageLinks.smallThumbnail;
                        var thumbnail;
                        if (row.volumeInfo.hasOwnProperty('imageLinks')){
                          thumbnail = row.volumeInfo.imageLinks.smallThumbnail;
                        }
                        else{
                          thumbnail = "";

                        }
                        

                        const isItemSelected = selected.indexOf(marker) !== -1;

                        return (
                          <TableRow
                            hover
                            key={marker}
                            tabIndex={-1}
                            role="checkbox"
                            selected={isItemSelected}
                            aria-checked={fabClasses}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={isItemSelected}
                                onChange={(event) => handleClick(event, marker)}
                              />
                            </TableCell>
                            <TableCell component="th" scope="row" padding="none">
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar alt={title} src={thumbnail} />
                                <Typography variant="subtitle2" noWrap>
                                  {title}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell align="left">{author}</TableCell>
                            <TableCell align="left">{categories}</TableCell>
                            <TableCell align="left">{publishDate}</TableCell>
                            <TableCell align="left">
                              <Label
                                variant="ghost"
                                color={'success'}
                                color={(rating === 'Not Available' && 'error') || 'success'}
                              >
                                {rating}
                              </Label>
                            </TableCell>

                            <TableCell align="right">
                              <UserMoreMenu />
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

        <Snackbar open={snackOpen} autoHideDuration={6000} onClose={handleSnackClose} anchorOrigin={{vertical: 'top', horizontal: 'center' }}>
          <Alert onClose={handleSnackClose} severity="success" sx={{ width: '100%' }}>
            Book(s) successfully added to your list!
          </Alert>
      </Snackbar>

      <Snackbar open={warningOpen} autoHideDuration={6000} onClose={handleSnackClose} anchorOrigin={{vertical: 'top', horizontal: 'center' }}>
          <Alert onClose={handleSnackClose} severity="warning" sx={{ width: '100%' }}>
            At least 1 of the book(s) was not added because it's already on your list!
          </Alert>
      </Snackbar>

      <Snackbar open={errorOpen} autoHideDuration={6000} onClose={handleSnackClose} anchorOrigin={{vertical: 'top', horizontal: 'center' }}>
          <Alert onClose={handleSnackClose} severity="error" sx={{ width: '100%' }}>
            Error during the add request
          </Alert>
      </Snackbar>

      </Container>
    </Page>
  }
  </>
  );
}


