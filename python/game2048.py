import json
import random
import subprocess

import numpy as np

available_tiles = [1, 1, 1, 1, 1, 1, 1, 1, 1, 2]

class Game2048:
	width = 4
	height = 4
	def __init__(self, seed=88675123):
		self.board = np.zeros((Game2048.width, Game2048.height), dtype=int)
		self.isGameOvered = False
		self.score = 0
		self.seed = seed
		self.reset()

	def reset(self):
		if hasattr(self, 'process'):
			self.process.kill()
		self.process = subprocess.Popen(
			['node', './game2048.mjs', str(self.seed)],
			encoding='UTF-8',
			stdin=subprocess.PIPE,
			stdout=subprocess.PIPE
		)
		jsonData = json.loads(self.process.stdout.readline().strip())
		self.board = np.array(jsonData['field'])

	def move(self, direction):
		print(str(direction), file=self.process.stdin, flush=True)
		jsonData = json.loads(self.process.stdout.readline().strip())
		self.board = np.array(jsonData['field'])
		self.isGameOvered = jsonData['isGameOver']
		self.score = jsonData['score']
		return jsonData['mergedValues']

if __name__ == '__main__':
	game = Game2048()
	game.reset(12)
	while True:
		print(game.board)
		i = int(input('direction num:'))
		merged_values = game.move(i)
		print('reword:' + str(merged_values))
