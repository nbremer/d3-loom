/* Based on the d3v4 d3.chord() function by Mike Bostock
** Adjusted by Nadieh Bremer - July 2016 */

/* global d3 */
import compareValue from './compare-value';
import constant from './constant';

export default function loom() {
  const tau = Math.PI * 2;

  let padAngle = 0;
  let sortGroups = null;
  let sortSubgroups = null;
  let sortLooms = null;
  let emptyPerc = 0.2;
  let heightInner = 20;
  let widthInner = () => 30;
  let value = d => d.value;
  let inner = d => d.inner;
  let outer = d => d.outer;

  function loomLayout(layoutData) {
    // Nest the data on the outer variable
    const data = d3.nest().key(outer).entries(layoutData);

    const n = data.length;

    // Loop over the outer groups and sum the values

    const groupSums = [];
    const groupIndex = d3.range(n);
    const subgroupIndex = [];
    const looms = [];
    looms.groups = new Array(n);
    const groups = looms.groups;
    let numSubGroups;
    looms.innergroups = [];
    const uniqueInner = looms.innergroups;
    const uniqueCheck = [];
    let k;
    let x;
    let x0;
    let j;
    let l;
    let s;
    let v;
    let sum;
    let section;
    let remain;
    let counter;
    let reverseOrder = false;
    let approxCenter;
    k = 0;
    numSubGroups = 0;
    for (let i = 0; i < n; i += 1) {
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
      groupIndex.sort((a, b) => sortGroups(groupSums[a], groupSums[b]));
    }

    // Sort subgroups…
    if (sortSubgroups) {
      subgroupIndex.forEach((d, i) => {
        d.sort((a, b) =>
          sortSubgroups(inner(data[i].values[a]), inner(data[i].values[b]))
        );
      });
    }

    // After which group are we past the center, taking into account the padding
    // TODO: make something for if there is no "nice" split in two...
    const padk = k * (padAngle / tau);
    l = 0;
    for (let i = 0; i < n; i += 1) {
      section = groupSums[groupIndex[i]] + padk;
      l += section;
      if (l > (k + n * padk) / 2) {
        // Check if the group should be added to left or right
        remain = k + n * padk - (l - section);
        approxCenter = remain / section < 0.5
          ? groupIndex[i]
          : groupIndex[i - 1];
        break;
      } // if
    } // for i

    // How much should be added to k to make the empty part emptyPerc big of the total
    const emptyk = k * emptyPerc / (1 - emptyPerc);
    k += emptyk;

    // Convert the sum to scaling factor for [0, 2pi].
    k = Math.max(0, tau - padAngle * n) / k;
    const dx = k ? padAngle : tau / n;

    // Compute the start and end angle for each group and subgroup.
    // Note: Opera has a bug reordering object literal properties!
    const subgroups = new Array(numSubGroups);
    x = emptyk * 0.25 * k; // starting with quarter of the empty part to the side;
    counter = 0;
    for (let i = 0; i < n; i += 1) {
      const di = groupIndex[i];
      const outername = data[di].key;

      x0 = x;
      s = subgroupIndex[di].length;
      for (j = 0; j < s; j += 1) {
        const dj = reverseOrder
          ? subgroupIndex[di][s - 1 - j]
          : subgroupIndex[di][j];

        v = value(data[di].values[dj]);
        const innername = inner(data[di].values[dj]);
        const a0 = x;
        x += v * k;
        const a1 = x;
        subgroups[counter] = {
          index: di,
          subindex: dj,
          startAngle: a0,
          endAngle: a1,
          value: v,
          outername,
          innername,
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
        outername
      };
      x += dx;
      // If this is the approximate center, add half of the empty piece for the bottom
      if (approxCenter === di) x += emptyk * 0.5 * k;
      // If you've crossed the bottom, reverse the order of the inner strings
      if (x > Math.PI) reverseOrder = true;
    } // for i

    // Sort the inner groups in the same way as the strings
    if (sortSubgroups) {
      uniqueInner.sort((a, b) => sortSubgroups(a.name, b.name));
    }

    // Find x and y locations of the inner categories
    const m = uniqueInner.length;
    for (let i = 0; i < m; i += 1) {
      uniqueInner[i].x = 0;
      uniqueInner[i].y = -m * heightInner / 2 + i * heightInner;
      uniqueInner[i].offset = widthInner(uniqueInner[i].name, i);
    } // for i

    // Generate bands for each (non-empty) subgroup-subgroup link
    counter = 0;
    for (let i = 0; i < n; i += 1) {
      const di = groupIndex[i];
      s = subgroupIndex[di].length;
      for (j = 0; j < s; j += 1) {
        const outerGroup = subgroups[counter];
        const innerTerm = outerGroup.innername;
        // Find the correct inner object based on the name
        const innerGroup = searchTerm(innerTerm, 'name', uniqueInner);
        if (outerGroup.value) {
          looms.push({ inner: innerGroup, outer: outerGroup });
        } // if
        counter += 1;
      } // for j
    } // for i

    return sortLooms ? looms.sort(sortLooms) : looms;
  } // loomLayout

  function searchTerm(term, property, arrayToSearch) {
    for (let i = 0; i < arrayToSearch.length; i += 1) {
      if (arrayToSearch[i][property] === term) {
        return arrayToSearch[i];
      } // if
    } // for i
    return null;
  } // searchTerm

  loomLayout.padAngle = function(_) {
    return arguments.length
      ? ((padAngle = Math.max(0, _)), loomLayout)
      : padAngle;
  };

  loomLayout.inner = function(_) {
    return arguments.length ? ((inner = _), loomLayout) : inner;
  };

  loomLayout.outer = function(_) {
    return arguments.length ? ((outer = _), loomLayout) : outer;
  };

  loomLayout.value = function(_) {
    return arguments.length ? ((value = _), loomLayout) : value;
  };

  loomLayout.heightInner = function(_) {
    return arguments.length ? ((heightInner = _), loomLayout) : heightInner;
  };

  loomLayout.widthInner = function(_) {
    return arguments.length
      ? ((widthInner = typeof _ === 'function' ? _ : constant(+_)), loomLayout)
      : widthInner;
  };

  loomLayout.emptyPerc = function(_) {
    return arguments.length
      ? ((emptyPerc = _ < 1
          ? Math.max(0, _)
          : Math.max(0, _ * 0.01)), loomLayout)
      : emptyPerc;
  };

  loomLayout.sortGroups = function(_) {
    return arguments.length ? ((sortGroups = _), loomLayout) : sortGroups;
  };

  loomLayout.sortSubgroups = function(_) {
    return arguments.length ? ((sortSubgroups = _), loomLayout) : sortSubgroups;
  };

  loomLayout.sortLooms = function(_) {
    return arguments.length
      ? (_ == null
          ? (sortLooms = null)
          : ((sortLooms = compareValue(_))._ = _), loomLayout)
      : sortLooms && sortLooms._;
  };

  return loomLayout;
} // loom
