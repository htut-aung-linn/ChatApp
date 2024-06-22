const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;
const app = express();

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(__dirname + '/public'));
const names = {};
wss.on('connection', (ws) => {
    console.log('A new client connected');
    
    ws.on('message', (message) => {
        const {type, data} = JSON.parse(message); 
        console.log(`Received message => ${type}`);
        //save userdata in array
        if(type==='introduce'){
            const {name, id} = data;
            console.log('user name:' ,name,'id:', id);
            names[id] = {name: name, ws: ws};
            console.log("people" , names);
            const peoplelist = {};
            for(const key in names){
                const username = names[key]['name'];
                const mydata = {type:'introduce' , data: { id: id,name : name}};
                if(username!== name){
                    peoplelist[key] = {name: username};
                    //sending intro info message to other user
                    names[key].ws.send(JSON.stringify(mydata));
                }
            }
            ws.send(JSON.stringify({type:'initial' ,data:peoplelist}));

            //sending intro info message to other user
        }else if(type==='message') {
            const {from, to, message} = data;
            console.log(from, to, message);
            const mydata = {type:'message', data:{from: from, message: message}};
            names[to].ws.send(JSON.stringify(mydata));
        } else {
            
        }
        // Broadcast the message to all clients
    });

    ws.on('close', () => {
        console.log('A client disconnected');
        var leavemessage = {};
        for (const key in names) {
            if (names[key].ws === ws ) {
                leavemessage = {type: 'leave', data:{id : key}};
                // If the WebSocket value matches any in the wsArray, delete the main tag
                delete names[key];
            }
        }
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(leavemessage));
            }
        });
        
        console.log(names);
    });
});

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);

});
