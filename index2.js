const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
var path = require('path');

const { deflate } = require('zlib');
const app = express();
const shortid = require('shortid');
var mysql = require('mysql');
const { Console } = require('console');
const e = require('express');
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
var cron = require('node-cron');
//Schedule every 17.30
cron.schedule('30 17 * * *', () => {
    var con = mysql.createConnection(config);
    let QueryDelete = 'DELETE FROM room_booking WHERE Start_Date <= CURDATE() AND StatusCheckIn = 0;';
    console.log("Runing a job at 17.30 ");
    con.connect(function(err) {
        if (err) throw err;
            con.query(QueryDelete, function (err, result, fields) {
                if (err) throw err;
                con.query(QueryDelete, function (err, result, fields) {
                    if (err) throw err;
                    con.end()
                });
            });
    });
  }, {
    scheduled: true,
    timezone: "Asia/Bangkok"
});
function formatDate(nDate){
    const newnDate = new Date(nDate).toLocaleString('en-US', {
        timeZone: 'Asia/Bangkok'
      });
    let summation;
    if(newnDate[2] == '/' && newnDate[4] == '/')
    {
        let day = newnDate.substring(3, 4);
        let month = newnDate.substring(0, 2);
        let year = newnDate.substring(5, 9);
        summation = year+"-"+month+"-"+day;
    }
    else if(newnDate[2] == '/' && newnDate[5] == '/')
    {
        let day = newnDate.substring(3, 5);
        let month = newnDate.substring(0, 2);
        let year = newnDate.substring(6, 10);
        summation = year+"-"+month+"-"+day;
    }
    else if(newnDate[1] == '/' && newnDate[4] == '/')
    {
        let day = newnDate.substring(2, 4);
        let month = newnDate.substring(0, 1);
        let year = newnDate.substring(5, 9);
        summation = year+"-"+month+"-"+day;
    }
    else
    {
        let day = newnDate.substring(2, 3);
        let month = newnDate.substring(0, 1);
        let year = newnDate.substring(4, 8);
        summation = year+"-"+month+"-"+day;
    }
    return summation;
}

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
    let Sdate = req.body['start_date'];
    let Edate = req.body['end_date'];
    let FormatStartDate = formatDate(Sdate);
    let FormatEndDate = formatDate(Edate);
    let Query = "SELECT ID,Name,Adults,Children,Price,Picture FROM room_desc AS D where D.ID NOT IN "+
    "(SELECT B.ID from room_booking AS B  WHERE "+
    "(B.Start_Date >= " + "'" + FormatStartDate + "'" + 
    " AND B.Start_Date <" + "'" + FormatEndDate + "'" + ") OR (B.End_Date >= "
     + "'" + FormatStartDate + "'" + " AND B.End_Date <" + "'" + FormatEndDate + "'" + ")) AND Adults >= '"+req.body.guest_name 
     +"' AND Children >= '" + req.body.childrens+"'";
    console.log(Query);
    con.connect(function(err) {
    if (err) throw err;
        con.query(Query, function (err, result, fields) {
            if (err) throw err;
            res.render( path.join(__dirname + '/rooms.html') , 
            { name : FormatStartDate, endDate : FormatEndDate,
                Adult : req.body.guest_name, children : req.body.childrens, 
                CheckPeople : result});
            //  console.log(result);
            con.end()
      });
    });
})
//api booking rooms
app.get('/rooms/booking', (req, res) => {
    let Sdate = req.query['custStartDate'];
    let Edate = req.query['custEndDate'];
    let FormatStartDate = formatDate(Sdate);
    let FormatEndDate = formatDate(Edate);
    res.render( path.join(__dirname + '/booking-rooms.html') , {startDate : FormatDate(FormatStartDate), 
        endDate : FormatDate(FormatEndDate), Adult : req.query.custAdults, children : req.query.custChildren, 
        room_id : req.query.custId, Style : req.query.custName, Price : req.query.custPrice });
})

function FormatDate(date){
    let options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString("en-US", options);
}

function checkDupBookingNumber(con , bookingNumber) {
    return new Promise((resolve , reject) => {
        let QuertyCheckBookingNumber = "SELECT DISTINCT Booking_No from room_booking where Booking_No = '"+bookingNumber+"';";
        con.query(QuertyCheckBookingNumber, function (err, result, fields) {
            if (err) {
                reject (err)  // calling `reject` will cause the promise to fail with or without the error passed as an argument
                return        // and we don't want to go any further
            }
            resolve(result)
            // con.end()
        });
    })
}

app.post('/rooms/booking/Payment_receipt', async (req, res) => {
    let Booking_Number = shortid.generate();
    var con = mysql.createConnection(config);
    
    let isDup = true
    do{
        await checkDupBookingNumber(con , Booking_Number)
            .then(result => {
                if(result.length == 0){
                    isDup = false
                    //do everything below here
                    let Sdate = req.body['custStartDate'];
                    let Edate = req.body['custEndDate'];
                    let FormatStartDate = formatDate(Sdate);
                    let FormatEndDate = formatDate(Edate);
                    let QueryCheck = "SELECT ID from room_booking where " +
                    "((Start_Date >= " + "'" + FormatStartDate + "'" + 
                    " AND Start_Date <" + "'" + FormatEndDate + "'" + ") OR (End_Date >= "
                    + "'" + FormatStartDate + "'" + " AND End_Date <" + "'" + FormatEndDate + "'" + ")) AND ID = '" + req.body.custId + "';";

                    let QueryCheckAvailable = "SELECT ID FROM room_desc AS D where D.ID NOT IN (SELECT B.ID from room_booking AS B  WHERE (B.Start_Date >=" +
                    "'" + FormatStartDate + "'" + 
                    " AND B.Start_Date < " + "'" + FormatEndDate + "'" + ") OR (B.End_Date >= "+ "'" + 
                    FormatStartDate + "'" + " AND B.End_Date <" + "'" + FormatEndDate + "'" + ")) AND D.Name = '" + req.body.custName + "';";
                    
                    let QueryInsertBooking = "INSERT INTO room_booking (ID,Start_Date,End_Date,Name,Booking_No) VALUES (" + "'" + req.body.custId + "'" +
                    ", '" + FormatStartDate + "' , '" + FormatEndDate +"' , '"+ req.body.firstname +"' , '"+ Booking_Number +"');";
                    
                    let QueryLog = "INSERT INTO rental_record (Room_number,Room_name,CheckIn,CheckOut,Name,Email,Address,Phone_number,State,Zip,CreditCard,Booking_No) VALUES ('" + 
                    req.body.custId + "', '" + req.body.custName + "', '" + FormatStartDate + "', '" + FormatEndDate + "', '" + req.body.firstname + "', '"
                    + req.body.email + "', '" + req.body.address + "', '" + req.body.Phone + "', '" + req.body.state + "', '" + req.body.zip 
                    + "', '" + req.body.cardnumber +"', '" + Booking_Number + "');";

                    let Tax = Math.ceil(parseInt(req.body.custPrice) + parseInt(req.body.custPrice*7/100));
                    
                    con.query(QueryCheck, function (err, result, fields) {
                        // console.log(result);
                        if (err) throw err;
                        if (result.length != 0)//ถูกเช่าไปแล้ว ทำการค้นหาห้องใหม่อีกครั้ง
                        {
                            con.query(QueryCheckAvailable, function (err, result3, fields) {//เช็คห้องห้องว่างห้องใหม่
                                if (err) throw err;
                                if(result3.length >= 1)
                                {
                                    let QueryInsertBooking2 = "INSERT INTO room_booking (ID,Start_Date,End_Date,Name,Booking_No) VALUES (" + "'" + result3[0].ID + "'" +
                                    ", '" + FormatStartDate + "' , '" + FormatEndDate + "' , '"+ req.body.firstname +"' , '"+ Booking_Number +"');";
                                    con.query(QueryInsertBooking2, function (err, result1, fields) {
                                        if (err) throw err;
                                        let QueryLog2 = "INSERT INTO rental_record (Room_number,Room_name,CheckIn,CheckOut,Name,Email,"
                                        +"Address,Phone_number,State,Zip,CreditCard,Booking_No) VALUES ('" + 
                                        result3[0].ID + "', '" + req.body.custName + "', '" + FormatStartDate + "', '" 
                                        + FormatEndDate + "', '" + req.body.firstname + "', '"+ req.body.email + "', '" + 
                                        req.body.address + "', '" + req.body.Phone + "', '" + req.body.state + "', '" + req.body.zip 
                                        + "', '" + req.body.cardnumber +"', '" + Booking_Number + "');";
                                        con.query(QueryLog2, function (err, result2, fields) {
                                            if (err) throw err;
                                            res.render( path.join(__dirname + '/Invoice.html') , {Name : req.body.firstname, Email : req.body.email, 
                                            Address : req.body.address,Phone : req.body.Phone, StartDate : FormatDate(req.body.custStartDate), 
                                            endDate : FormatDate(req.body.custEndDate), Adult : req.body.custAdults, children : req.body.custChildren,
                                            Style : req.body.custName, Price : req.body.custPrice, TotalTax : Tax, No_Booking : Booking_Number});
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
                                        Style : req.body.custName, Price : req.body.custPrice, TotalTax : Tax, No_Booking : Booking_Number});
                                    // console.log(result);
                                    con.end()
                                });
                            });
                        } 
                });
                }
                else{
                    //generate new
                    Booking_Number = shortid.generate()
                }
                
            })
            .catch(err => {
                console.error(err)
                return 
            })
    }
    while(isDup)
    

})

app.get('/invoice', (req, res) => {
        res.render( path.join(__dirname + '/Invoice.html') );
})

app.get('/Admin', (req, res) => {
    res.render( path.join(__dirname + '/admin.html'));
})
app.get('/Admin/table', (req, res) => {
    let Query;
    let Sdate = req.query['start_date'];
    let FormatStartDate = formatDate(Sdate);
    let Name;
    if(req.query['start_date'] !== '' && typeof(Sdate) !== 'undefined')
    {
        if(req.query['name-input'] !== '' && typeof(req.query['name-input']) !== 'undefined')
        {
            let Name = req.query['name-input'];
            Query = "SELECT * FROM rental_record where CheckIn = '" + FormatStartDate +"' And Name LIKE '%" + Name +"%'";
        }
        else
        {
            Query = "SELECT * FROM rental_record where CheckIn = '" + FormatStartDate +"'";
        }
    }
    else if(req.query['name-input'] !== '' && typeof(req.query['name-input']) !== 'undefined')
    {
        Name = req.query['name-input'];
        Query = "SELECT * FROM rental_record where Name LIKE '%" + Name +"%'";
    }
    else{
        Query = "SELECT * FROM rental_record;"
    }
    console.log(Query);
    var con = mysql.createConnection(config);
    con.connect(function(err) {
        if (err) throw err;
            con.query(Query, function (err, result, fields) {
                if (err) throw err;
                res.render( path.join(__dirname + '/record_table.html'),{record:result });
                con.end()
          });
    }); 
})
app.get('/Admin/Checking', (req, res) => {
    let Query;
    let Sdate = req.query['start_date'];
    let FormatStartDate = formatDate(Sdate);
    let Name;
    if(req.query['start_date'] !== '' && typeof(Sdate) !== 'undefined')
    {
        // console.log(FormatStartDate);
        if(req.query['name-input'] !== '' && typeof(req.query['name-input']) !== 'undefined')
        {
            let Name = req.query['name-input'];
            Query = "SELECT * FROM room_booking where Start_Date = '" + FormatStartDate +"' AND StatusCheckIn = '0' And Name LIKE '%" + Name +"%'";
        }
        else
        {
            Query = "SELECT * FROM room_booking where Start_Date = '" + FormatStartDate +"' AND StatusCheckIN = '0'";  
        }
        
    }
    else if(req.query['name-input'] !== '' && typeof(req.query['name-input']) !== 'undefined')
    {
        Name = req.query['name-input'];
        Query = "SELECT * FROM room_booking where StatusCheckIn = '0' And Name LIKE '%" + Name +"%'";
    }
    else{
        let today = new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Bangkok'
        });
        today = formatDate(today);
        Query = "SELECT * FROM room_booking where Start_Date = '" + today +"' AND StatusCheckIn = '0';";
    }
    console.log(Query);
    var con = mysql.createConnection(config);
    con.connect(function(err) {
        if (err) throw err;
            con.query(Query, function (err, result, fields) {
                if (err) throw err;
                res.render( path.join(__dirname + '/checkin.html'),{record : result });
                con.end()
          });
    }); 
})
app.post('/Admin/Checking', (req, res) => {
    let Booking_Number = req.body.custID;
    let Sdate = req.body['start_date'];
    let FormatStartDate = formatDate(Sdate);
    let Query = "SELECT * FROM room_booking where Start_Date = '" + FormatStartDate +"' AND StatusCheckIn = '0';";
    console.log(Query);
    console.log(FormatStartDate);
    let QueryUpdateBook = "UPDATE room_booking SET StatusCheckIn = 1 WHERE Booking_No = '" + Booking_Number + "';";
    let QueryUpdateLog = "UPDATE rental_record SET Stay = 1 WHERE Booking_No = '" + Booking_Number + "';";
    var con = mysql.createConnection(config);
    con.connect(function(err) {
        if (err) throw err;
            con.query(QueryUpdateBook, function (err, result, fields) {
                if (err) throw err;
                con.query(QueryUpdateLog, function (err, result, fields) {
                    if (err) throw err;
                    con.query(Query, function (err, result3, fields) {
                        if (err) throw err;
                        res.render( path.join(__dirname + '/checkin.html'),{record:result3});
                        con.end()
                    });
                });
          });
    }); 
})