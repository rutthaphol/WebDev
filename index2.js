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
            // console.log(result);
            con.end()
      });
    });
})

app.post('/rooms', (req, res) => {
    var con = mysql.createConnection(config);
    let FormatStartDate = new Date(req.body['start_date']);
    FormatStartDate.setDate(FormatStartDate.getDate() + 1);
    let FormatEndDate = new Date(req.body['end_date']);
    FormatEndDate.setDate(FormatEndDate.getDate() + 1);
    FormatStartDate = FormatStartDate.toISOString().substring(0, 10);
    FormatEndDate = FormatEndDate.toISOString().substring(0, 10);
    let Query = "SELECT ID,Name,Adults,Children,Price,Picture FROM room_desc AS D where D.ID NOT IN "+
    "(SELECT B.ID from room_booking AS B  WHERE "+
    "(B.Start_Date >= " + "'" + FormatStartDate + "'" + 
    " AND B.Start_Date <" + "'" + FormatEndDate + "'" + ") OR (B.End_Date >= "
     + "'" + FormatStartDate + "'" + " AND B.End_Date <" + "'" + FormatEndDate + "'" + "))";
    // console.log(Query);
    con.connect(function(err) {
    if (err) throw err;
        con.query(Query, function (err, result, fields) {
            if (err) throw err;
            res.render( path.join(__dirname + '/rooms.html') , 
            { name : new Date(req.body.start_date), endDate : new Date(req.body.end_date),
                Adult : req.body.guest_name, children : req.body.childrens, 
                CheckPeople : result});
            //  console.log(result);
            con.end()
      });
    });
})
//api booking rooms
app.get('/rooms/booking', (req, res) => {
    let FormatStartDate = new Date(req.query['custStartDate']);
    FormatStartDate.setDate(FormatStartDate.getDate() + 1);
    let FormatEndDate = new Date(req.query['custEndDate']);
    FormatEndDate.setDate(FormatEndDate.getDate() + 1);
    FormatStartDate = FormatStartDate.toISOString().substring(0, 10);
    FormatEndDate = FormatEndDate.toISOString().substring(0, 10);
    res.render( path.join(__dirname + '/booking-rooms.html') , {startDate : FormatStartDate, 
        endDate : FormatEndDate, Adult : req.query.custAdults, children : req.query.custChildren, 
        room_id : req.query.custId, Style : req.query.custName, Price : req.query.custPrice });
})

function FormatDate(date){
    let options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString("en-US", options);
}

app.post('/rooms/booking/Payment_receipt', (req, res) => {
    let FormatStartDate = new Date(req.body['custStartDate']);
    FormatStartDate.setDate(FormatStartDate.getDate());
    let FormatEndDate = new Date(req.body['custEndDate']);
    FormatEndDate.setDate(FormatEndDate.getDate());
    FormatStartDate = FormatStartDate.toISOString().substring(0, 10);
    FormatEndDate = FormatEndDate.toISOString().substring(0, 10);
    let QueryCheck = "SELECT ID from room_booking where " +
    "((Start_Date >= " + "'" + FormatStartDate + "'" + 
    " AND Start_Date <" + "'" + FormatEndDate + "'" + ") OR (End_Date >= "
     + "'" + FormatStartDate + "'" + " AND End_Date <" + "'" + FormatEndDate + "'" + ")) AND ID = '" + req.body.custId + "';";

    let QueryCheckAvailable = "SELECT ID FROM room_desc AS D where D.ID NOT IN (SELECT B.ID from room_booking AS B  WHERE (B.Start_Date >=" +
    "'" + FormatStartDate + "'" + 
     " AND B.Start_Date < " + "'" + FormatEndDate + "'" + ") OR (B.End_Date >= "+ "'" + 
     FormatStartDate + "'" + " AND B.End_Date <" + "'" + FormatEndDate + "'" + ")) AND D.Name = '" + req.body.custName + "';";
    
    let QueryInsertBooking = "INSERT INTO room_booking (ID,Start_Date,End_Date) VALUES (" + "'" + req.body.custId + "'" +
     ", '" + FormatStartDate + "' , '" + FormatEndDate + "');";
    
    let QueryLog = "INSERT INTO rental_record (Room_number,Room_name,CheckIn,CheckOut,Name,Email,Address,Phone_number,State,Zip) VALUES ('" + 
    req.body.custId + "', '" + req.body.custName + "', '" + FormatStartDate + "', '" + FormatEndDate + "', '" + req.body.firstname + "', '"
    + req.body.email + "', '" + req.body.address + "', '" + req.body.Phone + "', '" + req.body.state + "', '" + req.body.zip + "');";

    let Tax = Math.ceil(parseInt(req.body.custPrice) + parseInt(req.body.custPrice*7/100));
    
    var con = mysql.createConnection(config);
    con.connect(function(err) {
        if (err) throw err;
            con.query(QueryCheck, function (err, result, fields) {
                // console.log(result);
                if (err) throw err;
                if (result.length != 0)//ถูกเช่าไปแล้ว ทำการค้นหาห้องใหม่อีกครั้ง
                {
                    con.query(QueryCheckAvailable, function (err, result3, fields) {//เช็คห้องห้องว่างห้องใหม่
                        if (err) throw err;
                        if(result3.length >= 1)
                        {
                            let QueryInsertBooking2 = "INSERT INTO room_booking (ID,Start_Date,End_Date) VALUES (" + "'" + result3[0].ID + "'" +
                            ", '" + FormatStartDate + "' , '" + FormatEndDate + "');";
                            con.query(QueryInsertBooking2, function (err, result1, fields) {
                                if (err) throw err;
                                let QueryLog2 = "INSERT INTO rental_record (Room_number,Room_name,CheckIn,CheckOut,Name,Email,Address,Phone_number,State,Zip) VALUES ('" + 
                                result3[0].ID + "', '" + req.body.custName + "', '" + FormatStartDate + "', '" 
                                + FormatEndDate + "', '" + req.body.firstname + "', '"+ req.body.email + "', '" + 
                                req.body.address + "', '" + req.body.Phone + "', '" + req.body.state + "', '" + req.body.zip + "');";
                                con.query(QueryLog2, function (err, result2, fields) {
                                    if (err) throw err;
                                    res.render( path.join(__dirname + '/Invoice.html') , {Name : req.body.firstname, Email : req.body.email, 
                                    Address : req.body.address,Phone : req.body.Phone, StartDate : FormatDate(req.body.custStartDate), 
                                    endDate : FormatDate(req.body.custEndDate), Adult : req.body.custAdults, children : req.body.custChildren,
                                    Style : req.body.custName, Price : req.body.custPrice, TotalTax : Tax});
                                    con.end()
                                });
                            });
                            //console.log(result3[0].ID);
                        }
                        else{
                            res.redirect("/?msg=failed")//res.render( path.join(__dirname + '/index.html') , {Message : "Failed"});
                            con.end()
                        }
                    });
                } 
                else{
                    con.query(QueryInsertBooking, function (err, result1, fields) {
                        if (err) throw err;
                        con.query(QueryLog, function (err, result2, fields) {
                            if (err) throw err;
                            res.render( path.join(__dirname + '/Invoice.html') , {Name : req.body.firstname, Email : req.body.email, 
                                Address : req.body.address,Phone : req.body.Phone, StartDate : FormatDate(req.body.custStartDate), 
                                endDate : FormatDate(req.body.custEndDate), Adult : req.body.custAdults, children : req.body.custChildren,
                                Style : req.body.custName, Price : req.body.custPrice, TotalTax : Tax});
                            // console.log(result);
                            con.end()
                        });
                    });
                } 
          });
    });
})

app.get('/invoice', (req, res) => {
        res.render( path.join(__dirname + '/Invoice.html') );
})