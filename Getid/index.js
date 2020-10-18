const express = require('express')
const app = express()

var path = require('path');

var mysql = require('mysql');

// config for your database
var config = {
    user: 'TestApp',
    password: '123456',
    server: 'localhost',
    database: 'example'
};


const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.engine('html' , require('ejs').renderFile)
app.set('view engine' , 'html')


app.get('/test', (req, res) => {
  res.sendFile( path.join(__dirname + '/form.html'));
})
app.post('/ex', (req, res) => {
  console.log(req.body.custId);
  // res.render( path.join(__dirname + '/EX.html') );
})


app.listen(3000, () => {
  console.log('Start server at port 3000.')
})
