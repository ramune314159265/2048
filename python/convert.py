import tensorflow as tf
import tensorflowjs as tfjs
from tensorflow import keras

modelDir = input("model dir: ")
model = tf.keras.models.load_model("./save/" + modelDir)
tfjs.converters.save_keras_model(model, "./convert/")
