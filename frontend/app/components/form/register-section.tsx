import { RegisterForm } from "./register-form";

export function RegisterSection() {
  return (
    <section className="min-h-screen relative overflow-hidden bg-black ">
      <div className="min-h-screen p-8 rounded-lg shadow-md flex flex-col items-center justify-center">
        <RegisterForm></RegisterForm>
      </div>
    </section>
  );
}
