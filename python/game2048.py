import random

import numpy as np


class Game2048:
	emptyState = 0
	width = 4
	height = 4
	def __init__(self):
		self.reset()
		self.appearTile(2)

	def reset(self):
		self.board = np.zeros((Game2048.width, Game2048.height), dtype=int)

	def isTileFilled(self, x, y):
		return self.getTileState(x, y) != Game2048.emptyState

	def getTileState(self, x, y):
		if (x < 0) or (Game2048.width <= x) or (y < 0) or (Game2048.height <= y):
			return -1
		return self.board[y, x]

	def setTileState(self, x, y, state):
		if (x < 0) or (Game2048.width <= x) or (y < 0) or (Game2048.height <= y):
			return
		self.board[y, x] = state

	def moveTile(self, x, y, toX, toY):
		if not self.isTileFilled(x, y) and self.isTileFilled(toX, toY):
			return

		originTileState = self.getTileState(x, y)
		self.setTileState(x, y, Game2048.emptyState)
		self.setTileState(toX, toY, originTileState)

	def mergeTile(self, x, y, targetX, targetY):
		if not self.isTileFilled(x, y) and not self.isTileFilled(targetX, targetY):
			return
		if self.getTileState(x, y) != self.getTileState(targetX, targetY):
			return

		self.setTileState(targetX, targetY, self.getTileState(targetX, targetY) + 1)
		self.setTileState(x, y, Game2048.emptyState)

	def move(self, direction):
		self.board = np.rot90(self.board, direction)

		merged = []
		changed = []

		for x in range(Game2048.width):
			for y in range(Game2048.height):
				if not self.isTileFilled(x, y):
					continue

				selfTileState = self.getTileState(x, y)
				i = 0
				while True:
					i = i + 1
					positionY = y - i
					if not self.isTileFilled(x, positionY):
						continue
					if y == positionY:
						continue

					if selfTileState == self.getTileState(x, positionY) and not [x, positionY] in merged:
						self.mergeTile(x, y, x, positionY)
						merged.append([x, positionY])
						changed.append([x, y, x, positionY, 'merged'])
					else:
						self.moveTile(x, y, x, positionY + 1)
						changed.append([x, y, x, positionY + 1, 'moved'])
					break

		self.board = np.rot90(self.board, -direction)

		if(len(list(filter(lambda x: x[0] != x[2] or x[1] != x[3], changed))) != 0):
			self.appearTile(1)

	def appearTile(self, length):
		for _ in range(length):
			empty_tiles = [(x, y) for x in range(Game2048.width) for y in range(Game2048.height) if not self.isTileFilled(x, y)]
			x, y = random.choice(empty_tiles)
			self.setTileState(x, y, 1 if random.random() < 0.9 else 2)

	def isGameOver(self):
		for x in range(Game2048.width):
			for y in range(Game2048.height):
				if self.getTileState(x, y) == self.getTileState(x, y + 1):
					return False
				if self.getTileState(x, y) == self.getTileState(x + 1, y):
					return False
				if self.getTileState(x, y) == self.getTileState(x, y - 1):
					return False
				if self.getTileState(x, y) == self.getTileState(x - 1, y):
					return False
		return True

game = Game2048()
game.setTileState(0,0,1)
game.moveTile(0,0,0,3)
game.setTileState(0,0,1)
game.mergeTile(0,0,0,3)
while True:
	print(game.board)
	i =  int(input('direction num:'))
	game.move(i)
