import React, { ReactNode, useState, useReducer } from 'react';

export type BackendContextState = {
	selectedNode: number;
	selectedLink: number;
	nodeType: string;
	linkType: string;
	timeFrom: Date;
	timeTo: Date;
	nodes: Point[];
	links: Link[];
};

type BackendContextProps = [
	BackendContextState,
	React.Dispatch<{ type: DateActions; payload: Date } | { type: MapActions; payload: number }>
];

export enum MapActions {
	SELECT_NODE = 'SELECT_NODE',
	SELECT_LINK = 'SELECT_LINK',
	SET_NODES = 'SET_NODES',
	SET_LINKS = 'SET_LINKS',
	SET_NODE_TYPE = 'SET_NODE_TYPE',
	SET_LINK_TYPE = 'SET_LINK_TYPE'
}

export enum DateActions {
	SET_TIME_FROM = 'SET_TIME_FROM',
	SET_TIME_TO = 'SET_TIME_TO'
}

function fixDirections(links) {
	// this function ensures that for all links {x0,y0,x1,y1} x0 < x1 and y0 < y1
	// this is needed for the padding of the links to work correctly
	// const filteredLinks = links.filter(({ from, to }) => {
	// 	return from.x - to.x < 0 || to.x - from.x < 0;
	// });
	const newLinks = links.map((link) => {
		console.log('link??', link);
		let { from, to, id } = link;
		let temp;
		if (from.x < to.x) {
			temp = from;
			from = to;
			to = temp;
		} else if (from.y < to.y) {
			temp = from;
			from = to;
			to = temp;
		}
		return { id, from, to, vertical: from.x === to.x ? true : false };
	});
	console.log('new links', newLinks);
	return newLinks;
}

function flatten(links, ctx: BackendContextState): any {
	console.log('123', ctx.nodes);

	return links.map((link) => {
		return {
			...link,
			from: ctx.nodes.find(({ id }) => id === link.qubits[0]),
			to: ctx.nodes.find(({ id }) => id === link.qubits[1])
		};
	});
}

// action.payload.map((e) => {
// 					const from = state.nodes.find((n) => n.id == e.from);
// 					const to = state.nodes.find((n) => n.id == e.to);
// 					return {
// 						...e,
// 						from: { id: from.id, x: from.x, y: from.y },
// 						to: { id: to.id, x: to.x, y: to.y }
// 					};
// 				}) as Link[]

function reducer(
	state: BackendContextState,
	action:
		| { type: DateActions; payload: Date }
		| { type: MapActions; payload: number | Link[] | Point[] | nodeType | linkType }
): BackendContextState {
	switch (action.type) {
		case MapActions.SELECT_NODE:
			return { ...state, selectedNode: action.payload as number };
		case MapActions.SELECT_LINK:
			return { ...state, selectedLink: action.payload as number };
		case MapActions.SET_NODES:
			return { ...state, nodes: action.payload[state.nodeType] as Point[] };
		case MapActions.SET_LINKS:
			return {
				...state,
				links: fixDirections(flatten(action.payload[state.linkType], state))
			};
		case MapActions.SET_NODE_TYPE:
			return { ...state, nodeType: action.payload as nodeType };
		case MapActions.SET_LINK_TYPE:
			return { ...state, linkType: action.payload as linkType };

		case DateActions.SET_TIME_FROM:
			return { ...state, timeFrom: action.payload };
		case DateActions.SET_TIME_TO:
			return { ...state, timeTo: action.payload };
	}
}
const BackendContext = React.createContext<BackendContextProps>(null);

type BackendContextProviderProps = {
	children: ReactNode;
};
const BackendContextProvider: React.FC<BackendContextProviderProps> = ({ children }) => {
	let timeFrom = new Date();
	timeFrom.setDate(timeFrom.getDate() - 7);
	const data: BackendContextState = {
		selectedNode: -1,
		selectedLink: -1,
		nodeType: 'qubits',
		linkType: 'couplers',
		timeFrom,
		timeTo: new Date(),
		nodes: [],
		links: []
	};
	const x = useReducer(reducer, data);

	return <BackendContext.Provider value={x}>{children}</BackendContext.Provider>;
};
export default BackendContextProvider;
export { BackendContext };
