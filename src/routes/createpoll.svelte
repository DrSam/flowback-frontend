<script lang="ts">
	import Button from '$lib/Generic/Button.svelte';
	import Layout from '$lib/Generic/Layout.svelte';
	import TextInput from '$lib/Generic/TextInput.svelte';
	import { page } from '$app/stores';
	import { fetchRequest } from '$lib/FetchRequest';
	import TextArea from '$lib/Generic/TextArea.svelte';
	import Tag from '$lib/Group/Tag.svelte';
	import { onMount } from 'svelte';
	import type { Tag as TagType } from '$lib/Group/interface';
	import StatusMessage from '$lib/Generic/StatusMessage.svelte';
	import { DateInput } from 'date-picker-svelte';
	import { _ } from 'svelte-i18n';
	import type { StatusMessageInfo } from '$lib/Generic/GenericFunctions';
	import Fa from 'svelte-fa/src/fa.svelte';
	import { faArrowUp } from '@fortawesome/free-solid-svg-icons/faArrowUp';
	import { faArrowDown } from '@fortawesome/free-solid-svg-icons/faArrowDown';
	import { faX } from '@fortawesome/free-solid-svg-icons/faX';
	import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
	import { faWallet } from '@fortawesome/free-solid-svg-icons/faWallet';
	import { faSliders } from '@fortawesome/free-solid-svg-icons/faSliders';
	import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons/faCalendarAlt';
	import { faHourglass } from '@fortawesome/free-solid-svg-icons/faHourglass';
	import { faClockRotateLeft } from '@fortawesome/free-solid-svg-icons/faClockRotateLeft';
	import Loader from '$lib/Generic/Loader.svelte';
	import RadioButtons from '$lib/Generic/RadioButtons.svelte';
	import { statusMessageFormatter } from '$lib/Generic/StatusMessage';

	type polltypes = 'Ranking' | 'For/Against' | 'Quadratic' | 'Cardinal' | 'Scheduled';
	type timetypes = 'Endtime' | 'Dynamic';

	let selected_poll: polltypes = 'Ranking';
	let selected_time: timetypes = 'Endtime';
	//Something about this feels very scuffed
	const polls: polltypes[] = ['Ranking', 'Scheduled'];
	const times: timetypes[] = ['Endtime'];

	const pollDescriptions: Record<polltypes, string> = {
		Ranking: `Ranking is the method of preferential voting known as the borda count. The top proposal in Added always gets the number of points as there are proposals (it does not depend on there being proposals below it), and the one below that gets that number minus one, the one below that gets that number minus two and so on. Each proposal that are in abstain each get zero points. This is added over all voters and is divided by the total number of votes to get the result.`,
		'For/Against': `For/Against is the method where each proposal that is voted for gets one point and each voted against gets minus one independently of order, all other proposals get zero points. The points are then added over all voters and is divided by the total number of votes to get the result.`,
		Cardinal: `Cardinal currently has no description`,
		Quadratic: `Quadratic is the method where each member can rank by writing any number for all polls, which are ranked accordingly and get the percentage compared to the total that the member gives, the percentages are added up over all members and divided by the total to get the result. This means that not only are the proposals ranked by order of preference, but the degree by which one proposal is better than another is reflected. Totals will not exceed 10^6.`,
		Scheduled: `Scheduled is the method where dates and times are voted on to decide meetings or events for the members of the group. Time polls are always Private and can only be seen by group members. One can only vote for a time or vote to drop the proposal, a default proposal for every time poll. This is carried out by the ranking method.`
	};

	const timeDescriptions: Record<timetypes, string> = {
		Endtime: `An poll with an end date has a specified time when the poll finishes and results are displayed.`,
		Dynamic: `A dynamic poll is always on and lacks an end date, results are always on display as they change dynamically.`
	};

	const disabled: (polltypes | timetypes)[] = ['For/Against', 'Cardinal', 'Quadratic', 'Dynamic'];

	const pollIcons: Record<polltypes, any[]> = {
		Ranking: [faArrowUp, faArrowDown],
		'For/Against': [faCheck, faX],
		Cardinal: [faSliders],
		Quadratic: [faWallet],
		Scheduled: [faCalendarAlt]
	};

	const timeIcons: Record<timetypes, any[]> = {
		Endtime: [faHourglass],
		Dynamic: [faClockRotateLeft]
	};

	let title = '',
		description = '',
		tags: TagType[] = [],
		selectedTag: TagType,
		status: StatusMessageInfo,
		start_date = new Date(),
		delegate_vote_end_date = new Date(),
		prediction_end_date = new Date(),
		proposal_end_date = new Date(),
		end_date = new Date(),
		isPublic = false,
		loading = false,
		advancedTimeSettings = false,
		daysBetweenPhases = 1;

	const groupId = $page.url.searchParams.get('id');

	const maxDatePickerYear = new Date((new Date().getFullYear() + 5).toString());

	const createPoll = async () => {
		if (selectedTag === undefined) {
			status = { message: 'Must select tag', success: false };
			return;
		}

		loading = true;
		const { res, json } = await fetchRequest('POST', `group/${groupId}/poll/create`, {
			title,
			description,
			start_date,
			delegate_vote_end_date,
			prediction_end_date: delegate_vote_end_date,
			proposal_end_date,
			end_date,
			poll_type: selected_poll === 'Ranking' ? 1 : 3,
			tag: selectedTag.id,
			dynamic: false,
			public: isPublic
		});

		loading = false;
		status = statusMessageFormatter(res, json);
		if (res.ok) window.location.href = `groups/${groupId}/polls/${json}`;
	};

	const getGroupTags = async () => {
		loading = true;
		const { json } = await fetchRequest('GET', `group/${groupId}/tags?limit=100`);
		loading = false;
		tags = json.results;
		selectedTag = tags[0];
	};

	$: daysBetweenPhases && changedate();

	const changedate = () => {
		const now = new Date();
		start_date = new Date();
		proposal_end_date = new Date(now.setDate(now.getDate() + daysBetweenPhases));
		delegate_vote_end_date = new Date(now.setDate(now.getDate() + daysBetweenPhases));
		end_date = new Date(now.setDate(now.getDate() + daysBetweenPhases));
	};

	onMount(() => {
		getGroupTags();
	});
</script>

<Layout centering={true}>
	<div class="flex flex-col md:flex-row mt-8 gap-6 ml-8 mr-8 lg:w-[900px]">
		<form
			on:submit|preventDefault={() =>
				!disabled.includes(selected_poll) && !disabled.includes(selected_time)
					? createPoll()
					: null}
			class="md:w-2/3"
		>
			<Loader {loading}>
				<div class="bg-white p-6 shadow-xl flex flex-col gap-3 rounded">
					<h1 class="text-2xl">{$_('Create a poll')}</h1>
					<TextInput required label="Title" bind:value={title} />
					<TextArea required label="Description" bind:value={description} />

					<div class="border border-gray-200 p-6 ">
						<Button
							Class={`inline !bg-blue-600`}
							action={() => (advancedTimeSettings = !advancedTimeSettings)}
							>{$_('Advanced time settings')}</Button
						>
						<h2 class="mt-4">{$_('Days between phases')}</h2>
						<input type="number" bind:value={daysBetweenPhases} min="1" max="1000" />

						{#if advancedTimeSettings}
							<div class="flex flex-wrap gap-6 justify-center">
								<div>
									<h2 class="mt-4">{$_('Poll start')}</h2>
									<DateInput
										format="yyyy-MM-dd HH:mm"
										closeOnSelection
										bind:value={start_date}
										min={new Date()}
										max={maxDatePickerYear}
									/>
								</div>
								<div>
									<h2 class="mt-4">{$_('Proposal vote date')}</h2>
									<DateInput
										format="yyyy-MM-dd HH:mm"
										closeOnSelection
										bind:value={proposal_end_date}
										min={start_date}
										max={maxDatePickerYear}
									/>
								</div>

								<!-- <h2 class="mt-4">{$_('Prediction vote date')}</h2>
					<DateInput
						format="yyyy-MM-dd HH:mm"
						closeOnSelection
						bind:value={prediction_end_date}
						min={proposal_end_date}
						max={maxDatePickerYear}
					/> -->
								<div>
									<h2 class="mt-4">{$_('Delegate vote date')}</h2>
									<DateInput
										format="yyyy-MM-dd HH:mm"
										closeOnSelection
										bind:value={delegate_vote_end_date}
										min={proposal_end_date}
										max={maxDatePickerYear}
									/>
								</div>
								<div>
									<h2 class="mt-4">{$_('End date')}</h2>
									<DateInput
										format="yyyy-MM-dd HH:mm"
										closeOnSelection
										bind:value={end_date}
										min={delegate_vote_end_date}
										max={maxDatePickerYear}
									/>
								</div>
							</div>
						{/if}
					</div>
					<h2>{$_('Select Tag')}</h2>
					<div class="flex gap-4 flex-wrap">
						{#each tags as tag}
							<Tag
								onclick={() => (selectedTag = tag)}
								tag={tag.tag_name}
								Class={`cursor-pointer ${selectedTag === tag ? 'bg-blue-600' : 'bg-blue-200'}`}
							/>
						{/each}
					</div>
					<RadioButtons bind:Yes={isPublic} label="Public?" />
					{#if disabled.includes(selected_poll) || disabled.includes(selected_time)}
						{$_('This polltype is not implemented yet')}
					{/if}
					<StatusMessage bind:status />
					<Button
						type="submit"
						disabled={loading ||
							disabled.includes(selected_poll) ||
							disabled.includes(selected_time)}
						Class={disabled.includes(selected_poll) || disabled.includes(selected_time)
							? '!bg-gray-200'
							: 'bg-primary'}>{$_('Create Poll')}</Button
					>
				</div>
			</Loader>
		</form>
		<div class="md:w-1/3">
			<div class="bg-white p-6 shadow-xl rounded">
				<div class="flex flex-col gap-6">
					{#each polls as poll}
						<Button
							disabled={loading}
							action={() => (selected_poll = poll)}
							buttonStyle={selected_poll === poll ? 'primary' : 'secondary'}
							Class={`${
								(!disabled.includes(poll) && selected_poll === poll
									? '!bg-primary' 
									: '!bg-secondary') ||
								(disabled.includes(poll) &&
									(selected_poll === poll ? '!bg-gray-400' : '!bg-gray-200'))
							}`}
						>
							<div class="flex items-center text-center">
								<!-- Some buttons have multiple icons -->
								{#each pollIcons[poll] as icon}
									<Fa {icon} />
								{/each}

								<span class="ml-10">{$_(poll)}</span>
							</div>
						</Button>
					{/each}
				</div>
				<div class="flex flex-col gap-6 mt-12">
					{#each times as time}
						<Button
							disabled={loading}
							Class={`${
								disabled.includes(time) &&
								(selected_time === time ? '!bg-gray-400' : '!bg-gray-200')
							} ${selected_time === time ? 'bg-purple-600' : 'bg-purple-300'}`}
							action={() => (selected_time = time)}
						>
							<div class="flex items-center text-center">
								{#each timeIcons[time] as icon}
									<Fa {icon} />
								{/each}
								<span class="ml-10">{$_(time)}</span>
							</div>
						</Button>
					{/each}
				</div>
			</div>
			<div class="bg-white p-6 shadow-xl mt-4 rounded">
				<div>
					{#each Object.entries(pollDescriptions) as [pollType, description]}
						{#if selected_poll === pollType}
							{$_(description)}
						{/if}
					{/each}
				</div>
				<div class="mt-6">
					{#each Object.entries(timeDescriptions) as [timeType, description]}
						{#if selected_time === timeType}
							{$_(description)}
						{/if}
					{/each}
				</div>
			</div>
		</div>
	</div>
</Layout>
