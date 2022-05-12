import { Box, Tab, TabList, Tabs } from '@chakra-ui/react';
import React from 'react';

/*
To get current tab in parent element pass a setState function as a prop
Example: 
	const [tab, setTab] = useState('1')

	<RadioButtons setTab={setTab} tabs={['1', '2', '3']} />
*/
interface RadioButtonsProps {
	tabs: string[];
	setTab: (value: string) => void;
	defaultTab?: string;
	dataAttribute?: string;
}

const RadioButtons = ({ setTab, tabs, defaultTab, dataAttribute }: RadioButtonsProps) => {
	return (
		<Box
			borderRadius='full'
			border='1px'
			borderColor='grey'
			p='1'
			m='2px'
			w='fit-content'
			data-cy-radiobutton={dataAttribute ? dataAttribute : true}
		>
			<Tabs
				variant='soft-rounded'
				onChange={(index) => setTab(tabs[index])}
				defaultIndex={defaultTab ? tabs.indexOf(defaultTab) : 0}
			>
				<TabList>
					{tabs.map((item, index) => (
						<Tab
							key={index}
							_selected={{ color: 'white', bg: '#38B2AC', boxShadow: 'none' }}
						>
							{item}
						</Tab>
					))}
				</TabList>
			</Tabs>
		</Box>
	);
};

export default RadioButtons;
