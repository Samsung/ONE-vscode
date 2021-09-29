let circleJson, durCircleJson;
function TreeMap(json) {
	console.log(json);
	circleJson = json;
	durCircleJson = json;
	let g = new dagreD3.graphlib.Graph()
		.setGraph({});
	let nodes = [];
	let inputNode, outputNode;

	g.setNode(0, { label: "input", class: "type-input" });
	json.forEach((element, idx) => {
		let type = element.properties.type;
		let myIndex = element.outputs[0].location;
		let parentsIndex = [];
		let location = element.properties.location;
		let attributes = element.attributes;
		let inputs = element.inputs;
		let outputs = element.outputs;
		inputs.forEach(input => {
			if (input.edge === true)
				parentsIndex.push(input);
		});

		let node = {
			'index': myIndex,
			'type': type,
			'class': "type-" + type,
			'parents': parentsIndex,
			'location': location,
			'attributes': attributes,
			'inputs': inputs,
			'outputs': outputs
		};

		let label = `<p class='type'>${type}</p>`;

		// inputs label create
		inputs.forEach((input, checkIdx) => {
			if (checkIdx === 0 || input.edge === true) {
				return;
			}

			label += `<p><label><b>input${checkIdx}</b></label><span>&lt;${getTypeArray('x', input.type)}&gt;</span></p>`;
		})

		attributes.forEach(attr => {
			if (attr['attribute'] === 'fused_activation_function' && attr['value'] !== 'NONE') {
				label += `<p class='activation'>${attr['value']}</p>`
			}
		})

		// if element has duration
		if (element.hasOwnProperty('duration')) {
			let timeUnit = element.duration.timeUnit;
			let dur1 = element.duration.dur1;
			let dur2 = element.duration.dur2;

			label += `<p class='duration-title'>DURATION</p>`;
			label += `<p class='duration'>${dur1.toFixed(4)} ${timeUnit} <b>&roarr;</b> ${dur2.toFixed(4)} ${timeUnit}</p>`;
		}

		//First node logic
		if (idx === 0) {
			inputNode = {
				'index': 0,
				'class': 'type-input',
				'inputs': [element.inputs[0]],
				'outputs': [],
				'parents': []
			}

			g.setNode(0, { label: 'input', class: 'type-input' });
		}

		// Last node logic
		if (idx === json.length - 1) {
			let outputParentIndex = [];
			let name = outputs[0].name;

			outputParentIndex.push({
				location: myIndex,
			});

			inputNode.outputs.push(outputs[0]);

			outputNode = {
				'label': name,
				'class': 'type-' + name,
				'parents': outputParentIndex,
				'inputs': inputNode.inputs,
				'outputs': [outputs[0]],
				'index': myIndex + 1
			};

			nodes.push(inputNode);
			nodes.push(outputNode);
			g.setNode(outputNode.index, { labelType: 'html', label: outputNode.label, class: outputNode.class });
		}

		nodes.push(node);
		g.setNode(node.index, { labelType: 'html', label: label, class: node.class });
	});

	g.nodes().forEach(function (v) {
		let node = g.node(v);
		//  Round the corners of the nodes
		node.rx = node.ry = 5;
	});

	nodes.forEach(node => {
		let index = node.index;
		let parents = node.parents;
		parents.forEach(parent => {
			let label = `<p class="edge-label">${getTypeArray('x', parent.type)}</p>`;

			g.setEdge(parent.location, index, { labelType: 'html', label: label, curve: d3.curveBasis, arrowheadClass: 'arrowhead' });
			console.log(parent.location + "->" + index);
		})
	});

	let render = new dagreD3.render();

	let svg = d3.select('#wrapper').append("svg");
	let inner = svg.append("g");

	// Set up zoom support
	d3.select('#wrapper')
		.on('scroll', scrolled)
		.call(d3.zoom()
			.scaleExtent([0.1, 10])
			.on('zoom', () => zoomed(inner, g)));

	render(inner, g);

	svg.attr("width", g.graph().width + 300);
	svg.attr("height", g.graph().height);
	svg.selectAll("g.node")
		.on("click", (id) => createDetailContent(nodes, id, g));
}

function zoomed(inner, g) {
	const scale = d3.event.transform.k;

	// 그래프 크기 조절
	inner.attr("transform", d3.event.transform);

	const scaledWidth = (g.graph().width + 300) * scale;
	const scaledHeight = (g.graph().height) * scale;

	// Change SVG dimensions.
	d3.select('svg')
		.attr('width', scaledWidth)
		.attr('height', scaledHeight);

	// Scale the image itself.
	d3.select('svg').attr('transform', `scale(${scale})`);

	// Move scrollbars.
	const wrapper = d3.select('#wrapper').node();
	wrapper.scrollLeft = -d3.event.transform.x;
	wrapper.scrollTop = -d3.event.transform.y;

	// If the image is smaller than the wrapper, move the image towards the
	// center of the wrapper.
	const dx = d3.max([0, wrapper.clientWidth / 2 - scaledWidth / 2]);
	const dy = d3.max([0, wrapper.clientHeight / 2 - scaledHeight / 2]);
	d3.select('svg').attr('transform', `translate(${dx}, ${dy})`);
}

function scrolled() {
	const wrapper = d3.select('#wrapper');
	const x = wrapper.node().scrollLeft + wrapper.node().clientWidth / 2;
	const y = wrapper.node().scrollTop + wrapper.node().clientHeight / 2;
	const scale = d3.zoomTransform(wrapper.node()).k;
	// Update zoom parameters based on scrollbar positions.
	wrapper.call(d3.zoom().translateTo, x / scale, y / scale);
}