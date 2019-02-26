import os
import sys

from tensorboard import default
from tensorboard import program
import tensorflow as tf

from matrices_plugin import matrices_plugin


if __name__ == '__main__':
    plugins = default.get_plugins() + [matrices_plugin.MatricesPlugin]
    assets = os.path.join(tf.resource_loader.get_data_files_path(), 'assets.zip')
    tensorboard = program.TensorBoard(plugins, lambda: open(assets, 'rb'))
    tensorboard.configure(sys.argv)
    sys.exit(tensorboard.main())
