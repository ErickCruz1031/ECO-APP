import faker from 'faker';
import PropTypes from 'prop-types';
import { Icon } from '@iconify/react';
import { formatDistance } from 'date-fns';
import { Link as RouterLink } from 'react-router-dom';
import arrowIosForwardFill from '@iconify/icons-eva/arrow-ios-forward-fill';
// material
import { Box, Stack, Link, Card, Button, Divider, Typography, CardHeader } from '@mui/material';
// utils
import { mockImgCover } from '../../../utils/mockImages';
//
import Scrollbar from '../../Scrollbar';
import { useEffect,useState } from 'react';

// ----------------------------------------------------------------------

const NEWS = [...Array(5)].map((_, index) => {
  const setIndex = index + 1;
  return {
    title: faker.name.title(),
    description: faker.lorem.paragraphs(),
    image: mockImgCover(setIndex),
    postedAt: faker.date.soon()
  };
});

// ----------------------------------------------------------------------


function BookItem({ book }) {
  const { book_image, title, description, updated_date , author} = book; //Extract this information from object
  //const { image, title, description, postedAt } = book;

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Box
        component="img"
        alt={title}
        src={book_image}
        sx={{ width: 48, height: 48, borderRadius: 1.5 }}
      />
      <Box sx={{ minWidth: 240 }}>
        <Link to="#" color="inherit" underline="hover" component={RouterLink}>
          <Typography variant="subtitle2" noWrap>
            {title}
          </Typography>
        </Link>
        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
          {description}
        </Typography>
      </Box>
      <Typography variant="caption" sx={{ pr: 3, flexShrink: 0, color: 'text.secondary' }}>
        {/* {formatDistance(updated_date, new Date())}*/}
        {author}
      </Typography>
    </Stack>
  );
}

function ReviewItem({ reviewObj }) {
  const { summary, pubDate, byline, url} = reviewObj; //Extract this information from object
  //const { book_image, title, description, updated_date , author} = book;
  var book_image = "";//Will need to figure out what to make this

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Box
        component="img"
        alt={byline}
        src={book_image}
        sx={{ width: 48, height: 48, borderRadius: 1.5 }}
      />
      <Box sx={{ minWidth: 240 }}>
        <Link to="#" color="inherit" underline="hover" component={RouterLink}>
          <Typography variant="subtitle2" noWrap>
            {byline}
          </Typography>
        </Link>
        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
          {summary}
        </Typography>
      </Box>
      <Typography variant="caption" sx={{ pr: 3, flexShrink: 0, color: 'text.secondary' }}>
        {/* {formatDistance(updated_date, new Date())}*/}
        {pubDate}
      </Typography>
    </Stack>
  );
}

//TODO: Pull the book list from the props. For now, we'll use the NEWS array as the inputs
//const AppBookSeachList = () => {
export default function AppBookReviews({bookName}) {
  //const [sliceFactor, setFactor] = useEffect(1);//We're going to slice the array passed by this factor on each page
  /*const [currentList, setList] = useState([{
    author: "Colleen Hoover",
    title: "IT ENDS WITH US",
    book_image: "https://storage.googleapis.com/du-prd/books/images/9781501110375.jpg",
    description: "A battered wife raised in a violent home attempts to halt the cycle of abuse.",
    updated_date: "2022-01-05 23:21:55"

   }]); //This will be the list of items displayed in the book search section*/
   const [currentList, setList] = useState([]);
   const [NYT_Key, setNYT] = useState("mEfQxnocskwDVVKNrJDNDIWmUHn13VBZ");//API key for NYT API (Temporary, will move to AWS secret manager)
   const [page, updatePage] = useState(0);//We are going to display the first list at the beginning
   const [queryResult, setResult] = useState([]);//This is where we will store all info from NYT
   const [reviews, setReviews] = useState([])
   const [listTitle, setTitle] = useState("")
  useEffect(() =>{
    //console.log("This is the props passed to the search component: \n", bookList[0]);
    //setList(bookList[0].books);
    console.log("We loaded the reviews component with this book: ", bookName);

    //console.log("We set the list to ", bookList[0].books.length);
    const callNYT = async () =>{
      //Might need to change this query so that it uses the ISBN number instead (Need to save it as well if thats teh case)
      const query = `https://api.nytimes.com/svc/books/v3/reviews.json?title=${bookName}&api-key=${NYT_Key}`
      //const query = `https://api.nytimes.com/svc/books/v3/lists/overview.json?api-key=${NYT_Key}`
      console.log("The NYT query in this component is ", query);
      const res = await fetch(query);
      const data = await res.json();
      console.log("This is the REVIEW from the NYT API:\n ", data);
      //setReviews(data.results.lists); 
      setList(data.results);
      setResult(data.results);//For now so we can test
      console.log("Loaded the information from NYT. Moving forward...")
    };

    if (currentList.length == 0)
    {
      callNYT();//Call the function to call NYTAPI
    }//Only call the API if the review list is empty


  },[]);

  const changePage = e => {
    e.preventDefault();
    console.log("Changing page");
    var newPage = page + 1; //Update new page
    if (newPage >= queryResult.length){
      console.log("No more pages left");
      return;
    }
    else{
      console.log("Updating the page to ", queryResult[newPage]);
      setList(queryResult[newPage].books); //Update the current list to show the next list from the results
      setTitle(queryResult[newPage].list_name);//Update the title shown on the list component
      updatePage(newPage);//Update the page to the new one we are seeing
      return;

    }
  }

  return (
    <Card>
      <CardHeader title= {bookName} />


      <Scrollbar>
        <Stack spacing={3} sx={{ p: 3, pr: 0 }}>
          {currentList.map((item) => (
            <ReviewItem key={item.title} reviewObj={item} />
          ))}
        </Stack>
      </Scrollbar>

      <Divider />

      <Box sx={{ p: 2, textAlign: 'right' }}>
        <Button
          to="#"
          size="small"
          color="inherit"
          component={RouterLink}
          endIcon={<Icon icon={arrowIosForwardFill} />}
          onClick = {changePage}
        >
          Next Page
        </Button>
      </Box>
    </Card>
  );
}

//export default AppBookSeachList;

/*
        <Stack spacing={3} sx={{ p: 3, pr: 0 }}>
          {currentList.map((item) => (
            <BookItem key={item.title} book={item} />
          ))}

*/