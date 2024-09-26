from websocket_server import WebsocketServer
import random
import time
import json

DIRECTIONS = ["up", "down", "left", "right"]


def new_client(client, server):
	print("connected")
	server.send_message_to_all(json.dumps({"direction":random.choice(DIRECTIONS)}))

def message_received(client,server,message):
	print(message)
	time.sleep(1)
	server.send_message_to_all(json.dumps({"direction":random.choice(DIRECTIONS)}))

server = WebsocketServer(host='127.0.0.1',port=54999)
server.set_fn_new_client(new_client)
server.set_fn_message_received(message_received)
server.run_forever()
