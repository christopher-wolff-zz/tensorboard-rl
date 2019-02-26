package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")

licenses(["notice"])  # Apache 2.0

tf_web_library(
    name = "matrices_dashboard",
    srcs = [
        "matrices-card.html",
        "matrices-dashboard.html",
        "vz-matrix-plot.html",
        "vz-matrix-plot.ts",
    ],
    path = "/matrices_plugin/matrices_dashboard",
    deps = [
        "@org_polymer_iron_icon",
        "@org_polymer_paper_icon_button",
        "@org_polymer_paper_input",
        "@org_tensorflow_tensorboard//tensorboard/components/tf_backend",
        "@org_tensorflow_tensorboard//tensorboard/components/tf_card_heading",
        "@org_tensorflow_tensorboard//tensorboard/components/tf_categorization_utils",
        "@org_tensorflow_tensorboard//tensorboard/components/tf_color_scale",
        "@org_tensorflow_tensorboard//tensorboard/components/tf_dashboard_common",
        "@org_tensorflow_tensorboard//tensorboard/components/tf_imports:d3",
        "@org_tensorflow_tensorboard//tensorboard/components/tf_imports:lodash",
        "@org_tensorflow_tensorboard//tensorboard/components/tf_imports:plottable",
        "@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
        "@org_tensorflow_tensorboard//tensorboard/components/tf_paginated_view",
        "@org_tensorflow_tensorboard//tensorboard/components/tf_runs_selector",
        "@org_tensorflow_tensorboard//tensorboard/components/tf_tensorboard:registry",
        "@org_tensorflow_tensorboard//tensorboard/components/vz_chart_helpers"
    ],
)
