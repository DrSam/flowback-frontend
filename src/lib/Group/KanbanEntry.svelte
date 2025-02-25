<script lang="ts">
	import Fa from 'svelte-fa/src/fa.svelte';
	import { _ } from 'svelte-i18n';
	import { faArrowLeft } from '@fortawesome/free-solid-svg-icons/faArrowLeft';
	import { faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight';
	import { fade } from 'svelte/transition';
	import ProfilePicture from '$lib/Generic/ProfilePicture.svelte';
	import Modal from '$lib/Generic/Modal.svelte';
	import TextInput from '$lib/Generic/TextInput.svelte';
	import TextArea from '$lib/Generic/TextArea.svelte';
	import { page } from '$app/stores';
	import Button from '$lib/Generic/Button.svelte';
	import { fetchRequest } from '$lib/FetchRequest';
	import { statusMessageFormatter } from '$lib/Generic/StatusMessage';
	import StatusMessage from '$lib/Generic/StatusMessage.svelte';
	import type { StatusMessageInfo } from '$lib/Generic/GenericFunctions';

	const tags = ['', 'Backlog', 'To do', 'In progress', 'Evaluation', 'Done'];
	let openModal = false,
		selectedEntry: number,
		status: StatusMessageInfo;

	export let kanban: any,
		type: 'group' | 'home',
		users: any[],
		removeKanbanEntry: (id: number) => void;

	// initializes the kanban to be edited when modal is opened
	let kanbanEdited = {
		id: kanban.id,
		description: kanban.description,
		title: kanban.title,
		assignee: kanban.assignee.id
	};

	const updateKanbanContent = async () => {
		const { res, json } = await fetchRequest(
			'POST',
			`group/${$page.params.groupId}/kanban/${kanban.id}/update`,
			kanbanEdited
		);
		status = statusMessageFormatter(res, json);
		if (!res.ok) return;

		kanban.title = kanbanEdited.title;
		kanban.description = kanbanEdited.description;

		const assignee = users.find(user => user.user_id === kanbanEdited.assignee)
		kanban.assignee.id = kanbanEdited.assignee
		kanban.assignee.username = assignee.username
		kanban.assignee.profile_image = assignee.profile_image
		
		openModal = false;
	};

	const updateKanbanTag = async (kanban: any) => {
		const { res, json } = await fetchRequest(
			'POST',
			`group/${$page.params.groupId}/kanban/${kanban.id}/update`,
			kanban
		);
		status = statusMessageFormatter(res, json);
		kanban.tag = kanban.tag;
	};

	const changeAssignee = (e: any) => {
		kanbanEdited.assignee = Number(e.target.value);
	};

	// Delete kanban removes it from the database,
	// remove kanban removes the displaying of the kanban.
	const deleteKanbanEntry = async () => {
		const { res, json } = await fetchRequest(
			'POST',
			`group/${$page.params.groupId}/kanban/${kanban.id}/delete`
		);
		status = statusMessageFormatter(res, json);
		removeKanbanEntry(kanban.id);
	};
</script>

<li class="bg-white border border-gray-200 hover:bg-gray-200 p-2" in:fade>
	<div
		on:click={() => {
			openModal = true;
			selectedEntry = kanban.id;
		}}
		class="cursor-pointer hover:underline"
	>
		<div class="p-1 py-3">{kanban.title}</div>
	</div>
	<div
		class="flex mt-2 gap-2 items-center text-sm cursor-pointer hover:underline"
		on:click={() =>
			(window.location.href =
				type === 'group' ? `/user?id=${kanban.assignee.id}` : `groups/${kanban.group.id}`)}
	>
		<ProfilePicture user={type === 'group' ? kanban.assignee : kanban.group} Class="" />
		<div class="break-all text-xs">
			{type === 'group' ? kanban.assignee.username : kanban.group.name}
		</div>
	</div>
	<!-- Arrows -->
	{#if type === 'group'}
		<div class="flex justify-between mt-3">
			<div
				class="cursor-pointer hover:text-gray-500"
				on:click={() => {
					if (kanban.tag > 0) {
						updateKanbanTag({ id: kanban.id, tag: kanban.tag - 1 });
						kanban.tag -= 1;
					}
				}}
			>
				<Fa icon={faArrowLeft} size="1.5x" />
			</div>
			<div
				class="cursor-pointer hover:text-gray-500"
				on:click={() => {
					if (kanban.tag < tags.length) {
						updateKanbanTag({ id: kanban.id, tag: kanban.tag + 1 });
						kanban.tag += 1;
					}
				}}
			>
				<Fa icon={faArrowRight} size="1.5x" />
			</div>
		</div>
	{/if}
</li>

{#if kanban.id === selectedEntry}
	<Modal bind:open={openModal} Class="z-50">
		<div slot="header" class="mt-7">
		<TextInput bind:value={kanbanEdited.title} label="" inputClass="border-none"/>
	</div>
		<div slot="body">
			<StatusMessage bind:status disableSuccess />
			<TextArea rows={14} bind:value={kanbanEdited.description} label="" Class="h-full" inputClass="border-none"/>
			<select on:input={changeAssignee} value={kanban.assignee.id}>
				{#each users as user}
					<option value={user.user_id}>{user.username}</option>
				{/each}
			</select>
		</div>
		<div slot="footer">
			<Button action={updateKanbanContent}>{$_("Update")}</Button>
			<Button action={deleteKanbanEntry} Class="bg-red-500">{$_("Delete")}</Button>
		</div>
	</Modal>
{/if}

