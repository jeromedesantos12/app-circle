import { ThreadID } from "../components/organisms";
import { useParams } from "react-router-dom";

export function HomeID() {
  const { id } = useParams();
  return <ThreadID id={id as string} />;
}
