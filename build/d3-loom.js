(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.d3 = global.d3 || {})));
}(this, (function (exports) { 'use strict';

function compareValue(compare) {
  return function (a, b) {
    return compare(a.outer.value, b.outer.value);
  };
}

function constant(x) {
  return function () {
    return x;
  };
}

/* Based on the d3v4 d3.chord() function by Mike Bostock
** Adjusted by Nadieh Bremer - July 2016 */

/* global d3 */
function loom() {
  var tau = Math.PI * 2;

  var padAngle = 0;
  var sortGroups = null;
  var sortSubgroups = null;
  var sortLooms = null;
  var emptyPerc = 0.2;
  var heightInner = 20;
  var widthInner = function widthInner() {
    return 30;
  };
  var value = function value(d) {
    return d.value;
  };
  var inner = function inner(d) {
    return d.inner;
  };
  var outer = function outer(d) {
    return d.outer;
  };

  function loomLayout(layoutData) {
    // Nest the data on the outer variable
    var data = d3.nest().key(outer).entries(layoutData);

    var n = data.length;

    // Loop over the outer groups and sum the values

    var groupSums = [];
    var groupIndex = d3.range(n);
    var subgroupIndex = [];
    var looms = [];
    looms.groups = new Array(n);
    var groups = looms.groups;
    var numSubGroups = void 0;
    looms.innergroups = [];
    var uniqueInner = looms.innergroups;
    var uniqueCheck = [];
    var k = void 0;
    var x = void 0;
    var x0 = void 0;
    var j = void 0;
    var l = void 0;
    var s = void 0;
    var v = void 0;
    var sum = void 0;
    var section = void 0;
    var remain = void 0;
    var counter = void 0;
    var reverseOrder = false;
    var approxCenter = void 0;
    k = 0;
    numSubGroups = 0;
    for (var i = 0; i < n; i += 1) {
      v = data[i].values.length;
      sum = 0;
      for (j = 0; j < v; j += 1) {
        sum += value(data[i].values[j]);
      } // for j
      groupSums.push(sum);
      subgroupIndex.push(d3.range(v));
      numSubGroups += v;
      k += sum;
    } // for i

    // Sort the groups…
    if (sortGroups) {
      groupIndex.sort(function (a, b) {
        return sortGroups(groupSums[a], groupSums[b]);
      });
    }

    // Sort subgroups…
    if (sortSubgroups) {
      subgroupIndex.forEach(function (d, i) {
        d.sort(function (a, b) {
          return sortSubgroups(inner(data[i].values[a]), inner(data[i].values[b]));
        });
      });
    }

    // After which group are we past the center, taking into account the padding
    // TODO: make something for if there is no "nice" split in two...
    var padk = k * (padAngle / tau);
    l = 0;
    for (var _i = 0; _i < n; _i += 1) {
      section = groupSums[groupIndex[_i]] + padk;
      l += section;
      if (l > (k + n * padk) / 2) {
        // Check if the group should be added to left or right
        remain = k + n * padk - (l - section);
        approxCenter = remain / section < 0.5 ? groupIndex[_i] : groupIndex[_i - 1];
        break;
      } // if
    } // for i

    // How much should be added to k to make the empty part emptyPerc big of the total
    var emptyk = k * emptyPerc / (1 - emptyPerc);
    k += emptyk;

    // Convert the sum to scaling factor for [0, 2pi].
    k = Math.max(0, tau - padAngle * n) / k;
    var dx = k ? padAngle : tau / n;

    // Compute the start and end angle for each group and subgroup.
    // Note: Opera has a bug reordering object literal properties!
    var subgroups = new Array(numSubGroups);
    x = emptyk * 0.25 * k; // starting with quarter of the empty part to the side;
    counter = 0;
    for (var _i2 = 0; _i2 < n; _i2 += 1) {
      var di = groupIndex[_i2];
      var outername = data[di].key;

      x0 = x;
      s = subgroupIndex[di].length;
      for (j = 0; j < s; j += 1) {
        var dj = reverseOrder ? subgroupIndex[di][s - 1 - j] : subgroupIndex[di][j];

        v = value(data[di].values[dj]);
        var innername = inner(data[di].values[dj]);
        var a0 = x;
        x += v * k;
        var a1 = x;
        subgroups[counter] = {
          index: di,
          subindex: dj,
          startAngle: a0,
          endAngle: a1,
          value: v,
          outername: outername,
          innername: innername,
          groupStartAngle: x0
        };

        // Check and save the unique inner names
        if (!uniqueCheck[innername]) {
          uniqueCheck[innername] = true;
          uniqueInner.push({ name: innername });
        } // if

        counter += 1;
      } // for j
      groups[di] = {
        index: di,
        startAngle: x0,
        endAngle: x,
        value: groupSums[di],
        outername: outername
      };
      x += dx;
      // If this is the approximate center, add half of the empty piece for the bottom
      if (approxCenter === di) x += emptyk * 0.5 * k;
      // If you've crossed the bottom, reverse the order of the inner strings
      if (x > Math.PI) reverseOrder = true;
    } // for i

    // Sort the inner groups in the same way as the strings
    if (sortSubgroups) {
      uniqueInner.sort(function (a, b) {
        return sortSubgroups(a.name, b.name);
      });
    }

    // Find x and y locations of the inner categories
    var m = uniqueInner.length;
    for (var _i3 = 0; _i3 < m; _i3 += 1) {
      uniqueInner[_i3].x = 0;
      uniqueInner[_i3].y = -m * heightInner / 2 + _i3 * heightInner;
      uniqueInner[_i3].offset = widthInner(uniqueInner[_i3].name, _i3);
    } // for i

    // Generate bands for each (non-empty) subgroup-subgroup link
    counter = 0;
    for (var _i4 = 0; _i4 < n; _i4 += 1) {
      var _di = groupIndex[_i4];
      s = subgroupIndex[_di].length;
      for (j = 0; j < s; j += 1) {
        var outerGroup = subgroups[counter];
        var innerTerm = outerGroup.innername;
        // Find the correct inner object based on the name
        var innerGroup = searchTerm(innerTerm, 'name', uniqueInner);
        if (outerGroup.value) {
          looms.push({ inner: innerGroup, outer: outerGroup });
        } // if
        counter += 1;
      } // for j
    } // for i

    return sortLooms ? looms.sort(sortLooms) : looms;
  } // loomLayout

  function searchTerm(term, property, arrayToSearch) {
    for (var i = 0; i < arrayToSearch.length; i += 1) {
      if (arrayToSearch[i][property] === term) {
        return arrayToSearch[i];
      } // if
    } // for i
    return null;
  } // searchTerm

  loomLayout.padAngle = function (_) {
    return arguments.length ? (padAngle = Math.max(0, _), loomLayout) : padAngle;
  };

  loomLayout.inner = function (_) {
    return arguments.length ? (inner = _, loomLayout) : inner;
  };

  loomLayout.outer = function (_) {
    return arguments.length ? (outer = _, loomLayout) : outer;
  };

  loomLayout.value = function (_) {
    return arguments.length ? (value = _, loomLayout) : value;
  };

  loomLayout.heightInner = function (_) {
    return arguments.length ? (heightInner = _, loomLayout) : heightInner;
  };

  loomLayout.widthInner = function (_) {
    return arguments.length ? (widthInner = typeof _ === 'function' ? _ : constant(+_), loomLayout) : widthInner;
  };

  loomLayout.emptyPerc = function (_) {
    return arguments.length ? (emptyPerc = _ < 1 ? Math.max(0, _) : Math.max(0, _ * 0.01), loomLayout) : emptyPerc;
  };

  loomLayout.sortGroups = function (_) {
    return arguments.length ? (sortGroups = _, loomLayout) : sortGroups;
  };

  loomLayout.sortSubgroups = function (_) {
    return arguments.length ? (sortSubgroups = _, loomLayout) : sortSubgroups;
  };

  loomLayout.sortLooms = function (_) {
    return arguments.length ? (_ == null ? sortLooms = null : (sortLooms = compareValue(_))._ = _, loomLayout) : sortLooms && sortLooms._;
  };

  return loomLayout;
} // loom

/* global d3 */

function string() {
  var slice = Array.prototype.slice;
  var cos = Math.cos;
  var sin = Math.sin;
  var halfPi = Math.PI / 2;
  var tau = Math.PI * 2;

  var inner = function inner(d) {
    return d.inner;
  };
  var outer = function outer(d) {
    return d.outer;
  };
  var radius = function radius() {
    return 100;
  };
  var groupStartAngle = function groupStartAngle(d) {
    return d.groupStartAngle;
  };
  var startAngle = function startAngle(d) {
    return d.startAngle;
  };
  var endAngle = function endAngle(d) {
    return d.endAngle;
  };
  var x = function x(d) {
    return d.x;
  };
  var y = function y(d) {
    return d.y;
  };
  var offset = function offset(d) {
    return d.offset;
  };
  var pullout = 50;
  var thicknessInner = 0;
  var context = null;

  function stringLayout() {
    var buffer = void 0;

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var argv = slice.call(args);
    var out = outer.apply(this, argv);
    var inn = inner.apply(this, argv);
    argv[0] = out;
    var sr = +radius.apply(this, argv);
    var sa0 = startAngle.apply(this, argv) - halfPi;
    var sga0 = groupStartAngle.apply(this, argv) - halfPi;
    var sa1 = endAngle.apply(this, argv) - halfPi;
    var sx0 = sr * cos(sa0);
    var sy0 = sr * sin(sa0);
    var sx1 = sr * cos(sa1);
    var sy1 = sr * sin(sa1);
    argv[0] = inn;
    // 'tr' is assigned a value but never used
    // const tr = +radius.apply(this, (argv));
    var tx = x.apply(this, argv);
    var ty = y.apply(this, argv);
    var toffset = offset.apply(this, argv);
    var xco = void 0;
    var yco = void 0;
    var xci = void 0;
    var yci = void 0;

    // Does the group lie on the left side;
    var leftHalf = sga0 + halfPi > Math.PI && sga0 + halfPi < tau;
    // If the group lies on the other side, switch the inner point offset
    if (leftHalf) toffset = -toffset;
    tx += toffset;
    // And the height of the end point
    var theight = leftHalf ? -thicknessInner : thicknessInner;

    if (!context) {
      buffer = d3.path();
      context = buffer;
    }

    // Change the pullout based on where the stringLayout is
    var pulloutContext = (leftHalf ? -1 : 1) * pullout;
    sx0 += pulloutContext;
    sx1 += pulloutContext;
    // Start at smallest angle of outer arc
    context.moveTo(sx0, sy0);
    // Circular part along the outer arc
    context.arc(pulloutContext, 0, sr, sa0, sa1);
    // From end outer arc to center (taking into account the pullout)
    xco = d3.interpolateNumber(pulloutContext, sx1)(0.5);
    yco = d3.interpolateNumber(0, sy1)(0.5);
    if (!leftHalf && sx1 < tx || leftHalf && sx1 > tx) {
      // If the outer point lies closer to the center than the inner point
      xci = tx + (tx - sx1) / 2;
      yci = d3.interpolateNumber(ty + theight / 2, sy1)(0.5);
    } else {
      xci = d3.interpolateNumber(tx, sx1)(0.25);
      yci = ty + theight / 2;
    } // else
    context.bezierCurveTo(xco, yco, xci, yci, tx, ty + theight / 2);
    // Draw a straight line up/down (depending on the side of the circle)
    context.lineTo(tx, ty - theight / 2);
    // From center (taking into account the pullout) to start of outer arc
    xco = d3.interpolateNumber(pulloutContext, sx0)(0.5);
    yco = d3.interpolateNumber(0, sy0)(0.5);
    if (!leftHalf && sx0 < tx || leftHalf && sx0 > tx) {
      // If the outer point lies closer to the center than the inner point
      xci = tx + (tx - sx0) / 2;
      yci = d3.interpolateNumber(ty - theight / 2, sy0)(0.5);
    } else {
      xci = d3.interpolateNumber(tx, sx0)(0.25);
      yci = ty - theight / 2;
    } // else
    context.bezierCurveTo(xci, yci, xco, yco, sx0, sy0);
    // Close path
    context.closePath();

    if (buffer) {
      context = null;
      return '' + buffer || null;
    }
    return null;
  }

  stringLayout.radius = function (_) {
    return arguments.length ? (radius = typeof _ === 'function' ? _ : constant(+_), stringLayout) : radius;
  };

  stringLayout.groupStartAngle = function (_) {
    return arguments.length ? (groupStartAngle = typeof _ === 'function' ? _ : constant(+_), stringLayout) : groupStartAngle;
  };

  stringLayout.startAngle = function (_) {
    return arguments.length ? (startAngle = typeof _ === 'function' ? _ : constant(+_), stringLayout) : startAngle;
  };

  stringLayout.endAngle = function (_) {
    return arguments.length ? (endAngle = typeof _ === 'function' ? _ : constant(+_), stringLayout) : endAngle;
  };

  stringLayout.x = function (_) {
    return arguments.length ? (x = _, stringLayout) : x;
  };

  stringLayout.y = function (_) {
    return arguments.length ? (y = _, stringLayout) : y;
  };

  stringLayout.offset = function (_) {
    return arguments.length ? (offset = _, stringLayout) : offset;
  };

  stringLayout.thicknessInner = function (_) {
    return arguments.length ? (thicknessInner = _, stringLayout) : thicknessInner;
  };

  stringLayout.inner = function (_) {
    return arguments.length ? (inner = _, stringLayout) : inner;
  };

  stringLayout.outer = function (_) {
    return arguments.length ? (outer = _, stringLayout) : outer;
  };

  stringLayout.pullout = function (_) {
    return arguments.length ? (pullout = _, stringLayout) : pullout;
  };

  stringLayout.context = function (_) {
    return arguments.length ? (context = _ == null ? null : _, stringLayout) : context;
  };

  return stringLayout;
}

exports.loom = loom;
exports.string = string;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=d3-loom.js.map
