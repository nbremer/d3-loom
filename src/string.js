/* global d3 */
import constant from './constant';

export default function string() {
  const slice = Array.prototype.slice;

  const cos = Math.cos;
  const sin = Math.sin;
  const halfPi = Math.PI / 2;
  const tau = Math.PI * 2;

  let inner = d => d.inner;
  let outer = d => d.outer;
  let radius = () => 100;
  let groupStartAngle = d => d.groupStartAngle;
  let startAngle = d => d.startAngle;
  let endAngle = d => d.endAngle;
  let x = d => d.x;
  let y = d => d.y;
  let offset = d => d.offset;
  let pullout = 50;
  let thicknessInner = 0;
  let context = null;

  function stringLayout(...args) {
    let buffer;

    // Does the group lie on the left side

    const argv = slice.call(args);
    const out = outer.apply(this, argv);
    // 'inn' is assigned a value but never used
    // const inn = inner.apply(this, argv);
    const sr = +radius.apply(this, ((argv[0] = out), argv));
    const sa0 = startAngle.apply(this, argv) - halfPi;
    const sga0 = groupStartAngle.apply(this, argv) - halfPi;
    const sa1 = endAngle.apply(this, argv) - halfPi;
    let sx0 = sr * cos(sa0);
    const sy0 = sr * sin(sa0);
    let sx1 = sr * cos(sa1);
    const sy1 = sr * sin(sa1);
    // 'tr' is assigned a value but never used
    // const tr = +radius.apply(this, ((argv[0] = inn), argv));
    let tx = x.apply(this, argv);
    const ty = y.apply(this, argv);
    let toffset = offset.apply(this, argv);
    let xco;
    let yco;
    let xci;
    let yci;
    const leftHalf = sga0 + halfPi > Math.PI && sga0 + halfPi < tau;
    // If the group lies on the other side, switch the inner point offset
    if (leftHalf) toffset = -toffset;
    tx += toffset;
    // And the height of the end point
    const theight = leftHalf ? -thicknessInner : thicknessInner;

    if (!context) {
      buffer = d3.path();
      context = buffer;
      return context;
    }

    // Change the pullout based on where the stringLayout is
    const pulloutContext = (leftHalf ? -1 : 1) * pullout;
    sx0 += pulloutContext;
    sx1 += pulloutContext;

    // Start at smallest angle of outer arc
    context.moveTo(sx0, sy0);
    // Circular part along the outer arc
    context.arc(pulloutContext, 0, sr, sa0, sa1);
    // From end outer arc to center (taking into account the pullout)
    xco = d3.interpolateNumber(pulloutContext, sx1)(0.5);
    yco = d3.interpolateNumber(0, sy1)(0.5);
    if ((!leftHalf && sx1 < tx) || (leftHalf && sx1 > tx)) {
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
    if ((!leftHalf && sx0 < tx) || (leftHalf && sx0 > tx)) {
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
      return `${buffer}` || null;
    }
    return null;
  } // function stringLayout

  stringLayout.radius = function (_) {
    return arguments.length
      ? ((radius = typeof _ === 'function' ? _ : constant(+_)), stringLayout)
      : radius;
  };

  stringLayout.groupStartAngle = function (_) {
    return arguments.length
      ? ((groupStartAngle = typeof _ === 'function'
          ? _
          : constant(+_)), stringLayout)
      : groupStartAngle;
  };

  stringLayout.startAngle = function (_) {
    return arguments.length
      ? ((startAngle = typeof _ === 'function'
          ? _
          : constant(+_)), stringLayout)
      : startAngle;
  };

  stringLayout.endAngle = function (_) {
    return arguments.length
      ? ((endAngle = typeof _ === 'function' ? _ : constant(+_)), stringLayout)
      : endAngle;
  };

  stringLayout.x = function (_) {
    return arguments.length ? ((x = _), stringLayout) : x;
  };

  stringLayout.y = function (_) {
    return arguments.length ? ((y = _), stringLayout) : y;
  };

  stringLayout.offset = function (_) {
    return arguments.length ? ((offset = _), stringLayout) : offset;
  };

  stringLayout.thicknessInner = function (_) {
    return arguments.length
      ? ((thicknessInner = _), stringLayout)
      : thicknessInner;
  };

  stringLayout.inner = function (_) {
    return arguments.length ? ((inner = _), stringLayout) : inner;
  };

  stringLayout.outer = function (_) {
    return arguments.length ? ((outer = _), stringLayout) : outer;
  };

  stringLayout.pullout = function (_) {
    return arguments.length ? ((pullout = _), stringLayout) : pullout;
  };

  stringLayout.context = function (_) {
    return arguments.length
      ? ((context = _ == null ? null : _), stringLayout)
      : context;
  };

  return stringLayout;
}
