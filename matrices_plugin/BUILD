package(default_visibility = ["//visibility:public"])

licenses(["notice"])  # Apache 2.0

py_library(
    name = "matrices_plugin",
    srcs = ["matrices_plugin.py"],
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
    name = "matrices_demo",
    srcs = ["matrices_demo.py"],
    srcs_version = "PY2AND3",
    deps = [":matrices_summary"],
)

py_library(
    name = "matrices_summary",
    srcs = ["matrices_summary.py"],
    srcs_version = "PY2AND3",
)
