import { ProfileRoute } from "@/components/profile-route";
import { DEFAULT_USERNAME } from "@/lib/constants";

export default function Home() {
  return <ProfileRoute username={DEFAULT_USERNAME} />;
}
