import { notFound } from "next/navigation";
import { SCREENS } from "@/components/design/registry";

export function generateStaticParams() {
  return SCREENS.map(([screen]) => ({ screen }));
}

export default async function DesignScreen({ params }: { params: Promise<{ screen: string }> }) {
  const { screen } = await params;
  const entry = SCREENS.find(([slug]) => slug === screen);
  if (!entry) notFound();
  const View = entry[3];
  return <View />;
}
