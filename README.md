# d3-loom

This is, sort of, a d3 plugin to create a "loom" visualization

[![The words spoken by the Fellowship member during all 3 movies](lotr.png "The words spoken by the Fellowship member during all 3 movies")](http://bl.ocks.org/nbremer/6599644129c034d0cb17fcdc452c310b)

## API Reference

<a href="#loom" name="loom">#</a> d3.<b>loom</b>()

Constructs a new loom generator with the default settings.

<a href="#_loom" name="_loom">#</a> <i>loom</i>(<i>data</i>)

Computes the loom layout for the specified *data*. The length of the returned array is the same as *data*, however, due to sorting of the strings, to reduce overlap, the ordering can be different than the initial data. 

Typically a dataset for the *loom* contains 3 values; the outer entity, the inner entity and the value that connects these two (e.g. outer = location, inner = person, value = days that person stayed in the location):

```js
var data = [
  {
    outer: "Amsterdam",
    inner: "Alexander",
    value: 679
  },
  {
    outer: "Bangkok",
    inner: "Brendan",
    value: 124
  },
  //...and so on
];
```

The return value of *loom*(*data*) is an array of *looms*, where each loom represents the connection between an entity in the center of the loom (the *inner*) and the entity on the outside of the loom (the *outer*) and is an object with the following properties:

* `inner` - the inner subgroup
* `outer` - the outer subgroup

Both the inner and outer subgroup are also objects. The inner has the following properties:

* `name` - the [name](#loom_inner) of the inner entity
* `offset` - the [horizontal offset](#loom_offset) of the inner string's endpoint
* `x` - the horizontal location of the inner entity
* `y` - the vertical location of the inner entity

And the outer has the following properties:

* `startAngle` - the [start angle](#loom_startAngle) of the arc in radians
* `endAngle` - the [end angle](#loom_endAngle) of the arc in radians
* `value` - the numeric [value](#loom_value) of the arc
* `index` - the zero-based [sorted index](#loom_sort) of the arc
* `subindex` - the zero-based [sorted sub-index](#loom_sub_sort) of the arc
* `innername` - the [name](#loom_inner) of the connected inner entity
* `outername` - the [name](#loom_outer) of the outer entity

The looms are passed to [d3.string](#string) to display the relationships between the inner and outer entities.

The *looms* array also defines a two secondary arrays. The first, called *groups*, is an array represting the outer entities. The length of the array is the number of unique outer entities and is an object with the following properties:

* `startAngle` - the [start angle](#loom_startAngle) of the arc in radians
* `endAngle` - the [end angle](#loom_endAngle) of the arc in radians
* `value` - the numeric [value](#loom_value) of the arc
* `index` - the zero-based [sorted index](#loom_sort) of the arc
* `outername` - the [name](#loom_outer) of the outer entity

The *groups* are passed to [d3.arc](https://github.com/d3/d3-shape#arc) to produce a donut chart around the circumference of the loom layout.

The other array, called, *innergroups*, is an array represting the inner entities. The length of the array is the number of unique inner entities and is an object with the following properties:

* `name` - the [name](#loom_inner) of the inner entity
* `offset` - the [horizontal offset](#loom_offset) of the inner string's endpoint
* `x` - the horizontal location of the inner entity
* `y` - the vertical location of the inner entity

The *innergroups* are used to create the textual representation of the inner entities in the center of the loom layout.

<a href="#loom_padAngle" name="#loom_padAngle">#</a> <i>loom</i>.<b>padAngle</b>([<i>angle</i>]) [<>](https://github.com/nbremer/d3-loom/blob/master/loom.js#L195 "Source")

If *angle* is specified, sets the pad angle between adjacent groups to the specified number in radians and returns this loom layout. If *angle* is not specified, returns the current pad angle, which defaults to zero.

<a href="#loom_inner" name="#loom_inner">#</a> <i>loom</i>.<b>inner</b>([<i>inner</i>]) [<>](https://github.com/nbremer/d3-loom/blob/master/loom.js#L199 "Source")

The *inner* represents the name/id/... textual value of the entities that will be placed in the center. If *inner* is specified, sets the inner accessor to the specified function and returns this string generator. If *inner* is not specified, returns the current inner accessor, which defaults to:

```js
function inner(d) {
  return d.inner;
}
```

<a href="#loom_outer" name="#loom_outer">#</a> <i>loom</i>.<b>outer</b>([<i>outer</i>]) [<>](https://github.com/nbremer/d3-loom/blob/master/loom.js#L203 "Source")

The *outer* represents the name/id/... textual value of the entities that will be placed around the loom along a circle. If *outer* is specified, sets the outer accessor to the specified function and returns this string generator. If *outer* is not specified, returns the current outer accessor, which defaults to:

```js
function outer(d) {
  return d.outer;
}
```

<a href="#loom_value" name="#loom_value">#</a> <i>loom</i>.<b>value</b>([<i>value</i>]) [<>](https://github.com/nbremer/d3-loom/blob/master/loom.js#L207 "Source")

The *value* represents the numeric value that is the connection between the inner and outer entity. It is the value that determines the width of the strings on the outside. If *value* is specified, sets the value accessor to the specified function and returns this string generator. If *value* is not specified, returns the current value accessor, which defaults to:

```js
function value(d) {
  return d.value;
}
```

<a href="#loom_heightInner" name="#loom_heightInner">#</a> <i>loom</i>.<b>heightInner</b>([<i>height</i>]) [<>](https://github.com/nbremer/d3-loom/blob/master/loom.js#L211 "Source")

This *height* gives the vertical distance between the inner entities in the center. It is the value that determines the width of the strings on the outside. If *height* is specified, sets the heightInner to the specified number and returns this loom generator. If height is not specified, returns the current heightInner value, which defaults to 20.

<a href="#loom_widthOffsetInner" name="#loom_widthOffsetInner">#</a> <i>loom</i>.<b>widthOffsetInner</b>([<i>width</i>]) [<>](https://github.com/nbremer/d3-loom/blob/master/loom.js#L215 "Source")

This *width* gives the horizontal distance between the inner entities in the center. It is the value that determines the width of the strings on the outside. If *width* is specified, sets the widthOffsetInner to the specified function or number and returns this loom generator. If width is not specified, returns the current widthOffsetInner accessor, which defaults to:

```js
function widthOffsetInner() {
  return 30;
}
```

<a href="#loom_emptyPerc" name="#loom_emptyPerc">#</a> <i>loom</i>.<b>emptyPerc</b>([<i>value</i>]) [<>](https://github.com/nbremer/d3-loom/blob/master/loom.js#L219 "Source")

This *value* gives the percentage of the circle that will be empty to create space in the top and bottom. If *value* is specified, sets the current emptyPerc to the specified number in the range [0,1] and returns this loom generator. If value is not specified, returns the current emptyPerc value, which defaults to 0.2.

<a href="#loom_sortGroups" name="#loom_sortGroups">#</a> <i>loom</i>.<b>sortGroups</b>([<i>compare</i>]) [<>](https://github.com/nbremer/d3-loom/blob/master/loom.js#L223 "Source")

If *compare* is specified, sets the group comparator to the specified function or null and returns this loom layout. If *compare* is not specified, returns the current group comparator, which defaults to null. If the group comparator is non-null, it is used to sort the outer groups/entities by their total value (i.e. the sum of all the inner strings). See also [d3.ascending](https://github.com/d3/d3-array#ascending) and [d3.descending](https://github.com/d3/d3-array#descending).

<a href="#loom_sortSubgroups" name="#loom_sortSubgroups">#</a> <i>loom</i>.<b>sortSubgroups</b>([<i>compare</i>]) [<>](https://github.com/nbremer/d3-loom/blob/master/loom.js#L227 "Source")

If *compare* is specified, sets the subgroup comparator to the specified function or null and returns this loom layout. If *compare* is not specified, returns the current subgroup comparator, which defaults to null. If the subgroup comparator is non-null, it is used to sort the subgroups (i.e. the separate strings) within each outer entity by their value. See also [d3.ascending](https://github.com/d3/d3-array#ascending) and [d3.descending](https://github.com/d3/d3-array#descending).

<a href="#chord_sortLooms" name="#chord_sortLooms">#</a> <i>chord</i>.<b>sortLooms</b>([<i>compare</i>]) [<>](https://github.com/nbremer/d3-loom/blob/master/loom.js#L231 "Source")

If *compare* is specified, sets the loom comparator to the specified function or null and returns this loom layout. If *compare* is not specified, returns the current loom comparator, which defaults to null. If the loom comparator is non-null, it is used to sort the [looms](#_loom) by their total value; this only affects the *z*-order of the looms. See also [d3.ascending](https://github.com/d3/d3-array#ascending) and [d3.descending](https://github.com/d3/d3-array#descending).

<a href="#string" name="string">#</a> d3.<b>string</b>() [<>](https://github.com/nbremer/d3-loom/blob/master/loom.js#L240 "Source")

Creates a new string generator with the default settings.

<!-- 

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

		string.heightInner = function(_) {
			return arguments.length ? (heightInner = _, string) : heightInner;
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
		}; -->