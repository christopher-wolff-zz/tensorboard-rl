"""Simple demo that summarizes multiple Q-tables."""

import os.path

import numpy as np
import tensorflow as tf

import arrays_summary


LOGDIR = '/tmp/arrays_demo'


def run_all(logdir):
    """Run the simulation for every logdir."""
    writer1 = tf.summary.FileWriter(os.path.join(logdir, "run1"))
    writer2 = tf.summary.FileWriter(os.path.join(logdir, "run2"))

    for i in range(10):
        qtable1 = np.random.rand(20, 10)
        qtable2 = np.random.rand(10, 5)
        summary1 = arrays_summary.pb(tag="qtable", data=qtable1)
        summary2 = arrays_summary.pb(tag="qtable", data=qtable2)
        writer1.add_summary(summary1, global_step=i)
        writer2.add_summary(summary2, global_step=i)

    writer1.close()
    writer2.close()


def main(unused_argv):
    print('Saving output to %s.' % LOGDIR)
    run_all(LOGDIR)
    print('Done. Output saved to %s.' % LOGDIR)


if __name__ == '__main__':
  tf.app.run()
