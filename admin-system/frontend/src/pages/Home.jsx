import { Backdoor } from "../components/Backdoor.jsx";

export function Home() {
  return (
    <>
      <h1>Welcome to the admin dashboard</h1>
      <div className="flex flex-col">

      </div>
      {import.meta.env.DEV && <Backdoor />}
    </>
  );
}
