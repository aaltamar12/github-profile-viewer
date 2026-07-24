import { ProfileSkeleton } from "@/components/profile-skeleton";
import { DEFAULT_USERNAME } from "@/lib/constants";

export default function Loading() {
  return <ProfileSkeleton username={DEFAULT_USERNAME} />;
}
