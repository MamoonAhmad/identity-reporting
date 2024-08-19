import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Navigates the browser to a page specified in `to` param.
 */
export const Redirect: React.FC<{
  to: string;
}> = ({ to }) => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to);
  }, [to]);
  return null;
};
