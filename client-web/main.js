var ws;


function sendPacket(name,data){
    ws.send(name + ":" + btoa(JSON.stringify(data)))
}

async function sha256(message) {
    // encode as UTF-8
    const msgBuffer = new TextEncoder('utf-8').encode(message);                    

    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // convert bytes to hex string                  
    const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
    return hashHex;
}


window.onload = async () => {
    ws = new WebSocket(`ws://${prompt("IP bitteeee!","123.456.78.9")}:5555/ws`)
    ws.onmessage = (ev) => {
        console.log(ev.data.toString())
        var f = ev.data.toString()
        console.log(f.split(":")[0]);
        console.log(JSON.parse(atob(f.split(":")[1])));
        
    }
    ws.onopen = async () => {
        console.log("WS_OPEN")
        ws.send("login:" + btoa(
            JSON.stringify({
                username:"marchat-goes",
                password: await sha256("brr"),
                anti_replay: await sha256(
                    await sha256("brr") + " " + Math.floor(Date.now() / 1000).toString()
                ),
                timestamp:Math.floor(Date.now() / 1000)
            })
        ));
        //ws.send("login:" + btoa(JSON.stringify({username:"marchat-goes", password: await sha256("brr"), anti_replay: await sha256(await sha256("brr")+" "+Math.floor(Date.now() / 1000).toString()),timestamp:Math.floor(Date.now() / 1000)})));
    }
    ws.onclose = () => console.log("WS_CLOSE")
    ws.onerror = (ev) => console.log(`WS_ERROR: ${ev}`)
}