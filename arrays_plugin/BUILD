package(default_visibility = ["//visibility:public"])

licenses(["notice"])  # Apache 2.0

py_library(
    name = "arrays_plugin",
    srcs = ["arrays_plugin.py"],
    srcs_version = "PY2AND3",
    deps = [
        "@org_pocoo_werkzeug",
        "@org_pythonhosted_six",
        "@org_tensorflow_tensorboard//tensorboard/backend:http_util",
        "@org_tensorflow_tensorboard//tensorboard/backend/event_processing:event_accumulator",
        "@org_tensorflow_tensorboard//tensorboard/plugins:base_plugin",
    ],
)

py_binary(
    name = "arrays_demo",
    srcs = ["arrays_demo.py"],
    srcs_version = "PY2AND3",
    deps = [":arrays_summary"],
)

py_library(
    name = "arrays_summary",
    srcs = ["arrays_summary.py"],
    srcs_version = "PY2AND3",
)
