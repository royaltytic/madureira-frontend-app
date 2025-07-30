// AuthContainer.tsx
import { useState } from "react";
import { TelaLogin } from "./TelaLogin";
import { TelaRecuperarSenha } from "./TelaRecuperarSenha";

export const AuthContainer = () => {
  // "login" | "cadastro" | "recuperar"
  const [mode, setMode] = useState("login");

  return (
    <>
      {mode === "login" && <TelaLogin onChangeMode={setMode} />}
      {mode === "recuperar" && <TelaRecuperarSenha onChangeMode={setMode} />}
    </>
  );
};
