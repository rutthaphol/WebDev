const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
var path = require('path');
const { deflate } = require('zlib');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.engine('html' , require('ejs').renderFile)
app.set('view engine' , 'html')

//app.use(morgan('tiny'));
app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '/')));
 
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});

app.get('/', (req, res) => {
    res.render( path.join(__dirname + '/index.html') );
})
app.get('/rooms', (req, res) => {
    res.render( path.join(__dirname + '/rooms.html') );
})

app.post('/rooms', (req, res) => {
    res.render( path.join(__dirname + '/rooms.html') , { name : new Date(req.body.start_date)});

    console.log(req.body);
})

