import { useNavigate } from "react-router-dom";

export function Backdoor() {
  const navigate = useNavigate();
  return (
    <>
      <button
        onClick={() => {
          navigate("/");
        }}>
        Login
      </button>
      <button
        onClick={() => {
          navigate("/home");
        }}>
        Home
      </button>
    </>
  );
}
