<script>
	import { onMount } from 'svelte';

	export let x;
	export let y;


	const settings = {
		baseNote: 261.6256,
		noteRange: 100
	}


	let synth;


	function onClick() {
		Tone.start();	
	}

	onMount(() => {
		let interval;

		synth = new Tone.Synth().toMaster();

		console.log( synth );

		synth.triggerAttack( 261 );


		interval = setInterval( () => {
			synth.frequency.rampTo( settings.baseNote + ( y * settings.noteRange ), 0.5 );
		}, 400 );


	    // onUnmount
		return () => {
			synth.triggerRelease();
			clearInterval( interval );
		};	    		
	} );

</script>



<style>
	.start {
		position: fixed;
		left: 0;
		bottom: 0;
		z-index: 1000;

		margin: 1rem;
	}
</style>


<button
	on:click={onClick}
	class="start"
	>Start</button>
