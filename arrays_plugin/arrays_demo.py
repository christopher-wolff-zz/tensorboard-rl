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

    q1 = np.array([[1., 1., 1.], [1., 1., 1.]])
    s1 = arrays_summary.pb(tag="qtable", data=q1)
    writer1.add_summary(s1, global_step=1)

    q2 = np.array([[2., 2., 2.], [2., 2., 2.]])
    s2 = arrays_summary.pb(tag="qtable", data=q2)
    writer1.add_summary(s2, global_step=2)

    q3 = np.array([[3., 3., 3.], [3., 3., 3.]])
    s3 = arrays_summary.pb(tag="qtable", data=q3)
    writer1.add_summary(s3, global_step=3)

    q4 = np.array([[4., 4. ,4.], [4., 4., 4.]])
    s4 = arrays_summary.pb(tag="qtable", data=q4)
    writer2.add_summary(s4, global_step=1)

    q5 = np.array([[2., 2., 2.], [2., 2., 2.]])
    s5 = arrays_summary.pb(tag="qtable", data=q5)
    writer2.add_summary(s5, global_step=2)

    q6 = np.array([[3., 3., 3.], [3., 3., 3.]])
    s6 = arrays_summary.pb(tag="qtable", data=q6)
    writer2.add_summary(s6, global_step=3)

    writer1.close()
    writer2.close()


def main(unused_argv):
    print('Saving output to %s.' % LOGDIR)
    run_all(LOGDIR)
    print('Done. Output saved to %s.' % LOGDIR)


if __name__ == '__main__':
  tf.app.run()
