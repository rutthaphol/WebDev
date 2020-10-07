const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
var path = require('path');

const { deflate } = require('zlib');
const app = express();

var mysql = require('mysql');
var config = {
    user: 'HostHotel',
    password: '123456',
    server: 'localhost',
    database: 'hotel'
};

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
    var con = mysql.createConnection(config);
    con.connect(function(err) {
    if (err) throw err;
        con.query("SELECT DISTINCT Name,Adults,Children,Price,Picture FROM room_desc", function (err, result, fields) {
            if (err) throw err;
            res.render( path.join(__dirname + '/rooms.html') , {CheckPeople : result});
            console.log(result);
            con.end()
      });
    });
})

app.post('/rooms', (req, res) => {
    var con = mysql.createConnection(config);
    let FormatStartDate = new Date(req.body['start_date']);
    let FormatEndDate = new Date(req.body['end_date']);
    FormatStartDate = FormatStartDate.toISOString().substring(0, 10);
    FormatEndDate = FormatEndDate.toISOString().substring(0, 10);
    let Query = "SELECT DISTINCT Name,Adults,Children,Price,Picture FROM room_desc AS D where D.ID NOT IN "+
    "(SELECT B.ID from room_booking AS B  WHERE "+
    "(B.Start_Date >= " + "'" + FormatStartDate + "'" + 
    " AND B.Start_Date <" + "'" + FormatEndDate + "'" + ") OR (B.End_Date >= "
     + "'" + FormatStartDate + "'" + " AND B.End_Date <" + "'" + FormatEndDate + "'" + "))";
    console.log(Query);
    con.connect(function(err) {
    if (err) throw err;
        con.query(Query, function (err, result, fields) {
            if (err) throw err;
            res.render( path.join(__dirname + '/rooms.html') , 
            { name : new Date(req.body.start_date), endDate : new Date(req.body.end_date),
                Adult : req.body.guest_name, children : req.body.childrens, 
                CheckPeople : result});
            console.log(result);
            con.end()
      });
    });
    // res.render( path.join(__dirname + '/rooms.html') , { name : new Date(req.body.start_date)
    //     , endDate : new Date(req.body.end_date), Adult : req.body.guest_name, 
    //     children : req.body.room_name});
    console.log(req.body);
})

