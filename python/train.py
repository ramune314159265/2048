import datetime
import os
import random
from collections import deque

import game2048
import numpy as np
from tensorflow.keras.layers import Dense
from tensorflow.keras.models import Sequential
from tensorflow.keras.optimizers import Adam
from tqdm import tqdm


class DQN:
	def __init__(self):
		self.state_size = game2048.Game2048.width * game2048.Game2048.height
		self.action_size = 4
		self.epsilon = 0.1
		self.epsilon_decay = 0.9995
		self.epsilon_min = 0.01
		self.gamma = 0.99
		self.learning_rate = 0.001
		self.memory = deque(maxlen=10000)
		self.model = self.build_model()

	def build_model(self):
		model = Sequential([
			Dense(256, input_shape=(self.state_size,), activation='relu'),
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

	def calc_reward(self, merged_values, board, prev_board, game_overed):
		merge_reward = sum(2 ** i for i in merged_values)

		empty_cells = np.count_nonzero(board == 0)
		empty_reward = empty_cells * 10

		max_tile = np.max(board)
		high_tile_reward = 0
		if max_tile >= 8:
			high_tile_reward = (max_tile - 7) ** 2 * 100

		no_change_penalty = -50 if np.array_equal(board, prev_board) else 0

		game_over_penalty = -500 if game_overed else 0

		return merge_reward + empty_reward + high_tile_reward + no_change_penalty + game_over_penalty

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
	prev_board = np.zeros_like(game.board)

	while True:
		state = np.ndarray.flatten(game.board).reshape(1, -1)
		action = agent.get_action(state)
		merged_values = game.move(action)
		new_state = np.ndarray.flatten(game.board).reshape(1, -1)
		reward = agent.calc_reward(merged_values, game.board, prev_board, game.isGameOvered)
		is_game_overed = game.isGameOvered
		agent.remember(state, action, reward, new_state, is_game_overed)
		state = new_state
		prev_board = game.board.copy()

		if is_game_overed:
			print(f"Episode :{episode}/{episodes}, max :{2 ** np.max(state)}, score: {game.score}, epsilon: {agent.epsilon}")
			print(game.board)
			break
	agent.replay(64)
	if episode % 10 == 0:
		agent.model.save(f'./save/{start_time}/{episode}.keras')

agent.model.save(f'./save/{start_time}/finish.keras')
