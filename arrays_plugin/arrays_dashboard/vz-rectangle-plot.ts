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

    color: {
      type: Object,
      value: null,
    },

    /**
     * A number between 0 and 1 that controls the range of the color scale used for
     * the plot. A value of 0 results in all colors being the same, whereas a value
     * of 1 results in a range from #ffffff to `color`.
     */
    colorRangeDepth: {
      type: Number,
      value: 0.8,
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
              return d.val.toFixed(2);
            },
          },
        ];
      }
    },

    _attached: Boolean,
    _plot: Object,
  },

  observers: [
    '_makePlot(array, color, colorRangeDepth, tooltipColumns, _attached)',
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
  _makePlot: function(array, color, colorRangeDepth, tooltipColumns, _attached) {
    if (this._plot) this._plot.destroy();
    var tooltip = d3.select(this.$.tooltip);
    // We directly reference properties of `this` because this call is
    // asynchronous, and values may have changed in between the call being
    // initiated and actually being run.
    var plot = new RectanglePlot(this.array, this.color, this.colorRangeDepth, tooltip, this.tooltipColumns);
    var div = d3.select(this.$.plotdiv);
    plot.renderTo(div);
    this._plot = plot;
  },
});

class RectanglePlot {
  private array: Array<Array<number>>;
  private cells: Cell[];
  private color: string;
  private colorRangeDepth: number;
  private tooltip: d3.Selection<any, any, any, any>;
  private outer: Plottable.Components.Table;
  private plot: Plottable.Plots.Rectangle<string, string>;

  constructor(
      array: Array<Array<number>>,
      color: string,
      colorRangeDepth: number,
      tooltip: d3.Selection<any, any, any, any>,
      tooltipColumns: vz_chart_helpers.TooltipColumn[]) {
    this.array = array;
    this.color = color;
    this.colorRangeDepth = colorRangeDepth;
    this.tooltip = tooltip;

    this.plot = null;
    this.outer = null;

    this.cells = [];
    for (let i = 0; i < array.length; i++) {
      for (let j = 0; j < array[0].length; j++) {
        this.cells.push({"x": i, "y": j, "val": array[i][j]});
      }
    }

    this.buildPlot(this.cells, color, colorRangeDepth);
    this.setupTooltips(tooltipColumns);
  }

  private buildPlot(cells: Cell[], color: string, colorRangeDepth: number) {
    if (this.outer) {
      this.outer.destroy();
    }

    const colorScale = this.computeColorScale(color, colorRangeDepth);

    const xScale = new Plottable.Scales.Category();
    const yScale = new Plottable.Scales.Category();

    const xAxis = new Plottable.Axes.Category(xScale, "top");
    const yAxis = new Plottable.Axes.Category(yScale, "left");

    const plot = new Plottable.Plots.Rectangle<string, string>()
      .addDataset(new Plottable.Dataset(this.cells))
      .x((d) => d.x, xScale)
      .y((d) => d.y, yScale)
      .attr("fill", (d) => d.val, colorScale);

    this.plot = plot;
    this.outer = new Plottable.Components.Table([[null, xAxis], [yAxis, plot]]);
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

    // Bind the cells data structure to the tooltip.
    const rows = this.tooltip.select('tbody')
      .html('')
      .selectAll('tr')
      .data(hoveredCells)
      .enter()
      .append('tr');

    rows.style('white-space', 'nowrap');
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

  private computeColorScale(color: string, colorRangeDepth: number) {
    const colorRgb = this.hexToRgb(color);
    const r = Math.floor(colorRgb.r + (255 - colorRgb.r) * colorRangeDepth);
    const g = Math.floor(colorRgb.g + (255 - colorRgb.g) * colorRangeDepth);
    const b = Math.floor(colorRgb.b + (255 - colorRgb.b) * colorRangeDepth);
    const startColor = this.rgbToHex(r, g, b);
    return new Plottable.Scales.InterpolatedColor().range([startColor, color]);
  }

  private componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  private rgbToHex(r, g, b) {
    return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
  }

  private hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
}

} // namespace vz_rectangle_plot
