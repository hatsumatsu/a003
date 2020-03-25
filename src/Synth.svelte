<script>
	import { onMount } from 'svelte';

	export let x;
	export let y;


	let synth;


	$: {
		if( synth ) {
			synth.setNote( 261 + ( y * 60 ) );
		}
	}

	const settings = {}

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

<svelte:body on:click={onClick} />
