<script lang="ts">
  import { onMount } from "svelte";
  import { SpringSimulation } from '$lib/utils/spring-physics';
  import { afterNavigate } from '$app/navigation';

  let loaded = false;

  let hidden = true;
  let interactive = false;

  let follower: HTMLDivElement;

  let physicsRunning = false;
  let physicsStopTimeout: any;
  let hideTimeout: any;

  let mouseX = 0;
  let mouseY = 0;

  const simulation = new SpringSimulation(0.5, -0.3, 3);

  $: followers = [
    {
      follower: follower,
      simulation: simulation
    }
  ];

  const fadeTime = 300;
  const idleTime = 1800;

  const checkFollowers = () => !!follower;

  const physicsLoop = () => {
    if (!checkFollowers()) return;
    if (!physicsRunning) return;

    for (const { follower, simulation } of followers) {
      const { x, y } = simulation.tick(mouseX, mouseY);

      follower.animate({
        left: `${x}px`,
        top: `${y}px`
      }, {duration: 0, fill: "forwards"});
    }

    requestAnimationFrame(physicsLoop);
  }

  const hideFollowers = () => {
    if (!checkFollowers()) return;

    for (const { follower } of followers) {
      follower.animate({
        opacity: 0
      }, {duration: fadeTime, fill: "forwards"});
    }

    hidden = true;

    physicsStopTimeout = setTimeout(() => {
      physicsRunning = false;
    }, fadeTime);
  }

  const onMouseMove = (e: MouseEvent) => {
    if (!checkFollowers()) return;

    if (!matchMedia('(pointer:fine)').matches) {
      if (!hidden) hideFollowers();
      return;
    }

    const { clientX, clientY } = e;

    if (hidden) {
      for (const { follower } of followers) {
        follower.animate({
          left: `${clientX}px`,
          top: `${clientY}px`,
          opacity: 1
        }, {duration: 0, fill: "forwards"});
        follower.hidden = false;
      }
      hidden = false;
    }

    mouseX = clientX;
    mouseY = clientY;

    if (physicsStopTimeout) {
      clearTimeout(physicsStopTimeout);
    }

    if (!physicsRunning) {
      for (const { simulation } of followers) {
        simulation.reset(mouseX, mouseY);
      }
      physicsRunning = true;
      physicsLoop();
    }

    if (hideTimeout) clearTimeout(hideTimeout);
    if (!interactive) hideTimeout = setTimeout(hideFollowers, idleTime);
  }

  const isInteractable = (e: EventTarget) => {
    if (e instanceof Element) {
      return (e.tagName === 'BUTTON' || e.tagName === 'INPUT' || e.tagName === 'TEXTAREA' || e.closest('a'));
    }
  }

  const grow = () => {
    if (!checkFollowers()) return;

    follower.animate({
      "--scale": '3.5'
    }, {duration: 100, fill: "forwards"})
  }

  const shrink = () => {
    if (!checkFollowers()) return;

    follower.animate({
      "--scale": '1'
    }, {duration: 100, fill: "forwards"})
  }

  const onMouseOver = (e: MouseEvent) => {
    if (!isInteractable(e.target)) return;

    interactive = true;
    grow();
  }

  const onMouseOut = (e: MouseEvent) => {
    if (!isInteractable(e.target)) return;

    interactive = false;
    shrink();
  }

  afterNavigate(shrink);

  onMount(() => {
    window.addEventListener('mousemove', onMouseMove);
    document.body.addEventListener('mouseleave', hideFollowers);
    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mouseout', onMouseOut);
    loaded = true;
  });
</script>

{#if loaded}
  <div class="mouse-follower small" bind:this={follower} hidden></div>
{/if}

<style>
  @property --scale {
    syntax: '<number>';
    initial-value: 1;
    inherits: false;
  }

  .mouse-follower {
    position: fixed;
    width: 0.8rem;
    height: 0.8rem;
    --scale: 1;
    transform: translate(-50%, -50%) scale(var(--scale));
    z-index: 5;
    pointer-events: none;
    user-select: none;
    opacity: 0;
    border-radius: 100%;
    backdrop-filter: contrast(1.2) brightness(1.3) saturate(0.8) invert(1);
    background: light-dark(#fff6, #eee2);
  }
</style>
