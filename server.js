const { SerialPort } = require("serialport")
const { ReadlineParser } = require("@serialport/parser-readline")
const express = require("express")
const {Server} = require("socket.io")
const http = require("http");
const { count } = require("console");
const fs = require('fs');
const cron = require('node-cron');


const app = express()
const server = http.createServer(app);

const file = 'tindakan.json';


const io = new Server(server)

app.use(express.json())
app.get("/", (req,res) => {
    res.sendFile(__dirname + "/views/index.html")
})

io.on("connection", (Socket) => {
    console.log("Connected..")
    Socket.on("disconnect", () => {
        console.log("Disconnect..")
    })
})

app.listen(3000, ()=>{
    console.log('server on!')
});

const port = new SerialPort({
       path: 'COM17',
        // baudRate: 19200,
        baudRate: 9600,
        // parser: new ReadlineParser({delimiter: "\r\n"}),
    });

const parser = port.pipe(new ReadlineParser({delimiter: "\r\n"}));

parser.on("data", (result)=>{
    io.emit("data", {data: result})
});



 app.post("/sendData", async({body},res)=> {
    
    schedule();
    
  res.end();
    
})

function schedule(){
    cron.schedule('* * * * * ', () => {
        console.log('Tugas dijalankan pada detik ke-30');
        var random = getRandomNumber(0,3)
        console.log(tindakan[random])
        
    });
    
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



function generateOutput(lux,temp,hum, menit){
    var data = {}
    var date = new Date()
    var formatMenit = (date.getMinutes() < 10 ? '0' : '' + date.getMinutes())
    console.log(formatMenit);
    if (temp > 22 && hum > 50 && lux < 350) {
        if (formatMenit - (formatMenit - 1) != 0) {
            data = {suhu: temp, kelembaban: hum, cahaya: lux, output: "Tidak Sehat", tindakan: "-"}
        }else{
            data = {suhu: temp, kelembaban: hum, cahaya: lux, output: "Tidak Sehat", tindakan: "Segera nyalakan pendingin ruangan, dan nyalakan lampu dikarenakan suhu yang terlalu panas dan ruangan yang gelap"}
        }
    }else if(temp > 22 && hum > 50 && lux > 350){
        data = {suhu: temp, kelembaban: hum, cahaya: lux, output: "Tidak Sehat", tindakan: "Segera nyalakan pendingin ruangan, dan nyalakan lampu dikarenakan suhu yang terlalu panas"}
    }
    else{
        data = {suhu: temp, kelembaban: hum, cahaya: lux, output: "Sehat", tindakan: "Pertahankan kondisi ruangan seperti ini"}
    }

    return data
}

const tindakan = [
        "tindakan1",
        "tindakan2",
        "tindakan3",
        "tindakan4"
]