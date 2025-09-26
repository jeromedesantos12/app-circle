import { useParams } from "react-router-dom";
import { FormReset } from "../components/organisms";

export function Reset() {
  const { id } = useParams();
  return <FormReset id={id || ""} />;
}
