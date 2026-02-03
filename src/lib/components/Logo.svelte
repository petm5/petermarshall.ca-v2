<script>
  import logo from '$lib/assets/logo-glow.png?enhanced&format=avif&w=256;128;64&quality=100';
  import { title } from '$lib/site.json';
</script>

<a href="/">
  <div class="logo">
    <div class="image">
      <enhanced:img alt src={logo} sizes="72px" />
    </div>
    <p>{title}</p>
  </div>
</a>

<style>
  a {
    text-decoration: none;
    color: inherit;
  }
  .logo {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-size: 1.1rem;
    font-weight: bold;
    font-family: "Inter";
    cursor: pointer;
  }
  img {
    display: block;
    margin: 0;
    width: 36px;
    height: 36px;
    transform: scale(260%);
    font-size: 0;
    user-select: none;
    pointer-events: none;
  }
  .image {
    transition: transform .1s ease;
  }
  .logo:hover {
    text-decoration: underline;
    .image {
      transform: rotate(30deg);
    }
  }
</style>
