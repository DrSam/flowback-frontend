<script lang="ts">
	import TextInput from '$lib/Generic/TextInput.svelte';
	import type { Filter } from './interface';
	import { _ } from 'svelte-i18n';
	import Fa from 'svelte-fa/src/fa.svelte';
	import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons/faMagnifyingGlass';
	import Button from '$lib/Generic/Button.svelte';

	export let filter: Filter = { search: '', finishedSelection:"all", public: false };
	export let handleSearch: () => {};
	//Aesthethics only, changes the UI when searching would lead to different results.
	let searched = true;

	const handleFinishedSelection = (e:any) => {
		filter.finishedSelection = e.target.value
		handleSearch();
	}
</script>

<form
	class="bg-white shadow rounded p-6 flex flex-col w-full gap-4"
	on:submit|preventDefault={() => {
		searched = true;
		handleSearch();
	}}
>
	<div class="w-full flex items-end">
		<TextInput
			Class="w-4/5"
			onInput={() => (searched = false)}
			label={$_('Search')}
			bind:value={filter.search}
		/>

		<Button
			Class={`w-8 h-8 ml-4 !p-1 flex justify-center items-center transition transition-colors ${
				searched ? 'bg-blue-300' : 'bg-blue-600'
			}`}
			type="submit"
		>
			<Fa icon={faMagnifyingGlass} />
		</Button>
	</div>
	<div>
		<select on:input={handleFinishedSelection}>
			<option value="all">{$_("All")}</option>
			<option value="unfinished">{$_("Ongoing")}</option>
			<option value="finished">{$_("Done")}</option>
		</select>
		<!-- <CheckboxButtons
			label={''}
			labels={[
				{ label: 'Finished', checked: false },
				{ label: 'Not Finished', checked: false }
			]}
		/>
	</div> -->
	<!--<CheckboxButtons label={''} labels={[{label:'Public', checked:true}, {label:'Private', checked:true}]} /> -->
</form>
