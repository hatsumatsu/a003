<script>
	import { onMount } from 'svelte';

	export let x;
	export let y;


	const settings = {
		baseNote: 261.6256, // C4
		noteRange: 200
	}


	let synth;


	function onClick() {
		console.log( 'Synth.onClick()' );		
		
		Tone.start();	
	}


	function onTouchStart() {
		console.log( 'Synth.onTouchStart()' );

		synth.triggerAttack( settings.baseNote + ( y * settings.noteRange ), Tone.context.currentTime );

		window.navigator.vibrate( 100 );
	}

	function onTouchEnd() {
		console.log( 'Synth.onTouchEnd()' );

		synth.triggerRelease();
	}

	onMount(() => {
		console.log( 'Synth.onMount()' );		
		
		let interval;

		synth = new Tone.Synth( {
			oscillator: {
				type: 'triangle'
			},
			envelope: {
				attack: 0.000001,
				decay: 0.1,
				sustain: 0.3,
				release: 1
			}
		} ).toMaster();

		console.log( synth );

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
		position: absolute;
		right: 0;
		top: 0;
		z-index: 1000;

		padding: 0.1em 1em;
		margin: 1rem;

		font-size: 18px;
		color: currentColor;

		background-color: transparent;
		border: 1px solid currentColor;
		border-radius: 2px;
	}
</style>


<svelte:window 
	on:touchstart={onTouchStart}
	on:touchend={onTouchEnd}
/>


<button
	on:click={onClick}
	class="start"
	>
	Start
</button>






