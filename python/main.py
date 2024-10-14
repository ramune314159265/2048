from __future__ import absolute_import, division, print_function

import json
import random
import time

from tf_agents.agents.dqn import dqn_agent
from tf_agents.drivers import dynamic_step_driver
from tf_agents.environments import suite_gym, tf_py_environment
from tf_agents.eval import metric_utils
from tf_agents.metrics import tf_metrics
from tf_agents.networks import q_network
from tf_agents.policies import random_tf_policy
from tf_agents.replay_buffers import tf_uniform_replay_buffer
from tf_agents.trajectories import trajectory
from tf_agents.utils import common
from websocket_server import WebsocketServer

DIRECTIONS = ["up", "down", "left", "right"]


def new_client(client, server):
	print("connected")
	server.send_message_to_all(json.dumps({
		"type": "move",
		"direction": random.choice(DIRECTIONS)
	}))

def message_received(client,server,message):
	print(message)
	time.sleep(0.1)
	server.send_message_to_all(json.dumps({
		"type": "move",
		"direction": random.choice(DIRECTIONS)
	}))

server = WebsocketServer(host='127.0.0.1',port=54999)
server.set_fn_new_client(new_client)
server.set_fn_message_received(message_received)
server.run_forever()

num_iterations = 20000

initial_collect_steps = 1000
collect_steps_per_iteration = 1
replay_buffer_max_length = 100000

batch_size = 64
learning_rate = 1e-3
log_interval = 200

num_eval_episodes = 10
eval_interval = 1000

