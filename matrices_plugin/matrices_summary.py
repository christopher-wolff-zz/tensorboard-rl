"""TensorBoard summary methods for the Matrices plugin."""

import numpy as np
import tensorflow as tf


PLUGIN_NAME = 'matrices'


def op(name, data, display_name=None, description=None, collections=None):
    """Create a TensorFlow summary op for a rank-2 `Tensor`.

    Args:
        name: A unique name for the generated summary node.
        data: A real numeric rank-2 `Tensor`. Must have `dtype` castable to
            `tf.float64`.
        display_name: Optional name for this summary in TensorBoard, as a
            constant `str`. Defaults to `name`.
        description: Optional long-form description for this summary, as a
            constant `str`. Markdown is supported. Defaults to empty.
        collections: Optional list of graph collections to add the summary
            op to. Defaults to `['summaries']`.

    Returns:
        A TensorFlow summary op.

    """
    if display_name is None:
        display_name = name

    summary_metadata = tf.SummaryMetadata(
        display_name=display_name,
        summary_description=description,
        plugin_data=tf.SummaryMetadata.PluginData(plugin_name=PLUGIN_NAME)
    )

    with tf.control_dependencies([tf.assert_rank(data, 2)]):
        return tf.summary.tensor_summary(
            name=name,
            tensor=tf.cast(data, tf.float64),
            summary_metadata=summary_metadata,
            collections=collections
        )


def pb(tag, data, display_name=None, description=None):
    """Create a summary for the given matrix.

    Args:
        tag: A unique name for the generated summary.
        data: A `np.array` or array-like form with rank 2. Must have type
            castable to `np.float64`.
        display_name: Optional name for this summary in TensorBoard, as a
            `str`. Defaults to `name`.
        description: Optional long-form description for this summary, as a
            `str`. Markdown is supported. Defaults to empty.

    Returns:
        A `tf.Summary` protobuf object.

    """
    data = np.array(data).astype(np.float64)
    tensor = tf.make_tensor_proto(data, dtype=tf.float64)

    if display_name is None:
        display_name = tag

    summary_metadata = tf.SummaryMetadata(
        display_name=display_name,
        summary_description=description,
        plugin_data=tf.SummaryMetadata.PluginData(plugin_name=PLUGIN_NAME)
    )
    summary = tf.Summary()
    summary.value.add(tag=tag, metadata=summary_metadata, tensor=tensor)
    return summary
