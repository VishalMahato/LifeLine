import * as ImagePicker from "expo-image-picker";

export const filePicker = async (): Promise<ImagePicker.ImagePickerResult> => {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (permissionResult.status !== "granted") {
    throw new Error("Media library permission is required");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  return result;
};
