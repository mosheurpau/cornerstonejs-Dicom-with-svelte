<script>
  import { onMount } from "svelte";
  import CornerstoneViewer from "../component/CornerstoneViewer.svelte";
  import initVolumeLoader from "../component/initVolumeLoader";

  onMount(() => {
    initVolumeLoader();
  });
</script>

<div class="mx-auto text-center">
  <h1 class="text-4xl font-bold">DICOM Viewer</h1>
  <div class="flex justify-center items-center">
    <CornerstoneViewer />
  </div>
</div>
