'use client';

import Page, { HeaderBtn, PageHeader, PageMain } from '@/components/Page';
import { fetcher, post, raise } from '@/service/browser';
import { API } from '@/types';
import useSWRImmutable from 'swr/immutable';
import useSWRMutation from 'swr/mutation';
import { MouseEvent, useCallback, useMemo, useState } from 'react';
import Form, { CustomInputEvent, Input } from '@/components/Form';
import useSWR from 'swr';
import Modal from '@/components/Modal';
import PreformatedText from '@/components/PreformatedText';

const defaultTokenData: API.AppTokenPartial = {
	title: '',
	project_ext_id: '',
	lifespan_seconds: 0
};

export default function CreateToken() {
	const { error: authError } = useSWR('/api/me', fetcher<API.User>);
	authError && raise(authError);

	const { data: config, error: configErr } = useSWRImmutable<API.Config>(`/api/config`, fetcher);
	configErr && raise(configErr);

	const swrKey = config ? `${config.baseUrl}/auth/me/app-tokens` : null;
	const {
		trigger: submit,
		isMutating,
		error
	} = useSWRMutation(swrKey, post<API.AppTokenPartial, API.AppToken>, {
		populateCache: false,
		revalidate: false
	});
	error && raise(error);

	const [newToken, setNewToken] = useState<API.AppTokenPartial>(defaultTokenData);

	const [createdToken, setCreatedToken] = useState<API.AppToken>();
	const [isModalVisible, setisModalVisible] = useState(false);

	const btnText = useMemo(() => (isMutating ? 'Generating...' : 'Generate'), [isMutating]);

	const handleSubmit = useCallback(
		async (ev: MouseEvent<HTMLButtonElement>) => {
			ev.preventDefault();
			const response = await submit(newToken);
			setCreatedToken(response);
			setisModalVisible(true);
		},
		[submit, newToken]
	);

	const handleInputChange = useCallback(
		(ev: CustomInputEvent<string | number | (string | number)[]>) => {
			ev.preventDefault();
			const { name, value } = ev.target;
			setNewToken((prevObj) => ({ ...prevObj, [name]: value }));
		},
		[setNewToken]
	);

	const handleModalCloseBtnClick = useCallback((ev: MouseEvent<HTMLButtonElement>) => {
		ev.preventDefault();
		setisModalVisible(false);
		setCreatedToken(undefined);
		setNewToken(defaultTokenData);
	}, []);

	return (
		<Page className='w-full h-full'>
			<Form className='w-full h-full'>
				<PageHeader heading='Projects'>
					<HeaderBtn
						type='button'
						text={btnText}
						onClick={handleSubmit}
						disabled={isMutating}
					/>
				</PageHeader>

				<PageMain className='py-10 px-5'>
					<Input
						type='text'
						value={newToken.title}
						label='Name'
						name='title'
						required
						onChange={handleInputChange}
					/>

					{/* TODO: Change this to an autocomplete input to get /auth/me/projects */}
					<Input
						label='Project'
						value={newToken.project_ext_id}
						type='text'
						name='project_ext_id'
						required
						onChange={handleInputChange}
					/>

					<Input
						label='Lifespan (Seconds)'
						value={newToken.lifespan_seconds}
						type='number'
						name='lifespan_seconds'
						required
						onChange={handleInputChange}
					/>

					{createdToken?.token && isModalVisible && (
						<Modal onClose={handleModalCloseBtnClick}>
							<p data-token-alert className='text-sm text-slate-800 w-full'>
								Here is your new token. Copy it and keep it securely. It will not be
								shown to you again.
							</p>
							<PreformatedText text={createdToken.token} />
						</Modal>
					)}
				</PageMain>
			</Form>
		</Page>
	);
}
