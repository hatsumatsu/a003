<script>
	import Utils from './utils.js';

	export let x;
	export let y;

	let size = 48;

	$: xAbsolute = Utils.clamp( ( ( x + 1 ) / 2 * window.innerWidth ), ( size / 2 ), ( window.innerWidth - size / 2 ) );
	$: yAbsolute = Utils.clamp( ( ( y + 1 ) / 2 * window.innerHeight ), ( size / 2 ), ( window.innerHeight - size / 2 ) );
</script>


<span 
	class="dot"
	style="
		width: {size}px;
		height: {size}px;
		transform:translate( {(xAbsolute - size / 2)}px, {(yAbsolute - size / 2)}px );"
		>

</span>


<style>
	.dot {
		position: fixed;
		left: 0;
		top: 0;

		box-sizing: border-box;
		display: block;

		border: 2px solid #d0ff00;
		border-radius: 50%;
	}
</style>