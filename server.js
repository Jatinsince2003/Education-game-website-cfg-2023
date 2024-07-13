const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const multer = require('multer');
// import express from "express"
// import mongoose  from "mongoose";
// import {PythonShell} from 'python-shell';

// PythonShell.run("test.py",null,function(err,results){
//  console.log(results);
//     }
// )
const app = express();
const path = require('path');

const { spawn } = require('child_process');
const upload = multer({ dest: 'uploads/' });

const PDFDocument = require('pdfkit');

const fs = require('fs');
// Define the directory for serving static files (like HTML, CSS, JS)
app.use(express.static('public'));

// Define a route to render the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname+'/index.html'));
});

// const { exec } = require('child_process');

// exec('python test.py', (error, stdout, stderr) => {
//   if (error) {
//     console.error(`Error executing Python script: ${error}`);
//     return;
//   }
//   console.log(`Python script output:\n${stdout}`);
// });


const url=process.env.MONGODB_URL;
if(url){
  mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
}
else{
  console.log("Cant find url");
}


const Image = mongoose.model('Image', {
  filename: String,
  path: String,
  imageUrl: String,
});
app.post('/upload', upload.single('image'), (req, res) => {
  const imagePath = req.file.path;
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  // Save the uploaded image to the database
  const image = new Image({
    filename: req.file.filename,
    path: req.file.path,
    imageUrl: imageUrl,
  });

  image.save()
    .then(() => {
      // const pythonProcess = spawn('python', ['your_python_script.py', imagePath]);

      // pythonProcess.stdout.on('data', data => {
      //   const result = data.toString();
      //   res.json({ result, imageUrl });
      // });

      // pythonProcess.stderr.on('data', data => {
      //   console.error(data.toString());
      //   res.status(500).json({ error: 'An error occurred' });
      // });
      console.log(image.filename);
      console.log(image.path);
      console.log(image.imageUrl);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Failed to save the uploaded image to the database' });
    });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



const userSchema = new mongoose.Schema({
  fullname: String,
  age:Number,
  password:String,
  phone:Number,
  score:Number,
  role:String
});


const User = mongoose.model('User', userSchema);


app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Handle login POST request
app.post('/login', (req, res) => {
    const { phone, password } = req.body;
  
    // Find user in the database by email and password
    User.findOne({ phone, password }, (err, user) => {
      if (err) {
        console.error('Error finding user:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
      } else if (!user) {
        res.status(401).json({ success: false, message: 'Invalid email or password' });
      } else {
        res.json({ success: true, message: 'Login successful',user });
        
        console.log(user)
      }
    });
  });
  
  // Handle signup POST request
  app.post('/signup', (req, res) => {
    const { fullname,age, phone, password,score,role } = req.body;
  
    // Create a new user
    const newUser = new User({ fullname, age,phone, password,score,role });

      
  
    // Save the new user to the database
    newUser.save((err) => {
      if (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
      } else {
        res.json({ success: true, message: 'Signup successful' });

         console.log(newUser);
        
        console.log("Signed Up")
      }
    });
  });

app.get('/user', (req, res) => {

  const userId = req.headers.userid;

  // Fetch the user data from the database
  User.findById(userId, (err, user) => {
    if (err) {
      console.error('Error finding user:', err);
      res.status(500).json({ success: false, message: 'Internal server error' });
    } else if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
    } else {
      res.json(user);
    }
  });
});

// ... other routes and endpoints
app.get("/leaderboard",(req,res)=>{
  User.find({},(err,user)=>{
  if(err)
  {
    console.log("Error Finding Data");
  }
  else 
  { 
    console.log(JSON.stringify(user));
      res.json(user);
  }
  })
  })
  // ... other routes and endpoints
  
  app.get("/reportData",(req,res)=>{
    User.find({},(err,user)=>{
    if(err)
    {
      console.log("Error Finding Data");
    }
    else 
    { 
      // console.log(JSON.stringify(user));
        res.send(user);
    }
    })
    })
  
  
  
  
  
  // Call the function to generate the PDF
  
  
  // app.get('/report',  (req, res) => {
  //   const leaderboardURL = 'http://localhost:3000/reportData';
  //   function fetchLeaderboardData() {
  //     try {
  //       const response =  fetch(leaderboardURL);
  //       console.log(response);
  //       const data =  response.json();
  //       return data;
      
  //     } catch (error) {
  //       console.error('Error fetching leaderboard data:', error);
  //       return [];
  //     }
  //   }
  //   const data= fetchLeaderboardData();
     
   
  //   // User.find({}, (err, user) => {
  //   //   if (err) {
  //   //     console.error('Error finding user:', err);
  //   //     // res.status(500).json({ success: false, message: 'Internal server error' });
      
  //   //   } else {
  //   //    data=user.toArray();
  
  //   //   }
  //   // });
  
  //   function createPDF(data) {
  //     const doc = new PDFDocument();
    
  //     doc.pipe(fs.createWriteStream('output.pdf')); // Output file name
    
  //     // Generate PDF content using the fetched data
  //     data.forEach((entry) => {
  //       doc.text(entry.fullname);
  //       doc.text(entry.age);
  //       doc.moveDown();
  //     });
    
  //     doc.end();
  //     console.log('PDF created successfully');
  //   }
    
  //  function generatePDFFromMongoDB() {
  //     try {
     
  //       createPDF(data);
  //     } catch (err) {
  //       console.error('Error:', err);
  //     } 
  //   }
  //   generatePDFFromMongoDB();
  //   const file = __dirname + '/output.pdf'; // Path to the generated PDF file
  
  //   res.download(file, 'output.pdf', (err) => {
  //     if (err) {
  //       console.error('Error downloading the file:', err);
  //     } else {
  //       console.log('File downloaded successfully');
  //     }
  //   });
  // });
  app.get('/report', async (req, res) => {
    const leaderboardURL = 'http://localhost:3000/reportData';
    async function fetchLeaderboardData() {
      try {
        const response = await fetch(leaderboardURL);
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        return [];
      }
    }
  
    const data = await fetchLeaderboardData();
  
    function createPDF(data) {
      const doc = new PDFDocument();
  
      doc.pipe(fs.createWriteStream('output.pdf')); // Output file name
  
      // Generate PDF content using the fetched data
      data.forEach((entry,index) => {
        doc.text(index+1+")");
        doc.text(entry.fullname);
        doc.text(entry.age);
        doc.text(entry.phone);
        doc.text(entry.score);
        doc.moveDown();
      });
  
      doc.end();
      console.log('PDF created successfully');
    }
  
    function generatePDFFromMongoDB() {
      try {
        createPDF(data);
      } catch (err) {
        console.error('Error:', err);
      }
    }
  
    generatePDFFromMongoDB();
    const file = __dirname + '/output.pdf'; // Path to the generated PDF file
  
    res.download(file, 'output.pdf', (err) => {
      if (err) {
        console.error('Error downloading the file:', err);
      } else {
        console.log('File downloaded successfully');
      }
    });
  });
  
// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
