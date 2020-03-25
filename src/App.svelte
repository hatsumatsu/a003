<script>
	import Utils from './utils.js';
	import { onMount } from 'svelte';
	import Dot from './Dot.svelte';

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



<p>
	{x} / {y}
</p>


<Dot 
	bind:x={x}
	bind:y={y}
/>


<style>
	:global( html ),
	:global( body ) {
		margin: 0;
		overflow: hidden;

		color: #fff;

		background-color: #000;
	}
</style>