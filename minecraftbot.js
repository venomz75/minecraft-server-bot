//vars
const discord = require("discord.js");
const config = require("./config.js");
const request = require("request");
const token = config.token;
const ip = config.ip;
var url = "https://api.mcsrvstat.us/2/" + ip;
var client = new discord.Client();
var playerCount = 0;
var currentPlayers = [];

client.on ("message", (message) => {
    if (message.mentions.users == null) return;
    if (message.author.bot) return;
    if (message.guild === null) return;

    if (message.isMemberMentioned(client.user)) {    
        if (playerCount > 0) {
            reply = "Players online: ";
            for (i = 0; i < playerCount; i++) {
                if (playerCount - i != 1) {
                    reply += currentPlayers[i] + ", ";
                } else {
                    reply += currentPlayers[i] + ".";
                } 
            }
        } else {
            reply = "No players online!";
        }

        message.reply(reply);
	}
});

function storeData(json) {
    currentPlayers = [];
    playerCount = json.players.online;
    if (playerCount > 0) {
        d = new Date();
        dateString = d.getDate()+ "/" +d.getMonth()+ "/" +d.getFullYear()+ " - " +d.getHours()+ ":" +d.getMinutes()+ ":" +d.getSeconds();
        currentPlayers = json.players.list;
        //console.log(json.players.online);
        console.log(dateString+ ": " +json.players.list);
    }   
}

function checkServer() {
    request(url, function(error, response, body) {
        if(error) {
            client.user.setActivity("Failed to check server status!");
        }
        server = JSON.parse(body);
        if (server.online == true) {
            storeData(server);
            status = "Server Online (" +server.players.online+ "/" +server.players.max+ ")";
            if (playerCount > 0) {
                status += ". Players online: "
                for (i = 0; i < playerCount; i++) {
                    if (playerCount - i != 1) {
                        status += currentPlayers[i] + ", ";
                    } else {
                        status += currentPlayers[i] + ".";
                    } 
                }
            }
            client.user.setActivity(status, {type: "WATCHING"});

            client.user.setStatus("online");
        } else {
            client.user.setActivity("Server Offline", {type: "WATCHING"});
            client.user.setStatus("dnd");
        }
    });

}

client.on("ready", () => {
    console.log("ready!");
    client.user.setStatus("idle");
    client.user.setActivity("Finding server...", {type: "WATCHING"});
    checkServer();
    client.setInterval(checkServer,30000);
});

client.login(token);