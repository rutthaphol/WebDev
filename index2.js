const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
var path = require('path');

const { deflate } = require('zlib');
const app = express();

var mysql = require('mysql');
const { Console } = require('console');
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

app.use( "/public" , express.static(path.join(__dirname, '/')));

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});

app.get('/', (req, res) => {
    if(typeof req.query.msg !== "undefined"){
        res.render( path.join(__dirname + '/index.html') , {Message : "Failed"});
    }
    else{
        res.render( path.join(__dirname + '/index.html') );
    }
    
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
    FormatStartDate.setDate(FormatStartDate.getDate() + 1);
    console.log(FormatStartDate);
    let FormatEndDate = new Date(req.body['end_date']);
    FormatEndDate.setDate(FormatEndDate.getDate() + 1);
    FormatStartDate = FormatStartDate.toISOString().substring(0, 10);
    FormatEndDate = FormatEndDate.toISOString().substring(0, 10);
    let Query = "SELECT ID,Name,Adults,Children,Price,Picture FROM room_desc AS D where D.ID NOT IN "+
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
    // console.log(req.body);
})
//api booking rooms
app.get('/rooms/booking', (req, res) => {
    res.render( path.join(__dirname + '/booking-rooms.html') , {startDate : req.query.custStartDate, 
        endDate : req.query.custEndDate, Adult : req.query.custAdults, children : req.query.custChildren, 
        room_id : req.query.custId, Style : req.query.custName, Price : req.query.custPrice });
})

app.post('/rooms/booking/Payment_receipt', (req, res) => {
    let FormatStartDate = new Date(req.body['custStartDate']);
    FormatStartDate.setDate(FormatStartDate.getDate() + 1);
    let FormatEndDate = new Date(req.body['custEndDate']);
    FormatEndDate.setDate(FormatEndDate.getDate() + 1);
    FormatStartDate = FormatStartDate.toISOString().substring(0, 10);
    FormatEndDate = FormatEndDate.toISOString().substring(0, 10);

    let QueryCheck = "SELECT ID from room_booking where " +
    "((Start_Date >= " + "'" + FormatStartDate + "'" + 
    " AND Start_Date <" + "'" + FormatEndDate + "'" + ") OR (End_Date >= "
     + "'" + FormatStartDate + "'" + " AND End_Date <" + "'" + FormatEndDate + "'" + ")) AND ID = '" + req.body.custId + "';";
    let QueryInsertBooking = "INSERT INTO room_booking (ID,Start_Date,End_Date) VALUES (" + "'" + req.body.custId + "'" +
     ", '" + FormatStartDate + "' , '" + FormatEndDate + "');";
    let QueryLog = "INSERT INTO rental_record (Room_number,Room_name,CheckIn,CheckOut,Name,Email,Address,Phone_number,State,Zip) VALUES ('" + 
    req.body.custId + "', '" + req.body.custName + "', '" + FormatStartDate + "', '" + FormatEndDate + "', '" + req.body.firstname + "', '"
    + req.body.email + "', '" + req.body.address + "', '" + req.body.Phone + "', '" + req.body.state + "', '" + req.body.zip + "');";
    var con = mysql.createConnection(config);
    con.connect(function(err) {
        if (err) throw err;
            con.query(QueryCheck, function (err, result, fields) {
                console.log(result);
                if (err) throw err;
                if (result.length != 0) res.redirect("/?msg=failed")//res.render( path.join(__dirname + '/index.html') , {Message : "Failed"});
                else{
                    con.query(QueryInsertBooking, function (err, result1, fields) {
                        if (err) throw err;
                        
                        con.query(QueryLog, function (err, result2, fields) {
                            if (err) throw err;
                            
                            res.render( path.join(__dirname + '/signUp.html') , {CheckPeople : result2});
                            console.log(result);
                            con.end()
                        });
                    });
                }
                
          });
    });
})
