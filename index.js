// Vasantha Vasavi Meenakshi Sundaram

const express = require('express');
const { check, validationResult } = require('express-validator');
const path = require('path');
const fileupload = require('express-fileupload');

//importing mongoose and connecting to DB
const mongoose = require('mongoose')

mongoose.connect('mongodb://0.0.0.0:27017/Book_Shop', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Request = mongoose.model('requests',{
  name: String,
  phone: String,
  email: String,
  purchase_id: String,
  purchase_date: Date,
  request_description: String,
  book_image_name: String
})



//setting up variables to use packages
let myApp = express();
myApp.use(fileupload());
myApp.set('views', path.join(__dirname, 'views'));
myApp.use('*/css', express.static('public/css'));
myApp.use('*/images', express.static('public/images'));
myApp.use('*/js', express.static('public/js'));
myApp.use('*/uploads', express.static('public/uploads'));
myApp.set('view engine', 'ejs');

myApp.use(express.urlencoded({ extended: false }));


//rendering home page and shop page
myApp.get('/', (req, res) => {
  res.render('home');
});

myApp.get('/request', (req, res) => {
  res.render('requestPage');
});

myApp.get('/login', (req, res) => {
  res.render('adminLoginPage');
});


//regex for email
const email_format =  /^([a-zA-Z0-9_.-]+)@([a-zA-Z0-9_-]+)((\.([a-zA-Z0-9_-]+))+)$/;
//regex for phone
const phone_format = /^[0-9]{10}$/;

//custom function for checking format
const check_format = (value, regex) => {
  return regex.test(value) ? true : false;
};

//function for checking phone number format
const check_phone = (value) => {
  if(!value)
  {
    throw new Error("Phone Number is mandatory");
  }
  else if (!check_format(value, phone_format)) {
    throw new Error("Enter Phone Number in correct format");
  }

  return true;
};

//function for checking email format
const check_email = (value) => {
  if(!value)
  {
    throw new Error("Email is mandatory");
  }
  else if (!check_format(value, email_format)) {
    throw new Error("Enter Email ID in correct format");
  }

  return true;
};


myApp.post('/request',
  [
    check('name', 'Name is mandatory').not().isEmpty(),
    check('phone').custom(check_phone),
    check('email').custom(check_email),
    check('purchase_id', 'Purchase ID is mandatory').not().isEmpty(),
    check('request_description', 'Description is mandatory').not().isEmpty()
  ],
  function(req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) 
    {
      res.render('requestPage', {errors: errors.array()});
    } 
    else 
    {
  
      //fetching all form inputs
      var name = req.body.name;
      var phone = req.body.phone;
      var email = req.body.email;
      var purchase_id = req.body.purchase_id;
      var purchase_date =req.body.purchase_date;
      var request_description = req.body.request_description;
      var book_image_file = req.files.bookImage;
      var book_image_name = req.files.bookImage.name; 

      var imagePath = 'public/uploads/' + book_image_name;

      book_image_file.mv(imagePath);

      

      //creating a variable for storing data in MongoDB
      let myRequest = new Request({
        name,
        phone,
        email,
        purchase_id,
        purchase_date,
        request_description,
        book_image_name
      })

      //saving the data in MongoDB
      myRequest.save()

      
      res.render('thankYouPage', {
        name,
        email
      });
    }
  }
);

//rendering a dynamic page for displaying the order details by matching the name on order
myApp.get('/details/:name',async(req,res) => {
  const singleOrder = await Order.findOne({ name: { $regex: req.params.name, $options:
    'i' } }).exec()
    res.render('orderDetails', { order: singleOrder })
})





myApp.listen(8080)
console.log('Running on port 8080')