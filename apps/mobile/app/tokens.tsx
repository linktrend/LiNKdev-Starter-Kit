import { View } from "react-native";
import * as native from "@starter/ui/native";

export default function Tokens() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <native.Text className="text-foreground font-bold text-xl">Tokens Demo</native.Text>
      <native.Button className="mt-4 px-4 py-2 bg-primary rounded-lg">
        <native.Text className="text-primary-foreground">Primary Button</native.Text>
      </native.Button>
    </View>
  );
}
