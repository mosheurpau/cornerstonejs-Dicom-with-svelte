import { api } from "dicomweb-client";
import dcmjs from "dcmjs";
import { utilities } from "@cornerstonejs/core";
import cornerstoneDICOMImageLoader from "@cornerstonejs/dicom-image-loader";

const { DicomMetaDictionary } = dcmjs.data;
const { calibratedPixelSpacingMetadataProvider } = utilities;

async function createImageIdsAndCacheMetaData({
  StudyInstanceUID,
  SeriesInstanceUID,
  SOPInstanceUID = null,
  wadoRsRoot,
  client = null,
}) {
  const SOP_INSTANCE_UID = "00080018";
  const SERIES_INSTANCE_UID = "0020000E";

  const studySearchOptions = {
    studyInstanceUID: StudyInstanceUID,
    seriesInstanceUID: SeriesInstanceUID,
  };

  client = client || new api.DICOMwebClient({ url: wadoRsRoot });
  let instances = await client.retrieveSeriesMetadata(studySearchOptions);

  // If SOPInstanceUID is provided, filter the instances to only include the one we want
  if (SOPInstanceUID) {
    instances = instances.filter((instance) => {
      return instance[SOP_INSTANCE_UID].Value[0] === SOPInstanceUID;
    });
  }

  let imageIds = instances.map((instanceMetaData) => {
    const SeriesInstanceUID = instanceMetaData[SERIES_INSTANCE_UID].Value[0];
    const SOPInstanceUIDToUse =
      SOPInstanceUID || instanceMetaData[SOP_INSTANCE_UID].Value[0];

    const prefix = "wadors:";

    const imageId =
      prefix +
      wadoRsRoot +
      "/studies/" +
      StudyInstanceUID.trim() +
      "/series/" +
      SeriesInstanceUID.trim() +
      "/instances/" +
      SOPInstanceUIDToUse.trim() +
      "/frames/1";

    cornerstoneDICOMImageLoader.wadors.metaDataManager.add(
      imageId,
      instanceMetaData
    );
    return imageId;
  });

  // Add calibrated pixel spacing metadata
  imageIds.forEach((imageId) => {
    let instanceMetaData =
      cornerstoneDICOMImageLoader.wadors.metaDataManager.get(imageId);

    if (instanceMetaData) {
      // Add calibrated pixel spacing
      const metadata = DicomMetaDictionary.naturalizeDataset(instanceMetaData);
      calibratedPixelSpacingMetadataProvider.add(imageId, metadata);
    }
  });

  console.log("Image IDs:", imageIds); // Debug log

  return imageIds;
}

export { createImageIdsAndCacheMetaData };
