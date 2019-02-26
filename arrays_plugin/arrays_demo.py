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

    q1 = np.random.rand(10, 5)
    s1 = arrays_summary.pb(tag="qtable", data=q1)
    writer1.add_summary(s1, global_step=0)

    q4 = np.random.rand(100, 50)
    s4 = arrays_summary.pb(tag="qtable", data=q4)
    writer2.add_summary(s4, global_step=0)

    q5 = np.random.rand(100, 50)
    s5 = arrays_summary.pb(tag="qtable", data=q5)
    writer2.add_summary(s5, global_step=1)

    q6 = np.random.rand(100, 50)
    s6 = arrays_summary.pb(tag="qtable", data=q6)
    writer2.add_summary(s6, global_step=2)

    writer1.close()
    writer2.close()


def main(unused_argv):
    print('Saving output to %s.' % LOGDIR)
    run_all(LOGDIR)
    print('Done. Output saved to %s.' % LOGDIR)


if __name__ == '__main__':
  tf.app.run()
