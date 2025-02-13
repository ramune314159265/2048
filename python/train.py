import datetime
import os
import random
from collections import deque

import game2048
import numpy as np
import tensorflow as tf
from tensorflow.keras.layers import Dense
from tensorflow.keras.models import Sequential
from tensorflow.keras.optimizers import Adam
from tqdm import tqdm


class DQN:
	def __init__(self):
		self.state_size = game2048.Game2048.width * game2048.Game2048.height
		self.action_size = 4
		self.epsilon = 0.1
		self.epsilon_decay = 0.995
		self.epsilon_min = 0.01
		self.gamma = 0.99
		self.learning_rate = 0.03
		self.memory = deque(maxlen=2000)
		self.model = self.build_model()

	def build_model(self):
		model = Sequential([
			Dense(512, input_shape=(self.state_size,), activation='relu'),
			Dense(256, activation='relu'),
			Dense(self.action_size, activation='linear')
		])
		model.compile(loss='mse', optimizer=Adam(learning_rate=self.learning_rate))

		return model

	def get_action(self, state):
		if random.random() <= self.epsilon:
			return random.randrange(0, self.action_size)
		q_values = self.model.predict_on_batch(state)
		optimal_action = np.argmax(q_values[0])

		return optimal_action

	def remember(self, state, action, reward, next_state, gameovered):
		self.memory.append((state, action, reward, next_state, gameovered))

	def replay(self, batch_size):
		if len(self.memory) < batch_size:
			return
		minibatch = random.sample(self.memory, batch_size)
		for state, action, reward, next_state, gameovered in minibatch:
			target = reward
			if not gameovered:
				target += self.gamma * np.amax(self.model.predict_on_batch(next_state)[0])
			target_f = self.model.predict_on_batch(state)
			target_f[0][action] = target
			self.model.fit(state, target_f, epochs=1)
		if self.epsilon > self.epsilon_min:
			self.epsilon *= self.epsilon_decay

game = game2048.Game2048()
agent = DQN()
episodes = 10000
start_time = datetime.datetime.now().strftime("%m_%d__%H_%M_%S")
os.makedirs(f"./save/{start_time}/")

for episode in tqdm(range(episodes)):
	game.reset()

	while True:
		state = np.ndarray.flatten(game.board).reshape(1, -1)
		action = agent.get_action(state)
		merged_values = game.move(action)
		reward = 0
		for i in merged_values:
			reward = reward + 1.5 ** i
		is_game_overed = game.isGameOver()
		new_state = np.ndarray.flatten(game.board).reshape(1, -1)
		agent.remember(state, action, reward, new_state, is_game_overed)
		state = new_state

		if is_game_overed:
			print(f"Episode :{episode}/{episodes}, max :{2 ** np.max(state)}, score: {game.score}, epsilon: {agent.epsilon}")
			print(game.board)
			break
	agent.replay(64)
	if episode % 10 == 0:
		agent.model.save(f'./save/{start_time}/{episode}.keras')

agent.model.save(f'./save/{start_time}/finish.keras')
