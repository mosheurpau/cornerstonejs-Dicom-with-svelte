<script>
  import { onMount } from "svelte";
  import { RenderingEngine, Enums } from "@cornerstonejs/core";
  import { createImageIdsAndCacheMetaData } from "../lib/helper";
  import { initDemo } from "./initDemo";
  import scalingMetaDataManager from "./ptScalingMetaDataProvider";

  const { ViewportType } = Enums;

  onMount(async () => {
    const setupViewer = async () => {
      try {
        // Initialize Cornerstone
        await initDemo();

        // Fetch image IDs
        const imageIds = await createImageIdsAndCacheMetaData({
          StudyInstanceUID:
            "1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463",
          SeriesInstanceUID:
            "1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561",
          wadoRsRoot: "https://d3t6nz73ql33tx.cloudfront.net/dicomweb",
        });

        if (imageIds.length === 0) {
          console.error("No image IDs found");
          return;
        }

        // Add scaling metadata if required
        imageIds.forEach((imageId) => {
          const scalingMetaData = { scaleFactor: 1.0, offset: 0.0 };
          scalingMetaDataManager.addInstance(imageId, scalingMetaData);
        });

        // Set up the viewport container
        const content = document.getElementById("content");
        if (!content) {
          console.error("Content element not found");
          return;
        }

        // Create and style the viewport element
        const element = document.createElement("div");
        element.style.width = "300px"; // Full width
        element.style.height = "300px"; // Full height
        element.style.display = "flex";
        element.style.justifyContent = "center";
        element.style.alignItems = "center";
        content.appendChild(element);

        // Initialize Rendering Engine
        const renderingEngineId = "myRenderingEngine";
        const viewportId = "CT_AXIAL_STACK";
        const renderingEngine = new RenderingEngine(renderingEngineId);

        // Configure and enable the viewport
        const viewportInput = {
          viewportId,
          element,
          type: ViewportType.STACK,
        };
        renderingEngine.enableElement(viewportInput);

        const viewport = renderingEngine.getViewport(viewportInput.viewportId);
        // Set the stack with image IDs
        viewport.setStack(imageIds, 60);

        // Render the viewport
        viewport.render();
      } catch (error) {
        console.error("Error setting up Cornerstone:", error);
      }
    };

    setupViewer();
  });
</script>

<div id="content" style="width: 100%; height: 100%;"></div>
