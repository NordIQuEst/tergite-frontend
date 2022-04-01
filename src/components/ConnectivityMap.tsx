import { Box } from '@chakra-ui/react';
import { Text } from '@visx/text';
import { Grid } from '@visx/grid';
import { DefaultLink, DefaultNode, Graph } from '@visx/network';
import { scaleLinear } from '@visx/scale';
import { ParentSize } from '@visx/responsive';
import React, { useEffect, useMemo } from 'react';
import { Group } from '@visx/group';
import { AxisBottom, AxisLeft, AxisRight } from '@visx/axis';
import { localPoint } from '@visx/event';

interface Node {
	x: number;
	y: number;
}
interface Link {
	source: Node;
	target: Node;
}

interface Data {
	nodes: Node[];
	links: Link[];
}

interface ConnectivityMapProps {
	data: Data;
	type: 'node' | 'link';
	backgroundColor?: string;
	borderRadius?: number;
	nodeColor?: string;
	linkColor?: string;
}

const Square = ({ children }) => {
	return (
		<ParentSize>
			{({ width, height }) => (
				<Box w={width + 'px'} height={width + 'px'}>
					{children}{' '}
				</Box>
			)}
		</ParentSize>
	);
};
const ConnectivityMap: React.FC<ConnectivityMapProps> = ({ data, backgroundColor, type }) => {
	return (
		<Square>
			<Box bg='gray.200' borderRadius='md' p='4' w='full' h='full'>
				<ParentSize>
					{({ width, height }) => (
						<VisxChart
							data={data}
							height={height}
							width={width}
							type={type}
							backgroundColor={backgroundColor}
						/>
					)}
				</ParentSize>
			</Box>
		</Square>
	);
};

type VisxChartProps = {
	data: Data;
	height: number;
	width: number;
	backgroundColor: string;
	type: 'node' | 'link';
};

type CustomLinkProps = {
	link: Link;
	yMax: number;
	xMax: number;
};

const CustomLink: React.FC<CustomLinkProps> = ({ link, yMax, xMax }) => {
	console.log('from', link.source);
	const scale = 0;
	return (
		<Group top={link.source.x} left={link.source.y}>
			{' '}
			<line
				x1={`${link.source.x}`}
				y1={`${link.source.y}`}
				x2={`${link.source.x + 100}`}
				y2={`${link.source.y + 0}`}
				strokeWidth={2}
				stroke='#f00'
			></line>
			{/* <DefaultLink link={link}></DefaultLink> */}
		</Group>
	);
};

const VisxChart: React.FC<VisxChartProps> = ({ data, height, width, backgroundColor, type }) => {
	const xMargin = 45;
	const yMargin = 45;
	const yMax = height - yMargin;
	const xMax = width - xMargin;
	const xScale = scaleLinear({
		domain: [0, 5], // x-coordinate data values
		range: [0, xMax], // svg x-coordinates, svg x-coordinates increase left to right
		round: true
	});

	const yScale = scaleLinear({
		domain: [5, 0], // x-coordinate data values
		range: [0, yMax], // svg x-coordinates, svg x-coordinates increase left to right
		round: true
	});

	const [pos, setPos] = React.useState({ x: 0, y: 0 });
	const newData = useMemo(
		() =>
			data.nodes.map(({ x, y }) => {
				return { x: x * (xMax / 10), y: yMax / 2 - y * (yMax / 10) };
			}),
		[data.nodes, xMax, yMax]
	);
	const newLinks = useMemo(
		() =>
			data.links.map(({ source, target }) => {
				return {
					source: {
						x: source.x * (xMax / 10),
						y: +source.y * (yMax / 10)
					},
					target: {
						x: target.x * (xMax / 10),
						y: +target.y * (yMax / 10)
					}
				};
			}),
		[data.links, xMax, yMax]
	);

	return (
		xMax > 0 &&
		yMax > 0 && (
			<svg width={width} height={height} rx={14}>
				<Group left={yMargin} top={10}>
					<Graph
						graph={{
							nodes: newData,
							links: newLinks
						}}
						nodeComponent={({ node: { x, y } }) =>
							// <Text x={x} y={y} fill='#f1f2a'>
							// 	{`${Math.floor(x)}, ${Math.floor(y)}`}
							// </Text>
							type === 'node' && (
								<CustomNode
									yMax={yMax}
									xMax={xMax}
									x={x}
									y={y}
									setPos={setPos}
									pos={pos}
								/>
							)
						}
						linkComponent={(link) =>
							type == 'link' ? (
								<CustomLink link={link.link} xMax={xMax} yMax={yMax} />
							) : (
								<></>
							)
						}
					></Graph>
					<Grid
						xScale={xScale}
						yScale={yScale}
						width={xMax}
						height={yMax}
						numTicksColumns={5}
						numTicksRows={5}
						stroke='#ccc'
						rx={14}
					/>
					<AxisBottom scale={xScale} top={yMax} orientation='bottom' numTicks={6} />
					<AxisLeft scale={yScale} orientation='left' numTicks={5} />
				</Group>
			</svg>
		)
	);
};

type CustomNodeProps = {
	yMax: number;
	xMax: number;
	x: number;
	y: number;
	setPos: React.Dispatch<Node>;
	pos: Node;
};

const CustomNode: React.FC<CustomNodeProps> = ({ yMax, xMax, x, y, setPos, pos }) => {
	return (
		<Group top={yMax / 20} left={xMax / 20}>
			<rect
				x={x}
				y={y}
				width={xMax / 10}
				height={yMax / 10}
				fill={x === pos.x && y === pos.y ? '#38B2AC' : '#366361'}
				stroke={x === pos.x && y === pos.y ? '#66FFF7' : '#366361'}
				strokeWidth={2}
				onMouseDown={(e) => {
					setPos({
						x,
						y
					});
				}}
				onMouseEnter={(e) => {
					e.currentTarget.setAttribute('fill', '#38B2AC');
					e.currentTarget.setAttribute('stroke', '#66FFF7');
				}}
				onMouseLeave={(e) => {
					if (x !== pos.x || y !== pos.y) {
						e.currentTarget.setAttribute('fill', '#366361');
						e.currentTarget.setAttribute('stroke', '#366361');
					}
				}}
			/>
		</Group>
	);
};

export default ConnectivityMap;
