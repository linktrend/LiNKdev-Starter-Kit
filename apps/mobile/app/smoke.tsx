import { View } from "react-native";
import * as native from "@starter/ui/native";

export default function Smoke() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <native.Text className="text-lg font-semibold text-red-500">Smoke Test</native.Text>
      <native.Button className="px-4 py-2 bg-blue-500 rounded-lg mt-4">
        <native.Text className="text-white">Press Me</native.Text>
      </native.Button>
    </View>
  );
}
