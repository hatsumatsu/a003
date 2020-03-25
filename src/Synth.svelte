<script>
	import { onMount } from 'svelte';

	export let x;
	export let y;


	const settings = {
		baseNote: 261.6256,
		noteRange: 100
	}


	let synth;


	$: {
		if( synth ) {
			synth.setNote( settings.baseNote + ( y * settings.noteRange ) );
		}
	}


	function onClick() {
		console.log( 'Synth.onClick()' );

		Tone.start();	
	}

	onMount(() => {
		console.log( 'Synth.onMount()', Tone.Synth );

		synth = new Tone.Synth().toMaster();

		console.log( synth );

		synth.triggerAttack( 261 );


	    // onUnmount
		return () => {
			synth.triggerRelease();
		};	    		
	} );

</script>

<svelte:body 
	on:touchstart={onClick}
	on:click={onClick} />
