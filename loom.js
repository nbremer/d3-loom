/*Based on the d3v4 d3.chord() function by Mike Bostock
** Adjusted by Nadieh Bremer - July 2016 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-collection'), require('d3-array'), require('d3-interpolate'), require('d3-path')) :
	typeof define === 'function' && define.amd ? define(['exports', 'd3-collection', 'd3-array', 'd3-interpolate', 'd3-path'], factory) :
	(factory((global.d3 = global.d3 || {}),global.d3,global.d3,global.d3,global.d3));
}(this, function (exports,d3Collection,d3Array,d3Interpolate,d3Path) { 'use strict';

	function loom(data) {
		
		var pi$3 = Math.PI;
		var tau$3 = pi$3 * 2;
		var max$1 = Math.max;
		
		var padAngle = 0,
			sortGroups = null,
			sortSubgroups = null,
			sortLooms = null,
			emptyPerc = 0.2,
			heightInner = 20,
			widthInner = function() { return 30; },
			value = function(d) { return d.value; },
			inner = function(d) { return d.inner; },
			outer = function(d) { return d.outer; };

		function loom(data) {

			//Nest the data on the outer variable
			data = d3.nest().key(outer).entries(data);

			var n = data.length,
				groupSums = [],
				groupIndex = d3.range(n),
				subgroupIndex = [],
				looms = [],
				groups = looms.groups = new Array(n),
				subgroups,
				numSubGroups,
				uniqueInner = looms.innergroups = [],
				uniqueCheck = [],
				emptyk,
				k,
				x,
				x0,
				dx,
				i,
				j,
				l,
				m,
				s,
				v,
				sum,
				counter,
				reverseOrder = false,
				approxCenter;

			//Loop over the outer groups and sum the values
			k = 0;
			numSubGroups = 0;
			for(i = 0; i < n; i++) {
				v = data[i].values.length;
				sum = 0;
				for(j = 0; j < v; j++) {
					sum += value(data[i].values[j]);
				}//for j
				groupSums.push(sum);
				subgroupIndex.push(d3.range(v));
				numSubGroups += v;
				k += sum;	
			}//for i
		
			// Sort the groups…
			if (sortGroups) 
				groupIndex.sort(function(a, b) { return sortGroups(groupSums[a], groupSums[b]); });

			// Sort subgroups…
			if (sortSubgroups) 
				subgroupIndex.forEach(function(d, i) {
					d.sort(function(a, b) { return sortSubgroups( inner(data[i].values[a]), inner(data[i].values[b]) ); });
				});
					
			//After which group are we past the center
			//TODO: make something for if there is no nice split in two...
			l = 0;
			for(i = 0; i < n; i++) {
				l += groupSums[groupIndex[i]];
				if(l > k/2) {
					approxCenter = groupIndex[i];
					break;
				}//if
			}//for i
		
			//How much should be added to k to make the empty part emptyPerc big of the total
			emptyk = k * emptyPerc / (1 - emptyPerc);
			k += emptyk;

			// Convert the sum to scaling factor for [0, 2pi].
			k = max$1(0, tau$3 - padAngle * n) / k;
			dx = k ? padAngle : tau$3 / n;
	  
			// Compute the start and end angle for each group and subgroup.
			// Note: Opera has a bug reordering object literal properties!
			subgroups = new Array(numSubGroups);
			x = emptyk * 0.25 * k; //quarter of the empty part //0;
			counter = 0;
			for(i = 0; i < n; i++) {
				var di = groupIndex[i],
					outername = data[di].key;
				
				if(approxCenter === di) { 
					x = x + emptyk * 0.5 * k; 
				}//if
				x0 = x;
				//If you've crossed the bottom, reverse the order of the inner strings
				if(x > pi$3) reverseOrder = true;
				s = subgroupIndex[di].length;
				for(j = 0; j < s; j++) {
					var dj = reverseOrder ? subgroupIndex[di][(s-1)-j] : subgroupIndex[di][j],
						v = value(data[di].values[dj]),
						innername = inner(data[di].values[dj]),
						a0 = x,
						a1 = x += v * k;
						subgroups[counter] = {
							index: di,
							subindex: dj,
							startAngle: a0,
							endAngle: a1,
							value: v,
							outername: outername,
							innername: innername
						};
					
					//Check and save the unique inner names
					if( !uniqueCheck[innername] ) {
						uniqueCheck[innername] = true;
						uniqueInner.push({name: innername});
					}//if
					
					counter += 1;
				}//for j
				groups[di] = {
					index: di,
					startAngle: x0,
					endAngle: x,
					value: groupSums[di],
					outername: outername
				};
				x += dx;		
			}//for i

			//Sort the inner groups in the same way as the strings
			uniqueInner.sort(function(a, b) { return sortSubgroups( a.name, b.name ); });
		
			//Find x and y locations of the inner categories
			//TODO: make x depend on length of inner name	
			m = uniqueInner.length
			for(i = 0; i < m; i++) {
				uniqueInner[i].x = 0;
				uniqueInner[i].y = -m*heightInner/2 + i*heightInner;
				uniqueInner[i].offset = widthInner(uniqueInner[i].name, i, uniqueInner);
			}//for i
	  			
			//Generate bands for each (non-empty) subgroup-subgroup link
			counter = 0;
			for(i = 0; i < n; i++) {
				var di = groupIndex[i];
				s = subgroupIndex[di].length;
				for(j = 0; j < s; j++) {
					var outerGroup = subgroups[counter];
					var innerTerm = outerGroup.innername;
					//Find the correct inner object based on the name
					var innerGroup = searchTerm(innerTerm, "name", uniqueInner);
					if (outerGroup.value) {
						looms.push({inner: innerGroup, outer: outerGroup});
					}//if
					counter +=1;
				}//for j
			}//for i

			return sortLooms ? looms.sort(sortLooms) : looms;
		}//function loom

		function searchTerm(term, property, arrayToSearch){
			for (var i=0; i < arrayToSearch.length; i++) {
				if (arrayToSearch[i][property] === term) {
					return arrayToSearch[i];
				}//if
			}//for i
		}//searchTerm

		function constant$11(x) {
			return function() { return x; };
		}

		loom.padAngle = function(_) {
			return arguments.length ? (padAngle = max$1(0, _), loom) : padAngle;
		};

		loom.inner = function(_) {
			return arguments.length ? (inner = _, loom) : inner;
		};

		loom.outer = function(_) {
			return arguments.length ? (outer = _, loom) : outer;
		};

		loom.value = function(_) {
			return arguments.length ? (value = _, loom) : value;
		};

		loom.heightInner = function(_) {
			return arguments.length ? (heightInner = _, loom) : heightInner;
		};

		loom.widthInner = function(_) {
			return arguments.length ? (widthInner = typeof _ === "function" ? _ : constant$11(+_), loom) : widthInner;
		};

		loom.emptyPerc = function(_) {
			return arguments.length ? (emptyPerc = _ < 1 ? max$1(0, _) : max$1(0, _*0.01), loom) : emptyPerc;
		};

		loom.sortGroups = function(_) {
			return arguments.length ? (sortGroups = _, loom) : sortGroups;
		};

		loom.sortSubgroups = function(_) {
			return arguments.length ? (sortSubgroups = _, loom) : sortSubgroups;
		};

		loom.sortLooms = function(_) {
			return arguments.length ? (_ == null ? sortLooms = null : (sortLooms = compareValue(_))._ = _, loom) : sortLooms && sortLooms._;
		};

		return loom;
	}//loom



	function string() {

		var slice$5 = Array.prototype.slice;

		var cos = Math.cos;
		var sin = Math.sin;
		var pi$3 = Math.PI;
		var halfPi$2 = pi$3 / 2;
		var tau$3 = pi$3 * 2;
		var max$1 = Math.max;

		var inner = function (d) { return d.inner; },
			outer = function (d) { return d.outer; },
			radius = function (d) { return d.radius; },
			startAngle = function (d) { return d.startAngle; },
			endAngle = function (d) { return d.endAngle; },
			x = function (d) { return d.x; },
			y = function (d) { return d.y; },
			offset = function (d) { return d.offset; },
			pullout = 50,
			thicknessInner = 0, 
			context = null;

		function string() {
			var buffer,
				argv = slice$5.call(arguments),
				out = outer.apply(this, argv),
				inn = inner.apply(this, argv),
				sr = +radius.apply(this, (argv[0] = out, argv)),
				sa0 = startAngle.apply(this, argv) - halfPi$2,
				sa1 = endAngle.apply(this, argv) - halfPi$2,
				sx0 = sr * cos(sa0),
				sy0 = sr * sin(sa0),
				sx1 = sr * cos(sa1),
				sy1 = sr * sin(sa1),
				tr = +radius.apply(this, (argv[0] = inn, argv)),
				tx = x.apply(this, argv),
				ty = y.apply(this, argv),
				toffset = offset.apply(this, argv),
				theight,
				xco,
				yco,
				xci,
				yci,
				leftHalf,
				pulloutContext;
			
			//Does the group lie on the left side
			leftHalf = sa0+halfPi$2 > pi$3 && sa0+halfPi$2 < tau$3;
			//If the group lies on the other side, switch the inner point offset
			if(leftHalf) toffset = -toffset;
			tx = tx + toffset;
			//And the height of the end point
			theight = leftHalf ? -thicknessInner : thicknessInner;
			

			if (!context) context = buffer = d3.path();

			//Change the pullout based on where the string is
			pulloutContext  = (leftHalf ? -1 : 1 ) * pullout;
			sx0 = sx0 + pulloutContext;
			sx1 = sx1 + pulloutContext;
			
			//Start at smallest angle of outer arc
			context.moveTo(sx0, sy0);
			//Circular part along the outer arc
			context.arc(pulloutContext, 0, sr, sa0, sa1);
			//From end outer arc to center (taking into account the pullout)
			xco = d3.interpolateNumber(pulloutContext, sx1)(0.5);
			yco = d3.interpolateNumber(0, sy1)(0.5);
			if( (!leftHalf && sx1 < tx) || (leftHalf && sx1 > tx) ) {
				//If the outer point lies closer to the center than the inner point
				xci = tx + (tx - sx1)/2;
				yci = d3.interpolateNumber(ty + theight/2, sy1)(0.5);
			} else {
				xci = d3.interpolateNumber(tx, sx1)(0.25);
				yci = ty + theight/2;
			}//else
			context.bezierCurveTo(xco, yco, xci, yci, tx, ty + theight/2);
			//Draw a straight line up/down (depending on the side of the circle)
			context.lineTo(tx, ty - theight/2);
			//From center (taking into account the pullout) to start of outer arc
			xco = d3.interpolateNumber(pulloutContext, sx0)(0.5);
			yco = d3.interpolateNumber(0, sy0)(0.5);
			if( (!leftHalf && sx0 < tx) || (leftHalf && sx0 > tx) ) { 
				//If the outer point lies closer to the center than the inner point
				xci = tx + (tx - sx0)/2;
				yci = d3.interpolateNumber(ty - theight/2, sy0)(0.5);
			} else {
				xci = d3.interpolateNumber(tx, sx0)(0.25);
				yci = ty - theight/2;
			}//else
			context.bezierCurveTo(xci, yci, xco, yco, sx0, sy0);
			//Close path
			context.closePath();

			if (buffer) return context = null, buffer + "" || null;
		}//function string

		function constant$11(x) {
			return function() { return x; };
		}//constant$11

		string.radius = function(_) {
			return arguments.length ? (radius = typeof _ === "function" ? _ : constant$11(+_), string) : radius;
		};

		string.startAngle = function(_) {
			return arguments.length ? (startAngle = typeof _ === "function" ? _ : constant$11(+_), string) : startAngle;
		};

		string.endAngle = function(_) {
			return arguments.length ? (endAngle = typeof _ === "function" ? _ : constant$11(+_), string) : endAngle;
		};

		string.x = function(_) {
			return arguments.length ? (x = _, string) : x;
		};

		string.y = function(_) {
			return arguments.length ? (y = _, string) : y;
		};

		string.offset = function(_) {
			return arguments.length ? (offset = _, string) : offset;
		};

		string.thicknessInner = function(_) {
			return arguments.length ? (thicknessInner = _, string) : thicknessInner;
		};

		string.inner = function(_) {
			return arguments.length ? (inner = _, string) : inner;
		};

		string.outer = function(_) {
			return arguments.length ? (outer = _, string) : outer;
		};

		string.pullout = function(_) {
			return arguments.length ? (pullout = _, string) : pullout;
		};

		string.context = function(_) {
			return arguments.length ? ((context = _ == null ? null : _), string) : context;
		};

		return string;
	}//string



	exports.loom = loom;
	exports.string = string;

	Object.defineProperty(exports, '__esModule', { value: true });

}));