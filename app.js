
// requiring different modules
const express = require('express');     // framework of node
const bodyParser = require('body-parser'); // for acquiring data form website into server site
const mongoose = require('mongoose'); // for connecting mongodb(database) with node
const _ = require('lodash'); // for capitalizing the first letter of word(remaining will be small)
const app = express();



app.set('view engine', 'ejs'); //for initilizing ejs in code
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));   // to use css file which is in our computer locally(in public folder)
// var items = ['making food',
//   'buying food',
//    'eating food']; // an array for storing the users new item






// connecting mongoose with node(our project)
mongoose.connect('mongodb://127.0.0.1:27017/ToDoListDB',
{
 useNewUrlParser: true,
 // useFindAndModify: false,
 useUnifiedTopology: true
}, function(err){
 if(err){
   console.log(err);
 }
 else{
   console.log("Succesflly connected to the database!");
 }
}
);







// preparing structure of database(schema)
// schema for dafault list(main page)
const newItemSchema = new mongoose.Schema({
  name :  String
});

// schema for custom list(school,home etc)
const ListSchema = new mongoose.Schema({
  name : String,
  items : [newItemSchema]
});






// creating model of database(means collection name)
// collction of main page items
const newItems = mongoose.model("newItems", newItemSchema);
// collection of custom list items
const List = mongoose.model("List", ListSchema);





// creating documents for collection: newItems
const item1 = new newItems({
  name : "Welcome to your To-Do-List"
});
const item2 = new newItems({
  name : "Hit + button to add new items."
});
const item3 = new newItems({
  name : "<-- Hit this to delete an item."
});










const defaultItems = [item1, item2, item3]; //an array contains all item of newitems collection
const foundItems = []  // an empty array for adding items




// this app.get for rendering homepage(today)
//  rendering data to homepage(website)
app.get('/', function(req, res){
  // finding documents from database
  newItems.find({}, function(err,foundItems){

    if (foundItems.length === 0){
      // adding documents to our model or collection(newItems)
      newItems.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else
        {
          console.log("Items added succesfully.");
        }
      });
  res.redirect('/')   //then redirecting to homepage again
    }else{
      // its render the heading(Today) from ejs file to the website with name of items of collection newitems
      res.render('list', {kindofday: "Today", newItems: foundItems});
    }
      });

 });









// and this app.get is to render custom pages.
 app.get('/:customListName', function(req, res){
   const customListName = _.capitalize(req.params.customListName); // taking the name of name section of List collection(entered by user in search bar)

    List.findOne({name : customListName}, function(err, foundList){
      if(err){
        console.log(err);
      }else{
        if(!foundList){ //if foundList empty
          // console.log('doesnt exist');
          const list = new List({
            name : customListName,
            items : defaultItems
          });
          list.save();
          res.redirect('/'+customListName);
        }else{
         res.render('list', {kindofday: foundList.name, newItems: foundList.items});
        }
      }
    });
 });








 // taking data which is added in website by user to the server
app.post('/', function(req, res){

  var item = req.body.usersInput;   // var item contains item name means task which user add in their list
  const listName = req.body.list;  // const listName contains name of different list wich user will create(school, home etc)

  var item = new newItems({   // creating the document of usersInput item.
    name : item
  });
  if(listName === 'Today'){    // checking website page is homepage(today) or anyother page like school, hoeme etc
                              // if it is homepage(Today) then..
    item.save();              // users added data will be saved in newItems collection.
    res.redirect('/')           // after than will be redirected to the homepage(added item will be visible)

  }else{                 // if website page is not homepage(today), then

    List.findOne({name : listName}, function(err, foundList) //we will find document in list collection(which contains :
       //(name : pagename(school,home etc and item(kaaam))

    {
      foundList.items.push(item)    //user added data will be pushed in items section of List collection(or foundList)
      foundList.save();
      res.redirect('/'+ listName); // redirected to the page where user added item
    });
  }
});







// above post is for adding the data and this is for deleting the data
app.post('/delete', function(req, res){
  const checkedItemID = req.body.checkbox;  //checkedItemID contains the id of checkbox which is checked by user
  const listName = req.body.listName; // listName contains hidden inputs acces
  if(listName === 'Today'){
    newItems.findByIdAndRemove(checkedItemID, function(err){
      if(err){
        console.log(err);
      }else{
        console.log("succesfully deleted checked item.");
      }
    });
    res.redirect('/')
  }else{
    List.findOneAndUpdate({name : listName}, {$pull: {items:{_id: checkedItemID}}},function(err, foundList){
      if(!err){
        res.redirect('/'+ listName);
      }
    });
  }

});






// for hosting server locally
app.listen(3000, function(){
  console.log("server is running on port 300");
})



