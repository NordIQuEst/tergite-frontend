import { Box, Button, Flex, Icon, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { MdFirstPage, MdLastPage } from 'react-icons/md';
import NavbarVisualizations from '../components/NavbarVisualizations';
import QubitVisualization from '../components/visualizations/QubitVisualization';
import CardBackend from '../components/CardBackend';
import { useQuery } from 'react-query';

type VisualizationRoutes =
	| 'Qubitmap'
	| 'Histogram'
	| 'Graphdeviation'
	| 'Linegraph'
	| 'Tableview'
	| 'Cityplot';

const Detail = () => {
	const [isCollapsed, setCollapsed] = useState(false);
	return (
		<Flex flex='1' py='8' w='full' id='deailId'>
			<Flex gap='8' flex='1'>
				<SidePanel
					isCollapsed={isCollapsed}
					setCollapsed={setCollapsed}
					MdFirstPage={MdFirstPage}
				/>
				<Flex flexDir='column' bg='white' flex='5' p='4' borderRadius='md' boxShadow='lg'>
					<NavbarVisualizations
						isCollapsed={isCollapsed}
						onToggleCollapse={() => setCollapsed(!isCollapsed)}
					/>
					<VisualizationPanel isCollapsed={isCollapsed} />
				</Flex>
			</Flex>
		</Flex>
	);
};

const VisualizationPanel = ({ isCollapsed }) => {
	const router = useRouter();
	const type = router.query.type as VisualizationRoutes;
	switch (type) {
		case 'Qubitmap':
			return <QubitVisualization isCollapsed={isCollapsed} />;
		case 'Histogram':
			return <>histogram</>;
		case 'Graphdeviation':
			return <>Graphdeviation</>;
		case 'Linegraph':
			return <>Linegraph</>;
		case 'Tableview':
			return <>Tableview</>;
		case 'Cityplot':
			return <>Cityplot</>;
		default:
			return <QubitVisualization isCollapsed={isCollapsed} />;
	}
};

export default Detail;

function SidePanel({ isCollapsed, setCollapsed, MdFirstPage }) {
	const router = useRouter();
	const [backend, setBackend] = useState<string>("");

	useEffect(()=>{
		if(!router.isReady) return;	
		setBackend(router.query.id);
	}, [router.isReady]);

	const { isLoading, data, error } = useQuery('backendOverview', () =>
		fetch('http://qtl-webgui-2.mc2.chalmers.se:8080/devices/'+backend).then((res) => res.json())
	);

	if (isLoading || error) return '';

	return (
		!isCollapsed && (
			<Box bg='white' flex='2' p='4' py='6' borderRadius='md' boxShadow='lg'>
				<Flex justifyContent='space-between'>
				<CardBackend {...Array.isArray(data) ? data[0] : data}/>
				<Button p='1' onClick={() => setCollapsed(!isCollapsed)}>
				<Icon as={MdFirstPage} w={8} h={8} />
				</Button>
				</Flex>
			</Box>

//<Flex justifyContent='space-between'>
//<Text fontSize='2xl' color='black'>
//Chalmers Luki
//</Text>
//<Button p='2' onClick={() => setCollapsed(!isCollapsed)}>
//<Icon as={MdFirstPage} w={8} h={8} />
//</Button>
//</Flex>
//<Text fontSize='4xl' color='black'>
//description
//</Text>

		)
	);
}
