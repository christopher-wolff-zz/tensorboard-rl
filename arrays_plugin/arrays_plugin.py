import numpy as np
import tensorflow as tf
from tensorboard.backend import http_util
from tensorboard.plugins import base_plugin
from werkzeug import wrappers


class ArraysPlugin(base_plugin.TBPlugin):
    """A TensorBoard plugin to visualize Q-tables."""

    plugin_name = 'arrays'

    def __init__(self, context):
        """Instantiate an ArraysPlugin.

        Args:
            context: A base_plugin.TBContext instance.

        """
        self._multiplexer = context.multiplexer

    def is_active(self):
        """Determine whether the plugin is active.

        The plugin is active if and only if at least one relevant tag can be
        found.

        Returns:
            A boolean that indicates whether this plugin is active.

        """
        if not self._multiplexer:
            return False
        return bool(self._multiplexer.PluginRunToTagToContent(ArraysPlugin.plugin_name))

    def get_plugin_apps(self):
        """Get all routes offered by the plugin.

        Returns:
            A dictionary that maps from URL paths to routes.

        """
        return {
            '/tags': self.tags_route,
            '/arrays': self.arrays_route
        }

    @wrappers.Request.application
    def tags_route(self, request):
        """Get the tags associated with each run.

        Args:
            request: A `Request` object without any args.

        Returns:
            A JSON object that maps from runs to tag lists.

        """
        runs = self._multiplexer.PluginRunToTagToContent(ArraysPlugin.plugin_name)
        response = {run: list(tagToContent.keys()) for (run, tagToContent) in runs.items()}
        return http_util.Respond(request, response, 'application/json')

    @wrappers.Request.application
    def arrays_route(self, request):
        """Get the arrays associated with a run and tag.

        Args:
            request: A `Request` object with args `run` and `tag`.

        Returns:
            A JSON list of objects, each of which has attributes `wall_time`,
            `step`, and `qtable`.

        """
        run = request.args.get('run')
        tag = request.args.get('tag')
        tensor_events = self._multiplexer.Tensors(run, tag)
        events = [self._process_tensor_event(event) for event in tensor_events]
        response = sorted(events, key=lambda e: (e['step'], e['wall_time']))
        return http_util.Respond(request, response, 'application/json')

    @staticmethod
    def _process_tensor_event(event):
        """Convert a TensorEvent into a JSON-compatible response."""
        array = tf.make_ndarray(event.tensor_proto).tolist()
        return {
            'step': event.step,
            'wall_time': event.wall_time,
            'array': array
        }
