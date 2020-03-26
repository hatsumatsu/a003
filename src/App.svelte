<script>
	import Utils from './utils.js';
	import { onMount } from 'svelte';
	import Dot from './Dot.svelte';
	import Synth from './Synth.svelte';

	let settings = {
		damping: 4,
		maxAngle: 60
	}

	let mode = 'mouse';

	//
	// -1 ... 1
	// 
	let xInput = 0;  
	let yInput = 0;

	let xDelta = 0;
	let yDelta = 0;
	
	let x = 0;
	let y = 0;



	function onMousemove( event ) {
		if( mode !== 'mouse' ) {
			return;
		}

		xInput = ( event.clientX / window.innerWidth - 0.5 ) * 2;
		yInput = ( event.clientY / window.innerHeight - 0.5 ) * 2;
	}



	function onDeviceOrientation( event ) {
		mode = 'orientation';

        let orientation = typeof window.orientation !== 'undefined' ? window.orientation : 0;

        if( orientation === 0 ) {
            xInput = Utils.clamp( event.gamma, -1 * settings.maxAngle, settings.maxAngle ) / settings.maxAngle;
            yInput = Utils.clamp( event.beta, -1 * settings.maxAngle, settings.maxAngle ) / settings.maxAngle;
        } else if ( orientation === 180 ) {
            xInput = Utils.clamp( event.gamma, -1 * settings.maxAngle, settings.maxAngle ) / settings.maxAngle;
            yInput = Utils.clamp( -event.beta, -1 * settings.maxAngle, settings.maxAngle ) / settings.maxAngle;
        } else if ( orientation === 90 ) {
            xInput = Utils.clamp( event.beta, -1 * settings.maxAngle, settings.maxAngle ) / settings.maxAngle;
            yInput = Utils.clamp( -event.gamma, -1 * settings.maxAngle, settings.maxAngle ) / settings.maxAngle;
        } else if ( orientation === -90 ) {
            xInput = Utils.clamp( -event.beta, -1 * settings.maxAngle, settings.maxAngle ) / settings.maxAngle;
            yInput = Utils.clamp( event.gamma, -1 * settings.maxAngle, settings.maxAngle ) / settings.maxAngle;
        }
    }

	onMount(() => {
		let frame;	

		( function onLoop() {
		 	frame = requestAnimationFrame( onLoop );	


		    xDelta = xInput - x;
		    yDelta = yInput - y;

	    	x = x + ( xDelta / settings.damping );
	    	y = y + ( yDelta / settings.damping );
	    } )();

	    // onUnmount
		return () => {
			cancelAnimationFrame( frame );
		};	    
	} );

	
</script>



<svelte:window 
	on:mousemove={onMousemove}
	on:deviceorientation={onDeviceOrientation} />

<svelte:head>
	<title>A003</title>
</svelte:head>



<p class="log">
	{( Math.round( x * 1000 ) / 1000 )} — {( Math.round( y * 1000 ) / 1000 )}
</p>


<Dot 
	bind:x={x}
	bind:y={y}
/>

<Synth 
	bind:x={x}
	bind:y={y}
/>


<style>
	:global( html ),
	:global( body ) {
		height: 100%;
		margin: 0;
		overflow: hidden;

		background-color: #000;

		user-select: none;
	}

	:global( html ) {
		font-family: monospace;
		font-size: 10px;
		color: #d0ff00;
	}	

	:global( body ) {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: -1px;
	}		

	.log {
		position: absolute;
		left: 0;
		top: 0;

		margin: 1rem;
	}
</style>