import { AppLoader } from "@/presentation/components/loader";

export default function Loading() {
  return <AppLoader fullScreen={false} size="sm" showName={false} message="Loading..." />;
}
