namespace vz_rectangle_plot {


export interface Cell {
  x: number,
  y: number,
  val: number,
}


Polymer({
  is: 'vz-rectangle-plot',
  properties: {
    array: Object,

    colorScale: {
      type: Object,
      value: function() {
        return new Plottable.Scales.Color().range(d3.schemeCategory10);
      }
    },

    /**
     * The columns of the tooltip.
     *
     * There should be a formatting object for each desired column.
     * Each formatting object gets applied to the datum bound to the closest
     * clustered bar.
     */
    tooltipColumns: {
      type: Array,
      value: function() {
        return [
          {
            title: 'X',
            evaluate: function(d) {
              return d.x;
            },
          },
          {
            title: 'Y',
            evaluate: function(d) {
              return d.y;
            },
          },
          {
            title: 'Value',
            evaluate: function(d) {
              return d.val;
            },
          },
        ];
      }
    },

    _attached: Boolean,
    _plot: Object,
  },

  observers: [
    '_makePlot(array, colorScale, tooltipColumns, _attached)',
  ],

  /**
   * Re-renders the plot. Useful if e.g. the container size changed.
   */
  redraw: function() {
    if (this._plot) {
      this._plot.redraw();
    }
  },

  attached: function() {
    this._attached = true;
  },

  detached: function() {
    this._attached = false;
  },

  ready: function() {
    // This is needed so Polymer can apply the CSS styles to elements we
    // created with d3.
    this.scopeSubtree(this.$.tooltip, true);
    this.scopeSubtree(this.$.plotdiv, true);
  },

  /**
   * Creates a plot, and asynchronously renders it. Fires a plot-rendered
   * event after the plot is rendered.
   */
  _makePlot: function(array, colorScale, tooltipColumns, _attached) {
    if (this._plot) this._plot.destroy();
    var tooltip = d3.select(this.$.tooltip);
    // We directly reference properties of `this` because this call is
    // asynchronous, and values may have changed in between the call being
    // initiated and actually being run.
    var plot = new RectanglePlot(this.array, this.colorScale, tooltip, this.tooltipColumns);
    var div = d3.select(this.$.plotdiv);
    plot.renderTo(div);
    this._plot = plot;
  },
});

class RectanglePlot {
  private array: Array<Array<number>>;
  private cells: Cell[];
  private colorScale: Plottable.Scales.Color;
  private tooltip: d3.Selection<any, any, any, any>;
  private outer: Plottable.Components.Table;
  private plot: Plottable.Plots.Rectangle<string, string>;

  constructor(
      array: Array<Array<number>>,
      colorScale: Plottable.Scales.Color,
      tooltip: d3.Selection<any, any, any, any>,
      tooltipColumns: vz_chart_helpers.TooltipColumn[]) {
    this.array = array;
    this.colorScale = colorScale;
    this.tooltip = tooltip;

    this.plot = null;
    this.outer = null;

    this.cells = [];
    for (let i = 0; i < array.length; i++) {
      for (let j = 0; j < array[0].length; j++) {
        this.cells.push({"x": i, "y": j, "val": array[i][j]});
      }
    }

    this.buildPlot(this.cells);
    this.setupTooltips(tooltipColumns);
  }

  private buildPlot(cells: Cell[]) {
    if (this.outer) {
      this.outer.destroy();
    }
    // TODO: Compute color scale dynamically from parameter
    const colorScale = new Plottable.Scales.InterpolatedColor();
    colorScale.range(["#BDCEF0", "#5279C7"]);

    const xScale = new Plottable.Scales.Category();
    const yScale = new Plottable.Scales.Category();

    const xAxis = new Plottable.Axes.Category(xScale, "bottom");
    const yAxis = new Plottable.Axes.Category(yScale, "left");

    const plot = new Plottable.Plots.Rectangle<string, string>()
      .addDataset(new Plottable.Dataset(this.cells))
      .x((d) => d.x, xScale)
      .y((d) => d.y, yScale)
      .attr("fill", (d) => d.val, colorScale);

    this.plot = plot;
    this.outer = new Plottable.Components.Table([[yAxis, plot], [null, xAxis]]);
  }

  private setupTooltips(tooltipColumns: vz_chart_helpers.TooltipColumn[]) {
    // Set up tooltip column headers.
    const tooltipHeaderRow = this.tooltip.select("thead tr");
    tooltipHeaderRow
      .selectAll("th")
      .data(tooltipColumns)
      .enter()
      .append("th")
      .text(d => d.title);

    const plot = this.plot;
    const pointer = new Plottable.Interactions.Pointer();
    pointer.attachTo(plot);

    var hideTooltips = () => {
      this.tooltip.style("opacity", 0);
    };
    pointer.onPointerMove((p) => {
      const target = plot.entityNearest(p);
      if (target) {
        this.drawTooltips(target, tooltipColumns);
      }
    });
    pointer.onPointerExit(hideTooltips);
  }

  private drawTooltips(
      target: Plottable.Plots.IPlotEntity,
      tooltipColumns: vz_chart_helpers.TooltipColumn[]) {
    const hoveredCells = this.cells.filter(cell =>
      cell.x == target.datum.x && cell.y == target.datum.y
    );  // should have length 1, but data binding requires this to be a list
    console.log(hoveredCells);

    // Bind the cells data structure to the tooltip.
    const rows = this.tooltip.select('tbody')
                   .html('')
                   .selectAll('tr')
                   .data(hoveredCells)
                   .enter()
                   .append('tr');

    // rows.style('white-space', 'nowrap');
    _.each(tooltipColumns, (column) => {
      rows.append('td').text((d) => {
        // Convince TypeScript to let us pass off a key-value entry of value
        // type Bar as a Point since that's what TooltipColumn.evaluate wants.
        // TODO(nickfelt): reconcile the incompatible typing here
        const barEntryAsPoint = d as any as vz_chart_helpers.Point;
        return column.evaluate(barEntryAsPoint);
      });
    });

    const left = target.position.x;
    const top = target.position.y;
    this.tooltip.style('transform', 'translate(' + left + 'px,' + top + 'px)');
    this.tooltip.style('opacity', 1);
  }

  public renderTo(targetSVG: d3.Selection<any, any, any, any>) {
    this.outer.renderTo(targetSVG);
  }

  public redraw() {
    this.outer.redraw();
  }

  public destroy() {
    this.outer.destroy();
  }
}

} // namespace vz_rectangle_plot
