import { useNavigate } from "react-router-dom";

export function Backdoor() {
  const navigate = useNavigate();
  return (
    <>
      <div className="bg-gray-500">
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
      </div>
    </>
  );
}
