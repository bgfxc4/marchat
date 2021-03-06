import { User } from "./user"
import { dbcon } from "./database"
import { Message } from "./message"
import { broadcastPacket } from "./packets"

export var loadedChannels:Array<Channel> = []

export class Channel {
    public name: string = ""
    public users: Array<string> = []
    public activeUsers: Array<User> = []
    public messageHistory: Array<Message> = []

    constructor(name: string) {
        this.name = name
    }

    public async initialize() {
        console.log(`Loading channel: ${this.name}`);
        var data = await dbcon.collection("channel").findOne({name: this.name})
        this.name = data.name
        this.users = data.users
        this.messageHistory = data.messageHistory
        
    }

    public dump():any {
        return {
            name: this.name,
            users: this.users,
            messageHistory: this.messageHistory
        }
    }

    public unload(){
        console.log(`Unloading channel: ${this.name}`);
        loadedChannels.splice(loadedChannels.findIndex(u => u.name == this.name))
        var j = this.dump()
        console.log(j);
        dbcon.collection("channel").replaceOne({name: this.name}, j)
    }

    public appendMessage(user: User, text: string) {
        var newmsg = {
            username: user.username,
            text: text,
            number: this.messageHistory.length
        }
        this.messageHistory.push(newmsg)
        broadcastPacket(this.activeUsers,"message",newmsg)
    }

    public async fetchMessages(count: number, offset:number):Promise<Array<Message>> {
        if (offset < 0) offset = this.messageHistory.length
        var start = Math.max(0,Math.min(this.messageHistory.length,offset - count))
        var end = Math.max(0,Math.min(this.messageHistory.length,offset))
        console.log(`Reading Messages from ${start} to ${end}.`);
        return this.messageHistory.slice(start,end + 1)
    }
}